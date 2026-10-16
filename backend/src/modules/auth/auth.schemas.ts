import { z } from "zod";

export const registerSchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  username: z.string().regex(/^[a-zA-Z0-9_]{3,30}$/),
  email: z.string().email(),
  password: z.string().min(8),
  city: z.string().min(2),
});
export const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });
