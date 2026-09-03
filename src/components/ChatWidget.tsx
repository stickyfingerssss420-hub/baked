import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Send, X } from "lucide-react";
import CookieMascot from "./CookieMascot";
import { useShop } from "../context/ShopContext";
import { dateTime } from "../lib/utils";

/* Floating customer chat — syncs in realtime with the admin portal
   chat tab (same browser session / across tabs via the data bus). */

const NAME_KEY = "sc_chat_name";
const READ_KEY = "sc_chat_read";

export default function ChatWidget() {
  const { chat, sendChat } = useShop();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(() => localStorage.getItem(NAME_KEY) ?? "");
  const [nameDraft, setNameDraft] = useState("");
  const [text, setText] = useState("");
  const [botTyping, setBotTyping] = useState(false);
  const [unread, setUnread] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const myName = name;
  const thread = chat.filter((m) => m.name === myName && myName !== "");

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [thread.length, botTyping, open]);

  /* unread pulse when a reply arrives while closed */
  useEffect(() => {
    const last = thread[thread.length - 1];
    const readAt = Number(localStorage.getItem(READ_KEY) || 0);
    if (!open && last && last.role !== "customer" && last.ts > readAt) setUnread(true);
    if (open) {
      setUnread(false);
      localStorage.setItem(READ_KEY, String(Date.now()));
    }
  }, [thread, open]);

  const startChat = () => {
    const n = nameDraft.trim();
    if (!n) return;
    localStorage.setItem(NAME_KEY, n);
    setName(n);
  };

  const send = () => {
    const t = text.trim();
    if (!t || !myName) return;
    sendChat({ name: myName, role: "customer", text: t });
    setText("");
    // friendly bot acknowledgement if no human has replied yet
    const hasHumanReply = thread.some((m) => m.role === "admin");
    if (!hasHumanReply) {
      setBotTyping(true);
      window.setTimeout(() => {
        setBotTyping(false);
        sendChat({
          name: myName,
          role: "bot",
          text: `Hi ${myName}! Crumb here. I've pinged the baker — she usually replies within a few minutes, once the tray is out of the oven.`,
        });
      }, 1500);
    }
  };

  return (
    <>
      {/* panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-24 right-4 z-[60] w-[min(92vw,360px)] h-[480px] max-h-[70vh] rounded-2xl overflow-hidden shadow-lift border border-cocoa-500/15 bg-cream-50 flex flex-col"
            role="dialog"
            aria-label="Chat with Scoopable Cookies"
          >
            <div className="flex items-center gap-3 px-4 py-3 bg-espresso-900 text-cream-50 shrink-0">
              <CookieMascot size={40} withShadow={false} />
              <div className="flex-1 leading-tight">
                <p className="font-display font-semibold text-[16px]">
                  Scoopable <em className="italic text-gold-300">Cookies</em>
                </p>
                <p className="text-[11px] text-cream-200/70 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-leaf-400 inline-block" />
                  Live support · usually replies in minutes
                </p>
              </div>
              <button onClick={() => setOpen(false)} className="w-8 h-8 grid place-items-center rounded-full hover:bg-espresso-800 transition-colors" aria-label="Close chat">
                <X size={16} />
              </button>
            </div>

            {myName === "" ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6 text-center">
                <CookieMascot size={110} />
                <p className="font-display font-semibold text-[19px] text-espresso-900">Psst — who's asking?</p>
                <p className="text-[13px] text-cocoa-600">Drop your name so the baker knows who she's chatting with.</p>
                <input
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && startChat()}
                  placeholder="Your first name"
                  className="w-full px-4 py-2.5 rounded-full border border-cocoa-500/25 bg-cream-100 text-[14px] focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-400/30"
                />
                <button onClick={startChat} className="w-full py-2.5 rounded-full bg-espresso-900 text-cream-50 text-[14px] font-bold hover:bg-espresso-800 transition-colors">
                  Start chatting
                </button>
              </div>
            ) : (
              <>
                <div ref={scrollRef} className="flex-1 overflow-y-auto thin-scroll px-3.5 py-4 space-y-2.5 bg-cream-100/70">
                  {thread.length === 0 && (
                    <p className="text-center text-[12.5px] text-cocoa-500 pt-6">
                      Ask about flavors, bulk orders, delivery areas — anything.
                    </p>
                  )}
                  {thread.map((m) => (
                    <div key={m.id} className={`flex ${m.role === "customer" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[80%] px-3.5 py-2.5 text-[13.5px] leading-relaxed ${
                          m.role === "customer"
                            ? "bg-espresso-900 text-cream-50 rounded-2xl rounded-br-md"
                            : "bg-cream-50 border border-cocoa-500/12 text-espresso-900 rounded-2xl rounded-bl-md"
                        }`}
                      >
                        {m.role !== "customer" && (
                          <p className="text-[10.5px] font-extrabold tracking-wide uppercase mb-0.5 text-gold-600">
                            {m.role === "bot" ? "Crumb · auto" : "Baker"}
                          </p>
                        )}
                        {m.text}
                        <p className={`text-[10px] mt-1 ${m.role === "customer" ? "text-cream-200/60 text-right" : "text-cocoa-400"}`}>{dateTime(m.ts)}</p>
                      </div>
                    </div>
                  ))}
                  {botTyping && (
                    <div className="flex justify-start">
                      <div className="bg-cream-50 border border-cocoa-500/12 rounded-2xl rounded-bl-md px-4 py-3 flex gap-1.5">
                        {[0, 1, 2].map((i) => (
                          <span key={i} className="typing-dot w-1.5 h-1.5 rounded-full bg-cocoa-500 inline-block" style={{ animationDelay: `${i * 0.18}s` }} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="shrink-0 p-3 border-t border-cocoa-500/12 bg-cream-50 flex gap-2">
                  <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && send()}
                    placeholder={`Message as ${myName}…`}
                    className="flex-1 px-4 py-2.5 rounded-full border border-cocoa-500/25 bg-cream-100 text-[13.5px] focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-400/30"
                  />
                  <button
                    onClick={send}
                    disabled={!text.trim()}
                    className="w-10 h-10 grid place-items-center rounded-full bg-espresso-900 text-cream-50 hover:bg-espresso-800 disabled:opacity-35 transition-all active:scale-90"
                    aria-label="Send message"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* launcher */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`fixed bottom-5 right-4 z-[60] w-14 h-14 rounded-full bg-espresso-900 grid place-items-center shadow-lift hover:bg-espresso-800 transition-all hover:scale-105 active:scale-95 ${unread && !open ? "pulse-ring relative" : ""}`}
        aria-label={open ? "Close chat" : "Chat with us"}
      >
        <CookieMascot size={42} withShadow={false} animate={!open} />
      </button>
    </>
  );
}
