import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Banknote,
  Check,
  ChevronDown,
  Clock,
  Image as ImageIcon,
  MapPin,
  Phone,
  Store,
  Truck,
  X,
  XCircle,
} from "lucide-react";
import CookieMascot from "../../components/CookieMascot";
import { useShop } from "../../context/ShopContext";
import { BIZ } from "../../data/catalog";
import type { Order, OrderStatus } from "../../lib/backend";
import { cx, dateTime, peso, timeAgo } from "../../lib/utils";

const STATUS_META: Record<OrderStatus, { label: string; cls: string }> = {
  pending: { label: "Pending payment", cls: "bg-gold-400/15 text-gold-300 border-gold-500/40" },
  confirmed: { label: "Confirmed", cls: "bg-leaf-500/15 text-leaf-400 border-leaf-500/40" },
  completed: { label: "Completed", cls: "bg-cream-200/10 text-cream-200/75 border-cream-200/25" },
  rejected: { label: "Rejected", cls: "bg-danger-500/15 text-danger-400 border-danger-500/40" },
};

const FILTERS: (OrderStatus | "all")[] = ["all", "pending", "confirmed", "completed", "rejected"];

const PayLabel = ({ o }: { o: Order }) => (
  <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-cream-200/75">
    {o.payment === "gcash" && <span className="w-4 h-4 grid place-items-center rounded-full bg-[#0050DC] text-white text-[9px] font-extrabold">G</span>}
    {o.payment === "maya" && <span className="w-4 h-4 grid place-items-center rounded-full bg-[#37B34A] text-white text-[9px] font-extrabold">M</span>}
    {o.payment === "cod" && <Banknote size={13} className="text-gold-400" />}
    {o.payment === "gcash" ? "GCash" : o.payment === "maya" ? "Maya" : "COD"}
  </span>
);

export default function Orders() {
  const { orders, updateOrderStatus, toast } = useShop();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const [openId, setOpenId] = useState<string | null>(orders[0]?.id ?? null);
  const [confirmReject, setConfirmReject] = useState<string | null>(null);
  const [proofView, setProofView] = useState<Order | null>(null);

  const filtered = useMemo(() => (filter === "all" ? orders : orders.filter((o) => o.status === filter)), [orders, filter]);
  const countOf = (s: (typeof FILTERS)[number]) => (s === "all" ? orders.length : orders.filter((o) => o.status === s).length);

  const act = (o: Order, status: OrderStatus, msg: string) => {
    updateOrderStatus(o.id, status);
    toast(msg, { sub: `${o.number} · ${o.customer.name}` });
    setConfirmReject(null);
  };

  return (
    <div>
      {/* filters */}
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cx(
              "px-3.5 py-1.5 rounded-full text-[12.5px] font-bold capitalize transition-all border",
              filter === f ? "bg-gold-400 text-espresso-900 border-gold-400" : "border-cream-200/15 text-cream-200/65 hover:text-cream-50 hover:border-cream-200/35",
            )}
          >
            {f} <span className="opacity-70">({countOf(f)})</span>
          </button>
        ))}
      </div>

      {/* list */}
      <div className="mt-5 space-y-3">
        {filtered.length === 0 && (
          <div className="rounded-xl border border-cream-200/10 bg-espresso-900/70 py-14 text-center">
            <CookieMascot size={110} className="mx-auto opacity-90" />
            <p className="mt-3 font-display font-semibold text-[19px] text-cream-50">No orders here</p>
            <p className="text-[13px] text-cream-200/55 mt-1">This tray is spotless. New orders land in real time.</p>
          </div>
        )}

        {filtered.map((o) => {
          const open = openId === o.id;
          return (
            <motion.div
              key={o.id}
              layout
              className={cx("rounded-xl border bg-espresso-900/70 overflow-hidden transition-colors", open ? "border-gold-500/40" : "border-cream-200/10 hover:border-cream-200/25")}
            >
              {/* header row */}
              <button onClick={() => setOpenId(open ? null : o.id)} className="w-full flex items-center gap-3 px-4 sm:px-5 py-3.5 text-left">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                    <span className="font-extrabold text-[14px] text-cream-50">{o.number}</span>
                    <span className={cx("px-2 py-0.5 rounded-full border text-[10.5px] font-extrabold tracking-wide uppercase", STATUS_META[o.status].cls)}>
                      {STATUS_META[o.status].label}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[12.5px] text-cream-200/55 truncate">
                    {o.customer.name} · {o.items.reduce((s, i) => s + i.qty, 0)} items · {o.delivery === "pickup" ? "Pickup" : "Delivery"} ·{" "}
                    {dateTime(o.createdAt)}
                  </p>
                </div>
                <p className="font-display font-semibold text-[18px] text-gold-300 whitespace-nowrap">{peso(o.total)}</p>
                <ChevronDown size={17} className={cx("text-cream-200/50 transition-transform duration-300 shrink-0", open && "rotate-180")} />
              </button>

              {/* expanded detail */}
              <AnimatePresence initial={false}>
                {open && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-cream-200/10 px-4 sm:px-5 py-5 grid lg:grid-cols-[1.2fr_1fr] gap-6">
                      {/* items */}
                      <div>
                        <p className="text-[10.5px] font-bold tracking-[0.22em] uppercase text-gold-400">Items</p>
                        <ul className="mt-2.5 space-y-2.5">
                          {o.items.map((it) => (
                            <li key={it.id} className="flex items-center gap-3">
                              <img src={it.img} alt={it.name} className="w-11 h-11 rounded-lg object-cover" />
                              <span className="flex-1 text-[13.5px] font-semibold text-cream-50">
                                {it.name} <span className="text-cream-200/50 font-medium">× {it.qty}</span>
                              </span>
                              <span className="text-[13.5px] font-bold text-cream-200/80">{peso(it.price * it.qty)}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="mt-3.5 pt-3 border-t border-dashed border-cream-200/15 space-y-1 text-[12.5px] text-cream-200/60">
                          <p className="flex justify-between"><span>Subtotal</span><span>{peso(o.subtotal)}</span></p>
                          {o.discount > 0 && (
                            <p className="flex justify-between text-leaf-400 font-semibold"><span>Promo {o.promoCode}</span><span>− {peso(o.discount)}</span></p>
                          )}
                          <p className="flex justify-between">
                            <span>{o.delivery === "pickup" ? "Pickup (free)" : "Local delivery"}</span>
                            <span>{o.deliveryFee === 0 ? "Free" : peso(o.deliveryFee)}</span>
                          </p>
                          <p className="flex justify-between text-[14px] font-extrabold text-cream-50 pt-1">
                            <span>Total</span><span className="text-gold-300">{peso(o.total)}</span>
                          </p>
                        </div>
                      </div>

                      {/* customer + actions */}
                      <div>
                        <p className="text-[10.5px] font-bold tracking-[0.22em] uppercase text-gold-400">Customer</p>
                        <div className="mt-2.5 space-y-2 text-[13.5px] text-cream-200/80">
                          <p className="font-bold text-cream-50 text-[15px]">{o.customer.name}</p>
                          <p className="flex items-center gap-2"><Phone size={13} className="text-gold-400 shrink-0" /> <a href={`tel:${o.customer.phone}`} className="hover:text-gold-300">{o.customer.phone}</a></p>
                          <p className="flex items-start gap-2">
                            {o.delivery === "pickup" ? <Store size={13} className="text-gold-400 shrink-0 mt-0.5" /> : <Truck size={13} className="text-gold-400 shrink-0 mt-0.5" />}
                            <span>
                              {o.delivery === "pickup" ? `Store pickup — ${BIZ.address}` : o.customer.address || "No address given"}
                            </span>
                          </p>
                          {o.customer.notes && (
                            <p className="flex items-start gap-2 text-gold-200/90 italic">
                              <MapPin size={13} className="text-gold-400 shrink-0 mt-0.5" /> "{o.customer.notes}"
                            </p>
                          )}
                          <p className="flex items-center gap-2"><Clock size={13} className="text-gold-400 shrink-0" /> Placed {timeAgo(o.createdAt)}</p>
                        </div>

                        {/* payment + proof */}
                        <div className="mt-4 rounded-xl border border-cream-200/12 bg-espresso-950/60 p-3.5">
                          <div className="flex items-center justify-between">
                            <PayLabel o={o} />
                            {o.payment !== "cod" &&
                              (o.proof ? (
                                <button
                                  onClick={() => setProofView(o)}
                                  className="flex items-center gap-1.5 text-[12px] font-extrabold text-gold-300 hover:text-gold-200 transition-colors"
                                >
                                  <ImageIcon size={13} /> View proof
                                </button>
                              ) : (
                                <span className="text-[11.5px] font-bold text-danger-400">No proof uploaded</span>
                              ))}
                          </div>
                          {o.payment === "cod" && <p className="mt-1.5 text-[12px] text-cream-200/55">Pay on delivery — collect {peso(o.total)} in cash.</p>}
                          {o.payment !== "cod" && (
                            <p className="mt-1.5 text-[12px] text-cream-200/55">
                              Sent to {o.payment === "gcash" ? `GCash ${BIZ.gcash}` : `Maya ${BIZ.maya}`}.
                            </p>
                          )}
                        </div>

                        {/* actions */}
                        <div className="mt-4 flex flex-wrap gap-2">
                          {o.status === "pending" && (
                            <>
                              <button
                                onClick={() => act(o, "confirmed", "Payment confirmed")}
                                className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-leaf-500 hover:bg-leaf-400 text-espresso-950 text-[12.5px] font-extrabold transition-all active:scale-95"
                              >
                                <Check size={14} strokeWidth={3} /> Confirm payment
                              </button>
                              {confirmReject === o.id ? (
                                <span className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => act(o, "rejected", "Order rejected")}
                                    className="px-4 py-2.5 rounded-full bg-danger-500 hover:bg-danger-400 text-cream-50 text-[12.5px] font-extrabold transition-all active:scale-95"
                                  >
                                    Yes, reject
                                  </button>
                                  <button
                                    onClick={() => setConfirmReject(null)}
                                    className="px-3 py-2.5 rounded-full border border-cream-200/20 text-cream-200/70 text-[12.5px] font-bold hover:text-cream-50"
                                  >
                                    Keep
                                  </button>
                                </span>
                              ) : (
                                <button
                                  onClick={() => setConfirmReject(o.id)}
                                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-danger-500/50 text-danger-400 hover:bg-danger-500/10 text-[12.5px] font-extrabold transition-all"
                                >
                                  <XCircle size={14} /> Reject
                                </button>
                              )}
                            </>
                          )}
                          {o.status === "confirmed" && (
                            <button
                              onClick={() => act(o, "completed", "Marked as completed")}
                              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-gold-400 hover:bg-gold-300 text-espresso-950 text-[12.5px] font-extrabold transition-all active:scale-95"
                            >
                              <Check size={14} strokeWidth={3} /> Mark as completed
                            </button>
                          )}
                          {(o.status === "completed" || o.status === "rejected") && (
                            <p className="text-[12.5px] text-cream-200/50 italic">No further actions — this one's settled.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* proof lightbox */}
      <AnimatePresence>
        {proofView?.proof && (
          <motion.div
            className="fixed inset-0 z-[85] grid place-items-center p-5 bg-espresso-950/85 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setProofView(null)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="relative max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img src={proofView.proof} alt={`Proof of payment for ${proofView.number}`} className="w-full rounded-xl border border-gold-500/40 shadow-lift" />
              <div className="mt-3 flex items-center justify-between rounded-xl bg-espresso-900 border border-cream-200/15 px-4 py-3">
                <p className="text-[13px] font-bold text-cream-50">
                  {proofView.number} · {proofView.payment === "gcash" ? "GCash" : "Maya"} · {peso(proofView.total)}
                </p>
                <button onClick={() => setProofView(null)} className="p-1.5 rounded-full hover:bg-cream-200/10 text-cream-200/70 hover:text-cream-50 transition-colors" aria-label="Close">
                  <X size={16} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
