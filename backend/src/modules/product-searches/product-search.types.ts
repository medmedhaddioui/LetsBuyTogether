export interface ProductSearch {
  id: string;
  userId: string;
  keywords: string;
  category: string;
  city: string;
  maxBudget: number | null;
  quantity: number;
  productUrl: string | null;
  status: "searching" | "matched" | "closed";
  createdAt: Date;
}
