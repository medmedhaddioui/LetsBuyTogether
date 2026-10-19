import { z } from "zod";

const passwordLimit = (password: string) => new TextEncoder().encode(password).length <= 72;

export const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address.").max(254),
  password: z
    .string()
    .min(1, "Please enter your password.")
    .refine(passwordLimit, "Password is too long."),
});

export const profileSchema = z.object({
  username: z
    .string()
    .trim()
    .regex(/^[a-zA-Z0-9_]{3,30}$/, "Use 3–30 letters, numbers or underscores."),
  address: z.string().trim().min(5, "Please enter your address.").max(500),
  city: z.string().trim().min(2, "Please enter your city.").max(100),
});
export type LoginValues = z.infer<typeof loginSchema>;
export type ProfileValues = z.infer<typeof profileSchema>;
