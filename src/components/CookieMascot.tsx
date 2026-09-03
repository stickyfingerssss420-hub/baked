import { cx } from "../lib/utils";

/* ------------------------------------------------------------------ */
/*  "Crumb" — the Scoopable Cookies mascot.                            */
/*  Pure SVG: idles with a gentle bob + periodic blink; on hover the   */
/*  sunglasses slide down, the smile turns into a smirk, the arm       */
/*  wiggles and a gold sparkle appears. Cute, but cool.                */
/* ------------------------------------------------------------------ */

interface Props {
  size?: number;
  className?: string;
  animate?: boolean;
  withShadow?: boolean;
}

export default function CookieMascot({ size = 120, className, animate = true, withShadow = true }: Props) {
  return (
    <svg
      viewBox="0 0 220 220"
      width={size}
      height={size}
      className={cx("mascot select-none", className)}
      role="img"
      aria-label="Crumb, the Scoopable Cookies mascot"
    >
      <defs>
        <radialGradient id="cookieBody" gradientUnits="userSpaceOnUse" cx="100" cy="92" r="110">
          <stop offset="0%" stopColor="#EDC184" />
          <stop offset="55%" stopColor="#DCA863" />
          <stop offset="100%" stopColor="#C08344" />
        </radialGradient>
        <radialGradient id="chipGrad" cx="35%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#5C3A1E" />
          <stop offset="100%" stopColor="#3A2311" />
        </radialGradient>
      </defs>

      {/* ground shadow */}
      {withShadow && <ellipse className="mascot-shadow" cx="110" cy="198" rx="48" ry="9" fill="#744D2A" opacity="0.3" />}

      <g className={animate ? "mascot-bob" : undefined}>
        {/* bumpy cookie silhouette (main disc + edge bumps) */}
        <g fill="url(#cookieBody)">
          <circle cx="110" cy="112" r="74" />
          <circle cx="184" cy="112" r="13" />
          <circle cx="170" cy="155" r="12" />
          <circle cx="136" cy="181" r="13" />
          <circle cx="88" cy="183" r="12" />
          <circle cx="52" cy="158" r="13" />
          <circle cx="37" cy="112" r="12" />
          <circle cx="52" cy="66" r="13" />
          <circle cx="88" cy="41" r="12" />
          <circle cx="136" cy="41" r="13" />
          <circle cx="170" cy="67" r="12" />
        </g>

        {/* soft inner shading */}
        <ellipse cx="110" cy="146" rx="58" ry="26" fill="#A97C50" opacity="0.22" />
        <ellipse cx="92" cy="76" rx="40" ry="22" fill="#F3D9A6" opacity="0.4" />

        {/* chocolate chips */}
        <g>
          <ellipse cx="70" cy="98" rx="9" ry="8" fill="url(#chipGrad)" transform="rotate(-14 70 98)" />
          <ellipse cx="152" cy="92" rx="8.5" ry="7.5" fill="url(#chipGrad)" transform="rotate(18 152 92)" />
          <ellipse cx="110" cy="58" rx="8" ry="7" fill="url(#chipGrad)" transform="rotate(8 110 58)" />
          <ellipse cx="58" cy="136" rx="7.5" ry="7" fill="url(#chipGrad)" transform="rotate(-22 58 136)" />
          <ellipse cx="163" cy="132" rx="8" ry="7" fill="url(#chipGrad)" transform="rotate(24 163 132)" />
          <ellipse cx="92" cy="162" rx="7" ry="6.5" fill="url(#chipGrad)" transform="rotate(-8 92 162)" />
          <ellipse cx="132" cy="158" rx="7.5" ry="6.5" fill="url(#chipGrad)" transform="rotate(14 132 158)" />
          {/* chip glints */}
          <circle cx="67" cy="95" r="2" fill="#8F6238" opacity="0.9" />
          <circle cx="149" cy="89" r="2" fill="#8F6238" opacity="0.9" />
          <circle cx="107" cy="55" r="1.8" fill="#8F6238" opacity="0.9" />
        </g>

        {/* left arm */}
        <g>
          <path d="M44 122 Q30 128 26 142" stroke="#C08344" strokeWidth="11" strokeLinecap="round" fill="none" />
          <circle cx="26" cy="145" r="8" fill="#DCA863" />
        </g>

        {/* right arm (waves on hover) */}
        <g className="mascot-wave">
          <path d="M176 122 Q190 114 194 100" stroke="#C08344" strokeWidth="11" strokeLinecap="round" fill="none" />
          <circle cx="195" cy="97" r="8" fill="#DCA863" />
        </g>

        {/* face */}
        <g>
          {/* eyes: blink idly; right eye winks on hover */}
          <g className="mascot-eye">
            <circle cx="88" cy="102" r="7.5" fill="#2B1A10" />
            <circle cx="85.5" cy="99.5" r="2.4" fill="#FCF9F1" />
          </g>
          <g className="mascot-eye mascot-eye-wink">
            <circle cx="132" cy="102" r="7.5" fill="#2B1A10" />
            <circle cx="129.5" cy="99.5" r="2.4" fill="#FCF9F1" />
          </g>
          {/* rosy cheeks */}
          <circle cx="74" cy="118" r="9" fill="#E59A7E" opacity="0.55" />
          <circle cx="146" cy="118" r="9" fill="#E59A7E" opacity="0.55" />
          {/* smiles: default sweet, smirk on hover */}
          <path className="mascot-smile-default" d="M96 126 Q110 139 124 126" stroke="#2B1A10" strokeWidth="4.5" strokeLinecap="round" fill="none" />
          <path className="mascot-smile-smirk" d="M95 124 Q112 142 127 121" stroke="#2B1A10" strokeWidth="4.5" strokeLinecap="round" fill="none" />
        </g>

        {/* sunglasses resting on the forehead — slide down on hover */}
        <g className="mascot-shades">
          <path d="M64 78 L54 66 M156 78 L166 66 M104 78 Q110 74 116 78" stroke="#1F120A" strokeWidth="5" strokeLinecap="round" fill="none" />
          <circle cx="86" cy="80" r="16" fill="#1F120A" />
          <circle cx="134" cy="80" r="16" fill="#1F120A" />
          <path d="M76 74 Q82 69 90 70" stroke="#D4A85C" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.8" />
          <path d="M124 74 Q130 69 138 70" stroke="#D4A85C" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.8" />
        </g>

        {/* sparkle (appears on hover) */}
        <g className="mascot-sparkle">
          <path d="M188 52 L192 62 L202 66 L192 70 L188 80 L184 70 L174 66 L184 62 Z" fill="#D4A85C" />
          <circle cx="168" cy="42" r="3" fill="#D4A85C" />
        </g>
      </g>
    </svg>
  );
}
