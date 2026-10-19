import { randomUUID } from "node:crypto";
import { query } from "../../database/connection.js";
import type { CreatePostInput, PostFilters } from "./product-post.schemas.js";
import type { ProductPost } from "./product-post.types.js";

const columns = `post.id, post.user_id AS "userId", account.username AS "authorUsername",
  post.product_name AS "productName", post.category, post.city, post.price::float8 AS price,
  post.quantity_needed AS "quantityNeeded", post.store_name AS "storeName", post.product_url AS "productUrl",
  post.image_url AS "imageUrl", post.description, post.expires_at AS "expiresAt", post.created_at AS "createdAt",
  CASE WHEN post.expires_at <= CURRENT_TIMESTAMP AND post.status IN ('open','full') THEN 'expired' ELSE post.status END AS status`;

export const ProductPostRepository = {
  async create(userId: string, input: CreatePostInput) {
    const id = randomUUID();
    await query(
      `INSERT INTO product_posts
      (id, user_id, product_name, category, city, price, quantity_needed, store_name, product_url, image_url, description, expires_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
      [
        id,
        userId,
        input.productName,
        input.category,
        input.city,
        input.price,
        input.quantityNeeded,
        input.storeName,
        input.productUrl,
        input.imageUrl,
        input.description,
        input.expiresAt,
      ],
    );
    return (
      await query<ProductPost>(
        `SELECT ${columns} FROM product_posts post JOIN users account ON account.id = post.user_id WHERE post.id = $1`,
        [id],
      )
    ).rows[0];
  },
  async listMine(userId: string) {
    return (
      await query<ProductPost>(
        `SELECT ${columns} FROM product_posts post JOIN users account ON account.id = post.user_id WHERE post.user_id = $1 ORDER BY post.created_at DESC`,
        [userId],
      )
    ).rows;
  },
  async listPublic(filters: PostFilters) {
    const values: unknown[] = [];
    const where = ["post.status = 'open'", "post.expires_at > CURRENT_TIMESTAMP"];
    const parameter = (value: unknown) => {
      values.push(value);
      return `$${values.length}`;
    };
    for (const word of filters.search.split(/\s+/).filter(Boolean).slice(0, 8)) {
      // Escape SQL wildcard characters so user keywords remain literal search terms.
      const term = parameter(`%${word.replace(/[\\%_]/g, "\\$&")}%`);
      where.push(`(post.product_name ILIKE ${term} OR post.description ILIKE ${term})`);
    }
    if (filters.city) where.push(`LOWER(post.city) = LOWER(${parameter(filters.city)})`);
    if (filters.category)
      where.push(`LOWER(post.category) = LOWER(${parameter(filters.category)})`);
    if (filters.maxBudget !== undefined)
      where.push(`post.price <= ${parameter(filters.maxBudget)}`);
    if (filters.quantity !== undefined)
      where.push(`post.quantity_needed >= ${parameter(filters.quantity)}`);
    const condition = where.join(" AND ");
    const count = await query<{ total: number }>(
      `SELECT COUNT(*)::int AS total FROM product_posts post WHERE ${condition}`,
      values,
    );
    const limit = parameter(12);
    const offset = parameter((filters.page - 1) * 12);
    const items = await query<ProductPost>(
      `SELECT ${columns} FROM product_posts post JOIN users account ON account.id = post.user_id WHERE ${condition} ORDER BY post.created_at DESC LIMIT ${limit} OFFSET ${offset}`,
      values,
    );
    const total = count.rows[0].total;
    return { items: items.rows, total, page: filters.page, pages: Math.ceil(total / 12) };
  },
  async updateStatus(userId: string, id: string, status: "open" | "full" | "cancelled") {
    const existing = await query<{ expiresAt: Date }>(
      'SELECT expires_at AS "expiresAt" FROM product_posts WHERE id = $1 AND user_id = $2',
      [id, userId],
    );
    if (!existing.rows[0]) return undefined;
    if (status !== "cancelled" && existing.rows[0].expiresAt.getTime() <= Date.now()) {
      return "expired" as const;
    }
    const changed = await query<{ id: string }>(
      `UPDATE product_posts SET status = $1 WHERE id = $2 AND user_id = $3 AND ($1 = 'cancelled' OR expires_at > CURRENT_TIMESTAMP) RETURNING id`,
      [status, id, userId],
    );
    if (!changed.rows[0]) return "expired" as const;
    return (
      await query<ProductPost>(
        `SELECT ${columns} FROM product_posts post JOIN users account ON account.id = post.user_id WHERE post.id = $1 AND post.user_id = $2`,
        [id, userId],
      )
    ).rows[0];
  },
};
