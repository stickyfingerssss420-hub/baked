import { useState } from "react";
import { AlertTriangle, Minus, PackagePlus, Plus } from "lucide-react";
import { useShop } from "../../context/ShopContext";
import { BIZ, PRODUCTS } from "../../data/catalog";
import { adjustStock, setCost } from "../../lib/backend";
import { cx, peso } from "../../lib/utils";

export default function Inventory() {
  const { inventory, toast } = useShop();
  const [costDrafts, setCostDrafts] = useState<Record<string, string>>({});

  const rows = PRODUCTS.map((p) => {
    const entry = inventory[p.id] ?? { stock: 0, cost: p.cost };
    const margin = p.price - entry.cost;
    const marginPct = p.price > 0 ? Math.round((margin / p.price) * 100) : 0;
    return { product: p, ...entry, margin, marginPct };
  });

  const totalUnits = rows.reduce((s, r) => s + r.stock, 0);
  const invValue = rows.reduce((s, r) => s + r.stock * r.cost, 0);
  const potentialProfit = rows.reduce((s, r) => s + r.stock * r.margin, 0);
  const lowCount = rows.filter((r) => r.stock < BIZ.lowStockThreshold).length;

  const commitCost = (id: string) => {
    const raw = costDrafts[id];
    if (raw === undefined) return;
    const val = Number(raw);
    if (isNaN(val) || val < 0) {
      toast("Cost must be a positive number", { tone: "err" });
      return;
    }
    setCost(id, val);
    setCostDrafts((d) => {
      const n = { ...d };
      delete n[id];
      return n;
    });
    toast("Cost updated", { sub: "Margins recalculated instantly." });
  };

  return (
    <div className="space-y-5">
      {/* summary strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {[
          { label: "Units in stock", value: String(totalUnits), tone: "" },
          { label: "Inventory value (cost)", value: peso(invValue), tone: "" },
          { label: "Potential profit", value: peso(potentialProfit), tone: "text-gold-300" },
          { label: "Low-stock alerts", value: String(lowCount), tone: lowCount > 0 ? "text-danger-400" : "text-leaf-400" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-cream-200/10 bg-espresso-900/70 p-4">
            <p className={cx("font-display font-semibold text-[clamp(1.1rem,2.2vw,1.5rem)]", s.tone || "text-cream-50")}>{s.value}</p>
            <p className="text-[10.5px] font-bold tracking-[0.16em] uppercase text-cream-200/50 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {lowCount > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-danger-500/40 bg-danger-500/10 px-4 py-3">
          <AlertTriangle size={18} className="text-danger-400 shrink-0" />
          <p className="text-[13px] font-semibold text-cream-100">
            <span className="font-extrabold text-danger-400">{lowCount} product{lowCount > 1 ? "s" : ""}</span> below{" "}
            {BIZ.lowStockThreshold} units — restock before the next rush or the menu shows "sold out".
          </p>
        </div>
      )}

      {/* table */}
      <div className="rounded-xl border border-cream-200/10 bg-espresso-900/70 overflow-hidden">
        <div className="hidden md:grid grid-cols-[minmax(180px,1.4fr)_repeat(4,minmax(110px,1fr))_auto] gap-3 px-5 py-3 border-b border-cream-200/10 text-[10.5px] font-bold tracking-[0.18em] uppercase text-cream-200/45">
          <span>Product</span>
          <span>Sell price</span>
          <span>Cost price</span>
          <span>Margin</span>
          <span>Stock</span>
          <span className="text-right pr-1">Restock</span>
        </div>

        <ul>
          {rows.map((r) => {
            const low = r.stock < BIZ.lowStockThreshold;
            const out = r.stock <= 0;
            return (
              <li
                key={r.product.id}
                className={cx(
                  "grid md:grid-cols-[minmax(180px,1.4fr)_repeat(4,minmax(110px,1fr))_auto] gap-x-3 gap-y-3 px-5 py-4 border-b border-cream-200/8 last:border-0 items-center transition-colors",
                  low && "bg-danger-500/6",
                )}
              >
                {/* product */}
                <div className="flex items-center gap-3">
                  <img src={r.product.img} alt={r.product.name} className={cx("w-11 h-11 rounded-lg object-cover", out && "grayscale opacity-70")} />
                  <div>
                    <p className="text-[14px] font-bold text-cream-50 flex items-center gap-2">
                      {r.product.name}
                      {low && (
                        <span className="px-2 py-0.5 rounded-full bg-danger-500 text-cream-50 text-[9.5px] font-extrabold tracking-widest uppercase">
                          {out ? "Out" : "Low"}
                        </span>
                      )}
                    </p>
                    <p className="text-[11.5px] text-cream-200/45 capitalize">{r.product.category}</p>
                  </div>
                </div>

                {/* sell price */}
                <p className="text-[14px] font-bold text-cream-100">{peso(r.product.price)}</p>

                {/* cost input */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[12px] font-bold text-cream-200/50">₱</span>
                  <input
                    value={costDrafts[r.product.id] ?? String(r.cost)}
                    onChange={(e) => setCostDrafts((d) => ({ ...d, [r.product.id]: e.target.value }))}
                    onBlur={() => commitCost(r.product.id)}
                    onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
                    inputMode="decimal"
                    className="w-16 px-2 py-1.5 rounded-lg bg-espresso-950/70 border border-cream-200/15 text-[13px] font-bold text-cream-50 focus:outline-none focus:border-gold-500 text-center"
                    aria-label={`Cost price for ${r.product.name}`}
                  />
                </div>

                {/* margin */}
                <div>
                  <p className={cx("text-[14px] font-extrabold", r.marginPct >= 40 ? "text-leaf-400" : r.marginPct >= 25 ? "text-gold-300" : "text-danger-400")}>
                    {peso(r.margin)}
                  </p>
                  <p className="text-[11px] font-bold text-cream-200/45">{r.marginPct}% per piece</p>
                </div>

                {/* stock stepper */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => adjustStock(r.product.id, -1)}
                    className="w-7 h-7 grid place-items-center rounded-full border border-cream-200/20 text-cream-200/70 hover:text-cream-50 hover:border-cream-200/45 transition-colors"
                    aria-label={`Decrease stock of ${r.product.name}`}
                  >
                    <Minus size={13} />
                  </button>
                  <span className={cx("w-9 text-center font-display font-semibold text-[18px]", low ? "text-danger-400" : "text-cream-50")}>{r.stock}</span>
                  <button
                    onClick={() => adjustStock(r.product.id, 1)}
                    className="w-7 h-7 grid place-items-center rounded-full border border-cream-200/20 text-cream-200/70 hover:text-cream-50 hover:border-cream-200/45 transition-colors"
                    aria-label={`Increase stock of ${r.product.name}`}
                  >
                    <Plus size={13} />
                  </button>
                </div>

                {/* restock */}
                <div className="flex items-center gap-1.5 md:justify-end">
                  <button
                    onClick={() => {
                      adjustStock(r.product.id, 10);
                      toast(`+10 ${r.product.name}`, { sub: `Now ${r.stock + 10} in stock` });
                    }}
                    className="px-3 py-1.5 rounded-full bg-cream-200/10 hover:bg-cream-200/20 text-[11.5px] font-extrabold text-cream-100 transition-colors"
                  >
                    +10
                  </button>
                  <button
                    onClick={() => {
                      adjustStock(r.product.id, 25);
                      toast(`+25 ${r.product.name}`, { sub: `Now ${r.stock + 25} in stock — fresh batch!` });
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gold-400 hover:bg-gold-300 text-espresso-950 text-[11.5px] font-extrabold transition-colors"
                  >
                    <PackagePlus size={13} strokeWidth={2.4} /> +25
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <p className="text-[12px] text-cream-200/45">
        Stock deducts automatically when customers place orders. Set the exact number by tapping the − / + steppers; cost edits recalculate margins live.
      </p>
    </div>
  );
}
