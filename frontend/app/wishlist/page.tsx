'use client';

import { useWishlist } from '@/lib/wishlistContext';
import { useCart } from '@/lib/cartContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { type MouseEvent } from 'react';

export default function WishlistPage() {
  const { items, removeItem } = useWishlist();
  const { addItem } = useCart();
  const router = useRouter();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@300;400;500;600&display=swap');

        :root {
          --beige:    #f5f0e8;
          --beige-dk: #ede5d5;
          --olive:    #3d4a22;
          --olive-md: #5a6b2e;
          --gold:     #c9a84c;
          --ink:      #1e2310;
          --mist:     rgba(30,35,16,.45);
          --red:      #c0392b;
        }

        /* PAGE */
        .wl-page {
          min-height: 100vh;
          background: var(--beige);
          font-family: 'Jost', sans-serif;
          color: var(--ink);
          padding-bottom: 80px;
        }

        /* HEADER */
        .wl-header {
          padding: 40px 24px 24px;
          border-bottom: 1px solid rgba(61,74,34,.1);
        }
        .wl-eyebrow {
          font-size: 9px; letter-spacing: .5em;
          text-transform: uppercase; color: var(--gold); margin-bottom: 8px;
        }
        .wl-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2.4rem; font-weight: 300; color: var(--olive);
        }
        .wl-title em { font-style: italic; color: var(--gold); }
        .wl-count {
          font-size: 11px; color: var(--mist);
          margin-top: 6px; letter-spacing: .1em;
        }

        /* GRID */
        .wl-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          padding: 24px;
        }
        @media (max-width: 1100px) { .wl-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 720px)  { .wl-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; padding: 14px 12px; } }

        /* CARD — fully clickable, no border-radius */
        .wl-card {
          background: white;
          border-radius: 4px;
          overflow: hidden;
          box-shadow: 0 1px 6px rgba(61,74,34,.07);
          transition: transform .28s cubic-bezier(.4,0,.2,1), box-shadow .28s;
          cursor: pointer;
          position: relative;
          display: flex;
          flex-direction: column;
        }
        .wl-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 28px rgba(61,74,34,.13);
        }

        /* IMAGE */
        .wl-img-wrap {
          position: relative;
          aspect-ratio: 4 / 5;
          background: var(--beige-dk);
          overflow: hidden;
          flex-shrink: 0;
        }
        .wl-img {
          width: 100%; height: 100%;
          object-fit: cover;
          object-position: center top;
          display: block;
          transition: transform .5s cubic-bezier(.25,.46,.45,.94);
        }
        .wl-card:hover .wl-img { transform: scale(1.04); }

        /* REMOVE button */
        .wl-remove {
          position: absolute; top: 8px; right: 8px; z-index: 3;
          width: 28px; height: 28px;
          border-radius: 2px;
          background: rgba(255,255,255,.9);
          border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; line-height: 1;
          color: var(--ink);
          transition: background .18s, color .18s;
          backdrop-filter: blur(4px);
        }
        .wl-remove:hover { background: var(--red); color: white; }

        /* BADGE */
        .wl-badge {
          position: absolute; top: 8px; left: 8px;
          font-size: 8px; font-weight: 600; letter-spacing: .1em;
          color: white; background: var(--olive);
          padding: 3px 8px; border-radius: 2px;
        }

        /* BODY */
        .wl-body {
          padding: 10px 12px 13px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
        }

        .wl-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 15px; font-weight: 400;
          color: var(--ink); line-height: 1.25;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }

        .wl-price-row {
          display: flex; align-items: baseline; gap: 7px;
        }
        .wl-price {
          font-size: 13px; font-weight: 600; color: var(--ink);
        }
        .wl-original {
          font-size: 10px; color: var(--mist); text-decoration: line-through;
        }
        .wl-saving {
          font-size: 9px; font-weight: 600; color: var(--olive-md);
        }

        .wl-colors {
          display: flex; gap: 4px; margin-top: 2px;
        }
        .wl-dot {
          width: 10px; height: 10px; border-radius: 50%;
          border: 1.5px solid rgba(0,0,0,.1); flex-shrink: 0;
        }

        /* ADD TO CART button — straight corners */
        .wl-btn-cart {
          display: flex; align-items: center; justify-content: center; gap: 6px;
          margin-top: 8px;
          width: 100%; padding: 9px 0;
          border: 1.5px solid var(--olive);
          background: transparent;
          color: var(--olive);
          font-family: 'Jost', sans-serif;
          font-size: 9.5px; font-weight: 600;
          letter-spacing: .12em; text-transform: uppercase;
          border-radius: 3px;
          cursor: pointer;
          transition: background .2s, color .2s;
        }
        .wl-btn-cart:hover { background: var(--olive); color: white; }
        .wl-btn-cart--added { background: var(--olive); color: white; }

        /* EMPTY STATE */
        .wl-empty { text-align: center; padding: 80px 24px; }
        .wl-empty-icon {
          font-family: 'Cormorant Garamond', serif;
          font-size: 64px; font-style: italic;
          color: rgba(61,74,34,.12);
          display: block; margin-bottom: 12px;
        }
        .wl-empty-text {
          font-size: 13px; color: var(--mist);
          letter-spacing: .12em; text-transform: uppercase; margin-bottom: 20px;
        }
        .wl-empty-link {
          display: inline-block;
          font-size: 10px; font-weight: 600;
          letter-spacing: .2em; text-transform: uppercase;
          color: white; background: var(--olive);
          padding: 12px 28px; border-radius: 3px;
          text-decoration: none; transition: background .2s;
        }
        .wl-empty-link:hover { background: var(--olive-md); }

        /* MOBILE refinements */
        @media (max-width: 479px) {
          .wl-header { padding: 28px 16px 18px; }
          .wl-title  { font-size: 1.9rem; }
          .wl-body   { padding: 8px 9px 10px; gap: 3px; }
          .wl-name   { font-size: 13px; }
          .wl-price  { font-size: 12px; }
          .wl-original { font-size: 9px; }
          .wl-btn-cart { font-size: 8.5px; padding: 8px 0; margin-top: 6px; }
          .wl-remove { width: 24px; height: 24px; font-size: 14px; top: 6px; right: 6px; }
        }
      `}</style>

      <div className="wl-page">
        <div className="wl-header">
          <div className="wl-eyebrow">Your Saved Pieces</div>
          <h1 className="wl-title">My <em>Wishlist</em></h1>
          <p className="wl-count">{items.length} {items.length === 1 ? 'piece' : 'pieces'} saved</p>
        </div>

        {items.length === 0 ? (
          <div className="wl-empty">
            <span className="wl-empty-icon">♡</span>
            <p className="wl-empty-text">Your wishlist is empty</p>
            <Link href="/categories" className="wl-empty-link">Browse Collections</Link>
          </div>
        ) : (
          <div className="wl-grid">
            {items.map(item => {
              const discount = item.originalPrice
                ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
                : null;

              return (
                <div
                  key={item.id}
                  className="wl-card"
                  onClick={() => router.push(item.href)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') router.push(item.href); }}
                  aria-label={`View ${item.name}`}
                >
                  {/* IMAGE */}
                  <div className="wl-img-wrap">
                    <img src={item.image} alt={item.name} className="wl-img" />
                    {item.badge && <span className="wl-badge">{item.badge}</span>}
                    <button
                      className="wl-remove"
                      onClick={(e: MouseEvent) => { e.stopPropagation(); removeItem(item.id); }}
                      aria-label="Remove from wishlist"
                    >
                      ×
                    </button>
                  </div>

                  {/* BODY */}
                  <div className="wl-body">
                    <div className="wl-name">{item.name}</div>

                    <div className="wl-price-row">
                      <span className="wl-price">₹{item.price.toLocaleString('en-IN')}</span>
                      {item.originalPrice && (
                        <span className="wl-original">₹{item.originalPrice.toLocaleString('en-IN')}</span>
                      )}
                      {discount && <span className="wl-saving">{discount}% off</span>}
                    </div>

                    {item.colors?.length > 0 && (
                      <div className="wl-colors">
                        {item.colors.slice(0, 5).map((c, i) => (
                          <span key={i} className="wl-dot" style={{ background: c.hex }} title={c.label} />
                        ))}
                      </div>
                    )}

                    <button
                      className="wl-btn-cart"
                      onClick={(e: MouseEvent) => {
                        e.stopPropagation();
                        addItem({
                          id: String(item.id),
                          name: item.name,
                          price: item.price,
                          originalPrice: item.originalPrice ?? null,
                          image: item.image,
                          color: item.colors?.[0]?.label ?? 'Default',
                          colorHex: item.colors?.[0]?.hex ?? '#000000',
                          sku: `SKU-${item.id}`,
                          href: item.href,
                        });
                      }}
                      aria-label={`Add ${item.name} to cart`}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}