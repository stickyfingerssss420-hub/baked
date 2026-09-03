# Scoopable Cookies — Setup & Deployment Guide

## 1. Project structure

```
index.html                     ← SEO + Open Graph tags (mascot preview image)
src/
  App.tsx                      ← router, loading screen, layout
  index.css                    ← Tailwind v4 theme tokens, keyframes, textures
  data/catalog.ts              ← products, prices, costs, promos, business info
  lib/
    backend.ts                 ← data layer (orders, inventory, chat) + realtime bus
    utils.ts                   ← peso formatting, ids, image compression
  context/ShopContext.tsx      ← 24h cart, toasts, live subscriptions, admin auth
  components/
    CookieMascot.tsx           ← "Crumb" — animated SVG mascot (OG image too)
    Header / Footer / CartDrawer / ProductCard / ChatWidget / Toasts / LegalModal / Reveal
  pages/
    Home.tsx                   ← hero, marquee, menu, how-it-works, visit band
    Checkout.tsx               ← details, delivery, payment + proof upload, success
    Admin.tsx                  ← secure login + dashboard shell
    admin/Analytics.tsx        ← Recharts sales trend, best sellers, stats
    admin/Orders.tsx           ← confirm / reject / complete, proof viewer
    admin/Inventory.tsx        ← stock, costing, margins, low-stock alerts
    admin/Chat.tsx             ← realtime customer conversations
SETUP.md                       ← this file
```

## 1b. Share it on social media

Once the site is live (step 4), sharing is automatic:

- **The link itself carries the preview.** Facebook, Messenger, WhatsApp, Instagram DMs, and X read the Open Graph tags in `index.html` — sharing your link shows the Crumb mascot banner, the shop title, and the description. No extra work per post.
- **Built-in share button.** The storefront header has a share icon: on phones it opens the native share sheet (Messenger, FB, IG Stories, WhatsApp, copy…), on desktop it copies the link and confirms with a toast.
- **Per-platform notes:**
  - *Instagram feed posts* don't allow links — put the URL in your bio, and use the Link sticker in Stories.
  - *Facebook page* — pin a post with the link; the preview renders automatically.
  - *First share can cache* — if a platform shows an old/wrong preview, force a re-scrape with Facebook's Sharing Debugger or X's Card Validator.
- **After deploying**, update `og:url` in `index.html` to your real domain (the placeholder is marked with a comment), and rebuild.

## 2. Run locally

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build → dist/
```

## 3. Moving from the local store to Supabase

The storefront currently runs on a **local-first realtime store** (`src/lib/backend.ts`):
every write persists to localStorage and broadcasts over a `BroadcastChannel` bus, so the
storefront cart, the chat widget, and the admin dashboard stay in sync across tabs with
zero configuration — perfect for demos and single-device deployments.

> **Ships factory-clean.** The app boots with **0 orders, ₱0 revenue, and an empty chat** — there is
> no demo data anywhere. Inventory starts at 24 scoops per flavor (`STARTER_BATCH` in
> `src/lib/backend.ts`) so the storefront is sellable on day one; set your real counts in
> Admin → Inventory after each bake. Storage keys are versioned (`_v2`), so any older demo data
> in a browser is ignored automatically.

To go multi-device with Supabase:

1. Create a free project at https://supabase.com and copy the **URL** and **anon key**.
2. Create tables:

```sql
create table orders (
  id text primary key,
  number text, created_at bigint,
  customer jsonb, delivery text, payment text,
  items jsonb, subtotal int, discount int, promo_code text,
  delivery_fee int, total int, status text, proof text
);
create table inventory ( product_id text primary key, stock int, cost int );
create table chat ( id text primary key, name text, role text, text text, ts bigint );
alter table orders enable row level security;
alter table inventory enable row level security;
alter table chat enable row level security;
-- policies: anon can select/insert; admin updates via a service-role edge function
```

3. For proof-of-payment screenshots, create a **Storage bucket** `proofs` and upload the
   compressed data-URL there instead of storing it inline (`supabase.storage.from('proofs').upload(...)`).
4. In `src/lib/backend.ts`, replace each function body with the matching Supabase call, e.g.

```ts
import { createClient } from "@supabase/supabase-js";
export const supa = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);

export async function getOrders() {
  const { data } = await supa.from("orders").select("*").order("created_at", { ascending: false });
  return data ?? [];
}
```

5. Replace the BroadcastChannel bus with realtime subscriptions:

```ts
supa.channel("orders").on("postgres_changes", { event: "*", schema: "public", table: "orders" },
  () => listeners.forEach((fn) => fn("orders"))).subscribe();
```

The public API of `backend.ts` stays identical, so **no UI code changes are needed**.

## 4. Deploy to Vercel (free)

1. Push this folder to a GitHub repo.
2. Go to https://vercel.com → **Add New → Project** → import the repo.
3. Vercel auto-detects Vite. Build command `npm run build`, output directory `dist`.
4. Add environment variables later if you wire Supabase: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
5. Hit **Deploy** — your site is live at `https://your-project.vercel.app` in ~2 minutes.
   (Netlify works the same way: same build command and `dist` publish directory.)

The Open Graph preview uses the mascot banner, so shares on Messenger / Facebook /
Instagram / X render the cookie character with the premium title automatically.

## 5. Zero-bug launch checklist

**Storefront**
- [ ] Hero mascot bobs, blinks; hover → sunglasses slide + smirk + wave
- [ ] All 5 products render with images; filters (All / Cookies / Brownies) work
- [ ] Add to cart → toast + header badge bounce; stock cap blocks over-adding
- [ ] Refresh the page → cart survives (24h TTL). Cart clears only after a successful order
- [ ] Checkout: name/phone validation, address required only for delivery
- [ ] Delivery = Local + subtotal < ₱250 → red warning, "Place order" disabled
- [ ] Promo `SCOOP10` applies 10%; invalid code shows error toast
- [ ] GCash shows **09943015214**, Maya shows **09155606788**, both require proof upload;
      COD shows "Pay on Delivery" with no upload
- [ ] Success screen shows order number, summary, confetti; cart is now empty

**Admin (login: stickyfinger420 / Star2005!!)**
- [ ] Wrong credentials → shake + error; correct → dashboard, session persists 12h
- [ ] Overview: 14-day sales area chart, revenue/orders/AOV/best-seller stats
- [ ] Orders: filter tabs, expand details, view proof screenshot lightbox,
      Confirm → Complete → Completed; Reject asks for confirmation
- [ ] Inventory: cost edit recalculates margin; stock <10 rows highlighted red;
      +10/+25 restock works; placing an order deducts stock live
- [ ] Live chat: open storefront in a second tab, send a message as a customer,
      reply from admin chat — both sides update in realtime

**Cross-browser / responsive**
- [ ] Chrome, Brave, Safari, iOS Safari, Android Chrome — layout, fonts, animations
- [ ] 360px phone → 1440px desktop: no horizontal scroll, drawer full-width on mobile
- [ ] `prefers-reduced-motion` respected (animations collapse gracefully)
