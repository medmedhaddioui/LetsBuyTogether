import { describe, expect, it } from "vitest";
import { deriveStatus } from "../src/services/group-state.service.js";
import type { GroupMember } from "@prisma/client";
const members = (statuses: string[]) =>
  statuses.map((status, i) => ({
    id: String(i),
    groupId: "g",
    userId: String(i),
    quantity: 1,
    status,
    joinedAt: new Date(),
  })) as GroupMember[];
describe("group state machine", () => {
  it("fills into confirmation", () =>
    expect(deriveStatus("OPEN", members(["JOINED", "JOINED"]), 2, 2)).toBe(
      "FULL",
    ));
  it("waits for everyone to confirm", () =>
    expect(
      deriveStatus(
        "AWAITING_CONFIRMATION",
        members(["CONFIRMED", "JOINED"]),
        2,
        2,
      ),
    ).toBe("AWAITING_CONFIRMATION"));
  it("advances after all confirmations", () =>
    expect(
      deriveStatus(
        "AWAITING_CONFIRMATION",
        members(["CONFIRMED", "CONFIRMED"]),
        2,
        2,
      ),
    ).toBe("AWAITING_PAYMENT"));
  it("only becomes purchase ready after all pay", () => {
    expect(
      deriveStatus(
        "AWAITING_PAYMENT",
        members(["PAYMENT_CONFIRMED", "CONFIRMED"]),
        2,
        2,
      ),
    ).toBe("AWAITING_PAYMENT");
    expect(
      deriveStatus(
        "AWAITING_PAYMENT",
        members(["PAYMENT_CONFIRMED", "PAYMENT_CONFIRMED"]),
        2,
        2,
      ),
    ).toBe("READY_TO_PURCHASE");
  });
  it("completes only after all receipts", () =>
    expect(
      deriveStatus("PURCHASED", members(["RECEIVED", "RECEIVED"]), 2, 2),
    ).toBe("COMPLETED"));
});
