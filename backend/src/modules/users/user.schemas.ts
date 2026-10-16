import { z } from "zod";

export const profileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phoneNumber: z.string().max(30).nullable().optional(),
  avatarUrl: z.string().url().nullable().optional(),
  city: z.string().min(2).optional(),
});
