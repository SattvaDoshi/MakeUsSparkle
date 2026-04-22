"use client";
import { useState, useEffect, useCallback } from "react";

type PatternKey = "circles" | "dots" | "lines";

interface BannerItem {
  id: number;
  tag: string;
  title: string;
  subtitle: string;
  cta: string;
  bg: string;
  textDark: boolean;
  imageSlot: "left" | "right";
  pattern: PatternKey;
  imageSrc: string;
  imageAlt: string;
  titleColor: string;
  subtitleColor: string;
  tagColor: string;
  ctaBorderColor: string;
  ctaTextColor: string;
}

const banners: BannerItem[] = [
  {
    id: 1,
    tag: "New Launch",
    title: "Pinteresty\nNecklaces",
    subtitle: "Dainty chains you've been dreaming of",
    cta: "Shop Now",
    bg: "linear-gradient(135deg, #e8c07d 0%, #c9a96e 40%, #a07840 100%)",
    textDark: true,
    imageSlot: "left",
    pattern: "circles",
    imageSrc: "/images/hero.png",
    imageAlt: "Pinteresty Necklaces Collection",
    titleColor: "#1a0d00",
    subtitleColor: "rgba(40,20,0,0.62)",
    tagColor: "#5c3a00",
    ctaBorderColor: "rgba(90,50,0,0.55)",
    ctaTextColor: "#1a0d00",
  },
  {
    id: 2,
    tag: "Bestseller",
    title: "Anti-Tarnish\nCollection",
    subtitle: "Wear it every day, forever gold",
    cta: "Explore",
    bg: "linear-gradient(135deg, #b8c9a3 0%, #8fa870 40%, #6b7c45 100%)",
    textDark: false,
    imageSlot: "right",
    pattern: "dots",
    imageSrc: "/images/hero.png",
    imageAlt: "Anti-Tarnish Collection",
    titleColor: "#fdf6e9",
    subtitleColor: "rgba(253,246,233,0.68)",
    tagColor: "#fdf6e9",
    ctaBorderColor: "rgba(253,246,233,0.5)",
    ctaTextColor: "#fdf6e9",
  },
  {
    id: 3,
    tag: "Limited Edition",
    title: "Stack &\nLayer",
    subtitle: "Build your perfect arm party",
    cta: "Shop Bracelets",
    bg: "linear-gradient(135deg, #f5e6c8 0%, #e8c87d 50%, #d4a843 100%)",
    textDark: true,
    imageSlot: "left",
    pattern: "lines",
    imageSrc: "/images/hero.png",
    imageAlt: "Stack and Layer Bracelets",
    titleColor: "#1a0d00",
    subtitleColor: "rgba(40,20,0,0.62)",
    tagColor: "#5c3a00",
    ctaBorderColor: "rgba(90,50,0,0.55)",
    ctaTextColor: "#1a0d00",
  },
  {
    id: 4,
    tag: "Trending",
    title: "Ring\nObsessed",
    subtitle: "Stack every finger, no rules",
    cta: "Shop Rings",
    bg: "linear-gradient(135deg, #3b4a2f 0%, #4e6035 50%, #6b7c45 100%)",
    textDark: false,
    imageSlot: "right",
    pattern: "circles",
    imageSrc: "/images/hero.png",
    imageAlt: "Ring Obsessed Collection",
    titleColor: "#fdf6e9",
    subtitleColor: "rgba(253,246,233,0.68)",
    tagColor: "#fdf6e9",
    ctaBorderColor: "rgba(253,246,233,0.5)",
    ctaTextColor: "#fdf6e9",
  },
];

const Patterns = {
  circles: ({ color }: { color: string }) => (
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"
      style={{ position: "absolute", inset: 0, opacity: 0.07 }}>
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
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"
      style={{ position: "absolute", inset: 0, opacity: 0.09 }}>
      <defs>
        <pattern id="pd" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
          <circle cx="14" cy="14" r="2.5" fill={color} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#pd)" />
    </svg>
  ),
  lines: ({ color }: { color: string }) => (
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"
      style={{ position: "absolute", inset: 0, opacity: 0.06 }}>
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

const INTERVAL = 4000;

export default function BannerSlider() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback((idx: number) => {
    setCurrent(idx);
  }, []);

  const next = useCallback(() => {
    setCurrent(c => (c + 1) % banners.length);
  }, []);

  const prev_ = useCallback(() => {
    setCurrent(c => (c - 1 + banners.length) % banners.length);
  }, []);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(next, INTERVAL);
    return () => clearInterval(t);
  }, [next, paused]);

  const b = banners[current];
  const PatternComp = Patterns[b.pattern];
  const imageOnLeft = b.imageSlot === "left";
  const patternColor = b.textDark ? "#3b2000" : "#ffffff";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400;1,500;1,600&family=Jost:wght@200;300;400;500&display=swap');

        .bs-section {
          background: #f9f5ef;
          padding: 52px 0 60px;
          font-family: 'Jost', sans-serif;
        }

        /* ─── Eyebrow ─────────────────────────────────── */
        .bs-eyebrow { text-align: center; margin-bottom: 28px; padding: 0 24px; }
        .bs-eyebrow-line {
          display: flex; align-items: center; justify-content: center;
          gap: 14px; margin-bottom: 10px;
        }
        .bs-eyebrow-rule {
          width: 48px; height: 1px;
          background: linear-gradient(90deg, transparent, #c9a96e);
        }
        .bs-eyebrow-rule:last-child { background: linear-gradient(90deg, #c9a96e, transparent); }
        .bs-eyebrow-dot { width: 5px; height: 5px; background: #d4af37; border-radius: 50%; }
        .bs-label {
          font-size: 10px; font-weight: 300; letter-spacing: 5px;
          text-transform: uppercase; color: #8fa870; margin-bottom: 6px;
          display: block;
        }
        .bs-heading {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(26px, 3.5vw, 40px);
          font-weight: 300; color: #2c3320; margin: 0; letter-spacing: 0.5px;
        }
        .bs-heading em { font-style: italic; color: #c9a96e; }

        /* ─── Wrapper & Track ─────────────────────────── */
        .bs-wrap { max-width: 1180px; margin: 0 auto; padding: 0 24px; }

        .bs-track {
          position: relative; width: 100%;
          border-radius: 8px; overflow: hidden;
          box-shadow: 0 2px 4px rgba(0,0,0,0.04), 0 24px 64px rgba(0,0,0,0.14);
        }

        /* ─── Slide ───────────────────────────────────── */
        .bs-slide {
          width: 100%;
          min-height: 400px;
          position: relative;
          display: flex;
          align-items: stretch;
          overflow: hidden;
        }
        @media (max-width: 640px) {
          .bs-slide { flex-direction: column; min-height: auto; }
        }

        .bs-slide-bg {
          position: absolute; inset: 0;
          transition: background 0.5s ease;
        }

        /* ─── IMAGE PANEL ─────────────────────────────── */
        .bs-image-panel {
          flex: 0 0 50%;
          position: relative;
          z-index: 2;
          overflow: hidden;
        }

        .bs-image-panel img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center center;
          display: block;
          /* NO animation — just a clean fade between slides via opacity transition */
          transition: opacity 0.5s ease;
        }

        /* Diagonal cut on inner edge */
        .bs-image-panel.img-left {
          clip-path: polygon(0 0, 92% 0, 100% 100%, 0 100%);
        }
        .bs-image-panel.img-right {
          clip-path: polygon(8% 0, 100% 0, 100% 100%, 0 100%);
        }
        @media (max-width: 640px) {
          .bs-image-panel.img-left,
          .bs-image-panel.img-right {
            clip-path: none;
            flex: 0 0 240px;
            width: 100%;
          }
        }

        /* Cinematic top+bottom vignette */
        .bs-image-panel::before {
          content: '';
          position: absolute; inset: 0; z-index: 4; pointer-events: none;
          background: linear-gradient(
            to bottom,
            rgba(0,0,0,0.22) 0%,
            transparent 25%,
            transparent 70%,
            rgba(0,0,0,0.28) 100%
          );
        }

        /* Side blend — no hard edge between image and gradient bg */
        .bs-image-panel.img-left::after {
          content: '';
          position: absolute; inset: 0; z-index: 5; pointer-events: none;
          background: linear-gradient(to right, transparent 45%, rgba(0,0,0,0.15) 100%);
        }
        .bs-image-panel.img-right::after {
          content: '';
          position: absolute; inset: 0; z-index: 5; pointer-events: none;
          background: linear-gradient(to left, transparent 45%, rgba(0,0,0,0.15) 100%);
        }

        /* Shimmer on the diagonal cut edge */
        .bs-shimmer {
          position: absolute; inset: 0; z-index: 6; pointer-events: none;
        }
        .img-left .bs-shimmer {
          background: linear-gradient(
            to left,
            rgba(255,215,100,0.16) 0%,
            rgba(255,215,100,0.04) 5%,
            transparent 10%
          );
        }
        .img-right .bs-shimmer {
          background: linear-gradient(
            to right,
            rgba(255,215,100,0.16) 0%,
            rgba(255,215,100,0.04) 5%,
            transparent 10%
          );
        }

        /* ─── TEXT PANEL ──────────────────────────────── */
        .bs-content {
          flex: 0 0 50%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: relative;
          z-index: 2;
          /* NO animation classes — visibility is always 1, no transform tricks */
        }

        /* Orange banners: image LEFT → text extreme RIGHT */
        .bs-content.text-right {
          padding: 56px 64px 56px 24px;
          align-items: flex-end;
          text-align: right;
        }

        /* Green banners: image RIGHT → text extreme LEFT */
        .bs-content.text-left {
          padding: 56px 24px 56px 64px;
          align-items: flex-start;
          text-align: left;
        }

        @media (max-width: 900px) {
          .bs-content.text-right { padding: 40px 40px 40px 16px; }
          .bs-content.text-left  { padding: 40px 16px 40px 40px; }
        }
        @media (max-width: 640px) {
          .bs-content.text-right,
          .bs-content.text-left {
            padding: 28px 24px;
            align-items: flex-start;
            text-align: left;
            flex: 1;
          }
        }

        /* All text children — NO opacity/transform animations */
        .bs-tag {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 9px; font-weight: 400; letter-spacing: 4px;
          text-transform: uppercase; margin-bottom: 16px;
        }
        .bs-tag-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }

        .bs-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(40px, 5vw, 68px);
          font-weight: 500; line-height: 1.02;
          white-space: pre-line; margin: 0 0 14px;
        }

        /* Thin decorative rule below title */
        .bs-rule {
          display: block;
          height: 1px; width: 48px;
          margin-bottom: 14px;
          flex-shrink: 0;
        }
        .bs-content.text-right .bs-rule { margin-left: auto; }

        .bs-sub {
          font-size: 13px; font-weight: 300; line-height: 1.65;
          letter-spacing: 0.3px; margin-bottom: 30px;
          max-width: 280px;
        }
        .bs-content.text-right .bs-sub { margin-left: auto; }

        .bs-cta {
          display: inline-flex; align-items: center; gap: 12px;
          font-size: 10px; font-weight: 400; letter-spacing: 3.5px;
          text-transform: uppercase; text-decoration: none;
          padding: 14px 30px; border-radius: 2px; border: 1.5px solid;
          cursor: pointer; background: transparent;
          transition: background 0.22s ease;
          position: relative; overflow: hidden;
        }
        .bs-cta::before {
          content: '';
          position: absolute; inset: 0;
          background: currentColor; opacity: 0;
          transition: opacity 0.22s ease;
        }
        .bs-cta:hover::before { opacity: 0.1; }
        .bs-cta-arrow {
          width: 16px; height: 1px; background: currentColor;
          position: relative; transition: width 0.22s ease; flex-shrink: 0;
        }
        .bs-cta:hover .bs-cta-arrow { width: 26px; }
        .bs-cta-arrow::after {
          content: '';
          position: absolute; right: 0; top: -3.5px;
          width: 7px; height: 7px;
          border-right: 1.5px solid currentColor;
          border-top: 1.5px solid currentColor;
          transform: rotate(45deg);
        }

        /* ─── Progress bar ────────────────────────────── */
        .bs-progress {
          position: absolute; bottom: 0; left: 0; height: 2.5px;
          background: rgba(255,255,255,0.5); border-radius: 0 2px 0 0;
          animation: bsProgress ${INTERVAL}ms linear; z-index: 10;
        }
        @keyframes bsProgress { from { width: 0; } to { width: 100%; } }

        /* ─── Navigation ──────────────────────────────── */
        .bs-nav {
          display: flex; align-items: center; justify-content: center;
          gap: 20px; margin-top: 22px;
        }
        .bs-arrow {
          width: 40px; height: 40px; border-radius: 50%;
          border: 1px solid rgba(107,124,69,0.3); background: #fff;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.22s ease;
          box-shadow: 0 2px 8px rgba(0,0,0,0.07); color: #4e6035;
        }
        .bs-arrow:hover {
          background: #4e6035; border-color: #4e6035; color: #fdf6e9;
          box-shadow: 0 4px 16px rgba(78,96,53,0.28); transform: scale(1.06);
        }
        .bs-arrow svg { width: 16px; height: 16px; }

        .bs-dots { display: flex; gap: 8px; align-items: center; }
        .bs-dot {
          border: none; cursor: pointer; background: none; padding: 4px;
          display: flex; align-items: center; justify-content: center;
        }
        .bs-dot-inner {
          width: 6px; height: 6px; border-radius: 50%;
          background: #c9b89a; transition: all 0.28s ease;
        }
        .bs-dot.active .bs-dot-inner {
          width: 24px; border-radius: 3px; background: #6b7c45;
        }
        .bs-counter {
          font-size: 11px; font-weight: 300; letter-spacing: 2px; color: #8fa870;
        }
        .bs-counter span { color: #3b4a2f; font-weight: 400; }

        /* ─── Thumbnails ──────────────────────────────── */
        .bs-thumbs {
          display: flex; gap: 10px; justify-content: center; margin-top: 12px;
        }
        .bs-thumb {
          width: 54px; height: 36px; border-radius: 4px; cursor: pointer;
          border: 2px solid transparent; transition: all 0.22s ease;
          overflow: hidden; position: relative; flex-shrink: 0;
        }
        .bs-thumb.active { border-color: #6b7c45; box-shadow: 0 2px 8px rgba(107,124,69,0.3); }
        .bs-thumb-bg { position: absolute; inset: 0; }
        .bs-thumb-label {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 7px; letter-spacing: 1px; text-transform: uppercase;
          color: rgba(255,255,255,0.9); text-align: center; padding: 2px;
        }
      `}</style>

      <section
        className="bs-section"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="bs-eyebrow">
          <div className="bs-eyebrow-line">
            <div className="bs-eyebrow-rule" />
            <div className="bs-eyebrow-dot" />
            <div className="bs-eyebrow-rule" />
          </div>
          <span className="bs-label">Featured &amp; Promotions</span>
          <h2 className="bs-heading">What's <em>Hot</em> Right Now</h2>
        </div>

        <div className="bs-wrap">
          <div className="bs-track">
            <div className="bs-slide">

              {/* Background — transitions via CSS on bg property */}
              <div className="bs-slide-bg" style={{ background: b.bg }}>
                <PatternComp color={patternColor} />
                <div style={{
                  position: "absolute", inset: 0, pointerEvents: "none",
                  background: imageOnLeft
                    ? "radial-gradient(ellipse at 80% 50%, rgba(255,255,255,0.09) 0%, transparent 60%)"
                    : "radial-gradient(ellipse at 20% 50%, rgba(255,255,255,0.09) 0%, transparent 60%)",
                }} />
              </div>

              {/* Progress bar — key forces restart on each slide */}
              {!paused && <div key={`prog-${current}`} className="bs-progress" />}

              {/* IMAGE LEFT (orange banners) */}
              {imageOnLeft && (
                <div className="bs-image-panel img-left">
                  <img src={b.imageSrc} alt={b.imageAlt} />
                  <div className="bs-shimmer" />
                </div>
              )}

              {/* TEXT — always visible, no animation that can break */}
              <div className={`bs-content ${imageOnLeft ? "text-right" : "text-left"}`}>
                <div className="bs-tag" style={{ color: b.tagColor }}>
                  <div className="bs-tag-dot" style={{ background: b.tagColor }} />
                  {b.tag}
                </div>

                <h3 className="bs-title" style={{ color: b.titleColor }}>
                  {b.title}
                </h3>

                <span
                  className="bs-rule"
                  style={{
                    background: b.textDark
                      ? "linear-gradient(90deg, #c9a96e, rgba(201,169,110,0.15))"
                      : "linear-gradient(90deg, rgba(253,246,233,0.8), rgba(253,246,233,0.08))",
                  }}
                />

                <p className="bs-sub" style={{ color: b.subtitleColor }}>
                  {b.subtitle}
                </p>

                <button
                  className="bs-cta"
                  style={{ color: b.ctaTextColor, borderColor: b.ctaBorderColor }}
                >
                  {b.cta}
                  <span className="bs-cta-arrow" />
                </button>
              </div>

              {/* IMAGE RIGHT (green banners) */}
              {!imageOnLeft && (
                <div className="bs-image-panel img-right">
                  <img src={b.imageSrc} alt={b.imageAlt} />
                  <div className="bs-shimmer" />
                </div>
              )}

            </div>
          </div>

          {/* Controls */}
          <div className="bs-nav">
            <button className="bs-arrow" onClick={prev_} aria-label="Previous">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            <div className="bs-dots">
              {banners.map((_, i) => (
                <button
                  key={i}
                  className={`bs-dot ${i === current ? "active" : ""}`}
                  onClick={() => goTo(i)}
                  aria-label={`Go to slide ${i + 1}`}
                >
                  <div className="bs-dot-inner" />
                </button>
              ))}
            </div>

            <p className="bs-counter">
              <span>{String(current + 1).padStart(2, "0")}</span>
              {" / "}
              {String(banners.length).padStart(2, "0")}
            </p>

            <button className="bs-arrow" onClick={next} aria-label="Next">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          {/* Thumbnails */}
          <div className="bs-thumbs">
            {banners.map((bn, i) => (
              <div
                key={i}
                className={`bs-thumb ${i === current ? "active" : ""}`}
                onClick={() => goTo(i)}
              >
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