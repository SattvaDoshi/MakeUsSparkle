

'use client';

import {
  useState,
  type CSSProperties,
  type MouseEvent,
} from 'react';
import { useRouter } from 'next/navigation';
import { useWishlist } from '@/lib/wishlistContext';
import router from 'next/dist/shared/lib/router/router';

/**
 * ProductCard — Rectangular, fully clickable card
 * Image ratio: 4:6 (2:3) — portrait
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
  productLinkBase,
}: {
  product: ProductCardProduct;
  style?: CSSProperties;
  className?: string;
  productLinkBase?: string;
} ){
  const { name, price, originalPrice, badge, images, colors, href = '#' } = product;

  const router = useRouter();
  const { toggleItem, isWished } = useWishlist();

  const [activeColor] = useState(0);
  const [activeImage, setActiveImage] = useState(0);
  const [wishAnim, setWishAnim] = useState(false);

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
    href: product.href ?? '',
    colors: product.colors,
    badge: product.badge ?? null,
    rating: product.rating,
    reviewCount: product.reviewCount,
  };

  function handleCardClick(e: MouseEvent<HTMLDivElement>) {
      console.log('productLinkBase:', productLinkBase, 'product.type:', product.type, 'href:', product.href);

  if (
    (e.target as HTMLElement).closest('.pc-wish') ||
    (e.target as HTMLElement).closest('.pc-dots')
  ) return;

  const slug = (product.href ?? '').split('/').pop() 
    ?? product.id?.toString() 
    ?? 'product';

  if (productLinkBase) {
    router.push(`${productLinkBase}/${slug}`);
    return;
  }
  router.push(product.href ?? `/products/${slug}`);
}

  const handleWish = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem(wishlistItem);
    setWishAnim(true);
    setTimeout(() => setWishAnim(false), 600);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500;600&display=swap');

        .pc {
          --beige:      #f7f2ea;
          --beige-dk:   #ede5d5;
          --olive:      #3d4a22;
          --olive-md:   #5a6b2e;
          --ink:        #1e2310;
          --mist:       rgba(30,35,16,.42);
          --t: .24s cubic-bezier(.4,0,.2,1);

          font-family: 'Jost', sans-serif;
          background: var(--beige);
          border-radius: 4px;
          overflow: hidden;
          position: relative;
          display: flex;
          flex-direction: column;
          width: 100%;

          box-shadow: 0 1px 4px rgba(61,74,34,.08);
          transition: box-shadow var(--t), transform var(--t);
          cursor: pointer;
          user-select: none;
        }

        .pc:hover {
          box-shadow: 0 6px 24px rgba(61,74,34,.14), 0 2px 6px rgba(61,74,34,.08);
          transform: translateY(-2px);
        }

        .pc:active {
          transform: translateY(0);
          box-shadow: 0 1px 4px rgba(61,74,34,.08);
        }

        /* ─── 4:6 (2:3) portrait image zone ─── */
        .pc-img-zone {
          position: relative;
          width: 100%;
          aspect-ratio: 2 / 3;   /* ← 4:6 portrait ratio */
          background: var(--beige-dk);
          overflow: hidden;
          flex-shrink: 0;
        }

        .pc-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center top; /* show top of image — better for apparel/product shots */
          display: block;
          transition: transform .5s cubic-bezier(.25,.46,.45,.94);
        }
        .pc:hover .pc-img { transform: scale(1.05); }

        /* subtle overlay on hover */
        .pc-overlay {
          position: absolute; inset: 0;
          background: rgba(20,26,10,.1);
          opacity: 0;
          transition: opacity var(--t);
          pointer-events: none;
        }
        .pc:hover .pc-overlay { opacity: 1; }

        /* ─── Badge ─── */
        .pc-badge {
          position: absolute; top: 10px; left: 10px; z-index: 2;
          font-size: 8px; font-weight: 600; letter-spacing: .08em;
          text-transform: uppercase;
          color: var(--ink); background: var(--beige);
          padding: 3px 9px 2px;
          border-radius: 2px;
          box-shadow: 0 1px 4px rgba(0,0,0,.10);
        }
        .pc-badge--sale { background: var(--olive); color: var(--beige); }

        .pc-discount {
          position: absolute; top: 10px; left: 10px; z-index: 2;
          font-size: 8px; font-weight: 700; letter-spacing: .06em;
          color: var(--beige); background: var(--olive-md);
          padding: 3px 9px 2px;
          border-radius: 2px;
        }

        /* ─── Wishlist ─── */
        .pc-wish {
          position: absolute; top: 8px; right: 8px; z-index: 3;
          width: 30px; height: 30px; border-radius: 2px;
          background: rgba(247,242,234,.88);
          border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 1px 4px rgba(0,0,0,.10);
          transition: transform .18s, background .18s;
          backdrop-filter: blur(4px);
        }
        .pc-wish:hover { transform: scale(1.12); background: var(--beige); }
        .pc-wish.active { background: var(--olive); }
        .pc-wish.anim { animation: wishPop .4s cubic-bezier(.36,.07,.19,.97); }
        @keyframes wishPop {
          0%   { transform: scale(1); }
          30%  { transform: scale(1.28); }
          60%  { transform: scale(.92); }
          100% { transform: scale(1); }
        }
        .pc-wish svg { width: 14px; height: 14px; }

        /* image dot nav */
        .pc-dots {
          position: absolute; bottom: 10px; left: 50%;
          transform: translateX(-50%);
          display: flex; gap: 5px;
          z-index: 2;
          opacity: 0;
          transition: opacity var(--t);
        }
        .pc:hover .pc-dots { opacity: 1; }
        .pc-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: rgba(247,242,234,.5);
          border: none; cursor: pointer; padding: 0;
          transition: background .18s, width .18s;
        }
        .pc-dot.active {
          background: #f7f2ea;
          width: 14px; border-radius: 2px;
        }

        /* ─── Info strip ─── */
        .pc-info {
          padding: 12px 12px 14px;
          background: var(--beige);
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex-shrink: 0;
          border-top: 1px solid rgba(61,74,34,.06);
        }

        .pc-name {
          font-size: 13px; font-weight: 500;
          color: var(--ink);
          line-height: 1.3;
          letter-spacing: -.01em;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .pc-price-row {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .pc-price {
          font-size: 13px; font-weight: 600;
          color: var(--ink); letter-spacing: -.01em;
          white-space: nowrap;
        }
        .pc-original {
          font-size: 10px; font-weight: 400;
          color: var(--mist); text-decoration: line-through;
          white-space: nowrap;
        }
        .pc-saving {
          font-size: 9px; font-weight: 600;
          color: var(--olive-md);
          letter-spacing: .04em;
        }

        /* ─── Responsive ─── */

        /* Mobile: ≤ 479px */
        @media (max-width: 479px) {
          .pc {
            border-radius: 3px;
          }
          /* Keep 2:3 ratio — naturally taller, which suits narrow mobile columns */
          .pc-info {
            padding: 8px 10px 10px;
            gap: 3px;
          }
          .pc-name    { font-size: 11px; }
          .pc-price   { font-size: 11px; }
          .pc-original { font-size: 8px; }
          .pc-saving  { font-size: 8px; }
          .pc-badge, .pc-discount {
            font-size: 7px; top: 7px; left: 7px;
            padding: 2px 6px;
          }
          .pc-wish { width: 26px; height: 26px; top: 6px; right: 6px; }
          .pc-wish svg { width: 12px; height: 12px; }
          .pc-dot { width: 4px; height: 4px; }
          .pc-dot.active { width: 12px; }
        }

        /* Tablet: 480px – 1023px */
        @media (min-width: 480px) and (max-width: 1023px) {
          .pc-info { padding: 10px 11px 12px; }
          .pc-name  { font-size: 12.5px; }
          .pc-price { font-size: 12.5px; }
        }

        /* Desktop: ≥ 1024px */
        @media (min-width: 1024px) {
          .pc-info { padding: 13px 14px 16px; }
          .pc-name  { font-size: 14px; }
          .pc-price { font-size: 14px; }
          .pc-original { font-size: 10.5px; }
          .pc-saving { font-size: 9.5px; }
        }
      `}</style>

      <div
        className={`pc ${className}`}
        style={style}
        onClick={handleCardClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') handleCardClick(e as any);
        }}
        aria-label={`View ${name}`}
      >

        {/* ── IMAGE ZONE (4:6 portrait) ── */}
        <div className="pc-img-zone">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="pc-img"
            src={displayImage}
            alt={name}
            loading="lazy"
            width={400}
            height={600}
          />

          <div className="pc-overlay" />

          {badge && !discount && (
            <span className={`pc-badge${badge === 'Sale' ? ' pc-badge--sale' : ''}`}>
              {badge}
            </span>
          )}
          {discount && <span className="pc-discount">−{discount}%</span>}

          <button
            className={`pc-wish${wished ? ' active' : ''}${wishAnim ? ' anim' : ''}`}
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
            <div className="pc-dots">
              {currentImages.map((_: string, i: number) => (
                <button
                  key={i}
                  className={`pc-dot${activeImage === i ? ' active' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setActiveImage(i);
                  }}
                  aria-label={`Image ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── INFO STRIP ── */}
        <div className="pc-info">
          <p className="pc-name">{name}</p>
          <div className="pc-price-row">
            <span className="pc-price">₹{price.toLocaleString('en-IN')}</span>
            {originalPrice && (
              <span className="pc-original">
                ₹{originalPrice.toLocaleString('en-IN')}
              </span>
            )}
            {discount && (
              <span className="pc-saving">{discount}% off</span>
            )}
          </div>
        </div>

      </div>
    </>
  );
}