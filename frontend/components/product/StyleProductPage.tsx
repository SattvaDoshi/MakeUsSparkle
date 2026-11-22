'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { FILTER_TABS } from '@/lib/products';
import { fetchCatalogProducts, fetchCatalogStyles, slugifyCatalog, type CatalogProduct } from '@/lib/catalogApi';
import SortFilter, { sortProducts, type SortOption } from '@/components/ui/SortFilter';
import ProductCard from '@/components/product/ProductCard';
import { STYLE_LABELS } from '@/lib/styleLabels';
import styles from './ProductListing.module.css';

type Product = CatalogProduct;
const PAGE = 16;

const DEFAULT_LABEL = { name: 'Collection', eyebrow: 'Curated For You', caption: '' };
const ALL_STYLE_IDS = Object.keys(STYLE_LABELS);

function resolveStyleId(raw: string | undefined | null): string {
  if (!raw) return 'soft-girl';
  if (ALL_STYLE_IDS.includes(raw)) return raw;
  const kebab = raw
    .replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
    .replace(/[\s_]+/g, '-').replace(/-+/g, '-').trim();
  if (ALL_STYLE_IDS.includes(kebab)) return kebab;
  const lower = raw.toLowerCase();
  const match = ALL_STYLE_IDS.find(id => id.split('-').every(w => lower.includes(w)));
  return match ?? kebab;
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function StyleProductPage({ styleId = 'soft-girl' }: { styleId?: string }) {
  const sid = resolveStyleId(styleId);
  const [label, setLabel] = useState(STYLE_LABELS[sid] ?? DEFAULT_LABEL);
  // Hold back the eyebrow/caption until the admin-set text has loaded so old text never flashes first.
  const [labelReady, setLabelReady] = useState(false);
  const [sort, setSort] = useState<SortOption>('default');
  const [filter, setFilter] = useState('all');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(PAGE);
  const sentinel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLabel(STYLE_LABELS[sid] ?? DEFAULT_LABEL);
    setLabelReady(false);
    let active = true;
    fetchCatalogStyles().then((list) => {
      if (!active) return;
      const found = list.find((s: any) => String(s.slug || slugifyCatalog(s.name)).toLowerCase() === sid);
      if (found) {
        // Admin-set text always wins (even if blank on purpose); built-in text only fills what was never set.
        setLabel({
          name: found.name,
          eyebrow: found.eyebrow ?? STYLE_LABELS[sid]?.eyebrow ?? 'Curated For You',
          caption: found.caption ?? STYLE_LABELS[sid]?.caption ?? 'Handpicked from our catalog.',
        });
      }
      setLabelReady(true);
    }).catch(() => { if (active) setLabelReady(true); });
    return () => { active = false; };
  }, [sid]);

  useEffect(() => {
    let active = true;
    fetchCatalogProducts()
      .then((p) => { if (active) { setAllProducts(p); setLoading(false); } })
      .catch(() => { if (active) { setAllProducts([]); setLoading(false); } });
    return () => { active = false; };
  }, []);

  const allStyle = useMemo(() => allProducts.filter((product) => {
    const styleSlug = 'styleSlug' in product ? (product as any).styleSlug : '';
    const styleName = 'style' in product ? (product as any).style : '';
    return styleSlug === sid || slugifyCatalog(styleName || '') === sid;
  }), [allProducts, sid]);

  const products = useMemo(() => {
    let list = [...allStyle];
    if (filter !== 'all') list = list.filter((p) => p.type === filter);
    return sortProducts(list, sort);
  }, [allStyle, filter, sort]);

  useEffect(() => { setVisible(PAGE); }, [sid, filter, sort]);

  const total = products.length;
  const shown = products.slice(0, visible);
  const hasMore = visible < total;

  useEffect(() => {
    const el = sentinel.current;
    if (!el || !hasMore) return;
    const io = new IntersectionObserver(
      (e) => { if (e[0].isIntersecting) setVisible((c) => Math.min(c + PAGE, total)); },
      { rootMargin: '900px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, total, visible]);

  const count = (type: string) => (type === 'all' ? allStyle.length : allStyle.filter((p) => p.type === type).length);
  const words = label.name.split(' ');

  return (
    <div className={styles.root}>
      <header className={styles.pageHeader}>
        <span className={styles.eyebrow} style={{ visibility: labelReady ? 'visible' : 'hidden' }}>{label.eyebrow || '\u00A0'}</span>
        <h1 className={styles.pageTitle}>
          {words.length > 1 ? <>{words.slice(0, -1).join(' ')} <em>{words[words.length - 1]}</em></> : <em>{label.name}</em>}
        </h1>
        {(label.caption || !labelReady) && <p style={{ margin: 0, color: '#6f6f64', fontSize: 15, visibility: labelReady ? 'visible' : 'hidden', minHeight: '1.4em' }}>{label.caption || '\u00A0'}</p>}
      </header>

      <div className={styles.toolbar}>
        <div className={styles.pills} role="tablist" aria-label="Filter pieces">
          {FILTER_TABS.map((tab) => (
            <button key={tab.value} type="button" role="tab" aria-selected={filter === tab.value}
              className={`${styles.pill}${filter === tab.value ? ` ${styles.pillOn}` : ''}`}
              onClick={() => setFilter(tab.value)}>
              {tab.label}
            </button>
          ))}
        </div>
        <div className={styles.toolbarRight}>
          <span className={styles.count} aria-live="polite">{loading ? 'Loading…' : `${total} ${total === 1 ? 'piece' : 'pieces'}`}</span>
          <SortFilter value={sort} onChange={setSort} variant="olive" />
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.grid}>
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={styles.skel} aria-hidden="true">
                <div className={styles.skelImg} />
                <div className={styles.skelLine} style={{ width: '40%' }} />
                <div className={styles.skelLine} style={{ width: '85%' }} />
                <div className={styles.skelLine} style={{ width: '30%' }} />
              </div>
            ))
          ) : total === 0 ? (
            <div className={styles.empty}>
              <h3>Nothing here yet</h3>
              <p>{filter !== 'all' ? 'No pieces match this filter.' : 'New pieces are on the way.'}</p>
              {filter !== 'all' && <button type="button" className={styles.emptyBtn} onClick={() => setFilter('all')}>Show all pieces</button>}
            </div>
          ) : (
            shown.map((product, i) => (
              <div key={product.id} className={styles.item} style={{ animationDelay: `${Math.min((i % PAGE) * 0.035, 0.4)}s` }}>
                <ProductCard product={product} />
              </div>
            ))
          )}
        </div>
        {!loading && hasMore && <div ref={sentinel} className={styles.more} aria-hidden="true"><span className={styles.spinner} /></div>}
        {!loading && !hasMore && total > PAGE && <p className={styles.end}>You&apos;ve seen all {total} pieces</p>}
      </div>
    </div>
  );
}
