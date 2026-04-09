'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import { useCart, cartSubtotal, cartShipping, GIFT_CHARGE } from '@/lib/cartContext';

// ─── Offer thresholds (must match CartPage) ───────────────────────────────────
const OFFERS = [
  { label: 'Free Shipping',   threshold: 598,  emoji: '🚚' },
  { label: 'Free Gift',       threshold: 999,  emoji: '🎁' },
  { label: 'Free Organiser',  threshold: 1199, emoji: '🛍️' },
];

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

  const nextOffer  = OFFERS.find(o => subtotal < o.threshold);
  const remaining  = nextOffer ? nextOffer.threshold - subtotal : 0;
  const pct        = nextOffer
    ? Math.min(100, (subtotal / nextOffer.threshold) * 100)
    : 100;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@300;400;500;600&display=swap');

        :root {
          --beige: #f5f0e8; --beige-dk: #ede5d5; --beige-dkr: #d9cdb8;
          --olive-900: #1a1f0d; --olive-600: #3d4a22; --olive-500: #5a6b2e;
          --olive-400: #7a8e3c; --olive-50: #f2f4e8;
          --gold: #c9a84c; --ink: #1e2310; --mist: rgba(30,35,16,.45);
          --red: #c0392b; --green: #2e7d32;
        }

        /* ── Overlay ── */
        .drawer-overlay {
          position: fixed; inset: 0; z-index: 500;
          background: rgba(26,31,13,0);
          pointer-events: none;
          transition: background .35s ease;
        }
        .drawer-overlay.open {
          background: rgba(26,31,13,.55);
          pointer-events: all;
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
          font-family: 'Jost', sans-serif;
          color: var(--ink);
        }
        .drawer-overlay.open .drawer-panel {
          transform: translateX(0);
        }

        /* ── Header ── */
        .drawer-head {
          display: flex; align-items: center; justify-content: space-between;
          padding: 22px 24px 18px;
          border-bottom: 1px solid rgba(61,74,34,.1);
          flex-shrink: 0;
        }
        .drawer-head-left {
          display: flex; align-items: baseline; gap: 10px;
        }
        .drawer-head-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px; font-weight: 300; letter-spacing: .04em;
          color: var(--olive-900);
        }
        .drawer-head-count {
          font-size: 11px; letter-spacing: .18em; text-transform: uppercase;
          color: var(--mist);
        }
        .drawer-close {
          width: 34px; height: 34px;
          border-radius: 50%;
          border: 1.5px solid var(--beige-dkr);
          background: white;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: var(--mist);
          transition: all .2s;
        }
        .drawer-close:hover { border-color: var(--olive-400); color: var(--olive-600); background: var(--olive-50); }

        /* ── Offer progress ── */
        .drawer-progress {
          padding: 14px 24px;
          border-bottom: 1px solid rgba(61,74,34,.08);
          flex-shrink: 0;
          background: white;
        }
        .drawer-progress-text {
          font-size: 12px; color: var(--ink); margin-bottom: 8px; line-height: 1.5;
        }
        .drawer-progress-text strong { color: var(--olive-600); }
        .drawer-track {
          height: 4px; background: var(--beige-dkr); border-radius: 2px; overflow: hidden;
        }
        .drawer-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--olive-400), var(--gold));
          border-radius: 2px;
          transition: width .6s cubic-bezier(.22,.68,0,1.2);
        }

        /* ── Items ── */
        .drawer-items {
          flex: 1; overflow-y: auto; padding: 16px 24px; display: flex; flex-direction: column; gap: 14px;
          scrollbar-width: thin;
          scrollbar-color: var(--beige-dkr) transparent;
        }
        .drawer-items::-webkit-scrollbar { width: 4px; }
        .drawer-items::-webkit-scrollbar-thumb { background: var(--beige-dkr); border-radius: 2px; }

        /* ── Item card ── */
        .di-card {
          display: flex; gap: 12px;
          background: white; border-radius: 14px;
          padding: 12px; border: 1px solid rgba(61,74,34,.07);
          animation: diSlide .3s ease both;
        }
        @keyframes diSlide {
          from { opacity: 0; transform: translateX(16px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .di-img {
          width: 72px; height: 72px; border-radius: 10px;
          object-fit: cover; flex-shrink: 0;
          background: var(--beige-dk);
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
          border: 1.5px solid rgba(0,0,0,.12);
          flex-shrink: 0;
        }
        .di-price-row {
          display: flex; align-items: center; gap: 6px;
        }
        .di-price { font-size: 14px; font-weight: 600; color: var(--olive-900); }
        .di-original { font-size: 11px; color: var(--mist); text-decoration: line-through; }
        .di-actions {
          display: flex; flex-direction: column; align-items: flex-end; justify-content: space-between;
        }
        .di-remove {
          background: none; border: none; cursor: pointer;
          color: var(--mist); font-size: 16px; line-height: 1;
          padding: 2px; transition: color .2s;
        }
        .di-remove:hover { color: var(--red); }
        .di-qty {
          display: flex; align-items: center;
          border: 1.5px solid var(--beige-dkr); border-radius: 50px;
          overflow: hidden;
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
        .drawer-empty-text {
          font-size: 13px; color: var(--mist); letter-spacing: .06em;
        }
        .drawer-empty-link {
          font-size: 10px; letter-spacing: .3em; text-transform: uppercase;
          color: var(--olive-600); text-decoration: none; font-weight: 500;
          border-bottom: 1px solid var(--olive-200); padding-bottom: 2px;
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
        .drawer-cta {
          display: flex; flex-direction: column; gap: 8px;
        }
        .drawer-btn-cart {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          padding: 14px;
          background: var(--olive-900);
          color: var(--beige);
          border: none; border-radius: 50px;
          font-family: 'Jost', sans-serif;
          font-size: 10.5px; font-weight: 600; letter-spacing: .22em;
          text-transform: uppercase;
          text-decoration: none;
          cursor: pointer;
          transition: background .22s;
          width: 100%;
        }
        .drawer-btn-cart:hover { background: var(--olive-600); }
        .drawer-btn-shop {
          display: flex; align-items: center; justify-content: center;
          padding: 13px;
          background: transparent;
          color: var(--olive-600);
          border: 1.5px solid var(--beige-dkr);
          border-radius: 50px;
          font-family: 'Jost', sans-serif;
          font-size: 10.5px; font-weight: 500; letter-spacing: .18em;
          text-transform: uppercase;
          text-decoration: none;
          cursor: pointer;
          transition: all .2s;
        }
        .drawer-btn-shop:hover { border-color: var(--olive-400); background: var(--olive-50); }
      `}</style>

      <div
        ref={overlayRef}
        className={`drawer-overlay${isDrawerOpen ? ' open' : ''}`}
        onClick={e => { if (e.target === overlayRef.current) closeDrawer(); }}
      >
        <div className="drawer-panel" role="dialog" aria-modal="true" aria-label="Shopping cart">

          {/* Header */}
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

          {/* Offer progress */}
          {items.length > 0 && (
            <div className="drawer-progress">
              <p className="drawer-progress-text">
                {nextOffer
                  ? <>Add <strong>₹{remaining}</strong> more for <strong>{nextOffer.emoji} {nextOffer.label}</strong></>
                  : '🎉 You\'ve unlocked all rewards!'
                }
              </p>
              <div className="drawer-track">
                <div className="drawer-fill" style={{ width: `${pct}%` }} />
              </div>
            </div>
          )}

          {/* Items */}
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

          {/* Footer */}
          {items.length > 0 && (
            <div className="drawer-foot">
              <div className="drawer-subtotal-row">
                <span>Subtotal ({itemCount} item{itemCount !== 1 ? 's' : ''})</span>
                <strong>₹{subtotal.toLocaleString('en-IN')}</strong>
              </div>
              <div className="drawer-cta">
                <Link href="/cart" className="drawer-btn-cart" onClick={closeDrawer}>
                  View Cart & Checkout
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