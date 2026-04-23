// // // 'use client';

// // // import { useEffect, useState } from 'react';
// // // import UpperNav from '@/components/ui/UpperNav';
// // // import ProductsPage from '@/components/product/ProductPage';

// // // // ─── Types ────────────────────────────────────────────────────────────────────
// // // interface SubcategoryItem {
// // //   name: string;
// // //   sub: string;
// // //   tag: string;
// // //   img: string;
// // //   wide: boolean;
// // // }

// // // interface SubcategorySectionData {
// // //   label: string;
// // //   eyebrow: string;
// // //   heading: string;
// // //   tagline: string;
// // //   desc: string;
// // //   backHref: string;
// // //   items: SubcategoryItem[];
// // // }

// // // type SubcategoryType =
// // //   | 'necklace'
// // //   | 'earrings'
// // //   | 'bracelets'
// // //   | 'rings'
// // //   | 'waist-chains'
// // //   | 'couple-sets';

// // // // ─── Data ─────────────────────────────────────────────────────────────────────
// // // const SUBCATEGORY_DATA: Record<SubcategoryType, SubcategorySectionData> = {
// // //   necklace: {
// // //     label: 'Necklaces',
// // //     eyebrow: 'Women · Jewellery',
// // //     heading: 'Necklace',
// // //     tagline: 'Edit',
// // //     desc: 'Delicate chains and statement pieces crafted for every mood.',
// // //     backHref: '/categories/women/jewellery',
// // //     items: [
// // //       { name: 'Dainty',   sub: 'Fine, barely-there chains',    tag: 'New',        img: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=900&q=90',  wide: false },
// // //       { name: 'Layered',  sub: 'Stack-ready multi-layer sets',  tag: 'Trending',   img: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=900&q=90',  wide: false },
// // //       { name: 'Pendant',  sub: 'Statement centrepieces',        tag: 'Bestseller', img: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=900&q=90',  wide: false },
// // //       { name: 'Charms',   sub: 'Personalised charm chains',     tag: 'Popular',    img: 'https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=900&q=90',  wide: false },
// // //       { name: 'Everyday', sub: 'Effortless all-day wear',       tag: 'Essential',  img: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=1400&q=90', wide: true  },
// // //     ],
// // //   },
// // //   earrings: {
// // //     label: 'Earrings',
// // //     eyebrow: 'Women · Jewellery',
// // //     heading: 'Earring',
// // //     tagline: 'Edit',
// // //     desc: 'From whisper-soft studs to sculptural hoops.',
// // //     backHref: '/categories/women/jewellery',
// // //     items: [
// // //       { name: 'Korean', sub: 'Minimal K-jewellery edits',    tag: 'New',        img: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=900&q=90', wide: false },
// // //       { name: 'Hoops',  sub: 'Classic to bold hoop styles',  tag: 'Trending',   img: 'https://images.unsplash.com/photo-1588444650733-d0f07d323dde?w=900&q=90', wide: false },
// // //       { name: 'Studs',  sub: 'Barely-there dome studs',      tag: 'Bestseller', img: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=900&q=90', wide: false },
// // //       { name: 'Pearls', sub: 'Timeless pearl elegance',      tag: 'Curated',    img: 'https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=900&q=90', wide: true  },
// // //     ],
// // //   },
// // //   bracelets: {
// // //     label: 'Bracelets',
// // //     eyebrow: 'Women · Jewellery',
// // //     heading: 'Bracelet',
// // //     tagline: 'Edit',
// // //     desc: 'Stack, layer, and adorn — wrist candy for every vibe.',
// // //     backHref: '/categories/women/jewellery',
// // //     items: [
// // //       { name: 'Chain',  sub: 'Sleek gold & silver chains',  tag: 'Bestseller', img: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=900&q=90',  wide: false },
// // //       { name: 'Kada',   sub: 'Structured bangle kadaas',    tag: 'Essential',  img: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=900&q=90',  wide: false },
// // //       { name: 'Charms', sub: 'Personalised charm links',    tag: 'Popular',    img: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=900&q=90',  wide: false },
// // //       { name: 'Beaded', sub: 'Boho & natural bead wraps',   tag: 'New',        img: 'https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=900&q=90',  wide: false },
// // //       { name: 'Stacks', sub: 'Curated layering sets',       tag: 'Trending',   img: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=1400&q=90', wide: true  },
// // //     ],
// // //   },
// // //   rings: {
// // //     label: 'Rings',
// // //     eyebrow: 'Women · Jewellery',
// // //     heading: 'Ring',
// // //     tagline: 'Edit',
// // //     desc: 'From barely-there stackers to statement solitaires.',
// // //     backHref: '/categories/women/jewellery',
// // //     items: [
// // //       { name: 'Minimal',   sub: 'Slim stackable bands',          tag: 'Bestseller', img: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=900&q=90',  wide: false },
// // //       { name: 'Diamond',   sub: 'Brilliant-cut CZ solitaires',   tag: 'Trending',   img: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=900&q=90',  wide: false },
// // //       { name: 'Couple',    sub: 'Matching pair sets',             tag: 'Popular',    img: 'https://images.unsplash.com/photo-1588444650733-d0f07d323dde?w=900&q=90',  wide: false },
// // //       { name: 'Statement', sub: 'Bold cocktail rings',            tag: 'New',        img: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=900&q=90',  wide: true  },
// // //     ],
// // //   },
// // //   'waist-chains': {
// // //     label: 'Waist Chains',
// // //     eyebrow: 'Women · Jewellery',
// // //     heading: 'Waist',
// // //     tagline: 'Chains',
// // //     desc: 'Delicate body chains that drape beautifully.',
// // //     backHref: '/categories/women/jewellery',
// // //     items: [
// // //       { name: 'Dainty',   sub: 'Barely-there single chains',  tag: 'New',        img: 'https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=900&q=90',  wide: false },
// // //       { name: 'Layered',  sub: 'Multi-strand body drapes',    tag: 'Trending',   img: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=900&q=90',  wide: false },
// // //       { name: 'Charm',    sub: 'Personalised charm chains',   tag: 'Popular',    img: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=900&q=90',  wide: false },
// // //       { name: 'Festival', sub: 'Bold boho festival styles',   tag: 'Bestseller', img: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=1400&q=90', wide: true  },
// // //     ],
// // //   },
// // //   'couple-sets': {
// // //     label: 'Couple Sets',
// // //     eyebrow: 'Women · Jewellery',
// // //     heading: 'Couple',
// // //     tagline: 'Sets',
// // //     desc: 'Matching jewellery designed for two.',
// // //     backHref: '/categories/women/jewellery',
// // //     items: [
// // //       { name: 'Rings',     sub: 'Matching band pairs',           tag: 'Trending',   img: 'https://images.unsplash.com/photo-1588444650733-d0f07d323dde?w=900&q=90',  wide: false },
// // //       { name: 'Bracelets', sub: 'His & hers wrist sets',         tag: 'Bestseller', img: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=900&q=90',  wide: false },
// // //       { name: 'Necklaces', sub: 'Complementary pendant pairs',   tag: 'Popular',    img: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=900&q=90',  wide: false },
// // //       { name: 'Gift Sets', sub: 'Curated gift box combos',       tag: 'New',        img: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=1400&q=90', wide: true  },
// // //     ],
// // //   },
// // // };

// // // const MARQUEE_WORDS = [
// // //   'Dainty Chains', 'Layered Sets', 'Statement Pendants', 'Charm Necklaces',
// // //   'Everyday Essentials', 'Gold Plated', 'Sterling Silver', 'Fine Jewellery',
// // //   'Handcrafted', 'Sustainably Sourced', 'Gift Worthy', 'Limited Editions',
// // // ];

// // // // ─── Marquee ──────────────────────────────────────────────────────────────────
// // // function Marquee() {
// // //   const words = [...MARQUEE_WORDS, ...MARQUEE_WORDS];
// // //   return (
// // //     <div className="marquee-wrap">
// // //       <div className="marquee-track">
// // //         {words.map((w, i) => (
// // //           <span key={i} className="marquee-item">
// // //             {w} <span className="marquee-sep">·</span>
// // //           </span>
// // //         ))}
// // //       </div>
// // //     </div>
// // //   );
// // // }

// // // // ─── Circle Filter — same logic, refreshed skin ───────────────────────────────
// // // function CircleFilter({
// // //   item,
// // //   active,
// // //   onClick,
// // // }: {
// // //   item: SubcategoryItem;
// // //   active: boolean;
// // //   onClick: () => void;
// // // }) {
// // //   return (
// // //     <button
// // //       className={`circle-btn${active ? ' circle-btn--active' : ''}`}
// // //       onClick={onClick}
// // //       title={item.sub}
// // //     >
// // //       <div className="circle-img-wrap">
// // //         {/* eslint-disable-next-line @next/next/no-img-element */}
// // //         <img src={item.img} alt={item.name} loading="lazy" />
// // //         {active && <div className="circle-active-ring" />}
// // //       </div>
// // //       <span className="circle-label">{item.name}</span>
// // //       {active && <span className="circle-active-dot" />}
// // //     </button>
// // //   );
// // // }

// // // // ─── Main Page ────────────────────────────────────────────────────────────────
// // // export default function SubcategoryPage({ type = 'necklace' }: { type?: string }) {
// // //   const resolvedType = (
// // //     Object.keys(SUBCATEGORY_DATA).includes(type) ? type : 'necklace'
// // //   ) as SubcategoryType;

// // //   const data = SUBCATEGORY_DATA[resolvedType];

// // //   const [activeSubtype, setActiveSubtype] = useState<string | null>(null);
// // //   const [visible, setVisible] = useState(false);

// // //   useEffect(() => { setActiveSubtype(null); }, [resolvedType]);
// // //   useEffect(() => {
// // //     const t = setTimeout(() => setVisible(true), 60);
// // //     return () => clearTimeout(t);
// // //   }, []);

// // //   function handleCircleClick(name: string) {
// // //     setActiveSubtype(prev => (prev === name.toLowerCase() ? null : name.toLowerCase()));
// // //   }

// // //   return (
// // //     <>
// // //       <style>{`
// // //         @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@200;300;400;500&display=swap');

// // //         :root {
// // //           --bg:          #f5f3ee;
// // //           --sage:        #6e8f66;
// // //           --sage-lt:     #9ab593;
// // //           --sage-pale:   #eaf0e8;
// // //           --sage-ring:   rgba(110,143,102,.3);
// // //           --sage-glow:   rgba(110,143,102,.12);
// // //           --beige:       #c4a47a;
// // //           --beige-lt:    #dfc9a8;
// // //           --beige-pale:  #faf4ec;
// // //           --ink:         #2a2a27;
// // //           --ink-mid:     rgba(42,42,39,.52);
// // //           --ink-faint:   rgba(42,42,39,.22);
// // //           --border:      rgba(42,42,39,.08);
// // //           --border-sage: rgba(110,143,102,.2);
// // //         }

// // //         *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

// // //         .scp {
// // //           min-height: 100vh;
// // //           background: var(--bg);
// // //           font-family: 'Jost', sans-serif;
// // //           color: var(--ink);
// // //         }

// // //         /* ── Compact header ── */
// // //         .scp-header {
// // //           padding: 28px 48px 0;
// // //           display: flex; align-items: flex-end; justify-content: space-between;
// // //           opacity: 0; transform: translateY(10px);
// // //           transition: opacity .5s ease, transform .5s ease;
// // //         }
// // //         .scp-header.vis { opacity: 1; transform: none; }

// // //         .scp-title {
// // //           font-family: 'Cormorant Garamond', serif;
// // //           font-size: clamp(1.75rem, 3.8vw, 2.6rem);
// // //           font-weight: 300; letter-spacing: .02em; line-height: 1.1; color: var(--ink);
// // //         }
// // //         .scp-title em { font-style: italic; color: var(--sage); }

// // //         .scp-desc {
// // //           margin-top: 6px;
// // //           font-size: 11.5px; font-weight: 300; letter-spacing: .03em;
// // //           color: var(--ink-mid); line-height: 1.65; max-width: 360px;
// // //         }

// // //         /* Ghost numeral — decorative only */
// // //         .scp-ghost-num {
// // //           font-family: 'Cormorant Garamond', serif;
// // //           font-size: clamp(3.5rem, 7vw, 5.5rem);
// // //           font-weight: 300; font-style: italic;
// // //           color: rgba(110,143,102,.1);
// // //           line-height: 1; user-select: none; flex-shrink: 0;
// // //           padding-left: 16px;
// // //         }

// // //         /* ── Marquee ── */
// // //         .marquee-wrap {
// // //           overflow: hidden;
// // //           margin-top: 22px;
// // //           padding: 9px 0;
// // //           background: var(--sage-pale);
// // //           border-top: 1px solid var(--border-sage);
// // //           border-bottom: 1px solid var(--border-sage);
// // //         }
// // //         .marquee-track {
// // //           display: flex; width: max-content;
// // //           animation: marquee 32s linear infinite;
// // //         }
// // //         .marquee-track:hover { animation-play-state: paused; }
// // //         .marquee-item {
// // //           font-family: 'Cormorant Garamond', serif;
// // //           font-size: 11px; font-style: italic; font-weight: 300;
// // //           color: var(--sage); letter-spacing: .2em;
// // //           padding: 0 24px; white-space: nowrap;
// // //         }
// // //         .marquee-sep { color: var(--beige); padding: 0 5px; opacity: .55; }
// // //         @keyframes marquee {
// // //           from { transform: translateX(0); }
// // //           to   { transform: translateX(-50%); }
// // //         }

// // //         /* ── Circles section ── */
// // //         .circles-section {
// // //           padding: 26px 48px 22px;
// // //           opacity: 0; transform: translateY(10px);
// // //           transition: opacity .55s ease .14s, transform .55s ease .14s;
// // //         }
// // //         .circles-section.vis { opacity: 1; transform: none; }

// // //         .circles-bar {
// // //           display: flex; align-items: center; justify-content: space-between;
// // //           margin-bottom: 18px;
// // //         }
// // //         .circles-label {
// // //           font-size: 8px; letter-spacing: .48em; text-transform: uppercase;
// // //           color: var(--sage); font-weight: 400;
// // //         }

// // //         /* Active pill tag */
// // //         .circles-active-tag {
// // //           display: inline-flex; align-items: center; gap: 7px;
// // //           font-size: 8px; letter-spacing: .22em; text-transform: uppercase;
// // //           color: var(--ink-mid);
// // //           background: var(--beige-pale);
// // //           border: 1px solid var(--beige-lt);
// // //           border-radius: 100px;
// // //           padding: 4px 8px 4px 12px;
// // //           opacity: 0; transition: opacity .22s; pointer-events: none;
// // //         }
// // //         .circles-active-tag.vis { opacity: 1; pointer-events: auto; }
// // //         .circles-active-tag strong { color: var(--beige); text-transform: capitalize; font-weight: 400; }
// // //         .circles-clear {
// // //           background: none; border: none; cursor: pointer;
// // //           display: flex; align-items: center; justify-content: center;
// // //           width: 18px; height: 18px; border-radius: 50%;
// // //           background: rgba(196,164,122,.15);
// // //           color: var(--beige); font-size: 13px; line-height: 1;
// // //           transition: background .2s, color .2s;
// // //         }
// // //         .circles-clear:hover { background: var(--beige); color: #fff; }

// // //         /* Circles row */
// // //         .circles-row { display: flex; gap: 18px; flex-wrap: wrap; }

// // //         /* ── Circle button — same logic, new skin ── */
// // //         .circle-btn {
// // //           display: flex; flex-direction: column; align-items: center; gap: 8px;
// // //           background: none; border: none; cursor: pointer; padding: 0;
// // //           position: relative;
// // //           transition: transform .28s cubic-bezier(.25,.46,.45,.94);
// // //         }
// // //         .circle-btn:hover { transform: translateY(-3px); }
// // //         .circle-btn--active { transform: translateY(-3px); }

// // //         .circle-img-wrap {
// // //           width: 78px; height: 78px; border-radius: 50%; overflow: hidden;
// // //           position: relative;
// // //           border: 2px solid var(--border-sage);
// // //           transition: border-color .25s, box-shadow .3s;
// // //           background: var(--sage-pale);
// // //         }
// // //         .circle-btn:hover .circle-img-wrap {
// // //           border-color: var(--sage-lt);
// // //           box-shadow: 0 4px 14px rgba(110,143,102,.18);
// // //         }
// // //         .circle-btn--active .circle-img-wrap {
// // //           border-color: var(--sage);
// // //           box-shadow: 0 0 0 3px var(--sage-glow), 0 4px 18px rgba(110,143,102,.2);
// // //         }
// // //         .circle-img-wrap img {
// // //           width: 100%; height: 100%; object-fit: cover; display: block;
// // //           filter: saturate(.65) brightness(.86);
// // //           transition: filter .3s, transform .5s cubic-bezier(.25,.46,.45,.94);
// // //         }
// // //         .circle-btn:hover .circle-img-wrap img,
// // //         .circle-btn--active .circle-img-wrap img {
// // //           filter: saturate(.92) brightness(.96);
// // //           transform: scale(1.09);
// // //         }

// // //         /* Active inner tint */
// // //         .circle-active-ring {
// // //           position: absolute; inset: 0; border-radius: 50%;
// // //           background: rgba(110,143,102,.1); pointer-events: none;
// // //         }

// // //         .circle-label {
// // //           font-size: 8.5px; letter-spacing: .28em; text-transform: uppercase;
// // //           color: var(--ink-mid); font-weight: 400;
// // //           transition: color .2s;
// // //         }
// // //         .circle-btn:hover .circle-label,
// // //         .circle-btn--active .circle-label { color: var(--sage); }

// // //         /* Active indicator dot */
// // //         .circle-active-dot {
// // //           width: 4px; height: 4px; border-radius: 50%;
// // //           background: var(--sage);
// // //           position: absolute; bottom: -7px; left: 50%; transform: translateX(-50%);
// // //         }

// // //         /* ── Thin rule ── */
// // //         .scp-rule {
// // //           height: 1px; margin: 0 48px;
// // //           background: var(--border);
// // //         }

// // //         /* ── Products section ── */
// // //         .products-section {
// // //           opacity: 0; transform: translateY(10px);
// // //           transition: opacity .6s ease .26s, transform .6s ease .26s;
// // //         }
// // //         .products-section.vis { opacity: 1; transform: none; }

// // //         /* Strip ProductsPage inner chrome when embedded */
// // //         .products-section :global(.pp) { background: transparent !important; min-height: unset; }
// // //         .products-section :global(.pp-topbar),
// // //         .products-section :global(.pp-footer),
// // //         .products-section :global(.pp-hero) { display: none !important; }

// // //         /* ── Responsive ── */
// // //         @media (max-width: 900px) {
// // //           .scp-header, .circles-section, .scp-rule { padding-left: 28px; padding-right: 28px; }
// // //           .circle-img-wrap { width: 66px; height: 66px; }
// // //           .circles-row { gap: 14px; }
// // //         }
// // //         @media (max-width: 600px) {
// // //           .scp-header { padding: 20px 16px 0; }
// // //           .circles-section, .scp-rule { padding-left: 16px; padding-right: 16px; }
// // //           .scp-ghost-num { display: none; }
// // //           .scp-desc { max-width: 100%; }
// // //           .circle-img-wrap { width: 58px; height: 58px; }
// // //           .circle-label { font-size: 7.5px; }
// // //           .circles-row { gap: 10px; }
// // //         }
// // //       `}</style>

// // //       <div className="scp">

// // //         {/* ── Your existing nav — no duplicate header rendered here ── */}
// // //         <UpperNav />

// // //         {/* ── Compact page intro ── */}
// // //         <div className={`scp-header${visible ? ' vis' : ''}`}>
// // //           <div>
// // //             <h1 className="scp-title">
// // //               The&nbsp;<em>{data.heading}</em>&nbsp;{data.tagline}
// // //             </h1>
// // //             <p className="scp-desc">{data.desc}</p>
// // //           </div>
// // //           <div className="scp-ghost-num">{String(data.items.length).padStart(2, '0')}</div>
// // //         </div>

// // //         {/* ── Marquee ── */}
// // //         <Marquee />

// // //         {/* ── Circles (same logic as original) ── */}
// // //         <section className={`circles-section${visible ? ' vis' : ''}`}>
// // //           <div className="circles-bar">
// // //             <span className="circles-label">Browse by style</span>
// // //             <span className={`circles-active-tag${activeSubtype ? ' vis' : ''}`}>
// // //               <strong>{activeSubtype}</strong>
// // //               <button
// // //                 className="circles-clear"
// // //                 onClick={() => setActiveSubtype(null)}
// // //                 title="Clear filter"
// // //               >×</button>
// // //             </span>
// // //           </div>

// // //           <div className="circles-row">
// // //             {data.items.map((item) => (
// // //               <CircleFilter
// // //                 key={item.name}
// // //                 item={item}
// // //                 active={activeSubtype === item.name.toLowerCase()}
// // //                 onClick={() => handleCircleClick(item.name)}
// // //               />
// // //             ))}
// // //           </div>
// // //         </section>

// // //         <div className="scp-rule" />

// // //         {/* ── Products (same logic as original) ── */}
// // //         <div className={`products-section${visible ? ' vis' : ''}`}>
// // //           <ProductsPage
// // //             type={resolvedType}
// // //             subtype={activeSubtype ?? undefined}
// // //             embedded
// // //           />
// // //         </div>

// // //       </div>
// // //     </>
// // //   );
// // // }



// // 'use client';

// // import { useEffect, useState } from 'react';
// // import UpperNav from '@/components/ui/UpperNav';
// // import ProductsPage from '@/components/product/ProductPage';

// // // ─── Types ────────────────────────────────────────────────────────────────────
// // interface SubcategoryItem {
// //   name: string;
// //   sub: string;
// //   tag: string;
// //   img: string;
// //   wide: boolean;
// // }

// // interface SubcategorySectionData {
// //   label: string;
// //   eyebrow: string;
// //   heading: string;
// //   tagline: string;
// //   desc: string;
// //   backHref: string;
// //   items: SubcategoryItem[];
// // }

// // type SubcategoryType =
// //   | 'necklace'
// //   | 'earrings'
// //   | 'bracelets'
// //   | 'rings'
// //   | 'waist-chains'
// //   | 'couple-sets';

// // // ─── Data ─────────────────────────────────────────────────────────────────────
// // const SUBCATEGORY_DATA: Record<SubcategoryType, SubcategorySectionData> = {
// //   necklace: {
// //     label: 'Necklaces',
// //     eyebrow: 'Women · Jewellery',
// //     heading: 'Necklace',
// //     tagline: 'Edit',
// //     desc: 'Delicate chains and statement pieces crafted for every mood.',
// //     backHref: '/categories/women/jewellery',
// //     items: [
// //       { name: 'Dainty',   sub: 'Fine, barely-there chains',    tag: 'New',        img: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=900&q=90',  wide: false },
// //       { name: 'Layered',  sub: 'Stack-ready multi-layer sets',  tag: 'Trending',   img: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=900&q=90',  wide: false },
// //       { name: 'Pendant',  sub: 'Statement centrepieces',        tag: 'Bestseller', img: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=900&q=90',  wide: false },
// //       { name: 'Charms',   sub: 'Personalised charm chains',     tag: 'Popular',    img: 'https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=900&q=90',  wide: false },
// //       { name: 'Everyday', sub: 'Effortless all-day wear',       tag: 'Essential',  img: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=1400&q=90', wide: true  },
// //     ],
// //   },
// //   earrings: {
// //     label: 'Earrings',
// //     eyebrow: 'Women · Jewellery',
// //     heading: 'Earring',
// //     tagline: 'Edit',
// //     desc: 'From whisper-soft studs to sculptural hoops.',
// //     backHref: '/categories/women/jewellery',
// //     items: [
// //       { name: 'Korean', sub: 'Minimal K-jewellery edits',    tag: 'New',        img: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=900&q=90', wide: false },
// //       { name: 'Hoops',  sub: 'Classic to bold hoop styles',  tag: 'Trending',   img: 'https://images.unsplash.com/photo-1588444650733-d0f07d323dde?w=900&q=90', wide: false },
// //       { name: 'Studs',  sub: 'Barely-there dome studs',      tag: 'Bestseller', img: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=900&q=90', wide: false },
// //       { name: 'Pearls', sub: 'Timeless pearl elegance',      tag: 'Curated',    img: 'https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=900&q=90', wide: true  },
// //     ],
// //   },
// //   bracelets: {
// //     label: 'Bracelets',
// //     eyebrow: 'Women · Jewellery',
// //     heading: 'Bracelet',
// //     tagline: 'Edit',
// //     desc: 'Stack, layer, and adorn — wrist candy for every vibe.',
// //     backHref: '/categories/women/jewellery',
// //     items: [
// //       { name: 'Chain',  sub: 'Sleek gold & silver chains',  tag: 'Bestseller', img: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=900&q=90',  wide: false },
// //       { name: 'Kada',   sub: 'Structured bangle kadaas',    tag: 'Essential',  img: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=900&q=90',  wide: false },
// //       { name: 'Charms', sub: 'Personalised charm links',    tag: 'Popular',    img: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=900&q=90',  wide: false },
// //       { name: 'Beaded', sub: 'Boho & natural bead wraps',   tag: 'New',        img: 'https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=900&q=90',  wide: false },
// //       { name: 'Stacks', sub: 'Curated layering sets',       tag: 'Trending',   img: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=1400&q=90', wide: true  },
// //     ],
// //   },
// //   rings: {
// //     label: 'Rings',
// //     eyebrow: 'Women · Jewellery',
// //     heading: 'Ring',
// //     tagline: 'Edit',
// //     desc: 'From barely-there stackers to statement solitaires.',
// //     backHref: '/categories/women/jewellery',
// //     items: [
// //       { name: 'Minimal',   sub: 'Slim stackable bands',          tag: 'Bestseller', img: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=900&q=90',  wide: false },
// //       { name: 'Diamond',   sub: 'Brilliant-cut CZ solitaires',   tag: 'Trending',   img: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=900&q=90',  wide: false },
// //       { name: 'Couple',    sub: 'Matching pair sets',             tag: 'Popular',    img: 'https://images.unsplash.com/photo-1588444650733-d0f07d323dde?w=900&q=90',  wide: false },
// //       { name: 'Statement', sub: 'Bold cocktail rings',            tag: 'New',        img: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=900&q=90',  wide: true  },
// //     ],
// //   },
// //   'waist-chains': {
// //     label: 'Waist Chains',
// //     eyebrow: 'Women · Jewellery',
// //     heading: 'Waist',
// //     tagline: 'Chains',
// //     desc: 'Delicate body chains that drape beautifully.',
// //     backHref: '/categories/women/jewellery',
// //     items: [
// //       { name: 'Dainty',   sub: 'Barely-there single chains',  tag: 'New',        img: 'https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=900&q=90',  wide: false },
// //       { name: 'Layered',  sub: 'Multi-strand body drapes',    tag: 'Trending',   img: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=900&q=90',  wide: false },
// //       { name: 'Charm',    sub: 'Personalised charm chains',   tag: 'Popular',    img: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=900&q=90',  wide: false },
// //       { name: 'Festival', sub: 'Bold boho festival styles',   tag: 'Bestseller', img: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=1400&q=90', wide: true  },
// //     ],
// //   },
// //   'couple-sets': {
// //     label: 'Couple Sets',
// //     eyebrow: 'Women · Jewellery',
// //     heading: 'Couple',
// //     tagline: 'Sets',
// //     desc: 'Matching jewellery designed for two.',
// //     backHref: '/categories/women/jewellery',
// //     items: [
// //       { name: 'Rings',     sub: 'Matching band pairs',           tag: 'Trending',   img: 'https://images.unsplash.com/photo-1588444650733-d0f07d323dde?w=900&q=90',  wide: false },
// //       { name: 'Bracelets', sub: 'His & hers wrist sets',         tag: 'Bestseller', img: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=900&q=90',  wide: false },
// //       { name: 'Necklaces', sub: 'Complementary pendant pairs',   tag: 'Popular',    img: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=900&q=90',  wide: false },
// //       { name: 'Gift Sets', sub: 'Curated gift box combos',       tag: 'New',        img: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=1400&q=90', wide: true  },
// //     ],
// //   },
// // };

// // const MARQUEE_WORDS = [
// //   'Dainty Chains', 'Layered Sets', 'Statement Pendants', 'Charm Necklaces',
// //   'Everyday Essentials', 'Gold Plated', 'Sterling Silver', 'Fine Jewellery',
// //   'Handcrafted', 'Sustainably Sourced', 'Gift Worthy', 'Limited Editions',
// // ];

// // // ─── Marquee ──────────────────────────────────────────────────────────────────
// // function Marquee() {
// //   const words = [...MARQUEE_WORDS, ...MARQUEE_WORDS];
// //   return (
// //     <div className="marquee-wrap">
// //       <div className="marquee-track">
// //         {words.map((w, i) => (
// //           <span key={i} className="marquee-item">
// //             {w} <span className="marquee-sep">·</span>
// //           </span>
// //         ))}
// //       </div>
// //     </div>
// //   );
// // }

// // // ─── Circle Filter — same logic, refreshed skin ───────────────────────────────
// // function CircleFilter({
// //   item,
// //   active,
// //   onClick,
// // }: {
// //   item: SubcategoryItem;
// //   active: boolean;
// //   onClick: () => void;
// // }) {
// //   return (
// //     <button
// //       className={`circle-btn${active ? ' circle-btn--active' : ''}`}
// //       onClick={onClick}
// //       title={item.sub}
// //     >
// //       <div className="circle-img-wrap">
// //         {/* eslint-disable-next-line @next/next/no-img-element */}
// //         <img src={item.img} alt={item.name} loading="lazy" />
// //         {active && <div className="circle-active-ring" />}
// //       </div>
// //       <span className="circle-label">{item.name}</span>
// //       {active && <span className="circle-active-dot" />}
// //     </button>
// //   );
// // }

// // // ─── Main Page ────────────────────────────────────────────────────────────────
// // export default function SubcategoryPage({ type = 'necklace' }: { type?: string }) {
// //   const resolvedType = (
// //     Object.keys(SUBCATEGORY_DATA).includes(type) ? type : 'necklace'
// //   ) as SubcategoryType;

// //   const data = SUBCATEGORY_DATA[resolvedType];

// //   const [activeSubtype, setActiveSubtype] = useState<string | null>(null);
// //   const [visible, setVisible] = useState(false);

// //   useEffect(() => { setActiveSubtype(null); }, [resolvedType]);
// //   useEffect(() => {
// //     const t = setTimeout(() => setVisible(true), 60);
// //     return () => clearTimeout(t);
// //   }, []);

// //   function handleCircleClick(name: string) {
// //     setActiveSubtype(prev => (prev === name.toLowerCase() ? null : name.toLowerCase()));
// //   }

// //   return (
// //     <>
// //       <style>{`
// //         @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@200;300;400;500&display=swap');

// //         :root {
// //           --bg:          #f5f3ee;
// //           --sage:        #6e8f66;
// //           --sage-lt:     #9ab593;
// //           --sage-pale:   #eaf0e8;
// //           --sage-ring:   rgba(110,143,102,.3);
// //           --sage-glow:   rgba(110,143,102,.12);
// //           --beige:       #c4a47a;
// //           --beige-lt:    #dfc9a8;
// //           --beige-pale:  #faf4ec;
// //           --ink:         #2a2a27;
// //           --ink-mid:     rgba(42,42,39,.52);
// //           --ink-faint:   rgba(42,42,39,.22);
// //           --border:      rgba(42,42,39,.08);
// //           --border-sage: rgba(110,143,102,.2);
// //         }

// //         *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

// //         .scp {
// //           min-height: 100vh;
// //           background: var(--bg);
// //           font-family: 'Jost', sans-serif;
// //           color: var(--ink);
// //         }

// //         /* ── Compact header ── */
// //         .scp-header {
// //           padding: 28px 48px 0;
// //           display: flex; align-items: flex-end; justify-content: space-between;
// //           opacity: 0; transform: translateY(10px);
// //           transition: opacity .5s ease, transform .5s ease;
// //         }
// //         .scp-header.vis { opacity: 1; transform: none; }

// //         .scp-title {
// //           font-family: 'Cormorant Garamond', serif;
// //           font-size: clamp(1.75rem, 3.8vw, 2.6rem);
// //           font-weight: 300; letter-spacing: .02em; line-height: 1.1; color: var(--ink);
// //         }
// //         .scp-title em { font-style: italic; color: var(--sage); }

// //         .scp-desc {
// //           margin-top: 6px;
// //           font-size: 11.5px; font-weight: 300; letter-spacing: .03em;
// //           color: var(--ink-mid); line-height: 1.65; max-width: 360px;
// //         }

// //         /* Ghost numeral — decorative only */
// //         .scp-ghost-num {
// //           font-family: 'Cormorant Garamond', serif;
// //           font-size: clamp(3.5rem, 7vw, 5.5rem);
// //           font-weight: 300; font-style: italic;
// //           color: rgba(110,143,102,.1);
// //           line-height: 1; user-select: none; flex-shrink: 0;
// //           padding-left: 16px;
// //         }

// //         /* ── Marquee ── */
// //         .marquee-wrap {
// //           overflow: hidden;
// //           margin-top: 22px;
// //           padding: 9px 0;
// //           background: var(--sage-pale);
// //           border-top: 1px solid var(--border-sage);
// //           border-bottom: 1px solid var(--border-sage);
// //         }
// //         .marquee-track {
// //           display: flex; width: max-content;
// //           animation: marquee 32s linear infinite;
// //         }
// //         .marquee-track:hover { animation-play-state: paused; }
// //         .marquee-item {
// //           font-family: 'Cormorant Garamond', serif;
// //           font-size: 11px; font-style: italic; font-weight: 300;
// //           color: var(--sage); letter-spacing: .2em;
// //           padding: 0 24px; white-space: nowrap;
// //         }
// //         .marquee-sep { color: var(--beige); padding: 0 5px; opacity: .55; }
// //         @keyframes marquee {
// //           from { transform: translateX(0); }
// //           to   { transform: translateX(-50%); }
// //         }

// //         /* ── Circles section ── */
// //         .circles-section {
// //           padding: 26px 48px 22px;
// //           opacity: 0; transform: translateY(10px);
// //           transition: opacity .55s ease .14s, transform .55s ease .14s;
// //         }
// //         .circles-section.vis { opacity: 1; transform: none; }

// //         .circles-bar {
// //           display: flex; align-items: center; justify-content: space-between;
// //           margin-bottom: 18px;
// //         }
// //         .circles-label {
// //           font-size: 8px; letter-spacing: .48em; text-transform: uppercase;
// //           color: var(--sage); font-weight: 400;
// //         }

// //         /* Active pill tag */
// //         .circles-active-tag {
// //           display: inline-flex; align-items: center; gap: 7px;
// //           font-size: 8px; letter-spacing: .22em; text-transform: uppercase;
// //           color: var(--ink-mid);
// //           background: var(--beige-pale);
// //           border: 1px solid var(--beige-lt);
// //           border-radius: 100px;
// //           padding: 4px 8px 4px 12px;
// //           opacity: 0; transition: opacity .22s; pointer-events: none;
// //         }
// //         .circles-active-tag.vis { opacity: 1; pointer-events: auto; }
// //         .circles-active-tag strong { color: var(--beige); text-transform: capitalize; font-weight: 400; }
// //         .circles-clear {
// //           background: none; border: none; cursor: pointer;
// //           display: flex; align-items: center; justify-content: center;
// //           width: 18px; height: 18px; border-radius: 50%;
// //           background: rgba(196,164,122,.15);
// //           color: var(--beige); font-size: 13px; line-height: 1;
// //           transition: background .2s, color .2s;
// //         }
// //         .circles-clear:hover { background: var(--beige); color: #fff; }

// //         /* Circles row */
// //         .circles-row { display: flex; gap: 18px; flex-wrap: wrap; }

// //         /* ── Circle button — same logic, new skin ── */
// //         .circle-btn {
// //           display: flex; flex-direction: column; align-items: center; gap: 8px;
// //           background: none; border: none; cursor: pointer; padding: 0;
// //           position: relative;
// //           transition: transform .28s cubic-bezier(.25,.46,.45,.94);
// //         }
// //         .circle-btn:hover { transform: translateY(-3px); }
// //         .circle-btn--active { transform: translateY(-3px); }

// //         .circle-img-wrap {
// //           width: 78px; height: 78px; border-radius: 50%; overflow: hidden;
// //           position: relative;
// //           border: 2px solid var(--border-sage);
// //           transition: border-color .25s, box-shadow .3s;
// //           background: var(--sage-pale);
// //         }
// //         .circle-btn:hover .circle-img-wrap {
// //           border-color: var(--sage-lt);
// //           box-shadow: 0 4px 14px rgba(110,143,102,.18);
// //         }
// //         .circle-btn--active .circle-img-wrap {
// //           border-color: var(--sage);
// //           box-shadow: 0 0 0 3px var(--sage-glow), 0 4px 18px rgba(110,143,102,.2);
// //         }
// //         .circle-img-wrap img {
// //           width: 100%; height: 100%; object-fit: cover; display: block;
// //           filter: saturate(.65) brightness(.86);
// //           transition: filter .3s, transform .5s cubic-bezier(.25,.46,.45,.94);
// //         }
// //         .circle-btn:hover .circle-img-wrap img,
// //         .circle-btn--active .circle-img-wrap img {
// //           filter: saturate(.92) brightness(.96);
// //           transform: scale(1.09);
// //         }

// //         /* Active inner tint */
// //         .circle-active-ring {
// //           position: absolute; inset: 0; border-radius: 50%;
// //           background: rgba(110,143,102,.1); pointer-events: none;
// //         }

// //         .circle-label {
// //           font-size: 8.5px; letter-spacing: .28em; text-transform: uppercase;
// //           color: var(--ink-mid); font-weight: 400;
// //           transition: color .2s;
// //         }
// //         .circle-btn:hover .circle-label,
// //         .circle-btn--active .circle-label { color: var(--sage); }

// //         /* Active indicator dot */
// //         .circle-active-dot {
// //           width: 4px; height: 4px; border-radius: 50%;
// //           background: var(--sage);
// //           position: absolute; bottom: -7px; left: 50%; transform: translateX(-50%);
// //         }

// //         /* ── Thin rule ── */
// //         .scp-rule {
// //           height: 1px; margin: 0 48px;
// //           background: var(--border);
// //         }

// //         /* ── Products section ── */
// //         .products-section {
// //           opacity: 0; transform: translateY(10px);
// //           transition: opacity .6s ease .26s, transform .6s ease .26s;
// //         }
// //         .products-section.vis { opacity: 1; transform: none; }

// //         /* Strip ProductsPage inner chrome when embedded */
// //         .products-section :global(.pp) { background: transparent !important; min-height: unset; }
// //         .products-section :global(.pp-topbar),
// //         .products-section :global(.pp-footer),
// //         .products-section :global(.pp-hero) { display: none !important; }

// //         /* ── Force 2-col minimum on ProductsPage grid at all sizes ── */
// //         /* Targets common grid class names ProductsPage likely uses */
// //         .products-section :global(.products-grid),
// //         .products-section :global(.product-grid),
// //         .products-section :global(.grid),
// //         .products-section :global([class*="grid"]),
// //         .products-section :global([class*="products"]) {
// //           display: grid !important;
// //           grid-template-columns: repeat(2, 1fr) !important;
// //           gap: 12px !important;
// //         }
// //         @media (min-width: 900px) {
// //           .products-section :global(.products-grid),
// //           .products-section :global(.product-grid),
// //           .products-section :global(.grid),
// //           .products-section :global([class*="grid"]),
// //           .products-section :global([class*="products"]) {
// //             grid-template-columns: repeat(3, 1fr) !important;
// //             gap: 16px !important;
// //           }
// //         }
// //         @media (min-width: 1200px) {
// //           .products-section :global(.products-grid),
// //           .products-section :global(.product-grid),
// //           .products-section :global(.grid),
// //           .products-section :global([class*="grid"]),
// //           .products-section :global([class*="products"]) {
// //             grid-template-columns: repeat(4, 1fr) !important;
// //           }
// //         }

// //         /* ── Tablet ── */
// //         @media (max-width: 900px) {
// //           .scp-header { padding-left: 24px; padding-right: 24px; }
// //           .circles-section { padding-left: 24px; padding-right: 24px; }
// //           .scp-rule { margin-left: 24px; margin-right: 24px; }
// //           .circle-img-wrap { width: 66px; height: 66px; }
// //           .circles-row { gap: 14px; }
// //         }

// //         /* ── Mobile ── */
// //         @media (max-width: 600px) {
// //           /* Header */
// //           .scp-header {
// //             padding: 18px 16px 0;
// //             align-items: flex-start;
// //           }
// //           .scp-ghost-num { display: none; }
// //           .scp-title { font-size: 1.55rem; }
// //           .scp-desc { font-size: 11px; max-width: 100%; }

// //           /* Circles — horizontal scroll, no wrap */
// //           .circles-section { padding: 20px 0 16px; }
// //           .circles-bar { padding: 0 16px; margin-bottom: 14px; }
// //           .circles-row {
// //             gap: 0;
// //             flex-wrap: nowrap;
// //             overflow-x: auto;
// //             -webkit-overflow-scrolling: touch;
// //             scrollbar-width: none;
// //             padding: 4px 16px 10px;
// //           }
// //           .circles-row::-webkit-scrollbar { display: none; }
// //           .circle-btn { flex-shrink: 0; padding: 0 9px; }
// //           .circle-img-wrap { width: 58px; height: 58px; }
// //           .circle-label { font-size: 7.5px; letter-spacing: .22em; }

// //           /* Rule */
// //           .scp-rule { margin: 0 16px; }

// //           /* Products padding */
// //           .products-section { padding: 0; }
// //         }

// //         /* ── Small mobile (≤375px) ── */
// //         @media (max-width: 375px) {
// //           .circle-img-wrap { width: 52px; height: 52px; }
// //           .circle-label { font-size: 7px; }
// //           .scp-title { font-size: 1.35rem; }
// //         }
// //       `}</style>

// //       <div className="scp">

// //         {/* ── Your existing nav — no duplicate header rendered here ── */}
// //         <UpperNav />

// //         {/* ── Compact page intro ── */}
// //         <div className={`scp-header${visible ? ' vis' : ''}`}>
// //           <div>
// //             <h1 className="scp-title">
// //               The&nbsp;<em>{data.heading}</em>&nbsp;{data.tagline}
// //             </h1>
// //             <p className="scp-desc">{data.desc}</p>
// //           </div>
// //           <div className="scp-ghost-num">{String(data.items.length).padStart(2, '0')}</div>
// //         </div>

// //         {/* ── Marquee ── */}
// //         <Marquee />

// //         {/* ── Circles (same logic as original) ── */}
// //         <section className={`circles-section${visible ? ' vis' : ''}`}>
// //           <div className="circles-bar">
// //             <span className="circles-label">Browse by style</span>
// //             <span className={`circles-active-tag${activeSubtype ? ' vis' : ''}`}>
// //               <strong>{activeSubtype}</strong>
// //               <button
// //                 className="circles-clear"
// //                 onClick={() => setActiveSubtype(null)}
// //                 title="Clear filter"
// //               >×</button>
// //             </span>
// //           </div>

// //           <div className="circles-row">
// //             {data.items.map((item) => (
// //               <CircleFilter
// //                 key={item.name}
// //                 item={item}
// //                 active={activeSubtype === item.name.toLowerCase()}
// //                 onClick={() => handleCircleClick(item.name)}
// //               />
// //             ))}
// //           </div>
// //         </section>

// //         <div className="scp-rule" />

// //         {/* ── Products (same logic as original) ── */}
// //         <div className={`products-section${visible ? ' vis' : ''}`}>
// //           <ProductsPage
// //             type={resolvedType}
// //             subtype={activeSubtype ?? undefined}
// //             embedded
// //           />
// //         </div>

// //       </div>
// //     </>
// //   );
// // }


// 'use client';

// import { useEffect, useState } from 'react';
// import UpperNav from '@/components/ui/UpperNav';
// import ProductsPage from '@/components/product/ProductPage';

// // ─── Types ────────────────────────────────────────────────────────────────────
// interface SubcategoryItem {
//   name: string;
//   sub: string;
//   tag: string;
//   img: string;
//   wide: boolean;
// }

// interface SubcategorySectionData {
//   label: string;
//   eyebrow: string;
//   heading: string;
//   tagline: string;
//   desc: string;
//   backHref: string;
//   items: SubcategoryItem[];
// }

// type SubcategoryType =
//   | 'necklace'
//   | 'earrings'
//   | 'bracelets'
//   | 'rings'
//   | 'waist-chains'
//   | 'couple-sets';

// // ─── Data ─────────────────────────────────────────────────────────────────────
// const SUBCATEGORY_DATA: Record<SubcategoryType, SubcategorySectionData> = {
//   necklace: {
//     label: 'Necklaces',
//     eyebrow: 'Women · Jewellery',
//     heading: 'Necklace',
//     tagline: 'Edit',
//     desc: 'Delicate chains and statement pieces crafted for every mood.',
//     backHref: '/categories/women/jewellery',
//     items: [
//       { name: 'Dainty',   sub: 'Fine, barely-there chains',    tag: 'New',        img: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=900&q=90',  wide: false },
//       { name: 'Layered',  sub: 'Stack-ready multi-layer sets',  tag: 'Trending',   img: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=900&q=90',  wide: false },
//       { name: 'Pendant',  sub: 'Statement centrepieces',        tag: 'Bestseller', img: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=900&q=90',  wide: false },
//       { name: 'Charms',   sub: 'Personalised charm chains',     tag: 'Popular',    img: 'https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=900&q=90',  wide: false },
//       { name: 'Everyday', sub: 'Effortless all-day wear',       tag: 'Essential',  img: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=1400&q=90', wide: true  },
//     ],
//   },
//   earrings: {
//     label: 'Earrings',
//     eyebrow: 'Women · Jewellery',
//     heading: 'Earring',
//     tagline: 'Edit',
//     desc: 'From whisper-soft studs to sculptural hoops.',
//     backHref: '/categories/women/jewellery',
//     items: [
//       { name: 'Korean', sub: 'Minimal K-jewellery edits',    tag: 'New',        img: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=900&q=90', wide: false },
//       { name: 'Hoops',  sub: 'Classic to bold hoop styles',  tag: 'Trending',   img: 'https://images.unsplash.com/photo-1588444650733-d0f07d323dde?w=900&q=90', wide: false },
//       { name: 'Studs',  sub: 'Barely-there dome studs',      tag: 'Bestseller', img: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=900&q=90', wide: false },
//       { name: 'Pearls', sub: 'Timeless pearl elegance',      tag: 'Curated',    img: 'https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=900&q=90', wide: true  },
//     ],
//   },
//   bracelets: {
//     label: 'Bracelets',
//     eyebrow: 'Women · Jewellery',
//     heading: 'Bracelet',
//     tagline: 'Edit',
//     desc: 'Stack, layer, and adorn — wrist candy for every vibe.',
//     backHref: '/categories/women/jewellery',
//     items: [
//       { name: 'Chain',  sub: 'Sleek gold & silver chains',  tag: 'Bestseller', img: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=900&q=90',  wide: false },
//       { name: 'Kada',   sub: 'Structured bangle kadaas',    tag: 'Essential',  img: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=900&q=90',  wide: false },
//       { name: 'Charms', sub: 'Personalised charm links',    tag: 'Popular',    img: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=900&q=90',  wide: false },
//       { name: 'Beaded', sub: 'Boho & natural bead wraps',   tag: 'New',        img: 'https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=900&q=90',  wide: false },
//       { name: 'Stacks', sub: 'Curated layering sets',       tag: 'Trending',   img: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=1400&q=90', wide: true  },
//     ],
//   },
//   rings: {
//     label: 'Rings',
//     eyebrow: 'Women · Jewellery',
//     heading: 'Ring',
//     tagline: 'Edit',
//     desc: 'From barely-there stackers to statement solitaires.',
//     backHref: '/categories/women/jewellery',
//     items: [
//       { name: 'Minimal',   sub: 'Slim stackable bands',          tag: 'Bestseller', img: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=900&q=90',  wide: false },
//       { name: 'Diamond',   sub: 'Brilliant-cut CZ solitaires',   tag: 'Trending',   img: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=900&q=90',  wide: false },
//       { name: 'Couple',    sub: 'Matching pair sets',             tag: 'Popular',    img: 'https://images.unsplash.com/photo-1588444650733-d0f07d323dde?w=900&q=90',  wide: false },
//       { name: 'Statement', sub: 'Bold cocktail rings',            tag: 'New',        img: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=900&q=90',  wide: true  },
//     ],
//   },
//   'waist-chains': {
//     label: 'Waist Chains',
//     eyebrow: 'Women · Jewellery',
//     heading: 'Waist',
//     tagline: 'Chains',
//     desc: 'Delicate body chains that drape beautifully.',
//     backHref: '/categories/women/jewellery',
//     items: [
//       { name: 'Dainty',   sub: 'Barely-there single chains',  tag: 'New',        img: 'https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=900&q=90',  wide: false },
//       { name: 'Layered',  sub: 'Multi-strand body drapes',    tag: 'Trending',   img: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=900&q=90',  wide: false },
//       { name: 'Charm',    sub: 'Personalised charm chains',   tag: 'Popular',    img: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=900&q=90',  wide: false },
//       { name: 'Festival', sub: 'Bold boho festival styles',   tag: 'Bestseller', img: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=1400&q=90', wide: true  },
//     ],
//   },
//   'couple-sets': {
//     label: 'Couple Sets',
//     eyebrow: 'Women · Jewellery',
//     heading: 'Couple',
//     tagline: 'Sets',
//     desc: 'Matching jewellery designed for two.',
//     backHref: '/categories/women/jewellery',
//     items: [
//       { name: 'Rings',     sub: 'Matching band pairs',           tag: 'Trending',   img: 'https://images.unsplash.com/photo-1588444650733-d0f07d323dde?w=900&q=90',  wide: false },
//       { name: 'Bracelets', sub: 'His & hers wrist sets',         tag: 'Bestseller', img: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=900&q=90',  wide: false },
//       { name: 'Necklaces', sub: 'Complementary pendant pairs',   tag: 'Popular',    img: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=900&q=90',  wide: false },
//       { name: 'Gift Sets', sub: 'Curated gift box combos',       tag: 'New',        img: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=1400&q=90', wide: true  },
//     ],
//   },
// };

// const MARQUEE_WORDS = [
//   'Dainty Chains', 'Layered Sets', 'Statement Pendants', 'Charm Necklaces',
//   'Everyday Essentials', 'Gold Plated', 'Sterling Silver', 'Fine Jewellery',
//   'Handcrafted', 'Sustainably Sourced', 'Gift Worthy', 'Limited Editions',
// ];

// // ─── Marquee ──────────────────────────────────────────────────────────────────
// function Marquee() {
//   const words = [...MARQUEE_WORDS, ...MARQUEE_WORDS];
//   return (
//     <div className="marquee-wrap">
//       <div className="marquee-track">
//         {words.map((w, i) => (
//           <span key={i} className="marquee-item">
//             {w} <span className="marquee-sep">·</span>
//           </span>
//         ))}
//       </div>
//     </div>
//   );
// }

// // ─── Circle Filter — same logic, refreshed skin ───────────────────────────────
// function CircleFilter({
//   item,
//   active,
//   onClick,
// }: {
//   item: SubcategoryItem;
//   active: boolean;
//   onClick: () => void;
// }) {
//   return (
//     <button
//       className={`circle-btn${active ? ' circle-btn--active' : ''}`}
//       onClick={onClick}
//       title={item.sub}
//     >
//       <div className="circle-img-wrap">
//         {/* eslint-disable-next-line @next/next/no-img-element */}
//         <img src={item.img} alt={item.name} loading="lazy" />
//         {active && <div className="circle-active-ring" />}
//       </div>
//       <span className="circle-label">{item.name}</span>
//       {active && <span className="circle-active-dot" />}
//     </button>
//   );
// }

// // ─── Main Page ────────────────────────────────────────────────────────────────
// export default function SubcategoryPage({ type = 'necklace' }: { type?: string }) {
//   const resolvedType = (
//     Object.keys(SUBCATEGORY_DATA).includes(type) ? type : 'necklace'
//   ) as SubcategoryType;

//   const data = SUBCATEGORY_DATA[resolvedType];

//   const [activeSubtype, setActiveSubtype] = useState<string | null>(null);
//   const [visible, setVisible] = useState(false);

//   useEffect(() => { setActiveSubtype(null); }, [resolvedType]);
//   useEffect(() => {
//     const t = setTimeout(() => setVisible(true), 60);
//     return () => clearTimeout(t);
//   }, []);

//   function handleCircleClick(name: string) {
//     setActiveSubtype(prev => (prev === name.toLowerCase() ? null : name.toLowerCase()));
//   }

//   return (
//     <>
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@200;300;400;500&display=swap');

//         :root {
//           --bg:          #f5f3ee;
//           --sage:        #6e8f66;
//           --sage-lt:     #9ab593;
//           --sage-pale:   #eaf0e8;
//           --sage-ring:   rgba(110,143,102,.3);
//           --sage-glow:   rgba(110,143,102,.12);
//           --beige:       #c4a47a;
//           --beige-lt:    #dfc9a8;
//           --beige-pale:  #faf4ec;
//           --ink:         #2a2a27;
//           --ink-mid:     rgba(42,42,39,.52);
//           --ink-faint:   rgba(42,42,39,.22);
//           --border:      rgba(42,42,39,.08);
//           --border-sage: rgba(110,143,102,.2);
//         }

//         *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

//         .scp {
//           min-height: 100vh;
//           background: var(--bg);
//           font-family: 'Jost', sans-serif;
//           color: var(--ink);
//         }

//         /* ── Compact header ── */
//         .scp-header {
//           padding: 100px 48px 0;
//           display: flex; align-items: flex-end; justify-content: space-between;
//           opacity: 0; transform: translateY(10px);
//           transition: opacity .5s ease, transform .5s ease;
//         }
//         .scp-header.vis { opacity: 1; transform: none; }

//         .scp-title {
//           font-family: 'Cormorant Garamond', serif;
//           font-size: clamp(1.75rem, 3.8vw, 2.6rem);
//           font-weight: 300; letter-spacing: .02em; line-height: 1.1; color: var(--ink);
//         }
//         .scp-title em { font-style: italic; color: var(--sage); }

//         .scp-desc {
//           margin-top: 6px;
//           font-size: 11.5px; font-weight: 300; letter-spacing: .03em;
//           color: var(--ink-mid); line-height: 1.65; max-width: 360px;
//         }

//         /* Ghost numeral — decorative only */
//         .scp-ghost-num {
//           font-family: 'Cormorant Garamond', serif;
//           font-size: clamp(3.5rem, 7vw, 5.5rem);
//           font-weight: 300; font-style: italic;
//           color: rgba(110,143,102,.1);
//           line-height: 1; user-select: none; flex-shrink: 0;
//           padding-left: 16px;
//         }

//         /* ── Marquee ── */
//         .marquee-wrap {
//           overflow: hidden;
//           margin-top: 22px;
//           padding: 9px 0;
//           background: var(--sage-pale);
//           border-top: 1px solid var(--border-sage);
//           border-bottom: 1px solid var(--border-sage);
//         }
//         .marquee-track {
//           display: flex; width: max-content;
//           animation: marquee 32s linear infinite;
//         }
//         .marquee-track:hover { animation-play-state: paused; }
//         .marquee-item {
//           font-family: 'Cormorant Garamond', serif;
//           font-size: 11px; font-style: italic; font-weight: 300;
//           color: var(--sage); letter-spacing: .2em;
//           padding: 0 24px; white-space: nowrap;
//         }
//         .marquee-sep { color: var(--beige); padding: 0 5px; opacity: .55; }
//         @keyframes marquee {
//           from { transform: translateX(0); }
//           to   { transform: translateX(-50%); }
//         }

//         /* ── Circles section ── */
//         .circles-section {
//           padding: 26px 48px 22px;
//           opacity: 0; transform: translateY(10px);
//           transition: opacity .55s ease .14s, transform .55s ease .14s;
//         }
//         .circles-section.vis { opacity: 1; transform: none; }

//         .circles-bar {
//           display: flex; align-items: center; justify-content: space-between;
//           margin-bottom: 18px;
//         }
//         .circles-label {
//           font-size: 8px; letter-spacing: .48em; text-transform: uppercase;
//           color: var(--sage); font-weight: 400;
//         }

//         /* Active pill tag */
//         .circles-active-tag {
//           display: inline-flex; align-items: center; gap: 7px;
//           font-size: 8px; letter-spacing: .22em; text-transform: uppercase;
//           color: var(--ink-mid);
//           background: var(--beige-pale);
//           border: 1px solid var(--beige-lt);
//           border-radius: 100px;
//           padding: 4px 8px 4px 12px;
//           opacity: 0; transition: opacity .22s; pointer-events: none;
//         }
//         .circles-active-tag.vis { opacity: 1; pointer-events: auto; }
//         .circles-active-tag strong { color: var(--beige); text-transform: capitalize; font-weight: 400; }
//         .circles-clear {
//           background: none; border: none; cursor: pointer;
//           display: flex; align-items: center; justify-content: center;
//           width: 18px; height: 18px; border-radius: 50%;
//           background: rgba(196,164,122,.15);
//           color: var(--beige); font-size: 13px; line-height: 1;
//           transition: background .2s, color .2s;
//         }
//         .circles-clear:hover { background: var(--beige); color: #fff; }

//         /* Circles row */
//         .circles-row { display: flex; gap: 18px; flex-wrap: wrap; }

//         /* ── Circle button — same logic, new skin ── */
//         .circle-btn {
//           display: flex; flex-direction: column; align-items: center; gap: 8px;
//           background: none; border: none; cursor: pointer; padding: 0;
//           position: relative;
//           transition: transform .28s cubic-bezier(.25,.46,.45,.94);
//         }
//         .circle-btn:hover { transform: translateY(-3px); }
//         .circle-btn--active { transform: translateY(-3px); }

//         .circle-img-wrap {
//           width: 78px; height: 78px; border-radius: 50%; overflow: hidden;
//           position: relative;
//           border: 2px solid var(--border-sage);
//           transition: border-color .25s, box-shadow .3s;
//           background: var(--sage-pale);
//         }
//         .circle-btn:hover .circle-img-wrap {
//           border-color: var(--sage-lt);
//           box-shadow: 0 4px 14px rgba(110,143,102,.18);
//         }
//         .circle-btn--active .circle-img-wrap {
//           border-color: var(--sage);
//           box-shadow: 0 0 0 3px var(--sage-glow), 0 4px 18px rgba(110,143,102,.2);
//         }
//         .circle-img-wrap img {
//           width: 100%; height: 100%; object-fit: cover; display: block;
//           filter: saturate(.65) brightness(.86);
//           transition: filter .3s, transform .5s cubic-bezier(.25,.46,.45,.94);
//         }
//         .circle-btn:hover .circle-img-wrap img,
//         .circle-btn--active .circle-img-wrap img {
//           filter: saturate(.92) brightness(.96);
//           transform: scale(1.09);
//         }

//         /* Active inner tint */
//         .circle-active-ring {
//           position: absolute; inset: 0; border-radius: 50%;
//           background: rgba(110,143,102,.1); pointer-events: none;
//         }

//         .circle-label {
//           font-size: 8.5px; letter-spacing: .28em; text-transform: uppercase;
//           color: var(--ink-mid); font-weight: 400;
//           transition: color .2s;
//         }
//         .circle-btn:hover .circle-label,
//         .circle-btn--active .circle-label { color: var(--sage); }

//         /* Active indicator dot */
//         .circle-active-dot {
//           width: 4px; height: 4px; border-radius: 50%;
//           background: var(--sage);
//           position: absolute; bottom: -7px; left: 50%; transform: translateX(-50%);
//         }

//         /* ── Thin rule ── */
//         .scp-rule {
//           height: 1px; margin: 0 48px;
//           background: var(--border);
//         }

//         /* ── Products section ── */
//         .products-section {
//           opacity: 0; transform: translateY(10px);
//           transition: opacity .6s ease .26s, transform .6s ease .26s;
//         }
//         .products-section.vis { opacity: 1; transform: none; }

//         /* Strip ProductsPage inner chrome when embedded */
//         .products-section :global(.pp) { background: transparent !important; min-height: unset; }
//         .products-section :global(.pp-topbar),
//         .products-section :global(.pp-footer),
//         .products-section :global(.pp-hero) { display: none !important; }

//         /* ── Force 2-col minimum on ProductsPage grid at all sizes ── */
//         /* Targets common grid class names ProductsPage likely uses */
//         .products-section :global(.products-grid),
//         .products-section :global(.product-grid),
//         .products-section :global(.grid),
//         .products-section :global([class*="grid"]),
//         .products-section :global([class*="products"]) {
//           display: grid !important;
//           grid-template-columns: repeat(2, 1fr) !important;
//           gap: 12px !important;
//         }
//         @media (min-width: 900px) {
//           .products-section :global(.products-grid),
//           .products-section :global(.product-grid),
//           .products-section :global(.grid),
//           .products-section :global([class*="grid"]),
//           .products-section :global([class*="products"]) {
//             grid-template-columns: repeat(3, 1fr) !important;
//             gap: 16px !important;
//           }
//         }
//         @media (min-width: 1200px) {
//           .products-section :global(.products-grid),
//           .products-section :global(.product-grid),
//           .products-section :global(.grid),
//           .products-section :global([class*="grid"]),
//           .products-section :global([class*="products"]) {
//             grid-template-columns: repeat(4, 1fr) !important;
//           }
//         }

//         /* ── Tablet ── */
//         @media (max-width: 900px) {
//           .scp-header { padding-left: 24px; padding-right: 24px; }
//           .circles-section { padding-left: 24px; padding-right: 24px; }
//           .scp-rule { margin-left: 24px; margin-right: 24px; }
//           .circle-img-wrap { width: 66px; height: 66px; }
//           .circles-row { gap: 14px; }
//         }

//         /* ── Mobile ── */
//         @media (max-width: 600px) {
//           /* Header */
//           .scp-header {
//             padding: 78px 16px 0;
//             align-items: flex-start;
//           }
//           .scp-ghost-num { display: none; }
//           .scp-title { font-size: 1.55rem; }
//           .scp-desc { font-size: 11px; max-width: 100%; }

//           /* Circles — horizontal scroll, no wrap */
//           .circles-section { padding: 20px 0 16px; }
//           .circles-bar { padding: 0 16px; margin-bottom: 14px; }
//           .circles-row {
//             gap: 0;
//             flex-wrap: nowrap;
//             overflow-x: auto;
//             -webkit-overflow-scrolling: touch;
//             scrollbar-width: none;
//             padding: 4px 16px 10px;
//           }
//           .circles-row::-webkit-scrollbar { display: none; }
//           .circle-btn { flex-shrink: 0; padding: 0 9px; }
//           .circle-img-wrap { width: 58px; height: 58px; }
//           .circle-label { font-size: 7.5px; letter-spacing: .22em; }

//           /* Rule */
//           .scp-rule { margin: 0 16px; }

//           /* Products padding */
//           .products-section { padding: 0; }
//         }

//         /* ── Small mobile (≤375px) ── */
//         @media (max-width: 375px) {
//           .circle-img-wrap { width: 52px; height: 52px; }
//           .circle-label { font-size: 7px; }
//           .scp-title { font-size: 1.35rem; }
//         }
//       `}</style>

//       <div className="scp">

//         {/* ── Your existing nav — no duplicate header rendered here ── */}
//         <UpperNav />

//         {/* ── Compact page intro ── */}
//         <div className={`scp-header${visible ? ' vis' : ''}`}>
//           <div>
//             <h1 className="scp-title">
//               The&nbsp;<em>{data.heading}</em>&nbsp;{data.tagline}
//             </h1>
//             <p className="scp-desc">{data.desc}</p>
//           </div>
//           <div className="scp-ghost-num">{String(data.items.length).padStart(2, '0')}</div>
//         </div>

//         {/* ── Marquee ── */}
//         <Marquee />

//         {/* ── Circles (same logic as original) ── */}
//         <section className={`circles-section${visible ? ' vis' : ''}`}>
//           <div className="circles-bar">
//             <span className="circles-label">Browse by style</span>
//             <span className={`circles-active-tag${activeSubtype ? ' vis' : ''}`}>
//               <strong>{activeSubtype}</strong>
//               <button
//                 className="circles-clear"
//                 onClick={() => setActiveSubtype(null)}
//                 title="Clear filter"
//               >×</button>
//             </span>
//           </div>

//           <div className="circles-row">
//             {data.items.map((item) => (
//               <CircleFilter
//                 key={item.name}
//                 item={item}
//                 active={activeSubtype === item.name.toLowerCase()}
//                 onClick={() => handleCircleClick(item.name)}
//               />
//             ))}
//           </div>
//         </section>

//         <div className="scp-rule" />

//         {/* ── Products (same logic as original) ── */}
//         <div className={`products-section${visible ? ' vis' : ''}`}>
//           <ProductsPage
//             type={resolvedType}
//             subtype={activeSubtype ?? undefined}
//             embedded
//           />
//         </div>

//       </div>
//     </>
//   );
// }


'use client';

import { useEffect, useState } from 'react';
import UpperNav from '@/components/ui/UpperNav';
import ProductsPage from '@/components/product/ProductPage';

// ─── Types ────────────────────────────────────────────────────────────────────
interface SubcategoryItem {
  name: string;
  sub: string;
  tag: string;
  img: string;
  wide: boolean;
}

interface SubcategorySectionData {
  label: string;
  eyebrow: string;
  heading: string;
  tagline: string;
  desc: string;
  backHref: string;
  items: SubcategoryItem[];
}

type SubcategoryType =
  | 'necklace'
  | 'earrings'
  | 'bracelets'
  | 'rings'
  | 'waist-chains'
  | 'couple-sets';

// ─── Data ─────────────────────────────────────────────────────────────────────
const SUBCATEGORY_DATA: Record<SubcategoryType, SubcategorySectionData> = {
  necklace: {
    label: 'Necklaces',
    eyebrow: 'Women · Jewellery',
    heading: 'Necklace',
    tagline: 'Edit',
    desc: 'Delicate chains and statement pieces crafted for every mood.',
    backHref: '/categories/women/jewellery',
    items: [
      { name: 'Dainty',   sub: 'Fine, barely-there chains',    tag: 'New',        img: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=900&q=90',  wide: false },
      { name: 'Layered',  sub: 'Stack-ready multi-layer sets',  tag: 'Trending',   img: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=900&q=90',  wide: false },
      { name: 'Pendant',  sub: 'Statement centrepieces',        tag: 'Bestseller', img: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=900&q=90',  wide: false },
      { name: 'Charms',   sub: 'Personalised charm chains',     tag: 'Popular',    img: 'https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=900&q=90',  wide: false },
      { name: 'Everyday', sub: 'Effortless all-day wear',       tag: 'Essential',  img: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=1400&q=90', wide: true  },
    ],
  },
  earrings: {
    label: 'Earrings',
    eyebrow: 'Women · Jewellery',
    heading: 'Earring',
    tagline: 'Edit',
    desc: 'From whisper-soft studs to sculptural hoops.',
    backHref: '/categories/women/jewellery',
    items: [
      { name: 'Korean', sub: 'Minimal K-jewellery edits',    tag: 'New',        img: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=900&q=90', wide: false },
      { name: 'Hoops',  sub: 'Classic to bold hoop styles',  tag: 'Trending',   img: 'https://images.unsplash.com/photo-1588444650733-d0f07d323dde?w=900&q=90', wide: false },
      { name: 'Studs',  sub: 'Barely-there dome studs',      tag: 'Bestseller', img: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=900&q=90', wide: false },
      { name: 'Pearls', sub: 'Timeless pearl elegance',      tag: 'Curated',    img: 'https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=900&q=90', wide: true  },
    ],
  },
  bracelets: {
    label: 'Bracelets',
    eyebrow: 'Women · Jewellery',
    heading: 'Bracelet',
    tagline: 'Edit',
    desc: 'Stack, layer, and adorn — wrist candy for every vibe.',
    backHref: '/categories/women/jewellery',
    items: [
      { name: 'Chain',  sub: 'Sleek gold & silver chains',  tag: 'Bestseller', img: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=900&q=90',  wide: false },
      { name: 'Kada',   sub: 'Structured bangle kadaas',    tag: 'Essential',  img: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=900&q=90',  wide: false },
      { name: 'Charms', sub: 'Personalised charm links',    tag: 'Popular',    img: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=900&q=90',  wide: false },
      { name: 'Beaded', sub: 'Boho & natural bead wraps',   tag: 'New',        img: 'https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=900&q=90',  wide: false },
      { name: 'Stacks', sub: 'Curated layering sets',       tag: 'Trending',   img: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=1400&q=90', wide: true  },
    ],
  },
  rings: {
    label: 'Rings',
    eyebrow: 'Women · Jewellery',
    heading: 'Ring',
    tagline: 'Edit',
    desc: 'From barely-there stackers to statement solitaires.',
    backHref: '/categories/women/jewellery',
    items: [
      { name: 'Minimal',   sub: 'Slim stackable bands',          tag: 'Bestseller', img: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=900&q=90',  wide: false },
      { name: 'Diamond',   sub: 'Brilliant-cut CZ solitaires',   tag: 'Trending',   img: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=900&q=90',  wide: false },
      { name: 'Couple',    sub: 'Matching pair sets',             tag: 'Popular',    img: 'https://images.unsplash.com/photo-1588444650733-d0f07d323dde?w=900&q=90',  wide: false },
      { name: 'Statement', sub: 'Bold cocktail rings',            tag: 'New',        img: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=900&q=90',  wide: true  },
    ],
  },
  'waist-chains': {
    label: 'Waist Chains',
    eyebrow: 'Women · Jewellery',
    heading: 'Waist',
    tagline: 'Chains',
    desc: 'Delicate body chains that drape beautifully.',
    backHref: '/categories/women/jewellery',
    items: [
      { name: 'Dainty',   sub: 'Barely-there single chains',  tag: 'New',        img: 'https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=900&q=90',  wide: false },
      { name: 'Layered',  sub: 'Multi-strand body drapes',    tag: 'Trending',   img: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=900&q=90',  wide: false },
      { name: 'Charm',    sub: 'Personalised charm chains',   tag: 'Popular',    img: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=900&q=90',  wide: false },
      { name: 'Festival', sub: 'Bold boho festival styles',   tag: 'Bestseller', img: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=1400&q=90', wide: true  },
    ],
  },
  'couple-sets': {
    label: 'Couple Sets',
    eyebrow: 'Women · Jewellery',
    heading: 'Couple',
    tagline: 'Sets',
    desc: 'Matching jewellery designed for two.',
    backHref: '/categories/women/jewellery',
    items: [
      { name: 'Rings',     sub: 'Matching band pairs',           tag: 'Trending',   img: 'https://images.unsplash.com/photo-1588444650733-d0f07d323dde?w=900&q=90',  wide: false },
      { name: 'Bracelets', sub: 'His & hers wrist sets',         tag: 'Bestseller', img: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=900&q=90',  wide: false },
      { name: 'Necklaces', sub: 'Complementary pendant pairs',   tag: 'Popular',    img: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=900&q=90',  wide: false },
      { name: 'Gift Sets', sub: 'Curated gift box combos',       tag: 'New',        img: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=1400&q=90', wide: true  },
    ],
  },
};

const MARQUEE_WORDS = [
  'Dainty Chains', 'Layered Sets', 'Statement Pendants', 'Charm Necklaces',
  'Everyday Essentials', 'Gold Plated', 'Sterling Silver', 'Fine Jewellery',
  'Handcrafted', 'Sustainably Sourced', 'Gift Worthy', 'Limited Editions',
];

// ─── Marquee ──────────────────────────────────────────────────────────────────
function Marquee() {
  const words = [...MARQUEE_WORDS, ...MARQUEE_WORDS];
  return (
    <div className="marquee-wrap">
      <div className="marquee-track">
        {words.map((w, i) => (
          <span key={i} className="marquee-item">
            {w} <span className="marquee-sep">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Circle Filter ────────────────────────────────────────────────────────────
function CircleFilter({
  item,
  active,
  onClick,
}: {
  item: SubcategoryItem;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={`circle-btn${active ? ' circle-btn--active' : ''}`}
      onClick={onClick}
      title={item.sub}
    >
      <div className="circle-img-wrap">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.img} alt={item.name} loading="lazy" />
        {active && <div className="circle-active-ring" />}
      </div>
      <span className="circle-label">{item.name}</span>
      {active && <span className="circle-active-dot" />}
    </button>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SubcategoryPage({ type = 'necklace' }: { type?: string }) {
  const resolvedType = (
    Object.keys(SUBCATEGORY_DATA).includes(type) ? type : 'necklace'
  ) as SubcategoryType;

  const data = SUBCATEGORY_DATA[resolvedType];

  const [activeSubtype, setActiveSubtype] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => { setActiveSubtype(null); }, [resolvedType]);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  function handleCircleClick(name: string) {
    setActiveSubtype(prev => (prev === name.toLowerCase() ? null : name.toLowerCase()));
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@200;300;400;500&display=swap');

        :root {
          --bg:          #f5f3ee;
          --sage:        #6e8f66;
          --sage-lt:     #9ab593;
          --sage-pale:   #eaf0e8;
          --sage-glow:   rgba(110,143,102,.12);
          --beige:       #c4a47a;
          --beige-lt:    #dfc9a8;
          --beige-pale:  #faf4ec;
          --ink:         #2a2a27;
          --ink-mid:     rgba(42,42,39,.52);
          --border:      rgba(42,42,39,.08);
          --border-sage: rgba(110,143,102,.2);
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* ── Page root — NO horizontal overflow ── */
        .scp {
          min-height: 100vh;
          background: var(--bg);
          font-family: 'Jost', sans-serif;
          color: var(--ink);
          overflow-x: hidden;   /* prevent any child from busting the viewport */
          width: 100%;
        }

        /* ── Header ── */
        /* Desktop: 72px fixed navbar + 28px gap = 100px top padding */
        .scp-header {
          padding: 100px 48px 0;
          display: flex; align-items: flex-end; justify-content: space-between;
          opacity: 0; transform: translateY(10px);
          transition: opacity .5s ease, transform .5s ease;
        }
        .scp-header.vis { opacity: 1; transform: none; }

        .scp-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(1.75rem, 3.8vw, 2.6rem);
          font-weight: 300; letter-spacing: .02em; line-height: 1.1; color: var(--ink);
        }
        .scp-title em { font-style: italic; color: var(--sage); }

        .scp-desc {
          margin-top: 6px;
          font-size: 11.5px; font-weight: 300; letter-spacing: .03em;
          color: var(--ink-mid); line-height: 1.65; max-width: 360px;
        }

        .scp-ghost-num {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(3.5rem, 7vw, 5.5rem);
          font-weight: 300; font-style: italic;
          color: rgba(110,143,102,.1);
          line-height: 1; user-select: none; flex-shrink: 0;
          padding-left: 16px;
        }

        /* ── Marquee ── */
        .marquee-wrap {
          overflow: hidden;
          margin-top: 22px;
          padding: 9px 0;
          background: var(--sage-pale);
          border-top: 1px solid var(--border-sage);
          border-bottom: 1px solid var(--border-sage);
        }
        .marquee-track {
          display: flex; width: max-content;
          animation: marquee 32s linear infinite;
        }
        .marquee-track:hover { animation-play-state: paused; }
        .marquee-item {
          font-family: 'Cormorant Garamond', serif;
          font-size: 11px; font-style: italic; font-weight: 300;
          color: var(--sage); letter-spacing: .2em;
          padding: 0 24px; white-space: nowrap;
        }
        .marquee-sep { color: var(--beige); padding: 0 5px; opacity: .55; }
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }

        /* ── Circles section ── */
        .circles-section {
          padding: 26px 48px 22px;
          opacity: 0; transform: translateY(10px);
          transition: opacity .55s ease .14s, transform .55s ease .14s;
        }
        .circles-section.vis { opacity: 1; transform: none; }

        .circles-bar {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 18px;
        }
        .circles-label {
          font-size: 8px; letter-spacing: .48em; text-transform: uppercase;
          color: var(--sage); font-weight: 400;
        }

        .circles-active-tag {
          display: inline-flex; align-items: center; gap: 7px;
          font-size: 8px; letter-spacing: .22em; text-transform: uppercase;
          color: var(--ink-mid);
          background: var(--beige-pale);
          border: 1px solid var(--beige-lt);
          border-radius: 100px;
          padding: 4px 8px 4px 12px;
          opacity: 0; transition: opacity .22s; pointer-events: none;
        }
        .circles-active-tag.vis { opacity: 1; pointer-events: auto; }
        .circles-active-tag strong { color: var(--beige); text-transform: capitalize; font-weight: 400; }
        .circles-clear {
          background: none; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          width: 18px; height: 18px; border-radius: 50%;
          background: rgba(196,164,122,.15);
          color: var(--beige); font-size: 13px; line-height: 1;
          transition: background .2s, color .2s;
        }
        .circles-clear:hover { background: var(--beige); color: #fff; }

        /* Circles row — always horizontal scroll, never wraps */
        .circles-row {
          display: flex;
          gap: 18px;
          flex-wrap: nowrap;           /* never wrap — always scrollable */
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          padding-bottom: 4px;         /* breathing room for active dot */
        }
        .circles-row::-webkit-scrollbar { display: none; }

        /* ── Circle button ── */
        .circle-btn {
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          background: none; border: none; cursor: pointer; padding: 0;
          position: relative;
          flex-shrink: 0;              /* never shrink inside scroll row */
          transition: transform .28s cubic-bezier(.25,.46,.45,.94);
        }
        .circle-btn:hover { transform: translateY(-3px); }
        .circle-btn--active { transform: translateY(-3px); }

        .circle-img-wrap {
          width: 72px; height: 72px; border-radius: 50%; overflow: hidden;
          position: relative;
          border: 2px solid var(--border-sage);
          transition: border-color .25s, box-shadow .3s;
          background: var(--sage-pale);
        }
        .circle-btn:hover .circle-img-wrap {
          border-color: var(--sage-lt);
          box-shadow: 0 4px 14px rgba(110,143,102,.18);
        }
        .circle-btn--active .circle-img-wrap {
          border-color: var(--sage);
          box-shadow: 0 0 0 3px var(--sage-glow), 0 4px 18px rgba(110,143,102,.2);
        }
        .circle-img-wrap img {
          width: 100%; height: 100%; object-fit: cover; display: block;
          filter: saturate(.65) brightness(.86);
          transition: filter .3s, transform .5s cubic-bezier(.25,.46,.45,.94);
        }
        .circle-btn:hover .circle-img-wrap img,
        .circle-btn--active .circle-img-wrap img {
          filter: saturate(.92) brightness(.96);
          transform: scale(1.09);
        }

        .circle-active-ring {
          position: absolute; inset: 0; border-radius: 50%;
          background: rgba(110,143,102,.1); pointer-events: none;
        }

        .circle-label {
          font-size: 8px; letter-spacing: .26em; text-transform: uppercase;
          color: var(--ink-mid); font-weight: 400;
          transition: color .2s;
        }
        .circle-btn:hover .circle-label,
        .circle-btn--active .circle-label { color: var(--sage); }

        .circle-active-dot {
          width: 4px; height: 4px; border-radius: 50%;
          background: var(--sage);
          position: absolute; bottom: -9px; left: 50%; transform: translateX(-50%);
        }

        /* ── Thin rule ── */
        .scp-rule {
          height: 1px; margin: 0 48px;
          background: var(--border);
        }

        /* ── Products section ── */
/* ── Products section ── */
.products-section {
  padding: 0;   /* ← was 12px, bumped slightly for visual balance */
  opacity: 0; transform: translateY(10px);
  transition: opacity .6s ease .26s, transform .6s ease .26s;
}
.products-section.vis { opacity: 1; transform: none; }

/* Strip ProductsPage inner chrome when embedded */
.products-section :global(.pp) { background: transparent !important; min-height: unset; }
.products-section :global(.pp-topbar),
.products-section :global(.pp-footer),
.products-section :global(.pp-hero) { display: none !important; }

/* ── Product grid ── */
.products-section :global(.products-grid),
.products-section :global(.product-grid),
.products-section :global(.grid),
.products-section :global([class*="grid"]),
.products-section :global([class*="products"]) {
  display: grid !important;
  grid-template-columns: repeat(2, minmax(0, 1fr)) !important;  /* minmax(0,1fr) is KEY */
  gap: 10px !important;
  padding: 12px 0 !important;
}

/* Force product cards to fill their grid cell */
.products-section :global(.pc2) {
  max-width: 100% !important;
  width: 100% !important;
}

@media (min-width: 768px) {
  .products-section :global(.products-grid),
  .products-section :global(.product-grid),
  .products-section :global(.grid),
  .products-section :global([class*="grid"]),
  .products-section :global([class*="products"]) {
    grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
    gap: 14px !important;
  }
}

@media (min-width: 1200px) {
  .products-section :global(.products-grid),
  .products-section :global(.product-grid),
  .products-section :global(.grid),
  .products-section :global([class*="grid"]),
  .products-section :global([class*="products"]) {
    grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
    gap: 16px !important;
  }
}
        /* ══════════════════════════════════════════
           TABLET  (601px – 900px)
        ══════════════════════════════════════════ */
        @media (max-width: 900px) {
          .scp-header      { padding: 100px 24px 0; }
          .circles-section { padding: 22px 24px 18px; }
          .scp-rule        { margin: 0 24px; }
          .products-section { padding: 0 ; }
        }

        /* ══════════════════════════════════════════
           MOBILE  (≤ 600px)
        ══════════════════════════════════════════ */
        @media (max-width: 600px) {
          /* Mobile navbar is 60px tall */
          .scp-header {
            padding: 78px 16px 0;     /* 60px nav + 18px gap */
            align-items: flex-start;
          }
          .scp-ghost-num { display: none; }
          .scp-title     { font-size: 1.45rem; }
          .scp-desc      { font-size: 10.5px; max-width: 100%; margin-top: 4px; }

          /* Circles — full-bleed scroll with edge insets */
          .circles-section { padding: 18px 0 16px; }
          .circles-bar     { padding: 0 16px; margin-bottom: 12px; }
          .circles-row {
            padding: 4px 16px 12px;  /* left/right inset so first/last circles breathe */
            gap: 12px;
          }
          .circle-img-wrap { width: 58px; height: 58px; }
          .circle-label    { font-size: 7px; letter-spacing: .2em; }

          /* Rule */
          .scp-rule { margin: 0 16px; }

          /* Products — tight padding on mobile, 2 cols stay */
          /* Products — mobile */
.products-section { padding: 0 ; }   /* ← tighter on mobile */

.products-section :global(.products-grid),
.products-section :global(.product-grid),
.products-section :global(.grid),
.products-section :global([class*="grid"]),
.products-section :global([class*="products"]) {
  gap: 8px !important;
  padding: 10px 0 !important;
}
        }

        /* ══════════════════════════════════════════
           SMALL MOBILE  (≤ 375px)
        ══════════════════════════════════════════ */
        @media (max-width: 375px) {
          .circle-img-wrap { width: 50px; height: 50px; }
          .circle-label    { font-size: 6.5px; }
          .scp-title       { font-size: 1.25rem; }
          .products-section { padding: 0 ; }
          .products-section :global(.products-grid),
          .products-section :global(.product-grid),
          .products-section :global(.grid),
          .products-section :global([class*="grid"]),
          .products-section :global([class*="products"]) {
            gap: 6px !important;
          }
        }
      `}</style>

      <div className="scp">

        <UpperNav />

        {/* ── Compact page intro ── */}
        <div className={`scp-header${visible ? ' vis' : ''}`}>
          <div>
            <h1 className="scp-title">
              The&nbsp;<em>{data.heading}</em>&nbsp;{data.tagline}
            </h1>
            <p className="scp-desc">{data.desc}</p>
          </div>
          <div className="scp-ghost-num">{String(data.items.length).padStart(2, '0')}</div>
        </div>

        {/* ── Marquee ── */}
        <Marquee />

        {/* ── Circles ── */}
        <section className={`circles-section${visible ? ' vis' : ''}`}>
          <div className="circles-bar">
            <span className="circles-label">Browse by style</span>
            <span className={`circles-active-tag${activeSubtype ? ' vis' : ''}`}>
              <strong>{activeSubtype}</strong>
              <button
                className="circles-clear"
                onClick={() => setActiveSubtype(null)}
                title="Clear filter"
              >×</button>
            </span>
          </div>

          <div className="circles-row">
            {data.items.map((item) => (
              <CircleFilter
                key={item.name}
                item={item}
                active={activeSubtype === item.name.toLowerCase()}
                onClick={() => handleCircleClick(item.name)}
              />
            ))}
          </div>
        </section>

        <div className="scp-rule" />

        {/* ── Products ── */}
        <div className={`products-section${visible ? ' vis' : ''}`}>
          <ProductsPage
            type={resolvedType}
            subtype={activeSubtype ?? undefined}
            embedded
          />
        </div>

      </div>
    </>
  );
}