'use client';

import { useEffect, useMemo, useState } from 'react';
import { fetchProductsByIds, type CatalogProduct } from '@/lib/catalogApi';
import type { CartItem } from '@/lib/cartContext';

const norm = (v: unknown) => String(v ?? '').trim().toLowerCase();

/** Same idea as the server (pricing.service.js): the tighter of the matching variant and the product total. */
function availableFor(p: CatalogProduct, item: CartItem): { available: number; key: string } | null {
  const limits: number[] = [];
  let variantKey = 'base';
  const variants = p.variants || [];
  if (variants.length && (item.size || item.color)) {
    const color = norm(item.color), size = norm(item.size);
    const v = variants.find((x) => (!size || norm(x.size) === size) && (!color || color === 'default' || norm(x.color) === color));
    if (!v) return null; // can't tell which variant this is: don't guess, the server still checks at checkout
    if (typeof v.stock === 'number' && !Number.isNaN(v.stock)) limits.push(v.stock);
    variantKey = `${norm(v.color)}/${norm(v.size)}`;
  }
  if (typeof p.stock === 'number' && !Number.isNaN(p.stock)) limits.push(p.stock);
  if (!limits.length) return null;
  return { available: Math.max(0, Math.min(...limits)), key: `${p.sourceId}|${variantKey}` };
}

/**
 * Cart lines that can't be bought as they are (sold out, or more than is left), keyed by line id.
 * Bundles / sets / charm builders are skipped here — the server checks those when the order is placed.
 */
export function useCartStockIssues(items: CartItem[]): Record<string, string> {
  const [products, setProducts] = useState<Record<string, CatalogProduct>>({});

  const idsKey = useMemo(
    () => [...new Set(items.filter((i) => !i.selectionGroups?.length).map((i) => String(i.sourceId ?? i.id)))].sort().join('|'),
    [items],
  );

  useEffect(() => {
    if (!idsKey) { setProducts({}); return; }
    let live = true;
    fetchProductsByIds(idsKey.split('|'))
      .then((list) => { if (live) setProducts(Object.fromEntries(list.map((p) => [p.sourceId, p]))); })
      .catch(() => {}); // can't reach the catalogue: say nothing, the server still checks
    return () => { live = false; };
  }, [idsKey]);

  return useMemo(() => {
    const out: Record<string, string> = {};
    const used = new Map<string, number>();
    for (const item of items) {
      if (item.selectionGroups?.length) continue;
      const p = products[String(item.sourceId ?? item.id)];
      if (!p) continue;
      const a = availableFor(p, item);
      if (!a) continue;
      const wanted = (used.get(a.key) || 0) + item.qty;
      used.set(a.key, wanted);
      const id = item.cartItemId ?? item.id;
      if (a.available <= 0) out[id] = 'Out of stock — remove it to continue';
      else if (wanted > a.available) out[id] = `Only ${a.available} left — lower the quantity to continue`;
    }
    return out;
  }, [items, products]);
}
