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
  expiresAt: Date;
  status: "open" | "full" | "expired" | "cancelled";
  createdAt: Date;
}
