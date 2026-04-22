// 'use client';

// import { useState, useMemo, useEffect, useRef, type CSSProperties, type MouseEvent } from 'react';
// import { ALL_PRODUCTS, FILTER_TABS } from '@/lib/products';
// import { STYLE_THEMES, STYLE_PRODUCT_FILTER } from '@/lib/styleThemes';
// import { useCart } from '@/lib/cartContext';
//   import { fireConfetti } from '@/components/cart/ConfettiManager';
// import Link from "next/link";

// type StyleId = keyof typeof STYLE_THEMES;  
// type StyleTheme = (typeof STYLE_THEMES)[StyleId];
// type Product = (typeof ALL_PRODUCTS)[number];
// type ProductColor = Product['colors'][number];

// function resolveStyleId(styleId: string): StyleId {
//   return (styleId in STYLE_THEMES ? styleId : 'soft-girl') as StyleId;
// }

// // ─── Star Rating ───────────────────────────────────────────────────────────────
// function StarRating({ rating, theme }: { rating: number; theme: StyleTheme }) {
//   return (
//     <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
//       {[1,2,3,4,5].map(i => (
//         <svg key={i} width="10" height="10" viewBox="0 0 24 24" fill={i <= Math.round(rating) ? theme.gold : 'none'} stroke={theme.gold} strokeWidth="1.5">
//           <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
//         </svg>
//       ))}
//     </div>
//   );
// }

// // ─── Product Card — adapts to theme ───────────────────────────────────────────
// function StyleProductCard({ product, theme, index }: { product: Product; theme: StyleTheme; index: number }) {
//   const { addItem } = useCart();
// const btnRef = useRef<HTMLButtonElement | null>(null);
// const [btnAdded, setBtnAdded] = useState(false);
//   const [hovered, setHovered] = useState(false);
//   const [imgIdx, setImgIdx] = useState(0);
//   const discount = product.originalPrice
//     ? Math.round((1 - product.price / product.originalPrice) * 100)
//     : null;

//   const isDark = ['glam-look', 'maximalist'].includes(theme.id);

//  function handleQuickAdd(e: MouseEvent<HTMLButtonElement>) {
//   e.preventDefault();   // stops navigation
//   e.stopPropagation();

//   addItem({
//     id: product.id,
//     name: product.name,
//     price: product.price,
//     originalPrice: product.originalPrice ?? null,
//     image: product.images[0],
//     color: product.colors[0].label,
//     colorHex: product.colors[0].hex,
//     sku: product.sku ?? `SKU-${product.id}`,
//     href: product.href,
//   });

//   fireConfetti(btnRef.current);

//   setBtnAdded(true);
//   setTimeout(() => setBtnAdded(false), 1500);
// }

// const cardStyle = {
//   animationDelay: `${index * 0.07}s`,
//   '--card-bg': theme.cardBg,
//   '--card-border': theme.border,
//   '--card-text': theme.text,
//   '--card-muted': theme.textMuted,
//   '--card-gold': theme.gold,
//   '--card-accent': theme.accent,
//   '--card-shadow': isDark
//     ? `0 20px 60px rgba(0,0,0,0.5)`
//     : `0 8px 40px rgba(0,0,0,0.08)`,
//   '--card-hover-shadow': isDark
//     ? `0 28px 80px rgba(0,0,0,0.65)`
//     : `0 16px 60px rgba(0,0,0,0.14)`,
// } as CSSProperties & Record<'--card-bg' | '--card-border' | '--card-text' | '--card-muted' | '--card-gold' | '--card-accent' | '--card-shadow' | '--card-hover-shadow', string>;

// return (
//   <Link href={product.href}>
//     <div
//       className="sp-card"
//       onMouseEnter={() => { setHovered(true); if (product.images[1]) setImgIdx(1); }}
//       onMouseLeave={() => { setHovered(false); setImgIdx(0); }}
//       style={cardStyle}
//     >
        
//       {/* Image */}
//       <div className="sp-card-img-wrap">
//         <img
//           src={product.images[imgIdx] || product.images[0]}
//           alt={product.name}
//           className="sp-card-img"
//         />
//         {discount && (
//           <span className="sp-card-discount">{discount}% OFF</span>
//         )}
//         {product.badge && (
//           <span className="sp-card-badge">{product.badge}</span>
//         )}
//         {/* Overlay CTA */}
//         <div className={`sp-card-overlay ${hovered ? 'show' : ''}`}>
//           <button
//   ref={btnRef}
//   className="sp-card-quick-add"
//   onClick={handleQuickAdd}
//   style={{ background: btnAdded ? '#2e7d32' : undefined }}
// >
//   {btnAdded ? '✓ Added!' : 'Quick Add'}
// </button>
//         </div>
//       </div>

//       {/* Info */}
//       <div className="sp-card-body">
//         <div className="sp-card-type">{product.type}</div>
//         <h3 className="sp-card-name">{product.name}</h3>
//         <div className="sp-card-rating-row">
//           <StarRating rating={product.rating} theme={theme} />
//           <span className="sp-card-review-count">({product.reviewCount})</span>
//         </div>

//         {/* Colors */}
//         <div className="sp-card-colors">
//           {product.colors.slice(0, 4).map((c: ProductColor, i: number) => (
//             <span
//               key={i}
//               className="sp-card-color-dot"
//               title={c.label}
//               style={{ background: c.hex }}
//             />
//           ))}
//         </div>

//         <div className="sp-card-price-row">
//           <span className="sp-card-price">₹{product.price.toLocaleString('en-IN')}</span>
//           {product.originalPrice && (
//             <span className="sp-card-original">₹{product.originalPrice.toLocaleString('en-IN')}</span>
//           )}
//         </div>

//         {product.stock <= 10 && (
//           <p className="sp-card-stock">Only {product.stock} left</p>
//         )}
//       </div>
//     </div>
//       </Link>
// );

// }

// // ─── Hero Backgrounds per style ────────────────────────────────────────────────
// const HERO_DECORATIONS = {
//   'soft-girl': () => (
//     <>
//       <div style={{
//         position:'absolute', top:'-20%', right:'-5%',
//         width:'500px', height:'500px', borderRadius:'50%',
//         background: 'radial-gradient(circle, rgba(232,196,184,0.3) 0%, transparent 70%)',
//         pointerEvents:'none',
//       }}/>
//       <div style={{
//         position:'absolute', bottom:'-10%', left:'-8%',
//         width:'350px', height:'350px', borderRadius:'50%',
//         background: 'radial-gradient(circle, rgba(255,200,180,0.2) 0%, transparent 70%)',
//         pointerEvents:'none',
//       }}/>
//       {/* Floating petals */}
//       {['🌸','🌺','🌷','✿'].map((p,i) => (
//         <div key={i} className="hero-float-el" style={{
//           position:'absolute',
//           top: `${15 + i*20}%`,
//           right: `${5 + i*8}%`,
//           fontSize: `${24 - i*3}px`,
//           opacity: 0.15,
//           animationDelay: `${i*0.8}s`,
//         }}>{p}</div>
//       ))}
//     </>
//   ),
//   'glam-look': () => (
//     <>
//       <div style={{
//         position:'absolute', top:0, left:0, right:0, height:'100%',
//         background:'linear-gradient(to bottom, rgba(212,175,55,0.08) 0%, transparent 100%)',
//         pointerEvents:'none',
//       }}/>
//       {/* Sparkle dots */}
//       {Array.from({length:20}).map((_,i) => (
//         <div key={i} className="glam-spark" style={{
//           position:'absolute',
//           left:`${Math.random()*100}%`,
//           top:`${Math.random()*100}%`,
//           width: `${2+Math.random()*3}px`,
//           height: `${2+Math.random()*3}px`,
//           borderRadius:'50%',
//           background:'#d4af37',
//           opacity: 0.3 + Math.random()*0.4,
//           animationDelay: `${Math.random()*3}s`,
//         }}/>
//       ))}
//     </>
//   ),
//   'island-girl': () => (
//     <>
//       <div style={{
//         position:'absolute', bottom:0, left:0, right:0, height:'3px',
//         background:'linear-gradient(90deg, transparent, rgba(58,140,114,0.4), transparent)',
//         pointerEvents:'none',
//       }}/>
//       <div style={{
//         position:'absolute', top:'-30%', right:'-10%',
//         width:'600px', height:'600px', borderRadius:'50%',
//         background:'radial-gradient(circle, rgba(58,140,114,0.12) 0%, transparent 70%)',
//         pointerEvents:'none',
//       }}/>
//       {['🌊','🐚','🌿','☀️'].map((e,i) => (
//         <div key={i} className="hero-float-el" style={{
//           position:'absolute',
//           top:`${10+i*22}%`, right:`${8+i*6}%`,
//           fontSize:`${26-i*2}px`, opacity:0.12,
//           animationDelay:`${i*1.2}s`,
//         }}>{e}</div>
//       ))}
//     </>
//   ),
//   'office-jewellery': () => (
//     <>
//       <div style={{
//         position:'absolute', left:0, top:0, bottom:0, width:'4px',
//         background:'linear-gradient(to bottom, transparent, rgba(74,74,82,0.15), transparent)',
//         pointerEvents:'none',
//       }}/>
//       {/* Grid lines */}
//       {[20,40,60,80].map(p => (
//         <div key={p} style={{
//           position:'absolute', left:0, right:0, top:`${p}%`,
//           height:'1px',
//           background:'rgba(74,74,82,0.04)',
//           pointerEvents:'none',
//         }}/>
//       ))}
//     </>
//   ),
//   'maximalist': () => (
//     <>
//       <div style={{
//         position:'absolute', top:'-20%', left:'-5%',
//         width:'600px', height:'600px', borderRadius:'50%',
//         background:'radial-gradient(circle, rgba(255,107,43,0.18) 0%, transparent 70%)',
//         pointerEvents:'none',
//       }}/>
//       <div style={{
//         position:'absolute', bottom:'-10%', right:'-5%',
//         width:'400px', height:'400px', borderRadius:'50%',
//         background:'radial-gradient(circle, rgba(240,160,48,0.15) 0%, transparent 70%)',
//         pointerEvents:'none',
//       }}/>
//       {['👑','💎','⚡','🔥'].map((e,i) => (
//         <div key={i} className="hero-float-el" style={{
//           position:'absolute',
//           top:`${8+i*22}%`, left:`${3+i*5}%`,
//           fontSize:`${30-i*3}px`, opacity:0.1,
//           animationDelay:`${i*0.6}s`,
//         }}>{e}</div>
//       ))}
//     </>
//   ),
//   'fairy-coded': () => (
//     <>
//       <div style={{
//         position:'absolute', inset:0,
//         background:'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(155,114,207,0.12) 0%, transparent 60%)',
//         pointerEvents:'none',
//       }}/>
//       {Array.from({length:12}).map((_,i) => (
//         <div key={i} className="fairy-dust" style={{
//           position:'absolute',
//           left:`${Math.random()*100}%`,
//           top:`${Math.random()*100}%`,
//           fontSize:`${8+Math.random()*8}px`,
//           opacity: 0.15 + Math.random()*0.2,
//           animationDelay:`${Math.random()*4}s`,
//         }}>✦</div>
//       ))}
//       {['🧚','🌙','⭐','🪄'].map((e,i) => (
//         <div key={i} className="hero-float-el" style={{
//           position:'absolute',
//           top:`${12+i*20}%`, right:`${4+i*7}%`,
//           fontSize:`${24-i*2}px`, opacity:0.12,
//           animationDelay:`${i*1.0}s`,
//         }}>{e}</div>
//       ))}
//     </>
//   ),
// };

// // ─── Main Component ────────────────────────────────────────────────────────────
// export default function StyleProductPage({ styleId = 'soft-girl' }) {
//   const resolvedStyleId = resolveStyleId(styleId);
//   const theme = STYLE_THEMES[resolvedStyleId];
//   const [activeFilter, setActiveFilter] = useState('all');
//   const [mounted, setMounted] = useState(false);
//   const heroRef = useRef<HTMLDivElement | null>(null);
  
//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   // Filter products: first by style suitability, then by type tab
//   const products = useMemo(() => {
//     const styleFn = STYLE_PRODUCT_FILTER[resolvedStyleId] || (() => true);
//     let list = ALL_PRODUCTS.filter(styleFn);
//     if (activeFilter !== 'all') {
//       list = list.filter(p => p.type === activeFilter);
//     }
//     return list;
//   }, [resolvedStyleId, activeFilter]);

//   const isDark = ['glam-look', 'maximalist'].includes(theme.id);
//   const HeroDecoration = HERO_DECORATIONS[theme.id as StyleId] || (() => null);

//   // Count per type for filter tabs
//   const styleFn = STYLE_PRODUCT_FILTER[resolvedStyleId] || (() => true);
//   const styleProducts = ALL_PRODUCTS.filter(styleFn);
//   const countByType = (type: string) => type === 'all'
//     ? styleProducts.length
//     : styleProducts.filter(p => p.type === type).length;

//   return (
//     <>
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=${theme.googleFonts}&display=swap');

//         *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

//         .sp-root {
//           min-height: 100vh;
//           background: ${theme.bg};
//           color: ${theme.text};
//           font-family: ${theme.bodyFont};
//           --accent: ${theme.accent};
//           --gold: ${theme.gold};
//           --text: ${theme.text};
//           --muted: ${theme.textMuted};
//           --border: ${theme.border};
//           --bg: ${theme.bg};
//           --bgAlt: ${theme.bgAlt};
//           --cardBg: ${theme.cardBg};
//         }

//         /* ── NAV ── */
//         .sp-nav {
//           display: flex;
//           align-items: center;
//           justify-content: space-between;
//           padding: 18px 52px;
//           border-bottom: 1px solid ${theme.border};
//           background: ${isDark ? 'rgba(10,10,14,0.85)' : 'rgba(253,248,244,0.85)'};
//           backdrop-filter: blur(16px);
//           position: sticky;
//           top: 0;
//           z-index: 100;
//         }
//         .sp-nav-logo {
//           font-family: ${theme.displayFont};
//           font-size: 20px;
//           font-weight: ${isDark ? '400' : '300'};
//           letter-spacing: .12em;
//           color: ${theme.accent};
//           text-decoration: none;
//         }
//         .sp-nav-links {
//           display: flex;
//           gap: 32px;
//         }
//         .sp-nav-links a {
//           font-size: 9.5px;
//           letter-spacing: .32em;
//           text-transform: uppercase;
//           color: ${theme.textMuted};
//           text-decoration: none;
//           font-weight: 500;
//           transition: color .2s;
//         }
//         .sp-nav-links a:hover { color: ${theme.accent}; }
//         .sp-nav-back {
//           display: flex;
//           align-items: center;
//           gap: 6px;
//           font-size: 9.5px;
//           letter-spacing: .2em;
//           text-transform: uppercase;
//           color: ${theme.textMuted};
//           text-decoration: none;
//           transition: color .2s;
//           cursor: pointer;
//         }
//         .sp-nav-back:hover { color: ${theme.accent}; }

//         /* ── HERO ── */
//         .sp-hero {
//           position: relative;
//           overflow: hidden;
//           padding: ${isDark ? '80px 52px 72px' : '72px 52px 64px'};
//           background: ${theme.heroPattern};
//         }
//         .sp-hero-content {
//           position: relative;
//           z-index: 2;
//           max-width: 680px;
//         }
//         .sp-hero-eyebrow {
//           display: inline-flex;
//           align-items: center;
//           gap: 10px;
//           font-size: 9px;
//           letter-spacing: .52em;
//           text-transform: uppercase;
//           color: ${theme.gold};
//           margin-bottom: 16px;
//           opacity: ${mounted ? 1 : 0};
//           transform: translateY(${mounted ? 0 : '12px'});
//           transition: all .7s ease;
//         }
//         .sp-hero-eyebrow-line {
//           width: 28px; height: 1px;
//           background: ${theme.gold};
//         }
//         .sp-hero-title {
//           font-family: ${theme.displayFont};
//           font-size: clamp(2.6rem, 5.5vw, 5rem);
//           font-weight: ${isDark ? '700' : '300'};
//           line-height: 1.06;
//           letter-spacing: ${isDark ? '.02em' : '-.02em'};
//           color: ${theme.text};
//           margin-bottom: 18px;
//           opacity: ${mounted ? 1 : 0};
//           transform: translateY(${mounted ? 0 : '20px'});
//           transition: all .85s ease .12s;
//         }
//         .sp-hero-title em {
//           font-style: italic;
//           color: ${theme.accent};
//         }
//         .sp-hero-desc {
//           font-size: 13px;
//           font-weight: 300;
//           color: ${theme.textMuted};
//           max-width: 440px;
//           line-height: 1.85;
//           letter-spacing: .03em;
//           opacity: ${mounted ? 1 : 0};
//           transform: translateY(${mounted ? 0 : '14px'});
//           transition: all .8s ease .24s;
//         }

//         /* Style mood badge */
//         .sp-hero-mood {
//           display: inline-flex;
//           align-items: center;
//           gap: 8px;
//           margin-top: 24px;
//           padding: 8px 20px;
//           border: 1px solid ${theme.border};
//           border-radius: 50px;
//           font-size: 10px;
//           letter-spacing: .2em;
//           text-transform: uppercase;
//           color: ${theme.accent};
//           background: ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.6)'};
//           backdrop-filter: blur(8px);
//           opacity: ${mounted ? 1 : 0};
//           transition: opacity .8s ease .36s;
//         }

//         /* Floating decorative elements */
//         .hero-float-el {
//           animation: heroFloat 4s ease-in-out infinite;
//         }
//         @keyframes heroFloat {
//           0%, 100% { transform: translateY(0) rotate(0deg); }
//           50% { transform: translateY(-12px) rotate(5deg); }
//         }
//         .glam-spark {
//           animation: glamPulse 2s ease-in-out infinite;
//         }
//         @keyframes glamPulse {
//           0%, 100% { opacity: 0.2; transform: scale(1); }
//           50% { opacity: 0.8; transform: scale(1.5); }
//         }
//         .fairy-dust {
//           animation: fairyFloat 3s ease-in-out infinite;
//           color: ${theme.accent};
//         }
//         @keyframes fairyFloat {
//           0%, 100% { transform: translateY(0) scale(1); opacity: 0.15; }
//           50% { transform: translateY(-8px) scale(1.2); opacity: 0.3; }
//         }

//         /* ── FILTER BAR ── */
//         .sp-filter-bar {
//           padding: 0 52px;
//           border-bottom: 1px solid ${theme.border};
//           background: ${isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.5)'};
//           display: flex;
//           align-items: center;
//           gap: 4px;
//           overflow-x: auto;
//           scrollbar-width: none;
//         }
//         .sp-filter-bar::-webkit-scrollbar { display: none; }

//         .sp-filter-tab {
//           flex-shrink: 0;
//           display: flex;
//           align-items: center;
//           gap: 6px;
//           padding: 16px 20px;
//           font-family: ${theme.bodyFont};
//           font-size: 10px;
//           letter-spacing: .22em;
//           text-transform: uppercase;
//           color: ${theme.textMuted};
//           background: transparent;
//           border: none;
//           border-bottom: 2px solid transparent;
//           cursor: pointer;
//           transition: all .2s;
//           white-space: nowrap;
//           font-weight: 500;
//         }
//         .sp-filter-tab:hover { color: ${theme.accent}; }
//         .sp-filter-tab.active {
//           color: ${theme.accent};
//           border-bottom-color: ${theme.accent};
//         }
//         .sp-filter-count {
//           font-size: 8px;
//           padding: 2px 6px;
//           border-radius: 50px;
//           background: ${isDark ? 'rgba(255,255,255,0.08)' : `rgba(0,0,0,0.06)`};
//           color: ${theme.textMuted};
//         }
//         .sp-filter-tab.active .sp-filter-count {
//           background: ${theme.accent};
//           color: ${isDark ? '#000' : '#fff'};
//         }

//         /* ── GRID ── */
//         .sp-grid-section {
//           padding: 48px 52px 80px;
//         }
//         .sp-section-label {
//           display: flex;
//           align-items: center;
//           gap: 16px;
//           margin-bottom: 32px;
//         }
//         .sp-section-label-line {
//           flex: 1;
//           height: 1px;
//           background: ${theme.border};
//         }
//         .sp-section-label-text {
//           font-family: ${theme.displayFont};
//           font-size: ${isDark ? '11px' : '10px'};
//           letter-spacing: .44em;
//           text-transform: uppercase;
//           color: ${theme.textMuted};
//           white-space: nowrap;
//         }

//         .sp-grid {
//           display: grid;
//           grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
//           gap: 28px;
//         }

//         /* ── CARD ── */
//         .sp-card {
//           background: var(--card-bg);
//           border: 1px solid var(--card-border);
//           border-radius: ${isDark ? '4px' : theme.id === 'fairy-coded' ? '20px' : '8px'};
//           overflow: hidden;
//           cursor: pointer;
//           animation: cardFadeUp .55s ease both;
//           box-shadow: var(--card-shadow);
//           transition:
//             transform .35s cubic-bezier(.22,.68,0,1.2),
//             box-shadow .35s ease,
//             border-color .25s ease;
//         }
//         .sp-card:hover {
//           transform: translateY(-8px) scale(1.01);
//           box-shadow: var(--card-hover-shadow);
//           border-color: ${theme.accent}44;
//         }
//         @keyframes cardFadeUp {
//           from { opacity: 0; transform: translateY(24px); }
//           to { opacity: 1; transform: translateY(0); }
//         }

//         .sp-card-img-wrap {
//           position: relative;
//           aspect-ratio: 1 / 1.1;
//           overflow: hidden;
//           background: ${isDark ? '#0d0c18' : theme.bgAlt};
//         }
//         .sp-card-img {
//           width: 100%;
//           height: 100%;
//           object-fit: cover;
//           transition: transform .6s cubic-bezier(.22,.68,0,1.2);
//         }
//         .sp-card:hover .sp-card-img { transform: scale(1.07); }

//         .sp-card-discount {
//           position: absolute;
//           top: 12px;
//           left: 12px;
//           font-size: 8.5px;
//           font-weight: 600;
//           letter-spacing: .15em;
//           text-transform: uppercase;
//           background: ${theme.accent};
//           color: ${isDark ? '#000' : '#fff'};
//           padding: 4px 9px 3px;
//           border-radius: 3px;
//         }
//         .sp-card-badge {
//           position: absolute;
//           top: 12px;
//           right: 12px;
//           font-size: 8.5px;
//           font-weight: 400;
//           letter-spacing: .15em;
//           text-transform: uppercase;
//           border: 1px solid ${theme.gold};
//           color: ${theme.gold};
//           padding: 4px 9px 3px;
//           border-radius: 3px;
//           background: ${isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.7)'};
//           backdrop-filter: blur(4px);
//         }

//         .sp-card-overlay {
//           position: absolute;
//           inset: 0;
//           display: flex;
//           align-items: flex-end;
//           justify-content: center;
//           padding-bottom: 16px;
//           background: linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 50%);
//           opacity: 0;
//           transition: opacity .3s ease;
//         }
//         .sp-card-overlay.show { opacity: 1; }

//         .sp-card-quick-add {
//           font-family: ${theme.bodyFont};
//           font-size: 9px;
//           letter-spacing: .3em;
//           text-transform: uppercase;
//           color: #fff;
//           background: ${theme.accent};
//           border: none;
//           padding: 10px 24px;
//           border-radius: 50px;
//           cursor: pointer;
//           font-weight: 500;
//           transform: translateY(8px);
//           transition: transform .3s ease;
//         }
//         .sp-card-overlay.show .sp-card-quick-add { transform: translateY(0); }
//         .sp-card-quick-add:hover {
//           background: ${theme.accentDark};
//         }

//         .sp-card-body {
//           padding: 18px 20px 20px;
//           background: var(--card-bg);
//         }
//         .sp-card-type {
//           font-size: 8.5px;
//           letter-spacing: .38em;
//           text-transform: uppercase;
//           color: ${theme.gold};
//           margin-bottom: 6px;
//           font-weight: 400;
//         }
//         .sp-card-name {
//           font-family: ${theme.displayFont};
//           font-size: ${isDark ? '17px' : '16px'};
//           font-weight: ${isDark ? '400' : '300'};
//           color: ${theme.text};
//           line-height: 1.25;
//           margin-bottom: 8px;
//         }
//         .sp-card-rating-row {
//           display: flex;
//           align-items: center;
//           gap: 6px;
//           margin-bottom: 10px;
//         }
//         .sp-card-review-count {
//           font-size: 10px;
//           color: ${theme.textMuted};
//         }
//         .sp-card-colors {
//           display: flex;
//           gap: 5px;
//           margin-bottom: 12px;
//         }
//         .sp-card-color-dot {
//           width: 12px;
//           height: 12px;
//           border-radius: 50%;
//           border: 1.5px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'};
//           transition: transform .2s;
//           cursor: pointer;
//         }
//         .sp-card-color-dot:hover { transform: scale(1.3); }
//         .sp-card-price-row {
//           display: flex;
//           align-items: baseline;
//           gap: 8px;
//         }
//         .sp-card-price {
//           font-size: 17px;
//           font-weight: 500;
//           color: ${theme.text};
//           letter-spacing: .02em;
//         }
//         .sp-card-original {
//           font-size: 12px;
//           color: ${theme.textMuted};
//           text-decoration: line-through;
//         }
//         .sp-card-stock {
//           font-size: 9.5px;
//           letter-spacing: .1em;
//           color: ${theme.accent};
//           margin-top: 6px;
//           text-transform: uppercase;
//         }

//         /* ── EMPTY STATE ── */
//         .sp-empty {
//           grid-column: 1 / -1;
//           text-align: center;
//           padding: 80px 20px;
//         }
//         .sp-empty-emoji {
//           font-size: 48px;
//           display: block;
//           margin-bottom: 16px;
//           opacity: .3;
//         }
//         .sp-empty-text {
//           font-family: ${theme.displayFont};
//           font-size: 18px;
//           font-style: italic;
//           color: ${theme.textMuted};
//         }

//         /* ── FOOTER ── */
//         .sp-footer {
//           border-top: 1px solid ${theme.border};
//           padding: 32px 52px;
//           display: flex;
//           align-items: center;
//           justify-content: space-between;
//         }
//         .sp-footer-brand {
//           font-family: ${theme.displayFont};
//           font-size: 20px;
//           font-weight: 300;
//           color: ${theme.accent};
//           opacity: .5;
//           letter-spacing: .1em;
//         }
//         .sp-footer-copy {
//           font-size: 9px;
//           letter-spacing: .35em;
//           text-transform: uppercase;
//           color: ${theme.textMuted};
//           opacity: .5;
//         }

//         /* ── RESPONSIVE ── */
//         @media (max-width: 860px) {
//           .sp-nav, .sp-hero, .sp-filter-bar, .sp-grid-section, .sp-footer {
//             padding-left: 24px;
//             padding-right: 24px;
//           }
//           .sp-nav-links { display: none; }
//         }
//         @media (max-width: 540px) {
//           .sp-nav, .sp-hero, .sp-filter-bar, .sp-grid-section, .sp-footer {
//             padding-left: 16px;
//             padding-right: 16px;
//           }
//           .sp-grid { grid-template-columns: repeat(2, 1fr); gap: 14px; }
//           .sp-hero { padding-top: 52px; padding-bottom: 48px; }
//         }
//         @media (max-width: 380px) {
//           .sp-grid { grid-template-columns: 1fr; }
//         }
//       `}</style>

//       <div className="sp-root">

//         {/* ── NAV ── */}
//         <nav className="sp-nav">
//           <a href="/" className="sp-nav-logo">Maison</a>
//           <div className="sp-nav-links">
//             <a href="#">Collections</a>
//             <a href="#" className="active">Styles</a>
//             <a href="#">Journal</a>
//           </div>
//           <span className="sp-nav-back" onClick={() => window.history.back()}>
//             <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//               <polyline points="15 18 9 12 15 6"/>
//             </svg>
//             All Styles
//           </span>
//         </nav>

//         {/* ── HERO ── */}
//         <div className="sp-hero" ref={heroRef}>
//           <HeroDecoration />
//           <div className="sp-hero-content">
//             <div className="sp-hero-eyebrow">
//               <span className="sp-hero-eyebrow-line"/>
//               {theme.emoji} {theme.name}
//             </div>
//             <h1 className="sp-hero-title">
//               <em>{theme.name}</em><br/>
//               {theme.sub}
//             </h1>
//             <p className="sp-hero-desc">{theme.subheadline}</p>
//             <div className="sp-hero-mood">
//               <span>{theme.emoji}</span>
//               <span>{theme.mood} · {styleProducts.length} pieces</span>
//             </div>
//           </div>
//         </div>

//         {/* ── FILTER TABS ── */}
//         <div className="sp-filter-bar">
//           {FILTER_TABS.map(tab => (
//             <button
//               key={tab.value}
//               className={`sp-filter-tab ${activeFilter === tab.value ? 'active' : ''}`}
//               onClick={() => setActiveFilter(tab.value)}
//             >
//               {tab.label}
//               <span className="sp-filter-count">{countByType(tab.value)}</span>
//             </button>
//           ))}
//         </div>

//         {/* ── PRODUCT GRID ── */}
//         <div className="sp-grid-section">
//           {/* Section label */}
//           <div className="sp-section-label">
//             <div className="sp-section-label-line"/>
//             <span className="sp-section-label-text">
//               {activeFilter === 'all'
//                 ? `${theme.name} Collection · ${products.length} pieces`
//                 : `${FILTER_TABS.find(t=>t.value===activeFilter)?.label} · ${products.length} pieces`
//               }
//             </span>
//             <div className="sp-section-label-line"/>
//           </div>

//           <div className="sp-grid">
//             {products.length === 0 ? (
//               <div className="sp-empty">
//                 <span className="sp-empty-emoji">{theme.emoji}</span>
//                 <p className="sp-empty-text">No pieces in this collection yet</p>
//               </div>
//             ) : (
//               products.map((product, i) => (
//                 <StyleProductCard
//                   key={product.id}
//                   product={product}
//                   theme={theme}
//                   index={i}
//                 />
//               ))
//             )}
//           </div>
//         </div>

//         {/* ── FOOTER ── */}
//         <footer className="sp-footer">
//           <div className="sp-footer-brand">Maison</div>
//           <div className="sp-footer-copy">Fine Jewellery · {theme.name} Collection</div>
//         </footer>

//       </div>
//     </>
//   );
// }

'use client';

import {
  useState, useMemo, useEffect, useRef,
  type CSSProperties, type MouseEvent
} from 'react';
import { ALL_PRODUCTS, FILTER_TABS } from '@/lib/products';
import { STYLE_THEMES, STYLE_PRODUCT_FILTER } from '@/lib/styleThemes';
import { useCart } from '@/lib/cartContext';
import { fireConfetti } from '@/components/cart/ConfettiManager';
import UpperNav from '@/components/ui/UpperNav';
import Link from 'next/link';

type StyleId = keyof typeof STYLE_THEMES;
type StyleTheme = (typeof STYLE_THEMES)[StyleId];
type Product = (typeof ALL_PRODUCTS)[number];

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
  'glam-look':        { tagline: 'Own The Room',          sub: 'Gilded. Bold. Unapologetic.', gradA:'#1a1608', gradB:'#0d0b04' },
  'island-girl':      { tagline: 'Salt & Spirit',         sub: 'Breezy. Free. Sun-kissed.',   gradA:'#d4ede6', gradB:'#e8f5f1' },
  'office-jewellery': { tagline: 'Quiet Authority',       sub: 'Refined. Subtle. Powerful.',  gradA:'#f0eeeb', gradB:'#e8e6e2' },
  'maximalist':       { tagline: 'More Is More',          sub: 'Loud. Layered. Limitless.',   gradA:'#1c0d00', gradB:'#0e0600' },
  'fairy-coded':      { tagline: 'Enchant Everything',    sub: 'Whimsical. Magical. Rare.',   gradA:'#f0e8fc', gradB:'#ebe0f8' },
};

// ─── Product Card ─────────────────────────────────────────────────────────────
/*
 * IMAGE SPEC: 800×800px (1:1 square), JPEG/WebP, object-fit:cover.
 * Non-square images will be center-cropped. For best results crop product
 * images to square before upload.
 */
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
  const isDark = ['glam-look', 'maximalist'].includes(sid);

  const [filter, setFilter] = useState('all');
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const styleFn = STYLE_PRODUCT_FILTER[sid] || (() => true);
  const allStyle = ALL_PRODUCTS.filter(styleFn);

  const products = useMemo(() => {
    let list = [...allStyle];
    if (filter !== 'all') list = list.filter(p => p.type === filter);
    return list;
  }, [sid, filter]);

  const count = (type: string) =>
    type === 'all' ? allStyle.length : allStyle.filter(p => p.type === type).length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=${theme.googleFonts}&family=DM+Sans:wght@300;400;500&display=swap');

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
           Height is intentionally constrained so the
           product grid is visible immediately on load.
        ───────────────────────────────────────────── */
        .hero {
          position: relative;
          width: 100%;
          padding: clamp(24px, 4vw, 48px) clamp(16px, 5vw, 64px);
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
        .hero-pill {
          display:inline-flex; align-items:center; gap:6px;
          padding: 4px 12px 4px 8px;
          border-radius:100px;
          border: 1px solid ${theme.accent}40;
          background: ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.55)'};
          backdrop-filter:blur(8px);
          font-size:8.5px; letter-spacing:0.3em; text-transform:uppercase;
          color:${theme.accent}; font-weight:500;
          margin-bottom:10px;
          opacity:${mounted ? 1 : 0};
          transition: opacity 0.5s ease;
        }
        .hero-pill-dot {
          width:5px; height:5px; border-radius:50%;
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

        /* Piece count on right — decorative */
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
           FILTER BAR — sticky, blurred
        ───────────────────────────────────────────── */
        .filters {
          position:sticky; top:0; z-index:40;
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
           Desktop: 4 cols | Tablet: 3 cols | Mobile: 2 cols
           NOTE: use padding NOT margin on wrapper so
           grid never overflows viewport width.
        ───────────────────────────────────────────── */
        .grid-wrap {
          padding: clamp(20px,3.5vw,44px) clamp(16px,5vw,64px) clamp(44px,6vw,80px);
        }
        .grid {
          display:grid;
          /* 4 columns on wide screens */
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

        /* ─────────────────────────────────────────────
           CARD
           IMAGE: 800×800px square (1:1 aspect ratio)
           object-fit:cover center-crops non-square images
        ───────────────────────────────────────────── */
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

        /* SQUARE image wrapper — 1:1 aspect ratio */
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

        /* Hover scrim */
        .c-scrim {
          position:absolute; inset:0;
          background: linear-gradient(to top, rgba(0,0,0,0.42) 0%, transparent 55%);
          opacity:0; transition: opacity 0.28s ease;
          pointer-events:none;
        }
        .c-scrim.on { opacity:1; }

        /* Discount badge */
        .c-disc {
          position:absolute; top:8px; left:8px;
          font-size:8px; font-weight:700;
          letter-spacing:0.08em; text-transform:uppercase;
          background:${theme.accent}; color:${isDark ? '#000' : '#fff'};
          padding: 3px 8px 2px; border-radius:2px;
        }

        /* Add button */
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

        /* Card info strip */
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

        /* Empty state */
        .empty {
          grid-column:1/-1; text-align:center; padding:80px 20px; opacity:0.3;
        }
        .empty-icon { font-size:38px; display:block; margin-bottom:12px; }
        .empty-msg {
          font-family:${theme.displayFont}; font-size:15px;
          font-style:italic; color:${theme.textMuted};
        }

        /* Footer */
        .foot {
          border-top: 1px solid ${theme.border};
          padding: 18px clamp(16px, 5vw, 64px);
          display:flex; align-items:center; justify-content:space-between;
          gap:12px; flex-wrap:wrap;
        }
        .foot-brand {
          font-family:${theme.displayFont}; font-size:15px; font-weight:300;
          color:${theme.accent}; opacity:0.38; letter-spacing:0.12em;
        }
        .foot-copy {
          font-size:8px; letter-spacing:0.32em; text-transform:uppercase;
          color:${theme.textMuted}; opacity:0.32;
        }
      `}</style>

      <div className="pg">
        <UpperNav />

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