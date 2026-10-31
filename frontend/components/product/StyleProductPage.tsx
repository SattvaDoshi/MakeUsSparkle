'use client';

import { useState, useMemo, useEffect, type MouseEvent } from 'react';
import { FILTER_TABS } from '@/lib/products';
import { fetchCatalogProducts, fetchCatalogStyles, slugifyCatalog, type CatalogProduct } from '@/lib/catalogApi';
import { useCart } from '@/lib/cartContext';
import UpperNav from '@/components/ui/UpperNav';
import Link from 'next/link';
import SortFilter, { sortProducts, type SortOption } from '@/components/ui/SortFilter';
import { useWishlist } from '@/lib/wishlistContext';

type Product = CatalogProduct;

const THEME = {
  bg:          '#F5F2EC',
  bgAlt:       '#EDEAE2',
  cardBg:      '#FDFCF9',
  accent:      '#4A7C59',
  accentSoft:  '#6A9B78',
  accentMist:  '#D4E6DA',
  text:        '#1C2B1E',
  textMuted:   '#5C6E5F',
  border:      '#D8D3C9',
  borderSoft:  '#E8E4DC',
  displayFont: "'Cormorant Garamond', Georgia, serif",
  bodyFont:    "'DM Sans', sans-serif",
};

const STYLE_LABELS: Record<string, { name: string; tagline: string; sub: string }> = {
  'soft-girl':        { name: 'Soft Girl',        tagline: 'Bloom Into You',     sub: 'Soft. Sweet. Eternal.'       },
  'glam-look':        { name: 'Glam Look',        tagline: 'Own The Room',       sub: 'Gilded. Bold. Unapologetic.' },
  'island-girl':      { name: 'Island Girl',      tagline: 'Salt & Spirit',      sub: 'Breezy. Free. Sun-kissed.'   },
  'office-jewellery': { name: 'Office Jewellery', tagline: 'Quiet Authority',    sub: 'Refined. Subtle. Powerful.'  },
  'maximalist':       { name: 'Maximalist',       tagline: 'More Is More',       sub: 'Loud. Layered. Limitless.'   },
  'fairy-coded':      { name: 'Fairy Coded',      tagline: 'Enchant Everything', sub: 'Whimsical. Magical. Rare.'    },
  'men-street-edge':  { name: 'Street Edge',      tagline: 'Street Edge',        sub: 'Bold. Raw. Unapologetic.'    },
  'men-corporate':    { name: 'Corporate Sharp',  tagline: 'Corporate Sharp',    sub: 'Refined. Sleek. Precise.'    },
  'men-island':       { name: 'Island King',      tagline: 'Island King',        sub: 'Laid-back. Sun-kissed.'       },
  'men-minimal':      { name: 'Minimal Stack',    tagline: 'Minimal Stack',      sub: 'Clean. Intentional. Strong.' },
  'men-rocker':       { name: 'Rocker Noir',      tagline: 'Rocker Noir',        sub: 'Dark. Sharp. Rebellious.'    },
  'men-gold':         { name: 'Gold Royalty',     tagline: 'Gold Royalty',       sub: 'Rich. Heavy. Statement.'     },
};

const DEFAULT_LABEL = { name: 'Collection', tagline: 'Curated For You', sub: '' };
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

// ─── Product Card ─────────────────────────────────────────────────────────────
function Card({ product, index }: { product: Product; index: number }) {
  const { addItem } = useCart();
  const { toggleItem, isWished } = useWishlist();

  const [added, setAdded] = useState(false);
  const [wishAnim, setWishAnim] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);

  const wished = isWished(product.id);
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  function handleAdd(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    addItem(
      {
        id: String(product.id),
        sourceId: product.sourceId,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice ?? null,
        image: product.images[0],
        color: product.colors?.[0]?.label ?? 'Default',
        colorHex: product.colors?.[0]?.hex ?? '#000000',
        sku: product.sku ?? `SKU-${product.id}`,
        href: product.href,
        category: product.category,
        categoryId: product.categoryId,
        subCategoryId: product.subCategoryId,
        style: product.style,
        styleId: product.styleId,
      },
      true,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  function handleWish(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    setWishAnim(true);
    setTimeout(() => setWishAnim(false), 400);
    toggleItem({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice ?? undefined,
      image: product.images[0],
      href: product.href,
      colors: product.colors ?? [],
      badge: null,
      rating: 0,
      reviewCount: 0,
      category: product.type ?? 'Jewellery',
    });
  }

  return (
    <Link
      href={product.href}
      className="c-link"
      style={{ animationDelay: `${Math.min(index, 8) * 0.04}s` }}
    >
      <article
        className="c-card"
        // Hover image swap only for a real mouse — taps on phones must not trigger it
        onPointerEnter={(e) => { if (e.pointerType === 'mouse' && product.images[1]) setImgIdx(1); }}
        onPointerLeave={(e) => { if (e.pointerType === 'mouse') setImgIdx(0); }}
      >
        <div className="c-img-wrap">
          <img
            src={product.images[imgIdx] || product.images[0]}
            alt={product.name}
            className="c-img"
            loading="lazy"
          />
          {discount && discount > 0 && <span className="c-disc">{discount}% off</span>}

          <button
            className={`c-wish${wished ? ' active' : ''}${wishAnim ? ' c-wish--pop' : ''}`}
            onClick={handleWish}
            aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
            aria-pressed={wished}
          >
            <svg viewBox="0 0 24 24" fill={wished ? '#fff' : 'none'} stroke={wished ? 'none' : 'currentColor'} strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        </div>

        <div className="c-info">
          <p className="c-name">{product.name}</p>
          <div className="c-prow">
            <span className="c-price">₹{product.price.toLocaleString('en-IN')}</span>
            {product.originalPrice && (
              <span className="c-orig">₹{product.originalPrice.toLocaleString('en-IN')}</span>
            )}
          </div>
          <button
            className={`c-cart-btn${added ? ' c-cart-btn--added' : ''}`}
            onClick={handleAdd}
            aria-label={`Add ${product.name} to cart`}
          >
            {added ? 'Added ✓' : 'Add to Cart'}
          </button>
        </div>
      </article>
    </Link>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function StyleProductPage({ styleId = 'soft-girl' }: { styleId?: string }) {
  const sid = resolveStyleId(styleId);
  const [label, setLabel] = useState(STYLE_LABELS[sid] ?? DEFAULT_LABEL);

  const [sort, setSort] = useState<SortOption>('default');
  const [filter, setFilter] = useState('all');
  const [mounted, setMounted] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  useEffect(() => {
    setLabel(STYLE_LABELS[sid] ?? DEFAULT_LABEL);
    let active = true;
    fetchCatalogStyles().then((styles) => {
      if (!active) return;
      const found = styles.find((s: any) => String(s.slug || slugifyCatalog(s.name)).toLowerCase() === sid);
      if (found) {
        setLabel({
          name: found.name,
          tagline: STYLE_LABELS[sid]?.tagline || 'Curated For You',
          sub: STYLE_LABELS[sid]?.sub || 'Handpicked from our catalog.',
        });
      }
    }).catch(console.error);
    return () => { active = false; };
  }, [sid]);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    let active = true;
    fetchCatalogProducts()
      .then(p => { if (active) setAllProducts(p); })
      .catch(() => { if (active) setAllProducts([]); });
    return () => { active = false; };
  }, []);

  const allStyle = useMemo(() => {
    return allProducts.filter(product => {
      const styleSlug = 'styleSlug' in product ? (product as any).styleSlug : '';
      const styleName = 'style' in product ? (product as any).style : '';
      return styleSlug === sid || slugifyCatalog(styleName || '') === sid;
    });
  }, [allProducts, sid]);

  const products = useMemo(() => {
    let list = [...allStyle];
    if (filter !== 'all') list = list.filter(p => p.type === filter);
    return sortProducts(list, sort);
  }, [allStyle, filter, sort]);

  const count = (type: string) =>
    type === 'all' ? allStyle.length : allStyle.filter(p => p.type === type).length;

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500&family=DM+Sans:wght@300;400;500;600;700&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root { --nav-h: 72px; }
    @media (max-width: 480px) { :root { --nav-h: 64px; } }

    .pg {
      min-height: 100vh;
      background: ${THEME.bg};
      color: ${THEME.text};
      font-family: ${THEME.bodyFont};
      overflow-x: clip;               /* NOT hidden — hidden breaks sticky */
      width: 100%;
    }

    /* HERO — no navH padding; the sticky nav already occupies its own space */
    .hero {
      position: relative;
      width: 100%;
      padding: clamp(24px, 4vw, 44px) clamp(20px, 6vw, 72px) clamp(24px, 4vw, 40px);
      background: ${THEME.bg};
      border-bottom: 1px solid ${THEME.border};
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 24px;
      overflow: hidden;
    }
    .hero::after {
      content: '';
      position: absolute;
      right: clamp(40px, 10vw, 140px);
      top: 50%;
      transform: translateY(-50%);
      width: clamp(100px, 16vw, 200px);
      height: clamp(100px, 16vw, 200px);
      border-radius: 50%;
      border: 1.5px solid ${THEME.accentMist};
      pointer-events: none;
    }
    .hero-left { position: relative; z-index: 2; flex: 1; min-width: 0; }

    .hero-pill {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 6px 14px 6px 10px;
      border-radius: 100px;
      background: ${THEME.accentMist};
      font-size: 10px; letter-spacing: 0.26em; text-transform: uppercase;
      color: ${THEME.accent}; font-weight: 700;
      margin-bottom: 14px;
      opacity: ${mounted ? 1 : 0};
      transition: opacity 0.4s ease;
    }
    .hero-pill-dot { width: 5px; height: 5px; border-radius: 50%; background: ${THEME.accent}; flex-shrink: 0; }

    .hero-title {
      font-family: ${THEME.displayFont};
      font-size: clamp(2.2rem, 6vw, 4.2rem);
      font-weight: 500;
      line-height: 1.05;
      letter-spacing: -0.01em;
      color: ${THEME.text};
      opacity: ${mounted ? 1 : 0};
      transition: opacity 0.5s ease 0.07s;
    }
    .hero-title em { font-style: italic; color: ${THEME.accent}; }

    .hero-sub {
      font-size: 12px; letter-spacing: 0.2em; text-transform: uppercase;
      color: ${THEME.textMuted}; margin-top: 10px; font-weight: 600;
      opacity: ${mounted ? 1 : 0};
      transition: opacity 0.5s ease 0.14s;
    }
    .hero-rule { width: 36px; height: 1px; background: ${THEME.accent}; margin-top: 14px; opacity: 0.4; }

    .hero-right {
      position: relative; z-index: 2;
      display: flex; flex-direction: column; align-items: flex-end;
      flex-shrink: 0; padding-bottom: 4px;
      opacity: ${mounted ? 1 : 0};
      transition: opacity 0.5s ease 0.2s;
    }
    .hero-count-num {
      font-family: ${THEME.displayFont};
      font-size: clamp(2.4rem, 5.5vw, 4.5rem);
      font-weight: 500; color: ${THEME.accent}; line-height: 1; letter-spacing: -0.04em;
    }
    .hero-count-lbl { font-size: 9px; letter-spacing: 0.3em; text-transform: uppercase; color: ${THEME.textMuted}; margin-top: 2px; font-weight: 700; }
    @media (max-width: 480px) { .hero-right { display: none; } }

    /* FILTER BAR */
    .filters {
      position: sticky;
      top: var(--nav-h);
      z-index: 40;
      background: rgba(245, 242, 236, 0.96);
      backdrop-filter: blur(16px) saturate(160%);
      -webkit-backdrop-filter: blur(16px) saturate(160%);
      border-bottom: 1px solid ${THEME.border};
      display: flex; align-items: stretch;
      padding: 0 clamp(20px, 6vw, 72px);
    }
    .filters-tabs {
      display: flex; align-items: center;
      overflow-x: auto; scrollbar-width: none;
      -webkit-overflow-scrolling: touch;
      flex: 1; min-width: 0; gap: 2px;
    }
    .filters-tabs::-webkit-scrollbar { display: none; }

    .ftab {
      flex-shrink: 0;
      display: inline-flex; align-items: center; gap: 6px;
      padding: 14px 14px;
      background: none; border: none;
      border-bottom: 2px solid transparent;
      font-family: ${THEME.bodyFont};
      font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase;
      color: ${THEME.textMuted};
      cursor: pointer; transition: color 0.15s, border-color 0.15s;
      white-space: nowrap; font-weight: 600;
    }
    .ftab:hover { color: ${THEME.accent}; }
    .ftab.on { color: ${THEME.accent}; border-bottom-color: ${THEME.accent}; }

    .fcount {
      padding: 2px 7px; border-radius: 100px;
      font-size: 8px; font-weight: 700;
      background: ${THEME.accentMist}; color: ${THEME.accent};
      letter-spacing: 0.05em;
    }
    .ftab.on .fcount { background: ${THEME.accent}; color: #fff; }

    .filters-sort {
      flex-shrink: 0; display: flex; align-items: center;
      margin-left: auto; padding-left: 16px;
      position: relative; z-index: 9999;
    }

    /* GRID — minmax(0,1fr) stops long names from stretching the columns */
    .grid-wrap { padding: clamp(24px, 4vw, 48px) clamp(20px, 6vw, 72px) clamp(48px, 7vw, 96px); }
    .grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: clamp(12px, 1.8vw, 20px);
      align-items: stretch;
    }
    @media (max-width: 1100px) { .grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
    @media (max-width: 720px)  { .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; } }

    /* CARD */
    .c-link { display: block; min-width: 0; text-decoration: none; animation: fadeUp 0.45s ease both; }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

    .c-card {
      height: 100%;
      display: flex; flex-direction: column;
      background: ${THEME.cardBg};
      border-radius: 6px;
      overflow: hidden;
      border: 1px solid ${THEME.borderSoft};
      transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.2s;
      box-shadow: 0 1px 6px rgba(74,124,89,0.04), 0 4px 18px rgba(28,43,30,0.04);
    }
    @media (hover: hover) {
      .c-card:hover { transform: translateY(-3px); box-shadow: 0 8px 32px rgba(74,124,89,0.12), 0 2px 8px rgba(28,43,30,0.06); border-color: ${THEME.accentMist}; }
      .c-card:hover .c-img { transform: scale(1.04); }
    }

    .c-img-wrap { position: relative; aspect-ratio: 4 / 5; overflow: hidden; background: ${THEME.bgAlt}; flex-shrink: 0; }
    .c-img { width: 100%; height: 100%; object-fit: cover; object-position: center top; display: block; transition: transform 0.55s ease; }

    .c-disc {
      position: absolute; top: 10px; left: 10px;
      font-size: 9px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
      background: ${THEME.accent}; color: #fff; padding: 4px 8px 3px; border-radius: 3px;
    }

    .c-wish {
      position: absolute; top: 8px; right: 8px; z-index: 3;
      width: 32px; height: 32px; border-radius: 50%;
      background: rgba(253,252,249,0.92);
      border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 1px 4px rgba(0,0,0,.1);
      transition: transform .18s, background .18s;
      color: ${THEME.accent};
    }
    .c-wish.active { background: ${THEME.accent}; color: #fff; }
    .c-wish--pop { animation: wishPop .35s cubic-bezier(.34,1.56,.64,1) both; }
    @keyframes wishPop { 0% { transform: scale(1); } 50% { transform: scale(1.3); } 100% { transform: scale(1); } }
    .c-wish svg { width: 15px; height: 15px; }

    .c-info { padding: 12px 12px 14px; display: flex; flex-direction: column; flex: 1; min-width: 0; }

    .c-name {
      font-family: ${THEME.displayFont};
      font-size: clamp(15px, 4vw, 18px);
      font-weight: 700;
      color: ${THEME.text};
      line-height: 1.25;
      letter-spacing: 0.005em;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
      overflow: hidden;
      // min-height: 2.5em;               /* two lines reserved — every card lines up */
      margin-bottom: 6px;
      overflow-wrap: anywhere;
    }

    .c-prow { display: flex; align-items: baseline; flex-wrap: wrap; gap: 2px 8px; margin-top: auto; margin-bottom: 10px; }
    .c-price { font-size: clamp(14px, 3.6vw, 16px); font-weight: 700; color: ${THEME.text}; }
    .c-orig { font-size: 12px; color: ${THEME.textMuted}; text-decoration: line-through; opacity: 0.7; }

    .c-cart-btn {
      margin-top: 0;
      width: 100%; padding: 10px 0;
      border: 1.5px solid ${THEME.accent};
      background: transparent; color: ${THEME.accent};
      font-family: ${THEME.bodyFont};
      font-size: 11px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase;
      border-radius: 4px; cursor: pointer;
      transition: background .22s, color .22s;
    }
    .c-cart-btn:hover, .c-cart-btn--added { background: ${THEME.accent}; color: #fff; }

    .empty { grid-column: 1 / -1; text-align: center; padding: 96px 20px; opacity: 0.6; }
    .empty-msg { font-family: ${THEME.displayFont}; font-size: 18px; font-style: italic; color: ${THEME.textMuted}; }

    /* SORT FILTER OVERRIDES */
    .filters-sort .sf-trigger {
      --sf-accent: ${THEME.accent}; --sf-bdr: ${THEME.border}; --sf-bg: ${THEME.cardBg};
      --sf-bg-hover: ${THEME.accentMist}; --sf-txt: ${THEME.text};
      --sf-bdr-hover: ${THEME.accent}; --sf-gold: ${THEME.accent};
      border-radius: 4px; font-size: 9.5px; letter-spacing: 0.2em;
    }
    .filters-sort .sf-trigger.sf-active { background: ${THEME.accent} !important; color: #fff !important; border-color: ${THEME.accent} !important; }
    .filters-sort .sf-option.sf-option-active { background: ${THEME.accent} !important; color: #fff !important; }
    .filters-sort .sf-option:hover:not(.sf-option-active) { background: ${THEME.accentMist} !important; color: ${THEME.accent} !important; }
    .filters-sort .sf-wrap { position: relative; z-index: 9999; }
    .filters-sort .sf-dropdown { z-index: 9999; }

    @media (max-width: 640px) {
      .hero { padding-left: 20px; padding-right: 20px; }
      .filters { padding: 0 16px; }
      .grid-wrap { padding: 16px 12px 64px; }
      .c-info { padding: 10px 10px 12px; }
    }
  `;

  return (
    <>
      <style>{css}</style>

      <div className="pg">
        {/* No wrapper div — a sticky nav must be a direct child of the page */}
        <UpperNav />

        <header className="hero">
          <div className="hero-left">
            <div className="hero-pill">
              <span className="hero-pill-dot" />
              {label.name}
            </div>
            <h1 className="hero-title"><em>{label.tagline}</em></h1>
            {label.sub && <p className="hero-sub">{label.sub}</p>}
            <div className="hero-rule" />
          </div>
          <div className="hero-right">
            <span className="hero-count-num">{allStyle.length}</span>
            <span className="hero-count-lbl">pieces</span>
          </div>
        </header>

        <nav className="filters" aria-label="Product filters">
          <div className="filters-tabs">
            {FILTER_TABS.map(tab => (
              <button
                key={tab.value}
                className={`ftab${filter === tab.value ? ' on' : ''}`}
                onClick={() => setFilter(tab.value)}
              >
                {tab.label}
                <span className="fcount">{count(tab.value)}</span>
              </button>
            ))}
          </div>
          <div className="filters-sort">
            <SortFilter value={sort} onChange={setSort} variant="olive" />
          </div>
        </nav>

        <main className="grid-wrap">
          <div className="grid">
            {products.length === 0 ? (
              <div className="empty"><p className="empty-msg">Nothing here yet — check back soon</p></div>
            ) : (
              products.map((p, i) => <Card key={p.id} product={p} index={i} />)
            )}
          </div>
        </main>
      </div>
    </>
  );
}