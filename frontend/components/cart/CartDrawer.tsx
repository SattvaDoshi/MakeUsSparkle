// 'use client';

// import { useRef, useEffect } from 'react';
// import Link from 'next/link';
// import { useCart, cartSubtotal, cartShipping, GIFT_CHARGE } from '@/lib/cartContext';

// // ─── Offer thresholds (must match CartPage) ───────────────────────────────────
// const OFFERS = [
//   { label: 'Free Shipping',   threshold: 598,  emoji: '🚚' },
//   { label: 'Free Gift',       threshold: 999,  emoji: '🎁' },
//   { label: 'Free Organiser',  threshold: 1199, emoji: '🛍️' },
// ];

// export default function CartDrawer() {
//   const { state, closeDrawer, removeItem, updateQty, itemCount, subtotal } = useCart();
//   const { isDrawerOpen, items } = state;
//   const overlayRef = useRef<HTMLDivElement>(null);

//   // Close on Esc
//   useEffect(() => {
//     if (!isDrawerOpen) return;
//     const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeDrawer(); };
//     window.addEventListener('keydown', handler);
//     return () => window.removeEventListener('keydown', handler);
//   }, [isDrawerOpen, closeDrawer]);

//   // Lock body scroll
//   useEffect(() => {
//     document.body.style.overflow = isDrawerOpen ? 'hidden' : '';
//     return () => { document.body.style.overflow = ''; };
//   }, [isDrawerOpen]);

//   const nextOffer  = OFFERS.find(o => subtotal < o.threshold);
//   const remaining  = nextOffer ? nextOffer.threshold - subtotal : 0;
//   const pct        = nextOffer
//     ? Math.min(100, (subtotal / nextOffer.threshold) * 100)
//     : 100;

//   return (
//     <>
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@300;400;500;600&display=swap');

//         :root {
//           --beige: #f5f0e8; --beige-dk: #ede5d5; --beige-dkr: #d9cdb8;
//           --olive-900: #1a1f0d; --olive-600: #3d4a22; --olive-500: #5a6b2e;
//           --olive-400: #7a8e3c; --olive-50: #f2f4e8;
//           --gold: #c9a84c; --ink: #1e2310; --mist: rgba(30,35,16,.45);
//           --red: #c0392b; --green: #2e7d32;
//         }

//         /* ── Overlay ── */
//         .drawer-overlay {
//           position: fixed; inset: 0; z-index: 500;
//           background: rgba(26,31,13,0);
//           pointer-events: none;
//           transition: background .35s ease;
//         }
//         .drawer-overlay.open {
//           background: rgba(26,31,13,.55);
//           pointer-events: all;
//         }

//         /* ── Panel ── */
//         .drawer-panel {
//           position: fixed; top: 0; right: 0; bottom: 0;
//           width: min(420px, 100vw);
//           background: var(--beige);
//           display: flex; flex-direction: column;
//           transform: translateX(100%);
//           transition: transform .4s cubic-bezier(.22,.68,0,1.12);
//           z-index: 501;
//           box-shadow: -8px 0 48px rgba(26,31,13,.18);
//           font-family: 'Jost', sans-serif;
//           color: var(--ink);
//         }
//         .drawer-overlay.open .drawer-panel {
//           transform: translateX(0);
//         }

//         /* ── Header ── */
//         .drawer-head {
//           display: flex; align-items: center; justify-content: space-between;
//           padding: 22px 24px 18px;
//           border-bottom: 1px solid rgba(61,74,34,.1);
//           flex-shrink: 0;
//         }
//         .drawer-head-left {
//           display: flex; align-items: baseline; gap: 10px;
//         }
//         .drawer-head-title {
//           font-family: 'Cormorant Garamond', serif;
//           font-size: 22px; font-weight: 300; letter-spacing: .04em;
//           color: var(--olive-900);
//         }
//         .drawer-head-count {
//           font-size: 11px; letter-spacing: .18em; text-transform: uppercase;
//           color: var(--mist);
//         }
//         .drawer-close {
//           width: 34px; height: 34px;
//           border-radius: 50%;
//           border: 1.5px solid var(--beige-dkr);
//           background: white;
//           cursor: pointer;
//           display: flex; align-items: center; justify-content: center;
//           color: var(--mist);
//           transition: all .2s;
//         }
//         .drawer-close:hover { border-color: var(--olive-400); color: var(--olive-600); background: var(--olive-50); }

//         /* ── Offer progress ── */
//         .drawer-progress {
//           padding: 14px 24px;
//           border-bottom: 1px solid rgba(61,74,34,.08);
//           flex-shrink: 0;
//           background: white;
//         }
//         .drawer-progress-text {
//           font-size: 12px; color: var(--ink); margin-bottom: 8px; line-height: 1.5;
//         }
//         .drawer-progress-text strong { color: var(--olive-600); }
//         .drawer-track {
//           height: 4px; background: var(--beige-dkr); border-radius: 2px; overflow: hidden;
//         }
//         .drawer-fill {
//           height: 100%;
//           background: linear-gradient(90deg, var(--olive-400), var(--gold));
//           border-radius: 2px;
//           transition: width .6s cubic-bezier(.22,.68,0,1.2);
//         }

//         /* ── Items ── */
//         .drawer-items {
//           flex: 1; overflow-y: auto; padding: 16px 24px; display: flex; flex-direction: column; gap: 14px;
//           scrollbar-width: thin;
//           scrollbar-color: var(--beige-dkr) transparent;
//         }
//         .drawer-items::-webkit-scrollbar { width: 4px; }
//         .drawer-items::-webkit-scrollbar-thumb { background: var(--beige-dkr); border-radius: 2px; }

//         /* ── Item card ── */
//         .di-card {
//           display: flex; gap: 12px;
//           background: white; border-radius: 14px;
//           padding: 12px; border: 1px solid rgba(61,74,34,.07);
//           animation: diSlide .3s ease both;
//         }
//         @keyframes diSlide {
//           from { opacity: 0; transform: translateX(16px); }
//           to   { opacity: 1; transform: translateX(0); }
//         }
//         .di-img {
//           width: 72px; height: 72px; border-radius: 10px;
//           object-fit: cover; flex-shrink: 0;
//           background: var(--beige-dk);
//         }
//         .di-body { flex: 1; min-width: 0; }
//         .di-name {
//           font-size: 12.5px; font-weight: 500; color: var(--olive-900);
//           margin-bottom: 3px; line-height: 1.3;
//           white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
//         }
//         .di-color {
//           display: flex; align-items: center; gap: 5px;
//           font-size: 10px; color: var(--mist); margin-bottom: 8px;
//         }
//         .di-color-dot {
//           width: 10px; height: 10px; border-radius: 50%;
//           border: 1.5px solid rgba(0,0,0,.12);
//           flex-shrink: 0;
//         }
//         .di-price-row {
//           display: flex; align-items: center; gap: 6px;
//         }
//         .di-price { font-size: 14px; font-weight: 600; color: var(--olive-900); }
//         .di-original { font-size: 11px; color: var(--mist); text-decoration: line-through; }
//         .di-actions {
//           display: flex; flex-direction: column; align-items: flex-end; justify-content: space-between;
//         }
//         .di-remove {
//           background: none; border: none; cursor: pointer;
//           color: var(--mist); font-size: 16px; line-height: 1;
//           padding: 2px; transition: color .2s;
//         }
//         .di-remove:hover { color: var(--red); }
//         .di-qty {
//           display: flex; align-items: center;
//           border: 1.5px solid var(--beige-dkr); border-radius: 50px;
//           overflow: hidden;
//         }
//         .di-qty-btn {
//           width: 28px; height: 28px; background: none; border: none;
//           font-size: 16px; cursor: pointer; color: var(--olive-600);
//           display: flex; align-items: center; justify-content: center;
//           transition: background .15s;
//         }
//         .di-qty-btn:hover { background: var(--olive-50); }
//         .di-qty-val {
//           min-width: 28px; text-align: center;
//           font-size: 12px; font-weight: 600; color: var(--ink);
//         }

//         /* ── Empty ── */
//         .drawer-empty {
//           flex: 1; display: flex; flex-direction: column;
//           align-items: center; justify-content: center; gap: 12px;
//           padding: 40px 24px; text-align: center;
//         }
//         .drawer-empty-icon {
//           font-family: 'Cormorant Garamond', serif;
//           font-size: 48px; font-style: italic; font-weight: 300;
//           color: rgba(61,74,34,.15);
//         }
//         .drawer-empty-text {
//           font-size: 13px; color: var(--mist); letter-spacing: .06em;
//         }
//         .drawer-empty-link {
//           font-size: 10px; letter-spacing: .3em; text-transform: uppercase;
//           color: var(--olive-600); text-decoration: none; font-weight: 500;
//           border-bottom: 1px solid var(--olive-200); padding-bottom: 2px;
//           transition: color .2s;
//         }
//         .drawer-empty-link:hover { color: var(--olive-500); }

//         /* ── Footer ── */
//         .drawer-foot {
//           padding: 18px 24px 24px;
//           border-top: 1px solid rgba(61,74,34,.1);
//           background: white; flex-shrink: 0;
//         }
//         .drawer-subtotal-row {
//           display: flex; justify-content: space-between;
//           font-size: 13px; color: var(--mist); margin-bottom: 14px;
//         }
//         .drawer-subtotal-row strong { font-weight: 600; color: var(--ink); }
//         .drawer-cta {
//           display: flex; flex-direction: column; gap: 8px;
//         }
//         .drawer-btn-cart {
//           display: flex; align-items: center; justify-content: center; gap: 8px;
//           padding: 14px;
//           background: var(--olive-900);
//           color: var(--beige);
//           border: none; border-radius: 50px;
//           font-family: 'Jost', sans-serif;
//           font-size: 10.5px; font-weight: 600; letter-spacing: .22em;
//           text-transform: uppercase;
//           text-decoration: none;
//           cursor: pointer;
//           transition: background .22s;
//           width: 100%;
//         }
//         .drawer-btn-cart:hover { background: var(--olive-600); }
//         .drawer-btn-shop {
//           display: flex; align-items: center; justify-content: center;
//           padding: 13px;
//           background: transparent;
//           color: var(--olive-600);
//           border: 1.5px solid var(--beige-dkr);
//           border-radius: 50px;
//           font-family: 'Jost', sans-serif;
//           font-size: 10.5px; font-weight: 500; letter-spacing: .18em;
//           text-transform: uppercase;
//           text-decoration: none;
//           cursor: pointer;
//           transition: all .2s;
//         }
//         .drawer-btn-shop:hover { border-color: var(--olive-400); background: var(--olive-50); }
//       `}</style>

//       <div  
//         ref={overlayRef}
//         className={`drawer-overlay${isDrawerOpen ? ' open' : ''}`}
//         onClick={e => { if (e.target === overlayRef.current) closeDrawer(); }}
//       >
//         <div className="drawer-panel" role="dialog" aria-modal="true" aria-label="Shopping cart">

//           {/* Header */}
//           <div className="drawer-head">
//             <div className="drawer-head-left">
//               <span className="drawer-head-title">Your Cart</span>
//               {itemCount > 0 && (
//                 <span className="drawer-head-count">{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
//               )}
//             </div>
//             <button className="drawer-close" onClick={closeDrawer} aria-label="Close cart">
//               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                 <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
//               </svg>
//             </button>
//           </div>

//           {/* Offer progress */}
//           {items.length > 0 && (
//             <div className="drawer-progress">
//               <p className="drawer-progress-text">
//                 {nextOffer
//                   ? <>Add <strong>₹{remaining}</strong> more for <strong>{nextOffer.emoji} {nextOffer.label}</strong></>
//                   : '🎉 You\'ve unlocked all rewards!'
//                 }
//               </p>
//               <div className="drawer-track">
//                 <div className="drawer-fill" style={{ width: `${pct}%` }} />
//               </div>
//             </div>
//           )}

//           {/* Items */}
//           {items.length === 0 ? (
//             <div className="drawer-empty">
//               <div className="drawer-empty-icon">◇</div>
//               <p className="drawer-empty-text">Your cart is empty</p>
//               <Link href="/shop" className="drawer-empty-link" onClick={closeDrawer}>
//                 Start Shopping
//               </Link>
//             </div>
//           ) : (
//             <div className="drawer-items">
//               {items.map(item => (
//                 <div className="di-card" key={`${item.id}-${item.colorHex}`}>
//                   {/* eslint-disable-next-line @next/next/no-img-element */}
//                   <img className="di-img" src={item.image} alt={item.name} />
//                   <div className="di-body">
//                     <div className="di-name">{item.name}</div>
//                     <div className="di-color">
//                       <span className="di-color-dot" style={{ background: item.colorHex }} />
//                       {item.color}
//                     </div>
//                     <div className="di-price-row">
//                       <span className="di-price">₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
//                       {item.originalPrice && (
//                         <span className="di-original">₹{(item.originalPrice * item.qty).toLocaleString('en-IN')}</span>
//                       )}
//                     </div>
//                   </div>
//                   <div className="di-actions">
//                     <button
//                       className="di-remove"
//                       onClick={() => removeItem(item.id, item.colorHex)}
//                       aria-label={`Remove ${item.name}`}
//                     >×</button>
//                     <div className="di-qty">
//                       <button className="di-qty-btn" onClick={() => updateQty(item.id, item.colorHex, item.qty - 1)}>−</button>
//                       <span className="di-qty-val">{item.qty}</span>
//                       <button className="di-qty-btn" onClick={() => updateQty(item.id, item.colorHex, item.qty + 1)}>+</button>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}

//           {/* Footer */}
//           {items.length > 0 && (
//             <div className="drawer-foot">
//               <div className="drawer-subtotal-row">
//                 <span>Subtotal ({itemCount} item{itemCount !== 1 ? 's' : ''})</span>
//                 <strong>₹{subtotal.toLocaleString('en-IN')}</strong>
//               </div>
//               <div className="drawer-cta">
//                 <Link href="/cart" className="drawer-btn-cart" onClick={closeDrawer}>
//                   View Cart & Checkout
//                   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                     <path d="M5 12h14M12 5l7 7-7 7"/>
//                   </svg>
//                 </Link>
//                 <button className="drawer-btn-shop" onClick={closeDrawer}>
//                   Continue Shopping
//                 </button>
//               </div>
//             </div>
//           )}

//         </div>
//       </div>
//     </>
//   );
// }

'use client';

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/cartContext';

// ─── Milestones ───────────────────────────────────────────────────────────────
const MILESTONES = [
  { threshold: 598,  label: 'Free Shipping',   fullLabel: 'Free Shipping on ₹598!',   emoji: '🚚' },
  { threshold: 999,  label: 'Free Gift',        fullLabel: 'Free Gift on ₹999!',        emoji: '🎁' },
  { threshold: 1199, label: 'Free Organiser',   fullLabel: 'Free Organiser on ₹1199!',  emoji: '🛍️' },
];

const MAX_THRESHOLD = MILESTONES[MILESTONES.length - 1].threshold;
const BRAND = 'MakeYouSparkle';

// ─── Confetti burst ───────────────────────────────────────────────────────────
function MiniConfetti({ trigger }: { trigger: number }) {
  const [bursts, setBursts] = useState<number[]>([]);

  useEffect(() => {
    if (trigger === 0) return;
    const id = Date.now();
    setBursts(prev => [...prev, id]);
    setTimeout(() => setBursts(prev => prev.filter(b => b !== id)), 1500);
  }, [trigger]);

  if (bursts.length === 0) return null;
  const colors = ['#c9a84c', '#5a6b2e', '#eedfa0', '#a0c04c', '#3d4a22', '#f5f0e8'];

  return (
    <>
      {bursts.map(id => (
        <div key={id} className="mc-root" aria-hidden="true">
          {Array.from({ length: 28 }, (_, i) => (
            <span
              key={i}
              className="mc-particle"
              style={{
                '--angle': `${(i / 28) * 360}deg`,
                '--dist':  `${35 + Math.random() * 35}px`,
                '--clr':   colors[i % colors.length],
                '--delay': `${i * 12}ms`,
                '--size':  `${2 + Math.random() * 3}px`,
                '--dur':   `${700 + Math.random() * 400}ms`,
              } as React.CSSProperties}
            />
          ))}
        </div>
      ))}
    </>
  );
}

// ─── Main CartDrawer ──────────────────────────────────────────────────────────
export default function CartDrawer() {
  const { state, closeDrawer, removeItem, updateQty, itemCount, subtotal } = useCart();
  const { isDrawerOpen, items } = state;
  const overlayRef = useRef<HTMLDivElement>(null);

  const [prevSubtotal, setPrevSubtotal] = useState(0);
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [justUnlockedIdx, setJustUnlockedIdx] = useState<number | null>(null);

  // Detect milestone crossings
  useEffect(() => {
    MILESTONES.forEach((m, idx) => {
      if (prevSubtotal < m.threshold && subtotal >= m.threshold) {
        setConfettiTrigger(t => t + 1);
        setJustUnlockedIdx(idx);
        setTimeout(() => setJustUnlockedIdx(null), 900);
      }
    });
    setPrevSubtotal(subtotal);
  }, [subtotal]);

  // Close on Esc
  useEffect(() => {
    if (!isDrawerOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeDrawer(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isDrawerOpen, closeDrawer]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = isDrawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isDrawerOpen]);

  // ── Progress: starts at 0, grows only as subtotal increases ──
  // When subtotal is 0 → barPct is 0 (completely empty bar)
  const barPct = subtotal <= 0 ? 0 : Math.min(100, (subtotal / MAX_THRESHOLD) * 100);
  const allUnlocked = subtotal >= MAX_THRESHOLD;
  const nextMilestone = MILESTONES.find(m => subtotal < m.threshold);
  const remaining = nextMilestone ? nextMilestone.threshold - subtotal : 0;

  // Letters revealed inside the fill — none shown when bar < 8% wide
  const lettersToShow = barPct < 8 ? 0 : Math.round((barPct / 100) * BRAND.length);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@300;400;500;600&display=swap');

        :root {
          --beige: #f5f0e8; --beige-dk: #ede5d5; --beige-dkr: #d9cdb8;
          --olive-900: #1a1f0d; --olive-700: #283010; --olive-600: #3d4a22;
          --olive-500: #5a6b2e; --olive-400: #7a8e3c; --olive-50: #f2f4e8;
          --gold: #c9a84c; --gold-lt: #eedfa0;
          --ink: #1e2310; --mist: rgba(30,35,16,.45); --mist-lt: rgba(30,35,16,.28);
          --red: #c0392b; --green: #2e7d32;
        }

        /* ── Overlay ── */
        .drawer-overlay {
          position: fixed; inset: 0; z-index: 500;
          background: rgba(26,31,13,0); pointer-events: none;
          transition: background .35s ease;
        }
        .drawer-overlay.open {
          background: rgba(26,31,13,.55); pointer-events: all;
        }

        /* ── Panel ── */
        .drawer-panel {
          position: fixed; top: 0; right: 0; bottom: 0;
          width: min(420px, 100vw);
          background: var(--beige);
          display: flex; flex-direction: column;
          transform: translateX(100%);
          transition: transform .4s cubic-bezier(.22,.68,0,1.12);
          z-index: 501;
          box-shadow: -8px 0 48px rgba(26,31,13,.18);
          font-family: 'Jost', sans-serif; color: var(--ink);
        }
        .drawer-overlay.open .drawer-panel { transform: translateX(0); }

        /* ── Header ── */
        .drawer-head {
          display: flex; align-items: center; justify-content: space-between;
          padding: 22px 24px 18px;
          border-bottom: 1px solid rgba(61,74,34,.1); flex-shrink: 0;
        }
        .drawer-head-left { display: flex; align-items: baseline; gap: 10px; }
        .drawer-head-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px; font-weight: 300; letter-spacing: .04em; color: var(--olive-900);
        }
        .drawer-head-count {
          font-size: 11px; letter-spacing: .18em; text-transform: uppercase; color: var(--mist);
        }
        .drawer-close {
          width: 34px; height: 34px; border-radius: 50%;
          border: 1.5px solid var(--beige-dkr); background: white;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          color: var(--mist); transition: all .2s;
        }
        .drawer-close:hover { border-color: var(--olive-400); color: var(--olive-600); background: var(--olive-50); }

        /* ══════════════════════════════════
           PROGRESS SECTION
        ══════════════════════════════════ */
        .dp-section {
          padding: 14px 24px 18px;
          border-bottom: 1px solid rgba(61,74,34,.08);
          flex-shrink: 0;
          background: white;
          position: relative;
        }

        /* Nudge text */
        .dp-nudge {
          text-align: center; font-size: 12px; font-weight: 400;
          color: var(--mist); line-height: 1.55; margin-bottom: 14px;
        }
        .dp-nudge strong { color: var(--olive-600); font-weight: 600; }
        .dp-nudge-done {
          text-align: center;
          font-family: 'Cormorant Garamond', serif; font-style: italic;
          font-size: 13px; color: var(--green); margin-bottom: 14px;
        }

        /* ═══════════════════════════════════════════════════════
           PROGRESS BAR WRAPPER
           — gives enough vertical room for dots to overflow top/bottom
             and for milestone labels to sit below without clipping
        ═══════════════════════════════════════════════════════ */
        .dp-track-outer {
          /*
            The track itself is 26px tall.
            Dots are 30px, centred on the track midline → they overflow
            2px top and 2px bottom, plus we need 3px box-shadow ring = ~5px bleed.
            Labels are ~28px below the dot centre = 14px below track bottom.
            So: padding-top: 8px, padding-bottom: 36px is comfortable.
          */
          position: relative;
          padding-top: 8px;
          padding-bottom: 38px;   /* space for labels underneath the bar */
        }

        /* ── The track (grey background shell) ── */
        .dp-track {
          position: relative;
          height: 26px;
          background: var(--beige-dk);
          border-radius: 13px;
          border: 1px solid rgba(61,74,34,.1);
          /* 
            IMPORTANT: overflow must be VISIBLE so that dots
            (which are children of dp-dot-layer, which sits inside
            dp-track-outer NOT inside dp-track) can be seen.
            The fill itself is clipped by its own border-radius.
          */
          overflow: visible;
        }

        /* ── The fill — starts at 0%, grows with subtotal ── */
        .dp-fill {
          position: absolute;
          top: 0; left: 0;
          /* height matches track exactly */
          height: 26px;
          border-radius: 13px;
          background: linear-gradient(90deg,
            var(--olive-700) 0%,
            var(--olive-500) 40%,
            var(--olive-400) 72%,
            var(--gold)      100%
          );
          /*
            Smooth transition so the bar visually "grows" when items are added.
            cubic-bezier gives a satisfying overshoot spring feel.
          */
          transition: width .9s cubic-bezier(.22,.68,0,1.18);
          /*
            overflow:hidden clips the brand text to the fill width —
            this is what creates the "reveal as bar grows" effect.
          */
          overflow: hidden;
          /* flex so the brand text centres vertically inside */
          display: flex;
          align-items: center;
          min-width: 0;
          /* Never go below 0 (explicit safety) */
          width: 0%;
        }

        /* ── Brand text INSIDE the fill — revealed letter by letter ── */
        .dp-brand {
          padding-left: 12px;
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: 11.5px;
          font-weight: 400;
          letter-spacing: .12em;
          color: rgba(245,240,232,.95);
          text-shadow: 0 1px 6px rgba(0,0,0,.3);
          white-space: nowrap;
          display: flex;
          gap: 0;
          pointer-events: none;
          user-select: none;
        }
        .dp-letter {
          display: inline-block;
          opacity: 0;
          transform: translateY(5px) scale(.8);
          transition: opacity .25s ease, transform .25s ease;
        }
        .dp-letter.on {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        /* ══════════════════════════════════════════════════════
           MILESTONE DOTS
           — absolutely positioned inside dp-track-outer,
             sitting at the same vertical level as the track,
             so they straddle the bar edge perfectly.
        ══════════════════════════════════════════════════════ */
        .dp-dot-layer {
          /*
            top = dp-track-outer's padding-top (8px).
            That places the layer exactly where dp-track starts.
            height = 26px (same as track).
          */
          position: absolute;
          top: 8px;
          left: 0; right: 0;
          height: 26px;
          /* allow dots to overflow the layer box */
          overflow: visible;
          pointer-events: none;
        }

        .dp-dot-wrap {
          position: absolute;
          /* centre vertically on the 26px layer (= 13px from top) */
          top: 13px;
          transform: translate(-50%, -50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          pointer-events: all;
        }

        .dp-dot {
          width: 30px; height: 30px; border-radius: 50%;
          border: 2.5px solid var(--beige-dkr);
          background: white;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px;
          /* 
            The outer white ring (0 0 0 3px white) visually separates the dot
            from the coloured fill behind it.
          */
          box-shadow: 0 1px 5px rgba(0,0,0,.13), 0 0 0 3px white;
          transition: border-color .4s, background .4s, box-shadow .5s;
          position: relative; z-index: 3;
        }
        .dp-dot.unlocked {
          border-color: var(--gold);
          background: linear-gradient(135deg, #d8bc62, var(--gold));
          box-shadow:
            0 0 0 3px white,
            0 0 0 5px rgba(201,168,76,.25),
            0 3px 12px rgba(201,168,76,.4);
        }
        .dp-dot.just-popped {
          animation: dotPop .6s cubic-bezier(.34,1.56,.64,1) both;
        }
        @keyframes dotPop {
          0%   { transform: scale(.45); }
          100% { transform: scale(1); }
        }

        /*
          Label — sits BELOW the dot.
          The dot is centred at top:13px inside the 26px layer.
          Dot radius = 15px → dot bottom edge = 13 + 15 = 28px from layer top.
          dp-track-outer padding-bottom = 38px starts right after the track.
          So 'top: calc(100% + 8px)' of dp-dot-wrap puts it comfortably below.
        */
        .dp-dot-lbl {
          position: absolute;
          top: calc(100% + 6px);
          left: 50%;
          transform: translateX(-50%);
          white-space: nowrap;
          text-align: center;
          font-size: 8px; font-weight: 500; letter-spacing: .06em;
          line-height: 1.3; color: var(--mist-lt);
          transition: color .3s, font-weight .3s;
          pointer-events: none;
        }
        /* When dot is unlocked, label turns olive green */
        .dp-dot.unlocked ~ .dp-dot-lbl {
          color: var(--olive-600);
          font-weight: 600;
        }

        /* ── Confetti ── */
        .mc-root {
          position: absolute;
          top: 50%; left: 50%;
          width: 0; height: 0;
          pointer-events: none; z-index: 20;
          overflow: visible;
        }
        .mc-particle {
          position: absolute;
          width: var(--size,4px); height: var(--size,4px);
          background: var(--clr, var(--gold));
          border-radius: 50%;
          animation: mcBurst var(--dur,900ms) ease-out var(--delay,0ms) both;
          transform: translate(-50%,-50%);
        }
        @keyframes mcBurst {
          0%   { transform: translate(-50%,-50%) rotate(var(--angle)) translateX(0) scale(1); opacity:1; }
          100% { transform: translate(-50%,-50%) rotate(var(--angle)) translateX(var(--dist)) scale(0); opacity:0; }
        }

        /* ══════════════════
           ITEMS
        ══════════════════ */
        .drawer-items {
          flex: 1; overflow-y: auto; padding: 16px 24px;
          display: flex; flex-direction: column; gap: 14px;
          scrollbar-width: thin; scrollbar-color: var(--beige-dkr) transparent;
        }
        .drawer-items::-webkit-scrollbar { width: 4px; }
        .drawer-items::-webkit-scrollbar-thumb { background: var(--beige-dkr); border-radius: 2px; }

        .di-card {
          display: flex; gap: 12px; background: white; border-radius: 14px;
          padding: 12px; border: 1px solid rgba(61,74,34,.07);
          animation: diSlide .3s ease both;
        }
        @keyframes diSlide {
          from { opacity:0; transform:translateX(16px); }
          to   { opacity:1; transform:translateX(0); }
        }
        .di-img {
          width: 72px; height: 72px; border-radius: 10px;
          object-fit: cover; flex-shrink: 0; background: var(--beige-dk);
        }
        .di-body { flex: 1; min-width: 0; }
        .di-name {
          font-size: 12.5px; font-weight: 500; color: var(--olive-900);
          margin-bottom: 3px; line-height: 1.3;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .di-color {
          display: flex; align-items: center; gap: 5px;
          font-size: 10px; color: var(--mist); margin-bottom: 8px;
        }
        .di-color-dot {
          width: 10px; height: 10px; border-radius: 50%;
          border: 1.5px solid rgba(0,0,0,.12); flex-shrink: 0;
        }
        .di-price-row { display: flex; align-items: center; gap: 6px; }
        .di-price { font-size: 14px; font-weight: 600; color: var(--olive-900); }
        .di-original { font-size: 11px; color: var(--mist); text-decoration: line-through; }
        .di-actions {
          display: flex; flex-direction: column;
          align-items: flex-end; justify-content: space-between;
        }
        .di-remove {
          background: none; border: none; cursor: pointer;
          color: var(--mist); font-size: 16px; line-height: 1; padding: 2px;
          transition: color .2s;
        }
        .di-remove:hover { color: var(--red); }
        .di-qty {
          display: flex; align-items: center;
          border: 1.5px solid var(--beige-dkr); border-radius: 50px; overflow: hidden;
        }
        .di-qty-btn {
          width: 28px; height: 28px; background: none; border: none;
          font-size: 16px; cursor: pointer; color: var(--olive-600);
          display: flex; align-items: center; justify-content: center;
          transition: background .15s;
        }
        .di-qty-btn:hover { background: var(--olive-50); }
        .di-qty-val {
          min-width: 28px; text-align: center;
          font-size: 12px; font-weight: 600; color: var(--ink);
        }

        /* ── Empty ── */
        .drawer-empty {
          flex: 1; display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 12px;
          padding: 40px 24px; text-align: center;
        }
        .drawer-empty-icon {
          font-family: 'Cormorant Garamond', serif;
          font-size: 48px; font-style: italic; font-weight: 300;
          color: rgba(61,74,34,.15);
        }
        .drawer-empty-text { font-size: 13px; color: var(--mist); letter-spacing: .06em; }
        .drawer-empty-link {
          font-size: 10px; letter-spacing: .3em; text-transform: uppercase;
          color: var(--olive-600); text-decoration: none; font-weight: 500;
          border-bottom: 1px solid rgba(61,74,34,.2); padding-bottom: 2px;
          transition: color .2s;
        }
        .drawer-empty-link:hover { color: var(--olive-500); }

        /* ── Footer ── */
        .drawer-foot {
          padding: 18px 24px 24px;
          border-top: 1px solid rgba(61,74,34,.1);
          background: white; flex-shrink: 0;
        }
        .drawer-subtotal-row {
          display: flex; justify-content: space-between;
          font-size: 13px; color: var(--mist); margin-bottom: 14px;
        }
        .drawer-subtotal-row strong { font-weight: 600; color: var(--ink); }
        .drawer-cta { display: flex; flex-direction: column; gap: 8px; }
        .drawer-btn-cart {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          padding: 14px; background: var(--olive-900); color: var(--beige);
          border: none; border-radius: 50px;
          font-family: 'Jost', sans-serif; font-size: 10.5px; font-weight: 600;
          letter-spacing: .22em; text-transform: uppercase;
          text-decoration: none; cursor: pointer; transition: background .22s; width: 100%;
        }
        .drawer-btn-cart:hover { background: var(--olive-600); }
        .drawer-btn-shop {
          display: flex; align-items: center; justify-content: center;
          padding: 13px; background: transparent; color: var(--olive-600);
          border: 1.5px solid var(--beige-dkr); border-radius: 50px;
          font-family: 'Jost', sans-serif; font-size: 10.5px; font-weight: 500;
          letter-spacing: .18em; text-transform: uppercase;
          text-decoration: none; cursor: pointer; transition: all .2s;
        }
        .drawer-btn-shop:hover { border-color: var(--olive-400); background: var(--olive-50); }
      `}</style>

      <div
        ref={overlayRef}
        className={`drawer-overlay${isDrawerOpen ? ' open' : ''}`}
        onClick={e => { if (e.target === overlayRef.current) closeDrawer(); }}
      >
        <div className="drawer-panel" role="dialog" aria-modal="true" aria-label="Shopping cart">

          {/* ── Header ── */}
          <div className="drawer-head">
            <div className="drawer-head-left">
              <span className="drawer-head-title">Your Cart</span>
              {itemCount > 0 && (
                <span className="drawer-head-count">{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
              )}
            </div>
            <button className="drawer-close" onClick={closeDrawer} aria-label="Close cart">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* ══════════════════════════════════
              MILESTONE PROGRESS BAR
              — only shown when cart has items
          ══════════════════════════════════ */}
          {items.length > 0 && (
            <div className="dp-section">
              <MiniConfetti trigger={confettiTrigger} />

              {/* Nudge / all-unlocked text */}
              {allUnlocked ? (
                <div className="dp-nudge-done">
                  ✦ You&apos;ve unlocked all rewards — you truly sparkle! ✦
                </div>
              ) : (
                <div className="dp-nudge">
                  Add <strong>₹{remaining}</strong> more to get <strong>{nextMilestone?.fullLabel}</strong>
                </div>
              )}

              {/*
                dp-track-outer
                  ├─ dp-track (grey pill — the empty background)
                  │    └─ dp-fill (olive→gold fill — width = barPct%)
                  │         └─ dp-brand (MakeYouSparkle, clipped by fill overflow:hidden)
                  └─ dp-dot-layer (absolutely over the track row)
                       └─ dp-dot-wrap × 3  (one per milestone)
                            ├─ dp-dot
                            └─ dp-dot-lbl (label BELOW dot, inside padding-bottom)
              */}
              <div className="dp-track-outer">

                {/* Empty grey track */}
                <div className="dp-track">

                  {/*
                    Fill — starts at 0%, grows to barPct as subtotal rises.
                    overflow:hidden clips the brand text so only the revealed
                    portion shows through the coloured fill.
                  */}
                  <div className="dp-fill" style={{ width: `${barPct}%` }}>
                    <div className="dp-brand">
                      {BRAND.split('').map((ch, i) => (
                        <span
                          key={i}
                          className={`dp-letter${i < lettersToShow ? ' on' : ''}`}
                          style={{ transitionDelay: `${i * 30}ms` }}
                        >
                          {ch}
                        </span>
                      ))}
                    </div>
                  </div>

                </div>{/* /dp-track */}

                {/*
                  Dot layer — sits at the same vertical position as dp-track.
                  Each dot is centred at its milestone's % position along the bar.
                  The label (.dp-dot-lbl) hangs below, in the padding-bottom space.
                */}
                <div className="dp-dot-layer">
                  {MILESTONES.map((m, idx) => {
                    const posPct = (m.threshold / MAX_THRESHOLD) * 100;
                    const unlocked = subtotal >= m.threshold;
                    const popped   = justUnlockedIdx === idx;
                    return (
                      <div
                        key={m.threshold}
                        className="dp-dot-wrap"
                        style={{ left: `${posPct}%` }}
                      >
                        <div
                          className={[
                            'dp-dot',
                            unlocked ? 'unlocked' : '',
                            popped   ? 'just-popped' : '',
                          ].filter(Boolean).join(' ')}
                        >
                          {unlocked ? (
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          ) : (
                            <span style={{ fontSize: 12 }}>{m.emoji}</span>
                          )}
                        </div>
                        {/* Label sits in padding-bottom space, centred under dot */}
                        <span className="dp-dot-lbl">{m.label}</span>
                      </div>
                    );
                  })}
                </div>

              </div>{/* /dp-track-outer */}
            </div>
          )}

          {/* ── Items ── */}
          {items.length === 0 ? (
            <div className="drawer-empty">
              <div className="drawer-empty-icon">◇</div>
              <p className="drawer-empty-text">Your cart is empty</p>
              <Link href="/shop" className="drawer-empty-link" onClick={closeDrawer}>
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="drawer-items">
              {items.map(item => (
                <div className="di-card" key={`${item.id}-${item.colorHex}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="di-img" src={item.image} alt={item.name} />
                  <div className="di-body">
                    <div className="di-name">{item.name}</div>
                    <div className="di-color">
                      <span className="di-color-dot" style={{ background: item.colorHex }} />
                      {item.color}
                    </div>
                    <div className="di-price-row">
                      <span className="di-price">₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
                      {item.originalPrice && (
                        <span className="di-original">₹{(item.originalPrice * item.qty).toLocaleString('en-IN')}</span>
                      )}
                    </div>
                  </div>
                  <div className="di-actions">
                    <button
                      className="di-remove"
                      onClick={() => removeItem(item.id, item.colorHex)}
                      aria-label={`Remove ${item.name}`}
                    >×</button>
                    <div className="di-qty">
                      <button className="di-qty-btn" onClick={() => updateQty(item.id, item.colorHex, item.qty - 1)}>−</button>
                      <span className="di-qty-val">{item.qty}</span>
                      <button className="di-qty-btn" onClick={() => updateQty(item.id, item.colorHex, item.qty + 1)}>+</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Footer ── */}
          {items.length > 0 && (
            <div className="drawer-foot">
              <div className="drawer-subtotal-row">
                <span>Subtotal ({itemCount} item{itemCount !== 1 ? 's' : ''})</span>
                <strong>₹{subtotal.toLocaleString('en-IN')}</strong>
              </div>
              <div className="drawer-cta">
                <Link href="/cart" className="drawer-btn-cart" onClick={closeDrawer}>
                  View Cart &amp; Checkout
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </Link>
                <button className="drawer-btn-shop" onClick={closeDrawer}>
                  Continue Shopping
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}