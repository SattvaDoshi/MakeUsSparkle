
"use client";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { useGender } from "@/lib/genderContext";

const heroContent = {
  women: {
    image: "/trial.png",
    line1: "MAKE YOU",
    line2: "SPARKLE",
    tagline: (
      <>
        Even The Tiniest Piece<br />
        Of Jewelry Tells<br />
        <em>A Great Story</em>
      </>
    ),
    cta: "Shop Collection",
    ctaHref: "/shop",
    bgGradient: `
      radial-gradient(ellipse 70% 80% at 60% 50%, rgba(68,108,53,0.72) 0%, transparent 70%),
      radial-gradient(ellipse 50% 60% at 20% 80%, rgba(30,65,20,0.85) 0%, transparent 60%),
      linear-gradient(160deg, #1a3a10 0%, #2d6020 40%, #3a7228 65%, #1a3a10 100%)
    `,
  },
  men: {
    image: "/evanshiNew.png",
    fallback: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=1200&q=90",
    line1: "DEFINE YOUR",
    line2: "EDGE",
    tagline: (
      <>
        Bold Pieces For<br />
        The Modern Man<br />
        <em>Wear Your Story</em>
      </>
    ),
    cta: "Shop Men's",
    ctaHref: "/shop/men",
    bgGradient: `
      radial-gradient(ellipse 70% 80% at 55% 50%, rgba(40,68,53,0.72) 0%, transparent 70%),
      radial-gradient(ellipse 50% 60% at 20% 80%, rgba(15,40,30,0.9) 0%, transparent 60%),
      linear-gradient(160deg, #0e2218 0%, #1a3d2e 40%, #223d28 65%, #0e2218 100%)
    `,
  },
};

export default function Hero() {
  const { gender } = useGender();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const content = heroContent[gender];

  useEffect(() => {
    const el = headingRef.current;
    if (!el) return;
    el.style.opacity = "0";
    el.style.transform = "translateX(-50%) translateY(16px)";
    requestAnimationFrame(() => {
      el.style.transition = "opacity 0.9s ease 0.05s, transform 0.9s ease 0.05s";
      el.style.opacity = "1";
      el.style.transform = "translateX(-50%) translateY(0)";
    });
  }, [gender]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500&family=Montserrat:wght@300;400;500;600&display=swap');

        .hero-root {
          position: relative;
          width: 100%;
          height: 100svh;
          min-height: 620px;
          overflow: hidden;
          display: flex;
          align-items: stretch;
          transition: background 0.8s ease;
        }

        .hero-bg-overlay {
          position: absolute;
          inset: 0;
          z-index: 1;
          transition: background 0.8s ease;
        }

        .hero-grain {
          position: absolute;
          inset: 0;
          z-index: 2;
          opacity: 0.045;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          background-size: 200px 200px;
          pointer-events: none;
        }

        /* ── CIRCLES ── */
        .hero-circle {
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgba(201, 168, 76, 0.11);
          pointer-events: none;
          z-index: 2;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
        .hero-circle-1 { width: 520px; height: 520px; animation: ringPulse 6s ease-in-out infinite; }
        .hero-circle-2 { width: 740px; height: 740px; opacity: 0.6; animation: ringPulse 6s ease-in-out 1.5s infinite; }
        .hero-circle-3 { width: 960px; height: 960px; opacity: 0.3; animation: ringPulse 6s ease-in-out 3s infinite; }

        /* ── PARTICLES ── */
        .hero-particle {
          position: absolute;
          width: 4px; height: 4px;
          border-radius: 50%;
          background: #c9a84c;
          z-index: 4;
          pointer-events: none;
          opacity: 0;
        }
        .hero-particle-1 { top: 22%; left: 12%; animation: floatDot 7s ease-in-out 0.2s infinite; }
        .hero-particle-2 { top: 38%; right: 14%; width: 3px; height: 3px; animation: floatDot 9s ease-in-out 1.1s infinite; }
        .hero-particle-3 { top: 68%; left: 18%; width: 3px; height: 3px; animation: floatDot 8s ease-in-out 0.7s infinite; }
        .hero-particle-4 { top: 55%; right: 9%; animation: floatDot 10s ease-in-out 2s infinite; }
        .hero-particle-5 { top: 15%; right: 22%; width: 2px; height: 2px; animation: floatDot 6.5s ease-in-out 1.8s infinite; }

        /* ── MODEL ── */
        .hero-model-wrap {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          height: 96%;
          aspect-ratio: 3 / 4;
          z-index: 6;
          display: flex;
          align-items: flex-end;
          transition: opacity 0.5s ease;
        }
        .hero-model-img {
          object-fit: cover;
          object-position: top center;
          width: 100%;
          height: 100%;
          -webkit-mask-image: linear-gradient(to bottom, black 55%, transparent 100%);
          mask-image: linear-gradient(to bottom, black 55%, transparent 100%);
        }

        /*
          ── LARGE HEADING ──
          Centred horizontally at every breakpoint using left:50% + translateX(-50%).
          text-align:center + align-items:center on the flex container ensure both
          lines sit in the middle of the viewport regardless of screen width.
        */
        .hero-heading {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 700;
          font-size: clamp(3.8rem, 10vw, 9.5rem);
          line-height: 0.88;
          letter-spacing: -0.01em;
          position: absolute;
          top: 10%;
          left: 50%;
          transform: translateX(-50%);
          width: 100%;
          text-align: center;
          z-index: 5;
          pointer-events: none;
          user-select: none;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.05em;
          padding: 0 16px;
          box-sizing: border-box;
        }
        .hero-heading .line1 {
          font-weight: 600;
          color: rgba(255, 255, 255, 0.55);
        }
        .hero-heading .line2 {
          font-weight: 700;
          color: #c9a84c;
          text-shadow: 0 0 28px rgba(201, 168, 76, 0.35), 0 2px 0 rgba(0, 0, 0, 0.3);
        }

        /* ── RIGHT CONTENT ── */
        .hero-content-right {
          position: absolute;
          top: 50%;
          right: 8%;
          transform: translateY(-40%);
          z-index: 5;
          max-width: 260px;
          animation: fadeUp 1s ease 0.9s both;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 20px;
        }
        .hero-tagline {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(1.3rem, 2.4vw, 2rem);
          font-weight: 400;
          font-style: italic;
          color: rgba(255, 255, 255, 0.88);
          line-height: 1.38;
          margin: 0;
        }
        .hero-tagline em {
          font-style: normal;
          color: #c9a84c;
        }

        .hero-divider {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
        }
        .hero-divider-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(201, 168, 76, 0.55), transparent);
        }
        .hero-divider-gem {
          color: #c9a84c;
          font-size: 0.55rem;
          flex-shrink: 0;
          opacity: 0.85;
        }

        .hero-cta {
          font-family: 'Montserrat', sans-serif;
          font-size: 0.58rem;
          font-weight: 600;
          letter-spacing: 0.26em;
          text-transform: uppercase;
          color: #c9a84c;
          background: transparent;
          border: 1px solid rgba(201, 168, 76, 0.5);
          padding: 12px 24px;
          border-radius: 1px;
          cursor: pointer;
          text-decoration: none;
          display: inline-block;
          position: relative;
          overflow: hidden;
          transition: color 0.35s ease;
          z-index: 0;
        }
        .hero-cta::before {
          content: '';
          position: absolute;
          inset: 0;
          background: #c9a84c;
          transform: translateX(-101%);
          transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: -1;
        }
        .hero-cta:hover { color: #0d2614; }
        .hero-cta:hover::before { transform: translateX(0); }

        /* ── STARS ── */
        .hero-star {
          position: absolute;
          color: #c9a84c;
          z-index: 5;
          font-size: 1.4rem;
          animation: spinStar 12s linear infinite;
          pointer-events: none;
        }
        .hero-star-1 { right: 7%; bottom: 28%; }
        .hero-star-2 { left: 3.5%; top: 28%; font-size: 0.9rem; animation-direction: reverse; }

        /* ── SCROLL INDICATOR ── */
        .hero-scroll {
          position: absolute;
          bottom: 36px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 5;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          animation: fadeUp 1s ease 1.3s both;
        }
        .hero-scroll-line {
          width: 1px;
          height: 40px;
          background: linear-gradient(to bottom, rgba(201, 168, 76, 0.6), transparent);
          animation: scrollPulse 2s ease-in-out infinite;
        }
        .hero-scroll-label {
          font-family: 'Montserrat', sans-serif;
          font-size: 0.45rem;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.35);
          writing-mode: vertical-rl;
          text-orientation: mixed;
          transform: rotate(180deg);
        }

        /* ── KEYFRAMES ── */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spinStar {
          from { transform: rotate(0deg) scale(1); }
          50%  { transform: rotate(180deg) scale(1.15); }
          to   { transform: rotate(360deg) scale(1); }
        }
        @keyframes scrollPulse {
          0%, 100% { opacity: 0.4; }
          50%       { opacity: 1; }
        }
        @keyframes ringPulse {
          0%, 100% { opacity: 0.4; transform: translate(-50%, -50%) scale(1); }
          50%       { opacity: 0.9; transform: translate(-50%, -50%) scale(1.015); }
        }
        @keyframes floatDot {
          0%   { opacity: 0; transform: translateY(0px); }
          15%  { opacity: 0.7; }
          50%  { opacity: 0.5; transform: translateY(-18px); }
          85%  { opacity: 0.7; }
          100% { opacity: 0; transform: translateY(0px); }
        }

        /* ════════ LAPTOP ≤ 1280px ════════ */
        @media (max-width: 1280px) {
          .hero-model-wrap { height: 92%; left: 48%; }
          .hero-content-right { right: 4%; max-width: 230px; gap: 16px; }
          .hero-heading {
            font-size: clamp(3.2rem, 8.5vw, 8rem);
            top: 8%;
            /* Keep centred — left:50% + translateX(-50%) is set on the base rule */
          }
          .hero-circle-1 { width: 420px; height: 420px; }
          .hero-circle-2 { width: 600px; height: 600px; }
          .hero-circle-3 { width: 780px; height: 780px; }
        }

        /* ════════ TABLET ≤ 1024px ════════ */
        @media (max-width: 1024px) {
          .hero-root { min-height: 700px; }
          .hero-heading {
            top: 8%;
            font-size: clamp(3rem, 9vw, 6rem);
          }
          .hero-model-wrap {
            left: 50%;
            transform: translateX(-50%);
            height: 82%;
            width: 56%;
            aspect-ratio: unset;
          }
          .hero-content-right {
            top: auto;
            bottom: 6%;
            left: 7%;
            right: auto;
            transform: none;
            max-width: 340px;
            gap: 14px;
            align-items: flex-start;
          }
          .hero-tagline { font-size: clamp(1.1rem, 2.2vw, 1.5rem); }
          .hero-star-1 { right: 5%; bottom: 12%; }
          .hero-star-2 { left: 3%; top: 20%; }
          .hero-circle-1 { width: 360px; height: 360px; }
          .hero-circle-2 { width: 520px; height: 520px; }
          .hero-circle-3 { width: 680px; height: 680px; }
          .hero-particle-3 { display: none; }
          .hero-particle-4 { display: none; }
        }

        /* ════════ TABLET PORTRAIT ≤ 768px ════════ */
        @media (max-width: 768px) {
          .hero-root { min-height: 660px; }
          .hero-heading {
            top: 8%;
            font-size: clamp(2.8rem, 10vw, 5rem);
            /* Remains centred via inherited left:50% + translateX(-50%) */
          }
          .hero-model-wrap { height: 78%; width: 70%; }
          .hero-content-right { bottom: 5%; left: 4%; max-width: 300px; gap: 12px; }
          .hero-tagline { font-size: clamp(1rem, 3vw, 1.3rem); }
          .hero-star-1 { right: 4%; bottom: 10%; font-size: 1.1rem; }
          .hero-star-2 { display: none; }
          .hero-scroll { display: none; }
          .hero-circle-1 { width: 300px; height: 300px; }
          .hero-circle-2 { width: 440px; height: 440px; }
          .hero-circle-3 { width: 580px; height: 580px; }
          .hero-particle-5 { display: none; }
        }

        /* ════════ MOBILE ≤ 640px ════════ */
        @media (max-width: 640px) {
          .hero-root { min-height: 100svh; height: 100svh; }

          .hero-heading {
            /*
              On mobile the nav is 60px + gender bar is ~44px = 104px total chrome.
              Push heading down so it clears the gender bar.
            */
            top: 100px;
            font-size: clamp(2.6rem, 11vw, 3.6rem);
            width: 100%;
            padding: 0 12px;
            /* left:50% + translateX(-50%) inherited — perfectly centred */
          }

          .hero-model-wrap {
            left: 50%;
            transform: translateX(-50%);
            height: 80%;
            width: 100%;
            aspect-ratio: unset;
          }
          .hero-model-img {
            object-position: top center;
            -webkit-mask-image: linear-gradient(to bottom, black 50%, transparent 100%);
            mask-image: linear-gradient(to bottom, black 50%, transparent 100%);
          }

          /* Content centred at bottom on mobile */
          .hero-content-right {
            top: auto;
            bottom: 5%;
            left: 40%;
            right: auto;
            transform: translateX(-50%);
            max-width: 280px;
            width: 85%;
            align-items: center;
            text-align: center;
            gap: 12px;
          }
          .hero-tagline { font-size: clamp(1rem, 4.5vw, 1.2rem); }
          .hero-cta { font-size: 0.55rem; padding: 11px 22px; }
          .hero-star-1 { display: none; }
          .hero-star-2 { display: none; }
          .hero-scroll { display: none; }
          .hero-circle-1 { width: 240px; height: 240px; }
          .hero-circle-2 { width: 360px; height: 360px; }
          .hero-circle-3 { width: 480px; height: 480px; }
          .hero-particle-1, .hero-particle-2,
          .hero-particle-3, .hero-particle-4,
          .hero-particle-5 { display: none; }
        }

        /* ════════ SMALL MOBILE ≤ 390px ════════ */
        @media (max-width: 390px) {
          .hero-heading {
            font-size: clamp(2rem, 12vw, 2.8rem);
            top: 90px;
          }
          .hero-content-right {
            bottom: 4%;
            max-width: 240px;
            gap: 10px;
          }
          .hero-tagline { font-size: 0.95rem; }
        }
      `}</style>

      <section
        className="hero-root"
        style={{ background: gender === "men" ? "#0e2218" : "#1a3a10" }}
      >
        <div className="hero-bg-overlay" style={{ background: content.bgGradient }} />
        <div className="hero-grain" />

        <div className="hero-circle hero-circle-1" />
        <div className="hero-circle hero-circle-2" />
        <div className="hero-circle hero-circle-3" />

        <div className="hero-particle hero-particle-1" />
        <div className="hero-particle hero-particle-2" />
        <div className="hero-particle hero-particle-3" />
        <div className="hero-particle hero-particle-4" />
        <div className="hero-particle hero-particle-5" />

        <h1 className="hero-heading" ref={headingRef}>
          <span className="line1">{content.line1}</span>
          <span className="line2">{content.line2}</span>
        </h1>

        <div className="hero-model-wrap">
          <Image
            src={content.image}
            alt={gender === "men" ? "Model wearing men's jewellery" : "Model wearing jewellery"}
            fill
            priority
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 70vw, (max-width: 1024px) 56vw, 55vw"
            className="hero-model-img"
            onError={(e) => {
              if ("fallback" in content && content.fallback) {
                (e.target as HTMLImageElement).src = content.fallback as string;
              }
            }}
          />
        </div>

        <span className="hero-star hero-star-1" aria-hidden="true">✦</span>
        <span className="hero-star hero-star-2" aria-hidden="true">✦</span>

        <div className="hero-content-right">
          <p className="hero-tagline">{content.tagline}</p>
          <div className="hero-divider">
            <div className="hero-divider-line" />
            <span className="hero-divider-gem">◆</span>
            <div className="hero-divider-line" />
          </div>
          <a href={content.ctaHref} className="hero-cta">{content.cta}</a>
        </div>

        <div className="hero-scroll" aria-hidden="true">
          <div className="hero-scroll-line" />
          <span className="hero-scroll-label">Scroll</span>
        </div>
      </section>
    </>
  );
}