// Persistent storage is temporarily disabled. Route validation and authorization remain active.

export {
  storageUnavailable as listStores,
  storageUnavailable as getStore,
} from "../../http/storage-unavailable.js";
