/* ------------------------------------------------------------------ */
/*  Scoopable Cookies — data layer                                     */
/*                                                                     */
/*  Local-first "realtime" store: every read/write goes through this   */
/*  module, and every write broadcasts on a bus (BroadcastChannel +    */
/*  storage events) so all open tabs — storefront, cart, admin — stay  */
/*  in sync instantly, like a real backend push.                       */
/*                                                                     */
/*  To move to production with Supabase, swap the bodies of these      */
/*  functions for supabase.from("orders").select()/insert()/update()   */
/*  calls and replace the bus with supabase.channel() realtime         */
/*  subscriptions. The public API below stays identical, so no UI      */
/*  code needs to change. See SETUP.md for the full wiring guide.      */
/* ------------------------------------------------------------------ */

import { BIZ, PRODUCTS } from "../data/catalog";
import { mulberry32, orderNumber, uid } from "./utils";

/* ------------------------------- types ------------------------------ */

export type OrderStatus = "pending" | "confirmed" | "completed" | "rejected";
export type DeliveryMethod = "pickup" | "delivery";
export type PaymentMethod = "gcash" | "maya" | "cod";

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  img: string;
  qty: number;
}

export interface Order {
  id: string;
  number: string;
  createdAt: number;
  customer: { name: string; phone: string; address: string; notes: string };
  delivery: DeliveryMethod;
  payment: PaymentMethod;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  promoCode: string | null;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  proof: string | null; // data-URL of the GCash/Maya screenshot
}

export type ChatRole = "customer" | "admin" | "bot";
export interface ChatMessage {
  id: string;
  name: string; // customer display name
  role: ChatRole;
  text: string;
  ts: number;
}

export interface InventoryEntry {
  stock: number;
  cost: number;
}
export type InventoryMap = Record<string, InventoryEntry>;

/* ------------------------------ storage ----------------------------- */

const KEYS = {
  seeded: "sc_seeded_v1",
  orders: "sc_orders_v1",
  inventory: "sc_inventory_v1",
  chat: "sc_chat_v1",
};

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full — keep the app running */
  }
}

/* ------------------------------- bus -------------------------------- */

type BusTopic = "orders" | "inventory" | "chat";
type BusListener = (topic: BusTopic) => void;

const listeners = new Set<BusListener>();
let channel: BroadcastChannel | null = null;
try {
  channel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("scoopable-bus") : null;
} catch {
  channel = null;
}
if (channel) {
  channel.onmessage = (e: MessageEvent<BusTopic>) => {
    listeners.forEach((fn) => fn(e.data));
  };
}
// Fallback / extra sync for browsers without BroadcastChannel
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (!e.key) return;
    if (e.key === KEYS.orders) listeners.forEach((fn) => fn("orders"));
    if (e.key === KEYS.inventory) listeners.forEach((fn) => fn("inventory"));
    if (e.key === KEYS.chat) listeners.forEach((fn) => fn("chat"));
  });
}

const emit = (topic: BusTopic) => {
  listeners.forEach((fn) => fn(topic));
  try {
    channel?.postMessage(topic);
  } catch {
    /* noop */
  }
};

export function subscribe(fn: BusListener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/* ------------------------------- orders ----------------------------- */

export const getOrders = (): Order[] => read<Order[]>(KEYS.orders, []);

export function addOrder(order: Order) {
  const orders = [order, ...getOrders()];
  write(KEYS.orders, orders);
  emit("orders");
}

export function setOrderStatus(id: string, status: OrderStatus) {
  const orders = getOrders().map((o) => (o.id === id ? { ...o, status } : o));
  write(KEYS.orders, orders);
  emit("orders");
}

/* ----------------------------- inventory ---------------------------- */

export const getInventory = (): InventoryMap => read<InventoryMap>(KEYS.inventory, {});

export function saveInventory(map: InventoryMap) {
  write(KEYS.inventory, map);
  emit("inventory");
}

export function adjustStock(productId: string, delta: number) {
  const map = getInventory();
  const entry = map[productId] ?? { stock: 0, cost: 0 };
  map[productId] = { ...entry, stock: Math.max(0, entry.stock + delta) };
  saveInventory(map);
}

export function setCost(productId: string, cost: number) {
  const map = getInventory();
  const entry = map[productId] ?? { stock: 0, cost: 0 };
  map[productId] = { ...entry, cost: Math.max(0, cost) };
  saveInventory(map);
}

export function setStock(productId: string, stock: number) {
  const map = getInventory();
  const entry = map[productId] ?? { stock: 0, cost: 0 };
  map[productId] = { ...entry, stock: Math.max(0, stock) };
  saveInventory(map);
}

/* -------------------------------- chat ------------------------------ */

export const getChat = (): ChatMessage[] => read<ChatMessage[]>(KEYS.chat, []);

export function appendChat(msg: Omit<ChatMessage, "id" | "ts">) {
  const all = [...getChat(), { ...msg, id: uid("msg"), ts: Date.now() }];
  write(KEYS.chat, all);
  emit("chat");
}

/* --------------------------- demo seed data ------------------------- */
/*  Seeds 14 days of plausible order history on first run so the admin */
/*  analytics are alive out of the box. Delete the "sc_seeded_v1" key  */
/*  in localStorage to reseed. Real deployments can skip this block.   */

export function seedIfNeeded() {
  if (localStorage.getItem(KEYS.seeded)) return;

  // Inventory from catalog defaults
  const inv: InventoryMap = {};
  PRODUCTS.forEach((p) => {
    inv[p.id] = { stock: 18 + Math.floor(Math.random() * 30), cost: p.cost };
  });
  inv["choco-walnut"] = { ...inv["choco-walnut"], stock: 7 }; // demo low-stock alert
  write(KEYS.inventory, inv);

  // 14 days of orders
  const rand = mulberry32(20250420);
  const names = ["Mika", "Andrei", "Bea", "Jolo", "Kat", "Marco", "Tin", "Paolo", "Ria", "Sam", "Nadia", "Vince", "Cams", "Denise"];
  const weighted = ["choco-chip", "choco-chip", "choco-chip", "triple-choc", "triple-choc", "smores", "smores", "choco-walnut", "fudge-brownie", "fudge-brownie"];
  const orders: Order[] = [];
  const now = Date.now();

  for (let daysAgo = 13; daysAgo >= 0; daysAgo--) {
    const dayStart = now - daysAgo * 86_400_000;
    const isWeekend = [0, 6].includes(new Date(dayStart).getDay());
    const count = 1 + Math.floor(rand() * (isWeekend ? 5 : 3));
    for (let i = 0; i < count; i++) {
      const picks = new Set<string>();
      const lines = 1 + Math.floor(rand() * 2.4);
      for (let l = 0; l < lines; l++) picks.add(weighted[Math.floor(rand() * weighted.length)]);
      const items = [...picks].map((pid) => {
        const p = PRODUCTS.find((x) => x.id === pid)!;
        return { id: p.id, name: p.name, price: p.price, img: p.img, qty: 1 + Math.floor(rand() * 4) };
      });
      const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
      const delivery: DeliveryMethod = rand() < 0.62 ? "delivery" : "pickup";
      const payRoll = rand();
      const payment: PaymentMethod = payRoll < 0.45 ? "gcash" : payRoll < 0.7 ? "maya" : "cod";
      const deliveryFee = delivery === "delivery" ? BIZ.deliveryFee : 0;
      let status: OrderStatus = "completed";
      if (daysAgo <= 1) status = rand() < 0.5 ? "pending" : "confirmed";
      else if (daysAgo <= 3) status = rand() < 0.75 ? "completed" : "confirmed";
      if (daysAgo === 5 && i === 0) status = "rejected";
      orders.push({
        id: uid("ord"),
        number: orderNumber(),
        createdAt: dayStart - Math.floor(rand() * 10) * 3_600_000 - 3_600_000,
        customer: {
          name: names[Math.floor(rand() * names.length)],
          phone: "09" + String(Math.floor(100000000 + rand() * 899999999)),
          address: delivery === "delivery" ? `${Math.floor(rand() * 200) + 10} Sampaguita St, QC` : "",
          notes: rand() < 0.25 ? "Leave at the gate please" : "",
        },
        delivery,
        payment,
        items,
        subtotal,
        discount: 0,
        promoCode: null,
        deliveryFee,
        total: subtotal + deliveryFee,
        status,
        proof: null,
      });
    }
  }
  orders.sort((a, b) => b.createdAt - a.createdAt);
  write(KEYS.orders, orders);
  write(KEYS.chat, []);
  localStorage.setItem(KEYS.seeded, "1");
}
