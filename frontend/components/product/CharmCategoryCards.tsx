'use client';

import { useState, useEffect, useRef, type CSSProperties, type MouseEvent } from 'react';
import Link from 'next/link';
import UpperNav from '@/components/ui/UpperNav';
import { fetchCharmItems, type CharmItemData } from '@/lib/catalogApi';

/* ─── Types ─── */
interface CharmTypeCard {
  id: string;
  label: string;
  icon: string;
  count: number;
  priceRange: string;
  image: string;
}

const TAB_ICONS: Record<string, string> = {
  initials: '𝑨',
  symbols: '✦',
  birthstones: '💎',
  custom: '✎',
  designs: '◈',
  characters: '🎭',
};

const CATEGORY_META: Record<string, { title: string; titleEm: string; desc: string }> = {
  'custom-charm-jewellery': {
    title: 'Explore',
    titleEm: 'Charm Jewellery',
    desc: 'Choose a charm category to start designing your one-of-a-kind piece.',
  },
  keychains: {
    title: 'Explore',
    titleEm: 'Custom Keychains',
    desc: 'Browse different charm types and build your perfect keychain.',
  },
};

/* ─── Shine Card ─── */
function TypeCard({ card, index, href }: { card: CharmTypeCard; index: number; href: string }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [shine, setShine] = useState({ x: 50, y: 50, on: false });

  const move = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setShine({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100, on: true });
  };

  return (
    <Link
      ref={ref}
      href={href}
      className="ctc-card"
      onMouseMove={move}
      onMouseLeave={() => setShine(s => ({ ...s, on: false }))}
      style={{ '--sx': `${shine.x}%`, '--sy': `${shine.y}%`, animationDelay: `${index * 0.08}s` } as CSSProperties & Record<string, string>}
    >
      <div className="ctc-img">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={card.image} alt={card.label} loading="lazy" />
        <div className="ctc-grad" />
        <div className={`ctc-shine${shine.on ? ' on' : ''}`} />
      </div>

      {/* Icon badge */}
      <div className="ctc-icon-badge">{card.icon}</div>

      {/* Info overlay */}
      <div className="ctc-overlay">
        <span className="ctc-label">{card.label}</span>
        <span className="ctc-meta">{card.count} pieces · {card.priceRange}</span>
        <span className="ctc-cta">
          Customise
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </span>
      </div>

      <div className="ctc-bar" />
    </Link>
  );
}

/* ─── Main Component ─── */
export default function CharmCategoryCards({ parentCategory }: { parentCategory: string }) {
  const [cards, setCards] = useState<CharmTypeCard[]>([]);
  const [loading, setLoading] = useState(true);
  const meta = CATEGORY_META[parentCategory] || CATEGORY_META['custom-charm-jewellery'];

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchCharmItems(parentCategory)
      .then((items) => {
        if (!mounted) return;
        // Group by charmCategory
        const map = new Map<string, CharmItemData[]>();
        for (const item of items) {
          if (!map.has(item.charmCategory)) map.set(item.charmCategory, []);
          map.get(item.charmCategory)!.push(item);
        }

        const grouped: CharmTypeCard[] = Array.from(map.entries()).map(([key, charms]) => {
          const prices = charms.map(c => c.price);
          const min = Math.min(...prices);
          const max = Math.max(...prices);
          return {
            id: key,
            label: key.charAt(0).toUpperCase() + key.slice(1),
            icon: TAB_ICONS[key] || '◈',
            count: charms.length,
            priceRange: min === max ? `₹${min}` : `₹${min} – ₹${max}`,
            image: charms[0]?.image || '/images/hero.png',
          };
        });

        setCards(grouped);
        setLoading(false);
      })
      .catch(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, [parentCategory]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Nunito:wght@300;400;500;600;700&display=swap');

        :root {
          --ctc-cream:  #faf8f3;
          --ctc-white:  #ffffff;
          --ctc-gd:     #253d18;
          --ctc-gs:     #527a3e;
          --ctc-gp:     #ddecd1;
          --ctc-gt:     #eff6ea;
          --ctc-gold:   #a07820;
          --ctc-gold-l: #c8992e;
          --ctc-t1:     #1c1c17;
          --ctc-t2:     #484840;
          --ctc-t3:     #828278;
          --ctc-t4:     #b4b4a4;
          --ctc-bs:     rgba(60,90,35,0.09);
          --ctc-bm:     rgba(60,90,35,0.18);
        }

        *, *::before, *::after { box-sizing: border-box; }

        .ctc-root {
          min-height: 100vh;
          background: var(--ctc-cream);
          font-family: 'Nunito', sans-serif;
          color: var(--ctc-t1);
        }

        /* ── Hero ── */
        .ctc-hero {
          padding: 60px 48px 36px;
          position: relative;
          overflow: hidden;
          animation: ctcFadeUp .55s ease both;
        }
        .ctc-hero::after {
          content: '◈';
          position: absolute; right: 56px; top: 50%;
          transform: translateY(-50%);
          font-size: 120px; color: rgba(160,120,32,.06);
          pointer-events: none; line-height: 1; font-family: serif;
        }
        @keyframes ctcFadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ctc-eyebrow {
          display: flex; align-items: center; gap: 10px;
          font-size: 9px; font-weight: 700; letter-spacing: .46em; text-transform: uppercase;
          color: var(--ctc-gs); margin-bottom: 10px;
        }
        .ctc-eyebrow::before {
          content: ''; width: 22px; height: 1.5px;
          background: var(--ctc-gs); border-radius: 2px; opacity: .65;
        }
        .ctc-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2rem, 4vw, 3.2rem);
          font-weight: 300; color: var(--ctc-gd);
          line-height: 1.1; letter-spacing: -.02em;
          margin-bottom: 10px;
        }
        .ctc-title em { font-style: italic; color: var(--ctc-gold); }
        .ctc-desc {
          font-size: 13px; font-weight: 400; color: var(--ctc-t3);
          max-width: 520px; line-height: 1.75; letter-spacing: .02em;
        }

        /* ── Grid ── */
        .ctc-grid-wrap {
          padding: 0 48px 80px;
          animation: ctcFadeUp .55s ease .12s both;
        }
        .ctc-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 16px;
        }

        /* ── Card ── */
        .ctc-card {
          display: block; text-decoration: none;
          position: relative; overflow: hidden;
          border-radius: 14px;
          border: 1px solid var(--ctc-bs);
          cursor: pointer;
          aspect-ratio: 3/4;
          animation: ctcCardIn .48s ease both;
          transition: border-color .28s, box-shadow .28s, transform .28s;
        }
        @keyframes ctcCardIn {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ctc-card:hover {
          border-color: var(--ctc-bm);
          box-shadow: 0 12px 36px rgba(35,60,18,.14);
          transform: translateY(-4px);
        }

        /* Image fills card */
        .ctc-img {
          position: absolute; inset: 0;
          overflow: hidden; background: #ede7d9;
        }
        .ctc-img img {
          width: 100%; height: 100%; object-fit: cover; display: block;
          transition: transform .68s cubic-bezier(.25,.46,.45,.94);
        }
        .ctc-card:hover .ctc-img img { transform: scale(1.08); }

        .ctc-grad {
          position: absolute; inset: 0;
          background: linear-gradient(
            to top,
            rgba(15,28,8,.82) 0%,
            rgba(15,28,8,.32) 40%,
            rgba(15,28,8,.06) 65%,
            transparent 85%
          );
        }
        .ctc-shine {
          position: absolute; inset: 0; pointer-events: none;
          background: radial-gradient(circle at var(--sx,50%) var(--sy,50%), rgba(255,255,255,.14) 0%, transparent 54%);
          opacity: 0; transition: opacity .28s;
        }
        .ctc-shine.on { opacity: 1; }

        /* Icon badge */
        .ctc-icon-badge {
          position: absolute; top: 14px; left: 14px;
          width: 40px; height: 40px; border-radius: 10px;
          background: rgba(255,255,255,.92);
          backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; color: var(--ctc-gd);
          border: 1px solid rgba(255,255,255,.4);
          box-shadow: 0 2px 10px rgba(0,0,0,.1);
          z-index: 3;
          transition: transform .22s, box-shadow .22s;
        }
        .ctc-card:hover .ctc-icon-badge {
          transform: scale(1.08);
          box-shadow: 0 4px 16px rgba(0,0,0,.15);
        }

        /* Overlay */
        .ctc-overlay {
          position: absolute; bottom: 0; left: 0; right: 0;
          padding: 18px;
          display: flex; flex-direction: column; gap: 4px;
          z-index: 2;
        }
        .ctc-label {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(1rem, 1.6vw, 1.3rem);
          font-weight: 600; font-style: italic;
          color: #fff; letter-spacing: .03em;
          text-shadow: 0 1px 8px rgba(0,0,0,.5);
        }
        .ctc-meta {
          font-size: 11px; font-weight: 500;
          color: rgba(255,255,255,.7);
          letter-spacing: .04em;
        }
        .ctc-cta {
          display: inline-flex; align-items: center; gap: 5px;
          margin-top: 8px;
          font-size: 10px; font-weight: 700;
          letter-spacing: .18em; text-transform: uppercase;
          color: var(--ctc-gold-l);
          opacity: 0; transform: translateY(6px);
          transition: opacity .22s, transform .22s;
        }
        .ctc-card:hover .ctc-cta { opacity: 1; transform: translateY(0); }

        .ctc-bar {
          position: absolute; bottom: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, var(--ctc-gold-l), var(--ctc-gs));
          transform: scaleX(0); transform-origin: left;
          transition: transform .36s cubic-bezier(.25,.46,.45,.94);
          z-index: 3;
        }
        .ctc-card:hover .ctc-bar { transform: scaleX(1); }

        /* ── Loading skeletons ── */
        .ctc-skeleton {
          border-radius: 14px;
          aspect-ratio: 3/4;
          background: linear-gradient(110deg, #ede7d9 30%, #f5f0e8 50%, #ede7d9 70%);
          background-size: 200% 100%;
          animation: ctcShimmer 1.5s ease-in-out infinite;
        }
        @keyframes ctcShimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* ── Bottom CTA ── */
        .ctc-bottom-cta {
          display: flex; align-items: center; justify-content: center;
          gap: 8px; margin-top: 24px;
          padding: 16px 32px;
          background: var(--ctc-gd); color: var(--ctc-cream);
          border: none; border-radius: 50px;
          font-family: 'Nunito', sans-serif;
          font-size: 11px; font-weight: 700;
          letter-spacing: .22em; text-transform: uppercase;
          text-decoration: none; cursor: pointer;
          box-shadow: 0 4px 20px rgba(37,61,24,.22);
          transition: background .22s, transform .14s, box-shadow .22s;
        }
        .ctc-bottom-cta:hover {
          background: var(--ctc-gs);
          transform: translateY(-2px);
          box-shadow: 0 6px 28px rgba(37,61,24,.28);
        }

        /* ── Responsive ── */
        @media (max-width: 1024px) {
          .ctc-hero, .ctc-grid-wrap { padding-left: 28px; padding-right: 28px; }
          .ctc-grid { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 14px; }
        }
        @media (max-width: 680px) {
          .ctc-hero, .ctc-grid-wrap { padding-left: 16px; padding-right: 16px; }
          .ctc-hero { padding-top: 50px; padding-bottom: 24px; }
          .ctc-hero::after { display: none; }
          .ctc-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .ctc-icon-badge { width: 34px; height: 34px; font-size: 14px; border-radius: 8px; }
          .ctc-overlay { padding: 14px; }
        }
        @media (max-width: 380px) {
          .ctc-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; }
        }
      `}</style>

      <div className="ctc-root">
        <UpperNav />

        {/* Hero */}
        <div className="ctc-hero">
          <span className="ctc-eyebrow">Customise</span>
          <h1 className="ctc-title">{meta.title} <em>{meta.titleEm}</em></h1>
          <p className="ctc-desc">{meta.desc}</p>
        </div>

        {/* Card Grid */}
        <div className="ctc-grid-wrap">
          <div className="ctc-grid">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="ctc-skeleton" />
              ))
            ) : (
              cards.map((card, i) => (
                <TypeCard
                  key={card.id}
                  card={card}
                  index={i}
                  href={`/custom-charm/${parentCategory}?type=${card.id}`}
                />
              ))
            )}
          </div>

          {/* Bottom CTA to go directly to full builder */}
          {!loading && cards.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Link href={`/custom-charm/${parentCategory}`} className="ctc-bottom-cta">
                Or start building from scratch
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
