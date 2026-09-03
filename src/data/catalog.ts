/* ------------------------------------------------------------------ */
/*  Scoopable Cookies — product catalog & business constants           */
/* ------------------------------------------------------------------ */

export type Category = "cookies" | "brownies";

export interface Product {
  id: string;
  name: string;
  category: Category;
  desc: string;
  price: number; // selling price (₱)
  cost: number; // cost price (₱) — used for margin analytics
  img: string;
  badge?: string;
  notes: string[]; // flavor notes shown on the card
}

export const PRODUCTS: Product[] = [
  {
    id: "choco-chip",
    name: "Choco Chip",
    category: "cookies",
    desc: "The classic. Brown-butter dough, molten dark-chocolate chunks, flaky salt.",
    price: 50,
    cost: 22,
    img: "https://image.qwenlm.ai/generated-images/e5392511-cc17-4f58-b011-40ac5f0f1a9c/_result.png",
    badge: "Bestseller",
    notes: ["brown butter", "sea salt"],
  },
  {
    id: "triple-choc",
    name: "Triple Chocolate",
    category: "cookies",
    desc: "Dark cocoa dough, bittersweet chunks, and a chocolate drizzle. No restraint.",
    price: 50,
    cost: 24,
    img: "https://image.qwenlm.ai/generated-images/ad17ce1f-c03f-4a1c-8dfc-a5dc4d80847a/_result.png",
    badge: "For chocoholics",
    notes: ["70% cacao", "fudgy center"],
  },
  {
    id: "smores",
    name: "S'mores",
    category: "cookies",
    desc: "Torched marshmallow, graham crumble, and a melted chocolate blanket.",
    price: 50,
    cost: 26,
    img: "https://image.qwenlm.ai/generated-images/5a8a17b9-fc4e-449e-893b-da91ce59038f/_result.png",
    badge: "Campfire classic",
    notes: ["torched mallow", "graham"],
  },
  {
    id: "choco-walnut",
    name: "Choco Walnut",
    category: "cookies",
    desc: "Candied walnuts folded through golden dough with dark chocolate chunks.",
    price: 50,
    cost: 25,
    img: "https://image.qwenlm.ai/generated-images/e634980a-3a66-4e50-9386-facf49ce8308/_result.png",
    notes: ["candied walnut", "toasty"],
  },
  {
    id: "fudge-brownie",
    name: "Fudge Brownie",
    category: "brownies",
    desc: "Dense, glossy-topped, and unapologetically rich. Cut thick, served warm.",
    price: 80,
    cost: 38,
    img: "https://image.qwenlm.ai/generated-images/04214ce6-5c32-4e60-9814-9612a7ec1164/_result.png",
    badge: "Rich & dense",
    notes: ["crackly top", "gooey middle"],
  },
];

export const productById = (id: string) => PRODUCTS.find((p) => p.id === id);

/* ------------------------- business constants ------------------------- */

export const BIZ = {
  name: "Scoopable Cookies",
  email: "fingerstlckyyyy420@gmail.com",
  phone: "09943015214",
  address: "85 St General Ponce",
  hours: "Tue – Sun · 10:00 AM – 8:00 PM",
  gcash: "09943015214",
  maya: "09155606788",
  deliveryFee: 50,
  minDelivery: 250,
  lowStockThreshold: 10,
  cartTtlMs: 24 * 60 * 60 * 1000, // cart persists for 24 hours
};

/* ------------------------------ promos ------------------------------- */

export interface Promo {
  code: string;
  label: string;
  kind: "percent" | "flat";
  value: number; // percent (0-100) or peso amount
  minSubtotal?: number;
}

export const PROMOS: Promo[] = [
  { code: "SCOOP10", label: "10% off your order", kind: "percent", value: 10 },
  { code: "STICKY15", label: "15% off for the regulars", kind: "percent", value: 15 },
  { code: "SWEET50", label: "₱50 off orders over ₱300", kind: "flat", value: 50, minSubtotal: 300 },
];

export const ADMIN_USER = "stickyfinger420";
export const ADMIN_PASS = "Star2005!!";
