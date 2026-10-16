// Persistent storage is temporarily disabled. Route validation and authorization remain active.

export {
  storageUnavailable as getStatistics,
  storageUnavailable as listUsers,
  storageUnavailable as updateUser,
  storageUnavailable as listPromotions,
  storageUnavailable as updatePromotion,
  storageUnavailable as listReports,
  storageUnavailable as updateReport,
  storageUnavailable as createStore,
  storageUnavailable as updateStore,
} from "../../http/storage-unavailable.js";
