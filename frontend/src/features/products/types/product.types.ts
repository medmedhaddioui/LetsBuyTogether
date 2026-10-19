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
  createdAt: string;
}

export interface ProductPost {
  id: string;
  userId: string;
  authorUsername: string;
  productName: string;
  category: string;
  city: string;
  price: number;
  quantityNeeded: number;
  storeName: string;
  productUrl: string;
  imageUrl: string;
  description: string;
  expiresAt: string;
  status: "open" | "full" | "expired" | "cancelled";
  createdAt: string;
}
export interface PostResults {
  items: ProductPost[];
  total: number;
  page: number;
  pages: number;
}
