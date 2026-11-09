'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useGender } from '@/lib/genderContext';
import ProductsPage from '@/components/product/ProductPage';
import { fetchCatalogProducts, type CatalogProduct } from '@/lib/catalogApi';
import { cdnImage } from '@/lib/cdn';
import { CircleRowSkeleton } from '@/components/home/Skeletons';
import styles from './SubCategorySection.module.css';

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
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [circles, setCircles] = useState<StyleCircle[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStyle, setActiveStyle] = useState<string | null>(null);

  const label = resolvedType.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const words = label.split(' ');
  const lead = words.length > 1 ? words.slice(0, -1).join(' ') : '';
  const last = words[words.length - 1];

  useEffect(() => { setActiveStyle(null); }, [resolvedType]);

  useEffect(() => {
    let live = true;
    setLoading(true);
    fetchCatalogProducts({ subCategorySlug: resolvedType })
      .then((rows) => { if (live) { setProducts(rows); setCircles(buildCircles(rows)); } })
      .catch(() => { if (live) { setProducts([]); setCircles([]); } })
      .finally(() => { if (live) setLoading(false); });
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
        <h1 className={styles.title}>{lead && <>{lead} </>}<em>{last}</em></h1>
        <p className={styles.desc}>Handcrafted pieces, curated fresh from our latest collection.</p>
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
