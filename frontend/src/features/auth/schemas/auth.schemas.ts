import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
  username: z.string().min(3, "Username must be at least 3 characters."),
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  city: z.string().min(2, "Please enter your city."),
});

export type AuthValues = z.infer<typeof loginSchema> &
  Partial<Omit<RegisterValues, "email" | "password">>;
export type RegisterValues = z.infer<typeof registerSchema>;
