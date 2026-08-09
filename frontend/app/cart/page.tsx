// 'use client';

// import { useState, useCallback } from 'react';
// import Link from 'next/link';
// import { useCart } from '@/lib/cartContext';
// import ExitIntent from '@/components/cart/ExitIntent';
// import UpperNav from '@/components/ui/UpperNav';


// // ─── Offer milestones ─────────────────────────────────────────────────────────
// const OFFERS = [
//   { label: 'Free Shipping',  threshold: 598,  emoji: '🚚', short: 'Shipping' },
//   { label: 'Free Gift',      threshold: 999,  emoji: '🎁', short: 'Free Gift' },
//   { label: 'Free Organiser', threshold: 1199, emoji: '🛍️', short: 'Organiser' },
// ];

// // ─── Gift Box Options ─────────────────────────────────────────────────────────
// // Replace `image` URLs with your own asset paths or CDN links
// export const GIFT_OPTIONS = [
//   {
//     id: 'classic',
//     title: 'Classic Gift Wrap',
//     sub: 'Kraft paper & satin ribbon',
//     price: 25,
//     image: '/smallerBox.png',
//   },
//   {
//     id: 'luxury',
//     title: 'Luxury Gift Hamper',
//     sub: 'Ideal for 4+ products',
//     price: 250,
//     image: '/Biggerbox.jpg',
//   },
// ];

// export default function CartPage() {
//   const {
//     state, subtotal, savings, shipping, total,
//     itemCount, removeItem, updateQty,
//     toggleGift, setGiftMessage,
//     removeDiscount, applyCouponCode,
//   } = useCart();
//   const { items, isGift, giftMessage, discountCode, discountAmount } = state;

//   // ── Gift box local state ──
//   // selectedGiftId drives both "is gift selected" and "which option"
//   const [selectedGiftId, setSelectedGiftId] = useState<string | null>(null);

//   const handleSelectGift = (id: string) => {
//     if (selectedGiftId === id) {
//       // deselect → remove gift
//       setSelectedGiftId(null);
//       if (isGift) toggleGift();
//     } else {
//       setSelectedGiftId(id);
//       if (!isGift) toggleGift();
//     }
//   };

//   const activeGift = GIFT_OPTIONS.find(g => g.id === selectedGiftId) ?? null;
//   const giftCharge = activeGift?.price ?? 0;

//   const [couponInput, setCouponInput] = useState('');
//   const [couponError, setCouponError] = useState('');
//   const [couponSuccess, setCouponSuccess] = useState('');

//   // Which offer dots are unlocked
//   const nextOffer      = OFFERS.find(o => subtotal < o.threshold);
//   const remaining      = nextOffer ? nextOffer.threshold - subtotal : 0;
//   const progressBase   = nextOffer
//     ? OFFERS[OFFERS.indexOf(nextOffer) - 1]?.threshold ?? 0
//     : OFFERS[OFFERS.length - 1].threshold;
//   const progressRange  = nextOffer ? nextOffer.threshold - progressBase : 1;
//   const progressFill   = nextOffer
//     ? Math.min(100, ((subtotal - progressBase) / progressRange) * 100)
//     : 100;

//   const handleApplyCoupon = useCallback(async () => {
//     const code = couponInput.trim().toUpperCase();
//     if (!code) { setCouponError('Enter a code first.'); return; }
//     if (discountCode === code) { setCouponError('Already applied.'); return; }
//     setCouponError('');
//     setCouponSuccess('');
//     try {
//       const res = await applyCouponCode(code);
//       if (res?.success) {
//         setCouponSuccess('Coupon applied!');
//         setCouponInput('');
//       } else {
//         setCouponError(res?.message || 'Invalid code.');
//       }
//     } catch (err: any) {
//       setCouponError(err?.message || 'Failed to validate coupon');
//     }
//   }, [couponInput, discountCode, applyCouponCode]);

//   // Compute the displayed total factoring in the gift charge
//   const displayTotal = total + giftCharge;

//   return (
//     <>
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@300;400;500;600&display=swap');

//         :root {
//           --beige: #f5f0e8; --beige-dk: #ede5d5; --beige-dkr: #d9cdb8;
//           --olive-900: #1a1f0d; --olive-600: #3d4a22; --olive-500: #5a6b2e;
//           --olive-400: #7a8e3c; --olive-200: #c4cc9a; --olive-50: #f2f4e8;
//           --gold: #c9a84c; --ink: #1e2310; --mist: rgba(30,35,16,.45);
//           --red: #c0392b; --green: #2e7d32;
//         }
//         *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

//         .cp-root {
//           min-height: 100vh; background: var(--beige);
//           font-family: 'Jost', sans-serif; color: var(--ink);
//         }

//         /* ── Layout ── */
//         .cp-layout {
//           display: grid;
//           grid-template-columns: 1fr 380px;
//           gap: 24px;
//           max-width: 1200px;
//           margin: 0 auto;
//           padding: 32px 52px 72px;
//           align-items: start;
//         }
//         .cp-left { display: flex; flex-direction: column; gap: 18px; }
//         .cp-right { position: sticky; top: 90px; display: flex; flex-direction: column; gap: 14px; }

//         /* ── White panel ── */
//         .cp-panel {
//           background: white;
//           border-radius: 18px;
//           border: 1px solid rgba(61,74,34,.07);
//           overflow: hidden;
//         }
//         .cp-panel-head {
//           padding: 16px 22px;
//           border-bottom: 1px solid rgba(61,74,34,.07);
//           font-size: 10px; letter-spacing: .38em; text-transform: uppercase;
//           color: var(--mist); font-weight: 500;
//         }

//         /* ── Offer progress ── */
//         .cp-progress { padding: 18px 22px; }
//         .cp-progress-text {
//           font-size: 13px; color: var(--ink); margin-bottom: 10px; line-height: 1.5;
//         }
//         .cp-progress-text strong { color: var(--olive-600); }
//         .cp-track { height: 5px; background: var(--beige-dkr); border-radius: 3px; overflow: hidden; margin-bottom: 18px; }
//         .cp-track-fill {
//           height: 100%;
//           background: linear-gradient(90deg, var(--olive-400), var(--gold));
//           border-radius: 3px;
//           transition: width .6s cubic-bezier(.22,.68,0,1.2);
//         }

//         /* ── Offer dots strip ── */
//         .cp-dots {
//           display: flex; align-items: flex-start;
//           gap: 0; padding: 0 22px 18px;
//         }
//         .cp-dot-item {
//           display: flex; flex-direction: column; align-items: center;
//           flex: 1; text-align: center; position: relative;
//         }
//         .cp-dot-item:not(:last-child)::after {
//           content: '';
//           position: absolute;
//           top: 16px;
//           left: calc(50% + 14px);
//           right: calc(-50% + 14px);
//           height: 2px;
//           background: repeating-linear-gradient(
//             90deg,
//             var(--beige-dkr) 0,
//             var(--beige-dkr) 5px,
//             transparent 5px,
//             transparent 10px
//           );
//         }
//         .cp-dot-item--unlocked::after { background: repeating-linear-gradient(90deg, var(--olive-400) 0, var(--olive-400) 5px, transparent 5px, transparent 10px) !important; }
//         .cp-dot-circle {
//           width: 32px; height: 32px; border-radius: 50%;
//           display: flex; align-items: center; justify-content: center;
//           font-size: 15px; border: 2px solid var(--beige-dkr);
//           background: white; margin-bottom: 6px;
//           transition: all .3s cubic-bezier(.34,1.56,.64,1);
//           flex-shrink: 0;
//         }
//         .cp-dot-circle--active {
//           background: var(--olive-500); border-color: var(--olive-500);
//           box-shadow: 0 4px 16px rgba(90,107,46,.3);
//           transform: scale(1.12);
//         }
//         .cp-dot-label {
//           font-size: 9.5px; color: var(--mist); line-height: 1.3; font-weight: 500;
//           letter-spacing: .04em;
//         }
//         .cp-dot-label--active { color: var(--olive-600); font-weight: 600; }

//         /* ── Cart item ── */
//         .cp-item {
//           display: flex; gap: 14px;
//           padding: 18px 22px;
//           border-bottom: 1px solid rgba(61,74,34,.06);
//           animation: cpItemIn .3s ease both;
//         }
//         @keyframes cpItemIn {
//           from { opacity: 0; transform: translateY(10px); }
//           to   { opacity: 1; transform: translateY(0); }
//         }
//         .cp-item:last-child { border-bottom: none; }
//         .cp-item-img {
//           width: 90px; height: 90px; border-radius: 12px;
//           object-fit: cover; flex-shrink: 0;
//           background: var(--beige-dk);
//         }
//         .cp-item-body { flex: 1; min-width: 0; }
//         .cp-item-name {
//           font-size: 14px; font-weight: 500; color: var(--olive-900);
//           margin-bottom: 4px; line-height: 1.3;
//         }
//         .cp-item-color {
//           display: flex; align-items: center; gap: 6px;
//           font-size: 11px; color: var(--mist); margin-bottom: 10px;
//         }
//         .cp-item-color-dot {
//           width: 12px; height: 12px; border-radius: 50%;
//           border: 1.5px solid rgba(0,0,0,.1); flex-shrink: 0;
//         }
//         .cp-item-price-row { display: flex; align-items: baseline; gap: 8px; }
//         .cp-item-price { font-size: 16px; font-weight: 600; color: var(--olive-900); }
//         .cp-item-original { font-size: 12px; color: var(--mist); text-decoration: line-through; }
//         .cp-item-per { font-size: 10px; color: var(--mist); margin-top: 2px; }
//         .cp-item-actions {
//           display: flex; flex-direction: column;
//           align-items: flex-end; justify-content: space-between;
//           flex-shrink: 0;
//         }
//         .cp-item-remove {
//           background: none; border: none; cursor: pointer;
//           font-size: 18px; color: var(--mist); padding: 2px;
//           transition: color .2s; line-height: 1;
//         }
//         .cp-item-remove:hover { color: var(--red); }
//         .cp-qty {
//           display: flex; align-items: center;
//           border: 1.5px solid var(--beige-dkr); border-radius: 50px;
//           overflow: hidden; background: var(--beige);
//         }
//         .cp-qty-btn {
//           width: 34px; height: 34px; background: none; border: none;
//           font-size: 18px; cursor: pointer; color: var(--olive-600);
//           display: flex; align-items: center; justify-content: center;
//           transition: background .15s;
//         }
//         .cp-qty-btn:hover { background: var(--olive-50); }
//         .cp-qty-val {
//           min-width: 34px; text-align: center;
//           font-size: 13px; font-weight: 600; color: var(--ink);
//         }

//         /* ── Savings strip ── */
//         .cp-savings-strip {
//           margin: 10px 22px 16px;
//           background: linear-gradient(135deg, #e8f5e9, #f1f8e9);
//           border: 1px solid #c8e6c9; border-radius: 10px;
//           padding: 11px 16px;
//           font-size: 12.5px; color: var(--green); font-weight: 600;
//           display: flex; align-items: center; gap: 8px;
//         }

//         /* ─────────────────────────────────────────────────────────────────────
//            GIFT BOX SELECTOR — side-by-side cards
//         ───────────────────────────────────────────────────────────────────── */
//         .cp-gift-header {
//           display: flex; align-items: center; justify-content: space-between;
//           margin-bottom: 10px;
//         }
//         .cp-gift-heading {
//           font-size: 10px; letter-spacing: .38em; text-transform: uppercase;
//           color: var(--mist); font-weight: 500;
//         }
//         .cp-gift-optional {
//           font-size: 10px; color: var(--mist); font-style: italic;
//         }

//         .cp-gift-cards {
//           display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
//           margin-bottom: 0;
//         }

//         /* Individual gift card */
//         .cp-gift-card {
//           position: relative;
//           border: 2px solid var(--beige-dkr);
//           border-radius: 16px;
//           overflow: hidden;
//           cursor: pointer;
//           background: white;
//           transition: border-color .22s, box-shadow .22s, transform .15s;
//           outline: none;
//         }
//         .cp-gift-card:hover {
//           border-color: var(--olive-400);
//           box-shadow: 0 4px 18px rgba(90,107,46,.12);
//           transform: translateY(-2px);
//         }
//         .cp-gift-card--selected {
//           border-color: var(--olive-500);
//           box-shadow: 0 6px 24px rgba(90,107,46,.22);
//         }

//         /* Box image */
//         .cp-gift-card-img {
//           width: 100%;
//           aspect-ratio: 1 / 1;
//           object-fit: cover;
//           display: block;
//           background: var(--beige-dk);
//           /* Transition for image swap */
//           transition: opacity .3s ease;
//         }

//         /* Image upload overlay — appears on hover of selected card */
//         .cp-gift-card-img-wrap {
//           position: relative;
//           overflow: hidden;
//         }
//         .cp-gift-card-img-overlay {
//           position: absolute; inset: 0;
//           background: rgba(26,31,13,.45);
//           display: flex; flex-direction: column; align-items: center; justify-content: center;
//           gap: 4px;
//           opacity: 0;
//           transition: opacity .22s;
//           cursor: pointer;
//         }
//         .cp-gift-card-img-wrap:hover .cp-gift-card-img-overlay { opacity: 1; }
//         .cp-gift-card-img-overlay span {
//           font-size: 10px; color: white; letter-spacing: .1em; text-transform: uppercase; font-weight: 600;
//         }
//         .cp-gift-card-img-overlay svg { color: white; }

//         .cp-gift-card-body {
//           padding: 10px 12px 12px;
//         }
//         .cp-gift-card-title {
//           font-size: 12.5px; font-weight: 600; color: var(--olive-900);
//           margin-bottom: 2px; line-height: 1.3;
//         }
//         .cp-gift-card-sub {
//           font-size: 11px; color: #101010; line-height: 1.4; margin-bottom: 8px;
//         }
//         .cp-gift-card-price {
//           font-size: 14px; font-weight: 700; color: var(--olive-600);
//         }

//         /* Selected checkmark badge */
//         .cp-gift-card-check {
//           position: absolute; top: 8px; right: 8px;
//           width: 22px; height: 22px; border-radius: 50%;
//           background: var(--olive-500); border: 2px solid white;
//           display: flex; align-items: center; justify-content: center;
//           font-size: 11px; color: white;
//           opacity: 0;
//           transform: scale(.6);
//           transition: opacity .2s, transform .25s cubic-bezier(.34,1.56,.64,1);
//           box-shadow: 0 2px 8px rgba(90,107,46,.35);
//           pointer-events: none;
//         }
//         .cp-gift-card--selected .cp-gift-card-check {
//           opacity: 1; transform: scale(1);
//         }

//         /* Hidden file input */
//         .cp-gift-img-upload { display: none; }

//         /* Gift message */
//         .cp-gift-msg-wrap {
//           padding: 12px 0 0;
//           animation: cpFadeDown .3s ease;
//         }
//         @keyframes cpFadeDown {
//           from { opacity: 0; transform: translateY(-6px); }
//           to   { opacity: 1; transform: translateY(0); }
//         }
//         .cp-gift-msg {
//           width: 100%;
//           padding: 11px 14px;
//           border: 1.5px solid var(--beige-dkr); border-radius: 12px;
//           font-family: 'Jost', sans-serif; font-size: 12px; color: var(--ink);
//           background: white; outline: none; resize: none; height: 68px;
//           transition: border-color .2s;
//         }
//         .cp-gift-msg:focus { border-color: var(--olive-400); }
//         .cp-gift-msg::placeholder { color: rgba(30,35,16,.3); }

//         /* Outer gift panel wrapper */
//         .cp-gift-panel {
//           background: white;
//           border-radius: 18px;
//           border: 1px solid rgba(61,74,34,.07);
//           padding: 16px 18px 18px;
//         }

//         /* ── Coupon ── */
//         .cp-coupon-row { display: flex; gap: 8px; }
//         .cp-coupon-input {
//           flex: 1; padding: 11px 14px;
//           border: 1.5px solid var(--beige-dkr); border-radius: 50px;
//           font-family: 'Jost', sans-serif; font-size: 12px; color: var(--ink);
//           background: white; outline: none; text-transform: uppercase;
//           transition: border-color .2s;
//         }
//         .cp-coupon-input:focus { border-color: var(--olive-400); }
//         .cp-coupon-input::placeholder { text-transform: none; color: rgba(30,35,16,.3); }
//         .cp-coupon-btn {
//           padding: 11px 18px;
//           background: var(--olive-600); color: var(--beige);
//           border: none; border-radius: 50px;
//           font-family: 'Jost', sans-serif;
//           font-size: 10.5px; font-weight: 600; letter-spacing: .14em; text-transform: uppercase;
//           cursor: pointer; transition: background .2s; white-space: nowrap;
//         }
//         .cp-coupon-btn:hover { background: var(--olive-500); }
//         .cp-coupon-msg { font-size: 11px; margin-top: 6px; }
//         .cp-coupon-msg--error { color: var(--red); }
//         .cp-coupon-msg--success { color: var(--green); }
//         .cp-coupon-applied {
//           display: flex; align-items: center; justify-content: space-between;
//           background: #e8f5e9; border: 1px solid #c8e6c9; border-radius: 10px;
//           padding: 10px 14px; font-size: 12px; color: var(--green); font-weight: 600;
//           margin-bottom: 8px;
//         }
//         .cp-coupon-remove {
//           background: none; border: none; cursor: pointer;
//           font-size: 14px; color: var(--mist); transition: color .2s;
//         }
//         .cp-coupon-remove:hover { color: var(--red); }

//         /* ── Price summary ── */
//         .cp-summary-row {
//           display: flex; justify-content: space-between;
//           font-size: 13px; color: var(--mist); margin-bottom: 10px;
//         }
//         .cp-summary-row--savings { color: var(--green); font-weight: 600; }
//         .cp-summary-row--total {
//           font-size: 17px; font-weight: 700; color: var(--ink);
//           border-top: 1px solid rgba(61,74,34,.1);
//           padding-top: 12px; margin-top: 4px; margin-bottom: 0;
//         }
//         .cp-summary-row span:last-child { font-weight: 500; color: var(--ink); }
//         .cp-summary-row--total span:last-child { font-weight: 800; font-size: 20px; }
//         .cp-free-tag {
//           background: #bdd4bf; color: white;
//           font-size: 9px; font-weight: 700; letter-spacing: .12em;
//           padding: 2px 8px; border-radius: 3px; text-transform: uppercase;
//         }

//         /* ── CTA ── */
//         .cp-checkout-btn {
//           display: flex; align-items: center; justify-content: center; gap: 10px;
//           width: 100%; padding: 17px;
//           background: var(--olive-900); color: var(--beige);
//           border: none; border-radius: 50px;
//           font-family: 'Jost', sans-serif;
//           font-size: 11.5px; font-weight: 700; letter-spacing: .22em; text-transform: uppercase;
//           cursor: pointer; text-decoration: none;
//           box-shadow: 0 6px 28px rgba(26,31,13,.22);
//           transition: background .22s, transform .15s, box-shadow .22s;
//         }
//         .cp-checkout-btn:hover {
//           background: var(--olive-600);
//           transform: translateY(-2px);
//           box-shadow: 0 10px 36px rgba(26,31,13,.28);
//         }

//         /* ── Empty ── */
//         .cp-empty {
//           text-align: center; padding: 80px 20px;
//           grid-column: 1 / -1;
//         }
//         .cp-empty-icon {
//           font-family: 'Cormorant Garamond', serif;
//           font-size: 56px; font-style: italic; font-weight: 300;
//           color: rgba(61,74,34,.12); margin-bottom: 14px;
//         }
//         .cp-empty-text { font-size: 13px; color: var(--mist); margin-bottom: 20px; letter-spacing: .06em; }
//         .cp-empty-link {
//           display: inline-flex; align-items: center; gap: 8px;
//           padding: 13px 28px; background: var(--olive-900); color: var(--beige);
//           border-radius: 50px; text-decoration: none;
//           font-size: 10.5px; font-weight: 600; letter-spacing: .2em; text-transform: uppercase;
//           transition: background .2s;
//         }
//         .cp-empty-link:hover { background: var(--olive-600); }

//         /* ── Responsive ── */
//         @media (max-width: 1024px) {
//           .cp-layout { padding: 32px 24px 72px; }
//         }
//         @media (max-width: 900px) {
//           .cp-layout { grid-template-columns: 1fr; padding: 24px; gap: 24px; }
//           .cp-right { position: static; }
//         }
//         @media (max-width: 540px) {
//           .cp-layout { padding: 16px; gap: 16px; margin-top: 45px; }
//           .cp-panel-head { padding: 14px 16px; }
//           .cp-progress { padding: 14px 16px; }
//           .cp-dots { padding: 0 16px 14px; }
//           .cp-dot-circle { width: 28px; height: 28px; font-size: 13px; }
//           .cp-item { padding: 14px 16px; gap: 10px; }
//           .cp-item-img { width: 72px; height: 72px; }
//           .cp-item-name { font-size: 13px; }
//           .cp-item-price { font-size: 15px; }
//           .cp-qty-btn { width: 28px; height: 28px; font-size: 16px; }
//           .cp-qty-val { min-width: 28px; font-size: 12px; }
//           .cp-gift-panel { padding: 14px 14px 16px; }
//           .cp-gift-card-title { font-size: 11.5px; }
//           .cp-gift-card-sub { font-size: 9px; }
//         }
//       `}</style>

//       <div className="cp-root">
//         <UpperNav />
//         <ExitIntent />

//         <div className="cp-layout">

//           {/* ── EMPTY STATE ── */}
//           {items.length === 0 && (
//             <div className="cp-empty">
//               <div className="cp-empty-icon">◇</div>
//               <p className="cp-empty-text">Your cart is empty — add something beautiful.</p>
//               <Link href="/" className="cp-empty-link">
//                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                   <path d="M5 12h14M12 5l7 7-7 7"/>
//                 </svg>
//                 Start Shopping
//               </Link>
//             </div>
//           )}

//           {items.length > 0 && (
//             <>
//               {/* ── LEFT ── */}
//               <div className="cp-left">

//                 {/* Offer progress + dots */}
//                 <div className="cp-panel">
//                   <div className="cp-progress">
//                     <p className="cp-progress-text">
//                       {nextOffer
//                         ? <>Add <strong>₹{remaining}</strong> more for <strong>{nextOffer.emoji} {nextOffer.label}!</strong></>
//                         : '🎉 You\'ve unlocked all rewards!'
//                       }
//                     </p>
//                     <div className="cp-track">
//                       <div className="cp-track-fill" style={{ width: `${progressFill}%` }} />
//                     </div>
//                     <div className="cp-dots">
//                       {OFFERS.map((o, i) => {
//                         const active = subtotal >= o.threshold;
//                         const prevUnlocked = i === 0 || subtotal >= OFFERS[i - 1].threshold;
//                         return (
//                           <div
//                             key={o.label}
//                             className={`cp-dot-item${prevUnlocked ? ' cp-dot-item--unlocked' : ''}`}
//                           >
//                             <div className={`cp-dot-circle${active ? ' cp-dot-circle--active' : ''}`}>
//                               {active ? '✓' : o.emoji}
//                             </div>
//                             <div className={`cp-dot-label${active ? ' cp-dot-label--active' : ''}`}>
//                               {o.short}
//                             </div>
//                           </div>
//                         );
//                       })}
//                     </div>
//                   </div>
//                 </div>

//                 {/* Cart items */}
//                 <div className="cp-panel">
//                   {savings > 0 && (
//                     <div className="cp-savings-strip">
//                       🎉 You&apos;re saving ₹{savings.toLocaleString('en-IN')} on this order!
//                     </div>
//                   )}
//                   {items.map(item => (
//                     <div className="cp-item" key={`${item.id}-${item.colorHex}`} style={item.selectedCharms?.length ? { flexDirection: 'column', gap: 10 } : undefined}>
//                       <div style={{ display: 'flex', gap: 14 }}>
//                         {/* eslint-disable-next-line @next/next/no-img-element */}
//                         <img className="cp-item-img" src={item.image} alt={item.name} />
//                         <div className="cp-item-body">
//                           <div className="cp-item-name">{item.name}</div>
//                           {!item.selectedCharms?.length && (
//                             <div className="cp-item-color">
//                               <span className="cp-item-color-dot" style={{ background: item.colorHex }} />
//                               {item.color}
//                             </div>
//                           )}
//                           <div className="cp-item-price-row">
//                             <span className="cp-item-price">₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
//                             {item.originalPrice && (
//                               <span className="cp-item-original">₹{(item.originalPrice * item.qty).toLocaleString('en-IN')}</span>
//                             )}
//                           </div>
//                           {!item.selectedCharms?.length && (
//                             <p className="cp-item-per">₹{item.price.toLocaleString('en-IN')} per item</p>
//                           )}
//                         </div>
//                         <div className="cp-item-actions">
//                           <button
//                             className="cp-item-remove"
//                             onClick={() => removeItem(item.id, item.colorHex)}
//                             aria-label={`Remove ${item.name}`}
//                           >×</button>
//                           {!item.selectedCharms?.length && (
//                             <div className="cp-qty">
//                               <button className="cp-qty-btn" onClick={() => updateQty(item.id, item.colorHex, item.qty - 1)}>−</button>
//                               <span className="cp-qty-val">{item.qty}</span>
//                               <button className="cp-qty-btn" onClick={() => updateQty(item.id, item.colorHex, item.qty + 1)}>+</button>
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                       {item.selectedCharms && item.selectedCharms.length > 0 && (
//                         <div style={{ background: 'var(--olive-50)', borderRadius: 10, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
//                           <div style={{ fontSize: 9, letterSpacing: '.3em', textTransform: 'uppercase' as const, color: 'var(--mist)', fontWeight: 600, marginBottom: 2 }}>
//                             Selected Pieces ({item.selectedCharms.length})
//                           </div>
//                           {item.selectedCharms.map((charm: { id?: string; _id?: string; name?: string; price?: number; emoji?: string }, idx: number) => (
//                             <div key={charm.id || charm._id || idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 0', borderBottom: idx < (item.selectedCharms?.length || 0) - 1 ? '1px solid rgba(61,74,34,.08)' : 'none' }}>
//                               <span style={{ fontSize: 12, color: 'var(--olive-900)', display: 'flex', alignItems: 'center', gap: 6 }}>
//                                 <span style={{ fontSize: 14 }}>{charm.emoji || '◈'}</span>
//                                 {charm.name || 'Charm'}
//                               </span>
//                               <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--olive-600)' }}>₹{(charm.price || 0).toLocaleString('en-IN')}</span>
//                             </div>
//                           ))}
//                         </div>
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               {/* ── RIGHT ── */}
//               <div className="cp-right">

//                 {/* ── GIFT BOX SELECTOR ── */}
//                 <GiftBoxSelector
//                   selectedGiftId={selectedGiftId}
//                   onSelect={handleSelectGift}
//                   giftMessage={giftMessage}
//                   onMessageChange={setGiftMessage}
//                   isGift={isGift}
//                 />

//                 {/* Coupon */}
//                 <div className="cp-panel" style={{ padding: '18px 20px' }}>
//                   <p className="cp-panel-head" style={{ padding: 0, border: 'none', marginBottom: 12 }}>Apply Coupon</p>
//                   {discountCode && (
//                     <div className="cp-coupon-applied">
//                       <span>&quot;{discountCode}&quot; — ₹{discountAmount} off</span>
//                       <button className="cp-coupon-remove" onClick={removeDiscount} aria-label="Remove coupon">×</button>
//                     </div>
//                   )}
//                   {!discountCode && (
//                     <>
//                       <div className="cp-coupon-row">
//                         <input
//                           className="cp-coupon-input"
//                           value={couponInput}
//                           onChange={e => { setCouponInput(e.target.value); setCouponError(''); setCouponSuccess(''); }}
//                           placeholder="Enter code"
//                           onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
//                         />
//                         <button className="cp-coupon-btn" onClick={handleApplyCoupon}>Apply</button>
//                       </div>
//                       {couponError   && <p className="cp-coupon-msg cp-coupon-msg--error">{couponError}</p>}
//                       {couponSuccess && <p className="cp-coupon-msg cp-coupon-msg--success">{couponSuccess}</p>}
//                     </>
//                   )}
//                 </div>

//                 {/* Price summary */}
//                 <div className="cp-panel" style={{ padding: '20px 22px' }}>
//                   <div className="cp-summary-row">
//                     <span>Subtotal ({itemCount} item{itemCount !== 1 ? 's' : ''})</span>
//                     <span>₹{subtotal.toLocaleString('en-IN')}</span>
//                   </div>
//                   {savings > 0 && (
//                     <div className="cp-summary-row cp-summary-row--savings">
//                       <span>You save</span>
//                       <span>−₹{savings.toLocaleString('en-IN')}</span>
//                     </div>
//                   )}
//                   {discountAmount > 0 && (
//                     <div className="cp-summary-row cp-summary-row--savings">
//                       <span>Coupon ({discountCode})</span>
//                       <span>−₹{discountAmount}</span>
//                     </div>
//                   )}
//                   <div className="cp-summary-row">
//                     <span>Shipping</span>
//                     <span>
//                       {shipping === 0
//                         ? <span className="cp-free-tag">FREE</span>
//                         : `₹${shipping}`
//                       }
//                     </span>
//                   </div>
//                   {activeGift && (
//                     <div className="cp-summary-row">
//                       <span>🎁 {activeGift.title}</span>
//                       <span>₹{activeGift.price}</span>
//                     </div>
//                   )}
//                   <div className="cp-summary-row cp-summary-row--total">
//                     <span>Total</span>
//                     <span>₹{displayTotal.toLocaleString('en-IN')}</span>
//                   </div>
//                 </div>

//                 {/* Checkout CTA */}
//                 <Link href="/checkout" className="cp-checkout-btn">
//                   Proceed to Checkout
//                   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                     <path d="M5 12h14M12 5l7 7-7 7"/>
//                   </svg>
//                 </Link>

//               </div>
//             </>
//           )}
//         </div>
//       </div>
//     </>
//   );
// }

// /* ─────────────────────────────────────────────────────────────────────────────
//    GiftBoxSelector — extracted sub-component
//    Renders two side-by-side gift box cards with image-swap support
// ───────────────────────────────────────────────────────────────────────────── */
// function GiftBoxSelector({
//   selectedGiftId,
//   onSelect,
//   giftMessage,
//   onMessageChange,
//   isGift,
// }: {
//   selectedGiftId: string | null;
//   onSelect: (id: string) => void;
//   giftMessage: string;
//   onMessageChange: (msg: string) => void;
//   isGift: boolean;
// }) {
//   // Allow per-card image override via local file upload



//   return (
//     <div className="cp-gift-panel">
//       <div className="cp-gift-header">
//         <span className="cp-gift-heading">Make it a Gift</span>
//         <span className="cp-gift-optional">optional</span>
//       </div>

//       <div className="cp-gift-cards">
//         {GIFT_OPTIONS.map(opt => {
//           const isSelected = selectedGiftId === opt.id;
//           const imgSrc = opt.image;

//           return (
//             <div
//               key={opt.id}
//               className={`cp-gift-card${isSelected ? ' cp-gift-card--selected' : ''}`}
//               onClick={() => onSelect(opt.id)}
//               role="button"
//               tabIndex={0}
//               onKeyDown={e => e.key === 'Enter' && onSelect(opt.id)}
//               aria-pressed={isSelected}
//             >
//               {/* Image with upload overlay */}
//               <div className="cp-gift-card-img-wrap">
//                 {/* eslint-disable-next-line @next/next/no-img-element */}
//                 <img
//                   className="cp-gift-card-img"
//                   src={imgSrc}
//                   alt={opt.title}
//                 />
//                 {/* Upload overlay — click triggers file input */}
//                 {/* <label */}
//                   {/* className="cp-gift-card-img-overlay"
//                   htmlFor={`gift-img-upload-${opt.id}`}
//                   onClick={e => e.stopPropagation()} // don't toggle selection
//                   title="Change image" */}
//                 {/* > */}
//                   {/* <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                     <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
//                     <polyline points="17 8 12 3 7 8"/>
//                     <line x1="12" y1="3" x2="12" y2="15"/>
//                   </svg>
//                   <span>Change</span> */}
//                 {/* </label> */}
//                 {/* <input
//                   id={`gift-img-upload-${opt.id}`}
//                   type="file"
//                   accept="image/*"
//                   className="cp-gift-img-upload"
//                   onChange={e => {
//                     const file = e.target.files?.[0];
//                     if (file) handleImgUpload(opt.id, file);
//                   }}
//                 /> */}
//               </div>

//               <div className="cp-gift-card-body">
//                 <div className="cp-gift-card-title">{opt.title}</div>
//                 <div className="cp-gift-card-sub">{opt.sub}</div>
//                 <div className="cp-gift-card-price">+₹{opt.price}</div>
//               </div>

//               {/* Selected badge */}
//               <div className="cp-gift-card-check" aria-hidden="true">✓</div>
//             </div>
//           );
//         })}
//       </div>

//       {/* Gift message — only shown when a box is selected */}
      
//         <div className="cp-gift-msg-wrap">
//           <textarea
//             className="cp-gift-msg"
//             placeholder="Write a Message for us (optional)…"
//             value={giftMessage}
//             onChange={e => onMessageChange(e.target.value)}
//             maxLength={160}
//           />
//         </div>
      
//     </div>
//   );
// }

'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/cartContext';
import { useAuth } from '@/lib/authContext';
import { apiRequest } from '@/lib/api';
import ExitIntent from '@/components/cart/ExitIntent';
import UpperNav from '@/components/ui/UpperNav';
import CartBanner from '@/components/cart/CartBanner';

// ─── Gift Box Options ─────────────────────────────────────────────────────────
export const GIFT_OPTIONS = [
  {
    id   : 'classic',
    title: 'Classic Gift Wrap',
    sub  : 'Kraft paper & satin ribbon',
    price: 25,
    image: '/smallerBox.png',
  },
  {
    id   : 'luxury',
    title: 'Luxury Gift Hamper',
    sub  : 'Ideal for 4+ products',
    price: 250,
    image: '/Biggerbox.jpg',
  },
];

export default function CartPage() {
  const {
    state, subtotal, savings, shipping, total,
    itemCount, removeItem, updateQty,
    toggleGift, setGiftId, setGiftMessage,
    removeDiscount, applyCouponCode, setRewardPointsRedeemed,
    autoDiscountAmount, appliedOffers, applicableOffers, toggleOfferOptOut
  } = useCart();
  const { items, isGift, giftMessage, discountCode, discountAmount, selectedGiftId, rewardPointsRedeemed } = state;
  const { user } = useAuth();
  
  const [userRewardPoints, setUserRewardPoints] = useState(0);
  const [pointsInput, setPointsInput] = useState('');

  useEffect(() => {
    if (user) {
      apiRequest<{ success: boolean; rewardPoints: number }>('/rewards/points')
        .then(data => setUserRewardPoints(data.rewardPoints || 0))
        .catch(console.error);
    }
  }, [user]);

  // Sync initial input if there's already points redeemed in state
  useEffect(() => {
    if (rewardPointsRedeemed > 0 && !pointsInput) {
      setPointsInput(rewardPointsRedeemed.toString());
    }
  }, [rewardPointsRedeemed, pointsInput]);

  const handleSelectGift = (id: string) => {
    if (selectedGiftId === id) {
      setGiftId(null);
      if (isGift) toggleGift();
    } else {
      setGiftId(id);
      if (!isGift) toggleGift();
    }
  };

  const activeGift  = GIFT_OPTIONS.find(g => g.id === selectedGiftId) ?? null;
  const baseTotal = total;
  const safeRewardPointsRedeemed = rewardPointsRedeemed || 0;
  const actualRedeemedPoints = Math.min(safeRewardPointsRedeemed, userRewardPoints, baseTotal);
  const displayTotal = baseTotal - actualRedeemedPoints;

  const [couponInput,   setCouponInput  ] = useState('');
  const [couponError,   setCouponError  ] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  const handleApplyCoupon = useCallback(async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) { setCouponError('Enter a code first.'); return; }
    if (discountCode === code) { setCouponError('Already applied.'); return; }
    setCouponError(''); setCouponSuccess('');
    try {
      const res = await applyCouponCode(code);
      if (res?.success) { setCouponSuccess('Coupon applied!'); setCouponInput(''); }
      else              { setCouponError(res?.message || 'Invalid code.'); }
    } catch (err: any) {
      setCouponError(err?.message || 'Failed to validate coupon');
    }
  }, [couponInput, discountCode, applyCouponCode]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@300;400;500;600&display=swap');

        :root {
          --beige: #f5f0e8; --beige-dk: #ede5d5; --beige-dkr: #d9cdb8;
          --olive-900: #1a1f0d; --olive-600: #3d4a22; --olive-500: #5a6b2e;
          --olive-400: #7a8e3c; --olive-200: #c4cc9a; --olive-50: #f2f4e8;
          --gold: #c9a84c; --ink: #1e2310; --mist: rgba(30,35,16,.45);
          --red: #c0392b; --green: #2e7d32;
        }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .cp-root {
          min-height: 100vh; background: var(--beige);
          font-family: 'Jost', sans-serif; color: var(--ink);
        }

        /* ── Layout ── */
        .cp-layout {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 24px;
          max-width: 1200px;
          margin: 50px auto 0;
          padding: 32px 52px 72px;
          align-items: start;

        }
        .cp-left  { display: flex; flex-direction: column; gap: 18px; }
        .cp-right { position: sticky; top: 90px; display: flex; flex-direction: column; gap: 14px; }

        /* ── White panel ── */
        .cp-panel {
          background: white;
          border-radius: 18px;
          border: 1px solid rgba(61,74,34,.07);
          overflow: hidden;
        }
        .cp-panel-head {
          padding: 16px 22px;
          border-bottom: 1px solid rgba(61,74,34,.07);
          font-size: 10px; letter-spacing: .38em; text-transform: uppercase;
          color: var(--mist); font-weight: 500;
        }

        /* ── CartGoalMeter wrapper ── */
        .cp-goal-meter {
          padding: 20px 24px 18px;
        }

        /* ── Cart item ── */
        .cp-item {
          display: flex; gap: 14px;
          padding: 18px 22px;
          border-bottom: 1px solid rgba(61,74,34,.06);
          animation: cpItemIn .3s ease both;
        }
        @keyframes cpItemIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes cpPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: .5; transform: scale(.8); }
        }
        .cp-item:last-child { border-bottom: none; }
        .cp-item-img {
          width: 90px; height: 90px; border-radius: 12px;
          object-fit: cover; flex-shrink: 0;
          background: var(--beige-dk);
        }
        .cp-item-body { flex: 1; min-width: 0; }
        .cp-item-name {
          font-size: 14px; font-weight: 500; color: var(--olive-900);
          margin-bottom: 4px; line-height: 1.3;
        }
        .cp-item-color {
          display: flex; align-items: center; gap: 6px;
          font-size: 11px; color: var(--mist); margin-bottom: 10px;
        }
        .cp-item-color-dot {
          width: 12px; height: 12px; border-radius: 50%;
          border: 1.5px solid rgba(0,0,0,.1); flex-shrink: 0;
        }
        .cp-item-price-row { display: flex; align-items: baseline; gap: 8px; }
        .cp-item-price     { font-size: 16px; font-weight: 600; color: var(--olive-900); }
        .cp-item-original  { font-size: 12px; color: var(--mist); text-decoration: line-through; }
        .cp-item-per       { font-size: 10px; color: var(--mist); margin-top: 2px; }
        .cp-item-actions   {
          display: flex; flex-direction: column;
          align-items: flex-end; justify-content: space-between;
          flex-shrink: 0;
        }
        .cp-item-remove {
          background: none; border: none; cursor: pointer;
          font-size: 18px; color: var(--mist); padding: 2px;
          transition: color .2s; line-height: 1;
        }
        .cp-item-remove:hover { color: var(--red); }
        .cp-qty {
          display: flex; align-items: center;
          border: 1.5px solid var(--beige-dkr); border-radius: 50px;
          overflow: hidden; background: var(--beige);
        }
        .cp-qty-btn {
          width: 34px; height: 34px; background: none; border: none;
          font-size: 18px; cursor: pointer; color: var(--olive-600);
          display: flex; align-items: center; justify-content: center;
          transition: background .15s;
        }
        .cp-qty-btn:hover { background: var(--olive-50); }
        .cp-qty-val {
          min-width: 34px; text-align: center;
          font-size: 13px; font-weight: 600; color: var(--ink);
        }

        /* ── Savings strip ── */
        .cp-savings-strip {
          margin: 10px 22px 16px;
          background: linear-gradient(135deg, #e8f5e9, #f1f8e9);
          border: 1px solid #c8e6c9; border-radius: 10px;
          padding: 11px 16px;
          font-size: 12.5px; color: var(--green); font-weight: 600;
          display: flex; align-items: center; gap: 8px;
        }

        /* ── Gift box selector ── */
        .cp-gift-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 10px;
        }
        .cp-gift-heading  { font-size: 10px; letter-spacing: .38em; text-transform: uppercase; color: var(--mist); font-weight: 500; }
        .cp-gift-optional { font-size: 10px; color: var(--mist); font-style: italic; }

        .cp-gift-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

        .cp-gift-card {
          position: relative; border: 2px solid var(--beige-dkr);
          border-radius: 16px; overflow: hidden; cursor: pointer;
          background: white; transition: border-color .22s, box-shadow .22s, transform .15s;
        }
        .cp-gift-card:hover { border-color: var(--olive-400); box-shadow: 0 4px 18px rgba(90,107,46,.12); transform: translateY(-2px); }
        .cp-gift-card--selected { border-color: var(--olive-500); box-shadow: 0 6px 24px rgba(90,107,46,.22); }

        .cp-gift-card-img      { width: 100%; aspect-ratio: 1/1; object-fit: cover; display: block; background: var(--beige-dk); }
        .cp-gift-card-body     { padding: 10px 12px 12px; }
        .cp-gift-card-title    { font-size: 12.5px; font-weight: 600; color: var(--olive-900); margin-bottom: 2px; line-height: 1.3; }
        .cp-gift-card-sub      { font-size: 11px; color: #101010; line-height: 1.4; margin-bottom: 8px; }
        .cp-gift-card-price    { font-size: 14px; font-weight: 700; color: var(--olive-600); }

        .cp-gift-card-check {
          position: absolute; top: 8px; right: 8px;
          width: 22px; height: 22px; border-radius: 50%;
          background: var(--olive-500); border: 2px solid white;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; color: white;
          opacity: 0; transform: scale(.6);
          transition: opacity .2s, transform .25s cubic-bezier(.34,1.56,.64,1);
          box-shadow: 0 2px 8px rgba(90,107,46,.35); pointer-events: none;
        }
        .cp-gift-card--selected .cp-gift-card-check { opacity: 1; transform: scale(1); }

        .cp-gift-msg-wrap { padding: 12px 0 0; animation: cpFadeDown .3s ease; }
        @keyframes cpFadeDown { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
        .cp-gift-msg {
          width: 100%; padding: 11px 14px;
          border: 1.5px solid var(--beige-dkr); border-radius: 12px;
          font-family: 'Jost', sans-serif; font-size: 12px; color: var(--ink);
          background: white; outline: none; resize: none; height: 68px;
          transition: border-color .2s;
        }
        .cp-gift-msg:focus { border-color: var(--olive-400); }
        .cp-gift-msg::placeholder { color: rgba(30,35,16,.3); }

        .cp-gift-panel {
          background: white; border-radius: 18px;
          border: 1px solid rgba(61,74,34,.07); padding: 16px 18px 18px;
        }

        /* ── Coupon ── */
        .cp-coupon-row { display: flex; gap: 8px; }
        .cp-coupon-input {
          flex: 1; padding: 11px 14px;
          border: 1.5px solid var(--beige-dkr); border-radius: 50px;
          font-family: 'Jost', sans-serif; font-size: 12px; color: var(--ink);
          background: white; outline: none; text-transform: uppercase;
          transition: border-color .2s;
        }
          .cp-input-hint {
  font-size: 12px;
  font-weight: 400; 
  color : #101010;
  margin-top: 6px;
  letter-spacing: .02em;
  line-height: 1.4;
}
        .cp-coupon-input:focus { border-color: var(--olive-400); }
        .cp-coupon-input::placeholder { text-transform: none; color: rgba(30,35,16,.3); }
        .cp-coupon-btn {
          padding: 11px 18px; background: var(--olive-600); color: var(--beige);
          border: none; border-radius: 50px; font-family: 'Jost', sans-serif;
          font-size: 10.5px; font-weight: 600; letter-spacing: .14em; text-transform: uppercase;
          cursor: pointer; transition: background .2s; white-space: nowrap;
        }
        .cp-coupon-btn:hover { background: var(--olive-500); }
        .cp-coupon-msg         { font-size: 11px; margin-top: 6px; }
        .cp-coupon-msg--error  { color: var(--red); }
        .cp-coupon-msg--success{ color: var(--green); }
        .cp-coupon-applied {
          display: flex; align-items: center; justify-content: space-between;
          background: #e8f5e9; border: 1px solid #c8e6c9; border-radius: 10px;
          padding: 10px 14px; font-size: 12px; color: var(--green); font-weight: 600;
          margin-bottom: 8px;
        }
        .cp-coupon-remove { background: none; border: none; cursor: pointer; font-size: 14px; color: var(--mist); transition: color .2s; }
        .cp-coupon-remove:hover { color: var(--red); }

        /* ── Price summary ── */
        .cp-summary-row {
          display: flex; justify-content: space-between;
          font-size: 13px; color: var(--mist); margin-bottom: 10px;
        }
        .cp-summary-row--savings { color: var(--green); font-weight: 600; }
        .cp-summary-row--total {
          font-size: 17px; font-weight: 700; color: var(--ink);
          border-top: 1px solid rgba(61,74,34,.1);
          padding-top: 12px; margin-top: 4px; margin-bottom: 0;
        }
        .cp-summary-row span:last-child { font-weight: 500; color: var(--ink); }
        .cp-summary-row--total span:last-child { font-weight: 800; font-size: 20px; }
        .cp-free-tag {
          background: #bdd4bf; color: white;
          font-size: 9px; font-weight: 700; letter-spacing: .12em;
          padding: 2px 8px; border-radius: 3px; text-transform: uppercase;
        }

        /* ── CTA ── */
        .cp-checkout-btn {
          display: flex; align-items: center; justify-content: center; gap: 10px;
          width: 100%; padding: 17px;
          background: var(--olive-900); color: var(--beige);
          border: none; border-radius: 50px; font-family: 'Jost', sans-serif;
          font-size: 11.5px; font-weight: 700; letter-spacing: .22em; text-transform: uppercase;
          cursor: pointer; text-decoration: none;
          box-shadow: 0 6px 28px rgba(26,31,13,.22);
          transition: background .22s, transform .15s, box-shadow .22s;
        }
        .cp-checkout-btn:hover { background: var(--olive-600); transform: translateY(-2px); box-shadow: 0 10px 36px rgba(26,31,13,.28); }

        /* ── Empty ── */
        .cp-empty { text-align: center; padding: 80px 20px; grid-column: 1 / -1; }
        .cp-empty-icon { font-family: 'Cormorant Garamond', serif; font-size: 56px; font-style: italic; font-weight: 300; color: rgba(61,74,34,.12); margin-bottom: 14px; }
        .cp-empty-text { font-size: 13px; color: var(--mist); margin-bottom: 20px; letter-spacing: .06em; }
        .cp-empty-link {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 13px 28px; background: var(--olive-900); color: var(--beige);
          border-radius: 50px; text-decoration: none;
          font-size: 10.5px; font-weight: 600; letter-spacing: .2em; text-transform: uppercase;
          transition: background .2s;
        }
        .cp-empty-link:hover { background: var(--olive-600); }

        /* ── Responsive ── */
        @media (max-width: 1024px) {
          .cp-layout { padding: 32px 24px 72px; }
        }
        @media (max-width: 900px) {
          .cp-layout { grid-template-columns: 1fr; padding: 24px; gap: 24px; }
          .cp-right  { position: static; }
        }
        @media (max-width: 540px) {
          .cp-layout      { padding: 16px; gap: 16px; margin-top: 45px; }
          .cp-panel-head  { padding: 14px 16px; }
          .cp-goal-meter  { padding: 16px 16px 14px; }
          .cp-item        { padding: 14px 16px; gap: 10px; }
          .cp-item-img    { width: 72px; height: 72px; }
          .cp-item-name   { font-size: 13px; }
          .cp-item-price  { font-size: 15px; }
          .cp-qty-btn     { width: 28px; height: 28px; font-size: 16px; }
          .cp-qty-val     { min-width: 28px; font-size: 12px; }
          .cp-gift-panel  { padding: 14px 14px 16px; }
          .cp-gift-card-title { font-size: 11.5px; }
          .cp-gift-card-sub   { font-size: 9px; }
        }
      `}</style>

      <div className="cp-root">
        <UpperNav />
        <ExitIntent />

        <div className="cp-layout"  >

          {/* ── EMPTY STATE ── */}
          {items.length === 0 && (
            <div className="cp-empty">
              <div className="cp-empty-icon">◇</div>
              <p className="cp-empty-text">Your cart is empty — add something beautiful.</p>
              <Link href="/" className="cp-empty-link">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
                Start Shopping
              </Link>
            </div>
          )}

          {items.length > 0 && (
            <>
              {/* ── LEFT ── */}
              <div className="cp-left">

                {/* ── CartBanner replaces old progress section ── */}
                <div className="cp-panel">
                  <div className="cp-goal-meter">
                    <CartBanner />
                  </div>
                </div>

                {/* Cart items */}
                <div className="cp-panel">
                  {savings > 0 && (
                    <div className="cp-savings-strip">
                      🎉 You&apos;re saving ₹{savings.toLocaleString('en-IN')} on this order!
                    </div>
                  )}
                  {items.map(item => (
                    <div
                      className="cp-item"
                      key={`${item.id}-${item.colorHex}`}
                      style={(item.selectedCharms?.length || item.selectionGroups?.length) ? { flexDirection: 'column', gap: 10 } : undefined}
                    >
                      <div style={{ display: 'flex', gap: 14 }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                         <Link href={item.href|| `/products/${item.id}`} style={{ flexShrink: 0 }}>
    <img className="cp-item-img" src={item.image} alt={item.name} />
  </Link>
  <div className="cp-item-body">
    <Link href={item.href || `/products/${item.id}`}  style={{ textDecoration: 'none' }}>
      <div className="cp-item-name">{item.name}</div>
    </Link>
                          {/* {!item.selectedCharms?.length && (
                            <div className="cp-item-color">
                              <span className="cp-item-color-dot" style={{ background: item.colorHex }} />
                              {item.color}
                            </div>
                          )} */}
                          <div className="cp-item-price-row">
                            <span className="cp-item-price">₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
                            {item.originalPrice && (
                              <span className="cp-item-original">₹{(item.originalPrice * item.qty).toLocaleString('en-IN')}</span>
                            )}
                          </div>
                          {(!item.selectedCharms?.length && !item.selectionGroups?.length) && (
                            <p className="cp-item-per">₹{item.price.toLocaleString('en-IN')} per item</p>
                          )}
                        </div>
                        <div className="cp-item-actions">
                          <button
                            className="cp-item-remove"
                            onClick={() => removeItem(item.id, item.colorHex)}
                            aria-label={`Remove ${item.name}`}
                          >×</button>
                          {(!item.selectedCharms?.length && !item.selectionGroups?.length) && (
                            <div className="cp-qty">
                              <button className="cp-qty-btn" onClick={() => updateQty(item.id, item.colorHex, item.qty - 1)}>−</button>
                              <span className="cp-qty-val">{item.qty}</span>
                              <button className="cp-qty-btn" onClick={() => updateQty(item.id, item.colorHex, item.qty + 1)}>+</button>
                            </div>
                          )}
                        </div>
                      </div>

                      {item.selectedCharms && item.selectedCharms.length > 0 && (
                        <div style={{ background: 'var(--olive-50)', borderRadius: 10, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <div style={{ fontSize: 9, letterSpacing: '.3em', textTransform: 'uppercase' as const, color: 'var(--mist)', fontWeight: 600, marginBottom: 2 }}>
                            Selected Pieces ({item.selectedCharms.length})
                          </div>
                          {item.selectedCharms.map((selection, idx: number) => {
                            const charm = typeof selection === 'string' ? { id: selection, name: selection } : selection;
                            const charmPrice = typeof charm.price === 'number' && Number.isFinite(charm.price)
                              ? charm.price
                              : item.selectedCharms?.length
                                ? item.price / item.selectedCharms.length
                                : 0;
                            return (
                            <div key={charm.id || charm._id || idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 0', borderBottom: idx < (item.selectedCharms?.length || 0) - 1 ? '1px solid rgba(61,74,34,.08)' : 'none' }}>
                              <span style={{ fontSize: 12, color: 'var(--olive-900)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span style={{ fontSize: 14 }}>{charm.emoji || '◈'}</span>
                                {charm.name || 'Charm'}
                              </span>
                              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--olive-600)' }}>₹{charmPrice.toLocaleString('en-IN')}</span>
                            </div>
                            );
                          })}
                        </div>
                      )}

                      {!item.selectedCharms?.length && item.selectionGroups && item.selectionGroups.length > 0 && (
                        <div style={{ background: 'var(--olive-50)', borderRadius: 10, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <div style={{ fontSize: 9, letterSpacing: '.3em', textTransform: 'uppercase', color: 'var(--mist)', fontWeight: 600, marginBottom: 2 }}>
                            Included Items
                          </div>
                          {Boolean(item.customData) && (Boolean(item.customData?.comboPresetMessage) || Boolean(item.customData?.comboPersonalMessage)) && (
                            <div style={{ padding: '6px 8px', background: 'rgba(201,168,76,0.12)', borderRadius: 6, fontSize: 11, color: 'var(--olive-700)', marginBottom: 4 }}>
                              <div style={{ fontWeight: 600, fontSize: 10, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '.05em' }}>Box Customisation</div>
                              {Boolean(item.customData?.comboPresetMessage) && <div>Card: <em>{String(item.customData?.comboPresetMessage)}</em></div>}
                              {Boolean(item.customData?.comboPersonalMessage) && <div>Message: &ldquo;{String(item.customData?.comboPersonalMessage)}&rdquo;</div>}
                            </div>
                          )}
                          {item.selectionGroups.flatMap((group) => 
                            group.items.map((selection, idx) => (
                              <div key={selection.id || idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid rgba(61,74,34,.08)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                  {selection.image && <img src={selection.image} alt={selection.name} style={{ width: 32, height: 32, borderRadius: 4, objectFit: 'cover' }} />}
                                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: 10, color: 'var(--mist)', textTransform: 'uppercase', letterSpacing: '.05em' }}>{group.label || group.category}</span>
                                    <span style={{ fontSize: 12, color: 'var(--olive-900)' }}>{selection.name}</span>
                                    {Boolean(selection.customData) && (Boolean(selection.customData?.presetMessage) || Boolean(selection.customData?.personalMessage)) && (
                                      <div style={{ fontSize: 10.5, color: 'var(--olive-600)', marginTop: 2 }}>
                                        {Boolean(selection.customData?.presetMessage) && <div>Card: <em>{String(selection.customData?.presetMessage)}</em></div>}
                                        {Boolean(selection.customData?.personalMessage) && <div>Msg: &ldquo;{String(selection.customData?.personalMessage)}&rdquo;</div>}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* ── RIGHT ── */}
              <div className="cp-right">

                {/* Gift box selector */}
                <GiftBoxSelector
                  selectedGiftId={selectedGiftId}
                  onSelect={handleSelectGift}
                  giftMessage={giftMessage}
                  onMessageChange={setGiftMessage}
                  isGift={isGift}
                />

                {/* Coupon */}
                <div className="cp-panel" style={{ padding: '18px 20px' }}>
                  <p className="cp-panel-head" style={{ padding: 0, border: 'none', marginBottom: 12 }}>Apply Coupon</p>
                  {discountCode && (
                    <div className="cp-coupon-applied">
                      <span>&quot;{discountCode}&quot; — ₹{discountAmount} off</span>
                      <button className="cp-coupon-remove" onClick={removeDiscount} aria-label="Remove coupon">×</button>
                    </div>
                  )}
                  {!discountCode && (
                    <>
                      <div className="cp-coupon-row">
                        <input
                          className="cp-coupon-input"
                          value={couponInput}
                          onChange={e => { setCouponInput(e.target.value); setCouponError(''); setCouponSuccess(''); }}
                          placeholder="Enter code"
                          onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                        />
                        <button className="cp-coupon-btn" onClick={handleApplyCoupon}>Apply</button>
                      </div>
                      {couponError   && <p className="cp-coupon-msg cp-coupon-msg--error">{couponError}</p>}
                      {couponSuccess && <p className="cp-coupon-msg cp-coupon-msg--success">{couponSuccess}</p>}
                    </>
                  )}
                </div>

                {/* Reward Points */}
                {userRewardPoints > 0 && (
                  <div className="cp-panel" style={{ padding: '18px 20px', marginTop: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <p className="cp-panel-head" style={{ padding: 0, border: 'none' }}>Redeem Points</p>
                     
                      <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--olive-500)', background: 'var(--olive-50)', padding: '2px 6px', borderRadius: 4 }}>
                        Balance: {userRewardPoints}
                      </span>
                    </div>
                    <div className="cp-coupon-row">
                      <input 
                        className="cp-coupon-input"
                        type="number" 
                        min="0" 
                        max={Math.min(userRewardPoints, baseTotal)}
                        value={pointsInput} 
                        onChange={(e) => setPointsInput(e.target.value)}
                        placeholder={`Up to ${Math.min(userRewardPoints, baseTotal)}`}
                      />
                      <button 
                        className="cp-coupon-btn"
                        onClick={() => {
                          const parsedVal = parseInt(pointsInput, 10);
                          const val = Math.max(0, Math.min(isNaN(parsedVal) ? 0 : parsedVal, userRewardPoints, baseTotal));
                          setRewardPointsRedeemed(val);
                          setPointsInput(val.toString());
                        }}
                      >
                        Apply
                      </button>
                    </div>
                    <p className="cp-input-hint">
  Enter the amount you want to redeem from your balance.
</p>
                    {actualRedeemedPoints > 0 && (
                      <div className="cp-coupon-applied" style={{ marginTop: 8 }}>
                        <span>−₹{actualRedeemedPoints} points redeemed</span>
                        <button className="cp-coupon-remove" onClick={() => { setRewardPointsRedeemed(0); setPointsInput(''); }}>×</button>
                      </div>
                    )}
                  </div>
                )}

                {/* Price summary */}
                <div className="cp-panel" style={{ padding: '20px 22px' }}>
                  <div className="cp-summary-row">
                    <span>Subtotal ({itemCount} item{itemCount !== 1 ? 's' : ''})</span>
                    <span>₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  {savings > 0 && (
                    <div className="cp-summary-row cp-summary-row--savings">
                      <span>You save</span>
                      <span>−₹{savings.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  {discountAmount > 0 && (
                    <div className="cp-summary-row cp-summary-row--savings">
                      <span>Coupon ({discountCode})</span>
                      <span>−₹{discountAmount}</span>
                    </div>
                  )}
                  {actualRedeemedPoints > 0 && (
                    <div className="cp-summary-row cp-summary-row--savings">
                      <span>Sparkle Points</span>
                      <span>−₹{actualRedeemedPoints}</span>
                    </div>
                  )}
                  {applicableOffers.length > 0 && (
                    <>
                      <div style={{ margin: '10px 0 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', color: '#828278' }}>Store Offers</span>
                        <span style={{ height: 1, flex: 1, background: '#e5dcc8' }} />
                      </div>
                      {applicableOffers.map((o) => (
                        <div key={o.id} style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          background: o.applied ? 'rgba(74,117,53,.06)' : 'rgba(0,0,0,.02)',
                          border: `1px solid ${o.applied ? 'rgba(74,117,53,.2)' : '#e5dcc8'}`,
                          borderRadius: 8, padding: '8px 12px', marginBottom: 4,
                        }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', flex: 1 }}>
                            <input
                              type="checkbox"
                              checked={o.applied}
                              onChange={() => toggleOfferOptOut(o.id)}
                              style={{ cursor: 'pointer', accentColor: '#4a7535', width: 15, height: 15, flexShrink: 0 }}
                            />
                            <span style={{ fontSize: 13, fontWeight: 500, color: o.applied ? 'var(--olive-900, #1a1f0d)' : '#828278', lineHeight: 1.35 }}>
                              {o.title}
                            </span>
                            {o.applied && (
                              <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase', color: '#4a7535', background: 'rgba(74,117,53,.12)', padding: '2px 7px', borderRadius: 100 }}>
                                Applied ✓
                              </span>
                            )}
                          </label>
                          <span style={{ fontSize: 13, fontWeight: 800, color: o.applied ? '#2e7d32' : '#828278', flexShrink: 0, marginLeft: 10 }}>
                            {o.applied ? `−₹${o.amount.toLocaleString('en-IN')}` : `₹${o.amount.toLocaleString('en-IN')} off`}
                          </span>
                        </div>
                      ))}
                      {autoDiscountAmount > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '4px 2px 6px' }}>
                          <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#2e7d32', flexShrink: 0, animation: 'cpPulse 1.8s infinite' }} />
                          <span style={{ fontSize: 12, color: '#2e7d32', fontWeight: 600 }}>
                            You're saving ₹{autoDiscountAmount.toLocaleString('en-IN')} with store offer{appliedOffers.length !== 1 ? 's' : ''}!
                          </span>
                        </div>
                      )}
                    </>
                  )}
                  <div className="cp-summary-row">
                    <span>Shipping</span>
                    <span>
                      {shipping === 0
                        ? <span className="cp-free-tag">FREE</span>
                        : `₹${shipping}`}
                    </span>
                  </div>
                  {activeGift && (
                    <div className="cp-summary-row">
                      <span>🎁 {activeGift.title}</span>
                      <span>₹{activeGift.price}</span>
                    </div>
                  )}
                  <div className="cp-summary-row cp-summary-row--total">
                    <span>Total</span>
                    <span>₹{displayTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Checkout CTA */}
                <Link href="/checkout" className="cp-checkout-btn">
                  Proceed to Checkout
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </Link>

              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   GiftBoxSelector sub-component (unchanged logic, same styles)
───────────────────────────────────────────────────────────────────────────── */
function GiftBoxSelector({
  selectedGiftId,
  onSelect,
  giftMessage,
  onMessageChange,
  isGift,
}: {
  selectedGiftId: string | null;
  onSelect: (id: string) => void;
  giftMessage: string;
  onMessageChange: (msg: string) => void;
  isGift: boolean;
}) {
  return (
    <div className="cp-gift-panel">
      <div className="cp-gift-header">
        <span className="cp-gift-heading">Make it a Gift</span>
        <span className="cp-gift-optional">optional</span>
      </div>

      <div className="cp-gift-cards">
        {GIFT_OPTIONS.map(opt => {
          const isSelected = selectedGiftId === opt.id;
          return (
            <div
              key={opt.id}
              className={`cp-gift-card${isSelected ? ' cp-gift-card--selected' : ''}`}
              onClick={() => onSelect(opt.id)}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && onSelect(opt.id)}
              aria-pressed={isSelected}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="cp-gift-card-img" src={opt.image} alt={opt.title} />
              <div className="cp-gift-card-body">
                <div className="cp-gift-card-title">{opt.title}</div>
                <div className="cp-gift-card-sub">{opt.sub}</div>
                <div className="cp-gift-card-price">+₹{opt.price}</div>
              </div>
              <div className="cp-gift-card-check" aria-hidden="true">✓</div>
            </div>
          );
        })}
      </div>

      <div className="cp-gift-msg-wrap">
        <textarea
          className="cp-gift-msg"
          placeholder="Write a Message for us (optional)…"
          value={giftMessage}
          onChange={e => onMessageChange(e.target.value)}
          maxLength={160}
        />
      </div>
    </div>
  );
}
