'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { apiRequest } from '@/lib/api';

/*
  REPLACE these with your actual Palmonas image assets:
  - Each banner: desktop 900×560px landscape, mobile 430×580px portrait
  - Use next/image in production for optimisation
*/

type Banner = {
  id: string;
  tag: string;
  headline: string;
  cta: string;
  href: string;
  imgDesktop: string;
  imgAlt: string;
  textSide: 'left' | 'right';
};

// Desktop shows 2 cards at a time
const DESKTOP_VISIBLE = 2;

export default function BannerSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
const [marqueeItems, setMarqueeItems] = useState<string[]>([
  '✦ Free Shipping above ₹999',
  '✦ Custom Jewellery',
  '✦ Free Gifts on all Orders',
]);
  useEffect(() => {
    async function fetchBanners() {
      try {
        const data = await apiRequest<{ success: boolean; homeContent: any }>('/home-content');
        if (data.success && data.homeContent?.promoBanners) {
          const promoBanners = data.homeContent.promoBanners;
          if (data.homeContent?.marqueeItems?.length > 0) {
  setMarqueeItems(data.homeContent.marqueeItems);
}
          const formattedBanners: Banner[] = promoBanners.map((b: any, index: number) => ({
              id: b._id || String(index),
              tag: b.tag || '',
              headline: b.headline || '',
              cta: b.cta || 'Shop Now',
              href: b.link || '#',
              imgDesktop: b.image || '',
              imgAlt: b.headline || 'Promo Banner',
              textSide: (b.textSide as 'left' | 'right') || 'right',
            }));
          
          if (formattedBanners.length > 0) {
            setBanners(formattedBanners);
          } else {
            // Fallback default
            setBanners([
              { id: "1", tag: "Gift Combos", headline: "FLAT 50%\nOFF", cta: "Shop Now", href: "/categories/women/gift-boxes", imgDesktop: "/gift_box.jpg", imgAlt: "", textSide: "right" },
              { id: "2", tag: "Custom Charm", headline: "DESIGN\nYOUR STORY", cta: "Customise", href: "/categories/women/custom-charm", imgDesktop: "/2_new.jpg", imgAlt: "", textSide: "right" }
            ]);
          }
        } else {
          // Fallback default if not in DB yet
          setBanners([
            { id: "1", tag: "Gift Combos", headline: "FLAT 50%\nOFF", cta: "Shop Now", href: "/categories/women/gift-boxes", imgDesktop: "/gift_box.jpg", imgAlt: "", textSide: "right" },
            { id: "2", tag: "Custom Charm", headline: "DESIGN\nYOUR STORY", cta: "Customise", href: "/categories/women/custom-charm", imgDesktop: "/2_new.jpg", imgAlt: "", textSide: "right" }
          ]);
        }
      } catch (err) {
        console.error('Failed to load banners:', err);
        setBanners([
          { id: "1", tag: "Gift Combos", headline: "FLAT 50%\nOFF", cta: "Shop Now", href: "/categories/women/gift-boxes", imgDesktop: "/gift_box.jpg", imgAlt: "", textSide: "right" },
          { id: "2", tag: "Custom Charm", headline: "DESIGN\nYOUR STORY", cta: "Customise", href: "/categories/women/custom-charm", imgDesktop: "/2_new.jpg", imgAlt: "", textSide: "right" }
        ]);
      } finally {
        setLoading(false);
      }
    }
    fetchBanners();
  }, []);

  const maxIndex = Math.max(0, banners.length - DESKTOP_VISIBLE); // last valid left-card index

  useEffect(() => {
    if (!sectionRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.08 }
    );
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [loading]);

  const prev = useCallback(() => setSlideIndex((i) => Math.max(0, i - 1)), []);
  const next = useCallback(() => setSlideIndex((i) => Math.min(maxIndex, i + 1)), [maxIndex]);

  // translateX: each step moves one card-width + gap
  // card width on desktop = 50% of track - half gap (gap 20px)
  // We express this as a percentage of the viewport (track width)
  const trackShift = slideIndex * (50 + (10 / 100)); // approximate — refined via CSS var

  if (loading && banners.length === 0) {
    return <div style={{ height: "400px", display: "flex", justifyContent: "center", alignItems: "center" }}>Loading...</div>;
  }

  if (banners.length === 0) {
    return null;
  }

  return (
    <>
      <style>{`
        :root {
          --gold: #c9a84c;
          --gold-light: #e8c97a;
          --gold-pale: #f5e6b8;
          --olive-dark: #1e2710;
          --white: #ffffff;
          --bg: #fafaf7;
          --card-gap: 1.25rem;
          --card-radius: 10px;
        }

        /* ─── Section ─── */
        .bs-section {
          background: var(--bg);
          padding-bottom: clamp(2rem, 4vw, 3rem);
        }

        /* ─── Slider container ─── */
        .bs-slider-shell {
          margin-top: clamp(1.5rem, 3vw, 2.5rem);
          position: relative;
          /* side padding makes room for arrow buttons sitting outside the viewport */
          padding: 0 clamp(2.5rem, 4vw, 3.5rem);
        }

        /* Clips the scrolling track */
        .bs-slider-viewport {
          overflow: hidden;
          border-radius: var(--card-radius);
        }

        /* Scrolling row of cards */
        .bs-slider-track {
          display: flex;
          gap: var(--card-gap);
          /* JS sets transform via inline style */
          transition: transform 0.55s cubic-bezier(0.4, 0, 0.2, 1);
          will-change: transform;
        }

        /* ─── Single card ─── */
        .bs-card {
          /* Desktop: 2 cards exactly fill the viewport width */
          flex: 0 0 calc(50% - var(--card-gap) / 2);
          position: relative;
          overflow: hidden;
          // border-radius: var(--card-radius);
          height: clamp(300px, 36vw, 520px);
          display: block;
          text-decoration: none;
          cursor: pointer;
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .bs-card.visible { opacity: 1; transform: translateY(0); }
        .bs-card:nth-child(2) { transition-delay: 0.1s; }
        .bs-card:nth-child(3) { transition-delay: 0.2s; }

        .bs-card-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          display: block;
          transition: transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        .bs-card:hover .bs-card-img { transform: scale(1.04); }

        /* Gradient scrim for readability */
        .bs-card-scrim {
          position: absolute;
          inset: 0;
          z-index: 1;
          background: linear-gradient(270deg, rgba(8,8,8,0.56) 0%, transparent 55%);
        }
        .bs-card-scrim.left {
          background: linear-gradient(90deg, rgba(8,8,8,0.56) 0%, transparent 55%);
        }

        /* Text positioned on the specified side */
        .bs-card-text {
          position: absolute;
          inset: 0;
          z-index: 2;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: flex-end;
          padding: clamp(1.4rem, 3vw, 2.4rem);
          text-align: right;
        }
        .bs-card-text.left {
          align-items: flex-start;
          text-align: left;
        }

        .bs-card-tag {
          font-size: 0.65rem;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: var(--gold-pale);
          margin-bottom: 0.5rem;
          font-weight: 500;
          opacity: 0.88;
        }
        .bs-card-headline {
          font-family: Georgia, 'Times New Roman', serif;
          font-size: clamp(1.8rem, 3vw, 3rem);
          font-weight: 700;
          color: var(--white);
          line-height: 1.05;
          margin: 0 0 1.1rem;
          white-space: pre-line;
        }
.bs-card-cta {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.7rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #000000;
  font-family: sans-serif;
  font-weight: 500;
  background: rgba(126, 111, 11, 0.36);          /* ← semi-dark bg */
  border: 1px solid rgb(239, 178, 10);   /* ← gold border */
  border-radius: 100px;
  padding: 0.45rem 1.1rem 0.45rem 1.25rem;
  text-decoration: none;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  transition: background 0.22s ease, border-color 0.22s ease, color 0.22s ease;
}
.bs-card-cta::after {
  content: '→';
  font-size: 0.85rem;
  line-height: 1;
  transition: transform 0.22s ease;
}
.bs-card:hover .bs-card-cta {
  background: rgba(201, 168, 76, 0.18);
  border-color: var(--gold);
  color: #101010;
}
.bs-card:hover .bs-card-cta::after {
  transform: translateX(3px);
}


        /* ─── Arrow buttons ─── */
        .bs-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 10;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255,255,255,0.93);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.3rem;
          line-height: 1;
          box-shadow: 0 2px 12px rgba(0,0,0,0.16);
          color: #222;
          transition: background 0.2s, opacity 0.2s, box-shadow 0.2s;
        }
        .bs-arrow:hover { background: #fff; box-shadow: 0 4px 18px rgba(0,0,0,0.2); }
        .bs-arrow:disabled { opacity: 0.28; cursor: default; }
        .bs-arrow-prev { left: 0; }
        .bs-arrow-next { right: 0; }

        /* ─── Dots ─── */
        .bs-dots {
          display: flex;
          justify-content: center;
          gap: 0.45rem;
          margin-top: 1.1rem;
        }
        .bs-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: rgba(201,168,76,0.3);
          border: none;
          cursor: pointer;
          padding: 0;
          transition: background 0.25s, transform 0.25s;
        }
        .bs-dot.active {
          background: var(--gold);
          transform: scale(1.4);
        }

        /* ─── Offer band ─── */
        .bs-offer-wrap {
          padding: clamp(2rem, 4vw, 3rem) clamp(1rem, 3vw, 2.5rem) 0;
        }
        .bs-offer {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: var(--olive-dark);
          border: 1px solid rgba(201,168,76,0.28);
          border-radius: 100px;
          padding: 1rem 1.5rem 1rem 1rem;
          max-width: 600px;
          margin: 0 auto;
          box-shadow: 0 0 0 5px rgba(201,168,76,0.05);
        }
        .bs-offer-icon {
          width: 36px;
          height: 36px;
          background: var(--gold);
          color: #fff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.85rem;
          flex-shrink: 0;
          box-shadow: 0 0 14px rgba(201,168,76,0.45);
        }
        .bs-offer-text {
          flex: 1;
          font-size: 0.86rem;
          color: var(--gold-pale);
          line-height: 1.4;
        }
        .bs-offer-text strong { color: var(--gold-light); }
        .bs-offer-btn {
          background: transparent;
          color: var(--gold-light);
          border: 1px solid rgba(201,168,76,0.5);
          padding: 0.52rem 1.25rem;
          font-size: 0.76rem;
          font-weight: 500;
          letter-spacing: 0.06em;
          cursor: pointer;
          border-radius: 100px;
          white-space: nowrap;
          transition: border-color 0.2s, color 0.2s;
        }
        .bs-offer-btn:hover { border-color: var(--gold); color: var(--gold); }

        /* ═══════════════════════════════════════
           MOBILE  ≤ 639px — vertical stack
        ═══════════════════════════════════════ */
        @media (max-width: 639px) {
          /* Hide arrows + dots on mobile */
          .bs-arrow { display: none; }
          .bs-dots  { display: none; }

          /* Reset slider to vertical */
          .bs-slider-shell  { padding: 0 1rem; }
          .bs-slider-viewport { overflow: visible; border-radius: 0; }
          .bs-slider-track {
            flex-direction: column;
            gap: 0.9rem;
            transform: none !important; /* block JS transform */
          }

          /* All cards: full width */
          .bs-card {
            flex: none;
            width: 100%;
          }

          /* First card — large */
          .bs-card:nth-child(1) {
            height: clamp(320px, 95vw, 480px);
          }

          /* Second and beyond — smaller */
          .bs-card:nth-child(n+2) {
            height: clamp(190px, 55vw, 260px);
          }

          /* Text: top-centre on mobile */
          .bs-card-text,
          .bs-card-text.left {
            justify-content: space-between;
            align-items: right;
            text-align: right;
            padding-top: clamp(1.5rem, 7vw, 2.5rem);
          }
  .bs-card-cta {
    font-size: 0.65rem;
    padding: 0.4rem 0.9rem 0.4rem 1rem;
  }
          /* Scrim: top-fade on mobile */
          .bs-card-scrim,
          .bs-card-scrim.left {
            background: linear-gradient(180deg, rgba(8,8,8,0.54) 0%, transparent 52%);
          }

          /* Offer band adjustments */
          .bs-offer-wrap { padding: 1.75rem 1rem 0; }
          .bs-offer {
            border-radius: 14px;
            flex-wrap: wrap;
            justify-content: center;
            text-align: center;
          }
        }

        /* ═══════════════════════════════════════
           TABLET  640–1023px
           Show 1 full card + peek of next
        ═══════════════════════════════════════ */
        @media (min-width: 640px) and (max-width: 1023px) {
          .bs-card {
            flex: 0 0 calc(72% - var(--card-gap) / 2);
            height: clamp(280px, 46vw, 420px);
          }
        }
          .bs-marquee-wrap {
  width: 100%;
  overflow: hidden;
  background: #1e2710;
  padding: 0.35rem 0;
  margin-top: clamp(1.5rem, 3vw, 2.5rem);
}
.bs-marquee-track {
  display: flex;
  width: max-content;
  animation: bsMarquee 28s linear infinite;
}
.bs-marquee-track:hover { animation-play-state: paused; }
@keyframes bsMarquee {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
.bs-marquee-item {
  font-size: 0.68rem;
  font-weight: 400;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #f5e6b8;
  padding: 0 2.5rem;
  white-space: nowrap;
  opacity: 0.85;
}
      `}</style>

      <section ref={sectionRef} className="bs-section">

        {/* ── Slider / mobile stack ── */}
        <div className="bs-slider-shell">

          {/* Prev */}
          <button
            className="bs-arrow bs-arrow-prev"
            onClick={prev}
            disabled={slideIndex === 0}
            aria-label="Previous"
          >
            ‹
          </button>

          <div className="bs-slider-viewport">
            <div
              className="bs-slider-track"
              style={{
                // move by exactly one card width + gap per step
                transform: `translateX(calc(-${slideIndex} * (50% + var(--card-gap) / 2)))`,
              }}
            >
              {banners.map((b, idx) => (
                <Link
                  key={b.id}
                  href={b.href}
                  className={`bs-card${visible ? ' visible' : ''}`}
                  style={{ transitionDelay: `${idx * 0.1}s` }}
                  aria-label={`${b.tag} — ${b.cta}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="bs-card-img"
                    src={b.imgDesktop}
                    alt={b.imgAlt}
                    loading={idx === 0 ? 'eager' : 'lazy'}
                  />

                  <div className={`bs-card-scrim${b.textSide === 'left' ? ' left' : ''}`} />

                  <div className={`bs-card-text${b.textSide === 'left' ? ' left' : ''}`}>
                    <div>
                      <p className="bs-card-tag">{b.tag}</p>
                      <h2 className="bs-card-headline">{b.headline}</h2>
                    </div>
                    <span className="bs-card-cta">{b.cta}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Next */}
          <button
            className="bs-arrow bs-arrow-next"
            onClick={next}
            disabled={slideIndex >= maxIndex}
            aria-label="Next"
          >
            ›
          </button>
        </div>

        {/* Dots (desktop/tablet only via CSS) */}
        <div className="bs-dots">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              className={`bs-dot${slideIndex === i ? ' active' : ''}`}
              onClick={() => setSlideIndex(i)}
              aria-label={`Go to slide group ${i + 1}`}
            />
          ))}
        </div>

        {/* ── Offer band ── */}
        <div className="bs-offer-wrap">
          <div className="bs-offer" role="complementary" aria-label="Promotional offer">
            <div className="bs-offer-icon" aria-hidden="true">%</div>
            <p className="bs-offer-text">
              First order? Get <strong>5% off</strong> when you sign up
            </p>
            <button
              className="bs-offer-btn"
              type="button"
              onClick={() =>
                window.dispatchEvent(
                  new CustomEvent('makeussparkle:auth-open', { detail: { tab: 'register' } })
                )
              }
            >
              Claim Now
            </button>
          </div>
        </div>
{/* ── Marquee ── */}
<div className="bs-marquee-wrap">
  <div className="bs-marquee-track">
    {Array.from({ length: 4 }).flatMap((_, i) =>
      marqueeItems.map((t) => (
        <span key={`${i}-${t}`} className="bs-marquee-item">{t}</span>
      ))
    )}
  </div>
</div>
      </section>
    </>
  );
}