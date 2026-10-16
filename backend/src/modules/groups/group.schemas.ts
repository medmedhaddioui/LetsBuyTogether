import { z } from "zod";

export const productSchema = z.object({
  quantity: z.number().int().positive(),
  productName: z.string().min(2).max(150),
  productUrl: z.string().url(),
  unitPrice: z.number().nonnegative().optional(),
  variant: z.string().max(100).optional(),
  size: z.string().max(50).optional(),
  color: z.string().max(50).optional(),
  notes: z.string().max(500).optional(),
});
export const createGroupSchema = productSchema.extend({
  promotionId: z.string(),
  title: z.string().min(3).max(100),
  city: z.string().min(2),
  deliveryMethod: z
    .enum(["MEETUP", "SINGLE_ADDRESS", "INDIVIDUAL_DELIVERY", "UNDECIDED"])
    .optional(),
  meetupArea: z.string().max(100).optional(),
});
export const purchaseSchema = z.object({
  externalOrderNumber: z.string().max(100).optional(),
  purchaseNotes: z.string().max(500).optional(),
});

export const groupMessageSchema = z.object({ content: z.string().trim().min(1).max(1000) });
