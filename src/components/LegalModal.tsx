import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { BIZ } from "../data/catalog";

interface Props {
  kind: "privacy" | "terms" | null;
  onClose: () => void;
}

const COPY = {
  privacy: {
    title: "Privacy Policy",
    body: [
      `We only collect what we need to bake and deliver your order: your name, phone number, delivery address, order details, and — if you pay by GCash or Maya — the proof-of-payment screenshot you choose to upload.`,
      `Your details are used solely to process orders, confirm payments, and answer your messages through our chat. We never sell, rent, or share your information with third parties outside of what is required to complete a delivery.`,
      `Uploaded payment screenshots are stored securely and deleted once your order is completed and reconciled. Cart contents on this site live in your browser for 24 hours and are never transmitted until you place an order.`,
      `You may request a copy or deletion of your data at any time by emailing ${BIZ.email} or texting ${BIZ.phone}. We reply within 48 hours.`,
    ],
  },
  terms: {
    title: "Terms of Service",
    body: [
      `All dough is scooped to order in small batches and kept chilled until pickup or delivery. Prices are ₱50 per cookie-dough scoop and ₱80 per brownie-batter scoop, inclusive of VAT. Local delivery is a flat ₱50 with a ₱250 minimum order; store pickup at ${BIZ.address} is free.`,
      `GCash and Maya orders are confirmed once payment is verified against your uploaded screenshot — usually within the hour during store hours. COD orders are payable upon pickup or delivery; please prepare exact change when possible.`,
      `Our kitchen handles wheat, eggs, dairy, and nuts. While we clean thoroughly between batches, we cannot guarantee zero cross-contact — our products are not suitable for severe allergies.`,
      `Cancellations are free before your order is confirmed. Once baking has started we can no longer refund, but we will always try to make it right — message us and we will sort it out.`,
    ],
  },
};

export default function LegalModal({ kind, onClose }: Props) {
  const copy = kind ? COPY[kind] : null;
  return (
    <AnimatePresence>
      {kind && copy && (
        <motion.div
          className="fixed inset-0 z-[80] grid place-items-center p-4 bg-espresso-950/70 backdrop-blur-[3px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative w-full max-w-lg max-h-[82vh] overflow-y-auto thin-scroll bg-cream-50 rounded-2xl shadow-lift p-7 sm:p-9"
            initial={{ opacity: 0, y: 26, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-9 h-9 grid place-items-center rounded-full bg-cream-200 hover:bg-cream-300 text-cocoa-600 transition-colors"
              aria-label="Close"
            >
              <X size={17} />
            </button>
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-gold-600">Scoopable Cookies</p>
            <h3 className="mt-1.5 font-display font-semibold text-[28px] text-espresso-900">{copy.title}</h3>
            <div className="mt-4 space-y-3.5 text-[14px] leading-relaxed text-cocoa-700">
              {copy.body.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            <p className="mt-6 text-[12px] text-cocoa-500">Last updated {new Date().toLocaleDateString("en-PH", { month: "long", year: "numeric" })}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
