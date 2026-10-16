// Persistent storage is temporarily disabled. Route validation and authorization remain active.

export {
  storageUnavailable as listGroups,
  storageUnavailable as createGroup,
  storageUnavailable as getGroup,
  storageUnavailable as joinGroup,
  storageUnavailable as leaveGroup,
  storageUnavailable as confirmParticipation,
  storageUnavailable as confirmPayment,
  storageUnavailable as recordPurchase,
  storageUnavailable as confirmReceipt,
  storageUnavailable as cancelGroup,
  storageUnavailable as listGroupMessages,
  storageUnavailable as sendGroupMessage,
} from "../../http/storage-unavailable.js";
