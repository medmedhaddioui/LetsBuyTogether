// Persistent storage is temporarily disabled. Route validation and authorization remain active.

export {
  storageUnavailable as listNotifications,
  storageUnavailable as markAllRead,
  storageUnavailable as markNotificationRead,
} from "../../http/storage-unavailable.js";
