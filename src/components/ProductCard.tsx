import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import type { Product } from "../data/catalog";
import { useShop } from "../context/ShopContext";
import { peso, cx } from "../lib/utils";

interface Props {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: Props) {
  const { addToCart, stockOf } = useShop();
  const stock = stockOf(product.id);
  const soldOut = stock <= 0;
  const low = !soldOut && stock < 10;

  return (
    <motion.article
      initial={{ opacity: 0, y: 34 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.65, delay: (index % 3) * 0.09, ease: [0.22, 1, 0.36, 1] }}
      className={cx(
        "group relative flex flex-col rounded-xl border bg-cream-50 overflow-hidden transition-all duration-300",
        "border-cocoa-500/12 hover:border-gold-500/45 hover:shadow-lift hover:-translate-y-1.5",
        soldOut && "opacity-70",
      )}
    >
      {/* image — this exact src is reused in cart & checkout for consistency */}
      <div className="relative aspect-square overflow-hidden bg-cream-200">
        <img
          src={product.img}
          alt={product.name}
          loading="lazy"
          className={cx("w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.07]", soldOut && "grayscale")}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-espresso-900/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        {product.badge && (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-espresso-900/90 text-gold-300 text-[10.5px] font-bold tracking-[0.14em] uppercase">
            {product.badge}
          </span>
        )}
        <span
          className={cx(
            "absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10.5px] font-bold tracking-wide backdrop-blur-sm",
            soldOut ? "bg-danger-500 text-cream-50" : low ? "bg-danger-500/90 text-cream-50" : "bg-cream-50/90 text-cocoa-600",
          )}
        >
          {soldOut ? "Sold out" : low ? `Only ${stock} left` : "Freshly scooped"}
        </span>
      </div>

      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-display font-semibold text-[21px] text-espresso-900 leading-tight">{product.name}</h3>
          <p className="font-display font-semibold text-[19px] text-cocoa-600 whitespace-nowrap">
            {peso(product.price)}
            <span className="ml-1 font-body text-[11px] font-semibold text-cocoa-400">each</span>
          </p>
        </div>
        <p className="mt-1.5 text-[13.5px] leading-relaxed text-cocoa-600/90">{product.desc}</p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {product.notes.map((n) => (
            <span key={n} className="px-2 py-0.5 rounded-full bg-cream-200 text-cocoa-600 text-[11px] font-semibold">
              {n}
            </span>
          ))}
        </div>

        {/* bake guide — the practical detail dough customers want */}
        <p className="mt-3.5 pt-3 border-t border-dashed border-cocoa-500/20 flex items-center gap-2 text-[12px] font-bold text-cocoa-500">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className="text-gold-600 shrink-0" aria-hidden>
            <circle cx="12" cy="13" r="8" />
            <path d="M12 9v4l2.5 2.5" />
            <path d="M9 2h6" />
          </svg>
          {product.meta}
        </p>

        <button
          onClick={() => addToCart(product.id)}
          disabled={soldOut}
          className={cx(
            "btn-sheen mt-4 flex items-center justify-center gap-2 w-full py-3 rounded-full font-bold text-[14px] transition-all",
            soldOut
              ? "bg-cream-200 text-cocoa-400 cursor-not-allowed"
              : "bg-espresso-900 text-cream-50 hover:bg-espresso-800 active:scale-[0.97] hover:shadow-lift",
          )}
        >
          <Plus size={17} strokeWidth={2.8} />
          {soldOut ? "Back after the next batch" : "Add to Tray"}
        </button>
      </div>
    </motion.article>
  );
}
