// 'use client';

// import { useState, useEffect, useRef, type CSSProperties, type MouseEvent } from 'react';
// import Link from 'next/link';
// import UpperNav from '@/components/ui/UpperNav';
// import { fetchCharmItems, type CharmItemData } from '@/lib/catalogApi';

// /* ─── Types ─── */
// interface CharmTypeCard {  
//   id: string;
//   label: string;
//   icon: string;
//   count: number;
//   priceRange: string;
//   image: string;
// }

// const TAB_ICONS: Record<string, string> = {
//   initials: '𝑨',
//   symbols: '✦',
//   birthstones: '💎',
//   custom: '✎',
//   designs: '◈',
//   characters: '🎭',
// };

// const CATEGORY_META: Record<string, { title: string; titleEm: string; desc: string }> = {
//   'custom-charm-jewellery': {
//     title: 'Explore',
//     titleEm: 'Charm Jewellery',
//     desc: 'Choose a charm category to start designing your one-of-a-kind piece.',
//   },
//   keychains: {
//     title: 'Explore',
//     titleEm: 'Custom Keychains',
//     desc: 'Browse different charm types and build your perfect keychain.',
//   },
// };

// /* ─── Shine Card ─── */
// function TypeCard({ card, index, href }: { card: CharmTypeCard; index: number; href: string }) {
//   const ref = useRef<HTMLAnchorElement>(null);
//   const [shine, setShine] = useState({ x: 50, y: 50, on: false });

//   const move = (e: MouseEvent<HTMLAnchorElement>) => {
//     if (!ref.current) return;
//     const r = ref.current.getBoundingClientRect();
//     setShine({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100, on: true });
//   };

//   return (
//     <Link
//       ref={ref}
//       href={href}
//       className="ctc-card"
//       onMouseMove={move}
//       onMouseLeave={() => setShine(s => ({ ...s, on: false }))}
//       style={{ '--sx': `${shine.x}%`, '--sy': `${shine.y}%`, animationDelay: `${index * 0.08}s` } as CSSProperties & Record<string, string>}
//     >
//       <div className="ctc-img">
//         {/* eslint-disable-next-line @next/next/no-img-element */}
//         <img src={card.image} alt={card.label} loading="lazy" />
//         <div className="ctc-grad" />
//         <div className={`ctc-shine${shine.on ? ' on' : ''}`} />
//       </div>

//       {/* Icon badge */}
//       <div className="ctc-icon-badge">{card.icon}</div>

//       {/* Info overlay */}
//       <div className="ctc-overlay">
//         <span className="ctc-label">{card.label}</span>
//         <span className="ctc-meta">{card.count} pieces · {card.priceRange}</span>
//         <span className="ctc-cta">
//           Customise
//           <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
//             <path d="M5 12h14M12 5l7 7-7 7" />
//           </svg>
//         </span>
//       </div>

//       <div className="ctc-bar" />
//     </Link>
//   );
// }

// /* ─── Main Component ─── */
// export default function CharmCategoryCards({ parentCategory }: { parentCategory: string }) {
//   const [cards, setCards] = useState<CharmTypeCard[]>([]);
//   const [loading, setLoading] = useState(true);
//   const meta = CATEGORY_META[parentCategory] || CATEGORY_META['custom-charm-jewellery'];

//   useEffect(() => {
//     let mounted = true;
//     setLoading(true);
//     fetchCharmItems(parentCategory)
//       .then((items) => {
//         if (!mounted) return;
//         // Group by charmCategory
//         const map = new Map<string, CharmItemData[]>();
//         for (const item of items) {
//           if (!map.has(item.charmCategory)) map.set(item.charmCategory, []);
//           map.get(item.charmCategory)!.push(item);
//         }

//         const grouped: CharmTypeCard[] = Array.from(map.entries()).map(([key, charms]) => {
//           const prices = charms.map(c => c.price);
//           const min = Math.min(...prices);
//           const max = Math.max(...prices);
//           return {
//             id: key,
//             label: key.charAt(0).toUpperCase() + key.slice(1),
//             icon: TAB_ICONS[key] || '◈',
//             count: charms.length,
//             priceRange: min === max ? `₹${min}` : `₹${min} – ₹${max}`,
//             image: charms[0]?.image || '/images/hero.png',
//           };
//         });

//         setCards(grouped);
//         setLoading(false);
//       })
//       .catch(() => {
//         if (mounted) setLoading(false);
//       });
//     return () => { mounted = false; };
//   }, [parentCategory]);

//   return (
//     <>
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Nunito:wght@300;400;500;600;700&display=swap');

//         :root {
//           --ctc-cream:  #faf8f3;
//           --ctc-white:  #ffffff;
//           --ctc-gd:     #253d18;
//           --ctc-gs:     #527a3e;
//           --ctc-gp:     #ddecd1;
//           --ctc-gt:     #eff6ea;
//           --ctc-gold:   #a07820;
//           --ctc-gold-l: #c8992e;
//           --ctc-t1:     #1c1c17;
//           --ctc-t2:     #484840;
//           --ctc-t3:     #828278;
//           --ctc-t4:     #b4b4a4;
//           --ctc-bs:     rgba(60,90,35,0.09);
//           --ctc-bm:     rgba(60,90,35,0.18);
//         }

//         *, *::before, *::after { box-sizing: border-box; }

//         .ctc-root {
//           min-height: 100vh;
//           background: var(--ctc-cream);
//           font-family: 'Nunito', sans-serif;
//           color: var(--ctc-t1);
//         }

//         /* ── Hero ── */
//         .ctc-hero {
//           padding: 60px 48px 36px;
//           position: relative;
//           overflow: hidden;
//           animation: ctcFadeUp .55s ease both;
//         }
//         .ctc-hero::after {
//           content: '◈';
//           position: absolute; right: 56px; top: 50%;
//           transform: translateY(-50%);
//           font-size: 120px; color: rgba(160,120,32,.06);
//           pointer-events: none; line-height: 1; font-family: serif;
//         }
//         @keyframes ctcFadeUp {
//           from { opacity: 0; transform: translateY(14px); }
//           to   { opacity: 1; transform: translateY(0); }
//         }
//         .ctc-eyebrow {
//           display: flex; align-items: center; gap: 10px;
//           font-size: 9px; font-weight: 700; letter-spacing: .46em; text-transform: uppercase;
//           color: var(--ctc-gs); margin-bottom: 10px;
//         }
//         .ctc-eyebrow::before {
//           content: ''; width: 22px; height: 1.5px;
//           background: var(--ctc-gs); border-radius: 2px; opacity: .65;
//         }
//         .ctc-title {
//           font-family: 'Cormorant Garamond', serif;
//           font-size: clamp(2rem, 4vw, 3.2rem);
//           font-weight: 300; color: var(--ctc-gd);
//           line-height: 1.1; letter-spacing: -.02em;
//           margin-bottom: 10px;
//         }
//         .ctc-title em { font-style: italic; color: var(--ctc-gold); }
//         .ctc-desc {
//           font-size: 13px; font-weight: 400; color: var(--ctc-t3);
//           max-width: 520px; line-height: 1.75; letter-spacing: .02em;
//         }

//         /* ── Grid ── */
//         .ctc-grid-wrap {
//           padding: 0 48px 80px;
//           animation: ctcFadeUp .55s ease .12s both;
//         }
//         .ctc-grid {
//           display: grid;
//           grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
//           gap: 16px;
//         }

//         /* ── Card ── */
//         .ctc-card {
//           display: block; text-decoration: none;
//           position: relative; overflow: hidden;
//           border-radius: 14px;
//           border: 1px solid var(--ctc-bs);
//           cursor: pointer;
//           aspect-ratio: 3/4;
//           animation: ctcCardIn .48s ease both;
//           transition: border-color .28s, box-shadow .28s, transform .28s;
//         }
//         @keyframes ctcCardIn {
//           from { opacity: 0; transform: translateY(14px); }
//           to   { opacity: 1; transform: translateY(0); }
//         }
//         .ctc-card:hover {
//           border-color: var(--ctc-bm);
//           box-shadow: 0 12px 36px rgba(35,60,18,.14);
//           transform: translateY(-4px);
//         }

//         /* Image fills card */
//         .ctc-img {
//           position: absolute; inset: 0;
//           overflow: hidden; background: #ede7d9;
//         }
//         .ctc-img img {
//           width: 100%; height: 100%; object-fit: cover; display: block;
//           transition: transform .68s cubic-bezier(.25,.46,.45,.94);
//         }
//         .ctc-card:hover .ctc-img img { transform: scale(1.08); }

//         .ctc-grad {
//           position: absolute; inset: 0;
//           background: linear-gradient(
//             to top,
//             rgba(15,28,8,.82) 0%,
//             rgba(15,28,8,.32) 40%,
//             rgba(15,28,8,.06) 65%,
//             transparent 85%
//           );
//         }
//         .ctc-shine {
//           position: absolute; inset: 0; pointer-events: none;
//           background: radial-gradient(circle at var(--sx,50%) var(--sy,50%), rgba(255,255,255,.14) 0%, transparent 54%);
//           opacity: 0; transition: opacity .28s;
//         }
//         .ctc-shine.on { opacity: 1; }

//         /* Icon badge */
//         .ctc-icon-badge {
//           position: absolute; top: 14px; left: 14px;
//           width: 40px; height: 40px; border-radius: 10px;
//           background: rgba(255,255,255,.92);
//           backdrop-filter: blur(6px);
//           display: flex; align-items: center; justify-content: center;
//           font-size: 16px; color: var(--ctc-gd);
//           border: 1px solid rgba(255,255,255,.4);
//           box-shadow: 0 2px 10px rgba(0,0,0,.1);
//           z-index: 3;
//           transition: transform .22s, box-shadow .22s;
//         }
//         .ctc-card:hover .ctc-icon-badge {
//           transform: scale(1.08);
//           box-shadow: 0 4px 16px rgba(0,0,0,.15);
//         }

//         /* Overlay */
//         .ctc-overlay {
//           position: absolute; bottom: 0; left: 0; right: 0;
//           padding: 18px;
//           display: flex; flex-direction: column; gap: 4px;
//           z-index: 2;
//         }
//         .ctc-label {
//           font-family: 'Cormorant Garamond', serif;
//           font-size: clamp(1rem, 1.6vw, 1.3rem);
//           font-weight: 600; font-style: italic;
//           color: #fff; letter-spacing: .03em;
//           text-shadow: 0 1px 8px rgba(0,0,0,.5);
//         }
//         .ctc-meta {
//           font-size: 11px; font-weight: 500;
//           color: rgba(255,255,255,.7);
//           letter-spacing: .04em;
//         }
//         .ctc-cta {
//           display: inline-flex; align-items: center; gap: 5px;
//           margin-top: 8px;
//           font-size: 10px; font-weight: 700;
//           letter-spacing: .18em; text-transform: uppercase;
//           color: var(--ctc-gold-l);
//           opacity: 0; transform: translateY(6px);
//           transition: opacity .22s, transform .22s;
//         }
//         .ctc-card:hover .ctc-cta { opacity: 1; transform: translateY(0); }

//         .ctc-bar {
//           position: absolute; bottom: 0; left: 0; right: 0; height: 3px;
//           background: linear-gradient(90deg, var(--ctc-gold-l), var(--ctc-gs));
//           transform: scaleX(0); transform-origin: left;
//           transition: transform .36s cubic-bezier(.25,.46,.45,.94);
//           z-index: 3;
//         }
//         .ctc-card:hover .ctc-bar { transform: scaleX(1); }

//         /* ── Loading skeletons ── */
//         .ctc-skeleton {
//           border-radius: 14px;
//           aspect-ratio: 3/4;
//           background: linear-gradient(110deg, #ede7d9 30%, #f5f0e8 50%, #ede7d9 70%);
//           background-size: 200% 100%;
//           animation: ctcShimmer 1.5s ease-in-out infinite;
//         }
//         @keyframes ctcShimmer {
//           0% { background-position: 200% 0; }
//           100% { background-position: -200% 0; }
//         }

//         /* ── Bottom CTA ── */
//         .ctc-bottom-cta {
//           display: flex; align-items: center; justify-content: center;
//           gap: 8px; margin-top: 24px;
//           padding: 16px 32px;
//           background: var(--ctc-gd); color: var(--ctc-cream);
//           border: none; border-radius: 50px;
//           font-family: 'Nunito', sans-serif;
//           font-size: 11px; font-weight: 700;
//           letter-spacing: .22em; text-transform: uppercase;
//           text-decoration: none; cursor: pointer;
//           box-shadow: 0 4px 20px rgba(37,61,24,.22);
//           transition: background .22s, transform .14s, box-shadow .22s;
//         }
//         .ctc-bottom-cta:hover {
//           background: var(--ctc-gs);
//           transform: translateY(-2px);
//           box-shadow: 0 6px 28px rgba(37,61,24,.28);
//         }

//         /* ── Responsive ── */
//         @media (max-width: 1024px) {
//           .ctc-hero, .ctc-grid-wrap { padding-left: 28px; padding-right: 28px; }
//           .ctc-grid { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 14px; }
//         }
//         @media (max-width: 680px) {
//           .ctc-hero, .ctc-grid-wrap { padding-left: 16px; padding-right: 16px; }
//           .ctc-hero { padding-top: 50px; padding-bottom: 24px; }
//           .ctc-hero::after { display: none; }
//           .ctc-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
//           .ctc-icon-badge { width: 34px; height: 34px; font-size: 14px; border-radius: 8px; }
//           .ctc-overlay { padding: 14px; }
//         }
//         @media (max-width: 380px) {
//           .ctc-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; }
//         }
//       `}</style>

//       <div className="ctc-root">
//         <UpperNav />

//         {/* Hero */}
//         <div className="ctc-hero">
//           <span className="ctc-eyebrow">Customise</span>
//           <h1 className="ctc-title">{meta.title} <em>{meta.titleEm}</em></h1>
//           <p className="ctc-desc">{meta.desc}</p>
//         </div>

//         {/* Card Grid */}
//         <div className="ctc-grid-wrap">
//           <div className="ctc-grid">
//             {loading ? (
//               Array.from({ length: 4 }).map((_, i) => (
//                 <div key={i} className="ctc-skeleton" />
//               ))
//             ) : (
//               cards.map((card, i) => (
//                 <TypeCard
//                   key={card.id}
//                   card={card}
//                   index={i}
//                   href={`/custom-charm/${parentCategory}?type=${card.id}`}
//                 />
//               ))
//             )}
//           </div>

//           {/* Bottom CTA to go directly to full builder */}
//           {/* {!loading && cards.length > 0 && ( */}
//             <div style={{ display: 'flex', justifyContent: 'center' }}>
//               <Link href={`/custom-charm/${parentCategory}`} className="ctc-bottom-cta">
//                 Or start building from scratch
//                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                   <path d="M5 12h14M12 5l7 7-7 7"/>
//                 </svg>
//               </Link>
//             </div>
//           )}
//         </div>
//       </div>
//     </>
//   );
// }


'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cartContext';
import { fireConfetti } from '@/components/cart/ConfettiManager';
import { useWishlist } from '@/lib/wishlistContext';
import UpperNav from '@/components/ui/UpperNav';
import { fetchCharmItems, type CharmItemData } from '@/lib/catalogApi';

interface ProductColor {
  label: string;
  hex: string;
}

const FALLBACK_IMAGE = '/images/hero.png';

const TRUST_BADGES = [
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="18" width="28" height="18" rx="2"/>
        <path d="M32 22h4l6 8v6h-10V22z"/>
        <circle cx="14" cy="38" r="3"/>
        <circle cx="36" cy="38" r="3"/>
        <path d="M4 26h28"/><path d="M10 14h4M16 11v6"/>
      </svg>
    ),
    title: 'Free Shipping',
    sub: 'On orders above ₹999',
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M24 6C14 6 8 14 8 22c0 10 16 22 16 22s16-12 16-22c0-8-6-16-16-16z"/>
        <path d="M20 22l3 3 6-6"/>
      </svg>
    ),
    title: 'COD Available',
    sub: 'On all orders',
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 24h26M24 14l12 10-12 10"/>
        <circle cx="38" cy="24" r="6"/>
        <path d="M6 16v16"/>
      </svg>
    ),
    title: 'Express Delivery',
    sub: '2–3 business days',
  },
];

function Sparkles({ active }: { active: boolean }) {
  if (!active) return null;
  const pts = Array.from({ length: 10 }, (_, i) => {
    const angle = (i / 10) * 360;
    const dist = 30 + Math.random() * 24;
    return {
      x: Math.cos((angle * Math.PI) / 180) * dist,
      y: Math.sin((angle * Math.PI) / 180) * dist,
      size: 4 + Math.random() * 5,
      delay: Math.random() * 0.15,
    };
  });
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10 }}>
      {pts.map((p, i) => (
        <div
          key={i}
          style={{
            position: 'absolute', left: '50%', top: '50%',
            width: p.size, height: p.size, borderRadius: '50%',
            background: 'var(--gold)',
            transform: `translate(${p.x}px,${p.y}px)`,
            animation: 'sparkle 0.55s ease forwards',
            animationDelay: `${p.delay}s`, opacity: 0,
          }}
        />
      ))}
    </div>
  );
}

// ─── Charm Selector Component ─────────────────────────────────────────────────
function CharmSelector({
  charmItems,
  onChange,
}: {
  charmItems: CharmItemData[];
  onChange: (selected: { slot: number; charm: CharmItemData | null }[]) => void;
}) {
  const [charmCount, setCharmCount] = useState(1);
  const [slots, setSlots] = useState<(CharmItemData | null)[]>([null]);

  useEffect(() => {
    const newSlots = Array.from({ length: charmCount }, (_, i) => slots[i] ?? null);
    setSlots(newSlots);
    onChange(newSlots.map((charm, i) => ({ slot: i + 1, charm })));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [charmCount]);

  const handleSlotChange = (slotIdx: number, charmId: string) => {
    const charm = charmItems.find(c => c.id === charmId) ?? null;
    const newSlots = slots.map((s, i) => i === slotIdx ? charm : s);
    setSlots(newSlots);
    onChange(newSlots.map((c, i) => ({ slot: i + 1, charm: c })));
  };

  const selectedCount = slots.filter(Boolean).length;
  const allSelected = selectedCount === charmCount;

  return (
    <div className="charm-selector">
      {/* Number of charms */}
      <div className="charm-count-row">
        <span className="charm-count-label">Number of Charms</span>
        <div className="charm-count-stepper">
          <button
            className="charm-step-btn"
            onClick={() => setCharmCount(c => Math.max(1, c - 1))}
            disabled={charmCount <= 1}
            aria-label="Decrease charm count"
          >−</button>
          <span className="charm-step-val">{charmCount}</span>
          <button
            className="charm-step-btn"
            onClick={() => setCharmCount(c => Math.min(10, c + 1))}
            disabled={charmCount >= 10}
            aria-label="Increase charm count"
          >+</button>
        </div>
      </div>

      {/* Charm slots */}
      <div className="charm-slots">
        {Array.from({ length: charmCount }, (_, i) => (
          <div key={i} className="charm-slot">
            <label className="charm-slot-label">
              <span className="charm-slot-num">Charm {i + 1}</span>
              {slots[i] && (
                <span className="charm-slot-selected-badge">✓ Selected</span>
              )}
            </label>
            <div className="charm-slot-select-wrap">
              <select
                className={`charm-slot-select${slots[i] ? ' charm-slot-select--filled' : ''}`}
                value={slots[i]?.id ?? ''}
                onChange={e => handleSlotChange(i, e.target.value)}
              >
                <option value="">Choose a charm…</option>
                {charmItems.map(charm => (
                  <option key={charm.id} value={charm.id}>
                    {charm.name} — ₹{charm.price}
                  </option>
                ))}
              </select>
              <svg className="charm-slot-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </div>
            {/* Show selected charm preview */}
            {slots[i] && (
              <div className="charm-slot-preview">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {slots[i]!.image && (
                  <img src={slots[i]!.image} alt={slots[i]!.name} className="charm-slot-preview-img" />
                )}
                <div className="charm-slot-preview-info">
                  <span className="charm-slot-preview-name">{slots[i]!.name}</span>
                  <span className="charm-slot-preview-price">₹{slots[i]!.price}</span>
                </div>
                <button
                  className="charm-slot-remove"
                  onClick={() => handleSlotChange(i, '')}
                  aria-label="Remove charm"
                >×</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary */}
      {selectedCount > 0 && (
        <div className={`charm-summary${allSelected ? ' charm-summary--complete' : ''}`}>
          <div className="charm-summary-icon">
            {allSelected ? '✦' : '◎'}
          </div>
          <div className="charm-summary-text">
            {allSelected
              ? `You've selected all ${charmCount} charm${charmCount > 1 ? 's' : ''}!`
              : `${selectedCount} of ${charmCount} charm${charmCount > 1 ? 's' : ''} selected`
            }
            <div className="charm-summary-list">
              {slots.map((charm, i) => charm && (
                <span key={i} className="charm-summary-pill">
                  {i + 1}. {charm.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {!allSelected && charmCount > 0 && (
        <p className="charm-remaining-hint">
          {charmCount - selectedCount} more charm{charmCount - selectedCount > 1 ? 's' : ''} to select
        </p>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CharmProductDetailPage({
  parentCategory,
  charmType,
}: {
  parentCategory: string;
  charmType?: string;
}) {
  const router = useRouter();
  const { addItem } = useCart();
  const { toggleItem, isWished } = useWishlist();
  const cartBtnRef = useRef<HTMLButtonElement | null>(null);

  const [charmItems, setCharmItems] = useState<CharmItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [cartAnim, setCartAnim] = useState(false);
  const [sparkleAnim, setSparkleAnim] = useState(false);
  const [selectedCharms, setSelectedCharms] = useState<{ slot: number; charm: CharmItemData | null }[]>([]);

  // Filter by charmType if provided
  const filteredItems = charmType
    ? charmItems.filter(c => c.charmCategory === charmType)
    : charmItems;

  // Use first item as "product" for display
  const displayItem = filteredItems[0] ?? charmItems[0] ?? null;
  const images = displayItem ? [displayItem.image].filter(Boolean) : [];
  const displayImg = images[activeImg] ?? FALLBACK_IMAGE;

  const price = displayItem?.price ?? 0;
  const totalCharmPrice = selectedCharms.reduce((sum, s) => sum + (s.charm?.price ?? 0), 0);
  const totalPrice = totalCharmPrice * qty || price * qty;

  const wished = displayItem ? isWished(Number(displayItem.id)) : false;

  const wishlistItem = displayItem
    ? {
        id: Number(displayItem.id),
        name: displayItem.name,
        price: displayItem.price,
        originalPrice: null,
        image: displayItem.image,
        category: parentCategory,
        href: `/custom-charm/${parentCategory}`,
        colors: [] as ProductColor[],
        badge: null,
        rating: 0,
        reviewCount: 0,
      }
    : null;

  useEffect(() => {
    if (!parentCategory) return;   
    let mounted = true;
    setLoading(true);
    fetchCharmItems(parentCategory)
      .then(items => {
        if (mounted) { setCharmItems(items); setLoading(false); }
      })
      .catch(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [parentCategory]);

  const handleAddToCart = useCallback(() => {
    if (!displayItem) return;
    const charmsNote = selectedCharms
      .filter(s => s.charm)
      .map(s => `Charm ${s.slot}: ${s.charm!.name}`)
      .join(', ');

    addItem({
      id: displayItem.id,
      name: displayItem.name,
      price: totalCharmPrice || price,
      originalPrice: null,
      image: displayItem.image,
      color: '',
      colorHex: '#c9a84c',
      sku: displayItem.id,
      href: `/custom-charm/${parentCategory}`,
      customNote: charmsNote || undefined,
    });
    fireConfetti(cartBtnRef.current);
    setCartAnim(true);
    setSparkleAnim(true);
    setTimeout(() => setCartAnim(false), 700);
    setTimeout(() => setSparkleAnim(false), 800);
  }, [addItem, displayItem, selectedCharms, totalCharmPrice, price, parentCategory]);

  const handleBuyNow = useCallback(() => {
    if (!displayItem) return;
    const charmsNote = selectedCharms
      .filter(s => s.charm)
      .map(s => `Charm ${s.slot}: ${s.charm!.name}`)
      .join(', ');

    addItem({
      id: displayItem.id,
      name: displayItem.name,
      price: totalCharmPrice || price,
      originalPrice: null,
      image: displayItem.image,
      color: '',
      colorHex: '#c9a84c',
      sku: displayItem.id,
      href: `/custom-charm/${parentCategory}`,
      customNote: charmsNote || undefined,
    }, false);
    router.push('/cart');
  }, [addItem, displayItem, selectedCharms, totalCharmPrice, price, parentCategory, router]);

const categoryLabel = (parentCategory ?? '')
  .replace(/-/g, ' ')
  .replace(/\b\w/g, c => c.toUpperCase());

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f0e8', fontFamily: 'Jost, sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #d9cdb8', borderTopColor: '#3d4a22', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: 'rgba(30,35,16,.5)', fontSize: 13, letterSpacing: '.08em' }}>Loading charms…</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );

  if (!displayItem && !loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f5f0e8', fontFamily: 'Jost, sans-serif', gap: 16 }}>
      <p style={{ fontSize: 28, color: '#3d4a22' }}>No charms found</p>
      <a href="/" style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: '#f5f0e8', background: '#3d4a22', padding: '12px 28px', borderRadius: 50, textDecoration: 'none' }}>Back to Home</a>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Jost:wght@200;300;400;500;600&display=swap');

        :root {
          --beige:#f5f0e8; --beige-dk:#ede5d5; --beige-dkr:#d9cdb8;
          --olive-900:#1a1f0d; --olive-800:#252d12; --olive-600:#3d4a22;
          --olive-500:#5a6b2e; --olive-400:#7a8e3c; --olive-200:#c4cc9a;
          --olive-100:#e4e8cc; --olive-50:#f2f4e8;
          --gold:#c9a84c; --gold-lt:#e8d49a; --gold-glow:rgba(201,168,76,.13);
          --ink:#1e2310; --mist:rgba(30,35,16,.45); --red:#c0392b;
        }
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

        @keyframes sparkle{0%{opacity:1;transform:translate(0,0) scale(1)}100%{opacity:0;transform:translate(calc(var(--tx,0px)*2.2),calc(var(--ty,0px)*2.2)) scale(0)}}
        @keyframes cartBounce{0%,100%{transform:scale(1)}30%{transform:scale(1.14) rotate(-3deg)}60%{transform:scale(.94) rotate(2deg)}80%{transform:scale(1.04)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes imgIn{from{opacity:0;transform:scale(.97)}to{opacity:1;transform:scale(1)}}
        @keyframes slideIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}

        .cpdp { min-height:100vh; background:var(--beige); font-family:'Jost',sans-serif; color:var(--ink); }

        /* ── Layout ── */
        .cpdp-layout { display:grid; grid-template-columns:1fr 1fr; gap:0; max-width:1280px; margin:0 auto; }

        /* ── Gallery ── */
        .cpdp-gallery {
          position:sticky; top:80px; height:calc(100vh - 80px);
          padding:32px 28px 32px 52px;
          display:flex; flex-direction:column; gap:14px;
          animation:fadeUp .6s ease both;
          min-width:0; overflow:hidden;
        }
        .cpdp-main-img-wrap {
          flex:1; min-height:0;
          background:var(--beige-dk); border-radius:24px; overflow:hidden; position:relative;
        }
        .cpdp-main-img { width:100%; height:100%; object-fit:cover; animation:imgIn .4s ease both; }
        .cpdp-badge { position:absolute; top:16px; left:16px; font-size:9.5px; font-weight:600; letter-spacing:.1em; color:var(--beige); background:var(--olive-600); padding:5px 14px 4px; border-radius:50px; }
        .cpdp-wish { position:absolute; top:14px; right:14px; width:36px; height:36px; border-radius:50%; background:rgba(245,240,232,.9); border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:transform .2s,background .2s; }
        .cpdp-wish:hover { transform:scale(1.1); }
        .cpdp-wish.on { background:var(--olive-600); }
        .cpdp-thumb-row { display:flex; gap:10px; flex-wrap:nowrap; overflow-x:auto; padding-bottom:2px; }
        .cpdp-thumb-row::-webkit-scrollbar { height:3px; }
        .cpdp-thumb-row::-webkit-scrollbar-thumb { background:var(--beige-dkr); border-radius:4px; }
        .cpdp-thumb { width:72px; height:72px; border-radius:12px; overflow:hidden; cursor:pointer; flex-shrink:0; border:2px solid transparent; transition:border-color .2s,transform .2s; }
        .cpdp-thumb:hover { transform:scale(1.06); }
        .cpdp-thumb.active { border-color:var(--olive-500); }
        .cpdp-thumb img { width:100%; height:100%; object-fit:cover; }

        /* ── Charm type badge on gallery ── */
        .cpdp-charm-type-tag {
          position:absolute; bottom:16px; left:16px;
          display:flex; align-items:center; gap:6px;
          font-size:9px; font-weight:700; letter-spacing:.2em; text-transform:uppercase;
          color:var(--gold); background:rgba(26,31,13,.75); backdrop-filter:blur(6px);
          padding:6px 12px; border-radius:50px; border:1px solid rgba(201,168,76,.3);
        }

        /* ── Info panel ── */
        .cpdp-info { padding:32px 52px 40px 28px; animation:fadeUp .6s ease .1s both; overflow-y:auto; }

        .cpdp-eyebrow { display:flex; align-items:center; gap:8px; font-size:9px; font-weight:700; letter-spacing:.46em; text-transform:uppercase; color:var(--olive-500); margin-bottom:8px; }
        .cpdp-eyebrow::before { content:''; width:20px; height:1.5px; background:var(--olive-500); border-radius:2px; opacity:.65; }

        .cpdp-name { font-family:'Cormorant Garamond',serif; font-size:clamp(1.9rem,3.5vw,2.8rem); font-weight:400; line-height:1.1; letter-spacing:-.01em; color:var(--olive-900); margin-bottom:10px; }
        .cpdp-name em { font-style:italic; color:var(--olive-600); }

        .cpdp-price-row { display:flex; align-items:baseline; gap:12px; margin-bottom:8px; flex-wrap:wrap; }
        .cpdp-price { font-size:1.8rem; font-weight:600; letter-spacing:-.01em; color:var(--olive-900); }
        .cpdp-price-note { font-size:11px; color:var(--mist); letter-spacing:.04em; }

        .cpdp-divider { height:1px; background:linear-gradient(90deg,rgba(61,74,34,.1),rgba(201,168,76,.2),rgba(61,74,34,.1)); margin:20px 0; }
        .cpdp-section-label { font-size:9.5px; letter-spacing:.38em; text-transform:uppercase; color:var(--mist); margin-bottom:10px; font-weight:500; }
        .cpdp-section-label span { color:var(--olive-600); font-weight:600; }

        /* ════════════════════════════════════════
           CHARM SELECTOR
        ════════════════════════════════════════ */
        .charm-selector { margin-bottom:4px; }

        /* Count stepper */
        .charm-count-row {
          display:flex; align-items:center; justify-content:space-between;
          margin-bottom:18px;
          background:linear-gradient(135deg,rgba(201,168,76,.08),rgba(90,110,35,.06));
          border:1px solid rgba(201,168,76,.25); border-radius:14px;
          padding:14px 18px;
        }
        .charm-count-label { font-size:11px; font-weight:600; letter-spacing:.08em; text-transform:uppercase; color:var(--olive-600); }
        .charm-count-stepper { display:flex; align-items:center; gap:0; border:1.5px solid var(--beige-dkr); border-radius:50px; overflow:hidden; background:white; }
        .charm-step-btn {
          width:38px; height:38px; background:none; border:none; font-size:20px;
          cursor:pointer; color:var(--olive-600); display:flex; align-items:center; justify-content:center;
          transition:background .15s; line-height:1;
        }
        .charm-step-btn:hover:not(:disabled) { background:var(--olive-50); }
        .charm-step-btn:disabled { opacity:.35; cursor:not-allowed; }
        .charm-step-val { min-width:42px; text-align:center; font-size:16px; font-weight:700; color:var(--ink); font-family:'Cormorant Garamond',serif; }

        /* Slots */
        .charm-slots { display:flex; flex-direction:column; gap:12px; margin-bottom:16px; }

        .charm-slot { animation:slideIn .3s ease both; }

        .charm-slot-label {
          display:flex; align-items:center; justify-content:space-between;
          margin-bottom:6px;
        }
        .charm-slot-num { font-size:9.5px; font-weight:700; letter-spacing:.3em; text-transform:uppercase; color:var(--olive-600); }
        .charm-slot-selected-badge {
          font-size:8.5px; font-weight:700; letter-spacing:.12em; text-transform:uppercase;
          color:var(--olive-500); background:var(--olive-50); border:1px solid rgba(61,74,34,.15);
          padding:2px 8px; border-radius:50px;
        }

        .charm-slot-select-wrap { position:relative; }
        .charm-slot-select {
          width:100%; appearance:none; -webkit-appearance:none;
          background:white; border:1.5px solid var(--beige-dkr); border-radius:12px;
          padding:11px 38px 11px 14px;
          font-family:'Jost',sans-serif; font-size:12px; font-weight:400; color:var(--ink);
          cursor:pointer; outline:none; transition:border-color .2s,box-shadow .2s;
        }
        .charm-slot-select:focus { border-color:var(--olive-400); box-shadow:0 0 0 3px rgba(90,110,35,.1); }
        .charm-slot-select--filled { border-color:var(--olive-400); background:var(--olive-50); }
        .charm-slot-chevron { position:absolute; right:12px; top:50%; transform:translateY(-50%); width:15px; height:15px; color:var(--mist); pointer-events:none; }

        /* Selected charm preview */
        .charm-slot-preview {
          display:flex; align-items:center; gap:10px;
          margin-top:8px;
          background:white; border:1px solid rgba(61,74,34,.1); border-radius:10px;
          padding:10px 12px;
          animation:slideIn .25s ease both;
        }
        .charm-slot-preview-img { width:40px; height:40px; border-radius:8px; object-fit:cover; flex-shrink:0; border:1px solid var(--beige-dkr); }
        .charm-slot-preview-info { flex:1; display:flex; flex-direction:column; gap:2px; min-width:0; }
        .charm-slot-preview-name { font-size:12px; font-weight:500; color:var(--ink); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .charm-slot-preview-price { font-size:11px; font-weight:600; color:var(--olive-600); }
        .charm-slot-remove { width:24px; height:24px; border-radius:50%; background:rgba(192,57,43,.1); border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; color:var(--red); font-size:16px; line-height:1; flex-shrink:0; transition:background .2s; }
        .charm-slot-remove:hover { background:var(--red); color:white; }

        /* Summary */
        .charm-summary {
          display:flex; align-items:flex-start; gap:12px;
          background:linear-gradient(135deg,rgba(90,110,35,.07),rgba(201,168,76,.07));
          border:1px solid rgba(90,110,35,.18); border-radius:14px;
          padding:14px 16px; margin-bottom:8px;
          animation:slideIn .3s ease both;
        }
        .charm-summary--complete {
          background:linear-gradient(135deg,rgba(90,110,35,.12),rgba(201,168,76,.1));
          border-color:rgba(90,110,35,.3);
        }
        .charm-summary-icon { font-size:18px; flex-shrink:0; margin-top:1px; color:var(--gold); }
        .charm-summary-text { font-size:12px; font-weight:500; color:var(--olive-700,var(--olive-600)); line-height:1.6; }
        .charm-summary-list { display:flex; flex-wrap:wrap; gap:6px; margin-top:8px; }
        .charm-summary-pill {
          font-size:10px; font-weight:600; letter-spacing:.04em;
          color:var(--olive-600); background:white; border:1px solid rgba(61,74,34,.15);
          padding:3px 10px; border-radius:50px;
        }

        .charm-remaining-hint { font-size:10.5px; color:var(--mist); letter-spacing:.04em; margin-bottom:4px; font-style:italic; }

        /* ── Price Summary Box ── */
        .cpdp-summary { background:linear-gradient(135deg,var(--olive-50),var(--beige-dk)); border:1px solid rgba(61,74,34,.1); border-radius:14px; padding:14px 18px; margin-bottom:20px; }
        .cpdp-summary-row { display:flex; justify-content:space-between; font-size:11.5px; color:var(--mist); margin-bottom:6px; }
        .cpdp-summary-row.total { border-top:1px solid rgba(61,74,34,.1); padding-top:8px; margin-top:4px; font-size:14px; font-weight:700; color:var(--ink); }
        .cpdp-summary-row span:last-child { font-weight:500; color:var(--ink); }
        .cpdp-summary-row.total span:last-child { font-weight:800; font-size:16px; }

        /* ── Quantity ── */
        .cpdp-qty-row { display:flex; align-items:center; gap:14px; margin-bottom:20px; }
        .cpdp-qty { display:flex; align-items:center; border:1.5px solid var(--beige-dkr); border-radius:50px; overflow:hidden; }
        .cpdp-qty-btn { width:36px; height:36px; background:none; border:none; font-size:18px; cursor:pointer; color:var(--olive-600); display:flex; align-items:center; justify-content:center; transition:background .15s; }
        .cpdp-qty-btn:hover { background:var(--olive-50); }
        .cpdp-qty-val { min-width:36px; text-align:center; font-size:13px; font-weight:600; color:var(--ink); }

        /* ── CTA Buttons ── */
        .cpdp-cta-row { display:grid; grid-template-columns:1fr 1.4fr; gap:10px; margin-bottom:24px; }
        .cpdp-btn-wish { display:flex; align-items:center; justify-content:center; gap:7px; font-family:'Jost',sans-serif; font-size:11px; font-weight:600; letter-spacing:.12em; text-transform:uppercase; color:var(--olive-600); background:white; border:1.5px solid var(--beige-dkr); border-radius:50px; padding:15px 14px; cursor:pointer; transition:all .22s; }
        .cpdp-btn-wish:hover { border-color:var(--olive-400); background:var(--olive-50); }
        .cpdp-btn-wish.on { background:var(--olive-600); color:var(--beige); border-color:var(--olive-600); }
        .cpdp-btn-cart-wrap { position:relative; }
        .cpdp-btn-cart { display:flex; align-items:center; justify-content:center; gap:9px; font-family:'Jost',sans-serif; font-size:11px; font-weight:700; letter-spacing:.16em; text-transform:uppercase; color:var(--beige); background:var(--olive-900); border:none; border-radius:50px; padding:15px 20px; cursor:pointer; transition:background .22s; width:100%; }
        .cpdp-btn-cart:hover { background:var(--olive-600); }
        .cpdp-btn-cart.bounce { animation:cartBounce .55s ease; }
        .cpdp-btn-buy { display:flex; align-items:center; justify-content:center; gap:9px; font-family:'Jost',sans-serif; font-size:11px; font-weight:700; letter-spacing:.16em; text-transform:uppercase; color:var(--beige); background:var(--gold); border:none; border-radius:50px; padding:15px 20px; cursor:pointer; transition:background .22s,transform .15s; width:100%; grid-column:1/-1; }
        .cpdp-btn-buy:hover { background:#b8902b; }
        .cpdp-btn-buy:active { transform:scale(.98); }

        /* ── Trust Badges ── */
        .cpdp-trust { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-bottom:28px; }
        .cpdp-trust-item { display:flex; flex-direction:column; align-items:center; text-align:center; padding:14px 8px; background:white; border:1px solid rgba(61,74,34,.07); border-radius:14px; transition:transform .2s,box-shadow .2s; }
        .cpdp-trust-item:hover { transform:translateY(-3px); box-shadow:0 8px 24px rgba(61,74,34,.1); }
        .cpdp-trust-icon { width:40px; height:40px; color:var(--olive-500); margin-bottom:7px; }
        .cpdp-trust-title { font-size:10px; font-weight:700; letter-spacing:.06em; text-transform:uppercase; color:var(--olive-600); margin-bottom:2px; }
        .cpdp-trust-sub { font-size:9px; color:#101010; }

        /* ── Info note ── */
        .cpdp-info-note {
          display:flex; align-items:flex-start; gap:8px;
          background:rgba(201,168,76,.08); border:1px solid rgba(201,168,76,.22);
          border-radius:10px; padding:10px 14px; margin-bottom:20px;
        }
        .cpdp-info-note p { font-size:10.5px; font-weight:300; color:var(--mist); line-height:1.7; letter-spacing:.03em; }
        .cpdp-info-note p strong { font-weight:600; color:var(--olive-600); }

        /* ── TABLET ≤ 960px ── */
        @media(max-width:960px) {
          .cpdp-layout { grid-template-columns:1fr; }
          .cpdp-gallery { position:static; height:auto; padding:24px 24px 0; }
          .cpdp-main-img-wrap { height:420px; flex:none; }
          .cpdp-info { padding:24px 24px 48px; }
          .cpdp-trust { grid-template-columns:repeat(3,1fr); }
        }

        /* ── MOBILE ≤ 600px ── */
        @media(max-width:600px) {
          .cpdp-gallery { padding:16px 16px 0; }
          .cpdp-info { padding:20px 16px 40px; }
          .cpdp-main-img-wrap { height:300px; flex:none; }
          .cpdp-trust { grid-template-columns:repeat(3,minmax(80px,1fr)); gap:7px; overflow-x:auto; padding-bottom:4px; -webkit-overflow-scrolling:touch; scrollbar-width:none; }
          .cpdp-trust::-webkit-scrollbar { display:none; }
          .cpdp-trust-item { padding:10px 6px; border-radius:12px; min-width:80px; }
          .cpdp-trust-icon { width:28px; height:28px; margin-bottom:5px; }
          .cpdp-trust-title { font-size:8.5px; letter-spacing:.03em; }
          .cpdp-trust-sub { font-size:7.5px; }
          .cpdp-cta-row { grid-template-columns:1fr 1fr; }
          .charm-count-row { padding:12px 14px; flex-direction:column; align-items:flex-start; gap:12px; }
          .charm-step-btn { width:34px; height:34px; }
          .charm-slot-select { font-size:11px; padding:10px 34px 10px 12px; }
          .charm-slot-preview-img { width:34px; height:34px; }
          .cpdp-summary-row { font-size:10.5px; }
          .cpdp-summary-row.total { font-size:13px; }
        }

        /* ── VERY SMALL ≤ 380px ── */
        @media(max-width:380px) {
          .cpdp-main-img-wrap { height:260px; }
          .cpdp-name { font-size:1.7rem; }
          .cpdp-cta-row { grid-template-columns:1fr; }
          .cpdp-btn-buy { grid-column:unset; }
          .charm-step-val { min-width:36px; font-size:14px; }
        }
      `}</style>

      <div className="cpdp">
        <UpperNav />
        <div className="cpdp-layout" style={{ paddingTop: '45px' }}>

          {/* ── Gallery ── */}
          <div className="cpdp-gallery">
            <div className="cpdp-main-img-wrap">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img key={displayImg} className="cpdp-main-img" src={displayImg} alt={displayItem?.name ?? 'Charm'} />
              <span className="cpdp-badge">Custom Charm</span>
              <button
                className={`cpdp-wish${wished ? ' on' : ''}`}
                onClick={() => wishlistItem && toggleItem(wishlistItem)}
                aria-label="Toggle wishlist"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill={wished ? 'var(--beige)' : 'none'} stroke={wished ? 'none' : 'var(--olive-600)'} strokeWidth="1.8">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </button>
              {charmType && (
                <div className="cpdp-charm-type-tag">
                  ✦ {charmType.charAt(0).toUpperCase() + charmType.slice(1)}
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="cpdp-thumb-row">
                {images.map((img, i) => (
                  <div key={img} className={`cpdp-thumb${activeImg === i ? ' active' : ''}`} onClick={() => setActiveImg(i)}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={`View ${i + 1}`} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Info Panel ── */}
          <div className="cpdp-info">
            <div className="cpdp-eyebrow">Customise · {categoryLabel}</div>

            <h1 className="cpdp-name">
              Build Your <em>Charm</em>
            </h1>

            <div className="cpdp-price-row">
              <span className="cpdp-price">
                {totalCharmPrice > 0
                  ? `₹${totalCharmPrice.toLocaleString('en-IN')}`
                  : `From ₹${Math.min(...filteredItems.map(c => c.price), price).toLocaleString('en-IN')}`
                }
              </span>
              <span className="cpdp-price-note">per set · price updates as you select</span>
            </div>

            <div className="cpdp-divider" />

            {/* ── Charm Selector ── */}
            <p className="cpdp-section-label" style={{ marginBottom: 14 }}>
              Select Your <span>Charms</span>
            </p>

            <CharmSelector
              charmItems={filteredItems.length > 0 ? filteredItems : charmItems}
              onChange={setSelectedCharms}
            />

            <div className="cpdp-divider" />

            {/* ── Quantity ── */}
            <p className="cpdp-section-label" style={{ marginBottom: 10 }}>Quantity</p>
            <div className="cpdp-qty-row">
              <div className="cpdp-qty">
                <button className="cpdp-qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                <span className="cpdp-qty-val">{qty}</span>
                <button className="cpdp-qty-btn" onClick={() => setQty(q => q + 1)}>+</button>
              </div>
            </div>

            {/* ── Price Summary ── */}
            <div className="cpdp-summary">
              <div className="cpdp-summary-row">
                <span>Charms ({selectedCharms.filter(s => s.charm).length} selected)</span>
                <span>₹{totalCharmPrice.toLocaleString('en-IN')}</span>
              </div>
              <div className="cpdp-summary-row">
                <span>Quantity</span>
                <span>× {qty}</span>
              </div>
              <div className="cpdp-summary-row">
                <span>Shipping</span>
                <span>{totalPrice >= 999 ? 'Free' : '₹60'}</span>
              </div>
              <div className="cpdp-summary-row total">
                <span>Total</span>
                <span>₹{(totalPrice + (totalPrice >= 999 ? 0 : 60)).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Info note */}
            <div className="cpdp-info-note">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 15, height: 15, flexShrink: 0, color: 'var(--gold)', marginTop: 1 }}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <p>Our team reviews your charm selection within <strong>2 business hours</strong> and confirms before crafting. Custom charm orders are <strong>non-returnable</strong> unless damaged or incorrect.</p>
            </div>

            {/* ── CTA ── */}
            <div className="cpdp-cta-row">
              <button
                className={`cpdp-btn-wish${wished ? ' on' : ''}`}
                onClick={() => wishlistItem && toggleItem(wishlistItem)}
                aria-label="Wishlist"
              >
                <svg viewBox="0 0 24 24" fill={wished ? 'var(--beige)' : 'none'} stroke={wished ? 'none' : 'currentColor'} strokeWidth="1.8" width="16" height="16">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                {wished ? 'Wished' : 'Wishlist'}
              </button>
              <div className="cpdp-btn-cart-wrap">
                <button
                  ref={cartBtnRef}
                  className={`cpdp-btn-cart${cartAnim ? ' bounce' : ''}`}
                  onClick={handleAddToCart}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
                  </svg>
                  {cartAnim ? 'Added! ✓' : 'Add to Cart'}
                </button>
                <Sparkles active={sparkleAnim} />
              </div>
              <button className="cpdp-btn-buy" onClick={handleBuyNow}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
                Buy It Now
              </button>
            </div>

            {/* ── Trust Badges ── */}
            <div className="cpdp-trust">
              {TRUST_BADGES.map((b, i) => (
                <div key={i} className="cpdp-trust-item">
                  <div className="cpdp-trust-icon">{b.icon}</div>
                  <div className="cpdp-trust-title">{b.title}</div>
                  <div className="cpdp-trust-sub">{b.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}