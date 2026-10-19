import { randomBytes } from "node:crypto";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const databaseUrl = process.env.TEST_DATABASE_URL;
if (databaseUrl && !new URL(databaseUrl).pathname.endsWith("_test"))
  throw new Error("Use an isolated _test database.");
if (databaseUrl) process.env.DATABASE_URL = databaseUrl;
process.env.JWT_SECRET ??= "test-secret-at-least-sixteen";
const { app } = await import("../../src/app.js");
const { AuthService } = await import("../../src/modules/auth/auth.service.js");
const { query, closeDatabase } = await import("../../src/database/connection.js");
const suffix = randomBytes(6).toString("hex");
const ownerEmail = `products_${suffix}@example.com`;
const otherEmail = `other_${suffix}@example.com`;
const owner = request.agent(app);
const other = request.agent(app);
let ownerId: string;
let postId: string;
let searchId: string;
const productName = `Headphones ${suffix}`;
const postInput = {
  productName,
  category: "Electronics",
  city: "Casablanca",
  price: 1500.5,
  quantityNeeded: 2,
  storeName: "Example Store",
  productUrl: "https://example.com/headphones",
  imageUrl: "https://example.com/headphones.jpg",
  description: "Buy two headphones to unlock this deal.",
  expiresAt: new Date(Date.now() + 86400_000).toISOString(),
};
const searchInput = {
  keywords: productName,
  category: "Electronics",
  city: "Casablanca",
  maxBudget: 2000,
  quantity: 1,
  productUrl: "https://example.com/headphones",
};

describe.skipIf(!databaseUrl)("PostgreSQL product searches and posts", () => {
  beforeAll(async () => {
    const registration = await AuthService.register({
      username: `owner_${suffix}`,
      email: ownerEmail,
      address: "12 Test Street",
      password: "Example123!",
      city: "Casablanca",
    });
    await owner.post("/api/auth/login").send({ email: ownerEmail, password: "Example123!" });
    ownerId = registration.user.id;
    const otherRegistration = await AuthService.register({
      username: `other_${suffix}`,
      email: otherEmail,
      address: "14 Test Street",
      password: "Example123!",
      city: "Rabat",
    });
    await other.post("/api/auth/login").send({ email: otherEmail, password: "Example123!" });
    const post = await owner
      .post("/api/product-posts")
      .send({ ...postInput, userId: otherRegistration.user.id, status: "full" });
    expect(post.status).toBe(201);
    postId = post.body.data.id;
    const search = await owner
      .post("/api/product-searches")
      .send({ ...searchInput, userId: otherRegistration.user.id, status: "matched" });
    expect(search.status).toBe(201);
    searchId = search.body.data.id;
  });
  afterAll(async () => {
    await query("DELETE FROM users WHERE email = ANY($1::text[])", [[ownerEmail, otherEmail]]);
    await closeDatabase();
  });

  it("saves every search field and assigns ownership and status on the server", async () => {
    const response = await owner.get("/api/product-searches/mine");
    expect(response.status).toBe(200);
    expect(response.body.data).toContainEqual(
      expect.objectContaining({
        ...searchInput,
        id: searchId,
        userId: ownerId,
        status: "searching",
        createdAt: expect.any(String),
      }),
    );
    expect((await other.get("/api/product-searches/mine")).body.data).toEqual([]);
  });
  it("saves post fields and default status, ignoring forged owner and status", async () => {
    const response = await owner.get("/api/product-posts/mine");
    expect(response.status).toBe(200);
    expect(response.body.data).toContainEqual(
      expect.objectContaining({
        productName,
        category: postInput.category,
        city: postInput.city,
        price: postInput.price,
        quantityNeeded: 2,
        storeName: postInput.storeName,
        productUrl: postInput.productUrl,
        imageUrl: postInput.imageUrl,
        description: postInput.description,
        expiresAt: postInput.expiresAt,
        userId: ownerId,
        status: "open",
        createdAt: expect.any(String),
      }),
    );
    expect((await other.get("/api/product-posts/mine")).body.data).toEqual([]);
  });
  it("stores the action preference while keeping the same account and both record types", async () => {
    for (const preference of ["search", "post"]) {
      const response = await owner
        .patch("/api/auth/preference")
        .send({ preference, role: "ADMIN" });
      expect(response.status).toBe(200);
      expect(response.body.data.user).toMatchObject({
        id: ownerId,
        role: "USER",
        startingPreference: preference,
      });
    }
    expect((await owner.get("/api/auth/me")).body.data.user.startingPreference).toBe("post");
    expect((await owner.get("/api/product-searches/mine")).body.data).toHaveLength(1);
    expect((await owner.get("/api/product-posts/mine")).body.data).toHaveLength(1);
    expect((await owner.patch("/api/auth/preference").send({ preference: "seller" })).status).toBe(
      400,
    );
  });
  it("finds live posts using keywords, city, category, price and quantity", async () => {
    const response = await request(app).get("/api/product-posts").query({
      search: productName,
      city: "casablanca",
      category: "electronics",
      maxBudget: 2000,
      quantity: 1,
    });
    expect(response.status).toBe(200);
    expect(response.body.data.items.map((post: { id: string }) => post.id)).toContain(postId);
    for (const filters of [
      { city: "Rabat" },
      { category: "Food" },
      { maxBudget: 0 },
      { quantity: 3 },
    ]) {
      const filtered = await request(app)
        .get("/api/product-posts")
        .query({ search: productName, ...filters });
      expect(filtered.body.data.total).toBe(0);
    }
    expect(
      (await request(app).get("/api/product-posts").query({ search: "%' OR true --" })).body.data
        .total,
    ).toBe(0);
  });
  it("keeps private account details out of public results", async () => {
    const response = await request(app).get("/api/product-posts").query({ search: productName });
    const post = response.body.data.items[0];
    expect(post.authorUsername).toBe(`owner_${suffix}`);
    for (const field of ["address", "email", "password", "passwordHash", "startingPreference"])
      expect(post).not.toHaveProperty(field);
  });
  it.each(["product-searches", "product-posts"])(
    "blocks another account from changing %s",
    async (feature) => {
      const id = feature === "product-searches" ? searchId : postId;
      const response = await other
        .patch(`/api/${feature}/${id}/status`)
        .send({ status: feature === "product-searches" ? "closed" : "cancelled" });
      expect(response.status).toBe(404);
    },
  );
  it("lets the owner manage search statuses", async () => {
    for (const status of ["matched", "closed", "searching"]) {
      const response = await owner
        .patch(`/api/product-searches/${searchId}/status`)
        .send({ status });
      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe(status);
    }
  });
  it("hides full or cancelled posts from matching and permits reopening before expiry", async () => {
    for (const status of ["full", "cancelled", "open"]) {
      expect(
        (await owner.patch(`/api/product-posts/${postId}/status`).send({ status })).status,
      ).toBe(200);
      const found = await request(app).get("/api/product-posts").query({ search: productName });
      expect(found.body.data.total).toBe(status === "open" ? 1 : 0);
    }
  });
  it("validates numeric fields, expiry dates and safe URLs", async () => {
    for (const invalid of [
      { price: -1 },
      { price: 2.345 },
      { quantityNeeded: 0 },
      { imageUrl: "javascript:alert(1)" },
      { productUrl: "bad-link" },
      { expiresAt: "2020-01-01T00:00:00Z" },
    ]) {
      expect(
        (await owner.post("/api/product-posts").send({ ...postInput, ...invalid })).status,
      ).toBe(400);
    }
    expect(
      (await owner.post("/api/product-searches").send({ ...searchInput, quantity: 1.5 })).status,
    ).toBe(400);
    expect((await request(app).get("/api/product-posts").query({ maxBudget: "bad" })).status).toBe(
      400,
    );
  });
  it("supports optional budget and product links", async () => {
    const { maxBudget: _budget, productUrl: _url, ...required } = searchInput;
    const response = await owner.post("/api/product-searches").send(required);
    expect(response.status).toBe(201);
    expect(response.body.data.maxBudget).toBeNull();
    expect(response.body.data.productUrl).toBeNull();
  });
  it("excludes expired posts and prevents reopening them", async () => {
    await query(
      "UPDATE product_posts SET expires_at = CURRENT_TIMESTAMP - INTERVAL '1 hour' WHERE id = $1",
      [postId],
    );
    expect(
      (await request(app).get("/api/product-posts").query({ search: productName })).body.data.total,
    ).toBe(0);
    expect((await owner.get("/api/product-posts/mine")).body.data[0].status).toBe("expired");
    expect(
      (await owner.patch(`/api/product-posts/${postId}/status`).send({ status: "open" })).status,
    ).toBe(409);
  });
});
