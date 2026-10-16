import { z } from "zod";

export const reportSchema = z
  .object({
    reportedUserId: z.string().optional(),
    promotionId: z.string().optional(),
    groupId: z.string().optional(),
    reason: z.string().min(3),
    description: z.string().max(1000).optional(),
  })
  .refine((x) => x.reportedUserId || x.promotionId || x.groupId, {
    message: "A report target is required.",
  });
