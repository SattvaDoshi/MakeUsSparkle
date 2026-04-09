'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useCart, GIFT_CHARGE } from '@/lib/cartContext';
import ExitIntent from '@/components/cart/ExitIntent';

// ─── Offer milestones ─────────────────────────────────────────────────────────
const OFFERS = [
  { label: 'Free Shipping',  threshold: 598,  emoji: '🚚', short: 'Shipping' },
  { label: 'Free Gift',      threshold: 999,  emoji: '🎁', short: 'Free Gift' },
  { label: 'Free Organiser', threshold: 1199, emoji: '🛍️', short: 'Organiser' },
];

// ─── "You may also like" (static — swap with your actual products) ─────────────
const ALSO_LIKE = [
  { id: 101, name: 'Minimal Stud Earrings', price: 549, original: 799, emoji: '💎', href: '/products/minimal-studs' },
  { id: 102, name: 'Gold Hoop Earrings',    price: 899, original: null, emoji: '⭕', href: '/products/gold-hoop-earrings' },
  { id: 103, name: 'Beaded Charm Bracelet', price: 749, original: null, emoji: '📿', href: '/products/beaded-bracelet' },
];

const COUPON_MAP: Record<string, number> = {
  MAISON10: 100,
  SAVE20:   200,
  WELCOME:  50,
};

export default function CartPage() {
  const {
    state, subtotal, savings, shipping, total,
    itemCount, removeItem, updateQty,
    toggleGift, setGiftMessage,
    applyDiscount, removeDiscount,
  } = useCart();
  const { items, isGift, giftMessage, discountCode, discountAmount } = state;

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  // Which offer dots are unlocked
  const unlockedOffers = OFFERS.filter(o => subtotal >= o.threshold);
  const nextOffer      = OFFERS.find(o => subtotal < o.threshold);
  const remaining      = nextOffer ? nextOffer.threshold - subtotal : 0;
  const progressBase   = nextOffer
    ? OFFERS[OFFERS.indexOf(nextOffer) - 1]?.threshold ?? 0
    : OFFERS[OFFERS.length - 1].threshold;
  const progressRange  = nextOffer ? nextOffer.threshold - progressBase : 1;
  const progressFill   = nextOffer
    ? Math.min(100, ((subtotal - progressBase) / progressRange) * 100)
    : 100;

  const handleApplyCoupon = useCallback(() => {
    const code = couponInput.trim().toUpperCase();
    if (!code) { setCouponError('Enter a code first.'); return; }
    if (discountCode === code) { setCouponError('Already applied.'); return; }
    const amount = COUPON_MAP[code];
    if (!amount) { setCouponError('Invalid code. Try MAISON10, SAVE20 or WELCOME.'); setCouponSuccess(''); return; }
    applyDiscount(code, amount);
    setCouponSuccess(`₹${amount} off applied! 🎉`);
    setCouponError('');
    setCouponInput('');
  }, [couponInput, discountCode, applyDiscount]);

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

        /* ── Header ── */
        .cp-header {
          display: flex; align-items: center; gap: 14px;
          padding: 18px 52px;
          border-bottom: 1px solid rgba(61,74,34,.09);
          background: rgba(245,240,232,.85); backdrop-filter: blur(14px);
          position: sticky; top: 0; z-index: 100;
        }
        .cp-back {
          display: flex; align-items: center; gap: 6px;
          font-size: 9.5px; letter-spacing: .28em; text-transform: uppercase;
          color: var(--mist); text-decoration: none; transition: color .2s;
        }
        .cp-back:hover { color: var(--olive-600); }
        .cp-header-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px; font-weight: 300; letter-spacing: .06em;
          color: var(--olive-900);
        }
        .cp-header-count {
          font-size: 11px; color: var(--mist); letter-spacing: .16em;
          margin-left: 4px;
        }

        /* ── Layout ── */
        .cp-layout {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 24px;
          max-width: 1200px;
          margin: 0 auto;
          padding: 32px 52px 72px;
          align-items: start;
        }
        .cp-left { display: flex; flex-direction: column; gap: 18px; }
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

        /* ── Offer progress ── */
        .cp-progress { padding: 18px 22px; }
        .cp-progress-text {
          font-size: 13px; color: var(--ink); margin-bottom: 10px; line-height: 1.5;
        }
        .cp-progress-text strong { color: var(--olive-600); }
        .cp-track { height: 5px; background: var(--beige-dkr); border-radius: 3px; overflow: hidden; margin-bottom: 18px; }
        .cp-track-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--olive-400), var(--gold));
          border-radius: 3px;
          transition: width .6s cubic-bezier(.22,.68,0,1.2);
        }

        /* ── Offer dots strip ── */
        .cp-dots {
          display: flex; align-items: flex-start;
          gap: 0; padding: 0 22px 18px;
        }
        .cp-dot-item {
          display: flex; flex-direction: column; align-items: center;
          flex: 1; text-align: center; position: relative;
        }
        .cp-dot-item:not(:last-child)::after {
          content: '';
          position: absolute;
          top: 16px;
          left: calc(50% + 14px);
          right: calc(-50% + 14px);
          height: 2px;
          background: repeating-linear-gradient(
            90deg,
            var(--beige-dkr) 0,
            var(--beige-dkr) 5px,
            transparent 5px,
            transparent 10px
          );
        }
        .cp-dot-item--unlocked::after { background: repeating-linear-gradient(90deg, var(--olive-400) 0, var(--olive-400) 5px, transparent 5px, transparent 10px) !important; }
        .cp-dot-circle {
          width: 32px; height: 32px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 15px; border: 2px solid var(--beige-dkr);
          background: white; margin-bottom: 6px;
          transition: all .3s cubic-bezier(.34,1.56,.64,1);
          flex-shrink: 0;
        }
        .cp-dot-circle--active {
          background: var(--olive-500); border-color: var(--olive-500);
          box-shadow: 0 4px 16px rgba(90,107,46,.3);
          transform: scale(1.12);
        }
        .cp-dot-label {
          font-size: 9.5px; color: var(--mist); line-height: 1.3; font-weight: 500;
          letter-spacing: .04em;
        }
        .cp-dot-label--active { color: var(--olive-600); font-weight: 600; }

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
        .cp-item-price { font-size: 16px; font-weight: 600; color: var(--olive-900); }
        .cp-item-original { font-size: 12px; color: var(--mist); text-decoration: line-through; }
        .cp-item-per { font-size: 10px; color: var(--mist); margin-top: 2px; }
        .cp-item-actions {
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
          margin: 0 22px 16px;
          background: linear-gradient(135deg, #e8f5e9, #f1f8e9);
          border: 1px solid #c8e6c9; border-radius: 10px;
          padding: 11px 16px;
          font-size: 12.5px; color: var(--green); font-weight: 600;
          display: flex; align-items: center; gap: 8px;
        }

        /* ── You may also like ── */
        .cp-also-like { padding: 18px 22px; }
        .cp-also-title {
          font-size: 10px; letter-spacing: .36em; text-transform: uppercase;
          color: var(--mist); margin-bottom: 14px; font-weight: 500;
        }
        .cp-also-scroll {
          display: flex; gap: 12px; overflow-x: auto;
          scrollbar-width: none; padding-bottom: 2px;
        }
        .cp-also-scroll::-webkit-scrollbar { display: none; }
        .cp-also-card {
          min-width: 140px; background: var(--beige);
          border-radius: 14px; padding: 12px;
          border: 1px solid rgba(61,74,34,.08);
          display: flex; flex-direction: column; gap: 6px;
          text-decoration: none; color: inherit;
          transition: transform .2s, box-shadow .2s;
        }
        .cp-also-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(61,74,34,.1); }
        .cp-also-emoji {
          font-size: 32px; height: 72px;
          display: flex; align-items: center; justify-content: center;
          background: white; border-radius: 10px;
        }
        .cp-also-name { font-size: 11px; font-weight: 600; color: var(--olive-900); line-height: 1.3; }
        .cp-also-price { font-size: 13px; font-weight: 600; color: var(--olive-600); }
        .cp-also-orig { font-size: 10px; color: var(--mist); text-decoration: line-through; }

        /* ── RIGHT PANEL ── */

        /* Gift toggle */
        .cp-gift {
          background: linear-gradient(135deg, #fdf6e7, #f5f0e8);
          border: 2px dashed var(--gold);
          border-radius: 18px; padding: 16px 18px;
          display: flex; align-items: center; gap: 14px;
          cursor: pointer; transition: all .22s;
        }
        .cp-gift:hover { border-color: var(--olive-400); }
        .cp-gift--selected { border-style: solid; border-color: var(--olive-500); background: linear-gradient(135deg, #f2f4e8, #f5f0e8); }
        .cp-gift-icon { font-size: 36px; flex-shrink: 0; }
        .cp-gift-body { flex: 1; }
        .cp-gift-title { font-size: 14px; font-weight: 600; color: var(--olive-900); margin-bottom: 2px; }
        .cp-gift-sub { font-size: 11px; color: var(--mist); line-height: 1.4; }
        .cp-gift-price { font-size: 14px; font-weight: 700; color: var(--olive-600); flex-shrink: 0; }
        .cp-gift-check {
          width: 24px; height: 24px; border-radius: 50%;
          border: 2px solid var(--beige-dkr);
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; transition: all .22s; flex-shrink: 0;
        }
        .cp-gift--selected .cp-gift-check { background: var(--olive-500); border-color: var(--olive-500); color: white; }

        /* Gift message */
        .cp-gift-msg-wrap { padding: 14px 0 0; animation: cpFadeDown .3s ease; }
        @keyframes cpFadeDown { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
        .cp-gift-msg {
          width: 100%;
          padding: 11px 14px;
          border: 1.5px solid var(--beige-dkr); border-radius: 12px;
          font-family: 'Jost', sans-serif; font-size: 12px; color: var(--ink);
          background: white; outline: none; resize: none; height: 68px;
          transition: border-color .2s;
        }
        .cp-gift-msg:focus { border-color: var(--olive-400); }
        .cp-gift-msg::placeholder { color: rgba(30,35,16,.3); }

        /* Coupon */
        .cp-coupon-row { display: flex; gap: 8px; }
        .cp-coupon-input {
          flex: 1; padding: 11px 14px;
          border: 1.5px solid var(--beige-dkr); border-radius: 50px;
          font-family: 'Jost', sans-serif; font-size: 12px; color: var(--ink);
          background: white; outline: none; text-transform: uppercase;
          transition: border-color .2s;
        }
        .cp-coupon-input:focus { border-color: var(--olive-400); }
        .cp-coupon-input::placeholder { text-transform: none; color: rgba(30,35,16,.3); }
        .cp-coupon-btn {
          padding: 11px 18px;
          background: var(--olive-600); color: var(--beige);
          border: none; border-radius: 50px;
          font-family: 'Jost', sans-serif;
          font-size: 10.5px; font-weight: 600; letter-spacing: .14em; text-transform: uppercase;
          cursor: pointer; transition: background .2s; white-space: nowrap;
        }
        .cp-coupon-btn:hover { background: var(--olive-500); }
        .cp-coupon-msg { font-size: 11px; margin-top: 6px; }
        .cp-coupon-msg--error { color: var(--red); }
        .cp-coupon-msg--success { color: var(--green); }
        .cp-coupon-applied {
          display: flex; align-items: center; justify-content: space-between;
          background: #e8f5e9; border: 1px solid #c8e6c9; border-radius: 10px;
          padding: 10px 14px; font-size: 12px; color: var(--green); font-weight: 600;
          margin-bottom: 8px;
        }
        .cp-coupon-remove {
          background: none; border: none; cursor: pointer;
          font-size: 14px; color: var(--mist); transition: color .2s;
        }
        .cp-coupon-remove:hover { color: var(--red); }

        /* Price summary */
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
          background: var(--green); color: white;
          font-size: 9px; font-weight: 700; letter-spacing: .12em;
          padding: 2px 8px; border-radius: 3px; text-transform: uppercase;
        }

        /* CTA */
        .cp-checkout-btn {
          display: flex; align-items: center; justify-content: center; gap: 10px;
          width: 100%; padding: 17px;
          background: var(--olive-900); color: var(--beige);
          border: none; border-radius: 50px;
          font-family: 'Jost', sans-serif;
          font-size: 11.5px; font-weight: 700; letter-spacing: .22em; text-transform: uppercase;
          cursor: pointer; text-decoration: none;
          box-shadow: 0 6px 28px rgba(26,31,13,.22);
          transition: background .22s, transform .15s, box-shadow .22s;
        }
        .cp-checkout-btn:hover {
          background: var(--olive-600);
          transform: translateY(-2px);
          box-shadow: 0 10px 36px rgba(26,31,13,.28);
        }

        /* Empty */
        .cp-empty {
          text-align: center; padding: 80px 20px;
          grid-column: 1 / -1;
        }
        .cp-empty-icon {
          font-family: 'Cormorant Garamond', serif;
          font-size: 56px; font-style: italic; font-weight: 300;
          color: rgba(61,74,34,.12); margin-bottom: 14px;
        }
        .cp-empty-text { font-size: 13px; color: var(--mist); margin-bottom: 20px; letter-spacing: .06em; }
        .cp-empty-link {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 13px 28px; background: var(--olive-900); color: var(--beige);
          border-radius: 50px; text-decoration: none;
          font-size: 10.5px; font-weight: 600; letter-spacing: .2em; text-transform: uppercase;
          transition: background .2s;
        }
        .cp-empty-link:hover { background: var(--olive-600); }

        @media (max-width: 900px) {
          .cp-layout { grid-template-columns: 1fr; padding: 24px; }
          .cp-right { position: static; }
          .cp-header { padding: 16px 24px; }
        }
        @media (max-width: 540px) {
          .cp-layout { padding: 16px; gap: 14px; }
          .cp-header { padding: 14px 16px; }
        }
      `}</style>

      <div className="cp-root">
        <ExitIntent />

        {/* Header */}
        <header className="cp-header">
          <Link href="/shop" className="cp-back">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Shop
          </Link>
          <span className="cp-header-title">
            Cart
            {itemCount > 0 && <span className="cp-header-count">({itemCount})</span>}
          </span>
        </header>

        <div className="cp-layout">

          {/* ── EMPTY STATE ── */}
          {items.length === 0 && (
            <div className="cp-empty">
              <div className="cp-empty-icon">◇</div>
              <p className="cp-empty-text">Your cart is empty — add something beautiful.</p>
              <Link href="/shop" className="cp-empty-link">
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

                {/* Offer progress + dots */}
                <div className="cp-panel">
                  <div className="cp-progress">
                    <p className="cp-progress-text">
                      {nextOffer
                        ? <>Add <strong>₹{remaining}</strong> more for <strong>{nextOffer.emoji} {nextOffer.label}!</strong></>
                        : '🎉 You\'ve unlocked all rewards!'
                      }
                    </p>
                    <div className="cp-track">
                      <div className="cp-track-fill" style={{ width: `${progressFill}%` }} />
                    </div>
                    <div className="cp-dots">
                      {OFFERS.map((o, i) => {
                        const active = subtotal >= o.threshold;
                        const prevUnlocked = i === 0 || subtotal >= OFFERS[i - 1].threshold;
                        return (
                          <div
                            key={o.label}
                            className={`cp-dot-item${prevUnlocked ? ' cp-dot-item--unlocked' : ''}`}
                          >
                            <div className={`cp-dot-circle${active ? ' cp-dot-circle--active' : ''}`}>
                              {active ? '✓' : o.emoji}
                            </div>
                            <div className={`cp-dot-label${active ? ' cp-dot-label--active' : ''}`}>
                              {o.short}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Cart items */}
                <div className="cp-panel">
                  {savings > 0 && (
                    <div className="cp-savings-strip">
                      🎉 You're saving ₹{savings.toLocaleString('en-IN')} on this order!
                    </div>
                  )}
                  {items.map(item => (
                    <div className="cp-item" key={`${item.id}-${item.colorHex}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img className="cp-item-img" src={item.image} alt={item.name} />
                      <div className="cp-item-body">
                        <div className="cp-item-name">{item.name}</div>
                        <div className="cp-item-color">
                          <span className="cp-item-color-dot" style={{ background: item.colorHex }} />
                          {item.color}
                        </div>
                        <div className="cp-item-price-row">
                          <span className="cp-item-price">₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
                          {item.originalPrice && (
                            <span className="cp-item-original">₹{(item.originalPrice * item.qty).toLocaleString('en-IN')}</span>
                          )}
                        </div>
                        <p className="cp-item-per">₹{item.price.toLocaleString('en-IN')} per item</p>
                      </div>
                      <div className="cp-item-actions">
                        <button
                          className="cp-item-remove"
                          onClick={() => removeItem(item.id, item.colorHex)}
                          aria-label={`Remove ${item.name}`}
                        >×</button>
                        <div className="cp-qty">
                          <button className="cp-qty-btn" onClick={() => updateQty(item.id, item.colorHex, item.qty - 1)}>−</button>
                          <span className="cp-qty-val">{item.qty}</span>
                          <button className="cp-qty-btn" onClick={() => updateQty(item.id, item.colorHex, item.qty + 1)}>+</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* You may also like */}
                <div className="cp-panel">
                  <div className="cp-also-like">
                    <p className="cp-also-title">You may also like</p>
                    <div className="cp-also-scroll">
                      {ALSO_LIKE.map(a => (
                        <Link key={a.id} href={a.href} className="cp-also-card">
                          <div className="cp-also-emoji">{a.emoji}</div>
                          <div className="cp-also-name">{a.name}</div>
                          <div>
                            <span className="cp-also-price">₹{a.price}</span>
                            {a.original && <span className="cp-also-orig"> ₹{a.original}</span>}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── RIGHT ── */}
              <div className="cp-right">

                {/* Make it a Gift */}
                <div
                  className={`cp-gift${isGift ? ' cp-gift--selected' : ''}`}
                  onClick={() => toggleGift()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && toggleGift()}
                >
                  <div className="cp-gift-icon">🎁</div>
                  <div className="cp-gift-body">
                    <div className="cp-gift-title">Make it a Gift</div>
                    <div className="cp-gift-sub">Gift wrap + personalised message card</div>
                  </div>
                  <div className="cp-gift-price">+₹{GIFT_CHARGE}</div>
                  <div className="cp-gift-check">{isGift ? '✓' : ''}</div>
                </div>

                {isGift && (
                  <div className="cp-gift-msg-wrap">
                    <textarea
                      className="cp-gift-msg"
                      placeholder="Write a gift message (optional)…"
                      value={giftMessage}
                      onChange={e => setGiftMessage(e.target.value)}
                      maxLength={160}
                    />
                  </div>
                )}

                {/* Coupon */}
                <div className="cp-panel" style={{ padding: '18px 20px' }}>
                  <p className="cp-panel-head" style={{ padding: 0, border: 'none', marginBottom: 12 }}>Apply Coupon</p>
                  {discountCode && (
                    <div className="cp-coupon-applied">
                      <span>"{discountCode}" — ₹{discountAmount} off</span>
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
                  <div className="cp-summary-row">
                    <span>Shipping</span>
                    <span>
                      {shipping === 0
                        ? <span className="cp-free-tag">FREE</span>
                        : `₹${shipping}`
                      }
                    </span>
                  </div>
                  {isGift && (
                    <div className="cp-summary-row">
                      <span>🎁 Gift wrap</span>
                      <span>₹{GIFT_CHARGE}</span>
                    </div>
                  )}
                  <div className="cp-summary-row cp-summary-row--total">
                    <span>Total</span>
                    <span>₹{total.toLocaleString('en-IN')}</span>
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