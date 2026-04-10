"use client";
import { useState, useEffect, useRef, useCallback } from "react";

type PatternKey = "circles" | "dots" | "lines";

interface BannerItem {
  id: number;
  tag: string;
  title: string;
  subtitle: string;
  cta: string;
  bg: string;
  accent: string;
  textDark: boolean;
  imageSlot: "left" | "right";
  pattern: PatternKey;
}

const banners: BannerItem[] = [
  {
    id: 1,
    tag: "New Launch",
    title: "Pinteresty\nNecklaces",
    subtitle: "Dainty chains you've been dreaming of",
    cta: "Shop Now",
    bg: "linear-gradient(135deg, #e8c07d 0%, #c9a96e 40%, #a07840 100%)",
    accent: "#fff8ee",
    textDark: false,
    imageSlot: "left",
    pattern: "circles",
  },
  {
    id: 2,
    tag: "Bestseller",
    title: "Anti-Tarnish\nCollection",
    subtitle: "Wear it every day, forever gold",
    cta: "Explore",
    bg: "linear-gradient(135deg, #b8c9a3 0%, #8fa870 40%, #6b7c45 100%)",
    accent: "#f5f8ef",
    textDark: false,
    imageSlot: "right",
    pattern: "dots",
  },
  {
    id: 3,
    tag: "Limited Edition",
    title: "Stack &\nLayer",
    subtitle: "Build your perfect arm party",
    cta: "Shop Bracelets",
    bg: "linear-gradient(135deg, #f5e6c8 0%, #e8c87d 50%, #d4a843 100%)",
    accent: "#3b2e1a",
    textDark: true,
    imageSlot: "left",
    pattern: "lines",
  },
  {
    id: 4,
    tag: "Trending",
    title: "Ring\nObsessed",
    subtitle: "Stack every finger, no rules",
    cta: "Shop Rings",
    bg: "linear-gradient(135deg, #3b4a2f 0%, #4e6035 50%, #6b7c45 100%)",
    accent: "#fdf6e9",
    textDark: false,
    imageSlot: "right",
    pattern: "circles",
  },
];

// SVG pattern backgrounds
const Patterns = {
  circles: ({ color }: { color: string }) => (
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ position: "absolute", inset: 0, opacity: 0.07 }}>
      <defs>
        <pattern id="pc" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
          <circle cx="30" cy="30" r="20" fill="none" stroke={color} strokeWidth="1.5" />
          <circle cx="0" cy="0" r="10" fill="none" stroke={color} strokeWidth="1" />
          <circle cx="60" cy="60" r="10" fill="none" stroke={color} strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#pc)" />
    </svg>
  ),
  dots: ({ color }: { color: string }) => (
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ position: "absolute", inset: 0, opacity: 0.09 }}>
      <defs>
        <pattern id="pd" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
          <circle cx="14" cy="14" r="2.5" fill={color} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#pd)" />
    </svg>
  ),
  lines: ({ color }: { color: string }) => (
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ position: "absolute", inset: 0, opacity: 0.06 }}>
      <defs>
        <pattern id="pl" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="40" y2="40" stroke={color} strokeWidth="1" />
          <line x1="40" y1="0" x2="0" y2="40" stroke={color} strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#pl)" />
    </svg>
  ),
};

// Abstract jewellery illustration per banner
function BannerIllustration({ id, accent }: { id: number; accent: string }) {
  if (id === 1) return (
    <svg viewBox="0 0 220 340" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%", maxWidth: 220 }}>
      {/* Necklace chains */}
      {[0,18,36,54,72].map((offset, i) => (
        <g key={i} opacity={0.85 - i * 0.1}>
          <path d={`M${60+offset} 20 C${65+offset} 80 ${55+offset} 160 ${60+offset} 280`} stroke={accent} strokeWidth={i===0?2:1.5} strokeLinecap="round" fill="none"/>
        </g>
      ))}
      {/* Pendants */}
      <circle cx="60" cy="290" r="8" fill={accent} opacity="0.9"/>
      <polygon points="78,295 82,315 74,315" fill={accent} opacity="0.8"/>
      <rect x="92" y="285" width="10" height="10" rx="1" fill={accent} opacity="0.7" transform="rotate(45 97 290)"/>
      {/* Sparkles */}
      {[[160,60],[40,120],[180,200],[30,250]].map(([x,y],i) => (
        <g key={i}>
          <line x1={x} y1={y-8} x2={x} y2={y+8} stroke={accent} strokeWidth="1.5" opacity="0.6"/>
          <line x1={x-8} y1={y} x2={x+8} y2={y} stroke={accent} strokeWidth="1.5" opacity="0.6"/>
          <line x1={x-5} y1={y-5} x2={x+5} y2={y+5} stroke={accent} strokeWidth="1" opacity="0.4"/>
          <line x1={x+5} y1={y-5} x2={x-5} y2={y+5} stroke={accent} strokeWidth="1" opacity="0.4"/>
        </g>
      ))}
    </svg>
  );

  if (id === 2) return (
    <svg viewBox="0 0 280 280" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%", maxWidth: 260 }}>
      {/* Rings stacked */}
      {[0,1,2,3,4].map(i => (
        <ellipse key={i} cx="140" cy={120+i*28} rx="70" ry="22" stroke={accent} strokeWidth={i===2?2.5:1.5} fill="none" opacity={0.9-i*0.12}/>
      ))}
      {/* Ring decorations */}
      <path d="M 85 120 C 90 100 110 90 140 90 C 170 90 190 100 195 120" stroke={accent} strokeWidth="2" fill="none" opacity="0.5"/>
      {/* Leaf detail on middle ring */}
      <path d="M 110 134 C 115 124 135 118 155 134" stroke={accent} strokeWidth="1.5" fill="none"/>
      {/* Stars */}
      {[[40,60],[220,80],[50,220],[230,200],[140,30]].map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r={i===4?5:3} fill={accent} opacity={0.5+i*0.08}/>
      ))}
      <text x="80" y="260" fontFamily="serif" fontSize="13" fill={accent} opacity="0.4" letterSpacing="3">ANTI-TARNISH</text>
    </svg>
  );

  if (id === 3) return (
    <svg viewBox="0 0 260 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%", maxWidth: 240 }}>
      {/* Bracelets */}
      {[0,1,2,3].map(i => (
        <g key={i}>
          <path d={`M 50 ${80+i*45} C 50 ${55+i*45} 210 ${55+i*45} 210 ${80+i*45} C 210 ${105+i*45} 50 ${105+i*45} 50 ${80+i*45}`} stroke={accent} strokeWidth={i===1?2.5:1.8} fill="none" opacity={0.85-i*0.1}/>
          {/* charms */}
          {i===1 && <polygon points="130,55 135,70 125,70" fill={accent} opacity="0.7"/>}
          {i===2 && <circle cx="170" cy="103" r="6" fill="none" stroke={accent} strokeWidth="1.5" opacity="0.6"/>}
          {i===3 && <rect x="85" y="117" width="8" height="8" rx="1" fill={accent} opacity="0.5" transform="rotate(45 89 121)"/>}
        </g>
      ))}
      {/* Chain detail */}
      {[60,80,100,120,140,160,180].map((x,i) => (
        <circle key={i} cx={x} cy={170} r="3" fill={accent} opacity="0.4"/>
      ))}
      {/* Butterfly */}
      <path d="M 120 210 C 100 195 90 215 120 220 C 150 215 140 195 120 210 Z" fill={accent} opacity="0.35"/>
      <path d="M 120 210 C 105 225 95 210 120 215 C 145 210 135 225 120 210 Z" fill={accent} opacity="0.25"/>
    </svg>
  );

  return (
    <svg viewBox="0 0 260 280" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%", maxWidth: 240 }}>
      {/* Multiple rings scattered */}
      {[
        [80,80,40,14],[160,100,35,12],[110,160,42,15],[180,180,30,11],[70,200,38,13]
      ].map(([cx,cy,rx,ry],i) => (
        <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry} stroke={accent} strokeWidth={i===2?2.5:1.8} fill="none" opacity={0.8-i*0.1} transform={`rotate(${i*15} ${cx} ${cy})`}/>
      ))}
      {/* Heart detail */}
      <path d="M 200 60 C 200 52 210 48 215 55 C 220 48 230 52 230 60 C 230 70 215 80 215 80 C 215 80 200 70 200 60 Z" fill={accent} opacity="0.4"/>
      {/* Dots trail */}
      {[0,1,2,3,4,5].map(i => (
        <circle key={i} cx={30+i*35} cy={240} r={2+i*0.5} fill={accent} opacity={0.3+i*0.08}/>
      ))}
    </svg>
  );
}

const INTERVAL = 4000;
const TRANSITION = 650;

export default function BannerSlider() {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [animating, setAnimating] = useState(false);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((idx: number) => {
    if (animating) return;
    setAnimating(true);
    setPrev(current);
    setCurrent(idx);
    setTimeout(() => { setPrev(null); setAnimating(false); }, TRANSITION);
  }, [animating, current]);

  const next = useCallback(() => {
    goTo((current + 1) % banners.length);
  }, [current, goTo]);

  const prev_ = useCallback(() => {
    goTo((current - 1 + banners.length) % banners.length);
  }, [current, goTo]);

  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(next, INTERVAL);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [next, paused]);

  const b = banners[current];
  const PatternComp = Patterns[b.pattern];
  const textColor = b.textDark ? "#2c1f0a" : "#fdf6e9";
  const mutedColor = b.textDark ? "rgba(44,31,10,0.6)" : "rgba(253,246,233,0.65)";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,500;1,600&family=Jost:wght@200;300;400;500&display=swap');

        .bs-section {
          background: #f9f5ef;
          padding: 52px 0 60px;
          position: relative;
          font-family: 'Jost', sans-serif;
        }

        /* Section eyebrow */
        .bs-eyebrow {
          text-align: center;
          margin-bottom: 28px;
          padding: 0 24px;
        }
        .bs-eyebrow-line {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          margin-bottom: 10px;
        }
        .bs-eyebrow-rule {
          width: 48px; height: 1px;
          background: linear-gradient(90deg, transparent, #c9a96e);
        }
        .bs-eyebrow-rule:last-child {
          background: linear-gradient(90deg, #c9a96e, transparent);
        }
        .bs-eyebrow-dot {
          width: 5px; height: 5px;
          background: #d4af37;
          border-radius: 50%;
        }
        .bs-label {
          font-size: 10px;
          font-weight: 300;
          letter-spacing: 5px;
          text-transform: uppercase;
          color: #8fa870;
        }
        .bs-heading {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(26px, 3.5vw, 40px);
          font-weight: 300;
          color: #2c3320;
          margin: 0;
          letter-spacing: 0.5px;
        }
        .bs-heading em { font-style: italic; color: #c9a96e; }

        /* Slider wrapper */
        .bs-wrap {
          position: relative;
          max-width: 1180px;
          margin: 0 auto;
          padding: 0 24px;
        }

        /* Track */
        .bs-track {
          position: relative;
          width: 100%;
          border-radius: 6px;
          overflow: hidden;
          box-shadow:
            0 4px 6px rgba(0,0,0,0.04),
            0 20px 60px rgba(0,0,0,0.12),
            0 1px 0 rgba(255,255,255,0.8) inset;
          cursor: pointer;
        }

        /* Slide */
        .bs-slide {
          width: 100%;
          min-height: 360px;
          position: relative;
          display: flex;
          align-items: stretch;
          overflow: hidden;
        }
        @media (max-width: 640px) { .bs-slide { min-height: 280px; flex-direction: column; } }

        /* Slide background */
        .bs-slide-bg {
          position: absolute;
          inset: 0;
          transition: opacity ${TRANSITION}ms ease;
        }
        .bs-slide-bg.entering { opacity: 1; }
        .bs-slide-bg.exiting { opacity: 0; }

        /* Content half */
        .bs-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 52px 48px 52px 56px;
          position: relative;
          z-index: 2;
        }
        @media (max-width: 760px) { .bs-content { padding: 36px 28px 36px 36px; } }
        @media (max-width: 640px) { .bs-content { padding: 32px 24px; } }

        .bs-tag {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 9.5px;
          font-weight: 400;
          letter-spacing: 3.5px;
          text-transform: uppercase;
          margin-bottom: 18px;
          opacity: 0;
          transform: translateX(-16px);
          transition: all 0.5s ease 0.1s;
        }
        .bs-tag.active { opacity: 1; transform: translateX(0); }
        .bs-tag-dot { width: 5px; height: 5px; border-radius: 50%; }

        .bs-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(36px, 5vw, 64px);
          font-weight: 500;
          line-height: 1.05;
          white-space: pre-line;
          margin: 0 0 14px;
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.55s ease 0.2s;
        }
        .bs-title.active { opacity: 1; transform: translateY(0); }

        .bs-sub {
          font-size: 13.5px;
          font-weight: 300;
          line-height: 1.6;
          letter-spacing: 0.3px;
          margin-bottom: 30px;
          opacity: 0;
          transform: translateY(14px);
          transition: all 0.55s ease 0.3s;
        }
        .bs-sub.active { opacity: 1; transform: translateY(0); }

        .bs-cta {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-size: 10.5px;
          font-weight: 400;
          letter-spacing: 3px;
          text-transform: uppercase;
          text-decoration: none;
          padding: 13px 28px;
          border-radius: 2px;
          border: 1.5px solid;
          width: fit-content;
          cursor: pointer;
          opacity: 0;
          transform: translateY(10px);
          transition:
            opacity 0.5s ease 0.4s,
            transform 0.5s ease 0.4s,
            background 0.25s ease,
            color 0.25s ease;
          position: relative;
          overflow: hidden;
        }
        .bs-cta.active { opacity: 1; transform: translateY(0); }
        .bs-cta::after {
          content: '';
          position: absolute;
          inset: 0;
          background: currentColor;
          opacity: 0;
          transition: opacity 0.25s ease;
        }
        .bs-cta:hover::after { opacity: 0.08; }
        .bs-cta-arrow {
          width: 14px; height: 1px;
          background: currentColor;
          position: relative;
          transition: width 0.25s ease;
        }
        .bs-cta:hover .bs-cta-arrow { width: 22px; }
        .bs-cta-arrow::after {
          content: '';
          position: absolute;
          right: 0; top: -3px;
          width: 6px; height: 6px;
          border-right: 1px solid currentColor;
          border-top: 1px solid currentColor;
          transform: rotate(45deg);
        }

        /* Image half */
        .bs-image {
          flex: 0 0 42%;
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          opacity: 0;
          transform: scale(0.94) translateX(20px);
          transition: all 0.6s ease 0.25s;
        }
        .bs-image.left {
          order: -1;
          transform: scale(0.94) translateX(-20px);
        }
        .bs-image.active { opacity: 1; transform: scale(1) translateX(0); }
        @media (max-width: 640px) {
          .bs-image { flex: 0 0 auto; height: 180px; width: 100%; }
        }

        /* Decorative circle behind illustration */
        .bs-illus-circle {
          position: absolute;
          width: 260px; height: 260px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.15);
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
        }
        .bs-illus-circle-2 {
          position: absolute;
          width: 200px; height: 200px;
          border-radius: 50%;
          background: rgba(255,255,255,0.06);
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
        }

        /* Progress bar */
        .bs-progress {
          position: absolute;
          bottom: 0;
          left: 0;
          height: 2px;
          background: rgba(255,255,255,0.5);
          border-radius: 0 1px 0 0;
          animation: bsProgress ${INTERVAL}ms linear;
        }
        @keyframes bsProgress {
          from { width: 0; }
          to { width: 100%; }
        }

        /* Navigation */
        .bs-nav {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
          margin-top: 22px;
        }

        .bs-arrow {
          width: 40px; height: 40px;
          border-radius: 50%;
          border: 1px solid rgba(107,124,69,0.35);
          background: #fff;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: all 0.25s ease;
          box-shadow: 0 2px 8px rgba(0,0,0,0.07);
          color: #4e6035;
        }
        .bs-arrow:hover {
          background: #4e6035;
          border-color: #4e6035;
          color: #fdf6e9;
          box-shadow: 0 4px 16px rgba(78,96,53,0.25);
          transform: scale(1.06);
        }
        .bs-arrow svg { width: 16px; height: 16px; }

        .bs-dots {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .bs-dot {
          border: none;
          cursor: pointer;
          background: none;
          padding: 4px;
          display: flex; align-items: center; justify-content: center;
        }
        .bs-dot-inner {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #c9b89a;
          transition: all 0.3s ease;
        }
        .bs-dot.active .bs-dot-inner {
          width: 22px;
          border-radius: 3px;
          background: #6b7c45;
        }

        /* Thumbnail strip */
        .bs-thumbs {
          display: flex;
          gap: 10px;
          justify-content: center;
          margin-top: 12px;
        }
        .bs-thumb {
          width: 52px; height: 36px;
          border-radius: 4px;
          cursor: pointer;
          border: 2px solid transparent;
          transition: all 0.25s ease;
          overflow: hidden;
          position: relative;
          flex-shrink: 0;
        }
        .bs-thumb.active {
          border-color: #6b7c45;
          box-shadow: 0 2px 8px rgba(107,124,69,0.3);
        }
        .bs-thumb-bg {
          position: absolute;
          inset: 0;
          opacity: 0.85;
        }
        .bs-thumb.active .bs-thumb-bg { opacity: 1; }
        .bs-thumb-label {
          position: absolute;
          inset: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 7px;
          font-weight: 400;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.85);
          text-align: center;
          line-height: 1.3;
          padding: 2px;
        }

        /* Counter */
        .bs-counter {
          font-size: 11px;
          font-weight: 300;
          letter-spacing: 2px;
          color: #8fa870;
        }
        .bs-counter span { color: #3b4a2f; font-weight: 400; }
      `}</style>

      <section className="bs-section" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>

        {/* Section header */}
        <div className="bs-eyebrow">
          <div className="bs-eyebrow-line">
            <div className="bs-eyebrow-rule" />
            <div className="bs-eyebrow-dot" />
            <div className="bs-eyebrow-rule" />
          </div>
          <p className="bs-label">Featured & Promotions</p>
          <h2 className="bs-heading">What's <em>Hot</em> Right Now</h2>
        </div>

        <div className="bs-wrap">
          {/* Main slider */}
          <div className="bs-track">
            <div className="bs-slide">
              {/* Background — animated */}
              <div className="bs-slide-bg entering" style={{ background: b.bg }}>
                <PatternComp color={textColor} />
                {/* Radial glow */}
                <div style={{
                  position: "absolute", inset: 0,
                  background: "radial-gradient(ellipse at 30% 50%, rgba(255,255,255,0.12) 0%, transparent 60%)",
                }} />
              </div>

              {/* Progress bar — re-mounts on slide change */}
              {!paused && <div key={current} className="bs-progress" />}

              {/* Image — left or right */}
              {b.imageSlot === "left" && (
                <div className={`bs-image left active`}>
                  <div className="bs-illus-circle" />
                  <div className="bs-illus-circle-2" />
                  <BannerIllustration id={b.id} accent={textColor} />
                </div>
              )}

              {/* Text content */}
              <div className="bs-content">
                <div className={`bs-tag active`} style={{ color: textColor }}>
                  <div className="bs-tag-dot" style={{ background: textColor }} />
                  {b.tag}
                </div>
                <h3 className={`bs-title active`} style={{ color: textColor }}>
                  {b.title}
                </h3>
                <p className={`bs-sub active`} style={{ color: mutedColor }}>
                  {b.subtitle}
                </p>
                <button
                  className={`bs-cta active`}
                  style={{
                    color: textColor,
                    borderColor: b.textDark ? "rgba(44,31,10,0.5)" : "rgba(253,246,233,0.5)",
                  }}
                >
                  {b.cta}
                  <span className="bs-cta-arrow" />
                </button>
              </div>

              {/* Image — right */}
              {b.imageSlot === "right" && (
                <div className={`bs-image active`}>
                  <div className="bs-illus-circle" />
                  <div className="bs-illus-circle-2" />
                  <BannerIllustration id={b.id} accent={textColor} />
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="bs-nav">
            <button className="bs-arrow" onClick={prev_} aria-label="Previous">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            <div className="bs-dots">
              {banners.map((_, i) => (
                <button key={i} className={`bs-dot ${i === current ? "active" : ""}`} onClick={() => goTo(i)} aria-label={`Go to slide ${i + 1}`}>
                  <div className="bs-dot-inner" />
                </button>
              ))}
            </div>

            <p className="bs-counter">
              <span>{String(current + 1).padStart(2, "0")}</span> / {String(banners.length).padStart(2, "0")}
            </p>

            <button className="bs-arrow" onClick={next} aria-label="Next">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          {/* Thumbnail strip */}
          <div className="bs-thumbs">
            {banners.map((bn, i) => (
              <div key={i} className={`bs-thumb ${i === current ? "active" : ""}`} onClick={() => goTo(i)}>
                <div className="bs-thumb-bg" style={{ background: bn.bg }} />
                <div className="bs-thumb-label">{bn.title.split("\n")[0]}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}