'use client';

import {
  useState,
  useRef,
  useCallback,
  type CSSProperties,
  type MouseEvent,
} from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cartContext';
import { fireConfetti } from '@/components/cart/ConfettiManager';
import { useWishlist } from '@/lib/wishlistContext';

/**
 * ProductCard — Square image card (name + price only)
 *
 * ✅ Recommended image size: 600 × 600 px (1:1 square)
 *    Format : WebP preferred / PNG for transparent bg
 *    Size   : < 100 KB per image
 *    BG     : transparent or #ede5d5
 *
 * Card dimensions (desktop):
 *   Width  : 300px (max-width)
 *   Image  : 300 × 300px (auto — 1:1 via aspect-ratio)
 *   Info   : 300 × 60px (fixed height — never grows)
 *   Total  : 300 × 360px
 */

interface ProductColor {
  label: string;
  hex: string;
  images?: string[];
}

interface ProductCardProduct {
  id: number;
  name: string;
  category: string;
  price: number;
  originalPrice?: number | null;
  badge?: string | null;
  images: string[];
  colors: ProductColor[];
  href: string;
  sku?: string;
  rating?: number;
  reviewCount?: number;
  type?: string;
}

export default function ProductCard({
  product,
  style,
  className = '',
}: {
  product: ProductCardProduct;
  style?: CSSProperties;
  className?: string;
}) {
  const { name, price, originalPrice, badge, images, colors, href = '#' } = product;

  const router = useRouter();
  const { addItem } = useCart();
  const { toggleItem, isWished } = useWishlist();

  const [activeColor, setActiveColor] = useState(0);
  const [activeImage, setActiveImage] = useState(0);
  const [addedAnim, setAddedAnim] = useState(false);

  const btnRef = useRef<HTMLButtonElement | null>(null);
  const wished = isWished(product.id);

  const currentImages =
    colors?.[activeColor]?.images?.length
      ? colors[activeColor].images!
      : images ?? [];

  const displayImage = currentImages[activeImage] ?? currentImages[0];

  const discount = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : null;

  const wishlistItem = {
    id: product.id,
    name: product.name,
    price: product.price,
    originalPrice: product.originalPrice ?? null,
    image: images?.[0] ?? '',
    category: product.category,
    href: product.href,
    colors: product.colors,
    badge: product.badge ?? null,
    rating: product.rating,
    reviewCount: product.reviewCount,
  };

  function handleQuickAdd(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: String(product.id),
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice ?? null,
      image: product.images[0],
      color: product.colors[0]?.label ?? '',
      colorHex: product.colors[0]?.hex ?? '#000',
      sku: product.sku ?? `SKU-${product.id}`,
      href: product.href,
    });
    fireConfetti(btnRef.current);
    setAddedAnim(true);
    setTimeout(() => setAddedAnim(false), 1500);
  }

  const handleViewDetails = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const slug = href.split('/').pop();
    if (
      product.category === 'Key Chain/Charm' ||
      product.type === 'keychains' ||
      product.type === 'custom-charm'
    ) {
      router.push(`/custom-charm/${slug}`);
      return;
    }
    router.push(href);
  };

  const handleWish = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      toggleItem(wishlistItem);
    },
    [toggleItem, wishlistItem],
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500;600&display=swap');

        .pc2 {
          --beige:      #f7f2ea;
          --beige-dk:   #ede5d5;
          --olive:      #3d4a22;
          --olive-md:   #5a6b2e;
          --ink:        #1e2310;
          --mist:       rgba(30,35,16,.42);
          --t: .26s cubic-bezier(.4,0,.2,1);

          /* ── UNIFORM SIZE ── */
          --card-w: 300px;
          --info-h: 60px;   /* fixed info strip — never grows */

          font-family: 'Jost', sans-serif;
          background: var(--beige);
          border-radius: 18px;
          overflow: hidden;
          position: relative;

          /* flex column so image zone fills all remaining space */
          display: flex;
          flex-direction: column;

          width: 100%;
          max-width: var(--card-w);

          /* lock total height = square image + fixed info strip */
          /* image zone is aspect-ratio 1:1 so it = card width  */
          /* total = var(--card-w) + var(--info-h)               */

          box-shadow: 0 2px 8px rgba(61,74,34,.07), 0 1px 3px rgba(61,74,34,.05);
          transition: box-shadow var(--t), transform var(--t);
        }
        .pc2:hover {
          box-shadow: 0 8px 32px rgba(61,74,34,.13), 0 2px 8px rgba(61,74,34,.08);
          transform: translateY(-3px);
        }

        /* ─── SQUARE image zone ─── */
        .pc2-img-zone {
          position: relative;
          width: 100%;
          aspect-ratio: 1 / 1;   /* perfect square — matches image dimensions */
          background: var(--beige-dk);
          overflow: hidden;
          flex-shrink: 0;         /* never shrink — keeps square intact */
        }

        .pc2-img {
          width: 100%; height: 100%;
          object-fit: cover;
          object-position: center;
          display: block;
          transition: transform .55s cubic-bezier(.25,.46,.45,.94);
        }
        .pc2:hover .pc2-img { transform: scale(1.07); }

        /* dark gradient that fades in on hover */
        .pc2-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top,
            rgba(20,26,10,.62) 0%,
            rgba(20,26,10,.0) 52%);
          opacity: 0;
          transition: opacity var(--t);
          pointer-events: none;
        }
        .pc2:hover .pc2-overlay { opacity: 1; }

        /* ─── Overlay action buttons ─── */
        .pc2-actions {
          position: absolute;
          bottom: 12px; left: 12px; right: 12px;
          display: flex; gap: 7px;
          opacity: 0;
          transform: translateY(6px);
          transition: opacity var(--t), transform var(--t);
          pointer-events: none;
          z-index: 3;
        }
        .pc2:hover .pc2-actions {
          opacity: 1;
          transform: translateY(0);
          pointer-events: auto;
        }

        .pc2-btn-view {
          flex: 1;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Jost', sans-serif;
          font-size: 10px; font-weight: 500; letter-spacing: .09em;
          text-transform: uppercase;
          color: #f7f2ea;
          background: rgba(247,242,234,.15);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(247,242,234,.30);
          border-radius: 50px;
          padding: 9px 6px;
          cursor: pointer;
          transition: background var(--t);
          white-space: nowrap;
        }
        .pc2-btn-view:hover { background: rgba(247,242,234,.28); }

        .pc2-btn-cart {
          flex: 1.5;
          display: flex; align-items: center; justify-content: center;
          gap: 6px;
          font-family: 'Jost', sans-serif;
          font-size: 10px; font-weight: 600; letter-spacing: .09em;
          text-transform: uppercase;
          color: #f7f2ea;
          background: var(--olive);
          border: 1px solid var(--olive);
          border-radius: 50px;
          padding: 9px 10px;
          cursor: pointer;
          transition: background var(--t), transform .14s;
          white-space: nowrap;
        }
        .pc2-btn-cart:hover  { background: var(--olive-md); border-color: var(--olive-md); }
        .pc2-btn-cart:active { transform: scale(.96); }
        .pc2-btn-cart.added  { background: #4a7c59; border-color: #4a7c59; }
        .pc2-btn-cart svg    { width: 12px; height: 12px; flex-shrink: 0; }

        /* ─── Top-corner decorations ─── */
        .pc2-badge {
          position: absolute; top: 11px; left: 11px; z-index: 2;
          font-size: 8px; font-weight: 600; letter-spacing: .08em;
          text-transform: uppercase;
          color: var(--ink); background: var(--beige);
          padding: 3px 9px 2px;
          border-radius: 50px;
          box-shadow: 0 1px 4px rgba(0,0,0,.10);
        }
        .pc2-badge--sale { background: var(--olive); color: var(--beige); }

        .pc2-discount {
          position: absolute; top: 11px; left: 11px; z-index: 2;
          font-size: 8px; font-weight: 700; letter-spacing: .06em;
          color: var(--beige); background: var(--olive-md);
          padding: 3px 9px 2px;
          border-radius: 50px;
        }

        .pc2-wish {
          position: absolute; top: 9px; right: 9px; z-index: 2;
          width: 30px; height: 30px; border-radius: 50%;
          background: var(--beige);
          border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 1px 4px rgba(0,0,0,.12);
          transition: transform .18s, background .18s;
        }
        .pc2-wish:hover { transform: scale(1.14); }
        .pc2-wish.active { background: var(--olive); }
        .pc2-wish svg { width: 14px; height: 14px; }

        /* image dot nav */
        .pc2-dots {
          position: absolute; bottom: 52px; left: 50%;
          transform: translateX(-50%);
          display: flex; gap: 5px;
          z-index: 2;
          opacity: 0;
          transition: opacity var(--t);
        }
        .pc2:hover .pc2-dots { opacity: 1; }
        .pc2-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: rgba(247,242,234,.45);
          border: none; cursor: pointer; padding: 0;
          transition: background .18s, width .18s;
        }
        .pc2-dot.active {
          background: #f7f2ea;
          width: 16px; border-radius: 3px;
        }

        /* ─── Info strip — FIXED HEIGHT ─── */
        .pc2-info {
          height: var(--info-h);         /* ← fixed: never grows or shrinks */
          padding: 0 14px;
          background: var(--beige);
          display: flex;
          align-items: center;           /* vertical center in fixed strip */
          justify-content: space-between;
          gap: 8px;
          flex-shrink: 0;                /* extra safety against flex squeeze */
          overflow: hidden;              /* clip anything that overflows */
        }

        .pc2-name {
          font-size: 13px; font-weight: 500;
          color: var(--ink);
          line-height: 1.25;
          letter-spacing: -.01em;
          margin: 0;
          flex: 1;
          min-width: 0;                  /* allow flex child to shrink below content size */
          /* single-line truncation */
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .pc2-price-col {
          display: flex; flex-direction: column;
          align-items: flex-end; flex-shrink: 0;
          gap: 1px;
        }
        .pc2-price {
          font-size: 14px; font-weight: 600;
          color: var(--ink); letter-spacing: -.01em;
          white-space: nowrap;
        }
        .pc2-original {
          font-size: 10px; font-weight: 400;
          color: var(--mist); text-decoration: line-through;
          white-space: nowrap;
        }

        /* ─── Responsive breakpoints ─── */
/* ─── Responsive breakpoints ─── */

/* Mobile-first: card fills its grid cell completely */
@media (max-width: 479px) {
  .pc2 {
    --info-h: 54px;
    width: 100%;
    max-width: 100%;   /* ← KEY: must fill the grid cell, not constrain to 300px */
    border-radius: 10px;
  }
  .pc2-info { padding: 0 10px; }
  .pc2-name  { font-size: 11px; }
  .pc2-price { font-size: 12px; }
  .pc2-original { font-size: 9px; }
}

@media (min-width: 480px) and (max-width: 1023px) {
  .pc2 {
    --card-w: 260px;
    --info-h: 58px;
    max-width: 260px;
  }
}

@media (min-width: 1024px) {
  .pc2 {
    --card-w: 300px;
    --info-h: 60px;
    max-width: 300px;
  }
  .pc2-info  { padding: 0 15px; }
  .pc2-name  { font-size: 14px; }
  .pc2-price { font-size: 15px; }
}
      `}</style>

      <div className={`pc2 ${className}`} style={style}>

        {/* ── IMAGE ZONE (square) ── */}
        <div className="pc2-img-zone">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="pc2-img"
            src={displayImage}
            alt={name}
            loading="lazy"
            width={600}
            height={600}
          />

          <div className="pc2-overlay" />

          {badge && !discount && (
            <span className={`pc2-badge${badge === 'Sale' ? ' pc2-badge--sale' : ''}`}>
              {badge}
            </span>
          )}
          {discount && <span className="pc2-discount">−{discount}%</span>}

          <button
            className={`pc2-wish${wished ? ' active' : ''}`}
            onClick={handleWish}
            aria-label="Toggle wishlist"
          >
            <svg
              viewBox="0 0 24 24"
              fill={wished ? '#f7f2ea' : 'none'}
              stroke={wished ? 'none' : 'var(--olive)'}
              strokeWidth="2"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>

          {currentImages.length > 1 && (
            <div className="pc2-dots">
              {currentImages.map((_: string, i: number) => (
                <button
                  key={i}
                  className={`pc2-dot${activeImage === i ? ' active' : ''}`}
                  onClick={(e) => { e.preventDefault(); setActiveImage(i); }}
                  aria-label={`Image ${i + 1}`}
                />
              ))}
            </div>
          )}

          <div className="pc2-actions">
            <button onClick={handleViewDetails} className="pc2-btn-view">
              View
            </button>
            <button
              ref={btnRef}
              className={`pc2-btn-cart${addedAnim ? ' added' : ''}`}
              onClick={handleQuickAdd}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {addedAnim ? 'Added!' : 'Add to Cart'}
            </button>
          </div>
        </div>

        {/* ── INFO STRIP (fixed height) ── */}
        <div className="pc2-info">
          <p className="pc2-name">{name}</p>
          <div className="pc2-price-col">
            <span className="pc2-price">₹{price.toLocaleString('en-IN')}</span>
            {originalPrice && (
              <span className="pc2-original">
                ₹{originalPrice.toLocaleString('en-IN')}
              </span>
            )}
          </div>
        </div>

      </div>
    </>
  );
}