'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { STYLE_THEMES } from '@/lib/styleThemes';
import { fetchCatalogProducts, fetchCatalogStyles, slugifyCatalog } from '@/lib/catalogApi';
import { cdnImage } from '@/lib/cdn';
import css from './styles.module.css';

type ThemeId = keyof typeof STYLE_THEMES;
type StyleCard = (typeof STYLE_THEMES)[ThemeId] & { id: string; image?: string };

const FALLBACK_THEME = STYLE_THEMES['soft-girl'];
const getThemeBySlug = (slug: string) => STYLE_THEMES[slug as ThemeId] || FALLBACK_THEME;

export default function ShopByStylePage() {
  const [styles, setStyles] = useState<StyleCard[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let live = true;
    Promise.all([fetchCatalogStyles(), fetchCatalogProducts()])
      .then(([fromApi, products]) => {
        if (!live) return;
        const c: Record<string, number> = {};
        products.forEach((p) => { if (p.styleSlug) c[p.styleSlug] = (c[p.styleSlug] || 0) + 1; });
        setCounts(c);
        setStyles(fromApi.map((s) => {
          const slug = s.slug || slugifyCatalog(s.name);
          return { ...getThemeBySlug(slug), id: slug, name: s.name, image: s.image || undefined };
        }));
      })
      .catch(() => { if (live) { setStyles([]); setCounts({}); } })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, []);

  return (
    <>
      <main className={css.page}>
        <div className={`${css.inner} ${css.hero}`}>
          <span className={css.eyebrow}>Curated collections</span>
          <h1 className={css.title}>Shop by <em>Your</em> Style</h1>
          <p className={css.sub}>
            {styles.length > 0 ? `${styles.length} distinct` : 'Distinct'} worlds of jewellery — each piece chosen to match your mood, your moment, your magic.
          </p>
        </div>

        <div className={`${css.inner} ${css.grid}`}>
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <div key={i} className={`${css.skel} ${css.skelCard}`} aria-hidden="true" />)
          ) : styles.length === 0 ? (
            <p className={css.empty}>Styles are coming soon.</p>
          ) : (
            styles.map((s, i) => {
              const n = counts[s.id] || 0;
              return (
                <Link key={s.id} href={`/styles/${s.id}`} className={css.card} style={{ animationDelay: `${Math.min(i * 0.07, 0.5)}s`, background: s.image ? undefined : s.bgAlt }}>
                  {s.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className={css.photo} src={cdnImage(s.image, 720)} alt="" loading={i < 3 ? 'eager' : 'lazy'} />
                  )}
                  <span className={css.chips}>
                    {s.tag ? <span className={css.chip}>{s.tag}</span> : <span />}
                    <span className={`${css.chip} ${css.chipDark}`}>{n} {n === 1 ? 'piece' : 'pieces'}</span>
                  </span>
                  <span className={css.body}>
                    <span className={css.text}>
                      <span className={css.name}>{s.name}</span>
                      {s.sub && <span className={css.line}>{s.sub}</span>}
                    </span>
                    <span className={css.arrow} aria-hidden="true">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7" /><polyline points="8 7 17 7 17 16" /></svg>
                    </span>
                  </span>
                </Link>
              );
            })
          )}
        </div>
      </main>
    </>
  );
}
