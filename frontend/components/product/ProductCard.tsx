'use client';

import { useState, useRef, useCallback, type CSSProperties, type MouseEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cartContext';
import { fireConfetti } from '@/components/cart/ConfettiManager';
import { useWishlist } from '@/lib/wishlistContext';

/**
 * ProductCard
 *
 * Props:
 *  - product: {
 *      id, name, category, price, originalPrice?,
 *      badge?,           // e.g. "Best Seller" | "New" | "Sale"
 *      images: string[], // array of image URLs (first is default)
 *      colors: [{ label, hex, images? }],
 *      href,
 *    }
 *  - style / className — forwarded to wrapper
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

export default function ProductCard({ product, style, className = '' }: { product: ProductCardProduct; style?: CSSProperties; className?: string }) {
  const {
    name, category, price, originalPrice,
    badge, images, colors, href = '#',
  } = product;
  const router = useRouter();
  const [activeColor, setActiveColor]   = useState(0);
  const [activeImage, setActiveImage]   = useState(0);
  const { toggleItem, isWished } = useWishlist();
  const wished = isWished(product.id);
  const [addedAnim, setAddedAnim]       = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const { addItem } = useCart();
  const btnRef = useRef<HTMLButtonElement | null>(null);   // add: import useRef from 'react'
  const [added, setAdded] = useState(false);      

    function handleQuickAdd(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();   // ← IMPORTANT: stops the <Link> from navigating
    e.stopPropagation();
    addItem({
      id:            product.id,
      name:          product.name,
      price:         product.price,
      originalPrice: product.originalPrice ?? null,
      image:         product.images[0],
      color:         product.colors[0].label,
      colorHex:      product.colors[0].hex,
      sku:           product.sku ?? `SKU-${product.id}`,
      href:          product.href,
    });
    fireConfetti(btnRef.current);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }
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

  // If a colour has its own images use those, else fall back to global images
  const currentImages =
    colors?.[activeColor]?.images?.length
      ? colors[activeColor].images
      : images ?? [];

  const displayImage = currentImages[activeImage] ?? currentImages[0];
  
  const handleViewDetails = (e: MouseEvent<HTMLButtonElement>) => {
  e.preventDefault();

  const slug = href.split('/').pop();

  // ✅ SPECIAL CASE: CUSTOM CHARM / KEYCHAIN
  if (
    product.category === 'Key Chain/Charm' ||
    product.type === 'keychains' ||
    product.type === 'custom-charm'
  ) {
    router.push(`/custom-charm/${slug}`);
    return;
  }

  // ✅ DEFAULT
  router.push(href);
};

  const handleColorClick = useCallback((i: number) => {
    setActiveColor(i);
    setActiveImage(0);
  }, []);

  const handleAddToCart = useCallback((e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setAddedAnim(true);
    setTimeout(() => setAddedAnim(false), 1600);
  }, []);

  const handleWish = useCallback((e: MouseEvent<HTMLButtonElement>) => {
  e.preventDefault();
  toggleItem(wishlistItem);
}, [toggleItem, wishlistItem]);

  const extraColors = colors?.length > 6 ? colors.length - 6 : 0;
  const visibleColors = colors?.slice(0, 6) ?? [];

  const discount = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Jost:wght@300;400;500;600&display=swap');

        :root {
          --beige:      #f5f0e8;
          --beige-dk:   #ede5d5;
          --beige-dkr:  #d9cdb8;
          --olive:      #3d4a22;
          --olive-md:   #5a6b2e;
          --olive-lt:   #8a9e56;
          --olive-pale: #eef0e6;
          --gold:       #c9a84c;
          --gold-lt:    #e8d49a;
          --ink:        #1e2310;
          --mist:       rgba(30,35,16,.45);
          --card-shadow: 0 2px 12px rgba(61,74,34,.07), 0 1px 3px rgba(61,74,34,.06);
          --card-shadow-hover: 0 16px 48px rgba(61,74,34,.14), 0 4px 12px rgba(61,74,34,.1);
        }

        .pc-wrap {
          font-family: 'Jost', sans-serif;
          background: var(--beige);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: var(--card-shadow);
          transition: box-shadow .35s ease, transform .35s ease;
          position: relative;
          width: 100%;
          max-width: 340px;
        }
        .pc-wrap:hover {
          box-shadow: var(--card-shadow-hover);
          transform: translateY(-4px);
        }

        /* ── Image zone ── */
        .pc-img-zone {
          position: relative;
          background: var(--beige-dk);
          aspect-ratio: 1 / 1;
          overflow: hidden;
          border-radius: 20px 20px 0 0;
        }

        .pc-img {
          width: 100%; height: 100%; object-fit: contain;
          object-position: center;
          padding: 20px;
          display: block;
          transition: transform .6s cubic-bezier(.25,.46,.45,.94), opacity .3s;
        }
        .pc-wrap:hover .pc-img { transform: scale(1.04); }

        /* Badge */
        .pc-badge {
          position: absolute; top: 14px; left: 14px;
          font-size: 10px; font-weight: 600; letter-spacing: .06em;
          color: var(--ink); background: var(--beige);
          padding: 5px 13px 4px;
          border-radius: 50px;
          box-shadow: 0 1px 4px rgba(61,74,34,.12);
        }
        .pc-badge--sale { background: var(--olive); color: var(--beige); }

        /* Wishlist */
        .pc-wish {
          position: absolute; top: 12px; right: 12px;
          width: 34px; height: 34px; border-radius: 50%;
          background: var(--beige); border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 1px 4px rgba(61,74,34,.14);
          transition: transform .2s, background .2s;
        }
        .pc-wish:hover { transform: scale(1.12); }
        .pc-wish.active { background: var(--olive); }
        .pc-wish svg { width: 16px; height: 16px; }

        /* Dot nav */
        .pc-dots {
          position: absolute; bottom: 12px; left: 50%;
          transform: translateX(-50%);
          display: flex; gap: 5px;
        }
        .pc-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: rgba(61,74,34,.2);
          border: none; cursor: pointer; padding: 0;
          transition: background .2s, transform .2s, width .2s;
        }
        .pc-dot.active {
          background: var(--olive);
          width: 20px; border-radius: 4px;
        }

        /* Discount ribbon */
        .pc-discount {
          position: absolute; bottom: 14px; right: 14px;
          font-size: 9px; font-weight: 600; letter-spacing: .06em;
          color: var(--beige); background: var(--olive-md);
          padding: 3px 9px; border-radius: 4px;
        }

        /* ── Info zone ── */
        .pc-info {
          padding: 16px 18px 18px;
          background: var(--beige);
        }

        /* Colour swatches */
        .pc-colors {
          display: flex; align-items: center; gap: 6px;
          margin-bottom: 13px;
        }
        .pc-swatch {
          width: 20px; height: 20px; border-radius: 50%;
          border: 2px solid transparent;
          cursor: pointer; transition: transform .18s, border-color .18s;
          flex-shrink: 0;
          position: relative;
        }
        .pc-swatch:hover { transform: scale(1.18); }
        .pc-swatch.active {
          border-color: var(--olive);
          box-shadow: 0 0 0 2px var(--beige), 0 0 0 4px var(--olive);
        }
        .pc-swatch--white { box-shadow: inset 0 0 0 1px rgba(61,74,34,.2); }
        .pc-swatch.active.pc-swatch--white {
          box-shadow: inset 0 0 0 1px rgba(61,74,34,.2), 0 0 0 2px var(--beige), 0 0 0 4px var(--olive);
        }
        .pc-more-colors {
          font-size: 10px; font-weight: 500; color: var(--mist);
          letter-spacing: .04em; margin-left: 2px;
        }

        /* Name + category */
        .pc-name {
          font-family: 'Jost', sans-serif;
          font-size: 15px; font-weight: 600;
          color: var(--ink); line-height: 1.2;
          margin-bottom: 3px;
          letter-spacing: -.01em;
        }
        .pc-category {
          font-size: 11px; font-weight: 300;
          color: var(--mist); letter-spacing: .04em;
          margin-bottom: 10px;
        }

        /* Price */
        .pc-price-row {
          display: flex; align-items: baseline; gap: 8px;
          margin-bottom: 15px;
        }
        .pc-price {
          font-family: 'Jost', sans-serif;
          font-size: 17px; font-weight: 600;
          color: var(--ink); letter-spacing: -.01em;
        }
        .pc-original {
          font-size: 12px; font-weight: 400;
          color: var(--mist); text-decoration: line-through;
        }

        /* ── Buttons ── */
        .pc-btns {
          display: grid; grid-template-columns: 1fr 1.6fr;
          gap: 9px;
        }

        .pc-btn-view {
          display: flex; align-items: center; justify-content: center;
          font-family: 'Jost', sans-serif;
          font-size: 11px; font-weight: 500; letter-spacing: .08em;
          text-transform: uppercase; text-decoration: none;
          color: var(--olive); background: transparent;
          border: 1.5px solid var(--beige-dkr);
          border-radius: 50px; padding: 11px 10px;
          cursor: pointer; transition: border-color .2s, background .2s, color .2s;
          white-space: nowrap;
        }
        .pc-btn-view:hover {
          border-color: var(--olive-lt);
          background: var(--olive-pale);
        }

        .pc-btn-cart {
          display: flex; align-items: center; justify-content: center;
          gap: 8px;
          font-family: 'Jost', sans-serif;
          font-size: 11px; font-weight: 600; letter-spacing: .08em;
          text-transform: uppercase;
          color: var(--beige); background: var(--ink);
          border: 1.5px solid var(--ink);
          border-radius: 50px; padding: 11px 14px;
          cursor: pointer; transition: background .2s, border-color .2s, transform .15s;
          white-space: nowrap;
          position: relative; overflow: hidden;
        }
        .pc-btn-cart:hover { background: var(--olive); border-color: var(--olive); }
        .pc-btn-cart:active { transform: scale(.97); }
        .pc-btn-cart.added { background: var(--olive-md); border-color: var(--olive-md); }
        .pc-btn-cart svg { width: 14px; height: 14px; flex-shrink: 0; }
      `}</style>

      <div className={`pc-wrap ${className}`} style={style}>

        {/* ── Image Zone ── */}
        <div className="pc-img-zone">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            className="pc-img"
            src={displayImage}
            alt={name}
            loading="lazy"
          />

          {/* Badge */}
          {badge && (
            <span className={`pc-badge${badge === 'Sale' ? ' pc-badge--sale' : ''}`}>
              {badge}
            </span>
          )}

          {/* Wishlist */}
          <button
            className={`pc-wish${wished ? ' active' : ''}`}
            onClick={handleWish}
            aria-label="Add to wishlist"
          >
            <svg viewBox="0 0 24 24" fill={wished ? '#f5f0e8' : 'none'} stroke={wished ? 'none' : 'var(--olive)'} strokeWidth="1.8">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>

          {/* Image dots (only if >1 image) */}
          {currentImages.length > 1 && (
            <div className="pc-dots">
              {currentImages.map((_: string, i: number) => (
                <button
                  key={i}
                  className={`pc-dot${activeImage === i ? ' active' : ''}`}
                  onClick={(e) => { e.preventDefault(); setActiveImage(i); }}
                  aria-label={`Image ${i + 1}`}
                />
              ))}
            </div>
          )}

          {/* Discount badge */}
          {discount && (
            <span className="pc-discount">−{discount}%</span>
          )}
        </div>

        {/* ── Info Zone ── */}
        <div className="pc-info">

          {/* Colour swatches */}
          {visibleColors.length > 0 && (
            <div className="pc-colors">
              {visibleColors.map((c: ProductColor, i: number) => (
                <button
                  key={i}
                  title={c.label}
                  className={`pc-swatch${activeColor === i ? ' active' : ''}${c.hex === '#ffffff' || c.hex === '#fff' ? ' pc-swatch--white' : ''}`}
                  style={{ background: c.hex }}
                  onClick={(e) => { e.preventDefault(); handleColorClick(i); }}
                  aria-label={c.label}
                />
              ))}
              {extraColors > 0 && (
                <span className="pc-more-colors">+{extraColors}</span>
              )}
            </div>
          )}

          {/* Name */}
          <p className="pc-name">{name}</p>
          <p className="pc-category">{category}</p>

          {/* Price */}
          <div className="pc-price-row">
            <span className="pc-price">₹{price.toLocaleString('en-IN')}</span>
            {originalPrice && (
              <span className="pc-original">₹{originalPrice.toLocaleString('en-IN')}</span>
            )}
          </div>

          {/* Buttons */}
          <div className="pc-btns">
            <button onClick={handleViewDetails} className="pc-btn-view">
  View Details
</button>
            <button
              className={`pc-btn-cart${addedAnim ? ' added' : ''}`}
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

      </div>
    </>
  );
}