import { randomUUID } from "node:crypto";
import { query } from "../../database/connection.js";
import type { CreateSearchInput } from "./product-search.schemas.js";
import type { ProductSearch } from "./product-search.types.js";

const columns = `id, user_id AS "userId", keywords, category, city, max_budget::float8 AS "maxBudget",
  quantity, product_url AS "productUrl", status, created_at AS "createdAt"`;

export const ProductSearchRepository = {
  async create(userId: string, input: CreateSearchInput) {
    const result = await query<ProductSearch>(
      `INSERT INTO product_searches (id, user_id, keywords, category, city, max_budget, quantity, product_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING ${columns}`,
      [
        randomUUID(),
        userId,
        input.keywords,
        input.category,
        input.city,
        input.maxBudget ?? null,
        input.quantity,
        input.productUrl ?? null,
      ],
    );
    return result.rows[0];
  },
  async listMine(userId: string) {
    return (
      await query<ProductSearch>(
        `SELECT ${columns} FROM product_searches WHERE user_id = $1 ORDER BY created_at DESC`,
        [userId],
      )
    ).rows;
  },
  async updateStatus(userId: string, id: string, status: ProductSearch["status"]) {
    return (
      await query<ProductSearch>(
        `UPDATE product_searches SET status = $1 WHERE id = $2 AND user_id = $3 RETURNING ${columns}`,
        [status, id, userId],
      )
    ).rows[0];
  },
};
