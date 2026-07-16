'use client';

import type { OfferDetail } from '@/lib/offerTypes';

interface OfferHeaderProps {
  offer: OfferDetail;
}

const BADGE_COLOR: Record<string, { bg: string; text: string; border: string }> = {
  bogo:          { bg: '#253d18', text: '#acdc94', border: '#4a7535' },
  buy_x_for_y:   { bg: '#7a4e10', text: '#fde8b8', border: '#c9942e' },
  percentage:    { bg: '#1a3a5c', text: '#b8d9f5', border: '#2a6aad' },
  fixed:         { bg: '#4a0e6b', text: '#e4c5f5', border: '#8e2fc0' },
  free_shipping: { bg: '#0e5c4a', text: '#b5f0e3', border: '#1da584' },
};

export default function OfferHeader({ offer }: OfferHeaderProps) {
  const badgeColors = BADGE_COLOR[offer.offerType] ?? BADGE_COLOR.percentage;

  return (
    <>
      <style>{CSS}</style>
      <div className="oh-root">

        {/* ── Hero image ── */}
        <div className="oh-img-wrap">
          <img
            className="oh-img"
            src={offer.image}
            alt={offer.title}
          />
          <div className="oh-img-overlay" />

          {/* Badge pinned on image */}
          <span
            className="oh-badge"
            style={{
              background: badgeColors.bg,
              color: badgeColors.text,
              border: `1.5px solid ${badgeColors.border}`,
            }}
          >
            {offer.badgeLabel}
          </span>
        </div>

        {/* ── Text details ── */}
        <div className="oh-body">
          <div className="oh-meta-row">
            <span className="oh-type-pill">
              {typeLabel(offer.offerType)}
            </span>
            {offer.isFeatured && (
              <span className="oh-featured-pill">⭐ Featured</span>
            )}
          </div>

          <h1 className="oh-title">{offer.title}</h1>
          <p className="oh-desc">{offer.description}</p>

          {/* Validity */}
          <div className="oh-validity">
            <span className="oh-validity-icon">🗓️</span>
            <div className="oh-validity-text">
              {offer.startsAtFormatted ? (
                <span>
                  <strong>Valid:</strong>{' '}
                  {offer.startsAtFormatted} → {offer.expiryFormatted}
                </span>
              ) : (
                <span>
                  <strong>Expires:</strong> {offer.expiryFormatted}
                </span>
              )}
            </div>
          </div>

          {offer.minOrderValue > 0 && (
            <div className="oh-min-order">
              Min. order value: <strong>₹{offer.minOrderValue.toLocaleString('en-IN')}</strong>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/** Skeleton shown while the offer is loading */
export function OfferHeaderSkeleton() {
  return (
    <>
      <style>{CSS}</style>
      <div className="oh-root">
        <div className="oh-img-wrap oh-skeleton-img" />
        <div className="oh-body">
          <div className="oh-skeleton oh-sk-pill" />
          <div className="oh-skeleton oh-sk-title" />
          <div className="oh-skeleton oh-sk-desc" />
          <div className="oh-skeleton oh-sk-desc" style={{ width: '60%' }} />
          <div className="oh-skeleton oh-sk-validity" />
        </div>
      </div>
    </>
  );
}

function typeLabel(type: OfferDetail['offerType']): string {
  const map: Record<OfferDetail['offerType'], string> = {
    bogo:          'Buy One Get One',
    buy_x_for_y:   'Bundle Deal',
    percentage:    'Percentage Discount',
    fixed:         'Flat Discount',
    free_shipping: 'Free Shipping',
  };
  return map[type] ?? 'Special Offer';
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=Nunito:wght@300;400;500;600;700&display=swap');

.oh-root *, .oh-root *::before, .oh-root *::after { box-sizing: border-box; }

.oh-root {
  font-family: 'Nunito', sans-serif;
  background: #fff;
  border: 1px solid #e5dcc8;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(35,60,18,.09);
  margin: 24px 16px 0;
}
@media (min-width: 640px) { .oh-root { margin: 28px 24px 0; } }
@media (min-width: 1024px) { .oh-root { margin: 32px 40px 0; display: grid; grid-template-columns: 1.1fr 1fr; } }

/* ── Image ── */
.oh-img-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 7;
  overflow: hidden;
  background: #ede8dc;
}
@media (min-width: 1024px) { .oh-img-wrap { aspect-ratio: auto; min-height: 320px; } }

.oh-img {
  width: 100%; height: 100%;
  object-fit: cover; display: block;
}
.oh-img-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to bottom, transparent 50%, rgba(8,18,4,.35) 100%);
  pointer-events: none;
}

/* Badge */
.oh-badge {
  position: absolute; bottom: 14px; left: 14px;
  font-family: 'Nunito', sans-serif;
  font-size: 10px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase;
  padding: 5px 13px; border-radius: 100px;
  box-shadow: 0 2px 10px rgba(0,0,0,.18);
}

/* ── Body ── */
.oh-body {
  padding: 20px 20px 24px;
  display: flex; flex-direction: column; gap: 10px;
  background: #fff;
}
@media (min-width: 1024px) { .oh-body { padding: 32px 36px; justify-content: center; } }

.oh-meta-row {
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
}
.oh-type-pill {
  font-size: 9px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase;
  color: #4a7535; background: #eef7e8; border: 1px solid #c8e2b5;
  padding: 3px 10px; border-radius: 100px;
}
.oh-featured-pill {
  font-size: 9px; font-weight: 700; letter-spacing: .1em;
  color: #a07820; background: #fdf8ee; border: 1px solid #e8c96a;
  padding: 3px 10px; border-radius: 100px;
}

.oh-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(1.5rem, 4vw, 2.2rem);
  font-weight: 600; color: #1c1c17;
  line-height: 1.15; margin: 0;
}
.oh-desc {
  font-size: 13px; color: #5a5a52; line-height: 1.6; margin: 0;
}

/* Validity */
.oh-validity {
  display: flex; align-items: center; gap: 10px;
  background: #f9f7f2; border: 1px solid #e5dcc8;
  border-radius: 8px; padding: 10px 14px;
}
.oh-validity-icon { font-size: 18px; flex-shrink: 0; }
.oh-validity-text { font-size: 12px; color: #52524a; }
.oh-validity-text strong { color: #253d18; }

.oh-min-order {
  font-size: 11px; color: #828278;
  background: #f9f7f2; border: 1px solid #e5dcc8;
  border-radius: 6px; padding: 7px 12px;
}
.oh-min-order strong { color: #253d18; }

/* ── Skeletons ── */
@keyframes oh-shimmer {
  from { background-position: -400px 0; }
  to   { background-position:  400px 0; }
}
.oh-skeleton {
  border-radius: 6px;
  background: linear-gradient(90deg, #ede8dc 25%, #f7f2ea 50%, #ede8dc 75%);
  background-size: 800px 100%;
  animation: oh-shimmer 1.4s infinite linear;
}
.oh-skeleton-img {
  width: 100%; aspect-ratio: 16 / 7;
  background: linear-gradient(90deg, #ede8dc 25%, #f7f2ea 50%, #ede8dc 75%);
  background-size: 800px 100%;
  animation: oh-shimmer 1.4s infinite linear;
}
@media (min-width: 1024px) { .oh-skeleton-img { min-height: 320px; aspect-ratio: auto; } }
.oh-sk-pill    { height: 20px; width: 100px; }
.oh-sk-title   { height: 36px; width: 70%; }
.oh-sk-desc    { height: 14px; width: 90%; }
.oh-sk-validity{ height: 42px; width: 100%; }
`;
