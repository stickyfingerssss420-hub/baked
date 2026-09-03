import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowDown, Mail, MapPin, Sparkles } from "lucide-react";
import CookieMascot from "../components/CookieMascot";
import ProductCard from "../components/ProductCard";
import Reveal from "../components/Reveal";
import { BIZ, PRODUCTS } from "../data/catalog";
import { peso, cx } from "../lib/utils";

const FILTERS = [
  { id: "all", label: "Everything" },
  { id: "cookies", label: "Scoopable Cookies" },
  { id: "brownies", label: "Brownies" },
] as const;

const MARQUEE = [
  "Fresh & gooey",
  "Small batch",
  "Baked daily",
  "₱50 scoopable cookies",
  "₱80 fudge brownies",
  "Free store pickup",
  "Flat ₱50 delivery",
  "GCash · Maya · COD",
];

/* tiny gold flower used as the marquee separator */
const Flower = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="#D4A85C" aria-hidden className="shrink-0">
    <path d="M12 2c1.2 3.4 2.6 4.8 6 6-3.4 1.2-4.8 2.6-6 6-1.2-3.4-2.6-4.8-6-6 3.4-1.2 4.8-2.6 6-6z" />
    <circle cx="19" cy="18" r="2.2" />
    <circle cx="5.5" cy="19" r="1.6" />
  </svg>
);

const LineMask = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
  <span className="block overflow-hidden pb-1">
    <motion.span
      className="block"
      initial={{ y: "112%" }}
      animate={{ y: 0 }}
      transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.span>
  </span>
);

export default function Home() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const visible = useMemo(
    () => (filter === "all" ? PRODUCTS : PRODUCTS.filter((p) => p.category === filter)),
    [filter],
  );

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <main className="relative">
      {/* ============================== HERO ============================== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grain" aria-hidden />
        <div className="absolute inset-y-0 right-0 w-1/2 dotgrid opacity-70 [mask-image:linear-gradient(to_left,black,transparent)]" aria-hidden />
        <div className="absolute -top-32 left-1/3 w-96 h-96 rounded-full bg-gold-300/25 blur-3xl" aria-hidden />

        <div className="relative max-w-6xl mx-auto px-4 pt-12 pb-16 lg:pt-16 lg:pb-24 grid lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-6 items-center">
          {/* copy */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-gold-500/40 bg-gold-400/10 text-[12px] font-bold tracking-[0.14em] uppercase text-cocoa-600"
            >
              <Sparkles size={13} className="text-gold-600" />
              Small-batch dough shop · {BIZ.address}
            </motion.div>

            <h1 className="mt-5 font-display font-semibold text-espresso-900 leading-[1.02] tracking-tight text-[clamp(2.7rem,7.2vw,4.6rem)]">
              <LineMask delay={0.08}>Fresh dough,</LineMask>
              <LineMask delay={0.2}>
                <em className="not-italic font-display italic text-gold-600">dangerously</em>
              </LineMask>
              <LineMask delay={0.32}>scoopable.</LineMask>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.42 }}
              className="mt-5 max-w-md text-[16px] leading-relaxed text-cocoa-600"
            >
              Hand-scooped cookie dough at <strong className="text-espresso-900">{peso(50)}</strong> and fudge brownie batter at{" "}
              <strong className="text-espresso-900">{peso(80)}</strong> — made in batches of twenty-four, chilled and ready for your oven (or your spoon).
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.52 }}
              className="mt-7 flex flex-wrap items-center gap-3"
            >
              <button
                onClick={() => scrollTo("menu")}
                className="btn-sheen group flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-espresso-900 text-cream-50 font-bold text-[15px] hover:bg-espresso-800 transition-all hover:shadow-lift active:scale-[0.97]"
              >
                Browse the menu
                <ArrowDown size={17} strokeWidth={2.4} className="transition-transform group-hover:translate-y-0.5" />
              </button>
              <button
                onClick={() => scrollTo("how")}
                className="px-6 py-3.5 rounded-full border-2 border-cocoa-500/30 text-espresso-900 font-bold text-[15px] hover:border-espresso-900 hover:bg-cream-50 transition-all active:scale-[0.97]"
              >
                How ordering works
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] font-semibold text-cocoa-500"
            >
              <span className="flex items-center gap-1.5">
                <span className="flex text-gold-500">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden>
                      <path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.2 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z" />
                    </svg>
                  ))}
                </span>
                4.9 from 300+ neighbors
              </span>
              <span>Same-day pickup before 3 PM</span>
              <span className="text-cocoa-600">GCash · Maya · COD</span>
            </motion.div>
          </div>

          {/* mascot stage */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
            className="relative flex items-center justify-center py-6"
          >
            {/* rotating scoop ring */}
            <div className="absolute w-[320px] h-[320px] sm:w-[400px] sm:h-[400px] rounded-full border-2 border-dashed border-gold-500/50 anim-spin-slow" aria-hidden />
            <div className="absolute w-[270px] h-[270px] sm:w-[340px] sm:h-[340px] rounded-full bg-[radial-gradient(circle_at_35%_30%,#E3C386,#C0913F_70%,#A2762C)] shadow-lift" aria-hidden />

            <CookieMascot size={300} className="relative w-[230px] sm:w-[280px] h-auto cursor-pointer drop-shadow-[0_18px_28px_rgba(74,42,18,0.28)]" />

            {/* floating price tags */}
            <div className="anim-float-chip absolute -left-2 sm:left-2 top-6 flex items-center gap-2.5 bg-cream-50 rounded-xl border border-cocoa-500/12 shadow-soft pl-2 pr-3.5 py-2 -rotate-6">
              <img src={PRODUCTS[0].img} alt="" className="w-9 h-9 rounded-lg object-cover" />
              <div className="leading-tight">
                <p className="text-[12px] font-bold text-espresso-900">Choco Chip</p>
                <p className="text-[11px] font-extrabold text-gold-600">{peso(50)} each</p>
              </div>
            </div>
            <div className="anim-float-chip absolute -right-1 sm:right-4 bottom-10 flex items-center gap-2.5 bg-cream-50 rounded-xl border border-cocoa-500/12 shadow-soft pl-2 pr-3.5 py-2 rotate-3" style={{ animationDelay: "1.4s" }}>
              <img src={PRODUCTS[4].img} alt="" className="w-9 h-9 rounded-lg object-cover" />
              <div className="leading-tight">
                <p className="text-[12px] font-bold text-espresso-900">Fudge Brownie</p>
                <p className="text-[11px] font-extrabold text-gold-600">{peso(80)} each</p>
              </div>
            </div>

            {/* drifting chips */}
            <svg className="anim-float-chip absolute left-6 bottom-24 text-cocoa-700" style={{ animationDelay: "0.7s" }} viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden>
              <ellipse cx="12" cy="12" rx="9" ry="8" transform="rotate(-15 12 12)" />
            </svg>
            <svg className="anim-float-chip absolute right-10 top-16 text-cocoa-700" style={{ animationDelay: "2.1s" }} viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden>
              <ellipse cx="12" cy="12" rx="9" ry="8" transform="rotate(20 12 12)" />
            </svg>
          </motion.div>
        </div>
      </section>

      {/* ============================ MARQUEE ============================ */}
      <div className="relative overflow-hidden py-2 bg-cream-100">
        <div className="bg-espresso-900 -rotate-[1.2deg] scale-[1.03] py-3.5 border-y-2 border-gold-500/60">
          <div className="anim-marquee flex w-max items-center gap-7">
            {[0, 1].map((copy) => (
              <div key={copy} className="flex items-center gap-7" aria-hidden={copy === 1}>
                {MARQUEE.map((m) => (
                  <span key={m} className="flex items-center gap-7">
                    <span className="text-cream-100 text-[13px] font-extrabold tracking-[0.22em] uppercase whitespace-nowrap">{m}</span>
                    <Flower />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ============================== MENU ============================= */}
      <section id="menu" className="relative scroll-mt-28 max-w-6xl mx-auto px-4 pt-20 pb-16">
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-gold-600">The lineup</p>
              <h2 className="mt-2 font-display font-semibold text-espresso-900 text-[clamp(2rem,4.6vw,3.1rem)] leading-[1.05] tracking-tight">
                Small menu.
                <br />
                <em className="italic text-cocoa-500">Serious</em> cookies.
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={cx(
                    "px-4 py-2 rounded-full text-[13px] font-bold transition-all border",
                    filter === f.id
                      ? "bg-espresso-900 text-cream-50 border-espresso-900 shadow-soft"
                      : "bg-cream-50 text-cocoa-600 border-cocoa-500/25 hover:border-espresso-900",
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <p className="mt-4 text-[14px] text-cocoa-500 max-w-lg">
            Everything is scooped to order and kept cold. What you see below is today's batch — when a tray sells out, it's gone until the
            next bake.
          </p>
        </Reveal>

        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {visible.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}

          {/* bulk-orders tile */}
          <motion.div
            initial={{ opacity: 0, y: 34 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.65, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-xl overflow-hidden bg-espresso-900 text-cream-100 p-6 flex flex-col justify-between min-h-[300px] group"
          >
            <div className="absolute inset-0 dotgrid-dark opacity-50" aria-hidden />
            <div className="relative">
              <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-gold-400">Feeding a crowd?</p>
              <h3 className="mt-2 font-display font-semibold text-[26px] leading-tight">
                Bulk boxes for
                <br />
                events & office days
              </h3>
              <p className="mt-2 text-[13.5px] text-cream-200/75 leading-relaxed">
                Two dozen or two hundred — we price boxes per tray and deliver chilled. Message us 48 hours ahead.
              </p>
            </div>
            <div className="relative flex items-end justify-between mt-6">
              <a
                href={`mailto:${BIZ.email}?subject=Bulk order inquiry`}
                className="btn-sheen inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gold-400 text-espresso-900 font-bold text-[13.5px] hover:bg-gold-300 transition-all active:scale-95"
              >
                <Mail size={15} strokeWidth={2.4} />
                Email the baker
              </a>
              <span className="transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110 origin-bottom-right">
                <CookieMascot size={92} withShadow={false} />
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========================== HOW IT WORKS ========================= */}
      <section id="how" className="relative scroll-mt-28 bg-cream-50 border-y border-cocoa-500/10 py-20 overflow-hidden">
        <div className="absolute inset-0 grain" aria-hidden />
        <div className="relative max-w-6xl mx-auto px-4">
          <Reveal>
            <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-gold-600">How it works</p>
            <h2 className="mt-2 font-display font-semibold text-espresso-900 text-[clamp(2rem,4.6vw,3.1rem)] leading-[1.05] tracking-tight max-w-xl">
              From craving to <em className="italic text-cocoa-500">crumb</em> in three moves.
            </h2>
          </Reveal>

          <div className="relative mt-14 grid md:grid-cols-3 gap-12 md:gap-8">
            {/* dashed connector */}
            <div className="hidden md:block absolute top-7 left-[12%] right-[12%] border-t-2 border-dashed border-gold-500/50" aria-hidden />

            {[
              {
                n: "01",
                t: "Scoop your picks",
                d: "Add cookies and brownies to your tray. Your cart waits patiently for 24 hours — even if you refresh or come back tomorrow.",
                icon: (
                  <path d="M4 13a8 8 0 0 0 16 0M8 13V6.5A2.5 2.5 0 0 1 10.5 4h3A2.5 2.5 0 0 1 16 6.5V13M12 13v7m-3 0h6" />
                ),
              },
              {
                n: "02",
                t: "We bake it fresh",
                d: "Your order drops straight into the bake queue. Pay by GCash, Maya, or cash on delivery — upload your receipt if paying online.",
                icon: (
                  <path d="M5 9h14v11H5zM8 9V5.5A2.5 2.5 0 0 1 10.5 3h3A2.5 2.5 0 0 1 16 5.5V9M8.5 14.5h.01M12 14.5h.01M15.5 14.5h.01" />
                ),
              },
              {
                n: "03",
                t: "Pickup or deliver",
                d: `Swing by ${BIZ.address} for free pickup, or get it delivered flat ${peso(BIZ.deliveryFee)} (minimum order ${peso(BIZ.minDelivery)}).`,
                icon: (
                  <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7M6.5 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm11 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" />
                ),
              },
            ].map((s, i) => (
              <Reveal key={s.n} delay={i * 0.12} className={cx("relative", i === 1 && "md:mt-10", i === 2 && "md:mt-20")}>
                <div className="relative z-10 w-14 h-14 rounded-full bg-espresso-900 text-gold-300 grid place-items-center shadow-soft">
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    {s.icon}
                  </svg>
                </div>
                <p className="mt-5 font-display font-semibold text-[52px] leading-none text-transparent [-webkit-text-stroke:1.5px_#C0913F] select-none">{s.n}</p>
                <h3 className="mt-2 font-display font-semibold text-[22px] text-espresso-900">{s.t}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-cocoa-600 max-w-[300px]">{s.d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ========================= THE SCOOP (about) ===================== */}
      <section className="relative max-w-6xl mx-auto px-4 py-20 grid lg:grid-cols-2 gap-12 items-center">
        <Reveal>
          <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-gold-600">The scoop on us</p>
          <h2 className="mt-2 font-display font-semibold text-espresso-900 text-[clamp(2rem,4.6vw,3.1rem)] leading-[1.08] tracking-tight">
            One recipe, one baker,
            <br />
            <em className="italic text-cocoa-500">zero shortcuts.</em>
          </h2>
          <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-cocoa-600 max-w-lg">
            <p>
              Scoopable started with a secondhand oven and a dough recipe that refused to behave until it was perfect. The secret is
              patience: dough rested overnight, butter browned low and slow, chocolate chopped by hand.
            </p>
            <p>
              Every scoop is portioned to order and chilled so the middle stays soft — that's the gooey part. Bake it at home for
              golden edges, or eat it straight from the tub and thank us later.
            </p>
          </div>
          <div className="mt-7 grid grid-cols-3 gap-4 max-w-md">
            {[
              ["24", "cookies per batch, never more"],
              ["14 min", "from scoop to your hands"],
              ["4.9★", "from 300+ neighbors"],
            ].map(([big, small]) => (
              <div key={big} className="border-l-2 border-gold-500/60 pl-3">
                <p className="font-display font-semibold text-[22px] text-espresso-900 leading-none">{big}</p>
                <p className="mt-1.5 text-[11.5px] font-semibold text-cocoa-500 leading-snug">{small}</p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.12} className="relative flex justify-center">
          <div className="relative w-[300px] sm:w-[360px]">
            <div className="rounded-[2rem] bg-espresso-900 p-8 pb-10 text-center overflow-hidden relative">
              <div className="absolute inset-0 dotgrid-dark opacity-60" aria-hidden />
              <div className="relative">
                <CookieMascot size={210} className="mx-auto cursor-pointer" />
                <p className="mt-2 font-display italic text-cream-100 text-[17px]">"Meet Crumb. Head of morale."</p>
                <p className="mt-1 text-[12px] text-cream-200/60">Hover him — he thinks he's cool.</p>
              </div>
            </div>
            {/* rotating badge */}
            <div className="absolute -top-7 -right-7 w-28 h-28 anim-spin-slow" style={{ animationDuration: "18s" }} aria-hidden>
              <svg viewBox="0 0 100 100" width="112" height="112">
                <defs>
                  <path id="circ" d="M50,50 m-36,0 a36,36 0 1,1 72,0 a36,36 0 1,1 -72,0" />
                </defs>
                <circle cx="50" cy="50" r="49" fill="#C0913F" />
                <circle cx="50" cy="50" r="26" fill="#FCF9F1" />
                <text fontSize="11.5" fontWeight="800" letterSpacing="2.5" fill="#2A1A0F">
                  <textPath href="#circ">FRESH · GOOEY · SCOOPABLE · FRESH ·</textPath>
                </text>
                <ellipse cx="44" cy="47" rx="4" ry="3.5" fill="#4A2E17" />
                <ellipse cx="56" cy="52" rx="4" ry="3.5" fill="#4A2E17" />
                <ellipse cx="50" cy="42" rx="3.5" ry="3" fill="#4A2E17" />
              </svg>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ============================ VISIT BAND ========================== */}
      <section id="visit" className="relative scroll-mt-28 bg-espresso-950 text-cream-100 overflow-hidden">
        <div className="absolute inset-0 dotgrid-dark opacity-50" aria-hidden />
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-gold-500/10 blur-3xl" aria-hidden />
        <div className="relative max-w-6xl mx-auto px-4 py-16 lg:py-20 grid lg:grid-cols-[1.1fr_1fr_1fr] gap-10">
          <Reveal>
            <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-gold-400">Craving now?</p>
            <h2 className="mt-2 font-display font-semibold text-[clamp(1.9rem,4vw,2.8rem)] leading-[1.06] tracking-tight">
              The dough's already
              <br />
              <em className="italic text-gold-300">chilled.</em>
            </h2>
            <p className="mt-4 text-[14.5px] text-cream-200/70 max-w-sm leading-relaxed">
              Order before 3 PM for same-day pickup. Delivery slots fill fast on weekends — the early bird gets the gooey center.
            </p>
            <button
              onClick={() => scrollTo("menu")}
              className="btn-sheen mt-6 inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-gold-400 text-espresso-900 font-bold text-[15px] hover:bg-gold-300 transition-all active:scale-[0.97]"
            >
              Start an order
              <ArrowDown size={16} strokeWidth={2.4} className="-rotate-90" />
            </button>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="h-full rounded-2xl border border-cream-200/12 bg-espresso-900/80 p-6">
              <span className="inline-grid w-11 h-11 place-items-center rounded-full bg-gold-500/15 text-gold-300">
                <MapPin size={20} />
              </span>
              <h3 className="mt-4 font-display font-semibold text-[21px]">Store pickup — free</h3>
              <p className="mt-2 text-[14px] text-cream-200/70 leading-relaxed">{BIZ.address}</p>
              <p className="mt-1 text-[14px] text-cream-200/70">{BIZ.hours}</p>
              <p className="mt-4 text-[12.5px] font-bold text-gold-300">Text us when you're near — we'll have it bagged.</p>
            </div>
          </Reveal>

          <Reveal delay={0.18}>
            <div className="h-full rounded-2xl border border-cream-200/12 bg-espresso-900/80 p-6">
              <span className="inline-grid w-11 h-11 place-items-center rounded-full bg-gold-500/15 text-gold-300">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7M6.5 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm11 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" />
                </svg>
              </span>
              <h3 className="mt-4 font-display font-semibold text-[21px]">Local delivery — {peso(BIZ.deliveryFee)}</h3>
              <p className="mt-2 text-[14px] text-cream-200/70 leading-relaxed">
                Flat rate around the neighborhood. Minimum order of {peso(BIZ.minDelivery)} applies.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {["GCash", "Maya", "Cash on delivery"].map((p) => (
                  <span key={p} className="px-3 py-1 rounded-full border border-gold-500/35 text-gold-300 text-[11.5px] font-bold">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
