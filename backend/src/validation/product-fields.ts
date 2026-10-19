import { z } from "zod";
export const webUrl = z
  .string()
  .trim()
  .url()
  .max(2000)
  .refine((value) => /^https?:\/\//i.test(value), "Use an HTTP or HTTPS link.");
export const money = z.number().finite().min(0).max(100_000_000).multipleOf(0.01);
export const quantity = z.number().int().min(1).max(10000);
