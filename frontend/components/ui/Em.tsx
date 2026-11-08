import type { CSSProperties, ReactNode } from "react";

/**
 * Line icons that stand in for emoji (consistent look, take the surrounding text colour).
 * Usage: <Em c="🎁" /> — the emoji is only the lookup key; nothing emoji is rendered.
 */
const P: Record<string, ReactNode> = {
  gift: <><rect x="3" y="8" width="18" height="4" rx="1" /><path d="M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" /><path d="M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5" /></>,
  sparkles: <><path d="M11 3l1.9 5.1L18 10l-5.1 1.9L11 17l-1.9-5.1L4 10l5.1-1.9z" /><path d="M19 3v4M17 5h4M19 17v4M17 19h4" /></>,
  gem: <><path d="M6 3h12l4 6-10 12L2 9z" /><path d="M11 3 8 9l4 12 4-12-3-6M2 9h20" /></>,
  truck: <><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2M15 18H9" /><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14" /><circle cx="17" cy="18" r="2" /><circle cx="7" cy="18" r="2" /></>,
  refresh: <><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16M8 16H3v5" /></>,
  lock: <><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>,
  bolt: <path d="M13 2 3 14h9l-1 8 10-12h-9z" />,
  check: <><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></>,
  xcircle: <><circle cx="12" cy="12" r="10" /><path d="m15 9-6 6M9 9l6 6" /></>,
  alert: <><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" /><path d="M12 9v4M12 17h.01" /></>,
  clock: <><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></>,
  message: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
  mail: <><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 6L2 7" /></>,
  ring: <><circle cx="12" cy="15" r="6" /><path d="m9 4 3 3 3-3-1.5-2h-3z" /></>,
  necklace: <><path d="M5 3c0 9 3 14 7 14s7-5 7-14" /><circle cx="12" cy="20" r="2" /></>,
  bag: <><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></>,
  cake: <><path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8" /><path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1M2 21h20M7 8v3M12 8v3M17 8v3" /></>,
  search: <><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></>,
  calendar: <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>,
  cart: <><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" /></>,
  smile: <><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" /></>,
  heart: <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7z" />,
  globe: <><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20" /></>,
  box: <><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><path d="m3.3 7 8.7 5 8.7-5M12 22V12M7.5 4.27l9 5.15" /></>,
  cash: <><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="2" /><path d="M6 12h.01M18 12h.01" /></>,
  rocket: <><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" /><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" /></>,
  pin: <><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0" /><circle cx="12" cy="10" r="3" /></>,
  pencil: <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z" />,
  star: <path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21.1 7 14.2 2 9.3l6.9-1z" />,
  needle: <><path d="m19 5-14 14" /><path d="M17 3c2 0 4 2 4 4l-3 1-2-2z" /></>,
  flower: <><circle cx="12" cy="12" r="3" /><path d="M12 9V3M12 15v6M9 12H3M15 12h6M9.9 9.9 5.6 5.6M14.1 14.1l4.3 4.3M14.1 9.9l4.3-4.3M9.9 14.1l-4.3 4.3" /></>,
  doc: <><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5M9 13h6M9 17h6" /></>,
  ruler: <><path d="m3 17 14-14 4 4L7 21z" /><path d="m7 13 2 2M10 10l2 2M13 7l2 2" /></>,
  help: <><circle cx="12" cy="12" r="10" /><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01" /></>,
  tag: <><path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z" /><circle cx="7.5" cy="7.5" r="1.2" /></>,
  plane: <path d="M17.8 19.2 16 11l3.5-3.5a2.1 2.1 0 0 0-3-3L13 8 4.8 6.2l-1.4 1.4 6.4 3.4-3.5 3.5-2.9-.5L2 15.4l3.6 1 1 3.6 1.5-1.4-.5-2.9 3.5-3.5 3.4 6.4z" />,
  tree: <><path d="m12 3-6 8h3l-5 7h16l-5-7h3z" /><path d="M12 18v3" /></>,
};

const KEY: Record<string, string> = {
  "🎁": "gift", "🎉": "sparkles", "✨": "sparkles", "💎": "gem", "🚚": "truck", "🔄": "refresh", "🔁": "refresh",
  "🔒": "lock", "⚡": "bolt", "✅": "check", "❌": "xcircle", "⚠": "alert", "⏰": "clock", "⏱": "clock", "🕐": "clock",
  "💬": "message", "✉": "mail", "📬": "mail", "💍": "ring", "📿": "necklace", "🛍": "bag", "🎂": "cake",
  "🔍": "search", "🗓": "calendar", "🛒": "cart", "🎭": "smile", "🌍": "globe", "📦": "box", "💵": "cash",
  "💸": "cash", "🚀": "rocket", "📍": "pin", "📌": "pin", "✏": "pencil", "⭐": "star", "🪡": "needle",
  "💐": "flower", "🌸": "flower", "🎄": "tree", "📄": "doc", "📏": "ruler", "❓": "help", "🏷": "tag", "✈": "plane", "💝": "heart", "🤍": "heart", "❤": "heart", "🙏": "heart",
};

export function hasEm(c: string) { return !!KEY[c.replace(/️/g, "")]; }

export default function Em({ c, size = "1.15em", style }: { c: string; size?: string | number; style?: CSSProperties }) {
  const name = KEY[(c || "").replace(/️/g, "")];
  if (!name) return <>{c}</>;
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
      style={{ verticalAlign: "-0.2em", flexShrink: 0, ...style }}
    >
      {P[name]}
    </svg>
  );
}
