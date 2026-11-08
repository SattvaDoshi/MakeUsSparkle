/**
 * PLACEHOLDER CONTENT — shown only while the admin has not added the real thing.
 * Founder banner, FAQs and Watch & Buy videos fall back to these so the sections are visible
 * for demos. The moment real content exists in the admin, this is ignored automatically.
 * Turn it off completely with NEXT_PUBLIC_DEMO_CONTENT=off.
 */
import type { FaqItem, FaqSettings, FounderMessage } from "@/lib/siteContentApi";

export const DEMO_ENABLED = process.env.NEXT_PUBLIC_DEMO_CONTENT !== "off";

/* ── Founder banner: simple branded SVG with a placeholder note ── */
function banner(w: number, h: number, big: number, small: number, lines: string[]): string {
  const cx = w / 2;
  const top = h / 2 - ((lines.length - 1) * big * 1.25) / 2;
  const text = lines
    .map((l, i) => `<text x="${cx}" y="${top + i * big * 1.25}" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-style="italic" font-size="${big}" fill="#ffffff">${l}</text>`)
    .join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2a4736"/><stop offset="1" stop-color="#17291f"/></linearGradient></defs>
<rect width="${w}" height="${h}" fill="url(#g)"/>
<text x="${cx}" y="${h * 0.2}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${small}" letter-spacing="${small * 0.28}" fill="#e3c473">A NOTE FROM OUR FOUNDER</text>
${text}
<text x="${cx}" y="${h * 0.84}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${small}" letter-spacing="${small * 0.2}" fill="#e3c473">— FOUNDER, MAKEYOUSPARKLE</text>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export const DEMO_FOUNDER: FounderMessage = {
  isActive: true,
  desktopImage: banner(1600, 640, 54, 20, ["Jewellery should feel like you —", "everyday, effortless and a little bit magical."]),
  desktopWidth: 1600,
  desktopHeight: 640,
  mobileImage: banner(800, 960, 38, 17, ["Jewellery should", "feel like you —", "everyday, effortless", "and a little magical."]),
  mobileWidth: 800,
  mobileHeight: 960,
  alt: "A note from our founder",
  link: "",
};

/* ── FAQs ── */
export const DEMO_FAQ_SETTINGS: FaqSettings = {
  eyebrow: "Need help?",
  title: "Frequently asked questions",
  subtitle: "Quick answers about orders, delivery, returns and caring for your jewellery.",
};

export const DEMO_FAQS: FaqItem[] = [
  { _id: "demo-1", question: "How long does delivery take?", answer: "Most orders are dispatched within a few working days. The estimated delivery time for your pincode is shown at checkout before you pay." },
  { _id: "demo-2", question: "Is there free shipping?", answer: "Yes — shipping is free on orders above ₹999. Below that, a small shipping fee is added at checkout." },
  { _id: "demo-3", question: "Can I return or exchange a piece?", answer: "Yes. If something isn't right, message us on WhatsApp with your order number and photos and we'll guide you through a return or exchange. See our Returns & Exchange page for the full policy." },
  { _id: "demo-4", question: "Is Cash on Delivery available?", answer: "Cash on Delivery is available on eligible orders and pincodes. You'll see the option at checkout if it applies to your order." },
  { _id: "demo-5", question: "How do I care for my jewellery?", answer: "Keep it dry and store it in the pouch it came in. Avoid perfume, lotion and water, and wipe gently with a soft cloth after wearing to keep it shining." },
  { _id: "demo-6", question: "Do you make custom or personalised pieces?", answer: "Yes! Our custom charm jewellery can be personalised with a name or initial. Choose your options on the product page, or message us if you need something special." },
];

/* ── Watch & Buy: sample clips (public test videos) paired with real catalogue products ── */
const BASE = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample";
export const DEMO_CLIPS = [
  { title: "Styled for every day", src: `${BASE}/ForBiggerBlazes.mp4` },
  { title: "Gift-ready sparkle", src: `${BASE}/ForBiggerEscapes.mp4` },
  { title: "New arrival, up close", src: `${BASE}/ForBiggerFun.mp4` },
  { title: "Layer it your way", src: `${BASE}/ForBiggerJoyrides.mp4` },
  { title: "Our bestseller", src: `${BASE}/ForBiggerMeltdowns.mp4` },
  { title: "Wear it everywhere", src: `${BASE}/SubaruOutbackOnStreetAndDirt.mp4` },
];
