import { z } from "zod";

import { money, quantity, webUrl } from "../../validation/product-fields.js";

export const createSearchSchema = z.object({
  keywords: z.string().trim().min(2).max(200),
  category: z.string().trim().min(1).max(80),
  city: z.string().trim().min(2).max(100),
  maxBudget: money.optional(),
  quantity,
  productUrl: webUrl.optional(),
});
export const searchStatusSchema = z.object({ status: z.enum(["searching", "matched", "closed"]) });
export type CreateSearchInput = z.infer<typeof createSearchSchema>;
