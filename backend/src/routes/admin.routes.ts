import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma/client.js';
import { auth, admin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { ok } from '../utils/http.js';

export const adminRoutes = Router();
adminRoutes.use(auth, admin);
adminRoutes.get('/stats', async (_req, res) => {
  const [users, promotions, groups, reports] = await prisma.$transaction([
    prisma.user.count(), prisma.promotion.count(), prisma.buyingGroup.count(),
    prisma.report.count({ where: { status: { in: ['OPEN', 'REVIEWING'] } } }),
  ]);
  ok(res, { users, promotions, groups, reports });
});
adminRoutes.get('/users', async (_req, res) => ok(res, await prisma.user.findMany({
  orderBy: { createdAt: 'desc' },
  select: { id: true, username: true, email: true, city: true, role: true, isVerified: true, isSuspended: true, rating: true, createdAt: true },
})));
adminRoutes.patch('/users/:id', validate(z.object({ isVerified: z.boolean().optional(), isSuspended: z.boolean().optional() })), async (req, res) => ok(res, await prisma.user.update({ where: { id: req.params.id }, data: req.body })));
adminRoutes.get('/promotions', async (_req, res) => ok(res, await prisma.promotion.findMany({ include: { store: true, createdBy: { select: { username: true } } }, orderBy: { createdAt: 'desc' } })));
adminRoutes.patch('/promotions/:id', validate(z.object({ status: z.enum(['PENDING', 'ACTIVE', 'REJECTED', 'EXPIRED', 'DISABLED']) })), async (req, res) => ok(res, await prisma.promotion.update({ where: { id: req.params.id }, data: { status: req.body.status } })));
adminRoutes.get('/reports', async (_req, res) => ok(res, await prisma.report.findMany({ include: { reporter: { select: { username: true } }, reportedUser: { select: { username: true } }, promotion: { select: { title: true } }, group: { select: { title: true } } }, orderBy: { createdAt: 'desc' } })));
adminRoutes.patch('/reports/:id', validate(z.object({ status: z.enum(['OPEN', 'REVIEWING', 'RESOLVED', 'DISMISSED']) })), async (req, res) => ok(res, await prisma.report.update({ where: { id: req.params.id }, data: req.body })));
const storeSchema = z.object({ name: z.string(), slug: z.string(), description: z.string(), websiteUrl: z.string().url(), logoUrl: z.string().url().optional(), city: z.string().optional(), isVerified: z.boolean().optional() });
adminRoutes.post('/stores', validate(storeSchema), async (req, res) => ok(res, await prisma.store.create({ data: req.body }), 201));
adminRoutes.patch('/stores/:id', validate(storeSchema.partial()), async (req, res) => ok(res, await prisma.store.update({ where: { id: req.params.id }, data: req.body })));
