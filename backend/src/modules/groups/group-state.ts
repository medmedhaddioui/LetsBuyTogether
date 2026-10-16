import type { GroupMemberState, GroupStatus } from "./group.types.js";

export const isActiveMember = (member: GroupMemberState) =>
  !["LEFT", "REMOVED"].includes(member.status);
export const deriveStatus = (
  status: GroupStatus,
  members: GroupMemberState[],
  currentQuantity: number,
  requiredQuantity: number,
): GroupStatus => {
  const activeMembers = members.filter(isActiveMember);
  if (status === "OPEN" && currentQuantity >= requiredQuantity) return "FULL";
  if (
    ["FULL", "AWAITING_CONFIRMATION"].includes(status) &&
    activeMembers.length > 0 &&
    activeMembers.every((member) =>
      ["CONFIRMED", "PAYMENT_CONFIRMED", "RECEIVED"].includes(member.status),
    )
  )
    return "AWAITING_PAYMENT";
  if (
    status === "AWAITING_PAYMENT" &&
    activeMembers.length > 0 &&
    activeMembers.every((member) => ["PAYMENT_CONFIRMED", "RECEIVED"].includes(member.status))
  )
    return "READY_TO_PURCHASE";
  if (
    ["PURCHASED", "DELIVERING"].includes(status) &&
    activeMembers.length > 0 &&
    activeMembers.every((member) => member.status === "RECEIVED")
  )
    return "COMPLETED";
  return status;
};
