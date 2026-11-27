'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useGender } from '@/lib/genderContext';
import ProductsPage from '@/components/product/ProductPage';
import { fetchCatalogProducts, fetchCatalogSubCategories, peekCatalogProducts, type CatalogProduct } from '@/lib/catalogApi';
import { readPlpSnapshot } from '@/lib/usePlpRestore';
import { cdnImage } from '@/lib/cdn';
import { CircleRowSkeleton } from '@/components/home/Skeletons';
import styles from './SubCategorySection.module.css';

const STYLE_KEY = 'mus_sub:';

interface StyleCircle { name: string; key: string; img: string }

/** Turns each product's first two tags into "browse by style" circles, most common first. */
function buildCircles(products: CatalogProduct[]): StyleCircle[] {
  const map = new Map<string, { name: string; count: number; img: string }>();
  products.forEach((product) => {
    (product.tags || []).slice(0, 2).forEach((tag) => {
      const raw = tag.trim();
      if (!raw) return;
      const key = raw.toLowerCase();
      const prev = map.get(key);
      map.set(key, { name: prev?.name || raw, count: (prev?.count || 0) + 1, img: prev?.img || product.mainImage || product.images[0] });
    });
  });
  return Array.from(map.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10)
    .map(([key, v]) => ({ key, name: v.name.replace(/\b\w/g, (c) => c.toUpperCase()), img: v.img }));
}

export default function SubcategoryPage({ type = 'necklace' }: { type?: string }) {
  const resolvedType = (type || 'necklace').toLowerCase();
  const { gender } = useGender();
  // Coming Back from a product, the list is already in memory: show it at once (no skeleton, no cards fading
  // in again a few seconds later) and quietly refresh in the background.
  const [cached] = useState(() => peekCatalogProducts({ subCategorySlug: resolvedType }));
  const [products, setProducts] = useState<CatalogProduct[]>(cached ?? []);
  const [circles, setCircles] = useState<StyleCircle[]>(() => (cached ? buildCircles(cached) : []));
  const [loading, setLoading] = useState(!cached);
  // The style circle the shopper had picked is restored too (only when coming Back, never on a fresh visit).
  const [activeStyle, setActiveStyle] = useState<string | null>(() => {
    if (!readPlpSnapshot()) return null;
    try { return sessionStorage.getItem(STYLE_KEY + location.pathname) || null; } catch { return null; }
  });
  useEffect(() => {
    try {
      if (activeStyle) sessionStorage.setItem(STYLE_KEY + location.pathname, activeStyle);
      else sessionStorage.removeItem(STYLE_KEY + location.pathname);
    } catch { /* private mode */ }
  }, [activeStyle]);

  const label = resolvedType.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const words = label.split(' ');
  const lead = words.length > 1 ? words.slice(0, -1).join(' ') : '';
  const last = words[words.length - 1];

  const firstType = useRef(resolvedType);
  useEffect(() => {
    if (firstType.current === resolvedType) return;
    firstType.current = resolvedType;
    setActiveStyle(null);
  }, [resolvedType]);

  useEffect(() => {
    let live = true;
    const quiet = !!cached && resolvedType === firstType.current && products.length > 0;
    if (!quiet) setLoading(true);
    fetchCatalogProducts({ subCategorySlug: resolvedType })
      .then((rows) => {
        if (!live) return;
        // Same pieces as on screen: keep the current list so nothing re-renders or re-animates.
        setProducts((prev) => (prev.length === rows.length && prev.every((p, i) => p.id === rows[i].id) ? prev : rows));
        setCircles((prev) => (quiet && prev.length ? prev : buildCircles(rows)));
      })
      .catch(() => { if (live && !quiet) { setProducts([]); setCircles([]); } })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedType]);

  const [headerText, setHeaderText] = useState<{ eyebrow: string; caption: string; ready: boolean }>({
    eyebrow: '',
    caption: 'Handcrafted pieces, curated fresh from our latest collection.',
    ready: false,
  });

  useEffect(() => {
    let live = true;
    fetchCatalogSubCategories()
      .then((subs) => {
        if (!live) return;
        const found = subs.find((s) => s.slug === resolvedType);
        setHeaderText({
          eyebrow: found?.eyebrow ?? '',
          caption: found?.caption ?? 'Handcrafted pieces, curated fresh from our latest collection.',
          ready: true,
        });
      })
      .catch(() => { if (live) setHeaderText((prev) => ({ ...prev, ready: true })); });
    return () => { live = false; };
  }, [resolvedType]);

  const allImg = products[0]?.mainImage || products[0]?.images?.[0];

  return (
    <div className={styles.page}>

      <header className={styles.header}>
        <nav className={styles.crumbs} aria-label="Breadcrumb">
          <Link href="/">Home</Link><span aria-hidden>›</span>
          <Link href={`/categories/${gender || 'women'}/jewellery`}>Jewellery</Link><span aria-hidden>›</span>
          <span aria-current="page">{label}</span>
        </nav>
        {headerText.eyebrow && (
          <span className={styles.eyebrow}>{headerText.eyebrow}</span>
        )}
        <h1 className={styles.title}>{lead && <>{lead} </>}<em>{last}</em></h1>
        {(headerText.caption || !headerText.ready) && (
          <p className={styles.desc} style={{ visibility: headerText.ready ? 'visible' : 'hidden' }}>
            {headerText.caption || '\u00A0'}
          </p>
        )}
      </header>

      {(loading || circles.length > 0) && (
        <section className={styles.circlesWrap} aria-label="Browse by style">
          <div className={styles.circles}>
            {loading ? (
              <CircleRowSkeleton count={7} />
            ) : (
              <>
                <CircleButton name="All" img={allImg} active={!activeStyle} onClick={() => setActiveStyle(null)} />
                {circles.map((c) => (
                  <CircleButton key={c.key} name={c.name} img={c.img} active={activeStyle === c.key}
                    onClick={() => setActiveStyle((prev) => (prev === c.key ? null : c.key))} />
                ))}
              </>
            )}
          </div>
        </section>
      )}

      <ProductsPage
        type={resolvedType}
        subtype={activeStyle ?? undefined}
        embedded
        products={products}
        loading={loading}
        instant={!!cached}
        productLinkBase={resolvedType === 'charm-jewellery' || resolvedType === 'custom-charm-jewellery' ? '/custom-charm' : '/products'}
      />

    </div>
  );
}

function CircleButton({ name, img, active, onClick }: { name: string; img?: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" className={`${styles.circle}${active ? ` ${styles.circleOn}` : ''}`} onClick={onClick} aria-pressed={active}>
      <span className={styles.ring}>
        {img ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={cdnImage(img, 320)} alt="" loading="lazy" width={120} height={120} /> : null}
      </span>
      <span className={styles.label}>{name}</span>
    </button>
  );
}
