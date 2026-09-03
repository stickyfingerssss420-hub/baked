import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, ChevronDown, MessageCircle, Package, Receipt, RotateCcw } from "lucide-react";

/* Dismissible onboarding card — answers "how do I use all of this?" right
   inside the dashboard. Remembers dismissal in localStorage. */

const DISMISS_KEY = "sc_quickstart_dismissed";

const STEPS = [
  {
    icon: <Receipt size={16} />,
    title: "Confirm & complete orders",
    body: "Open the Orders tab → tap a pending order → check the customer's GCash/Maya screenshot → hit “Confirm payment”, then “Mark completed” once it's packed and handed over.",
  },
  {
    icon: <Package size={16} />,
    title: "Set your real stock",
    body: "Fresh install: every flavor starts at 24 scoops so the store works on day one. Open the Inventory tab and set the numbers you actually scooped today — stock then deducts automatically with each order, and anything under 10 turns red.",
  },
  {
    icon: <MessageCircle size={16} />,
    title: "Answer customers live",
    body: "Chat tab: every message sent from the storefront's chat bubble appears here instantly. Your reply pops up on the customer's phone in real time.",
  },
  {
    icon: <CheckCircle2 size={16} />,
    title: "Try it yourself first",
    body: "Open the store in another tab, place a small test order (COD is fastest), and watch it land here. That's the whole loop — you're ready.",
  },
];

export default function QuickStart() {
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISS_KEY) === "1");
  const [open, setOpen] = useState(true);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  };

  if (dismissed) {
    return (
      <button
        onClick={() => {
          localStorage.removeItem(DISMISS_KEY);
          setDismissed(false);
          setOpen(true);
        }}
        className="mb-5 flex items-center gap-1.5 text-[12px] font-bold text-cream-200/45 hover:text-gold-300 transition-colors"
      >
        <RotateCcw size={13} />
        Show the quick-start guide again
      </button>
    );
  }

  return (
    <motion.div layout className="mb-6 rounded-xl border border-gold-500/35 bg-gold-400/8 overflow-hidden">
      <button onClick={() => setOpen((v) => !v)} className="w-full flex items-center justify-between gap-3 px-5 py-3.5 text-left">
        <span className="flex items-center gap-2.5">
          <span className="w-7 h-7 grid place-items-center rounded-full bg-gold-400 text-espresso-950 text-[13px] font-extrabold">?</span>
          <span className="font-display font-semibold text-[17px] text-cream-50">
            First time here? <span className="text-gold-300 italic">4 things to know.</span>
          </span>
        </span>
        <ChevronDown size={17} className={`text-gold-300 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 grid sm:grid-cols-2 gap-3">
              {STEPS.map((s, i) => (
                <div key={s.title} className="flex gap-3 rounded-lg bg-espresso-950/50 border border-cream-200/8 p-3.5">
                  <span className="mt-0.5 shrink-0 w-8 h-8 grid place-items-center rounded-full bg-cream-200/10 text-gold-300">{s.icon}</span>
                  <div>
                    <p className="text-[13.5px] font-extrabold text-cream-50">
                      <span className="text-gold-400">{i + 1}.</span> {s.title}
                    </p>
                    <p className="mt-1 text-[12.5px] leading-relaxed text-cream-200/65">{s.body}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 pb-4 flex items-center justify-between gap-3">
              <p className="text-[11.5px] text-cream-200/45">
                Tip: open this portal on your phone too — it's fully touch-friendly. Wire up Supabase (see SETUP.md) and orders follow you across devices.
              </p>
              <button
                onClick={dismiss}
                className="shrink-0 px-4 py-2 rounded-full bg-cream-200/10 hover:bg-cream-200/20 text-[12.5px] font-bold text-cream-100 transition-colors"
              >
                Got it — hide this
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
