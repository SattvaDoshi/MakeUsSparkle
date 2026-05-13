// 'use client';

// import {
//   useState, useMemo, useEffect, useRef,
//   type CSSProperties, type MouseEvent
// } from 'react';
// import { FILTER_TABS } from '@/lib/products';
// import { STYLE_THEMES, STYLE_PRODUCT_FILTER } from '@/lib/styleThemes';
// import { fetchCatalogProducts, slugifyCatalog, type CatalogProduct } from '@/lib/catalogApi';
// import { useCart } from '@/lib/cartContext';
// import { fireConfetti } from '@/components/cart/ConfettiManager';
// import UpperNav from '@/components/ui/UpperNav';
// import Link from 'next/link';
// import SortFilter, { sortProducts, type SortOption } from '@/components/ui/SortFilter';

// type StyleId = keyof typeof STYLE_THEMES;
// type StyleTheme = (typeof STYLE_THEMES)[StyleId];
// type Product = CatalogProduct;

// // ─── Robust style resolver ────────────────────────────────────────────────────
// const ALL_STYLE_IDS = Object.keys(STYLE_THEMES) as StyleId[];

// function resolveStyleId(raw: string | undefined | null): StyleId {
//   if (!raw) return 'soft-girl' as StyleId;

//   if (ALL_STYLE_IDS.includes(raw as StyleId)) return raw as StyleId;

//   const kebab = raw
//     .replace(/([a-z])([A-Z])/g, '$1-$2')
//     .toLowerCase()
//     .replace(/[\s_]+/g, '-')
//     .replace(/-+/g, '-')
//     .trim();

//   if (ALL_STYLE_IDS.includes(kebab as StyleId)) return kebab as StyleId;

//   const lower = raw.toLowerCase();
//   const fuzzy = ALL_STYLE_IDS.find((id) =>
//     id.split('-').every((word) => lower.includes(word))
//   );
//   if (fuzzy) return fuzzy;

//   console.warn(`[StyleProductPage] Unknown styleId "${raw}" — falling back to "soft-girl".`);
//   return 'soft-girl' as StyleId;
// }

// // Per-theme hero config
// const HERO_CFG: Record<string, {
//   tagline: string;
//   sub: string;
// }> = {
//   'soft-girl':        { tagline: 'Bloom Into You',        sub: 'Soft. Sweet. Eternal.' },
//   'glam-look':        { tagline: 'Own The Room',          sub: 'Gilded. Bold. Unapologetic.' },
//   'island-girl':      { tagline: 'Salt & Spirit',         sub: 'Breezy. Free. Sun-kissed.' },
//   'office-jewellery': { tagline: 'Quiet Authority',       sub: 'Refined. Subtle. Powerful.' },
//   'maximalist':       { tagline: 'More Is More',          sub: 'Loud. Layered. Limitless.' },
//   'fairy-coded':      { tagline: 'Enchant Everything',    sub: 'Whimsical. Magical. Rare.' },
//   'men-street-edge':  { tagline: 'Street Edge',           sub: 'Bold. Raw. Unapologetic.' },
//   'men-corporate':    { tagline: 'Corporate Sharp',       sub: 'Refined. Sleek. Precise.' },
//   'men-island':       { tagline: 'Island King',           sub: 'Laid-back. Sun-kissed. Easy.' },
//   'men-minimal':      { tagline: 'Minimal Stack',         sub: 'Clean. Intentional. Strong.' },
//   'men-rocker':       { tagline: 'Rocker Noir',           sub: 'Dark. Sharp. Rebellious.' },
//   'men-gold':         { tagline: 'Gold Royalty',          sub: 'Rich. Heavy. Statement.' },
//   'street-edge':      { tagline: 'Street Edge',           sub: 'Bold. Raw. Unapologetic.' },
//   'corporate-sharp':  { tagline: 'Corporate Sharp',       sub: 'Refined. Sleek. Precise.' },
//   'island-king':      { tagline: 'Island King',           sub: 'Laid-back. Sun-kissed. Easy.' },
//   'minimal-stack':    { tagline: 'Minimal Stack',         sub: 'Clean. Intentional. Strong.' },
//   'rocker-noir':      { tagline: 'Rocker Noir',           sub: 'Dark. Sharp. Rebellious.' },
//   'gold-royalty':     { tagline: 'Gold Royalty',          sub: 'Rich. Heavy. Statement.' },
// };

// // Map the style IDs to the provided image file names
// const HERO_IMAGES: Record<string, string> = {
//   'soft-girl': '/soft-girl.jpg',
//   'glam-look': '/glam-look.jpg',
//   'island-girl': '/island-girl.jpg',
//   'office-jewellery': '/office-jewellery.jpg',
//   'maximalist': '/maximalist.jpg',
//   'fairy-coded': '/fairy-coded.jpg',
// };

// // Dark-background styles that need inverted UI chrome
// const DARK_STYLES = new Set(['maximalist', 'men-street-edge', 'street-edge', 'men-rocker', 'rocker-noir', 'men-gold', 'gold-royalty']);

// // ─── Product Card ─────────────────────────────────────────────────────────────
// function Card({ product, theme, index, isDark, sid }: {
//   product: Product; theme: StyleTheme; index: number; isDark: boolean; sid: string;
// }) {
//   const { addItem } = useCart();
//   const btnRef = useRef<HTMLButtonElement | null>(null);
//   const [added, setAdded] = useState(false);
//   const [hovered, setHovered] = useState(false);
//   const [imgIdx, setImgIdx] = useState(0);
//   const discount = product.originalPrice
//     ? Math.round((1 - product.price / product.originalPrice) * 100)
//     : null;

//   function handleAdd(e: MouseEvent<HTMLButtonElement>) {
//     e.preventDefault(); e.stopPropagation();
//     addItem({
//       id: String(product.id), sourceId: product.sourceId, name: product.name, price: product.price,
//       originalPrice: product.originalPrice ?? null,
//       image: product.images[0], color: product.colors[0].label,
//       colorHex: product.colors[0].hex,
//       sku: product.sku ?? `SKU-${product.id}`, href: product.href,
//     });
//     fireConfetti(btnRef.current);
//     setAdded(true);
//     setTimeout(() => setAdded(false), 1500);
//   }

//   const radius =
//     sid === 'fairy-coded' ? '14px' :
//     sid === 'glam-look'   ? '2px'  :
//     sid === 'maximalist'  ? '6px'  : '8px';

//   return (
//     <Link
//       href={product.href}
//       style={{ display:'block', textDecoration:'none', animationDelay:`${index * 0.045}s` }}
//       className="c-link"
//     >
//       <div
//         className="c-card"
//         style={{ borderRadius: radius }}
//         onMouseEnter={() => { setHovered(true); if (product.images[1]) setImgIdx(1); }}
//         onMouseLeave={() => { setHovered(false); setImgIdx(0); }}
//       >
//         <div className="c-img-wrap" style={{ borderRadius: `${radius} ${radius} 0 0` }}>
//           <img
//             src={product.images[imgIdx] || product.images[0]}
//             alt={product.name}
//             className="c-img"
//           />
//           {discount && <span className="c-disc">{discount}%</span>}
//           <div className={`c-scrim ${hovered ? 'on' : ''}`} />
//           <button
//             ref={btnRef}
//             className={`c-add-btn ${hovered ? 'show' : ''}`}
//             style={{ background: added ? '#2e7d32' : theme.accent }}
//             onClick={handleAdd}
//             aria-label="Add to cart"
//           >
//             {added
//               ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={isDark ? '#000' : '#fff'} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
//               : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={isDark ? '#000' : '#fff'} strokeWidth="2.2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
//             }
//           </button>
//         </div>
//         <div className="c-info">
//           <p className="c-name">{product.name}</p>
//           <div className="c-prow">
//             <span className="c-price">₹{product.price.toLocaleString('en-IN')}</span>
//             {product.originalPrice && (
//               <span className="c-orig">₹{product.originalPrice.toLocaleString('en-IN')}</span>
//             )}
//           </div>
//         </div>
//       </div>
//     </Link>
//   );
// }

// // ─── Main Page ────────────────────────────────────────────────────────────────
// export default function StyleProductPage({ styleId = 'soft-girl' }) {
//   const sid    = resolveStyleId(styleId);
//   const theme  = STYLE_THEMES[sid];
//   const cfg    = HERO_CFG[sid] ?? HERO_CFG['soft-girl'];
//   const isDark = DARK_STYLES.has(sid);
//   const [sort, setSort] = useState<SortOption>('default');
//   // Resolve the mapped background image (fallback to soft girl if missing)
//   const bgImage = HERO_IMAGES[sid] || HERO_IMAGES['soft-girl'];

//   const [filter, setFilter] = useState('all');
//   const [mounted, setMounted] = useState(false);
//   const [navH, setNavH] = useState(64);
//   const navRef = useRef<HTMLDivElement>(null);
//   const [dynamicProducts, setDynamicProducts] = useState<Product[]>([]);

//   useEffect(() => {
//     setMounted(true);
//     const measure = () => {
//       if (navRef.current) setNavH(navRef.current.offsetHeight);
//     };
//     measure();
//     window.addEventListener('resize', measure);
//     return () => window.removeEventListener('resize', measure);
//   }, []);

//   useEffect(() => {
//     let active = true;
//     fetchCatalogProducts()
//       .then((products) => { if (active) setDynamicProducts(products); })
//       .catch(()        => { if (active) setDynamicProducts([]); });
//     return () => { active = false; };
//   }, []);

//   const styleFn   = STYLE_PRODUCT_FILTER[sid] || (() => true);
//   const allStyle  = dynamicProducts.filter((product) => {
//     const styleSlug = 'styleSlug' in product ? (product as any).styleSlug : '';
//     const styleName = 'style'     in product ? (product as any).style     : '';
//     return styleSlug === sid || slugifyCatalog(styleName || '') === sid || styleFn(product);
//   });

// const products = useMemo(() => {
//   let list = [...allStyle];
//   if (filter !== 'all') list = list.filter(p => p.type === filter);
//   return sortProducts(list, sort);           // ← add this
// }, [allStyle, filter, sort]);               // ← add sort to deps

//   const count = (type: string) =>
//     type === 'all' ? allStyle.length : allStyle.filter(p => p.type === type).length;

//   return (
//     <>
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=${theme.googleFonts}&family=DM+Sans:wght@300;400;500;600;700&display=swap');

//         *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

//         .pg {
//           min-height: 100vh;
//           background: ${theme.bg};
//           color: ${theme.text};
//           font-family: 'DM Sans', sans-serif;
//           overflow-x: hidden;
//         }

//         /* ─────────────────────────────────────────────
//           HERO — Using purely the image with no filters
//         ───────────────────────────────────────────── */
//         .hero {
//           position: relative;
//           width: 100%;
//           padding: clamp(36px, 5vw, 60px) clamp(16px, 5vw, 64px) clamp(24px, 4vw, 48px);
//           padding-top: calc(${navH}px + clamp(60px, 6vw, 80px));
//           // background: url("${bgImage}") center/cover no-repeat;
//           overflow: hidden;
//           display: flex;
//           align-items: center;
//           justify-content: space-between;
//           gap: 20px;
//         }

//         .hero-left {
//           position:relative; z-index:2; flex:1; min-width:0;
//         }

//         .hero-pill {
//           display:inline-flex; align-items:center; gap:6px;
//           padding: 6px 14px 6px 10px;
//           border-radius:100px;
//           border: 1px solid ${theme.accent}40;
//           background: ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.55)'};
//           backdrop-filter:blur(8px);
//           font-size: 9.5px;
//           letter-spacing:0.3em; text-transform:uppercase;
//           color:${theme.accent}; font-weight:500;
//           margin-bottom:14px;
//           opacity:${mounted ? 1 : 0};
//           transition: opacity 0.5s ease;
//         }
//         .hero-pill-dot {
//           width: 6px; height: 6px;
//           border-radius:50%;
//           background:${theme.accent}; flex-shrink:0;
//         }

//         /* Added text-shadow to ensure visibility on top of the raw image */
//         .hero-title, .hero-sub, .hero-count-num, .hero-count-lbl {
//           text-shadow: ${isDark ? '0 2px 10px rgba(0,0,0,0.7), 0 0 20px rgba(0,0,0,0.5)' : '0 2px 10px rgba(255,255,255,0.8), 0 0 20px rgba(255,255,255,0.7)'};
//         }

//         .hero-title {
//           font-family: ${theme.displayFont};
//           font-size: clamp(1.7rem, 4vw, 3.2rem);
//           font-weight: ${isDark ? 700 : 300};
//           line-height:1.04;
//           letter-spacing: ${isDark ? '0.01em' : '-0.025em'};
//           color: ${theme.text};
//           opacity: ${mounted ? 1 : 0};
//           transform: translateY(${mounted ? 0 : 10}px);
//           transition: opacity 0.55s ease 0.08s, transform 0.55s ease 0.08s;
//         }
//         .hero-title em { font-style:italic; color:${theme.accent}; }
        
//         .hero-sub {
//           font-size: clamp(9px,1.3vw,11px);
//           letter-spacing:0.22em; text-transform:uppercase;
//           color:${theme.textMuted}; margin-top:7px; font-weight:600; /* Bumped weight slightly for image contrast */
//           opacity:${mounted ? 0.9 : 0};
//           transition: opacity 0.5s ease 0.16s;
//         }

//         .hero-count {
//           position:relative; z-index:2;
//           display:flex; flex-direction:column; align-items:flex-end;
//           flex-shrink:0;
//           opacity:${mounted ? 1 : 0};
//           transition: opacity 0.5s ease 0.2s;
//         }
//         .hero-count-num {
//           font-family: ${theme.displayFont};
//           font-size: clamp(2rem,5vw,4rem);
//           font-weight: ${isDark ? 600 : 500};
//           color: ${theme.text};
//           line-height:1; letter-spacing:-0.03em;
//           opacity:0.8; /* Increased opacity to read better over images */
//         }
//         .hero-count-lbl {
//           font-size:8px; letter-spacing:0.3em; text-transform:uppercase;
//           color:${theme.textMuted}; opacity:0.8; margin-top:2px; font-weight:700;
//         }
//         @media (max-width:480px) { .hero-count { display:none; } }

//         /* ─────────────────────────────────────────────
//           FILTER BAR
//         ───────────────────────────────────────────── */
//         .filters {
//           position:sticky; top:${navH}px; z-index:40;
//           background: ${isDark ? 'rgba(9,8,12,0.92)' : 'rgba(251,249,247,0.92)'};
//           backdrop-filter: blur(18px) saturate(180%);
//           border-bottom: 1px solid ${theme.border};
//           display:flex; align-items:center;
//           overflow-x:auto; scrollbar-width:none;
//           -webkit-overflow-scrolling:touch;
//           padding: 0 clamp(16px, 5vw, 64px);
//           /* FIX 1: Allow sort dropdown to overflow the sticky bar */
//           overflow: visible;
//         }
//         .filters::-webkit-scrollbar { display:none; }

//         /* FIX 1: Inner scroll container for the tabs only, so overflow:visible works on .filters */
//         .filters-tabs {
//           display: flex;
//           align-items: center;
//           overflow-x: auto;
//           scrollbar-width: none;
//           -webkit-overflow-scrolling: touch;
//           flex: 1;
//           min-width: 0;
//         }
//         .filters-tabs::-webkit-scrollbar { display: none; }

//         .ftab {
//           flex-shrink:0;
//           display:inline-flex; align-items:center; gap:6px;
//           padding: 12px 15px;
//           background:none; border:none;
//           border-bottom: 2px solid transparent;
//           font-family:'DM Sans',sans-serif;
//           font-size:9px; letter-spacing:0.24em; text-transform:uppercase;
//           color:${theme.textMuted}; cursor:pointer;
//           transition: color 0.17s, border-color 0.17s;
//           white-space:nowrap; font-weight:500;
//         }
//         .ftab:hover { color:${theme.accent}; }
//         .ftab.on { color:${theme.accent}; border-bottom-color:${theme.accent}; }
//         .fcount {
//           padding:1.5px 6px; border-radius:100px;
//           font-size:7.5px; font-weight:600;
//           background:${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'};
//           transition: background 0.17s, color 0.17s;
//         }
//         .ftab.on .fcount {
//           background:${theme.accent};
//           color:${isDark ? '#000' : '#fff'};
//         }

//         /* ─────────────────────────────────────────────
//           PRODUCT GRID
//         ───────────────────────────────────────────── */
//         .grid-wrap {
//           padding: clamp(20px,3.5vw,44px) clamp(16px,5vw,64px) clamp(44px,6vw,80px);
//         }
//         .grid {
//           display:grid;
//           grid-template-columns: repeat(4, 1fr);
//           gap: clamp(10px, 1.8vw, 18px);
//           width:100%;
//           /* FIX 2 & 3: Align all cards to start so varying content heights don't stretch neighbours */
//           align-items: start;
//         }
//         @media (max-width:1024px) {
//           .grid { grid-template-columns: repeat(3, 1fr); }
//         }
//         @media (max-width:640px) {
//   .grid { grid-template-columns: repeat(2, 1fr); gap:10px; align-items: stretch; }
//   .c-link { height: 100%; }
//   .c-card { height: 100%; display: flex; flex-direction: column; }
//   .c-img-wrap { flex: 1 0 auto; }
//   .c-info { flex-shrink: 0; }
// }

//         /* CARD */
//         .c-link { display:block; text-decoration:none; animation: fadeUp 0.5s ease both; }
//         @keyframes fadeUp {
//           from { opacity:0; transform:translateY(14px); }
//           to   { opacity:1; transform:translateY(0); }
//         }

//         .c-card {
//           background: ${theme.cardBg};
//           overflow:hidden;
//           border: 1px solid ${theme.border};
//           transition: transform 0.35s cubic-bezier(0.22,0.68,0,1.2), box-shadow 0.35s ease, border-color 0.2s;
//           box-shadow: ${isDark ? '0 2px 14px rgba(0,0,0,0.5)' : '0 1px 8px rgba(0,0,0,0.06)'};
//         }
//         .c-card:hover {
//           transform: translateY(-4px);
//           box-shadow: ${isDark ? '0 14px 44px rgba(0,0,0,0.65)' : '0 12px 36px rgba(0,0,0,0.11)'};
//           border-color: ${theme.accent}33;
//         }

//         .c-img-wrap {
//           position:relative;
//           aspect-ratio: 1 / 1;
//           overflow:hidden;
//           background: ${isDark ? '#0b0a13' : theme.bgAlt};
//           display:block;
//         }
//         .c-img {
//           width:100%; height:100%;
//           object-fit:cover; object-position:center;
//           display:block;
//           transition: transform 0.6s cubic-bezier(0.22,0.68,0,1.2);
//         }
//         .c-card:hover .c-img { transform:scale(1.06); }

//         .c-scrim {
//           position:absolute; inset:0;
//           background: linear-gradient(to top, rgba(0,0,0,0.42) 0%, transparent 55%);
//           opacity:0; transition: opacity 0.28s ease;
//           pointer-events:none;
//         }
//         .c-scrim.on { opacity:1; }

//         .c-disc {
//           position:absolute; top:8px; left:8px;
//           font-size:8px; font-weight:700;
//           letter-spacing:0.08em; text-transform:uppercase;
//           background:${theme.accent}; color:${isDark ? '#000' : '#fff'};
//           padding: 3px 8px 2px; border-radius:2px;
//         }

//         .c-add-btn {
//           position:absolute; bottom:8px; right:8px;
//           width:30px; height:30px; border-radius:50%;
//           border:none; cursor:pointer;
//           display:flex; align-items:center; justify-content:center;
//           opacity:0; transform: scale(0.75) translateY(4px);
//           transition: opacity 0.22s ease, transform 0.22s ease;
//           box-shadow: 0 2px 10px rgba(0,0,0,0.3);
//           flex-shrink:0;
//         }
//         .c-add-btn.show {
//           opacity:1; transform: scale(1) translateY(0);
//         }
//         .c-add-btn:hover { transform: scale(1.1) !important; }
//         .c-add-btn:active { transform: scale(0.95) !important; }

//         .c-info {
//           padding: 9px 10px 11px;
//         }
//         .c-name {
//           font-family: ${theme.displayFont};
//           font-size: clamp(10.5px, 1vw, 13px);
//           font-weight: ${isDark ? 400 : 300};
//           color: ${theme.text};
//           line-height:1.3;
//           white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
//           margin-bottom:4px; letter-spacing:0.01em;
//         }
//         .c-prow { display:flex; align-items:baseline; gap:5px; }
//         .c-price {
//           font-size: clamp(11px, 1.1vw, 13px);
//           font-weight:500; color:${theme.text}; letter-spacing:0.01em;
//         }
//         .c-orig {
//           font-size:10px; color:${theme.textMuted};
//           text-decoration:line-through; opacity:0.5;
//         }

//         .empty {
//           grid-column:1/-1; text-align:center; padding:80px 20px; opacity:0.3;
//         }
//         .empty-icon { font-size:38px; display:block; margin-bottom:12px; }
//         .empty-msg {
//           font-family:${theme.displayFont}; font-size:15px;
//           font-style:italic; color:${theme.textMuted};
//         }

//         /* ── SOFT GIRL OVERRIDES ── */
//         ${sid === 'soft-girl' ? `
//           .hero-title, .hero-count-num { color: #2A110D !important; }
//           .hero-sub, .hero-count-lbl { color: #5C3228 !important; }
//         ` : ''}

//         /* ── GLAM LOOK OVERRIDES ── */
//         ${sid === 'glam-look' ? `
//           .pg { background: #D3D3D3 !important; color: #000 !important; }
//           .hero-title { color: #000 !important; font-weight: 500 !important; }
//           .hero-count-num, .c-name, .c-price { color: #000 !important; }
//           .hero-sub, .hero-count-lbl, .ftab, .empty-msg { color: #333 !important; }
//           .c-card { background: #E8E8E8 !important; border-color: #A9A9A9 !important; }
//           .c-orig { color: #555 !important; }
//           .filters { background: rgba(211, 211, 211, 0.92) !important; border-bottom: 1px solid #A9A9A9 !important; }
//           .ftab.on { color: #000 !important; border-bottom-color: #000 !important; font-weight: 700 !important; }
//           .ftab.on .fcount { background: #000 !important; color: #fff !important; }
//         ` : ''}
//         /* ── SortFilter theme override — matches page accent ── */
// .filters .sf-trigger {
//   --sf-accent: ${theme.accent};
//   --sf-bdr: ${theme.accent}40;
//   --sf-bg: ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.7)'};
//   --sf-bg-hover: ${isDark ? 'rgba(255,255,255,0.12)' : theme.accent + '15'};
//   --sf-txt: ${theme.text};
//   --sf-bdr-hover: ${theme.accent}80;
//   --sf-gold: ${theme.accent};
// }
// .filters .sf-trigger.sf-active {
//   background: ${theme.accent} !important;
//   color: ${isDark ? '#000' : '#fff'} !important;
//   border-color: ${theme.accent} !important;
// }
// .filters .sf-option.sf-option-active {
//   background: ${theme.accent} !important;
//   color: ${isDark ? '#000' : '#fff'} !important;
// }
// .filters .sf-option:hover:not(.sf-option-active) {
//   background: ${theme.accent}18 !important;
//   color: ${theme.accent} !important;
// }
// /* FIX 1: Ensure sort dropdown wrapper has high z-index and is not clipped */
// .filters .sf-wrap { position: relative; z-index: 9999; }
// .filters .sf-dropdown { z-index: 9999; }
//       `}</style>

//       <div className="pg">
//         {/* ── NAVBAR (always at the very top) ── */}
//         <div ref={navRef}>
//           <UpperNav />
//         </div>

//         {/* ── COMPACT HERO ── */}
//         <div className="hero"   style={{ 
//     backgroundImage: `url('/style-heroes/${sid}.jpg')`,
//     backgroundSize: 'cover',
//     backgroundPosition: 'center 20%'  
//   }}>
//           <div className="hero-left">
//             <div className="hero-pill">
//               <span className="hero-pill-dot" />
//               {theme.emoji}&nbsp;{theme.name}
//             </div>
//             <h1 className="hero-title">
//               <em>{cfg.tagline}</em>
//             </h1>
//             <p className="hero-sub">{cfg.sub}</p>
//           </div>
//           <div className="hero-count">
//             <span className="hero-count-num">{allStyle.length}</span>
//             <span className="hero-count-lbl">pieces</span>
//           </div>
//         </div>

//         {/* ── FILTER BAR ── */}
//         {/* FIX 1: Tabs go inside .filters-tabs (scrollable), sort stays outside so dropdown can overflow */}
//         <div className="filters">
//           <div className="filters-tabs">
//             {FILTER_TABS.map(tab => (
//               <button
//                 key={tab.value}
//                 className={`ftab ${filter === tab.value ? 'on' : ''}`}
//                 onClick={() => setFilter(tab.value)}
//               >
//                 {tab.label}
//                 <span className="fcount">{count(tab.value)}</span>
//               </button>
//             ))}
//           </div>
//           {/* Sort — pushed to the right, outside the scrollable tabs so dropdown isn't clipped */}
//           <div style={{ flexShrink: 0, paddingLeft: '12px', paddingRight: 'clamp(16px, 5vw, 64px)', position: 'relative', zIndex: 9999 }}>
//             <SortFilter
//               value={sort}
//               onChange={setSort}
//               variant={isDark ? 'dark' : sid === 'glam-look' ? 'glam' : 'olive'}
//             />
//           </div>
//         </div>

//         {/* ── PRODUCT GRID ── */}
//         <div className="grid-wrap">
//           <div className="grid">
//             {products.length === 0 ? (
//               <div className="empty">
//                 <span className="empty-icon">{theme.emoji}</span>
//                 <p className="empty-msg">Nothing here yet</p>
//               </div>
//             ) : (
//               products.map((p, i) => (
//                 <Card key={p.id} product={p} theme={theme} index={i} isDark={isDark} sid={sid} />
//               ))
//             )}
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }




'use client';

import {
  useState, useMemo, useEffect, useRef,
  type MouseEvent
} from 'react';
import { FILTER_TABS } from '@/lib/products';
import { fetchCatalogProducts, slugifyCatalog, type CatalogProduct } from '@/lib/catalogApi';
import { useCart } from '@/lib/cartContext';
import { fireConfetti } from '@/components/cart/ConfettiManager';
import UpperNav from '@/components/ui/UpperNav';
import Link from 'next/link';
import SortFilter, { sortProducts, type SortOption } from '@/components/ui/SortFilter';

// ─── Types ────────────────────────────────────────────────────────────────────
type Product = CatalogProduct;

// ─── Unified Design Tokens — Green & Beige Pastel ────────────────────────────
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

// ─── Style label lookup (hero pill only) ─────────────────────────────────────
const STYLE_LABELS: Record<string, { name: string; tagline: string; sub: string }> = {
  'soft-girl':        { name: 'Soft Girl',        tagline: 'Bloom Into You',     sub: 'Soft. Sweet. Eternal.'       },
  'glam-look':        { name: 'Glam Look',        tagline: 'Own The Room',       sub: 'Gilded. Bold. Unapologetic.' },
  'island-girl':      { name: 'Island Girl',      tagline: 'Salt & Spirit',      sub: 'Breezy. Free. Sun-kissed.'   },
  'office-jewellery': { name: 'Office Jewellery', tagline: 'Quiet Authority',    sub: 'Refined. Subtle. Powerful.'  },
  'maximalist':       { name: 'Maximalist',       tagline: 'More Is More',       sub: 'Loud. Layered. Limitless.'   },
  'fairy-coded':      { name: 'Fairy Coded',      tagline: 'Enchant Everything', sub: 'Whimsical. Magical. Rare.'    },
  'men-street-edge':  { name: 'Street Edge',      tagline: 'Street Edge',        sub: 'Bold. Raw. Unapologetic.',    },
  'men-corporate':    { name: 'Corporate Sharp',  tagline: 'Corporate Sharp',    sub: 'Refined. Sleek. Precise.'    },
  'men-island':       { name: 'Island King',      tagline: 'Island King',        sub: 'Laid-back. Sun-kissed.'       },
  'men-minimal':      { name: 'Minimal Stack',    tagline: 'Minimal Stack',      sub: 'Clean. Intentional. Strong.' },
  'men-rocker':       { name: 'Rocker Noir',      tagline: 'Rocker Noir',        sub: 'Dark. Sharp. Rebellious.'    },
  'men-gold':         { name: 'Gold Royalty',     tagline: 'Gold Royalty',       sub: 'Rich. Heavy. Statement.'     },
};

const DEFAULT_LABEL = {
  name: 'Collection', tagline: 'Curated For You',
  sub: 'Handpicked. Crafted. Yours.', emoji: '🌿',
};

const ALL_STYLE_IDS = Object.keys(STYLE_LABELS);

function resolveStyleId(raw: string | undefined | null): string {
  if (!raw) return 'soft-girl';
  if (ALL_STYLE_IDS.includes(raw)) return raw;
  const kebab = raw
    .replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
    .replace(/[\s_]+/g, '-').replace(/-+/g, '-').trim();
  if (ALL_STYLE_IDS.includes(kebab)) return kebab;
  const lower = raw.toLowerCase();
  return ALL_STYLE_IDS.find(id => id.split('-').every(w => lower.includes(w))) ?? 'soft-girl';
}

// ─── Product Card ─────────────────────────────────────────────────────────────
function Card({ product, index }: { product: Product; index: number }) {
  const { addItem } = useCart();
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const [added, setAdded]     = useState(false);
  const [hovered, setHovered] = useState(false);
  const [imgIdx, setImgIdx]   = useState(0);

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  function handleAdd(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: String(product.id),
      sourceId: product.sourceId,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice ?? null,
      image: product.images[0],
      color: product.colors[0].label,
      colorHex: product.colors[0].hex,
      sku: product.sku ?? `SKU-${product.id}`,
      href: product.href,
    });
    fireConfetti(btnRef.current);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <Link
      href={product.href}
      style={{ display: 'block', textDecoration: 'none', animationDelay: `${index * 0.04}s` }}
      className="c-link"
    >
      <article
        className="c-card"
        onMouseEnter={() => { setHovered(true); if (product.images[1]) setImgIdx(1); }}
        onMouseLeave={() => { setHovered(false); setImgIdx(0); }}
      >
        {/* 4:6 ratio → aspect-ratio: 2/3 */}
        <div className="c-img-wrap">
          <img
            src={product.images[imgIdx] || product.images[0]}
            alt={product.name}
            className="c-img"
            loading="lazy"
          />
          {discount && <span className="c-disc">–{discount}%</span>}
          <div className={`c-scrim${hovered ? ' on' : ''}`} />
          <button
            ref={btnRef}
            className={`c-add-btn${hovered ? ' show' : ''}${added ? ' done' : ''}`}
            onClick={handleAdd}
            aria-label="Add to cart"
          >
            {added ? (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            )}
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
        </div>
      </article>
    </Link>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function StyleProductPage({ styleId = 'soft-girl' }: { styleId?: string }) {
  const sid   = resolveStyleId(styleId);
  const label = STYLE_LABELS[sid] ?? DEFAULT_LABEL;

  const [sort, setSort]       = useState<SortOption>('default');
  const [filter, setFilter]   = useState('all');
  const [mounted, setMounted] = useState(false);
  const [navH, setNavH]       = useState(64);
  const navRef                = useRef<HTMLDivElement>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  useEffect(() => {
    setMounted(true);
    const measure = () => { if (navRef.current) setNavH(navRef.current.offsetHeight); };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  useEffect(() => {
    let active = true;
    fetchCatalogProducts()
      .then(p  => { if (active) setAllProducts(p); })
      .catch(() => { if (active) setAllProducts([]); });
    return () => { active = false; };
  }, []);

  const allStyle = useMemo(() => {
    return allProducts.filter(product => {
      const styleSlug = 'styleSlug' in product ? (product as any).styleSlug : '';
      const styleName = 'style'     in product ? (product as any).style     : '';
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

  // CSS injected as a template literal — fully static, no per-style variation
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=DM+Sans:wght@300;400;500;600;700&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    /* PAGE */
    .pg {
      min-height: 100vh;
      background: ${THEME.bg};
      color: ${THEME.text};
      font-family: ${THEME.bodyFont};
      overflow-x: hidden;
    }

    /* HERO */
    .hero {
      position: relative;
      width: 100%;
      padding: clamp(40px, 6vw, 72px) clamp(20px, 6vw, 72px) clamp(28px, 4vw, 48px);
      padding-top: calc(${navH}px + clamp(48px, 5vw, 64px));
      background: ${THEME.bg};
      border-bottom: 1px solid ${THEME.border};
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 24px;
      overflow: hidden;
    }

    /* grain texture */
    .hero::before {
      content: '';
      position: absolute;
      inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.025'/%3E%3C/svg%3E");
      pointer-events: none;
    }

    /* decorative ring */
    .hero::after {
      content: '';
      position: absolute;
      right: clamp(60px, 10vw, 140px);
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
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 5px 14px 5px 9px;
      border-radius: 100px;
      border: 1px solid ${THEME.accentMist};
      background: ${THEME.accentMist};
      font-size: 9px;
      letter-spacing: 0.28em;
      text-transform: uppercase;
      color: ${THEME.accent};
      font-weight: 600;
      margin-bottom: 16px;
      opacity: ${mounted ? 1 : 0};
      transition: opacity 0.4s ease;
    }

    .hero-pill-dot {
      width: 5px; height: 5px;
      border-radius: 50%;
      background: ${THEME.accent};
      flex-shrink: 0;
    }

    .hero-title {
      font-family: ${THEME.displayFont};
      font-size: clamp(2rem, 5vw, 4rem);
      font-weight: 300;
      line-height: 1.05;
      letter-spacing: -0.02em;
      color: ${THEME.text};
      opacity: ${mounted ? 1 : 0};
      transform: translateY(${mounted ? 0 : 12}px);
      transition: opacity 0.5s ease 0.07s, transform 0.5s ease 0.07s;
    }

    .hero-title em { font-style: italic; color: ${THEME.accent}; }

    .hero-sub {
      font-size: 10px;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: ${THEME.textMuted};
      margin-top: 8px;
      font-weight: 500;
      opacity: ${mounted ? 1 : 0};
      transition: opacity 0.5s ease 0.14s;
    }

    .hero-rule {
      width: 36px; height: 1px;
      background: ${THEME.accent};
      margin-top: 14px; opacity: 0.4;
    }

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
      font-weight: 300;
      color: ${THEME.accent};
      line-height: 1;
      letter-spacing: -0.04em;
    }

    .hero-count-lbl {
      font-size: 8px; letter-spacing: 0.3em;
      text-transform: uppercase;
      color: ${THEME.textMuted};
      margin-top: 2px; font-weight: 600;
    }

    @media (max-width: 480px) { .hero-right { display: none; } }

    /* FILTER BAR */
    .filters {
      position: sticky;
      top: ${navH}px;
      z-index: 40;
      background: rgba(245, 242, 236, 0.95);
      backdrop-filter: blur(16px) saturate(160%);
      border-bottom: 1px solid ${THEME.border};
      display: flex;
      align-items: stretch;
      overflow: visible;
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
      font-size: 8.5px; letter-spacing: 0.26em;
      text-transform: uppercase;
      color: ${THEME.textMuted};
      cursor: pointer;
      transition: color 0.15s, border-color 0.15s;
      white-space: nowrap; font-weight: 500;
    }
    .ftab:hover { color: ${THEME.accent}; }
    .ftab.on { color: ${THEME.accent}; border-bottom-color: ${THEME.accent}; }

    .fcount {
      padding: 2px 6px; border-radius: 100px;
      font-size: 7px; font-weight: 700;
      background: ${THEME.accentMist};
      color: ${THEME.accent};
      transition: background 0.15s, color 0.15s;
      letter-spacing: 0.05em;
    }
    .ftab.on .fcount { background: ${THEME.accent}; color: #fff; }

    .filters-sort {
      flex-shrink: 0;
      display: flex; align-items: center;
      margin-left: auto;
      padding-left: 16px;
      position: relative; z-index: 9999;
    }

    /* PRODUCT GRID */
    .grid-wrap {
      padding: clamp(24px, 4vw, 48px) clamp(20px, 6vw, 72px) clamp(48px, 7vw, 96px);
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: clamp(12px, 1.8vw, 20px);
      align-items: start;
    }

    @media (max-width: 1100px) { .grid { grid-template-columns: repeat(3, 1fr); } }
    @media (max-width: 720px)  { .grid { grid-template-columns: repeat(2, 1fr); gap: 10px; } }

    /* CARD */
    .c-link {
      display: block; text-decoration: none;
      animation: fadeUp 0.45s ease both;
    }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .c-card {
      background: ${THEME.cardBg};
      border-radius: 6px;
      overflow: hidden;
      border: 1px solid ${THEME.borderSoft};
      transition: transform 0.3s cubic-bezier(0.22, 0.68, 0, 1.2),
                  box-shadow 0.3s ease, border-color 0.2s;
      box-shadow: 0 1px 6px rgba(74,124,89,0.04), 0 4px 18px rgba(28,43,30,0.04);
    }
    .c-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 32px rgba(74,124,89,0.12), 0 2px 8px rgba(28,43,30,0.06);
      border-color: ${THEME.accentMist};
    }

    /* 4:6 = width:height = 2:3 */
    .c-img-wrap {
      position: relative;
      aspect-ratio: 2 / 3;
      overflow: hidden;
      background: ${THEME.bgAlt};
    }

    .c-img {
      width: 100%; height: 100%;
      object-fit: cover; object-position: center top;
      display: block;
      transition: transform 0.55s cubic-bezier(0.22, 0.68, 0, 1.2);
    }
    .c-card:hover .c-img { transform: scale(1.04); }

    .c-scrim {
      position: absolute; inset: 0;
      background: linear-gradient(to top, rgba(28,43,30,0.36) 0%, transparent 50%);
      opacity: 0; transition: opacity 0.25s ease; pointer-events: none;
    }
    .c-scrim.on { opacity: 1; }

    .c-disc {
      position: absolute; top: 10px; left: 10px;
      font-size: 7.5px; font-weight: 700;
      letter-spacing: 0.1em; text-transform: uppercase;
      background: ${THEME.accent}; color: #fff;
      padding: 3px 8px 2px; border-radius: 3px;
    }

    .c-add-btn {
      position: absolute; bottom: 10px; right: 10px;
      width: 32px; height: 32px; border-radius: 50%;
      border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      opacity: 0; transform: scale(0.8) translateY(4px);
      transition: opacity 0.2s ease, transform 0.2s ease, background 0.2s;
      background: ${THEME.accent}; color: #fff;
      box-shadow: 0 2px 12px rgba(74,124,89,0.35);
    }
    .c-add-btn.show  { opacity: 1; transform: scale(1) translateY(0); }
    .c-add-btn.done  { background: #2e7d32; }
    .c-add-btn:hover  { transform: scale(1.1) !important; }
    .c-add-btn:active { transform: scale(0.94) !important; }

    .c-info { padding: 10px 12px 13px; }

    .c-name {
      font-family: ${THEME.displayFont};
      font-size: clamp(12px, 1.1vw, 14px);
      font-weight: 400; color: ${THEME.text};
      line-height: 1.35;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      margin-bottom: 4px; letter-spacing: 0.01em;
    }

    .c-prow { display: flex; align-items: baseline; gap: 6px; }

    .c-price {
      font-size: 12px; font-weight: 600;
      color: ${THEME.text}; letter-spacing: 0.02em;
    }

    .c-orig {
      font-size: 10px; color: ${THEME.textMuted};
      text-decoration: line-through; opacity: 0.55;
    }

    /* EMPTY */
    .empty {
      grid-column: 1 / -1; text-align: center;
      padding: 96px 20px; opacity: 0.5;
    }
    .empty-icon { font-size: 36px; display: block; margin-bottom: 14px; }
    .empty-msg {
      font-family: ${THEME.displayFont};
      font-size: 16px; font-style: italic;
      color: ${THEME.textMuted};
    }

    /* SORT FILTER OVERRIDES */
    .filters-sort .sf-trigger {
      --sf-accent: ${THEME.accent};
      --sf-bdr: ${THEME.border};
      --sf-bg: ${THEME.cardBg};
      --sf-bg-hover: ${THEME.accentMist};
      --sf-txt: ${THEME.text};
      --sf-bdr-hover: ${THEME.accent};
      --sf-gold: ${THEME.accent};
      border-radius: 4px;
      font-size: 8.5px;
      letter-spacing: 0.22em;
    }
    .filters-sort .sf-trigger.sf-active {
      background: ${THEME.accent} !important;
      color: #fff !important;
      border-color: ${THEME.accent} !important;
    }
    .filters-sort .sf-option.sf-option-active {
      background: ${THEME.accent} !important;
      color: #fff !important;
    }
    .filters-sort .sf-option:hover:not(.sf-option-active) {
      background: ${THEME.accentMist} !important;
      color: ${THEME.accent} !important;
    }
    .filters-sort .sf-wrap { position: relative; z-index: 9999; }
    .filters-sort .sf-dropdown { z-index: 9999; }

    /* MOBILE */
    @media (max-width: 640px) {
      .hero   { padding-left: 20px; padding-right: 20px; }
      .filters { padding: 0 20px; }
      .grid-wrap { padding: 20px 16px 64px; }
    }
  `;

  return (
    <>
      <style>{css}</style>

      <div className="pg">
        {/* NAVBAR */}
        <div ref={navRef}>
          <UpperNav />
        </div>

        {/* HERO */}
        <header className="hero">
          <div className="hero-left">
            <div className="hero-pill">
              <span className="hero-pill-dot" />
              &nbsp;{label.name}
            </div>
            <h1 className="hero-title">
              <em>{label.tagline}</em>
            </h1>
            <p className="hero-sub">{label.sub}</p>
            <div className="hero-rule" />
          </div>
          <div className="hero-right">
            <span className="hero-count-num">{allStyle.length}</span>
            <span className="hero-count-lbl">pieces</span>
          </div>
        </header>

        {/* FILTER BAR */}
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

        {/* PRODUCT GRID */}
        <main className="grid-wrap">
          <div className="grid">
            {products.length === 0 ? (
              <div className="empty">
                {/* <span className="empty-icon">{label.emoji}</span> */}
                <p className="empty-msg">Nothing here yet — check back soon</p>
              </div>
            ) : (
              products.map((p, i) => (
                <Card key={p.id} product={p} index={i} />
              ))
            )}
          </div>
        </main>
      </div>
    </>
  );
}