import { useState } from "react";
import { Check, Share2 } from "lucide-react";
import { useShop } from "../context/ShopContext";
import { BIZ } from "../data/catalog";

/* One-tap sharing: native share sheet on phones/tablets (Messenger, FB,
   IG stories, WhatsApp…), copy-to-clipboard with toast on desktop. */

const shareUrl = () => window.location.origin + window.location.pathname;

const copyFallback = async () => {
  const url = shareUrl();
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = url;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      return true;
    } catch {
      return false;
    }
  }
};

export default function ShareButton({ className = "" }: { className?: string }) {
  const { toast } = useShop();
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const data = {
      title: `${BIZ.name} — Fresh, Gooey, Dangerously Scoopable`,
      text: "Hand-scooped cookie dough (₱50) and fudge brownie batter (₱80). Pickup or delivery — order online!",
      url: shareUrl(),
    };

    if (navigator.share) {
      try {
        await navigator.share(data);
      } catch {
        /* user dismissed the sheet — nothing to do */
      }
      return;
    }

    const ok = await copyFallback();
    if (ok) {
      setCopied(true);
      toast("Link copied", { sub: "Paste it in any chat, post, or bio" });
      window.setTimeout(() => setCopied(false), 2200);
    } else {
      toast("Copy this link", { sub: shareUrl() });
    }
  };

  return (
    <button
      onClick={handleShare}
      className={`w-11 h-11 grid place-items-center rounded-full border border-cocoa-500/25 text-cocoa-600 bg-cream-50 hover:border-espresso-900 hover:text-espresso-900 transition-all hover:-translate-y-0.5 active:scale-90 ${className}`}
      aria-label="Share this shop"
      title="Share the shop"
    >
      {copied ? <Check size={19} strokeWidth={2.6} className="text-leaf-500" /> : <Share2 size={18} />}
    </button>
  );
}
