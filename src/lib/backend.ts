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

import { PRODUCTS } from "../data/catalog";
import { uid } from "./utils";

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
  // v2 → clean slate; any v1 demo data left in a browser is ignored
  seeded: "sc_seeded_v2",
  orders: "sc_orders_v2",
  inventory: "sc_inventory_v2",
  chat: "sc_chat_v2",
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

/* --------------------------- fresh install -------------------------- */
/*  This shop ships CLEAN for a new owner:                             */
/*    • 0 orders · ₱0 revenue · empty chat · empty analytics           */
/*    • inventory starts at one fresh batch per flavor so the          */
/*      storefront works on day one — set real counts in the           */
/*      Inventory tab after each bake (orders auto-deduct stock).      */
/*  Storage keys are versioned ("_v2") so any older demo data in an    */
/*  existing browser is ignored automatically.                         */

export const STARTER_BATCH = 24; // scoops per flavor on day one — adjust in admin

export function initFreshInstall() {
  if (localStorage.getItem(KEYS.seeded)) return;

  const inv: InventoryMap = {};
  PRODUCTS.forEach((p) => {
    inv[p.id] = { stock: STARTER_BATCH, cost: p.cost };
  });
  write(KEYS.inventory, inv);
  write(KEYS.orders, []); // zero orders — every sale from here is real
  write(KEYS.chat, []); // empty inbox

  localStorage.setItem(KEYS.seeded, "1");
}
