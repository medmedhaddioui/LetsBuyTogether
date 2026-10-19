import { describe, expect, it } from "vitest";
import { createPostSchema } from "../../src/modules/product-posts/product-post.schemas.js";
import { createSearchSchema } from "../../src/modules/product-searches/product-search.schemas.js";

const post = {
  productName: "Headphones",
  category: "Electronics",
  city: "Casablanca",
  price: 10,
  quantityNeeded: 2,
  storeName: "Test Store",
  productUrl: "https://example.com/item",
  imageUrl: "https://example.com/image.jpg",
  description: "Buy two items for a discount",
  expiresAt: new Date(Date.now() + 86400000).toISOString(),
};

describe("product input validation", () => {
  it("discards client-provided ownership and status", () => {
    const parsed = createPostSchema.parse({ ...post, userId: "someone-else", status: "open" });
    expect(parsed).not.toHaveProperty("userId");
    expect(parsed).not.toHaveProperty("status");
  });
  it.each(["bad-url", "javascript:alert(1)", "file:///tmp/test"])(
    "rejects unsafe URLs without throwing non-validation errors: %s",
    (productUrl) => {
      expect(createPostSchema.safeParse({ ...post, productUrl }).success).toBe(false);
    },
  );
  it("accepts an optional zero budget and rejects negative budgets", () => {
    const search = {
      keywords: "Headphones",
      category: "Electronics",
      city: "Casablanca",
      quantity: 1,
    };
    expect(createSearchSchema.parse({ ...search, maxBudget: 0 }).maxBudget).toBe(0);
    expect(createSearchSchema.safeParse({ ...search, maxBudget: -1 }).success).toBe(false);
  });
});
