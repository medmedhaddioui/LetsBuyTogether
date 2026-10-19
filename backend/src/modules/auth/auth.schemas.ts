import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8)
  .refine(
    (password) => Buffer.byteLength(password, "utf8") <= 72,
    "Password must be at most 72 UTF-8 bytes.",
  );

export const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .regex(/^[a-zA-Z0-9_]{3,30}$/),
  email: z
    .string()
    .trim()
    .email()
    .max(254)
    .transform((email) => email.toLowerCase()),
  address: z.string().trim().min(5).max(500),
  password: passwordSchema,
  city: z.string().trim().min(2).max(100),
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email()
    .max(254)
    .transform((email) => email.toLowerCase()),
  password: z
    .string()
    .min(1)
    .refine((password) => Buffer.byteLength(password, "utf8") <= 72),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const preferenceSchema = z.object({ preference: z.enum(["search", "post"]) });

export const profileSchema = registerSchema
  .pick({ username: true, address: true, city: true })
  .extend({
    phone: z
      .string()
      .trim()
      .max(30)
      .refine(
        (value) =>
          value === "" ||
          (/^\+?[0-9 ()-]+$/.test(value) &&
            value.replace(/\D/g, "").length >= 7 &&
            value.replace(/\D/g, "").length <= 15),
        "Enter a valid phone number.",
      )
      .optional(),
    bio: z.string().trim().max(500).optional(),
  });
