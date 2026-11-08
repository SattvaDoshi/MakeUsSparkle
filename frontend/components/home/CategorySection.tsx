'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useGender } from '@/lib/genderContext';
import { fetchCatalogCategories, fetchCatalogSubCategories } from '@/lib/catalogApi';
import { cdnImage } from '@/lib/cdn';
import styles from './CategorySection.module.css';

interface SubCategoryItem { name: string; img: string; href: string }
interface CategoryItem { id: string; name: string; img: string; href: string; sub: SubCategoryItem[] }

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80';
// These categories open their own product page instead of a list of sub-collections.
const DIRECT_SLUGS = new Set(['keychains', 'charm-jewellery', 'custom-charm-jewellery']);

const Arrow = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

/** Splits "Gift Boxes" into "Gift <em>Boxes</em>" to match the site's heading style. */
function Heading({ name }: { name: string }) {
  const words = name.split(' ');
  return words.length > 1 ? <>{words.slice(0, -1).join(' ')} <em>{words[words.length - 1]}</em></> : <em>{name}</em>;
}

export default function CategorySection() {
  const { gender: selectedGender, setGender, genders } = useGender();
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [loading, setLoading] = useState(true);

  const genderTabs = useMemo(() => {
    const raw = genders.length > 0
      ? genders
      : [
          { id: 'women', name: 'Women', slug: 'women', isActive: true },
          { id: 'men', name: 'Men', slug: 'men', isActive: true },
          { id: 'kids', name: 'Kids', slug: 'kids', isActive: true },
        ];
    return [...raw].sort((a, b) => {
      const x = a.name.toLowerCase(), y = b.name.toLowerCase();
      if (x === 'women') return -1;
      if (y === 'women') return 1;
      return x.localeCompare(y);
    });
  }, [genders]);

  const tab = genderTabs.some((g) => g.slug === selectedGender) ? selectedGender : genderTabs[0]?.slug || 'women';

  useEffect(() => { if (tab !== selectedGender) setGender(tab); }, [selectedGender, setGender, tab]);

  useEffect(() => {
    let live = true;
    setLoading(true);
    Promise.all([fetchCatalogCategories(), fetchCatalogSubCategories()])
      .then(([cats, subs]) => {
        if (!live) return;
        const filtered = cats
          .filter((c) => !c.genderSlug || c.genderSlug === tab)
          .sort((l, r) => {
            const lj = l.name?.trim().toLowerCase() === 'jewellery';
            const rj = r.name?.trim().toLowerCase() === 'jewellery';
            return lj === rj ? 0 : lj ? -1 : 1;
          });
        const ids = new Set(filtered.map((c) => c.id));
        const byCat = new Map<string, SubCategoryItem[]>();
        subs.forEach((s) => {
          if (!s.categoryId || !ids.has(s.categoryId)) return;
          const list = byCat.get(s.categoryId) || [];
          list.push({ name: s.name, img: s.image || FALLBACK_IMAGE, href: `/subcategory/${s.slug}` });
          byCat.set(s.categoryId, list);
        });
        setCategories(filtered.map((c) => ({
          id: c.id,
          name: c.name,
          img: c.image || FALLBACK_IMAGE,
          href: DIRECT_SLUGS.has(c.slug) ? `/subcategory/${c.slug}` : `/categories/${tab}/${c.slug}`,
          sub: byCat.get(c.id) || [],
        })));
        setActiveIdx(0);
      })
      .catch(() => { if (live) { setCategories([]); setActiveIdx(0); } })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [tab]);

  const active = categories[activeIdx];

  return (
    <>
      <section className={styles.page} id="categories">
        <div className={`${styles.inner} ${styles.header}`}>
          <div className={styles.titleGroup}>
            <span className={styles.eyebrow}>Discover</span>
            <h1 className={styles.title}>Shop by <em>Category</em></h1>
            <p className={styles.sub}>Find your next favourite piece — browse every collection, handcrafted and ready to wear.</p>
          </div>
          <div className={styles.genders} role="tablist" aria-label="Shop for">
            {genderTabs.map((g) => (
              <button key={g.slug} type="button" role="tab" aria-selected={tab === g.slug}
                className={`${styles.gender}${tab === g.slug ? ` ${styles.genderOn}` : ''}`}
                onClick={() => { setGender(g.slug); setActiveIdx(0); }}>
                {g.name}
              </button>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className={styles.tabsWrap}>
          <div className={styles.tabs} role="tablist" aria-label="Categories">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <span key={i} className={`${styles.skel} ${styles.skelTab}`} aria-hidden="true" />)
              : categories.map((c, i) => {
                  const inner = (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img className={styles.thumb} src={cdnImage(c.img, 96)} alt="" width={44} height={44} loading="lazy" />
                      <span>{c.name}</span>
                      {c.sub.length > 0 && <span className={styles.count}>{c.sub.length}</span>}
                    </>
                  );
                  return c.sub.length === 0 ? (
                    <Link key={c.id} href={c.href} className={styles.tab}>{inner}</Link>
                  ) : (
                    <button key={c.id} type="button" role="tab" aria-selected={activeIdx === i}
                      className={`${styles.tab}${activeIdx === i ? ` ${styles.tabOn}` : ''}`}
                      onClick={() => setActiveIdx(i)}>
                      {inner}
                    </button>
                  );
                })}
          </div>
        </div>

        {/* Active category */}
        <div className={styles.inner}>
          {loading ? (
            <div className={styles.grid} style={{ paddingTop: 36 }} aria-hidden="true">
              {Array.from({ length: 8 }).map((_, i) => <div key={i} className={`${styles.skel} ${styles.skelCard}`} />)}
            </div>
          ) : !active ? (
            <div className={styles.grid}><p className={styles.empty}>No categories to show yet.</p></div>
          ) : (
            <>
              <div className={styles.panelHead}>
                <h2 className={styles.panelTitle}>
                  <Heading name={active.name} />
                  {active.sub.length > 0 && <span className={styles.panelMeta}>{active.sub.length} collections</span>}
                </h2>
                <Link href={active.href} className={styles.viewAll}>View all <Arrow size={12} /></Link>
              </div>

              <div className={styles.grid} key={active.id}>
                {active.sub.length > 0 ? (
                  active.sub.map((s, i) => (
                    <Link key={s.name} href={s.href} className={styles.card} style={{ animationDelay: `${Math.min(i * 0.05, 0.4)}s` }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={cdnImage(s.img, 560)} alt="" loading={i < 4 ? 'eager' : 'lazy'} />
                      <span className={styles.cardBody}>
                        <span className={styles.cardName}>{s.name}</span>
                        <span className={styles.arrow}><Arrow /></span>
                      </span>
                    </Link>
                  ))
                ) : (
                  <Link href={active.href} className={`${styles.card} ${styles.solo}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={cdnImage(active.img, 1200)} alt="" />
                    <span className={styles.cardBody}>
                      <span className={styles.cardName}>Shop {active.name}</span>
                      <span className={styles.arrow}><Arrow /></span>
                    </span>
                  </Link>
                )}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
