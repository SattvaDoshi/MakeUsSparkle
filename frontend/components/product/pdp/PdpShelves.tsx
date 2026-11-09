'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/product/ProductCard';
import { fetchCatalogCategories, fetchCatalogProducts, type CatalogCategory, type CatalogProduct } from '@/lib/catalogApi';
import { cdnImage } from '@/lib/cdn';
import styles from './pdp.module.css';

const KEY = 'mus_recent_products';
const DIRECT_SLUGS = new Set(['keychains', 'charm-jewellery', 'custom-charm-jewellery']);

function readRecent(): string[] {
  try { const v = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(v) ? v.map(String) : []; } catch { return []; }
}

function Shelf({ eyebrow, title, em, children, href, linkLabel }: { eyebrow: string; title: string; em: string; children: React.ReactNode; href?: string; linkLabel?: string }) {
  return (
    <section className={`${styles.wrap} ${styles.shelf}`}>
      <div className={styles.shelfHead}>
        <div>
          <span className={styles.shelfEyebrow}>{eyebrow}</span>
          <h2 className={styles.shelfTitle}>{title} <em>{em}</em></h2>
        </div>
        {href && <Link href={href} className={styles.shelfLink}>{linkLabel || 'View all'}</Link>}
      </div>
      {children}
    </section>
  );
}

/** "You may also like", "Shop by category" and "Recently viewed" — shown under the product. */
export default function PdpShelves({ product }: { product: CatalogProduct }) {
  const [all, setAll] = useState<CatalogProduct[]>([]);
  const [cats, setCats] = useState<CatalogCategory[]>([]);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const me = String(product.sourceId);

  useEffect(() => {
    let live = true;
    fetchCatalogProducts().then((p) => live && setAll(p)).catch(() => {});
    fetchCatalogCategories().then((c) => live && setCats(c)).catch(() => {});
    return () => { live = false; };
  }, []);

  // Read what the shopper saw before this piece, then add this piece to the list.
  useEffect(() => {
    const prev = readRecent();
    setRecentIds(prev.filter((id) => id !== me));
    try { localStorage.setItem(KEY, JSON.stringify([me, ...prev.filter((id) => id !== me)].slice(0, 12))); } catch {}
  }, [me]);

  const similar = useMemo(() => {
    const others = all.filter((p) => String(p.sourceId) !== me);
    const sameSub = others.filter((p) => product.subCategoryId && p.subCategoryId === product.subCategoryId);
    const sameCat = others.filter((p) => product.categoryId && p.categoryId === product.categoryId && !sameSub.includes(p));
    const rest = others.filter((p) => !sameSub.includes(p) && !sameCat.includes(p));
    return [...sameSub, ...sameCat, ...rest].slice(0, 12);
  }, [all, me, product.subCategoryId, product.categoryId]);

  const recent = useMemo(() => {
    const byId = new Map(all.map((p) => [String(p.sourceId), p]));
    return recentIds.map((id) => byId.get(id)).filter(Boolean).slice(0, 10) as CatalogProduct[];
  }, [all, recentIds]);

  const g = (product.gender || '').toLowerCase();
  const shopCats = useMemo(() => {
    const want = ['women', 'men', 'kids'].includes(g) ? g : '';
    const list = cats.filter((c) => !want || !c.genderSlug || c.genderSlug === want);
    return (list.length ? list : cats).slice(0, 14);
  }, [cats, g]);

  return (
    <>
      {similar.length > 0 && (
        <Shelf eyebrow="Handpicked for you" title="You may" em="also like" href="/categories" linkLabel="Shop all">
          <div className={styles.grid4}>
            {similar.map((p) => <div key={p.sourceId} className={styles.gridItem}><ProductCard product={p} /></div>)}
          </div>
        </Shelf>
      )}

      {shopCats.length > 0 && (
        <Shelf eyebrow="Explore" title="Shop by" em="category" href="/categories" linkLabel="All categories">
          <div className={styles.cats}>
            {shopCats.map((c) => (
              <Link key={c.id} className={styles.cat}
                href={DIRECT_SLUGS.has(c.slug) ? `/subcategory/${c.slug}` : `/categories/${c.genderSlug || (['women', 'men', 'kids'].includes(g) ? g : 'women')}/${c.slug}`}>
                {c.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className={styles.catImg} src={cdnImage(c.image, 240)} alt="" loading="lazy" />
                ) : (
                  <span className={`${styles.catImg} ${styles.catFallback}`} aria-hidden="true">{c.name.slice(0, 1)}</span>
                )}
                <span className={styles.catName}>{c.name}</span>
              </Link>
            ))}
          </div>
        </Shelf>
      )}

      {recent.length > 0 && (
        <Shelf eyebrow="Pick up where you left off" title="Recently" em="viewed">
          <div className={styles.row}>
            {recent.map((p) => <div key={p.sourceId} className={styles.rowItem}><ProductCard product={p} /></div>)}
          </div>
        </Shelf>
      )}
    </>
  );
}
