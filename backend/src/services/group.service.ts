import { Prisma } from "@prisma/client";
import { prisma } from "../prisma/client.js";
import { AppError } from "../utils/http.js";
import { deriveStatus } from "./group-state.service.js";
import { notify, notifyGroup } from "./notification.service.js";
import { paymentService } from "./payment.service.js";
const details = {
  promotion: { include: { store: true } },
  creator: {
    select: {
      id: true,
      username: true,
      rating: true,
      avatarUrl: true,
      isVerified: true,
    },
  },
  members: {
    include: {
      user: {
        select: {
          id: true,
          username: true,
          rating: true,
          avatarUrl: true,
          isVerified: true,
        },
      },
    },
  },
  productRequests: true,
  payments: true,
  purchase: true,
} as const;
const get = async (tx: Prisma.TransactionClient, id: string) => {
  const g = await tx.buyingGroup.findUnique({
    where: { id },
    include: details,
  });
  if (!g) throw new AppError(404, "GROUP_NOT_FOUND", "Buying group not found.");
  return g;
};
export const GroupService = {
  list(userId?: string) {
    return prisma.buyingGroup.findMany({
      where: userId
        ? {
            members: {
              some: { userId, status: { notIn: ["LEFT", "REMOVED"] } },
            },
          }
        : undefined,
      include: details,
      orderBy: { updatedAt: "desc" },
    });
  },
  get: (id: string) => get(prisma, id),
  async create(
    userId: string,
    input: {
      promotionId: string;
      title: string;
      city: string;
      quantity: number;
      productName: string;
      productUrl: string;
      unitPrice?: number;
      variant?: string;
      size?: string;
      color?: string;
      notes?: string;
      deliveryMethod?:
        "MEETUP" | "SINGLE_ADDRESS" | "INDIVIDUAL_DELIVERY" | "UNDECIDED";
      meetupArea?: string;
    },
  ) {
    return prisma.$transaction(async (tx) => {
      const p = await tx.promotion.findFirst({
        where: {
          id: input.promotionId,
          status: "ACTIVE",
          expiresAt: { gt: new Date() },
        },
      });
      if (!p)
        throw new AppError(
          404,
          "PROMOTION_NOT_FOUND",
          "Active promotion not found.",
        );
      if (input.quantity > p.requiredQuantity)
        throw new AppError(
          400,
          "CAPACITY_EXCEEDED",
          "Requested quantity exceeds promotion requirement.",
        );
      const initial =
        input.quantity === p.requiredQuantity
          ? "FULL"
          : "OPEN";
      const g = await tx.buyingGroup.create({
        data: {
          promotionId: p.id,
          creatorId: userId,
          title: input.title,
          city: input.city,
          requiredQuantity: p.requiredQuantity,
          currentQuantity: input.quantity,
          status: initial,
          deliveryMethod: input.deliveryMethod ?? "UNDECIDED",
          meetupCity:
            input.deliveryMethod === "MEETUP" ? input.city : undefined,
          meetupArea: input.meetupArea,
          expiresAt: p.expiresAt,
          members: { create: { userId, quantity: input.quantity } },
          productRequests: {
            create: {
              userId,
              promotionId: p.id,
              productName: input.productName,
              productUrl: input.productUrl,
              quantity: input.quantity,
              unitPrice: input.unitPrice,
              variant: input.variant,
              size: input.size,
              color: input.color,
              notes: input.notes,
            },
          },
        },
      });
      return get(tx, g.id);
    });
  },
  async join(
    id: string,
    userId: string,
    input: {
      quantity: number;
      productName: string;
      productUrl: string;
      unitPrice?: number;
      variant?: string;
      size?: string;
      color?: string;
      notes?: string;
    },
  ) {
    return prisma.$transaction(
      async (tx) => {
        await tx.$queryRaw`SELECT id FROM "BuyingGroup" WHERE id=${id} FOR UPDATE`;
        const g = await get(tx, id);
        if (g.status !== "OPEN")
          throw new AppError(
            409,
            "GROUP_NOT_OPEN",
            "This group cannot be joined.",
          );
        if (g.members.some((m) => m.userId === userId && m.status !== "LEFT"))
          throw new AppError(
            409,
            "ALREADY_MEMBER",
            "You already belong to this group.",
          );
        if (g.currentQuantity + input.quantity > g.requiredQuantity)
          throw new AppError(
            409,
            "GROUP_FULL",
            "This group has no remaining available quantity.",
          );
        await tx.groupMember.upsert({
          where: { groupId_userId: { groupId: id, userId } },
          create: { groupId: id, userId, quantity: input.quantity },
          update: {
            quantity: input.quantity,
            status: "JOINED",
            joinedAt: new Date(),
          },
        });
        await tx.productRequest.upsert({
          where: { groupId_userId: { groupId: id, userId } },
          create: { ...input, userId, groupId: id, promotionId: g.promotionId },
          update: input,
        });
        const qty = g.currentQuantity + input.quantity;
        const status =
          qty === g.requiredQuantity ? "FULL" : "OPEN";
        await tx.buyingGroup.update({
          where: { id },
          data: { currentQuantity: qty, status },
        });
        await notify(
          tx,
          g.creatorId,
          "MEMBER_JOINED",
          "A member joined",
          `A new member joined ${g.title}.`,
          id,
        );
        if (status === "FULL")
          await notifyGroup(
            tx,
            id,
            "CONFIRMATION_REQUIRED",
            "Group is full",
            "Please confirm your participation.",
          );
        return get(tx, id);
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  },
  async leave(id: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "BuyingGroup" WHERE id=${id} FOR UPDATE`;
      const g = await get(tx, id);
      if (!["OPEN", "AWAITING_CONFIRMATION"].includes(g.status))
        throw new AppError(
          409,
          "CANNOT_LEAVE",
          "You can no longer leave this group.",
        );
      const m = g.members.find(
        (x) => x.userId === userId && !["LEFT", "REMOVED"].includes(x.status),
      );
      if (!m) throw new AppError(404, "NOT_MEMBER", "You are not a member.");
      await tx.groupMember.update({
        where: { id: m.id },
        data: { status: "LEFT" },
      });
      await tx.buyingGroup.update({
        where: { id },
        data: { currentQuantity: { decrement: m.quantity }, status: "OPEN" },
      });
      return get(tx, id);
    });
  },
  async confirm(id: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      const g = await get(tx, id);
      if (!["FULL", "AWAITING_CONFIRMATION"].includes(g.status))
        throw new AppError(
          409,
          "INVALID_STATE",
          "The group is not awaiting confirmation.",
        );
      const m = g.members.find(
        (x) => x.userId === userId && x.status === "JOINED",
      );
      if (!m)
        throw new AppError(
          403,
          "INVALID_MEMBER_STATE",
          "You cannot confirm participation.",
        );
      await tx.groupMember.update({
        where: { id: m.id },
        data: { status: "CONFIRMED" },
      });
      const members = await tx.groupMember.findMany({ where: { groupId: id } });
      const status = deriveStatus(
        g.status,
        members,
        g.currentQuantity,
        g.requiredQuantity,
      );
      await tx.buyingGroup.update({ where: { id }, data: { status } });
      if (status === "AWAITING_PAYMENT")
        await notifyGroup(
          tx,
          id,
          "PAYMENT_REQUIRED",
          "Payment confirmation required",
          "All members confirmed. Simulate your payment now.",
        );
      return get(tx, id);
    });
  },
  async payment(id: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      const g = await get(tx, id);
      if (g.status !== "AWAITING_PAYMENT")
        throw new AppError(
          409,
          "INVALID_STATE",
          "The group is not awaiting payment.",
        );
      const m = g.members.find(
        (x) => x.userId === userId && x.status === "CONFIRMED",
      );
      if (!m)
        throw new AppError(
          403,
          "INVALID_MEMBER_STATE",
          "You cannot confirm payment.",
        );
      const request = g.productRequests.find((x) => x.userId === userId);
      await paymentService.confirm(tx, {
        groupId: id,
        userId,
        amount: Number(request?.unitPrice ?? 0) * m.quantity,
      });
      await tx.groupMember.update({
        where: { id: m.id },
        data: { status: "PAYMENT_CONFIRMED" },
      });
      const members = await tx.groupMember.findMany({ where: { groupId: id } });
      const status = deriveStatus(
        g.status,
        members,
        g.currentQuantity,
        g.requiredQuantity,
      );
      await tx.buyingGroup.update({ where: { id }, data: { status } });
      if (status === "READY_TO_PURCHASE")
        await notifyGroup(
          tx,
          id,
          "READY_TO_PURCHASE",
          "Ready to purchase",
          "All simulated payments are confirmed.",
        );
      return get(tx, id);
    });
  },
  async purchase(
    id: string,
    userId: string,
    input: { externalOrderNumber?: string; purchaseNotes?: string },
  ) {
    return prisma.$transaction(async (tx) => {
      const g = await get(tx, id);
      if (g.creatorId !== userId)
        throw new AppError(
          403,
          "CREATOR_ONLY",
          "Only the group creator can mark the order purchased.",
        );
      if (g.status !== "READY_TO_PURCHASE")
        throw new AppError(
          409,
          "INVALID_STATE",
          "The group is not ready to purchase.",
        );
      await tx.purchase.create({
        data: { groupId: id, purchasedByUserId: userId, ...input },
      });
      await tx.buyingGroup.update({
        where: { id },
        data: { status: "PURCHASED" },
      });
      await notifyGroup(
        tx,
        id,
        "ORDER_PURCHASED",
        "Order purchased",
        "The external order has been placed.",
      );
      return get(tx, id);
    });
  },
  async received(id: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      const g = await get(tx, id);
      if (!["PURCHASED", "DELIVERING"].includes(g.status))
        throw new AppError(
          409,
          "INVALID_STATE",
          "Receipt cannot be confirmed now.",
        );
      const m = g.members.find(
        (x) => x.userId === userId && x.status === "PAYMENT_CONFIRMED",
      );
      if (!m)
        throw new AppError(
          403,
          "INVALID_MEMBER_STATE",
          "You cannot confirm receipt.",
        );
      await tx.groupMember.update({
        where: { id: m.id },
        data: { status: "RECEIVED" },
      });
      const members = await tx.groupMember.findMany({ where: { groupId: id } });
      const status = deriveStatus(
        g.status,
        members,
        g.currentQuantity,
        g.requiredQuantity,
      );
      await tx.buyingGroup.update({ where: { id }, data: { status } });
      if (status === "COMPLETED") {
        await tx.user.updateMany({
          where: { id: { in: members.map((x) => x.userId) } },
          data: { successfulGroupBuys: { increment: 1 } },
        });
        await notifyGroup(
          tx,
          id,
          "GROUP_COMPLETED",
          "Group completed",
          "Everyone received their items. You can now leave reviews.",
        );
      }
      return get(tx, id);
    });
  },
  async cancel(id: string, userId: string, isAdmin = false) {
    const g = await prisma.buyingGroup.findUnique({ where: { id } });
    if (!g) throw new AppError(404, "GROUP_NOT_FOUND", "Group not found.");
    if (g.creatorId !== userId && !isAdmin)
      throw new AppError(403, "FORBIDDEN", "You cannot cancel this group.");
    if (["COMPLETED", "CANCELLED"].includes(g.status))
      throw new AppError(
        409,
        "INVALID_STATE",
        "This group cannot be cancelled.",
      );
    return prisma.buyingGroup.update({
      where: { id },
      data: { status: "CANCELLED" },
    });
  },
};
