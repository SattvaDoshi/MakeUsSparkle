'use client';

import { useRef, useState, useCallback } from 'react';
import { useCart, CartItem } from '@/lib/cartContext';
import { fireConfetti } from '@/components/cart/ConfettiManager';

interface Props {
  product: Omit<CartItem, 'qty'>;
  /** 'full' = wide pill (detail page), 'compact' = card overlay button */
  variant?: 'full' | 'compact';
  className?: string;
}

export default function AddToCartButton({ product, variant = 'full', className }: Props) {
  const { addItem } = useCart();
  const btnRef = useRef<HTMLButtonElement>(null);
  const [added, setAdded] = useState(false);

  const handleAdd = useCallback(() => {
    addItem(product);
    fireConfetti(btnRef.current);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }, [addItem, product]);

  const isCompact = variant === 'compact';

  return (
    <>
      <style>{`
        .atc-btn {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          font-family: 'Jost', sans-serif;
          font-weight: 600; letter-spacing: .18em; text-transform: uppercase;
          border: none; cursor: pointer; position: relative; overflow: hidden;
          transition: background .22s, transform .15s, box-shadow .22s;
          white-space: nowrap;
        }
        .atc-btn--full {
          padding: 15px 28px;
          font-size: 11px;
          color: #f5f0e8;
          background: #1a1f0d;
          border-radius: 50px;
          width: 100%;
          box-shadow: 0 4px 20px rgba(26,31,13,.18);
        }
        .atc-btn--full:hover {
          background: #3d4a22;
          transform: translateY(-1px);
          box-shadow: 0 8px 28px rgba(26,31,13,.24);
        }
        .atc-btn--compact {
          padding: 10px 22px;
          font-size: 9px;
          color: #fff;
          background: #5a6b2e;
          border-radius: 50px;
        }
        .atc-btn--compact:hover {
          background: #3d4a22;
        }
        .atc-btn--added {
          background: #2e7d32 !important;
        }
        .atc-btn--added:hover {
          background: #1b5e20 !important;
          transform: none !important;
        }
        /* Ripple */
        .atc-ripple {
          position: absolute;
          border-radius: 50%;
          width: 80px; height: 80px;
          background: rgba(255,255,255,.25);
          pointer-events: none;
          animation: atcRipple .5s ease-out forwards;
          transform: translate(-50%, -50%) scale(0);
        }
        @keyframes atcRipple {
          to { transform: translate(-50%, -50%) scale(4); opacity: 0; }
        }
      `}</style>

      <button
        ref={btnRef}
        className={[
          'atc-btn',
          isCompact ? 'atc-btn--compact' : 'atc-btn--full',
          added ? 'atc-btn--added' : '',
          className ?? '',
        ].join(' ')}
        onClick={(e) => {
          // ripple
          const rect = btnRef.current!.getBoundingClientRect();
          const ripple = document.createElement('span');
          ripple.className = 'atc-ripple';
          ripple.style.left = `${e.clientX - rect.left}px`;
          ripple.style.top  = `${e.clientY - rect.top}px`;
          btnRef.current!.appendChild(ripple);
          setTimeout(() => ripple.remove(), 600);
          handleAdd();
        }}
        aria-label={added ? 'Added to cart' : 'Add to cart'}
      >
        {added ? (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Added!
          </>
        ) : (
          <>
            {!isCompact && (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
            )}
            Add to Cart
          </>
        )}
      </button>
    </>
  );
}