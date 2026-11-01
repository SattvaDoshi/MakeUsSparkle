'use client';
import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';

import { useCart } from '@/lib/cartContext';
import { fireConfetti } from '@/components/cart/ConfettiManager';
import { useWishlist } from '@/lib/wishlistContext';
import UpperNav from '@/components/ui/UpperNav';
import Link from 'next/link';
import { fetchProductById, fetchProductReviews, submitProductReview, type CatalogProduct, type ReviewData } from '@/lib/catalogApi';
import { useAuth } from '@/lib/authContext';

/* ─── Types ─── */
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
  image?: string;
}

interface UploadItem {
  id: number;
  file: File;
  preview: string;
  note: string;
}

export interface ChainOption {
  value: string;
  label: string;
  image: string;
  sub?: string;
  price?: number;
}

/* ─── Chain option list — fallback when the product has no chain variants ─── */
export const CHAIN_OPTIONS: ChainOption[] = [
  { value: 'box_chain', label: 'Box Chain', sub: 'Classic square-link, sits flat', image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80', price: 199 },
  { value: 'cable_chain', label: 'Cable Chain', sub: 'Timeless round links', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80', price: 249 },
  { value: 'rope_chain', label: 'Rope Chain', sub: 'Twisted, high-shine finish', image: 'https://images.unsplash.com/photo-1599643477873-108bb9622d17?w=600&q=80', price: 349 },
  { value: 'figaro_chain', label: 'Figaro Chain', sub: 'Alternating link pattern', image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80', price: 299 },
  { value: 'curb_chain', label: 'Curb Chain', sub: 'Flattened, interlocking links', image: 'https://images.unsplash.com/photo-1573408301185-9519f94e84dd?w=600&q=80', price: 279 },
];

const FALLBACK_PRODUCT_IMAGE = '/images/hero.png';
// ── Replace with actual size chart image path ──
const SIZE_CHART_IMAGE = '/images/size-chart.jpg';
// ── Replace with actual gift box image path ──
const GIFT_BOX_IMAGE = '/smallerBox.png';
const CUSTOMISABLE_CATEGORIES = ['Gift Boxes', 'Fan Box', 'Key Chain/Charm'];

/* ─── Helpers ─── */
function normalizeText(v: string) { return v.trim().toLowerCase(); }
function uniqueValues(vals: Array<string | undefined | null>) {
  return Array.from(new Set(vals.filter((v): v is string => Boolean(v && v.trim()))));
}
function dedupeImages(vals: Array<string | undefined | null>) { return uniqueValues(vals); }

/* ─── Generic Image Lightbox (used for Size Chart & Chain photos) ─── */
function ImageLightbox({ onClose, imageUrl, eyebrow, title, footerTip }: { onClose: () => void; imageUrl: string; eyebrow: string; title: string; footerTip?: string }) {
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
            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.22em', textTransform: 'uppercase', color: 'var(--olive-500)', marginBottom: 2 }}>{eyebrow}</p>
            <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--olive-900)', fontFamily: 'Cormorant Garamond, serif' }}>{title}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 34, height: 34, borderRadius: '50%', border: '1.5px solid rgba(61,74,34,.15)',
              background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--mist)', transition: 'all .2s',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        {/* Image */}
        <div style={{ overflow: 'auto', flexShrink: 1, background: 'white' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={title}
            style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'contain' }}
          />
        </div>
        {/* Footer tip */}
        {footerTip && (
          <div style={{
            padding: '12px 20px', borderTop: '1px solid rgba(61,74,34,.08)',
            fontSize: 10, color: 'var(--mist)', letterSpacing: '.06em',
            background: 'var(--beige-dk)', flexShrink: 0,
          }}>
            {footerTip}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Premium Gift Box Upsell ─── */
function GiftBoxUpsell({
  added, onToggle, image, heading, description, price,
}: {
  added: boolean;
  onToggle: () => void;
  image: string;
  heading: string;
  description: string;
  price: number;
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'stretch',
      border: `1.5px solid ${added ? 'rgba(201,168,76,.55)' : 'rgba(61,74,34,.13)'}`,
      borderRadius: 14, overflow: 'hidden',
      background: added ? 'linear-gradient(135deg,rgba(201,168,76,.07),rgba(245,240,232,.8))' : 'white',
      transition: 'border-color .25s, background .25s',
      marginBottom: 0,
    }}>
      {/* Square image, left side */}
      <div style={{ width: '38%', aspectRatio: '1', flexShrink: 0, position: 'relative', overflow: 'hidden', background: 'var(--beige-dk)' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={heading}
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
            {heading}
          </p>
          <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--olive-600)', flexShrink: 0 }}>+₹{price}</span>
        </div>

        <p style={{ fontSize: 10, fontWeight: 400, color: '#101010', lineHeight: 1.5, letterSpacing: '.02em' }}>
          {description}
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
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8"><polyline points="20 6 9 17 4 12" /></svg>
              Added
            </>
          ) : (
            <>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              Add to order
            </>
          )}
        </button>
      </div>
    </div>
  );
}

/* ─── Trust badges ─── */
const TRUST_BADGES = [
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="18" width="28" height="18" rx="2" /><path d="M32 22h4l6 8v6h-10V22z" />
        <circle cx="14" cy="38" r="3" /><circle cx="36" cy="38" r="3" />
        <path d="M4 26h28" /><path d="M10 14h4M16 11v6" />
      </svg>
    ),
    title: 'Free Shipping', sub: 'On orders above ₹999',
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M24 6C14 6 8 14 8 22c0 10 16 22 16 22s16-12 16-22c0-8-6-16-16-16z" />
        <path d="M20 22l3 3 6-6" />
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

/* ─── Goes well with ─── */
const GOES_WELL_WITH = [
  { id: 1, name: 'Pearl Drop Earrings', price: 899, originalPrice: 1299, image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&q=80', href: '/products/pearl-drop-earrings' },
  { id: 2, name: 'Delicate Gold Bracelet', price: 1199, originalPrice: 1699, image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&q=80', href: '/products/gold-bracelet' },
  { id: 3, name: 'Twisted Ring Set', price: 749, originalPrice: 999, image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&q=80', href: '/products/twisted-ring-set' },
  { id: 4, name: 'Charm Anklet', price: 649, originalPrice: 849, image: 'https://images.unsplash.com/photo-1573408301185-9519f94e84dd?w=400&q=80', href: '/products/charm-anklet' },
];

/* ─── CHAIN SELECTOR — compact dropdown with a large, fully-visible preview photo ─── */
export function ChainSelector({
  value,
  onChange,
  onViewImage,
  showMissing,
  options = [],
  label = 'Chain Type',
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  onViewImage: (chain: ChainOption) => void;
  showMissing?: boolean;
  options?: ChainOption[];
  label?: string;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!options || options.length === 0) return null;

  const selected = options.find(c => c.value === value) || null;
  const displayLabel = label || 'Chain Type';
  const displayPlaceholder = placeholder || (
    displayLabel.toLowerCase().startsWith('select')
      ? `${displayLabel}…`
      : `Select a ${displayLabel.toLowerCase()}…`
  );

  return (
    <div className="chain-selector-wrap" ref={wrapRef}>
      <p className="charm-section-label">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14, color: 'var(--gold)' }}>
          <circle cx="12" cy="6" r="3" /><circle cx="12" cy="18" r="3" /><path d="M12 9v6" />
        </svg>
        {displayLabel}
      </p>

      <button type="button" className={`chain-trigger${open ? ' chain-trigger--open' : ''}${showMissing && !selected ? ' chain-trigger--missing' : ''}`} onClick={() => setOpen(o => !o)}>
        <div
          className="chain-trigger-thumb"
          onClick={e => { if (selected) { e.stopPropagation(); onViewImage(selected); } }}
        >
          {selected ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={selected.image} alt={selected.label} />
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ width: 22, height: 22, color: 'var(--olive-400)' }}>
              <circle cx="12" cy="6" r="3" /><circle cx="12" cy="18" r="3" /><path d="M12 9v6" />
            </svg>
          )}
          {selected && (
            <span className="chain-trigger-zoom">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" /></svg>
            </span>
          )}
        </div>
        <div className="chain-trigger-text">
          <span className="chain-trigger-label">{selected ? selected.label : displayPlaceholder}</span>
          {selected && typeof selected.price === 'number' && (
            <span className="chain-trigger-price">+₹{selected.price.toLocaleString('en-IN')}</span>
          )}
        </div>
        <svg className="chain-trigger-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {showMissing && !selected && (
        <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--red)', marginTop: 8 }}>
          Please choose a {displayLabel.toLowerCase().replace(/^select\s+/i, '')} before proceeding.
        </p>
      )}

      {open && (
        <div className="chain-options-panel">
          {options.map(opt => (
            <button
              type="button"
              key={opt.value}
              className={`chain-option-row${value === opt.value ? ' chain-option-row--active' : ''}`}
              onClick={() => { onChange(opt.value); setOpen(false); }}
            >
              <div
                className="chain-option-thumb"
                onClick={e => { e.stopPropagation(); onViewImage(opt); }}
                title="View larger photo"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={opt.image} alt={opt.label} />
                <span className="chain-option-zoom">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" /></svg>
                </span>
              </div>
              <div className="chain-option-text">
                <span className="chain-option-label">{opt.label}</span>
                {typeof opt.price === 'number' && (
                  <span className="chain-option-price">+₹{opt.price.toLocaleString('en-IN')}</span>
                )}
              </div>
              {value === opt.value && (
                <svg className="chain-option-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8"><polyline points="20 6 9 17 4 12" /></svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── CHARM SELECTOR COMPONENT ─── */
export function CharmSelector({
  onChange,
  charmPieceOptions = [],
  totalCharms = 8,
  validationAttempt,
  charmStocks = [],
}: {
  onChange: (data: { count: number; charms: string[] }) => void;
  charmPieceOptions?: number[];
  totalCharms?: number;
  validationAttempt?: number;
  charmStocks?: Array<{ charmNumber: number; stock: number }>;
}) {
  const validPieceOptions = (charmPieceOptions || []).map(Number).filter(n => n > 0);
  const validTotal = Number(totalCharms) > 0 ? Number(totalCharms) : 0;
  const optionsList = validPieceOptions.length > 0 ? validPieceOptions : Array.from({ length: validTotal }, (_, i) => i + 1);
  // When the product only offers a single charm count (e.g. always 3 charms),
  // that count is fixed — there's nothing to "choose", so we don't show a picker
  // for it and the user can never end up with fewer than that many charms.
  const isFixedCount = optionsList.length === 1 && optionsList[0] > 0;
  const [charmCount, setCharmCount] = useState(0); // 0 means no selection initially
  const [selectedCharms, setSelectedCharms] = useState<string[]>([]);
  const [showMissing, setShowMissing] = useState(false);

  // Sync count options change
  useEffect(() => {
    if (validPieceOptions.length === 1) {
      setCharmCount(validPieceOptions[0]);
    } else if (validTotal === 1 && validPieceOptions.length === 0) {
      setCharmCount(1);
    } else {
      setCharmCount(0);
    }
    setSelectedCharms([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(validPieceOptions), validTotal]);

  // Keep selectedCharms array in sync with charmCount
  useEffect(() => {
    setSelectedCharms(prev => {
      const next = [...prev];
      while (next.length < charmCount) next.push('');
      return next.slice(0, charmCount);
    });
    // Changing the charm count is a fresh selection round — clear any stale warning.
    setShowMissing(false);
  }, [charmCount]);

  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    onChangeRef.current({ count: charmCount, charms: selectedCharms });
  }, [charmCount, selectedCharms]);

  // Parent bumps this counter every time the user tries to add-to-cart/buy-now
  // with an incomplete charm selection — trigger the inline warning state.
  useEffect(() => {
    if (validationAttempt) setShowMissing(true);
  }, [validationAttempt]);

  const setCharm = (index: number, value: string) => {
    setSelectedCharms(prev => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const filledCount = selectedCharms.filter(Boolean).length;
  const stockMap = useMemo(() => {
    return new Map((charmStocks || []).map(s => [Number(s.charmNumber), Number(s.stock)]));
  }, [charmStocks]);
  const hasStockConfig = (charmStocks || []).length > 0;

  const availableCharms = [
    { value: '', label: 'Select a charm...', disabled: false },
    ...Array.from({ length: validTotal }, (_, i) => {
      const charmNum = i + 1;
      const stock = stockMap.get(charmNum);
      const isOutOfStock = hasStockConfig && stock !== undefined && stock <= 0;
      return {
        value: String(charmNum),
        label: isOutOfStock ? `Charm ${charmNum} (Out of stock)` : `Charm ${charmNum}`,
        disabled: isOutOfStock,
      };
    }),
  ];
  const allCharmsSelected = filledCount === charmCount;

  return (
    <div className="charm-selector">
      {/* Count picker — only rendered when the product actually offers a choice.
          If it only supports one fixed count, that count is shown as a plain
          requirement, not a selectable option, so it can never be reduced. */}
      {isFixedCount && charmCount > 0 ? (
        <div className="charm-fixed-count-note" style={{ marginBottom: 20 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14, color: 'var(--gold)', flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>This piece takes exactly <strong>{charmCount}</strong> charm{charmCount > 1 ? 's' : ''} — all {charmCount > 1 ? `${charmCount} are` : 'is'} required below.</span>
        </div>
      ) : (
        <>
          <p className="charm-section-label">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14, color: 'var(--gold)' }}>
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            Number of Charms
          </p>
          <div className="charm-count-grid" style={{ marginBottom: 20 }}>
            {optionsList.map(n => (
              <button
                key={n}
                type="button"
                className={`charm-count-btn${charmCount === n ? ' active' : ''}`}
                onClick={() => setCharmCount(n)}
              >
                {n}
              </button>
            ))}
          </div>
        </>
      )}

      {/* One native <select> per slot */}
      {charmCount > 0 && (
        <>
          <p className="charm-section-label">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14, color: 'var(--gold)' }}>
              <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
            Select Your Charms <span style={{ color: 'var(--red)' }}>*</span>
            <span className="charm-filled-badge">{filledCount}/{charmCount} selected</span>
          </p>

          {showMissing && !allCharmsSelected && (
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--red)', marginBottom: 10 }}>
              Please select all {charmCount} charm{charmCount > 1 ? 's' : ''} before adding to cart.
            </p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {Array.from({ length: charmCount }, (_, i) => {
              const chosen = selectedCharms[i] || '';
              const usedValues = new Set(selectedCharms.filter((c, idx) => c && idx !== i));
              const isMissing = showMissing && !chosen;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {/* Slot number badge */}
                  <span style={{
                    width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                    background: chosen ? 'var(--olive-600)' : isMissing ? 'var(--red)' : 'var(--beige-dkr)',
                    color: chosen || isMissing ? 'var(--beige)' : 'var(--mist)',
                    fontSize: 10, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background .2s, color .2s',
                  }}>
                    {i + 1}
                  </span>

                  {/* Native select — browser renders the list natively, no clipping */}
                  <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
                    <select
                      value={chosen}
                      onChange={e => setCharm(i, e.target.value)}
                      style={{
                        width: '100%',
                        appearance: 'none',
                        WebkitAppearance: 'none',
                        background: chosen ? 'var(--olive-50)' : isMissing ? 'rgba(192,57,43,.05)' : 'white',
                        border: `1.5px solid ${isMissing ? 'var(--red)' : chosen ? 'rgba(90,110,35,.35)' : 'var(--beige-dkr)'}`,
                        borderRadius: 10,
                        padding: '10px 36px 10px 14px',
                        fontFamily: "'Jost', sans-serif",
                        fontSize: 16, // 16px stops iOS Safari zooming on focus
                        fontWeight: chosen ? 500 : 400,
                        color: chosen ? 'var(--olive-900)' : 'rgba(30,35,16,.4)',
                        cursor: 'pointer',
                        outline: 'none',
                        transition: 'border-color .2s, background .2s',
                      }}
                    >
                      {availableCharms.map(opt => (
                        <option
                          key={opt.value}
                          value={opt.value}
                          disabled={opt.value === '' ? false : (opt.disabled || usedValues.has(opt.value))}
                        >
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    {/* Custom chevron */}
                    <svg
                      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                      style={{
                        position: 'absolute', right: 11, top: '50%',
                        transform: 'translateY(-50%)',
                        width: 13, height: 13,
                        color: 'var(--mist)', pointerEvents: 'none',
                      }}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>

                  {/* Clear button — only when a charm is chosen */}
                  {chosen && (
                    <button
                      type="button"
                      onClick={() => setCharm(i, '')}
                      title="Clear"
                      aria-label={`Clear charm ${i + 1}`}
                      style={{
                        flexShrink: 0, width: 28, height: 28,
                        borderRadius: '50%', border: '1.5px solid var(--beige-dkr)',
                        background: 'white', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--mist)', fontSize: 15, lineHeight: 1,
                        transition: 'border-color .2s, color .2s',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--red)';
                        (e.currentTarget as HTMLButtonElement).style.color = 'var(--red)';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--beige-dkr)';
                        (e.currentTarget as HTMLButtonElement).style.color = 'var(--mist)';
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Summary strip */}
      {filledCount > 0 && (
        <div className="charm-summary-strip" style={{ animation: 'charmFadeUp .35s ease both', marginTop: 16 }}>
          <div className="charm-summary-header">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14, color: 'var(--olive-500)', flexShrink: 0, marginTop: 1 }}>
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>
              <strong>{filledCount}</strong> of <strong>{charmCount}</strong> selected
              {filledCount === charmCount && <span className="charm-all-done"> — all set! ✨</span>}
            </span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {selectedCharms.map((c, i) => {
              const label = availableCharms.find(o => o.value === c)?.label || '';
              return (
                <span key={i} className={`charm-summary-pill${!c ? ' charm-summary-pill--empty' : ''}`}>
                  <span className="charm-summary-num">{i + 1}</span>
                  {c ? label : <em style={{ fontSize: 10 }}>empty</em>}
                  {c && (
                    <button
                      type="button"
                      onClick={() => setCharm(i, '')}
                      aria-label={`Remove charm ${i + 1}`}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 0 2px', color: 'var(--mist)', fontSize: 13, lineHeight: 1, display: 'flex', alignItems: 'center' }}
                    >×</button>
                  )}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Reviews ─── */
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
    if (!token) { setErrorMsg('You must be logged in to review.'); return; }
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
            {[1, 2, 3, 4, 5].map(star => (
              <span key={star} onClick={() => setFormState(s => ({ ...s, rating: star }))} style={{ fontSize: 24, cursor: 'pointer', color: star <= formState.rating ? 'var(--gold)' : '#ccc' }}>★</span>
            ))}
          </div>
          <textarea required placeholder="Write your comments..." value={formState.body} onChange={e => setFormState(s => ({ ...s, body: e.target.value }))} rows={4} style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--beige-dkr)', borderRadius: 8, marginBottom: 16, fontSize: 16, outline: 'none', resize: 'vertical' }} />

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'inline-block', cursor: 'pointer', fontSize: 13, color: 'var(--olive-600)', fontWeight: 600, border: '1px solid var(--olive-600)', padding: '6px 12px', borderRadius: 4 }}>
              <input type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={e => {
                if (e.target.files) setFormState(s => ({ ...s, images: [...s.images, ...Array.from(e.target.files as FileList)] }));
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

      {visible.length === 0 && !showForm && (
        <p className="rev-empty">
          {totalReviews === 0 ? 'No reviews yet — be the first to share your experience.' : <>No reviews match this filter. <button className="rev-clear-link" onClick={() => setFilterStar(null)}>Clear filter</button></>}
        </p>
      )}

      <div className="rev-list">
        {visible.map((r, i) => (
          <div key={r._id} className="rev-card" style={{ animationDelay: `${i * 0.07}s` }}>
            <div className="rev-card-top">
              <div className="rev-avatar" style={{ background: '#c9a84c22', color: '#c9a84c' }}>{r.user?.firstName?.[0] || 'A'}</div>
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

/* ─── Complete the Look ─── */
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

/* ─── Accordion (grid-rows animation: never clips when width/content changes) ─── */
function AccordionItem({ item, open, onToggle }: { item: AccordionData; open: boolean; onToggle: () => void }) {
  return (
    <div className={`acc-item${open ? ' acc-item--open' : ''}`}>
      <button className="acc-head" onClick={onToggle}>
        <span className="acc-head-left"><span className="acc-emoji">{item.emoji}</span>{item.label}</span>
        <span className="acc-chevron"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg></span>
      </button>
      <div className="acc-body-wrap" style={{ display: 'grid', gridTemplateRows: open ? '1fr' : '0fr', transition: 'grid-template-rows 0.38s cubic-bezier(.4,0,.2,1)' }}>
        <div style={{ overflow: 'hidden' }}>
          <div className="acc-body">
            {item.isHtml
              ? <div dangerouslySetInnerHTML={{ __html: item.content }} style={{ lineHeight: 1.85, fontSize: 12, fontWeight: 300, color: 'var(--mist)', letterSpacing: '.03em' }} />
              : item.content.split('\n').map((line, i) => <p key={i} style={{ marginBottom: line === '' ? 8 : 0 }}>{line || '\u00A0'}</p>)
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

/* ─── Estimated Delivery ─── */
function EstimatedDeliveryBlock() {
  return (
    <div style={{ marginTop: 16 }}>
      <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--olive-600)', marginBottom: 10 }}>
        Estimated Delivery
      </p>

      <div className="est-grid">
        {[
          { icon: '🚚', label: 'Standard', rate: '₹60', metro: '3–5 business days', rest: '4–7 business days' },
          { icon: '✈️', label: 'Express', rate: '₹110', metro: '2–3 business days', rest: '3–4 business days' },
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

/* ─── Sparkles ─── */
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

/* ─── Customisation Panel ─── */
function CustomisationPanel({ category, onChange, validationAttempt }: { category: string; onChange?: (data: { wantCustom: boolean | null; uploads: string[]; globalNote: string }) => void; validationAttempt?: number }) {
  const [wantCustom, setWantCustom] = useState<boolean | null>(null);
  const MAX_FILES = 5;
  const [uploads, setUploads] = useState<(UploadItem | null)[]>(Array(MAX_FILES).fill(null));
  const [globalNote, setGlobalNote] = useState('');
  const [showMissing, setShowMissing] = useState(false);

  useEffect(() => {
    if (validationAttempt) setShowMissing(true);
  }, [validationAttempt]);

  const filledCount = uploads.filter(Boolean).length;
  const allPhotosUploaded = filledCount === MAX_FILES;

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

  const catLabel = category === 'Key Chain/Charm' ? 'key chain / charm' : category === 'Fan Box' ? 'fan box' : 'gift box';

  return (
    <>
      <div style={{ display: 'flex', gap: 10 }}>
        <button className={`cust-toggle-btn yes${wantCustom === true ? ' sel' : ''}`} onClick={() => { setWantCustom(true); }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
          Yes, Customise
        </button>
        <button className={`cust-toggle-btn no${wantCustom === false ? ' sel' : ''}`} onClick={() => { setWantCustom(false); setUploads(Array(MAX_FILES).fill(null)); setGlobalNote(''); }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
          No, Standard
        </button>
      </div>
      {wantCustom === false && (
        <div className="cust-info-chip" style={{ marginTop: 12 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 15, height: 15, flexShrink: 0, color: 'var(--gold)', marginTop: 1 }}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
          <p>You&apos;ll receive the <strong>standard {catLabel}</strong>. You can still personalise it later by contacting us within 2 hours.</p>
        </div>
      )}
      {wantCustom === true && (
        <div style={{ marginTop: 14, animation: 'fadeUp .35s ease both' }}>
          <textarea className="cust-note-global" placeholder="Add a personalisation note…" value={globalNote} onChange={e => setGlobalNote(e.target.value)} rows={3} />

          <div style={{ marginTop: 16 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--olive-900)', marginBottom: 4 }}>
              Required Photos <span style={{ color: 'var(--red)' }}>*</span>
              <span style={{ fontSize: 10.5, fontWeight: 500, color: 'var(--mist)', marginLeft: 8 }}>{filledCount}/{MAX_FILES} uploaded</span>
            </p>
            {showMissing && !allPhotosUploaded && (
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--red)', marginBottom: 10 }}>
                Please upload all {MAX_FILES} required photos before adding to cart.
              </p>
            )}
            <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12 }}>
              {Array.from({ length: MAX_FILES }).map((_, i) => {
                const label = `Photo ${i + 1}`;
                const upload = uploads[i];
                return (
                  <div key={i} style={{ border: `1.5px dashed ${showMissing && !upload ? 'var(--red)' : 'rgba(61,74,34,.15)'}`, borderRadius: 12, padding: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: showMissing && !upload ? 'rgba(192,57,43,.04)' : 'white', position: 'relative', minHeight: 140, textAlign: 'center' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--olive-900)', marginBottom: 8, zIndex: 2 }}>{label}</div>

                    {upload ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={upload.preview} alt={label} style={{ width: '100%', height: 90, objectFit: 'cover', borderRadius: 6, zIndex: 1 }} />
                        <button type="button" onClick={() => removeSlotUpload(i)} aria-label={`Remove ${label}`} style={{ position: 'absolute', top: -6, right: -6, background: 'var(--red)', color: 'white', border: 'none', borderRadius: '50%', width: 22, height: 22, fontSize: 14, cursor: 'pointer', zIndex: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
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
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 15, height: 15, flexShrink: 0, color: 'var(--gold)', marginTop: 1 }}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
            <p>Our team reviews within <strong>2 business hours</strong>. Customised items are <strong>non-returnable</strong> unless damaged.</p>
          </div>
        </div>
      )}
    </>
  );
}

/* ─── Gift Message Panel ─── */
const PRESET_MESSAGES = [
  { value: '', label: 'Choose a message template…' },
  { value: 'happy_mothers_day', label: "💐 Happy Mother's Day" },
  { value: 'happy_birthday', label: '🎂 Happy Birthday' },
  { value: 'i_am_sorry', label: "🙏 I'm Sorry" },
  { value: 'congratulations', label: '🎉 Congratulations' },
  { value: 'thank_you', label: '🤍 Thank You' },
  { value: 'i_love_you', label: '❤️ I Love You' },
  { value: 'get_well_soon', label: '🌸 Get Well Soon' },
  { value: 'happy_anniversary', label: '💍 Happy Anniversary' },
  { value: 'just_because', label: '✨ Just Because' },
];

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
          <select className="gift-msg-select" value={value.preset} onChange={e => onChange({ ...value, preset: e.target.value })}>
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
        <textarea className="gift-msg-free-textarea" rows={3} maxLength={200} placeholder="Write a heartfelt note…" value={value.customMessage} onChange={e => onChange({ ...value, customMessage: e.target.value })} />
        <p className="gift-msg-char-count">{value.customMessage.length} / 200 characters</p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════ */
export default function CharmProductDetailPage({ slug }: { slug: string }) {
  const router = useRouter();
  const { addItem } = useCart();
  const { toggleItem, isWished } = useWishlist();

  const [product, setProduct] = useState<CatalogProduct | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [activeColor, setActiveColor] = useState(0);
  const [activeSize, setActiveSize] = useState('');
  const [activeImg, setActiveImg] = useState(0);
  const [errorToast, setErrorToast] = useState('');
  const [productReviews, setProductReviews] = useState<ReviewData[]>([]);

  // Automatically clear error toast after 3.5 seconds
  useEffect(() => {
    if (errorToast) {
      const timer = setTimeout(() => setErrorToast(''), 3500);
      return () => clearTimeout(timer);
    }
  }, [errorToast]);

  const [qty, setQty] = useState(1);
  const [cartAnim, setCartAnim] = useState(false);
  const [sparkleAnim, setSparkleAnim] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>('about');
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [giftBoxAdded, setGiftBoxAdded] = useState(false);
  const cartBtnRef = useRef<HTMLButtonElement | null>(null);

  const [charmData, setCharmData] = useState<{ count: number; charms: string[] }>({ count: 1, charms: [''] });
  const [customData, setCustomData] = useState<{ wantCustom: boolean | null; uploads: string[]; globalNote: string }>({ wantCustom: null, uploads: [], globalNote: '' });
  const [custValidationAttempt, setCustValidationAttempt] = useState(0);
  const [charmValidationAttempt, setCharmValidationAttempt] = useState(0);
  const [chainValidationAttempt, setChainValidationAttempt] = useState(0);
  const MAX_CUST_PHOTOS = 5;
  const [giftMessage, setGiftMessage] = useState<{ preset: string; customMessage: string }>({ preset: '', customMessage: '' });
  const [selectedChain, setSelectedChain] = useState('');
  const [chainLightbox, setChainLightbox] = useState<ChainOption | null>(null);

  const handleCharmChange = useCallback((data: { count: number; charms: string[] }) => {
    setCharmData(data);
  }, []);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchProductById(slug)
      .then(p => { if (mounted) { setProduct(p); setLoading(false); } })
      .catch(() => { if (mounted) { setProduct(null); setLoading(false); } });
    return () => { mounted = false; };
  }, [slug]);

  useEffect(() => {
    if (product?.sourceId) fetchProductReviews(product.sourceId).then(setProductReviews);
  }, [product?.sourceId]);

  const dynamicReviewCount = productReviews.length;
  const dynamicRating = dynamicReviewCount > 0
    ? Number((productReviews.reduce((a, r) => a + r.rating, 0) / dynamicReviewCount).toFixed(1))
    : 0;

  const price = product?.price ?? 0;
  const originalPrice = product?.originalPrice ?? null;
  const discountedPrice = product?.discountedPrice ?? null;
  const discountTag = product?.discountTag ?? null;
  const stock = product?.stock ?? 0;
  const tags = product?.tags ?? [];
  const faqs = product?.faqs ?? [];
  const about = product?.about ?? '';
  const category = product?.category ?? '';
  const gender = product?.gender ?? '';

  const normalizedColors: ProductColor[] = (product?.colors ?? []).map((c: any) => ({ label: c.label || c.name || 'Default', hex: c.hex || '#c9a84c', image: c.image || undefined }));
  const sizes = product?.sizes ?? [];
  const variants = product?.variants ?? [];
  const mainImage = product?.mainImage;
  const images = product?.images ?? [];

  const isCustomisable = category ? CUSTOMISABLE_CATEGORIES.some(c => category.toLowerCase().includes(c.toLowerCase())) : false;
  const custPhotosIncomplete = isCustomisable && customData.wantCustom === true && customData.uploads.length < MAX_CUST_PHOTOS;
  // A charm selection round is only "complete" once every slot for the chosen count has a charm.
  // It also requires that a valid charm count has been picked (> 0).
  const charmSelectionIncomplete = charmData.count === 0 || charmData.charms.filter(Boolean).length < charmData.count;

  useEffect(() => {
    if (!product) return;
    setActiveColor(0);
    setActiveSize(product.sizes?.[0] || product.variants?.[0]?.size || '');
    setActiveImg(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.sourceId]);

  const currentColor = normalizedColors[activeColor] || normalizedColors[0];
  const normalizedColor = normalizeText(currentColor?.label || '');
  const normalizedSize = normalizeText(activeSize);

  const matchingVariant = variants.find(v => normalizeText(v.color) === normalizedColor && normalizeText(v.size) === normalizedSize)
    || variants.find(v => normalizeText(v.color) === normalizedColor)
    || variants.find(v => normalizeText(v.size) === normalizedSize);

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
  const displayImg = currentImages?.[activeImg] || mainImg || matchingVariant?.image || FALLBACK_PRODUCT_IMAGE;

  let discount = 0;
  if (discountedPrice && price) discount = Math.round(((price - discountedPrice) / price) * 100);
  else if (originalPrice && price) discount = Math.round(((originalPrice - price) / originalPrice) * 100);

  const currentStock = matchingVariant?.stock ?? stock;
  const availableSizes = sizes.length > 0 ? sizes : uniqueValues(variants.map(v => v.size));
  const sizeOptions = availableSizes.length > 0 ? availableSizes : [];
  const selectedCharmCount = charmData.count;
  const basePrice = discountedPrice || price;
  const baseOriginalPrice = originalPrice || price;
  const perCharmPrice = product?.perCharmPrice ?? 0;

  const chainOptions: ChainOption[] = useMemo(() => {
    const dynamicChainOptions: ChainOption[] = (product?.variants || [])
      .filter(v => v.bandName)
      .map(v => ({
        value: v.bandName || '',
        label: v.bandName || '',
        image: v.bandExistingImage || v.image || FALLBACK_PRODUCT_IMAGE,
        sub: '',
        price: v.salePrice || v.price || 0,
      }));
    if (dynamicChainOptions.length > 0) return dynamicChainOptions;
    if (Array.isArray((product as any)?.chainOptions) && (product as any).chainOptions.length > 0) {
      return (product as any).chainOptions as ChainOption[];
    }
    return [];
  }, [product?.variants, (product as any)?.chainOptions]);

  const selectedChainObj = chainOptions.find(c => c.value === selectedChain);
  const chainPrice = selectedChainObj?.price || 0;

  const getCharmsPrice = (count: number) => {
    const specificPricing = product?.charmPiecePricing?.find(p => p.count === count);
    if (specificPricing) return specificPricing.price;
    return perCharmPrice * count;
  };
  const charmsPrice = getCharmsPrice(selectedCharmCount);

  const totalCharmPrice = basePrice + chainPrice + charmsPrice;
  const totalCharmOriginalPrice = baseOriginalPrice + chainPrice + charmsPrice;
  const totalWithGiftBox = totalCharmPrice + (giftBoxAdded ? (product?.giftBox?.price ? Number(product.giftBox.price) : 50) : 0);

  const wished = product ? isWished(product.id) : false;

  const handleWishToggle = useCallback(() => {
    if (!product) return;
    toggleItem({ id: product.id, name: product.name || 'Product', price: totalCharmPrice, originalPrice: totalCharmOriginalPrice, image: displayImg, category: product.category || '', href: product.href || `/products/${product.sourceId}`, colors: normalizedColors, badge: product.badge ?? null, rating: product.rating ?? 0, reviewCount: product.reviewCount ?? 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toggleItem, product, totalCharmPrice, totalCharmOriginalPrice, displayImg, normalizedColors]);

  const buildCartItem = useCallback(() => {
    let breakdown = `Base ₹${basePrice}`;
    if (chainPrice > 0) breakdown += ` + ₹${chainPrice} (Chain)`;
    if (selectedCharmCount > 0) breakdown += ` + ₹${charmsPrice} (${selectedCharmCount} charms)`;

    const giftBoxPrice = giftBoxAdded ? (product?.giftBox?.price ? Number(product.giftBox.price) : 50) : 0;
    const finalPrice = totalCharmPrice + giftBoxPrice;
    const finalOriginalPrice = (totalCharmOriginalPrice > totalCharmPrice)
      ? totalCharmOriginalPrice + giftBoxPrice
      : null;

    return {
      id: String(product!.sourceId),
      name: product!.name || '',
      price: finalPrice,
      originalPrice: finalOriginalPrice,
      basePrice: totalCharmPrice,
      image: displayImg,
      color: currentColor?.label || '',
      colorHex: currentColor?.hex || '#c9a84c',
      size: activeSize || undefined,
      sku: product!.sku,
      href: product!.href || `/products/${product!.sourceId}`,
      sourceId: String(product!.sourceId),
      category,
      categoryId: product!.categoryId,
      subCategoryId: product!.subCategoryId,
      style: product!.style,
      styleId: product!.styleId,
      customNote: customData.wantCustom ? customData.globalNote : undefined,
      customImages: customData.wantCustom ? customData.uploads : undefined,
      giftMessage: giftMessage.customMessage || undefined,
      giftBox: giftBoxAdded || undefined,
      giftBoxDetails: giftBoxAdded ? {
        heading: product?.giftBox?.heading || 'Premium Gift Box',
        description: product?.giftBox?.description || 'Rigid magnetic-close box · satin ribbon · message card',
        price: product?.giftBox?.price ? Number(product.giftBox.price) : 50,
        image: product?.giftBox?.image || GIFT_BOX_IMAGE,
      } : undefined,
      chain: selectedChain || undefined,
      chainLabel: chainOptions.find(c => c.value === selectedChain)?.label || undefined,
      priceBreakdown: breakdown,
      selectedCharms: charmData.charms.filter(Boolean).map(charm => ({
        sourceId: charm,
        name: charm,
        quantity: 1,
        price: 0,
        images: customData.wantCustom ? customData.uploads : [],
        customText: customData.wantCustom ? customData.globalNote : undefined,
      })),
      selectionGroups: [{
        type: 'multi_item_selection',
        category,
        label: 'Charm Selection',
        selectionKey: 'selectedCharms',
        itemRefModel: 'CharmItem',
        items: charmData.charms.filter(Boolean).map(charm => ({
          sourceId: charm,
          name: charm,
          quantity: 1,
          price: 0,
          images: customData.wantCustom ? customData.uploads : [],
          customText: customData.wantCustom ? customData.globalNote : undefined,
        })),
        metadata: {
          requestedCount: selectedCharmCount,
        },
      }],
      charms: charmData.charms.filter(Boolean),
      charmCount: selectedCharmCount,
    };
  }, [product, displayImg, currentColor, activeSize, category, customData, giftMessage, charmData, totalCharmPrice, totalCharmOriginalPrice, basePrice, perCharmPrice, selectedCharmCount, giftBoxAdded, selectedChain, chainOptions, chainPrice, charmsPrice]);

  const handleAddToCart = useCallback(() => {
    if (!product) return;
    if (Number(currentStock) <= 0) {
      setErrorToast('This item is currently out of stock.');
      return;
    }
    if (charmSelectionIncomplete) {
      if (charmData.count === 0) {
        setErrorToast('Please select the number of charms first.');
      } else {
        setErrorToast(`Please select all ${charmData.count} charms before adding to cart.`);
      }
      setCharmValidationAttempt(t => t + 1);
      return;
    }
    if (chainOptions.length > 0 && !selectedChain) {
      setErrorToast('Please choose a chain type before adding to cart.');
      setChainValidationAttempt(t => t + 1);
      return;
    }
    if (custPhotosIncomplete) {
      setErrorToast('Please upload all required customisation photos.');
      setCustValidationAttempt(t => t + 1);
      return;
    }
    const item = buildCartItem();
    for (let i = 0; i < qty; i++) addItem(item);
    fireConfetti(cartBtnRef.current);
    setCartAnim(true); setSparkleAnim(true);
    setTimeout(() => setCartAnim(false), 700);
    setTimeout(() => setSparkleAnim(false), 800);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addItem, product, qty, buildCartItem, custPhotosIncomplete, charmSelectionIncomplete, charmData.count, selectedChain, currentStock]);

  const handleBuyNow = useCallback(() => {
    if (!product) return;
    if (Number(currentStock) <= 0) {
      setErrorToast('This item is currently out of stock.');
      return;
    }
    if (charmSelectionIncomplete) {
      if (charmData.count === 0) {
        setErrorToast('Please select the number of charms first.');
      } else {
        setErrorToast(`Please select all ${charmData.count} charms before proceeding.`);
      }
      setCharmValidationAttempt(t => t + 1);
      return;
    }
    if (chainOptions.length > 0 && !selectedChain) {
      setErrorToast('Please choose a chain type before proceeding.');
      setChainValidationAttempt(t => t + 1);
      return;
    }
    if (custPhotosIncomplete) {
      setErrorToast('Please upload all required customisation photos.');
      setCustValidationAttempt(t => t + 1);
      return;
    }
    const item = buildCartItem();
    for (let i = 0; i < qty; i++) addItem(item, false);
    router.push('/cart');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addItem, product, qty, router, buildCartItem, custPhotosIncomplete, charmSelectionIncomplete, charmData.count, selectedChain, currentStock]);

  const handleColorChange = useCallback((i: number) => {
    setActiveColor(i);
    const nextColor = normalizedColors[i];
    if (nextColor?.image) {
      const foundIdx = currentImages.indexOf(nextColor.image);
      setActiveImg(foundIdx !== -1 ? foundIdx : 0);
    } else {
      setActiveImg(0);
    }
    if (!nextColor) return;
    const nextSize = variants.find(v => normalizeText(v.color) === normalizeText(nextColor.label))?.size || sizeOptions[0] || '';
    setActiveSize(nextSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normalizedColors, variants, sizeOptions, currentImages]);

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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f5f0e8', fontFamily: 'Jost, sans-serif', gap: 16, padding: 20, textAlign: 'center' }}>
      <p style={{ fontSize: 28, color: '#3d4a22' }}>Product not found</p>
      <a href="/" style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: '#f5f0e8', background: '#3d4a22', padding: '12px 28px', borderRadius: 50, textDecoration: 'none' }}>Back to Home</a>
    </div>
  );

  const productName = product.name || '';
  const description = product.description || '';

  const dynamicAccordionItems: AccordionData[] = [
    ...(about ? [{ id: 'about', emoji: '💎', label: 'About the Product', content: about }] : []),
    ...(description ? [{ id: 'desc', emoji: '📄', label: 'Product Description', content: description }] : []),
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

  return (
    <>
      {/* Size Chart Lightbox — rendered at root level so it overlays everything */}
      {showSizeChart && (
        <ImageLightbox
          onClose={() => setShowSizeChart(false)}
          imageUrl={product.sizeChartImage || SIZE_CHART_IMAGE}
          eyebrow="Reference Guide"
          title="Size Chart"
          footerTip="📏  Tip: Measure your wrist/finger with a soft tape for the best fit."
        />
      )}

      {/* Chain photo Lightbox — rendered at root level so it overlays everything */}
      {chainLightbox && (
        <ImageLightbox
          onClose={() => setChainLightbox(null)}
          imageUrl={chainLightbox.image}
          eyebrow="Chain Preview"
          title={chainLightbox.label}
          footerTip={chainLightbox.sub}
        />
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Jost:wght@200;300;400;500;600&display=swap');

        :root {
          --beige:#f5f0e8; --beige-dk:#ede5d5; --beige-dkr:#d9cdb8;
          --olive-900:#1a1f0d; --olive-800:#252d12; --olive-600:#3d4a22;
          --olive-500:#5a6b2e; --olive-400:#7a8e3c; --olive-200:#c4cc9a;
          --olive-100:#e4e8cc; --olive-50:#f2f4e8;
          --gold:#c9a84c; --gold-lt:#e8d49a;
          --ink:#1e2310; --mist:rgba(30,35,16,.45); --red:#c0392b;
        }
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        img{max-width:100%}

        @keyframes sparkle{0%{opacity:1;transform:translate(0,0) scale(1)}100%{opacity:0;transform:translate(calc(var(--tx,0px)*2.2),calc(var(--ty,0px)*2.2)) scale(0)}}
        @keyframes cartBounce{0%,100%{transform:scale(1)}30%{transform:scale(1.14) rotate(-3deg)}60%{transform:scale(.94) rotate(2deg)}80%{transform:scale(1.04)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes charmFadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes imgIn{from{opacity:0;transform:scale(.97)}to{opacity:1;transform:scale(1)}}
        @keyframes stockPulse{0%,100%{opacity:1}50%{opacity:.55}}
        @keyframes chainPanelIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}

        .pdp{min-height:100vh;background:var(--beige);font-family:'Jost',sans-serif;color:var(--ink);overflow-x:clip;width:100%}
        .pdp-layout{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:0;max-width:1280px;margin:0 auto;align-items:start}
        .pdp-layout>*{min-width:0}

        /* ── Gallery ── */
        .pdp-gallery{
          /* gallery width is derived from viewport height, so image + thumbnails
             always fit on screen at the exact 4:5 ratio (nothing cropped) */
          --gal-w:max(300px,calc((100vh - 244px) * .8));
          position:sticky;top:80px;align-self:start;
          padding:32px 28px 32px 52px;
          display:flex;flex-direction:column;align-items:center;gap:14px;
          animation:fadeUp .6s ease both;min-width:0;
        }
        .pdp-main-img-wrap{
          position:relative;flex:none;
          width:100%;max-width:var(--gal-w);
          aspect-ratio:4/5;
          background:var(--beige-dk);overflow:hidden;border-radius:6px;
        }
        .pdp-main-img{width:100%;height:100%;object-fit:contain;display:block;animation:imgIn .4s ease both}
        .pdp-badge{position:absolute;top:16px;left:16px;z-index:2;font-size:9.5px;font-weight:600;letter-spacing:.1em;color:var(--beige);background:var(--olive-600);padding:5px 14px 4px;border-radius:50px}
        .pdp-wish{position:absolute;top:14px;right:14px;z-index:2;width:36px;height:36px;border-radius:50%;background:rgba(245,240,232,.9);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:transform .2s,background .2s}
        .pdp-wish:hover{transform:scale(1.1)}
        .pdp-wish.on{background:var(--olive-600)}
        .pdp-thumb-row{
          display:flex;gap:10px;flex-wrap:nowrap;flex-shrink:0;
          width:100%;max-width:var(--gal-w);
          overflow-x:auto;padding:2px 2px 8px;
          scroll-snap-type:x proximity;-webkit-overflow-scrolling:touch;
        }
        .pdp-thumb-row::-webkit-scrollbar{height:4px}
        .pdp-thumb-row::-webkit-scrollbar-thumb{background:var(--beige-dkr);border-radius:4px}
        .pdp-thumb{
          flex:0 0 72px;width:72px;height:72px;padding:0;
          border-radius:12px;overflow:hidden;cursor:pointer;
          border:2px solid transparent;background:var(--beige-dk);
          scroll-snap-align:start;transition:border-color .2s,transform .2s;
        }
        .pdp-thumb:hover{transform:scale(1.06)}
        .pdp-thumb.active{border-color:var(--olive-500)}
        .pdp-thumb img{width:100%;height:100%;object-fit:cover;display:block}

        /* ── Info (no overflow-y: it created a second scrollbar) ── */
        .pdp-info{padding:32px 52px 40px 28px;animation:fadeUp .6s ease .1s both;min-width:0}
        .pdp-name{font-family:'Cormorant Garamond',serif;font-size:clamp(1.9rem,3.5vw,2.8rem);font-weight:400;line-height:1.1;letter-spacing:-.01em;color:var(--olive-900);margin-bottom:10px;overflow-wrap:anywhere}
        .pdp-name em{font-style:italic;color:var(--olive-600)}
        .pdp-rating{display:flex;align-items:center;flex-wrap:wrap;gap:6px;margin-bottom:14px}
        .pdp-stars{color:var(--gold);font-size:13px;letter-spacing:1px}
        .pdp-rating-num{font-size:12px;font-weight:600;color:var(--olive-600)}
        .pdp-review-cnt{font-size:11px;color:var(--mist)}
        .pdp-offer{background:linear-gradient(135deg,rgba(201,168,76,.12),rgba(90,110,35,.1));border:1px solid rgba(201,168,76,.28);border-radius:10px;padding:10px 16px;margin-bottom:18px;display:flex;align-items:center;gap:10px}
        .pdp-offer-icon{font-size:16px}
        .pdp-offer-text{font-size:11px;font-weight:500;letter-spacing:.04em;color:#8c6b20}
        .pdp-price-row{display:flex;align-items:baseline;gap:12px;margin-bottom:8px;flex-wrap:wrap}
        .pdp-price{font-size:1.8rem;font-weight:600;letter-spacing:-.01em;color:var(--olive-900)}
        .pdp-original{font-size:15px;font-weight:400;color:var(--mist);text-decoration:line-through}
        .pdp-discount{font-size:11px;font-weight:700;letter-spacing:.06em;color:var(--beige);background:var(--olive-500);padding:3px 9px;border-radius:4px;text-transform:uppercase}
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

        /* ── Size chart link ── */
        .pdp-size-chart-link{
          display:inline-flex;align-items:center;gap:5px;
          margin-bottom:8px;
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
        .pdp-qty-row{display:flex;align-items:center;flex-wrap:wrap;gap:14px;margin-bottom:0}
        .pdp-qty{display:flex;align-items:center;border:1.5px solid var(--beige-dkr);border-radius:50px;overflow:hidden}
        .pdp-qty-btn{width:36px;height:36px;background:none;border:none;font-size:18px;cursor:pointer;color:var(--olive-600);display:flex;align-items:center;justify-content:center;transition:background .15s}
        .pdp-qty-btn:hover{background:var(--olive-50)}
        .pdp-qty-val{min-width:36px;text-align:center;font-size:13px;font-weight:600;color:var(--ink)}
        .pdp-stock{font-size:10.5px;font-weight:500;letter-spacing:.06em;color:var(--red);animation:stockPulse 2.2s ease-in-out infinite}

        /* Estimated delivery grid */
        .est-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}

        /* ════════════════════════════════════════════
           CHARM SELECTOR
        ════════════════════════════════════════════ */
        .charm-selector{
          background: linear-gradient(135deg, rgba(201,168,76,.08), rgba(90,110,35,.06));
          border: 1.5px solid rgba(201,168,76,.28);
          border-radius: 18px;
          padding: 20px 20px 18px;
          margin-bottom: 0;
          position: relative;
          overflow: hidden;
        }
        .charm-selector::before{
          content: '◈';
          position: absolute; right: 18px; top: 16px;
          font-size: 48px; color: rgba(201,168,76,.1);
          pointer-events: none; line-height: 1;
        }
        .charm-selector-title{
          display: flex; align-items: center; gap: 9px;
          font-size: 11px; font-weight: 700; letter-spacing: .14em;
          text-transform: uppercase; color: var(--olive-600);
          margin-bottom: 16px;
        }
        .charm-selector-title svg{ color: var(--gold); }
        .charm-selector-sub{
          font-size: 13px; font-weight: 400; color: #101010;
          line-height: 1.7; letter-spacing: .03em; margin-bottom: 16px;
        }

        .charm-section-label{
          display: flex; align-items: center; flex-wrap: wrap; gap: 7px;
          font-size: 9.5px; font-weight: 700; letter-spacing: .3em;
          text-transform: uppercase; color: var(--mist); margin-bottom: 12px;
          row-gap: 6px;
        }

        .charm-count-grid{ display: flex; flex-wrap: wrap; gap: 8px; }
        .charm-count-btn{
          width: 40px; height: 40px;
          border-radius: 10px;
          border: 1.5px solid var(--beige-dkr);
          background: white;
          font-family: 'Jost', sans-serif;
          font-size: 13px; font-weight: 600;
          color: var(--olive-600);
          cursor: pointer;
          transition: all .2s;
          display: flex; align-items: center; justify-content: center;
        }
        .charm-count-btn:hover{ border-color: var(--olive-400); background: var(--olive-50); transform: translateY(-2px); }
        .charm-count-btn.active{
          border-color: var(--gold);
          background: linear-gradient(135deg, rgba(201,168,76,.15), rgba(201,168,76,.05));
          color: #8c6b20;
          box-shadow: 0 0 0 3px rgba(201,168,76,.15);
          transform: translateY(-2px);
        }

        .charm-fixed-count-note{
          display: flex; align-items: flex-start; gap: 8px;
          background: rgba(201,168,76,.1);
          border: 1px solid rgba(201,168,76,.28);
          border-radius: 10px;
          padding: 9px 12px;
          font-size: 12px; font-weight: 400; color: #6b5518;
          line-height: 1.55;
        }
        .charm-fixed-count-note strong{ font-weight: 700; color: var(--olive-600); }

        .charm-filled-badge{
          margin-left: auto;
          font-size: 9px; font-weight: 700; letter-spacing: .1em;
          color: var(--beige); background: var(--olive-500);
          padding: 2px 8px; border-radius: 4px; text-transform: uppercase;
        }

        .charm-summary-strip{
          margin-top: 16px;
          background: linear-gradient(135deg, rgba(90,110,35,.08), rgba(201,168,76,.06));
          border: 1px solid rgba(90,110,35,.18);
          border-radius: 12px;
          padding: 12px 14px;
        }
        .charm-summary-header{
          display: flex; align-items: flex-start; gap: 8px;
          font-size: 11.5px; font-weight: 400; color: var(--mist);
          margin-bottom: 10px; line-height: 1.5;
        }
        .charm-summary-header strong{ font-weight: 700; color: var(--olive-600); }
        .charm-all-done{ color: var(--olive-500); font-weight: 600; }
        .charm-summary-pill{
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 10.5px; font-weight: 500; color: var(--ink);
          background: white; border: 1px solid rgba(61,74,34,.12);
          padding: 4px 10px 4px 4px; border-radius: 50px;
        }
        .charm-summary-pill--empty{
          color: var(--mist); background: var(--beige-dk);
          border-color: var(--beige-dkr); font-style: italic;
        }
        .charm-summary-num{
          width: 20px; height: 20px; border-radius: 50%;
          background: var(--olive-600); color: var(--beige);
          font-size: 9px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .charm-summary-pill--empty .charm-summary-num{
          background: var(--beige-dkr); color: var(--mist);
        }

        /* ════════════════════════════════════════════
           CHAIN SELECTOR
        ════════════════════════════════════════════ */
        .chain-selector-wrap{
          background: linear-gradient(135deg, rgba(90,110,35,.07), rgba(201,168,76,.06));
          border: 1.5px solid rgba(90,110,35,.2);
          border-radius: 18px;
          padding: 18px 18px 20px;
          margin-bottom: 0;
          position: relative;
        }
        .chain-trigger{
          width: 100%;
          display: flex; align-items: center; gap: 12px;
          background: white;
          border: 1.5px solid var(--beige-dkr);
          border-radius: 14px;
          padding: 8px 12px;
          cursor: pointer;
          font-family: 'Jost', sans-serif;
          text-align: left;
          transition: border-color .2s, box-shadow .2s;
        }
        .chain-trigger:hover{ border-color: var(--olive-400); }
        .chain-trigger--open{ border-color: var(--olive-500); box-shadow: 0 0 0 3px rgba(90,110,35,.1); }
        .chain-trigger--missing{ border-color: var(--red); background: rgba(192,57,43,.04); }

        .chain-trigger-thumb{
          width: clamp(48px, 8vw, 60px); height: clamp(48px, 8vw, 60px); border-radius: 10px;
          overflow: hidden; flex-shrink: 0; background: white;
          border: 1px solid rgba(61,74,34,.1);
          display: flex; align-items: center; justify-content: center;
          cursor: zoom-in; position: relative;
        }
        .chain-trigger-thumb img{ width: 100%; height: 100%; object-fit: contain; display: block; }
        .chain-trigger-zoom{
          position: absolute; bottom: 3px; right: 3px;
          width: 16px; height: 16px; border-radius: 50%;
          background: rgba(26,31,13,.65); color: white;
          display: flex; align-items: center; justify-content: center;
        }
        .chain-trigger-zoom svg{ width: 9px; height: 9px; }
        .chain-trigger-text{ flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
        .chain-trigger-label{ font-size: 13px; font-weight: 600; color: var(--olive-900); letter-spacing: .01em; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .chain-trigger-price{ font-size: 11px; font-weight: 600; color: var(--olive-600); letter-spacing: .02em; }
        .chain-trigger-chevron{
          width: 16px; height: 16px; color: var(--mist); flex-shrink: 0;
          transition: transform .25s ease;
        }
        .chain-trigger--open .chain-trigger-chevron{ transform: rotate(180deg); }

        .chain-options-panel{
          margin-top: 10px;
          background: white;
          border: 1.5px solid var(--beige-dkr);
          border-radius: 16px;
          overflow: hidden;
          animation: chainPanelIn .2s ease both;
        }
        .chain-option-row{
          width: 100%;
          display: flex; align-items: center; gap: 12px;
          padding: 8px 10px;
          background: white; border: none; border-bottom: 1px solid rgba(61,74,34,.07);
          cursor: pointer; text-align: left;
          transition: background .15s;
        }
        .chain-option-row:last-child{ border-bottom: none; }
        .chain-option-row:hover{ background: var(--olive-50); }
        .chain-option-row--active{ background: rgba(201,168,76,.09); }
        .chain-option-thumb{
          width: 96px; height: 96px; border-radius: 12px;
          overflow: hidden; flex-shrink: 0; position: relative;
          background: white; border: 1px solid rgba(61,74,34,.1); cursor: zoom-in;
        }
        .chain-option-thumb img{ width: 100%; height: 100%; object-fit: contain; display: block; transition: transform .3s ease; }
        .chain-option-row:hover .chain-option-thumb img{ transform: scale(1.05); }
        .chain-option-zoom{
          position: absolute; bottom: 4px; right: 4px;
          width: 20px; height: 20px; border-radius: 50%;
          background: rgba(26,31,13,.65); color: white;
          display: flex; align-items: center; justify-content: center;
        }
        .chain-option-zoom svg{ width: 11px; height: 11px; }
        .chain-option-text{ flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
        .chain-option-label{ font-size: 12.5px; font-weight: 600; color: var(--olive-900); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .chain-option-price{ font-size: 11px; font-weight: 700; color: var(--olive-600); letter-spacing: .01em; }
        .chain-option-check{ width: 18px; height: 18px; color: var(--olive-500); flex-shrink: 0; }

        /* ── Complete the Look ── */
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

        /* ── CTA ── */
        .pdp-cta-row{display:grid;grid-template-columns:1fr 1.4fr;gap:10px;margin-bottom:24px}
        .pdp-btn-wish{display:flex;align-items:center;justify-content:center;gap:7px;font-family:'Jost',sans-serif;font-size:11px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--olive-600);background:white;border:1.5px solid var(--beige-dkr);border-radius:50px;padding:15px 14px;cursor:pointer;transition:all .22s}
        .pdp-btn-wish:hover{border-color:var(--olive-400);background:var(--olive-50)}
        .pdp-btn-wish.on{background:var(--olive-600);color:var(--beige);border-color:var(--olive-600)}
        .pdp-btn-cart-wrap{position:relative}
        .pdp-btn-cart{display:flex;align-items:center;justify-content:center;gap:9px;font-family:'Jost',sans-serif;font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--beige);background:var(--olive-900);border:none;border-radius:50px;padding:15px 20px;cursor:pointer;transition:background .22s;width:100%}
        .pdp-btn-cart:hover{background:var(--olive-600)}
        .pdp-btn-cart.bounce{animation:cartBounce .55s ease}
        .pdp-btn-buy{display:flex;align-items:center;justify-content:center;gap:9px;font-family:'Jost',sans-serif;font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--beige);background:var(--gold);border:none;border-radius:50px;padding:15px 20px;cursor:pointer;transition:background .22s,transform .15s;width:100%;grid-column:1/-1}
        .pdp-btn-buy:hover{background:#b8902b}

        /* ── Trust ── */
        .pdp-trust{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:28px}
        .pdp-trust-item{display:flex;flex-direction:column;align-items:center;text-align:center;padding:14px 8px;background:white;border:1px solid rgba(61,74,34,.07);border-radius:14px;transition:transform .2s,box-shadow .2s}
        .pdp-trust-item:hover{transform:translateY(-3px);box-shadow:0 8px 24px rgba(61,74,34,.1)}
        .pdp-trust-icon{width:40px;height:40px;color:var(--olive-500);margin-bottom:7px}
        .pdp-trust-title{font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--olive-600);margin-bottom:2px}
        .pdp-trust-sub{font-size:9px;color:#101010}

        /* ── Accordion ── */
        .pdp-accordion{border-top:1px solid rgba(61,74,34,.1)}
        .acc-item{border-bottom:1px solid rgba(61,74,34,.08)}
        .acc-head{display:flex;align-items:center;justify-content:space-between;width:100%;padding:16px 4px;background:none;border:none;cursor:pointer;transition:background .15s}
        .acc-head:hover{background:rgba(61,74,34,.03)}
        .acc-head-left{display:flex;align-items:center;gap:10px;font-family:'Jost',sans-serif;font-size:13px;font-weight:500;color:var(--ink);letter-spacing:.02em;text-align:left}
        .acc-emoji{font-size:16px}
        .acc-chevron{color:var(--mist);flex-shrink:0;transition:transform .32s ease}
        .acc-item--open .acc-chevron{transform:rotate(180deg)}
        .acc-body{padding:2px 4px 18px 36px;font-size:13px;font-weight:400;line-height:1.85;color:#101010;letter-spacing:.03em;overflow-wrap:anywhere}
        .acc-body p{margin-bottom:4px}
        .acc-body img{max-width:100%;height:auto}
        .acc-policy-link{display:inline-flex;align-items:center;gap:6px;margin-top:12px;font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--olive-600);text-decoration:none;border-bottom:1.5px solid var(--olive-200);padding-bottom:1px;transition:color .2s,border-color .2s}
        .acc-policy-link:hover{color:var(--olive-400);border-color:var(--olive-400)}
        .acc-policy-link svg{transition:transform .2s}
        .acc-policy-link:hover svg{transform:translateX(3px)}

        /* ── Customisation ── */
        .pdp-cust-banner{background:linear-gradient(135deg,rgba(201,168,76,.1),rgba(90,110,35,.08));border:1.5px solid rgba(201,168,76,.3);border-radius:16px;padding:16px 18px 18px;margin-bottom:0}
        .pdp-cust-banner-head{display:flex;align-items:center;gap:10px;font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--olive-600);margin-bottom:6px}
        .pdp-cust-banner-head svg{width:16px;height:16px;color:var(--gold);flex-shrink:0}
        .pdp-cust-banner-sub{font-size:11px;font-weight:300;color:var(--mist);line-height:1.7;letter-spacing:.03em;margin-bottom:14px}
        .cust-toggle-btn{flex:1;padding:11px 10px;border:1.5px solid var(--beige-dkr);border-radius:12px;background:white;font-family:'Jost',sans-serif;font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--mist);cursor:pointer;transition:all .22s;display:flex;align-items:center;justify-content:center;gap:7px}
        .cust-toggle-btn:hover{border-color:var(--olive-400);background:var(--olive-50)}
        .cust-toggle-btn.yes.sel{border-color:var(--gold);background:rgba(201,168,76,.08);color:#8c6b20;box-shadow:0 0 0 3px rgba(201,168,76,.12)}
        .cust-toggle-btn.no.sel{border-color:var(--beige-dkr);background:var(--beige-dk);color:var(--mist)}
        .cust-info-chip{display:flex;align-items:flex-start;gap:8px;background:rgba(201,168,76,.08);border:1px solid rgba(201,168,76,.22);border-radius:10px;padding:10px 14px}
        .cust-info-chip p{font-size:10.5px;font-weight:300;color:var(--mist);line-height:1.7;letter-spacing:.03em}
        .cust-info-chip p strong{font-weight:600;color:var(--olive-600)}
        .cust-note-global{width:100%;min-height:72px;resize:vertical;border:1.5px solid var(--beige-dkr);border-radius:12px;padding:11px 14px;font-family:'Jost',sans-serif;font-size:16px;font-weight:300;color:var(--ink);background:white;outline:none;margin-bottom:14px;transition:border-color .2s}
        .cust-note-global:focus{border-color:var(--olive-400)}
        .cust-note-global::placeholder{color:rgba(30,35,16,.3)}

        /* ── Gift Message ── */
        .gift-msg-panel{background:linear-gradient(135deg,rgba(201,168,76,.06),rgba(245,240,232,.6));border:1.5px solid rgba(201,168,76,.25);border-radius:16px;padding:16px 18px 18px;margin-bottom:0}
        .gift-msg-header{display:flex;align-items:center;gap:9px;margin-bottom:14px}
        .gift-msg-title{font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--olive-600);flex:1}
        .gift-msg-optional{font-size:9px;font-weight:500;letter-spacing:.1em;text-transform:uppercase;color:var(--mist);background:rgba(61,74,34,.07);padding:2px 8px;border-radius:4px}
        .gift-msg-label{display:flex;align-items:center;gap:6px;font-size:9.5px;font-weight:600;letter-spacing:.22em;text-transform:uppercase;color:var(--mist);margin-bottom:8px}
        .gift-msg-select-wrap{margin-bottom:0}
        .gift-msg-select-inner{position:relative}
        .gift-msg-select{width:100%;appearance:none;-webkit-appearance:none;background:white;border:1.5px solid var(--beige-dkr);border-radius:12px;padding:11px 38px 11px 14px;font-family:'Jost',sans-serif;font-size:16px;font-weight:400;color:var(--ink);cursor:pointer;outline:none;transition:border-color .2s}
        .gift-msg-select:focus{border-color:var(--olive-400)}
        .gift-msg-select-chevron{position:absolute;right:12px;top:50%;transform:translateY(-50%);width:15px;height:15px;color:var(--mist);pointer-events:none}
        .gift-msg-char-count{font-size:9.5px;color:var(--mist);text-align:right;margin-top:5px;letter-spacing:.05em}
        .gift-msg-free-wrap{margin-top:18px;padding-top:16px;border-top:1px solid rgba(201,168,76,.2)}
        .gift-msg-label--free{font-size:10px;letter-spacing:.24em;color:var(--olive-600);font-weight:600;margin-bottom:10px}
        .gift-msg-free-textarea{width:100%;resize:vertical;border:1.5px solid var(--beige-dkr);border-radius:0;padding:12px 14px;font-family:'Jost',sans-serif;font-size:16px;font-weight:300;color:var(--ink);background:white;outline:none;line-height:1.75;transition:border-color .2s;min-height:80px;border-left:3px solid var(--gold)}
        .gift-msg-free-textarea:focus{border-color:var(--olive-400);border-left-color:var(--olive-500)}
        .gift-msg-free-textarea::placeholder{color:rgba(30,35,16,.28)}

        /* ── Reviews ── */
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
        .rev-meta{flex:1;min-width:0}
        .rev-meta-row{display:flex;align-items:center;flex-wrap:wrap;gap:8px}
        .rev-name{font-size:13px;font-weight:600;color:var(--ink)}
        .rev-verified{display:flex;align-items:center;gap:4px;font-size:9.5px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--olive-500)}
        .rev-stars-sm{font-size:12px;color:var(--gold);letter-spacing:1px}
        .rev-date{font-size:10.5px;color:var(--mist)}
        .rev-card-body{font-size:13px;font-weight:400;color:#101010;line-height:1.85;margin-bottom:16px;overflow-wrap:anywhere}
        .rev-helpful-btn{display:flex;align-items:center;gap:5px;font-size:11px;font-weight:600;color:var(--olive-600);background:var(--olive-50);border:1px solid rgba(61,74,34,.12);border-radius:50px;padding:8px 18px;cursor:pointer;font-family:'Jost',sans-serif;transition:all .2s}
        .rev-load-wrap{display:flex;justify-content:center;margin-top:28px}
        .rev-load-btn{font-family:'Jost',sans-serif;font-size:11px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:var(--olive-600);background:white;border:1.5px solid var(--beige-dkr);border-radius:50px;padding:14px 36px;cursor:pointer;transition:all .22s}
        .rev-load-btn:hover{border-color:var(--olive-400);background:var(--olive-50)}

        /* Policy dropdown content */
        .pol{display:flex;flex-direction:column;gap:14px;font-size:13px;font-weight:400;line-height:1.75;color:#101010;letter-spacing:.03em}
        .pol p{margin:0}
        .pol .pol-h{font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--olive-600);margin-bottom:4px}
        .pol strong{font-weight:600;color:var(--ink)}
        .pol a{color:var(--olive-600);font-weight:600;text-decoration:underline;text-underline-offset:3px}
        .pol ul{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:6px}
        .pol li{display:flex;gap:8px;align-items:flex-start}
        .pol li::before{content:'✦';color:var(--olive-400);font-size:9px;margin-top:5px;flex-shrink:0}
        .pol-table-wrap{overflow-x:auto;border:1px solid var(--olive-100);border-radius:10px;background:white;margin-top:6px}
        .pol-table{width:100%;border-collapse:collapse;font-size:12px}
        .pol-table th{background:var(--olive-50);color:var(--olive-600);font-size:9px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;padding:10px 12px;text-align:left;border-bottom:1px solid var(--olive-100);white-space:nowrap}
        .pol-table td{padding:10px 12px;border-bottom:1px solid var(--olive-50);white-space:nowrap}
        .pol-table tr:last-child td{border-bottom:none}
        .pol-note{background:var(--olive-50);border:1px solid var(--olive-100);border-radius:10px;padding:10px 12px;font-size:12px;margin-top:8px}
        .pol-alert{background:rgba(192,57,43,.06);border:1px solid rgba(192,57,43,.18);border-left:3px solid rgba(192,57,43,.5);border-radius:8px;padding:10px 12px;font-size:12px}
        .pol-alert strong{color:var(--red)}

        /* ═══════════ RESPONSIVE ═══════════ */

        /* Large desktop */
        @media(min-width:1440px){
          .pdp-layout{max-width:1440px}
          .pdp-gallery{padding-left:64px}
          .pdp-info{padding-right:64px}
          .rev-section{max-width:1440px;padding-left:64px;padding-right:64px}
        }

        /* Small laptop: tighter padding so the gallery gets more width */
        @media(min-width:961px) and (max-width:1200px){
          .pdp-gallery{padding:24px 16px 24px 28px}
          .pdp-info{padding:24px 28px 40px 16px}
          .rev-section{padding-left:28px;padding-right:28px}
          .pdp-btn-cart,.pdp-btn-buy{letter-spacing:.1em}
        }

        /* Tablet */
        @media(max-width:960px){
          .pdp-layout{grid-template-columns:1fr}
          .pdp-gallery{--gal-w:100%;position:static;padding:24px 24px 0;max-width:720px;margin:0 auto;width:100%}
          .pdp-main-img-wrap{aspect-ratio:1/1}
          .pdp-info{padding:24px 24px 48px;max-width:720px;margin:0 auto;width:100%}
          .rev-section{padding:40px 24px 48px}
          .rev-summary{grid-template-columns:180px 1fr}
          .rev-big-num{font-size:3.6rem}
          .charm-count-btn{width:38px;height:38px}
          .chain-trigger-thumb{width:52px;height:52px}
          .chain-option-thumb{width:88px;height:88px}
        }

        /* Mobile */
        @media(max-width:600px){
          .pdp-gallery{padding:12px 16px 0}
          .pdp-main-img-wrap{aspect-ratio:4/5;max-height:70vh}
          .pdp-thumb{flex-basis:60px;width:60px;height:60px;border-radius:10px}
          .pdp-info{padding:20px 16px 40px}
          .pdp-trust{grid-template-columns:repeat(3,minmax(80px,1fr));gap:7px;overflow-x:auto;padding-bottom:4px;scrollbar-width:none}
          .pdp-trust::-webkit-scrollbar{display:none}
          .pdp-trust-item{padding:10px 6px;border-radius:12px;min-width:80px}
          .pdp-trust-icon{width:28px;height:28px;margin-bottom:5px}
          .pdp-trust-title{font-size:8.5px}
          .pdp-trust-sub{font-size:7.5px}
          .pdp-cta-row{grid-template-columns:1fr 1fr}
          .acc-body{padding:2px 4px 14px 26px}
          .ctl-card{flex:0 0 130px;height:175px}
          .rev-section{padding:32px 16px 40px}
          .rev-summary{grid-template-columns:1fr;border-radius:16px}
          .rev-summary-score{padding:22px 24px;flex-direction:row;justify-content:center;gap:16px;border-radius:0}
          .rev-big-num{font-size:3rem}
          .rev-bars{padding:16px 18px}
          .rev-title{font-size:1.3rem}
          .rev-card{padding:18px 16px}
          .rev-controls{flex-direction:column;align-items:center}
          .pdp-cust-banner,.gift-msg-panel{padding:14px 12px 16px}
          .cust-toggle-btn{font-size:10px;letter-spacing:.06em;padding:11px 6px}
          .charm-selector{padding:16px 14px 14px}
          .charm-count-btn{width:34px;height:34px;font-size:12px;border-radius:8px}
          .charm-selector::before{display:none}
          .chain-selector-wrap{padding:14px 14px 16px}
          .chain-trigger{padding:7px 10px;gap:10px;border-radius:12px}
          .chain-trigger-thumb{width:44px;height:44px;border-radius:8px}
          .chain-trigger-label{font-size:12px}
          .chain-trigger-price{font-size:10px}
          .chain-option-thumb{width:72px;height:72px}
          .chain-option-label{font-size:12px}
          .chain-option-price{font-size:10px}
        }

        /* Very small */
        @media(max-width:380px){
          .pdp-name{font-size:1.7rem}
          .pdp-cta-row{grid-template-columns:1fr}
          .pdp-btn-buy{grid-column:unset}
          .ctl-card{flex:0 0 118px;height:160px}
          .est-grid{grid-template-columns:1fr}
          .charm-count-btn{width:30px;height:30px;font-size:11px}
          .rev-big-num{font-size:2.6rem}
          .rev-card{padding:14px 12px}
        }
      `}</style>

      <div className="pdp">
        <UpperNav />
        <div className="pdp-layout" style={{ paddingTop: '45px' }}>

          {/* ── Gallery ── */}
          <div className="pdp-gallery">
            <div className="pdp-main-img-wrap">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={displayImg}
                className="pdp-main-img"
                src={displayImg}
                alt={productName}
                onError={(e) => { if (!e.currentTarget.src.endsWith(FALLBACK_PRODUCT_IMAGE)) e.currentTarget.src = FALLBACK_PRODUCT_IMAGE; }}
              />
              <span className="pdp-badge">{Number(currentStock) <= 0 ? 'Sold Out' : 'Best Seller'}</span>
              <button className={`pdp-wish${wished ? ' on' : ''}`} onClick={handleWishToggle} aria-label="Wishlist">
                <svg width="18" height="18" viewBox="0 0 24 24" fill={wished ? 'var(--beige)' : 'none'} stroke={wished ? 'none' : 'var(--olive-600)'} strokeWidth="1.8">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>
            </div>

            {currentImages.length > 0 && (
              <div className="pdp-thumb-row">
                {currentImages.map((img, i) => (
                  <button
                    key={img}
                    type="button"
                    aria-label={`View image ${i + 1}`}
                    className={`pdp-thumb${activeImg === i ? ' active' : ''}`}
                    onClick={(e) => {
                      setActiveImg(i);
                      e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img}
                      alt={`View ${i + 1}`}
                      loading="lazy"
                      onError={(e) => { (e.currentTarget.parentElement as HTMLElement).style.display = 'none'; }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Info ── */}
          <div className="pdp-info">
            <h1 className="pdp-name">
              {productName.split(' ').map((w, i) => i === 1 ? <em key={i}>{w} </em> : w + ' ')}
            </h1>

            <div className="pdp-rating">
              <span className="pdp-stars">{'★'.repeat(Math.round(dynamicRating))}{'☆'.repeat(5 - Math.round(dynamicRating))}</span>
              <span className="pdp-rating-num">{dynamicRating > 0 ? dynamicRating : 'New'}</span>
              <span className="pdp-review-cnt">({dynamicReviewCount} reviews)</span>
              {gender && <span style={{ fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--gold)', background: 'rgba(201,168,76,.12)', padding: '2px 8px', borderRadius: 4, marginLeft: 6 }}>{gender}</span>}
            </div>

            <div className="pdp-price-row">
              <span className="pdp-price">₹{totalCharmPrice.toLocaleString('en-IN')}</span>
              {(discountedPrice || originalPrice) && (
                <>
                  <span className="pdp-original">₹{totalCharmOriginalPrice.toLocaleString('en-IN')}</span>
                  <span className="pdp-discount">{discount}% off</span>
                </>
              )}
            </div>
            {(selectedCharmCount > 0 || chainPrice > 0) && (
              <p style={{ marginBottom: 18, fontSize: 11, color: 'var(--mist)', letterSpacing: '.04em' }}>
                Base ₹{basePrice.toLocaleString('en-IN')}
                {chainPrice > 0 && ` + ₹${chainPrice.toLocaleString('en-IN')} (Chain)`}
                {selectedCharmCount > 0 && ` + ₹${charmsPrice.toLocaleString('en-IN')} (${selectedCharmCount} charms)`}
              </p>
            )}
            {discountTag && (
              <div className="pdp-offer">
                <span className="pdp-offer-icon">🏷️</span>
                <span className="pdp-offer-text">{discountTag}</span>
              </div>
            )}

            <div className="pdp-divider" />

            {/* Colour */}
            {normalizedColors.length > 0 && (
              <>
                <p className="pdp-section-label">Colour: <span>{currentColor?.label || 'Default'}</span></p>
                <div className="pdp-swatches">
                  {normalizedColors.map((c, i) => (
                    <button key={c.hex + i} type="button" className="pdp-swatch-btn" onClick={() => handleColorChange(i)} title={c.label}>
                      <div className={`pdp-swatch${activeColor === i ? ' active' : ''}`} style={{ background: c.hex, border: c.hex === '#ffffff' ? '2px solid #d9cdb8' : undefined }} />
                      <span className="pdp-swatch-label">{c.label}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {sizeOptions.length > 0 && (
              <>
                <p className="pdp-section-label">Size: <span>{activeSize || sizeOptions[0]}</span></p>
                <div className="pdp-sizes">
                  {sizeOptions.map(size => {
                    const isAvailable = Boolean(variants.find(v => normalizeText(v.color) === normalizedColor && normalizeText(v.size) === normalizeText(size)) || variants.some(v => normalizeText(v.size) === normalizeText(size)));
                    return (
                      <button key={size} type="button" className={`pdp-size-btn${activeSize === size ? ' active' : ''}`} disabled={!isAvailable} onClick={() => { setActiveSize(size); setActiveImg(0); }}>
                        {size}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {/* Size chart link — show only if sizeChartImage is coming from the data */}
            {product?.sizeChartImage && (
              <button className="pdp-size-chart-link" onClick={() => setShowSizeChart(true)}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 6H3" /><path d="M3 10h18" /><path d="M3 14h18" /><path d="M21 18H3" />
                </svg>
                Size Chart
              </button>
            )}

            {description && <p className="pdp-desc">{description}</p>}

            {tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                {tags.map((tag: string) => (
                  <span key={tag} style={{ fontSize: 10, fontWeight: 500, letterSpacing: '.08em', textTransform: 'lowercase', color: 'var(--olive-600)', background: 'var(--olive-50)', border: '1px solid rgba(61,74,34,.12)', padding: '3px 10px', borderRadius: 50 }}>#{tag}</span>
                ))}
              </div>
            )}

            <div className="pdp-divider" />

            {/* CHARM SELECTOR */}
            <div className="charm-selector">
              <div className="charm-selector-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                Build Your Charm Combination
              </div>
              <p className="charm-selector-sub">
                Pick how many charms you&apos;d like, then choose each one individually. You can mix initials, symbols, birthstones, and more. All charms in your chosen count must be selected before you can add this to your cart.
              </p>
              <CharmSelector onChange={handleCharmChange} charmPieceOptions={product.charmPieceOptions} totalCharms={product.totalCharms} charmStocks={product.charmStocks} validationAttempt={charmValidationAttempt} />
            </div>

            <div className="pdp-divider" />

            {/* CHAIN SELECTOR - only shown when product variants have chain/band options */}
            {chainOptions.length > 0 && (
              <>
                <ChainSelector
                  value={selectedChain}
                  onChange={setSelectedChain}
                  onViewImage={c => setChainLightbox(c)}
                  showMissing={chainValidationAttempt > 0}
                  options={chainOptions}
                />
                <div className="pdp-divider" />
              </>
            )}

            {/* Customisation */}
            {isCustomisable && (
              <>
                <div className="pdp-cust-banner">
                  <div className="pdp-cust-banner-head">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    Make it Yours — Customise this {category}
                  </div>
                  <p className="pdp-cust-banner-sub">
                    This {category.toLowerCase()} can be personalised with your own photos, names, or a special message.
                  </p>
                  <CustomisationPanel category={category} onChange={setCustomData} validationAttempt={custValidationAttempt} />
                </div>
                <div className="pdp-divider" />
              </>
            )}

            {/* Quantity */}
            <p className="pdp-section-label" style={{ marginBottom: 10 }}>Quantity</p>
            <div className="pdp-qty-row">
              <div className="pdp-qty">
                <button className="pdp-qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))} aria-label="Decrease quantity">−</button>
                <span className="pdp-qty-val">{qty}</span>
                <button className="pdp-qty-btn" onClick={() => setQty(q => Math.min(stock || 99, q + 1))} aria-label="Increase quantity">+</button>
              </div>
              {currentStock > 0 && <span className="pdp-stock">Only {currentStock} left in stock!</span>}
            </div>

            <div className="pdp-divider" />

            {/* Premium Gift Box upsell — show only if giftBox is enabled in the product data */}
            {product?.giftBox?.enabled && (
              <>
                <p className="pdp-section-label" style={{ marginBottom: 12 }}>Make it a Gift</p>
                <GiftBoxUpsell
                  added={giftBoxAdded}
                  onToggle={() => setGiftBoxAdded(v => !v)}
                  image={product.giftBox?.image || GIFT_BOX_IMAGE}
                  heading={product.giftBox?.heading || 'Premium Gift Box'}
                  description={product.giftBox?.description || 'Rigid magnetic-close box · satin ribbon · message card'}
                  price={product.giftBox?.price ? Number(product.giftBox.price) : 50}
                />
                <div className="pdp-divider" />
              </>
            )}

            <CompleteTheLookStrip />
            <div className="pdp-divider" />
            <GiftMessagePanel value={giftMessage} onChange={setGiftMessage} />
            <div className="pdp-divider" />

            {/* CTA */}
            <div className="pdp-cta-row">
              {Number(currentStock) <= 0 && (
                <div style={{ gridColumn: '1 / -1', padding: '6px 12px', background: 'rgba(211,47,47,.08)', color: 'var(--red)', fontSize: 11, fontWeight: 700, borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 6, width: '100%', justifyContent: 'center' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                  Out of stock
                </div>
              )}
              <button className={`pdp-btn-wish${wished ? ' on' : ''}`} onClick={handleWishToggle}>
                <svg viewBox="0 0 24 24" fill={wished ? 'var(--beige)' : 'none'} stroke={wished ? 'none' : 'currentColor'} strokeWidth="1.8" width="16" height="16">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                {wished ? 'Wished' : 'Wishlist'}
              </button>
              <div className="pdp-btn-cart-wrap">
                <button ref={cartBtnRef} className={`pdp-btn-cart${cartAnim ? ' bounce' : ''}`} onClick={handleAddToCart} disabled={Number(currentStock) <= 0}
                  style={{ opacity: Number(currentStock) <= 0 ? 0.5 : 1, cursor: Number(currentStock) <= 0 ? 'not-allowed' : 'pointer' }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
                  {Number(currentStock) <= 0 ? 'Sold Out' : cartAnim ? 'Added! ✓' : `Add to Cart · ₹${totalWithGiftBox.toLocaleString('en-IN')}`}
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

            {/* Trust badges */}
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
            </div>
            <EstimatedDeliveryBlock />
          </div>
        </div>

        <ReviewsSection productId={product.sourceId} reviews={productReviews} setReviews={setProductReviews} />
      </div>

      {/* Error Toast */}
      {errorToast && (
        <div style={{
          position: 'fixed', bottom: '40px', left: '50%', transform: 'translateX(-50%)',
          background: 'var(--red)', color: 'white', padding: '14px 22px',
          borderRadius: '18px', fontSize: '13px', fontWeight: 600, zIndex: 9999,
          boxShadow: '0 12px 32px rgba(192, 57, 43, 0.35)', animation: 'fadeUp 0.35s ease both',
          fontFamily: 'Jost, sans-serif', letterSpacing: '.03em',
          whiteSpace: 'normal', textAlign: 'center', lineHeight: 1.45,
          width: 'max-content', maxWidth: 'calc(100vw - 32px)',
        }}>
          {errorToast}
        </div>
      )}
    </>
  );
}