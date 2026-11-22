'use client';
import { useLater } from '@/lib/useLater';
import SafeHtml from '@/components/ui/SafeHtml';
import { PdpSkeleton } from '@/components/ui/PageSkeletons';
import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchProductById, fetchProductReviews, submitProductReview, type CatalogProduct, type ReviewData } from '@/lib/catalogApi';
import { useAuth } from '@/lib/authContext';
import { useCart } from '@/lib/cartContext';
import { fireConfetti } from '@/components/cart/ConfettiManager';
import { useWishlist } from '@/lib/wishlistContext';
import Link from 'next/link';
import { PDP_THEME_CSS } from './pdp/pdpTheme';
import { PDP_BASE_CSS } from './pdp/pdpBase';
import PdpGallery from './pdp/PdpGallery';
import PdpReviews from './pdp/PdpReviews';
import PdpWorn from '@/components/product/pdp/PdpWorn';
import PdpShelves from './pdp/PdpShelves';
import PdpStickyBar from './pdp/PdpStickyBar';
import pdpStyles from './pdp/pdp.module.css';
import Em from '@/components/ui/Em';

const EMOJI_RE = /(?:[\u{1F000}-\u{1FAFF}]|[\u2705\u274C\u26A0\u2B50\u2764\u270F\u26A1\u2728\u2709\u23F1\u23F0\u2708])\uFE0F?\s?/gu;
const stripEmoji = (html: string) => html.replace(EMOJI_RE, '');


export interface AccordionData {
  id: string;
  emoji: string;
  label: string;
  content: string;
  isHtml?: boolean;
  linkHref?: string;
  linkLabel?: string;
}

interface UploadItem {
  id: number;
  file: File;
  preview: string;
  note: string;
}

const FALLBACK_PRODUCT_IMAGE = '/images/hero.png';
// ── Replace with actual gift box image path ──
const GIFT_BOX_IMAGE = '/smallerBox.png';

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

function uniqueValues(values: Array<string | undefined | null>) {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value && value.trim()))));
}

function dedupeImages(values: Array<string | undefined | null>) {
  return uniqueValues(values);
}

const TRUST_BADGES = [
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="18" width="28" height="18" rx="2" />
        <path d="M32 22h4l6 8v6h-10V22z" />
        <circle cx="14" cy="38" r="3" />
        <circle cx="36" cy="38" r="3" />
        <path d="M4 26h28" />
        <path d="M10 14h4M16 11v6" />
      </svg>
    ),
    title: 'Free Shipping',
    sub: 'On orders above ₹999',
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M24 6C14 6 8 14 8 22c0 10 16 22 16 22s16-12 16-22c0-8-6-16-16-16z" />
        <path d="M20 22l3 3 6-6" />
      </svg>
    ),
    title: 'COD Available',
    sub: 'On all orders',
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M44 4L22 26M44 4L30 44 22 26 4 18 44 4z" />
      </svg>
    ),
    title: 'Express Delivery',
    sub: '2–3 business days',
  },
];

const PRESET_MESSAGES = [
  { value: '', label: 'Choose a message template…' },
  { value: 'happy_mothers_day', label: 'Happy Mother\'s Day' },
  { value: 'happy_birthday', label: 'Happy Birthday' },
  { value: 'i_am_sorry', label: 'I\'m Sorry' },
  { value: 'congratulations', label: 'Congratulations' },
  { value: 'thank_you', label: 'Thank You' },
  { value: 'i_love_you', label: 'I Love You' },
  { value: 'get_well_soon', label: 'Get Well Soon' },
  { value: 'merry_christmas', label: 'Merry Christmas' },
  { value: 'happy_anniversary', label: 'Happy Anniversary' },
  { value: 'just_because', label: 'Just Because' },
];

// ─── Premium Gift Box Upsell ──────────────────────────────────────────────────
export function GiftBoxUpsell({
  added, onToggle, image, heading, description, price,
}: {
  added: boolean;
  onToggle: () => void;
  image: string;
  heading: string;
  description: string;
  price: number;
}) {
  // "Rigid magnetic-close box · satin ribbon · message card" → a list behind the ⓘ, so the card stays clean
  const perks = description.split(/[·•|]/).map((t) => t.trim()).filter(Boolean).slice(0, 6)
    .map((t) => t.charAt(0).toUpperCase() + t.slice(1));
  const [infoOpen, setInfoOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!infoOpen) return;
    const away = (e: Event) => { if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setInfoOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setInfoOpen(false); };
    document.addEventListener('pointerdown', away);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('pointerdown', away); document.removeEventListener('keydown', esc); };
  }, [infoOpen]);

  return (
    <div className={`gift-wrap${added ? ' is-on' : ''}`} ref={wrapRef}>
      <div
        role="checkbox"
        aria-checked={added}
        tabIndex={0}
        className="gift-card"
        onClick={onToggle}
        onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); onToggle(); } }}
      >
        <span className="gift-img">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt="" onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }} />
        </span>
        <span className="gift-main">
          <span className="gift-text">
            <span className="gift-title-row">
              <span className="gift-title">{heading}</span>
              {perks.length > 0 && (
                <button
                  type="button"
                  className="gift-info"
                  aria-label={`What's included in the ${heading}`}
                  aria-expanded={infoOpen}
                  onClick={(e) => { e.stopPropagation(); setInfoOpen((o) => !o); }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9.5" /><line x1="12" y1="11" x2="12" y2="16.5" /><circle cx="12" cy="7.6" r=".6" fill="currentColor" /></svg>
                </button>
              )}
            </span>
            <span className="gift-price">+₹{price}</span>
          </span>
          <span className="gift-add" aria-hidden="true">
            {added ? (
              <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>Added</>
            ) : 'Add'}
          </span>
        </span>
      </div>

      {infoOpen && perks.length > 0 && (
        <ul className="gift-perks-open" aria-label={`What's included in the ${heading}`}>
          {perks.map((t) => (
            <li key={t}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
              {t}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
// ─── Reviews Section ──────────────────────────────────────────────────────────
function ReviewsSection({ productId, reviews, setReviews }: { productId: string; reviews: ReviewData[]; setReviews: React.Dispatch<React.SetStateAction<ReviewData[]>> }) {
  const [visibleCount, setVisibleCount] = useState(3);
  const [filterStar, setFilterStar] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formState, setFormState] = useState<{ rating: number; body: string; images: File[] }>({ rating: 5, body: '', images: [] });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { token } = useAuth();

  const filtered = reviews.filter(r => filterStar === null || r.rating === filterStar);
  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setErrorMsg('You must be logged in to review.');
      return;
    }
    setIsSubmitting(true);
    setErrorMsg('');
    const res = await submitProductReview({ productId, ...formState }, token);
    setIsSubmitting(false);
    if (res.success && res.review) {
      setReviews([res.review, ...reviews]);
      setShowForm(false);
      setFormState({ rating: 5, body: '', images: [] });
    } else {
      setErrorMsg(res.message || 'Failed to submit review.');
    }
  };

  const totalReviews = reviews.length;
  const avgRating = totalReviews ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1) : '0.0';
  const ratingDist = [5, 4, 3, 2, 1].map(stars => {
    const count = reviews.filter(r => r.rating === stars).length;
    const pct = totalReviews ? Math.round((count / totalReviews) * 100) : 0;
    return { stars, count, pct };
  });

  return (
    <div className="rev-section">
      <div className="rev-header">
        <div className="rev-header-line" />
        <div className="rev-header-text">
          <span className="rev-eyebrow">Customer Stories</span>
          <h2 className="rev-title">What people are saying</h2>
        </div>
        <div className="rev-header-line" />
      </div>

      <div className="rev-summary">
        <div className="rev-summary-score">
          <span className="rev-big-num">{avgRating}</span>
          <div className="rev-big-stars">{'★'.repeat(Math.round(Number(avgRating)))}{'☆'.repeat(5 - Math.round(Number(avgRating)))}</div>
          <span className="rev-total-cnt">Based on {totalReviews} reviews</span>
        </div>
        <div className="rev-bars">
          {ratingDist.map(d => (
            <button key={d.stars} className={`rev-bar-row${filterStar === d.stars ? ' rev-bar-row--active' : ''}`} onClick={() => setFilterStar(filterStar === d.stars ? null : d.stars)}>
              <span className="rev-bar-label">{d.stars}★</span>
              <div className="rev-bar-track"><div className="rev-bar-fill" style={{ width: `${d.pct}%` }} /></div>
              <span className="rev-bar-count">{d.count}</span>
            </button>
          ))}
        </div>
      </div>

<div className="rev-controls">
  {filterStar !== null && (
    <button className="rev-clear-filter" onClick={() => setFilterStar(null)}>
      Showing {filterStar}★ only &nbsp;×
    </button>
  )}
  {!showForm && (
    <button className="rev-write-btn" onClick={() => setShowForm(true)}>
      Write a Review
    </button>
  )}
</div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: 'white', padding: 24, borderRadius: 18, border: '1px solid rgba(61,74,34,.07)', marginBottom: 20, animation: 'fadeUp .3s ease both' }}>
          <h3 style={{ fontSize: 16, color: 'var(--olive-900)', marginBottom: 16 }}>Write a Review</h3>
          {errorMsg && <div style={{ color: 'var(--red)', fontSize: 12, marginBottom: 12 }}>{errorMsg}</div>}
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            {[1, 2, 3, 4, 5].map(star => (
              <span key={star} onClick={() => setFormState(s => ({ ...s, rating: star }))} style={{ fontSize: 24, cursor: 'pointer', color: star <= formState.rating ? 'var(--gold)' : '#ccc' }}>★</span>
            ))}
          </div>
          <textarea required placeholder="Write your comments..." value={formState.body} onChange={e => setFormState(s => ({ ...s, body: e.target.value }))} rows={4} style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--beige-dkr)', borderRadius: 8, marginBottom: 16, fontSize: 16, outline: 'none', resize: 'vertical' }} />

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'inline-block', cursor: 'pointer', fontSize: 13, color: 'var(--olive-600)', fontWeight: 600, border: '1px solid var(--olive-600)', padding: '6px 12px', borderRadius: 4 }}>
              <input type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={e => {
                if (e.target.files) {
                  setFormState(s => ({ ...s, images: [...s.images, ...Array.from(e.target.files as FileList)] }));
                }
              }} />
              + Add Photos
            </label>
            {formState.images.length > 0 && (
              <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                {formState.images.map((file, idx) => (
                  <div key={idx} style={{ position: 'relative', width: 60, height: 60 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={URL.createObjectURL(file)} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }} />
                    <button type="button" onClick={() => setFormState(s => ({ ...s, images: s.images.filter((_, i) => i !== idx) }))} style={{ position: 'absolute', top: -6, right: -6, background: 'var(--red)', color: 'white', border: 'none', borderRadius: '50%', width: 18, height: 18, fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button type="submit" disabled={isSubmitting} style={{ background: 'var(--olive-600)', color: 'white', border: 'none', padding: '10px 24px', borderRadius: 50, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>{isSubmitting ? 'Submitting...' : 'Submit Review'}</button>
            <button type="button" onClick={() => setShowForm(false)} style={{ background: 'transparent', color: 'var(--mist)', border: 'none', padding: '10px 24px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          </div>
        </form>
      )}

      {visible.length === 0 && !showForm && <p className="rev-empty">No reviews match this filter. <button className="rev-clear-link" onClick={() => setFilterStar(null)}>Clear filter</button></p>}
      <div className="rev-list">
        {visible.map((r, i) => (
          <div key={r._id} className="rev-card" style={{ animationDelay: `${i * 0.07}s` }}>
            <div className="rev-card-top">
              <div className="rev-avatar" style={{ background: '#c9a84c22', color: '#c9a84c' }}>
                {r.user?.firstName?.[0] || 'A'}
              </div>
              <div className="rev-meta">
                <div className="rev-meta-row">
                  <span className="rev-name">{r.user?.firstName} {r.user?.lastName}</span>
                  {r.isVerifiedPurchase && <span className="rev-verified"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>Verified purchase</span>}
                </div>
                <div className="rev-meta-row" style={{ marginTop: 3 }}>
                  <span className="rev-stars-sm">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                  <span className="rev-date">{new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
              </div>
            </div>
            <p className="rev-card-body">{r.body}</p>
            {r.images && r.images.length > 0 && (
              <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                {r.images.map((imgUrl, idx) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={idx} src={imgUrl} alt="Review attachment" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 6, border: '1px solid #eee' }} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      {hasMore && <div className="rev-load-wrap"><button className="rev-load-btn" onClick={() => setVisibleCount(v => v + 3)}>Show more reviews</button></div>}
    </div>
  );
}

const GOES_WELL_WITH = [
  { id: 1, name: 'Pearl Drop Earrings', price: 899, originalPrice: 1299, image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&q=80', href: '/products/pearl-drop-earrings' },
  { id: 2, name: 'Delicate Gold Bracelet', price: 1199, originalPrice: 1699, image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&q=80', href: '/products/gold-bracelet' },
  { id: 3, name: 'Twisted Ring Set', price: 749, originalPrice: 999, image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&q=80', href: '/products/twisted-ring-set' },
  { id: 4, name: 'Charm Anklet', price: 649, originalPrice: 849, image: 'https://images.unsplash.com/photo-1573408301185-9519f94e84dd?w=400&q=80', href: '/products/charm-anklet' },
];

type CrossProductItem = {
  _id: string;
  title: string;
  price: number;
  discountedPrice?: number | null;
  mainImage?: string | null;
  images?: string[];
};

export function CompleteTheLookStrip({ items }: { items?: CrossProductItem[] }) {
  const goesWellWith = items && items.length > 0
    ? items.map((p) => {
        const sale = p.discountedPrice && p.discountedPrice > 0 && p.discountedPrice < p.price ? p.discountedPrice : p.price;
        return {
          id: p._id,
          name: p.title,
          price: sale,
          originalPrice: p.price,
          image: p.mainImage || p.images?.[0] || '',
          href: `/products/${p._id}`,
        };
      })
    : GOES_WELL_WITH;
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const nudge = (dir: number) => scrollRef.current?.scrollBy({ left: dir * 400, behavior: 'smooth' });
  return (
    <section className="ctl-strip" aria-label="Complete the look">
      <div className="ctl-strip-header">
        <div>
          <span className="ctl-strip-eyebrow">Complete the Look</span>
          <p className="ctl-strip-sub">Pieces that pair beautifully with this</p>
        </div>
        <div className="ctl-arrows">
          <button type="button" aria-label="Scroll left" onClick={() => nudge(-1)}>‹</button>
          <button type="button" aria-label="Scroll right" onClick={() => nudge(1)}>›</button>
        </div>
      </div>
      <div className="ctl-strip-scroll" ref={scrollRef}>
        {goesWellWith.map((item) => {
          const disc = Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100);
          return (
            <a key={item.id} href={item.href} className="ctl-card">
              <div className="ctl-img-wrap">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image} alt={item.name} className="ctl-img" loading="lazy" onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }} />
                <span className="ctl-disc-badge">{disc}% off</span>
              </div>
              <div className="ctl-card-info">
                <p className="ctl-card-name">{item.name}</p>
                <div className="ctl-card-price-row">
                  <span className="ctl-card-price">₹{item.price.toLocaleString('en-IN')}</span>
                  {item.originalPrice > item.price && (
                    <span className="ctl-card-original">₹{item.originalPrice.toLocaleString('en-IN')}</span>
                  )}
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}

// ─── Accordion item ───────────────────────────────────────────────────────────
export function AccordionItem({ item, open, onToggle }: { item: AccordionData; open: boolean; onToggle: () => void }) {
  return (
    <div className={`acc-item${open ? ' acc-item--open' : ''}`}>
      <button className="acc-head" onClick={onToggle} aria-expanded={open}>
        <span className="acc-head-left"><span className="acc-emoji"><Em c={item.emoji} size="1em" /></span>{item.label}</span>
        <span className="acc-chevron" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12" /><line className="acc-v" x1="12" y1="5" x2="12" y2="19" /></svg></span>
      </button>
      <div className="acc-body-wrap" style={{
        display: 'grid',
        gridTemplateRows: open ? '1fr' : '0fr',
        transition: 'grid-template-rows 0.38s cubic-bezier(.4,0,.2,1)'
      }}>
        <div style={{ overflow: 'hidden' }}>
          <div className="acc-body">
            {item.isHtml
              ? <SafeHtml html={item.content} style={{ lineHeight: 1.85, fontSize: 12, fontWeight: 300, color: 'var(--mist)', letterSpacing: '.03em' }} />
              : item.content.split('\n').map((line: string, i: number) => <p key={i} style={{ marginBottom: line === '' ? 8 : 0 }}>{line || '\u00A0'}</p>)
            }
            {item.linkHref && item.linkLabel && (
              <Link href={item.linkHref} className="acc-policy-link">
                {item.linkLabel}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Estimated Delivery Block ─────────────────────────────────────────────────
export function EstimatedDeliveryBlock() {
  const opts = [
    { icon: '🚚', label: 'Standard', rate: '₹60', metro: '3–5 days', rest: '4–7 days' },
    { icon: '✈️', label: 'Express', rate: '₹110', metro: '2–3 days', rest: '3–4 days' },
  ];
  return (
    <section className="dlv" aria-label="Estimated delivery">
      <h3 className="dlv-title">Estimated delivery</h3>
      <div className="dlv-table">
        <div className="dlv-row dlv-head">
          <span />
          <span>Metro cities</span>
          <span>Rest of India</span>
          <span>Charge</span>
        </div>
        {opts.map((o) => (
          <div key={o.label} className="dlv-row">
            <span className="dlv-name"><span className="est-ico"><Em c={o.icon} size="1.1em" /></span>{o.label}</span>
            <span className="dlv-cell" data-l="Metro cities">{o.metro}</span>
            <span className="dlv-cell" data-l="Rest of India">{o.rest}</span>
            <span className="dlv-rate">{o.rate}</span>
          </div>
        ))}
      </div>
      <p className="dlv-free"><Em c="🎁" size="1.1em" /><span>Free Standard shipping on orders above <strong>₹999</strong></span></p>
    </section>
  );
}

// ─── Sparkles ─────────────────────────────────────────────────────────────────
function Sparkles({ active }: { active: boolean }) {
  if (!active) return null;
  const pts = Array.from({ length: 10 }, (_, i) => {
    const angle = (i / 10) * 360;
    const dist = 30 + Math.random() * 24;
    return { x: Math.cos((angle * Math.PI) / 180) * dist, y: Math.sin((angle * Math.PI) / 180) * dist, size: 4 + Math.random() * 5, delay: Math.random() * 0.15 };
  });
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10 }}>
      {pts.map((p, i) => (
        <div key={i} style={{ position: 'absolute', left: '50%', top: '50%', width: p.size, height: p.size, borderRadius: '50%', background: 'var(--gold)', transform: `translate(${p.x}px,${p.y}px)`, animation: 'sparkle 0.55s ease forwards', animationDelay: `${p.delay}s`, opacity: 0 }} />
      ))}
    </div>
  );
}

// ─── Customisation Panel ──────────────────────────────────────────────────────
function CustomisationPanel({ category, maxCustomImages = 1, customImageLabels = [], onChange }: { category: string, maxCustomImages?: number, customImageLabels?: string[], onChange?: (data: { wantCustom: boolean | null, uploads: string[], globalNote: string }) => void }) {
  const [wantCustom, setWantCustom] = useState<boolean | null>(null);

  const MAX_FILES = customImageLabels.length > 0 ? customImageLabels.length : maxCustomImages;
  const [uploads, setUploads] = useState<(UploadItem | null)[]>(Array(MAX_FILES).fill(null));

  const [globalNote, setGlobalNote] = useState('');

  useEffect(() => {
    if (onChange) {
      const validUploads = uploads.filter(Boolean).map(u => u!.preview);
      onChange({ wantCustom, uploads: validUploads, globalNote });
    }
  }, [wantCustom, uploads, globalNote, onChange]);

  const handleSlotUpload = (file: File, index: number) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploads(prev => {
        const newArr = [...prev];
        newArr[index] = { id: Date.now() + Math.random(), file, preview: (e.target?.result as string) || '', note: '' };
        return newArr;
      });
    };
    reader.readAsDataURL(file);
  };

  const removeSlotUpload = (index: number) => {
    setUploads(prev => {
      const newArr = [...prev];
      newArr[index] = null;
      return newArr;
    });
  };

  const handleToggle = (val: boolean) => {
    setWantCustom(val);
    if (!val) {
      setUploads(Array(MAX_FILES).fill(null));
      setGlobalNote('');
    }
  };
  const catLabel = category === 'Key Chain/Charm' ? 'key chain / charm' : category === 'Fan Box' ? 'fan box' : 'gift box';

  return (
    <>
      <div style={{ display: 'flex', gap: 10 }}>
        <button className={`cust-toggle-btn yes${wantCustom === true ? ' sel' : ''}`} onClick={() => handleToggle(true)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
          Yes, Customise
        </button>
        <button className={`cust-toggle-btn no${wantCustom === false ? ' sel' : ''}`} onClick={() => handleToggle(false)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
          No, Standard
        </button>
      </div>
      {wantCustom === false && (
        <div className="cust-info-chip" style={{ marginTop: 12 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 15, height: 15, flexShrink: 0, color: 'var(--gold)', marginTop: 1 }}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
          <p>You&apos;ll receive the <strong>standard {catLabel}</strong>. You can still personalise it later by contacting us within 2 hours of placing your order.</p>
        </div>
      )}
      {wantCustom === true && (
        <div style={{ marginTop: 14, animation: 'fadeUp .35s ease both' }}>
          <textarea className="cust-note-global" placeholder={`Add a personal message or customisation note for your ${catLabel}…`} value={globalNote} onChange={e => setGlobalNote(e.target.value)} rows={3} />

          <div style={{ marginTop: 16 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--olive-900)', marginBottom: 12 }}>Required Photos</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12 }}>
              {Array.from({ length: MAX_FILES }).map((_, i) => {
                const label = customImageLabels[i] || `Photo ${i + 1}`;
                const upload = uploads[i];
                return (
                  <div key={i} style={{ border: '1.5px dashed rgba(61,74,34,.15)', borderRadius: 12, padding: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'white', position: 'relative', minHeight: 140, textAlign: 'center' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--olive-900)', marginBottom: 8, zIndex: 2 }}>{label}</div>

                    {upload ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={upload.preview} alt={label} style={{ width: '100%', height: 90, objectFit: 'cover', borderRadius: 6, zIndex: 1 }} />
                        <button type="button" onClick={() => removeSlotUpload(i)} style={{ position: 'absolute', top: -6, right: -6, background: 'var(--red)', color: 'white', border: 'none', borderRadius: '50%', width: 22, height: 22, fontSize: 14, cursor: 'pointer', zIndex: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                      </>
                    ) : (
                      <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', zIndex: 2, width: '100%' }}>
                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => { if (e.target.files && e.target.files[0]) handleSlotUpload(e.target.files[0], i); }} />
                        <div style={{ width: 32, height: 32, color: 'var(--olive-400)', marginBottom: 6 }}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--olive-600)', background: 'rgba(61,74,34,.05)', padding: '4px 8px', borderRadius: 100 }}>Choose</span>
                      </label>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="cust-info-chip" style={{ marginTop: 16 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 15, height: 15, flexShrink: 0, color: '#101010', marginTop: 1 }}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
            <p>Our team reviews your photos within <strong>2 business hours</strong> and confirms the design before production. Customised items are <strong>non-returnable</strong> unless damaged or incorrect.</p>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Gift Message Panel ───────────────────────────────────────────────────────
function GiftMessagePanel({ value, onChange }: { value: { preset: string; customMessage: string }; onChange: (v: { preset: string; customMessage: string }) => void }) {
  return (
    <div className="gift-msg-panel">
      <div className="gift-msg-header">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16, color: 'var(--gold)' }}>
          <path d="M20 12v10H4V12" /><path d="M22 7H2v5h20V7z" /><path d="M12 22V7" /><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" /><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
        </svg>
        <span className="gift-msg-title">Add a Gift Message</span>
        <span className="gift-msg-optional">Optional</span>
      </div>
      <div className="gift-msg-select-wrap">
        <label className="gift-msg-label">Choose a message</label>
        <div className="gift-msg-select-inner">
          <select className="gift-msg-select" value={value.preset} onChange={e => onChange({ preset: e.target.value, customMessage: value.customMessage })}>
            {PRESET_MESSAGES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
          <svg className="gift-msg-select-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
        </div>
      </div>
      <div className="gift-msg-free-wrap">
        <label className="gift-msg-label gift-msg-label--free">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13, color: 'var(--olive-500)' }}><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
          Type your message
        </label>
        <textarea className="gift-msg-free-textarea" rows={3} maxLength={200} placeholder="Write a heartfelt note to be included with the order…" value={value.customMessage} onChange={e => onChange({ ...value, customMessage: e.target.value })} />
        <p className="gift-msg-char-count">{value.customMessage.length} / 200 characters</p>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ProductDetailPage({ slug }: { slug: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isFromCombo = searchParams.get('fromCombo') === 'true';

  const { addItem } = useCart();
  const later = useLater();
  const { toggleItem, isWished } = useWishlist();

  const [product, setProduct] = useState<CatalogProduct | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [selections, setSelections] = useState<{ colorIndex: number; size: string }[]>([]);
  const [activeImg, setActiveImg] = useState(0);
  const [shipping] = useState('standard');
  const [payment] = useState('prepaid');
  const [qty, setQty] = useState(1);
  const [cartAnim, setCartAnim] = useState(false);
  const [sparkleAnim, setSparkleAnim] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>('about');
  const [giftBoxAdded, setGiftBoxAdded] = useState(false);
  const [errorToast, setErrorToast] = useState('');
  const [productReviews, setProductReviews] = useState<ReviewData[]>([]);
  const cartBtnRef = useRef<HTMLButtonElement | null>(null);
  const ctaRef = useRef<HTMLDivElement | null>(null);
  const [showSticky, setShowSticky] = useState(false);
  const galleryColRef = useRef<HTMLDivElement | null>(null);
  const infoColRef = useRef<HTMLDivElement | null>(null);

  // Whichever column is shorter stays pinned while the taller one scrolls. A column taller than the
  // screen sticks by its bottom edge (negative top), so all of it can still be reached.
  useEffect(() => {
    const cols = [galleryColRef.current, infoColRef.current].filter(Boolean) as HTMLDivElement[];
    if (cols.length === 0) return;
    const apply = () => {
      cols.forEach((el) => {
        if (window.innerWidth < 1024) { el.style.position = ''; el.style.top = ''; return; }
        const top = Math.min(96, window.innerHeight - el.offsetHeight - 24);
        el.style.position = 'sticky';
        el.style.top = `${top}px`;
      });
    };
    apply();
    const ro = new ResizeObserver(apply);
    cols.forEach((el) => ro.observe(el));
    window.addEventListener('resize', apply);
    return () => { ro.disconnect(); window.removeEventListener('resize', apply); };
  }, [product?.sourceId, loading]);

  const [customData, setCustomData] = useState<{ wantCustom: boolean | null, uploads: string[], globalNote: string }>({ wantCustom: null, uploads: [], globalNote: '' });
  const [giftMessage, setGiftMessage] = useState<{ preset: string; customMessage: string }>({ preset: '', customMessage: '' });
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);

  useEffect(() => {
    if (errorToast) {
      const timer = setTimeout(() => setErrorToast(''), 3500);
      return () => clearTimeout(timer);
    }
  }, [errorToast]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setProduct(undefined);
    fetchProductById(slug)
      .then((p) => { if (mounted) { setProduct(p); setLoading(false); } })
      .catch(() => { if (mounted) { setProduct(null); setLoading(false); } });
    return () => { mounted = false; };
  }, [slug]);

  useEffect(() => {
    if (product?.sourceId) {
      fetchProductReviews(product.sourceId).then(setProductReviews);
    }
  }, [product?.sourceId]);

  const category = product?.category ?? '';
  const gender = product?.gender ?? '';
  const price = product?.price ?? 0;
  const originalPrice = product?.originalPrice ?? null;
  const discountedPrice = product?.discountedPrice ?? null;
  const discountTag = product?.discountTag ?? null;
  const stock = product?.stock ?? 0;
  const tags = product?.seoTags ?? [];
  const faqs = product?.faqs ?? [];
  const about = product?.about ?? '';

  const normalizedColors = (product?.colors ?? []).map((c: any) => ({ label: c.label || c.name || 'Default', hex: c.hex || '#c9a84c', image: c.image || undefined }));
  const sizes = product?.sizes ?? [];
  const variants = product?.variants ?? [];

  const quantityVariants = product?.quantityVariants ?? [];
  const hasQuantityVariants = quantityVariants.length > 0;
  const currentQuantityVariant = hasQuantityVariants ? quantityVariants[selectedVariantIndex] : null;

  const numberOfProducts = currentQuantityVariant ? currentQuantityVariant.quantity : (product?.numberOfProducts || 1);
  const mainImage = product?.mainImage;
  const images = product?.images ?? [];

  const allowCustomization = product?.allowCustomization === true;

  const dynamicReviewCount = productReviews.length;
  const dynamicRating = dynamicReviewCount > 0 ? Number((productReviews.reduce((acc, r) => acc + r.rating, 0) / dynamicReviewCount).toFixed(1)) : 0;

  useEffect(() => {
    if (!product) return;
    const totalItems = numberOfProducts;
    setSelections(prev => {
      const newSelections = [...prev];
      if (newSelections.length < totalItems) {
        for (let i = newSelections.length; i < totalItems; i++) {
          newSelections.push({ colorIndex: -1, size: '' });
        }
      } else if (newSelections.length > totalItems) {
        newSelections.length = totalItems;
      }
      return newSelections;
    });
    setActiveImg(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.sourceId, numberOfProducts]);

  const getVariantForSelection = useCallback((colorIndex: number, size: string) => {
    const safeIndex = colorIndex === -1 ? 0 : colorIndex;
    const cLabel = normalizeText(normalizedColors[safeIndex]?.label || '');
    const sLabel = normalizeText(size);
    return variants.find((v) => normalizeText(v.color) === cLabel && normalizeText(v.size) === sLabel)
      || variants.find((v) => normalizeText(v.color) === cLabel)
      || variants.find((v) => normalizeText(v.size) === sLabel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normalizedColors, variants]);

  const currentColor = normalizedColors[selections[0]?.colorIndex || 0] || normalizedColors[0];
  const matchingVariant = selections.length > 0 ? getVariantForSelection(selections[0].colorIndex, selections[0].size) : undefined;

  const variantOrColorImage = matchingVariant?.image || currentColor?.image;
  const mainImg = mainImage || (product as any)?.image;
  const galleryList = images && images.length > 0 ? images : [];
  const colorVariantImages = [
    ...(normalizedColors.map((c: any) => c.image)),
    ...(variants.map((v: any) => v.image)),
  ];
  const currentImages = dedupeImages([
    mainImg,
    ...galleryList,
    ...colorVariantImages,
  ]).filter(Boolean) as string[];
  const displayImg = currentImages?.[activeImg] || mainImg || variantOrColorImage || FALLBACK_PRODUCT_IMAGE;

  let volumeDiscountPct = 0;
  if (product?.volumeDiscounts && product.volumeDiscounts.length > 0) {
    const applicableTiers = product.volumeDiscounts.filter((vd) => qty >= vd.quantity);
    if (applicableTiers.length > 0) {
      const bestTier = applicableTiers.reduce((prev, current) => (prev.quantity > current.quantity) ? prev : current);
      volumeDiscountPct = bestTier.discountPercentage;
    }
  }

  let computedPrice = discountedPrice || price;
  let computedOriginalPrice: number = (originalPrice || price) ?? price;

  if (currentQuantityVariant) {
    computedPrice = currentQuantityVariant.price;
    computedOriginalPrice = currentQuantityVariant.price;
  } else if (matchingVariant) {
    if (matchingVariant.salePrice && matchingVariant.price) {
      // Variant has both MRP (price) and sale price — use both
      computedPrice = matchingVariant.salePrice * (1 - volumeDiscountPct / 100);
      computedOriginalPrice = matchingVariant.price;
    } else if (matchingVariant.salePrice) {
      computedPrice = matchingVariant.salePrice * (1 - volumeDiscountPct / 100);
      computedOriginalPrice = originalPrice || price;
    } else if (matchingVariant.price) {
      const storeDiscountRatio = (originalPrice && originalPrice > (discountedPrice || price))
        ? (originalPrice - (discountedPrice || price)) / originalPrice
        : 0;
      if (storeDiscountRatio > 0) {
        computedOriginalPrice = matchingVariant.price;
        computedPrice = Math.round(matchingVariant.price * (1 - storeDiscountRatio)) * (1 - volumeDiscountPct / 100);
      } else {
        computedPrice = matchingVariant.price * (1 - volumeDiscountPct / 100);
        computedOriginalPrice = matchingVariant.price;
      }
    } else {
      computedPrice = (discountedPrice || price) * (1 - volumeDiscountPct / 100);
    }
  } else if (selections.length > 0) {
    computedPrice = (discountedPrice || price) * (1 - volumeDiscountPct / 100);
  }

  // Recalculate discount % dynamically from computedPrice vs computedOriginalPrice
  let discount = 0;
  if (!currentQuantityVariant && computedOriginalPrice > computedPrice) {
    discount = Math.round(((computedOriginalPrice - computedPrice) / computedOriginalPrice) * 100);
  }

  const currentStock = selections.length > 0
    ? selections.reduce((min, sel) => {
      const v = getVariantForSelection(sel.colorIndex, sel.size);
      return Math.min(min, v?.stock ?? stock);
    }, stock)
    : stock;
  const maxSelectable = Math.max(1, Math.min(product?.maxQuantity || Infinity, currentStock || 0));
  const sizeOptions = sizes.length > 0 ? sizes : [];
  const totalWithGiftBox = computedPrice + (giftBoxAdded ? (product?.giftBox?.price ? Number(product.giftBox.price) : 50) : 0);

  const wished = product ? isWished(product.id) : false;

  const wishlistItem = product ? {
    id: product.id, name: product.name || 'Product', price: computedPrice,
    originalPrice: price, image: displayImg, category: product.category || '',
    href: product.href || `/products/${product.sourceId}`, colors: normalizedColors,
    badge: product.badge ?? null, rating: product.rating ?? 0, reviewCount: product.reviewCount ?? 0,
  } : null;

  const handleWishToggle = useCallback(() => { if (!wishlistItem) return; toggleItem(wishlistItem); }, [toggleItem, wishlistItem]);

  const buildCartItems = useCallback(() => {
    if (!product) return [];

    const itemsToCart: Omit<import("@/lib/cartContext").CartItem, "qty">[] = [];
    const sets = qty;

    for (let i = 0; i < sets; i++) {
      const setSelections = selections;

      const setPrice = computedOriginalPrice;
      const discountedSetPrice = computedPrice;

      const giftBoxPrice = giftBoxAdded ? (product.giftBox?.price ? Number(product.giftBox.price) : 50) : 0;
      const finalPrice = discountedSetPrice + giftBoxPrice;
      const finalOriginalPrice = (setPrice && setPrice > discountedSetPrice)
        ? setPrice + giftBoxPrice
        : null;

      const cartItem: Omit<import("@/lib/cartContext").CartItem, "qty"> = {
        id: String(product.sourceId) + `-${Date.now()}-${i}`,
        sourceId: String(product.sourceId),
        name: product.name || '',
        price: finalPrice,
        originalPrice: finalOriginalPrice,
        basePrice: discountedSetPrice,
        image: displayImg,
        color: normalizedColors[setSelections[0]?.colorIndex || 0]?.label || '',
        colorHex: normalizedColors[setSelections[0]?.colorIndex || 0]?.hex || '#c9a84c',
        size: setSelections[0]?.size || undefined,
        variantLabel: currentQuantityVariant ? currentQuantityVariant.label : undefined,
        sku: product.sku || '',
        href: product.href || `/products/${product.sourceId}`,
        category: product.category || '',
        categoryId: product.categoryId,
        subCategoryId: product.subCategoryId,
        style: product.style,
        styleId: product.styleId,
        paymentMode: product.paymentMode,
        customNote: allowCustomization && customData.wantCustom ? customData.globalNote : undefined,
        customImages: allowCustomization && customData.wantCustom ? customData.uploads : undefined,
        giftMessage: allowCustomization ? giftMessage.customMessage || undefined : undefined,
        giftBox: giftBoxAdded || undefined,
        giftBoxDetails: giftBoxAdded ? {
          heading: product.giftBox?.heading || 'Premium Gift Box',
          description: product.giftBox?.description || 'Rigid magnetic-close box · satin ribbon · message card',
          price: product.giftBox?.price ? Number(product.giftBox.price) : 50,
          image: product.giftBox?.image || GIFT_BOX_IMAGE,
        } : undefined,
        selectionGroups: [{
          type: 'selections',
          items: setSelections.map((sel, idx) => ({
            name: `Piece ${idx + 1}`,
            customData: {
              color: normalizedColors[sel.colorIndex]?.label || '',
              colorHex: normalizedColors[sel.colorIndex]?.hex || '#c9a84c',
              size: sel.size || undefined
            }
          }))
        }],
      };
      itemsToCart.push(cartItem);
    }
    return itemsToCart;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product, computedPrice, computedOriginalPrice, displayImg, selections, normalizedColors, customData, allowCustomization, qty, giftBoxAdded, giftMessage, currentQuantityVariant]);

  const isSelectionComplete = selections.length > 0 && selections.every(sel =>
    (normalizedColors.length === 0 || sel.colorIndex !== -1) &&
    (sizeOptions.length === 0 || sel.size !== '')
  );

  const handleBuyNow = useCallback(() => {
    if (!isSelectionComplete) {
      setErrorToast('Please select a color and size before proceeding.');
      return;
    }
    if (Number(currentStock) <= 0) {
      setErrorToast('This item is currently out of stock.');
      return;
    }
    const items = buildCartItems(); if (items.length === 0) return;
    items.forEach(item => addItem(item, false));
    router.push('/cart');
  }, [buildCartItems, addItem, router, isSelectionComplete, currentStock]);

  const handleAddToCart = useCallback(() => {
    if (!isSelectionComplete) {
      setErrorToast('Please select a color and size before adding to cart.');
      return;
    }
    if (Number(currentStock) <= 0) {
      setErrorToast('This item is currently out of stock.');
      return;
    }
    const items = buildCartItems(); if (items.length === 0) return;
    items.forEach(item => addItem(item));
    fireConfetti(cartBtnRef.current);
    setCartAnim(true); setSparkleAnim(true);
    later(() => setCartAnim(false), 700, 'cartAnim');
    later(() => setSparkleAnim(false), 800, 'sparkleAnim');
  }, [buildCartItems, addItem, isSelectionComplete, currentStock, later]);

  const handleColorChange = useCallback((productIndex: number, colorIndex: number) => {
    setSelections(prev => {
      const next = [...prev];
      const nextColor = normalizedColors[colorIndex];
      if (nextColor) {
        // Keep the currently selected size if it's still valid for this color, otherwise clear it.
        const currentSize = next[productIndex]?.size || '';
        const sizeValid = currentSize && variants.some((v) => normalizeText(v.color) === normalizeText(nextColor.label) && normalizeText(v.size) === normalizeText(currentSize));
        next[productIndex] = { colorIndex, size: sizeValid ? currentSize : '' };
      }
      return next;
    });
    const colorImg = normalizedColors[colorIndex]?.image;
    if (colorImg) {
      const foundIdx = currentImages.indexOf(colorImg);
      setActiveImg(foundIdx !== -1 ? foundIdx : 0);
    } else {
      setActiveImg(0);
    }
  }, [normalizedColors, variants, currentImages]);

  const handleSizeChange = useCallback((productIndex: number, size: string) => {
    setSelections(prev => {
      const next = [...prev];
      next[productIndex] = { ...next[productIndex], size };
      return next;
    });
    setActiveImg(0);
  }, []);

  // Slide the sticky add-to-cart bar in once the main buttons have scrolled off the top of the screen.
  useEffect(() => {
    const el = ctaRef.current;
    if (!el) { setShowSticky(false); return; }
    const io = new IntersectionObserver(([e]) => setShowSticky(!e.isIntersecting && e.boundingClientRect.top < 0), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, [product?.sourceId, loading, isFromCombo]);

  useEffect(() => { if (shipping === 'express') { /* payment locked to prepaid */ } }, [shipping, payment]);
  useEffect(() => {
    setQty(q => Math.min(q, maxSelectable));
  }, [maxSelectable]);

  if (loading) return <PdpSkeleton />;

  if (!product) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f5f0e8', fontFamily: 'Jost, sans-serif', gap: 16, padding: 20, textAlign: 'center' }}>
      <p style={{ fontSize: 28, color: '#3d4a22' }}>Product not found</p>
      <p style={{ fontSize: 13, color: 'rgba(30,35,16,.5)' }}>This product may have been removed or the link is incorrect.</p>
      <a href="/" style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: '#f5f0e8', background: '#3d4a22', padding: '12px 28px', borderRadius: 50, textDecoration: 'none' }}>Back to Home</a>
    </div>
  );

  const productName = product.name || '';
  const description = product.description || '';

  const dynamicAccordionItemsRaw: AccordionData[] = [
    ...(about ? [{ id: 'about', emoji: '💎', label: 'About the Product', content: `<div style="color: var(--ink);">${about.replace(/\n/g, '<br/>')}</div>`, isHtml: true }] : []),
    ...(description ? [{ id: 'desc', emoji: '📄', label: 'Product Description', content: description }] : []),
    ...(product?.sizeChartImage ? [{ id: 'sizechart', emoji: '📏', label: 'Size Chart', content: `<img src="${product.sizeChartImage}" alt="Size Chart" style="width: 100%; height: auto; display: block; border-radius: 8px;" /><div style="padding: 16px 0; font-size: 14px; color: var(--ink); line-height: 1.6; text-align: left; white-space: pre-wrap;">${product.sizeChartSteps ? product.sizeChartSteps : 'Tip: Measure your wrist/finger with a soft tape for the best fit.'}</div>`, isHtml: true }] : []),
    ...(faqs.length > 0 ? [{ id: 'faq', emoji: '❓', label: 'FAQs', content: faqs.map((f: { question: string; answer: string }) => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n') }] : []),
    {
      id: 'shipping',
      emoji: '🚚',
      label: 'Shipping Policy',
      isHtml: true,
      content: `
        <div class="pol">
          <div>
            <p class="pol-h">🌍 Where we ship</p>
            <p>We deliver across <strong>India</strong> through our website. For <strong>international orders</strong>, contact us on WhatsApp <a href="https://wa.me/918356939586">+91 8356939586</a> or <a href="mailto:makeyousparkle5@gmail.com">email</a> for a custom quote.</p>
          </div>

          <div>
            <p class="pol-h">📦 Rates &amp; timelines</p>
            <div class="pol-table-wrap">
              <table class="pol-table">
                <thead><tr><th>Method</th><th>Rate</th><th>Metro</th><th>Rest of India</th></tr></thead>
                <tbody>
                  <tr><td><strong>Standard</strong></td><td>₹60</td><td>3–5 days</td><td>4–7 days</td></tr>
                  <tr><td><strong>Express</strong></td><td>₹110</td><td>2–3 days</td><td>3–4 days</td></tr>
                </tbody>
              </table>
            </div>
            <div class="pol-note">💝 <strong>Free Standard Shipping</strong> on orders above ₹999.<br/>💵 <strong>COD</strong> available for an extra ₹70 fee (₹130 total shipping). Business days count from the day after you order.</div>
          </div>

          <div>
            <p class="pol-h">🚀 Dispatch</p>
            <ul>
              <li><span><strong>Standard:</strong> dispatched within 2 business days.</span></li>
              <li><span><strong>Express:</strong> orders placed before 11:00 PM are dispatched the same day.</span></li>
            </ul>
          </div>

          <div>
            <p class="pol-h">📍 Tracking &amp; changes</p>
            <p>Get updates via <strong>WhatsApp, SMS and Email</strong>, or track under <strong>Profile → Track Order</strong>. Address or item changes are only possible <strong>before dispatch</strong>, so contact us immediately.</p>
          </div>
        </div>
      `,
      linkHref: '/shipping-policy',
      linkLabel: 'Read full shipping policy',
    },
    {
      id: 'returns',
      emoji: '🔄',
      label: 'Returns, Refunds & Exchange',
      isHtml: true,
      content: `
        <div class="pol">
          <div class="pol-alert">🔒 <strong>Prepaid orders are final sale.</strong> No returns, cancellations or cash refunds for change of mind.</div>

          <div>
            <p class="pol-h">💵 Cancellations &amp; changes</p>
            <ul>
              <li><span><strong>COD orders</strong> can be cancelled only before our team processes them.</span></li>
              <li><span><strong>Product, size or colour changes</strong> are possible only before the order ships. Contact us on <a href="https://wa.me/918356939586">WhatsApp</a> or <a href="mailto:makeyousparkle5@gmail.com">email</a>.</span></li>
              <li><span><strong>Customised items</strong> are non-returnable unless damaged or incorrect.</span></li>
            </ul>
          </div>

          <div>
            <p class="pol-h">🔄 Exchange for damaged or wrong items</p>
            <ul>
              <li><span>Report within <strong>2–3 days</strong> of delivery.</span></li>
              <li><span>Share a single, unedited <strong>unboxing video</strong> (mandatory). It should start with a 360° view of the sealed package and shipping label, then show the opening and the defect.</span></li>
              <li><span>Send your <strong>Order ID + video</strong> via WhatsApp or email.</span></li>
              <li><span>For exchanges approved due to our error, we cover <strong>all shipping charges</strong>.</span></li>
            </ul>
          </div>

          <div>
            <p class="pol-h">💸 Refunds</p>
            <ul>
              <li><span><strong>Out of stock:</strong> if an approved exchange item is unavailable, you get a full refund to your original payment method.</span></li>
              <li><span><strong>Delayed delivery:</strong> refund if your order hasn't arrived within 30 days of dispatch due to courier issues.</span></li>
              <li><span><strong>Prepaid re-delivery:</strong> if a package is returned because you were unavailable or didn't accept it, shipping must be paid again for a new attempt.</span></li>
            </ul>
          </div>
        </div>
      `,
      linkHref: '/refund-policy',
      linkLabel: 'Read full returns policy',
    },
  ];
  const dynamicAccordionItems = dynamicAccordionItemsRaw.map((it) => (it.isHtml ? { ...it, content: stripEmoji(it.content) } : it));

  return (
    <>

      {/* Error Toast */}
      {errorToast && (
        <div style={{
          position: 'fixed', bottom: '40px', left: '50%', transform: 'translateX(-50%)',
          background: 'var(--red)', color: 'white', padding: '14px 24px',
          borderRadius: '18px', fontSize: '13px', fontWeight: 600, zIndex: 9999,
          boxShadow: '0 12px 32px rgba(192, 57, 43, 0.35)', animation: 'fadeUp 0.35s ease both',
          fontFamily: 'Jost, sans-serif', letterSpacing: '.03em',
          whiteSpace: 'normal', textAlign: 'center', lineHeight: 1.45,
          width: 'max-content', maxWidth: 'calc(100vw - 32px)',
        }}>
          {errorToast}
        </div>
      )}

      <style>{`
        ${PDP_BASE_CSS}
        :root {
          --beige:#ffffff; --beige-dk:#ede5d5; --beige-dkr:#d9cdb8;
          --olive-900:#1a1f0d; --olive-800:#252d12; --olive-600:#3d4a22;
          --olive-500:#5a6b2e; --olive-400:#7a8e3c; --olive-200:#c4cc9a;
          --olive-100:#e4e8cc; --olive-50:#f2f4e8;
          --gold:#c9a84c; --gold-lt:#e8d49a; --gold-glow:rgba(201,168,76,.13);
          --ink:#1e2310; --mist:rgba(30,35,16,.45); --red:#c0392b; --green:#2e7d32;
        }
        /* ── Gallery: NO overflow:hidden / fixed max-height (that clipped the thumbnails) ── */
        .pdp-gallery{
          position:sticky;top:80px;align-self:start;
          padding:32px 28px 32px 52px;
          display:flex;flex-direction:column;gap:14px;
          animation:fadeUp .6s ease both;min-width:0;
        }
        .pdp-main-img-wrap{
          position:relative;width:100%;flex:none;
          aspect-ratio:4/5;
          /* leave room for navbar + thumbnail row so both always fit in the viewport */
          max-height:calc(100vh - 80px - 64px - 100px);
          min-height:320px;
          background:var(--beige-dk);overflow:hidden;
        }
        .pdp-main-img{width:100%;height:100%;object-fit:cover;display:block;animation:imgIn .4s ease both}
        .pdp-badge{position:absolute;top:16px;left:16px;font-size:9.5px;font-weight:600;letter-spacing:.1em;color:var(--beige);background:var(--olive-600);padding:5px 14px 4px;border-radius:50px;z-index:3}
        .pdp-wish{position:absolute;top:14px;right:14px;width:36px;height:36px;border-radius:50%;background:rgba(245,240,232,.9);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:transform .2s,background .2s;z-index:3}
        .pdp-thumb-row{
          display:flex;gap:10px;flex-wrap:nowrap;flex-shrink:0;
          overflow-x:auto;padding:2px 2px 8px;
          scroll-snap-type:x proximity;-webkit-overflow-scrolling:touch;
        }
        .pdp-info{padding:32px 52px 40px 28px;animation:fadeUp .6s ease .1s both;min-width:0}
        .pdp-rating{display:flex;align-items:center;gap:6px;margin-bottom:14px;flex-wrap:wrap}
        .pdp-price{font-family:'Jost',serif;font-size:1.8rem;font-weight:600;letter-spacing:-.01em;color:var(--olive-900)}
        .pdp-tax{font-size:10px;color:var(--mist);margin-bottom:20px;letter-spacing:.04em}
        .pdp-qty-row{display:flex;align-items:center;gap:14px;margin-bottom:20px;flex-wrap:wrap}
        /* Complete the Look */
        .ctl-strip-eyebrow{font-size:11px;letter-spacing:.45em;text-transform:uppercase;color:#725912;white-space:nowrap;flex-shrink:0}
        /* CTA */
        .pdp-btn-wish svg{width:16px;height:16px;transition:fill .2s}
        .pdp-btn-cart svg{width:16px;height:16px}
        .pdp-btn-buy:active{transform:scale(.98)}
        /* Combo banner */
        .pdp-combo-banner{display:flex;align-items:flex-start;gap:12px;background:linear-gradient(135deg,rgba(184,152,42,.12),rgba(61,80,22,.08));border:1.5px solid rgba(184,152,42,.35);border-radius:14px;padding:14px 16px;margin-bottom:24px}
        .pdp-combo-banner-icon{font-size:22px;flex-shrink:0;line-height:1}
        .pdp-combo-banner-title{font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#6b5010;margin-bottom:4px}
        .pdp-combo-banner-text{font-size:12px;font-weight:400;color:rgba(30,31,13,.6);line-height:1.65}
        .pdp-combo-back-btn{display:inline-flex;align-items:center;gap:6px;margin-top:10px;font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#3d4a22;background:white;border:1.5px solid rgba(61,74,34,.25);border-radius:50px;padding:8px 16px;cursor:pointer;transition:all .2s;font-family:'Jost',sans-serif}
        @media(hover:hover){.pdp-combo-back-btn:hover{background:var(--olive-50);border-color:var(--olive-400)}}
        /* Trust */
        .pdp-trust{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:28px}
        .pdp-trust-title{font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--olive-600);margin-bottom:2px}
        /* Customisation */
        .pdp-cust-banner{background:linear-gradient(135deg,rgba(201,168,76,.1),rgba(90,110,35,.08));border:1.5px solid rgba(201,168,76,.3);border-radius:16px;padding:16px 18px 18px;margin-bottom:20px}
        .pdp-cust-banner-sub{font-size:12px;font-weight:400;color:#101010;line-height:1.7;letter-spacing:.03em;margin-bottom:14px}
        .cust-info-chip p{font-size:10.5px;font-weight:400;color:#101010;line-height:1.7;letter-spacing:.03em}
        .cust-note-global{width:100%;min-height:72px;resize:vertical;border:1.5px solid var(--beige-dkr);border-radius:12px;padding:11px 14px;font-family:'Jost',sans-serif;font-size:16px;font-weight:300;color:#101010;background:white;outline:none;margin-bottom:14px;transition:border-color .2s}
        /* Gift Message */
        .gift-msg-panel{background:linear-gradient(135deg,rgba(201,168,76,.06),rgba(245,240,232,.6));border:1.5px solid rgba(201,168,76,.25);border-radius:16px;padding:16px 18px 18px;margin-bottom:20px}
        .gift-msg-select{width:100%;appearance:none;-webkit-appearance:none;background:white;border:1.5px solid var(--beige-dkr);border-radius:12px;padding:11px 38px 11px 14px;font-family:'Jost',sans-serif;font-size:16px;font-weight:400;color:var(--ink);cursor:pointer;outline:none;transition:border-color .2s,box-shadow .2s}
        .gift-msg-select:focus{border-color:var(--olive-400);box-shadow:0 0 0 3px rgba(90,110,35,.1)}
        .gift-msg-free-textarea{width:100%;resize:vertical;border:1.5px solid var(--beige-dkr);border-radius:0;padding:12px 14px;font-family:'Jost',sans-serif;font-size:16px;font-weight:300;color:var(--ink);background:white;outline:none;line-height:1.75;letter-spacing:.03em;transition:border-color .2s,box-shadow .2s;min-height:80px;border-left:3px solid var(--gold)}
        .gift-msg-free-textarea:focus{border-color:var(--olive-400);border-left-color:var(--olive-500);box-shadow:0 0 0 3px rgba(90,110,35,.07)}
        /* Reviews */
        .rev-section{max-width:1280px;margin:0 auto;padding:48px 52px 56px;background:var(--beige);border-top:1px solid rgba(61,74,34,.08)}
        .rev-header{display:flex;align-items:center;gap:20px;margin-bottom:36px}
        .rev-controls{display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:10px;margin-bottom:20px}
        .rev-write-btn{font-family:'Jost',sans-serif;font-size:11px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:#fff;background:var(--olive-600);border:none;border-radius:50px;padding:12px 28px;cursor:pointer;transition:background .2s,transform .15s}
        @media(hover:hover){.rev-write-btn:hover{background:var(--olive-500)}}
        .rev-write-btn:active{transform:scale(.98)}
        .rev-name{font-size:13px;font-weight:600;color:var(--ink);letter-spacing:.02em}
        .rev-card-title{font-size:14px;font-weight:600;color:var(--ink);margin-bottom:8px;letter-spacing:.02em}
        .rev-card-body{font-size:13px;font-weight:400;color:#101010;line-height:1.85;letter-spacing:.03em;margin-bottom:16px;overflow-wrap:anywhere}
        .rev-card-foot{display:flex;align-items:center;gap:10px;border-top:1px solid rgba(61,74,34,.07);padding-top:12px}
        .rev-helpful-label{font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--mist)}
        .rev-helpful-btn{display:flex;align-items:center;gap:5px;font-size:11px;font-weight:600;color:var(--olive-600);background:var(--olive-50);border:1px solid rgba(61,74,34,.12);border-radius:50px;padding:5px 12px;cursor:pointer;transition:all .2s;font-family:'Jost',sans-serif}
        @media(hover:hover){.rev-helpful-btn:hover{background:var(--olive-100);border-color:var(--olive-400)}}
        /* Policy dropdown content */
        .acc-nav-link-row{display:flex;align-items:center;justify-content:space-between;padding:16px 4px;text-decoration:none;color:var(--ink);border-bottom:1px solid rgba(61,74,34,.08);font-family:'Jost',sans-serif;font-size:13px;font-weight:500;letter-spacing:.02em;transition:background .15s}
        @media(hover:hover){.acc-nav-link-row:hover{background:rgba(61,74,34,.03)}}
        .acc-nav-link-row svg{color:var(--mist);flex-shrink:0;transition:transform .2s}
        @media(hover:hover){.acc-nav-link-row:hover svg{transform:translateX(3px)}}
        /* Large desktop */
        @media(min-width:1440px){
          .pdp-gallery{padding-left:64px}
          .pdp-info{padding-right:64px}
          .rev-section{max-width:1440px;padding-left:64px;padding-right:64px}
        }
        /* Small laptop */
        @media(min-width:961px) and (max-width:1200px){
          .pdp-gallery{padding:28px 20px 28px 32px}
          .pdp-info{padding:28px 32px 40px 20px}
          .rev-section{padding-left:32px;padding-right:32px}
        }
        /* Short laptop screens: keep the image + thumbnails inside the viewport */
        @media(min-width:961px) and (max-height:700px){
          .pdp-main-img-wrap{min-height:260px}
        }
        /* Tablet */
        @media(max-width:960px){
          .pdp-gallery{position:static;padding:24px 24px 0;max-width:720px;margin:0 auto;width:100%}
          .pdp-main-img-wrap{aspect-ratio:1/1;max-height:none;min-height:0}
          .pdp-info{padding:24px 24px 48px;max-width:720px;margin:0 auto;width:100%}
          .rev-section{padding:40px 24px 48px}
        }
        /* Mobile */
        @media(max-width:600px){
          .pdp-gallery{padding:12px 16px 0}
          .pdp-main-img-wrap{aspect-ratio:4/5;max-height:70vh}
          .pdp-info{padding:20px 16px 40px}
          .pdp-trust{grid-template-columns:repeat(3,minmax(80px,1fr));gap:7px;overflow-x:auto;padding-bottom:4px;-webkit-overflow-scrolling:touch;scrollbar-width:none}
          .pdp-trust-title{font-size:8.5px;letter-spacing:.03em}
          .ctl-strip-eyebrow{letter-spacing:.3em;font-size:10px}
          .rev-section{padding:32px 16px 40px}
          .rev-header{gap:12px}
          .rev-controls{flex-direction:column;align-items:center}
          .pdp-cust-banner{padding:14px 12px 16px}
          .gift-msg-panel{padding:14px 12px 16px}
        }
        ${PDP_THEME_CSS}
      `}</style>

      <div className="pdp">
        <nav className="pdp-crumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link><span>/</span>
          <Link href="/categories">Shop</Link>
          {category && <><span>/</span><span>{category}</span></>}
          <span>/</span><span className="pdp-crumb-cur">{productName}</span>
        </nav>
        <div className="pdp-layout" style={{ paddingTop: 0 }}>

          {/* ── Gallery ─────────────────────────────────────────────────────── */}
          <div className="pdp-gallery" ref={galleryColRef}>
            <PdpGallery
              images={currentImages}
              active={activeImg}
              onChange={setActiveImg}
              alt={productName}
              soldOut={Number(currentStock) <= 0}
              chip={product.offerTag || product.offer || product.badge || undefined}
              fallback={FALLBACK_PRODUCT_IMAGE}
              wish={!isFromCombo ? (
                <button type="button" className={`${pdpStyles.wishBtn}${wished ? ` ${pdpStyles.wishOn}` : ''}`} onClick={handleWishToggle} aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'} aria-pressed={wished}>
                  <svg width="19" height="19" viewBox="0 0 24 24" fill={wished ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                </button>
              ) : null}
            />
          </div>

          {/* ── Info ────────────────────────────────────────────────────────── */}
          <div className="pdp-info" ref={infoColRef}>
            {(dynamicReviewCount > 0 || gender) && (
              <div className="pdp-rating" style={{ marginBottom: 8 }}>
                {dynamicReviewCount > 0 && (
                  <>
                    <a href="#reviews" className="pdp-stars" style={{ textDecoration: 'none' }} aria-label={`${dynamicRating} out of 5 stars`}>{'★'.repeat(Math.round(dynamicRating))}{'☆'.repeat(5 - Math.round(dynamicRating))}</a>
                    <span className="pdp-rating-num">{dynamicRating}</span>
                    <a href="#reviews" className="pdp-review-cnt" style={{ textDecoration: 'underline' }}>({dynamicReviewCount} {dynamicReviewCount === 1 ? 'review' : 'reviews'})</a>
                  </>
                )}
                {gender && <span style={{ fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--gold)', background: 'rgba(201,168,76,.12)', padding: '2px 8px', borderRadius: 4, marginLeft: dynamicReviewCount > 0 ? 6 : 0 }}>{gender}</span>}
              </div>
            )}

            <h1 className="pdp-name">{productName}</h1>

            <div className="pdp-info-top">
              <div className="pdp-price-row">
                <span className="pdp-price">₹{Math.round(computedPrice).toLocaleString('en-IN')}</span>
                {computedOriginalPrice > computedPrice && (
                  <>
                    <span className="pdp-original">₹{Math.round(computedOriginalPrice).toLocaleString('en-IN')}</span>
                    <span className="pdp-discount">
                      Save ₹{Math.round(computedOriginalPrice - computedPrice).toLocaleString('en-IN')}{discount > 0 ? ` · ${discount}% off` : ''}
                    </span>
                  </>
                )}
              </div>
              <p className="pdp-tax">Inclusive of all taxes</p>
              {/* An offer worth reading (e.g. "Buy 3 get 1 free"); the plain "10% off" is already the pill above */}
              {discountTag && !/^\s*\d+(\.\d+)?\s*%\s*off\s*$/i.test(discountTag) && (
                <div className="pdp-offer">
                  <span className="pdp-offer-icon"><Em c="🏷" size="1.05em" /></span>
                  <span className="pdp-offer-text">{discountTag}</span>
                </div>
              )}
            </div>

            {hasQuantityVariants && (
              <div style={{ marginBottom: 20 }}>
                <p className="pdp-section-label" style={{ marginBottom: 10 }}>Select Option</p>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {quantityVariants.map((v: any, i: number) => (
                    <button
                      key={v._id || i}
                      type="button"
                      onClick={() => setSelectedVariantIndex(i)}
                      style={{
                        padding: '10px 16px',
                        border: selectedVariantIndex === i ? '1.5px solid var(--olive-600)' : '1.5px solid var(--beige-dkr)',
                        borderRadius: '8px',
                        background: selectedVariantIndex === i ? 'var(--olive-50)' : 'white',
                        color: selectedVariantIndex === i ? 'var(--olive-600)' : 'var(--ink)',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: '4px'
                      }}
                    >
                      <span>{v.label}</span>
                      <span style={{ fontSize: '11px', fontWeight: 400, color: 'var(--mist)' }}>₹{v.price}</span>
                    </button>
                  ))}
                </div>
                <div className="pdp-divider" />
              </div>
            )}

            {/* Stock / limit note (the quantity stepper now lives next to Add to Cart) */}
            {!isFromCombo && (currentStock === 0 || product?.maxQuantity || currentStock <= 10) && (
              <>
                <p className="pdp-stock" style={{ color: currentStock === 0 ? 'var(--red)' : undefined, margin: 0 }}>
                  {currentStock === 0
                    ? 'Out of stock'
                    : product?.maxQuantity
                      ? `Limit: ${product.maxQuantity} per order`
                      : `Only ${currentStock} left in stock!`}
                </p>
                <div className="pdp-divider" />
              </>
            )}

            {selections.map((sel, pIdx) => {
              const selectedColorLabel = normalizeText(normalizedColors[sel.colorIndex]?.label || '');
              return (
                <div key={pIdx} style={{ marginBottom: pIdx < selections.length - 1 ? 24 : 0 }}>
                  {numberOfProducts > 1 && (
                    <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--olive-600)', marginBottom: 12, letterSpacing: '.05em', textTransform: 'uppercase' }}>
                      Item {pIdx + 1}
                    </h3>
                  )}

                  <div className="pdp-swatches">
                    {normalizedColors.map((c, i) => (
                      <button key={c.label + i} type="button" className="pdp-swatch-btn" onClick={() => handleColorChange(pIdx, i)} title={c.label}>
                        {c.image ? (
                          <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={c.image}
                              alt={c.label}
                              style={{
                                width: '56px', height: '56px', borderRadius: '4px', objectFit: 'cover',
                                border: sel.colorIndex === i ? '2px solid var(--olive-600)' : '1px solid var(--beige-dkr)',
                                padding: sel.colorIndex === i ? '2px' : '0',
                                transition: 'all 0.2s',
                              }}
                            />
                            <span className="pdp-swatch-label" style={{ fontSize: '13px' }}>{c.label}</span>
                          </>
                        ) : (
                          <span
                            style={{
                              padding: '9px 16px', borderRadius: 50, fontSize: 13, fontWeight: 600,
                              border: sel.colorIndex === i ? '1.5px solid var(--olive-600)' : '1.5px solid var(--beige-dkr)',
                              background: sel.colorIndex === i ? 'var(--olive-600)' : 'white',
                              color: sel.colorIndex === i ? 'var(--beige)' : 'var(--olive-600)',
                              transition: 'all .2s', whiteSpace: 'nowrap',
                            }}
                          >
                            {c.label}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>


                  {sizeOptions.length > 0 && (
                    <>
                      <p className="pdp-section-label">Size: <span>{sel.size || sizeOptions[0]}</span></p>
                      <div className="pdp-sizes">
                        {sizeOptions.map((size) => {
                          const isAvailable = Boolean(variants.find((v) => normalizeText(v.color) === selectedColorLabel && normalizeText(v.size) === normalizeText(size)) || variants.some((v) => normalizeText(v.size) === normalizeText(size)));
                          return (
                            <button key={size} type="button" className={`pdp-size-btn${sel.size === size ? ' active' : ''}`} disabled={!isAvailable} onClick={() => handleSizeChange(pIdx, size)}>{size}</button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
            {tags.length > 0 && (
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  width: 1, height: 1,
                  overflow: 'hidden',
                  opacity: 0,
                  pointerEvents: 'none',
                }}
              >
                {tags.map((tag: string) => (
                  <span key={tag}>#{tag}</span>
                ))}
              </div>
            )}
            {/* One divider closes the options block. Skipped when there are no options and the quantity block or stock
                note above already drew one, so two lines never stack with nothing between them. */}
            {(normalizedColors.length > 0 || sizeOptions.length > 0 || numberOfProducts > 1
              || !(hasQuantityVariants || (!isFromCombo && (currentStock === 0 || product?.maxQuantity || currentStock <= 10)))) && (
              <div className="pdp-divider" />
            )}

            {allowCustomization && (
              <>
                <div className="pdp-cust-banner">
                  <div className="pdp-cust-banner-head">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                    Make it Yours — Customise this {category}
                  </div>
                  <p className="pdp-cust-banner-sub">This {category.toLowerCase()} can be personalised with your own photos, names, or a special message.</p>
                  <CustomisationPanel category={category} maxCustomImages={product.maxCustomImages || 1} customImageLabels={product.customImageLabels} onChange={setCustomData} />
                </div>
                <div className="pdp-divider" />
              </>
            )}

            {!isFromCombo && (
              <>
                {allowCustomization && (
                  <>
                    <GiftMessagePanel value={giftMessage} onChange={setGiftMessage} />
                    <div className="pdp-divider" />
                  </>
                )}
              </>
            )}

            {isFromCombo ? (
              <div className="pdp-combo-banner">
                <span className="pdp-combo-banner-icon"><Em c="🛍" size="1.2em" /></span>
                <div>
                  <div className="pdp-combo-banner-title">Part of your hamper</div>
                  <p className="pdp-combo-banner-text">
                    You&apos;re viewing this piece as part of a curated hamper. To add it to your cart, go back and use the hamper builder.
                  </p>
                  <button className="pdp-combo-back-btn" onClick={() => router.back()}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M19 12H5M12 5l-7 7 7 7" />
                    </svg>
                    Back to Hamper
                  </button>
                </div>
              </div>
            ) : (
              <div className="pdp-cta-row" ref={ctaRef}>
                <div className="pdp-qty pdp-qty--cta" role="group" aria-label="Quantity">
                  <button type="button" className="pdp-qty-btn" aria-label="Decrease quantity" onClick={() => setQty(q => Math.max(1, q - 1))} disabled={qty <= 1}>−</button>
                  <span className="pdp-qty-val" aria-live="polite">{qty}</span>
                  <button type="button" className="pdp-qty-btn" aria-label="Increase quantity" onClick={() => setQty(q => Math.min(maxSelectable, q + 1))} disabled={qty >= maxSelectable}
                    style={{ opacity: qty >= maxSelectable ? 0.4 : 1, cursor: qty >= maxSelectable ? 'not-allowed' : 'pointer' }}>+</button>
                </div>
                <div className="pdp-btn-cart-wrap">
                  <button ref={cartBtnRef} className={`pdp-btn-cart${cartAnim ? ' bounce' : ''}`} onClick={handleAddToCart} disabled={Number(currentStock) <= 0}
                    style={{ opacity: Number(currentStock) <= 0 ? 0.5 : 1, cursor: Number(currentStock) <= 0 ? 'not-allowed' : 'pointer' }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
                    {Number(currentStock) <= 0 ? 'Sold Out' : cartAnim ? 'Added! ✓' : `Add to Cart · ₹${Math.round(totalWithGiftBox).toLocaleString('en-IN')}`}
                  </button>
                  <Sparkles active={sparkleAnim} />
                </div>
                <button className="pdp-btn-buy" onClick={handleBuyNow} disabled={Number(currentStock) <= 0}
                  style={{ opacity: Number(currentStock) <= 0 ? 0.5 : 1, cursor: Number(currentStock) <= 0 ? 'not-allowed' : 'pointer' }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                  {Number(currentStock) <= 0 ? 'Currently Unavailable' : 'Buy It Now'}
                </button>
              </div>
            )}

            <div className="pdp-trust">
              {TRUST_BADGES.map((b, i) => (
                <div key={i} className="pdp-trust-item">
                  <div className="pdp-trust-icon">{b.icon}</div>
                  <div className="pdp-trust-title">{b.title}</div>
                  <div className="pdp-trust-sub">{b.sub}</div>
                </div>
              ))}
            </div>

            {/* Premium Gift Box upsell — show when NOT in combo context and giftBox is enabled in the product data */}
            {!isFromCombo && product?.giftBox?.enabled && (
              <>
                <div style={{ height: 16 }} />
                <GiftBoxUpsell
                  added={giftBoxAdded}
                  onToggle={() => setGiftBoxAdded(v => !v)}
                  image={product.giftBox?.image || GIFT_BOX_IMAGE}
                  heading={product.giftBox?.heading || 'Premium Gift Box'}
                  description={product.giftBox?.description || 'Rigid magnetic-close box · satin ribbon · message card'}
                  price={product.giftBox?.price ? Number(product.giftBox.price) : 50}
                />
              </>
            )}
            {!isFromCombo && (
              <>
                <div className="pdp-divider" />
                <CompleteTheLookStrip items={product?.crossProducts} />
              </>
            )}
            <div className="pdp-divider" />

            <div className="pdp-accordion">
              {dynamicAccordionItems.map(item => (
                <AccordionItem
                  key={item.id}
                  item={item}
                  open={openAccordion === item.id}
                  onToggle={() => setOpenAccordion(o => o === item.id ? null : item.id)}
                />
              ))}
            </div>
            <EstimatedDeliveryBlock />
          </div>
        </div>

        <PdpWorn photos={product.wornPhotos} />
        <PdpReviews productId={product.sourceId} reviews={productReviews} setReviews={setProductReviews} />
        <PdpShelves product={product} />
        <div style={{ height: 56 }} />
        {!isFromCombo && (
          <PdpStickyBar
            show={showSticky}
            image={displayImg}
            name={productName}
            price={totalWithGiftBox}
            original={computedOriginalPrice}
            soldOut={Number(currentStock) <= 0}
            onAdd={handleAddToCart}
            qty={qty}
            maxQty={maxSelectable}
            onQty={(d) => setQty((q) => Math.max(1, Math.min(maxSelectable, q + d)))}
          />
        )}
      </div>
    </>
  );
}