

'use client';   
import { useState, useRef, useCallback, useEffect, type ChangeEvent, type DragEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchProductById, fetchProductReviews, submitProductReview, type CatalogProduct, type ReviewData } from '@/lib/catalogApi';
import { useAuth } from '@/lib/authContext';
import { useCart } from '@/lib/cartContext';
import { fireConfetti } from '@/components/cart/ConfettiManager';
import { useWishlist } from '@/lib/wishlistContext';
import Link from 'next/link';

import UpperNav from '@/components/ui/UpperNav';

interface AccordionData {
  id: string;
  emoji: string;
  label: string;
  content: string;
  isHtml?: boolean;
  linkHref?: string;
  linkLabel?: string;
}

interface ProductColor {
  label: string;
  hex: string;
}

interface UploadItem {
  id: number;
  file: File;
  preview: string;
  note: string;
}

const FALLBACK_PRODUCT_IMAGE = '/images/hero.png';
// ── Replace with actual size chart image path ──
const SIZE_CHART_IMAGE = '/images/size-chart.jpg';
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
        <rect x="4" y="18" width="28" height="18" rx="2"/>
        <path d="M32 22h4l6 8v6h-10V22z"/>
        <circle cx="14" cy="38" r="3"/>
        <circle cx="36" cy="38" r="3"/>
        <path d="M4 26h28"/>
        <path d="M10 14h4M16 11v6"/>
      </svg>
    ),
    title: 'Free Shipping',
    sub: 'On orders above ₹999',
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M24 6C14 6 8 14 8 22c0 10 16 22 16 22s16-12 16-22c0-8-6-16-16-16z"/>
        <path d="M20 22l3 3 6-6"/>
      </svg>
    ),
    title: 'COD Available',
    sub: 'On all orders',
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 24h26M24 14l12 10-12 10"/>
        <circle cx="38" cy="24" r="6"/>
        <path d="M6 16v16"/>
      </svg>
    ),
    title: 'Express Delivery',
    sub: '2–3 business days',
  },
];

const PRESET_MESSAGES = [
  { value: '', label: 'Choose a message template…' },
  { value: 'happy_mothers_day', label: '💐 Happy Mother\'s Day' },
  { value: 'happy_birthday', label: '🎂 Happy Birthday' },
  { value: 'i_am_sorry', label: '🙏 I\'m Sorry' },
  { value: 'congratulations', label: '🎉 Congratulations' },
  { value: 'thank_you', label: '🤍 Thank You' },
  { value: 'i_love_you', label: '❤️ I Love You' },
  { value: 'get_well_soon', label: '🌸 Get Well Soon' },
  { value: 'merry_christmas', label: '🎄 Merry Christmas' },
  { value: 'happy_anniversary', label: '💍 Happy Anniversary' },
  { value: 'just_because', label: '✨ Just Because' },
];

// ─── Size Chart Lightbox ──────────────────────────────────────────────────────
function SizeChartLightbox({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', handleKey); document.body.style.overflow = ''; };
  }, [onClose]);

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(10,14,5,.82)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px', animation: 'fadeUp .22s ease both',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--beige)', borderRadius: 20,
          overflow: 'hidden', maxWidth: 540, width: '100%',
          maxHeight: '90vh', display: 'flex', flexDirection: 'column',
          boxShadow: '0 32px 80px rgba(0,0,0,.4)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', borderBottom: '1px solid rgba(61,74,34,.1)',
          flexShrink: 0,
        }}>
          <div>
            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.22em', textTransform: 'uppercase', color: 'var(--olive-500)', marginBottom: 2 }}>Reference Guide</p>
            <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--olive-900)', fontFamily: 'Cormorant Garamond, serif' }}>Size Chart</p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 34, height: 34, borderRadius: '50%', border: '1.5px solid rgba(61,74,34,.15)',
              background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--mist)', transition: 'all .2s',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        {/* Image */}
        <div style={{ overflow: 'auto', flexShrink: 1 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={SIZE_CHART_IMAGE}
            alt="Size Chart"
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>
        {/* Footer tip */}
        <div style={{
          padding: '12px 20px', borderTop: '1px solid rgba(61,74,34,.08)',
          fontSize: 10, color: 'var(--mist)', letterSpacing: '.06em',
          background: 'var(--beige-dk)', flexShrink: 0,
        }}>
          📏 &nbsp;Tip: Measure your wrist/finger with a soft tape for the best fit.
        </div>
      </div>
    </div>
  );
}

// ─── Premium Gift Box Upsell ──────────────────────────────────────────────────
function GiftBoxUpsell({ added, onToggle }: { added: boolean; onToggle: () => void }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'stretch',
      border: `1.5px solid ${added ? 'rgba(201,168,76,.55)' : 'rgba(61,74,34,.13)'}`,
      borderRadius: 14, overflow: 'hidden',
      background: added ? 'linear-gradient(135deg,rgba(201,168,76,.07),rgba(245,240,232,.8))' : 'white',
      transition: 'border-color .25s, background .25s',
      marginBottom: 20,
    }}>
      {/* Square image, left side */}
      <div style={{ width: '38%', aspectRatio: '1', flexShrink: 0, position: 'relative', overflow: 'hidden', background: 'var(--beige-dk)' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={GIFT_BOX_IMAGE}
          alt="Premium Gift Box"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(160deg,rgba(255,255,255,.18) 0%,rgba(255,255,255,0) 60%)',
          pointerEvents: 'none',
        }} />
      </div>

      {/* Text content, right side */}
      <div style={{ flex: 1, padding: '12px 14px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4, minWidth: 0 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          background: 'rgba(201,168,76,.13)', border: '1px solid rgba(201,168,76,.3)',
          borderRadius: 50, padding: '2px 9px', width: 'fit-content',
          fontSize: 9, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase',
          color: '#8c6b20',
        }}>
         
          7 in 10 gifters choose this
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--olive-900)', letterSpacing: '.01em', lineHeight: 1.2 }}>
            Premium Gift Box
          </p>
          <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--olive-600)', flexShrink: 0 }}>+₹99</span>
        </div>

        <p style={{ fontSize: 10, fontWeight: 400, color: '#101010', lineHeight: 1.5, letterSpacing: '.02em' }}>
          Rigid magnetic-close box · satin ribbon · message card
        </p>

        <button
          onClick={onToggle}
          style={{
            marginTop: 6,
            display: 'inline-flex', alignItems: 'center', gap: 6,
            alignSelf: 'flex-start',
            fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase',
            color: added ? 'var(--beige)' : 'var(--olive-600)',
            background: added ? 'var(--olive-600)' : 'transparent',
            border: `1.5px solid ${added ? 'var(--olive-600)' : 'rgba(61,74,34,.25)'}`,
            borderRadius: 50, padding: '6px 14px',
            cursor: 'pointer', transition: 'all .22s',
            fontFamily: 'Jost, sans-serif',
          }}
        >
          {added ? (
            <>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8"><polyline points="20 6 9 17 4 12"/></svg>
              Added
            </>
          ) : (
            <>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add to order
            </>
          )}
        </button>
      </div>
    </div>
  );
}
// ─── Reviews Section ──────────────────────────────────────────────────────────
function ReviewsSection({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [visibleCount, setVisibleCount] = useState(3);
  const [filterStar, setFilterStar] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formState, setFormState] = useState({ rating: 5, title: '', body: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const { user, token } = useAuth();

  useEffect(() => {
    fetchProductReviews(productId).then(setReviews);
  }, [productId]);

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
      setFormState({ rating: 5, title: '', body: '' });
    } else {
      setErrorMsg(res.message || 'Failed to submit review.');
    }
  };

  const totalReviews = reviews.length;
  const avgRating = totalReviews ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1) : '0.0';
  const ratingDist = [5,4,3,2,1].map(stars => {
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

      <div className="rev-controls" style={{ justifyContent: 'space-between' }}>
        <div>
          {filterStar !== null && <button className="rev-clear-filter" onClick={() => setFilterStar(null)}>Showing {filterStar}★ only &nbsp;×</button>}
        </div>
        {!showForm && (
          <button className="rev-helpful-btn" style={{ background: 'var(--olive-600)', color: 'white' }} onClick={() => setShowForm(true)}>
            Write a Review
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: 'white', padding: 24, borderRadius: 18, border: '1px solid rgba(61,74,34,.07)', marginBottom: 20, animation: 'fadeUp .3s ease both' }}>
          <h3 style={{ fontSize: 16, color: 'var(--olive-900)', marginBottom: 16 }}>Write a Review</h3>
          {errorMsg && <div style={{ color: 'var(--red)', fontSize: 12, marginBottom: 12 }}>{errorMsg}</div>}
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
             {[1,2,3,4,5].map(star => (
               <span key={star} onClick={() => setFormState(s => ({ ...s, rating: star }))} style={{ fontSize: 24, cursor: 'pointer', color: star <= formState.rating ? 'var(--gold)' : '#ccc' }}>★</span>
             ))}
          </div>
          <input required placeholder="Review Title" value={formState.title} onChange={e => setFormState(s => ({ ...s, title: e.target.value }))} style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--beige-dkr)', borderRadius: 8, marginBottom: 12, fontSize: 13, outline: 'none' }} />
          <textarea required placeholder="Write your comments..." value={formState.body} onChange={e => setFormState(s => ({ ...s, body: e.target.value }))} rows={4} style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--beige-dkr)', borderRadius: 8, marginBottom: 16, fontSize: 13, outline: 'none', resize: 'vertical' }} />
          <div style={{ display: 'flex', gap: 10 }}>
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
                  {r.isVerifiedPurchase && <span className="rev-verified"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Verified purchase</span>}
                </div>
                <div className="rev-meta-row" style={{ marginTop: 3 }}>
                  <span className="rev-stars-sm">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                  <span className="rev-date">{new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
              </div>
            </div>
            <p className="rev-card-title">{r.title}</p>
            <p className="rev-card-body">{r.body}</p>
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

function CompleteTheLookStrip() {
  return (
    <div className="ctl-strip">
      <div className="ctl-strip-header">
        <span className="ctl-strip-eyebrow">Complete the Look</span>
        <span className="ctl-strip-rule" />
      </div>
      <div className="ctl-strip-scroll">
        {GOES_WELL_WITH.map((item, i) => {
          const disc = Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100);
          return (
            <a key={item.id} href={item.href} className="ctl-card" style={{ animationDelay: `${i * 0.07}s` }}>
              <div className="ctl-img-wrap">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image} alt={item.name} className="ctl-img" />
                <span className="ctl-disc-badge">{disc}% off</span>
              </div>
              <div className="ctl-card-info">
                <p className="ctl-card-name">{item.name}</p>
                <div className="ctl-card-price-row">
                  <span className="ctl-card-price">₹{item.price.toLocaleString('en-IN')}</span>
                  <span className="ctl-card-original">₹{item.originalPrice.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}

// ─── Accordion item ───────────────────────────────────────────────────────────
function AccordionItem({ item, open, onToggle }: { item: AccordionData; open: boolean; onToggle: () => void }) {
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const [height, setHeight] = useState(0);
  useEffect(() => { if (bodyRef.current) setHeight(open ? bodyRef.current.scrollHeight : 0); }, [open]);

  return (
    <div className={`acc-item${open ? ' acc-item--open' : ''}`}>
      <button className="acc-head" onClick={onToggle}>
        <span className="acc-head-left"><span className="acc-emoji">{item.emoji}</span>{item.label}</span>
        <span className="acc-chevron"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg></span>
      </button>
      <div className="acc-body-wrap" style={{ maxHeight: height, overflow: 'hidden', transition: 'max-height 0.38s cubic-bezier(.4,0,.2,1)' }}>
        <div ref={bodyRef} className="acc-body">
          {item.isHtml
            ? <div dangerouslySetInnerHTML={{ __html: item.content }} style={{ lineHeight: 1.85, fontSize: 12, fontWeight: 300, color: 'var(--mist)', letterSpacing: '.03em' }} />
            : item.content.split('\n').map((line: string, i: number) => <p key={i} style={{ marginBottom: line === '' ? 8 : 0 }}>{line || '\u00A0'}</p>)
          }
          {item.linkHref && item.linkLabel && (
            <Link href={item.linkHref} className="acc-policy-link">
              {item.linkLabel}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Estimated Delivery Block ─────────────────────────────────────────────────
function EstimatedDeliveryBlock() {
  return (
    <div style={{ marginTop: 16 }}>
      <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--olive-600)', marginBottom: 10 }}>
        Estimated Delivery
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {[
          { icon: '🚚', label: 'Standard', rate: '₹60', metro: '3–5 business days', rest: '4–7 business days' },
          { icon: '⚡', label: 'Express', rate: '₹110', metro: '2–3 business days', rest: '3–4 business days' },
        ].map(opt => (
          <div key={opt.label} style={{
            border: '1.5px solid rgba(61,74,34,.15)', borderRadius: 14,
            padding: '14px 12px', background: 'white',
          }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>{opt.icon}</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--ink)', marginBottom: 10 }}>{opt.label}</div>

            <div style={{ marginBottom: 6 }}>
              <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--olive-500)', marginBottom: 1 }}>Metro Cities</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.3 }}>{opt.metro}</div>
            </div>

            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--olive-500)', marginBottom: 1 }}>Rest of India</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.3 }}>{opt.rest}</div>
            </div>

            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--olive-600)' }}>{opt.rate}</div>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: 10, padding: '11px 14px',
        background: 'linear-gradient(135deg, #e6f4e7, #f0faf0)',
        border: '1.5px solid rgba(45,90,39,.22)', borderRadius: 10,
        display: 'flex', alignItems: 'center', gap: 9,
        fontSize: 12, fontWeight: 700, color: '#0a2e12', lineHeight: 1.4,
      }}>
        <span style={{ fontSize: 18, flexShrink: 0 }}>🎁</span>
        <span>Free Standard Shipping on orders above <strong>₹999</strong></span>
      </div>
    </div>
  );
}

// ─── Sparkles ─────────────────────────────────────────────────────────────────
function Sparkles({ active }: { active: boolean }) {
  if (!active) return null;
  const pts = Array.from({ length: 10 }, (_, i) => {
    const angle = (i / 10) * 360;
    const dist  = 30 + Math.random() * 24;
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
function CustomisationPanel({ category, onChange }: { category: string, onChange?: (data: { wantCustom: boolean | null, uploads: string[], globalNote: string }) => void }) {
  const [wantCustom, setWantCustom] = useState<boolean | null>(null);
  const [uploads, setUploads]       = useState<UploadItem[]>([]);
  const [globalNote, setGlobalNote] = useState('');
  const [dragOver, setDragOver]     = useState(false);
  const fileInputRef                = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (onChange) onChange({ wantCustom, uploads: uploads.map(u => u.preview), globalNote });
  }, [wantCustom, uploads, globalNote, onChange]);

  const MAX_FILES = 5;

  const addFiles = useCallback((files: FileList | File[]) => {
    const valid = Array.from(files).filter((f: File) => f.type.startsWith('image/')).slice(0, MAX_FILES - uploads.length);
    valid.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => setUploads(prev => [...prev, { id: Date.now() + Math.random(), file, preview: (e.target?.result as string) || '', note: '' }]);
      reader.readAsDataURL(file);
    });
  }, [uploads.length]);

  const removeUpload = (id: number) => setUploads(prev => prev.filter(u => u.id !== id));
  const updateNote   = (id: number, note: string) => setUploads(prev => prev.map(u => u.id === id ? { ...u, note } : u));
  const handleDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); };
  const handleToggle = (val: boolean) => { setWantCustom(val); if (!val) { setUploads([]); setGlobalNote(''); } };
  const catLabel = category === 'Key Chain/Charm' ? 'key chain / charm' : category === 'Fan Box' ? 'fan box' : 'gift box';

  return (
    <>
      <div style={{ display: 'flex', gap: 10 }}>
        <button className={`cust-toggle-btn yes${wantCustom === true ? ' sel' : ''}`} onClick={() => handleToggle(true)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          Yes, Customise
        </button>
        <button className={`cust-toggle-btn no${wantCustom === false ? ' sel' : ''}`} onClick={() => handleToggle(false)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          No, Standard
        </button>
      </div>
      {wantCustom === false && (
        <div className="cust-info-chip" style={{ marginTop: 12 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 15, height: 15, flexShrink: 0, color: 'var(--gold)', marginTop: 1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <p>You'll receive the <strong>standard {catLabel}</strong>. You can still personalise it later by contacting us within 2 hours of placing your order.</p>
        </div>
      )}
      {wantCustom === true && (
        <div style={{ marginTop: 14, animation: 'fadeUp .35s ease both' }}>
          <textarea className="cust-note-global" placeholder={`Add a personal message or customisation note for your ${catLabel}…`} value={globalNote} onChange={e => setGlobalNote(e.target.value)} rows={3} />
          {uploads.length < MAX_FILES && (
            <div className={`cust-drop${dragOver ? ' drag-over' : ''}`} onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()}>
              <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={(e: ChangeEvent<HTMLInputElement>) => { if (e.currentTarget.files) addFiles(e.currentTarget.files); }} />
              <div style={{ width: 44, height: 44, margin: '0 auto 10px', color: 'var(--olive-400)' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              </div>
              <p className="cust-drop-title">Upload your photos</p>
              <p className="cust-drop-sub">Drag &amp; drop here, or click to browse<br/>JPG · PNG · WEBP · HEIC &nbsp;·&nbsp; Max 10 MB each</p>
              <span className="cust-drop-btn">Choose Photos</span>
            </div>
          )}
          <p className={`cust-limit${uploads.length >= MAX_FILES ? ' warn' : ''}`}>{uploads.length}/{MAX_FILES} photos{uploads.length >= MAX_FILES ? ' — limit reached' : ' uploaded'}</p>
          {uploads.length > 0 && (
            <div className="cust-previews">
              {uploads.map((u, i) => (
                <div key={u.id} className="cust-preview-item" style={{ animationDelay: `${i * 0.06}s` }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="cust-preview-img" src={u.preview} alt={`Upload ${i + 1}`} />
                  <button className="cust-preview-remove" onClick={() => removeUpload(u.id)} aria-label="Remove">×</button>
                  <textarea className="cust-preview-note" rows={2} placeholder="Note for this photo…" value={u.note} onChange={e => updateNote(u.id, e.target.value)} />
                </div>
              ))}
            </div>
          )}
          <div className="cust-info-chip">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 15, height: 15, flexShrink: 0, color: 'var(--gold)', marginTop: 1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
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
          <path d="M20 12v10H4V12"/><path d="M22 7H2v5h20V7z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
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
          <svg className="gift-msg-select-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
      </div>
      <div className="gift-msg-free-wrap">
        <label className="gift-msg-label gift-msg-label--free">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13, color: 'var(--olive-500)' }}><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
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
  const { toggleItem, isWished } = useWishlist();

  const [product, setProduct] = useState<CatalogProduct | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [activeColor,   setActiveColor]   = useState(0);
  const [activeSize,    setActiveSize]    = useState('');
  const [activeImg,     setActiveImg]     = useState(0);
  const [shipping,      setShipping]      = useState('standard');
  const [payment,       setPayment]       = useState('prepaid');
  const [qty,           setQty]           = useState(1);
  const [cartAnim,      setCartAnim]      = useState(false);
  const [sparkleAnim,   setSparkleAnim]   = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>('about');
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [giftBoxAdded,  setGiftBoxAdded]  = useState(false);
  const cartBtnRef = useRef<HTMLButtonElement | null>(null);

  const [customData, setCustomData] = useState<{ wantCustom: boolean | null, uploads: string[], globalNote: string }>({ wantCustom: null, uploads: [], globalNote: '' });
  const [giftMessage, setGiftMessage] = useState<{ preset: string; customMessage: string }>({ preset: '', customMessage: '' });

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setProduct(undefined);
    fetchProductById(slug)
      .then((p) => { if (mounted) { setProduct(p); setLoading(false); } })
      .catch(() => { if (mounted) { setProduct(null); setLoading(false); } });
    return () => { mounted = false; };
  }, [slug]);

  const category        = product?.category ?? '';
  const gender          = product?.gender ?? '';
  const price           = product?.price ?? 0;
  const originalPrice   = product?.originalPrice ?? null;
  const discountedPrice = product?.discountedPrice ?? null;
  const discountTag     = product?.discountTag ?? null;
  const stock           = product?.stock ?? 0;
  const tags            = product?.seoTags ?? [];
  const faqs            = product?.faqs ?? [];
  const about           = product?.about ?? '';

  const normalizedColors: ProductColor[] = (product?.colors ?? []).map((c: any) => ({ label: c.label || c.name || 'Default', hex: c.hex || '#c9a84c' }));
  const sizes    = product?.sizes ?? [];
  const variants = product?.variants ?? [];
  const mainImage = product?.mainImage;
  const images   = product?.images ?? [];

  const allowCustomization = product?.allowCustomization === true;

  useEffect(() => {
    if (!product) return;
    setActiveColor(0);
    setActiveSize(product.sizes?.[0] || product.variants?.[0]?.size || '');
    setActiveImg(0);
  }, [product?.sourceId]);

  const currentColor      = normalizedColors[activeColor] || normalizedColors[0];
  const currentColorLabel = currentColor?.label || '';
  const normalizedColor   = normalizeText(currentColorLabel);
  const normalizedSize    = normalizeText(activeSize);

  const matchingVariant = variants.find((v) => normalizeText(v.color) === normalizedColor && normalizeText(v.size) === normalizedSize)
    || variants.find((v) => normalizeText(v.color) === normalizedColor)
    || variants.find((v) => normalizeText(v.size) === normalizedSize);

  const currentImages = dedupeImages([matchingVariant?.image, mainImage, ...images]).filter(Boolean) as string[];
  const displayImg    = currentImages?.[activeImg] || matchingVariant?.image || mainImage || FALLBACK_PRODUCT_IMAGE;

  let discount = 0;
  if (discountedPrice && price) discount = Math.round(((price - discountedPrice) / price) * 100);
  else if (originalPrice && price) discount = Math.round(((originalPrice - price) / originalPrice) * 100);

  const currentStock  = matchingVariant?.stock ?? stock;
  const availableSizes = sizes.length > 0 ? sizes : uniqueValues(variants.map((v) => v.size));
  const sizeOptions   = availableSizes.length > 0 ? availableSizes : [];
const totalWithGiftBox = (discountedPrice || price) + (giftBoxAdded ? 99 : 0);
  const deliveryCharge = shipping === 'express' ? 110 : ((discountedPrice || price) >= 999 ? 0 : 60);
  const codCharge      = payment === 'cod' && shipping !== 'express' ? 70 : 0;

  const wished = product ? isWished(product.id) : false;

  const wishlistItem = product ? {
    id: product.id, name: product.name || 'Product', price: discountedPrice || price,
    originalPrice: price, image: displayImg, category: product.category || '',
    href: product.href || `/products/${product.sourceId}`, colors: normalizedColors,
    badge: product.badge ?? null, rating: product.rating ?? 0, reviewCount: product.reviewCount ?? 0,
  } : null;

  const handleWishToggle = useCallback(() => { if (!wishlistItem) return; toggleItem(wishlistItem); }, [toggleItem, wishlistItem]);

  const buildCartItem = useCallback(() => {
  if (!product) return null;
  const basePrice = discountedPrice || price;
  return {
    id: String(product.sourceId), name: product.name || '', price: basePrice + (giftBoxAdded ? 99 : 0),
    originalPrice: price, image: displayImg, color: currentColor?.label || '',
    colorHex: currentColor?.hex || '#c9a84c', size: activeSize || undefined, sku: product.sku,
    href: product.href || `/products/${product.sourceId}`,
    customNote: allowCustomization && customData.wantCustom ? customData.globalNote : undefined,
    customImages: allowCustomization && customData.wantCustom ? customData.uploads : undefined,
    giftMessage: allowCustomization ? giftMessage.customMessage || undefined : undefined,
    giftBox: giftBoxAdded || undefined,
  };
}, [product, discountedPrice, price, displayImg, currentColor, activeSize, customData, giftMessage, allowCustomization, giftBoxAdded]);

  const handleBuyNow = useCallback(() => {
    const item = buildCartItem(); if (!item) return;
    for (let i = 0; i < qty; i++) addItem(item, false);
    router.push('/cart');
  }, [buildCartItem, qty, addItem, router]);

  const handleAddToCart = useCallback(() => {
    const item = buildCartItem(); if (!item) return;
    for (let i = 0; i < qty; i++) addItem(item);
    fireConfetti(cartBtnRef.current);
    setCartAnim(true); setSparkleAnim(true);
    setTimeout(() => setCartAnim(false), 700);
    setTimeout(() => setSparkleAnim(false), 800);
  }, [buildCartItem, qty, addItem]);

  const handleColorChange = useCallback((i: number) => {
    const nextColor = normalizedColors[i]; setActiveColor(i); setActiveImg(0);
    if (!nextColor) return;
    const nextSize = variants.find((v) => normalizeText(v.color) === normalizeText(nextColor.label))?.size || sizeOptions[0] || '';
    setActiveSize(nextSize);
  }, [normalizedColors, variants, sizeOptions]);

  const handleSizeChange = useCallback((size: string) => { setActiveSize(size); setActiveImg(0); }, []);

  useEffect(() => { if (shipping === 'express') setPayment('prepaid'); }, [shipping]);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f0e8', fontFamily: 'Jost, sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #d9cdb8', borderTopColor: '#3d4a22', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: 'rgba(30,35,16,.5)', fontSize: 13, letterSpacing: '.08em' }}>Loading product…</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );

  if (!product) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f5f0e8', fontFamily: 'Jost, sans-serif', gap: 16 }}>
      <p style={{ fontSize: 28, color: '#3d4a22' }}>Product not found</p>
      <p style={{ fontSize: 13, color: 'rgba(30,35,16,.5)' }}>This product may have been removed or the link is incorrect.</p>
      <a href="/" style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: '#f5f0e8', background: '#3d4a22', padding: '12px 28px', borderRadius: 50, textDecoration: 'none' }}>Back to Home</a>
    </div>
  );

  const productName = product.name || '';
  const description = product.description || '';

  const dynamicAccordionItems: AccordionData[] = [
    ...(about ? [{ id: 'about', emoji: '💎', label: 'About the Product', content: about }] : []),
    ...(description ? [{ id: 'desc', emoji: '📄', label: 'Product Description', content: description }] : []),
    ...(faqs.length > 0 ? [{ id: 'faq', emoji: '❓', label: 'FAQs', content: faqs.map((f: { question: string; answer: string }) => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n') }] : []),
    { id: 'cancel', emoji: '↩️', label: 'Cancellation Policy', content: 'Orders can be cancelled free of charge within 24 hours of placing. After 24 hours, cancellations are not accepted once the order is dispatched. For damaged or wrong items received, contact us within 48 hours of delivery.' },
  ];

  function NavLinkRow({ emoji, label, href }: { emoji: string; label: string; href: string }) {
    return (
      <Link href={href} className="acc-nav-link-row">
        <span className="acc-head-left">
          <span className="acc-emoji">{emoji}</span>
          {label}
        </span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </Link>
    );
  }

  return (
    <>
      {/* Size Chart Lightbox — rendered at root level so it overlays everything */}
      {showSizeChart && <SizeChartLightbox onClose={() => setShowSizeChart(false)} />}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Jost:wght@200;300;400;500;600&display=swap');
        :root {
          --beige:#f5f0e8; --beige-dk:#ede5d5; --beige-dkr:#d9cdb8;
          --olive-900:#1a1f0d; --olive-800:#252d12; --olive-600:#3d4a22;
          --olive-500:#5a6b2e; --olive-400:#7a8e3c; --olive-200:#c4cc9a;
          --olive-100:#e4e8cc; --olive-50:#f2f4e8;
          --gold:#c9a84c; --gold-lt:#e8d49a; --gold-glow:rgba(201,168,76,.13);
          --ink:#1e2310; --mist:rgba(30,35,16,.45); --red:#c0392b; --green:#2e7d32;
        }
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

        @keyframes sparkle{0%{opacity:1;transform:translate(0,0) scale(1)}100%{opacity:0;transform:translate(calc(var(--tx,0px)*2.2),calc(var(--ty,0px)*2.2)) scale(0)}}
        @keyframes cartBounce{0%,100%{transform:scale(1)}30%{transform:scale(1.14) rotate(-3deg)}60%{transform:scale(.94) rotate(2deg)}80%{transform:scale(1.04)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes imgIn{from{opacity:0;transform:scale(.97)}to{opacity:1;transform:scale(1)}}
        @keyframes stockPulse{0%,100%{opacity:1}50%{opacity:.55}}

        .pdp{min-height:100vh;background:var(--beige);font-family:'Jost',sans-serif;color:var(--ink)}
        .pdp-layout{display:grid;grid-template-columns:1fr 1fr;gap:0;max-width:1280px;margin:0 auto}

        /* ── CHANGE 1: Gallery uses aspect-ratio 4/5 instead of fixed height ── */
        .pdp-gallery{
          position:sticky;top:80px;
          /* height adjusts to content — no fixed calc height */
          padding:32px 28px 32px 52px;
          display:flex;flex-direction:column;gap:14px;
          animation:fadeUp .6s ease both;min-width:0;overflow:hidden;
          /* sticky needs a max-height so it doesn't grow taller than viewport */
          max-height:calc(100vh - 80px);
        }
        .pdp-main-img-wrap{
          /* 4:5 portrait ratio */
          aspect-ratio:4/5;
          width:100%;
          /* Remove flex:1 so ratio is respected */
          flex:none;
          background:var(--beige-dk);overflow:hidden;position:relative;
        }
        .pdp-main-img{width:100%;height:100%;object-fit:cover;animation:imgIn .4s ease both}
        .pdp-badge{position:absolute;top:16px;left:16px;font-size:9.5px;font-weight:600;letter-spacing:.1em;color:var(--beige);background:var(--olive-600);padding:5px 14px 4px;border-radius:50px}
        .pdp-wish{position:absolute;top:14px;right:14px;width:36px;height:36px;border-radius:50%;background:rgba(245,240,232,.9);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:transform .2s,background .2s}
        .pdp-wish:hover{transform:scale(1.1)}
        .pdp-wish.on{background:var(--olive-600)}
        .pdp-thumb-row{display:flex;gap:10px;flex-wrap:nowrap;overflow-x:auto;padding-bottom:2px;flex-shrink:0}
        .pdp-thumb-row::-webkit-scrollbar{height:3px}
        .pdp-thumb-row::-webkit-scrollbar-thumb{background:var(--beige-dkr);border-radius:4px}
        .pdp-thumb{width:72px;height:72px;border-radius:12px;overflow:hidden;cursor:pointer;flex-shrink:0;border:2px solid transparent;transition:border-color .2s,transform .2s}
        .pdp-thumb:hover{transform:scale(1.06)}
        .pdp-thumb.active{border-color:var(--olive-500)}
        .pdp-thumb img{width:100%;height:100%;object-fit:cover}

        .pdp-info{padding:32px 52px 40px 28px;animation:fadeUp .6s ease .1s both;overflow-y:auto}
        .pdp-name{font-family:'Cormorant Garamond',serif;font-size:clamp(1.9rem,3.5vw,2.8rem);font-weight:400;line-height:1.1;letter-spacing:-.01em;color:var(--olive-900);margin-bottom:10px}
        .pdp-name em{font-style:italic;color:var(--olive-600)}
        .pdp-rating{display:flex;align-items:center;gap:6px;margin-bottom:14px;flex-wrap:wrap}
        .pdp-stars{color:var(--gold);font-size:13px;letter-spacing:1px}
        .pdp-rating-num{font-size:12px;font-weight:600;color:var(--olive-600)}
        .pdp-review-cnt{font-size:11px;color:var(--mist)}
        .pdp-offer{background:linear-gradient(135deg,rgba(201,168,76,.12),rgba(90,110,35,.1));border:1px solid rgba(201,168,76,.28);border-radius:10px;padding:10px 16px;margin-bottom:18px;display:flex;align-items:center;gap:10px}
        .pdp-offer-icon{font-size:16px}
        .pdp-offer-text{font-size:11px;font-weight:500;letter-spacing:.04em;color:#8c6b20}
        .pdp-price-row{display:flex;align-items:baseline;gap:12px;margin-bottom:8px;flex-wrap:wrap}
        .pdp-price{font-family:'Jost',serif;font-size:1.8rem;font-weight:600;letter-spacing:-.01em;color:var(--olive-900)}
        .pdp-original{font-size:15px;font-weight:400;color:var(--mist);text-decoration:line-through}
        .pdp-discount{font-size:11px;font-weight:700;letter-spacing:.06em;color:var(--beige);background:var(--olive-500);padding:3px 9px;border-radius:4px;text-transform:uppercase}
        .pdp-tax{font-size:10px;color:var(--mist);margin-bottom:20px;letter-spacing:.04em}
        .pdp-divider{height:1px;background:linear-gradient(90deg,rgba(61,74,34,.1),rgba(201,168,76,.2),rgba(61,74,34,.1));margin:20px 0}
        .pdp-section-label{font-size:9.5px;letter-spacing:.38em;text-transform:uppercase;color:var(--mist);margin-bottom:10px;font-weight:500}
        .pdp-section-label span{color:var(--olive-600);font-weight:600}
        .pdp-swatches{display:flex;gap:10px;margin-bottom:20px;flex-wrap:wrap}
        .pdp-swatch-btn{display:flex;flex-direction:column;align-items:center;gap:5px;background:none;border:none;cursor:pointer;padding:0}
        .pdp-swatch{width:28px;height:28px;border-radius:50%;border:2.5px solid transparent;transition:transform .2s,box-shadow .2s}
        .pdp-swatch:hover{transform:scale(1.15)}
        .pdp-swatch.active{box-shadow:0 0 0 2px var(--beige),0 0 0 4px var(--olive-500)}
        .pdp-swatch-label{font-size:8px;letter-spacing:.06em;color:var(--mist);white-space:nowrap}
        .pdp-sizes{display:flex;gap:10px;margin-bottom:8px;flex-wrap:wrap}
        .pdp-size-btn{min-width:54px;padding:9px 12px;border-radius:999px;border:1.5px solid var(--beige-dkr);background:white;font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--olive-600);cursor:pointer;transition:all .2s}
        .pdp-size-btn:hover{border-color:var(--olive-400);background:var(--olive-50)}
        .pdp-size-btn.active{border-color:var(--olive-600);background:var(--olive-600);color:var(--beige)}
        .pdp-size-btn:disabled{opacity:.4;cursor:not-allowed;text-decoration:line-through}

        /* ── CHANGE 2: Size chart link ── */
        .pdp-size-chart-link{
          display:inline-flex;align-items:center;gap:5px;
          margin-bottom:20px;
          font-size:10px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;
          color:var(--olive-500);background:none;border:none;
          cursor:pointer;font-family:'Jost',sans-serif;
          text-decoration:underline;text-decoration-color:rgba(90,107,46,.35);
          text-underline-offset:3px;
          transition:color .2s;
          padding:0;
        }
        .pdp-size-chart-link:hover{color:var(--olive-600)}
        .pdp-size-chart-link svg{transition:transform .2s}
        .pdp-size-chart-link:hover svg{transform:scale(1.15)}

        .pdp-desc{font-size:14px;font-weight:400;line-height:1.85;color:#101010;letter-spacing:.03em;margin-bottom:20px}
        .pdp-qty-row{display:flex;align-items:center;gap:14px;margin-bottom:20px}
        .pdp-qty{display:flex;align-items:center;border:1.5px solid var(--beige-dkr);border-radius:50px;overflow:hidden}
        .pdp-qty-btn{width:36px;height:36px;background:none;border:none;font-size:18px;cursor:pointer;color:var(--olive-600);display:flex;align-items:center;justify-content:center;transition:background .15s}
        .pdp-qty-btn:hover{background:var(--olive-50)}
        .pdp-qty-val{min-width:36px;text-align:center;font-size:13px;font-weight:600;color:var(--ink)}
        .pdp-stock{font-size:10.5px;font-weight:500;letter-spacing:.06em;color:var(--red);animation:stockPulse 2.2s ease-in-out infinite}

        /* Complete the Look */
        .ctl-strip{margin-bottom:0;padding-bottom:4px}
        .ctl-strip-header{display:flex;align-items:center;gap:12px;margin-bottom:14px}
        .ctl-strip-eyebrow{font-size:11px;letter-spacing:.45em;text-transform:uppercase;color:#725912;white-space:nowrap;flex-shrink:0}
        .ctl-strip-rule{flex:1;height:1px;background:linear-gradient(90deg,rgba(201,168,76,.3),transparent)}
        .ctl-strip-scroll{display:flex;gap:12px;overflow-x:auto;padding-bottom:8px;-webkit-overflow-scrolling:touch;scrollbar-width:thin;scrollbar-color:var(--beige-dkr) transparent}
        .ctl-strip-scroll::-webkit-scrollbar{height:3px}
        .ctl-strip-scroll::-webkit-scrollbar-thumb{background:var(--beige-dkr);border-radius:4px}
        .ctl-card{flex:0 0 140px;height:190px;text-decoration:none;color:inherit;display:flex;flex-direction:column;border-radius:0;overflow:hidden;background:white;border:1px solid rgba(61,74,34,.10);transition:transform .25s,box-shadow .25s;animation:fadeUp .45s ease both}
        .ctl-card:hover{transform:translateY(-4px);box-shadow:0 12px 30px rgba(61,74,34,.12)}
        .ctl-img-wrap{position:relative;flex:0 0 80%;overflow:hidden;background:var(--beige-dk)}
        .ctl-img{width:100%;height:100%;object-fit:cover;transition:transform .4s ease;display:block}
        .ctl-card:hover .ctl-img{transform:scale(1.07)}
        .ctl-disc-badge{position:absolute;top:6px;right:6px;font-size:7px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--beige);background:var(--olive-500);padding:2px 6px;border-radius:0}
        .ctl-card-info{flex:0 0 20%;padding:0 8px;display:flex;flex-direction:column;justify-content:center;gap:2px;border-top:1px solid rgba(61,74,34,.07)}
        .ctl-card-name{font-size:9.5px;font-weight:500;letter-spacing:.02em;color:var(--ink);line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .ctl-card-price-row{display:flex;align-items:baseline;gap:5px}
        .ctl-card-price{font-size:11px;font-weight:700;color:var(--olive-900)}
        .ctl-card-original{font-size:9px;color:var(--mist);text-decoration:line-through}

        /* CTA */
        .pdp-cta-row{display:grid;grid-template-columns:1fr 1.4fr;gap:10px;margin-bottom:24px}
        .pdp-btn-wish{display:flex;align-items:center;justify-content:center;gap:7px;font-family:'Jost',sans-serif;font-size:11px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--olive-600);background:white;border:1.5px solid var(--beige-dkr);border-radius:50px;padding:15px 14px;cursor:pointer;transition:all .22s}
        .pdp-btn-wish:hover{border-color:var(--olive-400);background:var(--olive-50)}
        .pdp-btn-wish svg{width:16px;height:16px;transition:fill .2s}
        .pdp-btn-wish.on{background:var(--olive-600);color:var(--beige);border-color:var(--olive-600)}
        .pdp-btn-cart-wrap{position:relative}
        .pdp-btn-cart{display:flex;align-items:center;justify-content:center;gap:9px;font-family:'Jost',sans-serif;font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--beige);background:var(--olive-900);border:none;border-radius:50px;padding:15px 20px;cursor:pointer;transition:background .22s;width:100%}
        .pdp-btn-cart:hover{background:var(--olive-600)}
        .pdp-btn-cart.bounce{animation:cartBounce .55s ease}
        .pdp-btn-cart svg{width:16px;height:16px}
        .pdp-btn-buy{display:flex;align-items:center;justify-content:center;gap:9px;font-family:'Jost',sans-serif;font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--beige);background:var(--gold);border:none;border-radius:50px;padding:15px 20px;cursor:pointer;transition:background .22s,transform .15s;width:100%;grid-column:1/-1}
        .pdp-btn-buy:hover{background:#b8902b}
        .pdp-btn-buy:active{transform:scale(.98)}

        /* Combo banner */
        .pdp-combo-banner{display:flex;align-items:flex-start;gap:12px;background:linear-gradient(135deg,rgba(184,152,42,.12),rgba(61,80,22,.08));border:1.5px solid rgba(184,152,42,.35);border-radius:14px;padding:14px 16px;margin-bottom:24px}
        .pdp-combo-banner-icon{font-size:22px;flex-shrink:0;line-height:1}
        .pdp-combo-banner-title{font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#6b5010;margin-bottom:4px}
        .pdp-combo-banner-text{font-size:12px;font-weight:400;color:rgba(30,31,13,.6);line-height:1.65}
        .pdp-combo-back-btn{display:inline-flex;align-items:center;gap:6px;margin-top:10px;font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#3d4a22;background:white;border:1.5px solid rgba(61,74,34,.25);border-radius:50px;padding:8px 16px;cursor:pointer;transition:all .2s;font-family:'Jost',sans-serif}
        .pdp-combo-back-btn:hover{background:var(--olive-50);border-color:var(--olive-400)}

        /* Trust */
        .pdp-trust{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:28px}
        .pdp-trust-item{display:flex;flex-direction:column;align-items:center;text-align:center;padding:14px 8px;background:white;border:1px solid rgba(61,74,34,.07);border-radius:14px;transition:transform .2s,box-shadow .2s}
        .pdp-trust-item:hover{transform:translateY(-3px);box-shadow:0 8px 24px rgba(61,74,34,.1)}
        .pdp-trust-icon{width:40px;height:40px;color:var(--olive-500);margin-bottom:7px}
        .pdp-trust-title{font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--olive-600);margin-bottom:2px}
        .pdp-trust-sub{font-size:9px;color:#101010}

        /* Accordion */
        .pdp-accordion{border-top:1px solid rgba(61,74,34,.1)}
        .acc-item{border-bottom:1px solid rgba(61,74,34,.08)}
        .acc-head{display:flex;align-items:center;justify-content:space-between;width:100%;padding:16px 4px;background:none;border:none;cursor:pointer;transition:background .15s}
        .acc-head:hover{background:rgba(61,74,34,.03)}
        .acc-head-left{display:flex;align-items:center;gap:10px;font-family:'Jost',sans-serif;font-size:13px;font-weight:500;color:var(--ink);letter-spacing:.02em;text-align:left}
        .acc-emoji{font-size:16px}
        .acc-chevron{color:var(--mist);flex-shrink:0;transition:transform .32s ease}
        .acc-item--open .acc-chevron{transform:rotate(180deg)}
        .acc-body{padding:2px 4px 18px 36px;font-size:13px;font-weight:400;line-height:1.85;color:#101010;letter-spacing:.03em}
        .acc-body p{margin-bottom:4px}
        .acc-policy-link{display:inline-flex;align-items:center;gap:6px;margin-top:12px;font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--olive-600);text-decoration:none;border-bottom:1.5px solid var(--olive-200);padding-bottom:1px;transition:color .2s,border-color .2s}
        .acc-policy-link:hover{color:var(--olive-400);border-color:var(--olive-400)}
        .acc-policy-link svg{transition:transform .2s}
        .acc-policy-link:hover svg{transform:translateX(3px)}

        /* Customisation */
        .pdp-cust-banner{background:linear-gradient(135deg,rgba(201,168,76,.1),rgba(90,110,35,.08));border:1.5px solid rgba(201,168,76,.3);border-radius:16px;padding:16px 18px 18px;margin-bottom:20px}
        .pdp-cust-banner-head{display:flex;align-items:center;gap:10px;font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--olive-600);margin-bottom:6px}
        .pdp-cust-banner-head svg{width:16px;height:16px;color:var(--gold)}
        .pdp-cust-banner-sub{font-size:11px;font-weight:300;color:var(--mist);line-height:1.7;letter-spacing:.03em;margin-bottom:14px}
        .cust-toggle-btn{flex:1;padding:11px 10px;border:1.5px solid var(--beige-dkr);border-radius:12px;background:white;font-family:'Jost',sans-serif;font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--mist);cursor:pointer;transition:all .22s;display:flex;align-items:center;justify-content:center;gap:7px}
        .cust-toggle-btn:hover{border-color:var(--olive-400);background:var(--olive-50)}
        .cust-toggle-btn.yes.sel{border-color:var(--gold);background:rgba(201,168,76,.08);color:#8c6b20;box-shadow:0 0 0 3px rgba(201,168,76,.12)}
        .cust-toggle-btn.no.sel{border-color:var(--beige-dkr);background:var(--beige-dk);color:var(--mist)}
        .cust-info-chip{display:flex;align-items:flex-start;gap:8px;background:rgba(201,168,76,.08);border:1px solid rgba(201,168,76,.22);border-radius:10px;padding:10px 14px}
        .cust-info-chip p{font-size:10.5px;font-weight:300;color:var(--mist);line-height:1.7;letter-spacing:.03em}
        .cust-info-chip p strong{font-weight:600;color:var(--olive-600)}
        .cust-note-global{width:100%;min-height:72px;resize:vertical;border:1.5px solid var(--beige-dkr);border-radius:12px;padding:11px 14px;font-family:'Jost',sans-serif;font-size:12px;font-weight:300;color:var(--ink);background:white;outline:none;margin-bottom:14px;transition:border-color .2s}
        .cust-note-global:focus{border-color:var(--olive-400)}
        .cust-note-global::placeholder{color:rgba(30,35,16,.3)}
        .cust-drop{border:2px dashed var(--beige-dkr);border-radius:16px;padding:28px 20px;text-align:center;cursor:pointer;transition:border-color .22s,background .22s;background:white;position:relative}
        .cust-drop.drag-over{border-color:var(--gold);background:rgba(201,168,76,.05)}
        .cust-drop:hover{border-color:var(--olive-400);background:var(--olive-50)}
        .cust-drop-title{font-size:12px;font-weight:600;letter-spacing:.06em;color:var(--olive-600);margin-bottom:4px}
        .cust-drop-sub{font-size:10px;color:var(--mist);letter-spacing:.04em}
        .cust-drop-btn{display:inline-block;margin-top:12px;font-size:10px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:var(--beige);background:var(--olive-600);padding:8px 20px;border-radius:50px;border:none;cursor:pointer;transition:background .2s}
        .cust-drop-btn:hover{background:var(--olive-500)}
        .cust-limit{font-size:9px;color:var(--mist);letter-spacing:.1em;text-align:right;margin-top:6px}
        .cust-limit.warn{color:var(--red);font-weight:600}
        .cust-previews{display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:10px;margin-top:14px}
        .cust-preview-item{position:relative;border-radius:12px;overflow:hidden;border:1.5px solid var(--beige-dkr);animation:fadeUp .3s ease both}
        .cust-preview-img{width:100%;aspect-ratio:1;object-fit:cover;display:block}
        .cust-preview-remove{position:absolute;top:5px;right:5px;width:22px;height:22px;border-radius:50%;background:rgba(26,31,13,.7);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;color:white;font-size:13px;line-height:1;transition:background .2s}
        .cust-preview-remove:hover{background:var(--red)}
        .cust-preview-note{width:100%;border:none;border-top:1px solid var(--beige-dkr);padding:6px 8px;font-family:'Jost',sans-serif;font-size:10px;color:var(--ink);background:white;outline:none;resize:none}
        .cust-preview-note::placeholder{color:rgba(30,35,16,.3)}

        /* Gift Message */
        .gift-msg-panel{background:linear-gradient(135deg,rgba(201,168,76,.06),rgba(245,240,232,.6));border:1.5px solid rgba(201,168,76,.25);border-radius:16px;padding:16px 18px 18px;margin-bottom:20px}
        .gift-msg-header{display:flex;align-items:center;gap:9px;margin-bottom:14px}
        .gift-msg-title{font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--olive-600);flex:1}
        .gift-msg-optional{font-size:9px;font-weight:500;letter-spacing:.1em;text-transform:uppercase;color:var(--mist);background:rgba(61,74,34,.07);padding:2px 8px;border-radius:4px}
        .gift-msg-label{display:flex;align-items:center;gap:6px;font-size:9.5px;font-weight:600;letter-spacing:.22em;text-transform:uppercase;color:var(--mist);margin-bottom:8px}
        .gift-msg-select-wrap{margin-bottom:0}
        .gift-msg-select-inner{position:relative}
        .gift-msg-select{width:100%;appearance:none;-webkit-appearance:none;background:white;border:1.5px solid var(--beige-dkr);border-radius:12px;padding:11px 38px 11px 14px;font-family:'Jost',sans-serif;font-size:12px;font-weight:400;color:var(--ink);cursor:pointer;outline:none;transition:border-color .2s,box-shadow .2s}
        .gift-msg-select:focus{border-color:var(--olive-400);box-shadow:0 0 0 3px rgba(90,110,35,.1)}
        .gift-msg-select-chevron{position:absolute;right:12px;top:50%;transform:translateY(-50%);width:15px;height:15px;color:var(--mist);pointer-events:none}
        .gift-msg-char-count{font-size:9.5px;color:var(--mist);text-align:right;margin-top:5px;letter-spacing:.05em}
        .gift-msg-free-wrap{margin-top:18px;padding-top:16px;border-top:1px solid rgba(201,168,76,.2)}
        .gift-msg-label--free{font-size:10px;letter-spacing:.24em;color:var(--olive-600);font-weight:600;margin-bottom:10px}
        .gift-msg-free-textarea{width:100%;resize:vertical;border:1.5px solid var(--beige-dkr);border-radius:0;padding:12px 14px;font-family:'Jost',sans-serif;font-size:12px;font-weight:300;color:var(--ink);background:white;outline:none;line-height:1.75;letter-spacing:.03em;transition:border-color .2s,box-shadow .2s;min-height:80px;border-left:3px solid var(--gold)}
        .gift-msg-free-textarea:focus{border-color:var(--olive-400);border-left-color:var(--olive-500);box-shadow:0 0 0 3px rgba(90,110,35,.07)}
        .gift-msg-free-textarea::placeholder{color:rgba(30,35,16,.28)}

        /* Reviews */
        .rev-section{max-width:1280px;margin:0 auto;padding:48px 52px 56px;background:var(--beige);border-top:1px solid rgba(61,74,34,.08)}
        .rev-header{display:flex;align-items:center;gap:20px;margin-bottom:36px}
        .rev-header-line{flex:1;height:1px;background:linear-gradient(90deg,transparent,rgba(201,168,76,.3),transparent)}
        .rev-header-text{text-align:center;flex-shrink:0}
        .rev-eyebrow{display:block;font-size:9px;letter-spacing:.5em;text-transform:uppercase;color:var(--gold);margin-bottom:6px}
        .rev-title{font-family:'Cormorant Garamond',serif;font-size:clamp(1.4rem,2.5vw,2rem);font-weight:300;color:var(--olive-900);letter-spacing:.02em;font-style:italic}
        .rev-summary{display:grid;grid-template-columns:220px 1fr;gap:0;background:white;border:1px solid rgba(61,74,34,.09);border-radius:18px;overflow:hidden;margin-bottom:24px}
        .rev-summary-score{background:linear-gradient(160deg,var(--olive-900),var(--olive-600));padding:28px 24px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px}
        .rev-big-num{font-family:'Cormorant Garamond',serif;font-size:4.2rem;font-weight:600;color:#f5f0e8;line-height:1;letter-spacing:-.02em}
        .rev-big-stars{font-size:16px;color:var(--gold);letter-spacing:3px}
        .rev-total-cnt{font-size:9px;letter-spacing:.18em;text-transform:uppercase;color:rgba(245,240,232,.5);margin-top:2px}
        .rev-bars{display:flex;flex-direction:column;gap:6px;padding:20px 24px;justify-content:center}
        .rev-bar-row{display:flex;align-items:center;gap:10px;background:none;border:none;cursor:pointer;padding:3px 6px;border-radius:8px;transition:background .15s;text-align:left}
        .rev-bar-row:hover{background:rgba(61,74,34,.05)}
        .rev-bar-row--active{background:rgba(201,168,76,.1)}
        .rev-bar-label{font-size:11px;font-weight:600;color:var(--olive-600);min-width:22px;text-align:right}
        .rev-bar-track{flex:1;height:6px;background:var(--beige-dkr);border-radius:50px;overflow:hidden}
        .rev-bar-fill{height:100%;background:linear-gradient(90deg,var(--gold),var(--olive-400));border-radius:50px;transition:width .4s ease}
        .rev-bar-count{font-size:10px;color:var(--mist);min-width:24px}
        .rev-controls{display:flex;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:20px}
        .rev-clear-filter{font-size:11px;font-weight:600;letter-spacing:.06em;color:var(--gold);background:rgba(201,168,76,.1);border:1px solid rgba(201,168,76,.3);border-radius:50px;padding:6px 14px;cursor:pointer;transition:all .2s;font-family:'Jost',sans-serif}
        .rev-clear-filter:hover{background:rgba(201,168,76,.2)}
        .rev-empty{font-size:13px;color:var(--mist);text-align:center;padding:32px 0}
        .rev-clear-link{background:none;border:none;color:var(--gold);font-size:13px;cursor:pointer;text-decoration:underline;font-family:'Jost',sans-serif}
        .rev-list{display:flex;flex-direction:column;gap:16px}
        .rev-card{background:white;border:1px solid rgba(61,74,34,.07);border-radius:18px;padding:22px 24px;animation:fadeUp .45s ease both;transition:box-shadow .2s}
        .rev-card:hover{box-shadow:0 8px 28px rgba(61,74,34,.09)}
        .rev-card-top{display:flex;align-items:flex-start;gap:14px;margin-bottom:14px}
        .rev-avatar{width:42px;height:42px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;letter-spacing:.05em}
        .rev-meta{flex:1}
        .rev-meta-row{display:flex;align-items:center;flex-wrap:wrap;gap:8px}
        .rev-name{font-size:13px;font-weight:600;color:var(--ink);letter-spacing:.02em}
        .rev-verified{display:flex;align-items:center;gap:4px;font-size:9.5px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--olive-500)}
        .rev-stars-sm{font-size:12px;color:var(--gold);letter-spacing:1px}
        .rev-date{font-size:10.5px;color:var(--mist)}
        .rev-card-title{font-size:14px;font-weight:600;color:var(--ink);margin-bottom:8px;letter-spacing:.02em}
        .rev-card-body{font-size:13px;font-weight:400;color:#101010;line-height:1.85;letter-spacing:.03em;margin-bottom:16px}
        .rev-card-foot{display:flex;align-items:center;gap:10px;border-top:1px solid rgba(61,74,34,.07);padding-top:12px}
        .rev-helpful-label{font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--mist)}
        .rev-helpful-btn{display:flex;align-items:center;gap:5px;font-size:11px;font-weight:600;color:var(--olive-600);background:var(--olive-50);border:1px solid rgba(61,74,34,.12);border-radius:50px;padding:5px 12px;cursor:pointer;transition:all .2s;font-family:'Jost',sans-serif}
        .rev-helpful-btn:hover{background:var(--olive-100);border-color:var(--olive-400)}
        .rev-load-wrap{display:flex;justify-content:center;margin-top:28px}
        .rev-load-btn{font-family:'Jost',sans-serif;font-size:11px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:var(--olive-600);background:white;border:1.5px solid var(--beige-dkr);border-radius:50px;padding:14px 36px;cursor:pointer;transition:all .22s}
        .rev-load-btn:hover{border-color:var(--olive-400);background:var(--olive-50)}

        /* ── TABLET (≤ 960px) ── */
        @media(max-width:960px){
          .pdp-layout{grid-template-columns:1fr}
          .pdp-gallery{position:static;height:auto;max-height:none;padding:24px 24px 0}
          .pdp-info{padding:24px 24px 48px}
          .pdp-trust{grid-template-columns:repeat(3,1fr)}
          .rev-section{padding:40px 24px 48px}
          .rev-summary{grid-template-columns:180px 1fr}
          .rev-big-num{font-size:3.6rem}
        }
        /* ── MOBILE (≤ 600px) ── */
        @media(max-width:600px){
          .pdp-gallery{padding:16px 16px 0}
          .pdp-info{padding:20px 16px 40px}
          /* On mobile the 4:5 ratio naturally gives a shorter image — add a max */
          .pdp-main-img-wrap{max-height:400px}
          .pdp-trust{grid-template-columns:repeat(3,minmax(80px,1fr));gap:7px;overflow-x:auto;padding-bottom:4px;-webkit-overflow-scrolling:touch;scrollbar-width:none}
          .pdp-trust::-webkit-scrollbar{display:none}
          .pdp-trust-item{padding:10px 6px;border-radius:12px;min-width:80px}
          .pdp-trust-icon{width:28px;height:28px;margin-bottom:5px}
          .pdp-trust-title{font-size:8.5px;letter-spacing:.03em}
          .pdp-trust-sub{font-size:7.5px}
          .pdp-cta-row{grid-template-columns:1fr 1fr}
          .acc-body{padding:2px 4px 14px 26px}
          .ctl-card{flex:0 0 130px;height:175px}
          .rev-section{padding:32px 16px 40px}
          .rev-summary{grid-template-columns:1fr;border-radius:16px}
          .rev-summary-score{padding:22px 24px;flex-direction:row;justify-content:center;gap:16px;border-radius:0}
          .rev-big-num{font-size:3rem}
          .rev-bars{padding:16px 18px}
          .rev-header{gap:12px}
          .rev-title{font-size:1.3rem}
          .rev-card{padding:18px 16px}
          .rev-controls{flex-direction:column;align-items:flex-start}
          .acc-delivery-row{flex-direction:column;gap:6px}
        }
        /* ── VERY SMALL (≤ 380px) ── */
        @media(max-width:380px){
          .pdp-name{font-size:1.7rem}
          .pdp-cta-row{grid-template-columns:1fr}
          .pdp-btn-buy{grid-column:unset}
          .ctl-card{flex:0 0 118px;height:160px}
          .rev-big-num{font-size:2.6rem}
          .rev-card{padding:14px 12px}
        }
        .acc-nav-link-row{display:flex;align-items:center;justify-content:space-between;padding:16px 4px;text-decoration:none;color:var(--ink);border-bottom:1px solid rgba(61,74,34,.08);font-family:'Jost',sans-serif;font-size:13px;font-weight:500;letter-spacing:.02em;transition:background .15s}
        .acc-nav-link-row:hover{background:rgba(61,74,34,.03)}
        .acc-nav-link-row svg{color:var(--mist);flex-shrink:0;transition:transform .2s}
        .acc-nav-link-row:hover svg{transform:translateX(3px)}
      `}</style>

      <div className="pdp">
        <UpperNav />
        <div className="pdp-layout" style={{ paddingTop: '45px' }}>

          {/* ── Gallery ─────────────────────────────────────────────────────── */}
          <div className="pdp-gallery">
            {/* CHANGE 1: aspect-ratio:4/5 applied via .pdp-main-img-wrap */}
            <div className="pdp-main-img-wrap">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img key={displayImg} className="pdp-main-img" src={displayImg} alt={productName} />
              <span className="pdp-badge">Best Seller</span>
              {!isFromCombo && (
                <button className={`pdp-wish${wished ? ' on' : ''}`} onClick={handleWishToggle} aria-label="Wishlist">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill={wished ? 'var(--beige)' : 'none'} stroke={wished ? 'none' : 'var(--olive-600)'} strokeWidth="1.8">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                </button>
              )}
            </div>
            <div className="pdp-thumb-row">
              {currentImages.map((img, i) => (
                <div key={img} className={`pdp-thumb${activeImg === i ? ' active' : ''}`} onClick={() => setActiveImg(i)}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt={`View ${i + 1}`} />
                </div>
              ))}
            </div>
          </div>

          {/* ── Info ────────────────────────────────────────────────────────── */}
          <div className="pdp-info">
            <h1 className="pdp-name">
              {productName.split(' ').map((w, i) => i === 1 ? <em key={i}>{w} </em> : w + ' ')}
            </h1>

            <div className="pdp-rating">
              <span className="pdp-stars">{'★'.repeat(Math.round(product.rating || 0))}{'☆'.repeat(5 - Math.round(product.rating || 0))}</span>
              <span className="pdp-rating-num">{product.rating > 0 ? product.rating : 'New'}</span>
              <span className="pdp-review-cnt">({product.reviewCount || 0} reviews)</span>
              {gender && <span style={{ fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--gold)', background: 'rgba(201,168,76,.12)', padding: '2px 8px', borderRadius: 4, marginLeft: 6 }}>{gender}</span>}
            </div>

            <div className="pdp-info-top">
              <div className="pdp-price-row">
                <span className="pdp-price">₹{(discountedPrice || price).toLocaleString('en-IN')}</span>
                {(originalPrice || price) && (discountedPrice || originalPrice) && (
                  <>
                    <span className="pdp-original">₹{(originalPrice || price).toLocaleString('en-IN')}</span>
                    <span className="pdp-discount">{discount}% off</span>
                  </>
                )}
              </div>
              {discountTag && (
                <div className="pdp-offer">
                  <span className="pdp-offer-icon">🏷️</span>
                  <span className="pdp-offer-text">{discountTag}</span>
                </div>
              )}
            </div>

            <div className="pdp-divider" />

            <div className="pdp-swatches">
              {normalizedColors.map((c, i) => (
                <button key={c.hex} type="button" className="pdp-swatch-btn" onClick={() => handleColorChange(i)} title={c.label}>
                  <div className={`pdp-swatch${activeColor === i ? ' active' : ''}`} style={{ background: c.hex, border: c.hex === '#ffffff' ? '2px solid #d9cdb8' : undefined }} />
                  <span className="pdp-swatch-label">{c.label}</span>
                </button>
              ))}
            </div>

{sizeOptions.length > 0 && (
  <>
    <p className="pdp-section-label">Size: <span>{activeSize || sizeOptions[0]}</span></p>
    <div className="pdp-sizes">
      {sizeOptions.map((size) => {
        const isAvailable = Boolean(variants.find((v) => normalizeText(v.color) === normalizedColor && normalizeText(v.size) === normalizeText(size)) || variants.some((v) => normalizeText(v.size) === normalizeText(size)));
        return (
          <button key={size} type="button" className={`pdp-size-btn${activeSize === size ? ' active' : ''}`} disabled={!isAvailable} onClick={() => handleSizeChange(size)}>{size}</button>
        );
      })}
    </div>
  </>
)}
{/* moved outside so it always renders */}
<button className="pdp-size-chart-link" onClick={() => setShowSizeChart(true)}>
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 6H3"/><path d="M3 10h18"/><path d="M3 14h18"/><path d="M21 18H3"/>
  </svg>
  Size Chart
</button>

            {description && <p className="pdp-desc">{description}</p>}

            {tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                {tags.map((tag: string) => (
                  <span key={tag} style={{ fontSize: 10, fontWeight: 500, letterSpacing: '.08em', textTransform: 'lowercase', color: 'var(--olive-600)', background: 'var(--olive-50)', border: '1px solid rgba(61,74,34,.12)', padding: '3px 10px', borderRadius: 50 }}>#{tag}</span>
                ))}
              </div>
            )}
            <div className="pdp-divider" />

            {allowCustomization && (
              <>
                <div className="pdp-cust-banner">
                  <div className="pdp-cust-banner-head">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    Make it Yours — Customise this {category}
                  </div>
                  <p className="pdp-cust-banner-sub">This {category.toLowerCase()} can be personalised with your own photos, names, or a special message.</p>
                  <CustomisationPanel category={category} onChange={setCustomData} />
                </div>
                <div className="pdp-divider" />
              </>
            )}

            {!isFromCombo && (
              <>
                <p className="pdp-section-label" style={{ marginBottom: 10 }}>Quantity</p>
                <div className="pdp-qty-row">
                  <div className="pdp-qty">
                    <button className="pdp-qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                    <span className="pdp-qty-val">{qty}</span>
                    <button className="pdp-qty-btn" onClick={() => setQty(q => Math.min(stock, q + 1))}>+</button>
                  </div>
                  <span className="pdp-stock">Only {currentStock} left in stock!</span>
                </div>
                <div className="pdp-divider" />
              </>
            )}

            {/* CHANGE 3: Premium Gift Box upsell — show when NOT in combo context */}
            {!isFromCombo && (
              <>
                <p className="pdp-section-label" style={{ marginBottom: 12 }}>
                  Make it a Gift
                </p>
                <GiftBoxUpsell added={giftBoxAdded} onToggle={() => setGiftBoxAdded(v => !v)} />
              </>
            )}

            {!isFromCombo && (
              <>
                <CompleteTheLookStrip />
                {allowCustomization && (
                  <>
                    <div className="pdp-divider" />
                    <GiftMessagePanel value={giftMessage} onChange={setGiftMessage} />
                    <div className="pdp-divider" />
                  </>
                )}
              </>
            )}

            {isFromCombo ? (
              <div className="pdp-combo-banner">
                <span className="pdp-combo-banner-icon">🛍️</span>
                <div>
                  <div className="pdp-combo-banner-title">Part of your hamper</div>
                  <p className="pdp-combo-banner-text">
                    You're viewing this piece as part of a curated hamper. To add it to your cart, go back and use the hamper builder.
                  </p>
                  <button className="pdp-combo-back-btn" onClick={() => router.back()}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M19 12H5M12 5l-7 7 7 7"/>
                    </svg>
                    Back to Hamper
                  </button>
                </div>
              </div>
            ) : (
              <div className="pdp-cta-row">
                <button className={`pdp-btn-wish${wished ? ' on' : ''}`} onClick={handleWishToggle} aria-label="Wishlist">
                  <svg viewBox="0 0 24 24" fill={wished ? 'var(--beige)' : 'none'} stroke={wished ? 'none' : 'currentColor'} strokeWidth="1.8" width="16" height="16">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                  {wished ? 'Wished' : 'Wishlist'}
                </button>
                <div className="pdp-btn-cart-wrap">
                 <button ref={cartBtnRef} className={`pdp-btn-cart${cartAnim ? ' bounce' : ''}`} onClick={handleAddToCart}>
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
  {cartAnim ? 'Added! ✓' : `Add to Cart · ₹${totalWithGiftBox.toLocaleString('en-IN')}`}
</button>
                  <Sparkles active={sparkleAnim} />
                </div>
                <button className="pdp-btn-buy" onClick={handleBuyNow}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  Buy It Now
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
              <NavLinkRow emoji="🚚" label="Shipping Policy" href="/shipping-policy" />
              <NavLinkRow emoji="🔄" label="Returns & Refund Policy" href="/refund-policy" />
            </div>
            <EstimatedDeliveryBlock />
          </div>
        </div>

        <ReviewsSection productId={product.sourceId} />
      </div>
    </>
  );
}