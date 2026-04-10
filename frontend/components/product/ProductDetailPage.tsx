'use client';
import { useRouter } from 'next/navigation';
import { useState, useRef, useCallback, useEffect, type ChangeEvent, type DragEvent } from 'react';
import { ALL_PRODUCTS } from './ProductPage'; // adjust path if needed
import { useCart } from '@/lib/cartContext';
  import { fireConfetti } from '@/components/cart/ConfettiManager';
import { useWishlist } from '@/lib/wishlistContext';

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

// ─── Trust badges ─────────────────────────────────────────────────────────────
const TRUST_BADGES = [
  {
    icon: (<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="8" y="14" width="28" height="22" rx="2"/><path d="M16 14v-3a8 8 0 0116 0v3"/><path d="M20 25l3 3 6-6"/><circle cx="36" cy="34" r="7" fill="var(--beige)" stroke="currentColor"/><path d="M33 34l2 2 4-4"/></svg>),
    title: 'Easy Return', sub: '& Exchange',
  },
  {
    icon: (<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="18" width="28" height="18" rx="2"/><path d="M32 22h4l6 8v6h-10V22z"/><circle cx="14" cy="38" r="3"/><circle cx="36" cy="38" r="3"/><path d="M8 14l4-4M14 10l4 4"/></svg>),
    title: 'Free Shipping', sub: 'On orders above ₹599',
  },
  {
    icon: (<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M24 6C14 6 8 14 8 22c0 10 16 22 16 22s16-12 16-22c0-8-6-16-16-16z"/><path d="M20 22l3 3 6-6"/></svg>),
    title: 'COD Available', sub: 'On all orders',
  },
  {
    icon: (<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M24 4l4 8 9 1-6.5 6.4 1.5 9L24 24l-8 4.4 1.5-9L11 13l9-1 4-8z"/><path d="M8 36h32M12 42h24"/></svg>),
    title: '100% Authentic', sub: 'Certified jewellery',
  },
];

// ─── Accordion data ───────────────────────────────────────────────────────────
const ACCORDION_ITEMS: AccordionData[] = [
  { id: 'about',    emoji: '💎', label: 'About the Product',    content: `This necklace is crafted from high-quality brass with an 18k gold plating for long-lasting shine. The delicate layered design features three chains at lengths 16", 18" and 20", each finishing with a hand-set micro-charm. Hypoallergenic and nickel-free. Suitable for daily wear.` },
  { id: 'desc',     emoji: '📄', label: 'Product Description',  content: `• Material: Brass with 18k gold / rhodium / rose-gold plating\n• Chain lengths: 16" · 18" · 20"\n• Clasp: Lobster claw\n• Width: 1–1.5 mm per strand\n• Weight: ~4.2 g\n• Finish: Tarnish-resistant coating\n• Packaging: Premium gift box included` },
  { id: 'cancel',   emoji: '↩️', label: 'Cancellation Policy',  content: `Orders can be cancelled free of charge within 24 hours of placing. After 24 hours, cancellations are not accepted once the order is dispatched. For damaged or wrong items received, contact us within 48 hours of delivery for a hassle-free replacement or full refund.` },
  { id: 'shipping', emoji: '🚚', label: 'Shipping & Returns',   content: `STANDARD DELIVERY (3–5 business days) — ₹60 delivery charge. Free on orders above ₹599.\nEXPRESS DELIVERY (1–2 business days) — ₹120 delivery charge. No COD available on express orders.\n\nReturns accepted within 7 days of delivery. Item must be unused, unworn, and in original packaging. Reverse pickup is free for damaged/wrong items.` },
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
  const [wantCustom, setWantCustom] = useState<boolean | null>(null); // null | true | false
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
      {/* Toggle */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          className={`cust-toggle-btn yes${wantCustom === true ? ' sel' : ''}`}
          onClick={() => handleToggle(true)}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          Yes, Customise
        </button>
        <button
          className={`cust-toggle-btn no${wantCustom === false ? ' sel' : ''}`}
          onClick={() => handleToggle(false)}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          No, Standard
        </button>
      </div>

      {/* "No" message */}
      {wantCustom === false && (
        <div className="cust-info-chip" style={{ marginTop: 12 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 15, height: 15, flexShrink: 0, color: 'var(--gold)', marginTop: 1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <p>You'll receive the <strong>standard {catLabel}</strong>. You can still personalise it later by contacting us within 2 hours of placing your order.</p>
        </div>
      )}

      {/* Upload panel */}
      {wantCustom === true && (
        <div style={{ marginTop: 14, animation: 'fadeUp .35s ease both' }}>

          {/* Global note textarea */}
          <textarea
            className="cust-note-global"
            placeholder={`Add a personal message or customisation note for your ${catLabel} (e.g. "Write 'Happy Birthday Sarah' on the tag")…`}
            value={globalNote}
            onChange={e => setGlobalNote(e.target.value)}
            rows={3}
          />

          {/* Drop zone */}
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

          {/* Limit */}
          <p className={`cust-limit${uploads.length >= MAX_FILES ? ' warn' : ''}`}>
            {uploads.length}/{MAX_FILES} photos{uploads.length >= MAX_FILES ? ' — limit reached' : ' uploaded'}
          </p>

          {/* Previews */}
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

          {/* Info chip */}
          <div className="cust-info-chip">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 15, height: 15, flexShrink: 0, color: 'var(--gold)', marginTop: 1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <p>Our team reviews your photos within <strong>2 business hours</strong> and confirms the design before production. Customised items are <strong>non-returnable</strong> unless damaged or incorrect.</p>
          </div>
        </div>
      )}
    </>
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

  // Is this category customisable?
  const isCustomisable = CUSTOMISABLE_CATEGORIES.some(c => category?.toLowerCase().includes(c.toLowerCase()));

  const currentColorHex = colors?.[activeColor]?.hex;
  const currentImages   = Array.isArray(images) ? images : (images?.[currentColorHex] || images?.[colors?.[0]?.hex] || []);
  const displayImg      = currentImages?.[activeImg] || currentImages?.[0] || '';
  const discount        = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  const deliveryCharge  = shipping === 'express' ? 120 : (price >= 599 ? 0 : 60);
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
    id: product.id,
    name: product.name,
    price: product.price,
    originalPrice: product.originalPrice ?? null,
    image: displayImg,
    color: colors[activeColor].label,
    colorHex: colors[activeColor].hex,
    sku: product.sku,
    href: product.href,
  };

  // Add items
  for (let i = 0; i < qty; i++) {
    addItem(cartItem, false);
  }

  // 🚀 Direct redirect to cart page
  router.push('/cart');

}, [addItem, product, displayImg, colors, activeColor, qty, router]);


const handleAddToCart = useCallback(() => {
  // 1. Build the cart item
  const cartItem = {
    id: product.id,
    name: product.name,
    price: product.price,
    originalPrice: product.originalPrice ?? null,
    image: displayImg,
    color: colors[activeColor].label,
    colorHex: colors[activeColor].hex,
    sku: product.sku,
    href: product.href,
  };

  // 2. Add item qty times
  for (let i = 0; i < qty; i++) {
    addItem(cartItem);
  }

  // 3. Fire confetti
  fireConfetti(cartBtnRef.current);

  // 4. Animations
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
        .pdp-topbar{display:flex;align-items:center;justify-content:space-between;padding:16px 52px;background:rgba(245,240,232,.85);backdrop-filter:blur(14px);border-bottom:1px solid rgba(61,74,34,.09);position:sticky;top:0;z-index:200}
        .pdp-logo{font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:300;letter-spacing:.15em;color:var(--olive-600);text-decoration:none}
        .pdp-logo em{font-style:italic;color:var(--gold)}
        .pdp-crumb{display:flex;align-items:center;gap:7px;font-size:9.5px;letter-spacing:.3em;text-transform:uppercase;color:var(--mist)}
        .pdp-crumb a{color:var(--mist);text-decoration:none;transition:color .2s}
        .pdp-crumb a:hover{color:var(--olive-600)}
        .pdp-crumb-sep{opacity:.35}
        .pdp-layout{display:grid;grid-template-columns:1fr 1fr;gap:0;max-width:1280px;margin:0 auto}
        .pdp-gallery{position:sticky;top:65px;height:calc(100vh - 65px);padding:32px 28px 32px 52px;display:flex;flex-direction:column;gap:14px;animation:fadeUp .6s ease both}
        .pdp-main-img-wrap{flex:1;background:var(--beige-dk);border-radius:24px;overflow:hidden;position:relative}
        .pdp-main-img{width:100%;height:100%;object-fit:cover;animation:imgIn .4s ease both}
        .pdp-badge{position:absolute;top:16px;left:16px;font-size:9.5px;font-weight:600;letter-spacing:.1em;color:var(--beige);background:var(--olive-600);padding:5px 14px 4px;border-radius:50px}
        .pdp-wish{position:absolute;top:14px;right:14px;width:36px;height:36px;border-radius:50%;background:rgba(245,240,232,.9);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:transform .2s,background .2s}
        .pdp-wish:hover{transform:scale(1.1)}
        .pdp-wish.on{background:var(--olive-600)}
        .pdp-thumb-row{display:flex;gap:10px}
        .pdp-thumb{width:72px;height:72px;border-radius:12px;overflow:hidden;cursor:pointer;flex-shrink:0;border:2px solid transparent;transition:border-color .2s,transform .2s}
        .pdp-thumb:hover{transform:scale(1.06)}
        .pdp-thumb.active{border-color:var(--olive-500)}
        .pdp-thumb img{width:100%;height:100%;object-fit:cover}
        .pdp-info{padding:32px 52px 64px 28px;animation:fadeUp .6s ease .1s both;overflow-y:auto}
        .pdp-eyebrow{font-size:9px;letter-spacing:.5em;text-transform:uppercase;color:var(--gold);margin-bottom:10px;display:flex;align-items:center;gap:10px}
        .pdp-eyebrow::before{content:'';width:28px;height:1px;background:linear-gradient(90deg,var(--gold),transparent)}
        .pdp-name{font-family:'Cormorant Garamond',serif;font-size:clamp(1.9rem,3.5vw,2.8rem);font-weight:400;line-height:1.1;letter-spacing:-.01em;color:var(--olive-900);margin-bottom:10px}
        .pdp-name em{font-style:italic;color:var(--olive-600)}
        .pdp-rating{display:flex;align-items:center;gap:6px;margin-bottom:16px}
        .pdp-stars{color:var(--gold);font-size:13px;letter-spacing:1px}
        .pdp-rating-num{font-size:12px;font-weight:600;color:var(--olive-600)}
        .pdp-review-cnt{font-size:11px;color:var(--mist)}
        .pdp-offer{background:linear-gradient(135deg,rgba(201,168,76,.12),rgba(90,110,35,.1));border:1px solid rgba(201,168,76,.28);border-radius:10px;padding:10px 16px;margin-bottom:18px;display:flex;align-items:center;gap:10px}
        .pdp-offer-icon{font-size:16px}
        .pdp-offer-text{font-size:11px;font-weight:500;letter-spacing:.04em;color:#8c6b20}
        .pdp-price-row{display:flex;align-items:baseline;gap:12px;margin-bottom:8px;flex-wrap:wrap}
        .pdp-price{font-family:'Cormorant Garamond',serif;font-size:2.2rem;font-weight:600;letter-spacing:-.02em;color:var(--olive-900)}
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
        .pdp-desc{font-size:13px;font-weight:300;line-height:1.85;color:var(--mist);letter-spacing:.03em;margin-bottom:20px}
        .pdp-qty-row{display:flex;align-items:center;gap:14px;margin-bottom:20px}
        .pdp-qty{display:flex;align-items:center;border:1.5px solid var(--beige-dkr);border-radius:50px;overflow:hidden}
        .pdp-qty-btn{width:36px;height:36px;background:none;border:none;font-size:18px;cursor:pointer;color:var(--olive-600);display:flex;align-items:center;justify-content:center;transition:background .15s}
        .pdp-qty-btn:hover{background:var(--olive-50)}
        .pdp-qty-val{min-width:36px;text-align:center;font-size:13px;font-weight:600;color:var(--ink)}
        .pdp-stock{font-size:10.5px;font-weight:500;letter-spacing:.06em;color:var(--red);animation:stockPulse 2.2s ease-in-out infinite}
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
        .pdp-pay-row{display:flex;gap:10px;margin-bottom:20px;flex-wrap:wrap}
        .pdp-pay-opt{flex:1;min-width:140px;border:1.5px solid var(--beige-dkr);border-radius:12px;padding:12px 14px;cursor:pointer;transition:all .2s;background:white;text-align:left}
        .pdp-pay-opt:hover{border-color:var(--olive-400);background:var(--olive-50)}
        .pdp-pay-opt.active{border-color:var(--olive-500);background:var(--olive-50);box-shadow:0 0 0 3px rgba(90,110,35,.1)}
        .pdp-pay-opt.disabled{opacity:.38;pointer-events:none;cursor:not-allowed}
        .pdp-pay-head{display:flex;align-items:center;gap:6px;font-size:11px;font-weight:600;letter-spacing:.06em;color:var(--olive-600);text-transform:uppercase;margin-bottom:3px}
        .pdp-pay-head svg{width:14px;height:14px}
        .pdp-pay-sub{font-size:10px;color:var(--mist)}
        .pdp-pay-extra{font-size:10px;font-weight:600;color:var(--red);margin-top:2px}
        .pdp-summary{background:linear-gradient(135deg,var(--olive-50),var(--beige-dk));border:1px solid rgba(61,74,34,.1);border-radius:14px;padding:14px 18px;margin-bottom:20px}
        .pdp-summary-row{display:flex;justify-content:space-between;font-size:11.5px;color:var(--mist);margin-bottom:6px}
        .pdp-summary-row.total{border-top:1px solid rgba(61,74,34,.1);padding-top:8px;margin-top:4px;font-size:14px;font-weight:700;color:var(--ink)}
        .pdp-summary-row span:last-child{font-weight:500;color:var(--ink)}
        .pdp-summary-row.total span:last-child{font-weight:800;font-size:16px}
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
        .pdp-trust{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:28px}
        .pdp-trust-item{display:flex;flex-direction:column;align-items:center;text-align:center;padding:14px 8px;background:white;border:1px solid rgba(61,74,34,.07);border-radius:14px;transition:transform .2s,box-shadow .2s}
        .pdp-trust-item:hover{transform:translateY(-3px);box-shadow:0 8px 24px rgba(61,74,34,.1)}
        .pdp-trust-icon{width:40px;height:40px;color:var(--olive-500);margin-bottom:7px}
        .pdp-trust-title{font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--olive-600);margin-bottom:2px}
        .pdp-trust-sub{font-size:9px;color:var(--mist)}
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

        /* ── Customisation section banner ── */
        .pdp-cust-banner{background:linear-gradient(135deg,rgba(201,168,76,.1),rgba(90,110,35,.08));border:1.5px solid rgba(201,168,76,.3);border-radius:16px;padding:16px 18px 18px;margin-bottom:20px}
        .pdp-cust-banner-head{display:flex;align-items:center;gap:10px;font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--olive-600);margin-bottom:6px}
        .pdp-cust-banner-head svg{width:16px;height:16px;color:var(--gold)}
        .pdp-cust-banner-sub{font-size:11px;font-weight:300;color:var(--mist);line-height:1.7;letter-spacing:.03em;margin-bottom:14px}

        /* ── Customisation panel internals ── */
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

        @media(max-width:960px){.pdp-layout{grid-template-columns:1fr}.pdp-gallery{position:static;height:auto;padding:24px 24px 0}.pdp-main-img-wrap{height:360px}.pdp-info{padding:24px 24px 48px}.pdp-topbar{padding:14px 24px}.pdp-trust{grid-template-columns:repeat(2,1fr)}}
        @media(max-width:540px){.pdp-cta-row{grid-template-columns:1fr 1fr}.pdp-ship-row{grid-template-columns:1fr}.pdp-trust{grid-template-columns:repeat(2,1fr)}.pdp-topbar{padding:12px 16px}.pdp-gallery,.pdp-info{padding-left:16px;padding-right:16px}}
      `}</style>

      <div className="pdp">
        {/* Topbar */}
        <nav className="pdp-topbar">
          <a href="/" className="pdp-logo">Mai<em>son</em></a>
          <div className="pdp-crumb">
            <a href="/">Home</a><span className="pdp-crumb-sep"> · </span>
            <a href="/shop">Jewellery</a><span className="pdp-crumb-sep"> · </span>
            <span style={{ color: 'var(--olive-600)', opacity: .7 }}>{name}</span>
          </div>
        </nav>

        <div className="pdp-layout">
          {/* Gallery */}
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

          {/* Info */}
          <div className="pdp-info">
            <div className="pdp-eyebrow">{category}</div>
            <h1 className="pdp-name">{name.split(' ').map((w, i) => i === 1 ? <em key={i}>{w} </em> : w + ' ')}</h1>

            <div className="pdp-rating">
              <span className="pdp-stars">{'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}</span>
              <span className="pdp-rating-num">{rating}</span>
              <span className="pdp-review-cnt">({reviewCount} reviews)</span>
            </div>

            <div className="pdp-offer">
              <span className="pdp-offer-icon">🏷️</span>
              <span className="pdp-offer-text">{offer}</span>
            </div>

            <div className="pdp-price-row">
              <span className="pdp-price">₹{price.toLocaleString('en-IN')}</span>
              {originalPrice && (<><span className="pdp-original">₹{originalPrice.toLocaleString('en-IN')}</span><span className="pdp-discount">{discount}% off</span></>)}
            </div>
            <p className="pdp-tax">Inclusive of all taxes · SKU: {sku}</p>
            <div className="pdp-divider" />

            {/* Colour */}
            <p className="pdp-section-label">Colour: <span>{colors[activeColor].label}</span></p>
            <div className="pdp-swatches">
              {colors.map((c, i) => (
                <button key={c.hex} className="pdp-swatch-btn" onClick={() => handleColorChange(i)} title={c.label}>
                  <div className={`pdp-swatch${activeColor === i ? ' active' : ''}`} style={{ background: c.hex, border: c.hex === '#ffffff' ? '2px solid #d9cdb8' : undefined }} />
                  <span className="pdp-swatch-label">{c.label}</span>
                </button>
              ))}
            </div>

            <p className="pdp-desc">{description}</p>
            <div className="pdp-divider" />

            {/* ── ✨ CUSTOMISATION (only for Gift Boxes / Fan Box / Key Chain/Charm) ── */}
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

            {/* Qty */}
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

            {/* Shipping */}
            <p className="pdp-section-label" style={{ marginBottom: 10 }}>Delivery Method</p>
            <div className="pdp-ship-row">
              <button className={`pdp-ship-opt${shipping === 'standard' ? ' active' : ''}`} onClick={() => setShipping('standard')}>
                <div className="pdp-ship-opt-head">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                  Standard
                </div>
                <div className="pdp-ship-eta">3–5 Business Days</div>
                <div className="pdp-ship-price">{price * qty >= 599 ? 'FREE' : '₹60'}</div>
                <div className="pdp-ship-note">COD available · Free above ₹599</div>
              </button>
              <button className={`pdp-ship-opt${shipping === 'express' ? ' active' : ''}`} onClick={() => setShipping('express')}>
                <span className="pdp-ship-badge">Fast</span>
                <div className="pdp-ship-opt-head">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                  Express
                </div>
                <div className="pdp-ship-eta">1–2 Business Days</div>
                <div className="pdp-ship-price">₹120</div>
                <div className="pdp-ship-note">No COD on express orders</div>
              </button>
            </div>

            {/* Payment */}
            <p className="pdp-section-label" style={{ marginBottom: 10 }}>Payment Mode</p>
            <div className="pdp-pay-row">
              <button className={`pdp-pay-opt${payment === 'prepaid' ? ' active' : ''}`} onClick={() => setPayment('prepaid')}>
                <div className="pdp-pay-head">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                  Prepaid
                </div>
                <div className="pdp-pay-sub">UPI · Card · Net Banking · Wallets</div>
              </button>
              <button
                className={`pdp-pay-opt${payment === 'cod' ? ' active' : ''}${shipping === 'express' ? ' disabled' : ''}`}
                onClick={() => shipping !== 'express' && setPayment('cod')}
              >
                <div className="pdp-pay-head">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><path d="M12 6v6l4 2"/></svg>
                  Cash on Delivery
                </div>
                <div className="pdp-pay-sub">Pay at your door</div>
                {shipping !== 'express' && <div className="pdp-pay-extra">+₹70 COD charge</div>}
                {shipping === 'express'  && <div className="pdp-pay-extra">Not available for Express</div>}
              </button>
            </div>

            {/* Summary */}
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
              <button className={`pdp-wish${wished ? ' on' : ''}`} onClick={handleWishToggle} aria-label="Wishlist">
                <svg viewBox="0 0 24 24" fill={wished ? 'var(--beige)' : 'none'} stroke={wished ? 'none' : 'currentColor'} strokeWidth="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                {wished ? 'Wished' : 'Wishlist'}
              </button>
              <div className="pdp-btn-cart-wrap">
                <button ref={cartBtnRef} className={`pdp-btn-cart${cartAnim ? ' bounce' : ''}`} onClick={handleAddToCart}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
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

            {/* Accordion */}
            <div className="pdp-accordion">
              {ACCORDION_ITEMS.map(item => (
                <AccordionItem key={item.id} item={item} open={openAccordion === item.id} onToggle={() => setOpenAccordion(o => o === item.id ? null : item.id)} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}