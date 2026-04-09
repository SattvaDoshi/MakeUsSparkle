'use client';

import { useCart } from '@/lib/cartContext';

export default function NavCartButton() {
  const { openDrawer, itemCount } = useCart();

  return (
    <>
      <style>{`
        .nav-cart-btn {
          position: relative;
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
          border-radius: 50%;
          color: var(--olive-600, #3d4a22);
          transition: background .2s;
          display: flex; align-items: center; justify-content: center;
        }
        .nav-cart-btn:hover {
          background: rgba(61,74,34,.07);
        }
        .nav-cart-btn svg {
          width: 22px; height: 22px;
          stroke: currentColor; fill: none; stroke-width: 1.8;
        }
        .nav-cart-badge {
          position: absolute;
          top: 2px; right: 2px;
          background: var(--olive-500, #5a6b2e);
          color: #f5f0e8;
          font-size: 9px; font-weight: 700;
          min-width: 17px; height: 17px;
          border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          padding: 0 4px;
          /* entrance */
          opacity: 0; transform: scale(0);
          transition: opacity .25s, transform .25s cubic-bezier(.34,1.56,.64,1);
          font-family: 'Jost', sans-serif;
          border: 2px solid var(--beige, #f5f0e8);
          pointer-events: none;
          line-height: 1;
        }
        .nav-cart-badge.visible {
          opacity: 1; transform: scale(1);
        }
        /* pulse when item added */
        .nav-cart-badge.pulse {
          animation: cartBadgePulse .4s ease;
        }
        @keyframes cartBadgePulse {
          0%   { transform: scale(1); }
          40%  { transform: scale(1.5); }
          100% { transform: scale(1); }
        }
      `}</style>

      <button
        className="nav-cart-btn"
        onClick={openDrawer}
        aria-label={`Cart (${itemCount} items)`}
      >
        <svg viewBox="0 0 24 24">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
        <span className={`nav-cart-badge${itemCount > 0 ? ' visible' : ''}`}>
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      </button>
    </>
  );
}