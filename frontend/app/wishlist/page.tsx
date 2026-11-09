'use client';

import { useWishlist } from '@/lib/wishlistContext';
import ProductCard from '@/components/product/ProductCard';
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

        :root {
          --beige:    #ffffff;
          --beige-dk: #ede5d5;
          --olive:    #3d4a22;
          --olive-md: #5a6b2e;
          --gold:     #c9a84c;
          --ink:      #1e2310;
          --mist:     rgba(30,35,16,.45);
          --red:      #c0392b;
        }

        .wl-page {
          min-height: 100vh;
          background: #ffffff;
          font-family: 'Jost', sans-serif;
          color: var(--ink);
          padding-bottom: 80px;
        }

        .wl-header { padding: 40px 24px 24px; border-bottom: 1px solid rgba(61,74,34,.1); }
        .wl-eyebrow { font-size: 9px; letter-spacing: .5em; text-transform: uppercase; color: var(--gold); margin-bottom: 8px; }
        .wl-title { font-family: 'Cormorant Garamond', serif; font-size: 2.4rem; font-weight: 300; color: var(--olive); }
        .wl-title em { font-style: italic; color: var(--gold); }
        .wl-count { font-size: 11px; color: var(--mist); margin-top: 6px; letter-spacing: .1em; }

        .wl-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
          padding: 24px;
          align-items: stretch;
        }
        @media (max-width: 1100px) { .wl-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
        @media (max-width: 720px)  { .wl-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; padding: 14px 12px; } }

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
          min-width: 0;
        }
        @media (hover: hover) {
          .wl-card:hover { transform: translateY(-3px); box-shadow: 0 8px 28px rgba(61,74,34,.13); }
          .wl-card:hover .wl-img { transform: scale(1.04); }
        }

        .wl-img-wrap { position: relative; aspect-ratio: 4 / 5; background: var(--beige-dk); overflow: hidden; flex-shrink: 0; }
        .wl-img { width: 100%; height: 100%; object-fit: cover; object-position: center top; display: block; transition: transform .5s cubic-bezier(.25,.46,.45,.94); }

        .wl-remove {
          position: absolute; top: 8px; right: 8px; z-index: 3;
          width: 28px; height: 28px; border-radius: 2px;
          background: rgba(255,255,255,.9);
          border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; line-height: 1; color: var(--ink);
          transition: background .18s, color .18s;
          backdrop-filter: blur(4px);
        }
        .wl-remove:hover { background: var(--red); color: white; }

        .wl-badge { position: absolute; top: 8px; left: 8px; font-size: 8px; font-weight: 600; letter-spacing: .1em; color: white; background: var(--olive); padding: 3px 8px; border-radius: 2px; }

        .wl-body { padding: 10px 12px 13px; display: flex; flex-direction: column; gap: 4px; flex: 1; min-width: 0; }

        /* Name: wraps to two lines, never cut with "…" */
        .wl-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 17px; font-weight: 700;
          color: var(--ink); line-height: 1.25;
          white-space: normal;
          overflow-wrap: anywhere;
          // min-height: 2.5em;            /* reserves two lines so all cards line up */
        }

        .wl-price-row { display: flex; align-items: baseline; flex-wrap: wrap; gap: 4px 7px; }
        .wl-price { font-size: 14px; font-weight: 600; color: var(--ink); }
        .wl-original { font-size: 11px; color: var(--mist); text-decoration: line-through; }
        .wl-saving { font-size: 10px; font-weight: 600; color: var(--olive-md); }

        .wl-btn-cart {
          display: flex; align-items: center; justify-content: center; gap: 6px;
          margin-top: 0;
          padding: 9px 0; width: 100%;
          border: 1.5px solid var(--olive);
          background: transparent; color: var(--olive);
          font-family: 'Jost', sans-serif;
          font-size: 10px; font-weight: 600;
          letter-spacing: .12em; text-transform: uppercase;
          border-radius: 3px; cursor: pointer;
          transition: background .2s, color .2s;
        }
        .wl-body > .wl-price-row { margin-top: auto; margin-bottom: 8px; }
        .wl-btn-cart:hover { background: var(--olive); color: white; }

        .wl-empty { text-align: center; padding: 80px 24px; }
        .wl-empty-icon { font-family: 'Cormorant Garamond', serif; font-size: 64px; font-style: italic; color: rgba(61,74,34,.12); display: block; margin-bottom: 12px; }
        .wl-empty-text { font-size: 13px; color: var(--mist); letter-spacing: .12em; text-transform: uppercase; margin-bottom: 20px; }
        .wl-empty-link { display: inline-block; font-size: 10px; font-weight: 600; letter-spacing: .2em; text-transform: uppercase; color: white; background: var(--olive); padding: 12px 28px; border-radius: 3px; text-decoration: none; transition: background .2s; }
        .wl-empty-link:hover { background: var(--olive-md); }

        @media (max-width: 479px) {
          .wl-header { padding: 28px 16px 18px; }
          .wl-title  { font-size: 1.9rem; }
          .wl-body   { padding: 8px 9px 10px; gap: 3px; }
          .wl-name   { font-size: 15px; }
          .wl-price  { font-size: 13px; }
          .wl-btn-cart { font-size: 9px; padding: 8px 0; }
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
            {items.map(item => (
              <ProductCard
                key={item.id}
                product={{
                  id: item.id,
                  name: item.name,
                  category: item.category,
                  price: item.price,
                  originalPrice: item.originalPrice ?? null,
                  badge: item.badge ?? null,
                  images: [item.image],
                  mainImage: item.image,
                  colors: item.colors ?? [],
                  href: item.href,
                  rating: item.rating,
                  reviewCount: item.reviewCount,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}