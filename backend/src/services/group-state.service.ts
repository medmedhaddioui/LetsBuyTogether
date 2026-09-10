import type { GroupMember, GroupStatus } from "@prisma/client";
export const active = (m: GroupMember) =>
  !["LEFT", "REMOVED"].includes(m.status);
export const deriveStatus = (
  status: GroupStatus,
  members: GroupMember[],
  current: number,
  required: number,
): GroupStatus => {
  const ms = members.filter(active);
  if (status === "OPEN" && current >= required) return "FULL";
  if (
    ["FULL", "AWAITING_CONFIRMATION"].includes(status) &&
    ms.length > 0 &&
    ms.every((m) =>
      ["CONFIRMED", "PAYMENT_CONFIRMED", "RECEIVED"].includes(m.status),
    )
  )
    return "AWAITING_PAYMENT";
  if (
    status === "AWAITING_PAYMENT" &&
    ms.length > 0 &&
    ms.every((m) => ["PAYMENT_CONFIRMED", "RECEIVED"].includes(m.status))
  )
    return "READY_TO_PURCHASE";
  if (
    ["PURCHASED", "DELIVERING"].includes(status) &&
    ms.length > 0 &&
    ms.every((m) => m.status === "RECEIVED")
  )
    return "COMPLETED";
  return status;
};
