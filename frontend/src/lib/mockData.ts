export interface Store {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  logoUrl?: string;
  city?: string;
  isVerified: boolean;
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  promotionType:
    | "BUY_X_GET_DISCOUNT"
    | "BUY_X_GET_Y_FREE"
    | "PERCENTAGE_DISCOUNT"
    | "FIXED_DISCOUNT"
    | "MINIMUM_SPEND"
    | "OTHER";
  requiredQuantity: number;
  discountPercentage?: number;
  discountAmount?: number;
  freeItemsQuantity?: number;
  minimumSpend?: number;
  promotionUrl: string;
  imageUrl: string;
  category: string;
  city?: string;
  expiresAt: string;
  status: "ACTIVE";
  store: Store;
  groupCount: number;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  city: string;
}

const STORES: Record<string, Store> = {
  jumia: {
    id: "s1",
    name: "Jumia",
    description: "Morocco's leading e-commerce platform",
    websiteUrl: "https://www.jumia.ma",
    isVerified: true,
  },
  hmall: {
    id: "s2",
    name: "Hmall",
    description: "Electronics and tech at the best prices",
    websiteUrl: "https://www.hmall.ma",
    isVerified: true,
  },
  marjane: {
    id: "s3",
    name: "Marjane",
    description: "Morocco's largest hypermarket chain",
    websiteUrl: "https://www.marjane.ma",
    isVerified: true,
  },
  zara: {
    id: "s4",
    name: "Zara Morocco",
    description: "Global fashion brand",
    websiteUrl: "https://www.zara.com/ma",
    isVerified: true,
  },
  decathlon: {
    id: "s5",
    name: "Decathlon",
    description: "Sports equipment and gear",
    websiteUrl: "https://www.decathlon.ma",
    isVerified: true,
  },
  galaxus: {
    id: "s6",
    name: "Galaxus MA",
    description: "Consumer electronics & gadgets",
    websiteUrl: "https://www.galaxus.ma",
    isVerified: false,
  },
  ikea: {
    id: "s7",
    name: "IKEA",
    description: "Furniture and home accessories",
    websiteUrl: "https://www.ikea.com/ma",
    isVerified: true,
  },
  sephora: {
    id: "s8",
    name: "Sephora",
    description: "Beauty and cosmetics specialist",
    websiteUrl: "https://www.sephora.ma",
    isVerified: true,
  },
};

export const PROMOTIONS: Promotion[] = [
  {
    id: "p1",
    title: "Sony WH-1000XM5 Wireless Noise-Cancelling Headphones",
    description:
      "Industry-leading noise cancellation with 30-hour battery life. Buy 2 and get 15% off the total price.",
    promotionType: "BUY_X_GET_DISCOUNT",
    requiredQuantity: 2,
    discountPercentage: 15,
    promotionUrl: "https://www.jumia.ma",
    imageUrl:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
    category: "Electronics",
    city: "Casablanca",
    expiresAt: "2027-03-15T00:00:00Z",
    status: "ACTIVE",
    store: STORES.jumia,
    groupCount: 3,
  },
  {
    id: "p2",
    title: "Zara Autumn/Winter Collection — Puffer Jackets",
    description:
      "Buy 2 puffer jackets from the AW collection and get 20% off. Multiple colors and sizes available.",
    promotionType: "PERCENTAGE_DISCOUNT",
    requiredQuantity: 2,
    discountPercentage: 20,
    promotionUrl: "https://www.zara.com/ma",
    imageUrl:
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80",
    category: "Fashion",
    city: "Rabat",
    expiresAt: "2027-02-28T00:00:00Z",
    status: "ACTIVE",
    store: STORES.zara,
    groupCount: 5,
  },
  {
    id: "p3",
    title: "Apple AirPods Pro 2nd Generation",
    description:
      "Active noise cancellation, Transparency mode, and up to 30 hours total battery life. Group buy 2 and save 200 MAD each.",
    promotionType: "FIXED_DISCOUNT",
    requiredQuantity: 2,
    discountAmount: 200,
    promotionUrl: "https://www.hmall.ma",
    imageUrl:
      "https://images.unsplash.com/photo-1603351154351-5e2d0600bb77?w=800&q=80",
    category: "Electronics",
    city: "Marrakech",
    expiresAt: "2027-04-01T00:00:00Z",
    status: "ACTIVE",
    store: STORES.hmall,
    groupCount: 2,
  },
  {
    id: "p4",
    title: "Decathlon Trek 900 Mountain Bike",
    description:
      "27-speed aluminum frame mountain bike. Spend 10,000 MAD together and get free delivery + helmet worth 350 MAD.",
    promotionType: "MINIMUM_SPEND",
    requiredQuantity: 2,
    minimumSpend: 10000,
    promotionUrl: "https://www.decathlon.ma",
    imageUrl:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    category: "Sports",
    city: "Agadir",
    expiresAt: "2027-05-10T00:00:00Z",
    status: "ACTIVE",
    store: STORES.decathlon,
    groupCount: 1,
  },
  {
    id: "p5",
    title: "IKEA HEMNES Bedroom Furniture Set",
    description:
      "Complete bedroom set: bed frame, wardrobe, and dresser. Buy 2 or more sets and get delivery for free across Morocco.",
    promotionType: "BUY_X_GET_DISCOUNT",
    requiredQuantity: 2,
    discountPercentage: 10,
    promotionUrl: "https://www.ikea.com/ma",
    imageUrl:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80",
    category: "Home",
    city: "Casablanca",
    expiresAt: "2027-06-30T00:00:00Z",
    status: "ACTIVE",
    store: STORES.ikea,
    groupCount: 4,
  },
  {
    id: "p6",
    title: "Sephora Dyson Airwrap Complete Styler",
    description:
      "The complete styling set curls, waves, smooths, dries and increases shine. Buy 2 and one is free.",
    promotionType: "BUY_X_GET_Y_FREE",
    requiredQuantity: 2,
    freeItemsQuantity: 1,
    promotionUrl: "https://www.sephora.ma",
    imageUrl:
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80",
    category: "Beauty",
    city: "Tangier",
    expiresAt: "2027-02-14T00:00:00Z",
    status: "ACTIVE",
    store: STORES.sephora,
    groupCount: 6,
  },
  {
    id: "p7",
    title: "Samsung 65\" 4K QLED Smart TV QN90B",
    description:
      "Quantum Matrix Technology with Neo Quantum Processor 4K. Group deal: buy 3 TVs together and save 1,500 MAD each.",
    promotionType: "FIXED_DISCOUNT",
    requiredQuantity: 3,
    discountAmount: 1500,
    promotionUrl: "https://www.hmall.ma",
    imageUrl:
      "https://images.unsplash.com/photo-1593359677879-a4bb92f4 e2?w=800&q=80",
    category: "Electronics",
    city: "Fes",
    expiresAt: "2027-03-31T00:00:00Z",
    status: "ACTIVE",
    store: STORES.hmall,
    groupCount: 0,
  },
  {
    id: "p8",
    title: "Marjane Instant Pot Duo 7-in-1 Electric Pressure Cooker",
    description:
      "7-in-1 multi-use cooker: pressure cooker, slow cooker, rice cooker, steamer, sauté, yogurt maker and warmer. Buy 5 get 1 free.",
    promotionType: "BUY_X_GET_Y_FREE",
    requiredQuantity: 5,
    freeItemsQuantity: 1,
    promotionUrl: "https://www.marjane.ma",
    imageUrl:
      "https://images.unsplash.com/photo-1585515320310-259814833e62?w=800&q=80",
    category: "Home",
    city: "Rabat",
    expiresAt: "2027-04-15T00:00:00Z",
    status: "ACTIVE",
    store: STORES.marjane,
    groupCount: 2,
  },
  {
    id: "p9",
    title: "Nike Air Max 270 — Limited Edition",
    description:
      "Max Air unit in heel for exceptional comfort all-day. Group buy 3 pairs and get 25% off entire order.",
    promotionType: "PERCENTAGE_DISCOUNT",
    requiredQuantity: 3,
    discountPercentage: 25,
    promotionUrl: "https://www.jumia.ma",
    imageUrl:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
    category: "Fashion",
    city: "Marrakech",
    expiresAt: "2027-03-20T00:00:00Z",
    status: "ACTIVE",
    store: STORES.jumia,
    groupCount: 7,
  },
  {
    id: "p10",
    title: "PlayStation 5 Disc Edition Bundle",
    description:
      "PS5 with one controller and your choice of 2 games. Share the purchase and split the savings — 10% off for groups of 2+.",
    promotionType: "BUY_X_GET_DISCOUNT",
    requiredQuantity: 2,
    discountPercentage: 10,
    promotionUrl: "https://www.galaxus.ma",
    imageUrl:
      "https://images.unsplash.com/photo-1607853202273-232359dbb95f?w=800&q=80",
    category: "Gaming",
    city: "Casablanca",
    expiresAt: "2027-05-01T00:00:00Z",
    status: "ACTIVE",
    store: STORES.galaxus,
    groupCount: 9,
  },
  {
    id: "p11",
    title: "Decathlon Kipsta Football Boots & Gear Pack",
    description:
      "Complete football starter pack: boots, shin guards, and training shirt. Minimum spend 3,000 MAD for 15% team discount.",
    promotionType: "MINIMUM_SPEND",
    requiredQuantity: 4,
    minimumSpend: 3000,
    promotionUrl: "https://www.decathlon.ma",
    imageUrl:
      "https://images.unsplash.com/photo-1570498839593-e565b39455fc?w=800&q=80",
    category: "Sports",
    city: "Agadir",
    expiresAt: "2027-07-01T00:00:00Z",
    status: "ACTIVE",
    store: STORES.decathlon,
    groupCount: 3,
  },
  {
    id: "p12",
    title: "Charlotte Tilbury Pillow Talk Gift Set",
    description:
      "The iconic Pillow Talk collection: lipstick, liner, blush, and highlighter. Buy 3 sets and get free gift wrapping + 15% off.",
    promotionType: "PERCENTAGE_DISCOUNT",
    requiredQuantity: 3,
    discountPercentage: 15,
    promotionUrl: "https://www.sephora.ma",
    imageUrl:
      "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800&q=80",
    category: "Beauty",
    city: "Tangier",
    expiresAt: "2027-02-10T00:00:00Z",
    status: "ACTIVE",
    store: STORES.sephora,
    groupCount: 4,
  },
  {
    id: "p13",
    title: "MacBook Air M2 — Space Gray",
    description:
      "All-day battery, M2 chip with 8-core CPU and 8-core GPU. Group deal for students and remote workers — 12% off for 2+.",
    promotionType: "PERCENTAGE_DISCOUNT",
    requiredQuantity: 2,
    discountPercentage: 12,
    promotionUrl: "https://www.hmall.ma",
    imageUrl:
      "https://images.unsplash.com/photo-1611186871525-d3e9a1e0c28b?w=800&q=80",
    category: "Electronics",
    city: "Fes",
    expiresAt: "2027-04-20T00:00:00Z",
    status: "ACTIVE",
    store: STORES.hmall,
    groupCount: 1,
  },
  {
    id: "p14",
    title: "IKEA KALLAX Shelving Unit — Set of 3",
    description:
      "Customizable modular shelving for books, records, and storage. Buy 3 units together for 150 MAD off each.",
    promotionType: "FIXED_DISCOUNT",
    requiredQuantity: 3,
    discountAmount: 150,
    promotionUrl: "https://www.ikea.com/ma",
    imageUrl:
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80",
    category: "Home",
    city: "Casablanca",
    expiresAt: "2027-08-01T00:00:00Z",
    status: "ACTIVE",
    store: STORES.ikea,
    groupCount: 2,
  },
  {
    id: "p15",
    title: "Adidas Originals Tracksuit — Limited Colorways",
    description:
      "Iconic 3-stripe tracksuit in new seasonal colorways. Buy 2+ and unlock exclusive member pricing (18% off).",
    promotionType: "PERCENTAGE_DISCOUNT",
    requiredQuantity: 2,
    discountPercentage: 18,
    promotionUrl: "https://www.jumia.ma",
    imageUrl:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80",
    category: "Fashion",
    expiresAt: "2027-03-01T00:00:00Z",
    status: "ACTIVE",
    store: STORES.jumia,
    groupCount: 5,
  },
  {
    id: "p16",
    title: "Marjane Nespresso Vertuo Next Coffee Machine",
    description:
      "Barista-quality coffee at home. Comes with 100 capsule starter pack. Buy 4 machines together for a 300 MAD rebate each.",
    promotionType: "FIXED_DISCOUNT",
    requiredQuantity: 4,
    discountAmount: 300,
    promotionUrl: "https://www.marjane.ma",
    imageUrl:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80",
    category: "Home",
    city: "Rabat",
    expiresAt: "2027-06-01T00:00:00Z",
    status: "ACTIVE",
    store: STORES.marjane,
    groupCount: 1,
  },
  {
    id: "p17",
    title: "Nintendo Switch OLED — Pokémon Edition",
    description:
      "Limited edition console with 7-inch OLED screen. Buy 2 together and get 100 MAD off each plus free screen protector.",
    promotionType: "FIXED_DISCOUNT",
    requiredQuantity: 2,
    discountAmount: 100,
    promotionUrl: "https://www.galaxus.ma",
    imageUrl:
      "https://images.unsplash.com/photo-1612287117831-d9dfde3c5e02?w=800&q=80",
    category: "Gaming",
    city: "Marrakech",
    expiresAt: "2027-04-30T00:00:00Z",
    status: "ACTIVE",
    store: STORES.galaxus,
    groupCount: 8,
  },
  {
    id: "p18",
    title: "Huda Beauty Nude Obsessions Eyeshadow Palette",
    description:
      "12 nude shades in one palette for everyday and glam looks. Buy 3 palettes together and the 4th is completely free.",
    promotionType: "BUY_X_GET_Y_FREE",
    requiredQuantity: 3,
    freeItemsQuantity: 1,
    promotionUrl: "https://www.sephora.ma",
    imageUrl:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80",
    category: "Beauty",
    city: "Fes",
    expiresAt: "2027-03-08T00:00:00Z",
    status: "ACTIVE",
    store: STORES.sephora,
    groupCount: 6,
  },
  {
    id: "p19",
    title: "Decathlon Kayak & Paddle Board Bundle",
    description:
      "Inflatable kayak for 2 people + paddle board. Perfect for Morocco's Atlantic coast. Group of 3+ gets 20% off.",
    promotionType: "PERCENTAGE_DISCOUNT",
    requiredQuantity: 3,
    discountPercentage: 20,
    promotionUrl: "https://www.decathlon.ma",
    imageUrl:
      "https://images.unsplash.com/photo-1502209524164-acea936639a2?w=800&q=80",
    category: "Sports",
    city: "Agadir",
    expiresAt: "2027-09-01T00:00:00Z",
    status: "ACTIVE",
    store: STORES.decathlon,
    groupCount: 0,
  },
  {
    id: "p20",
    title: "Béaba Babycook Smart Meal Prep Machine",
    description:
      "All-in-one baby food maker: steams, blends, defrosts and reheats in 15 minutes. Group buy 4+ for free shipping across Morocco.",
    promotionType: "OTHER",
    requiredQuantity: 4,
    promotionUrl: "https://www.jumia.ma",
    imageUrl:
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80",
    category: "Home",
    expiresAt: "2027-05-20T00:00:00Z",
    status: "ACTIVE",
    store: STORES.jumia,
    groupCount: 2,
  },
];

export const CITIES = [
  "Casablanca",
  "Rabat",
  "Marrakech",
  "Agadir",
  "Tangier",
  "Fes",
];
export const CATEGORIES = [
  "Electronics",
  "Fashion",
  "Beauty",
  "Sports",
  "Gaming",
  "Home",
];
export const PROMO_TYPES: { value: string; label: string }[] = [
  { value: "BUY_X_GET_DISCOUNT", label: "Buy X, get discount" },
  { value: "BUY_X_GET_Y_FREE", label: "Buy X, get free" },
  { value: "PERCENTAGE_DISCOUNT", label: "Percentage off" },
  { value: "FIXED_DISCOUNT", label: "Fixed amount off" },
  { value: "MINIMUM_SPEND", label: "Minimum spend" },
];
