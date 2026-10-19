'use client';

import {
  useState,
  useEffect,
  useMemo,
  type ChangeEvent,
} from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCart } from '@/lib/cartContext';
import { apiRequest } from '@/lib/api';
import UpperNav from '@/components/ui/UpperNav';
import Link from 'next/link';
import { useAuth } from '@/lib/authContext';
import type { ReviewData } from '@/lib/catalogApi';
import { CharmSelector, ChainSelector, type ChainOption } from './CharmProductDetailPage';

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
];

/* ─────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────── */
interface ProductVariant {
  selections?: Record<string, string>;
  presetMessage?: string;
  personalMessage?: string;
  uploadedImageBase64?: string;
  uploadedImagesBase64?: string[];
  selectedPricingVariant?: { label: string; price: number };
  charmCount?: number;
  selectedCharms?: string[];
  chain?: string;
  chainPrice?: number;
}

interface DynamicVariant {
  name: string;
  options: { name: string; image?: string; stock?: number }[];
}

interface ComboProduct {
  id: string;
  name: string;
  price?: number;
  image: string;
  description?: string;
  customisable: boolean;
  variants: DynamicVariant[];
  colorImages?: Record<string, string>;
  allowTextCustomization?: boolean;
  textCustomizationTitle?: string;
  allowImageCustomization?: boolean;
  imageCustomizationTitle?: string;
  maxImageUploads?: number;
  tags?: string[];
  stock?: number;
  totalCharms?: number;
  perCharmPrice?: number;
  charmPiecePricing?: { count: number; price: number }[];
  charmPieceOptions?: number[];
  chainOptions?: ChainOption[];
  chainLabel?: string;
}

interface PresetCombo {
  id: string;
  name: string;
  tagline: string;
  description?: string;
  price: number;
  originalPrice: number;
  image: string;
  images?: string[];
  badge: string;
  allowComboTextCustomization?: boolean;
  comboTextCustomizationTitle?: string;
  allowComboImageCustomization?: boolean;
  comboImageCustomizationTitle?: string;
  comboMaxImageUploads?: number;
  pricingVariants?: { label: string; price: number }[];
  includedProducts: ComboProduct[];
}

interface CustomComboSlot {
  id: string;
  name: string;
  tagline: string;
  description?: string;
  maxItems: number;
  fixedPrice: number;
  image: string;
  images?: string[];
  badge: string;
  allowComboTextCustomization?: boolean;
  comboTextCustomizationTitle?: string;
  allowComboImageCustomization?: boolean;
  comboImageCustomizationTitle?: string;
  comboMaxImageUploads?: number;
  pricingVariants?: { label: string; price: number }[];
  allowedProducts: ComboProduct[];
}

const FALLBACK_COMBO_IMAGE = '/images/hero.png';

function safeImageSrc(src?: string | null) {
  return src && src.trim() ? src : FALLBACK_COMBO_IMAGE;
}

/**
 * Merge a PATCH into an existing ProductVariant.
 * - `selections` is merged key-by-key, so choosing a colour never wipes the size
 *   (and vice-versa), and one product's selections never touch another product's.
 * - Every other field in the patch simply overrides the previous value.
 */
function mergeVariant(prev: ProductVariant | undefined, patch: ProductVariant): ProductVariant {
  const base = prev || {};
  const next: ProductVariant = { ...base, ...patch };
  if (patch.selections) {
    next.selections = { ...(base.selections || {}), ...patch.selections };
  } else if (base.selections) {
    next.selections = base.selections;
  }
  return next;
}

export function hasCustomisation(v: ProductVariant) {
  return (v.selections && Object.keys(v.selections).length > 0) || !!v.presetMessage || !!v.personalMessage || !!v.uploadedImageBase64 || (v.uploadedImagesBase64 && v.uploadedImagesBase64.length > 0) || !!v.charmCount || !!v.chain;
}

/** Variant groups (colour/size/etc.) that require a mandatory selection for a product. */
function getRequiredVariants(product: ComboProduct) {
  return (product.variants || []).filter(v => v.options && v.options.length > 0);
}

/** True only if every mandatory variant (colour, size, etc.) has been selected for this product. */
function isProductSelectionComplete(product: ComboProduct, v: ProductVariant) {
  return getMissingVariantNames(product, v).length === 0;
}

/** Names of variant groups still missing a selection. */
function getMissingVariantNames(product: ComboProduct, v: ProductVariant) {
  const missing = getRequiredVariants(product)
    .filter(variant => !v.selections?.[variant.name])
    .map(variant => variant.name);

  if (product.chainOptions && product.chainOptions.length > 0) {
    if (!v.chain) {
      missing.push(product.chainLabel || 'Chain Style');
    }
  }
  if (product.totalCharms && Number(product.totalCharms) > 0) {
    if (!v.charmCount || v.charmCount === 0 || !v.selectedCharms || v.selectedCharms.filter(Boolean).length !== v.charmCount) {
      missing.push('Charms');
    }
  }

  return missing;
}

function CompactCustSummary({ variant }: { variant: ProductVariant }) {
  if (!hasCustomisation(variant)) return null;
  return (
    <div className="cust-compact">
      {Object.entries(variant.selections || {}).map(([key, val]) => (
        <span key={key} className="cust-chip">{key}: {val}</span>
      ))}
      {variant.personalMessage     && <span className="cust-chip">Message added</span>}
      {variant.uploadedImageBase64 && <span className="cust-chip">Photo added</span>}
      {variant.uploadedImagesBase64?.map((_, i) => <span key={i} className="cust-chip">Photo added</span>)}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   LIGHTBOX — full-screen enlarged image preview
───────────────────────────────────────────────────────────── */
function ImageLightbox({ src, onClose }: { src: string; onClose: () => void }) {
  return (
    <div className="lightbox-backdrop" onClick={onClose}>
      <button className="lightbox-close" onClick={onClose} aria-label="Close preview">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
      <img src={src} alt="Enlarged preview" className="lightbox-img" onClick={e => e.stopPropagation()} />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   OPTION SWATCH — one selectable option (colour / size / etc.)
───────────────────────────────────────────────────────────── */
interface OptionSwatchProps {
  name: string;
  image?: string;
  stock?: number;
  selected: boolean;
  onSelect: () => void;
  small?: boolean;
}

function OptionSwatch({ name, image, stock, selected, onSelect, small }: OptionSwatchProps) {
  const outOfStock = stock === 0;
  return (
    <div className={`hamper-colour-swatch${selected ? ' on' : ''}${image ? '' : ' text-only'}${outOfStock ? ' out' : ''}${small ? ' sm' : ''}`}>
      <button
        type="button"
        className="hamper-colour-swatch-btn"
        aria-pressed={selected}
        disabled={outOfStock}
        onClick={onSelect}
      >
        {image && (
          <span className="hamper-colour-swatch-img-wrap">
            <img src={image} alt={name} />
          </span>
        )}
        <span className="hamper-colour-swatch-label">{name}{outOfStock ? ' (Out of Stock)' : ''}</span>
      </button>
    </div>
  );
}

/** Small text link shown beside the selected option's name — opens that option's photo enlarged. */
function ViewPhotoLink({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className="swatch-view-link" onClick={onClick}>View photo</button>
  );
}

/* ─────────────────────────────────────────────────────────────
   PRICING TIER SELECTOR
───────────────────────────────────────────────────────────── */
interface PricingTierSelectorProps {
  basePrice: number;
  pricingVariants: { label: string; price: number }[];
  selected?: { label: string; price: number };
  onChange: (opt?: { label: string; price: number }) => void;
}

function PricingTierSelector({ basePrice, pricingVariants, selected, onChange }: PricingTierSelectorProps) {
  if (!pricingVariants || pricingVariants.length === 0) return null;
  return (
    <div className="pricing-tier-block">
      <span className="pricing-tier-label">Select Option</span>
      <div className="pricing-tier-row">
        <button
          type="button"
          className={`pricing-tier-btn${!selected ? ' on' : ''}`}
          onClick={() => onChange(undefined)}
        >
          <span className="pricing-tier-btn-name">Base</span>
          <span className="pricing-tier-btn-price">₹{basePrice.toLocaleString('en-IN')}</span>
        </button>
        {pricingVariants.map(pv => {
          const isOn = selected?.label === pv.label;
          return (
            <button
              key={pv.label}
              type="button"
              className={`pricing-tier-btn${isOn ? ' on' : ''}`}
              onClick={() => onChange(pv)}
            >
              <span className="pricing-tier-btn-name">{pv.label}</span>
              <span className="pricing-tier-btn-price">₹{pv.price.toLocaleString('en-IN')}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── TRUST BADGES ── */
const COMBO_TRUST_BADGES = [
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="18" width="28" height="18" rx="2" /><path d="M32 22h4l6 8v6h-10V22z" />
        <circle cx="14" cy="38" r="3" /><circle cx="36" cy="38" r="3" /><path d="M4 26h28" /><path d="M10 14h4M16 11v6" />
      </svg>
    ),
    title: 'Free Shipping', sub: 'On orders above ₹999',
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M24 6C14 6 8 14 8 22c0 10 16 22 16 22s16-12 16-22c0-8-6-16-16-16z" /><path d="M20 22l3 3 6-6" />
      </svg>
    ),
    title: 'COD Available', sub: 'On all orders',
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M44 4L22 26M44 4L30 44 22 26 4 18 44 4z" />
      </svg>
    ),
    title: 'Express Delivery', sub: '2–3 business days',
  },
];

function ComboTrustBadges() {
  return (
    <div className="combo-trust">
      {COMBO_TRUST_BADGES.map((b, i) => (
        <div key={i} className="combo-trust-item">
          <div className="combo-trust-icon">{b.icon}</div>
          <div className="combo-trust-title">{b.title}</div>
          <div className="combo-trust-sub">{b.sub}</div>
        </div>
      ))}
    </div>
  );
}

/* ── ACCORDION ── */
function ComboAccordionItem({ emoji, label, children, open, onToggle }: { emoji: string; label: string; children: React.ReactNode; open: boolean; onToggle: () => void }) {
  return (
    <div className={`combo-acc-item${open ? ' combo-acc-item--open' : ''}`}>
      <button className="combo-acc-head" onClick={onToggle} aria-expanded={open}>
        <span className="combo-acc-head-left"><span className="combo-acc-emoji">{emoji}</span>{label}</span>
        <span className="combo-acc-chevron">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
        </span>
      </button>
      <div style={{ display: 'grid', gridTemplateRows: open ? '1fr' : '0fr', transition: 'grid-template-rows .38s cubic-bezier(.4,0,.2,1)' }}>
        <div style={{ overflow: 'hidden' }}><div className="combo-acc-body">{children}</div></div>
      </div>
    </div>
  );
}

function ComboPolicySection({ description }: { description?: string }) {
  const [open, setOpen] = useState<string | null>(null);
  const toggle = (id: string) => setOpen(o => (o === id ? null : id));

  return (
    <div className="combo-accordion">
      {description && description.trim() && (
        <ComboAccordionItem emoji="💎" label="About This Set" open={open === 'about'} onToggle={() => toggle('about')}>
          <p style={{ whiteSpace: 'pre-wrap' }}>{description}</p>
        </ComboAccordionItem>
      )}

      {/* ── Shipping Policy ── */}
      <ComboAccordionItem emoji="🚚" label="Shipping Policy" open={open === 'shipping'} onToggle={() => toggle('shipping')}>
        <div className="cpol">
          <div>
            <p className="cpol-h">🌍 Where we ship</p>
            <p>
              We deliver across <strong>India</strong> through our website. For <strong>international orders</strong>,
              contact us on WhatsApp <a href="https://wa.me/918356939586">+91 8356939586</a> or{' '}
              <a href="mailto:makeyousparkle5@gmail.com">email</a> for a custom quote.
            </p>
          </div>

          <div>
            <p className="cpol-h">📦 Rates and timelines</p>
            <div className="cpol-table-wrap">
              <table className="cpol-table">
                <thead>
                  <tr><th>Method</th><th>Rate</th><th>Metro</th><th>Rest of India</th></tr>
                </thead>
                <tbody>
                  <tr><td><strong>Standard</strong></td><td>₹60</td><td>3–5 days</td><td>4–7 days</td></tr>
                  <tr><td><strong>Express</strong></td><td>₹110</td><td>2–3 days</td><td>3–4 days</td></tr>
                </tbody>
              </table>
            </div>
            <div className="cpol-note">
              💝 <strong>Free Standard Shipping</strong> on orders above ₹999.<br />
              💵 <strong>COD</strong> available for an extra ₹70 fee (₹130 total shipping).
              Business days count from the day after you order.
            </div>
          </div>

          <div>
            <p className="cpol-h">🚀 Dispatch</p>
            <ul>
              <li><span><strong>Standard:</strong> dispatched within 2 business days.</span></li>
              <li><span><strong>Express:</strong> orders placed before 11:00 PM are dispatched the same day.</span></li>
            </ul>
          </div>

          <div>
            <p className="cpol-h">📍 Tracking and changes</p>
            <p>
              Get updates via <strong>WhatsApp, SMS and Email</strong>, or track under{' '}
              <strong>Profile → Track Order</strong>. Address or item changes are only possible{' '}
              <strong>before dispatch</strong>, so contact us immediately.
            </p>
          </div>

          <Link href="/shipping-policy" className="cpol-link">Read full shipping policy →</Link>
        </div>
      </ComboAccordionItem>

      {/* ── Returns, Refunds & Exchange ── */}
      <ComboAccordionItem emoji="🔄" label="Returns, Refunds & Exchange" open={open === 'returns'} onToggle={() => toggle('returns')}>
        <div className="cpol">
          <div className="cpol-alert">
            🔒 <strong>Prepaid orders are final sale.</strong> No returns, cancellations or cash refunds for change of mind.
          </div>

          <div>
            <p className="cpol-h">💵 Cancellations and changes</p>
            <ul>
              <li><span><strong>COD orders</strong> can be cancelled only before our team processes them.</span></li>
              <li>
                <span>
                  <strong>Product, size or colour changes</strong> are possible only before the order ships. Contact us on{' '}
                  <a href="https://wa.me/918356939586">WhatsApp</a> or <a href="mailto:makeyousparkle5@gmail.com">email</a>.
                </span>
              </li>
              <li><span><strong>Customised items</strong> are non-returnable unless damaged or incorrect.</span></li>
            </ul>
          </div>

          <div>
            <p className="cpol-h">🔄 Exchange for damaged or wrong items</p>
            <ul>
              <li><span>Report within <strong>2–3 days</strong> of delivery.</span></li>
              <li>
                <span>
                  Share a single, unedited <strong>unboxing video</strong> (mandatory). It should start with a 360° view of
                  the sealed package and shipping label, then show the opening and the defect.
                </span>
              </li>
              <li><span>Send your <strong>Order ID + video</strong> via WhatsApp or email.</span></li>
              <li><span>For exchanges approved due to our error, we cover <strong>all shipping charges</strong>.</span></li>
            </ul>
          </div>

          <div>
            <p className="cpol-h">💸 Refunds</p>
            <ul>
              <li><span><strong>Out of stock:</strong> if an approved exchange item is unavailable, you get a full refund to your original payment method.</span></li>
              <li><span><strong>Delayed delivery:</strong> refund if your order has not arrived within 30 days of dispatch due to courier issues.</span></li>
              <li><span><strong>Prepaid re-delivery:</strong> if a package is returned because you were unavailable or did not accept it, shipping must be paid again for a new attempt.</span></li>
            </ul>
          </div>

          <Link href="/refund-policy" className="cpol-link">Read full returns policy →</Link>
        </div>
      </ComboAccordionItem>
    </div>
  );
}

/* ── ESTIMATED DELIVERY ── */
function ComboEstimatedDelivery() {
  return (
    <div className="combo-delivery">
      <p className="combo-delivery-label">Estimated Delivery</p>
      <div className="combo-delivery-grid">
        {[
          { icon: '🚚', label: 'Standard', rate: '₹60', metro: '3–5 business days', rest: '4–7 business days' },
          { icon: '✈️', label: 'Express', rate: '₹110', metro: '2–3 business days', rest: '3–4 business days' },
        ].map(opt => (
          <div key={opt.label} className="combo-delivery-card">
            <div className="combo-delivery-icon">{opt.icon}</div>
            <div className="combo-delivery-opt-label">{opt.label}</div>
            <div className="combo-delivery-tier">
              <div className="combo-delivery-tier-label">Metro Cities</div>
              <div className="combo-delivery-tier-val">{opt.metro}</div>
            </div>
            <div className="combo-delivery-tier">
              <div className="combo-delivery-tier-label">Rest of India</div>
              <div className="combo-delivery-tier-val">{opt.rest}</div>
            </div>
            <div className="combo-delivery-rate">{opt.rate}</div>
          </div>
        ))}
      </div>
      <div className="combo-delivery-freebar">
        <span style={{ fontSize: 18, flexShrink: 0 }}>🎁</span>
        <span>Free Standard Shipping on orders above <strong>₹999</strong></span>
      </div>
    </div>
  );
}

/** Trust badges + policies + delivery — one block reused on both detail pages. */
function ComboExtras({ description }: { description?: string }) {
  return (
    <div className="combo-extras">
      <ComboTrustBadges />
      <div className="combo-extras-grid">
        <ComboPolicySection description={description} />
        <ComboEstimatedDelivery />
      </div>
    </div>
  );
}

/* ── REVIEWS ── */
function ComboReviewsSection({ comboId }: { comboId: string }) {
  const { token } = useAuth();
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [visibleCount, setVisibleCount] = useState(3);
  const [filterStar, setFilterStar] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formState, setFormState] = useState<{ rating: number; body: string; images: File[] }>({ rating: 5, body: '', images: [] });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let mounted = true;
    apiRequest<{ success: boolean; reviews: ReviewData[] }>(`/combos/${comboId}/reviews`)
      .then(data => { if (mounted && data.success) setReviews(data.reviews || []); })
      .catch(() => {})
      .finally(() => { if (mounted) setLoaded(true); });
    return () => { mounted = false; };
  }, [comboId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) { setErrorMsg('You must be logged in to review.'); return; }
    setIsSubmitting(true); setErrorMsg('');
    try {
      const formData = new FormData();
      formData.append('rating', String(formState.rating));
      formData.append('body', formState.body);
      if (formState.images && formState.images.length > 0) {
        formState.images.forEach((file) => {
          formData.append('images', file);
        });
      }

      const res = await apiRequest<{ success: boolean; review?: ReviewData; message?: string }>(`/combos/${comboId}/reviews`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData as any,
      });
      if (res.success && res.review) {
        setReviews(prev => [res.review!, ...prev]);
        setShowForm(false);
        setFormState({ rating: 5, body: '', images: [] });
      } else {
        setErrorMsg(res.message || 'Failed to submit review.');
      }
    } catch {
      setErrorMsg('Failed to submit review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = reviews.filter(r => filterStar === null || r.rating === filterStar);
  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;
  const totalReviews = reviews.length;
  const avgRating = totalReviews ? (reviews.reduce((a, r) => a + r.rating, 0) / totalReviews).toFixed(1) : '0.0';
  const getBar = (stars: number) => {
    const count = reviews.filter(r => r.rating === stars).length;
    return { stars, count, pct: totalReviews ? Math.round((count / totalReviews) * 100) : 0 };
  };
  const bars = [5, 4, 3, 2, 1].map(getBar);

  return (
    <div className="combo-rev-wrapper">
      <div className="combo-rev-header">
        <span className="combo-rev-eyebrow">Customer Stories</span>
        <h2 className="combo-rev-title">What people are saying</h2>
      </div>

      {loaded && totalReviews > 0 && (
        <div className="combo-rev-summary">
          <div className="combo-rev-avg-box">
            <span className="combo-rev-avg-num">{avgRating}</span>
            <div className="combo-rev-stars">{'★'.repeat(Math.round(Number(avgRating)))}{'☆'.repeat(5 - Math.round(Number(avgRating)))}</div>
            <span className="combo-rev-total">Based on {totalReviews} reviews</span>
          </div>
          <div className="combo-rev-bars">
            {bars.map(d => (
              <button key={d.stars} className={`combo-rev-bar-row ${filterStar === d.stars ? 'active' : ''}`} onClick={() => setFilterStar(f => f === d.stars ? null : d.stars)}>
                <span className="combo-rev-bar-label">{d.stars}★</span>
                <div className="combo-rev-bar-track"><div className="combo-rev-bar-fill" style={{ width: `${d.pct}%` }} /></div>
                <span className="combo-rev-bar-count">{d.count}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="combo-rev-controls">
        {filterStar !== null && (
          <button className="combo-rev-clear" onClick={() => setFilterStar(null)}>Showing {filterStar}★ only ×</button>
        )}
        {!showForm && <button className="combo-rev-write-btn" onClick={() => setShowForm(true)}>Write a Review</button>}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="combo-rev-card" style={{ marginBottom: 16 }}>
          {errorMsg && <div style={{ color: 'var(--red)', fontSize: 12, marginBottom: 12 }}>{errorMsg}</div>}
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            {[1, 2, 3, 4, 5].map(star => (
              <span key={star} onClick={() => setFormState(s => ({ ...s, rating: star }))} style={{ fontSize: 24, cursor: 'pointer', color: star <= formState.rating ? 'var(--gold)' : '#ccc' }}>★</span>
            ))}
          </div>
          <textarea required placeholder="Share your experience with this set…" value={formState.body} onChange={e => setFormState(s => ({ ...s, body: e.target.value }))} rows={3} className="modal-textarea" style={{ marginBottom: 14 }} />
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'inline-block', cursor: 'pointer', fontSize: 13, color: 'var(--olive)', fontWeight: 600, border: '1px solid var(--olive)', padding: '6px 12px', borderRadius: 4 }}>
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
                    <img src={URL.createObjectURL(file)} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }} />
                    <button type="button" onClick={() => setFormState(s => ({ ...s, images: s.images.filter((_, i) => i !== idx) }))} style={{ position: 'absolute', top: -6, right: -6, background: 'var(--red)', color: 'white', border: 'none', borderRadius: '50%', width: 18, height: 18, fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button type="submit" disabled={isSubmitting} className="combo-rev-write-btn">{isSubmitting ? 'Submitting…' : 'Submit Review'}</button>
            <button type="button" onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: 'var(--ink4)', fontSize: 12, cursor: 'pointer' }}>Cancel</button>
          </div>
        </form>
      )}

      {loaded && visible.length === 0 && !showForm && (
        <p className="combo-rev-empty">
          {totalReviews === 0 ? 'No reviews yet for this set — be the first to share your experience.' : (
            <>No reviews match this filter. <button className="combo-rev-clear" style={{ display: 'inline' }} onClick={() => setFilterStar(null)}>Clear filter</button></>
          )}
        </p>
      )}

      <div className="combo-rev-list">
        {visible.map(r => (
          <div key={r._id} className="combo-rev-card">
            <div className="combo-rev-card-top">
              <div className="combo-rev-avatar">{r.user?.firstName?.[0] || 'A'}</div>
              <div>
                <div className="combo-rev-meta-row">
                  <span className="combo-rev-name">{r.user?.firstName} {r.user?.lastName}</span>
                  {r.isVerifiedPurchase && <span className="combo-rev-verified"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>Verified purchase</span>}
                </div>
                <div className="combo-rev-meta-row" style={{ marginTop: 2 }}>
                  <span className="combo-rev-stars-sm">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                  <span className="combo-rev-date">{new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
              </div>
            </div>
            <p className="combo-rev-body">{r.body}</p>
            {r.images && r.images.length > 0 && (
              <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                {r.images.map((imgUrl, idx) => (
                  <img key={idx} src={imgUrl} alt="Review photo" style={{ width: 70, height: 70, objectFit: 'cover', borderRadius: 6, border: '1px solid #eaeaea' }} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      {hasMore && <div className="combo-rev-load"><button className="combo-rev-load-btn" onClick={() => setVisibleCount(v => v + 3)}>Show more reviews</button></div>}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   PRODUCT CUSTOMISER MODAL
───────────────────────────────────────────────────────────── */
interface CustomiserProps {
  product: ComboProduct;
  variant: ProductVariant;
  onSave: (v: ProductVariant) => void;
  onSkip?: () => void;
  onClose: () => void;
  isAddFlow?: boolean;
  hidePrice?: boolean;
  hideVariants?: boolean;
}

function ProductCustomiser({ product, variant, onSave, onSkip, onClose, isAddFlow, hidePrice, hideVariants }: CustomiserProps) {
  const [local, setLocal] = useState<ProductVariant>({ ...variant });
  const [showValidation, setShowValidation] = useState(false);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  const removeImage = (index: number) => {
    setLocal(prev => {
      const arr = prev.uploadedImagesBase64 || (prev.uploadedImageBase64 ? [prev.uploadedImageBase64] : []);
      const newArr = [...arr];
      newArr.splice(index, 1);
      return { ...prev, uploadedImagesBase64: newArr, uploadedImageBase64: undefined };
    });
  };

  const variants = hideVariants ? [] : (product.variants || []);
  const hasAny = Object.keys(local.selections || {}).length > 0 || !!local.personalMessage || !!(local.uploadedImagesBase64?.length) || !!local.charmCount;

  const requiredVariants = hideVariants ? [] : getRequiredVariants(product);
  const missing = requiredVariants.filter(vg => !local.selections?.[vg.name]);
  const canSave = missing.length === 0;
  const hasRequiredVariants = requiredVariants.length > 0;

  const msgNum = variants.length + 1;
  const picNum = variants.length + 2;

  const handleSaveClick = () => {
    if (!canSave) {
      setShowValidation(true);
      return;
    }
    onSave(local);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" role="dialog" aria-modal="true">
        <div className="modal-header">
          <div className="modal-header-text">
            <span className="modal-eyebrow">Customise Piece</span>
            <h2 className="modal-title">{product.name}</h2>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="modal-product-strip">
          <img className="modal-product-img" src={product.image} alt={product.name} />
          <div>
            <div className="modal-product-name">{product.name}</div>
            {!hidePrice && product.price != null && <div className="modal-product-price">₹{product.price.toLocaleString('en-IN')}</div>}
            {isAddFlow && <div className="modal-product-note">Customise before adding to hamper</div>}
          </div>
        </div>

        <div className="modal-body">
          {variants.map((vg, idx) => {
            const isRequired = vg.options.length > 0;
            const isMissing = showValidation && isRequired && !local.selections?.[vg.name];
            return (
            <div key={vg.name} className="modal-field">
              <label className="modal-field-label">
                <span className="modal-field-num">{idx + 1}</span>
                {vg.name}
                {isRequired && !local.selections?.[vg.name] && <span className="modal-field-required">required</span>}
                {local.selections?.[vg.name] && <span className="modal-selected-badge">{local.selections[vg.name]}</span>}
                {(() => {
                  const img = vg.options.find(o => o.name === local.selections?.[vg.name])?.image;
                  return img ? <ViewPhotoLink onClick={() => setLightboxImg(img)} /> : null;
                })()}
              </label>
              <div className={`hamper-colour-swatch-row${isMissing ? ' hamper-colour-swatch-row-error' : ''}`}>
                {vg.options.map(opt => (
                  <OptionSwatch
                    key={opt.name}
                    name={opt.name}
                    image={opt.image}
                    stock={opt.stock}
                    selected={local.selections?.[vg.name] === opt.name}
                    onSelect={() => {
                      setShowValidation(false);
                      setLocal(p => ({ ...p, selections: { ...(p.selections || {}), [vg.name]: opt.name } }));
                    }}
                    small
                  />
                ))}
              </div>
              {isMissing && <span className="modal-field-error-text">Please select a {vg.name.toLowerCase()}</span>}
            </div>
            );
          })}

          {product.allowTextCustomization && (
            <div className="modal-field">
              <label className="modal-field-label" style={{ marginBottom: '0.4rem' }}>
                <span className="modal-field-num">{msgNum}</span>
                Select Occasion / Template Card
                <span className="field-required-star">*</span>
              </label>
              <select className="modal-textarea" style={{ marginBottom: '0.8rem', appearance: 'auto' }}
                value={PRESET_MESSAGES.find(m => m.label === local.presetMessage)?.value || ''}
                onChange={e => {
                  const val = e.target.value;
                  const msg = PRESET_MESSAGES.find(m => m.value === val)?.label || '';
                  setLocal(p => ({ ...p, presetMessage: msg || undefined }));
                }}>
                {PRESET_MESSAGES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
              <label className="modal-field-label" style={{ marginBottom: '0.4rem' }}>
                {product.textCustomizationTitle || 'Personal Message'}
                <span className="field-required-star">*</span>
              </label>
              <textarea className="modal-textarea"
                placeholder="E.g. 'To my dearest Priya, with love…'"
                value={local.personalMessage || ''}
                onChange={e => setLocal(p => ({ ...p, personalMessage: e.target.value }))}
                maxLength={120} rows={3} />
              <div className="modal-char-count">{(local.personalMessage || '').length}/120</div>
            </div>
          )}

          {product.allowImageCustomization && (() => {
            const maxCount = product.maxImageUploads || 1;
            const titles = (product.imageCustomizationTitle || 'Upload Photo').split(',').map(t => t.trim());
            const uploaded = local.uploadedImagesBase64 || (local.uploadedImageBase64 ? [local.uploadedImageBase64] : []);

            return (
              <div className="modal-field">
                <label className="modal-field-label">
                  <span className="modal-field-num">{picNum}</span>
                  {product.imageCustomizationTitle || 'Upload Photo'}
                  <span className="field-required-star">*</span>
                </label>
                <div className="upload-tiles">
                  {Array.from({ length: maxCount }).map((_, i) => {
                    const tag = titles[i] || titles[0] || `Photo ${i + 1}`;
                    const currentImg = uploaded[i];

                    return (
                      <div key={i} className="upload-tile">
                        <span className="upload-tile-label">{tag}</span>
                        {currentImg ? (
                          <div className="upload-tile-preview">
                            <img src={currentImg} alt="Preview" />
                            <button type="button" className="upload-tile-remove" onClick={(e) => { e.preventDefault(); removeImage(i); }}>&times;</button>
                          </div>
                        ) : (
                          <label className="upload-tile-zone">
                            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                const base64String = reader.result as string;
                                setLocal(prev => {
                                  const prevArr = prev.uploadedImagesBase64 || (prev.uploadedImageBase64 ? [prev.uploadedImageBase64] : []);
                                  const newUploaded = [...prevArr];
                                  newUploaded[i] = base64String;
                                  return { ...prev, uploadedImagesBase64: newUploaded, uploadedImageBase64: undefined };
                                });
                              };
                              reader.readAsDataURL(file);
                            }} />
                            <span className="upload-tile-plus">+</span>
                          </label>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {((product.chainOptions && product.chainOptions.length > 0) || (Number(product.totalCharms) > 0)) ? (
            <div className="modal-field modal-field-charm">
              {product.chainOptions && product.chainOptions.length > 0 && (
                <ChainSelector
                  value={local.chain || ''}
                  label={product.chainLabel || 'Chain Type'}
                  placeholder={
                    product.chainLabel
                      ? (product.chainLabel.toLowerCase().startsWith('select')
                          ? `${product.chainLabel}…`
                          : `Select a ${product.chainLabel.toLowerCase()}…`)
                      : 'Select a chain type…'
                  }
                  onChange={val => {
                    const p = product.chainOptions!.find(c => c.value === val)?.price || 0;
                    setLocal(prev => ({ ...prev, chain: val, chainPrice: p }));
                  }}
                  onViewImage={(chain) => setLightboxImg(chain.image)}
                  options={product.chainOptions}
                />
              )}
              {Number(product.totalCharms) > 0 && (
                <>
                  <label className="modal-field-label" style={{ marginBottom: '0.4rem' }}>
                    <span className="modal-field-num">{picNum + (product.allowImageCustomization ? 1 : 0)}</span>
                    Charms Selection
                  </label>
                  <CharmSelector
                    charmPieceOptions={product.charmPieceOptions || []}
                    totalCharms={product.totalCharms}
                    validationAttempt={showValidation ? 1 : 0}
                    onChange={({ count, charms }) => {
                      setLocal(prev => ({ ...prev, charmCount: count, selectedCharms: charms }));
                    }}
                  />
                </>
              )}
            </div>
          ) : null}

          {hasAny && (
            <div className="modal-summary-box">
              <div className="modal-summary-title">Your selections</div>
              <div className="modal-summary-tags">
                {Object.entries(local.selections || {}).map(([key, val]) => (
                  <span key={key} className="modal-sum-tag">{key}: {val}</span>
                ))}
                {local.personalMessage     && <span className="modal-sum-tag">Message added</span>}
                {local.uploadedImagesBase64?.map((_, i) => <span key={i} className="modal-sum-tag">Photo added</span>)}
                {local.charmCount ? <span className="modal-sum-tag">{local.charmCount} charms</span> : null}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          {onSkip && !hasRequiredVariants && (
            <button className="modal-btn-skip" onClick={() => { onSkip(); onClose(); }}>Skip</button>
          )}
          <button className={`modal-btn-save${!canSave ? ' modal-btn-disabled' : ''}`} onClick={handleSaveClick}>
            {isAddFlow
              ? <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12l7 7 7-7"/></svg>Add to Hamper</>
              : <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Save Changes</>
            }
          </button>
        </div>
      </div>
      {lightboxImg && <ImageLightbox src={lightboxImg} onClose={() => setLightboxImg(null)} />}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   GRIDS
───────────────────────────────────────────────────────────── */
interface PresetComboGridProps {
  combos: PresetCombo[];
  onSelect: (id: string) => void;
}

function PresetComboGrid({ combos, onSelect }: PresetComboGridProps) {
  return (
    <div className="combo-grid">
      {combos.map(c => {
        const pct = Math.round(((c.originalPrice - c.price) / c.originalPrice) * 100);
        return (
          <button key={c.id} className="combo-card" onClick={() => onSelect(c.id)}>
            <div className="combo-card-img-wrap">
              <img src={safeImageSrc(c.image)} alt={c.name} />
              {pct > 0 && <span className="combo-card-pct">{pct}% off</span>}
              {c.badge && <span className="combo-card-badge">{c.badge}</span>}
            </div>
            <div className="combo-card-body">
              <span className="combo-card-name">{c.name}</span>
              <div className="combo-card-price-row">
                <span className="combo-card-price">₹{c.price.toLocaleString('en-IN')}</span>
                {pct > 0 && <span className="combo-card-original">₹{c.originalPrice.toLocaleString('en-IN')}</span>}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

interface CustomSlotGridProps {
  slots: CustomComboSlot[];
  onSelect: (id: string) => void;
}

function CustomSlotGrid({ slots, onSelect }: CustomSlotGridProps) {
  return (
    <div className="combo-grid">
      {slots.map(s => (
        <button key={s.id} className="combo-card" onClick={() => onSelect(s.id)}>
          <div className="combo-card-img-wrap">
            <img src={safeImageSrc(s.image)} alt={s.name} />
            {s.badge && <span className="combo-card-badge">{s.badge}</span>}
          </div>
          <div className="combo-card-body">
            <span className="combo-card-name">{s.name}</span>
            <p className="combo-card-tagline">{s.tagline}</p>
            <div className="combo-card-price-row">
              <span className="combo-card-price">₹{s.fixedPrice.toLocaleString('en-IN')}</span>
              <span className="combo-card-items-tag">{s.maxItems} pieces</span>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   PRESET HAMPER DETAIL
───────────────────────────────────────────────────────────── */
interface PresetHamperSectionProps {
  combo: PresetCombo;
  variants: Record<string, ProductVariant>;
  comboVariant: ProductVariant;
  onComboVariantChange: (v: ProductVariant) => void;
  /** PATCH-style: only pass the fields that changed — they are merged into that product's existing state. */
  onVariantChange: (pid: string, patch: ProductVariant) => void;
  onAddToCart: (combo: PresetCombo) => void;
  cartAdded: boolean;
  onBack: () => void;
}

const TAG_ICON = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
);

function PresetHamperSection({ combo, variants, comboVariant, onComboVariantChange, onVariantChange, onAddToCart, cartAdded, onBack }: PresetHamperSectionProps) {
  const [showValidation, setShowValidation] = useState(false);
  const [activeComboImgIdx, setActiveComboImgIdx] = useState(0);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const allComboImages = useMemo(() => {
    if (!combo) return [];
    return [safeImageSrc(combo.image), ...(combo.images || []).map(img => safeImageSrc(img))].filter((v, i, a) => v && a.indexOf(v) === i);
  }, [combo]);

  useEffect(() => {
    setActiveComboImgIdx(0);
  }, [combo?.id]);

  if (!combo) return null;

  const removeFileFor = (pid: string, index: number) => {
    const v = variants[pid] || {};
    const arr = v.uploadedImagesBase64 || (v.uploadedImageBase64 ? [v.uploadedImageBase64] : []);
    const newArr = [...arr];
    newArr.splice(index, 1);
    onVariantChange(pid, { uploadedImagesBase64: newArr, uploadedImageBase64: undefined });
  };

  /** Sends only a patch which is merged into THAT product's own state. */
  const selectVariantOption = (pid: string, variantName: string, optionName: string) => {
    onVariantChange(pid, { selections: { [variantName]: optionName } });
  };

  const products = combo.includedProducts;
  const charmsPriceTotal = products.reduce((acc, p) => {
    const v = variants[p.id];
    if (!v) return acc;
    let total = 0;
    if (v.chainPrice) total += v.chainPrice;
    if (v.charmCount && v.charmCount > 0 && p.totalCharms) {
      if (p.charmPiecePricing && p.charmPiecePricing.length > 0) {
        const match = p.charmPiecePricing.find(tier => tier.count === v.charmCount);
        if (match) total += match.price;
      } else {
        total += (p.perCharmPrice || 0) * v.charmCount;
      }
    }
    return acc + total;
  }, 0);

  const currentPrice = (comboVariant.selectedPricingVariant?.price ?? combo.price) + charmsPriceTotal;
  const priceDiff = currentPrice - combo.price;
  const currentOriginalPrice = combo.originalPrice + priceDiff;
  const pct = currentOriginalPrice > currentPrice
    ? Math.round(((currentOriginalPrice - currentPrice) / currentOriginalPrice) * 100)
    : 0;
  const customisedCount = products.filter(p => hasCustomisation(variants[p.id] || {})).length;

  const incompleteProducts = products.filter(p => !isProductSelectionComplete(p, variants[p.id] || {}));
  const canAddToCart = incompleteProducts.length === 0;

  const handleAddToCartClick = () => {
    if (!canAddToCart) {
      setShowValidation(true);
      const el = document.getElementById(`hamper-piece-${incompleteProducts[0].id}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    onAddToCart(combo);
  };

  const comboUploaded = comboVariant.uploadedImagesBase64 || (comboVariant.uploadedImageBase64 ? [comboVariant.uploadedImageBase64] : []);

  return (
    <div className="hamper-page">
      <button className="hamper-back-btn" onClick={onBack}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        Back to all sets
      </button>

      <div className="hamper-main-block">
        <div className="hamper-gallery">
          <div className="hamper-main-img-wrap" onClick={() => setLightboxImg(allComboImages[activeComboImgIdx] || safeImageSrc(combo.image))}>
            <img src={allComboImages[activeComboImgIdx] || safeImageSrc(combo.image)} alt={combo.name} />
            {pct > 0 && <span className="hamper-pct-badge">{pct}% off</span>}
            {combo.badge && <span className="hamper-label-badge">{combo.badge}</span>}
          </div>
          {allComboImages.length > 1 && (
            <div className="hamper-thumbs">
              {allComboImages.map((imgUrl: string, i: number) => (
                <button
                  key={`${imgUrl}-${i}`}
                  type="button"
                  className={`hamper-thumb${activeComboImgIdx === i ? ' on' : ''}`}
                  onClick={() => setActiveComboImgIdx(i)}
                  aria-label={`View image ${i + 1}`}
                >
                  <img src={imgUrl} alt={`${combo.name} ${i + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="hamper-main-info">
          <span className="hamper-eyebrow">{combo.badge || 'Curated Set'}</span>
          <h1 className="hamper-title">{combo.name}</h1>
          <p className="hamper-tagline">{combo.tagline}</p>
          <div className="hamper-price-row">
            <span className="hamper-price">₹{currentPrice.toLocaleString('en-IN')}</span>
            {pct > 0 && <span className="hamper-original">₹{currentOriginalPrice.toLocaleString('en-IN')}</span>}
            {pct > 0 && <span className="hamper-save-tag">Save {pct}%</span>}
          </div>

          {combo.pricingVariants && combo.pricingVariants.length > 0 && (
            <PricingTierSelector
              basePrice={combo.price}
              pricingVariants={combo.pricingVariants}
              selected={comboVariant.selectedPricingVariant}
              onChange={opt => onComboVariantChange({ ...comboVariant, selectedPricingVariant: opt })}
            />
          )}
          {combo.description && <p className="hamper-description">{combo.description}</p>}
        </div>
      </div>

      {products.length > 0 && (
        <>
          <div className="hamper-divider" />

          <div className="hamper-section-label-row">
            <p className="hamper-section-label">Pieces in this set</p>
            <span className="hamper-cust-progress">{customisedCount}/{products.length} customised</span>
          </div>

          <div className="hamper-piece-list">
            {products.map((p, i) => {
              const v = variants[p.id] || {};
              const missingNames = getMissingVariantNames(p, v);
              const showPieceError = showValidation && missingNames.length > 0;

              return (
                <div key={p.id} id={`hamper-piece-${p.id}`} className={`hamper-piece${showPieceError ? ' hamper-piece-error' : ''}`}>
                  <span className="hamper-piece-index">{i + 1}</span>

                  <div className="hamper-piece-head">
                    <div className="hamper-piece-headinfo">
                      <span className="hamper-piece-name">{p.name}</span>
                      {p.price != null && <span className="hamper-piece-price">₹{p.price.toLocaleString('en-IN')}</span>}
                      {p.tags && p.tags.length > 0 && (
                        <div className="hamper-piece-tags">
                          {p.tags.map(tag => <span key={tag} className="combo-product-tag">{tag}</span>)}
                        </div>
                      )}
                    </div>
                  </div>

                  {p.description && p.description.trim() && (
                    <p className="hamper-piece-desc">{p.description}</p>
                  )}

                  <div className="hamper-piece-body">
                    {p.variants.map((variant) => {
                      if (variant.options.length === 0) return null;
                      const selectedOpt = v.selections?.[variant.name];
                      const isMissing = showValidation && !selectedOpt;
                      return (
                        <div key={variant.name} className="hamper-piece-field">
                          <span className="hamper-piece-field-label">
                            {variant.name}
                            {!selectedOpt && <span className="hamper-piece-field-required">required</span>}
                            {selectedOpt && <em>· {selectedOpt}</em>}
                            {(() => {
                              const img = variant.options.find(o => o.name === selectedOpt)?.image;
                              return img ? <ViewPhotoLink onClick={() => setLightboxImg(img)} /> : null;
                            })()}
                          </span>
                          <div className={`hamper-colour-swatch-row${isMissing ? ' hamper-colour-swatch-row-error' : ''}`}>
                            {variant.options.map(opt => (
                              <OptionSwatch
                                key={`${p.id}-${variant.name}-${opt.name}`}
                                name={opt.name}
                                image={opt.image}
                                stock={opt.stock}
                                selected={selectedOpt === opt.name}
                                onSelect={() => { setShowValidation(false); selectVariantOption(p.id, variant.name, opt.name); }}
                              />
                            ))}
                          </div>
                          {isMissing && <span className="hamper-piece-field-error-text">Please select a {variant.name.toLowerCase()}</span>}
                        </div>
                      );
                    })}

                    {p.allowTextCustomization && (
                      <div className="hamper-piece-field">
                        <span className="hamper-piece-field-label">Select Occasion / Template Card <span className="field-required-star">*</span></span>
                        <select className="modal-textarea" style={{ marginBottom: '0.6rem', appearance: 'auto' }}
                          value={PRESET_MESSAGES.find(m => m.label === v.presetMessage)?.value || ''}
                          onChange={e => {
                            const val = e.target.value;
                            const msg = PRESET_MESSAGES.find(m => m.value === val)?.label || '';
                            onVariantChange(p.id, { presetMessage: msg || undefined });
                          }}>
                          {PRESET_MESSAGES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                        <span className="hamper-piece-field-label">{p.textCustomizationTitle || 'Personal Message'} <span className="field-required-star">*</span></span>
                        <textarea
                          className="modal-textarea"
                          placeholder="E.g. 'To my dearest Priya, with love…'"
                          value={v.personalMessage || ''}
                          onChange={e => onVariantChange(p.id, { personalMessage: e.target.value })}
                          maxLength={120}
                          rows={2}
                        />
                      </div>
                    )}

                    {p.allowImageCustomization && (() => {
                      const maxCount = p.maxImageUploads || 1;
                      const titles = (p.imageCustomizationTitle || 'Upload Photo').split(',').map(t => t.trim());
                      const uploaded = v.uploadedImagesBase64 || (v.uploadedImageBase64 ? [v.uploadedImageBase64] : []);

                      return (
                        <div className="hamper-piece-field">
                          <span className="hamper-piece-field-label">Image Customisation <span className="field-required-star">*</span></span>
                          <div className="upload-tiles">
                            {Array.from({ length: maxCount }).map((_, i) => {
                              const tag = titles[i] || titles[0] || `Photo ${i + 1}`;
                              const currentImg = uploaded[i];

                              return (
                                <div key={i} className="upload-tile">
                                  <span className="upload-tile-label">{tag}</span>
                                  {currentImg ? (
                                    <div className="upload-tile-preview">
                                      <img src={currentImg} alt="Preview" />
                                      <button type="button" className="upload-tile-remove" onClick={(e) => { e.preventDefault(); removeFileFor(p.id, i); }}>&times;</button>
                                    </div>
                                  ) : (
                                    <label className="upload-tile-zone">
                                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                          const base64String = reader.result as string;
                                          const newUploaded = [...uploaded];
                                          newUploaded[i] = base64String;
                                          onVariantChange(p.id, { uploadedImagesBase64: newUploaded, uploadedImageBase64: undefined });
                                        };
                                        reader.readAsDataURL(file);
                                      }} />
                                      <span className="upload-tile-plus">+</span>
                                    </label>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}

                    {((p.chainOptions && p.chainOptions.length > 0) || (Number(p.totalCharms) > 0)) ? (
                      <div className="hamper-piece-field">
                        {p.chainOptions && p.chainOptions.length > 0 && (
                          <ChainSelector
                            value={v.chain || ''}
                            label={p.chainLabel || 'Chain Type'}
                            placeholder={
                              p.chainLabel
                                ? (p.chainLabel.toLowerCase().startsWith('select')
                                    ? `${p.chainLabel}…`
                                    : `Select a ${p.chainLabel.toLowerCase()}…`)
                                : 'Select a chain type…'
                            }
                            onChange={val => {
                              const chainP = p.chainOptions!.find(c => c.value === val)?.price || 0;
                              onVariantChange(p.id, { chain: val, chainPrice: chainP });
                            }}
                            onViewImage={(chain) => setLightboxImg(chain.image)}
                            options={p.chainOptions}
                          />
                        )}
                        {Number(p.totalCharms) > 0 && (
                          <>
                            <span className="hamper-piece-field-label">Charms Selection</span>
                            <CharmSelector
                              charmPieceOptions={p.charmPieceOptions || []}
                              totalCharms={p.totalCharms}
                              validationAttempt={showValidation ? 1 : 0}
                              onChange={({ count, charms }) => {
                                onVariantChange(p.id, { charmCount: count, selectedCharms: charms });
                              }}
                            />
                          </>
                        )}
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {(combo.allowComboTextCustomization || combo.allowComboImageCustomization) && (
        <>
          <div className="hamper-divider" />
          <div className="hamper-piece hamper-box">
            <span className="hamper-piece-index">{TAG_ICON}</span>
            <div className="hamper-piece-head">
              <div className="hamper-piece-headinfo">
                <span className="hamper-piece-name">Box Customisation</span>
              </div>
            </div>
            <p className="hamper-piece-desc">Add a personal touch to the entire hamper box.</p>

            <div className="hamper-piece-body hamper-box-body">
              {combo.allowComboTextCustomization && (
                <div className="hamper-piece-field">
                  <span className="hamper-piece-field-label">Select Occasion / Template Card <span className="field-required-star">*</span></span>
                  <select className="modal-textarea" style={{ marginBottom: '0.6rem', appearance: 'auto' }}
                    value={PRESET_MESSAGES.find(m => m.label === comboVariant.presetMessage)?.value || ''}
                    onChange={e => {
                      const val = e.target.value;
                      const msg = PRESET_MESSAGES.find(m => m.value === val)?.label || '';
                      onComboVariantChange({ ...comboVariant, presetMessage: msg || undefined });
                    }}>
                    {PRESET_MESSAGES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                  <span className="hamper-piece-field-label">{combo.comboTextCustomizationTitle || 'Personal Message on Box'} <span className="field-required-star">*</span></span>
                  <textarea
                    className="modal-textarea"
                    placeholder="E.g. 'Happy Anniversary!'"
                    value={comboVariant.personalMessage || ''}
                    onChange={e => onComboVariantChange({ ...comboVariant, personalMessage: e.target.value })}
                    maxLength={120}
                    rows={2}
                  />
                </div>
              )}

              {combo.allowComboImageCustomization && (() => {
                const maxCount = combo.comboMaxImageUploads || 1;
                const titles = (combo.comboImageCustomizationTitle || 'Upload Photo for Box').split(',').map(t => t.trim());

                return (
                  <div className="hamper-piece-field">
                    <span className="hamper-piece-field-label">Combo Image Customisation <span className="field-required-star">*</span></span>
                    <div className="upload-tiles">
                      {Array.from({ length: maxCount }).map((_, i) => {
                        const tag = titles[i] || titles[0] || `Photo ${i + 1}`;
                        const currentImg = comboUploaded[i];

                        return (
                          <div key={i} className="upload-tile">
                            <span className="upload-tile-label">{tag}</span>
                            {currentImg ? (
                              <div className="upload-tile-preview">
                                <img src={currentImg} alt="Preview" />
                                <button type="button" className="upload-tile-remove" onClick={(e) => {
                                  e.preventDefault();
                                  const newArr = [...comboUploaded];
                                  newArr.splice(i, 1);
                                  onComboVariantChange({ ...comboVariant, uploadedImagesBase64: newArr, uploadedImageBase64: undefined });
                                }}>&times;</button>
                              </div>
                            ) : (
                              <label className="upload-tile-zone">
                                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    const base64String = reader.result as string;
                                    const newUploaded = [...comboUploaded];
                                    newUploaded[i] = base64String;
                                    onComboVariantChange({ ...comboVariant, uploadedImagesBase64: newUploaded, uploadedImageBase64: undefined });
                                  };
                                  reader.readAsDataURL(file);
                                }} />
                                <span className="upload-tile-plus">+</span>
                              </label>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </>
      )}

      {showValidation && !canAddToCart && (
        <div className="hamper-global-error">
          Please select {incompleteProducts.map(p => p.name).join(', ')} options before adding to cart.
        </div>
      )}

      <div className="hamper-divider" />
      <ComboExtras description={combo.description} />
      <ComboReviewsSection comboId={combo.id} />

      <div className="hamper-sticky-bar">
        <div className="sticky-inner">
          <div className="hamper-sticky-info">
            <span className="hamper-sticky-label">Set Total</span>
            <div className="hamper-sticky-price">
              <span className="hamper-sticky-price-val">₹{currentPrice.toLocaleString('en-IN')}</span>
              {pct > 0 && <span className="hamper-sticky-price-orig">₹{currentOriginalPrice.toLocaleString('en-IN')}</span>}
            </div>
          </div>
          <button className={`hamper-sticky-btn${cartAdded ? ' done' : ''}${!canAddToCart ? ' hamper-sticky-btn-disabled' : ''}`} onClick={handleAddToCartClick}>
            {cartAdded
              ? <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Added</>
              : <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>Add to Cart</>
            }
          </button>
        </div>
      </div>
      {lightboxImg && <ImageLightbox src={lightboxImg} onClose={() => setLightboxImg(null)} />}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   BUILD-YOUR-OWN DETAIL
───────────────────────────────────────────────────────────── */
interface CustomBuilderSectionProps {
  slot: CustomComboSlot;
  selectedIds: string[];
  variants: Record<string, ProductVariant>;
  comboVariant: ProductVariant;
  onComboVariantChange: (v: ProductVariant) => void;
  onToggle: (pid: string) => void;
  onVariantChange: (pid: string, patch: ProductVariant) => void;
  onAddToCart: (slot: CustomComboSlot) => void;
  cartAdded: boolean;
  onBack: () => void;
  gender?: string;
}

function CustomBuilderSection({ slot, selectedIds, variants, comboVariant, onComboVariantChange, onToggle, onVariantChange, onAddToCart, cartAdded, onBack }: CustomBuilderSectionProps) {
  const [customising, setCustomising] = useState<{ product: ComboProduct; isAddFlow: boolean } | null>(null);
  const [activeSlotImgIdx, setActiveSlotImgIdx] = useState(0);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const allSlotImages = useMemo(() => {
    if (!slot) return [];
    return [safeImageSrc(slot.image), ...(slot.images || []).map(img => safeImageSrc(img))].filter((v, i, a) => v && a.indexOf(v) === i);
  }, [slot]);

  useEffect(() => {
    setActiveSlotImgIdx(0);
  }, [slot?.id]);

  if (!slot) return null;

  const handleComboFile = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.currentTarget.files || []);
    if (!files.length) return;
    files.forEach(f => {
      const r = new FileReader();
      r.onload = ev => {
        const arr = comboVariant.uploadedImagesBase64 || (comboVariant.uploadedImageBase64 ? [comboVariant.uploadedImageBase64] : []);
        if (arr.length < (slot.comboMaxImageUploads || 1)) {
          onComboVariantChange({ ...comboVariant, uploadedImagesBase64: [...arr, ev.target?.result as string], uploadedImageBase64: undefined });
        }
      };
      r.readAsDataURL(f);
    });
  };

  const removeComboFile = (index: number) => {
    const arr = comboVariant.uploadedImagesBase64 || (comboVariant.uploadedImageBase64 ? [comboVariant.uploadedImageBase64] : []);
    const newArr = [...arr];
    newArr.splice(index, 1);
    onComboVariantChange({ ...comboVariant, uploadedImagesBase64: newArr, uploadedImageBase64: undefined });
  };

  const remaining = slot.maxItems - selectedIds.length;
  const currentPrice = comboVariant.selectedPricingVariant?.price ?? slot.fixedPrice;
  const selectedProducts = slot.allowedProducts.filter(p => selectedIds.includes(p.id));
  const canAddToCart = selectedIds.length === slot.maxItems;
  const slotUploaded = comboVariant.uploadedImagesBase64 || (comboVariant.uploadedImageBase64 ? [comboVariant.uploadedImageBase64] : []);

  const handleAddWithCustomise = (product: ComboProduct) => setCustomising({ product, isAddFlow: true });

  const handleCustomiserSave = (v: ProductVariant) => {
    if (!customising) return;
    onVariantChange(customising.product.id, v);
    if (customising.isAddFlow) onToggle(customising.product.id);
    setCustomising(null);
  };

  const handleCustomiserSkip = () => {
    if (!customising || !customising.isAddFlow) return;
    onToggle(customising.product.id);
    setCustomising(null);
  };

  return (
    <div className="builder-page">
      <button className="hamper-back-btn" onClick={onBack}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        Back to bundle options
      </button>

      <div className="builder-header-row">
        {allSlotImages.length > 0 && (
          <div className="builder-header-media">
            <div className="builder-header-img">
              <img src={allSlotImages[activeSlotImgIdx] || safeImageSrc(slot.image)} alt={slot.name} />
            </div>
            {allSlotImages.length > 1 && (
              <div className="builder-header-thumbs">
                {allSlotImages.map((imgUrl: string, i: number) => (
                  <button
                    key={`${imgUrl}-${i}`}
                    type="button"
                    className={`builder-header-thumb${activeSlotImgIdx === i ? ' on' : ''}`}
                    onClick={() => setActiveSlotImgIdx(i)}
                    aria-label={`View image ${i + 1}`}
                  >
                    <img src={imgUrl} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        <div className="builder-header-text">
          <h2 className="builder-header-title">{slot.name}</h2>
          <p className="builder-header-tagline">{slot.tagline}</p>
          {slot.description && <p className="builder-header-desc">{slot.description}</p>}
          {slot.pricingVariants && slot.pricingVariants.length > 0 && (
            <PricingTierSelector
              basePrice={slot.fixedPrice}
              pricingVariants={slot.pricingVariants}
              selected={comboVariant.selectedPricingVariant}
              onChange={opt => onComboVariantChange({ ...comboVariant, selectedPricingVariant: opt })}
            />
          )}
        </div>
      </div>

      <div className="builder-progress-wrap">
        <div className="builder-progress-track">
          <div className="builder-progress-fill" style={{ width: `${Math.min(100, (selectedIds.length / slot.maxItems) * 100)}%` }} />
        </div>
        <span className={`builder-hint${remaining === 0 ? ' done' : ''}`}>
          {remaining > 0
            ? `Choose ${remaining} more piece${remaining !== 1 ? 's' : ''} — customise each as you add it`
            : '✓ All pieces selected! Tap any piece to re-customise.'}
        </span>
      </div>

      <div className="builder-grid">
        {slot.allowedProducts.map(p => {
          const isChosen = selectedIds.includes(p.id);
          const canAdd   = !isChosen && remaining > 0;
          const v        = variants[p.id] || {};
          const hasCust  = hasCustomisation(v);

          return (
            <div key={p.id} className={`builder-card${isChosen ? ' chosen' : ''}${!canAdd && !isChosen ? ' disabled' : ''}`}>
              <div className="builder-card-img-wrap">
                <a
                  href={`/products/${p.id}?fromCombo=true`}
                  className="builder-card-img-link"
                  onClick={(e) => { e.preventDefault(); setLightboxImg(p.image); }}
                >
                  <img src={p.image} alt={p.name} />
                </a>
                {isChosen && <div className="builder-card-check">✓</div>}
              </div>
              <div className="builder-card-body">
                <a href={`/products/${p.id}?fromCombo=true`} className="builder-card-name-link">
                  <div className="builder-card-name">{p.name}</div>
                </a>
                {p.price != null && <div className="builder-card-price">₹{p.price.toLocaleString('en-IN')}</div>}
                {p.tags && p.tags.length > 0 && (
                  <div className="hamper-piece-tags">
                    {p.tags.map(tag => <span key={tag} className="combo-product-tag">{tag}</span>)}
                  </div>
                )}

                {isChosen ? (
                  <>
                    {hasCust ? <CompactCustSummary variant={v} /> : <div className="builder-no-cust">No customisation</div>}
                    <div className="builder-card-actions">
                      <button className="builder-edit-btn" onClick={() => setCustomising({ product: p, isAddFlow: false })}>
                        {hasCust ? '✎ Edit' : '+ Customise'}
                      </button>
                      <button className="builder-remove-btn" onClick={() => onToggle(p.id)}>Remove</button>
                    </div>
                  </>
                ) : (
                  <button className="builder-add-btn" disabled={!canAdd} onClick={() => canAdd && handleAddWithCustomise(p)}>
                    {canAdd ? 'Add To Box' : 'Limit reached'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {customising && (
        <ProductCustomiser
          product={customising.product}
          variant={variants[customising.product.id] || {}}
          onSave={handleCustomiserSave}
          onSkip={customising.isAddFlow ? handleCustomiserSkip : undefined}
          onClose={() => setCustomising(null)}
          isAddFlow={customising.isAddFlow}
          hidePrice
        />
      )}

      {(slot.allowComboTextCustomization || slot.allowComboImageCustomization) && (
        <>
          <div className="hamper-divider" style={{ marginTop: 24 }} />
          <div className="hamper-piece hamper-box">
            <span className="hamper-piece-index">{TAG_ICON}</span>
            <div className="hamper-piece-head">
              <div className="hamper-piece-headinfo">
                <span className="hamper-piece-name">Box Customisation</span>
              </div>
            </div>
            <p className="hamper-piece-desc">Add a personal touch to the entire hamper box.</p>

            <div className="hamper-piece-body hamper-box-body">
              {slot.allowComboTextCustomization && (
                <div className="hamper-piece-field">
                  <span className="hamper-piece-field-label">Select Occasion / Template Card <span className="field-required-star">*</span></span>
                  <select className="modal-textarea" style={{ marginBottom: '0.6rem', appearance: 'auto' }}
                    value={PRESET_MESSAGES.find(m => m.label === comboVariant.presetMessage)?.value || ''}
                    onChange={e => {
                      const val = e.target.value;
                      const msg = PRESET_MESSAGES.find(m => m.value === val)?.label || '';
                      onComboVariantChange({ ...comboVariant, presetMessage: msg || undefined });
                    }}>
                    {PRESET_MESSAGES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                  <span className="hamper-piece-field-label">{slot.comboTextCustomizationTitle || 'Personal Message on Box'} <span className="field-required-star">*</span></span>
                  <textarea
                    className="modal-textarea"
                    placeholder="E.g. 'Happy Anniversary!'"
                    value={comboVariant.personalMessage || ''}
                    onChange={e => onComboVariantChange({ ...comboVariant, personalMessage: e.target.value })}
                    maxLength={120}
                    rows={2}
                  />
                </div>
              )}

              {slot.allowComboImageCustomization && (
                <div className="hamper-piece-field">
                  <span className="hamper-piece-field-label">{slot.comboImageCustomizationTitle || 'Upload Photo for Box'} <span className="field-required-star">*</span></span>
                  <div className="upload-tiles">
                    {slotUploaded.map((img, i) => (
                      <div key={i} className="upload-tile">
                        <div className="upload-tile-preview">
                          <img src={img} alt="Preview" />
                          <button type="button" className="upload-tile-remove" onClick={(e) => { e.preventDefault(); removeComboFile(i); }}>&times;</button>
                        </div>
                      </div>
                    ))}

                    {slotUploaded.length < (slot.comboMaxImageUploads || 1) && (
                      <div className="upload-tile">
                        <label className="upload-tile-zone">
                          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleComboFile} multiple />
                          <span className="upload-tile-plus">+</span>
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <div className="hamper-divider" style={{ marginTop: 24 }} />
      <ComboExtras description={slot.description} />
      <ComboReviewsSection comboId={slot.id} />

      {expanded && selectedProducts.length > 0 && (
        <div className="builder-drawer">
          <div className="sticky-inner sticky-inner--col">
            <div className="builder-drawer-head">
              <span>Your Box ({selectedProducts.length}/{slot.maxItems})</span>
              <button onClick={() => setExpanded(false)}>Close</button>
            </div>
            <div className="builder-drawer-items">
              {selectedProducts.map(p => {
                const isCust = hasCustomisation(variants[p.id] || {});
                return (
                  <div key={p.id} className="builder-drawer-item">
                    <img src={p.image} alt={p.name} />
                    <span className="builder-drawer-item-name">{p.name}{isCust && <em> · customised</em>}</span>
                    <button onClick={() => onToggle(p.id)} aria-label="Remove">×</button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="builder-sticky-bar">
        <div className="sticky-inner">
          <button className="builder-sticky-toggle" onClick={() => setExpanded(e => !e)} disabled={selectedIds.length === 0}>
            <span className="builder-sticky-count">{selectedIds.length}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
          </button>
          <div className="builder-sticky-info">
            {remaining > 0
              ? <span className="builder-sticky-label">Add {remaining} more product{remaining !== 1 ? 's' : ''} to get the bundle at ₹{currentPrice.toLocaleString('en-IN')}</span>
              : <span className="builder-sticky-label builder-sticky-label--done">{slot.maxItems} pieces selected — ₹{currentPrice.toLocaleString('en-IN')}</span>}
          </div>
          <button className={`builder-sticky-cart${cartAdded ? ' done' : ''}`} disabled={!canAddToCart} onClick={() => onAddToCart(slot)}>
            {cartAdded ? 'Added' : 'Add to Cart'}
          </button>
        </div>
      </div>
      {lightboxImg && <ImageLightbox src={lightboxImg} onClose={() => setLightboxImg(null)} />}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────────── */
export default function CuratedCombosPage({ gender = 'women' }: { gender?: string }) {
  const { addItem } = useCart();

  const [mode, setMode] = useState<'preset' | 'custom'>('preset');

  const [presetCombos, setPresetCombos] = useState<PresetCombo[]>([]);
  const [customSlots, setCustomSlots] = useState<CustomComboSlot[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedComboId, setSelectedComboId] = useState<string>('');
  const [presetView, setPresetView] = useState<'grid' | 'detail'>('grid');
  const [presetVariants, setPresetVariants]   = useState<Record<string, ProductVariant>>({});
  const [presetCartAdded, setPresetCartAdded] = useState<Record<string, boolean>>({});

  const [selectedSlotId, setSelectedSlotId]   = useState<string>('');
  const [customView, setCustomView] = useState<'grid' | 'detail'>('grid');
  const [slotSelections, setSlotSelections] = useState<Record<string, string[]>>({});
  const [slotVariants, setSlotVariants] = useState<Record<string, Record<string, ProductVariant>>>({});
  const [customCartAdded, setCustomCartAdded] = useState<Record<string, boolean>>({});
  const [comboVariants, setComboVariants] = useState<Record<string, ProductVariant>>({});

  const router = useRouter();
  const searchParams = useSearchParams();
  const urlComboId = searchParams?.get('combo') || null;
  const urlCustomId = searchParams?.get('custom') || null;

  useEffect(() => {
    if (urlComboId) {
      setSelectedComboId(urlComboId);
      setPresetView('detail');
      setMode('preset');
    } else if (urlCustomId) {
      setSelectedSlotId(urlCustomId);
      setCustomView('detail');
      setMode('custom');
    } else {
      setPresetView('grid');
      setCustomView('grid');
    }
  }, [urlComboId, urlCustomId]);

  useEffect(() => {
    async function loadCombos() {
      try {
        const data = await apiRequest<{ success: boolean; combos: any[] }>('/combos');
        if (data.success && data.combos) {
          const loadedPreset: PresetCombo[] = [];
          const loadedCustom: CustomComboSlot[] = [];
          const loadedProductsMap = new Map<string, ComboProduct>();

          const mapProduct = (p: any): ComboProduct => {
            if (!loadedProductsMap.has(p._id)) {
              const parsedVariants: DynamicVariant[] = (p.variants || []).map((v: any) => ({
                name: v.name,
                options: (v.options || []).map((opt: any) => ({
                  name: opt.name,
                  image: opt.image || undefined,
                  stock: opt.stock ?? undefined,
                })),
              }));

              const rawColorImages = p.colorImages || p.colourImages || undefined;

              loadedProductsMap.set(p._id, {
                id: p._id,
                name: p.title || p.name,
                price: p.price,
                image: safeImageSrc(p.image || p.mainImage || (p.images && p.images[0])),
                description: p.description || p.details || p.longDescription || '',
                customisable: p.customisable ?? true,
                variants: parsedVariants,
                colorImages: rawColorImages,
                allowTextCustomization: p.allowTextCustomization || false,
                textCustomizationTitle: p.textCustomizationTitle || '',
                allowImageCustomization: p.allowImageCustomization || false,
                imageCustomizationTitle: p.imageCustomizationTitle || '',
                maxImageUploads: p.maxImageUploads || 1,
                tags: p.tags || [],
                totalCharms: Number(p.totalCharms) || 0,
                perCharmPrice: Number(p.perCharmPrice) || 0,
                charmPiecePricing: p.charmPiecePricing || [],
                charmPieceOptions: p.charmPiecePricing?.length
                  ? p.charmPiecePricing.map((cp: any) => Number(cp.count)).filter((cnt: number) => cnt > 0)
                  : ((p.charmPieceOptions || []).map(Number).filter((cnt: number) => cnt > 0)),
                chainOptions: p.chainOptions || [],
                chainLabel: p.chainLabel || 'Chain Type',
                stock: p.stock ?? undefined,
              });
            }
            return loadedProductsMap.get(p._id)!;
          };

          data.combos.forEach(c => {
            const products = (c.products || []).map(mapProduct);

            if (c.type === 'curated') {
              loadedPreset.push({
                id: c._id,
                name: c.name,
                tagline: c.tagline || '',
                description: c.description || '',
                price: c.price,
                originalPrice: c.originalPrice || c.price,
                image: safeImageSrc(c.image),
                images: Array.isArray(c.images) ? c.images.map((img: string) => safeImageSrc(img)) : [],
                badge: c.badge || '',
                allowComboTextCustomization: c.allowComboTextCustomization || false,
                comboTextCustomizationTitle: c.comboTextCustomizationTitle || '',
                allowComboImageCustomization: c.allowComboImageCustomization || false,
                comboImageCustomizationTitle: c.comboImageCustomizationTitle || '',
                comboMaxImageUploads: c.comboMaxImageUploads || 1,
                pricingVariants: c.pricingVariants || [],
                includedProducts: products,
              });
            } else if (c.type === 'custom') {
              loadedCustom.push({
                id: c._id,
                name: c.name,
                tagline: c.tagline || '',
                description: c.description || '',
                maxItems: c.itemsCount || 1,
                fixedPrice: c.price || 0,
                image: safeImageSrc(c.image),
                images: Array.isArray(c.images) ? c.images.map((img: string) => safeImageSrc(img)) : [],
                badge: c.badge || '',
                allowComboTextCustomization: c.allowComboTextCustomization || false,
                comboTextCustomizationTitle: c.comboTextCustomizationTitle || '',
                allowComboImageCustomization: c.allowComboImageCustomization || false,
                comboImageCustomizationTitle: c.comboImageCustomizationTitle || '',
                comboMaxImageUploads: c.comboMaxImageUploads || 1,
                pricingVariants: c.pricingVariants || [],
                allowedProducts: products,
              });
            }
          });

          setPresetCombos(loadedPreset);
          setCustomSlots(loadedCustom);
          const currentComboId = new URLSearchParams(window.location.search).get('combo');
          const currentCustomId = new URLSearchParams(window.location.search).get('custom');

          if (currentComboId && loadedPreset.some(c => c.id === currentComboId)) {
            setSelectedComboId(currentComboId);
            setPresetView('detail');
            setMode('preset');
          } else if (loadedPreset.length > 0) {
            setSelectedComboId(prev => prev || loadedPreset[0].id);
          }

          if (currentCustomId && loadedCustom.some(c => c.id === currentCustomId)) {
            setSelectedSlotId(currentCustomId);
            setCustomView('detail');
            setMode('custom');
          } else if (loadedCustom.length > 0) {
            setSelectedSlotId(prev => prev || loadedCustom[0].id);
          }

          setSlotSelections(Object.fromEntries(loadedCustom.map(s => [s.id, []])));
          setSlotVariants(Object.fromEntries(loadedCustom.map(s => [s.id, {}])));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadCombos();
  }, []);

  function handlePresetAddToCart(combo: PresetCombo) {
    const cv = comboVariants[combo.id] || {};
    const charmsPriceTotal = combo.includedProducts.reduce((acc, p) => {
      const v = presetVariants[p.id];
      if (!v) return acc;
      let total = 0;
      if (v.chainPrice) total += v.chainPrice;
      if (v.charmCount && v.charmCount > 0 && p.totalCharms) {
        if (p.charmPiecePricing && p.charmPiecePricing.length > 0) {
          const match = p.charmPiecePricing.find(tier => tier.count === v.charmCount);
          if (match) total += match.price;
        } else {
          total += ((p.perCharmPrice || 0) * v.charmCount);
        }
      }
      return acc + total;
    }, 0);
    const finalPrice = (cv.selectedPricingVariant?.price ?? combo.price) + charmsPriceTotal;
    const priceDiff = finalPrice - combo.price;
    const finalOriginalPrice = combo.originalPrice + priceDiff;

    addItem({
      id: combo.id, name: combo.name, price: finalPrice,
      originalPrice: finalOriginalPrice > finalPrice ? finalOriginalPrice : finalOriginalPrice, image: combo.image,
      color: 'Default', colorHex: '#c9a84c',
      sku: `COMBO-PRESET-${combo.id}`,
      href: `/categories/${gender}/curated-combos`,
      customData: {
        comboPresetMessage: cv.presetMessage,
        comboPersonalMessage: cv.personalMessage,
        comboUploadedImageBase64: cv.uploadedImageBase64,
        comboUploadedImagesBase64: cv.uploadedImagesBase64,
        comboSelectedPricingVariant: cv.selectedPricingVariant,
        isComboCustomised: hasCustomisation(cv)
      },
      selectionGroups: [{
        category: 'preset', label: combo.name,
        items: combo.includedProducts.map(p => {
          const v = presetVariants[p.id] || {};
          return {
            id: p.id, name: p.name, price: p.price, image: p.image, quantity: 1,
            customData: {
              selections: v.selections,
              presetMessage: v.presetMessage,
              personalMessage: v.personalMessage,
              uploadedImageBase64: v.uploadedImageBase64,
              uploadedImagesBase64: v.uploadedImagesBase64,
              isCustomised: hasCustomisation(v),
              charmCount: v.charmCount,
              selectedCharms: v.selectedCharms,
              chain: v.chain,
              chainPrice: v.chainPrice,
            }
          };
        }),
      }],
    });
    setPresetCartAdded(prev => ({ ...prev, [combo.id]: true }));
    setTimeout(() => setPresetCartAdded(prev => ({ ...prev, [combo.id]: false })), 1800);
  }

  function handleSlotToggle(slotId: string, pid: string) {
    setSlotSelections(prev => {
      const cur  = prev[slotId] || [];
      const slot = customSlots.find(s => s.id === slotId)!;
      if (cur.includes(pid)) return { ...prev, [slotId]: cur.filter(id => id !== pid) };
      if (cur.length >= slot.maxItems) return prev;
      return { ...prev, [slotId]: [...cur, pid] };
    });
  }

  /** PATCH-merge: only the passed fields change, everything else (incl. other selections) is preserved. */
  function handleSlotVariantChange(slotId: string, pid: string, patch: ProductVariant) {
    setSlotVariants(prev => {
      const slotMap = prev[slotId] || {};
      return { ...prev, [slotId]: { ...slotMap, [pid]: mergeVariant(slotMap[pid], patch) } };
    });
  }

  /** PATCH-merge for curated sets — functional update, so rapid taps / child effects never use stale state. */
  function handlePresetVariantChange(pid: string, patch: ProductVariant) {
    setPresetVariants(prev => ({ ...prev, [pid]: mergeVariant(prev[pid], patch) }));
  }

  function handleCustomAddToCart(slot: CustomComboSlot) {
    const ids  = slotSelections[slot.id] || [];
    const vars = slotVariants[slot.id]   || {};
    const cv   = comboVariants[slot.id]  || {};
    if (ids.length !== slot.maxItems) return;

    const charmsPriceTotal = ids.reduce((acc, pid) => {
      const p = slot.allowedProducts.find(x => x.id === pid)!;
      const v = vars[pid];
      if (!v) return acc;
      let total = 0;
      if (v.chainPrice) total += v.chainPrice;
      if (v.charmCount && v.charmCount > 0 && p.totalCharms) {
        if (p.charmPiecePricing && p.charmPiecePricing.length > 0) {
          const match = p.charmPiecePricing.find(tier => tier.count === v.charmCount);
          if (match) total += match.price;
        } else {
          total += ((p.perCharmPrice || 0) * v.charmCount);
        }
      }
      return acc + total;
    }, 0);
    const finalPrice = (cv.selectedPricingVariant?.price ?? slot.fixedPrice) + charmsPriceTotal;

    addItem({
      id: `custom-slot-${slot.id}-${Date.now()}`,
      sourceId: slot.id,
      name: slot.name, price: finalPrice, originalPrice: finalPrice,
      image: slot.image, color: 'Default', colorHex: '#c9a84c',
      sku: `COMBO-CUSTOM-${slot.id}`,
      href: `/categories/${gender}/curated-combos`,
      customData: {
        comboPresetMessage: cv.presetMessage,
        comboPersonalMessage: cv.personalMessage,
        comboUploadedImageBase64: cv.uploadedImageBase64,
        isComboCustomised: hasCustomisation(cv)
      },
      selectionGroups: [{
        category: slot.id, label: slot.name,
        items: ids.map(pid => {
          const p = slot.allowedProducts.find(x => x.id === pid)!;
          const v = vars[pid] || {};
          return {
            id: pid, name: p.name, price: p.price, image: p.image, quantity: 1,
            customData: {
              selections: v.selections,
              presetMessage: v.presetMessage,
              personalMessage: v.personalMessage,
              uploadedImageBase64: v.uploadedImageBase64,
              isCustomised: hasCustomisation(v),
              charmCount: v.charmCount,
              selectedCharms: v.selectedCharms,
              chain: v.chain,
              chainPrice: v.chainPrice,
            }
          };
        }),
      }],
    });
    setCustomCartAdded(prev => ({ ...prev, [slot.id]: true }));
    setTimeout(() => setCustomCartAdded(prev => ({ ...prev, [slot.id]: false })), 1800);
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

        :root {
          --bg:       #f5f2eb;
          --surf:     #ffffff;
          --bdr:      #e0d8c8;
          --bdr2:     #c9bfa8;
          --olive:    #3d5016;
          --olive2:   #5a6e2b;
          --olivedim: #eef1e3;
          --gold:     #b8982a;
          --golddim:  #fdf8e8;
          --ink:      #1a1d0d;
          --ink7:     rgba(26,29,13,.7);
          --ink4:     rgba(26,29,13,.4);
          --green:    #2a6030;
          --sage:     #8a9e6a;
          --red:      #c0392b;
          --ffd:      'Cormorant Garamond', Georgia, serif;
          --ffb:      'DM Sans', system-ui, sans-serif;
          --shadow:   0 4px 24px rgba(26,29,13,.10);
          --shadow-lg:0 8px 40px rgba(26,29,13,.16);

          /* variables used by CharmSelector / ChainSelector (shared components) */
          --olive-900:#1a1f0d; --olive-600:#3d4a22; --olive-500:#5a6b2e;
          --olive-400:#7a8e3c; --olive-200:#c4cc9a; --olive-100:#e4e8cc; --olive-50:#f2f4e8;
          --beige:#f5f0e8; --beige-dk:#ede5d5; --beige-dkr:#d9cdb8;
          --mist:rgba(30,35,16,.45);

          --container: 1180px;
        }

        *,*::before,*::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; -webkit-text-size-adjust: 100%; }
        body { font-family: var(--ffb); background: var(--bg); color: var(--ink); overflow-x: hidden; }
        button { font-family: var(--ffb); cursor: pointer; background: transparent; border: none; }
        img { display: block; max-width: 100%; }
        textarea, select, input { font-family: var(--ffb); }

        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes modalIn { from{opacity:0;transform:scale(.94) translateY(16px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes sheetIn { from{transform:translateY(40px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes charmFadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes chainPanelIn { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:translateY(0)} }

        /* ══════════ MODAL ══════════ */
        .modal-backdrop { position:fixed;inset:0;z-index:1000;background:rgba(10,12,5,.55);backdrop-filter:blur(8px);display:flex;align-items:flex-end;justify-content:center;padding:0;animation:fadeIn .2s ease; }
        .modal-box { width:100%;max-width:100%;max-height:92dvh;background:var(--surf);border-radius:18px 18px 0 0;overflow:hidden;display:flex;flex-direction:column;box-shadow:var(--shadow-lg);animation:sheetIn .3s ease; }
        .modal-header { display:flex;align-items:flex-start;justify-content:space-between;padding:14px 16px 12px;background:linear-gradient(135deg,var(--olivedim),#ede9d8);border-bottom:1px solid var(--bdr);flex-shrink:0; }
        .modal-header-text { flex:1;min-width:0; }
        .modal-eyebrow { display:block;font-size:9px;font-weight:600;letter-spacing:.22em;text-transform:uppercase;color:var(--sage);margin-bottom:3px; }
        .modal-title { font-family:var(--ffd);font-size:1.25rem;font-weight:500;color:var(--olive);line-height:1.2; }
        .modal-close { width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:var(--ink4);background:rgba(255,255,255,.6);transition:all .15s;flex-shrink:0;margin-left:12px;border:1px solid var(--bdr); }
        .modal-close:hover { background:#fff;color:var(--ink); }
        .modal-product-strip { display:flex;align-items:center;gap:14px;padding:10px 16px;border-bottom:1px solid var(--bdr);background:#fafaf6;flex-shrink:0; }
        .modal-product-img { width:54px;height:54px;border-radius:4px;object-fit:cover;border:1px solid var(--bdr);flex-shrink:0; }
        .modal-product-name { font-size:13px;font-weight:600;color:var(--ink);margin-bottom:2px; }
        .modal-product-price { font-size:12px;color:var(--olive2);font-weight:600; }
        .modal-product-note { font-size:10px;color:var(--ink4);margin-top:3px; }
        .modal-body { flex:1;overflow-y:auto;padding:14px 16px;display:flex;flex-direction:column;gap:18px;-webkit-overflow-scrolling:touch; }
        .modal-body::-webkit-scrollbar { width:3px; }
        .modal-body::-webkit-scrollbar-thumb { background:var(--bdr2);border-radius:3px; }
        .modal-field { display:flex;flex-direction:column;gap:9px; }
        .modal-field-charm { border-top:1px solid #f2f2ef;padding-top:1.1rem; }
        .modal-field-label { display:flex;align-items:center;flex-wrap:wrap;gap:8px;font-size:10px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--ink); }
        .modal-field-num { width:20px;height:20px;border-radius:50%;background:var(--olive);color:#fff;font-size:9px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-variant-numeric:tabular-nums;line-height:1; }
        .modal-field-required { font-size:8px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--red);padding:2px 7px;border:1px solid rgba(192,57,43,.35);background:rgba(192,57,43,.06);border-radius:50px; }
        .field-required-star { color:var(--red);font-size:13px;font-weight:700;line-height:1;margin-left:2px; }
        .modal-field-error-text { font-size:10.5px;font-weight:500;color:var(--red); }
        .modal-selected-badge { font-size:9px;font-weight:600;text-transform:none;letter-spacing:.03em;background:var(--olivedim);color:var(--olive);border:1px solid rgba(90,110,43,.3);padding:2px 9px;border-radius:50px;margin-left:auto; }
        .modal-textarea { width:100%;border:1.5px solid var(--bdr);border-radius:6px;padding:10px 12px;font-size:16px;color:var(--ink);background:var(--bg);outline:none;resize:none;line-height:1.6;transition:border-color .2s; }
        .modal-textarea:focus { border-color:var(--olive2);background:#fff; }
        .modal-textarea::placeholder { color:var(--ink4); }
        .modal-char-count { font-size:10px;color:var(--ink4);text-align:right; }
        .modal-summary-box { background:var(--golddim);border:1px solid rgba(184,152,42,.25);border-radius:6px;padding:9px 13px; }
        .modal-summary-title { font-size:8px;font-weight:600;letter-spacing:.15em;text-transform:uppercase;color:var(--gold);margin-bottom:6px; }
        .modal-summary-tags { display:flex;flex-wrap:wrap;gap:5px; }
        .modal-sum-tag { font-size:11px;font-weight:500;color:var(--olive);background:rgba(255,255,255,.8);border:1px solid rgba(90,110,43,.25);padding:3px 10px;border-radius:50px; }
        .modal-footer { padding:12px 16px calc(14px + env(safe-area-inset-bottom));border-top:1px solid var(--bdr);display:flex;gap:10px;flex-shrink:0;background:#fafaf6; }
        .modal-btn-skip { flex:1;font-size:10px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--ink4);border:1.5px solid var(--bdr2);border-radius:6px;padding:12px 14px;transition:all .18s;min-height:46px; }
        .modal-btn-skip:hover { border-color:var(--ink4);color:var(--ink); }
        .modal-btn-save { flex:2;display:flex;align-items:center;justify-content:center;gap:7px;font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#fff;background:var(--olive);border-radius:6px;padding:12px 18px;min-height:46px;box-shadow:0 4px 14px rgba(61,80,22,.25);transition:all .2s; }
        .modal-btn-save:hover { background:#2e3c0e; }
        .modal-btn-save.modal-btn-disabled { background:var(--bdr2);color:var(--ink4);box-shadow:none;cursor:not-allowed; }

        /* ══════════ LIGHTBOX ══════════ */
        .lightbox-backdrop { position:fixed;inset:0;z-index:1100;background:rgba(8,10,4,.86);display:flex;align-items:center;justify-content:center;padding:12px;animation:fadeIn .18s ease;cursor:zoom-out; }
        .lightbox-img { max-width:96vw;max-height:88vh;border-radius:10px;box-shadow:0 12px 48px rgba(0,0,0,.45);cursor:default;object-fit:contain; }
        .lightbox-close { position:fixed;top:14px;right:14px;z-index:1101;width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,.14);color:#fff;display:flex;align-items:center;justify-content:center;border:1px solid rgba(255,255,255,.25);transition:background .15s; }
        .lightbox-close:hover { background:rgba(255,255,255,.24); }

        /* ══════════ SMALL SHARED BITS ══════════ */
        .cust-compact { display:flex;flex-wrap:wrap;gap:4px;margin-top:3px; }
        .combo-product-tag { font-size:9px;font-weight:600;letter-spacing:.03em;background:var(--olivedim);color:var(--olive);border:1px solid rgba(90,110,43,.3);padding:2px 6px;border-radius:4px;text-transform:uppercase;white-space:nowrap; }
        .cust-chip { font-size:9px;font-weight:500;color:var(--olive);background:var(--olivedim);border:1px solid rgba(90,110,43,.2);padding:2px 8px;border-radius:50px;white-space:nowrap; }

        .pricing-tier-block { margin-top:14px;display:flex;flex-direction:column;gap:8px; }
        .pricing-tier-label { font-size:9px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:var(--ink4); }
        .pricing-tier-row { display:flex;flex-wrap:wrap;gap:8px; }
        .pricing-tier-btn { display:flex;flex-direction:column;align-items:flex-start;gap:2px;padding:8px 14px;border-radius:8px;border:1.5px solid var(--bdr2);background:var(--surf);transition:all .18s;min-width:84px;flex:1 1 calc(50% - 8px); }
        .pricing-tier-btn:hover { border-color:var(--olive2); }
        .pricing-tier-btn.on { border-color:var(--olive);background:var(--olivedim);box-shadow:inset 0 0 0 1px var(--olive); }
        .pricing-tier-btn-name { font-size:12px;font-weight:700;color:var(--ink); }
        .pricing-tier-btn.on .pricing-tier-btn-name { color:var(--olive); }
        .pricing-tier-btn-price { font-size:11px;font-weight:500;color:var(--ink7); }
        .pricing-tier-btn.on .pricing-tier-btn-price { color:var(--olive2); }

        /* image upload tiles */
        .upload-tiles { display:flex;flex-wrap:wrap;gap:12px; }
        .upload-tile { display:flex;flex-direction:column;gap:5px;align-items:center; }
        .upload-tile-label { font-size:11px;font-weight:600;color:#4a5c22;text-align:center;max-width:88px; }
        .upload-tile-zone { width:84px;height:84px;display:flex;align-items:center;justify-content:center;border:2px dashed var(--bdr2);border-radius:10px;cursor:pointer;transition:all .2s;background:var(--bg); }
        .upload-tile-zone:hover { border-color:var(--olive2);background:var(--olivedim); }
        .upload-tile-plus { font-size:26px;line-height:1;font-weight:500;color:var(--olive); }
        .upload-tile-preview { position:relative;width:84px;height:84px;border-radius:10px;overflow:hidden;background:var(--olivedim); }
        .upload-tile-preview img { width:100%;height:100%;object-fit:cover; }
        .upload-tile-remove { position:absolute;top:4px;right:4px;width:22px;height:22px;border-radius:50%;background:rgba(0,0,0,.6);color:#fff;display:flex;align-items:center;justify-content:center;font-size:15px;line-height:1; }

        /* ══════════ PAGE / HERO / MODE BAR ══════════ */
        .page { min-height:100dvh;background:var(--bg);overflow-x:clip;width:100%; }

        .hero { padding:22px 16px 18px;background:linear-gradient(155deg,#f5f2eb 0%,#ede5d0 55%,#f5f2eb 100%);border-bottom:1px solid var(--bdr);position:relative;overflow:hidden; }
        .hero::before { content:'';position:absolute;right:-80px;top:-80px;width:300px;height:300px;border-radius:50%;background:radial-gradient(circle,rgba(184,152,42,.1) 0%,transparent 68%);pointer-events:none; }
        .hero-eyebrow { display:flex;align-items:center;gap:10px;font-size:8px;letter-spacing:.44em;text-transform:uppercase;color:var(--gold);font-weight:600;margin-bottom:10px; }
        .hero-line { width:24px;height:1px;background:var(--gold);opacity:.5; }
        .hero h1 { font-family:var(--ffd);font-size:clamp(1.6rem,6vw,3.4rem);font-weight:500;color:var(--olive);line-height:1.1;margin-bottom:8px; }
        .hero h1 em { font-style:italic;color:var(--gold); }
        .hero-desc { font-size:12.5px;font-weight:300;color:var(--ink7);max-width:420px;line-height:1.75; }

        .modebar { padding:14px 16px 0;display:flex;flex-direction:column;align-items:stretch;gap:10px; }
        .modetoggle { display:flex;background:var(--surf);border:1.5px solid var(--bdr2);border-radius:6px;padding:4px;gap:3px;box-shadow:var(--shadow);width:100%;max-width:360px; }
        .modebtn { flex:1;font-size:10px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;padding:10px 12px;border-radius:4px;color:var(--ink7);transition:all .22s;min-height:40px;white-space:nowrap; }
        .modebtn.on { background:var(--olive);color:#fff;box-shadow:0 2px 10px rgba(61,80,22,.3); }
        .modehint { font-size:12px;font-weight:300;color:var(--ink7);line-height:1.7;max-width:460px; }

        .layout { padding-bottom:96px;width:100%; }

        /* ══════════ CARD GRIDS (set picker + product picker) ══════════ */
        .combo-grid { display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;max-width:1360px;margin:0 auto;padding:16px 14px 0;width:100%; }
        .combo-card { background:var(--surf);border:1.5px solid var(--bdr);overflow:hidden;display:flex;flex-direction:column;text-align:left;transition:all .2s;min-width:0; }
        .combo-card:hover { border-color:var(--olive2);transform:translateY(-3px);box-shadow:var(--shadow-lg); }
        .combo-card-img-wrap { position:relative;aspect-ratio:4/5;overflow:hidden;background:var(--olivedim); }
        .combo-card-img-wrap img { width:100%;height:100%;object-fit:cover;transition:transform .35s ease; }
        .combo-card:hover .combo-card-img-wrap img { transform:scale(1.06); }
        .combo-card-pct { position:absolute;top:8px;right:8px;font-size:9px;font-weight:700;background:var(--olive);color:#fff;padding:3px 8px;border-radius:4px; }
        .combo-card-badge { position:absolute;top:8px;left:8px;font-size:8px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;background:rgba(255,255,255,.93);color:var(--ink);padding:3px 8px;border-radius:4px;max-width:calc(100% - 16px);overflow:hidden;text-overflow:ellipsis;white-space:nowrap; }
        .combo-card-body { padding:10px;display:flex;flex-direction:column;gap:6px;flex:1;min-width:0; }
        .combo-card-name { font-family:var(--ffd);font-size:1rem;font-weight:600;color:var(--ink);line-height:1.25;word-break:break-word; }
        .combo-card-tagline { font-size:11px;font-weight:300;color:var(--ink7);line-height:1.55;flex:1; }
        .combo-card-price-row { display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;margin-top:auto; }
        .combo-card-price { font-size:13px;font-weight:700;color:var(--olive2); }
        .combo-card-original { font-size:11px;color:var(--ink4);text-decoration:line-through; }
        .combo-card-items-tag { font-size:9px;font-weight:600;color:var(--olive2);background:var(--olivedim);border:1px solid rgba(90,110,43,.2);padding:2px 8px;border-radius:50px;white-space:nowrap; }

        /* ══════════ DETAIL PAGES — shared container ══════════ */
        .hamper-page, .builder-page { width:100%;max-width:var(--container);margin:0 auto;padding:14px 14px 0; }
        .hamper-back-btn { display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--olive2);margin-bottom:12px;padding:6px 0; }
        .hamper-back-btn:hover { color:var(--olive); }
        .hamper-divider { height:1px;background:var(--bdr);margin:16px 0; }

        /* ── hero block: gallery + info ── */
        .hamper-main-block { display:flex;flex-direction:column;gap:14px;margin-bottom:6px; }
        .hamper-gallery { min-width:0; }
        .hamper-main-img-wrap { position:relative;width:100%;aspect-ratio:4/5;max-height:68vh;border-radius:16px;overflow:hidden;background:var(--surf);border:1px solid var(--bdr);cursor:zoom-in; }
        .hamper-main-img-wrap img { width:100%;height:100%;object-fit:cover; }
        .hamper-pct-badge { position:absolute;top:10px;right:10px;font-size:10px;font-weight:700;background:var(--olive);color:#fff;padding:4px 10px;border-radius:4px; }
        .hamper-label-badge { position:absolute;top:10px;left:10px;font-size:8px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;background:rgba(255,255,255,.93);color:var(--ink);padding:4px 9px;border-radius:4px; }
        .hamper-thumbs { display:flex;gap:8px;margin-top:10px;overflow-x:auto;padding-bottom:4px;scrollbar-width:thin; }
        .hamper-thumb { width:56px;height:56px;flex-shrink:0;border-radius:10px;overflow:hidden;border:1px solid var(--bdr2);padding:0;background:var(--surf);opacity:.7;transition:all .2s; }
        .hamper-thumb.on { border:2px solid var(--olive);opacity:1; }
        .hamper-thumb img { width:100%;height:100%;object-fit:cover; }

        .hamper-main-info { min-width:0; }
        .hamper-eyebrow { display:block;font-size:9px;font-weight:600;letter-spacing:.3em;text-transform:uppercase;color:var(--gold);margin-bottom:6px; }
        .hamper-title { font-family:var(--ffd);font-size:clamp(1.6rem,6vw,2.4rem);font-weight:500;color:var(--olive);line-height:1.15;margin-bottom:6px; }
        .hamper-tagline { font-size:13px;font-weight:300;color:var(--ink7);line-height:1.65;margin-bottom:10px; }
        .hamper-price-row { display:flex;align-items:baseline;gap:9px;flex-wrap:wrap; }
        .hamper-price { font-size:1.7rem;font-weight:700;color:var(--ink); }
        .hamper-original { font-size:13px;color:var(--ink4);text-decoration:line-through; }
        .hamper-save-tag { font-size:10px;font-weight:700;color:var(--green);background:rgba(42,96,48,.08);padding:3px 8px;border-radius:4px; }
        .hamper-description { margin-top:12px;font-size:13.5px;color:#484840;line-height:1.75;white-space:pre-wrap; }

        /* ── pieces ── */
        .hamper-section-label-row { display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;flex-wrap:wrap;gap:8px; }
        .hamper-section-label { font-size:9px;letter-spacing:.3em;text-transform:uppercase;color:var(--ink4);font-weight:600; }
        .hamper-cust-progress { font-size:9px;font-weight:600;color:var(--olive2);background:var(--olivedim);border:1px solid rgba(90,110,43,.25);padding:3px 10px;border-radius:50px; }

        .hamper-piece-list { display:grid;grid-template-columns:minmax(0,1fr);gap:18px; }
        .hamper-piece { display:flex;flex-direction:column;gap:10px;padding:14px;border-radius:14px;border:1.5px solid var(--bdr);background:var(--surf);position:relative;min-width:0;transition:border-color .2s,box-shadow .2s; }
        .hamper-piece.hamper-piece-error { border-color:var(--red);box-shadow:0 0 0 1px rgba(192,57,43,.25); }
        .hamper-piece-index { position:absolute;top:-9px;left:12px;min-width:22px;height:22px;padding:0 4px;border-radius:50%;background:var(--olive);color:#fff;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center; }
        .hamper-piece-head { display:flex;align-items:center;gap:10px;padding-top:2px; }
        .hamper-piece-headinfo { flex:1;min-width:0;display:flex;flex-direction:column;gap:2px; }
        .hamper-piece-name { font-size:14px;font-weight:600;color:var(--ink); }
        .hamper-piece-price { font-size:12px;font-weight:600;color:var(--olive2); }
        .hamper-piece-tags { display:flex;gap:.4rem;margin-top:.4rem;flex-wrap:wrap; }
        .hamper-piece-desc { font-size:12px;font-weight:300;color:var(--ink7);line-height:1.65; }
        .hamper-piece-body { display:flex;flex-direction:column;gap:12px; }
        .hamper-piece-field { display:flex;flex-direction:column;gap:6px;min-width:0; }
        .hamper-piece-field-label { font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--ink);display:flex;align-items:center;gap:6px;flex-wrap:wrap; }
        .hamper-piece-field-label em { font-style:normal;color:var(--olive2);text-transform:none;letter-spacing:0;font-weight:600; }
        .hamper-piece-field-required { font-size:8px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--red);padding:2px 7px;border:1px solid rgba(192,57,43,.35);background:rgba(192,57,43,.06);border-radius:50px; }
        .hamper-piece-field-error-text { font-size:10.5px;font-weight:500;color:var(--red); }
        .hamper-global-error { margin-top:16px;padding:10px 14px;border-radius:8px;background:rgba(192,57,43,.06);border:1px solid rgba(192,57,43,.3);color:var(--red);font-size:12px;font-weight:500;line-height:1.5; }

        /* ── option swatches ── */
        .hamper-colour-swatch-row { display:flex;flex-wrap:wrap;gap:4px;padding:2px 0 4px; }
        .hamper-colour-swatch-row-error { box-shadow:inset 0 0 0 1.5px var(--red);border-radius:10px;padding:6px; }
        .hamper-colour-swatch { position:relative;display:flex; }
        .hamper-colour-swatch-btn { display:flex;flex-direction:column;align-items:center;gap:5px;background:transparent;border:none;padding:7px 8px;cursor:pointer;border-radius:10px;transition:background .18s,box-shadow .18s; }
        .hamper-colour-swatch-btn:hover { background:var(--olivedim); }
        .hamper-colour-swatch-btn:disabled { cursor:not-allowed; }
        .hamper-colour-swatch.out { opacity:.5; }
        .hamper-colour-swatch-img-wrap { position:relative;display:block;flex-shrink:0;width:60px;aspect-ratio:4/5;overflow:hidden;border:1.5px solid transparent;transition:all .18s; }
        .hamper-colour-swatch-img-wrap img { width:100%;height:100%;object-fit:cover; }
        .hamper-colour-swatch-btn:hover .hamper-colour-swatch-img-wrap { border-color:var(--olive2); }
        .hamper-colour-swatch.on .hamper-colour-swatch-btn { background:var(--olivedim);box-shadow:inset 0 0 0 1.5px var(--olive); }
        .hamper-colour-swatch.on .hamper-colour-swatch-img-wrap { border-color:var(--olive);box-shadow:0 0 0 2px rgba(61,80,22,.18); }
        .hamper-colour-swatch.sm .hamper-colour-swatch-img-wrap { width:44px; }
        .hamper-colour-swatch-label { font-size:12px;font-weight:600;color:var(--ink7);white-space:nowrap; }
        .hamper-colour-swatch.on .hamper-colour-swatch-label { color:var(--olive);font-weight:700; }
        .hamper-colour-swatch.text-only .hamper-colour-swatch-btn { padding:9px 16px;border:1.5px solid var(--bdr2);border-radius:50px;min-height:40px;justify-content:center; }
        .hamper-colour-swatch.text-only.on .hamper-colour-swatch-btn { border-color:var(--olive);box-shadow:inset 0 0 0 1px var(--olive); }
        .swatch-view-link { font-size:10px;font-weight:600;letter-spacing:.02em;text-transform:none;color:var(--olive2);text-decoration:underline;text-underline-offset:2px;padding:0;margin-left:auto; }
        .swatch-view-link:hover { color:var(--olive); }
        .modal-field-label .swatch-view-link { margin-left:8px; }

        /* ══════════ BUILDER ══════════ */
        .builder-header-row { display:flex;gap:14px;align-items:flex-start;margin-bottom:16px; }
        .builder-header-media { flex-shrink:0;width:96px; }
        .builder-header-img { width:96px;height:96px;border-radius:12px;overflow:hidden;border:1px solid var(--bdr); }
        .builder-header-img img { width:100%;height:100%;object-fit:cover; }
        .builder-header-thumbs { display:flex;gap:5px;margin-top:6px;flex-wrap:wrap; }
        .builder-header-thumb { width:28px;height:28px;border-radius:6px;overflow:hidden;border:1px solid var(--bdr);padding:0;opacity:.75; }
        .builder-header-thumb.on { border:2px solid var(--gold);opacity:1; }
        .builder-header-thumb img { width:100%;height:100%;object-fit:cover; }
        .builder-header-text { flex:1;min-width:0; }
        .builder-header-title { font-family:var(--ffd);font-size:clamp(1.3rem,5vw,1.9rem);font-weight:600;color:var(--olive);line-height:1.2;margin-bottom:4px; }
        .builder-header-tagline { font-size:12.5px;font-weight:300;color:var(--ink7);line-height:1.6; }
        .builder-header-desc { margin-top:6px;font-size:13px;color:#555;line-height:1.7;white-space:pre-wrap; }

        .builder-progress-wrap { margin-bottom:16px; }
        .builder-progress-track { height:5px;background:var(--bdr);border-radius:3px;overflow:hidden;margin-bottom:8px; }
        .builder-progress-fill { height:100%;background:var(--olive);border-radius:3px;transition:width .3s ease; }
        .builder-hint { font-size:11.5px;font-weight:500;color:var(--olive2); }
        .builder-hint.done { color:var(--green); }

        .builder-grid { display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px; }
        .builder-card { background:var(--surf);border:1.5px solid var(--bdr);overflow:hidden;display:flex;flex-direction:column;transition:all .2s;min-width:0; }
        .builder-card:hover:not(.disabled) { border-color:var(--olive2);transform:translateY(-3px);box-shadow:var(--shadow-lg); }
        .builder-card.chosen { border-color:var(--gold);box-shadow:0 0 0 2px rgba(184,152,42,.15); }
        .builder-card.disabled { opacity:.5; }
        .builder-card-img-wrap { position:relative;aspect-ratio:4/5;overflow:hidden;background:var(--olivedim); }
        .builder-card-img-link { display:block;width:100%;height:100%;cursor:zoom-in; }
        .builder-card-img-link img { width:100%;height:100%;object-fit:cover;transition:transform .35s ease; }
        .builder-card:hover:not(.disabled) .builder-card-img-link img { transform:scale(1.06); }
        .builder-card-check { position:absolute;top:8px;right:8px;width:24px;height:24px;background:var(--olive);color:#fff;display:flex;align-items:center;justify-content:center;border-radius:50%;font-size:11px;font-weight:700; }
        .builder-card-body { padding:10px 10px 12px;display:flex;flex-direction:column;gap:6px;min-width:0;flex:1; }
        .builder-card-name-link { text-decoration:none;color:inherit; }
        .builder-card-name-link:hover .builder-card-name { color:var(--olive); }
        .builder-card-name { font-family:var(--ffd);font-size:.98rem;font-weight:600;color:var(--ink);line-height:1.25;word-break:break-word; }
        .builder-card-price { font-size:12px;font-weight:600;color:var(--olive2); }
        .builder-no-cust { font-size:10px;color:var(--ink4);font-style:italic; }
        .builder-card-actions { display:flex;gap:6px;margin-top:auto; }
        .builder-edit-btn { flex:1;font-size:9px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--olive);border:1.3px solid var(--olive2);border-radius:50px;padding:9px 0;transition:all .18s; }
        .builder-edit-btn:hover { background:var(--olive);color:#fff; }
        .builder-remove-btn { flex:1;font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:var(--ink4);border:1.3px solid var(--bdr2);border-radius:50px;padding:9px 0;transition:all .18s; }
        .builder-remove-btn:hover { color:var(--red);border-color:var(--red); }
        .builder-add-btn { margin-top:auto;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#fff;background:var(--olive);border-radius:50px;padding:11px 0;transition:all .2s; }
        .builder-add-btn:hover:not(:disabled) { background:#2e3c0e; }
        .builder-add-btn:disabled { opacity:.4;cursor:not-allowed;background:var(--bdr2);color:var(--ink4); }

        /* ══════════ STICKY BARS ══════════ */
        .hamper-sticky-bar, .builder-sticky-bar { position:fixed;left:0;right:0;bottom:0;z-index:300;background:var(--surf);border-top:1.5px solid var(--bdr);box-shadow:0 -6px 24px rgba(26,29,13,.10);padding:10px 14px calc(10px + env(safe-area-inset-bottom)); }
        .sticky-inner { max-width:var(--container);margin:0 auto;display:flex;align-items:center;gap:12px; }
        .sticky-inner--col { flex-direction:column;align-items:stretch;gap:0; }

        .hamper-sticky-info { flex:1;min-width:0; }
        .hamper-sticky-label { display:block;font-size:8px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:var(--ink4);margin-bottom:2px; }
        .hamper-sticky-price { display:flex;align-items:baseline;gap:8px;flex-wrap:wrap; }
        .hamper-sticky-price-val { font-family:var(--ffd);font-size:1.2rem;font-weight:600;color:var(--ink); }
        .hamper-sticky-price-orig { font-size:11px;color:var(--ink4);text-decoration:line-through; }
        .hamper-sticky-btn { flex-shrink:0;display:flex;align-items:center;justify-content:center;gap:8px;font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#fff;background:var(--olive);padding:13px 20px;border-radius:50px;box-shadow:0 4px 14px rgba(61,80,22,.25);transition:all .2s;white-space:nowrap; }
        .hamper-sticky-btn:hover { background:#2e3c0e; }
        .hamper-sticky-btn.done { background:var(--green) !important; }
        .hamper-sticky-btn.hamper-sticky-btn-disabled { background:var(--bdr2);color:var(--ink4);box-shadow:none;cursor:not-allowed; }

        .builder-sticky-toggle { flex-shrink:0;display:flex;align-items:center;gap:6px;background:var(--olivedim);border:1.5px solid var(--bdr2);border-radius:50px;padding:9px 14px;color:var(--olive);transition:all .18s; }
        .builder-sticky-toggle:disabled { opacity:.5; }
        .builder-sticky-count { font-size:13px;font-weight:700; }
        .builder-sticky-info { flex:1;min-width:0; }
        .builder-sticky-label { font-size:11px;font-weight:600;color:var(--ink);line-height:1.4;display:block; }
        .builder-sticky-label--done { color:var(--green); }
        .builder-sticky-cart { flex-shrink:0;font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#fff;background:var(--olive);padding:13px 18px;border-radius:50px;box-shadow:0 4px 14px rgba(61,80,22,.25);transition:all .2s;white-space:nowrap; }
        .builder-sticky-cart:hover:not(:disabled) { background:#2e3c0e; }
        .builder-sticky-cart:disabled { opacity:.4;cursor:not-allowed; }
        .builder-sticky-cart.done { background:var(--green) !important; }

        .builder-drawer { position:fixed;left:0;right:0;bottom:calc(64px + env(safe-area-inset-bottom));z-index:299;max-height:50vh;overflow-y:auto;background:var(--surf);border-top:1.5px solid var(--bdr);box-shadow:0 -6px 24px rgba(26,29,13,.10);padding:14px; }
        .builder-drawer-head { display:flex;align-items:center;justify-content:space-between;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--olive);margin-bottom:10px; }
        .builder-drawer-head button { font-size:11px;color:var(--ink4);text-decoration:underline;padding:4px; }
        .builder-drawer-items { display:flex;flex-direction:column;gap:8px; }
        .builder-drawer-item { display:flex;align-items:center;gap:10px;background:var(--bg);border-radius:8px;padding:6px 10px; }
        .builder-drawer-item img { width:36px;height:36px;object-fit:cover;border-radius:6px;flex-shrink:0; }
        .builder-drawer-item-name { flex:1;font-size:12px;color:var(--ink);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap; }
        .builder-drawer-item-name em { font-style:normal;color:var(--gold);font-size:10px; }
        .builder-drawer-item button { width:24px;height:24px;border-radius:50%;background:var(--red);color:#fff;font-size:14px;line-height:1;flex-shrink:0; }

        /* ══════════ CHARM & CHAIN SELECTORS (shared components) ══════════ */
        .charm-selector { width:100%; }
        .charm-section-label { font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--olive-600);display:flex;align-items:center;flex-wrap:wrap;gap:8px;row-gap:6px;margin-bottom:12px; }
        .charm-filled-badge { margin-left:auto;font-size:9px;font-weight:700;letter-spacing:.1em;color:var(--beige);background:var(--olive-500);padding:2px 8px;border-radius:4px;text-transform:uppercase; }
        .charm-all-done { color:var(--olive-500);font-weight:600; }
        .charm-fixed-count-note { display:flex;align-items:flex-start;gap:8px;background:rgba(201,168,76,.1);border:1px solid rgba(201,168,76,.28);border-radius:10px;padding:9px 12px;font-size:12px;color:#6b5518;line-height:1.55; }
        .charm-fixed-count-note strong { font-weight:700;color:var(--olive-600); }
        .charm-count-grid { display:flex;flex-wrap:wrap;gap:8px; }
        .charm-count-btn { width:40px;height:40px;border-radius:10px;background:#fff;border:1px solid var(--beige-dkr);font-size:14px;font-weight:500;color:var(--ink);cursor:pointer;transition:all .15s; }
        .charm-count-btn:hover { border-color:var(--olive-400);background:var(--olive-50); }
        .charm-count-btn.active { background:linear-gradient(135deg,rgba(201,168,76,.15),rgba(201,168,76,.05));color:#8c6b20;box-shadow:0 0 0 3px rgba(201,168,76,.15);transform:translateY(-2px);border-color:transparent; }
        .charm-summary-strip { background:linear-gradient(135deg,rgba(90,110,35,.08),rgba(201,168,76,.06));border:1px solid rgba(90,110,35,.18);border-radius:12px;padding:12px 14px; }
        .charm-summary-header { display:flex;align-items:flex-start;gap:8px;font-size:11.5px;color:var(--mist);margin-bottom:10px;line-height:1.5; }
        .charm-summary-header strong { font-weight:700;color:var(--olive-600); }
        .charm-summary-pill { display:inline-flex;align-items:center;gap:6px;font-size:10.5px;font-weight:500;color:var(--ink);background:#fff;border:1px solid rgba(61,74,34,.12);padding:4px 10px 4px 4px;border-radius:50px; }
        .charm-summary-pill--empty { color:var(--mist);background:var(--beige-dk);border-color:var(--beige-dkr);font-style:italic; }
        .charm-summary-num { width:20px;height:20px;border-radius:50%;background:var(--olive-600);color:var(--beige);font-size:9px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0; }
        .charm-summary-pill--empty .charm-summary-num { background:var(--beige-dkr);color:var(--mist); }

        .chain-selector-wrap { background:linear-gradient(135deg,rgba(90,110,35,.07),rgba(201,168,76,.06));border:1.5px solid rgba(90,110,35,.2);border-radius:18px;padding:14px 14px 16px;margin-bottom:16px;position:relative; }
        .chain-trigger { width:100%;display:flex;align-items:center;gap:10px;background:#fff;border:1.5px solid var(--beige-dkr);border-radius:12px;padding:7px 10px;cursor:pointer;text-align:left;transition:border-color .2s,box-shadow .2s; }
        .chain-trigger:hover { border-color:var(--olive-400); }
        .chain-trigger--open { border-color:var(--olive-500);box-shadow:0 0 0 3px rgba(90,110,35,.1); }
        .chain-trigger--missing { border-color:var(--red);background:rgba(192,57,43,.04); }
        .chain-trigger-thumb { width:46px;height:46px;border-radius:8px;overflow:hidden;flex-shrink:0;background:#fff;border:1px solid rgba(61,74,34,.1);display:flex;align-items:center;justify-content:center;cursor:zoom-in;position:relative; }
        .chain-trigger-thumb img { width:100%;height:100%;object-fit:contain;display:block; }
        .chain-trigger-zoom { position:absolute;bottom:3px;right:3px;width:16px;height:16px;border-radius:50%;background:rgba(26,31,13,.65);color:#fff;display:flex;align-items:center;justify-content:center; }
        .chain-trigger-zoom svg { width:9px;height:9px; }
        .chain-trigger-text { flex:1;min-width:0;display:flex;flex-direction:column;gap:1px; }
        .chain-trigger-label { font-size:12.5px;font-weight:600;color:var(--olive-900);overflow:hidden;text-overflow:ellipsis;white-space:nowrap; }
        .chain-trigger-price { font-size:10.5px;font-weight:600;color:var(--olive-600); }
        .chain-trigger-chevron { width:16px;height:16px;color:var(--mist);flex-shrink:0;transition:transform .25s ease; }
        .chain-trigger--open .chain-trigger-chevron { transform:rotate(180deg); }
        .chain-options-panel { margin-top:10px;background:#fff;border:1.5px solid var(--beige-dkr);border-radius:16px;overflow:hidden;animation:chainPanelIn .2s ease both; }
        .chain-option-row { width:100%;display:flex;align-items:center;gap:12px;padding:8px 10px;background:#fff;border:none;border-bottom:1px solid rgba(61,74,34,.07);cursor:pointer;text-align:left;transition:background .15s; }
        .chain-option-row:last-child { border-bottom:none; }
        .chain-option-row:hover { background:var(--olive-50); }
        .chain-option-row--active { background:rgba(201,168,76,.09); }
        .chain-option-thumb { width:68px;height:68px;border-radius:12px;overflow:hidden;flex-shrink:0;position:relative;background:#fff;border:1px solid rgba(61,74,34,.1);cursor:zoom-in; }
        .chain-option-thumb img { width:100%;height:100%;object-fit:contain;display:block;transition:transform .3s ease; }
        .chain-option-row:hover .chain-option-thumb img { transform:scale(1.05); }
        .chain-option-zoom { position:absolute;bottom:4px;right:4px;width:20px;height:20px;border-radius:50%;background:rgba(26,31,13,.65);color:#fff;display:flex;align-items:center;justify-content:center; }
        .chain-option-zoom svg { width:11px;height:11px; }
        .chain-option-text { flex:1;min-width:0;display:flex;flex-direction:column;gap:2px; }
        .chain-option-label { font-size:12.5px;font-weight:600;color:var(--olive-900);overflow:hidden;text-overflow:ellipsis;white-space:nowrap; }
        .chain-option-price { font-size:10.5px;font-weight:700;color:var(--olive-600); }
        .chain-option-check { width:18px;height:18px;color:var(--olive-500);flex-shrink:0; }
        .charm-select { width:100%;appearance:none;-webkit-appearance:none;background:var(--beige);border:1.5px solid var(--beige-dkr);border-radius:8px;padding:10px 36px 10px 12px;font-size:16px;color:#101010;cursor:pointer;outline:none; }

        /* ══════════ EXTRAS: trust + policies + delivery ══════════ */
        .combo-extras { display:flex;flex-direction:column;gap:16px; }
        .combo-extras-grid { display:grid;grid-template-columns:minmax(0,1fr);gap:16px;align-items:start; }

        .combo-trust { display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px; }
        .combo-trust-item { display:flex;flex-direction:column;align-items:center;text-align:center;padding:10px 4px;background:var(--surf);border:1px solid var(--bdr);border-radius:12px;transition:transform .2s,box-shadow .2s; }
        .combo-trust-item:hover { transform:translateY(-3px);box-shadow:var(--shadow); }
        .combo-trust-icon { width:26px;height:26px;color:var(--olive2);margin-bottom:5px; }
        .combo-trust-title { font-size:8.5px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--olive);margin-bottom:2px; }
        .combo-trust-sub { font-size:8px;color:var(--ink7);line-height:1.3; }

        .combo-accordion { border-top:1px solid var(--bdr); }
        .combo-acc-item { border-bottom:1px solid var(--bdr); }
        .combo-acc-head { display:flex;align-items:center;justify-content:space-between;width:100%;padding:14px 2px;transition:background .15s; }
        .combo-acc-head:hover { background:rgba(61,80,22,.03); }
        .combo-acc-head-left { display:flex;align-items:center;gap:9px;font-size:13px;font-weight:500;color:var(--ink);text-align:left; }
        .combo-acc-emoji { font-size:15px; }
        .combo-acc-chevron { color:var(--ink4);flex-shrink:0;transition:transform .32s ease; }
        .combo-acc-item--open .combo-acc-chevron { transform:rotate(180deg); }
        .combo-acc-body { padding:0 2px 16px 4px;font-size:12.5px;font-weight:300;line-height:1.8;color:var(--ink7); }

        .cpol { display:flex;flex-direction:column;gap:14px;font-size:12.5px;font-weight:400;line-height:1.75;color:var(--ink); }
        .cpol p { margin:0; }
        .cpol .cpol-h { font-size:9.5px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--olive);margin-bottom:4px; }
        .cpol strong { font-weight:600;color:var(--ink); }
        .cpol a { color:var(--olive);font-weight:600;text-decoration:underline;text-underline-offset:3px; }
        .cpol ul { list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:6px; }
        .cpol li { display:flex;gap:8px;align-items:flex-start; }
        .cpol li::before { content:'✦';color:var(--sage);font-size:9px;margin-top:5px;flex-shrink:0; }
        .cpol-table-wrap { overflow-x:auto;border:1px solid var(--bdr);border-radius:10px;background:var(--surf);margin-top:6px; }
        .cpol-table { width:100%;border-collapse:collapse;font-size:12px; }
        .cpol-table th { background:var(--olivedim);color:var(--olive);font-size:9px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;padding:10px 12px;text-align:left;border-bottom:1px solid var(--bdr);white-space:nowrap; }
        .cpol-table td { padding:10px 12px;border-bottom:1px solid var(--olivedim);white-space:nowrap; }
        .cpol-table tr:last-child td { border-bottom:none; }
        .cpol-note { background:var(--olivedim);border:1px solid var(--bdr);border-radius:10px;padding:10px 12px;font-size:12px;margin-top:8px; }
        .cpol-alert { background:rgba(192,57,43,.06);border:1px solid rgba(192,57,43,.18);border-left:3px solid rgba(192,57,43,.5);border-radius:8px;padding:10px 12px;font-size:12px; }
        .cpol-alert strong { color:var(--red); }
        .cpol .cpol-link { align-self:flex-start;font-size:10.5px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;text-decoration:none;border-bottom:1.5px solid var(--bdr2);padding-bottom:1px; }
        .cpol .cpol-link:hover { border-color:var(--olive); }

        .combo-delivery-label { font-size:9px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--olive2);margin-bottom:10px; }
        .combo-delivery-grid { display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px; }
        .combo-delivery-card { border:1.5px solid var(--bdr);border-radius:14px;padding:12px 10px;background:var(--surf); }
        .combo-delivery-icon { font-size:22px;margin-bottom:4px; }
        .combo-delivery-opt-label { font-size:14px;font-weight:800;color:var(--ink);margin-bottom:10px; }
        .combo-delivery-tier { margin-bottom:6px; }
        .combo-delivery-tier-label { font-size:9px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--olive2);margin-bottom:1px; }
        .combo-delivery-tier-val { font-size:12px;font-weight:600;color:var(--ink); }
        .combo-delivery-rate { font-size:13px;font-weight:800;color:var(--olive2); }
        .combo-delivery-freebar { margin-top:10px;padding:11px 14px;background:linear-gradient(135deg,#e6f4e7,#f0faf0);border:1.5px solid rgba(42,96,48,.22);border-radius:10px;display:flex;align-items:center;gap:9px;font-size:12px;font-weight:700;color:#0a2e12;line-height:1.4; }

        /* ══════════ REVIEWS ══════════ */
        .combo-rev-wrapper { margin:28px auto 0;padding-top:24px;border-top:1px solid var(--bdr);max-width:900px; }
        .combo-rev-header { text-align:center;margin-bottom:20px; }
        .combo-rev-eyebrow { display:block;font-size:9px;letter-spacing:.4em;text-transform:uppercase;color:var(--gold);margin-bottom:5px; }
        .combo-rev-title { font-family:var(--ffd);font-size:1.4rem;font-weight:400;font-style:italic;color:var(--olive); }
        .combo-rev-summary { display:grid;grid-template-columns:minmax(0,1fr);background:var(--surf);border:1px solid var(--bdr);border-radius:14px;overflow:hidden;margin-bottom:16px; }
        .combo-rev-avg-box { background:linear-gradient(160deg,var(--olive),var(--olive2));padding:16px;display:flex;flex-direction:row;align-items:center;justify-content:center;gap:14px;flex-wrap:wrap; }
        .combo-rev-avg-num { font-family:var(--ffd);font-size:2.6rem;font-weight:600;color:#f5f0e8;line-height:1; }
        .combo-rev-stars { font-size:13px;color:var(--gold);letter-spacing:2px; }
        .combo-rev-total { font-size:8px;letter-spacing:.16em;text-transform:uppercase;color:rgba(245,240,232,.7); }
        .combo-rev-bars { display:flex;flex-direction:column;gap:5px;padding:12px 14px;justify-content:center; }
        .combo-rev-bar-row { display:flex;align-items:center;gap:8px;padding:3px 5px;border-radius:6px; }
        .combo-rev-bar-row:hover { background:rgba(61,80,22,.05); }
        .combo-rev-bar-row.active { background:var(--golddim); }
        .combo-rev-bar-label { font-size:10px;font-weight:600;color:var(--olive2);min-width:20px;text-align:right; }
        .combo-rev-bar-track { flex:1;height:5px;background:var(--bdr);border-radius:50px;overflow:hidden; }
        .combo-rev-bar-fill { height:100%;background:linear-gradient(90deg,var(--gold),var(--olive2));border-radius:50px; }
        .combo-rev-bar-count { font-size:9px;color:var(--ink4);min-width:20px; }
        .combo-rev-controls { display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:16px;min-height:36px; }
        .combo-rev-clear { font-size:10px;font-weight:600;color:var(--gold);background:var(--golddim);border:1px solid rgba(184,152,42,.3);border-radius:50px;padding:6px 12px; }
        .combo-rev-write-btn { font-size:11px;font-weight:600;color:#fff;background:var(--olive);border-radius:50px;padding:10px 18px;margin-left:auto; }
        .combo-rev-empty { font-size:12.5px;color:var(--ink4);text-align:center;padding:16px 0; }
        .combo-rev-list { display:flex;flex-direction:column;gap:12px; }
        .combo-rev-card { background:var(--surf);border:1px solid var(--bdr);border-radius:14px;padding:14px; }
        .combo-rev-card-top { display:flex;align-items:flex-start;gap:12px;margin-bottom:10px; }
        .combo-rev-avatar { width:36px;height:36px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;background:var(--golddim);color:var(--gold); }
        .combo-rev-meta-row { display:flex;align-items:center;flex-wrap:wrap;gap:7px; }
        .combo-rev-name { font-size:12.5px;font-weight:600;color:var(--ink); }
        .combo-rev-verified { display:flex;align-items:center;gap:3px;font-size:9px;font-weight:600;text-transform:uppercase;color:var(--olive2); }
        .combo-rev-stars-sm { font-size:11px;color:var(--gold); }
        .combo-rev-date { font-size:10px;color:var(--ink4); }
        .combo-rev-body { font-size:12.5px;font-weight:300;color:var(--ink7);line-height:1.75; }
        .combo-rev-load { display:flex;justify-content:center;margin-top:20px; }
        .combo-rev-load-btn { font-size:10px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--olive);background:var(--surf);border:1.5px solid var(--bdr2);border-radius:50px;padding:12px 26px; }

        /* Touch devices: no hover lift */
        @media (hover:none) {
          .combo-card:hover, .builder-card:hover:not(.disabled), .combo-trust-item:hover { transform:none;box-shadow:none; }
        }

        /* ═══════════════════════════════════════════════
           BREAKPOINTS (mobile-first)
        ═══════════════════════════════════════════════ */

        /* very small phones */
        @media (max-width:380px) {
          .combo-delivery-grid { grid-template-columns:minmax(0,1fr); }
          .hamper-sticky-btn { padding:12px 14px;font-size:9px; }
          .builder-sticky-cart { padding:12px 12px;font-size:9px; }
          .builder-sticky-toggle { padding:8px 10px; }
          .builder-sticky-label { font-size:10px; }
          .builder-header-media, .builder-header-img { width:80px; }
          .builder-header-img { height:80px; }
        }

        /* short landscape phones */
        @media (max-height:480px) and (orientation:landscape) {
          .modal-box { max-height:100dvh; }
          .hamper-sticky-bar, .builder-sticky-bar { padding-top:6px;padding-bottom:6px; }
          .hamper-main-img-wrap { max-height:80vh; }
        }

        /* ─────────── ≥ 520px (large phones) ─────────── */
        @media (min-width:520px) {
          .combo-trust-title { font-size:9.5px; }
          .combo-trust-sub { font-size:9px; }
          .combo-trust-icon { width:32px;height:32px; }
          .hamper-colour-swatch-img-wrap { width:66px; }
          .pricing-tier-btn { flex:0 1 auto; }
        }

        /* ─────────── ≥ 640px ─────────── */
        @media (min-width:640px) {
          .modal-backdrop { align-items:center;padding:16px; }
          .modal-box { max-width:540px;max-height:calc(100dvh - 32px);border-radius:16px;animation:modalIn .28s cubic-bezier(.34,1.1,.64,1); }
          .modal-header { padding:18px 20px 14px; }
          .modal-product-strip { padding:12px 20px; }
          .modal-body { padding:18px 20px;gap:20px; }
          .modal-footer { padding:12px 20px 18px; }
          .modal-textarea, .charm-select { font-size:13px; }
          .lightbox-backdrop { padding:24px; }
          .lightbox-close { top:16px;right:16px; }

          .modebar { flex-direction:row;align-items:center;gap:18px;flex-wrap:wrap; }
          .modetoggle { width:auto; }
          .modebtn { flex:none;padding:10px 22px; }
          .hero-desc { font-size:13.5px; }
        }

        /* ─────────── TABLET ≥ 768px ─────────── */
        @media (min-width:768px) {
          .hero { padding:36px 32px 26px; }
          .modebar { padding:20px 32px 0; }
          .layout { padding-bottom:104px; }

          .combo-grid { grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;padding:22px 28px 0; }

          .hamper-page, .builder-page { padding:24px 28px 0; }
          .hamper-divider { margin:24px 0; }

          /* gallery left (sticky), info right */
          .hamper-main-block { display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:32px;align-items:start;margin-bottom:8px; }
          .hamper-gallery { position:sticky;top:96px; }
          .hamper-main-img-wrap { aspect-ratio:1/1;max-height:none; }
          .hamper-thumb { width:62px;height:62px; }
          .hamper-title { font-size:2.1rem; }
          .hamper-price { font-size:1.9rem; }
          .hamper-description { font-size:14px; }

          .hamper-piece { padding:18px; }
          .hamper-piece-index { top:-10px;left:16px; }
          .hamper-box-body { display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:22px;align-items:start; }

          .builder-header-row { gap:22px;margin-bottom:22px; }
          .builder-header-media { width:150px; }
          .builder-header-img { width:150px;height:150px;border-radius:14px; }
          .builder-header-thumb { width:34px;height:34px; }
          .builder-header-tagline { font-size:13.5px; }
          .builder-grid { grid-template-columns:repeat(3,minmax(0,1fr));gap:14px; }
          .builder-card-body { padding:12px 12px 14px; }

          .hamper-sticky-bar, .builder-sticky-bar { padding:12px 28px calc(12px + env(safe-area-inset-bottom)); }
          .builder-drawer { padding:16px 28px;bottom:calc(72px + env(safe-area-inset-bottom)); }
          .builder-sticky-label { font-size:12.5px; }
          .hamper-sticky-btn, .builder-sticky-cart { padding:14px 28px;font-size:11px; }

          .combo-trust { gap:12px; }
          .combo-trust-item { padding:16px 10px;border-radius:14px; }
          .combo-trust-icon { width:38px;height:38px; }
          .combo-trust-title { font-size:10.5px; }
          .combo-trust-sub { font-size:10px; }
          .combo-delivery-card { padding:16px 14px; }
          .combo-acc-head-left { font-size:13.5px; }

          .combo-rev-summary { grid-template-columns:200px minmax(0,1fr); }
          .combo-rev-avg-box { flex-direction:column;gap:5px;padding:22px; }
          .combo-rev-bars { padding:18px 22px; }
          .combo-rev-card { padding:18px 20px; }
          .combo-rev-title { font-size:1.6rem; }

          .chain-option-thumb { width:84px;height:84px; }
          .chain-trigger-thumb { width:52px;height:52px; }
        }

        /* ─────────── LAPTOP ≥ 1024px ─────────── */
        @media (min-width:1024px) {
          .hero { padding:44px 56px 30px; }
          .modebar { padding:24px 56px 0; }

          .combo-grid { grid-template-columns:repeat(4,minmax(0,1fr));gap:18px;padding:26px 40px 0; }

          .hamper-page, .builder-page { padding:28px 40px 0; }
          .hamper-main-block { gap:56px; }
          .hamper-gallery { top:100px; }
          .hamper-title { font-size:2.5rem; }

          /* pieces: two columns */
          .hamper-piece-list { grid-template-columns:repeat(2,minmax(0,1fr));gap:24px;align-items:start; }

          .builder-grid { grid-template-columns:repeat(4,minmax(0,1fr));gap:18px; }
          .builder-header-media { width:170px; }
          .builder-header-img { width:170px;height:170px; }

          /* policies and delivery side by side */
          .combo-extras-grid { grid-template-columns:minmax(0,1.15fr) minmax(0,.85fr);gap:32px; }
          .combo-delivery-grid { grid-template-columns:repeat(2,minmax(0,1fr)); }

          .hamper-sticky-bar, .builder-sticky-bar { padding-left:40px;padding-right:40px; }
          .builder-drawer { padding-left:40px;padding-right:40px; }
        }

        /* ─────────── LARGE ≥ 1440px ─────────── */
        @media (min-width:1440px) {
          :root { --container: 1320px; }
          .combo-grid { max-width:1440px; }
          .hamper-main-block { gap:72px; }
        }
      `}</style>

      <div className="page">
        <UpperNav />

        <div className="hero">
          <div className="hero-eyebrow">
            <span className="hero-line" />
            <span>Jewellery Collections</span>
            <span className="hero-line" />
          </div>
          <h1>Build Your <em>Perfect</em><br />Jewellery Hamper</h1>
          <p className="hero-desc">Choose a curated set and personalise every piece — or build something entirely your own.</p>
        </div>

        <div className="modebar">
          <div className="modetoggle">
            <button className={`modebtn${mode === 'preset' ? ' on' : ''}`} onClick={() => setMode('preset')}>◈ Curated Sets</button>
            <button className={`modebtn${mode === 'custom' ? ' on' : ''}`} onClick={() => setMode('custom')}>✦ Build Your Own</button>
          </div>
          <p className="modehint">
            {mode === 'preset'
              ? (presetView === 'grid'
                  ? 'Browse our curated sets and pick the one you love.'
                  : 'Pick colour, size, message and photo per piece, then add to cart.')
              : (customView === 'grid'
                  ? 'Pick a bundle size below, then choose your favourite pieces to fill it.'
                  : 'Tap "Add To Box" on each piece to customise it, then check out.')}
          </p>
        </div>

        <div className="layout">
          {mode === 'preset' ? (
            presetView === 'grid' ? (
              <PresetComboGrid
                combos={presetCombos}
                onSelect={id => {
                  const url = new URL(window.location.href);
                  url.searchParams.set('combo', id);
                  url.searchParams.delete('custom');
                  router.push(url.pathname + (url.search || ''), { scroll: false });
                  setSelectedComboId(id);
                  setPresetView('detail');
                }}
              />
            ) : (
              <PresetHamperSection
                combo={presetCombos.find(c => c.id === selectedComboId)!}
                variants={presetVariants}
                comboVariant={comboVariants[selectedComboId] || {}}
                onComboVariantChange={(v) => setComboVariants(prev => ({ ...prev, [selectedComboId]: v }))}
                onVariantChange={handlePresetVariantChange}
                onAddToCart={handlePresetAddToCart}
                cartAdded={!!presetCartAdded[selectedComboId]}
                onBack={() => {
                  const url = new URL(window.location.href);
                  url.searchParams.delete('combo');
                  router.push(url.pathname + (url.search || ''), { scroll: false });
                  setPresetView('grid');
                }}
              />
            )
          ) : (
            customView === 'grid' ? (
              <CustomSlotGrid
                slots={customSlots}
                onSelect={id => {
                  const url = new URL(window.location.href);
                  url.searchParams.set('custom', id);
                  url.searchParams.delete('combo');
                  router.push(url.pathname + (url.search || ''), { scroll: false });
                  setSelectedSlotId(id);
                  setCustomView('detail');
                }}
              />
            ) : (
              <CustomBuilderSection
                slot={customSlots.find(s => s.id === selectedSlotId)!}
                selectedIds={slotSelections[selectedSlotId] || []}
                variants={slotVariants[selectedSlotId] || {}}
                comboVariant={comboVariants[selectedSlotId] || {}}
                onComboVariantChange={(v) => setComboVariants(prev => ({ ...prev, [selectedSlotId]: v }))}
                onToggle={pid => handleSlotToggle(selectedSlotId, pid)}
                onVariantChange={(pid, v) => handleSlotVariantChange(selectedSlotId, pid, v)}
                onAddToCart={handleCustomAddToCart}
                cartAdded={!!customCartAdded[selectedSlotId]}
                onBack={() => {
                  const url = new URL(window.location.href);
                  url.searchParams.delete('custom');
                  router.push(url.pathname + (url.search || ''), { scroll: false });
                  setCustomView('grid');
                }}
                gender={gender}
              />
            )
          )}
        </div>
      </div>
    </>
  );
}