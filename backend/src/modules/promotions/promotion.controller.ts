// Persistent storage is temporarily disabled. Route validation and authorization remain active.

export {
  storageUnavailable as listPromotions,
  storageUnavailable as createPromotion,
  storageUnavailable as getPromotion,
  storageUnavailable as listPromotionGroups,
  storageUnavailable as findMatchingGroups,
  storageUnavailable as addFavorite,
  storageUnavailable as removeFavorite,
} from "../../http/storage-unavailable.js";
