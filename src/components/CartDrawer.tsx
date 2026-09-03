import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Minus, Plus, Trash2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CookieMascot from "./CookieMascot";
import { useShop } from "../context/ShopContext";
import { BIZ } from "../data/catalog";
import { peso, cx } from "../lib/utils";

export default function CartDrawer() {
  const { drawerOpen, setDrawerOpen, lines, count, subtotal, setQty, removeLine, stockOf } = useShop();
  const navigate = useNavigate();

  const goCheckout = () => {
    setDrawerOpen(false);
    navigate("/checkout");
    window.scrollTo({ top: 0 });
  };

  return (
    <AnimatePresence>
      {drawerOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-espresso-950/55 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDrawerOpen(false)}
          />
          <motion.aside
            className="fixed top-0 right-0 z-50 h-full w-full max-w-[420px] bg-cream-50 shadow-lift flex flex-col"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            role="dialog"
            aria-label="Shopping cart"
          >
            {/* header */}
            <div className="flex items-center justify-between px-5 h-[68px] border-b border-cocoa-500/12 shrink-0">
              <div className="flex items-center gap-2.5">
                <h2 className="font-display font-semibold text-[22px] text-espresso-900">Your Tray</h2>
                <span className="px-2 py-0.5 rounded-full bg-gold-400/25 text-gold-700 text-[12px] font-extrabold">{count}</span>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-9 h-9 grid place-items-center rounded-full bg-cream-200 hover:bg-cream-300 text-cocoa-600 transition-colors"
                aria-label="Close cart"
              >
                <X size={17} />
              </button>
            </div>

            {/* items */}
            <div className="flex-1 overflow-y-auto thin-scroll px-5 py-4">
              {lines.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center gap-3 py-10">
                  <CookieMascot size={130} />
                  <p className="font-display font-semibold text-[20px] text-espresso-900">Your tray is empty</p>
                  <p className="text-[13.5px] text-cocoa-600 max-w-[240px]">
                    Crumb is waiting patiently. Scoop up a cookie or two and come back.
                  </p>
                  <button
                    onClick={() => {
                      setDrawerOpen(false);
                      navigate("/");
                      window.setTimeout(() => document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" }), 120);
                    }}
                    className="mt-2 px-5 py-2.5 rounded-full bg-espresso-900 text-cream-50 text-[13.5px] font-bold hover:bg-espresso-800 transition-colors"
                  >
                    Browse the menu
                  </button>
                </div>
              ) : (
                <ul className="space-y-4">
                  <AnimatePresence initial={false}>
                    {lines.map(({ product, qty }) => (
                      <motion.li
                        key={product.id}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 40, transition: { duration: 0.22 } }}
                        className="flex gap-3.5 rounded-xl border border-cocoa-500/10 bg-cream-100/60 p-3"
                      >
                        {/* same image source as the menu card */}
                        <img src={product.img} alt={product.name} className="w-[72px] h-[72px] rounded-lg object-cover shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-display font-semibold text-[15.5px] text-espresso-900 leading-tight">{product.name}</p>
                              <p className="text-[12px] text-cocoa-500 mt-0.5">{peso(product.price)} each</p>
                            </div>
                            <button
                              onClick={() => removeLine(product.id)}
                              className="text-cocoa-400 hover:text-danger-500 transition-colors p-1 -m-1"
                              aria-label={`Remove ${product.name}`}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                          <div className="mt-2 flex items-center justify-between">
                            <div className="flex items-center gap-1 rounded-full border border-cocoa-500/20 bg-cream-50 p-0.5">
                              <button
                                onClick={() => setQty(product.id, qty - 1)}
                                disabled={qty <= 1}
                                className="w-7 h-7 grid place-items-center rounded-full hover:bg-cream-200 disabled:opacity-30 transition-colors"
                                aria-label="Decrease quantity"
                              >
                                <Minus size={13} strokeWidth={2.6} />
                              </button>
                              <span className="w-7 text-center text-[14px] font-extrabold text-espresso-900">{qty}</span>
                              <button
                                onClick={() => setQty(product.id, qty + 1)}
                                disabled={qty >= stockOf(product.id)}
                                className="w-7 h-7 grid place-items-center rounded-full hover:bg-cream-200 disabled:opacity-30 transition-colors"
                                aria-label="Increase quantity"
                              >
                                <Plus size={13} strokeWidth={2.6} />
                              </button>
                            </div>
                            <p className="font-display font-semibold text-[16px] text-espresso-900">{peso(product.price * qty)}</p>
                          </div>
                          {qty >= stockOf(product.id) && (
                            <p className="mt-1.5 text-[11px] font-bold text-danger-500">Max available in today's batch</p>
                          )}
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {/* footer */}
            {lines.length > 0 && (
              <div className="shrink-0 border-t border-cocoa-500/12 px-5 py-4 safe-b bg-cream-100/70">
                <div className="flex items-center justify-between text-[14px] text-cocoa-600">
                  <span>Subtotal</span>
                  <span className="font-display font-semibold text-[22px] text-espresso-900">{peso(subtotal)}</span>
                </div>
                <p className="mt-1 text-[12px] text-cocoa-500">
                  {subtotal >= BIZ.minDelivery
                    ? "You've unlocked local delivery (flat ₱50)."
                    : `Add ${peso(BIZ.minDelivery - subtotal)} more to unlock local delivery — pickup is always free.`}
                </p>
                <button
                  onClick={goCheckout}
                  className="btn-sheen mt-3.5 w-full flex items-center justify-center gap-2 py-3.5 rounded-full bg-espresso-900 hover:bg-espresso-800 text-cream-50 font-bold text-[15px] transition-all active:scale-[0.98] hover:shadow-lift"
                >
                  Go to checkout
                  <ArrowRight size={17} strokeWidth={2.4} />
                </button>
                <p className="mt-2.5 text-center text-[11.5px] text-cocoa-500 flex items-center justify-center gap-1.5">
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 2" />
                  </svg>
                  Your tray is saved for 24 hours — it survives refreshes.
                </p>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
