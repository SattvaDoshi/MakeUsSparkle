'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

// ─── Unsplash images — jewellery / editorial ────────────────────────────────
const SUBCATEGORY_DATA = {
  necklace: {
    label: 'Necklaces',
    eyebrow: 'Women · Jewellery',
    heading: 'Necklace',
    tagline: 'Edit',
    desc: 'Delicate chains and statement pieces crafted for every mood and every moment — from barely-there whispers to bold declarations.',
    backHref: '/categories/women/jewellery',
    items: [
      {
        name: 'Dainty',
        sub: 'Fine, barely-there chains',
        tag: 'New',
        img: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=900&q=90',
        href: '/categories/women/jewellery/necklace/dainty',
        wide: false,
      },
      {
        name: 'Layered',
        sub: 'Stack-ready multi-layer sets',
        tag: 'Trending',
        img: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=900&q=90',
        href: '/categories/women/jewellery/necklace/layered',
        wide: false,
      },
      {
        name: 'Pendants',
        sub: 'Statement centrepieces',
        tag: 'Bestseller',
        img: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=900&q=90',
        href: '/categories/women/jewellery/necklace/pendants',
        wide: false,
      },
      {
        name: 'Charms',
        sub: 'Personalised charm chains',
        tag: 'Popular',
        img: 'https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=900&q=90',
        href: '/categories/women/jewellery/necklace/charms',
        wide: false,
      },
      {
        name: 'Everyday',
        sub: 'Effortless all-day wear',
        tag: 'Essential',
        img: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=1400&q=90',
        href: '/categories/women/jewellery/necklace/everyday',
        wide: true,
      },
    ],
  },

  earrings: {
    label: 'Earrings',
    eyebrow: 'Women · Jewellery',
    heading: 'Earring',
    tagline: 'Edit',
    desc: 'From whisper-soft studs to sculptural hoops — find your signature pair.',
    backHref: '/categories/women/jewellery',
    items: [
      {
        name: 'Korean',
        sub: 'Minimal K-jewellery edits',
        tag: 'New',
        img: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=900&q=90',
        href: '/categories/women/jewellery/earrings/korean',
        wide: false,
      },
      {
        name: '18k Gold Plated',
        sub: 'Luxe gold that lasts',
        tag: 'Bestseller',
        img: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=900&q=90',
        href: '/categories/women/jewellery/earrings/18k-gold-plated',
        wide: false,
      },
      {
        name: 'Hoops',
        sub: 'Classic to bold hoop styles',
        tag: 'Trending',
        img: 'https://images.unsplash.com/photo-1588444650733-d0f07d323dde?w=900&q=90',
        href: '/categories/women/jewellery/earrings/hoops',
        wide: false,
      },
      {
        name: 'Pearls',
        sub: 'Timeless pearl elegance',
        tag: 'Curated',
        img: 'https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=900&q=90',
        href: '/categories/women/jewellery/earrings/pearls',
        wide: true,
      },
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
      {
        name: 'Chain',
        sub: 'Sleek gold & silver chains',
        tag: 'Bestseller',
        img: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=900&q=90',
        href: '/categories/women/jewellery/bracelets/chain',
        wide: false,
      },
      {
        name: 'Kada',
        sub: 'Structured bangle kadaas',
        tag: 'Essential',
        img: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=900&q=90',
        href: '/categories/women/jewellery/bracelets/kada',
        wide: false,
      },
      {
        name: 'Charms',
        sub: 'Personalised charm links',
        tag: 'Popular',
        img: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=900&q=90',
        href: '/categories/women/jewellery/bracelets/charms',
        wide: false,
      },
      {
        name: 'Beaded',
        sub: 'Boho & natural bead wraps',
        tag: 'New',
        img: 'https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=900&q=90',
        href: '/categories/women/jewellery/bracelets/beaded',
        wide: false,
      },
      {
        name: 'Stacks',
        sub: 'Curated layering sets',
        tag: 'Trending',
        img: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=1400&q=90',
        href: '/categories/women/jewellery/bracelets/stacks',
        wide: true,
      },
    ],
  },
};

const MARQUEE_WORDS = [
  'Dainty Chains', 'Layered Sets', 'Statement Pendants', 'Charm Necklaces',
  'Everyday Essentials', 'Gold Plated', 'Sterling Silver', 'Fine Jewellery',
  'Handcrafted', 'Sustainably Sourced', 'Gift Worthy', 'Limited Editions',
];

// ─── Marquee ─────────────────────────────────────────────────────────────────
function Marquee() {
  const words = [...MARQUEE_WORDS, ...MARQUEE_WORDS]; // duplicate for seamless loop
  return (
    <div className="marquee-wrap">
      <div className="marquee-track">
        {words.map((w, i) => (
          <span key={i} className="marquee-item">
            {w} <span className="marquee-gem">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Single Card ──────────────────────────────────────────────────────────────
function ItemCard({ item, index }) {
  const shimmerRef = useRef(null);

  const onMove = useCallback((e) => {
    if (!shimmerRef.current) return;
    const r = e.currentTarget.getBoundingClientRect();
    shimmerRef.current.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
    shimmerRef.current.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
  }, []);

  return (
    <Link
      href={item.href}
      className={`card${item.wide ? ' card--wide' : ''}`}
      onMouseMove={onMove}
      style={{ animationDelay: `${0.05 + index * 0.09}s` }}
    >
      <div className="card__img-wrap">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.img} alt={item.name} loading="lazy" />
        <div className="card__overlay" />
        <div className="card__shimmer" ref={shimmerRef} />

        {/* Diagonal corner accent */}
        <div className="card__corner" />

        <span className="card__num">0{index + 1}</span>
        <span className="card__tag">{item.tag}</span>

        <div className="card__body">
          <div className="card__body-text">
            <p className="card__name">{item.name}</p>
            <p className="card__sub">{item.sub}</p>
          </div>
          <span className="card__arrow">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </span>
        </div>

        <div className="card__rule" />
      </div>
    </Link>
  );
}

// ─── Filter Pills ─────────────────────────────────────────────────────────────
function FilterPills({ active, onChange }) {
  const pills = ['All', 'New', 'Trending', 'Bestseller', 'Essential', 'Popular'];
  return (
    <div className="filters">
      <span className="filters__label">Filter</span>
      {pills.map(p => (
        <button
          key={p}
          className={`fpill${active === p ? ' fpill--active' : ''}`}
          onClick={() => onChange(p)}
        >
          {p}
        </button>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SubcategoryPage({ type = 'necklace' }) {
  const data = SUBCATEGORY_DATA[type] ?? SUBCATEGORY_DATA.necklace;
  const [filter, setFilter] = useState('All');
  const [visible, setVisible] = useState(false);
  const pageRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  const visibleItems = data.items.filter(
    item => filter === 'All' || item.tag === filter
  );

  return (
    <>
      {/* ── Global Styles ─────────────────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=Tenor+Sans&family=Jost:wght@200;300;400;500;600&display=swap');

        /* ── Tokens ── */
        :root {
          --olive-900: #1a1f0d;
          --olive-800: #252d12;
          --olive-700: #333d1a;
          --olive-600: #4a5522;
          --olive-500: #5e6e2a;
          --olive-400: #7a8e3c;
          --olive-300: #9cac5e;
          --olive-200: #c4cc9a;
          --olive-100: #e4e8cc;
          --olive-50:  #f2f4e8;

          --gold-900: #3d2a06;
          --gold-800: #6b4a0e;
          --gold-700: #8c6b20;
          --gold:     #c9a84c;
          --gold-lt:  #e8d49a;
          --gold-glow: rgba(201,168,76,.14);
          --gold-border: rgba(201,168,76,.22);
          --gold-border2: rgba(201,168,76,.45);

          --ink:    #1a1f0d;
          --mist:   rgba(26,31,13,.45);
          --fog:    rgba(26,31,13,.25);
        }

        /* ── Reset ── */
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* ── Page ── */
        .scp {
          min-height: 100vh;
          background: var(--olive-900);
          background-image:
            radial-gradient(ellipse 120% 40% at 50% -2%, rgba(201,168,76,.08) 0%, transparent 60%),
            radial-gradient(ellipse 40% 60% at 100% 100%, rgba(90,110,35,.25) 0%, transparent 55%),
            radial-gradient(ellipse 30% 40% at 0% 60%, rgba(201,168,76,.04) 0%, transparent 50%);
          font-family: 'Jost', sans-serif;
          color: var(--olive-100);
          position: relative;
          overflow-x: hidden;
        }

        /* Noise grain */
        .scp::before {
          content: '';
          position: fixed; inset: 0;
          pointer-events: none; z-index: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='512' height='512' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
          opacity: .028; mix-blend-mode: overlay;
        }

        .scp > * { position: relative; z-index: 1; }

        /* ── Topbar ── */
        .topbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 52px;
          border-bottom: 1px solid var(--gold-border);
        }
        .topbar__crumb {
          display: flex; align-items: center; gap: 7px;
          font-size: 9.5px; letter-spacing: .32em; text-transform: uppercase;
          color: var(--olive-300);
        }
        .topbar__crumb a { color: var(--olive-300); text-decoration: none; transition: color .2s; }
        .topbar__crumb a:hover { color: var(--gold); }
        .topbar__sep { opacity: .35; }
        .topbar__current { color: var(--olive-100); opacity: .55; }

        .topbar__back {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 9px; letter-spacing: .3em; text-transform: uppercase;
          color: var(--gold); text-decoration: none; font-weight: 500;
          opacity: .75; transition: opacity .2s, gap .25s;
        }
        .topbar__back:hover { opacity: 1; gap: 14px; }

        /* ── Hero ── */
        .hero {
          display: grid;
          grid-template-columns: 1fr auto;
          align-items: end;
          padding: 58px 52px 44px;
          gap: 32px;
          position: relative;
          opacity: 0; transform: translateY(20px);
          transition: opacity .7s ease, transform .7s ease;
        }
        .hero.vis { opacity: 1; transform: none; }
        .hero::after {
          content: '';
          position: absolute; bottom: 0; left: 52px; right: 52px; height: 1px;
          background: linear-gradient(90deg, transparent, var(--gold-border2), transparent);
        }

        .hero__eyebrow {
          display: flex; align-items: center; gap: 14px;
          font-size: 9px; letter-spacing: .52em; text-transform: uppercase;
          color: var(--gold); margin-bottom: 20px; font-weight: 500;
        }
        .hero__eyebrow-rule {
          width: 40px; height: 1px;
          background: linear-gradient(90deg, var(--gold), transparent);
        }

        .hero__h1 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(3rem, 6.5vw, 5.8rem);
          font-weight: 300; line-height: 1; letter-spacing: -.02em;
          color: var(--olive-50);
        }
        .hero__h1 em { font-style: italic; color: var(--gold); font-weight: 300; }

        .hero__desc {
          margin-top: 18px;
          font-size: 12.5px; font-weight: 300;
          color: var(--olive-200); opacity: .7;
          max-width: 400px; line-height: 1.9; letter-spacing: .04em;
        }

        .hero__right { text-align: right; flex-shrink: 0; }
        .hero__count {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(5rem, 11vw, 9.5rem);
          font-weight: 300; font-style: italic;
          color: rgba(201,168,76,.09);
          line-height: 1; letter-spacing: -.04em; user-select: none;
        }
        .hero__count-label {
          font-size: 8px; letter-spacing: .5em; text-transform: uppercase;
          color: rgba(201,168,76,.3); margin-top: 4px;
        }

        /* ── Marquee ── */
        .marquee-wrap {
          overflow: hidden;
          padding: 18px 0;
          border-top: 1px solid rgba(201,168,76,.1);
          border-bottom: 1px solid rgba(201,168,76,.1);
        }
        .marquee-track {
          display: flex; width: max-content;
          animation: marquee 30s linear infinite;
        }
        .marquee-track:hover { animation-play-state: paused; }
        .marquee-item {
          font-family: 'Cormorant Garamond', serif;
          font-size: 12px; font-style: italic; font-weight: 300;
          color: rgba(201,168,76,.32); letter-spacing: .18em;
          padding: 0 30px; white-space: nowrap;
        }
        .marquee-gem { color: rgba(201,168,76,.5); padding: 0 4px; }
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }

        /* ── Filters ── */
        .filters {
          display: flex; flex-wrap: wrap; align-items: center; gap: 9px;
          padding: 28px 52px 0;
          opacity: 0; transform: translateY(14px);
          transition: opacity .65s ease .18s, transform .65s ease .18s;
        }
        .filters.vis { opacity: 1; transform: none; }
        .filters__label {
          font-size: 8.5px; letter-spacing: .44em; text-transform: uppercase;
          color: var(--olive-300); margin-right: 6px;
        }
        .fpill {
          font-size: 8.5px; letter-spacing: .22em; text-transform: uppercase;
          color: var(--olive-300); padding: 6px 16px;
          border: 1px solid rgba(201,168,76,.15);
          background: transparent; cursor: pointer;
          font-family: 'Jost', sans-serif; font-weight: 400;
          transition: all .22s;
        }
        .fpill:hover { color: var(--gold); border-color: var(--gold-border2); background: var(--gold-glow); }
        .fpill--active { color: var(--olive-900) !important; background: var(--gold) !important; border-color: var(--gold) !important; }

        /* ── Grid ── */
        .grid-wrap {
          padding: 28px 52px 64px;
          opacity: 0; transform: translateY(18px);
          transition: opacity .7s ease .28s, transform .7s ease .28s;
        }
        .grid-wrap.vis { opacity: 1; transform: none; }

        .grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          background: rgba(201,168,76,.1);
        }

        /* ── Card ── */
        .card {
          display: block; text-decoration: none;
          position: relative; overflow: hidden;
          background: var(--olive-800);
          animation: cardIn .6s ease both;
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .card--wide { grid-column: span 2; }

        .card__img-wrap {
          position: relative;
          aspect-ratio: 3 / 4;
          overflow: hidden;
        }
        .card--wide .card__img-wrap { aspect-ratio: 16 / 9; }

        .card__img-wrap img {
          width: 100%; height: 100%; object-fit: cover; display: block;
          filter: brightness(.6) saturate(.65) sepia(.12);
          transition: transform .95s cubic-bezier(.25,.46,.45,.94), filter .5s;
        }
        .card:hover .card__img-wrap img {
          transform: scale(1.08);
          filter: brightness(.82) saturate(.9) sepia(.05);
        }

        /* Gradient overlay */
        .card__overlay {
          position: absolute; inset: 0;
          background:
            linear-gradient(to top, rgba(26,31,13,.95) 0%, rgba(26,31,13,.22) 48%, transparent 70%),
            linear-gradient(135deg, rgba(90,110,35,.18) 0%, transparent 55%);
        }

        /* Shimmer */
        .card__shimmer {
          position: absolute; inset: 0; pointer-events: none;
          background: radial-gradient(
            circle at var(--mx, 50%) var(--my, 50%),
            rgba(201,168,76,.16) 0%,
            transparent 58%
          );
          opacity: 0; transition: opacity .35s;
        }
        .card:hover .card__shimmer { opacity: 1; }

        /* Corner accent */
        .card__corner {
          position: absolute; top: 0; right: 0;
          width: 0; height: 0;
          border-style: solid;
          border-width: 0 48px 48px 0;
          border-color: transparent rgba(201,168,76,.12) transparent transparent;
          transition: border-width .3s ease;
        }
        .card:hover .card__corner { border-width: 0 58px 58px 0; border-color: transparent rgba(201,168,76,.22) transparent transparent; }

        /* Number */
        .card__num {
          position: absolute; top: 16px; left: 18px;
          font-family: 'Cormorant Garamond', serif;
          font-size: 11px; font-style: italic; font-weight: 300;
          color: rgba(201,168,76,.45);
          opacity: 0; transform: translateY(-4px);
          transition: opacity .3s, transform .3s;
        }
        .card:hover .card__num { opacity: 1; transform: none; }

        /* Tag pill */
        .card__tag {
          position: absolute; top: 14px; right: 14px;
          font-family: 'Jost', sans-serif;
          font-size: 7px; letter-spacing: .3em; text-transform: uppercase;
          color: var(--olive-900); background: var(--gold);
          padding: 4px 10px 3px; font-weight: 600;
        }

        /* Body */
        .card__body {
          position: absolute; bottom: 0; left: 0; right: 0;
          padding: 16px 18px 18px;
          display: flex; align-items: flex-end; justify-content: space-between;
        }
        .card__body-text { flex: 1; }

        .card__name {
          font-family: 'Tenor Sans', sans-serif;
          font-size: 12px; letter-spacing: .22em; text-transform: uppercase;
          color: var(--olive-50); line-height: 1.2;
        }
        .card__sub {
          font-size: 9.5px; font-weight: 300; letter-spacing: .1em;
          color: rgba(228,232,204,.45); margin-top: 4px;
          opacity: 0; transform: translateY(6px);
          transition: opacity .3s ease .05s, transform .3s ease .05s;
        }
        .card:hover .card__sub { opacity: 1; transform: none; }

        /* Arrow */
        .card__arrow {
          display: flex; align-items: center; justify-content: center;
          width: 30px; height: 30px;
          border: 1px solid rgba(201,168,76,.3);
          color: var(--gold); flex-shrink: 0;
          opacity: 0; transform: translate(8px, -8px);
          transition: opacity .3s ease .08s, transform .3s ease .08s;
        }
        .card:hover .card__arrow { opacity: 1; transform: none; }

        /* Gold sweep line */
        .card__rule {
          position: absolute; bottom: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, var(--gold-700), var(--gold), var(--gold-lt));
          transform: scaleX(0); transform-origin: left;
          transition: transform .5s cubic-bezier(.25,.46,.45,.94);
        }
        .card:hover .card__rule { transform: scaleX(1); }

        /* ── Footer bar ── */
        .footer-bar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 28px 52px;
          border-top: 1px solid rgba(201,168,76,.1);
        }
        .footer-logo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 20px; font-weight: 300; letter-spacing: .18em;
          color: rgba(201,168,76,.25);
        }
        .footer-gem {
          display: flex; align-items: center; gap: 10px;
          font-size: 8px; letter-spacing: .4em; text-transform: uppercase;
          color: rgba(201,168,76,.22);
        }
        .footer-gem::before, .footer-gem::after {
          content: ''; flex: 1; min-width: 40px; height: 1px;
          background: rgba(201,168,76,.15);
        }

        /* ── Responsive ── */
        @media (max-width: 900px) {
          .grid { grid-template-columns: repeat(2, 1fr); }
          .card--wide { grid-column: span 2; }
          .topbar, .hero, .filters, .grid-wrap, .footer-bar { padding-left: 24px; padding-right: 24px; }
          .hero::after { left: 24px; right: 24px; }
        }
        @media (max-width: 540px) {
          .grid { grid-template-columns: 1fr; }
          .card--wide { grid-column: span 1; }
          .card--wide .card__img-wrap { aspect-ratio: 3/4; }
          .hero { grid-template-columns: 1fr; }
          .hero__right { display: none; }
          .topbar, .hero, .filters, .grid-wrap, .footer-bar { padding-left: 16px; padding-right: 16px; }
          .hero::after { left: 16px; right: 16px; }
          .hero__h1 { font-size: 2.6rem; }
        }
      `}</style>

      <div className="scp" ref={pageRef}>

        {/* ── Topbar ── */}
        <nav className="topbar">
          <div className="topbar__crumb">
            <Link href="/">Home</Link>
            <span className="topbar__sep"> · </span>
            <Link href="/categories/women">Women</Link>
            <span className="topbar__sep"> · </span>
            <Link href={data.backHref}>Jewellery</Link>
            <span className="topbar__sep"> · </span>
            <span className="topbar__current">{data.label}</span>
          </div>
          <Link href={data.backHref} className="topbar__back">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Jewellery
          </Link>
        </nav>

        {/* ── Hero ── */}
        <header className={`hero${visible ? ' vis' : ''}`}>
          <div>
            <div className="hero__eyebrow">
              <span className="hero__eyebrow-rule" />
              {data.eyebrow}
            </div>
            <h1 className="hero__h1">
              The&nbsp;<em>{data.heading}</em>
              <br />
              {data.tagline}
            </h1>
            <p className="hero__desc">{data.desc}</p>
          </div>
          <div className="hero__right">
            <div className="hero__count">
              {String(data.items.length).padStart(2, '0')}
            </div>
            <div className="hero__count-label">Curated Styles</div>
          </div>
        </header>

        {/* ── Marquee ── */}
        <Marquee />

        {/* ── Filters ── */}
        <FilterPills
          active={filter}
          onChange={setFilter}
          className={visible ? 'vis' : ''}
        />

        {/* ── Grid ── */}
        <div className={`grid-wrap${visible ? ' vis' : ''}`}>
          <div className="grid">
            {visibleItems.map((item, i) => (
              <ItemCard key={item.name} item={item} index={i} />
            ))}
          </div>
        </div>

        {/* ── Footer ── */}
        <footer className="footer-bar">
          <div className="footer-logo">Maison</div>
          <div className="footer-gem">Fine Jewellery · Est. 2019</div>
        </footer>

      </div>
    </>
  );
}

// ─── Wrapper that reads ?type= from URL (App Router) ─────────────────────────
// If you're on the pages router, use `router.query.type` instead.
// For the App Router add a separate page.jsx:
//
//   // app/categories/women/jewellery/[type]/page.jsx
//   import SubcategoryPage from '@/components/SubcategoryPage';
//   export default function Page({ params }) {
//     return <SubcategoryPage type={params.type} />;
//   }