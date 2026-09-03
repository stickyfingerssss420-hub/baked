import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingBasket } from "lucide-react";
import Logo from "./Logo";
import { useShop } from "../context/ShopContext";
import { BIZ } from "../data/catalog";
import { cx } from "../lib/utils";

const NAV = [
  { id: "menu", label: "The Menu" },
  { id: "how", label: "How It Works" },
  { id: "visit", label: "Visit Us" },
];

export default function Header() {
  const { count, bumpKey, setDrawerOpen } = useShop();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goAnchor = (id: string) => {
    const scroll = () => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    if (location.pathname !== "/") {
      navigate("/");
      window.setTimeout(scroll, 140);
    } else {
      scroll();
    }
  };

  return (
    <>
      {/* announcement ribbon */}
      <div className="bg-espresso-900 text-cream-100 text-[12px] sm:text-[13px] font-medium tracking-wide">
        <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-center gap-2 text-center">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse" />
          <p>
            Fresh dough scooped daily — order before <span className="text-gold-300 font-bold">3 PM</span> for same-day
            pickup at {BIZ.address}
          </p>
        </div>
      </div>

      <header
        className={cx(
          "sticky top-0 z-40 border-b transition-all duration-300",
          scrolled ? "bg-cream-50/92 backdrop-blur-md border-cocoa-500/15 shadow-soft" : "bg-cream-100 border-transparent",
        )}
      >
        <div className="max-w-6xl mx-auto px-4 h-[68px] flex items-center justify-between gap-3">
          {/* brand — full logo lockup so the shop name is always obvious */}
          <Link to="/" className="group shrink-0 transition-transform duration-300 hover:-rotate-1" aria-label="Scoopable Cookies home">
            <Logo size={42} tagline="Small-Batch Bakery" />
          </Link>

          {/* nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV.map((n) => (
              <button
                key={n.id}
                onClick={() => goAnchor(n.id)}
                className="px-3.5 py-2 text-[14px] font-semibold text-cocoa-600 hover:text-espresso-900 rounded-full hover:bg-cream-200/80 transition-colors"
              >
                {n.label}
              </button>
            ))}
            <Link
              to="/admin"
              className="ml-1 px-3.5 py-2 text-[14px] font-semibold text-cocoa-500 hover:text-espresso-900 rounded-full hover:bg-cream-200/80 transition-colors"
            >
              Admin
            </Link>
          </nav>

          {/* cart */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="btn-sheen relative flex items-center gap-2 bg-espresso-900 hover:bg-espresso-800 text-cream-50 pl-4 pr-3.5 py-2.5 rounded-full font-bold text-[14px] transition-all hover:shadow-lift active:scale-95"
            aria-label={`Open cart, ${count} items`}
          >
            <ShoppingBasket size={18} strokeWidth={2.4} />
            <span className="hidden sm:inline">Tray</span>
            <span
              key={bumpKey}
              className={cx(
                "min-w-[22px] h-[22px] px-1 grid place-items-center rounded-full bg-gold-400 text-espresso-900 text-[12px] font-extrabold",
                bumpKey > 0 && "anim-pop",
              )}
            >
              {count}
            </span>
          </button>
        </div>

        {/* mobile quick-nav */}
        <nav className="md:hidden flex items-center gap-1 px-3 pb-2 overflow-x-auto no-scrollbar">
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => goAnchor(n.id)}
              className="shrink-0 px-3 py-1.5 text-[13px] font-semibold text-cocoa-600 rounded-full bg-cream-200/70 active:bg-cream-300"
            >
              {n.label}
            </button>
          ))}
          <Link to="/admin" className="shrink-0 px-3 py-1.5 text-[13px] font-semibold text-cocoa-500 rounded-full bg-cream-200/70">
            Admin
          </Link>
        </nav>
      </header>
    </>
  );
}
