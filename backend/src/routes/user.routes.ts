import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma/client.js";
import { auth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { AppError, ok } from "../utils/http.js";
export const userRoutes = Router();
const safe = {
  id: true,
  firstName: true,
  lastName: true,
  username: true,
  avatarUrl: true,
  city: true,
  rating: true,
  reviewCount: true,
  successfulGroupBuys: true,
  isVerified: true,
  createdAt: true,
} as const;
userRoutes.get("/me/favorites", auth, async (req, res) =>
  ok(
    res,
    await prisma.favorite.findMany({
      where: { userId: req.user!.id },
      include: { promotion: { include: { store: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ),
);
userRoutes.get("/me/history", auth, async (req, res) =>
  ok(
    res,
    await prisma.groupMember.findMany({
      where: { userId: req.user!.id },
      include: {
        group: { include: { promotion: { include: { store: true } } } },
      },
      orderBy: { joinedAt: "desc" },
    }),
  ),
);
userRoutes.patch(
  "/me",
  auth,
  validate(
    z.object({
      firstName: z.string().min(1).optional(),
      lastName: z.string().min(1).optional(),
      phoneNumber: z.string().max(30).nullable().optional(),
      avatarUrl: z.string().url().nullable().optional(),
      city: z.string().min(2).optional(),
    }),
  ),
  async (req, res) =>
    ok(
      res,
      await prisma.user.update({
        where: { id: req.user!.id },
        data: req.body,
        select: safe,
      }),
    ),
);
userRoutes.post("/:id/block", auth, async (req, res) =>
  ok(
    res,
    await prisma.block.upsert({
      where: {
        blockerId_blockedId: {
          blockerId: req.user!.id,
          blockedId: req.params.id,
        },
      },
      create: { blockerId: req.user!.id, blockedId: req.params.id },
      update: {},
    }),
    201,
  ),
);
userRoutes.delete("/:id/block", auth, async (req, res) => {
  await prisma.block.deleteMany({
    where: { blockerId: req.user!.id, blockedId: req.params.id },
  });
  ok(res, { removed: true });
});
userRoutes.get("/:id/reviews", async (req, res) =>
  ok(
    res,
    await prisma.review.findMany({
      where: { reviewedUserId: req.params.id },
      include: {
        reviewer: { select: { username: true, avatarUrl: true } },
        group: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ),
);
userRoutes.get("/:username", async (req, res, next) => {
  try {
    const u = await prisma.user.findUnique({
      where: { username: req.params.username },
      select: safe,
    });
    if (!u) throw new AppError(404, "NOT_FOUND", "User not found.");
    ok(res, u);
  } catch (e) {
    next(e);
  }
});
