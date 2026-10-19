import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const databaseUrl = process.env.TEST_DATABASE_URL;
if (databaseUrl && !new URL(databaseUrl).pathname.endsWith("_test")) {
  throw new Error("TEST_DATABASE_URL must target a database whose name ends in _test.");
}
if (databaseUrl) process.env.DATABASE_URL = databaseUrl;
process.env.JWT_SECRET ??= "test-secret-at-least-sixteen";
const { app } = await import("../../src/app.js");
const { AuthService } = await import("../../src/modules/auth/auth.service.js");
const { query, closeDatabase } = await import("../../src/database/connection.js");
const suffix = randomBytes(6).toString("hex");
const input = {
  username: `test_${suffix}`,
  email: `test_${suffix}@example.com`,
  address: "12 Test Street",
  password: "Example123!",
  city: "Casablanca",
};

describe.skipIf(!databaseUrl)("Existing password accounts remain usable", () => {
  beforeAll(async () => {
    await AuthService.register(input);
  });
  afterAll(async () => {
    await query("DELETE FROM users WHERE email = $1", [input.email]);
    await closeDatabase();
  });
  it("preserves existing hashed credentials", async () => {
    const result = await query("SELECT password_hash FROM users WHERE email = $1", [input.email]);
    expect(await bcrypt.compare(input.password, result.rows[0].password_hash)).toBe(true);
  });
  it("logs in, restores an HTTP-only session and logs out", async () => {
    const agent = request.agent(app);
    const login = await agent
      .post("/api/auth/login")
      .send({ email: input.email.toUpperCase(), password: input.password });
    expect(login.status).toBe(200);
    expect(login.body.data.user).toMatchObject({ username: input.username, profileComplete: true });
    expect(login.body.data).not.toHaveProperty("token");
    expect(login.body.data.user).not.toHaveProperty("passwordHash");
    expect(String(login.headers["set-cookie"])).toContain("HttpOnly");
    expect((await agent.get("/api/auth/me")).status).toBe(200);
    await agent.post("/api/auth/logout");
    expect((await agent.get("/api/auth/me")).status).toBe(401);
  });
  it("rejects wrong passwords", async () => {
    expect(
      (
        await request(app)
          .post("/api/auth/login")
          .send({ email: input.email, password: "incorrect" })
      ).status,
    ).toBe(401);
  });
  it("rejects new password registration", async () => {
    expect((await request(app).post("/api/auth/register").send(input)).status).toBe(410);
  });
});
