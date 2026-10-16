import { z } from "zod";

export const storeSchema = z.object({
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  websiteUrl: z.string().url(),
  logoUrl: z.string().url().optional(),
  city: z.string().optional(),
  isVerified: z.boolean().optional(),
});

export const userModerationSchema = z.object({
  isVerified: z.boolean().optional(),
  isSuspended: z.boolean().optional(),
});

export const promotionModerationSchema = z.object({
  status: z.enum(["PENDING", "ACTIVE", "REJECTED", "EXPIRED", "DISABLED"]),
});

export const reportModerationSchema = z.object({
  status: z.enum(["OPEN", "REVIEWING", "RESOLVED", "DISMISSED"]),
});

export const storeUpdateSchema = storeSchema.partial();
