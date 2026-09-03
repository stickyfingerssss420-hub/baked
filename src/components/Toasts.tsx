import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Check, X, XCircle } from "lucide-react";
import { useShop, type ToastTone } from "../context/ShopContext";

const toneStyles: Record<ToastTone, { bar: string; icon: JSX.Element }> = {
  ok: { bar: "bg-leaf-500", icon: <Check size={15} strokeWidth={3} className="text-leaf-500" /> },
  warn: { bar: "bg-gold-500", icon: <AlertTriangle size={15} className="text-gold-600" /> },
  err: { bar: "bg-danger-500", icon: <XCircle size={15} className="text-danger-500" /> },
};

export default function Toasts() {
  const { toasts, dismissToast } = useShop();
  return (
    <div className="fixed bottom-4 left-4 z-[90] flex flex-col gap-2.5 max-w-[calc(100vw-2rem)]">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, x: -30, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -24, scale: 0.95 }}
            transition={{ type: "spring", damping: 24, stiffness: 320 }}
            className="relative flex items-start gap-3 rounded-xl bg-cream-50 shadow-lift border border-cocoa-500/12 pl-4 pr-3 py-3 w-[300px] overflow-hidden"
          >
            <span className={`absolute left-0 top-0 bottom-0 w-1 ${toneStyles[t.tone].bar}`} />
            <span className="mt-0.5 w-6 h-6 grid place-items-center rounded-full bg-cream-200 shrink-0">
              {toneStyles[t.tone].icon}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[13.5px] font-bold text-espresso-900 leading-snug">{t.title}</p>
              {t.sub && <p className="text-[12px] text-cocoa-500 mt-0.5 leading-snug">{t.sub}</p>}
            </div>
            <button onClick={() => dismissToast(t.id)} className="text-cocoa-400 hover:text-espresso-900 transition-colors shrink-0 p-0.5" aria-label="Dismiss">
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
