// 'use client';

// import { useRef, useEffect, useState } from 'react';
// import Link from 'next/link';
// import { useCart } from '@/lib/cartContext';

// // ─── Milestones (cumulative thresholds) ──────────────────────────────────────
// // Step 1: spend ₹200 total -> Free Shipping (Fills segment 1)
// // Step 2: spend ₹300 total (+₹100 more) -> Premium Packaging (Fills segment 2)
// // Step 3: spend ₹500 total (+₹200 more) -> Free Gift (Fills segment 3)
// const MILESTONES = [
//   {
//     threshold:   200,
//     label:       'Free Shipping',
//     nudge:       'Free Shipping',
//     emoji:       '🚚',
//     word:        'MAKE',
//   },
//   {
//     threshold:   300,
//     label:       'Premium Packaging',
//     nudge:       'Premium Packaging',
//     emoji:       '✨',
//     word:        'YOU',
//   },
//   {
//     threshold:   500,
//     label:       'Free Gift',
//     nudge:       'Free Gift',
//     emoji:       '🎁',
//     word:        'SPARKLE',
//   },
// ];

// const MAX_THRESHOLD = MILESTONES[MILESTONES.length - 1].threshold;

// // ─── Confetti burst ───────────────────────────────────────────────────────────
// function MiniConfetti({ trigger }: { trigger: number }) {
//   const [bursts, setBursts] = useState<number[]>([]);

//   useEffect(() => {
//     if (trigger === 0) return;
//     const id = Date.now();
//     setBursts(prev => [...prev, id]);
//     setTimeout(() => setBursts(prev => prev.filter(b => b !== id)), 1600);
//   }, [trigger]);

//   if (bursts.length === 0) return null;
//   const colors = ['#c9a84c', '#5a6b2e', '#eedfa0', '#a0c04c', '#3d4a22', '#f5f0e8', '#e8d5a0'];

//   return (
//     <>
//       {bursts.map(id => (
//         <div key={id} className="mc-root" aria-hidden="true">
//           {Array.from({ length: 32 }, (_, i) => (
//             <span
//               key={i}
//               className="mc-particle"
//               style={{
//                 '--angle': `${(i / 32) * 360}deg`,
//                 '--dist':  `${40 + Math.random() * 45}px`,
//                 '--clr':   colors[i % colors.length],
//                 '--delay': `${i * 10}ms`,
//                 '--size':  `${2 + Math.random() * 3.5}px`,
//                 '--dur':   `${750 + Math.random() * 450}ms`,
//               } as React.CSSProperties}
//             />
//           ))}
//         </div>
//       ))}
//     </>
//   );
// }

// // ─── Main CartDrawer ──────────────────────────────────────────────────────────
// export default function CartDrawer() {
//   const { state, closeDrawer, removeItem, updateQty, itemCount, subtotal } = useCart();
//   const { isDrawerOpen, items } = state;
//   const overlayRef = useRef<HTMLDivElement>(null);

//   const [prevSubtotal, setPrevSubtotal] = useState(0);
//   const [confettiTrigger, setConfettiTrigger] = useState(0);

//   // Detect milestone crossings for confetti
//   useEffect(() => {
//     MILESTONES.forEach((m) => {
//       if (prevSubtotal < m.threshold && subtotal >= m.threshold) {
//         setConfettiTrigger(t => t + 1);
//       }
//     });
//     setPrevSubtotal(subtotal);
//   }, [subtotal, prevSubtotal]);

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

//   // ── Determine progress state ──
//   const allUnlocked   = subtotal >= MAX_THRESHOLD;
//   const nextMilestone = MILESTONES.find(m => subtotal < m.threshold);
//   const remaining     = nextMilestone ? nextMilestone.threshold - subtotal : 0;

//   return (
//     <>
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=Jost:wght@300;400;500;600&display=swap');

//         :root {
//           --beige:     #f5f0e8;
//           --beige-dk:  #ede5d5;
//           --beige-dkr: #d9cdb8;
//           --olive-900: #1a1f0d;
//           --olive-700: #283010;
//           --olive-600: #3d4a22;
//           --olive-500: #5a6b2e;
//           --olive-400: #7a8e3c;
//           --olive-50:  #f2f4e8;
//           --gold:      #c9a84c;
//           --gold-lt:   #eedfa0;
//           --ink:       #1e2310;
//           --mist:      rgba(30,35,16,.45);
//           --mist-lt:   rgba(30,35,16,.35);
//           --red:       #c0392b;
//           --green:     #2e7d32;
//         }

//         /* ── Overlay ── */
//         .drawer-overlay {
//           position: fixed; inset: 0; z-index: 500;
//           background: rgba(26,31,13,0); pointer-events: none;
//           transition: background .35s ease;
//         }
//         .drawer-overlay.open {
//           background: rgba(26,31,13,.55); pointer-events: all;
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
//           font-family: 'Jost', sans-serif; color: var(--ink);
//         }
//         .drawer-overlay.open .drawer-panel { transform: translateX(0); }

//         /* ── Header ── */
//         .drawer-head {
//           display: flex; align-items: center; justify-content: space-between;
//           padding: 18px 20px 14px;
//           border-bottom: 1px solid rgba(61,74,34,.1); flex-shrink: 0;
//         }
//         .drawer-head-left { display: flex; align-items: baseline; gap: 10px; }
//         .drawer-head-title {
//           font-family: 'Cormorant Garamond', serif;
//           font-size: 24px; font-weight: 600; letter-spacing: .02em; color: var(--olive-900);
//         }
//         .drawer-head-count {
//           font-size: 11px; letter-spacing: .18em; text-transform: uppercase; color: var(--mist);
//         }
//         .drawer-close {
//           width: 34px; height: 34px; border-radius: 50%;
//           border: 1.5px solid var(--beige-dkr); background: white;
//           cursor: pointer; display: flex; align-items: center; justify-content: center;
//           color: var(--mist); transition: all .2s;
//         }
//         .drawer-close:hover { border-color: var(--olive-400); color: var(--olive-600); background: var(--olive-50); }

//         /* ══════════════════════════════════════════════════════
//             PROGRESS SECTION (New UI)
//         ══════════════════════════════════════════════════════ */
//         .dp-section {
//           padding: 16px 20px 22px;
//           border-bottom: 1px solid rgba(61,74,34,.08);
//           flex-shrink: 0;
//           background: white;
//           position: relative;
//         }

//         .dp-nudge {
//           text-align: center;
//           font-size: 12.5px; font-weight: 400;
//           color: var(--mist); line-height: 1.55;
//           margin-bottom: 16px;
//         }
//         .dp-nudge strong { color: var(--olive-600); font-weight: 600; }
//         .dp-nudge-done {
//           text-align: center;
//           font-family: 'Cormorant Garamond', serif; font-style: italic;
//           font-size: 16px; font-weight: 600; color: var(--green);
//           margin-bottom: 16px;
//         }

//         /* ── Segmented Progress Bar ── */
//         .dp-progress-container {
//           display: flex;
//           height: 36px;
//           background: var(--beige-dk);
//           border-radius: 99px;
//           overflow: hidden;
//           box-shadow: inset 0 2px 4px rgba(61,74,34,.08);
//           margin-bottom: 12px;
//           border: 1px solid rgba(61,74,34,.12);
//         }

//         .dp-segment {
//           flex: 1;
//           position: relative;
//           border-right: 1px solid rgba(255,255,255,0.7);
//           display: flex;
//           align-items: center;
//           justify-content: center;
//         }
//         .dp-segment:last-child {
//           border-right: none;
//         }

//         /* Inner animated fill */
//         .dp-fill {
//           position: absolute;
//           top: 0; left: 0; bottom: 0;
//           background: linear-gradient(90deg, var(--olive-500) 0%, var(--gold) 100%);
//           transition: width 0.75s cubic-bezier(.22,.68,0,1.18);
//           z-index: 1;
//         }

//         /* Embedded Text Revealer */
//         .dp-word {
//           position: relative;
//           z-index: 2;
//           font-family: 'Cormorant Garamond', serif;
//           font-style: italic;
//           font-size: 14px;
//           font-weight: 600;
//           letter-spacing: 0.12em;
//           color: white;
//           text-shadow: 0 1px 2px rgba(0,0,0,0.15);
//           opacity: 0;
//           transform: translateY(4px);
//           transition: opacity 0.4s ease, transform 0.4s ease;
//           user-select: none;
//         }
//         .dp-word.visible {
//           opacity: 1;
//           transform: translateY(0);
//         }

//         /* ── Step Labels underneath bar ── */
//         .dp-step-labels {
//           display: flex;
//           margin-top: 8px;
//         }
//         .dp-step-cell {
//           flex: 1;
//           display: flex;
//           flex-direction: column;
//           align-items: center;
//           gap: 2px;
//           padding: 0 4px;
//         }
//         .dp-step-emoji { font-size: 14px; margin-bottom: 2px; }
//         .dp-step-title {
//           font-size: 10px; font-weight: 500; color: var(--mist);
//           text-align: center; line-height: 1.2; transition: color 0.3s;
//         }
//         .dp-step-cell.completed .dp-step-title { color: var(--olive-900); font-weight: 600; }
        
//         .dp-step-amount {
//           font-size: 9px; color: var(--mist-lt); transition: color 0.3s;
//           letter-spacing: 0.04em;
//         }
//         .dp-step-cell.completed .dp-step-amount { color: var(--gold); font-weight: 600; }

//         /* ── Confetti ── */
//         .mc-root {
//           position: absolute; top: 50%; left: 50%;
//           width: 0; height: 0;
//           pointer-events: none; z-index: 20; overflow: visible;
//         }
//         .mc-particle {
//           position: absolute;
//           width: var(--size,4px); height: var(--size,4px);
//           background: var(--clr, var(--gold));
//           border-radius: 50%;
//           animation: mcBurst var(--dur,900ms) ease-out var(--delay,0ms) both;
//           transform: translate(-50%,-50%);
//         }
//         @keyframes mcBurst {
//           0%   { transform: translate(-50%,-50%) rotate(var(--angle)) translateX(0) scale(1); opacity:1; }
//           100% { transform: translate(-50%,-50%) rotate(var(--angle)) translateX(var(--dist)) scale(0); opacity:0; }
//         }

//         /* ══════════════════
//             ITEMS & FOOTER 
//         ══════════════════ */
//         .drawer-items {
//           flex: 1; overflow-y: auto; padding: 14px 20px;
//           display: flex; flex-direction: column; gap: 12px;
//           scrollbar-width: thin; scrollbar-color: var(--beige-dkr) transparent;
//         }
//         .drawer-items::-webkit-scrollbar { width: 4px; }
//         .drawer-items::-webkit-scrollbar-thumb { background: var(--beige-dkr); border-radius: 2px; }

//         .di-card {
//           display: flex; gap: 12px; background: white; border-radius: 14px;
//           padding: 12px; border: 1px solid rgba(61,74,34,.07);
//         }
//         .di-img {
//           width: 68px; height: 68px; border-radius: 10px;
//           object-fit: cover; flex-shrink: 0; background: var(--beige-dk);
//         }
//         .di-body { flex: 1; min-width: 0; }
//         .di-name {
//           font-size: 13px; font-weight: 500; color: var(--olive-900);
//           margin-bottom: 3px; line-height: 1.3;
//           white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
//         }
//         .di-color {
//           display: flex; align-items: center; gap: 5px;
//           font-size: 11px; color: var(--mist); margin-bottom: 8px;
//         }
//         .di-color-dot {
//           width: 10px; height: 10px; border-radius: 50%;
//           border: 1.5px solid rgba(0,0,0,.12); flex-shrink: 0;
//         }
//         .di-price-row { display: flex; align-items: center; gap: 6px; }
//         .di-price { font-size: 14px; font-weight: 600; color: var(--olive-900); }
//         .di-original { font-size: 11px; color: var(--mist); text-decoration: line-through; }
//         .di-actions {
//           display: flex; flex-direction: column;
//           align-items: flex-end; justify-content: space-between;
//         }
//         .di-remove {
//           background: none; border: none; cursor: pointer;
//           color: var(--mist); font-size: 18px; line-height: 1; padding: 2px;
//           transition: color .2s;
//         }
//         .di-remove:hover { color: var(--red); }
//         .di-qty {
//           display: flex; align-items: center;
//           border: 1.5px solid var(--beige-dkr); border-radius: 50px; overflow: hidden;
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

//         /* Empty state */
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
//         .drawer-empty-text { font-size: 14px; color: var(--mist); letter-spacing: .06em; }
//         .drawer-empty-link {
//           font-size: 11px; letter-spacing: .2em; text-transform: uppercase;
//           color: var(--olive-600); text-decoration: none; font-weight: 500;
//           border-bottom: 1px solid rgba(61,74,34,.2); padding-bottom: 2px;
//           transition: color .2s;
//         }
//         .drawer-empty-link:hover { color: var(--olive-500); }

//         /* Footer */
//         .drawer-foot {
//           padding: 16px 20px 22px;
//           border-top: 1px solid rgba(61,74,34,.1);
//           background: white; flex-shrink: 0;
//         }
//         .drawer-subtotal-row {
//           display: flex; justify-content: space-between;
//           font-size: 14px; color: var(--mist); margin-bottom: 14px;
//         }
//         .drawer-subtotal-row strong { font-weight: 600; color: var(--ink); }
//         .drawer-cta { display: flex; flex-direction: column; gap: 8px; }
//         .drawer-btn-cart {
//           display: flex; align-items: center; justify-content: center; gap: 8px;
//           padding: 14px; background: var(--olive-900); color: var(--beige);
//           border: none; border-radius: 50px;
//           font-family: 'Jost', sans-serif; font-size: 11px; font-weight: 600;
//           letter-spacing: .22em; text-transform: uppercase;
//           text-decoration: none; cursor: pointer; transition: background .22s; width: 100%;
//         }
//         .drawer-btn-cart:hover { background: var(--olive-600); }
//         .drawer-btn-shop {
//           display: flex; align-items: center; justify-content: center;
//           padding: 13px; background: transparent; color: var(--olive-600);
//           border: 1.5px solid var(--beige-dkr); border-radius: 50px;
//           font-family: 'Jost', sans-serif; font-size: 11px; font-weight: 500;
//           letter-spacing: .18em; text-transform: uppercase;
//           text-decoration: none; cursor: pointer; transition: all .2s;
//         }
//         .drawer-btn-shop:hover { border-color: var(--olive-400); background: var(--olive-50); }

//         /* ── Mobile & Tablet Adjustments ── */
//         @media (max-width: 480px) {
//           .drawer-panel { width: 100vw; }
//           .drawer-head  { padding: 16px 16px 12px; }
//           .dp-section   { padding: 14px 16px 20px; }
//           .drawer-items { padding: 12px 16px; }
//           .drawer-foot  { padding: 14px 16px 20px; }
          
//           .dp-progress-container { height: 32px; }
//           .dp-word { font-size: 12.5px; }
//           .dp-step-emoji { font-size: 13px; }
//           .dp-step-title { font-size: 9px; }
//           .dp-step-amount { font-size: 8.5px; }
//         }
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

//           {/* ── Dynamic Progress Section ── */}
//           {items.length > 0 && (
//             <div className="dp-section">
//               <MiniConfetti trigger={confettiTrigger} />

//               {/* Nudge Headline */}
//               {allUnlocked ? (
//                 <div className="dp-nudge-done">
//                   You&apos;ve unlocked all rewards — you truly sparkle! ✦
//                 </div>
//               ) : (
//                 <div className="dp-nudge">
//                   Add <strong>₹{remaining}</strong> more to unlock{' '}
//                   <strong>{nextMilestone?.nudge}</strong>
//                 </div>
//               )}

//               {/* Progress Bar Container */}
//               <div className="dp-progress-container">
//                 {MILESTONES.map((m, idx) => {
//                   // Step logic calculations
//                   const prevThreshold = idx === 0 ? 0 : MILESTONES[idx - 1].threshold;
//                   const stepAmount    = m.threshold - prevThreshold; // Rs 200, then Rs 100, then Rs 200
//                   const filled        = Math.max(0, Math.min(subtotal - prevThreshold, stepAmount));
//                   const fillPct       = (filled / stepAmount) * 100;
//                   const isCompleted   = subtotal >= m.threshold;

//                   return (
//                     <div className="dp-segment" key={m.threshold}>
//                       {/* Only fill based on the current step's allocated product limits */}
//                       <div className="dp-fill" style={{ width: `${fillPct}%` }} />
                      
//                       {/* Word Unhide logic (unhides completely when the step fully completes) */}
//                       <div className={`dp-word ${isCompleted ? 'visible' : ''}`}>
//                         {m.word}
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>

//               {/* Step Labels Below the Bar */}
//               <div className="dp-step-labels">
//                 {MILESTONES.map((m, idx) => {
//                   const prevThreshold = idx === 0 ? 0 : MILESTONES[idx - 1].threshold;
//                   const stepAmount    = m.threshold - prevThreshold;
//                   const isCompleted   = subtotal >= m.threshold;

//                   return (
//                     <div className={`dp-step-cell ${isCompleted ? 'completed' : ''}`} key={m.threshold}>
//                       <span className="dp-step-emoji">{m.emoji}</span>
//                       <span className="dp-step-title">{m.label}</span>
//                       <span className="dp-step-amount">
//                         {isCompleted ? '✓ Unlocked' : idx === 0 ? `₹${stepAmount}` : `+₹${stepAmount}`}
//                       </span>
//                     </div>
//                   );
//                 })}
//               </div>

//             </div>
//           )}

//           {/* Items Drawer */}
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
//                 <div className="di-card" key={item.cartItemId ?? `${item.id}-${item.colorHex}`} style={item.selectedCharms?.length ? { flexDirection: 'column', gap: 8 } : undefined}>
//                   <div style={{ display: 'flex', gap: 12 }}>
//                     {/* eslint-disable-next-line @next/next/no-img-element */}
//                     <img className="di-img" src={item.image} alt={item.name} />
//                     <div className="di-body">
//                       <div className="di-name">{item.name}</div>
//                       {!item.selectedCharms?.length && (
//                         <div className="di-color">
//                           <span className="di-color-dot" style={{ background: item.colorHex }} />
//                           {item.color}
//                         </div>
//                       )}
//                       <div className="di-price-row">
//                         <span className="di-price">₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
//                         {item.originalPrice && (
//                           <span className="di-original">₹{(item.originalPrice * item.qty).toLocaleString('en-IN')}</span>
//                         )}
//                       </div>
//                     </div>
//                     <div className="di-actions">
//                       <button
//                         className="di-remove"
//                         onClick={() => removeItem(item.id, item.colorHex)}
//                         aria-label={`Remove ${item.name}`}
//                       >×</button>
//                       {!item.selectedCharms?.length && (
//                         <div className="di-qty">
//                           <button className="di-qty-btn" onClick={() => updateQty(item.id, item.colorHex, item.qty - 1)}>−</button>
//                           <span className="di-qty-val">{item.qty}</span>
//                           <button className="di-qty-btn" onClick={() => updateQty(item.id, item.colorHex, item.qty + 1)}>+</button>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                   {item.selectedCharms && item.selectedCharms.length > 0 && (
//                     <div style={{ background: 'var(--beige)', borderRadius: 8, padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 4 }}>
//                       <div style={{ fontSize: 8, letterSpacing: '.25em', textTransform: 'uppercase' as const, color: 'var(--mist)', fontWeight: 600, marginBottom: 2 }}>
//                         {item.selectedCharms.length} Pieces
//                       </div>
//                       {item.selectedCharms.map((charm: { id?: string; _id?: string; name?: string; price?: number; emoji?: string }, idx: number) => (
//                         <div key={charm.id || charm._id || idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11 }}>
//                           <span style={{ color: 'var(--olive-900)', display: 'flex', alignItems: 'center', gap: 5 }}>
//                             <span style={{ fontSize: 12 }}>{charm.emoji || '◈'}</span>
//                             {charm.name || 'Charm'}
//                           </span>
//                           <span style={{ fontWeight: 600, color: 'var(--olive-600)', fontSize: 10 }}>₹{(charm.price || 0).toLocaleString('en-IN')}</span>
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               ))}
//             </div>
//           )}

//           {/* Footer CTA */}
//           {items.length > 0 && (
//             <div className="drawer-foot">
//               <div className="drawer-subtotal-row">
//                 <span>Subtotal ({itemCount} item{itemCount !== 1 ? 's' : ''})</span>
//                 <strong>₹{subtotal.toLocaleString('en-IN')}</strong>
//               </div>
//               <div className="drawer-cta">
//                 <Link href="/cart" className="drawer-btn-cart" onClick={closeDrawer}>
//                   View Cart &amp; Checkout
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

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/cartContext';
import CartGoalMeter from '@/components/ui/ProgressBar';

// ─── Main CartDrawer ──────────────────────────────────────────────────────────
export default function CartDrawer() {
  const { state, closeDrawer, removeItem, updateQty, itemCount, subtotal } = useCart();
  const { isDrawerOpen, items } = state;
  const overlayRef = useRef<HTMLDivElement>(null);

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

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=Jost:wght@300;400;500;600&display=swap');

        :root {
          --beige:     #f5f0e8;
          --beige-dk:  #ede5d5;
          --beige-dkr: #d9cdb8;
          --olive-900: #1a1f0d;
          --olive-700: #283010;
          --olive-600: #3d4a22;
          --olive-500: #5a6b2e;
          --olive-400: #7a8e3c;
          --olive-50:  #f2f4e8;
          --gold:      #c9a84c;
          --gold-lt:   #eedfa0;
          --ink:       #1e2310;
          --mist:      rgba(30,35,16,.45);
          --mist-lt:   rgba(30,35,16,.35);
          --red:       #c0392b;
          --green:     #2e7d32;
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
          padding: 18px 20px 14px;
          border-bottom: 1px solid rgba(61,74,34,.1); flex-shrink: 0;
        }
        .drawer-head-left { display: flex; align-items: baseline; gap: 10px; }
        .drawer-head-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 24px; font-weight: 600; letter-spacing: .02em; color: var(--olive-900);
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

        /* ── Progress wrapper ── */
        .dp-section {
          padding: 16px 20px 20px;
          border-bottom: 1px solid rgba(61,74,34,.08);
          flex-shrink: 0;
          background: white;
        }

        /* ══════════════════
            ITEMS & FOOTER
        ══════════════════ */
        .drawer-items {
          flex: 1; overflow-y: auto; padding: 14px 20px;
          display: flex; flex-direction: column; gap: 12px;
          scrollbar-width: thin; scrollbar-color: var(--beige-dkr) transparent;
        }
        .drawer-items::-webkit-scrollbar { width: 4px; }
        .drawer-items::-webkit-scrollbar-thumb { background: var(--beige-dkr); border-radius: 2px; }

        .di-card {
          display: flex; gap: 12px; background: white; border-radius: 14px;
          padding: 12px; border: 1px solid rgba(61,74,34,.07);
        }
        .di-img {
          width: 68px; height: 68px; border-radius: 10px;
          object-fit: cover; flex-shrink: 0; background: var(--beige-dk);
        }
        .di-body { flex: 1; min-width: 0; }
        .di-name {
          font-size: 13px; font-weight: 500; color: var(--olive-900);
          margin-bottom: 3px; line-height: 1.3;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .di-color {
          display: flex; align-items: center; gap: 5px;
          font-size: 11px; color: var(--mist); margin-bottom: 8px;
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
          color: var(--mist); font-size: 18px; line-height: 1; padding: 2px;
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

        /* Empty state */
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
        .drawer-empty-text { font-size: 14px; color: var(--mist); letter-spacing: .06em; }
        .drawer-empty-link {
          font-size: 11px; letter-spacing: .2em; text-transform: uppercase;
          color: var(--olive-600); text-decoration: none; font-weight: 500;
          border-bottom: 1px solid rgba(61,74,34,.2); padding-bottom: 2px;
          transition: color .2s;
        }
        .drawer-empty-link:hover { color: var(--olive-500); }

        /* Footer */
        .drawer-foot {
          padding: 16px 20px 22px;
          border-top: 1px solid rgba(61,74,34,.1);
          background: white; flex-shrink: 0;
        }
        .drawer-subtotal-row {
          display: flex; justify-content: space-between;
          font-size: 14px; color: var(--mist); margin-bottom: 14px;
        }
        .drawer-subtotal-row strong { font-weight: 600; color: var(--ink); }
        .drawer-cta { display: flex; flex-direction: column; gap: 8px; }
        .drawer-btn-cart {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          padding: 14px; background: var(--olive-900); color: var(--beige);
          border: none; border-radius: 50px;
          font-family: 'Jost', sans-serif; font-size: 11px; font-weight: 600;
          letter-spacing: .22em; text-transform: uppercase;
          text-decoration: none; cursor: pointer; transition: background .22s; width: 100%;
        }
        .drawer-btn-cart:hover { background: var(--olive-600); }
        .drawer-btn-shop {
          display: flex; align-items: center; justify-content: center;
          padding: 13px; background: transparent; color: var(--olive-600);
          border: 1.5px solid var(--beige-dkr); border-radius: 50px;
          font-family: 'Jost', sans-serif; font-size: 11px; font-weight: 500;
          letter-spacing: .18em; text-transform: uppercase;
          text-decoration: none; cursor: pointer; transition: all .2s;
        }
        .drawer-btn-shop:hover { border-color: var(--olive-400); background: var(--olive-50); }

        /* ── Mobile ── */
        @media (max-width: 480px) {
          .drawer-panel { width: 100vw; }
          .drawer-head  { padding: 16px 16px 12px; }
          .dp-section   { padding: 14px 16px 18px; }
          .drawer-items { padding: 12px 16px; }
          .drawer-foot  { padding: 14px 16px 20px; }
        }
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

          {/* ── Progress Bar (CartGoalMeter) ── */}
          {items.length > 0 && (
            <div className="dp-section">
              <CartGoalMeter cartValue={subtotal} />
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
                <div
                  className="di-card"
                  key={item.cartItemId ?? `${item.id}-${item.colorHex}`}
                  style={item.selectedCharms?.length ? { flexDirection: 'column', gap: 8 } : undefined}
                >
                  <div style={{ display: 'flex', gap: 12 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className="di-img" src={item.image} alt={item.name} />
                    <div className="di-body">
                      <div className="di-name">{item.name}</div>
                      {!item.selectedCharms?.length && (
                        <div className="di-color">
                          <span className="di-color-dot" style={{ background: item.colorHex }} />
                          {item.color}
                        </div>
                      )}
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
                      {!item.selectedCharms?.length && (
                        <div className="di-qty">
                          <button className="di-qty-btn" onClick={() => updateQty(item.id, item.colorHex, item.qty - 1)}>−</button>
                          <span className="di-qty-val">{item.qty}</span>
                          <button className="di-qty-btn" onClick={() => updateQty(item.id, item.colorHex, item.qty + 1)}>+</button>
                        </div>
                      )}
                    </div>
                  </div>

                  {item.selectedCharms && item.selectedCharms.length > 0 && (
                    <div style={{ background: 'var(--beige)', borderRadius: 8, padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div style={{ fontSize: 8, letterSpacing: '.25em', textTransform: 'uppercase', color: 'var(--mist)', fontWeight: 600, marginBottom: 2 }}>
                        {item.selectedCharms.length} Pieces
                      </div>
                      {item.selectedCharms.map((charm: { id?: string; _id?: string; name?: string; price?: number; emoji?: string }, idx: number) => (
                        <div key={charm.id || charm._id || idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11 }}>
                          <span style={{ color: 'var(--olive-900)', display: 'flex', alignItems: 'center', gap: 5 }}>
                            <span style={{ fontSize: 12 }}>{charm.emoji || '◈'}</span>
                            {charm.name || 'Charm'}
                          </span>
                          <span style={{ fontWeight: 600, color: 'var(--olive-600)', fontSize: 10 }}>₹{(charm.price || 0).toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>
                  )}
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