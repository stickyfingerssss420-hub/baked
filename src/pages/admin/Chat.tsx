import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Send } from "lucide-react";
import CookieMascot from "../../components/CookieMascot";
import { useShop } from "../../context/ShopContext";
import { cx, dateTime, timeAgo } from "../../lib/utils";

/* Admin side of the live chat — conversations grouped per customer. */

export default function AdminChat() {
  const { chat, sendChat, toast } = useShop();
  const [activeName, setActiveName] = useState<string | null>(null);
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const convos = useMemo(() => {
    const map = new Map<string, { name: string; last: (typeof chat)[number]; unread: boolean }>();
    for (const m of chat) {
      const prev = map.get(m.name);
      map.set(m.name, {
        name: m.name,
        last: m,
        unread: (prev?.unread ?? false) || (m.role === "customer" && (!prev || prev.last.role === "customer")),
      });
    }
    return [...map.values()].sort((a, b) => b.last.ts - a.last.ts);
  }, [chat]);

  useEffect(() => {
    if (!activeName && convos.length > 0) setActiveName(convos[0].name);
  }, [convos, activeName]);

  const thread = useMemo(() => chat.filter((m) => m.name === activeName), [chat, activeName]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [thread.length, activeName]);

  const send = () => {
    const t = text.trim();
    if (!t || !activeName) return;
    sendChat({ name: activeName, role: "admin", text: t });
    setText("");
    toast("Reply sent", { sub: `To ${activeName} in real time` });
  };

  return (
    <div className="rounded-xl border border-cream-200/10 bg-espresso-900/70 overflow-hidden grid md:grid-cols-[280px_1fr] h-[560px]">
      {/* conversation list */}
      <aside className={cx("border-r border-cream-200/10 overflow-y-auto thin-scroll", activeName && "hidden md:block")}>
        <div className="px-4 py-3.5 border-b border-cream-200/10">
          <p className="font-display font-semibold text-[17px] text-cream-50">Conversations</p>
          <p className="text-[11.5px] text-cream-200/50 mt-0.5">{convos.length} customer{convos.length === 1 ? "" : "s"} chatting</p>
        </div>
        {convos.length === 0 ? (
          <div className="p-6 text-center">
            <CookieMascot size={90} className="mx-auto opacity-90" />
            <p className="mt-2 text-[13px] text-cream-200/60 leading-relaxed">
              No messages yet. When customers use the chat bubble on the storefront, they appear here instantly.
            </p>
          </div>
        ) : (
          <ul>
            {convos.map((c) => (
              <li key={c.name}>
                <button
                  onClick={() => setActiveName(c.name)}
                  className={cx(
                    "w-full text-left px-4 py-3.5 border-b border-cream-200/6 transition-colors",
                    activeName === c.name ? "bg-gold-400/10" : "hover:bg-cream-200/5",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className={cx("text-[13.5px] font-extrabold", c.unread ? "text-gold-300" : "text-cream-50")}>{c.name}</p>
                    <span className="text-[10.5px] font-bold text-cream-200/40">{timeAgo(c.last.ts)}</span>
                  </div>
                  <p className="mt-0.5 text-[12px] text-cream-200/55 truncate">
                    {c.last.role === "admin" ? "You: " : c.last.role === "bot" ? "Crumb: " : ""}
                    {c.last.text}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </aside>

      {/* thread */}
      <section className={cx("flex flex-col min-h-0", !activeName && "hidden md:flex")}>
        {!activeName ? (
          <div className="flex-1 grid place-items-center text-center p-8">
            <div>
              <CookieMascot size={120} className="mx-auto" />
              <p className="mt-3 font-display font-semibold text-[19px] text-cream-50">Pick a conversation</p>
              <p className="text-[13px] text-cream-200/55 mt-1">Replies go straight to the customer's chat bubble.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 px-4 py-3 border-b border-cream-200/10 shrink-0">
              <button onClick={() => setActiveName(null)} className="md:hidden p-1.5 -ml-1 rounded-full hover:bg-cream-200/10 text-cream-200/70" aria-label="Back">
                <ArrowLeft size={17} />
              </button>
              <span className="w-9 h-9 grid place-items-center rounded-full bg-gold-400 text-espresso-950 font-extrabold text-[15px]">
                {activeName.charAt(0).toUpperCase()}
              </span>
              <div className="leading-tight">
                <p className="text-[14px] font-extrabold text-cream-50">{activeName}</p>
                <p className="text-[11px] text-leaf-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-leaf-400 animate-pulse inline-block" /> live now
                </p>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto thin-scroll px-4 py-4 space-y-2.5 bg-espresso-950/40">
              {thread.map((m) => (
                <div key={m.id} className={cx("flex", m.role === "admin" ? "justify-end" : "justify-start")}>
                  <div
                    className={cx(
                      "max-w-[78%] px-3.5 py-2.5 text-[13.5px] leading-relaxed rounded-2xl",
                      m.role === "admin" ? "bg-gold-400 text-espresso-950 rounded-br-md" : "bg-cream-200/10 text-cream-100 rounded-bl-md",
                    )}
                  >
                    {m.role === "bot" && <p className="text-[10px] font-extrabold uppercase tracking-wide text-gold-300 mb-0.5">Crumb · auto-reply</p>}
                    {m.text}
                    <p className={cx("text-[10px] mt-1", m.role === "admin" ? "text-espresso-900/60 text-right" : "text-cream-200/40")}>{dateTime(m.ts)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="shrink-0 p-3 border-t border-cream-200/10 flex gap-2">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder={`Reply to ${activeName}…`}
                className="flex-1 px-4 py-2.5 rounded-full bg-espresso-950/70 border border-cream-200/15 text-[13.5px] text-cream-50 placeholder:text-cream-200/35 focus:outline-none focus:border-gold-500"
              />
              <button
                onClick={send}
                disabled={!text.trim()}
                className="w-10 h-10 grid place-items-center rounded-full bg-gold-400 text-espresso-950 hover:bg-gold-300 disabled:opacity-35 transition-all active:scale-90"
                aria-label="Send reply"
              >
                <Send size={16} />
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
