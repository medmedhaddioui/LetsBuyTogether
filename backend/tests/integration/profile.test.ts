import { randomBytes } from "node:crypto";
import sharp from "sharp";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const databaseUrl = process.env.TEST_DATABASE_URL;
if (databaseUrl && !new URL(databaseUrl).pathname.endsWith("_test"))
  throw new Error("Use a _test database.");
if (databaseUrl) process.env.DATABASE_URL = databaseUrl;
process.env.JWT_SECRET ??= "test-secret-at-least-sixteen";
const { app } = await import("../../src/app.js");
const { AuthService } = await import("../../src/modules/auth/auth.service.js");
const { query, closeDatabase } = await import("../../src/database/connection.js");
const suffix = randomBytes(6).toString("hex");
const account = {
  username: `profile_${suffix}`,
  email: `profile_${suffix}@example.com`,
  password: "Example123!",
  address: "12 Test Street",
  city: "Rabat",
};
const otherAccount = {
  ...account,
  username: `other_${suffix}`,
  email: `other_${suffix}@example.com`,
};
const owner = request.agent(app);
const other = request.agent(app);
let otherId: string;
let png: Buffer;

describe.skipIf(!databaseUrl)("Private profile and photo uploads", () => {
  beforeAll(async () => {
    await AuthService.register(account);
    otherId = (await AuthService.register(otherAccount)).user.id;
    await owner.post("/api/auth/login").send(account);
    await other.post("/api/auth/login").send(otherAccount);
    png = await sharp({ create: { width: 400, height: 300, channels: 3, background: "#0078d4" } })
      .png()
      .toBuffer();
  });
  afterAll(async () => {
    await query("DELETE FROM users WHERE email = ANY($1::text[])", [
      [account.email, otherAccount.email],
    ]);
    await closeDatabase();
  });
  it("updates contact details and bio for the signed-in owner only", async () => {
    const response = await owner.patch("/api/auth/profile").send({
      ...account,
      phone: "+212 612 345 678",
      bio: "Enjoy buying together.",
      id: otherId,
      email: otherAccount.email,
      role: "ADMIN",
    });
    expect(response.status).toBe(200);
    expect(response.body.data.user).toMatchObject({
      email: account.email,
      role: "USER",
      phone: "+212 612 345 678",
      bio: "Enjoy buying together.",
    });
    expect((await other.get("/api/auth/me")).body.data.user.phone).toBeNull();
    expect((await owner.get("/api/auth/me")).body.data.user.phone).toBe("+212 612 345 678");
  });
  it("preserves omitted optional fields and clears explicitly empty ones", async () => {
    expect((await owner.patch("/api/auth/profile").send(account)).body.data.user.bio).toBe(
      "Enjoy buying together.",
    );
    const cleared = await owner.patch("/api/auth/profile").send({ ...account, phone: "", bio: "" });
    expect(cleared.body.data.user.phone).toBeNull();
    expect(cleared.body.data.user.bio).toBeNull();
  });
  it("validates phone, bio and duplicate usernames", async () => {
    for (const invalid of [{ phone: "hello" }, { phone: "123" }, { bio: "x".repeat(501) }]) {
      expect((await owner.patch("/api/auth/profile").send({ ...account, ...invalid })).status).toBe(
        400,
      );
    }
    expect(
      (await owner.patch("/api/auth/profile").send({ ...account, username: otherAccount.username }))
        .status,
    ).toBe(409);
  });
  it("requires authentication for photo read, upload and removal", async () => {
    expect((await request(app).get("/api/auth/avatar")).status).toBe(401);
    expect(
      (await request(app).put("/api/auth/avatar").set("Content-Type", "image/png").send(png))
        .status,
    ).toBe(401);
    expect((await request(app).delete("/api/auth/avatar")).status).toBe(401);
  });
  it("stores a resized photo and keeps it private", async () => {
    const upload = await owner.put("/api/auth/avatar").set("Content-Type", "image/png").send(png);
    expect(upload.status).toBe(200);
    expect(upload.body.data.user.photoUrl).toMatch(/^\/api\/auth\/avatar\?v=/);
    expect(upload.body.data.user).not.toHaveProperty("avatar");
    const image = await owner.get(upload.body.data.user.photoUrl);
    expect(image.status).toBe(200);
    expect(image.headers["content-type"]).toContain("image/webp");
    expect(image.headers["cache-control"]).toContain("no-store");
    const metadata = await sharp(image.body).metadata();
    expect(metadata).toMatchObject({ width: 256, height: 256, format: "webp" });
    expect(metadata.exif).toBeUndefined();
    expect((await other.get(upload.body.data.user.photoUrl)).status).toBe(404);
  });
  it("rejects corrupt files and SVG disguised as an accepted photo without replacing the old photo", async () => {
    for (const content of [
      Buffer.from("not an image"),
      Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"></svg>'),
    ]) {
      expect(
        (await owner.put("/api/auth/avatar").set("Content-Type", "image/png").send(content)).status,
      ).toBe(400);
    }
    expect(
      (await owner.put("/api/auth/avatar").send({ photo: "https://example.com" })).status,
    ).toBe(415);
    expect((await owner.get("/api/auth/avatar")).status).toBe(200);
  });
  it("limits file size", async () => {
    const response = await owner
      .put("/api/auth/avatar")
      .set("Content-Type", "image/png")
      .send(Buffer.alloc(2 * 1024 * 1024 + 1));
    expect(response.status).toBe(413);
    expect(response.body.error.code).toBe("UPLOAD_TOO_LARGE");
  });
  it("removes the photo and restores the default avatar", async () => {
    const response = await owner.delete("/api/auth/avatar");
    expect(response.status).toBe(200);
    expect(response.body.data.user.photoUrl).toBeNull();
    expect((await owner.get("/api/auth/avatar")).status).toBe(404);
    expect((await owner.get("/api/auth/me")).body.data.user.photoUrl).toBeNull();
  });
});
