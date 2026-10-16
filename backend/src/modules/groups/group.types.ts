export type GroupStatus =
  | "OPEN"
  | "FULL"
  | "AWAITING_CONFIRMATION"
  | "AWAITING_PAYMENT"
  | "READY_TO_PURCHASE"
  | "PURCHASED"
  | "DELIVERING"
  | "COMPLETED"
  | "CANCELLED"
  | "EXPIRED";

export type MemberStatus =
  "JOINED" | "CONFIRMED" | "PAYMENT_CONFIRMED" | "RECEIVED" | "LEFT" | "REMOVED";

export interface GroupMemberState {
  status: MemberStatus;
}
