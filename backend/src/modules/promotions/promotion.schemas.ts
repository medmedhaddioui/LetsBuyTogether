import { z } from "zod";

export const promotionSchema = z.object({
  storeId: z.string(),
  title: z.string().min(3),
  description: z.string().min(10),
  promotionType: z.enum([
    "BUY_X_GET_DISCOUNT",
    "BUY_X_GET_Y_FREE",
    "PERCENTAGE_DISCOUNT",
    "FIXED_DISCOUNT",
    "MINIMUM_SPEND",
    "OTHER",
  ]),
  requiredQuantity: z.number().int().positive(),
  discountPercentage: z.number().min(0).max(100).optional(),
  discountAmount: z.number().nonnegative().optional(),
  freeItemsQuantity: z.number().int().positive().optional(),
  minimumSpend: z.number().nonnegative().optional(),
  promoCode: z.string().optional(),
  promotionUrl: z.string().url(),
  imageUrl: z.string().url().optional(),
  category: z.string(),
  city: z.string().optional(),
  startsAt: z.coerce.date().optional(),
  expiresAt: z.coerce.date(),
});
