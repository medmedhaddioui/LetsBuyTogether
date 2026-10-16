import type { Store } from "./store";

export interface Promotion {
  id: string;
  title: string;
  description: string;
  promotionType:
    | "BUY_X_GET_DISCOUNT"
    | "BUY_X_GET_Y_FREE"
    | "PERCENTAGE_DISCOUNT"
    | "FIXED_DISCOUNT"
    | "MINIMUM_SPEND"
    | "OTHER";
  requiredQuantity: number;
  discountPercentage?: number;
  discountAmount?: number;
  freeItemsQuantity?: number;
  minimumSpend?: number;
  promotionUrl: string;
  imageUrl: string;
  category: string;
  city?: string;
  expiresAt: string;
  status: "ACTIVE";
  store: Store;
  groupCount: number;
}
