import request from "supertest";
import { describe, expect, it } from "vitest";
process.env.JWT_SECRET ??= "test-secret-at-least-sixteen";
const { app } = await import("../../src/app.js");
describe("API security and shape", () => {
  it("provides health endpoint", async () => {
    const r = await request(app).get("/api/health");
    expect(r.status).toBe(200);
    expect(r.body).toEqual({ success: true, data: { status: "ok" } });
  });
  it("protects authenticated endpoint", async () => {
    const r = await request(app).get("/api/auth/me");
    expect(r.status).toBe(401);
    expect(r.body.error.code).toBe("UNAUTHORIZED");
  });
  it("requires Google for new accounts", async () => {
    const r = await request(app).post("/api/auth/register").send({ email: "bad" });
    expect(r.status).toBe(410);
    expect(r.body.error.code).toBe("GOOGLE_SIGNUP_REQUIRED");
  });
  it("requires authentication before completing a profile", async () => {
    const response = await request(app)
      .patch("/api/auth/profile")
      .send({ username: "example", address: "12 Test Street", city: "Rabat" });
    expect(response.status).toBe(401);
  });
  it("normal user token cannot access admin routes", async () => {
    const jwt = (await import("jsonwebtoken")).default;
    const token = jwt.sign({ id: "user", role: "USER" }, process.env.JWT_SECRET!);
    const r = await request(app).get("/api/admin/stats").set("Authorization", `Bearer ${token}`);
    expect(r.status).toBe(403);
    expect(r.body.error.code).toBe("FORBIDDEN");
  });
});
