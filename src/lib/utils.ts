/* Shared helpers: formatting, ids, dates, image compression */

export const peso = (n: number) =>
  "₱" + Math.round(n).toLocaleString("en-PH");

export const pesoFrom = (n: number) =>
  n % 1 === 0 ? peso(n) : "₱" + n.toLocaleString("en-PH", { maximumFractionDigits: 2 });

let counter = 0;
export const uid = (prefix = "id") =>
  `${prefix}-${Date.now().toString(36)}-${(counter++).toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 7)}`;

export const orderNumber = () =>
  "SC-" + Math.random().toString(36).slice(2, 6).toUpperCase() + "-" + String(Math.floor(100 + Math.random() * 900));

export const dateShort = (ts: number) =>
  new Date(ts).toLocaleDateString("en-PH", { month: "short", day: "numeric" });

export const dateTime = (ts: number) =>
  new Date(ts).toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

export const timeAgo = (ts: number) => {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return d === 1 ? "yesterday" : `${d}d ago`;
};

/* Deterministic PRNG for seeding demo analytics data */
export const mulberry32 = (seed: number) => {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/* Compress an uploaded proof-of-payment image to a compact data-URL
   so it can live safely in localStorage. */
export const compressImage = (file: File, maxSize = 900, quality = 0.72): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Not a valid image"));
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas unavailable"));
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });

export const cx = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(" ");
