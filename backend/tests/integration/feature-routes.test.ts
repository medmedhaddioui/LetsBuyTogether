import jwt from "jsonwebtoken";
import request from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";

process.env.JWT_SECRET ??= "test-secret-at-least-sixteen";
const { app } = await import("../../src/app.js");
const { env } = await import("../../src/config/env.js");
const { AuthService } = await import("../../src/modules/auth/auth.service.js");
const { AppError } = await import("../../src/http/app-error.js");
afterEach(() => vi.restoreAllMocks());
const token = jwt.sign({ id: "member-1", role: "USER" }, env.JWT_SECRET);
const adminToken = jwt.sign({ id: "admin-1", role: "ADMIN" }, env.JWT_SECRET);

describe("feature routes without persistent storage", () => {
  it.each([
    ["get", "/api/notifications"],
    ["patch", "/api/notifications/read-all"],
    ["post", "/api/reports"],
    ["post", "/api/reviews"],
    ["post", "/api/product-posts"],
    ["post", "/api/product-searches"],
    ["get", "/api/product-posts/mine"],
    ["get", "/api/product-searches/mine"],
    ["patch", "/api/auth/preference"],
    ["get", "/api/groups/example/messages"],
    ["get", "/api/users/me/favorites"],
  ] as const)("keeps %s %s protected", async (method, path) => {
    const response = await request(app)[method](path);
    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("UNAUTHORIZED");
  });

  it.each([
    "/api/stores",
    "/api/promotions",
    "/api/groups",
    "/api/groups/example",
    "/api/notifications",
    "/api/users/example",
  ])("reports paused storage on %s", async (path) => {
    const response = await request(app).get(path).set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(503);
    expect(response.body.error.code).toBe("STORAGE_UNAVAILABLE");
  });

  it("reports an unavailable account database without claiming success", async () => {
    vi.spyOn(AuthService, "login").mockRejectedValue(
      new AppError(503, "DATABASE_UNAVAILABLE", "Account service is unavailable."),
    );
    const response = await request(app).post("/api/auth/login").send({
      address: "12 Test Street",
      username: "demo_user",
      email: "demo@example.com",
      password: "Example123!",
      city: "Casablanca",
    });
    expect(response.status).toBe(503);
    expect(response.body.error.code).toBe("DATABASE_UNAVAILABLE");
  });

  it("applies the same storage response to authorized admin endpoints", async () => {
    const response = await request(app)
      .get("/api/admin/stats")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(response.status).toBe(503);
    expect(response.body.error.code).toBe("STORAGE_UNAVAILABLE");
  });

  it.each(["/api/reports", "/api/reviews", "/api/groups"])(
    "keeps request validation on %s",
    async (path) => {
      const response = await request(app)
        .post(path)
        .set("Authorization", `Bearer ${token}`)
        .send({});
      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
    },
  );

  it("keeps logout available without storage", async () => {
    const response = await request(app).post("/api/auth/logout");
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
