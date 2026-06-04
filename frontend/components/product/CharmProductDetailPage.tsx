'use client';
import { useState, useRef, useCallback, useEffect, type ChangeEvent, type DragEvent } from 'react';
import { useRouter } from 'next/navigation';
import { fetchProductById, fetchCharmItems, type CatalogProduct, type CharmItemData } from '@/lib/catalogApi';
import { useCart } from '@/lib/cartContext';
import { fireConfetti } from '@/components/cart/ConfettiManager';
import { useWishlist } from '@/lib/wishlistContext';
import UpperNav from '@/components/ui/UpperNav';

/* ─── Types ─── */
interface AccordionData {
  id: string;
  emoji: string;
  label: string;
  content: string;
  isHtml?: boolean;
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

/* ─── Charm option list (extend as needed) ─── */
const CHARM_OPTIONS = [
  { value: '', label: 'Select a charm…' },
  { value: 'initial_a', label: '𝑨 Initial — A' },
  { value: 'initial_b', label: '𝑩 Initial — B' },
  { value: 'initial_c', label: '𝑪 Initial — C' },
  { value: 'initial_d', label: '𝑫 Initial — D' },
  { value: 'initial_e', label: '𝑬 Initial — E' },
  { value: 'initial_f', label: '𝑭 Initial — F' },
  { value: 'initial_g', label: '𝑮 Initial — G' },
  { value: 'initial_h', label: '𝑯 Initial — H' },
  { value: 'initial_i', label: '𝑰 Initial — I' },
  { value: 'initial_j', label: '𝑱 Initial — J' },
  { value: 'initial_k', label: '𝑲 Initial — K' },
  { value: 'initial_l', label: '𝑳 Initial — L' },
  { value: 'initial_m', label: '𝑴 Initial — M' },
  { value: 'initial_n', label: '𝑵 Initial — N' },
  { value: 'initial_o', label: '𝑶 Initial — O' },
  { value: 'initial_p', label: '𝑷 Initial — P' },
  { value: 'initial_q', label: '𝑸 Initial — Q' },
  { value: 'initial_r', label: '𝑹 Initial — R' },
  { value: 'initial_s', label: '𝑺 Initial — S' },
  { value: 'initial_t', label: '𝑻 Initial — T' },
  { value: 'initial_u', label: '𝑼 Initial — U' },
  { value: 'initial_v', label: '𝑽 Initial — V' },
  { value: 'initial_w', label: '𝑾 Initial — W' },
  { value: 'initial_x', label: '𝑿 Initial — X' },
  { value: 'initial_y', label: '𝒀 Initial — Y' },
  { value: 'initial_z', label: '𝒁 Initial — Z' },
  { value: 'heart', label: '♥ Heart' },
  { value: 'star', label: '★ Star' },
  { value: 'moon', label: '☽ Moon' },
  { value: 'sun', label: '☀ Sun' },
  { value: 'flower', label: '✿ Flower' },
  { value: 'butterfly', label: '🦋 Butterfly' },
  { value: 'infinity', label: '∞ Infinity' },
  { value: 'crown', label: '♛ Crown' },
  { value: 'diamond', label: '◈ Diamond' },
  { value: 'birthstone_jan', label: '💎 Birthstone — January (Garnet)' },
  { value: 'birthstone_feb', label: '💎 Birthstone — February (Amethyst)' },
  { value: 'birthstone_mar', label: '💎 Birthstone — March (Aquamarine)' },
  { value: 'birthstone_apr', label: '💎 Birthstone — April (Diamond)' },
  { value: 'birthstone_may', label: '💎 Birthstone — May (Emerald)' },
  { value: 'birthstone_jun', label: '💎 Birthstone — June (Pearl)' },
  { value: 'birthstone_jul', label: '💎 Birthstone — July (Ruby)' },
  { value: 'birthstone_aug', label: '💎 Birthstone — August (Peridot)' },
  { value: 'birthstone_sep', label: '💎 Birthstone — September (Sapphire)' },
  { value: 'birthstone_oct', label: '💎 Birthstone — October (Opal)' },
  { value: 'birthstone_nov', label: '💎 Birthstone — November (Topaz)' },
  { value: 'birthstone_dec', label: '💎 Birthstone — December (Turquoise)' },
];

const MAX_CHARM_COUNT = 10;
const FALLBACK_PRODUCT_IMAGE = '/images/hero.png';
const CUSTOMISABLE_CATEGORIES = ['Gift Boxes', 'Fan Box', 'Key Chain/Charm'];

/* ─── Helpers ─── */
function normalizeText(v: string) { return v.trim().toLowerCase(); }
function uniqueValues(vals: Array<string | undefined | null>) {
  return Array.from(new Set(vals.filter((v): v is string => Boolean(v && v.trim()))));
}
function dedupeImages(vals: Array<string | undefined | null>) { return uniqueValues(vals); }

/* ─── Trust badges ─── */
const TRUST_BADGES = [
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="18" width="28" height="18" rx="2"/><path d="M32 22h4l6 8v6h-10V22z"/>
        <circle cx="14" cy="38" r="3"/><circle cx="36" cy="38" r="3"/>
        <path d="M4 26h28"/><path d="M10 14h4M16 11v6"/>
      </svg>
    ),
    title: 'Free Shipping', sub: 'On orders above ₹999',
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M24 6C14 6 8 14 8 22c0 10 16 22 16 22s16-12 16-22c0-8-6-16-16-16z"/>
        <path d="M20 22l3 3 6-6"/>
      </svg>
    ),
    title: 'COD Available', sub: 'On all orders',
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 24h26M24 14l12 10-12 10"/>
        <circle cx="38" cy="24" r="6"/><path d="M6 16v16"/>
      </svg>
    ),
    title: 'Express Delivery', sub: '2–3 business days',
  },
];

/* ─── Reviews ─── */
const REVIEWS_DATA = [
  { id: 1, name: 'Priya Sharma', initials: 'PS', rating: 5, date: '12 Apr 2025', title: 'Absolutely stunning piece!', body: 'I gifted this to my sister and she was in tears. The quality is exceptional — it looks far more expensive than it actually is. The packaging was gorgeous too. Will definitely be ordering again.', verified: true, helpful: 24, colorHex: '#c9a84c' },
  { id: 2, name: 'Anika Reddy', initials: 'AR', rating: 5, date: '3 Apr 2025', title: 'Perfect everyday necklace', body: 'Wore it every day for a month and it still looks brand new. The layered design is so elegant and gets so many compliments. Highly recommend for anyone looking for something that looks luxe but is affordable.', verified: true, helpful: 18, colorHex: '#5a6b2e' },
  { id: 3, name: 'Meera Joshi', initials: 'MJ', rating: 4, date: '28 Mar 2025', title: 'Beautiful but clasp is slightly fiddly', body: 'The necklace itself is gorgeous — love the delicate layered look. My only minor complaint is the lobster clasp is a tiny bit tricky to fasten solo. Once on though, it stays perfectly and looks stunning.', verified: true, helpful: 11, colorHex: '#3d4a22' },
  { id: 4, name: 'Divya Nair', initials: 'DN', rating: 5, date: '19 Mar 2025', title: 'Fast delivery, premium quality', body: 'Ordered on a whim and received it in 2 days. The moment I opened the box I knew it was worth every rupee. The gold plating is even and the chains lay perfectly. Zero tarnishing so far.', verified: false, helpful: 8, colorHex: '#c9a84c' },
  { id: 5, name: 'Roshni Kapoor', initials: 'RK', rating: 5, date: '10 Mar 2025', title: 'My go-to jewellery shop now', body: 'Third order from Maison and they never disappoint. This layered necklace is my favourite so far. It transitions effortlessly from casual daywear to evenings. The rose gold variant I got is dreamy.', verified: true, helpful: 31, colorHex: '#7a8e3c' },
];
const RATING_DISTRIBUTION = [
  { stars: 5, count: 148, pct: 74 }, { stars: 4, count: 32, pct: 16 },
  { stars: 3, count: 12, pct: 6 },  { stars: 2, count: 4, pct: 2 }, { stars: 1, count: 4, pct: 2 },
];
const OVERALL_RATING = 4.8;
const TOTAL_REVIEWS = 200;

/* ─── Goes well with ─── */
const GOES_WELL_WITH = [
  { id: 1, name: 'Pearl Drop Earrings', price: 899, originalPrice: 1299, image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&q=80', href: '/products/pearl-drop-earrings' },
  { id: 2, name: 'Delicate Gold Bracelet', price: 1199, originalPrice: 1699, image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&q=80', href: '/products/gold-bracelet' },
  { id: 3, name: 'Twisted Ring Set', price: 749, originalPrice: 999, image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&q=80', href: '/products/twisted-ring-set' },
  { id: 4, name: 'Charm Anklet', price: 649, originalPrice: 849, image: 'https://images.unsplash.com/photo-1573408301185-9519f94e84dd?w=400&q=80', href: '/products/charm-anklet' },
];

/* ─── CHARM SELECTOR COMPONENT ─── */
function CharmSelector({
  onChange,
  charmPieceOptions = [],
  totalCharms = 0
}: {
  onChange: (data: { count: number; charms: string[] }) => void;
  charmPieceOptions?: number[];
  totalCharms?: number;
}) {
  const optionsList = charmPieceOptions.length > 0 ? charmPieceOptions : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const [charmCount, setCharmCount] = useState(() => optionsList[0] || 1);
  const [selectedCharms, setSelectedCharms] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Sync count when options change
  useEffect(() => {
    if (charmPieceOptions && charmPieceOptions.length > 0) {
      setCharmCount(charmPieceOptions[0]);
      setSelectedCharms([]);
    }
  }, [charmPieceOptions]);

  // Adjust selection if charmCount decreases
  useEffect(() => {
    if (selectedCharms.length > charmCount) {
      setSelectedCharms(prev => prev.slice(0, charmCount));
    }
  }, [charmCount, selectedCharms.length]);

  useEffect(() => {
    onChange({ count: charmCount, charms: selectedCharms });
  }, [charmCount, selectedCharms, onChange]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const toggleSelectCharm = (charmName: string) => {
    setSelectedCharms(prev => {
      if (prev.includes(charmName)) {
        return prev.filter(c => c !== charmName);
      }
      if (prev.length >= charmCount) {
        // Can't select more than the limit
        return prev;
      }
      return [...prev, charmName];
    });
  };

  const totalOptions = totalCharms > 0 ? totalCharms : 42; // default to 42 if not configured
  const charmOptions = Array.from({ length: totalOptions }, (_, i) => `Charm ${i + 1}`);

  return (
    <div className="charm-selector">
      {/* Count picker */}
      <div className="charm-count-row">
        <p className="charm-section-label">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14, color: 'var(--gold)' }}>
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          Number of Charms
        </p>
        <div className="charm-count-grid">
          {optionsList.map(n => (
            <button
              key={n}
              type="button"
              className={`charm-count-btn${charmCount === n ? ' active' : ''}`}
              onClick={() => {
                setCharmCount(n);
              }}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Checkbox Dropdown */}
      <div className="charm-dropdown-container" ref={dropdownRef} style={{ marginTop: 18, position: 'relative' }}>
        <p className="charm-section-label">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14, color: 'var(--gold)' }}>
            <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
          Select Charms
          <span className="charm-filled-badge">{selectedCharms.length}/{charmCount} selected</span>
        </p>

        <button
          type="button"
          className="charm-dropdown-btn"
          onClick={() => setIsOpen(!isOpen)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'white',
            border: '1.5px solid var(--beige-dkr)',
            borderRadius: 12,
            padding: '12px 16px',
            fontFamily: "'Jost', sans-serif",
            fontSize: 13,
            fontWeight: 500,
            color: 'var(--olive-600)',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
            {selectedCharms.length > 0
              ? selectedCharms.join(', ')
              : 'SELECT CHARMS'}
          </span>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            style={{
              width: 14,
              height: 14,
              color: 'var(--mist)',
              transition: 'transform 0.2s',
              transform: isOpen ? 'rotate(180deg)' : 'none',
              flexShrink: 0,
            }}
          >
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>

        {isOpen && (
          <div
            className="charm-dropdown-list-wrapper"
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: 6,
              background: 'white',
              border: '1.5px solid var(--beige-dkr)',
              borderRadius: 12,
              maxHeight: 240,
              overflowY: 'auto',
              boxShadow: '0 8px 30px rgba(61,74,34,0.15)',
              zIndex: 100,
              animation: 'charmPop 0.25s ease both',
            }}
          >
            {charmOptions.map(option => {
              const isChecked = selectedCharms.includes(option);
              const isMaxReached = selectedCharms.length >= charmCount;
              const disabled = isMaxReached && !isChecked;

              return (
                <label
                  key={option}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 16px',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    background: isChecked ? 'var(--olive-50)' : 'transparent',
                    borderBottom: '1px solid rgba(61,74,34,0.06)',
                    transition: 'background 0.15s',
                    opacity: disabled ? 0.5 : 1,
                  }}
                  className="charm-dropdown-option"
                  onClick={(e) => {
                    if (disabled) e.preventDefault();
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    disabled={disabled}
                    onChange={() => toggleSelectCharm(option)}
                    style={{
                      width: 16,
                      height: 16,
                      accentColor: 'var(--olive-600)',
                      cursor: disabled ? 'not-allowed' : 'pointer',
                    }}
                  />
                  <span
                    style={{
                      fontSize: 13.5,
                      fontWeight: isChecked ? 600 : 400,
                      color: isChecked ? 'var(--olive-900)' : 'var(--ink)',
                    }}
                  >
                    {option}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Summary / selected display */}
      {selectedCharms.length > 0 && (
        <div className="charm-summary-strip" style={{ animation: 'charmFadeUp .35s ease both', marginTop: 16 }}>
          <div className="charm-summary-header">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14, color: 'var(--olive-500)', flexShrink: 0, marginTop: 1 }}>
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <span>
              <strong>{selectedCharms.length}</strong> of <strong>{charmCount}</strong> selected
              {selectedCharms.length === charmCount && <span className="charm-all-done"> — all set! ✨</span>}
            </span>
          </div>
          <div className="charm-summary-list" style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {selectedCharms.map((c, i) => (
              <span key={c} className="charm-summary-pill" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 10.5,
                fontWeight: 500,
                color: 'var(--ink)',
                background: 'white',
                border: '1px solid rgba(61,74,34,0.12)',
                padding: '4px 10px 4px 4px',
                borderRadius: 50,
              }}>
                <span className="charm-summary-num" style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: 'var(--olive-600)',
                  color: 'var(--beige)',
                  fontSize: 9,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>{i + 1}</span>
                {c}
                <button
                  type="button"
                  onClick={() => toggleSelectCharm(c)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 0 4px', color: 'var(--mist)', fontSize: 13, lineHeight: 1, display: 'flex', alignItems: 'center' }}
                  title="Remove"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Reviews ─── */
function ReviewsSection() {
  const [visibleCount, setVisibleCount] = useState(3);
  const [filterStar, setFilterStar] = useState<number | null>(null);
  const filtered = REVIEWS_DATA.filter(r => filterStar === null || r.rating === filterStar);
  const visible = filtered.slice(0, visibleCount);

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
          <span className="rev-big-num">{OVERALL_RATING}</span>
          <div className="rev-big-stars">{'★'.repeat(Math.round(OVERALL_RATING))}{'☆'.repeat(5 - Math.round(OVERALL_RATING))}</div>
          <span className="rev-total-cnt">Based on {TOTAL_REVIEWS} reviews</span>
        </div>
        <div className="rev-bars">
          {RATING_DISTRIBUTION.map(d => (
            <button key={d.stars} className={`rev-bar-row${filterStar === d.stars ? ' rev-bar-row--active' : ''}`} onClick={() => setFilterStar(filterStar === d.stars ? null : d.stars)}>
              <span className="rev-bar-label">{d.stars}★</span>
              <div className="rev-bar-track"><div className="rev-bar-fill" style={{ width: `${d.pct}%` }} /></div>
              <span className="rev-bar-count">{d.count}</span>
            </button>
          ))}
        </div>
      </div>
      {filterStar !== null && (
        <div className="rev-controls">
          <button className="rev-clear-filter" onClick={() => setFilterStar(null)}>Showing {filterStar}★ only &nbsp;×</button>
        </div>
      )}
      <div className="rev-list">
        {visible.map((r, i) => (
          <div key={r.id} className="rev-card" style={{ animationDelay: `${i * 0.07}s` }}>
            <div className="rev-card-top">
              <div className="rev-avatar" style={{ background: r.colorHex + '22', color: r.colorHex }}>{r.initials}</div>
              <div className="rev-meta">
                <div className="rev-meta-row">
                  <span className="rev-name">{r.name}</span>
                  {r.verified && <span className="rev-verified"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Verified purchase</span>}
                </div>
                <div className="rev-meta-row" style={{ marginTop: 3 }}>
                  <span className="rev-stars-sm">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                  <span className="rev-date">{r.date}</span>
                </div>
              </div>
            </div>
            <p className="rev-card-title">{r.title}</p>
            <p className="rev-card-body">{r.body}</p>
            <div className="rev-card-foot">
              <span className="rev-helpful-label">Helpful?</span>
              <button className="rev-helpful-btn">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
                {r.helpful}
              </button>
            </div>
          </div>
        ))}
      </div>
      {visibleCount < filtered.length && (
        <div className="rev-load-wrap">
          <button className="rev-load-btn" onClick={() => setVisibleCount(v => v + 3)}>Show more reviews</button>
        </div>
      )}
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

/* ─── Accordion ─── */
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
            : item.content.split('\n').map((line, i) => <p key={i} style={{ marginBottom: line === '' ? 8 : 0 }}>{line || '\u00A0'}</p>)
          }
        </div>
      </div>
    </div>
  );
}

/* ─── Estimated Delivery ─── */
function EstimatedDeliveryBlock() {
  const standardDate = (() => { const d = new Date(); d.setDate(d.getDate() + 7); return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', weekday: 'short' }); })();
  const expressDate = (() => { const d = new Date(); d.setDate(d.getDate() + 4); return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', weekday: 'short' }); })();
  return (
    <div className="acc-delivery-estimate">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14, flexShrink: 0, color: 'var(--olive-500)', marginTop: 1 }}>
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
      <div>
        <p className="acc-delivery-label">Estimated Delivery</p>
        <div className="acc-delivery-row">
          <span className="acc-delivery-chip acc-delivery-chip--std"><strong>Standard</strong> {standardDate}</span>
          <span className="acc-delivery-chip acc-delivery-chip--exp"><strong>Express</strong> {expressDate}</span>
        </div>
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
function CustomisationPanel({ category, onChange }: { category: string; onChange?: (data: { wantCustom: boolean | null; uploads: string[]; globalNote: string }) => void }) {
  const [wantCustom, setWantCustom] = useState<boolean | null>(null);
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [globalNote, setGlobalNote] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const MAX_FILES = 5;

  useEffect(() => { if (onChange) onChange({ wantCustom, uploads: uploads.map(u => u.preview), globalNote }); }, [wantCustom, uploads, globalNote, onChange]);

  const addFiles = useCallback((files: FileList | File[]) => {
    const valid = Array.from(files).filter((f: File) => f.type.startsWith('image/')).slice(0, MAX_FILES - uploads.length);
    valid.forEach(file => { const r = new FileReader(); r.onload = e => setUploads(prev => [...prev, { id: Date.now() + Math.random(), file, preview: (e.target?.result as string) || '', note: '' }]); r.readAsDataURL(file); });
  }, [uploads.length]);

  const catLabel = category === 'Key Chain/Charm' ? 'key chain / charm' : category === 'Fan Box' ? 'fan box' : 'gift box';

  return (
    <>
      <div style={{ display: 'flex', gap: 10 }}>
        <button className={`cust-toggle-btn yes${wantCustom === true ? ' sel' : ''}`} onClick={() => { setWantCustom(true); }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          Yes, Customise
        </button>
        <button className={`cust-toggle-btn no${wantCustom === false ? ' sel' : ''}`} onClick={() => { setWantCustom(false); setUploads([]); setGlobalNote(''); }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          No, Standard
        </button>
      </div>
      {wantCustom === false && (
        <div className="cust-info-chip" style={{ marginTop: 12 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 15, height: 15, flexShrink: 0, color: 'var(--gold)', marginTop: 1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <p>You'll receive the <strong>standard {catLabel}</strong>. You can still personalise it later by contacting us within 2 hours.</p>
        </div>
      )}
      {wantCustom === true && (
        <div style={{ marginTop: 14, animation: 'fadeUp .35s ease both' }}>
          <textarea className="cust-note-global" placeholder={`Add a personalisation note…`} value={globalNote} onChange={e => setGlobalNote(e.target.value)} rows={3} />
          {uploads.length < MAX_FILES && (
            <div className={`cust-drop${dragOver ? ' drag-over' : ''}`} onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={e => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }} onClick={() => fileInputRef.current?.click()}>
              <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={(e: ChangeEvent<HTMLInputElement>) => { if (e.currentTarget.files) addFiles(e.currentTarget.files); }} />
              <p className="cust-drop-title">Upload your photos</p>
              <p className="cust-drop-sub">Drag & drop or click · JPG · PNG · Max 10 MB</p>
              <span className="cust-drop-btn">Choose Photos</span>
            </div>
          )}
          <p className={`cust-limit${uploads.length >= MAX_FILES ? ' warn' : ''}`}>{uploads.length}/{MAX_FILES} photos</p>
          {uploads.length > 0 && (
            <div className="cust-previews">
              {uploads.map((u, i) => (
                <div key={u.id} className="cust-preview-item">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="cust-preview-img" src={u.preview} alt={`Upload ${i + 1}`} />
                  <button className="cust-preview-remove" onClick={() => setUploads(prev => prev.filter(x => x.id !== u.id))}>×</button>
                </div>
              ))}
            </div>
          )}
          <div className="cust-info-chip">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 15, height: 15, flexShrink: 0, color: 'var(--gold)', marginTop: 1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
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
          <path d="M20 12v10H4V12"/><path d="M22 7H2v5h20V7z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
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
          <svg className="gift-msg-select-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
      </div>
      <div className="gift-msg-free-wrap">
        <label className="gift-msg-label gift-msg-label--free">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13, color: 'var(--olive-500)' }}><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
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
  const [qty, setQty] = useState(1);
  const [cartAnim, setCartAnim] = useState(false);
  const [sparkleAnim, setSparkleAnim] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>('about');
  const cartBtnRef = useRef<HTMLButtonElement | null>(null);

  const [charmData, setCharmData] = useState<{ count: number; charms: string[] }>({ count: 1, charms: [''] });
  const [customData, setCustomData] = useState<{ wantCustom: boolean | null; uploads: string[]; globalNote: string }>({ wantCustom: null, uploads: [], globalNote: '' });
  const [giftMessage, setGiftMessage] = useState<{ preset: string; customMessage: string }>({ preset: '', customMessage: '' });

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

  const normalizedColors: ProductColor[] = (product?.colors ?? []).map((c: any) => ({ label: c.label || c.name || 'Default', hex: c.hex || '#c9a84c' }));
  const sizes = product?.sizes ?? [];
  const variants = product?.variants ?? [];
  const mainImage = product?.mainImage;
  const images = product?.images ?? [];

  const isCustomisable = category ? CUSTOMISABLE_CATEGORIES.some(c => category.toLowerCase().includes(c.toLowerCase())) : false;

  useEffect(() => {
    if (!product) return;
    setActiveColor(0);
    setActiveSize(product.sizes?.[0] || product.variants?.[0]?.size || '');
    setActiveImg(0);
  }, [product?.sourceId]);

  const currentColor = normalizedColors[activeColor] || normalizedColors[0];
  const normalizedColor = normalizeText(currentColor?.label || '');
  const normalizedSize = normalizeText(activeSize);

  const matchingVariant = variants.find(v => normalizeText(v.color) === normalizedColor && normalizeText(v.size) === normalizedSize)
    || variants.find(v => normalizeText(v.color) === normalizedColor)
    || variants.find(v => normalizeText(v.size) === normalizedSize);

  const currentImages = dedupeImages([matchingVariant?.image, mainImage, ...images]).filter(Boolean) as string[];
  const displayImg = currentImages?.[activeImg] || matchingVariant?.image || mainImage || FALLBACK_PRODUCT_IMAGE;

  let discount = 0;
  if (discountedPrice && price) discount = Math.round(((price - discountedPrice) / price) * 100);
  else if (originalPrice && price) discount = Math.round(((originalPrice - price) / originalPrice) * 100);

  const currentStock = matchingVariant?.stock ?? stock;
  const availableSizes = sizes.length > 0 ? sizes : uniqueValues(variants.map(v => v.size));
  const sizeOptions = availableSizes.length > 0 ? availableSizes : [];
  const selectedCharmCount = charmData.count;
  const unitCharmPrice = discountedPrice || price;
  const unitOriginalCharmPrice = originalPrice || price;
  const totalCharmPrice = unitCharmPrice * selectedCharmCount;
  const totalCharmOriginalPrice = unitOriginalCharmPrice * selectedCharmCount;

  const wished = product ? isWished(product.id) : false;

  const handleWishToggle = useCallback(() => {
    if (!product) return;
    toggleItem({ id: product.id, name: product.name || 'Product', price: totalCharmPrice, originalPrice: totalCharmOriginalPrice, image: displayImg, category: product.category || '', href: product.href || `/products/${product.sourceId}`, colors: normalizedColors, badge: product.badge ?? null, rating: product.rating ?? 0, reviewCount: product.reviewCount ?? 0 });
  }, [toggleItem, product, totalCharmPrice, totalCharmOriginalPrice, displayImg, normalizedColors]);

  const buildCartItem = useCallback(() => ({
    id: String(product!.sourceId),
    name: product!.name || '',
    price: totalCharmPrice,
    originalPrice: totalCharmOriginalPrice,
    image: displayImg,
    color: currentColor?.label || '',
    colorHex: currentColor?.hex || '#c9a84c',
    size: activeSize || undefined,
    sku: product!.sku,
    href: product!.href || `/products/${product!.sourceId}`,
    sourceId: String(product!.sourceId),
    category,
    customNote: customData.wantCustom ? customData.globalNote : undefined,
    customImages: customData.wantCustom ? customData.uploads : undefined,
    giftMessage: giftMessage.customMessage || undefined,
    selectedCharms: charmData.charms.filter(Boolean).map(charm => ({
      sourceId: charm,
      name: charm,
      quantity: 1,
      price: unitCharmPrice,
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
        price: unitCharmPrice,
        images: customData.wantCustom ? customData.uploads : [],
        customText: customData.wantCustom ? customData.globalNote : undefined,
      })),
      metadata: {
        requestedCount: selectedCharmCount,
      },
    }],
    charms: charmData.charms.filter(Boolean),
    charmCount: selectedCharmCount,
  }), [product, displayImg, currentColor, activeSize, category, customData, giftMessage, charmData, totalCharmPrice, totalCharmOriginalPrice, unitCharmPrice, selectedCharmCount]);

  const handleAddToCart = useCallback(() => {
    if (!product) return;
    const item = buildCartItem();
    for (let i = 0; i < qty; i++) addItem(item);
    fireConfetti(cartBtnRef.current);
    setCartAnim(true); setSparkleAnim(true);
    setTimeout(() => setCartAnim(false), 700);
    setTimeout(() => setSparkleAnim(false), 800);
  }, [addItem, product, qty, buildCartItem]);

  const handleBuyNow = useCallback(() => {
    if (!product) return;
    const item = buildCartItem();
    for (let i = 0; i < qty; i++) addItem(item, false);
    router.push('/cart');
  }, [addItem, product, qty, router, buildCartItem]);

  const handleColorChange = useCallback((i: number) => {
    setActiveColor(i); setActiveImg(0);
    const nextColor = normalizedColors[i];
    if (!nextColor) return;
    const nextSize = variants.find(v => normalizeText(v.color) === normalizeText(nextColor.label))?.size || sizeOptions[0] || '';
    setActiveSize(nextSize);
  }, [normalizedColors, variants, sizeOptions]);

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
      <a href="/" style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: '#f5f0e8', background: '#3d4a22', padding: '12px 28px', borderRadius: 50, textDecoration: 'none' }}>Back to Home</a>
    </div>
  );

  const productName = product.name || '';
  const description = product.description || '';

  const dynamicAccordionItems: AccordionData[] = [
    ...(about ? [{ id: 'about', emoji: '💎', label: 'About the Product', content: about }] : []),
    ...(description ? [{ id: 'desc', emoji: '📄', label: 'Product Description', content: description }] : []),
    ...(faqs.length > 0 ? [{ id: 'faq', emoji: '❓', label: 'FAQs', content: faqs.map((f: { question: string; answer: string }) => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n') }] : []),
    { id: 'cancel', emoji: '↩️', label: 'Cancellation Policy', content: 'Orders can be cancelled free of charge within 24 hours of placing. After 24 hours, cancellations are not accepted once dispatched.' },
    { id: 'shipping', emoji: '🚚', label: 'Shipping & Returns', content: 'STANDARD DELIVERY (3–5 business days) — ₹60 delivery charge. Free on orders above ₹999.\nEXPRESS DELIVERY (2–3 business days) — ₹120 delivery charge.\n\nReturns accepted within 7 days of delivery.' },
  ];

  return (
    <>
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

        @keyframes sparkle{0%{opacity:1;transform:translate(0,0) scale(1)}100%{opacity:0;transform:translate(calc(var(--tx,0px)*2.2),calc(var(--ty,0px)*2.2)) scale(0)}}
        @keyframes cartBounce{0%,100%{transform:scale(1)}30%{transform:scale(1.14) rotate(-3deg)}60%{transform:scale(.94) rotate(2deg)}80%{transform:scale(1.04)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes charmFadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes imgIn{from{opacity:0;transform:scale(.97)}to{opacity:1;transform:scale(1)}}
        @keyframes stockPulse{0%,100%{opacity:1}50%{opacity:.55}}
        @keyframes charmPop{0%{transform:scale(0.8);opacity:0}60%{transform:scale(1.05)}100%{transform:scale(1);opacity:1}}

        .pdp{min-height:100vh;background:var(--beige);font-family:'Jost',sans-serif;color:var(--ink)}
        .pdp-layout{display:grid;grid-template-columns:1fr 1fr;gap:0;max-width:1280px;margin:0 auto}

        /* ── Gallery ── */
        .pdp-gallery{position:sticky;top:80px;height:calc(100vh - 80px);padding:32px 28px 32px 52px;display:flex;flex-direction:column;gap:14px;animation:fadeUp .6s ease both;min-width:0;overflow:hidden}
        .pdp-main-img-wrap{flex:1;min-height:0;background:var(--beige-dk);border-radius:24px;overflow:hidden;position:relative}
        .pdp-main-img{width:100%;height:100%;object-fit:cover;animation:imgIn .4s ease both}
        .pdp-badge{position:absolute;top:16px;left:16px;font-size:9.5px;font-weight:600;letter-spacing:.1em;color:var(--beige);background:var(--olive-600);padding:5px 14px 4px;border-radius:50px}
        .pdp-wish{position:absolute;top:14px;right:14px;width:36px;height:36px;border-radius:50%;background:rgba(245,240,232,.9);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:transform .2s,background .2s}
        .pdp-wish:hover{transform:scale(1.1)}
        .pdp-wish.on{background:var(--olive-600)}
        .pdp-thumb-row{display:flex;gap:10px;flex-wrap:nowrap;overflow-x:auto;padding-bottom:2px}
        .pdp-thumb-row::-webkit-scrollbar{height:3px}
        .pdp-thumb-row::-webkit-scrollbar-thumb{background:var(--beige-dkr);border-radius:4px}
        .pdp-thumb{width:72px;height:72px;border-radius:12px;overflow:hidden;cursor:pointer;flex-shrink:0;border:2px solid transparent;transition:border-color .2s,transform .2s}
        .pdp-thumb:hover{transform:scale(1.06)}
        .pdp-thumb.active{border-color:var(--olive-500)}
        .pdp-thumb img{width:100%;height:100%;object-fit:cover}

        /* ── Info ── */
        .pdp-info{padding:32px 52px 40px 28px;animation:fadeUp .6s ease .1s both;overflow-y:auto}
        .pdp-name{font-family:'Cormorant Garamond',serif;font-size:clamp(1.9rem,3.5vw,2.8rem);font-weight:400;line-height:1.1;letter-spacing:-.01em;color:var(--olive-900);margin-bottom:10px}
        .pdp-name em{font-style:italic;color:var(--olive-600)}
        .pdp-rating{display:flex;align-items:center;gap:6px;margin-bottom:14px}
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
        .pdp-sizes{display:flex;gap:10px;margin-bottom:20px;flex-wrap:wrap}
        .pdp-size-btn{min-width:54px;padding:9px 12px;border-radius:999px;border:1.5px solid var(--beige-dkr);background:white;font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--olive-600);cursor:pointer;transition:all .2s}
        .pdp-size-btn:hover{border-color:var(--olive-400);background:var(--olive-50)}
        .pdp-size-btn.active{border-color:var(--olive-600);background:var(--olive-600);color:var(--beige)}
        .pdp-size-btn:disabled{opacity:.4;cursor:not-allowed;text-decoration:line-through}
        .pdp-desc{font-size:13px;font-weight:300;line-height:1.85;color:var(--mist);letter-spacing:.03em;margin-bottom:20px}
        .pdp-qty-row{display:flex;align-items:center;gap:14px;margin-bottom:20px}
        .pdp-qty{display:flex;align-items:center;border:1.5px solid var(--beige-dkr);border-radius:50px;overflow:hidden}
        .pdp-qty-btn{width:36px;height:36px;background:none;border:none;font-size:18px;cursor:pointer;color:var(--olive-600);display:flex;align-items:center;justify-content:center;transition:background .15s}
        .pdp-qty-btn:hover{background:var(--olive-50)}
        .pdp-qty-val{min-width:36px;text-align:center;font-size:13px;font-weight:600;color:var(--ink)}
        .pdp-stock{font-size:10.5px;font-weight:500;letter-spacing:.06em;color:var(--red);animation:stockPulse 2.2s ease-in-out infinite}

        /* ════════════════════════════════════════════
           CHARM SELECTOR
        ════════════════════════════════════════════ */
        .charm-selector{
          background: linear-gradient(135deg, rgba(201,168,76,.08), rgba(90,110,35,.06));
          border: 1.5px solid rgba(201,168,76,.28);
          border-radius: 18px;
          padding: 20px 20px 18px;
          margin-bottom: 20px;
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

        /* Count label */
        .charm-section-label{
          display: flex; align-items: center; gap: 7px;
          font-size: 9.5px; font-weight: 700; letter-spacing: .3em;
          text-transform: uppercase; color: var(--mist); margin-bottom: 12px;
        }

        /* Number grid */
        .charm-count-grid{
          display: flex; flex-wrap: wrap; gap: 8px;
        }
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

        /* Dropdown list */
        .charm-dropdowns{ margin-top: 4px; }
        .charm-filled-badge{
          margin-left: auto;
          font-size: 9px; font-weight: 700; letter-spacing: .1em;
          color: var(--beige); background: var(--olive-500);
          padding: 2px 8px; border-radius: 4px; text-transform: uppercase;
        }

        .charm-dropdown-list{ display: flex; flex-direction: column; gap: 10px; }
        .charm-dropdown-item{
          animation: charmPop .3s ease both;
          background: white;
          border: 1.5px solid var(--beige-dkr);
          border-radius: 12px;
          padding: 10px 12px 12px;
          transition: border-color .2s;
        }
        .charm-dropdown-item:focus-within{ border-color: var(--olive-400); }

        .charm-dropdown-label-row{
          display: flex; align-items: center; gap: 8px;
          margin-bottom: 8px; flex-wrap: wrap;
        }
        .charm-num-badge{
          width: 22px; height: 22px; border-radius: 50%;
          background: var(--olive-600); color: var(--beige);
          font-size: 10px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .charm-slot-label{
          font-size: 11px; font-weight: 600; letter-spacing: .06em;
          text-transform: uppercase; color: var(--olive-600);
        }
        .charm-selected-tag{
          font-size: 10px; font-weight: 500; color: #8c6b20;
          background: rgba(201,168,76,.12);
          border: 1px solid rgba(201,168,76,.3);
          padding: 2px 8px; border-radius: 4px;
          max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }

        .charm-select-inner{ position: relative; }
        .charm-select{
          width: 100%;
          appearance: none; -webkit-appearance: none;
          background: var(--beige);
          border: 1.5px solid var(--beige-dkr);
          border-radius: 8px;
          padding: 10px 36px 10px 12px;
          font-family: 'Jost', sans-serif;
          font-size: 12px; font-weight: 400; color: #101010;
          cursor: pointer; outline: none;
          transition: border-color .2s, box-shadow .2s;
        }
        .charm-select:focus{ border-color: var(--olive-400); box-shadow: 0 0 0 3px rgba(90,110,35,.1); }
        .charm-select--filled{ background: var(--olive-50); border-color: rgba(90,110,35,.25); color: var(--olive-900); font-weight: 500; }
        .charm-select-chevron{
          position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
          width: 14px; height: 14px; color: var(--mist); pointer-events: none;
        }

        /* Summary strip */
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

        .charm-summary-list{
          display: flex; flex-wrap: wrap; gap: 6px;
        }
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
        .charm-remaining-note{
          margin-top: 10px;
          font-size: 10.5px; font-weight: 500; color: #a06020;
          letter-spacing: .03em;
        }

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
        .acc-body{padding:2px 4px 18px 36px;font-size:12px;font-weight:300;line-height:1.85;color:var(--mist);letter-spacing:.03em}
        .acc-body p{margin-bottom:4px}
        .acc-delivery-estimate{display:flex;align-items:flex-start;gap:9px;margin-top:16px;background:linear-gradient(135deg,rgba(90,110,35,.07),rgba(201,168,76,.07));border:1px solid rgba(90,110,35,.15);border-radius:0;padding:12px 14px}
        .acc-delivery-label{font-size:9px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--olive-600);margin-bottom:8px}
        .acc-delivery-row{display:flex;gap:8px;flex-wrap:wrap}
        .acc-delivery-chip{display:inline-flex;align-items:center;gap:5px;font-size:10.5px;font-weight:300;color:#101010;background:white;border:1px solid rgba(61,74,34,.1);padding:4px 10px;border-radius:0;line-height:1.5}
        .acc-delivery-chip strong{font-weight:600;color:#101010}
        .acc-delivery-chip--std{border-left:2px solid var(--olive-400)}
        .acc-delivery-chip--exp{border-left:2px solid var(--gold)}

        /* ── Customisation ── */
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
        .cust-drop{border:2px dashed var(--beige-dkr);border-radius:16px;padding:24px 20px;text-align:center;cursor:pointer;transition:border-color .22s,background .22s;background:white}
        .cust-drop.drag-over{border-color:var(--gold);background:rgba(201,168,76,.05)}
        .cust-drop:hover{border-color:var(--olive-400);background:var(--olive-50)}
        .cust-drop-title{font-size:12px;font-weight:600;letter-spacing:.06em;color:var(--olive-600);margin-bottom:4px}
        .cust-drop-sub{font-size:10px;color:var(--mist);letter-spacing:.04em}
        .cust-drop-btn{display:inline-block;margin-top:12px;font-size:10px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:var(--beige);background:var(--olive-600);padding:8px 20px;border-radius:50px;border:none;cursor:pointer}
        .cust-limit{font-size:9px;color:var(--mist);letter-spacing:.1em;text-align:right;margin-top:6px}
        .cust-limit.warn{color:var(--red);font-weight:600}
        .cust-previews{display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:10px;margin-top:14px}
        .cust-preview-item{position:relative;border-radius:12px;overflow:hidden;border:1.5px solid var(--beige-dkr)}
        .cust-preview-img{width:100%;aspect-ratio:1;object-fit:cover;display:block}
        .cust-preview-remove{position:absolute;top:5px;right:5px;width:22px;height:22px;border-radius:50%;background:rgba(26,31,13,.7);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;color:white;font-size:13px;line-height:1}

        /* ── Gift Message ── */
        .gift-msg-panel{background:linear-gradient(135deg,rgba(201,168,76,.06),rgba(245,240,232,.6));border:1.5px solid rgba(201,168,76,.25);border-radius:16px;padding:16px 18px 18px;margin-bottom:20px}
        .gift-msg-header{display:flex;align-items:center;gap:9px;margin-bottom:14px}
        .gift-msg-title{font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--olive-600);flex:1}
        .gift-msg-optional{font-size:9px;font-weight:500;letter-spacing:.1em;text-transform:uppercase;color:var(--mist);background:rgba(61,74,34,.07);padding:2px 8px;border-radius:4px}
        .gift-msg-label{display:flex;align-items:center;gap:6px;font-size:9.5px;font-weight:600;letter-spacing:.22em;text-transform:uppercase;color:var(--mist);margin-bottom:8px}
        .gift-msg-select-wrap{margin-bottom:0}
        .gift-msg-select-inner{position:relative}
        .gift-msg-select{width:100%;appearance:none;-webkit-appearance:none;background:white;border:1.5px solid var(--beige-dkr);border-radius:12px;padding:11px 38px 11px 14px;font-family:'Jost',sans-serif;font-size:12px;font-weight:400;color:var(--ink);cursor:pointer;outline:none;transition:border-color .2s}
        .gift-msg-select:focus{border-color:var(--olive-400)}
        .gift-msg-select-chevron{position:absolute;right:12px;top:50%;transform:translateY(-50%);width:15px;height:15px;color:var(--mist);pointer-events:none}
        .gift-msg-char-count{font-size:9.5px;color:var(--mist);text-align:right;margin-top:5px;letter-spacing:.05em}
        .gift-msg-free-wrap{margin-top:18px;padding-top:16px;border-top:1px solid rgba(201,168,76,.2)}
        .gift-msg-label--free{font-size:10px;letter-spacing:.24em;color:var(--olive-600);font-weight:600;margin-bottom:10px}
        .gift-msg-free-textarea{width:100%;resize:vertical;border:1.5px solid var(--beige-dkr);border-radius:0;padding:12px 14px;font-family:'Jost',sans-serif;font-size:12px;font-weight:300;color:var(--ink);background:white;outline:none;line-height:1.75;transition:border-color .2s;min-height:80px;border-left:3px solid var(--gold)}
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
        .rev-clear-filter{font-size:11px;font-weight:600;letter-spacing:.06em;color:var(--gold);background:rgba(201,168,76,.1);border:1px solid rgba(201,168,76,.3);border-radius:50px;padding:6px 14px;cursor:pointer;font-family:'Jost',sans-serif}
        .rev-list{display:flex;flex-direction:column;gap:16px}
        .rev-card{background:white;border:1px solid rgba(61,74,34,.07);border-radius:18px;padding:22px 24px;animation:fadeUp .45s ease both;transition:box-shadow .2s}
        .rev-card:hover{box-shadow:0 8px 28px rgba(61,74,34,.09)}
        .rev-card-top{display:flex;align-items:flex-start;gap:14px;margin-bottom:14px}
        .rev-avatar{width:42px;height:42px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;letter-spacing:.05em}
        .rev-meta{flex:1}
        .rev-meta-row{display:flex;align-items:center;flex-wrap:wrap;gap:8px}
        .rev-name{font-size:13px;font-weight:600;color:var(--ink)}
        .rev-verified{display:flex;align-items:center;gap:4px;font-size:9.5px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--olive-500)}
        .rev-stars-sm{font-size:12px;color:var(--gold);letter-spacing:1px}
        .rev-date{font-size:10.5px;color:var(--mist)}
        .rev-card-title{font-size:14px;font-weight:600;color:var(--ink);margin-bottom:8px}
        .rev-card-body{font-size:13px;font-weight:400;color:#101010;line-height:1.85;margin-bottom:16px}
        .rev-card-foot{display:flex;align-items:center;gap:10px;border-top:1px solid rgba(61,74,34,.07);padding-top:12px}
        .rev-helpful-label{font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--mist)}
        .rev-helpful-btn{display:flex;align-items:center;gap:5px;font-size:11px;font-weight:600;color:var(--olive-600);background:var(--olive-50);border:1px solid rgba(61,74,34,.12);border-radius:50px;padding:5px 12px;cursor:pointer;font-family:'Jost',sans-serif}
        .rev-load-wrap{display:flex;justify-content:center;margin-top:28px}
        .rev-load-btn{font-family:'Jost',sans-serif;font-size:11px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:var(--olive-600);background:white;border:1.5px solid var(--beige-dkr);border-radius:50px;padding:14px 36px;cursor:pointer;transition:all .22s}
        .rev-load-btn:hover{border-color:var(--olive-400);background:var(--olive-50)}

        /* ════ TABLET ════ */
        @media(max-width:960px){
          .pdp-layout{grid-template-columns:1fr}
          .pdp-gallery{position:static;height:auto;padding:24px 24px 0}
          .pdp-main-img-wrap{height:420px;flex:none}
          .pdp-info{padding:24px 24px 48px}
          .pdp-trust{grid-template-columns:repeat(3,1fr)}
          .rev-section{padding:40px 24px 48px}
          .rev-summary{grid-template-columns:180px 1fr}
          .rev-big-num{font-size:3.6rem}
          .charm-count-btn{width:38px;height:38px}
        }

        /* ════ MOBILE ════ */
        @media(max-width:600px){
          .pdp-gallery{padding:16px 16px 0}
          .pdp-info{padding:20px 16px 40px}
          .pdp-main-img-wrap{height:300px;flex:none}
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
          .charm-selector{padding:16px 14px 14px}
          .charm-count-btn{width:34px;height:34px;font-size:12px;border-radius:8px}
          .charm-selector::before{display:none}
          .charm-selected-tag{max-width:100px}
        }

        /* ════ VERY SMALL ════ */
        @media(max-width:380px){
          .pdp-main-img-wrap{height:260px}
          .pdp-name{font-size:1.7rem}
          .pdp-cta-row{grid-template-columns:1fr}
          .pdp-btn-buy{grid-column:unset}
          .ctl-card{flex:0 0 118px;height:160px}
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
              <img key={displayImg} className="pdp-main-img" src={displayImg} alt={productName} />
              <span className="pdp-badge">Best Seller</span>
              <button className={`pdp-wish${wished ? ' on' : ''}`} onClick={handleWishToggle} aria-label="Wishlist">
                <svg width="18" height="18" viewBox="0 0 24 24" fill={wished ? 'var(--beige)' : 'none'} stroke={wished ? 'none' : 'var(--olive-600)'} strokeWidth="1.8">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </button>
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

          {/* ── Info ── */}
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

            <div className="pdp-price-row">
              <span className="pdp-price">₹{totalCharmPrice.toLocaleString('en-IN')}</span>
              {(discountedPrice || originalPrice) && (
                <>
                  <span className="pdp-original">₹{totalCharmOriginalPrice.toLocaleString('en-IN')}</span>
                  <span className="pdp-discount">{discount}% off</span>
                </>
              )}
            </div>
            {selectedCharmCount > 0 && (
              <p style={{ marginBottom: 18, fontSize: 11, color: 'var(--mist)', letterSpacing: '.04em' }}>
                ₹{unitCharmPrice.toLocaleString('en-IN')} each × {selectedCharmCount} pieces
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
                    <button key={c.hex} type="button" className="pdp-swatch-btn" onClick={() => handleColorChange(i)} title={c.label}>
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

            {description && <p className="pdp-desc">{description}</p>}

            {tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                {tags.map((tag: string) => (
                  <span key={tag} style={{ fontSize: 10, fontWeight: 500, letterSpacing: '.08em', textTransform: 'lowercase', color: 'var(--olive-600)', background: 'var(--olive-50)', border: '1px solid rgba(61,74,34,.12)', padding: '3px 10px', borderRadius: 50 }}>#{tag}</span>
                ))}
              </div>
            )}

            <div className="pdp-divider" />

            {/* ══════════════════════════════════════
                CHARM SELECTOR — key new feature
            ══════════════════════════════════════ */}
            <div className="charm-selector">
              <div className="charm-selector-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                Build Your Charm Combination
              </div>
              <p className="charm-selector-sub">
                Pick how many charms you'd like, then choose each one individually. You can mix initials, symbols, birthstones, and more.
              </p>
              <CharmSelector onChange={handleCharmChange} charmPieceOptions={product.charmPieceOptions} totalCharms={product.totalCharms} />
            </div>

            <div className="pdp-divider" />

            {/* Customisation */}
            {isCustomisable && (
              <>
                <div className="pdp-cust-banner">
                  <div className="pdp-cust-banner-head">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                    Make it Yours — Customise this {category}
                  </div>
                  <p className="pdp-cust-banner-sub">
                    This {category.toLowerCase()} can be personalised with your own photos, names, or a special message.
                  </p>
                  <CustomisationPanel category={category} onChange={setCustomData} />
                </div>
                <div className="pdp-divider" />
              </>
            )}

            {/* Quantity */}
            <p className="pdp-section-label" style={{ marginBottom: 10 }}>Quantity</p>
            <div className="pdp-qty-row">
              <div className="pdp-qty">
                <button className="pdp-qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                <span className="pdp-qty-val">{qty}</span>
                <button className="pdp-qty-btn" onClick={() => setQty(q => Math.min(stock || 99, q + 1))}>+</button>
              </div>
              {currentStock > 0 && <span className="pdp-stock">Only {currentStock} left in stock!</span>}
            </div>

            <div className="pdp-divider" />
            <CompleteTheLookStrip />
            <div className="pdp-divider" />
            <GiftMessagePanel value={giftMessage} onChange={setGiftMessage} />
            <div className="pdp-divider" />

            {/* CTA */}
            <div className="pdp-cta-row">
              <button className={`pdp-btn-wish${wished ? ' on' : ''}`} onClick={handleWishToggle}>
                <svg viewBox="0 0 24 24" fill={wished ? 'var(--beige)' : 'none'} stroke={wished ? 'none' : 'currentColor'} strokeWidth="1.8" width="16" height="16">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                {wished ? 'Wished' : 'Wishlist'}
              </button>
              <div className="pdp-btn-cart-wrap">
                <button ref={cartBtnRef} className={`pdp-btn-cart${cartAnim ? ' bounce' : ''}`} onClick={handleAddToCart}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                  {cartAnim ? 'Added! ✓' : 'Add to Cart'}
                </button>
                <Sparkles active={sparkleAnim} />
              </div>
              <button className="pdp-btn-buy" onClick={handleBuyNow}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                Buy It Now
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

        <ReviewsSection />
      </div>
    </>
  );
}
