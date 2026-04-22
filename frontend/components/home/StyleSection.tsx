"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

const styles = [
  {
    id: 1,
    name: "Soft Girl",
    sub: "Minimal & Dainty",
    slug: "soft-girl",
    emoji: "🌸",
    desc: "Delicate pieces that whisper, never shout",
    tag: "Bestseller",
    img: "/images/soft-girl.jpg",
    fallback: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80&auto=format&fit=crop",
    accent: "#e8c4c4",
    tint: "rgba(220,170,170,0.18)",
  },
  {
    id: 2,
    name: "Glam Look",
    sub: "Bold & Luminous",
    slug: "glam-look",
    emoji: "✨",
    desc: "Statement jewels for your most radiant moments",
    tag: "Trending",
    img: "/images/GlamLook.jpg",
    fallback: "https://images.unsplash.com/photo-1596944924591-d8745fc78bac?w=600&q=80&auto=format&fit=crop",
    accent: "#d4af37",
    tint: "rgba(212,175,55,0.18)",
  },
  {
    id: 3,
    name: "Island Girl",
    sub: "Free & Sun-Kissed",
    slug: "island-girl",
    emoji: "🌊",
    desc: "Effortless layers, salt air & golden skin",
    tag: "New",
    img: "/images/IslandGirl.jpg",
    fallback: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80&auto=format&fit=crop",
    accent: "#a8c5a0",
    tint: "rgba(140,190,160,0.18)",
  },
  {
    id: 4,
    name: "Office Jewellery",
    sub: "Refined & Polished",
    slug: "office-jewellery",
    emoji: "💼",
    desc: "Power dressing starts with the right accent",
    tag: "Essential",
    img: "/images/office-jewellery.jpg",
    fallback: "https://images.unsplash.com/photo-1573408301185-9519f94f6e94?w=600&q=80&auto=format&fit=crop",
    accent: "#c9a96e",
    tint: "rgba(201,169,110,0.18)",
  },
  {
    id: 5,
    name: "Maximalist",
    sub: "Bold & Fearless",
    slug: "maximalist",
    emoji: "👑",
    desc: "More is more — stack, layer, conquer",
    tag: "Fan Fav",
    img: "/images/Maximalist.jpg",
    fallback: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80&auto=format&fit=crop",
    accent: "#d4af37",
    tint: "rgba(212,175,55,0.18)",
  },
  {
    id: 6,
    name: "Fairy Coded",
    sub: "Whimsical & Ethereal",
    slug: "fairy-coded",
    emoji: "🧚",
    desc: "Enchanted adornments from another realm",
    tag: "Magical",
    img: "/images/FairyCoded.jpg",
    fallback: "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=600&q=80&auto=format&fit=crop",
    accent: "#c4b8e8",
    tint: "rgba(190,170,230,0.18)",
  },
];

export default function ShopByStyle() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.04 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const updateScrollState = () => {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  };

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScrollState, { passive: true });
    updateScrollState();
    return () => el.removeEventListener("scroll", updateScrollState);
  }, []);

  const scroll = (dir: "left" | "right") => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "right" ? 320 : -320, behavior: "smooth" });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@300;400;500&display=swap');

        .sbs-wrap {
          background: #446c35bd;
          padding: 36px 0 40px;
          position: relative;
          overflow: hidden;
          font-family: 'Jost', sans-serif;
        }

        /* Soft ambient orbs */
        .sbs-wrap::before {
          content: '';
          position: absolute;
          width: 520px; height: 520px;
          top: -160px; right: -100px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(100,130,60,0.10) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }
        .sbs-wrap::after {
          content: '';
          position: absolute;
          width: 360px; height: 360px;
          bottom: -80px; left: -60px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(201,169,110,0.07) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }

        /* ── Header ── */
        .sbs-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 32px 32px;
          position: relative;
          z-index: 2;
        }

        .sbs-head-left {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .sbs-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 9px;
          font-weight: 500;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: #c9a86c;
          background: rgba(201,168,108,0.10);
          border: 1px solid rgba(201,168,108,0.22);
          padding: 5px 12px 4px;
          border-radius: 100px;
          width: fit-content;
          opacity: 0;
          transform: translateY(8px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .sbs-pill.on { opacity: 1; transform: translateY(0); }
        .sbs-pill-dot {
          width: 4px; height: 4px;
          border-radius: 50%;
          background: #c9a86c;
          box-shadow: 0 0 5px rgba(201,168,108,0.7);
        }

        .sbs-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(28px, 3.5vw, 46px);
          font-weight: 300;
          line-height: 1.08;
          color: #f5edd8;
          margin: 0;
          letter-spacing: -0.01em;
          opacity: 0;
          transform: translateY(14px);
          transition: opacity 0.75s ease 0.1s, transform 0.75s ease 0.1s;
        }
        .sbs-title.on { opacity: 1; transform: translateY(0); }
        .sbs-title em {
          font-style: italic;
          color: #c9a86c;
        }

        /* Nav arrows */
        .sbs-arrows {
          display: flex;
          gap: 8px;
          align-items: center;
          opacity: 0;
          transition: opacity 0.6s ease 0.3s;
          flex-shrink: 0;
        }
        .sbs-arrows.on { opacity: 1; }

        .sbs-arrow {
          width: 38px; height: 38px;
          border-radius: 50%;
          border: 1px solid rgba(201,168,108,0.3);
          background: rgba(255,255,255,0.04);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: border-color 0.25s ease, background 0.25s ease, transform 0.2s ease;
          color: #c9a86c;
          font-size: 14px;
          line-height: 1;
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
        }
        .sbs-arrow:hover:not(:disabled) {
          border-color: rgba(201,168,108,0.65);
          background: rgba(201,168,108,0.10);
          transform: scale(1.06);
        }
        .sbs-arrow:disabled {
          opacity: 0.25;
          cursor: not-allowed;
        }

        /* ── Scroll track ── */
        .sbs-track {
          display: flex;
          gap: 14px;
          overflow-x: auto;
          overflow-y: visible;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
          padding: 4px 32px 16px 48px;
          scroll-padding-left: 36px;
          scrollbar-width: none;
          position: relative;
          z-index: 2;
        }
        .sbs-track::-webkit-scrollbar { display: none; }

        /* ── Card ── */
        .sbs-card {
          flex: 0 0 220px;
          position: relative;
          overflow: hidden;
          cursor: pointer;
          border-radius: 10px;
          aspect-ratio: 3 / 4.2;
          border: 1px solid rgba(201,169,110,0.12);
          scroll-snap-align: start;
          opacity: 0;
          transform: translateY(24px) scale(0.97);
          transition:
            opacity 0.6s ease,
            transform 0.6s ease,
            border-color 0.35s ease,
            box-shadow 0.35s ease;
        }
        .sbs-card.on { opacity: 1; transform: translateY(0) scale(1); }
        .sbs-card:hover {
          border-color: rgba(201,169,110,0.4);
          box-shadow: 0 24px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(201,169,110,0.08);
          transform: translateY(-5px) scale(1.015) !important;
          z-index: 3;
        }

        @media (min-width: 640px) {
          .sbs-card { flex: 0 0 240px; }
        }
        @media (min-width: 1024px) {
          .sbs-card { flex: 0 0 260px; }
        }

        /* Photo */
        .card-photo {
          position: absolute;
          inset: 0;
          z-index: 0;
        }
        .card-photo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center top;
          transition: transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        .sbs-card:hover .card-photo img { transform: scale(1.09); }

        /* Overlays */
        .card-vignette {
          position: absolute;
          inset: 0;
          z-index: 1;
          background: linear-gradient(
            to top,
            rgba(6,9,3,0.97) 0%,
            rgba(6,9,3,0.60) 36%,
            rgba(6,9,3,0.18) 62%,
            rgba(6,9,3,0.06) 100%
          );
          transition: background 0.35s ease;
        }
        .sbs-card:hover .card-vignette {
          background: linear-gradient(
            to top,
            rgba(6,9,3,0.98) 0%,
            rgba(6,9,3,0.72) 44%,
            rgba(6,9,3,0.20) 68%,
            rgba(6,9,3,0.05) 100%
          );
        }

        .card-tint {
          position: absolute;
          inset: 0;
          z-index: 2;
          opacity: 0;
          transition: opacity 0.4s ease;
        }
        .sbs-card:hover .card-tint { opacity: 1; }

        /* Shimmer */
        .card-shimmer {
          position: absolute;
          inset: 0;
          z-index: 3;
          background: linear-gradient(118deg, transparent 30%, rgba(212,175,55,0.08) 50%, transparent 70%);
          transform: translateX(-110%);
          pointer-events: none;
        }
        .sbs-card:hover .card-shimmer { animation: shimmerSweep 0.6s ease forwards; }
        @keyframes shimmerSweep { to { transform: translateX(110%); } }

        /* Corner brackets */
        .card-corner {
          position: absolute;
          width: 12px; height: 12px;
          z-index: 6;
          opacity: 0;
          transition: opacity 0.3s ease, width 0.3s ease, height 0.3s ease;
        }
        .sbs-card:hover .card-corner { opacity: 1; width: 16px; height: 16px; }
        .cc-tl { top: 12px; left: 12px; border-top: 1px solid rgba(201,169,110,0.65); border-left: 1px solid rgba(201,169,110,0.65); }
        .cc-tr { top: 12px; right: 12px; border-top: 1px solid rgba(201,169,110,0.65); border-right: 1px solid rgba(201,169,110,0.65); }
        .cc-bl { bottom: 12px; left: 12px; border-bottom: 1px solid rgba(201,169,110,0.65); border-left: 1px solid rgba(201,169,110,0.65); }
        .cc-br { bottom: 12px; right: 12px; border-bottom: 1px solid rgba(201,169,110,0.65); border-right: 1px solid rgba(201,169,110,0.65); }

        /* Badge */
        .card-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          z-index: 7;
          font-size: 7px;
          font-weight: 500;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(6,9,3,0.9);
          background: #c9a86c;
          padding: 3px 9px 2px;
          border-radius: 2px;
        }

        /* Content */
        .card-content {
          position: absolute;
          inset: 0;
          z-index: 5;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 18px 16px 16px;
        }

        .card-emoji-wrap {
          width: 34px;
          height: 34px;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(201,169,110,0.18);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 10px;
          font-size: 16px;
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          transition: transform 0.35s ease, background 0.3s ease;
          flex-shrink: 0;
        }
        .sbs-card:hover .card-emoji-wrap {
          transform: scale(1.1) translateY(-2px);
          background: rgba(201,169,110,0.14);
        }

        .card-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(20px, 1.8vw, 24px);
          font-weight: 400;
          color: #f0e8d5;
          line-height: 1.1;
          margin: 0 0 3px;
        }

        .card-sub {
          font-size: 8px;
          font-weight: 400;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: #c9a86c;
          margin: 0;
          transition: margin-bottom 0.3s ease;
        }
        .sbs-card:hover .card-sub { margin-bottom: 8px; }

        .card-desc {
          font-size: 11px;
          font-weight: 300;
          color: rgba(230,215,185,0.55);
          line-height: 1.6;
          max-height: 0;
          overflow: hidden;
          opacity: 0;
          transform: translateY(6px);
          transition: max-height 0.35s ease, opacity 0.3s ease, transform 0.3s ease, margin-bottom 0.3s ease;
          margin-bottom: 0;
        }
        .sbs-card:hover .card-desc {
          max-height: 48px;
          opacity: 1;
          transform: translateY(0);
          margin-bottom: 12px;
        }

        .card-cta {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-size: 8px;
          font-weight: 500;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #c9a86c;
          opacity: 0;
          transform: translateY(5px);
          transition: opacity 0.25s ease 0.05s, transform 0.25s ease 0.05s;
          width: fit-content;
          border-bottom: 1px solid rgba(201,168,108,0.3);
          padding-bottom: 2px;
        }
        .sbs-card:hover .card-cta { opacity: 1; transform: translateY(0); }
        .cta-arrow { transition: transform 0.25s ease; font-size: 10px; }
        .sbs-card:hover .cta-arrow { transform: translateX(4px); }

        /* ── Scroll indicator ── */
        .sbs-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          padding: 0 32px;
          margin-top: 4px;
          position: relative;
          z-index: 2;
          opacity: 0;
          transition: opacity 0.6s ease 0.5s;
        }
        .sbs-indicator.on { opacity: 1; }
        .sbs-dot {
          width: 4px; height: 4px;
          border-radius: 50%;
          background: rgba(201,168,108,0.25);
          transition: background 0.3s ease, transform 0.3s ease;
        }
        .sbs-dot.active {
          background: #c9a86c;
          transform: scale(1.4);
        }

        /* Edge fade masks */
        .sbs-track-wrap {
          position: relative;
          z-index: 2;
        }
        .sbs-fade-right {
          position: absolute;
          right: 0; top: 0; bottom: 16px;
          width: 60px;
          background: linear-gradient(to left, rgba(50,80,30,0.7) 0%, transparent 100%);
          pointer-events: none;
          z-index: 4;
          transition: opacity 0.3s ease;
        }
        .sbs-fade-left {
          position: absolute;
          left: 0; top: 0; bottom: 16px;
          width: 60px;
          background: linear-gradient(to right, rgba(50,80,30,0.7) 0%, transparent 100%);
          pointer-events: none;
          z-index: 4;
          transition: opacity 0.3s ease;
        }

        @media (max-width: 480px) {
          .sbs-head { padding: 0 16px 28px; }
          .sbs-track { padding: 4px 16px 14px 24px; gap: 10px; scroll-padding-left: 20px; }
          .sbs-indicator { padding: 0 16px; }
          .sbs-card { flex: 0 0 200px; }
          .sbs-title { font-size: 26px; }
        }
      `}</style>

      <section className="sbs-wrap" ref={sectionRef} aria-label="Shop by Style">
        {/* Header row */}
        <div className="sbs-head">
          <div className="sbs-head-left">
            <div className={`sbs-pill${visible ? " on" : ""}`}>
              <span className="sbs-pill-dot" />
              Curated Collections
            </div>
            <h2 className={`sbs-title${visible ? " on" : ""}`}>
              Shop by <em>Your</em> Style
            </h2>
          </div>

          <div className={`sbs-arrows${visible ? " on" : ""}`} aria-label="Scroll styles">
            <button
              className="sbs-arrow"
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              aria-label="Scroll left"
            >
              ←
            </button>
            <button
              className="sbs-arrow"
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              aria-label="Scroll right"
            >
              →
            </button>
          </div>
        </div>

        {/* Track */}
        <div className="sbs-track-wrap">
          <div
            className="sbs-fade-left"
            style={{ opacity: canScrollLeft ? 1 : 0 }}
          />
          <div className="sbs-track" ref={trackRef}>
            {styles.map((s, i) => (
              <div
                key={s.id}
                className={`sbs-card${visible ? " on" : ""}`}
                style={{ transitionDelay: `${0.06 + i * 0.08}s` }}
                onClick={() => router.push(`/styles/${s.slug}`)}
                onMouseEnter={() => setHoveredId(s.id)}
                onMouseLeave={() => setHoveredId(null)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && router.push(`/styles/${s.slug}`)}
                aria-label={`Shop ${s.name} style`}
              >
                {/* Photo */}
                <div className="card-photo">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={s.img}
                    alt={s.name}
                    loading={i < 3 ? "eager" : "lazy"}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = s.fallback;
                    }}
                  />
                </div>

                <div className="card-vignette" />
                <div
                  className="card-tint"
                  style={{
                    background: `radial-gradient(ellipse at 50% 25%, ${s.tint} 0%, transparent 70%)`,
                  }}
                />
                <div className="card-shimmer" />

                <div className="card-corner cc-tl" />
                <div className="card-corner cc-tr" />
                <div className="card-corner cc-bl" />
                <div className="card-corner cc-br" />

                <span className="card-badge">{s.tag}</span>

                <div className="card-content">
                  <div className="card-emoji-wrap" aria-hidden="true">
                    {s.emoji}
                  </div>
                  <p className="card-name">{s.name}</p>
                  <p className="card-sub">{s.sub}</p>
                  <p className="card-desc">{s.desc}</p>
                  <div className="card-cta">
                    Explore
                    <span className="cta-arrow">→</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div
            className="sbs-fade-right"
            style={{ opacity: canScrollRight ? 1 : 0 }}
          />
        </div>

        {/* Dot indicators */}
        <div className={`sbs-indicator${visible ? " on" : ""}`} aria-hidden="true">
          {styles.map((s) => (
            <div
              key={s.id}
              className={`sbs-dot${hoveredId === s.id ? " active" : ""}`}
            />
          ))}
        </div>
      </section>
    </>
  );
}