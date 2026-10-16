import type { Promotion } from "../../../shared/types/promotion";
import { PROMO_TYPES } from "../constants/promotion-filters";

export function discountLabel(promotion: Promotion): string {
  if (promotion.discountPercentage) return `${promotion.discountPercentage}% off`;
  if (promotion.discountAmount) return `${promotion.discountAmount} MAD off`;
  if (promotion.freeItemsQuantity) return `${promotion.freeItemsQuantity} free`;
  if (promotion.minimumSpend) return `Min. ${promotion.minimumSpend} MAD`;
  return "Special deal";
}

export function typeLabel(promotionType: string): string {
  return (
    PROMO_TYPES.find((option) => option.value === promotionType)?.label ??
    promotionType.replace(/_/g, " ")
  );
}
