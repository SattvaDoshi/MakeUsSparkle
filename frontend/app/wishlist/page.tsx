'use client';

import { useWishlist } from '@/lib/wishlistContext';
import { useCart } from '@/lib/cartContext';
import Link from 'next/link';

export default function WishlistPage() {
  const { items, removeItem } = useWishlist();
  const { addItem } = useCart();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@300;400;500;600&display=swap');
        :root {
          --beige: #f5f0e8; --beige-dk: #ede5d5;
          --olive: #3d4a22; --olive-md: #5a6b2e;
          --gold: #c9a84c; --ink: #1e2310;
          --mist: rgba(30,35,16,.45); --red: #c0392b;
        }
        .wl-page { min-height: 100vh; background: var(--beige); font-family: 'Jost', sans-serif; color: var(--ink); padding-bottom: 80px; }
        .wl-header { padding: 40px 24px 24px; border-bottom: 1px solid rgba(61,74,34,.1); }
        .wl-eyebrow { font-size: 9px; letter-spacing: .5em; text-transform: uppercase; color: var(--gold); margin-bottom: 8px; }
        .wl-title { font-family: 'Cormorant Garamond', serif; font-size: 2.4rem; font-weight: 300; color: var(--olive); }
        .wl-title em { font-style: italic; color: var(--gold); }
        .wl-count { font-size: 11px; color: var(--mist); margin-top: 6px; letter-spacing: .1em; }
        .wl-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 20px; padding: 28px 24px; }
        .wl-card { background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 12px rgba(61,74,34,.07); transition: transform .3s, box-shadow .3s; }
        .wl-card:hover { transform: translateY(-4px); box-shadow: 0 12px 36px rgba(61,74,34,.14); }
        .wl-img-wrap { position: relative; aspect-ratio: 1; background: var(--beige-dk); overflow: hidden; }
        .wl-img { width: 100%; height: 100%; object-fit: cover; }
        .wl-remove { position: absolute; top: 10px; right: 10px; width: 30px; height: 30px; border-radius: 50%; background: rgba(255,255,255,.9); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px; transition: background .2s; }
        .wl-remove:hover { background: var(--red); color: white; }
        .wl-badge { position: absolute; top: 10px; left: 10px; font-size: 8.5px; font-weight: 600; letter-spacing: .1em; color: white; background: var(--olive); padding: 3px 9px; border-radius: 4px; }
        .wl-body { padding: 14px 16px 16px; }
        .wl-cat { font-size: 9px; letter-spacing: .35em; text-transform: uppercase; color: var(--gold); margin-bottom: 4px; }
        .wl-name { font-family: 'Cormorant Garamond', serif; font-size: 17px; font-weight: 400; color: var(--ink); margin-bottom: 4px; line-height: 1.2; }
        .wl-price-row { display: flex; align-items: baseline; gap: 8px; margin-bottom: 12px; }
        .wl-price { font-size: 16px; font-weight: 600; color: var(--ink); }
        .wl-original { font-size: 12px; color: var(--mist); text-decoration: line-through; }
        .wl-colors { display: flex; gap: 5px; margin-bottom: 14px; }
        .wl-dot { width: 12px; height: 12px; border-radius: 50%; border: 1.5px solid rgba(0,0,0,.1); }
        .wl-btn-row { display: grid; grid-template-columns: 1fr 1.4fr; gap: 8px; }
        .wl-btn-view { display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 500; letter-spacing: .1em; text-transform: uppercase; color: var(--olive); background: var(--beige); border: 1.5px solid rgba(61,74,34,.18); border-radius: 50px; padding: 10px; text-decoration: none; transition: all .2s; }
        .wl-btn-view:hover { border-color: var(--olive); background: white; }
        .wl-btn-cart { display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 10px; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; color: white; background: var(--ink); border: none; border-radius: 50px; padding: 10px 14px; cursor: pointer; transition: background .2s; }
        .wl-btn-cart:hover { background: var(--olive); }
        .wl-empty { text-align: center; padding: 80px 24px; }
        .wl-empty-icon { font-family: 'Cormorant Garamond', serif; font-size: 64px; font-style: italic; color: rgba(61,74,34,.12); display: block; margin-bottom: 12px; }
        .wl-empty-text { font-size: 13px; color: var(--mist); letter-spacing: .12em; text-transform: uppercase; margin-bottom: 20px; }
        .wl-empty-link { display: inline-block; font-size: 10px; font-weight: 600; letter-spacing: .2em; text-transform: uppercase; color: white; background: var(--olive); padding: 12px 28px; border-radius: 50px; text-decoration: none; transition: background .2s; }
        .wl-empty-link:hover { background: var(--olive-md); }
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
              <div key={item.id} className="wl-card">
                <div className="wl-img-wrap">
                  <img src={item.image} alt={item.name} className="wl-img" />
                  {item.badge && <span className="wl-badge">{item.badge}</span>}
                  <button
                    className="wl-remove"
                    onClick={() => removeItem(item.id)}
                    aria-label="Remove from wishlist"
                  >
                    ×
                  </button>
                </div>
                <div className="wl-body">
                  <div className="wl-cat">{item.category}</div>
                  <div className="wl-name">{item.name}</div>
                  <div className="wl-price-row">
                    <span className="wl-price">₹{item.price.toLocaleString('en-IN')}</span>
                    {item.originalPrice && (
                      <span className="wl-original">₹{item.originalPrice.toLocaleString('en-IN')}</span>
                    )}
                  </div>
                  <div className="wl-colors">
                    {item.colors.slice(0, 4).map((c, i) => (
                      <span key={i} className="wl-dot" style={{ background: c.hex }} title={c.label} />
                    ))}
                  </div>
                  <div className="wl-btn-row">
                    <Link href={item.href} className="wl-btn-view">View</Link>
                    <button
                      className="wl-btn-cart"
                      onClick={() => addItem({
                        id: String(item.id),
                        sourceId: item.sourceId,
                        name: item.name,
                        price: item.price,
                        originalPrice: item.originalPrice ?? null,
                        image: item.image,
                        color: item.colors[0]?.label ?? '',
                        colorHex: item.colors[0]?.hex ?? '',
                        sku: `SKU-${item.id}`,
                        href: item.href,
                      })}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                        <line x1="3" y1="6" x2="21" y2="6"/>
                        <path d="M16 10a4 4 0 0 1-8 0"/>
                      </svg>
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}