import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  Check,
  CheckCircle2,
  ImagePlus,
  Loader2,
  Store,
  Tag,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import CookieMascot from "../components/CookieMascot";
import { useShop, type CheckoutDetails } from "../context/ShopContext";
import { BIZ } from "../data/catalog";
import type { DeliveryMethod, Order, PaymentMethod } from "../lib/backend";
import { compressImage, cx, peso } from "../lib/utils";

const inputCls =
  "w-full px-4 py-3 rounded-xl border border-cocoa-500/25 bg-cream-50 text-[14.5px] text-espresso-900 placeholder:text-cocoa-400 focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-400/30 transition-shadow";
const labelCls = "block text-[12px] font-extrabold tracking-[0.12em] uppercase text-cocoa-500 mb-1.5";
const errCls = "mt-1.5 text-[12.5px] font-semibold text-danger-500";

/* simple brand marks for the payment methods */
const PayMark = ({ kind }: { kind: PaymentMethod }) => {
  if (kind === "gcash")
    return (
      <span className="w-9 h-9 grid place-items-center rounded-full bg-[#0050DC] text-white font-extrabold text-[15px]">G</span>
    );
  if (kind === "maya")
    return (
      <span className="w-9 h-9 grid place-items-center rounded-full bg-[#37B34A] text-white font-extrabold text-[15px]">M</span>
    );
  return (
    <span className="w-9 h-9 grid place-items-center rounded-full bg-gold-400 text-espresso-900">
      <Banknote size={17} strokeWidth={2.2} />
    </span>
  );
};

export default function Checkout() {
  const { lines, subtotal, discount, promo, promoLabel, applyPromo, removePromo, placeOrder, toast, stockOf } = useShop();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [delivery, setDelivery] = useState<DeliveryMethod>("pickup");
  const [payment, setPayment] = useState<PaymentMethod>("gcash");
  const [proof, setProof] = useState<string | null>(null);
  const [proofBusy, setProofBusy] = useState(false);
  const [promoInput, setPromoInput] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState<Order | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const fee = delivery === "delivery" ? BIZ.deliveryFee : 0;
  const total = subtotal - discount + fee;
  const belowMin = delivery === "delivery" && subtotal < BIZ.minDelivery;

  const linesValid = useMemo(() => lines.every((l) => l.qty <= stockOf(l.product.id)), [lines, stockOf]);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast("That file isn't an image", { sub: "Please upload a screenshot (JPG or PNG)", tone: "err" });
      return;
    }
    setProofBusy(true);
    try {
      const dataUrl = await compressImage(file);
      setProof(dataUrl);
      toast("Proof of payment attached");
    } catch {
      toast("Couldn't read that image", { sub: "Try a different screenshot", tone: "err" });
    } finally {
      setProofBusy(false);
    }
  };

  const submit = () => {
    const errs: Record<string, string> = {};
    if (name.trim().length < 2) errs.name = "Please tell us your name";
    if (phone.replace(/\D/g, "").length < 7) errs.phone = "Enter a valid phone number";
    if (delivery === "delivery" && address.trim().length < 6) errs.address = "We need a complete delivery address";
    if ((payment === "gcash" || payment === "maya") && !proof) errs.proof = "Please upload your proof of payment screenshot";
    if (belowMin) errs.delivery = `Local delivery needs at least ${peso(BIZ.minDelivery)} worth of goodies`;
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast("Almost there", { sub: "Check the highlighted fields below", tone: "warn" });
      return;
    }

    setProcessing(true);
    const details: CheckoutDetails = { name, phone, address, notes, delivery, payment, proof };
    // small delay so the "baking" moment is felt, then finalize
    window.setTimeout(() => {
      const order = placeOrder(details);
      setProcessing(false);
      setDone(order);
      window.scrollTo({ top: 0, behavior: "smooth" });
      confetti({ particleCount: 130, spread: 75, origin: { y: 0.65 }, colors: ["#C0913F", "#D4A85C", "#8F6238", "#FCF9F1"] });
    }, 1500);
  };

  /* ------------------------- success state ------------------------- */
  if (done) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-16">
        <motion.div initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
          <div className="text-center">
            <motion.div
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 14, stiffness: 220, delay: 0.15 }}
              className="inline-grid place-items-center w-20 h-20 rounded-full bg-leaf-500/15 text-leaf-600"
            >
              <CheckCircle2 size={44} strokeWidth={1.8} />
            </motion.div>
            <h1 className="mt-5 font-display font-semibold text-espresso-900 text-[clamp(2rem,5vw,3rem)] leading-tight">
              Order's in the oven!
            </h1>
            <p className="mt-2 text-[15px] text-cocoa-600">
              Your order number is{" "}
              <span className="font-extrabold text-espresso-900 bg-gold-400/25 px-2.5 py-0.5 rounded-full">{done.number}</span> — we've
              texted a copy to <strong>{done.customer.phone}</strong>.
            </p>
          </div>

          <div className="mt-8 rounded-2xl border border-cocoa-500/12 bg-cream-50 shadow-soft overflow-hidden">
            <div className="px-6 py-4 bg-espresso-900 text-cream-50 flex items-center justify-between">
              <p className="font-display font-semibold text-[18px]">Order summary</p>
              <p className="text-[12px] font-bold text-gold-300 uppercase tracking-widest">
                {done.delivery === "pickup" ? "Store pickup" : "Local delivery"}
              </p>
            </div>
            <ul className="px-6 py-4 space-y-3">
              {done.items.map((it) => (
                <li key={it.id} className="flex items-center gap-3">
                  <img src={it.img} alt={it.name} className="w-12 h-12 rounded-lg object-cover" />
                  <span className="flex-1 text-[14px] font-semibold text-espresso-900">
                    {it.name} <span className="text-cocoa-500 font-medium">× {it.qty}</span>
                  </span>
                  <span className="font-display font-semibold text-[15px] text-espresso-900">{peso(it.price * it.qty)}</span>
                </li>
              ))}
            </ul>
            <div className="px-6 pb-5 space-y-1.5 text-[13.5px] text-cocoa-600 border-t border-cocoa-500/10 pt-4">
              <p className="flex justify-between"><span>Subtotal</span><span>{peso(done.subtotal)}</span></p>
              {done.discount > 0 && (
                <p className="flex justify-between text-leaf-600 font-semibold">
                  <span>Promo {done.promoCode}</span><span>− {peso(done.discount)}</span>
                </p>
              )}
              <p className="flex justify-between">
                <span>{done.delivery === "pickup" ? "Store pickup (free)" : "Local delivery"}</span>
                <span>{done.deliveryFee === 0 ? "Free" : peso(done.deliveryFee)}</span>
              </p>
              <p className="flex justify-between items-baseline pt-1.5 border-t border-dashed border-cocoa-500/25 mt-2">
                <span className="font-bold text-espresso-900">Total</span>
                <span className="font-display font-semibold text-[24px] text-espresso-900">{peso(done.total)}</span>
              </p>
            </div>
          </div>

          {done.payment !== "cod" ? (
            <div className="mt-5 rounded-2xl border border-gold-500/35 bg-gold-400/10 p-5 text-[14px] text-cocoa-700 leading-relaxed">
              <p className="font-extrabold text-espresso-900 flex items-center gap-2">
                <Check size={16} className="text-gold-600" /> Waiting for payment confirmation
              </p>
              <p className="mt-1.5">
                We've received your {done.payment === "gcash" ? "GCash" : "Maya"} screenshot. Once the baker verifies it (usually within
                the hour), your order moves to the bake queue and you'll get a text.
              </p>
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-leaf-500/35 bg-leaf-500/10 p-5 text-[14px] text-cocoa-700 leading-relaxed">
              <p className="font-extrabold text-espresso-900">Pay on delivery</p>
              <p className="mt-1.5">Prepare {peso(done.total)} in cash — exact change makes Crumb very happy.</p>
            </div>
          )}

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              to="/"
              className="btn-sheen inline-flex items-center gap-2 px-6 py-3 rounded-full bg-espresso-900 text-cream-50 font-bold text-[14px] hover:bg-espresso-800 transition-all"
            >
              Back to the cookies
              <ArrowRight size={16} strokeWidth={2.4} />
            </Link>
          </div>
        </motion.div>
      </main>
    );
  }

  /* -------------------------- empty state -------------------------- */
  if (lines.length === 0) {
    return (
      <main className="max-w-xl mx-auto px-4 py-24 text-center">
        <CookieMascot size={160} className="mx-auto" />
        <h1 className="mt-6 font-display font-semibold text-espresso-900 text-[clamp(1.9rem,5vw,2.6rem)]">Nothing to check out yet</h1>
        <p className="mt-2 text-[15px] text-cocoa-600">Your tray is empty. Scoop up a few cookies first, then come back.</p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-espresso-900 text-cream-50 font-bold text-[14px] hover:bg-espresso-800 transition-all"
        >
          <ArrowLeft size={16} />
          Back to the menu
        </Link>
      </main>
    );
  }

  /* --------------------------- main form --------------------------- */
  return (
    <main className="relative max-w-6xl mx-auto px-4 py-10 lg:py-14">
      <div className="absolute inset-0 grain pointer-events-none" aria-hidden />

      {/* processing overlay */}
      <AnimatePresence>
        {processing && (
          <motion.div
            className="fixed inset-0 z-[75] bg-espresso-950/85 backdrop-blur-sm grid place-items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="text-center">
              <CookieMascot size={150} className="mx-auto" />
              <p className="mt-4 font-display font-semibold text-cream-50 text-[22px]">Sending your order to the oven…</p>
              <p className="mt-1 text-[13.5px] text-cream-200/70">Crumb is sealing the bag with a sticker.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Link to="/" className="inline-flex items-center gap-2 text-[13.5px] font-bold text-cocoa-500 hover:text-espresso-900 transition-colors">
        <ArrowLeft size={16} />
        Keep shopping
      </Link>
      <h1 className="mt-3 font-display font-semibold text-espresso-900 text-[clamp(2rem,5vw,3rem)] tracking-tight leading-tight">
        Almost <em className="italic text-gold-600">yours.</em>
      </h1>

      <div className="mt-8 grid lg:grid-cols-[1fr_400px] gap-8 items-start">
        {/* --------------------------- form --------------------------- */}
        <div className="space-y-6">
          {/* 1 — details */}
          <section className="rounded-2xl border border-cocoa-500/12 bg-cream-50 p-6 shadow-soft">
            <h2 className="flex items-center gap-3 font-display font-semibold text-[20px] text-espresso-900">
              <span className="w-7 h-7 grid place-items-center rounded-full bg-espresso-900 text-gold-300 text-[13px] font-body font-extrabold">1</span>
              Your details
            </h2>
            <div className="mt-5 grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="co-name" className={labelCls}>Full name</label>
                <input id="co-name" className={cx(inputCls, errors.name && "border-danger-500")} value={name} onChange={(e) => setName(e.target.value)} placeholder="Juan dela Cruz" />
                {errors.name && <p className={errCls}>{errors.name}</p>}
              </div>
              <div>
                <label htmlFor="co-phone" className={labelCls}>Phone number</label>
                <input id="co-phone" className={cx(inputCls, errors.phone && "border-danger-500")} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0917 000 0000" inputMode="tel" />
                {errors.phone && <p className={errCls}>{errors.phone}</p>}
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="co-address" className={labelCls}>
                  {delivery === "delivery" ? "Delivery address" : "Address (optional for pickup)"}
                </label>
                <input
                  id="co-address"
                  className={cx(inputCls, errors.address && "border-danger-500")}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House / street / barangay / city"
                />
                {errors.address && <p className={errCls}>{errors.address}</p>}
              </div>
            </div>
          </section>

          {/* 2 — delivery */}
          <section className="rounded-2xl border border-cocoa-500/12 bg-cream-50 p-6 shadow-soft">
            <h2 className="flex items-center gap-3 font-display font-semibold text-[20px] text-espresso-900">
              <span className="w-7 h-7 grid place-items-center rounded-full bg-espresso-900 text-gold-300 text-[13px] font-body font-extrabold">2</span>
              Delivery method
            </h2>
            <div className="mt-5 grid sm:grid-cols-2 gap-4">
              {(
                [
                  { id: "pickup", title: "Store Pickup", sub: `Free · ${BIZ.address}`, price: "Free", icon: <Store size={19} /> },
                  { id: "delivery", title: "Local Delivery", sub: `Flat rate · min order ${peso(BIZ.minDelivery)}`, price: peso(BIZ.deliveryFee), icon: <Truck size={19} /> },
                ] as { id: DeliveryMethod; title: string; sub: string; price: string; icon: React.ReactNode }[]
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setDelivery(opt.id)}
                  className={cx(
                    "relative text-left rounded-xl border-2 p-4 transition-all",
                    delivery === opt.id ? "border-gold-500 bg-gold-400/10 shadow-soft" : "border-cocoa-500/15 bg-cream-100/50 hover:border-cocoa-500/40",
                  )}
                  aria-pressed={delivery === opt.id}
                >
                  <span className={cx("flex items-center justify-between", delivery === opt.id ? "text-gold-700" : "text-cocoa-500")}>{opt.icon}
                    <span
                      className={cx(
                        "w-5 h-5 grid place-items-center rounded-full border-2 transition-colors",
                        delivery === opt.id ? "border-gold-500 bg-gold-500 text-espresso-900" : "border-cocoa-500/30",
                      )}
                    >
                      {delivery === opt.id && <Check size={12} strokeWidth={3.2} />}
                    </span>
                  </span>
                  <p className="mt-2.5 font-display font-semibold text-[17px] text-espresso-900">{opt.title}</p>
                  <p className="text-[12.5px] text-cocoa-500 mt-0.5">{opt.sub}</p>
                  <p className="mt-1.5 text-[14px] font-extrabold text-gold-700">{opt.price}</p>
                </button>
              ))}
            </div>

            {belowMin && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 flex items-start gap-3 rounded-xl border border-danger-500/35 bg-danger-500/8 p-4">
                <svg viewBox="0 0 24 24" width="19" height="19" className="text-danger-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M12 3l10 17H2zM12 10v4m0 3h.01" />
                </svg>
                <div className="text-[13.5px] leading-relaxed text-cocoa-700">
                  <p className="font-extrabold text-danger-600">Local delivery needs a {peso(BIZ.minDelivery)} minimum</p>
                  <p className="mt-0.5">
                    You're {peso(BIZ.minDelivery - subtotal)} short.{" "}
                    <Link to="/" className="font-bold text-espresso-900 underline decoration-gold-500 underline-offset-2">
                      Add one more cookie
                    </Link>{" "}
                    or switch to free store pickup.
                  </p>
                </div>
              </motion.div>
            )}

            <div className="mt-5">
              <label htmlFor="co-notes" className={labelCls}>Delivery notes (optional)</label>
              <textarea
                id="co-notes"
                rows={3}
                className={cx(inputCls, "resize-none")}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={`e.g. "Leave at the gate", "Ring twice", "It's a birthday"`}
              />
            </div>
          </section>

          {/* 3 — payment */}
          <section className="rounded-2xl border border-cocoa-500/12 bg-cream-50 p-6 shadow-soft">
            <h2 className="flex items-center gap-3 font-display font-semibold text-[20px] text-espresso-900">
              <span className="w-7 h-7 grid place-items-center rounded-full bg-espresso-900 text-gold-300 text-[13px] font-body font-extrabold">3</span>
              Payment method
            </h2>
            <div className="mt-5 grid sm:grid-cols-3 gap-3">
              {(
                [
                  { id: "gcash", title: "GCash", sub: "Send & upload proof" },
                  { id: "maya", title: "Maya", sub: "Send & upload proof" },
                  { id: "cod", title: "Cash on Delivery", sub: "Pay when it arrives" },
                ] as { id: PaymentMethod; title: string; sub: string }[]
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPayment(opt.id)}
                  className={cx(
                    "relative text-left rounded-xl border-2 p-4 transition-all",
                    payment === opt.id ? "border-gold-500 bg-gold-400/10 shadow-soft" : "border-cocoa-500/15 bg-cream-100/50 hover:border-cocoa-500/40",
                  )}
                  aria-pressed={payment === opt.id}
                >
                  <span className="flex items-center gap-2.5">
                    <PayMark kind={opt.id} />
                    <span>
                      <span className="block font-display font-semibold text-[16px] text-espresso-900 leading-tight">{opt.title}</span>
                      <span className="block text-[11.5px] text-cocoa-500 mt-0.5">{opt.sub}</span>
                    </span>
                  </span>
                  <span
                    className={cx(
                      "absolute top-3 right-3 w-5 h-5 grid place-items-center rounded-full border-2 transition-colors",
                      payment === opt.id ? "border-gold-500 bg-gold-500 text-espresso-900" : "border-cocoa-500/30",
                    )}
                  >
                    {payment === opt.id && <Check size={12} strokeWidth={3.2} />}
                  </span>
                </button>
              ))}
            </div>

            {/* payment details + proof upload */}
            <AnimatePresence mode="wait">
              {payment !== "cod" && (
                <motion.div
                  key={payment}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 rounded-xl border border-cocoa-500/15 bg-cream-100/60 p-4">
                    <p className="text-[14px] text-cocoa-700">
                      Send payment to <strong className="text-espresso-900">{payment === "gcash" ? "GCash" : "Maya"}:</strong>{" "}
                      <span className="font-extrabold text-espresso-900 bg-gold-400/25 px-2 py-0.5 rounded-md tracking-wide">
                        {payment === "gcash" ? BIZ.gcash : BIZ.maya}
                      </span>
                    </p>
                    <p className="mt-1 text-[12.5px] text-cocoa-500">
                      Name on account: <strong className="text-cocoa-600">Scoopable Cookies</strong> · amount: <strong className="text-cocoa-600">{peso(total)}</strong>
                    </p>

                    <div className="mt-3.5">
                      <p className={labelCls}>Upload Proof of Payment Screenshot</p>
                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFile(e.target.files?.[0])}
                      />
                      {!proof ? (
                        <button
                          type="button"
                          onClick={() => fileRef.current?.click()}
                          disabled={proofBusy}
                          className={cx(
                            "w-full flex flex-col items-center justify-center gap-1.5 py-6 rounded-xl border-2 border-dashed transition-all",
                            errors.proof ? "border-danger-500 bg-danger-500/5" : "border-cocoa-500/30 hover:border-gold-500 hover:bg-gold-400/5",
                          )}
                        >
                          {proofBusy ? (
                            <Loader2 size={22} className="animate-spin text-cocoa-500" />
                          ) : (
                            <ImagePlus size={22} className="text-cocoa-500" />
                          )}
                          <span className="text-[13px] font-bold text-cocoa-600">
                            {proofBusy ? "Compressing…" : "Tap to upload your screenshot"}
                          </span>
                          <span className="text-[11.5px] text-cocoa-400">JPG or PNG · we compress it for you</span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-3 rounded-xl border border-leaf-500/35 bg-leaf-500/8 p-2.5">
                          <img src={proof} alt="Proof of payment" className="w-16 h-16 rounded-lg object-cover border border-cocoa-500/15" />
                          <div className="flex-1">
                            <p className="text-[13px] font-extrabold text-leaf-600 flex items-center gap-1.5">
                              <Check size={14} strokeWidth={3} /> Proof attached
                            </p>
                            <p className="text-[11.5px] text-cocoa-500 mt-0.5">The baker will verify it before confirming your order.</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setProof(null);
                              if (fileRef.current) fileRef.current.value = "";
                            }}
                            className="p-2 rounded-full hover:bg-cream-200 text-cocoa-500 hover:text-danger-500 transition-colors"
                            aria-label="Remove proof"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                      {errors.proof && <p className={errCls}>{errors.proof}</p>}
                    </div>
                  </div>
                </motion.div>
              )}
              {payment === "cod" && (
                <motion.div key="cod" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                  <div className="mt-4 rounded-xl border border-leaf-500/35 bg-leaf-500/8 p-4">
                    <p className="text-[14px] font-extrabold text-espresso-900">Pay on Delivery</p>
                    <p className="mt-1 text-[12.5px] text-cocoa-600 leading-relaxed">
                      No payment details needed — hand {peso(total)} to the rider or at the counter. Exact change is appreciated.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>

        {/* -------------------------- summary -------------------------- */}
        <aside className="lg:sticky lg:top-28 rounded-2xl border border-cocoa-500/12 bg-cream-50 shadow-soft overflow-hidden">
          <div className="px-6 py-4 bg-espresso-900 text-cream-50">
            <p className="font-display font-semibold text-[19px]">Order summary</p>
            <p className="text-[11.5px] text-cream-200/60 mt-0.5">Same images as the menu — no bait and switch.</p>
          </div>

          <ul className="px-6 py-4 space-y-3 max-h-64 overflow-y-auto thin-scroll">
            {lines.map(({ product, qty }) => (
              <li key={product.id} className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <img src={product.img} alt={product.name} className="w-14 h-14 rounded-lg object-cover" />
                  <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-[20px] px-1 grid place-items-center rounded-full bg-espresso-900 text-cream-50 text-[10.5px] font-extrabold">
                    {qty}
                  </span>
                </div>
                <span className="flex-1 text-[13.5px] font-semibold text-espresso-900 leading-tight">{product.name}</span>
                <span className="font-display font-semibold text-[14.5px] text-espresso-900">{peso(product.price * qty)}</span>
              </li>
            ))}
          </ul>

          {/* promo */}
          <div className="px-6 pb-4">
            {promo ? (
              <div className="flex items-center justify-between rounded-xl border border-leaf-500/35 bg-leaf-500/10 px-3.5 py-2.5">
                <p className="text-[12.5px] font-extrabold text-leaf-600 flex items-center gap-1.5">
                  <Tag size={13} /> {promo} · {promoLabel}
                </p>
                <button onClick={removePromo} className="text-cocoa-400 hover:text-danger-500 transition-colors" aria-label="Remove promo">
                  <X size={15} />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && applyPromo(promoInput)) setPromoInput("");
                  }}
                  placeholder="Promo code"
                  className="flex-1 px-3.5 py-2.5 rounded-full border border-cocoa-500/25 bg-cream-100 text-[13px] font-semibold tracking-wide focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-400/30 uppercase"
                />
                <button
                  onClick={() => {
                    if (applyPromo(promoInput)) setPromoInput("");
                  }}
                  className="px-4 py-2.5 rounded-full bg-espresso-900 text-cream-50 text-[13px] font-bold hover:bg-espresso-800 transition-colors active:scale-95"
                >
                  Apply
                </button>
              </div>
            )}
          </div>

          <div className="px-6 pb-6 space-y-1.5 text-[13.5px] text-cocoa-600 border-t border-dashed border-cocoa-500/25 pt-4">
            <p className="flex justify-between"><span>Subtotal</span><span className="font-semibold">{peso(subtotal)}</span></p>
            {discount > 0 && (
              <p className="flex justify-between text-leaf-600 font-bold"><span>Discount</span><span>− {peso(discount)}</span></p>
            )}
            <p className="flex justify-between">
              <span>{delivery === "pickup" ? "Store pickup" : "Local delivery"}</span>
              <span className="font-semibold">{fee === 0 ? "Free" : peso(fee)}</span>
            </p>
            <p className="flex justify-between items-baseline pt-2 border-t border-cocoa-500/15 mt-2">
              <span className="font-extrabold text-espresso-900 text-[14px]">Total</span>
              <span className="font-display font-semibold text-[28px] text-espresso-900">{peso(total)}</span>
            </p>

            {!linesValid && (
              <p className="pt-2 text-[12.5px] font-bold text-danger-500">
                Stock changed since you added items — please review your tray.
              </p>
            )}

            <button
              onClick={submit}
              disabled={belowMin || !linesValid}
              className={cx(
                "btn-sheen mt-4 w-full flex items-center justify-center gap-2 py-4 rounded-full font-bold text-[15px] transition-all",
                belowMin || !linesValid
                  ? "bg-cream-200 text-cocoa-400 cursor-not-allowed"
                  : "bg-espresso-900 text-cream-50 hover:bg-espresso-800 active:scale-[0.98] hover:shadow-lift",
              )}
            >
              Place order · {peso(total)}
              <ArrowRight size={17} strokeWidth={2.4} />
            </button>
            <p className="pt-2 text-center text-[11.5px] text-cocoa-500 leading-relaxed">
              By ordering you agree to our small-batch terms. Your tray clears only after the order goes through.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
