'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import SubcategoryPage from '../ui/SubCategorySection';

// ─── Data ────────────────────────────────────────────────────────────────────
const JEWELLERY_IMAGES = {
  necklace:  'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=90',
  earrings:  'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=90',
  rings:     'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=90',
  bracelets: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=90',
  waistChain:'https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=800&q=90',
  couple:    'https://images.unsplash.com/photo-1588444650733-d0f07d323dde?w=800&q=90',
  giftBox:   'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&q=90',
  fanCombo:  'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=800&q=90',
  hair:      'https://images.unsplash.com/photo-1591206422576-7e00ff5f7db7?w=800&q=90',
  keychain:  'https://images.unsplash.com/photo-1582143570735-ebf7c44a5c54?w=800&q=90',
  combo:     'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=800&q=90',
  charm:     'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=800&q=90',
};

// ─────────────────────────────────────────────────────────────────────────────
// UPDATED: Necklaces, Earrings, Bracelets now link to /subcategory/<type>
// so they render <SubcategoryPage type="necklace|earrings|bracelets" />.
// Rings, Waist Chains, Couple Sets keep their original deep-link hrefs.
// ─────────────────────────────────────────────────────────────────────────────
const womenJewellery = [
  { name: 'Necklaces',    img: JEWELLERY_IMAGES.necklace,   href: '/subcategory/necklace'  },   // ← SubcategoryPage
  { name: 'Earrings',     img: JEWELLERY_IMAGES.earrings,   href: '/subcategory/earrings'  },   // ← SubcategoryPage
  { name: 'Rings',        img: JEWELLERY_IMAGES.rings,      href: '/categories/women/jewellery/rings'       },
  { name: 'Bracelets',    img: JEWELLERY_IMAGES.bracelets,  href: '/subcategory/bracelets' },   // ← SubcategoryPage
  { name: 'Waist Chains', img: JEWELLERY_IMAGES.waistChain, href: '/categories/women/jewellery/waist-chains' },
  { name: 'Couple Sets',  img: JEWELLERY_IMAGES.couple,     href: '/categories/women/jewellery/couple'       },
];

const menJewellery = [
  { name: 'Necklaces',    img: JEWELLERY_IMAGES.necklace,   href: '/subcategory/necklace'  },
  { name: 'Earrings',     img: JEWELLERY_IMAGES.earrings,   href: '/subcategory/earrings'  },
  { name: 'Rings',        img: JEWELLERY_IMAGES.rings,      href: '/categories/men/jewellery/rings'         },
  { name: 'Bracelets',    img: JEWELLERY_IMAGES.bracelets,  href: '/subcategory/bracelets' },
  { name: 'Waist Chains', img: JEWELLERY_IMAGES.waistChain, href: '/categories/men/jewellery/waist-chains'  },
  { name: 'Couple Sets',  img: JEWELLERY_IMAGES.couple,     href: '/categories/men/jewellery/couple'         },
];

const buildCategories = (gender) => [
  { name: 'Jewellery',          icon: '◈', img: JEWELLERY_IMAGES.necklace,  href: `/categories/${gender}/jewellery`,        sub: gender === 'women' ? womenJewellery : menJewellery },
  { name: 'Gift Boxes',         icon: '⊡', img: JEWELLERY_IMAGES.giftBox,   href: `/categories/${gender}/gift-boxes`,       sub: [] },
  { name: 'Fan Combos',         icon: '✦', img: JEWELLERY_IMAGES.fanCombo,  href: `/categories/${gender}/fan-combos`,       sub: [] },
  { name: 'Custom Charm Jewellery',       icon: '◎', img: JEWELLERY_IMAGES.charm,     href: `/categories/${gender}/custom-charm`,     sub: [] },
  { name: 'Hair Accessories',   icon: '⟡', img: JEWELLERY_IMAGES.hair,      href: `/categories/${gender}/hair-accessories`, sub: [] },
  { name: 'Keychains', icon: '⌖', img: JEWELLERY_IMAGES.keychain,  href: `/categories/${gender}/keychains`,        sub: [] },
  { name: 'Curated Combos',     icon: '⊞', img: JEWELLERY_IMAGES.combo,     href: `/categories/${gender}/curated-combos`,  sub: [] },
];

// ─── Sub Card with mouse-tracking shine ──────────────────────────────────────
function ShineCard({ sub, index }) {
  const cardRef = useRef(null);
  const [shine, setShine] = useState({ x: 50, y: 50, active: false });

  const handleMouseMove = (e) => {
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setShine({ x, y, active: true });
  };

  const handleMouseLeave = () => setShine(s => ({ ...s, active: false }));

  return (
    <Link
      ref={cardRef}
      href={sub.href}
      className="sc-card"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ '--sx': `${shine.x}%`, '--sy': `${shine.y}%`, animationDelay: `${index * 0.07}s` }}
    >
      <div className="sc-img-wrap">
        <img src={sub.img} alt={sub.name} loading="lazy" />
        <div className="sc-grad" />
        <div className={`sc-shine ${shine.active ? 'active' : ''}`} />
        <div className="sc-vignette" />
      </div>

      <div className="sc-bottom">
        <span className="sc-idx">0{index + 1}</span>
        <span className="sc-name">{sub.name}</span>
        <span className="sc-arrow">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </span>
      </div>

      <div className="sc-line" />
    </Link>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CategorySection() {
  const [tab, setTab]             = useState('women');
  const [activeIdx, setActiveIdx] = useState(0);
  const [visible, setVisible]     = useState(false);
  const sectionRef                = useRef(null);

  const categories = buildCategories(tab);
  const active     = categories[activeIdx];

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400;1,600&family=Jost:wght@200;300;400;500;600&display=swap');

        :root {
          --bg:          #1a2010;
          --bg2:         #141a0c;
          --panel:       rgba(16,22,9,0.72);
          --sidebar-bg:  rgba(10,14,6,0.55);
          --gold:        #d4a843;
          --gold2:       #b8902b;
          --gold3:       #f0c96a;
          --gold-glow:   rgba(212,168,67,.18);
          --cream:       #f2ead8;
          --cream2:      #d6cab0;
          --muted:       rgba(242,234,216,.45);
          --muted2:      rgba(242,234,216,.65);
          --border:      rgba(212,168,67,.12);
          --border2:     rgba(212,168,67,.32);
          --olive-light: #7a8e5c;
        }

        *,*::before,*::after { box-sizing:border-box; margin:0; padding:0; }

        .cs {
          background: var(--bg);
          background-image:
            radial-gradient(ellipse 110% 55% at 50% -8%, rgba(212,168,67,.07) 0%, transparent 65%),
            radial-gradient(ellipse 40% 40% at 92% 88%, rgba(61,79,42,.4) 0%, transparent 58%);
          padding: 44px 0 56px;
          font-family: 'Jost', sans-serif;
          position: relative;
          overflow: hidden;
        }

        .cs::before {
          content:'';
          position:absolute; inset:0; pointer-events:none; z-index:0;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='250' height='250'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='250' height='250' filter='url(%23n)' opacity='0.032'/%3E%3C/svg%3E");
          mix-blend-mode: overlay; opacity:.5;
        }

        .cs-hd {
          display: flex; align-items: center;
          justify-content: space-between;
          padding: 0 40px; margin-bottom: 22px;
          position: relative; z-index:1;
          opacity: 0; transform: translateY(16px);
          transition: opacity .6s ease, transform .6s ease;
        }
        .cs-hd.in { opacity:1; transform:translateY(0); }

        .cs-hd-left { display:flex; align-items:baseline; gap:14px; }

        .cs-eyebrow {
          font-size:8.5px; letter-spacing:.46em; text-transform:uppercase;
          color:var(--gold); font-weight:500; opacity:.85;
        }

        .cs-title {
          font-family:'Playfair Display',serif;
          font-size: clamp(1.3rem, 2.2vw, 1.9rem);
          font-weight:400; color:var(--cream);
          letter-spacing:.01em; line-height:1;
        }
        .cs-title em { font-style:italic; color:var(--gold); }

        .cs-toggle {
          display:flex; align-items:center;
          background:rgba(0,0,0,.32);
          border:1px solid var(--border);
          padding:3px; position:relative;
          backdrop-filter:blur(10px);
        }
        .cs-pill {
          position:absolute; top:3px; bottom:3px;
          width:calc(50% - 3px); left:3px;
          background:linear-gradient(135deg, var(--gold) 0%, var(--gold2) 100%);
          transition:transform .42s cubic-bezier(.77,0,.18,1);
        }
        .cs-pill.right { transform:translateX(100%); }
        .cs-tbtn {
          position:relative; z-index:1; padding:8px 24px;
          font-family:'Jost',sans-serif; font-size:9.5px;
          font-weight:600; letter-spacing:.28em; text-transform:uppercase;
          background:transparent; border:none; cursor:pointer;
          color:var(--muted); transition:color .3s;
        }
        .cs-tbtn.on { color:var(--bg2); }

        .cs-wrap {
          padding:0 40px; position:relative; z-index:1;
          opacity:0; transform:translateY(22px);
          transition:opacity .7s ease .15s, transform .7s ease .15s;
        }
        .cs-wrap.in { opacity:1; transform:translateY(0); }

        .cs-panel {
          display:grid;
          grid-template-columns: 200px 1fr;
          border:1px solid var(--border);
          background:var(--panel);
          backdrop-filter:blur(28px);
          position:relative; overflow:hidden;
          box-shadow: 0 28px 90px rgba(0,0,0,.45), inset 0 1px 0 rgba(212,168,67,.05);
        }

        .cs-panel::before,
        .cs-panel::after {
          content:''; position:absolute;
          width:30px; height:30px;
          border-color:var(--gold); border-style:solid; z-index:10; opacity:.5;
        }
        .cs-panel::before { top:-1px; left:-1px; border-width:1.5px 0 0 1.5px; }
        .cs-panel::after  { bottom:-1px; right:-1px; border-width:0 1.5px 1.5px 0; }

        .cs-sb {
          border-right:1px solid var(--border);
          padding:4px 0 20px;
          background:var(--sidebar-bg);
        }
        .cs-sb-lbl {
          font-size:7.5px; letter-spacing:.46em; text-transform:uppercase;
          color:var(--olive-light); padding:18px 18px 10px;
          display:block; opacity:.45;
        }
        .cs-sbbtn {
          display:flex; align-items:center; gap:10px;
          width:100%; padding:11px 16px;
          background:transparent; border:none;
          border-left:2px solid transparent;
          cursor:pointer; text-align:left;
          color:var(--muted); position:relative; overflow:hidden;
          transition:color .22s, border-color .22s;
        }
        .cs-sbbtn::after {
          content:''; position:absolute; inset:0;
          background:linear-gradient(90deg, var(--gold-glow), transparent);
          opacity:0; transition:opacity .25s;
        }
        .cs-sbbtn:hover { color:var(--cream2); border-left-color:rgba(212,168,67,.28); }
        .cs-sbbtn:hover::after { opacity:.55; }
        .cs-sbbtn.on { color:var(--gold); border-left-color:var(--gold); }
        .cs-sbbtn.on::after { opacity:1; }
        .cs-sb-glyph { font-size:12px; color:var(--gold2); opacity:.5; transition:opacity .22s; position:relative;z-index:1; }
        .cs-sbbtn:hover .cs-sb-glyph,
        .cs-sbbtn.on   .cs-sb-glyph { opacity:1; }
        .cs-sb-txt  { font-size:11px; font-weight:400; letter-spacing:.05em; flex:1; position:relative;z-index:1; }
        .cs-sb-cnt  { font-size:7.5px; color:var(--olive-light); opacity:.4; transition:opacity .22s; position:relative;z-index:1; }
        .cs-sbbtn.on .cs-sb-cnt { opacity:.7; color:var(--gold2); }

        .cs-ct { padding:22px 24px 26px; min-height:420px; position:relative; }

        .cs-ct-hd {
          display:flex; align-items:center; justify-content:space-between;
          margin-bottom:18px; padding-bottom:13px;
          border-bottom:1px solid var(--border); position:relative;
        }
        .cs-ct-hd::after {
          content:''; position:absolute; bottom:-1px; left:0;
          width:60px; height:1px;
          background:linear-gradient(90deg, var(--gold), transparent);
        }
        .cs-ct-title {
          font-family:'Playfair Display',serif;
          font-size:1.35rem; font-weight:400;
          color:var(--cream); letter-spacing:.02em;
        }
        .cs-ct-title em { font-style:italic; color:var(--gold); }
        .cs-va {
          display:flex; align-items:center; gap:6px;
          font-size:9px; font-weight:600; letter-spacing:.24em; text-transform:uppercase;
          color:var(--gold2); text-decoration:none; opacity:.75;
          transition:color .2s, gap .22s, opacity .2s;
        }
        .cs-va:hover { color:var(--gold); gap:10px; opacity:1; }

        .cs-grid {
          display:grid;
          grid-template-columns: repeat(3, 1fr);
          gap:14px;
        }

        .sc-card {
          display:block; text-decoration:none;
          position:relative; overflow:hidden;
          border:1px solid var(--border);
          transition:border-color .35s, box-shadow .35s;
          cursor:pointer;
          animation: cardIn .55s ease both;
        }
        @keyframes cardIn {
          from { opacity:0; transform:translateY(18px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .sc-card:hover {
          border-color:var(--border2);
          box-shadow:0 10px 50px rgba(0,0,0,.4), 0 0 0 1px rgba(212,168,67,.07) inset;
        }

        .sc-img-wrap {
          position:relative;
          aspect-ratio: 4 / 3;
          overflow:hidden;
          background:var(--bg2);
        }
        .sc-img-wrap img {
          width:100%; height:100%; object-fit:cover;
          filter:brightness(.72) saturate(.82) sepia(.08);
          transition:transform .75s cubic-bezier(.25,.46,.45,.94), filter .45s;
          display:block;
        }
        .sc-card:hover .sc-img-wrap img {
          transform:scale(1.08);
          filter:brightness(.88) saturate(1.0) sepia(.04);
        }

        .sc-grad {
          position:absolute; inset:0;
          background:linear-gradient(to top, rgba(16,22,9,.92) 0%, rgba(16,22,9,.28) 52%, transparent 72%);
        }
        .sc-shine {
          position:absolute; inset:0; pointer-events:none;
          background:radial-gradient(circle at var(--sx,50%) var(--sy,50%), rgba(212,168,67,.14) 0%, transparent 60%);
          opacity:0; transition:opacity .3s;
        }
        .sc-shine.active { opacity:1; }
        .sc-vignette {
          position:absolute; inset:0;
          background:linear-gradient(135deg, rgba(212,168,67,.06) 0%, transparent 55%);
          opacity:0; transition:opacity .4s;
        }
        .sc-card:hover .sc-vignette { opacity:1; }

        .sc-bottom {
          position:absolute; bottom:0; left:0; right:0;
          padding:14px 14px 13px;
          display:flex; align-items:center; gap:8px;
        }
        .sc-idx {
          font-size:7.5px; font-weight:600; letter-spacing:.1em;
          color:var(--gold); opacity:0; transform:translateY(4px);
          transition:opacity .28s, transform .28s;
        }
        .sc-card:hover .sc-idx { opacity:.6; transform:translateY(0); }
        .sc-name {
          font-size:10.5px; font-weight:600;
          letter-spacing:.2em; text-transform:uppercase;
          color:var(--cream); flex:1;
        }
        .sc-arrow {
          color:var(--gold);
          opacity:0; transform:translateX(-5px);
          transition:opacity .28s ease .04s, transform .28s ease .04s;
          display:flex; align-items:center;
        }
        .sc-card:hover .sc-arrow { opacity:1; transform:translateX(0); }

        .sc-line {
          position:absolute; bottom:0; left:0; right:0;
          height:2px;
          background:linear-gradient(90deg, var(--gold2), var(--gold), var(--gold2));
          transform:scaleX(0); transform-origin:left;
          transition:transform .42s cubic-bezier(.25,.46,.45,.94);
        }
        .sc-card:hover .sc-line { transform:scaleX(1); }

        .cs-solo {
          display:block; text-decoration:none;
          position:relative; overflow:hidden;
          height:100%; min-height:360px;
          border:1px solid var(--border);
          transition:border-color .35s;
        }
        .cs-solo:hover { border-color:var(--border2); }
        .cs-solo-img {
          width:100%; height:100%; object-fit:cover;
          filter:brightness(.42) saturate(.65) sepia(.12);
          position:absolute; inset:0;
          transition:transform .85s cubic-bezier(.25,.46,.45,.94), filter .45s;
        }
        .cs-solo:hover .cs-solo-img { transform:scale(1.05); filter:brightness(.52) saturate(.8) sepia(.07); }
        .cs-solo-ov {
          position:absolute; inset:0;
          background:
            linear-gradient(135deg, rgba(16,22,9,.78) 0%, transparent 55%),
            linear-gradient(to top, rgba(16,22,9,.9) 0%, transparent 55%);
        }
        .cs-solo-inset {
          position:absolute; inset:14px;
          border:1px solid transparent;
          transition:border-color .45s; pointer-events:none;
        }
        .cs-solo:hover .cs-solo-inset { border-color:rgba(212,168,67,.18); }
        .cs-solo-body { position:absolute; bottom:0; left:0; right:0; padding:30px 28px; }
        .cs-solo-ey {
          display:flex; align-items:center; gap:9px;
          font-size:7.5px; letter-spacing:.46em; text-transform:uppercase;
          color:var(--gold); margin-bottom:10px; opacity:.8;
        }
        .cs-solo-ey::before { content:''; width:20px; height:1px; background:currentColor; opacity:.55; }
        .cs-solo-ttl {
          font-family:'Playfair Display',serif;
          font-size:clamp(1.7rem,3.5vw,2.6rem);
          font-weight:400; font-style:italic;
          color:var(--cream); display:block; margin-bottom:18px; line-height:1.1;
        }
        .cs-solo-cta {
          display:inline-flex; align-items:center; gap:10px;
          font-size:8.5px; font-weight:600; letter-spacing:.28em; text-transform:uppercase;
          color:var(--gold); padding:9px 18px;
          border:1px solid rgba(212,168,67,.35);
          background:rgba(212,168,67,.05);
          backdrop-filter:blur(4px);
          transition:background .3s, border-color .3s, gap .25s;
        }
        .cs-solo:hover .cs-solo-cta { background:rgba(212,168,67,.11); border-color:rgba(212,168,67,.65); gap:14px; }

        @media (max-width:960px) {
          .cs-panel { grid-template-columns:170px 1fr; }
          .cs-grid   { grid-template-columns:repeat(2,1fr); }
        }
        @media (max-width:660px) {
          .cs-panel  { grid-template-columns:1fr; }
          .cs-sb {
            border-right:none; border-bottom:1px solid var(--border);
            display:flex; overflow-x:auto; padding:10px; gap:6px; scrollbar-width:none;
          }
          .cs-sb::-webkit-scrollbar { display:none; }
          .cs-sb-lbl { display:none; }
          .cs-sbbtn  {
            flex-direction:column; align-items:center; gap:4px;
            padding:8px 11px; border-left:none; border-bottom:2px solid transparent;
            white-space:nowrap; flex-shrink:0;
          }
          .cs-sbbtn.on { border-bottom-color:var(--gold); }
          .cs-sb-cnt { display:none; }
          .cs-wrap   { padding:0 16px; }
          .cs-hd     { padding:0 16px; flex-wrap:wrap; gap:12px; }
          .cs-grid   { grid-template-columns:repeat(2,1fr); gap:10px; }
          .cs-ct     { padding:16px 13px 18px; }
        }
      `}</style>

      <section className="cs" id="categories" ref={sectionRef}>

        {/* ── Header + Toggle ── */}
        <div className={`cs-hd ${visible ? 'in' : ''}`}>
          <div className="cs-hd-left">
            <span className="cs-eyebrow">Discover</span>
            <h2 className="cs-title">Shop by <em>Category</em></h2>
          </div>
          <div className="cs-toggle">
            <div className={`cs-pill${tab === 'men' ? ' right' : ''}`} />
            <button className={`cs-tbtn${tab === 'women' ? ' on' : ''}`} onClick={() => { setTab('women'); setActiveIdx(0); }}>Women</button>
            <button className={`cs-tbtn${tab === 'men' ? ' on' : ''}`}   onClick={() => { setTab('men');   setActiveIdx(0); }}>Men</button>
          </div>
        </div>

        {/* ── Panel ── */}
        <div className={`cs-wrap ${visible ? 'in' : ''}`}>
          <div className="cs-panel">

            {/* Sidebar */}
            <nav className="cs-sb">
              <span className="cs-sb-lbl">Categories</span>
              {categories.map((cat, i) => (
                <button
                  key={cat.name}
                  className={`cs-sbbtn${activeIdx === i ? ' on' : ''}`}
                  onClick={() => setActiveIdx(i)}
                >
                  <span className="cs-sb-glyph">{cat.icon}</span>
                  <span className="cs-sb-txt">{cat.name}</span>
                  <span className="cs-sb-cnt">{cat.sub.length > 0 ? `${cat.sub.length}` : '→'}</span>
                </button>
              ))}
            </nav>

            {/* Content */}
            <div className="cs-ct">
              <div className="cs-ct-hd">
                <h3 className="cs-ct-title">
                  {active.name.includes(' ')
                    ? <>{active.name.split(' ')[0]} <em>{active.name.split(' ').slice(1).join(' ')}</em></>
                    : <em>{active.name}</em>}
                </h3>
                <Link href={active.href} className="cs-va">
                  View all
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </Link>
              </div>

              {/* Sub-grid */}
              {active.sub.length > 0 && (
                <div className="cs-grid">
                  {active.sub.map((sub, i) => (
                    <ShineCard key={sub.name} sub={sub} index={i} />
                  ))}
                </div>
              )}

              {/* Solo */}
              {active.sub.length === 0 && (
                <Link href={active.href} className="cs-solo">
                  <img src={active.img} alt={active.name} className="cs-solo-img" />
                  <div className="cs-solo-ov" />
                  <div className="cs-solo-inset" />
                  <div className="cs-solo-body">
                    <div className="cs-solo-ey">Collection</div>
                    <span className="cs-solo-ttl">{active.name}</span>
                    <span className="cs-solo-cta">
                      Explore the edit
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </span>
                  </div>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}