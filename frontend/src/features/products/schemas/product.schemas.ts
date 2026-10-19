import { z } from "zod";

const webUrl = z
  .string()
  .trim()
  .url("Enter a valid link.")
  .max(2000)
  .refine((value) => /^https?:\/\//i.test(value), "Use an HTTP or HTTPS link.");
const quantity = z.number().int().min(1).max(10000);
const money = z.number().finite().min(0).max(100_000_000).multipleOf(0.01);

export const productSearchSchema = z.object({
  keywords: z.string().trim().min(2, "Enter a product name or keywords.").max(200),
  category: z.string().min(1, "Choose a category."),
  city: z.string().trim().min(2, "Enter your preferred city.").max(100),
  maxBudget: money.optional(),
  quantity,
  productUrl: webUrl.optional().or(z.literal("")),
});
export const productPostSchema = z.object({
  productName: z.string().trim().min(2, "Enter the product name.").max(200),
  category: z.string().min(1, "Choose a category."),
  city: z.string().trim().min(2).max(100),
  price: money,
  quantityNeeded: quantity,
  storeName: z.string().trim().min(2).max(120),
  productUrl: webUrl,
  imageUrl: webUrl,
  description: z
    .string()
    .trim()
    .min(10, "Describe the product and deal (at least 10 characters).")
    .max(2000),
  expiresAt: z
    .string()
    .min(1, "Choose an expiry date.")
    .refine((value) => new Date(value).getTime() > Date.now(), "Choose a future expiry date."),
});
export type ProductSearchInput = z.infer<typeof productSearchSchema>;
export type ProductPostInput = z.infer<typeof productPostSchema>;
