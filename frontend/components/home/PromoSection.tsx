"use client";
import { useState, useEffect, useCallback } from "react";
import type { CSSProperties, ReactNode } from "react";
import { getApiUrl } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";

type PatternKey = "circles" | "dots" | "lines";

interface BannerItem {
  id: number;
  tag: string;
  title: string;
  subtitle: string;
  cta: string;
  bg: string;
  textDark: boolean;
  pattern: PatternKey;
  imageSrc: string;
  imageAlt: string;
  titleColor: string;
  subtitleColor: string;
  tagColor: string;
  ctaBorderColor: string;
  ctaTextColor: string;
  link?: string;
}

type BannerTheme = Pick<
  BannerItem,
  | "bg"
  | "textDark"
  | "pattern"
  | "titleColor"
  | "subtitleColor"
  | "tagColor"
  | "ctaBorderColor"
  | "ctaTextColor"
>;

type ApiBanner = {
  _id: string;
  text?: string;
  title?: string;
  subtitle?: string;
  tag?: string;
  cta?: string;
  link?: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  isActive?: boolean;
  sortOrder?: number;
};

type PublicBannersResponse = {
  success: boolean;
  banners: ApiBanner[];
};

/* ─────────────────────────────────────────────
   THEMES — alternate green → beige → green → beige
   (green is the existing one, unchanged)
───────────────────────────────────────────── */
const GREEN_THEME: BannerTheme = {
  bg: "linear-gradient(135deg, #b8c9a3 0%, #8fa870 40%, #6b7c45 100%)",
  textDark: false,
  pattern: "dots",
  titleColor: "#fdf6e9",
  subtitleColor: "rgba(253,246,233,0.75)",
  tagColor: "#fdf6e9",
  ctaBorderColor: "rgba(253,246,233,0.5)",
  ctaTextColor: "#fdf6e9",
};

const BEIGE_THEME: BannerTheme = {
  bg: "linear-gradient(135deg, #f7efe0 0%, #efe2c8 50%, #e4d2ae 100%)",
  textDark: true,
  pattern: "lines",
  titleColor: "#1a0d00",
  subtitleColor: "rgba(40,20,0,0.7)",
  tagColor: "#5c3a00",
  ctaBorderColor: "rgba(90,50,0,0.55)",
  ctaTextColor: "#1a0d00",
};

const bannerThemes: BannerTheme[] = [GREEN_THEME, BEIGE_THEME];

const fallbackBanners: BannerItem[] = [
  {
    id: 1,
    tag: "New Launch",
    title: "Pinteresty Necklaces",
    subtitle: "Dainty chains you've been dreaming of",
    cta: "Shop Now",
    imageSrc: "/images/hero.png",
    imageAlt: "Pinteresty Necklaces Collection",
    ...bannerThemes[0],
  },
  {
    id: 2,
    tag: "Bestseller",
    title: "Anti-Tarnish Collection",
    subtitle: "Wear it every day, forever gold",
    cta: "Explore",
    imageSrc: "/images/hero.png",
    imageAlt: "Anti-Tarnish Collection",
    ...bannerThemes[1],
  },
  {
    id: 3,
    tag: "Limited Edition",
    title: "Stack & Layer",
    subtitle: "Build your perfect arm party",
    cta: "Shop Bracelets",
    imageSrc: "/images/hero.png",
    imageAlt: "Stack and Layer Bracelets",
    ...bannerThemes[0],
  },
  {
    id: 4,
    tag: "Trending",
    title: "Ring Obsessed",
    subtitle: "Stack every finger, no rules",
    cta: "Shop Rings",
    imageSrc: "/images/hero.png",
    imageAlt: "Ring Obsessed Collection",
    ...bannerThemes[1],
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
      style={{ position: "absolute", inset: 0, opacity: 0.08 }}>
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

const mapApiBanner = (banner: ApiBanner, index: number): BannerItem => {
  const theme = bannerThemes[index % bannerThemes.length];
  const title = (banner.title || banner.text || "Featured Collection").trim();
  const subtitle = (banner.subtitle || banner.description || "Discover our latest handcrafted pieces").trim();

  return {
    id: index + 1,
    tag: (banner.tag || "Featured").trim(),
    title,
    subtitle,
    cta: (banner.cta || "Shop Now").trim(),
    imageSrc: (banner.image || "/images/hero.png").trim(),
    imageAlt: (banner.imageAlt || title).trim(),
    link: (banner.link || "").trim(),
    ...theme,
  };
};

/* ─────────────────────────────────────────────
   SlideLink — used for BOTH the image and the CTA
   so they always go to the same place.
   Internal paths use next/link, full URLs use <a>.
───────────────────────────────────────────── */
function SlideLink({
  href,
  className,
  style,
  ariaLabel,
  children,
}: {
  href?: string;
  className?: string;
  style?: CSSProperties;
  ariaLabel?: string;
  children: ReactNode;
}) {
  if (!href) {
    return (
      <span className={className} style={style}>
        {children}
      </span>
    );
  }

  if (/^https?:\/\//i.test(href)) {
    return (
      <a href={href} className={className} style={style} aria-label={ariaLabel}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className} style={style} aria-label={ariaLabel}>
      {children}
    </Link>
  );
}

export default function BannerSlider() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [liveBanners, setLiveBanners] = useState<BannerItem[]>([]);

  const displayBanners = liveBanners.length > 0 ? liveBanners : fallbackBanners;

  useEffect(() => {
    let ignore = false;

    const loadBanners = async () => {
      try {
        const response = await fetch(getApiUrl("/banners"));
        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as PublicBannersResponse;
        const mapped = (data.banners || []).filter((entry) => entry?.isActive !== false).map(mapApiBanner);

        if (!ignore && mapped.length > 0) {
          setLiveBanners(mapped);
        }
      } catch {
        // Keep fallback banners on request errors.
      }
    };

    void loadBanners();

    return () => {
      ignore = true;
    };
  }, []);

  const goTo = useCallback((idx: number) => setCurrent(idx), []);
  const next = useCallback(() => setCurrent((c) => (c + 1) % displayBanners.length), [displayBanners.length]);
  const prev_ = useCallback(() => setCurrent((c) => (c - 1 + displayBanners.length) % displayBanners.length), [displayBanners.length]);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(next, INTERVAL);
    return () => clearInterval(t);
  }, [next, paused]);

  const safeCurrent = current % displayBanners.length;
  const b = displayBanners[safeCurrent];
  const PatternComp = Patterns[b.pattern];
  const patternColor = b.textDark ? "#3b2000" : "#ffffff";
  const dividerColor = b.textDark ? "rgba(40,20,0,0.25)" : "rgba(253,246,233,0.25)";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400;1,500;1,600&family=Jost:wght@200;300;400;500&display=swap');

        .bs-section, .bs-section *, .bs-section *::before, .bs-section *::after { box-sizing: border-box; }

        /* ── Section ── */
        .bs-section {
          background: #f9f5ef;
          padding: 52px 0 60px;
          font-family: 'Jost', sans-serif;
          overflow-x: hidden;
        }

        /* ── Eyebrow ── */
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
        .bs-heading {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(26px, 3.5vw, 40px);
          font-weight: 500; color: #2c3320; margin: 0; letter-spacing: 0.5px;
        }
        .bs-heading em { font-style: italic; color: #000000; font-weight: 500 }

        /* ── Outer wrapper ── */
        .bs-wrap { max-width: 1180px; margin: 0 auto; padding: 0 24px; }

        /* ── Card ── */
        .bs-track {
          position: relative; width: 100%;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0,0,0,0.04), 0 24px 64px rgba(0,0,0,0.14);
        }

        /* ── Slide: column layout ── */
        .bs-slide {
          position: relative;
          width: 100%;
          display: flex;
          flex-direction: column;
        }

        /* ═══════════════════════════════════
           IMAGE ZONE
        ═══════════════════════════════════ */
        .bs-image-zone {
          position: relative;
          width: 100%;
          height: 460px;
          overflow: hidden;
          flex-shrink: 0;
          background: #e9e2d3;
        }

        /* Clickable image — covers the whole zone */
        .bs-image-link {
          position: absolute;
          inset: 0;
          display: block;
          z-index: 1;
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
        }
        span.bs-image-link { cursor: default; }

        .bs-image-link img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center top;
          display: block;
          transition: transform 0.6s ease;
        }
        a.bs-image-link:hover img { transform: scale(1.03); }
        a.bs-image-link:focus-visible {
          outline: 2px solid #6b7c45;
          outline-offset: -4px;
        }

        /* Subtle top-edge vignette only */
        .bs-image-zone::before {
          content: '';
          position: absolute; inset: 0; z-index: 2; pointer-events: none;
          background: linear-gradient(
            to bottom,
            rgba(0,0,0,0.12) 0%,
            transparent 18%,
            transparent 100%
          );
        }

        /* ── Progress bar ── */
        .bs-progress {
          position: absolute; bottom: 0; left: 0; height: 3px;
          background: rgba(255,255,255,0.7); border-radius: 0 2px 0 0;
          animation: bsProgress ${INTERVAL}ms linear; z-index: 10;
          pointer-events: none;
        }
        @keyframes bsProgress { from { width: 0; } to { width: 100%; } }

        /* ═══════════════════════════════════
           TEXT ZONE — horizontal bar
           [TAG] | [TITLE] | [SUBTITLE flex] [CTA]
        ═══════════════════════════════════ */
        .bs-text-zone {
          position: relative;
          width: 100%;
          min-height: 108px;
          display: flex;
          flex-direction: row;
          align-items: center;
          overflow: hidden;
          padding: 0 32px;
        }

        .bs-text-pattern {
          position: absolute; inset: 0; z-index: 0; pointer-events: none;
        }

        /* — TAG — */
        .bs-bar-tag {
          position: relative; z-index: 1;
          display: flex; flex-direction: column; justify-content: center; gap: 3px;
          flex-shrink: 0;
          padding-right: 24px;
        }
        .bs-bar-tag-label {
          font-size: 10px; font-weight: 400; letter-spacing: 4px;
          text-transform: uppercase;
          display: flex; align-items: center; gap: 6px;
          white-space: nowrap;
        }
        .bs-bar-tag-dot {
          width: 4px; height: 4px; border-radius: 50%; flex-shrink: 0;
        }

        /* — Divider — */
        .bs-bar-divider {
          width: 1px; height: 50px; flex-shrink: 0;
          position: relative; z-index: 1;
        }

        /* — TITLE — */
        .bs-bar-title-block {
          position: relative; z-index: 1;
          display: flex; align-items: center;
          padding: 0 24px;
          flex-shrink: 0;
        }
        .bs-bar-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(20px, 2vw, 28px);
          font-weight: 700; line-height: 1.1; margin: 0;
          white-space: nowrap;
        }

        /* — SUBTITLE — takes all remaining space — */
        .bs-bar-subtitle-block {
          position: relative; z-index: 1;
          padding: 0 24px;
          flex: 1;
          display: flex; align-items: center;
          min-width: 0;
        }
        .bs-bar-subtitle {
          font-size: clamp(11px, 1vw, 13px);
          font-weight: 500; line-height: 1.55;
          letter-spacing: 0.3px; margin: 0;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        /* — CTA — */
        .bs-bar-cta-block {
          position: relative; z-index: 1;
          flex-shrink: 0;
          padding-left: 24px;
        }
        .bs-cta {
          display: inline-flex; align-items: center; gap: 10px;
          font-family: 'Jost', sans-serif;
          font-size: 9px; font-weight: 400; letter-spacing: 3.5px;
          text-transform: uppercase; text-decoration: none;
          padding: 12px 22px; border-radius: 2px; border: 1.5px solid;
          cursor: pointer; background: transparent;
          transition: background 0.22s ease;
          position: relative; overflow: hidden; white-space: nowrap;
        }
        span.bs-cta { cursor: default; }
        .bs-cta::before {
          content: ''; position: absolute; inset: 0;
          background: currentColor; opacity: 0;
          transition: opacity 0.22s ease;
        }
        .bs-cta:hover::before { opacity: 0.1; }
        .bs-cta-arrow {
          width: 14px; height: 1px; background: currentColor;
          position: relative; transition: width 0.22s ease; flex-shrink: 0;
        }
        .bs-cta:hover .bs-cta-arrow { width: 22px; }
        .bs-cta-arrow::after {
          content: ''; position: absolute; right: 0; top: -3px;
          width: 6px; height: 6px;
          border-right: 1.5px solid currentColor;
          border-top: 1.5px solid currentColor;
          transform: rotate(45deg);
        }

        /* ── Navigation ── */
        .bs-nav {
          display: flex; align-items: center; justify-content: center;
          gap: 24px; margin-top: 22px; flex-wrap: nowrap;
        }
        .bs-nav-controls { display: flex; align-items: center; gap: 10px; }
        .bs-nav-arrow {
          width: 28px; height: 28px; border-radius: 50%;
          border: 1px solid rgba(107,124,69,0.35); background: transparent;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.2s ease;
          color: #4e6035; flex-shrink: 0;
        }
        .bs-nav-arrow:hover {
          background: #4e6035; border-color: #4e6035; color: #fdf6e9;
          transform: scale(1.1);
        }
        .bs-nav-arrow:active { transform: scale(0.94); }
        .bs-nav-arrow svg { width: 13px; height: 13px; }

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
          font-size: 11px; font-weight: 300; letter-spacing: 2px; color: #8fa870; margin: 0;
        }
        .bs-counter span { color: #3b4a2f; font-weight: 400; }

        /* ── Thumbnails ── */
        .bs-thumbs {
          display: flex; gap: 10px; justify-content: center; margin-top: 12px; flex-wrap: wrap;
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
          text-align: center; padding: 2px;
          font-family: 'Jost', sans-serif;
          overflow: hidden;
        }

        /* ════════════════════════════
           RESPONSIVE
        ════════════════════════════ */

        /* Laptop / small desktop ≤ 1100px */
        @media (max-width: 1100px) {
          .bs-image-zone { height: 400px; }
          .bs-text-zone { padding: 0 24px; }
          .bs-bar-tag { padding-right: 18px; }
          .bs-bar-title-block { padding: 0 18px; }
          .bs-bar-subtitle-block { padding: 0 18px; }
          .bs-bar-cta-block { padding-left: 18px; }
          .bs-bar-tag-label { letter-spacing: 3px; }
        }

        /* Tablet ≤ 900px — switch to compact 2-row grid so nothing is squeezed */
        @media (max-width: 900px) {
          .bs-image-zone { height: 340px; }

          .bs-text-zone {
            display: grid;
            grid-template-columns: auto 1fr auto;
            grid-template-areas:
              "tag   title title"
              "sub   sub   cta";
            align-items: center;
            column-gap: 14px;
            row-gap: 8px;
            padding: 16px 22px 18px;
            min-height: unset;
          }

          .bs-bar-divider { display: none !important; }

          .bs-bar-tag { grid-area: tag; padding-right: 0; }
          .bs-bar-tag-label { font-size: 11px; letter-spacing: 3px; font-weight: 400; }

          .bs-bar-title-block {
            grid-area: title;
            padding: 0;
            justify-self: end;
            min-width: 0;
          }
          .bs-bar-title {
            font-size: 24px;
            white-space: normal;
            text-align: right;
          }

          .bs-bar-subtitle-block { grid-area: sub; padding: 0; }
          .bs-bar-subtitle { font-size: 13px; -webkit-line-clamp: 2; }

          .bs-bar-cta-block { grid-area: cta; padding-left: 0; justify-self: end; }
          .bs-cta { padding: 10px 18px; font-size: 9px; letter-spacing: 3px; }
        }

        /* Large phone ≤ 640px */
        @media (max-width: 640px) {
          .bs-section { padding: 40px 0 48px; }
          .bs-image-zone { height: 280px; }
          .bs-text-zone { padding: 14px 18px 16px; column-gap: 10px; row-gap: 6px; }
          .bs-bar-tag-label { font-size: 10px; letter-spacing: 2.5px; }
          .bs-bar-title { font-size: 20px; }
          .bs-bar-subtitle { font-size: 12.5px; -webkit-line-clamp: 1; }
          .bs-cta { padding: 8px 14px; font-size: 8px; letter-spacing: 2px; }
          .bs-cta-arrow { display: none; }
        }

        /* Phone ≤ 480px */
        @media (max-width: 480px) {
          .bs-section { padding: 32px 0 40px; }
          .bs-wrap { padding: 0 14px; }
          .bs-image-zone { height: 230px; }

          .bs-text-zone { padding: 12px 14px 14px; column-gap: 8px; row-gap: 5px; }
          .bs-bar-tag-label { font-size: 9.5px; letter-spacing: 2px; font-weight: 400; }
          .bs-bar-title { font-size: 18px; }
          .bs-bar-subtitle { font-size: 12px; }
          .bs-cta { padding: 7px 12px; font-size: 7.5px; letter-spacing: 1.5px; }

          .bs-nav { gap: 12px; margin-top: 14px; }
          .bs-nav-controls { gap: 8px; }
          .bs-nav-arrow { width: 24px; height: 24px; }
          .bs-nav-arrow svg { width: 11px; height: 11px; }

          .bs-counter { font-size: 10px; }
          .bs-thumbs { display: none; }
          .bs-eyebrow { margin-bottom: 18px; padding: 0 14px; }
          .bs-heading { font-size: clamp(20px, 5vw, 28px); }
        }

        /* Small phone ≤ 380px */
        @media (max-width: 380px) {
          .bs-image-zone { height: 200px; }
          .bs-text-zone { padding: 10px 12px 12px; }
          .bs-bar-title { font-size: 17px; }
          .bs-bar-subtitle { font-size: 11.5px; }
          .bs-nav { gap: 8px; }
        }

        /* Touch devices: no hover zoom */
        @media (hover: none) {
          a.bs-image-link:hover img { transform: none; }
        }
      `}</style>

      <section
        className="bs-section"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* ── Eyebrow ── */}
        <div className="bs-eyebrow">
          <div className="bs-eyebrow-line">
            <div className="bs-eyebrow-rule" />
            <div className="bs-eyebrow-dot" />
            <div className="bs-eyebrow-rule" />
          </div>
          <h2 className="bs-heading">What&apos;s <em>Hot</em> Right Now</h2>
        </div>

        <div className="bs-wrap">
          <div className="bs-track">
            <div className="bs-slide">

              {/* ══ IMAGE ZONE — clickable, goes to the same link as the CTA ══ */}
              <div className="bs-image-zone">
                <SlideLink
                  href={b.link}
                  className="bs-image-link"
                  ariaLabel={`${b.cta}: ${b.title}`}
                >
                  <Image src={b.imageSrc} alt={b.imageAlt} fill sizes="(max-width: 1180px) 100vw, 1180px" />
                </SlideLink>
                {!paused && <div key={`prog-${safeCurrent}`} className="bs-progress" />}
              </div>

              {/* ══ TEXT ZONE — horizontal bar ══ */}
              <div className="bs-text-zone" style={{ background: b.bg }}>

                {/* Decorative pattern */}
                <div className="bs-text-pattern">
                  <PatternComp color={patternColor} />
                </div>

                {/* TAG */}
                <div className="bs-bar-tag">
                  <div className="bs-bar-tag-label" style={{ color: b.tagColor }}>
                    <div className="bs-bar-tag-dot" style={{ background: b.tagColor }} />
                    {b.tag}
                  </div>
                </div>

                {/* DIVIDER 1 */}
                <div className="bs-bar-divider" style={{ background: dividerColor }} />

                {/* TITLE */}
                <div className="bs-bar-title-block">
                  <h3 className="bs-bar-title" style={{ color: b.titleColor }}>
                    {b.title}
                  </h3>
                </div>

                {/* DIVIDER 2 */}
                <div className="bs-bar-divider" style={{ background: dividerColor }} />

                {/* SUBTITLE */}
                <div className="bs-bar-subtitle-block">
                  <p className="bs-bar-subtitle" style={{ color: b.subtitleColor }}>
                    {b.subtitle}
                  </p>
                </div>

                {/* CTA */}
                <div className="bs-bar-cta-block">
                  <SlideLink
                    href={b.link}
                    className="bs-cta"
                    style={{ color: b.ctaTextColor, borderColor: b.ctaBorderColor }}
                  >
                    {b.cta}
                    <span className="bs-cta-arrow" />
                  </SlideLink>
                </div>

              </div>{/* /bs-text-zone */}

            </div>{/* /bs-slide */}
          </div>{/* /bs-track */}

          {/* ── Navigation ── */}
          <div className="bs-nav">

            <div className="bs-dots">
              {displayBanners.map((_, i) => (
                <button key={i} className={`bs-dot ${i === safeCurrent ? "active" : ""}`}
                  onClick={() => goTo(i)} aria-label={`Go to slide ${i + 1}`}>
                  <div className="bs-dot-inner" />
                </button>
              ))}
            </div>

            <div className="bs-nav-controls">
              <button className="bs-nav-arrow" onClick={prev_} aria-label="Previous">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>

              <p className="bs-counter">
                <span>{String(safeCurrent + 1).padStart(2, "0")}</span>
                {" / "}
                {String(displayBanners.length).padStart(2, "0")}
              </p>

              <button className="bs-nav-arrow" onClick={next} aria-label="Next">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>

          </div>

          {/* ── Thumbnails ── */}
          <div className="bs-thumbs">
            {displayBanners.map((bn, i) => (
              <div key={i} className={`bs-thumb ${i === safeCurrent ? "active" : ""}`}
                onClick={() => goTo(i)}>
                <div className="bs-thumb-bg" style={{ background: bn.bg }} />
                <div className="bs-thumb-label" style={{ color: bn.textDark ? "#1a0d00" : "rgba(255,255,255,0.95)" }}>
                  {bn.title.split("\n")[0]}
                </div>
              </div>
            ))}
          </div>

        </div>{/* /bs-wrap */}
      </section>
    </>
  );
}