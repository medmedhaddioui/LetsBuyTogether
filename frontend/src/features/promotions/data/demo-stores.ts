import type { Store } from "../../../shared/types/store";

export const STORES: Record<string, Store> = {
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
