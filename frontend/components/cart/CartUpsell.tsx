'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useCart, type CartItem } from '@/lib/cartContext';
import { cdnImage } from '@/lib/cdn';
import type { CatalogProduct } from '@/lib/catalogApi';

const rupee = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

/** "You may also like": more from the same collection and category as the cart. */
export default function CartUpsell({ items, products, onNavigate, quiet }: { items: CartItem[]; products: CatalogProduct[]; onNavigate: () => void; quiet?: boolean }) {
  // quiet: used on the full cart page, where adding should not pop the mini cart open
  const { addItem } = useCart();
  const [added, setAdded] = useState<Record<string, boolean>>({});

  const list = useMemo(() => {
    const inCart = new Set(items.flatMap((i) => [String(i.id), String(i.sourceId ?? i.id)]));
    const cartProducts = products.filter((p) => inCart.has(String(p.id)) || inCart.has(String(p.sourceId)));
    const subs = new Set(cartProducts.map((p) => p.subCategoryId).filter(Boolean));
    const cats = new Set(cartProducts.map((p) => p.categoryId).filter(Boolean));
    const genders = new Set(cartProducts.map((p) => p.gender).filter(Boolean));
    const pool = products.filter((p) =>
      !inCart.has(String(p.id)) && !inCart.has(String(p.sourceId)) && (p.stock ?? 1) > 0 &&
      (genders.size === 0 || genders.has(p.gender) || p.gender === 'unisex'));
    // Same collection as what's in the cart first, then the same category, then the rest.
    const sameSub = pool.filter((p) => p.subCategoryId && subs.has(p.subCategoryId));
    const sameCat = pool.filter((p) => p.categoryId && cats.has(p.categoryId) && !sameSub.includes(p));
    const rest = pool.filter((p) => !sameSub.includes(p) && !sameCat.includes(p));
    return [...sameSub, ...sameCat, ...rest].slice(0, 8);
  }, [items, products]);

  if (list.length === 0) return null;

  const needsOptions = (p: CatalogProduct) =>
    Boolean(p.allowCustomization) || (p.sizes?.length ?? 0) > 0 || Boolean(p.perCharmPrice && p.perCharmPrice > 0);

  const quickAdd = (p: CatalogProduct) => {
    const img = p.mainImage || p.images?.[0] || '';
    addItem({
      id: String(p.id), sourceId: p.sourceId ?? String(p.id), name: p.name, price: p.price, originalPrice: p.originalPrice ?? null,
      image: img, color: p.colors?.[0]?.label ?? 'Default', colorHex: p.colors?.[0]?.hex ?? '#000000',
      sku: p.sku ?? `SKU-${p.id}`, href: p.href ?? '', category: p.category, categoryId: p.categoryId,
      subCategoryId: p.subCategoryId, styleId: p.styleId,
    } as Omit<CartItem, 'qty'>, !quiet);
    setAdded((a) => ({ ...a, [p.sourceId]: true }));
  };

  return (
    <section className="cu" aria-label="You may also like">
      <div className="cu-head">
        <h3 className="cu-title">You may <em>also like</em></h3>
        <p className="cu-sub">More from the same collection</p>
      </div>
      <div className="cu-row">
        {list.map((p) => {
          const img = p.mainImage || p.images?.[0];
          const href = p.href || `/products/${p.sourceId}`;
          const off = p.originalPrice && p.originalPrice > p.price ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0;
          return (
            <div key={p.sourceId} className="cu-card">
              <Link href={href} onClick={onNavigate} className="cu-img">
                {img && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={cdnImage(img, 320)} alt={p.name} loading="lazy" />
                )}
                {off > 0 && <span className="cu-off">{off}% off</span>}
              </Link>
              <div className="cu-info">
                <Link href={href} onClick={onNavigate} className="cu-name">{p.name}</Link>
                <div className="cu-price"><b>{rupee(p.price)}</b>{off > 0 && p.originalPrice ? <s>{rupee(p.originalPrice)}</s> : null}</div>
              </div>
              {needsOptions(p)
                ? <Link href={href} onClick={onNavigate} className="cu-btn">Select options</Link>
                : <button type="button" className={`cu-btn${added[p.sourceId] ? ' is-on' : ''}`} onClick={() => quickAdd(p)} disabled={added[p.sourceId]}>
                    {added[p.sourceId] ? 'Added ✓' : '+ Add'}
                  </button>}
            </div>
          );
        })}
      </div>
    </section>
  );
}
