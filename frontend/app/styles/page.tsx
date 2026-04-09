'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { STYLE_THEMES } from '@/lib/styleThemes';
import { ALL_PRODUCTS, STYLE_PRODUCT_FILTER } from '@/lib/products';

const styles = Object.values(STYLE_THEMES);

function countProducts(styleId) {
  const fn = STYLE_PRODUCT_FILTER[styleId] || (() => true);
  return ALL_PRODUCTS.filter(fn).length;
}

export default function ShopByStylePage() {
  const [visible, setVisible] = useState(false);
  const [hoveredId, setHoveredId] = useState(null);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.05 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Jost:wght@200;300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .sbs-root {
          min-height: 100vh;
          background: #141a0f;
          padding: 0;
          font-family: 'Jost', sans-serif;
          color: #fdf6e9;
        }

        /* ── NAV ── */
        .sbs-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 52px;
          border-bottom: 1px solid rgba(201,169,110,0.12);
          background: rgba(20,26,15,0.9);
          backdrop-filter: blur(12px);
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .sbs-logo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px;
          font-weight: 300;
          letter-spacing: .14em;
          color: #c9a96e;
          text-decoration: none;
        }
        .sbs-logo em { font-style: italic; color: #d4af37; }
        .sbs-nav-links { display: flex; gap: 28px; }
        .sbs-nav-links a {
          font-size: 10px;
          letter-spacing: .28em;
          text-transform: uppercase;
          color: rgba(253,246,233,0.4);
          text-decoration: none;
          font-weight: 400;
          transition: color .2s;
        }
        .sbs-nav-links a:hover, .sbs-nav-links a.active { color: #c9a96e; }

        /* ── HERO ── */
        .sbs-hero {
          padding: 72px 52px 56px;
          text-align: center;
          position: relative;
          overflow: hidden;
          border-bottom: 1px solid rgba(201,169,110,0.1);
        }
        .sbs-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 70% 60% at 50% 0%, rgba(78,96,53,0.15) 0%, transparent 65%);
          pointer-events: none;
        }
        .sbs-eyebrow {
          font-size: 9.5px;
          font-weight: 300;
          letter-spacing: 6px;
          text-transform: uppercase;
          color: #c9a96e;
          margin-bottom: 14px;
          opacity: ${0};
          transition: all .7s ease;
          position: relative;
          z-index: 2;
        }
        .sbs-eyebrow.on { opacity: 1; }
        .sbs-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2.8rem, 5.5vw, 5.2rem);
          font-weight: 300;
          line-height: 1.05;
          color: #fdf6e9;
          margin-bottom: 16px;
          transition: all .85s ease .12s;
          position: relative;
          z-index: 2;
        }
        .sbs-title em { font-style: italic; color: #d4af37; }
        .sbs-subtitle {
          font-size: 12px;
          font-weight: 300;
          color: rgba(253,246,233,0.4);
          letter-spacing: .1em;
          max-width: 420px;
          margin: 0 auto;
          line-height: 1.85;
          position: relative;
          z-index: 2;
        }
        .sbs-rule {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-top: 24px;
          position: relative;
          z-index: 2;
        }
        .sbs-rule-line {
          width: 55px; height: 1px;
          background: linear-gradient(90deg, transparent, #c9a96e);
        }
        .sbs-rule-line:last-child { background: linear-gradient(90deg, #c9a96e, transparent); }
        .sbs-rule-diamond {
          width: 5px; height: 5px;
          background: #d4af37;
          transform: rotate(45deg);
        }

        /* ── GRID ── */
        .sbs-grid-section {
          padding: 56px 44px 80px;
        }
        .sbs-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 22px;
          max-width: 1120px;
          margin: 0 auto;
        }

        /* ── STYLE CARD ── */
        .sbs-card-link {
          text-decoration: none;
          display: block;
          opacity: 0;
          transform: translateY(24px);
          transition:
            opacity .6s ease,
            transform .6s ease;
        }
        .sbs-card-link.on { opacity: 1; transform: translateY(0); }

        .sbs-card {
          aspect-ratio: 3 / 4;
          border-radius: 4px;
          position: relative;
          overflow: hidden;
          cursor: pointer;
          border: 1px solid rgba(201,169,110,0.14);
          transition:
            border-color .3s ease,
            box-shadow .35s ease,
            transform .4s cubic-bezier(.22,.68,0,1.2);
        }
        .sbs-card:hover {
          border-color: rgba(212,175,55,0.4);
          box-shadow: 0 24px 70px rgba(0,0,0,0.6), 0 0 50px rgba(201,169,110,0.08);
          transform: translateY(-6px) scale(1.015);
        }

        /* Card layers */
        .card-base { position: absolute; inset: 0; background: #1e2817; }
        .card-grad { position: absolute; inset: 0; }
        .card-watermark {
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -58%);
          font-size: 110px;
          opacity: .055;
          pointer-events: none;
          filter: blur(2px);
          transition: opacity .4s ease, transform .5s ease;
        }
        .sbs-card:hover .card-watermark { opacity: .11; transform: translate(-50%,-54%) scale(1.08); }

        .card-shimmer {
          position: absolute; inset: 0;
          background: linear-gradient(115deg, transparent 35%, rgba(212,175,55,0.06) 50%, transparent 65%);
          transform: translateX(-100%);
          z-index: 3;
        }
        .sbs-card:hover .card-shimmer {
          transform: translateX(100%);
          transition: transform .65s ease;
        }

        /* Corner brackets */
        .card-corner {
          position: absolute; width: 16px; height: 16px; z-index: 6;
          opacity: 0; transition: opacity .35s ease;
        }
        .sbs-card:hover .card-corner { opacity: 1; }
        .cc-tl { top:12px; left:12px; border-top:1px solid rgba(212,175,55,.7); border-left:1px solid rgba(212,175,55,.7); }
        .cc-tr { top:12px; right:12px; border-top:1px solid rgba(212,175,55,.7); border-right:1px solid rgba(212,175,55,.7); }
        .cc-bl { bottom:12px; left:12px; border-bottom:1px solid rgba(212,175,55,.7); border-left:1px solid rgba(212,175,55,.7); }
        .cc-br { bottom:12px; right:12px; border-bottom:1px solid rgba(212,175,55,.7); border-right:1px solid rgba(212,175,55,.7); }

        /* Badge */
        .card-badge {
          position: absolute; top:16px; right:16px; z-index:7;
          font-size:8px; font-weight:400; letter-spacing:2.5px; text-transform:uppercase;
          color:#141a0f; background:#c9a96e;
          padding:4px 9px 3px; border-radius:2px;
        }

        /* Product count pill */
        .card-count {
          position: absolute; top:16px; left:16px; z-index:7;
          font-size:8px; font-weight:400; letter-spacing:2px; text-transform:uppercase;
          color:rgba(253,246,233,0.7);
          border:1px solid rgba(201,169,110,0.3);
          padding:4px 10px 3px; border-radius:2px;
          background:rgba(0,0,0,0.3); backdrop-filter:blur(4px);
        }

        /* Content */
        .card-content {
          position: absolute; inset: 0; z-index: 5;
          display: flex; flex-direction: column; justify-content: flex-end;
          padding: 28px;
          background: linear-gradient(to top, rgba(8,12,5,0.95) 0%, rgba(8,12,5,0.55) 45%, transparent 100%);
        }
        .card-emoji {
          font-size: 28px; display: block; margin-bottom: 10px;
          filter: drop-shadow(0 2px 8px rgba(0,0,0,0.5));
          transform: translateY(0);
          transition: transform .4s ease;
        }
        .sbs-card:hover .card-emoji { transform: translateY(-4px) scale(1.1); }
        .card-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 26px; font-weight: 400;
          color: #fdf6e9; line-height: 1.1; margin-bottom: 3px;
        }
        .card-sub {
          font-size: 9px; font-weight: 300;
          letter-spacing: 3px; text-transform: uppercase;
          color: #c9a96e;
          transition: margin .35s ease;
        }
        .sbs-card:hover .card-sub { margin-bottom: 10px; }
        .card-desc {
          font-size: 11.5px; font-weight: 300;
          color: rgba(240,226,192,0.5); line-height: 1.65;
          max-height: 0; overflow: hidden; opacity: 0;
          transform: translateY(6px);
          transition: max-height .38s ease, opacity .35s ease, transform .35s ease, margin .35s ease;
        }
        .sbs-card:hover .card-desc {
          max-height: 60px; opacity: 1; transform: translateY(0); margin-bottom: 14px;
        }
        .card-cta {
          display: flex; align-items: center; gap: 8px;
          font-size: 9px; font-weight: 400; letter-spacing: 3px; text-transform: uppercase;
          color: #d4af37;
          opacity: 0; transform: translateY(5px);
          transition: opacity .3s ease .05s, transform .3s ease .05s;
        }
        .sbs-card:hover .card-cta { opacity: 1; transform: translateY(0); }
        .cta-dash {
          width: 18px; height: 1px; background: #d4af37;
          transition: width .35s ease;
        }
        .sbs-card:hover .cta-dash { width: 30px; }

        /* ── FOOTER ── */
        .sbs-footer {
          text-align: center;
          padding: 32px 52px 48px;
          border-top: 1px solid rgba(201,169,110,0.1);
        }
        .sbs-footer p {
          font-family: 'Cormorant Garamond', serif;
          font-size: 16px; font-style: italic; font-weight: 300;
          color: rgba(240,226,192,0.3); letter-spacing: .5px;
        }

        /* ── RESPONSIVE ── */
        @media (max-width:860px) {
          .sbs-grid { grid-template-columns: repeat(2, 1fr); }
          .sbs-nav, .sbs-hero, .sbs-grid-section { padding-left:24px; padding-right:24px; }
          .sbs-nav-links { display:none; }
        }
        @media (max-width:540px) {
          .sbs-grid { grid-template-columns: 1fr; }
          .sbs-nav, .sbs-hero, .sbs-grid-section { padding-left:16px; padding-right:16px; }
        }
      `}</style>

      <div className="sbs-root" ref={sectionRef}>

        {/* NAV */}
        <nav className="sbs-nav">
          <a href="/" className="sbs-logo">Mai<em>son</em></a>
          <div className="sbs-nav-links">
            <a href="#" className="active">Collections</a>
            <a href="#">Shop</a>
            <a href="#">Journal</a>
          </div>
        </nav>

        {/* HERO */}
        <div className="sbs-hero">
          <p className={`sbs-eyebrow ${visible ? 'on' : ''}`}>Curated Collections</p>
          <h1 className="sbs-title">Shop by <em>Your</em> Style</h1>
          <p className="sbs-subtitle">
            Six distinct worlds of jewellery — each piece chosen to match your mood, your moment, your magic.
          </p>
          <div className="sbs-rule">
            <div className="sbs-rule-line"/>
            <div className="sbs-rule-diamond"/>
            <div className="sbs-rule-line"/>
          </div>
        </div>

        {/* STYLE GRID */}
        <div className="sbs-grid-section">
          <div className="sbs-grid">
            {styles.map((s, i) => (
              <Link
                key={s.id}
                href={`/styles/${s.id}`}
                className={`sbs-card-link ${visible ? 'on' : ''}`}
                style={{ transitionDelay: `${0.08 + i * 0.09}s` }}
              >
                <div
                  className="sbs-card"
                  onMouseEnter={() => setHoveredId(s.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <div className="card-base"/>
                  <div className="card-grad" style={{ background: s.heroPattern }}/>
                  <div className="card-watermark">{s.emoji}</div>
                  <div className="card-shimmer"/>
                  <div className="card-corner cc-tl"/>
                  <div className="card-corner cc-tr"/>
                  <div className="card-corner cc-bl"/>
                  <div className="card-corner cc-br"/>

                  <span className="card-badge">{s.tag}</span>
                  <span className="card-count">{countProducts(s.id)} pieces</span>

                  <div className="card-content">
                    <span className="card-emoji">{s.emoji}</span>
                    <p className="card-name">{s.name}</p>
                    <p className="card-sub">{s.sub}</p>
                    <p className="card-desc">{s.desc}</p>
                    <div className="card-cta">
                      <span className="cta-dash"/>
                      Explore Collection
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* FOOTER */}
        <footer className="sbs-footer">
          <p>Every jewel tells a story — find yours</p>
        </footer>

      </div>
    </>
  );
}
