import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BarChart3, CheckCircle2, Eye, EyeOff, LogOut, MessageCircle, Package, Receipt } from "lucide-react";
import { Link } from "react-router-dom";
import CookieMascot from "../components/CookieMascot";
import Logo from "../components/Logo";
import { useShop } from "../context/ShopContext";
import { cx } from "../lib/utils";
import Analytics from "./admin/Analytics";
import Orders from "./admin/Orders";
import Inventory from "./admin/Inventory";
import AdminChat from "./admin/Chat";
import QuickStart from "./admin/QuickStart";

type Tab = "overview" | "orders" | "inventory" | "chat";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "overview", label: "Overview", icon: <BarChart3 size={16} /> },
  { id: "orders", label: "Orders", icon: <Receipt size={16} /> },
  { id: "inventory", label: "Inventory", icon: <Package size={16} /> },
  { id: "chat", label: "Live Chat", icon: <MessageCircle size={16} /> },
];

/* ------------------------------- login ------------------------------ */

function Login() {
  const { login, toast } = useShop();
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);

  const submit = () => {
    if (login(user, pass)) {
      toast("Welcome back, boss", { sub: "The scoop station is yours." });
    } else {
      setError(true);
      setShakeKey((k) => k + 1);
    }
  };

  return (
    <main className="relative min-h-screen bg-espresso-950 text-cream-100 grid lg:grid-cols-2 overflow-hidden">
      <div className="absolute inset-0 dotgrid-dark opacity-50" aria-hidden />

      {/* brand side */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 bg-espresso-900/60 border-r border-cream-200/10">
        <Link to="/" className="w-fit transition-opacity hover:opacity-85" aria-label="Back to the store">
          <Logo dark size={44} tagline="Back of House" />
        </Link>
        <div>
          <CookieMascot size={240} className="cursor-pointer" />
          <h1 className="mt-6 font-display font-semibold text-[clamp(2rem,3.6vw,3rem)] leading-[1.06]">
            The dough is
            <br />
            <em className="italic text-gold-300">listening.</em>
          </h1>
          <p className="mt-3 text-[14.5px] text-cream-200/65 max-w-sm leading-relaxed">
            Orders, payments, inventory and customer chat — everything live, everything in one warm place.
          </p>
        </div>
        <p className="text-[12px] text-cream-200/40">Authorized bakers only. Crumb is watching.</p>
      </div>

      {/* form side */}
      <div className="relative flex items-center justify-center p-6">
        <motion.div
          key={shakeKey}
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className={cx("w-full max-w-md rounded-2xl bg-cream-50 text-espresso-900 p-8 shadow-lift", error && "anim-shake")}
        >
          <div className="lg:hidden mb-6">
            <Logo size={38} tagline="Admin Portal" />
          </div>
          <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-gold-600">Admin portal</p>
          <h2 className="mt-1.5 font-display font-semibold text-[30px] leading-tight">Clock in, baker.</h2>
          <p className="mt-1 text-[13.5px] text-cocoa-600">Enter your credentials to open the back of house.</p>

          <div className="mt-6 space-y-4">
            <div>
              <label htmlFor="adm-user" className="block text-[11px] font-extrabold tracking-[0.14em] uppercase text-cocoa-500 mb-1.5">
                Username
              </label>
              <input
                id="adm-user"
                value={user}
                onChange={(e) => {
                  setUser(e.target.value);
                  setError(false);
                }}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                className="w-full px-4 py-3 rounded-xl border border-cocoa-500/25 bg-cream-100 text-[14.5px] focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-400/30"
                placeholder="username"
                autoComplete="username"
              />
            </div>
            <div>
              <label htmlFor="adm-pass" className="block text-[11px] font-extrabold tracking-[0.14em] uppercase text-cocoa-500 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="adm-pass"
                  type={show ? "text" : "password"}
                  value={pass}
                  onChange={(e) => {
                    setPass(e.target.value);
                    setError(false);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-cocoa-500/25 bg-cream-100 text-[14.5px] focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-400/30"
                  placeholder="••••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-cocoa-400 hover:text-espresso-900 transition-colors"
                  aria-label={show ? "Hide password" : "Show password"}
                >
                  {show ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-[13px] font-bold text-danger-500 flex items-center gap-1.5">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
                  <circle cx="12" cy="12" r="9" />
                  <path d="M9 9l6 6M15 9l-6 6" />
                </svg>
                Wrong username or password. Try again.
              </p>
            )}

            <button
              onClick={submit}
              className="btn-sheen w-full py-3.5 rounded-full bg-espresso-900 text-cream-50 font-bold text-[15px] hover:bg-espresso-800 transition-all active:scale-[0.98]"
            >
              Unlock the bakery
            </button>
            <Link to="/" className="block text-center text-[13px] font-semibold text-cocoa-500 hover:text-espresso-900 transition-colors">
              Back to the storefront
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  );
}

/* ----------------------------- dashboard ---------------------------- */

function Dashboard() {
  const { logout, orders, admin } = useShop();
  const [tab, setTab] = useState<Tab>("overview");
  const pendingCount = orders.filter((o) => o.status === "pending").length;

  return (
    <main className="relative min-h-screen bg-espresso-950 text-cream-100">
      <div className="absolute inset-0 dotgrid-dark opacity-40 pointer-events-none" aria-hidden />

      {/* topbar */}
      <header className="relative sticky top-0 z-40 bg-espresso-950/92 backdrop-blur-md border-b border-cream-200/10">
        <div className="max-w-6xl mx-auto px-4 h-[64px] flex items-center justify-between gap-3">
          <Link to="/" className="transition-opacity hover:opacity-85" aria-label="Back to the store">
            <Logo dark size={34} tagline="Back of House" />
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cx(
                  "relative flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-bold transition-all",
                  tab === t.id ? "bg-gold-400 text-espresso-900" : "text-cream-200/70 hover:text-cream-50 hover:bg-cream-200/10",
                )}
              >
                {t.icon}
                {t.label}
                {t.id === "orders" && pendingCount > 0 && (
                  <span className="ml-0.5 min-w-[18px] h-[18px] px-1 grid place-items-center rounded-full bg-danger-500 text-cream-50 text-[10px] font-extrabold">
                    {pendingCount}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2.5">
            <span className="hidden sm:flex items-center gap-1.5 text-[11.5px] font-bold text-leaf-400">
              <span className="w-1.5 h-1.5 rounded-full bg-leaf-400 animate-pulse" />
              Live
            </span>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-cream-200/15 text-cream-200/80 hover:text-cream-50 hover:border-cream-200/40 text-[12.5px] font-bold transition-all"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Log out</span>
            </button>
          </div>
        </div>

        {/* mobile tabs */}
        <nav className="md:hidden flex items-center gap-1.5 px-3 pb-2.5 overflow-x-auto no-scrollbar">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cx(
                "shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12.5px] font-bold transition-all",
                tab === t.id ? "bg-gold-400 text-espresso-900" : "bg-cream-200/10 text-cream-200/70",
              )}
            >
              {t.icon}
              {t.label}
              {t.id === "orders" && pendingCount > 0 && (
                <span className="min-w-[17px] h-[17px] px-1 grid place-items-center rounded-full bg-danger-500 text-cream-50 text-[10px] font-extrabold">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </nav>
      </header>

      <div className="relative max-w-6xl mx-auto px-4 py-7">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-[10.5px] font-bold tracking-[0.28em] uppercase text-gold-400">
              {new Date().toLocaleDateString("en-PH", { weekday: "long", month: "long", day: "numeric" })}
            </p>
            <h1 className="font-display font-semibold text-[clamp(1.5rem,3.5vw,2.1rem)] text-cream-50 mt-1">
              Hey {admin?.user === "stickyfinger420" ? "boss" : admin?.user} — here's the batch report.
            </h1>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {tab === "overview" && (
              <>
                <QuickStart />
                <Analytics />
              </>
            )}
            {tab === "orders" && <Orders />}
            {tab === "inventory" && <Inventory />}
            {tab === "chat" && <AdminChat />}
          </motion.div>
        </AnimatePresence>
      </div>

      <footer className="relative border-t border-cream-200/10 mt-10">
        <div className="max-w-6xl mx-auto px-4 py-5 flex flex-wrap items-center justify-between gap-2 text-[11.5px] text-cream-200/45">
          <p>Scoopable Cookies · Admin Portal</p>
          <p className="flex items-center gap-1.5">
            <CheckCircle2 size={13} className="text-leaf-400" />
            Realtime sync is on — open the storefront in another tab and watch orders land.
          </p>
        </div>
      </footer>
    </main>
  );
}

export default function Admin() {
  const { admin } = useShop();
  return admin ? <Dashboard /> : <Login />;
}
