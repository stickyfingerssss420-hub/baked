import { Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "./Logo";
import { BIZ } from "../data/catalog";

interface Props {
  onLegal: (kind: "privacy" | "terms") => void;
}

export default function Footer({ onLegal }: Props) {
  return (
    <footer className="relative bg-espresso-950 text-cream-200 overflow-hidden">
      <div className="absolute inset-0 dotgrid-dark opacity-60" aria-hidden />
      <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-gold-500/10 blur-3xl" aria-hidden />

      <div className="relative max-w-6xl mx-auto px-4 pt-14 pb-8">
        <div className="grid gap-10 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
          {/* brand */}
          <div>
            <Logo dark size={46} tagline="Small-Batch · Quezon City" />
            <p className="mt-4 text-[14px] leading-relaxed text-cream-200/75 max-w-xs">
              Scoopable cookie dough and dense fudge brownie batter — made fresh in small batches, chilled and ready for your oven (or your spoon).
            </p>
            <div className="mt-5 flex items-center gap-2.5">
              {[
                { label: "Facebook", d: "M13.5 3H11a4 4 0 0 0-4 4v2H4.5v3H7v8h3v-8h2.6l.4-3H10V7.5A1.5 1.5 0 0 1 11.5 6h2z" },
                { label: "Instagram", d: "M8 4h8a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4zm4 4.2A3.8 3.8 0 1 0 15.8 12 3.8 3.8 0 0 0 12 8.2zM12 10a2 2 0 1 1-2 2 2 2 0 0 1 2-2zm4.9-2.6a.9.9 0 1 0 .9.9.9.9 0 0 0-.9-.9z" },
                { label: "TikTok", d: "M14.5 3h-3v11.3a2.6 2.6 0 1 1-2.6-2.6c.3 0 .5 0 .8.1V8.7a5.7 5.7 0 0 0-.8-.1 5.7 5.7 0 1 0 5.7 5.7V9.9A7 7 0 0 0 18.5 11V8a4.1 4.1 0 0 1-4-3.4z" },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.label === "Facebook" ? "https://facebook.com" : s.label === "Instagram" ? "https://instagram.com" : "https://tiktok.com"}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.label}
                  className="w-9 h-9 grid place-items-center rounded-full border border-cream-200/20 text-cream-200/70 hover:text-espresso-900 hover:bg-gold-400 hover:border-gold-400 transition-all hover:-translate-y-0.5"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden>
                    <path d={s.d} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* contact */}
          <div>
            <p className="text-[11px] font-bold tracking-[0.24em] uppercase text-gold-400">Say hello</p>
            <ul className="mt-4 space-y-3 text-[14px]">
              <li className="flex items-start gap-2.5">
                <MapPin size={16} className="mt-0.5 text-gold-400 shrink-0" />
                <span>{BIZ.address}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Phone size={16} className="mt-0.5 text-gold-400 shrink-0" />
                <a href={`tel:${BIZ.phone}`} className="hover:text-gold-300 transition-colors">{BIZ.phone}</a>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail size={16} className="mt-0.5 text-gold-400 shrink-0" />
                <a href={`mailto:${BIZ.email}`} className="break-all hover:text-gold-300 transition-colors">{BIZ.email}</a>
              </li>
            </ul>
          </div>

          {/* hours */}
          <div>
            <p className="text-[11px] font-bold tracking-[0.24em] uppercase text-gold-400">Scoop hours</p>
            <ul className="mt-4 space-y-2 text-[14px] text-cream-200/85">
              <li>{BIZ.hours}</li>
              <li className="text-cream-200/60">Closed Mondays — we rest the dough.</li>
              <li className="pt-1 text-gold-300 font-semibold">Store pickup is always free.</li>
            </ul>
          </div>

          {/* links */}
          <div>
            <p className="text-[11px] font-bold tracking-[0.24em] uppercase text-gold-400">Good to know</p>
            <ul className="mt-4 space-y-2 text-[14px]">
              <li><button onClick={() => onLegal("privacy")} className="hover:text-gold-300 transition-colors">Privacy Policy</button></li>
              <li><button onClick={() => onLegal("terms")} className="hover:text-gold-300 transition-colors">Terms of Service</button></li>
              <li><Link to="/admin" className="hover:text-gold-300 transition-colors">Admin Portal</Link></li>
              <li><Link to="/checkout" className="hover:text-gold-300 transition-colors">Checkout</Link></li>
            </ul>
          </div>
        </div>

        {/* allergen warning */}
        <div className="mt-12 flex items-start sm:items-center gap-3 rounded-xl border border-gold-500/30 bg-gold-500/8 px-4 py-3.5">
          <svg viewBox="0 0 24 24" width="22" height="22" className="shrink-0 text-gold-400" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
            <path d="M12 21c0-6 2-11 8-14-1 6-3 11-8 14z" />
            <path d="M12 21C12 15 10 10 4 7c1 6 3 11 8 14z" />
            <path d="M12 21v-8" />
          </svg>
          <p className="text-[13px] leading-relaxed text-cream-200/85">
            <span className="font-bold text-gold-300">Allergen Warning:</span> Contains wheat, eggs, dairy, and nuts. Baked in a home
            kitchen that handles these ingredients daily — please order mindfully. Dough is best baked within 3 days; keep it chilled.
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-cream-200/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[12.5px] text-cream-200/55">
          <p>© {new Date().getFullYear()} {BIZ.name}. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Baked with butter
            <svg viewBox="0 0 24 24" width="13" height="13" fill="#D4A85C" aria-hidden>
              <path d="M12 21s-7.5-4.7-9.5-9A5.4 5.4 0 0 1 12 6.6 5.4 5.4 0 0 1 21.5 12c-2 4.3-9.5 9-9.5 9z" />
            </svg>
            in Quezon City
          </p>
        </div>
      </div>
    </footer>
  );
}
