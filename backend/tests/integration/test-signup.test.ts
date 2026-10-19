import { randomBytes } from "node:crypto";
import request from "supertest";
import { afterAll, afterEach, beforeEach, describe, expect, it } from "vitest";

const databaseUrl = process.env.TEST_DATABASE_URL;
if (databaseUrl && !new URL(databaseUrl).pathname.endsWith("_test"))
  throw new Error("Use a _test database.");
if (databaseUrl) process.env.DATABASE_URL = databaseUrl;
process.env.JWT_SECRET ??= "test-secret-at-least-sixteen";
const { app } = await import("../../src/app.js");
const { env } = await import("../../src/config/env.js");
const { AuthRepository } = await import("../../src/modules/auth/auth.repository.js");
const { AuthService } = await import("../../src/modules/auth/auth.service.js");
const { query, closeDatabase } = await import("../../src/database/connection.js");
const originalEnvironment = env.NODE_ENV;
const suffix = randomBytes(6).toString("hex");
const email = `bot_${suffix}@gmail.com`;
const legacyEmail = `legacy_${suffix}@gmail.com`;
const googleEmail = `google_${suffix}@gmail.com`;
const raceEmail = `race_${suffix}@gmail.com`;
let userId: string;
const agent = request.agent(app);

describe.skipIf(!databaseUrl)("Temporary development signup", () => {
  beforeEach(() => {
    env.NODE_ENV = "development";
  });
  afterEach(() => {
    env.NODE_ENV = originalEnvironment;
  });
  afterAll(async () => {
    await query("DELETE FROM users WHERE email = ANY($1::text[])", [
      [email, legacyEmail, googleEmail, raceEmail],
    ]);
    await closeDatabase();
  });
  it("creates a marked test account and session without Google credentials", async () => {
    expect((await agent.get("/api/auth/test-signup/status")).body.data.enabled).toBe(true);
    const response = await agent
      .post("/api/auth/test-signup")
      .send({ email: ` ${email.toUpperCase()} `, role: "ADMIN", profileComplete: true });
    expect(response.status).toBe(200);
    expect(response.body.data.user).toMatchObject({
      email,
      role: "USER",
      isTestAccount: true,
      profileComplete: false,
    });
    expect(String(response.headers["set-cookie"])).toContain("HttpOnly");
    expect(response.body.data).not.toHaveProperty("token");
    userId = response.body.data.user.id;
    const saved = (
      await query(
        "SELECT google_subject, password_hash, is_test_account FROM users WHERE id = $1",
        [userId],
      )
    ).rows[0];
    expect(saved).toEqual({ google_subject: null, password_hash: null, is_test_account: true });
    expect((await agent.get("/api/auth/me")).status).toBe(200);
  });
  it("follows profile completion and allows access to normal app features", async () => {
    expect((await agent.get("/api/product-searches/mine")).status).toBe(403);
    const profile = await agent
      .patch("/api/auth/profile")
      .send({ username: `bot_${suffix}`, address: "12 Test Street", city: "Casablanca" });
    expect(profile.status).toBe(200);
    expect(profile.body.data.user.profileComplete).toBe(true);
    expect((await agent.get("/api/product-searches/mine")).status).toBe(200);
    expect((await agent.get("/api/product-posts/mine")).status).toBe(200);
  });
  it("reuses the same test account and keeps its profile", async () => {
    await agent.post("/api/auth/logout");
    const again = await agent.post("/api/auth/test-signup").send({ email });
    expect(again.status).toBe(200);
    expect(again.body.data.user).toMatchObject({
      id: userId,
      profileComplete: true,
      city: "Casablanca",
    });
  });
  it("rejects invalid email input", async () => {
    for (const value of [undefined, "not-an-email", "a".repeat(260) + "@gmail.com"]) {
      expect((await agent.post("/api/auth/test-signup").send({ email: value })).status).toBe(400);
    }
  });
  it("cannot impersonate a real password account", async () => {
    await AuthService.register({
      email: legacyEmail,
      username: `legacy_${suffix}`,
      address: "12 Test Street",
      city: "Rabat",
      password: "Example123!",
    });
    const response = await request(app).post("/api/auth/test-signup").send({ email: legacyEmail });
    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("REAL_ACCOUNT_EXISTS");
    expect(response.headers["set-cookie"]).toBeUndefined();
  });
  it("cannot impersonate a real Google account", async () => {
    const user = await AuthRepository.findOrCreateGoogle(`real-${suffix}`, googleEmail);
    const response = await request(app).post("/api/auth/test-signup").send({ email: googleEmail });
    expect(response.status).toBe(409);
    expect(response.headers["set-cookie"]).toBeUndefined();
    expect((await AuthRepository.findById(user.id))?.isTestAccount).toBe(false);
  });
  it("handles concurrent requests with one test account", async () => {
    const responses = await Promise.all([
      request(app).post("/api/auth/test-signup").send({ email: raceEmail }),
      request(app).post("/api/auth/test-signup").send({ email: raceEmail }),
    ]);
    expect(responses.map((response) => response.status)).toEqual([200, 200]);
    expect(responses[0].body.data.user.id).toBe(responses[1].body.data.user.id);
  });
  it.each(["production", "test"] as const)(
    "disables signup and test sessions in %s",
    async (environment) => {
      const login = await request(app).post("/api/auth/test-signup").send({ email });
      const cookie = login.headers["set-cookie"][0].split(";")[0];
      env.NODE_ENV = environment;
      expect((await request(app).get("/api/auth/test-signup/status")).body.data.enabled).toBe(
        false,
      );
      const blocked = await request(app).post("/api/auth/test-signup").send({ email });
      expect(blocked.status).toBe(404);
      expect(blocked.headers["set-cookie"]).toBeUndefined();
      for (const path of [
        "/api/auth/me",
        "/api/product-searches/mine",
        "/api/product-posts/mine",
      ]) {
        expect((await request(app).get(path).set("Cookie", cookie)).status).toBe(401);
      }
    },
  );
});
