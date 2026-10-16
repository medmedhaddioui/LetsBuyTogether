// Persistent storage is temporarily disabled. Route validation and authorization remain active.

export {
  storageUnavailable as listFavorites,
  storageUnavailable as getPurchaseHistory,
  storageUnavailable as updateProfile,
  storageUnavailable as blockUser,
  storageUnavailable as unblockUser,
  storageUnavailable as listUserReviews,
  storageUnavailable as getPublicProfile,
} from "../../http/storage-unavailable.js";
