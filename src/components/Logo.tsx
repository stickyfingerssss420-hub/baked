import CookieMascot from "./CookieMascot";
import { cx } from "../lib/utils";

/* The official Scoopable Cookies lockup — mascot + full plain name.
   Used everywhere so the brand is instantly recognizable:
   header, footer, loading screen, checkout bar, admin portal, login. */

interface LogoProps {
  size?: number;            /* mascot size in px */
  dark?: boolean;           /* cream/gold text variant for dark backgrounds */
  stacked?: boolean;        /* mascot above the name, centered (splash & login) */
  tagline?: string | false; /* small line under the name; false hides it */
  className?: string;
}

export default function Logo({
  size = 44,
  dark = false,
  stacked = false,
  tagline = "Small-Batch Bakery",
  className,
}: LogoProps) {
  const nameColor = dark ? "text-cream-50" : "text-espresso-900";
  const cookiesColor = dark ? "text-gold-400" : "text-gold-600";
  const tagColor = dark ? "text-cream-200/60" : "text-cocoa-500";
  const nameSize = stacked
    ? "text-[clamp(1.7rem,5vw,2.2rem)]"
    : size >= 42
      ? "text-[22px]"
      : "text-[17px]";

  return (
    <span
      className={cx(
        "inline-flex items-center gap-2.5 leading-none select-none",
        stacked && "flex-col text-center gap-2.5",
        className,
      )}
    >
      <CookieMascot size={size} withShadow={stacked} />
      <span className="leading-none">
        <span className={cx("block font-display font-semibold tracking-tight whitespace-nowrap", nameSize, nameColor)}>
          Scoopable <em className={cx("italic", cookiesColor)}>Cookies</em>
        </span>
        {tagline !== false && (
          <span className={cx("block mt-1.5 font-body text-[9.5px] font-bold tracking-[0.28em] uppercase", tagColor)}>
            {tagline}
          </span>
        )}
      </span>
    </span>
  );
}
