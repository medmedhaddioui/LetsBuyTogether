import { Router } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../prisma/client.js";
import { auth, optionalAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { promotionSchema } from "../validators/schemas.js";
import { AppError, ok } from "../utils/http.js";
export const promotionRoutes = Router();
promotionRoutes.get("/", optionalAuth, async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1),
      limit = Math.min(50, Math.max(1, Number(req.query.limit) || 12));
    const search = String(req.query.search ?? "");
    const where: Prisma.PromotionWhereInput = {
      status: req.query.active === "false" ? undefined : "ACTIVE",
      city: req.query.city ? String(req.query.city) : undefined,
      category: req.query.category ? String(req.query.category) : undefined,
      promotionType: req.query.type as
        Prisma.EnumPromotionTypeFilter | undefined,
      storeId: req.query.store ? String(req.query.store) : undefined,
      expiresAt: req.query.expiringBefore
        ? { lte: new Date(String(req.query.expiringBefore)), gt: new Date() }
        : { gt: new Date() },
      OR: search
        ? [
            { title: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { store: { name: { contains: search, mode: "insensitive" } } },
          ]
        : undefined,
    };
    const [items, total] = await prisma.$transaction([
      prisma.promotion.findMany({
        where,
        include: {
          store: true,
          _count: { select: { groups: { where: { status: "OPEN" } } } },
          favorites: req.user ? { where: { userId: req.user.id } } : false,
        },
        orderBy: { expiresAt: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.promotion.count({ where }),
    ]);
    ok(res, { items, total, page, pages: Math.ceil(total / limit) });
  } catch (e) {
    next(e);
  }
});
promotionRoutes.post(
  "/",
  auth,
  validate(promotionSchema),
  async (req, res, next) => {
    try {
      ok(
        res,
        await prisma.promotion.create({
          data: {
            ...req.body,
            createdByUserId: req.user!.id,
            status: "PENDING",
          },
        }),
        201,
      );
    } catch (e) {
      next(e);
    }
  },
);
promotionRoutes.get("/:id", optionalAuth, async (req, res, next) => {
  try {
    const p = await prisma.promotion.findUnique({
      where: { id: req.params.id },
      include: {
        store: true,
        createdBy: { select: { username: true } },
        groups: {
          where: { status: { in: ["OPEN", "AWAITING_CONFIRMATION"] } },
          include: {
            creator: {
              select: { username: true, rating: true, isVerified: true },
            },
            _count: { select: { members: true } },
          },
        },
        favorites: req.user ? { where: { userId: req.user.id } } : false,
      },
    });
    if (!p) throw new AppError(404, "NOT_FOUND", "Promotion not found.");
    ok(res, p);
  } catch (e) {
    next(e);
  }
});
promotionRoutes.get("/:id/groups", async (req, res) =>
  ok(
    res,
    await prisma.buyingGroup.findMany({
      where: { promotionId: req.params.id, status: "OPEN" },
      include: {
        creator: { select: { username: true, rating: true, isVerified: true } },
        _count: { select: { members: true } },
      },
    }),
  ),
);
promotionRoutes.get("/:id/matches", async (req, res) => {
  const quantity = Math.max(1, Number(req.query.quantity) || 1),
    city = String(req.query.city ?? "");
  const groups = await prisma.buyingGroup.findMany({
    where: {
      promotionId: req.params.id,
      status: "OPEN",
      expiresAt: { gt: new Date() },
    },
    include: {
      creator: { select: { username: true, rating: true, isVerified: true } },
      _count: { select: { members: true } },
    },
    orderBy: [{ expiresAt: "asc" }, { createdAt: "desc" }],
  });
  ok(
    res,
    groups
      .filter((g) => g.requiredQuantity - g.currentQuantity >= quantity)
      .sort(
        (a, b) =>
          Number(b.city.toLowerCase() === city.toLowerCase()) -
          Number(a.city.toLowerCase() === city.toLowerCase()),
      ),
  );
});
promotionRoutes.post("/:id/favorite", auth, async (req, res) =>
  ok(
    res,
    await prisma.favorite.upsert({
      where: {
        userId_promotionId: {
          userId: req.user!.id,
          promotionId: req.params.id,
        },
      },
      create: { userId: req.user!.id, promotionId: req.params.id },
      update: {},
    }),
    201,
  ),
);
promotionRoutes.delete("/:id/favorite", auth, async (req, res) => {
  await prisma.favorite.deleteMany({
    where: { userId: req.user!.id, promotionId: req.params.id },
  });
  ok(res, { removed: true });
});
