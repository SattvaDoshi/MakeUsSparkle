

'use client';
import { useRouter } from 'next/navigation';
import { useState, useRef, useCallback, useEffect, type ChangeEvent, type DragEvent } from 'react';
import { ALL_PRODUCTS } from './ProductPage'; // adjust path if needed
import { useCart } from '@/lib/cartContext';
import { fireConfetti } from '@/components/cart/ConfettiManager';
import { useWishlist } from '@/lib/wishlistContext';

import UpperNav from '@/components/ui/UpperNav';

interface AccordionData {
  id: string;
  emoji: string;
  label: string;
  content: string;
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

interface ProductDetailsProduct {
  id: number;
  name: string;
  category: string;
  rating: number;
  reviewCount: number;
  description: string;
  price: number;
  originalPrice?: number | null;
  offer: string;
  sku: string;
  stock: number;
  images: string[] | Record<string, string[]>;
  colors: ProductColor[];
  href: string;
  badge?: string | null;
}

// ─── Categories that support customisation ────────────────────────────────────
const CUSTOMISABLE_CATEGORIES = ['Gift Boxes', 'Fan Box', 'Key Chain/Charm'];

// ─── CHANGE 3: Updated trust badges ──────────────────────────────────────────
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
// ─── Reviews Data ─────────────────────────────────────────────────────────────
const REVIEWS_DATA = [
  {
    id: 1,
    name: 'Priya Sharma',
    initials: 'PS',
    rating: 5,
    date: '12 Apr 2025',
    title: 'Absolutely stunning piece!',
    body: 'I gifted this to my sister and she was in tears. The quality is exceptional — it looks far more expensive than it actually is. The packaging was gorgeous too. Will definitely be ordering again.',
    verified: true,
    helpful: 24,
    colorHex: '#c9a84c',
  },
  {
    id: 2,
    name: 'Anika Reddy',
    initials: 'AR',
    rating: 5,
    date: '3 Apr 2025',
    title: 'Perfect everyday necklace',
    body: 'Wore it every day for a month and it still looks brand new. The layered design is so elegant and gets so many compliments. Highly recommend for anyone looking for something that looks luxe but is affordable.',
    verified: true,
    helpful: 18,
    colorHex: '#5a6b2e',
  },
  {
    id: 3,
    name: 'Meera Joshi',
    initials: 'MJ',
    rating: 4,
    date: '28 Mar 2025',
    title: 'Beautiful but clasp is slightly fiddly',
    body: 'The necklace itself is gorgeous — love the delicate layered look. My only minor complaint is the lobster clasp is a tiny bit tricky to fasten solo. Once on though, it stays perfectly and looks stunning.',
    verified: true,
    helpful: 11,
    colorHex: '#3d4a22',
  },
  {
    id: 4,
    name: 'Divya Nair',
    initials: 'DN',
    rating: 5,
    date: '19 Mar 2025',
    title: 'Fast delivery, premium quality',
    body: 'Ordered on a whim and received it in 2 days. The moment I opened the box I knew it was worth every rupee. The gold plating is even and the chains lay perfectly. Zero tarnishing so far.',
    verified: false,
    helpful: 8,
    colorHex: '#c9a84c',
  },
  {
    id: 5,
    name: 'Roshni Kapoor',
    initials: 'RK',
    rating: 5,
    date: '10 Mar 2025',
    title: 'My go-to jewellery shop now',
    body: 'Third order from Maison and they never disappoint. This layered necklace is my favourite so far. It transitions effortlessly from casual daywear to evenings. The rose gold variant I got is dreamy.',
    verified: true,
    helpful: 31,
    colorHex: '#7a8e3c',
  },
];

const RATING_DISTRIBUTION = [
  { stars: 5, count: 148, pct: 74 },
  { stars: 4, count: 32, pct: 16 },
  { stars: 3, count: 12, pct: 6 },
  { stars: 2, count: 4, pct: 2 },
  { stars: 1, count: 4, pct: 2 },
];

const OVERALL_RATING = 4.8;
const TOTAL_REVIEWS = 200;

// ─── Reviews Section ──────────────────────────────────────────────────────────
function ReviewsSection() {
const [visibleCount, setVisibleCount] = useState(3);
const [filterStar, setFilterStar] = useState<number | null>(null);

const filtered = REVIEWS_DATA.filter(r => filterStar === null || r.rating === filterStar);
const visible = filtered.slice(0, visibleCount);
const hasMore = visibleCount < filtered.length; 

  return (
    <div className="rev-section">
      {/* Header */}
      <div className="rev-header">
        <div className="rev-header-line" />
        <div className="rev-header-text">
          <span className="rev-eyebrow">Customer Stories</span>
          <h2 className="rev-title">What people are saying</h2>
        </div>
        <div className="rev-header-line" />
      </div>

      {/* Summary */}
      <div className="rev-summary">
        <div className="rev-summary-score">
          <span className="rev-big-num">{OVERALL_RATING}</span>
          <div className="rev-big-stars">
            {'★'.repeat(Math.round(OVERALL_RATING))}{'☆'.repeat(5 - Math.round(OVERALL_RATING))}
          </div>
          <span className="rev-total-cnt">Based on {TOTAL_REVIEWS} reviews</span>
        </div>
        <div className="rev-bars">
          {RATING_DISTRIBUTION.map(d => (
            <button
              key={d.stars}
              className={`rev-bar-row${filterStar === d.stars ? ' rev-bar-row--active' : ''}`}
              onClick={() => setFilterStar(filterStar === d.stars ? null : d.stars)}
            >
              <span className="rev-bar-label">{d.stars}★</span>
              <div className="rev-bar-track">
                <div className="rev-bar-fill" style={{ width: `${d.pct}%` }} />
              </div>
              <span className="rev-bar-count">{d.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="rev-controls">
        {filterStar !== null && (
          <button className="rev-clear-filter" onClick={() => setFilterStar(null)}>
            Showing {filterStar}★ only &nbsp;×
          </button>
        )}
     
      </div>

      {/* No results */}
      {visible.length === 0 && (
        <p className="rev-empty">No reviews match this filter. <button className="rev-clear-link" onClick={() => setFilterStar(null)}>Clear filter</button></p>
      )}

      {/* Review cards */}
      <div className="rev-list">
        {visible.map((r, i) => (
          <div key={r.id} className="rev-card" style={{ animationDelay: `${i * 0.07}s` }}>
            <div className="rev-card-top">
              <div className="rev-avatar" style={{ background: r.colorHex + '22', color: r.colorHex }}>
                {r.initials}
              </div>
              <div className="rev-meta">
                <div className="rev-meta-row">
                  <span className="rev-name">{r.name}</span>
                  {r.verified && (
                    <span className="rev-verified">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      Verified purchase
                    </span>
                  )}
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

      {/* Load more */}
      {hasMore && (
        <div className="rev-load-wrap">
          <button className="rev-load-btn" onClick={() => setVisibleCount(v => v + 3)}>
            Show more reviews
          </button>
        </div>
      )}
    </div>
  );
}
// ─── CHANGE 2: "Goes Well With" recommendation data ───────────────────────────
const GOES_WELL_WITH = [
  {
    id: 1,
    name: 'Pearl Drop Earrings',
    price: 899,
    originalPrice: 1299,
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&q=80',
    href: '/products/pearl-drop-earrings',
  },
  {
    id: 2,
    name: 'Delicate Gold Bracelet',
    price: 1199,
    originalPrice: 1699,
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&q=80',
    href: '/products/gold-bracelet',
  },
  {
    id: 3,
    name: 'Twisted Ring Set',
    price: 749,
    originalPrice: 999,
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&q=80',
    href: '/products/twisted-ring-set',
  },
  {
    id: 4,
    name: 'Charm Anklet',
    price: 649,
    originalPrice: 849,
    image: 'https://images.unsplash.com/photo-1573408301185-9519f94e84dd?w=400&q=80',
    href: '/products/charm-anklet',
  },
];

// ─── Accordion data ───────────────────────────────────────────────────────────
const ACCORDION_ITEMS: AccordionData[] = [
  { id: 'about',    emoji: '💎', label: 'About the Product',    content: `This necklace is crafted from high-quality brass with an 18k gold plating for long-lasting shine. The delicate layered design features three chains at lengths 16", 18" and 20", each finishing with a hand-set micro-charm. Hypoallergenic and nickel-free. Suitable for daily wear.` },
  { id: 'desc',     emoji: '📄', label: 'Product Description',  content: `• Material: Brass with 18k gold / rhodium / rose-gold plating\n• Chain lengths: 16" · 18" · 20"\n• Clasp: Lobster claw\n• Width: 1–1.5 mm per strand\n• Weight: ~4.2 g\n• Finish: Tarnish-resistant coating\n• Packaging: Premium gift box included` },
  { id: 'cancel',   emoji: '↩️', label: 'Cancellation Policy',  content: `Orders can be cancelled free of charge within 24 hours of placing. After 24 hours, cancellations are not accepted once the order is dispatched. For damaged or wrong items received, contact us within 48 hours of delivery for a hassle-free replacement or full refund.` },
  { id: 'shipping', emoji: '🚚', label: 'Shipping & Returns',   content: `STANDARD DELIVERY (3–5 business days) — ₹60 delivery charge. Free on orders above ₹999.\nEXPRESS DELIVERY (2–3 business days) — ₹120 delivery charge. No COD available on express orders.\n\nReturns accepted within 7 days of delivery. Item must be unused, unworn, and in original packaging. Reverse pickup is free for damaged/wrong items.` },
  { id: 'faq',      emoji: '❓', label: 'FAQs',                 content: `Q: Will the gold plating fade?\nA: With proper care (avoid water, perfume, sweat) plating lasts 12–18 months.\n\nQ: Is it suitable for sensitive skin?\nA: Yes — nickel-free and hypoallergenic.\n\nQ: Can I resize the necklace?\nA: The lobster clasp allows 2" of length adjustment.\n\nQ: How do I clean it?\nA: Wipe gently with a dry microfibre cloth. Store in the provided box.` },
];

// ─── Sparkles ─────────────────────────────────────────────────────────────────
function Sparkles({ active }: { active: boolean }) {
  if (!active) return null;
  const pts = Array.from({ length: 10 }, (_, i) => {
    const angle = (i / 10) * 360;
    const dist  = 30 + Math.random() * 24;
    return {
      x: Math.cos((angle * Math.PI) / 180) * dist,
      y: Math.sin((angle * Math.PI) / 180) * dist,
      size: 4 + Math.random() * 5,
      delay: Math.random() * 0.15,
    };
  });
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10 }}>
      {pts.map((p, i) => (
        <div key={i} style={{ position: 'absolute', left: '50%', top: '50%', width: p.size, height: p.size, borderRadius: '50%', background: 'var(--gold)', transform: `translate(${p.x}px,${p.y}px)`, animation: 'sparkle 0.55s ease forwards', animationDelay: `${p.delay}s`, opacity: 0 }} />
      ))}
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
          {item.content.split('\n').map((line: string, i: number) => <p key={i} style={{ marginBottom: line === '' ? 8 : 0 }}>{line || '\u00A0'}</p>)}
        </div>
      </div>
    </div>
  );
}

// ─── ✨ Customisation Panel ───────────────────────────────────────────────────
function CustomisationPanel({ category }: { category: string }) {
  const [wantCustom, setWantCustom] = useState<boolean | null>(null);
  const [uploads, setUploads]       = useState<UploadItem[]>([]);
  const [globalNote, setGlobalNote] = useState('');
  const [dragOver, setDragOver]     = useState(false);
  const fileInputRef                = useRef<HTMLInputElement | null>(null);
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
          <textarea
            className="cust-note-global"
            placeholder={`Add a personal message or customisation note for your ${catLabel} (e.g. "Write 'Happy Birthday Sarah' on the tag")…`}
            value={globalNote}
            onChange={e => setGlobalNote(e.target.value)}
            rows={3}
          />
          {uploads.length < MAX_FILES && (
            <div
              className={`cust-drop${dragOver ? ' drag-over' : ''}`}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={(e: ChangeEvent<HTMLInputElement>) => { if (e.currentTarget.files) addFiles(e.currentTarget.files); }} />
              <div style={{ width: 44, height: 44, margin: '0 auto 10px', color: 'var(--olive-400)' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}>
                  <rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                </svg>
              </div>
              <p className="cust-drop-title">Upload your photos</p>
              <p className="cust-drop-sub">Drag &amp; drop here, or click to browse<br/>JPG · PNG · WEBP · HEIC &nbsp;·&nbsp; Max 10 MB each</p>
              <span className="cust-drop-btn">Choose Photos</span>
            </div>
          )}
          <p className={`cust-limit${uploads.length >= MAX_FILES ? ' warn' : ''}`}>
            {uploads.length}/{MAX_FILES} photos{uploads.length >= MAX_FILES ? ' — limit reached' : ' uploaded'}
          </p>
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

// ─── CHANGE 2: Goes Well With Section ────────────────────────────────────────
function GoesWellWithSection() {
  return (
    <div className="gww-section">
      <div className="gww-header">
        <div className="gww-header-line" />
        <div className="gww-header-text">
          <span className="gww-eyebrow">Complete the Look</span>
          <h2 className="gww-title">Pairs beautifully with</h2>
        </div>
        <div className="gww-header-line" />
      </div>
      <div className="gww-grid">
        {GOES_WELL_WITH.map((item, i) => {
          const disc = Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100);
          return (
            <a key={item.id} href={item.href} className="gww-card" style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="gww-img-wrap">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image} alt={item.name} className="gww-img" />
                <span className="gww-disc-badge">{disc}% off</span>
              </div>
              <div className="gww-card-info">
                <p className="gww-card-name">{item.name}</p>
                <div className="gww-card-price-row">
                  <span className="gww-card-price">₹{item.price.toLocaleString('en-IN')}</span>
                  <span className="gww-card-original">₹{item.originalPrice.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ProductDetailPage({ slug }: { slug: string }) {
  const router = useRouter();
  const product = ALL_PRODUCTS.find(p => p.href === `/products/${slug}`) as ProductDetailsProduct | undefined;
  if (!product) return <div style={{ padding: 40, fontFamily: 'sans-serif' }}>Product not found</div>;
  const { addItem } = useCart();
  const { name, category, rating, reviewCount, description, price, originalPrice, offer, sku, stock, images, colors } = product;

  const [activeColor,   setActiveColor]   = useState(0);
  const [activeImg,     setActiveImg]     = useState(0);
  const [shipping,      setShipping]      = useState('standard');
  const [payment,       setPayment]       = useState('prepaid');
  const [qty,           setQty]           = useState(1);
  const { toggleItem, isWished } = useWishlist();
  const wished = isWished(product.id);
  const [cartAnim,      setCartAnim]      = useState(false);
  const [sparkleAnim,   setSparkleAnim]   = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>('about');
  const cartBtnRef = useRef<HTMLButtonElement | null>(null);

  const isCustomisable = CUSTOMISABLE_CATEGORIES.some(c => category?.toLowerCase().includes(c.toLowerCase()));

  const currentColorHex = colors?.[activeColor]?.hex;
  const currentImages   = Array.isArray(images) ? images : (images?.[currentColorHex] || images?.[colors?.[0]?.hex] || []);
  const displayImg      = currentImages?.[activeImg] || currentImages?.[0] || '';
  const discount        = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  const deliveryCharge  = shipping === 'express' ? 120 : (price >= 999 ? 0 : 60);
  const codCharge       = payment === 'cod' && shipping !== 'express' ? 70 : 0;
  const totalPrice      = (price + deliveryCharge + codCharge) * qty;

  const wishlistItem = {
    id: product.id,
    name: product.name,
    price: product.price,
    originalPrice: product.originalPrice ?? null,
    image: displayImg,
    category: product.category,
    href: product.href,
    colors: product.colors,
    badge: product.badge ?? null,
    rating: product.rating,
    reviewCount: product.reviewCount,
  };

  const handleWishToggle = useCallback(() => {
    toggleItem(wishlistItem);
  }, [toggleItem, product, displayImg]);

  const handleBuyNow = useCallback(() => {
    const cartItem = {
      id: String(product.id),
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice ?? null,
      image: displayImg,
      color: colors[activeColor].label,
      colorHex: colors[activeColor].hex,
      sku: product.sku,
      href: product.href,
    };
    for (let i = 0; i < qty; i++) addItem(cartItem, false);
    router.push('/cart');
  }, [addItem, product, displayImg, colors, activeColor, qty, router]);

  const handleAddToCart = useCallback(() => {
    const cartItem = {
      id: String(product.id),
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice ?? null,
      image: displayImg,
      color: colors[activeColor].label,
      colorHex: colors[activeColor].hex,
      sku: product.sku,
      href: product.href,
    };
    for (let i = 0; i < qty; i++) addItem(cartItem);
    fireConfetti(cartBtnRef.current);
    setCartAnim(true);
    setSparkleAnim(true);
    setTimeout(() => setCartAnim(false), 700);
    setTimeout(() => setSparkleAnim(false), 800);
  }, [addItem, product, displayImg, colors, activeColor, qty]);

  const handleColorChange = useCallback((i: number) => { setActiveColor(i); setActiveImg(0); }, []);

  useEffect(() => { if (shipping === 'express') setPayment('prepaid'); }, [shipping]);

  return (
    <>
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

        /* ── Layout ── */
        .pdp-layout{display:grid;grid-template-columns:1fr 1fr;gap:0;max-width:1280px;margin:0 auto}

        /* ── Gallery ── */
        .pdp-gallery{
          position: sticky; top: 80px; height: calc(100vh - 80px);
          padding:32px 28px 32px 52px;
          display:flex;flex-direction:column;gap:14px;
          animation:fadeUp .6s ease both;
          min-width:0;overflow:hidden;
        }
        .pdp-main-img-wrap{
          flex:1;
          min-height:0;
          background:var(--beige-dk);border-radius:24px;overflow:hidden;position:relative;
        }
        .pdp-main-img{width:100%;height:100%;object-fit:cover;animation:imgIn .4s ease both}
        .pdp-badge{position:absolute;top:16px;left:16px;font-size:9.5px;font-weight:600;letter-spacing:.1em;color:var(--beige);background:var(--olive-600);padding:5px 14px 4px;border-radius:50px}
        .pdp-wish{position:absolute;top:14px;right:14px;width:36px;height:36px;border-radius:50%;background:rgba(245,240,232,.9);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:transform .2s,background .2s}
        .pdp-wish:hover{transform:scale(1.1)}
        .pdp-wish.on{background:var(--olive-600)}
        .pdp-thumb-row{display:flex;gap:10px;flex-wrap:nowrap;overflow-x:auto;padding-bottom:2px}
        .pdp-thumb-row::-webkit-scrollbar{height:3px}
        .pdp-thumb-row::-webkit-scrollbar-thumb{background:var(--beige-dkr);border-radius:4px}
        .pdp-thumb{
          width:72px;height:72px;border-radius:12px;overflow:hidden;
          cursor:pointer;flex-shrink:0;
          border:2px solid transparent;transition:border-color .2s,transform .2s;
        }
        .pdp-thumb:hover{transform:scale(1.06)}
        .pdp-thumb.active{border-color:var(--olive-500)}
        .pdp-thumb img{width:100%;height:100%;object-fit:cover}

        /* ── Info panel ── */
        .pdp-info{padding:32px 52px 40px 28px;animation:fadeUp .6s ease .1s both;overflow-y:auto}

        /* CHANGE 1: Removed pdp-eyebrow styles that showed category — kept for potential reuse */
        .pdp-name{font-family:'Cormorant Garamond',serif;font-size:clamp(1.9rem,3.5vw,2.8rem);font-weight:400;line-height:1.1;letter-spacing:-.01em;color:var(--olive-900);margin-bottom:10px}
        .pdp-name em{font-style:italic;color:var(--olive-600)}
        .pdp-rating{display:flex;align-items:center;gap:6px;margin-bottom:14px}
        .pdp-stars{color:var(--gold);font-size:13px;letter-spacing:1px}
        .pdp-rating-num{font-size:12px;font-weight:600;color:var(--olive-600)}
        .pdp-review-cnt{font-size:11px;color:var(--mist)}

        /* ── Offer chip ── */
        .pdp-offer{background:linear-gradient(135deg,rgba(201,168,76,.12),rgba(90,110,35,.1));border:1px solid rgba(201,168,76,.28);border-radius:10px;padding:10px 16px;margin-bottom:18px;display:flex;align-items:center;gap:10px}
        .pdp-offer-icon{font-size:16px}
        .pdp-offer-text{font-size:11px;font-weight:500;letter-spacing:.04em;color:#8c6b20}

        /* ── Price ── */
        .pdp-price-row{display:flex;align-items:baseline;gap:12px;margin-bottom:8px;flex-wrap:wrap}
        .pdp-price{font-family:'Jost',serif;font-size:1.8rem;font-weight:600;letter-spacing:-.01em;color:var(--olive-900)}
        .pdp-original{font-size:15px;font-weight:400;color:var(--mist);text-decoration:line-through}
        .pdp-discount{font-size:11px;font-weight:700;letter-spacing:.06em;color:var(--beige);background:var(--olive-500);padding:3px 9px;border-radius:4px;text-transform:uppercase}
        .pdp-tax{font-size:10px;color:var(--mist);margin-bottom:20px;letter-spacing:.04em}

        .pdp-divider{height:1px;background:linear-gradient(90deg,rgba(61,74,34,.1),rgba(201,168,76,.2),rgba(61,74,34,.1));margin:20px 0}
        .pdp-section-label{font-size:9.5px;letter-spacing:.38em;text-transform:uppercase;color:var(--mist);margin-bottom:10px;font-weight:500}
        .pdp-section-label span{color:var(--olive-600);font-weight:600}

        /* ── Swatches ── */
        .pdp-swatches{display:flex;gap:10px;margin-bottom:20px;flex-wrap:wrap}
        .pdp-swatch-btn{display:flex;flex-direction:column;align-items:center;gap:5px;background:none;border:none;cursor:pointer;padding:0}
        .pdp-swatch{width:28px;height:28px;border-radius:50%;border:2.5px solid transparent;transition:transform .2s,box-shadow .2s}
        .pdp-swatch:hover{transform:scale(1.15)}
        .pdp-swatch.active{box-shadow:0 0 0 2px var(--beige),0 0 0 4px var(--olive-500)}
        .pdp-swatch-label{font-size:8px;letter-spacing:.06em;color:var(--mist);white-space:nowrap}

        .pdp-desc{font-size:13px;font-weight:300;line-height:1.85;color:var(--mist);letter-spacing:.03em;margin-bottom:20px}

        /* ── Quantity ── */
        .pdp-qty-row{display:flex;align-items:center;gap:14px;margin-bottom:20px}
        .pdp-qty{display:flex;align-items:center;border:1.5px solid var(--beige-dkr);border-radius:50px;overflow:hidden}
        .pdp-qty-btn{width:36px;height:36px;background:none;border:none;font-size:18px;cursor:pointer;color:var(--olive-600);display:flex;align-items:center;justify-content:center;transition:background .15s}
        .pdp-qty-btn:hover{background:var(--olive-50)}
        .pdp-qty-val{min-width:36px;text-align:center;font-size:13px;font-weight:600;color:var(--ink)}
        .pdp-stock{font-size:10.5px;font-weight:500;letter-spacing:.06em;color:var(--red);animation:stockPulse 2.2s ease-in-out infinite}

        /* ── Shipping ── */
        .pdp-ship-row{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px}
        .pdp-ship-opt{border:1.5px solid var(--beige-dkr);border-radius:14px;padding:13px 14px;cursor:pointer;transition:border-color .2s,background .2s;text-align:left;background:white;position:relative;overflow:hidden}
        .pdp-ship-opt:hover{border-color:var(--olive-400);background:var(--olive-50)}
        .pdp-ship-opt.active{border-color:var(--olive-500);background:var(--olive-50);box-shadow:0 0 0 3px rgba(90,110,35,.1)}
        .pdp-ship-opt-head{display:flex;align-items:center;gap:7px;font-size:11px;font-weight:600;letter-spacing:.06em;color:var(--olive-600);margin-bottom:3px;text-transform:uppercase}
        .pdp-ship-opt-head svg{width:15px;height:15px}
        .pdp-ship-eta{font-size:10px;color:var(--mist);margin-bottom:3px}
        .pdp-ship-price{font-size:11px;font-weight:600;color:var(--ink)}
        .pdp-ship-note{font-size:9px;color:var(--mist);margin-top:3px;font-style:italic}
        .pdp-ship-badge{position:absolute;top:8px;right:10px;font-size:7.5px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--beige);background:var(--gold);padding:2px 7px;border-radius:3px}

        /* ── Payment ── */
        .pdp-pay-row{display:flex;gap:10px;margin-bottom:20px;flex-wrap:wrap}
        .pdp-pay-opt{flex:1;min-width:140px;border:1.5px solid var(--beige-dkr);border-radius:12px;padding:12px 14px;cursor:pointer;transition:all .2s;background:white;text-align:left}
        .pdp-pay-opt:hover{border-color:var(--olive-400);background:var(--olive-50)}
        .pdp-pay-opt.active{border-color:var(--olive-500);background:var(--olive-50);box-shadow:0 0 0 3px rgba(90,110,35,.1)}
        .pdp-pay-opt.disabled{opacity:.38;pointer-events:none;cursor:not-allowed}
        .pdp-pay-head{display:flex;align-items:center;gap:6px;font-size:11px;font-weight:600;letter-spacing:.06em;color:var(--olive-600);text-transform:uppercase;margin-bottom:3px}
        .pdp-pay-head svg{width:14px;height:14px}
        .pdp-pay-sub{font-size:10px;color:var(--mist)}
        .pdp-pay-extra{font-size:10px;font-weight:600;color:var(--red);margin-top:2px}

        /* ── Price summary ── */
        .pdp-summary{background:linear-gradient(135deg,var(--olive-50),var(--beige-dk));border:1px solid rgba(61,74,34,.1);border-radius:14px;padding:14px 18px;margin-bottom:20px}
        .pdp-summary-row{display:flex;justify-content:space-between;font-size:11.5px;color:var(--mist);margin-bottom:6px}
        .pdp-summary-row.total{border-top:1px solid rgba(61,74,34,.1);padding-top:8px;margin-top:4px;font-size:14px;font-weight:700;color:var(--ink)}
        .pdp-summary-row span:last-child{font-weight:500;color:var(--ink)}
        .pdp-summary-row.total span:last-child{font-weight:800;font-size:16px}

        /* ── CTA buttons ── */
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

        /* ── Trust badges — 3 col on desktop ── */
        .pdp-trust{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:28px}
        .pdp-trust-item{display:flex;flex-direction:column;align-items:center;text-align:center;padding:14px 8px;background:white;border:1px solid rgba(61,74,34,.07);border-radius:14px;transition:transform .2s,box-shadow .2s}
        .pdp-trust-item:hover{transform:translateY(-3px);box-shadow:0 8px 24px rgba(61,74,34,.1)}
        .pdp-trust-icon{width:40px;height:40px;color:var(--olive-500);margin-bottom:7px}
        .pdp-trust-title{font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--olive-600);margin-bottom:2px}
        .pdp-trust-sub{font-size:9px;color:var(--mist)}

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

        /* ── CHANGE 2: Goes Well With styles ── */
        .gww-section{
          max-width:1280px;margin:0 auto;
          padding:48px 52px 56px;
          background:var(--beige);
          border-top:1px solid rgba(61,74,34,.08);
        }
        .gww-header{
          display:flex;align-items:center;gap:20px;
          margin-bottom:32px;
        }
        .gww-header-line{flex:1;height:1px;background:linear-gradient(90deg,transparent,rgba(201,168,76,.3),transparent)}
        .gww-header-text{text-align:center;flex-shrink:0}
        .gww-eyebrow{display:block;font-size:9px;letter-spacing:.5em;text-transform:uppercase;color:var(--gold);margin-bottom:6px}
        .gww-title{font-family:'Cormorant Garamond',serif;font-size:clamp(1.4rem,2.5vw,2rem);font-weight:300;color:var(--olive-900);letter-spacing:.02em;font-style:italic}
        .gww-grid{
          display:grid;
          grid-template-columns:repeat(4,1fr);
          gap:16px;
        }
        .gww-card{
          text-decoration:none;color:inherit;
          display:flex;flex-direction:column;
          border-radius:20px;overflow:hidden;
          background:white;
          border:1px solid rgba(61,74,34,.07);
          transition:transform .25s,box-shadow .25s;
          animation:fadeUp .5s ease both;
        }
        .gww-card:hover{transform:translateY(-5px);box-shadow:0 16px 40px rgba(61,74,34,.12)}
        .gww-img-wrap{position:relative;aspect-ratio:1;overflow:hidden;background:var(--beige-dk)}
        .gww-img{width:100%;height:100%;object-fit:cover;transition:transform .4s ease}
        .gww-card:hover .gww-img{transform:scale(1.06)}
        .gww-disc-badge{
          position:absolute;top:10px;right:10px;
          font-size:8.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;
          color:var(--beige);background:var(--olive-500);
          padding:3px 9px;border-radius:50px;
        }
        .gww-card-info{padding:14px 14px 16px}
        .gww-card-name{
          font-size:12px;font-weight:500;letter-spacing:.03em;
          color:var(--ink);margin-bottom:7px;
          line-height:1.4;
        }
        .gww-card-price-row{display:flex;align-items:baseline;gap:8px}
        .gww-card-price{font-size:14px;font-weight:700;color:var(--olive-900)}
        .gww-card-original{font-size:11px;color:var(--mist);text-decoration:line-through}

        /* ════════════════════════════════════════════
           TABLET  (≤ 960px)
        ════════════════════════════════════════════ */
        @media(max-width:960px){
          .pdp-layout{grid-template-columns:1fr}
          .pdp-gallery{
            position:static;height:auto;
            padding:24px 24px 0;
          }
          .pdp-main-img-wrap{
            height:420px;
            flex:none;
          }
          .pdp-info{padding:24px 24px 48px}
          /* Trust badges stay 3-col on tablet */
          .pdp-trust{grid-template-columns:repeat(3,1fr)}
          /* Goes well with — 2 cols on tablet */
          .gww-section{padding:40px 24px 48px}
          .gww-grid{grid-template-columns:repeat(2,1fr);gap:12px}
        }

        /* ════════════════════════════════════════════
           MOBILE  (≤ 600px)
        ════════════════════════════════════════════ */
        @media(max-width:600px){
          .pdp-gallery{padding:16px 16px 0}
          .pdp-info{padding:20px 16px 40px}

          .pdp-main-img-wrap{
            height:300px;
            flex:none;
          }

          /* ── Offer chip: show BELOW price on mobile ── */
          .pdp-info-top{display:flex;flex-direction:column}
          .pdp-offer{order:5;margin-top:10px;margin-bottom:0}
          .pdp-price-row{order:3;margin-bottom:4px}
          .pdp-tax{order:4;margin-bottom:12px}

          /* ── Trust badges: 3-col scrollable on mobile ── */
          .pdp-trust{
            grid-template-columns:repeat(3,minmax(80px,1fr));
            gap:7px;
            overflow-x:auto;
            padding-bottom:4px;
            -webkit-overflow-scrolling:touch;
            scrollbar-width:none;
          }
          .pdp-trust::-webkit-scrollbar{display:none}
          .pdp-trust-item{
            padding:10px 6px;
            border-radius:12px;
            min-width:80px;
          }
          .pdp-trust-icon{width:28px;height:28px;margin-bottom:5px}
          .pdp-trust-title{font-size:8.5px;letter-spacing:.03em}
          .pdp-trust-sub{font-size:7.5px}

          /* ── CTA layout ── */
          .pdp-cta-row{grid-template-columns:1fr 1fr}

          /* ── Shipping opts stack ── */
          .pdp-ship-row{grid-template-columns:1fr}

          /* ── Payment opts wrap ── */
          .pdp-pay-row{flex-direction:column}
          .pdp-pay-opt{min-width:unset}

          /* ── Accordion body indentation ── */
          .acc-body{padding:2px 4px 14px 26px}

          /* ── Goes Well With: 2-col on mobile ── */
          .gww-section{padding:32px 16px 40px}
          .gww-grid{grid-template-columns:repeat(2,1fr);gap:10px}
          .gww-header{gap:12px}
          .gww-title{font-size:1.3rem}
        }

        /* ════════════════════════════════════════════
           VERY SMALL  (≤ 380px)
        ════════════════════════════════════════════ */
        @media(max-width:380px){
          .pdp-main-img-wrap{height:260px}
          .pdp-name{font-size:1.7rem}
          .pdp-cta-row{grid-template-columns:1fr}
          .pdp-btn-buy{grid-column:unset}
          .gww-grid{grid-template-columns:repeat(2,1fr);gap:8px}
        }
          /* ── Reviews Section ── */
.rev-section{
  max-width:1280px;margin:0 auto;
  padding:48px 52px 56px;
  background:var(--beige);
  border-top:1px solid rgba(61,74,34,.08);
}
.rev-header{
  display:flex;align-items:center;gap:20px;
  margin-bottom:36px;
}
.rev-header-line{flex:1;height:1px;background:linear-gradient(90deg,transparent,rgba(201,168,76,.3),transparent)}
.rev-header-text{text-align:center;flex-shrink:0}
.rev-eyebrow{display:block;font-size:9px;letter-spacing:.5em;text-transform:uppercase;color:var(--gold);margin-bottom:6px}
.rev-title{font-family:'Cormorant Garamond',serif;font-size:clamp(1.4rem,2.5vw,2rem);font-weight:300;color:var(--olive-900);letter-spacing:.02em;font-style:italic}

/* Summary */
/* Summary */
.rev-summary{
  display:grid;grid-template-columns:220px 1fr;gap:0;
  background:white;
  border:1px solid rgba(61,74,34,.09);border-radius:18px;
  overflow:hidden;margin-bottom:24px;
}
.rev-summary-score{
  background:linear-gradient(160deg,var(--olive-900),var(--olive-600));
  padding:28px 24px;display:flex;flex-direction:column;
  align-items:center;justify-content:center;gap:6px;
}
.rev-big-num{
  font-family:'Cormorant Garamond',serif;
  font-size:4.2rem;font-weight:600;color:#f5f0e8;line-height:1;
  letter-spacing:-.02em;
}
.rev-big-stars{font-size:16px;color:var(--gold);letter-spacing:3px}
.rev-total-cnt{font-size:9px;letter-spacing:.18em;text-transform:uppercase;color:rgba(245,240,232,.5);margin-top:2px}
.rev-bars{display:flex;flex-direction:column;gap:6px;padding:20px 24px;justify-content:center}
.rev-bar-row{
  display:flex;align-items:center;gap:10px;
  background:none;border:none;cursor:pointer;padding:3px 6px;
  border-radius:8px;transition:background .15s;text-align:left;
}
.rev-bar-row:hover{background:rgba(61,74,34,.05)}
.rev-bar-row--active{background:rgba(201,168,76,.1)}
.rev-bar-label{font-size:11px;font-weight:600;color:var(--olive-600);min-width:22px;text-align:right}
.rev-bar-track{flex:1;height:6px;background:var(--beige-dkr);border-radius:50px;overflow:hidden}
.rev-bar-fill{height:100%;background:linear-gradient(90deg,var(--gold),var(--olive-400));border-radius:50px;transition:width .4s ease}
.rev-bar-count{font-size:10px;color:var(--mist);min-width:24px}

/* Controls — filter chip only, sort tabs removed */
.rev-controls{display:flex;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:20px}
.rev-clear-filter{
  font-size:11px;font-weight:600;letter-spacing:.06em;
  color:var(--gold);background:rgba(201,168,76,.1);
  border:1px solid rgba(201,168,76,.3);border-radius:50px;
  padding:6px 14px;cursor:pointer;transition:all .2s;font-family:'Jost',sans-serif;
}
.rev-clear-filter:hover{background:rgba(201,168,76,.2)}



.rev-sort-tabs{display:flex;background:var(--beige-dk);border-radius:50px;padding:3px;gap:3px}
.rev-sort-tab{
  font-size:11px;font-weight:500;letter-spacing:.04em;color:var(--mist);
  background:none;border:none;border-radius:50px;padding:7px 16px;cursor:pointer;
  transition:all .2s;font-family:'Jost',sans-serif;
}
.rev-sort-tab.active{background:white;color:var(--olive-600);font-weight:600;box-shadow:0 1px 4px rgba(61,74,34,.1)}

/* Empty */
.rev-empty{font-size:13px;color:var(--mist);text-align:center;padding:32px 0}
.rev-clear-link{background:none;border:none;color:var(--gold);font-size:13px;cursor:pointer;text-decoration:underline;font-family:'Jost',sans-serif}

/* Cards */
.rev-list{display:flex;flex-direction:column;gap:16px}
.rev-card{
  background:white;border:1px solid rgba(61,74,34,.07);border-radius:18px;
  padding:22px 24px;animation:fadeUp .45s ease both;
  transition:box-shadow .2s;
}
.rev-card:hover{box-shadow:0 8px 28px rgba(61,74,34,.09)}
.rev-card-top{display:flex;align-items:flex-start;gap:14px;margin-bottom:14px}
.rev-avatar{
  width:42px;height:42px;border-radius:50%;flex-shrink:0;
  display:flex;align-items:center;justify-content:center;
  font-size:12px;font-weight:700;letter-spacing:.05em;
}
.rev-meta{flex:1}
.rev-meta-row{display:flex;align-items:center;flex-wrap:wrap;gap:8px}
.rev-name{font-size:13px;font-weight:600;color:var(--ink);letter-spacing:.02em}
.rev-verified{
  display:flex;align-items:center;gap:4px;
  font-size:9.5px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;
  color:var(--olive-500);
}
.rev-stars-sm{font-size:12px;color:var(--gold);letter-spacing:1px}
.rev-date{font-size:10.5px;color:var(--mist)}
.rev-card-title{font-size:14px;font-weight:600;color:var(--ink);margin-bottom:8px;letter-spacing:.02em}
.rev-card-body{font-size:12.5px;font-weight:300;color:var(--mist);line-height:1.85;letter-spacing:.03em;margin-bottom:16px}
.rev-card-foot{display:flex;align-items:center;gap:10px;border-top:1px solid rgba(61,74,34,.07);padding-top:12px}
.rev-helpful-label{font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--mist)}
.rev-helpful-btn{
  display:flex;align-items:center;gap:5px;
  font-size:11px;font-weight:600;color:var(--olive-600);
  background:var(--olive-50);border:1px solid rgba(61,74,34,.12);border-radius:50px;
  padding:5px 12px;cursor:pointer;transition:all .2s;font-family:'Jost',sans-serif;
}
.rev-helpful-btn:hover{background:var(--olive-100);border-color:var(--olive-400)}

/* Load more */
.rev-load-wrap{display:flex;justify-content:center;margin-top:28px}
.rev-load-btn{
  font-family:'Jost',sans-serif;font-size:11px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;
  color:var(--olive-600);background:white;
  border:1.5px solid var(--beige-dkr);border-radius:50px;
  padding:14px 36px;cursor:pointer;transition:all .22s;
}
.rev-load-btn:hover{border-color:var(--olive-400);background:var(--olive-50)}

/* Tablet */
@media(max-width:960px){
  .rev-section{padding:40px 24px 48px}
  .rev-summary{grid-template-columns:180px 1fr}
  .rev-big-num{font-size:3.6rem}
}

/* Mobile */
@media(max-width:600px){
  .rev-section{padding:32px 16px 40px}
  .rev-summary{grid-template-columns:1fr;border-radius:16px}
  .rev-summary-score{padding:22px 24px;flex-direction:row;justify-content:center;gap:16px;border-radius:0}
  .rev-big-num{font-size:3rem}
  .rev-bars{padding:16px 18px}
  .rev-header{gap:12px}
  .rev-title{font-size:1.3rem}
  .rev-card{padding:18px 16px}
  .rev-controls{flex-direction:column;align-items:flex-start}
}

@media(max-width:380px){
  .rev-big-num{font-size:2.6rem}
  .rev-card{padding:14px 12px}
}
      `}</style>
  
      <div className="pdp">
        <UpperNav />
        <div className="pdp-layout" style={{ paddingTop: '45px' }}>
          {/* ── Gallery ──────────────────────────────────────────────────────── */}
          <div className="pdp-gallery">
            <div className="pdp-main-img-wrap">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img key={displayImg} className="pdp-main-img" src={displayImg} alt={name} />
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

          {/* ── Info ─────────────────────────────────────────────────────────── */}
          <div className="pdp-info">
            {/* CHANGE 1: Removed pdp-eyebrow / category line — was showing "Women Jewellery" */}
            <h1 className="pdp-name">
              {name.split(' ').map((w, i) => i === 1 ? <em key={i}>{w} </em> : w + ' ')}
            </h1>

            <div className="pdp-rating">
              <span className="pdp-stars">{'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}</span>
              <span className="pdp-rating-num">{rating}</span>
              <span className="pdp-review-cnt">({reviewCount} reviews)</span>
            </div>

            {/* Price row */}
            <div className="pdp-info-top">
              <div className="pdp-price-row">
                <span className="pdp-price">₹{price.toLocaleString('en-IN')}</span>
                {originalPrice && (
                  <>
                    <span className="pdp-original">₹{originalPrice.toLocaleString('en-IN')}</span>
                    <span className="pdp-discount">{discount}% off</span>
                  </>
                )}
              </div>
              <div className="pdp-offer">
                <span className="pdp-offer-icon">🏷️</span>
                <span className="pdp-offer-text">{offer}</span>
              </div>
            </div>

            <div className="pdp-divider" />

            {/* Colour */}
            <p className="pdp-section-label">Colour: <span>{colors[activeColor].label}</span></p>
            <div className="pdp-swatches">
              {colors.map((c, i) => (
                <button key={c.hex} className="pdp-swatch-btn" onClick={() => handleColorChange(i)} title={c.label}>
                  <div
                    className={`pdp-swatch${activeColor === i ? ' active' : ''}`}
                    style={{ background: c.hex, border: c.hex === '#ffffff' ? '2px solid #d9cdb8' : undefined }}
                  />
                  <span className="pdp-swatch-label">{c.label}</span>
                </button>
              ))}
            </div>

            <p className="pdp-desc">{description}</p>
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
                    This {category.toLowerCase()} can be personalised with your own photos, names, or a special message. Choose below and our team will craft something truly unique for you.
                  </p>
                  <CustomisationPanel category={category} />
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
                <button className="pdp-qty-btn" onClick={() => setQty(q => Math.min(stock, q + 1))}>+</button>
              </div>
              <span className="pdp-stock">Only {stock} left in stock!</span>
            </div>
            <div className="pdp-divider" />

            {/* Order Summary */}
            <div className="pdp-summary">
              <div className="pdp-summary-row"><span>Item price × {qty}</span><span>₹{(price * qty).toLocaleString('en-IN')}</span></div>
              <div className="pdp-summary-row">
                <span>Delivery charges</span>
                <span style={{ color: deliveryCharge === 0 ? 'var(--green)' : 'var(--ink)' }}>{deliveryCharge === 0 ? 'FREE 🎉' : `₹${deliveryCharge}`}</span>
              </div>
              {payment === 'cod' && shipping !== 'express' && <div className="pdp-summary-row"><span>COD charges</span><span>₹70</span></div>}
              <div className="pdp-summary-row total"><span>Total</span><span>₹{totalPrice.toLocaleString('en-IN')}</span></div>
            </div>

            {/* CTA */}
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
                  {cartAnim ? 'Added! ✓' : 'Add to Cart'}
                </button>
                <Sparkles active={sparkleAnim} />
              </div>
              <button className="pdp-btn-buy" onClick={handleBuyNow}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                Buy It Now
              </button>
            </div>

            {/* CHANGE 3: Updated trust badges — 3 icons */}
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

            {/* Accordion */}
            <div className="pdp-accordion">
              {ACCORDION_ITEMS.map(item => (
                <AccordionItem
                  key={item.id}
                  item={item}
                  open={openAccordion === item.id}
                  onToggle={() => setOpenAccordion(o => o === item.id ? null : item.id)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* CHANGE 2: Goes Well With section — full width below the 2-col layout */}
        <GoesWellWithSection />

         <ReviewsSection />
      </div>
    </>
  );
}



