import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ADMIN_PASS, ADMIN_USER, BIZ, PROMOS, productById, type Product } from "../data/catalog";
import {
  addOrder,
  adjustStock,
  appendChat,
  getChat,
  getInventory,
  getOrders,
  initFreshInstall,
  setOrderStatus,
  subscribe,
  type ChatMessage,
  type DeliveryMethod,
  type InventoryMap,
  type Order,
  type OrderStatus,
  type PaymentMethod,
} from "../lib/backend";
import { orderNumber, uid } from "../lib/utils";

/* ------------------------------ types ------------------------------- */

export interface CartLine {
  id: string;
  qty: number;
}
interface CartState {
  lines: CartLine[];
  promo: string | null;
  updatedAt: number;
}
export interface DetailedLine {
  product: Product;
  qty: number;
}
export type ToastTone = "ok" | "warn" | "err";
export interface Toast {
  id: string;
  title: string;
  sub?: string;
  tone: ToastTone;
}
interface AdminSession {
  user: string;
  exp: number;
}

export interface CheckoutDetails {
  name: string;
  phone: string;
  address: string;
  notes: string;
  delivery: DeliveryMethod;
  payment: PaymentMethod;
  proof: string | null;
}

interface ShopCtx {
  /* cart */
  lines: DetailedLine[];
  count: number;
  subtotal: number;
  promo: string | null;
  discount: number;
  promoLabel: string | null;
  bumpKey: number;
  drawerOpen: boolean;
  setDrawerOpen: (v: boolean) => void;
  addToCart: (id: string, qty?: number) => boolean;
  setQty: (id: string, qty: number) => void;
  removeLine: (id: string) => void;
  applyPromo: (code: string) => boolean;
  removePromo: () => void;
  /* orders */
  placeOrder: (d: CheckoutDetails) => Order;
  orders: Order[];
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  /* inventory */
  inventory: InventoryMap;
  stockOf: (id: string) => number;
  /* chat */
  chat: ChatMessage[];
  sendChat: (msg: Omit<ChatMessage, "id" | "ts">) => void;
  /* admin */
  admin: AdminSession | null;
  login: (user: string, pass: string) => boolean;
  logout: () => void;
  /* toasts */
  toasts: Toast[];
  toast: (title: string, opts?: { sub?: string; tone?: ToastTone }) => void;
  dismissToast: (id: string) => void;
}

const Ctx = createContext<ShopCtx | null>(null);
const CART_KEY = "sc_cart_v1";
const SESSION_KEY = "sc_admin_session";

function loadCart(): CartState {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return { lines: [], promo: null, updatedAt: Date.now() };
    const parsed = JSON.parse(raw) as CartState;
    // 24-hour persistence: expire stale carts
    if (!parsed.updatedAt || Date.now() - parsed.updatedAt > BIZ.cartTtlMs) {
      localStorage.removeItem(CART_KEY);
      return { lines: [], promo: null, updatedAt: Date.now() };
    }
    // drop unknown products and clamp qty to available stock
    const inv = getInventory();
    const lines = (parsed.lines ?? [])
      .filter((l) => productById(l.id) && l.qty > 0)
      .map((l) => ({ ...l, qty: Math.min(l.qty, Math.max(1, inv[l.id]?.stock ?? 1)) }));
    return { lines, promo: parsed.promo ?? null, updatedAt: parsed.updatedAt };
  } catch {
    return { lines: [], promo: null, updatedAt: Date.now() };
  }
}

function loadSession(): AdminSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as AdminSession;
    if (!s.exp || s.exp < Date.now()) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return s;
  } catch {
    return null;
  }
}

export function ShopProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartState>(loadCart);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [bumpKey, setBumpKey] = useState(0);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [orders, setOrders] = useState<Order[]>(() => getOrders());
  const [inventory, setInventory] = useState<InventoryMap>(() => getInventory());
  const [chat, setChat] = useState<ChatMessage[]>(() => getChat());
  const [admin, setAdmin] = useState<AdminSession | null>(loadSession);
  const cartRef = useRef(cart);
  cartRef.current = cart;

  /* fresh-install init (zero data) + keep live state in sync across tabs */
  useEffect(() => {
    initFreshInstall();
    setOrders(getOrders());
    setInventory(getInventory());
    setChat(getChat());
    const unsub = subscribe((topic) => {
      if (topic === "orders") setOrders(getOrders());
      if (topic === "inventory") setInventory(getInventory());
      if (topic === "chat") setChat(getChat());
    });
    return unsub;
  }, []);

  /* persist cart (24h TTL refreshed on every change) */
  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify({ ...cart, updatedAt: Date.now() }));
    } catch {
      /* noop */
    }
  }, [cart]);

  /* ------------------------------ toasts ----------------------------- */
  const dismissToast = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const toast = useCallback(
    (title: string, opts?: { sub?: string; tone?: ToastTone }) => {
      const t: Toast = { id: uid("toast"), title, sub: opts?.sub, tone: opts?.tone ?? "ok" };
      setToasts((prev) => [...prev.slice(-2), t]);
      window.setTimeout(() => dismissToast(t.id), 3400);
    },
    [dismissToast],
  );

  /* ------------------------------- cart ------------------------------ */
  const stockOf = useCallback((id: string) => inventory[id]?.stock ?? 0, [inventory]);

  const addToCart = useCallback(
    (id: string, qty = 1): boolean => {
      const product = productById(id);
      if (!product) return false;
      const stock = inventory[id]?.stock ?? 0;
      const current = cartRef.current.lines.find((l) => l.id === id)?.qty ?? 0;
      if (stock <= 0) {
        toast(`${product.name} is sold out`, { sub: "Check back after the next bake", tone: "warn" });
        return false;
      }
      if (current + qty > stock) {
        toast(`Only ${stock} ${product.name} left`, { sub: "That's everything in today's batch", tone: "warn" });
        return false;
      }
      setCart((c) => {
        const existing = c.lines.find((l) => l.id === id);
        const lines = existing
          ? c.lines.map((l) => (l.id === id ? { ...l, qty: l.qty + qty } : l))
          : [...c.lines, { id, qty }];
        return { ...c, lines };
      });
      setBumpKey((k) => k + 1);
      toast(`${product.name} added to your tray`, { sub: qty > 1 ? `${qty} pieces` : undefined });
      return true;
    },
    [inventory, toast],
  );

  const setQty = useCallback(
    (id: string, qty: number) => {
      const stock = inventory[id]?.stock ?? 0;
      const clamped = Math.max(1, Math.min(qty, Math.max(1, stock)));
      setCart((c) => ({ ...c, lines: c.lines.map((l) => (l.id === id ? { ...l, qty: clamped } : l)) }));
    },
    [inventory],
  );

  const removeLine = useCallback((id: string) => {
    setCart((c) => ({ ...c, lines: c.lines.filter((l) => l.id !== id) }));
  }, []);

  const detailed = useMemo<DetailedLine[]>(
    () =>
      cart.lines
        .map((l) => {
          const product = productById(l.id);
          return product ? { product, qty: l.qty } : null;
        })
        .filter((x): x is DetailedLine => x !== null),
    [cart.lines],
  );

  const count = useMemo(() => detailed.reduce((s, l) => s + l.qty, 0), [detailed]);
  const subtotal = useMemo(() => detailed.reduce((s, l) => s + l.product.price * l.qty, 0), [detailed]);

  const promoDef = useMemo(() => PROMOS.find((p) => p.code === cart.promo) ?? null, [cart.promo]);
  const discount = useMemo(() => {
    if (!promoDef) return 0;
    if (promoDef.minSubtotal && subtotal < promoDef.minSubtotal) return 0;
    return promoDef.kind === "percent" ? Math.round((subtotal * promoDef.value) / 100) : promoDef.value;
  }, [promoDef, subtotal]);

  const applyPromo = useCallback(
    (code: string): boolean => {
      const clean = code.trim().toUpperCase();
      const def = PROMOS.find((p) => p.code === clean);
      if (!def) {
        toast("That code isn't in the jar", { sub: "Double-check the spelling and try again", tone: "err" });
        return false;
      }
      if (def.minSubtotal && subtotal < def.minSubtotal) {
        toast(`Needs a ₱${def.minSubtotal} subtotal`, { sub: `${def.code} unlocks at ₱${def.minSubtotal}`, tone: "warn" });
        return false;
      }
      setCart((c) => ({ ...c, promo: def.code }));
      toast(`Promo applied: ${def.code}`, { sub: def.label });
      return true;
    },
    [subtotal, toast],
  );

  const removePromo = useCallback(() => setCart((c) => ({ ...c, promo: null })), []);

  /* ------------------------------ orders ----------------------------- */
  const placeOrder = useCallback(
    (d: CheckoutDetails): Order => {
      const c = cartRef.current;
      const items = c.lines
        .map((l) => {
          const p = productById(l.id)!;
          return { id: p.id, name: p.name, price: p.price, img: p.img, qty: l.qty };
        })
        .filter(Boolean);
      const sub = items.reduce((s, it) => s + it.price * it.qty, 0);
      const def = PROMOS.find((p) => p.code === c.promo);
      let disc = 0;
      if (def && (!def.minSubtotal || sub >= def.minSubtotal)) {
        disc = def.kind === "percent" ? Math.round((sub * def.value) / 100) : def.value;
      }
      const fee = d.delivery === "delivery" ? BIZ.deliveryFee : 0;
      const order: Order = {
        id: uid("ord"),
        number: orderNumber(),
        createdAt: Date.now(),
        customer: { name: d.name.trim(), phone: d.phone.trim(), address: d.address.trim(), notes: d.notes.trim() },
        delivery: d.delivery,
        payment: d.payment,
        items,
        subtotal: sub,
        discount: disc,
        promoCode: disc > 0 ? def?.code ?? null : null,
        deliveryFee: fee,
        total: sub - disc + fee,
        status: "pending",
        proof: d.proof,
      };
      addOrder(order);
      items.forEach((it) => adjustStock(it.id, -it.qty));
      // Cart clears ONLY after a successful order
      setCart({ lines: [], promo: null, updatedAt: Date.now() });
      return order;
    },
    [],
  );

  const updateOrderStatus = useCallback((id: string, status: OrderStatus) => {
    setOrderStatus(id, status);
  }, []);

  /* -------------------------------- chat ----------------------------- */
  const sendChat = useCallback((msg: Omit<ChatMessage, "id" | "ts">) => {
    appendChat(msg);
  }, []);

  /* ------------------------------- admin ----------------------------- */
  const login = useCallback((user: string, pass: string): boolean => {
    if (user.trim() === ADMIN_USER && pass === ADMIN_PASS) {
      const s: AdminSession = { user: user.trim(), exp: Date.now() + 12 * 3_600_000 };
      localStorage.setItem(SESSION_KEY, JSON.stringify(s));
      setAdmin(s);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setAdmin(null);
  }, []);

  const value: ShopCtx = {
    lines: detailed,
    count,
    subtotal,
    promo: cart.promo,
    discount,
    promoLabel: promoDef ? promoDef.label : null,
    bumpKey,
    drawerOpen,
    setDrawerOpen,
    addToCart,
    setQty,
    removeLine,
    applyPromo,
    removePromo,
    placeOrder,
    orders,
    updateOrderStatus,
    inventory,
    stockOf,
    chat,
    sendChat,
    admin,
    login,
    logout,
    toasts,
    toast,
    dismissToast,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useShop() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useShop must be used inside ShopProvider");
  return ctx;
}
