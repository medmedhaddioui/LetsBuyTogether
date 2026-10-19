import { z } from "zod";
import { money, quantity, webUrl } from "../../validation/product-fields.js";

export const createPostSchema = z.object({
  productName: z.string().trim().min(2).max(200),
  category: z.string().trim().min(1).max(80),
  city: z.string().trim().min(2).max(100),
  price: money,
  quantityNeeded: quantity,
  storeName: z.string().trim().min(2).max(120),
  productUrl: webUrl,
  imageUrl: webUrl,
  description: z.string().trim().min(10).max(2000),
  expiresAt: z.coerce
    .date()
    .refine((value) => value.getTime() > Date.now(), "Choose a future expiry date."),
});
export const postStatusSchema = z.object({ status: z.enum(["open", "full", "cancelled"]) });
export const postFiltersSchema = z.object({
  search: z.string().trim().max(200).default(""),
  city: z.string().trim().max(100).default(""),
  category: z.string().trim().max(80).default(""),
  maxBudget: z.coerce.number().finite().min(0).max(100_000_000).optional(),
  quantity: z.coerce.number().int().min(1).max(10000).optional(),
  page: z.coerce.number().int().min(1).max(10000).default(1),
});
export type CreatePostInput = z.infer<typeof createPostSchema>;
export type PostFilters = z.infer<typeof postFiltersSchema>;
