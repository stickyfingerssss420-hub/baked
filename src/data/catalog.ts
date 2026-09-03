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
  meta: string; // scoop weight + bake guide shown on the card
  notes: string[]; // flavor notes shown on the card
}

export const PRODUCTS: Product[] = [
  {
    id: "choco-chip",
    name: "Choco Chip",
    category: "cookies",
    desc: "The classic scoop. Chilled brown-butter dough loaded with dark chocolate chips and flaky salt.",
    price: 50,
    cost: 22,
    img: "https://image.qwenlm.ai/generated-images/e95e9da7-466f-4c8a-949b-1cff60a2c6b4/_result.png",
    badge: "Bestseller",
    meta: "≈ 60 g scoop · bake 10–12 min @ 175°C",
    notes: ["brown butter", "sea salt"],
  },
  {
    id: "triple-choc",
    name: "Triple Chocolate",
    category: "cookies",
    desc: "A dark cocoa dough scoop folded with bittersweet chunks. Zero restraint, all chocolate.",
    price: 50,
    cost: 24,
    img: "https://image.qwenlm.ai/generated-images/1e0e9f5a-5adc-46bf-a2b9-28eeb88c7ae5/_result.png",
    badge: "For chocoholics",
    meta: "≈ 60 g scoop · bake 11–13 min @ 175°C",
    notes: ["70% cacao", "double chunks"],
  },
  {
    id: "smores",
    name: "S'mores",
    category: "cookies",
    desc: "Golden dough scooped with mini marshmallows, chocolate chunks, and graham crumble.",
    price: 50,
    cost: 26,
    img: "https://image.qwenlm.ai/generated-images/1f643755-abb4-406a-a769-6e06a31bef9c/_result.png",
    badge: "Campfire classic",
    meta: "≈ 60 g scoop · bake 10–12 min @ 175°C",
    notes: ["mini mallow", "graham"],
  },
  {
    id: "choco-walnut",
    name: "Choco Walnut",
    category: "cookies",
    desc: "Candied walnuts and dark chocolate chunks folded through a golden dough scoop.",
    price: 50,
    cost: 25,
    img: "https://image.qwenlm.ai/generated-images/620856f4-6222-4de8-b4d1-f037bbdbca75/_result.png",
    meta: "≈ 60 g scoop · bake 11–13 min @ 175°C",
    notes: ["candied walnut", "toasty"],
  },
  {
    id: "fudge-brownie",
    name: "Fudge Brownie",
    category: "brownies",
    desc: "A dense, glossy scoop of raw fudge brownie batter. Unapologetically rich — bake it or spoon it.",
    price: 80,
    cost: 38,
    img: "https://image.qwenlm.ai/generated-images/d5d1cb98-5330-452c-aa76-c58820fc4d08/_result.png",
    badge: "Rich & dense",
    meta: "≈ 90 g scoop · bake 18–22 min @ 165°C",
    notes: ["glossy batter", "70% cacao"],
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
