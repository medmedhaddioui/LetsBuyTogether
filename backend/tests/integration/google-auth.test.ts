import { randomBytes } from "node:crypto";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

const google = vi.hoisted(() => ({ identity: vi.fn() }));
vi.mock("google-auth-library", () => ({
  CodeChallengeMethod: { S256: "S256" },
  OAuth2Client: class {
    generateAuthUrl(options: Record<string, string>) {
      return `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams(options)}`;
    }
    async getToken() {
      return { tokens: { id_token: "google-signed-token" } };
    }
    async verifyIdToken() {
      return { getPayload: () => google.identity() };
    }
  },
}));
const databaseUrl = process.env.TEST_DATABASE_URL;
if (databaseUrl && !new URL(databaseUrl).pathname.endsWith("_test"))
  throw new Error("Use a _test database.");
if (databaseUrl) process.env.DATABASE_URL = databaseUrl;
process.env.JWT_SECRET ??= "test-secret-at-least-sixteen";
process.env.GOOGLE_CLIENT_ID = "test-client";
process.env.GOOGLE_CLIENT_SECRET = "test-secret";
process.env.GOOGLE_REDIRECT_URI = "http://localhost:5173/api/auth/google/callback";
process.env.APP_URL = "http://localhost:5173";
const { app } = await import("../../src/app.js");
const { query, closeDatabase } = await import("../../src/database/connection.js");
const suffix = randomBytes(6).toString("hex");
const email = `google_${suffix}@gmail.com`;
const subject = `google-subject-${suffix}`;
const agent = request.agent(app);
let userId: string;

async function flow(returnTo?: string, overrides: Record<string, unknown> = {}) {
  const start = await agent.get("/api/auth/google").query({ returnTo: returnTo ?? "/activity" });
  expect(start.status).toBe(302);
  const location = new URL(start.headers.location);
  const state = location.searchParams.get("state")!;
  const nonce = location.searchParams.get("nonce")!;
  google.identity.mockReturnValue({
    sub: subject,
    email,
    email_verified: true,
    nonce,
    ...overrides,
  });
  return { state, nonce, start, location };
}

describe.skipIf(!databaseUrl)("Google signup and profile lifecycle (Google SDK mocked)", () => {
  beforeAll(async () => {
    expect((await agent.get("/api/auth/google/status")).body.data.enabled).toBe(true);
  });
  afterAll(async () => {
    await query("DELETE FROM users WHERE email = ANY($1::text[])", [[email, `legacy_${email}`]]);
    await query("DELETE FROM google_login_flows WHERE state_hash = ANY($1::text[])", [states]);
    await closeDatabase();
  });
  const states: string[] = [];
  it("rejects callbacks without state cookie", async () => {
    const result = await request(app).get("/api/auth/google/callback?state=forged&code=forged");
    expect(result.headers.location).toBe("http://localhost:5173/login?error=google-failed");
    expect(String(result.headers["set-cookie"])).not.toContain("lbt_session=");
  });
  it("starts a Google flow with PKCE and HTTP-only Lax cookie", async () => {
    const { start, location } = await flow();
    const { createHash } = await import("node:crypto");
    states.push(createHash("sha256").update(location.searchParams.get("state")!).digest("hex"));
    expect(location.searchParams.get("code_challenge_method")).toBe("S256");
    expect(location.searchParams.get("code_challenge")).toBeTruthy();
    expect(String(start.headers["set-cookie"])).toContain("HttpOnly");
    expect(String(start.headers["set-cookie"])).toContain("SameSite=Lax");
  });
  it.each([{ email_verified: false }, { nonce: "wrong-nonce" }])(
    "rejects unverified identity or nonce mismatch",
    async (invalid) => {
      const { state } = await flow(undefined, invalid);
      const result = await agent.get("/api/auth/google/callback").query({ state, code: "code" });
      expect(result.headers.location).toContain("error=google-failed");
      expect((await agent.get("/api/auth/me")).status).toBe(401);
    },
  );
  it("creates a Google account without a password and requests its profile", async () => {
    const { state } = await flow();
    const callback = await agent.get("/api/auth/google/callback").query({ state, code: "code" });
    expect(callback.headers.location).toBe("http://localhost:5173/complete-profile");
    const current = await agent.get("/api/auth/me");
    expect(current.status).toBe(200);
    expect(current.body.data.user).toMatchObject({ email, role: "USER", profileComplete: false });
    userId = current.body.data.user.id;
    expect((await agent.post("/api/product-searches").send({})).status).toBe(403);
    expect((await agent.post("/api/product-posts").send({})).status).toBe(403);
    const row = (
      await query("SELECT google_subject, password_hash FROM users WHERE id = $1", [userId])
    ).rows[0];
    expect(row).toEqual({ google_subject: subject, password_hash: null });
  });
  it("validates profile details, prevents email and role changes", async () => {
    expect((await agent.patch("/api/auth/profile").send({ username: "x" })).status).toBe(400);
    const response = await agent.patch("/api/auth/profile").send({
      username: `g_${suffix}`,
      address: "12 Test Street",
      city: "Rabat",
      email: "hacker@example.com",
      role: "ADMIN",
    });
    expect(response.status).toBe(200);
    expect(response.body.data.user).toMatchObject({
      username: `g_${suffix}`,
      address: "12 Test Street",
      city: "Rabat",
      email,
      role: "USER",
      profileComplete: true,
    });
  });
  it("signs in to the same account again and blocks open redirects", async () => {
    for (const returnTo of ["https://evil.example", "//evil.example", "/\\evil.example"]) {
      const { state } = await flow(returnTo);
      const response = await agent.get("/api/auth/google/callback").query({ state, code: "code" });
      expect(response.headers.location).toBe("http://localhost:5173/activity");
      expect((await agent.get("/api/auth/me")).body.data.user.id).toBe(userId);
    }
  });
  it("consumes a flow once, even if its old cookie is replayed", async () => {
    const { start, state } = await flow("/posts/new");
    const cookie = start.headers["set-cookie"][0].split(";")[0];
    const first = await request(app)
      .get("/api/auth/google/callback")
      .set("Cookie", cookie)
      .query({ state, code: "code" });
    expect(first.headers.location).toBe("http://localhost:5173/posts/new");
    const replay = await request(app)
      .get("/api/auth/google/callback")
      .set("Cookie", cookie)
      .query({ state, code: "code" });
    expect(replay.headers.location).toContain("error=google-failed");
  });
  it("rejects mismatched or expired state", async () => {
    const { start, state } = await flow();
    const cookie = start.headers["set-cookie"][0].split(";")[0];
    const bad = await request(app)
      .get("/api/auth/google/callback")
      .set("Cookie", cookie)
      .query({ state: "bad", code: "code" });
    expect(bad.headers.location).toContain("error=google-failed");
    const { createHash } = await import("node:crypto");
    const stateHash = createHash("sha256").update(state).digest("hex");
    states.push(stateHash);
    await query(
      "UPDATE google_login_flows SET expires_at = CURRENT_TIMESTAMP - INTERVAL '1 hour' WHERE state_hash = $1",
      [stateHash],
    );
    const expired = await request(app)
      .get("/api/auth/google/callback")
      .set("Cookie", cookie)
      .query({ state, code: "code" });
    expect(expired.headers.location).toContain("error=google-failed");
  });
  it("never links a Google identity to an existing password account by email", async () => {
    const { AuthService } = await import("../../src/modules/auth/auth.service.js");
    await AuthService.register({
      username: `legacy_${suffix}`,
      email: `legacy_${email}`,
      address: "12 Test Street",
      city: "Rabat",
      password: "Example123!",
    });
    const { state } = await flow(undefined, { sub: `${subject}-other`, email: `legacy_${email}` });
    const response = await agent.get("/api/auth/google/callback").query({ state, code: "code" });
    expect(response.headers.location).toContain("error=existing-account");
    const row = (
      await query("SELECT google_subject FROM users WHERE email = $1", [`legacy_${email}`])
    ).rows[0];
    expect(row.google_subject).toBeNull();
  });
  it("Google accounts cannot log in with an invented password", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({ email, password: "anything" });
    expect(response.status).toBe(401);
  });
});
