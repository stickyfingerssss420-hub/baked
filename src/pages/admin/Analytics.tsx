import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Banknote, Crown, Receipt, TimerReset, TrendingDown, TrendingUp } from "lucide-react";
import { useShop } from "../../context/ShopContext";
import { PRODUCTS } from "../../data/catalog";
import { cx, dateShort, peso } from "../../lib/utils";

const RANGES = [
  { id: 7, label: "Last 7 days" },
  { id: 14, label: "Last 14 days" },
] as const;

export default function Analytics() {
  const { orders } = useShop();
  const [range, setRange] = useState<(typeof RANGES)[number]["id"]>(14);

  const paid = useMemo(() => orders.filter((o) => o.status === "confirmed" || o.status === "completed"), [orders]);

  /* daily revenue series */
  const series = useMemo(() => {
    const days: { label: string; revenue: number; orders: number }[] = [];
    for (let i = range - 1; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      const next = d.getTime() + 86_400_000;
      const dayOrders = paid.filter((o) => o.createdAt >= d.getTime() && o.createdAt < next);
      days.push({
        label: dateShort(d.getTime()),
        revenue: dayOrders.reduce((s, o) => s + o.total, 0),
        orders: dayOrders.length,
      });
    }
    return days;
  }, [paid, range]);

  const totalRevenue = series.reduce((s, d) => s + d.revenue, 0);
  const totalOrders = series.reduce((s, d) => s + d.orders, 0);
  const aov = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  /* trend vs previous window */
  const trend = useMemo(() => {
    const half = Math.floor(series.length / 2);
    const first = series.slice(0, half).reduce((s, d) => s + d.revenue, 0);
    const second = series.slice(half).reduce((s, d) => s + d.revenue, 0);
    if (first === 0) return { up: true, pct: 100 };
    return { up: second >= first, pct: Math.abs(Math.round(((second - first) / first) * 100)) };
  }, [series]);

  /* best sellers by units */
  const sellers = useMemo(() => {
    return PRODUCTS.map((p) => {
      const sold = paid
        .flatMap((o) => o.items)
        .filter((it) => it.id === p.id)
        .reduce((s, it) => s + it.qty, 0);
      const rev = paid
        .flatMap((o) => o.items)
        .filter((it) => it.id === p.id)
        .reduce((s, it) => s + it.price * it.qty, 0);
      return { product: p, sold, rev };
    })
      .sort((a, b) => b.sold - a.sold);
  }, [paid]);

  const maxSold = Math.max(1, ...sellers.map((s) => s.sold));
  const pending = orders.filter((o) => o.status === "pending").length;
  const best = sellers[0];

  const hasSales = totalOrders > 0;

  const stats = [
    {
      label: `Revenue · ${range}d`,
      value: peso(totalRevenue),
      sub: hasSales ? (trend.up ? `▲ ${trend.pct}% vs prior window` : `▼ ${trend.pct}% vs prior window`) : "waiting for your first order",
      up: hasSales ? trend.up : null,
      icon: <Banknote size={18} />,
    },
    {
      label: "Paid orders",
      value: String(totalOrders),
      sub: hasSales ? `${peso(aov)} average order` : "they land here in real time",
      up: hasSales ? true : null,
      icon: <Receipt size={18} />,
    },
    { label: "Awaiting payment", value: String(pending), sub: "need confirmation", up: null, icon: <TimerReset size={18} /> },
    {
      label: "Best seller",
      value: hasSales && best.sold > 0 ? best.product.name : "—",
      sub: hasSales && best.sold > 0 ? `${best.sold} pcs · ${peso(best.rev)}` : "your first sale decides",
      up: null,
      icon: <Crown size={18} />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-cream-200/10 bg-espresso-900/70 p-5 hover:border-gold-500/40 transition-colors">
            <div className="flex items-center justify-between text-gold-400">
              <span className="w-9 h-9 grid place-items-center rounded-full bg-gold-500/12">{s.icon}</span>
              {s.up !== null && (s.up ? <TrendingUp size={16} className="text-leaf-400" /> : <TrendingDown size={16} className="text-danger-400" />)}
            </div>
            <p className="mt-3 font-display font-semibold text-[clamp(1.15rem,2.4vw,1.6rem)] text-cream-50 leading-tight">{s.value}</p>
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-cream-200/50 mt-1">{s.label}</p>
            <p className={cx("text-[12px] font-semibold mt-0.5", s.up === null ? "text-cream-200/60" : s.up ? "text-leaf-400" : "text-danger-400")}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* revenue chart */}
      <div className="rounded-xl border border-cream-200/10 bg-espresso-900/70 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display font-semibold text-[20px] text-cream-50">Sales trend</h2>
            <p className="text-[12.5px] text-cream-200/55 mt-0.5">Confirmed + completed orders, per day.</p>
          </div>
          <div className="flex gap-1.5">
            {RANGES.map((r) => (
              <button
                key={r.id}
                onClick={() => setRange(r.id)}
                className={cx(
                  "px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-all",
                  range === r.id ? "bg-gold-400 text-espresso-900" : "bg-cream-200/10 text-cream-200/65 hover:text-cream-50",
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 h-[280px]">
          {!hasSales ? (
            <div className="h-full grid place-items-center rounded-lg border border-dashed border-cream-200/20 px-6 text-center">
              <div>
                <p className="font-display font-semibold text-[19px] text-cream-100">A blank canvas — ₱0 so far</p>
                <p className="mt-1.5 text-[13px] text-cream-200/55 max-w-sm leading-relaxed">
                  The graph draws itself the moment your first order is confirmed. No demo numbers here — every peso you'll see is real.
                </p>
              </div>
            </div>
          ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ top: 6, right: 8, left: -8, bottom: 0 }}>
              <defs>
                <linearGradient id="revGold" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D4A85C" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#D4A85C" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 6" stroke="rgba(240,228,204,0.09)" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: "rgba(240,228,204,0.55)", fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fill: "rgba(240,228,204,0.55)", fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `₱${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`} width={52} />
              <Tooltip
                cursor={{ stroke: "rgba(212,168,92,0.35)", strokeWidth: 1.5 }}
                contentStyle={{
                  background: "#2A1A0F",
                  border: "1px solid rgba(212,168,92,0.35)",
                  borderRadius: 12,
                  color: "#FCF9F1",
                  fontSize: 12.5,
                  fontWeight: 600,
                }}
                labelStyle={{ color: "#D4A85C", fontWeight: 800 }}
                formatter={(value: number | string, name: string) => (name === "revenue" ? [peso(Number(value)), "Revenue"] : [value, name])}
              />
              <Area type="monotone" dataKey="revenue" stroke="#D4A85C" strokeWidth={2.5} fill="url(#revGold)" dot={false} activeDot={{ r: 4.5, fill: "#D4A85C", stroke: "#2A1A0F", strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* best sellers */}
      <div className="rounded-xl border border-cream-200/10 bg-espresso-900/70 p-5">
        <h2 className="font-display font-semibold text-[20px] text-cream-50">Best sellers</h2>
        <p className="text-[12.5px] text-cream-200/55 mt-0.5">
          {hasSales ? "Units sold across paid orders." : "Nothing sold yet — the ranking builds itself as orders come in."}
        </p>
        <ul className="mt-5 space-y-3.5">
          {sellers.map((s, i) => (
            <li key={s.product.id} className="flex items-center gap-3.5">
              <span className={cx("w-6 text-center font-display font-semibold text-[15px]", i === 0 ? "text-gold-400" : "text-cream-200/40")}>{i + 1}</span>
              <img src={s.product.img} alt={s.product.name} className="w-10 h-10 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-[13.5px] font-bold text-cream-50 truncate">{s.product.name}</p>
                  <p className="text-[12px] font-bold text-cream-200/60 whitespace-nowrap">
                    {s.sold} pcs · <span className="text-gold-300">{peso(s.rev)}</span>
                  </p>
                </div>
                <div className="mt-1.5 h-1.5 rounded-full bg-cream-200/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-gold-600 to-gold-400 transition-all duration-700"
                    style={{ width: `${(s.sold / maxSold) * 100}%` }}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
