
'use client';

import { useEffect, useState } from 'react';
import { useGender } from '@/lib/genderContext';
import UpperNav from '@/components/ui/UpperNav';
import ProductsPage from '@/components/product/ProductPage';
import { fetchCatalogProducts, type CatalogProduct } from '@/lib/catalogApi';

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

// const MARQUEE_WORDS = [
//   'Dainty Chains', 'Layered Sets', 'Statement Pendants', 'Charm Necklaces',
//   'Everyday Essentials', 'Gold Plated', 'Sterling Silver', 'Fine Jewellery',
//   'Handcrafted', 'Sustainably Sourced', 'Gift Worthy', 'Limited Editions',
// ];

// ─── Marquee ──────────────────────────────────────────────────────────────────
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
  const resolvedType = (type || 'necklace').toLowerCase();
  const [dynamicItems, setDynamicItems] = useState<SubcategoryItem[]>([]);
  const [scopedProducts, setScopedProducts] = useState<CatalogProduct[]>([]);
  const { gender } = useGender();

  const displayLabel = resolvedType
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

  const data: SubcategorySectionData = {
    label: displayLabel,
    eyebrow: 'Jewellery',
    heading: displayLabel.split(' ')[0] || 'Subcategory',
    tagline: 'Edit',
    desc: 'Curated live from the latest catalog data.',
    backHref: `/categories/${gender || 'women'}/jewellery`,
    items: dynamicItems,
  };

  const [activeSubtype, setActiveSubtype] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => { setActiveSubtype(null); }, [resolvedType]);
  useEffect(() => {
    let mounted = true;

    fetchCatalogProducts({ subCategorySlug: resolvedType })
      .then((products) => {
        if (!mounted) {
          return;
        }

        setScopedProducts(products);
        const scoped = products;
        const tagMap = new Map<string, { originalName: string; count: number; img: string }>();

        scoped.forEach((product) => {
          const tags = product.tags || [];
          tags.slice(0, 2).forEach((tag) => {
            const rawKey = tag.trim();
            if (!rawKey) return;
            const key = rawKey.toLowerCase();
            const prev = tagMap.get(key);
            tagMap.set(key, {
              originalName: prev?.originalName || rawKey,
              count: (prev?.count || 0) + 1,
              img: prev?.img || product.mainImage || product.images[0],
            });
          });
        });

        const items = Array.from(tagMap.values())
          .sort((a, b) => b.count - a.count)
          .slice(0, 6)
          .map((info) => ({
            name: info.originalName.replace(/\b\w/g, (char) => char.toUpperCase()),
            sub: `${info.count} pieces`,
            tag: 'Live',
            img: info.img,
            wide: false,
          }));

        setDynamicItems(items);
      })
      .catch(() => {
        if (mounted) {
          setDynamicItems([]);
          setScopedProducts([]);
        }
      });

    return () => {
      mounted = false;
    };
  }, [resolvedType]);

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
          --sage-ring:   rgba(110,143,102,.3);
          --sage-glow:   rgba(110,143,102,.12);
          --beige:       #c4a47a;
          --beige-lt:    #dfc9a8;
          --beige-pale:  #faf4ec;
          --ink:         #2a2a27;
          --ink-mid:     rgba(42,42,39,.52);
          --ink-faint:   rgba(42,42,39,.22);
          --border:      rgba(42,42,39,.08);
          --border-sage: rgba(110,143,102,.2);
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .scp {
          min-height: 100vh;
          background: var(--bg);
          font-family: 'Jost', sans-serif;
          color: var(--ink);
        }

        /* ── Compact header ── */
        .scp-header {
          padding: 20px 48px 0;
          display: flex; align-items: flex-end; justify-content: space-between;
          opacity: 0; transform: translateY(10px);
          transition: opacity .5s ease, transform .5s ease;
        }
        .scp-header.vis { opacity: 1; transform: none; }

        .scp-breadcrumb {
          display: flex; align-items: center; gap: 6px;
          margin-bottom: 12px;
          font-size: 10px; font-weight: 400; letter-spacing: .12em;
          text-transform: uppercase; color: var(--ink-mid);
        }
        .scp-breadcrumb a {
          color: var(--sage); text-decoration: none;
          transition: color .18s;
        }
        .scp-breadcrumb a:hover { color: var(--ink); }
        .scp-breadcrumb-sep { color: var(--ink-faint); }

        .scp-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(1.75rem, 3.8vw, 2.6rem);
          font-weight: 400; letter-spacing: .02em; line-height: 1.1; color: var(--ink);
        }
        .scp-title em { font-style: italic; color: #1B5E20; font-weight: 400}

        .scp-desc {
          margin-top: 8px;
          font-size: 20px; font-weight: 300; letter-spacing: .03em;
          color: #0f0d0d; line-height: 1.65; max-width: 360px;
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
          margin-top: 24px;
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
          padding: 20px 48px 0;
          position: relative;
          z-index: 1;
          opacity: 0; transform: translateY(10px);
          transition: opacity .55s ease .14s, transform .55s ease .14s;
        }
        .circles-section.vis { opacity: 1; transform: none; }

        .circles-bar {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 10px;
        }
        .circles-label {
          font-size: 11px; letter-spacing: .38em; text-transform: uppercase;
          color: #1B5E20; font-weight: 400;
        }

        .circles-active-tag {
          display: inline-flex; align-items: center; gap: 7px;
          font-size: 8px; letter-spacing: .22em; text-transform: uppercase;
          color: var(--ink-mid);
          background: var(--beige-pale);
          border: 1px solid var(--beige-lt);
          border-radius: 2px;
          padding: 5px 8px 5px 12px;
          opacity: 0; transition: opacity .22s; pointer-events: none;
        }
        .circles-active-tag.vis { opacity: 1; pointer-events: auto; }
        .circles-active-tag strong { color: var(--beige); text-transform: capitalize; font-weight: 400; }
        .circles-clear {
          background: none; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          width: 18px; height: 18px; border-radius: 2px;
          background: rgba(196,164,122,.15);
          color: var(--beige); font-size: 13px; line-height: 1;
          transition: background .2s, color .2s;
        }
        .circles-clear:hover { background: var(--beige); color: #fff; }

        /* Circles row */
        .circles-row { display: flex; gap: 10px; flex-wrap: wrap; }

        /* ── Circle button ── */
        .circle-btn {
          display: flex; flex-direction: column; align-items: center; gap: 9px;
          background: none; border: none; cursor: pointer; padding: 0 0 8px;
          position: relative;
          transition: transform .28s cubic-bezier(.25,.46,.45,.94);
        }
        .circle-btn:hover { transform: translateY(-3px); }
        .circle-btn--active { transform: translateY(-3px); }

        .circle-img-wrap {
          width: 80px; height: 80px; border-radius: 50%; overflow: hidden;
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
          font-size: 9px; letter-spacing: .26em; text-transform: uppercase;
          color: #101010; font-weight: 400;
          transition: color .2s;
        }
        .circle-btn:hover .circle-label,
        .circle-btn--active .circle-label { color: var(--sage); }

        .circle-active-dot {
          width: 4px; height: 4px; border-radius: 50%;
          background: var(--sage);
          position: absolute; bottom: -2px; left: 50%; transform: translateX(-50%);
        }

        /* ── Divider ── */
        .scp-rule {
          display: none;
        }

        /* ── Products section ── */
        .products-section {
          opacity: 0; transform: translateY(10px);
          transition: opacity .6s ease .26s, transform .6s ease .26s;
        }
        .products-section.vis { opacity: 1; transform: none; }

        /* Strip ProductsPage chrome when embedded */
        .products-section :global(.pp) { background: transparent !important; min-height: unset; }
        .products-section :global(.pp-topbar),
        .products-section :global(.pp-footer),
        .products-section :global(.pp-hero) { display: none !important; }

        /* ── Tablet ── */
        @media (max-width: 900px) {
          .scp-header { padding-left: 28px; padding-right: 28px; }
          .circles-section { padding-left: 28px; padding-right: 28px; }
          .scp-rule { margin-left: 28px; margin-right: 28px; }
          .circle-img-wrap { width: 68px; height: 68px; }
          .circles-row { gap: 16px; }
        }

        /* ── Mobile ── */
        @media (max-width: 600px) {
          /* Header */
          .scp-header {
            padding: 20px 16px 0;
            align-items: flex-start;
            flex-direction: column;
            gap: 0;
          }
          .scp-ghost-num { display: none; }
          .scp-title { font-size: 1.6rem; }
          .scp-desc { font-size: 11.5px; max-width: 100%; }
          .scp-breadcrumb { font-size: 9px; }

          /* Marquee */
          .marquee-wrap { margin-top: 20px; }

          /* Circles — horizontal scroll */
          .circles-section { padding: 12px 0 4px; }
          .circles-bar { padding: 0 16px; margin-bottom: 8px; }
          .circles-row {
            gap: 0;
            flex-wrap: nowrap;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
            padding: 4px 0 0 0;
          }
          .circles-row::-webkit-scrollbar { display: none; }
          .circle-btn { flex-shrink: 0; padding: 0 10px 8px; }
          .circle-btn:first-child { padding-left: 16px; }   
.circle-btn:last-child  { padding-right: 16px; }  
          .circle-img-wrap { width: 60px; height: 60px; }
          .circle-label { font-size: 8px; letter-spacing: .2em; }

          /* Rule */
          .scp-rule { margin: 0 16px; }

          /* Products */
          .products-section { padding: 0; margin-top: 0}
        }

        /* ── Small mobile ── */
        @media (max-width: 375px) {
          .circle-img-wrap { width: 52px; height: 52px; }
          .circle-label { font-size: 7.5px; }
          .scp-title { font-size: 1.4rem; }
        }
      `}</style>

      <div className="scp">

        <UpperNav />

        {/* ── Page intro ── */}
        <div className={`scp-header${visible ? ' vis' : ''}`}>
          <div>
            {/* <div className="scp-breadcrumb">
              <a href="/">Home</a>
              <span className="scp-breadcrumb-sep">›</span>
              <a href={data.backHref}>{data.eyebrow}</a>
              <span className="scp-breadcrumb-sep">›</span>
              <span>{data.label}</span>
            </div> */}
            <h1 className="scp-title">
              The&nbsp;<em>{data.heading}</em>&nbsp;{data.tagline}
            </h1>
            <p className="scp-desc">{data.desc}</p>
          </div>
          <div className="scp-ghost-num">{String(data.items.length).padStart(2, '0')}</div>
        </div>

        {/* ── Marquee ── */}
        {/* <Marquee /> */}

        {/* ── Style filters ── */}
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
            products={scopedProducts}
   productLinkBase={
  resolvedType === 'charm-jewellery' || resolvedType === 'custom-charm-jewellery'
    ? '/custom-charm'
    : '/products'
}
  />
        </div>

      </div>
    </>
  );
}