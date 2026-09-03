import { Suspense, lazy, useEffect, useState } from "react";
import { HashRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Logo from "./components/Logo";
import Header from "./components/Header";
import Footer from "./components/Footer";
import CartDrawer from "./components/CartDrawer";
import ChatWidget from "./components/ChatWidget";
import Toasts from "./components/Toasts";
import LegalModal from "./components/LegalModal";
import Home from "./pages/Home";

/* code-split the heavier routes (recharts etc.) out of the initial bundle */
const Checkout = lazy(() => import("./pages/Checkout"));
const Admin = lazy(() => import("./pages/Admin"));
import { ShopProvider } from "./context/ShopContext";

/* scrolls to top whenever the route changes */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);
  return null;
}

/* short "scooping something sweet" splash on first load */
function LoadingScreen({ done }: { done: boolean }) {
  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="fixed inset-0 z-[100] bg-cream-100 grid place-items-center"
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="text-center">
            <Logo stacked size={132} tagline="Small-Batch Bakery" />
            <p className="mt-5 font-display font-semibold text-espresso-900 text-[22px]">Scooping something sweet…</p>
            <div className="mt-3 flex justify-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <span key={i} className="typing-dot w-2 h-2 rounded-full bg-gold-500 inline-block" style={{ animationDelay: `${i * 0.18}s` }} />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Shell() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  const [legal, setLegal] = useState<"privacy" | "terms" | null>(null);

  return (
    <div className="min-h-dvh flex flex-col">
      {!isAdmin && <Header />}
      <div className="flex-1">
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </div>
      {!isAdmin && <Footer onLegal={setLegal} />}
      {!isAdmin && <ChatWidget />}
      <CartDrawer />
      <Toasts />
      <LegalModal kind={legal} onClose={() => setLegal(null)} />
    </div>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), 1250);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <ShopProvider>
      <HashRouter>
        <ScrollToTop />
        <Shell />
        <LoadingScreen done={ready} />
      </HashRouter>
    </ShopProvider>
  );
}
