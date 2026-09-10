import { PrismaClient, PromotionType, type User } from "@prisma/client";
import bcrypt from "bcryptjs";
const db = new PrismaClient();
const cities = ["Casablanca", "Rabat", "Marrakech", "Agadir", "Tangier", "Fes"];
const categories = [
  "Fashion",
  "Electronics",
  "Beauty",
  "Food",
  "Sports",
  "Gaming",
  "Home",
  "Other",
];
const stores = [
  ["Marwa", "marwa", "Moroccan fashion essentials"],
  ["Electroplanet", "electroplanet", "Electronics and appliances"],
  ["Yan&One", "yan-and-one", "Moroccan beauty products"],
  ["Decathlon", "decathlon", "Sports equipment"],
  ["Carrefour", "carrefour", "Groceries and home"],
  ["Virgin Megastore", "virgin", "Gaming and culture"],
  ["Kitea", "kitea", "Furniture and home"],
  ["Jumia", "jumia", "Online marketplace"],
];
async function main() {
  await db.block.deleteMany();
  await db.favorite.deleteMany();
  await db.notification.deleteMany();
  await db.report.deleteMany();
  await db.review.deleteMany();
  await db.purchase.deleteMany();
  await db.payment.deleteMany();
  await db.message.deleteMany();
  await db.productRequest.deleteMany();
  await db.groupMember.deleteMany();
  await db.buyingGroup.deleteMany();
  await db.promotion.deleteMany();
  await db.store.deleteMany();
  await db.user.deleteMany();
  const passwordHash = await bcrypt.hash("Demo123!", 12);
  const users: User[] = [];
  for (let i = 0; i < 10; i++)
    users.push(
      await db.user.create({
        data: {
          firstName: i === 0 ? "Admin" : `Demo${i}`,
          lastName: "User",
          username: i === 0 ? "admin" : `user${i}`,
          email: i === 0 ? "admin@jme3na.ma" : `user${i}@jme3na.ma`,
          passwordHash,
          city: cities[i % cities.length]!,
          role: i === 0 ? "ADMIN" : "USER",
          isVerified: i < 5,
          rating: i ? 4 + (i % 10) / 10 : 5,
          reviewCount: i ? i : 3,
        },
      }),
    );
  const madeStores = [];
  for (const [i, s] of stores.entries())
    madeStores.push(
      await db.store.create({
        data: {
          name: s[0]!,
          slug: s[1]!,
          description: s[2]!,
          websiteUrl: `https://example.com/${s[1]}`,
          city: cities[i % cities.length],
          isVerified: i < 6,
          logoUrl: `https://placehold.co/200x200/0f766e/ffffff?text=${encodeURIComponent(s[0]!)}`,
        },
      }),
    );
  const promos = [];
  for (let i = 0; i < 20; i++) {
    const type: PromotionType =
      i % 3 === 0
        ? "BUY_X_GET_Y_FREE"
        : i % 3 === 1
          ? "BUY_X_GET_DISCOUNT"
          : "MINIMUM_SPEND";
    promos.push(
      await db.promotion.create({
        data: {
          storeId: madeStores[i % 8]!.id,
          createdByUserId: users[i % 10]!.id,
          title:
            i % 3 === 0
              ? `Buy ${2 + (i % 3)}, get one free`
              : i % 3 === 1
                ? `${20 + (i % 15)}% off when buying together`
                : `Save ${100 + i * 10} MAD on a bundle`,
          description:
            "A limited-time external store promotion. Form a trusted local group and coordinate the purchase together.",
          promotionType: type,
          requiredQuantity: 2 + (i % 3),
          discountPercentage:
            type === "BUY_X_GET_DISCOUNT" ? 20 + (i % 15) : undefined,
          discountAmount: type === "MINIMUM_SPEND" ? 100 + i * 10 : undefined,
          freeItemsQuantity: type === "BUY_X_GET_Y_FREE" ? 1 : undefined,
          minimumSpend: type === "MINIMUM_SPEND" ? 1000 : undefined,
          promotionUrl: `https://example.com/deal-${i + 1}`,
          imageUrl: `https://picsum.photos/seed/jme3na-${i}/800/500`,
          category: categories[i % categories.length]!,
          city: cities[i % cities.length],
          expiresAt: new Date(Date.now() + (7 + i) * 86400000),
          status: i < 18 ? "ACTIVE" : "PENDING",
        },
      }),
    );
  }
  for (let i = 0; i < 12; i++) {
    const p = promos[i]!;
    const creator = users[(i % 9) + 1]!;
    const qty = 1;
    const g = await db.buyingGroup.create({
      data: {
        promotionId: p.id,
        creatorId: creator.id,
        title: `${p.title} — ${cities[i % 6]}`,
        city: cities[i % 6]!,
        requiredQuantity: p.requiredQuantity,
        currentQuantity: qty,
        status: "OPEN",
        deliveryMethod: i % 2 ? "MEETUP" : "UNDECIDED",
        meetupCity: i % 2 ? cities[i % 6] : undefined,
        meetupArea: i % 2 ? "City center" : undefined,
        expiresAt: p.expiresAt,
        members: { create: { userId: creator.id, quantity: qty } },
        productRequests: {
          create: {
            userId: creator.id,
            promotionId: p.id,
            productName: `Selected product ${i + 1}`,
            productUrl: `https://example.com/product-${i + 1}`,
            quantity: qty,
            unitPrice: 199 + i * 10,
          },
        },
      },
    });
    await db.message.createMany({
      data: [
        {
          groupId: g.id,
          senderId: creator.id,
          content: "Salam! I created this group—happy to coordinate here.",
        },
        {
          groupId: g.id,
          senderId: creator.id,
          content:
            "Please check the product link and promotion expiry before joining.",
        },
      ],
    });
    await db.notification.create({
      data: {
        userId: creator.id,
        type: "GROUP_CREATED",
        title: "Group created",
        message: `Your group “${g.title}” is live.`,
        entityId: g.id,
      },
    });
  }
  await db.favorite.createMany({
    data: promos
      .slice(0, 5)
      .map((p, i) => ({ userId: users[(i % 4) + 1]!.id, promotionId: p.id })),
  });
  console.log("Seeded demo data. Admin: admin@jme3na.ma / Demo123!");
}
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
