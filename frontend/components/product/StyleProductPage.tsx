

'use client';

import {
  useState, useMemo, useEffect, useRef,
  type CSSProperties, type MouseEvent
} from 'react';
import { FILTER_TABS } from '@/lib/products';
import { STYLE_THEMES, STYLE_PRODUCT_FILTER } from '@/lib/styleThemes';
import { fetchCatalogProducts, slugifyCatalog, type CatalogProduct } from '@/lib/catalogApi';
import { useCart } from '@/lib/cartContext';
import { fireConfetti } from '@/components/cart/ConfettiManager';
import UpperNav from '@/components/ui/UpperNav';
import Link from 'next/link';

type StyleId = keyof typeof STYLE_THEMES;
type StyleTheme = (typeof STYLE_THEMES)[StyleId];
type Product = CatalogProduct;

function resolveStyleId(id: string): StyleId {
  return (id in STYLE_THEMES ? id : 'soft-girl') as StyleId;
}

// Per-theme hero config — compact, atmospheric
const HERO_CFG: Record<string, {
  tagline: string;
  sub: string;
  gradA: string;
  gradB: string;
}> = {
  'soft-girl':        { tagline: 'Bloom Into You',       sub: 'Soft. Sweet. Eternal.',       gradA:'#f9d4cc', gradB:'#f7e8e2' },
  // Updated Glam Look to use proper metallic silver tones
  'glam-look':        { tagline: 'Own The Room',         sub: 'Gilded. Bold. Unapologetic.', gradA:'#C0C0C0', gradB:'#E6E6E6' },
  'island-girl':      { tagline: 'Salt & Spirit',        sub: 'Breezy. Free. Sun-kissed.',   gradA:'#d4ede6', gradB:'#e8f5f1' },
  'office-jewellery': { tagline: 'Quiet Authority',      sub: 'Refined. Subtle. Powerful.',  gradA:'#f0eeeb', gradB:'#e8e6e2' },
  'maximalist':       { tagline: 'More Is More',         sub: 'Loud. Layered. Limitless.',   gradA:'#1c0d00', gradB:'#0e0600' },
  'fairy-coded':      { tagline: 'Enchant Everything',   sub: 'Whimsical. Magical. Rare.',   gradA:'#f0e8fc', gradB:'#ebe0f8' },
};

// ─── Product Card ─────────────────────────────────────────────────────────────
function Card({ product, theme, index, isDark, sid }: {
  product: Product; theme: StyleTheme; index: number; isDark: boolean; sid: string;
}) {
  const { addItem } = useCart();
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const [added, setAdded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  function handleAdd(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault(); e.stopPropagation();
    addItem({
      id: String(product.id), name: product.name, price: product.price,
      originalPrice: product.originalPrice ?? null,
      image: product.images[0], color: product.colors[0].label,
      colorHex: product.colors[0].hex,
      sku: product.sku ?? `SKU-${product.id}`, href: product.href,
    });
    fireConfetti(btnRef.current);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  const radius =
    sid === 'fairy-coded' ? '14px' :
    sid === 'glam-look' ? '2px' :
    sid === 'maximalist' ? '6px' : '8px';

  return (
    <Link
      href={product.href}
      style={{ display:'block', textDecoration:'none', animationDelay:`${index * 0.045}s` }}
      className="c-link"
    >
      <div
        className="c-card"
        style={{ borderRadius: radius }}
        onMouseEnter={() => { setHovered(true); if (product.images[1]) setImgIdx(1); }}
        onMouseLeave={() => { setHovered(false); setImgIdx(0); }}
      >
        {/* Image — square 1:1 */}
        <div className="c-img-wrap" style={{ borderRadius: `${radius} ${radius} 0 0` }}>
          <img
            src={product.images[imgIdx] || product.images[0]}
            alt={product.name}
            className="c-img"
          />
          {discount && <span className="c-disc">{discount}%</span>}

          {/* Hover scrim */}
          <div className={`c-scrim ${hovered ? 'on' : ''}`} />

          {/* Add button */}
          <button
            ref={btnRef}
            className={`c-add-btn ${hovered ? 'show' : ''}`}
            style={{ background: added ? '#2e7d32' : theme.accent }}
            onClick={handleAdd}
            aria-label="Add to cart"
          >
            {added
              ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={isDark ? '#000' : '#fff'} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={isDark ? '#000' : '#fff'} strokeWidth="2.2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            }
          </button>
        </div>

        {/* Info */}
        <div className="c-info">
          <p className="c-name">{product.name}</p>
          <div className="c-prow">
            <span className="c-price">₹{product.price.toLocaleString('en-IN')}</span>
            {product.originalPrice && (
              <span className="c-orig">₹{product.originalPrice.toLocaleString('en-IN')}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function StyleProductPage({ styleId = 'soft-girl' }) {
  const sid = resolveStyleId(styleId);
  const theme = STYLE_THEMES[sid];
  const cfg = HERO_CFG[sid] || HERO_CFG['soft-girl'];
  
  // Removed 'glam-look' from isDark so it defaults to light UI elements
  const isDark = ['maximalist'].includes(sid);

  const [filter, setFilter] = useState('all');
  const [mounted, setMounted] = useState(false);
  const [navH, setNavH] = useState(64); // fallback height
  const navRef = useRef<HTMLDivElement>(null);
  const [dynamicProducts, setDynamicProducts] = useState<Product[]>([]);

  useEffect(() => {
    setMounted(true);
    const measure = () => {
      if (navRef.current) setNavH(navRef.current.offsetHeight);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  useEffect(() => {
    let mounted = true;

    fetchCatalogProducts()
      .then((products) => {
        if (mounted) {
          setDynamicProducts(products);
        }
      })
      .catch(() => {
        if (mounted) {
          setDynamicProducts([]);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const sourceProducts = dynamicProducts;
  const styleFn = STYLE_PRODUCT_FILTER[sid] || (() => true);
  const allStyle = sourceProducts.filter((product) => {
    const styleSlug = 'styleSlug' in product ? product.styleSlug : '';
    const styleName = 'style' in product ? product.style : '';
    return styleSlug === sid || slugifyCatalog(styleName || '') === sid || styleFn(product);
  });

  const products = useMemo(() => {
    let list = [...allStyle];
    if (filter !== 'all') list = list.filter(p => p.type === filter);
    return list;
  }, [allStyle, filter]);

  const count = (type: string) =>
    type === 'all' ? allStyle.length : allStyle.filter(p => p.type === type).length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=${theme.googleFonts}&family=DM+Sans:wght@300;400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

        .pg {
          min-height: 100vh;
          background: ${theme.bg};
          color: ${theme.text};
          font-family: 'DM Sans', sans-serif;
          overflow-x: hidden;
        }

        /* ─────────────────────────────────────────────
          HERO — compact, full-width, atmospheric band
        ───────────────────────────────────────────── */
        .hero {
          position: relative;
          width: 100%;
          padding: clamp(36px, 5vw, 60px) clamp(16px, 5vw, 64px) clamp(24px, 4vw, 48px);
          
          /* Space between Nav and Pill */
          padding-top: calc(${navH}px + clamp(60px, 6vw, 80px));  
          
          background: linear-gradient(130deg, ${cfg.gradA} 0%, ${cfg.gradB} 100%);
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }
        /* subtle grain */
        .hero::after {
          content:'';
          position:absolute; inset:0;
          background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E");
          pointer-events:none; mix-blend-mode:overlay;
          opacity:${isDark ? 0.07 : 0.04};
        }
        .hero-orb {
          position:absolute;
          width: min(360px,55vw); height: min(360px,55vw);
          border-radius:50%;
          background: radial-gradient(circle, ${theme.accent}1a 0%, transparent 70%);
          right:-8%; top:-50%;
          pointer-events:none;
        }

        .hero-left {
          position:relative; z-index:2; flex:1; min-width:0;
        }

        /* PILL CSS */
        .hero-pill {
          display:inline-flex; align-items:center; gap:6px;
          padding: 6px 14px 6px 10px;
          border-radius:100px;
          border: 1px solid ${theme.accent}40;
          background: ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.55)'};
          backdrop-filter:blur(8px);
          font-size: 9.5px;
          letter-spacing:0.3em; text-transform:uppercase;
          color:${theme.accent}; font-weight:500;
          margin-bottom:14px;
          opacity:${mounted ? 1 : 0};
          transition: opacity 0.5s ease;
        }
        .hero-pill-dot {
          width: 6px; height: 6px;
          border-radius:50%;
          background:${theme.accent}; flex-shrink:0;
        }

        .hero-title {
          font-family: ${theme.displayFont};
          font-size: clamp(1.7rem, 4vw, 3.2rem);
          font-weight: ${isDark ? 700 : 300};
          line-height:1.04;
          letter-spacing: ${isDark ? '0.01em' : '-0.025em'};
          color: ${theme.text};
          opacity: ${mounted ? 1 : 0};
          transform: translateY(${mounted ? 0 : 10}px);
          transition: opacity 0.55s ease 0.08s, transform 0.55s ease 0.08s;
        }
        .hero-title em { font-style:italic; color:${theme.accent}; }
        .hero-sub {
          font-size: clamp(9px,1.3vw,11px);
          letter-spacing:0.22em; text-transform:uppercase;
          color:${theme.textMuted}; margin-top:7px; font-weight:400;
          opacity:${mounted ? 0.7 : 0};
          transition: opacity 0.5s ease 0.16s;
        }

        .hero-count {
          position:relative; z-index:2;
          display:flex; flex-direction:column; align-items:flex-end;
          flex-shrink:0;
          opacity:${mounted ? 1 : 0};
          transition: opacity 0.5s ease 0.2s;
        }
        .hero-count-num {
          font-family: ${theme.displayFont};
          font-size: clamp(2rem,5vw,4rem);
          font-weight: ${isDark ? 600 : 200};
          color: ${theme.text};
          line-height:1; letter-spacing:-0.03em;
          opacity:0.14;
        }
        .hero-count-lbl {
          font-size:8px; letter-spacing:0.3em; text-transform:uppercase;
          color:${theme.textMuted}; opacity:0.4; margin-top:2px;
        }
        @media (max-width:480px) { .hero-count { display:none; } }

        /* ─────────────────────────────────────────────
          FILTER BAR
        ───────────────────────────────────────────── */
        .filters {
          position:sticky; top:${navH}px; z-index:40;
          background: ${isDark ? 'rgba(9,8,12,0.92)' : 'rgba(251,249,247,0.92)'};
          backdrop-filter: blur(18px) saturate(180%);
          border-bottom: 1px solid ${theme.border};
          display:flex; align-items:center;
          overflow-x:auto; scrollbar-width:none;
          -webkit-overflow-scrolling:touch;
          padding: 0 clamp(16px, 5vw, 64px);
        }
        .filters::-webkit-scrollbar { display:none; }

        .ftab {
          flex-shrink:0;
          display:inline-flex; align-items:center; gap:6px;
          padding: 12px 15px;
          background:none; border:none;
          border-bottom: 2px solid transparent;
          font-family:'DM Sans',sans-serif;
          font-size:9px; letter-spacing:0.24em; text-transform:uppercase;
          color:${theme.textMuted}; cursor:pointer;
          transition: color 0.17s, border-color 0.17s;
          white-space:nowrap; font-weight:500;
        }
        .ftab:hover { color:${theme.accent}; }
        .ftab.on { color:${theme.accent}; border-bottom-color:${theme.accent}; }
        .fcount {
          padding:1.5px 6px; border-radius:100px;
          font-size:7.5px; font-weight:600;
          background:${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'};
          transition: background 0.17s, color 0.17s;
        }
        .ftab.on .fcount {
          background:${theme.accent};
          color:${isDark ? '#000' : '#fff'};
        }

        /* ─────────────────────────────────────────────
          PRODUCT GRID
        ───────────────────────────────────────────── */
        .grid-wrap {
          padding: clamp(20px,3.5vw,44px) clamp(16px,5vw,64px) clamp(44px,6vw,80px);
        }
        .grid {
          display:grid;
          grid-template-columns: repeat(4, 1fr);
          gap: clamp(10px, 1.8vw, 18px);
          width:100%;
        }
        @media (max-width:1024px) {
          .grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width:640px) {
          .grid { grid-template-columns: repeat(2, 1fr); gap:10px; }
        }

        /* CARD */
        .c-link { display:block; text-decoration:none; animation: fadeUp 0.5s ease both; }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(14px); }
          to   { opacity:1; transform:translateY(0); }
        }

        .c-card {
          background: ${theme.cardBg};
          overflow:hidden;
          border: 1px solid ${theme.border};
          transition: transform 0.35s cubic-bezier(0.22,0.68,0,1.2), box-shadow 0.35s ease, border-color 0.2s;
          box-shadow: ${isDark ? '0 2px 14px rgba(0,0,0,0.5)' : '0 1px 8px rgba(0,0,0,0.06)'};
        }
        .c-card:hover {
          transform: translateY(-4px);
          box-shadow: ${isDark ? '0 14px 44px rgba(0,0,0,0.65)' : '0 12px 36px rgba(0,0,0,0.11)'};
          border-color: ${theme.accent}33;
        }

        .c-img-wrap {
          position:relative;
          aspect-ratio: 1 / 1;
          overflow:hidden;
          background: ${isDark ? '#0b0a13' : theme.bgAlt};
          display:block;
        }
        .c-img {
          width:100%; height:100%;
          object-fit:cover; object-position:center;
          display:block;
          transition: transform 0.6s cubic-bezier(0.22,0.68,0,1.2);
        }
        .c-card:hover .c-img { transform:scale(1.06); }

        .c-scrim {
          position:absolute; inset:0;
          background: linear-gradient(to top, rgba(0,0,0,0.42) 0%, transparent 55%);
          opacity:0; transition: opacity 0.28s ease;
          pointer-events:none;
        }
        .c-scrim.on { opacity:1; }

        .c-disc {
          position:absolute; top:8px; left:8px;
          font-size:8px; font-weight:700;
          letter-spacing:0.08em; text-transform:uppercase;
          background:${theme.accent}; color:${isDark ? '#000' : '#fff'};
          padding: 3px 8px 2px; border-radius:2px;
        }

        .c-add-btn {
          position:absolute; bottom:8px; right:8px;
          width:30px; height:30px; border-radius:50%;
          border:none; cursor:pointer;
          display:flex; align-items:center; justify-content:center;
          opacity:0; transform: scale(0.75) translateY(4px);
          transition: opacity 0.22s ease, transform 0.22s ease;
          box-shadow: 0 2px 10px rgba(0,0,0,0.3);
          flex-shrink:0;
        }
        .c-add-btn.show {
          opacity:1; transform: scale(1) translateY(0);
        }
        .c-add-btn:hover { transform: scale(1.1) !important; }
        .c-add-btn:active { transform: scale(0.95) !important; }

        .c-info {
          padding: 9px 10px 11px;
        }
        .c-name {
          font-family: ${theme.displayFont};
          font-size: clamp(10.5px, 1vw, 13px);
          font-weight: ${isDark ? 400 : 300};
          color: ${theme.text};
          line-height:1.3;
          white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
          margin-bottom:4px; letter-spacing:0.01em;
        }
        .c-prow { display:flex; align-items:baseline; gap:5px; }
        .c-price {
          font-size: clamp(11px, 1.1vw, 13px);
          font-weight:500; color:${theme.text}; letter-spacing:0.01em;
        }
        .c-orig {
          font-size:10px; color:${theme.textMuted};
          text-decoration:line-through; opacity:0.5;
        }

        .empty {
          grid-column:1/-1; text-align:center; padding:80px 20px; opacity:0.3;
        }
        .empty-icon { font-size:38px; display:block; margin-bottom:12px; }
        .empty-msg {
          font-family:${theme.displayFont}; font-size:15px;
          font-style:italic; color:${theme.textMuted};
        }

        /* * ── SOFT GIRL OVERRIDES ──
         * Darkens the headings for better contrast against the light pink/peach bg
         */
        ${sid === 'soft-girl' ? `
          .hero-title, .hero-count-num { color: #2A110D !important; }
          .hero-sub, .hero-count-lbl { color: #5C3228 !important; }
        ` : ''}

        /* * ── GLAM LOOK OVERRIDES ──
         * Forces proper silver backgrounds and pitch-black, highly readable typography
         */
        ${sid === 'glam-look' ? `
          .pg { background: #D3D3D3 !important; color: #000 !important; }
          .hero-title { color: #000 !important; font-weight: 500 !important; }
          .hero-count-num, .c-name, .c-price { color: #000 !important; }
          .hero-sub, .hero-count-lbl, .ftab, .empty-msg { color: #333 !important; }
          .c-card { background: #E8E8E8 !important; border-color: #A9A9A9 !important; }
          .c-orig { color: #555 !important; }
          .filters { background: rgba(211, 211, 211, 0.92) !important; border-bottom: 1px solid #A9A9A9 !important; }
          .ftab.on { color: #000 !important; border-bottom-color: #000 !important; font-weight: 700 !important; }
          .ftab.on .fcount { background: #000 !important; color: #fff !important; }
        ` : ''}
      `}</style>

      <div className="pg">
        <div ref={navRef}>
          <UpperNav />
        </div>

        {/* ── COMPACT HERO ── */}
        <div className="hero">
          <div className="hero-orb" />
          <div className="hero-left">
            <div className="hero-pill">
              <span className="hero-pill-dot" />
              {theme.emoji}&nbsp;{theme.name}
            </div>
            <h1 className="hero-title">
              <em>{cfg.tagline}</em>
            </h1>
            <p className="hero-sub">{cfg.sub}</p>
          </div>
          <div className="hero-count">
            <span className="hero-count-num">{allStyle.length}</span>
            <span className="hero-count-lbl">pieces</span>
          </div>
        </div>

        {/* ── FILTER BAR ── */}
        <div className="filters">
          {FILTER_TABS.map(tab => (
            <button
              key={tab.value}
              className={`ftab ${filter === tab.value ? 'on' : ''}`}
              onClick={() => setFilter(tab.value)}
            >
              {tab.label}
              <span className="fcount">{count(tab.value)}</span>
            </button>
          ))}
        </div>

        {/* ── PRODUCT GRID ── */}
        <div className="grid-wrap">
          <div className="grid">
            {products.length === 0 ? (
              <div className="empty">
                <span className="empty-icon">{theme.emoji}</span>
                <p className="empty-msg">Nothing here yet</p>
              </div>
            ) : (
              products.map((p, i) => (
                <Card key={p.id} product={p} theme={theme} index={i} isDark={isDark} sid={sid} />
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}