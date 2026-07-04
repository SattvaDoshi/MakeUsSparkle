'use client';

import {
  useState,
  useEffect,
  type ChangeEvent,
} from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cartContext';
import { apiRequest } from '@/lib/api';
import UpperNav from '@/components/ui/UpperNav';

/* ─────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────── */
interface ProductVariant {
  selections?: Record<string, string>;
  personalMessage?: string;
  uploadedImageBase64?: string;
}

interface DynamicVariant {
  name: string;
  options: string[];
}

interface ComboProduct {
  id: string;
  name: string;
  price?: number;
  image: string;
  customisable: boolean;
  variants: DynamicVariant[];
}

interface PresetCombo {
  id: string;
  name: string;
  tagline: string;
  price: number;
  originalPrice: number;
  image: string;
  badge: string;
  includedProducts: ComboProduct[];
}

interface CustomComboSlot {
  id: string;
  name: string;
  tagline: string;
  maxItems: number;
  fixedPrice: number;
  image: string;
  badge: string;
  allowedProducts: ComboProduct[];
}

const FALLBACK_COMBO_IMAGE = '/images/hero.png';

function safeImageSrc(src?: string | null) {
  return src && src.trim() ? src : FALLBACK_COMBO_IMAGE;
}

/* ─────────────────────────────────────────────────────────────
   DEMO DATA
───────────────────────────────────────────────────────────── */
const IMG = {
  ring1:    'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80',
  ring2:    'https://images.unsplash.com/photo-1573408301185-9519f94f0200?w=600&q=80',
  ring3:    'https://images.unsplash.com/photo-1635797255620-2d8e5c7d7ad6?w=600&q=80',
  necklace1:'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80',
  necklace2:'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=600&q=80',
  necklace3:'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&q=80',
  earring1: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=600&q=80',
  earring2: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=600&q=80',
  earring3: 'https://images.unsplash.com/photo-1583292650898-7d22cd27ca6f?w=600&q=80',
  bangle1:  'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80',
  bangle2:  'https://images.unsplash.com/photo-1624913503273-5f9c4e980dba?w=600&q=80',
  bangle3:  'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=600&q=80',
  combo1:   'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80',
  combo2:   'https://images.unsplash.com/photo-1535556116002-6281ff3e9f36?w=800&q=80',
  combo3:   'https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?w=800&q=80',
  combo4:   'https://images.unsplash.com/photo-1627293620999-e9b5c2325842?w=800&q=80',
};

const COLOURS = ['Gold', 'Silver', 'Rose Gold', 'Antique Gold'];
const SIZES   = ['XS', 'S', 'M', 'L', 'XL'];

const ALL_PRODUCTS: ComboProduct[] = [
  { id: 'r1', name: 'Floral Solitaire Ring',        price: 1299, image: IMG.ring1,    customisable: true,  variants: [{name: 'Colour', options: COLOURS}, {name: 'Size', options: ['5','6','7','8','9']}] },
  { id: 'r2', name: 'Twisted Band Ring',             price: 999,  image: IMG.ring2,    customisable: true,  variants: [{name: 'Colour', options: COLOURS}, {name: 'Size', options: ['5','6','7','8','9']}] },
  { id: 'r3', name: 'Stacking Midi Ring',            price: 799,  image: IMG.ring3,    customisable: false, variants: [{name: 'Colour', options: COLOURS}, {name: 'Size', options: ['5','6','7','8']}] },
  { id: 'n1', name: 'Layered Gold Necklace',         price: 1899, image: IMG.necklace1, customisable: true, variants: [{name: 'Colour', options: ['Gold','Rose Gold']}, {name: 'Size', options: SIZES}] },
  { id: 'n2', name: 'Delicate Pearl Pendant',        price: 1499, image: IMG.necklace2, customisable: true, variants: [{name: 'Colour', options: COLOURS}, {name: 'Size', options: SIZES}] },
  { id: 'n3', name: 'Antique Coin Necklace',         price: 2199, image: IMG.necklace3, customisable: true, variants: [{name: 'Colour', options: ['Gold','Antique Gold']}, {name: 'Size', options: SIZES}] },
  { id: 'e1', name: 'Jhumki Drop Earrings',          price: 1199, image: IMG.earring1, customisable: true,  variants: [{name: 'Colour', options: COLOURS}, {name: 'Size', options: []}] },
  { id: 'e2', name: 'Minimal Hoop Earrings',         price: 799,  image: IMG.earring2, customisable: false, variants: [{name: 'Colour', options: COLOURS}, {name: 'Size', options: []}] },
  { id: 'e3', name: 'Chandelier Statement Earrings', price: 1699, image: IMG.earring3, customisable: true,  variants: [{name: 'Colour', options: COLOURS}, {name: 'Size', options: []}] },
  { id: 'b1', name: 'Kundan Bangle Set',             price: 2499, image: IMG.bangle1,  customisable: true,  variants: [{name: 'Colour', options: ['Gold','Antique Gold']}, {name: 'Size', options: ['2.4','2.6','2.8']}] },
  { id: 'b2', name: 'Slim Gold Bangle',              price: 1299, image: IMG.bangle2,  customisable: false, variants: [{name: 'Colour', options: COLOURS}, {name: 'Size', options: ['2.4','2.6','2.8']}] },
  { id: 'b3', name: 'Beaded Charm Bracelet',         price: 999,  image: IMG.bangle3,  customisable: true,  variants: [{name: 'Colour', options: COLOURS}, {name: 'Size', options: ['2.4','2.6','2.8']}] },
];

const byId = (id: string) => ALL_PRODUCTS.find(p => p.id === id)!;

const PRESET_COMBOS: PresetCombo[] = [
  {
    id: 'pc1', name: 'Bridal Glow Set',
    tagline: 'The complete bridal jewellery edit',
    price: 5499, originalPrice: 7396,
    image: IMG.combo1, badge: 'Best Seller',
    includedProducts: [byId('n3'), byId('e1'), byId('b1'), byId('r1')],
  },
  {
    id: 'pc2', name: 'Everyday Minimal Set',
    tagline: 'Understated elegance for every day',
    price: 2999, originalPrice: 3997,
    image: IMG.combo2, badge: 'New Arrival',
    includedProducts: [byId('n2'), byId('e2'), byId('r2')],
  },
  {
    id: 'pc3', name: 'Statement Night Set',
    tagline: 'Turn heads at every occasion',
    price: 4299, originalPrice: 5597,
    image: IMG.combo3, badge: 'Limited',
    includedProducts: [byId('n1'), byId('e3'), byId('b1'), byId('r3')],
  },
  {
    id: 'pc4', name: 'Pearl & Gold Duo',
    tagline: 'Timeless pearl-and-gold pairing',
    price: 2699, originalPrice: 3398,
    image: IMG.combo4, badge: '',
    includedProducts: [byId('n2'), byId('e2')],
  },
];

const CUSTOM_SLOTS: CustomComboSlot[] = [
  {
    id: 'cs1', name: 'Choose Any 3 for ₹1,999',
    tagline: 'Pick 3 pieces from our ring & earring edit',
    maxItems: 3, fixedPrice: 1999,
    image: IMG.ring1, badge: 'Save up to 40%',
    allowedProducts: [byId('r1'), byId('r2'), byId('r3'), byId('e1'), byId('e2'), byId('e3')],
  },
  {
    id: 'cs2', name: 'Choose Any 4 for ₹3,499',
    tagline: 'Build your dream necklace & bangle stack',
    maxItems: 4, fixedPrice: 3499,
    image: IMG.necklace1, badge: 'Most Popular',
    allowedProducts: [byId('n1'), byId('n2'), byId('n3'), byId('b1'), byId('b2'), byId('b3')],
  },
  {
    id: 'cs3', name: 'Choose Any 5 for ₹4,999',
    tagline: 'Full head-to-toe jewellery wardrobe',
    maxItems: 5, fixedPrice: 4999,
    image: IMG.combo2, badge: 'Best Value',
    allowedProducts: ALL_PRODUCTS,
  },
];

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */
function hasCustomisation(v: ProductVariant) {
  return (v.selections && Object.keys(v.selections).length > 0) || !!v.personalMessage || !!v.uploadedImageBase64;
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
}

function ProductCustomiser({ product, variant, onSave, onSkip, onClose, isAddFlow, hidePrice }: CustomiserProps) {
  const [local, setLocal] = useState<ProductVariant>({ ...variant });

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.currentTarget.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = ev => setLocal(prev => ({ ...prev, uploadedImageBase64: ev.target?.result as string }));
    r.readAsDataURL(f);
  };

  const variants = product.variants || [];
  const hasAny  = (local.selections && Object.keys(local.selections).length > 0) || !!local.personalMessage || !!local.uploadedImageBase64;

  const msgNum = variants.length + 1;
  const picNum = variants.length + 2;

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
          {variants.map((variant, idx) => (
            <div key={variant.name} className="modal-field">
              <label className="modal-field-label">
                <span className="modal-field-num">{idx + 1}</span>
                {variant.name}
                {local.selections?.[variant.name] && <span className="modal-selected-badge">{local.selections[variant.name]}</span>}
              </label>
              <div className="modal-chips">
                {variant.options.map(opt => (
                  <button key={opt} className={`chip${local.selections?.[variant.name] === opt ? ' chip-on' : ''}`}
                    onClick={() => setLocal(p => ({ ...p, selections: { ...(p.selections || {}), [variant.name]: opt } }))}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="modal-field">
            <label className="modal-field-label">
              <span className="modal-field-num">{msgNum}</span>
              Personal Message
              <span className="modal-field-optional">optional</span>
            </label>
            <textarea className="modal-textarea"
              placeholder="E.g. 'To my dearest Priya, with love…'"
              value={local.personalMessage || ''}
              onChange={e => setLocal(p => ({ ...p, personalMessage: e.target.value }))}
              maxLength={120} rows={3} />
            <div className="modal-char-count">{(local.personalMessage || '').length}/120</div>
          </div>

          <div className="modal-field">
            <label className="modal-field-label">
              <span className="modal-field-num">{picNum}</span>
              Upload Photo
              <span className="modal-field-optional">optional</span>
            </label>
            <label className="modal-upload-zone">
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
              {local.uploadedImageBase64 ? (
                <div className="modal-upload-preview">
                  <img src={local.uploadedImageBase64} alt="Preview" />
                  <div>
                    <span className="modal-upload-preview-name">Photo uploaded ✓</span>
                    <span className="modal-upload-change">Tap to change</span>
                  </div>
                </div>
              ) : (
                <div className="modal-upload-empty">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="3"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  <span className="modal-upload-cta">Tap to upload a photo</span>
                  <span className="modal-upload-sub">JPG · PNG · WEBP</span>
                </div>
              )}
            </label>
          </div>

          {hasAny && (
            <div className="modal-summary-box">
              <div className="modal-summary-title">Your selections</div>
              <div className="modal-summary-tags">
                {Object.entries(local.selections || {}).map(([key, val]) => (
                  <span key={key} className="modal-sum-tag">{key}: {val}</span>
                ))}
                {local.personalMessage     && <span className="modal-sum-tag">Message added</span>}
                {local.uploadedImageBase64 && <span className="modal-sum-tag">Photo added</span>}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          {onSkip && (
            <button className="modal-btn-skip" onClick={() => { onSkip(); onClose(); }}>Skip</button>
          )}
          <button className="modal-btn-save" onClick={() => { onSave(local); onClose(); }}>
            {isAddFlow
              ? <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12l7 7 7-7"/></svg>Add to Hamper</>
              : <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Save Changes</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   PRESET SIDE PANEL
───────────────────────────────────────────────────────────── */
interface SidePanelProps {
  combo: PresetCombo;
  variants: Record<string, ProductVariant>;
  onVariantChange: (pid: string, v: ProductVariant) => void;
  onClose: () => void;
  onAddToCart: () => void;
  cartAdded: boolean;
  gender?: string;
}

function SidePanel({ combo, variants, onVariantChange, onClose, onAddToCart, cartAdded, gender = 'women' }: SidePanelProps) {
  const [customising, setCustomising] = useState<ComboProduct | null>(null);
  const [activeIdx, setActiveIdx]     = useState(0);

  const products = combo.includedProducts;
  const customisedCount = products.filter(p => hasCustomisation(variants[p.id] || {})).length;
  const pct = Math.round(((combo.originalPrice - combo.price) / combo.originalPrice) * 100);

  const activeProduct = products[activeIdx];
  const activeVariant = activeProduct ? (variants[activeProduct.id] || {}) : {};
  const hasActiveCust = hasCustomisation(activeVariant);

  return (
    <>
      {customising && (
        <ProductCustomiser
          product={customising}
          variant={variants[customising.id] || {}}
          onSave={v => { onVariantChange(customising.id, v); setCustomising(null); }}
          onClose={() => setCustomising(null)}
        />
      )}
      <div className="panel-backdrop" onClick={e => e.target === e.currentTarget && onClose()} />
      <div className="side-panel">
        <div className="panel-head">
          <div>
            <div className="panel-eyebrow">Pieces in this set</div>
            <div className="panel-title">{combo.name}</div>
          </div>
          <div className="panel-head-right">
            <span className="panel-prog">{customisedCount}/{products.length} customised</span>
            <button className="panel-close" onClick={onClose} aria-label="Close">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="panel-thumbs">
          {products.map((p, i) => {
            const done = hasCustomisation(variants[p.id] || {});
            return (
              <button key={p.id}
                className={`panel-thumb${activeIdx === i ? ' active' : ''}${done ? ' done' : ''}`}
                onClick={() => setActiveIdx(i)}>
                <img src={p.image} alt={p.name} />
                {done && <span className="panel-thumb-check">✓</span>}
              </button>
            );
          })}
        </div>

        {activeProduct && (
          <div className="panel-detail">
            <div className="panel-detail-img">
              <a href={`/products/${activeProduct.id}?fromCombo=true`} className="panel-detail-img-link"
                onClick={e => e.stopPropagation()}>
                <img src={activeProduct.image} alt={activeProduct.name} />
                <div className="panel-detail-img-overlay">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </div>
              </a>
            </div>
            <div className="panel-detail-info">
              <a href={`/products/${activeProduct.id}?fromCombo=true`} className="panel-detail-name-link"
                onClick={e => e.stopPropagation()}>
                <div className="panel-detail-name">{activeProduct.name}</div>
              </a>
              {activeProduct.price != null && <div className="panel-detail-price">₹{activeProduct.price.toLocaleString('en-IN')}</div>}
              {hasActiveCust && <CompactCustSummary variant={activeVariant} />}
              <button className="panel-customise-btn" onClick={() => setCustomising(activeProduct)}>
                {hasActiveCust ? '✎ Edit customisation' : '+ Customise this piece'}
              </button>
            </div>
          </div>
        )}

        {products.length > 1 && (
          <div className="panel-nav">
            <button className="panel-nav-btn" onClick={() => setActiveIdx(i => Math.max(0, i - 1))} disabled={activeIdx === 0}>← Prev</button>
            <span className="panel-nav-count">{activeIdx + 1} / {products.length}</span>
            <button className="panel-nav-btn" onClick={() => setActiveIdx(i => Math.min(products.length - 1, i + 1))} disabled={activeIdx === products.length - 1}>Next →</button>
          </div>
        )}

        {customisedCount < products.length && (
          <div className="panel-tip">Select each piece above to customise colour, size & message</div>
        )}

        <div className="panel-cart-footer">
          <div className="panel-cart-meta">
            <div className="panel-cart-meta-left">
              <span className="panel-cart-label">Set Total</span>
              <div className="panel-cart-pricing">
                <span className="panel-cart-price">₹{combo.price.toLocaleString('en-IN')}</span>
                {pct > 0 && <span className="panel-cart-original">₹{combo.originalPrice.toLocaleString('en-IN')}</span>}
                {pct > 0 && <span className="panel-cart-save">Save {pct}%</span>}
              </div>
            </div>
            <button className={`panel-cart-btn${cartAdded ? ' done' : ''}`} onClick={onAddToCart}>
              {cartAdded
                ? <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Added</>
                : <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>Add to Cart</>
              }
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   SLOT PANEL
───────────────────────────────────────────────────────────── */
interface SlotPanelProps {
  slot: CustomComboSlot;
  selectedIds: string[];
  variants: Record<string, ProductVariant>;
  onToggle: (pid: string) => void;
  onVariantChange: (pid: string, v: ProductVariant) => void;
  onClose: () => void;
  onAddToCart: () => void;
  cartAdded: boolean;
  gender?: string;
}

function SlotPanel({ slot, selectedIds, variants, onToggle, onVariantChange, onClose, onAddToCart, cartAdded, gender = 'women' }: SlotPanelProps) {
  const [customising, setCustomising] = useState<{ product: ComboProduct; isAddFlow: boolean } | null>(null);

  const remaining        = slot.maxItems - selectedIds.length;
  const selectedProducts = slot.allowedProducts.filter(p => selectedIds.includes(p.id));

  const handleAddWithCustomise = (product: ComboProduct) => setCustomising({ product, isAddFlow: true });

  const handleCustomiserSave = (v: ProductVariant) => {
    if (!customising) return;
    onVariantChange(customising.product.id, v);
    if (customising.isAddFlow) onToggle(customising.product.id);
    setCustomising(null);
  };

  const handleCustomiserSkip = () => {
    if (!customising || !customising.isAddFlow) return;
    onVariantChange(customising.product.id, {});
    onToggle(customising.product.id);
    setCustomising(null);
  };

  return (
    <>
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
      <div className="panel-backdrop" onClick={e => e.target === e.currentTarget && onClose()} />
      <div className="side-panel">
        <div className="panel-head">
          <div>
            <div className="panel-eyebrow">{slot.name}</div>
            <div className="panel-title">Pick Your Pieces</div>
          </div>
          <div className="panel-head-right">
            <span className={`panel-prog${remaining === 0 ? ' done-prog' : ''}`}>
              {selectedIds.length}/{slot.maxItems} chosen
            </span>
            <button className="panel-close" onClick={onClose} aria-label="Close">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="slot-progress-wrap">
          <div className="slot-progress-bar" style={{ width: `${(selectedIds.length / slot.maxItems) * 100}%` }} />
        </div>
        <div className={`slot-hint${remaining === 0 ? ' slot-hint-done' : ''}`}>
          {remaining > 0
            ? `Choose ${remaining} more piece${remaining !== 1 ? 's' : ''} — customise each as you add it`
            : '✓ All pieces selected! Tap any piece to re-customise.'}
        </div>

        <div className="slot-prod-scroll">
          <div className="slot-prod-grid">
            {slot.allowedProducts.map(p => {
              const isChosen = selectedIds.includes(p.id);
              const canAdd   = !isChosen && remaining > 0;
              const v        = variants[p.id] || {};
              const hasCust  = hasCustomisation(v);

              return (
                <div key={p.id} className={`sp-card${isChosen ? ' sp-chosen' : ''}${!canAdd && !isChosen ? ' sp-disabled' : ''}`}>
                  <div className="sp-img">
                    <a href={`/products/${p.id}?fromCombo=true`} className="sp-img-link" onClick={e => e.stopPropagation()}>
                      <img src={p.image} alt={p.name} />
                      <div className="sp-img-pdp-hint">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                          <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                      </div>
                    </a>
                    <button className="sp-img-toggle"
                      onClick={() => isChosen && onToggle(p.id)}
                      disabled={!isChosen}
                      aria-label={isChosen ? 'Remove' : ''}>
                      {isChosen && (
                        <div className="sp-chosen-overlay">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        </div>
                      )}
                    </button>
                  </div>
                  {/* NAME BELOW IMAGE — not overlaid */}
                  <div className="sp-body">
                    <a href={`/products/${p.id}?fromCombo=true`} className="sp-name-link" onClick={e => e.stopPropagation()}>
                      <div className="sp-name">{p.name}</div>
                    </a>
                    {isChosen ? (
                      <div className="sp-actions">
                        {hasCust && <CompactCustSummary variant={v} />}
                        {!hasCust && <div className="sp-no-cust-note">No customisation</div>}
                        <button className="sp-cust-btn"
                          onClick={() => setCustomising({ product: p, isAddFlow: false })}>
                          {hasCust ? '✎ Edit' : '+ Customise'}
                        </button>
                        <button className="sp-remove-btn" onClick={() => onToggle(p.id)}>Remove</button>
                      </div>
                    ) : (
                      <button className="sp-add-btn"
                        onClick={() => canAdd && handleAddWithCustomise(p)}
                        disabled={!canAdd}>
                        {canAdd ? '+ Add & Customise' : 'Limit reached'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {selectedProducts.length > 0 && (
          <div className="slot-selected-strip">
            <div className="slot-selected-label">
              Selected ({selectedProducts.length}/{slot.maxItems})
              {selectedProducts.filter(p => hasCustomisation(variants[p.id] || {})).length > 0 && (
                <span className="slot-cust-count">
                  · {selectedProducts.filter(p => hasCustomisation(variants[p.id] || {})).length} customised
                </span>
              )}
            </div>
            <div className="slot-selected-thumbs">
              {selectedProducts.map(p => {
                const isCust = hasCustomisation(variants[p.id] || {});
                return (
                  <div key={p.id} className={`slot-sel-thumb${isCust ? ' slot-sel-thumb-cust' : ''}`}
                    title={p.name + (isCust ? ' (customised)' : '')}>
                    <img src={p.image} alt={p.name} />
                    {isCust && <span className="slot-sel-cust-dot">✦</span>}
                    <button className="slot-sel-remove" onClick={() => onToggle(p.id)}>×</button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="slot-panel-footer">
          {selectedIds.length > 0 ? (
            <div className="slot-footer-row">
              <div className="slot-footer-price">
                <span className="slot-footer-price-lbl">
                  {remaining === 0 ? `${slot.maxItems} pieces selected` : `${selectedIds.length} of ${slot.maxItems} chosen`}
                </span>
                <span className="slot-footer-price-val">₹{slot.fixedPrice.toLocaleString('en-IN')}</span>
              </div>
              <button
                className={`slot-cart-btn${cartAdded ? ' done' : ''}`}
                onClick={() => { onAddToCart(); onClose(); }}
              >
                {cartAdded
                  ? <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Added</>
                  : <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>Add to Cart</>
                }
              </button>
            </div>
          ) : (
            <button className="slot-done-btn" onClick={onClose}>Close</button>
          )}
        </div>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   PRESET COMBO CARD — name below image, no text on image
───────────────────────────────────────────────────────────── */
interface ComboCardProps {
  combo: PresetCombo;
  selected: boolean;
  onSelect: () => void;
  variants: Record<string, ProductVariant>;
  onOpenPanel: () => void;
}

function ComboCard({ combo, selected, onSelect, variants, onOpenPanel }: ComboCardProps) {
  const pct = Math.round(((combo.originalPrice - combo.price) / combo.originalPrice) * 100);
  const customisedCount = combo.includedProducts.filter(p => hasCustomisation(variants[p.id] || {})).length;
  const comboImage = safeImageSrc(combo.image);

  return (
    <div className={`cc-card${selected ? ' cc-selected' : ''}`} onClick={() => { onSelect(); onOpenPanel(); }}>
      {/* IMAGE — only badges on image, NO text overlay */}
      <div className="cc-img-area">
        <img src={comboImage} alt={combo.name} />
        {pct > 0     && <span className="cc-pct-badge">{pct}% off</span>}
        {combo.badge  && <span className="cc-label-badge">{combo.badge}</span>}
        {selected && (
          <div className="cc-selected-check">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
        )}
      </div>

      {/* COLOR ACCENT STRIP */}


      {/* CARD BODY — all text below image */}
      <div className="cc-body">
        <div className="cc-name">{combo.name}</div>
        <div className="cc-price-row">
          <span className="cc-price">₹{combo.price.toLocaleString('en-IN')}</span>
          <span className="cc-original">₹{combo.originalPrice.toLocaleString('en-IN')}</span>
          {pct > 0 && <span className="cc-save-tag">−{pct}%</span>}
        </div>
        <div className="cc-meta-row">
          <span className="cc-pieces-count">{combo.includedProducts.length} pieces</span>
          {customisedCount > 0 && <span className="cc-cust-dot">{customisedCount} customised</span>}
        </div>
        <div className="cc-cta-hint">
          {selected ? '✦ Tap to view & customise' : 'Tap to select →'}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   CUSTOM SLOT CARD — name below image
───────────────────────────────────────────────────────────── */
interface CustomSlotCardProps {
  slot: CustomComboSlot;
  selectedIds: string[];
  variants: Record<string, ProductVariant>;
  onOpenPanel: () => void;
}

function CustomSlotCard({ slot, selectedIds, variants, onOpenPanel }: CustomSlotCardProps) {
  const chosen  = selectedIds.length;
  const isFull  = chosen >= slot.maxItems;
  const customisedCount = slot.allowedProducts.filter(p =>
    selectedIds.includes(p.id) && hasCustomisation(variants[p.id] || {})
  ).length;
  const chosenProducts = slot.allowedProducts.filter(p => selectedIds.includes(p.id));

  return (
    <div className={`cc-card${isFull ? ' cc-selected' : ''}`} onClick={onOpenPanel}>
      {/* IMAGE — no text overlay */}
      <div className="cc-img-area">
        <img src={slot.image} alt={slot.name} />
        {slot.badge && <span className="cc-label-badge">{slot.badge}</span>}
        {isFull && (
          <div className="cc-selected-check">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
        )}
        {chosenProducts.length > 0 && (
          <div className="cc-chosen-thumbs">
            {chosenProducts.slice(0, 3).map(p => {
              const isCust = hasCustomisation(variants[p.id] || {});
              return (
                <div key={p.id} className="cc-chosen-thumb-wrap">
                  <img src={p.image} alt={p.name} className="cc-chosen-thumb-img" />
                  {isCust && <span className="cc-chosen-thumb-cust">✦</span>}
                </div>
              );
            })}
            {chosenProducts.length > 3 && (
              <div className="cc-chosen-thumb-more">+{chosenProducts.length - 3}</div>
            )}
          </div>
        )}
      </div>



      {/* CARD BODY — all text below image */}
      <div className="cc-body">
        <div className="cc-name">{slot.name}</div>
        <div className="cc-price-row">
          <span className="cc-price">₹{slot.fixedPrice.toLocaleString('en-IN')}</span>
          <span className="cc-slot-pick-label">Choose {slot.maxItems}</span>
        </div>
        {/* Progress bar */}
        <div className="cc-slot-progress">
          <div className="cc-slot-progress-track">
            <div className="cc-slot-progress-fill" style={{ width: `${Math.min(100, (chosen / slot.maxItems) * 100)}%` }} />
          </div>
          <span className="cc-slot-progress-text">{chosen}/{slot.maxItems}</span>
        </div>
        {customisedCount > 0 && (
          <div className="cc-meta-row"><span className="cc-cust-dot">{customisedCount} customised</span></div>
        )}
        <div className="cc-cta-hint">
          {isFull ? '✦ Complete — tap to edit' : `Tap to choose ${slot.maxItems - chosen} more →`}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────── */
export default function CuratedCombosPage({ gender = 'women' }: { gender?: string }) {
  const { addItem } = useCart();

  const [mode, setMode] = useState<'preset' | 'custom'>('preset');

  const [presetCombos, setPresetCombos] = useState<PresetCombo[]>([]);
  const [customSlots, setCustomSlots] = useState<CustomComboSlot[]>([]);
  const [allProducts, setAllProducts] = useState<ComboProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedComboId, setSelectedComboId] = useState<string>('');
  const [presetVariants, setPresetVariants]   = useState<Record<string, ProductVariant>>({});
  const [panelComboId, setPanelComboId]       = useState<string | null>(null);
  const [presetCartAdded, setPresetCartAdded] = useState<Record<string, boolean>>({});

  const [slotSelections, setSlotSelections] = useState<Record<string, string[]>>({});
  const [slotVariants, setSlotVariants] = useState<Record<string, Record<string, ProductVariant>>>({});
  const [openSlotId, setOpenSlotId]         = useState<string | null>(null);
  const [customCartAdded, setCustomCartAdded] = useState<Record<string, boolean>>({});

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
                options: v.options ? v.options.split(',').map((opt: string) => opt.trim()) : [],
              }));

              loadedProductsMap.set(p._id, {
                id: p._id,
                name: p.title || p.name,
                price: p.price,
                image: safeImageSrc(p.image || p.mainImage || (p.images && p.images[0])),
                customisable: p.customisable ?? true,
                variants: parsedVariants,
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
                price: c.price || 0,
                originalPrice: c.originalPrice || c.price || 0,
                image: safeImageSrc(c.image),
                badge: c.badge || '',
                includedProducts: products,
              });
            } else {
              loadedCustom.push({
                id: c._id,
                name: c.name,
                tagline: c.tagline || '',
                maxItems: c.itemsCount || 3,
                fixedPrice: c.price || 0,
                image: safeImageSrc(c.image),
                badge: c.badge || '',
                allowedProducts: products,
              });
            }
          });

          setAllProducts(Array.from(loadedProductsMap.values()));
          setPresetCombos(loadedPreset);
          setCustomSlots(loadedCustom);
          if (loadedPreset.length > 0) setSelectedComboId(loadedPreset[0].id);

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

  const panelCombo = presetCombos.find(c => c.id === panelComboId) ?? null;
  const openSlot   = customSlots.find(s => s.id === openSlotId) ?? null;

  function handlePresetAddToCart(combo: PresetCombo) {
    addItem({
      id: combo.id, name: combo.name, price: combo.price,
      originalPrice: combo.originalPrice, image: combo.image,
      color: 'Default', colorHex: '#c9a84c',
      sku: `COMBO-PRESET-${combo.id}`,
      href: `/categories/${gender}/curated-combos`,
      selectionGroups: [{
        category: 'preset', label: combo.name,
        items: combo.includedProducts.map(p => {
          const v = presetVariants[p.id] || {};
          return { 
            id: p.id, name: p.name, price: p.price, image: p.image, quantity: 1,
            customData: { 
              selections: v.selections, 
              personalMessage: v.personalMessage,
              uploadedImageBase64: v.uploadedImageBase64,
              isCustomised: hasCustomisation(v) 
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

  function handleSlotVariantChange(slotId: string, pid: string, v: ProductVariant) {
    setSlotVariants(prev => ({ ...prev, [slotId]: { ...(prev[slotId] || {}), [pid]: v } }));
  }

  function handleCustomAddToCart(slot: CustomComboSlot) {
    const ids  = slotSelections[slot.id] || [];
    const vars = slotVariants[slot.id]   || {};
    if (!ids.length) return;
    addItem({
      id: `custom-slot-${slot.id}-${Date.now()}`,
      name: slot.name, price: slot.fixedPrice, originalPrice: slot.fixedPrice,
      image: slot.image, color: 'Default', colorHex: '#c9a84c',
      sku: `COMBO-CUSTOM-${slot.id}`,
      href: `/categories/${gender}/curated-combos`,
      selectionGroups: [{
        category: slot.id, label: slot.name,
        items: ids.map(pid => {
          const p = slot.allowedProducts.find(x => x.id === pid)!;
          const v = vars[pid] || {};
          return { 
            id: pid, name: p.name, price: p.price, image: p.image, quantity: 1,
            customData: { 
              selections: v.selections, 
              personalMessage: v.personalMessage,
              uploadedImageBase64: v.uploadedImageBase64,
              isCustomised: hasCustomisation(v) 
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
        }

        *,*::before,*::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { font-family: var(--ffb); background: var(--bg); color: var(--ink); }
        button { font-family: var(--ffb); cursor: pointer; background: transparent; border: none; }
        img { display: block; max-width: 100%; }
        textarea { font-family: var(--ffb); }

        /* ── MODAL ── */
        .modal-backdrop { position:fixed;inset:0;z-index:1000;background:rgba(10,12,5,.55);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:16px;animation:fadeIn .2s ease; }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        .modal-box { width:100%;max-width:520px;max-height:calc(100dvh - 32px);background:var(--surf);border-radius:16px;overflow:hidden;display:flex;flex-direction:column;box-shadow:var(--shadow-lg);animation:modalIn .28s cubic-bezier(.34,1.1,.64,1); }
        @keyframes modalIn { from{opacity:0;transform:scale(.94) translateY(16px)} to{opacity:1;transform:scale(1) translateY(0)} }
        .modal-header { display:flex;align-items:flex-start;justify-content:space-between;padding:18px 20px 14px;background:linear-gradient(135deg,var(--olivedim),#ede9d8);border-bottom:1px solid var(--bdr);flex-shrink:0; }
        .modal-header-text { flex:1;min-width:0; }
        .modal-eyebrow { display:block;font-size:9px;font-weight:600;letter-spacing:.22em;text-transform:uppercase;color:var(--sage);margin-bottom:3px; }
        .modal-title { font-family:var(--ffd);font-size:1.25rem;font-weight:500;color:var(--olive);line-height:1.2; }
        .modal-close { width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:var(--ink4);background:rgba(255,255,255,.6);transition:all .15s;flex-shrink:0;margin-left:12px;border:1px solid var(--bdr); }
        .modal-close:hover { background:#fff;color:var(--ink); }
        .modal-product-strip { display:flex;align-items:center;gap:14px;padding:12px 20px;border-bottom:1px solid var(--bdr);background:#fafaf6;flex-shrink:0; }
        .modal-product-img { width:54px;height:54px;border-radius:4px;object-fit:cover;border:1px solid var(--bdr);flex-shrink:0; }
        .modal-product-name { font-size:13px;font-weight:600;color:var(--ink);margin-bottom:2px; }
        .modal-product-price { font-size:12px;color:var(--olive2);font-weight:600; }
        .modal-product-note { font-size:10px;color:var(--ink4);margin-top:3px; }
        .modal-body { flex:1;overflow-y:auto;padding:18px 20px;display:flex;flex-direction:column;gap:20px; }
        .modal-body::-webkit-scrollbar { width:3px; }
        .modal-body::-webkit-scrollbar-thumb { background:var(--bdr2);border-radius:3px; }
        .modal-field { display:flex;flex-direction:column;gap:9px; }
        .modal-field-label { display:flex;align-items:center;gap:8px;font-size:10px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--ink); }
        .modal-field-num { width:20px;height:20px;border-radius:50%;background:var(--olive);color:#fff;font-size:9px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-family:var(--ffb);font-variant-numeric: tabular-nums;  
  line-height: 1;  }
        .modal-field-optional { font-size:8px;font-weight:400;letter-spacing:.04em;text-transform:none;color:var(--ink4);padding:2px 7px;border:1px solid var(--bdr2);border-radius:50px; }
        .modal-selected-badge { font-size:9px;font-weight:600;text-transform:none;letter-spacing:.03em;background:var(--olivedim);color:var(--olive);border:1px solid rgba(90,110,43,.3);padding:2px 9px;border-radius:50px;margin-left:auto; }
        .modal-chips { display:flex;flex-wrap:wrap;gap:8px; }
        .chip { font-size:12px;font-weight:500;padding:8px 16px;border-radius:4px;border:1.5px solid var(--bdr2);color:var(--ink7);transition:all .18s;min-height:38px;display:flex;align-items:center;background:transparent;cursor:pointer;font-family:var(--ffb); }
        .chip:hover { border-color:var(--olive2);color:var(--olive);background:var(--olivedim); }
        .chip-on { background:var(--olivedim) !important;color:var(--olive) !important;border-color:var(--olive) !important;font-weight:600 !important;box-shadow:inset 0 0 0 1px var(--olive); }
        .chip-size { min-width:50px;justify-content:center; }
        .modal-textarea { width:100%;border:1.5px solid var(--bdr);border-radius:4px;padding:10px 12px;font-size:13px;color:var(--ink);background:var(--bg);outline:none;resize:none;line-height:1.65;transition:border-color .2s;font-family:var(--ffb); }
        .modal-textarea:focus { border-color:var(--olive2);background:#fff; }
        .modal-textarea::placeholder { color:var(--ink4); }
        .modal-char-count { font-size:10px;color:var(--ink4);text-align:right; }
        .modal-upload-zone { display:block;border:2px dashed var(--bdr2);border-radius:4px;cursor:pointer;transition:all .2s;overflow:hidden; }
        .modal-upload-zone:hover { border-color:var(--olive2);background:var(--olivedim); }
        .modal-upload-empty { display:flex;flex-direction:column;align-items:center;gap:7px;padding:24px 16px;color:var(--ink4);text-align:center; }
        .modal-upload-cta { font-size:13px;font-weight:500;color:var(--olive); }
        .modal-upload-sub { font-size:10px; }
        .modal-upload-preview { display:flex;align-items:center;gap:14px;padding:12px 16px;background:var(--olivedim); }
        .modal-upload-preview img { width:52px;height:52px;border-radius:7px;object-fit:cover; }
        .modal-upload-preview-name { font-size:12px;font-weight:600;color:var(--olive);display:block; }
        .modal-upload-change { font-size:10px;color:var(--ink4);display:block;margin-top:2px; }
        .modal-summary-box { background:var(--golddim);border:1px solid rgba(184,152,42,.25);border-radius:4px;padding:9px 13px; }
        .modal-summary-title { font-size:8px;font-weight:600;letter-spacing:.15em;text-transform:uppercase;color:var(--gold);margin-bottom:6px; }
        .modal-summary-tags { display:flex;flex-wrap:wrap;gap:5px; }
        .modal-sum-tag { font-size:11px;font-weight:500;color:var(--olive);background:rgba(255,255,255,.8);border:1px solid rgba(90,110,43,.25);padding:3px 10px;border-radius:50px; }
        .modal-footer { padding:12px 20px 18px;border-top:1px solid var(--bdr);display:flex;gap:10px;flex-shrink:0;background:#fafaf6; }
        .modal-btn-skip { flex:1;font-size:9px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--ink4);border:1.5px solid var(--bdr2);border-radius:4px;padding:12px 14px;transition:all .18s;min-height:44px;font-family:var(--ffb); }
        .modal-btn-skip:hover { border-color:var(--ink4);color:var(--ink); }
        .modal-btn-save { flex:2;display:flex;align-items:center;justify-content:center;gap:7px;font-size:9px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#fff;background:var(--olive);border-radius:4px;padding:12px 18px;min-height:44px;box-shadow:0 4px 14px rgba(61,80,22,.25);transition:all .2s;font-family:var(--ffb); }
        .modal-btn-save:hover { background:#2e3c0e;transform:translateY(-1px); }

        /* compact cust summary */
        .cust-compact { display:flex;flex-wrap:wrap;gap:4px;margin-top:3px; }
        .cust-chip { font-size:9px;font-weight:500;color:var(--olive);background:var(--olivedim);border:1px solid rgba(90,110,43,.2);padding:2px 8px;border-radius:50px;white-space:nowrap; }

        /* ── PAGE ── */
        .page { min-height:100dvh;background:var(--bg); }

        /* ── HERO ── */
        .hero { margin-top:56px;padding:clamp(28px,4vw,52px) clamp(20px,6vw,72px) clamp(20px,3vw,36px);background:linear-gradient(155deg,#f5f2eb 0%,#ede5d0 55%,#f5f2eb 100%);border-bottom:1px solid var(--bdr);position:relative;overflow:hidden; }
        .hero::before { content:'';position:absolute;right:-80px;top:-80px;width:360px;height:360px;border-radius:50%;background:radial-gradient(circle,rgba(184,152,42,.1) 0%,transparent 68%);pointer-events:none; }
        .hero-eyebrow { display:flex;align-items:center;gap:10px;font-size:8px;letter-spacing:.44em;text-transform:uppercase;color:var(--gold);font-weight:600;margin-bottom:12px; }
        .hero-line { width:24px;height:1px;background:var(--gold);opacity:.5; }
        .hero h1 { font-family:var(--ffd);font-size:clamp(1.7rem,5vw,3.4rem);font-weight:500;color:var(--olive);line-height:1.08;margin-bottom:10px; }
        .hero h1 em { font-style:italic;color:var(--gold); }
        .hero-desc { font-size:clamp(12px,1.3vw,13.5px);font-weight:300;color:var(--ink7);max-width:400px;line-height:1.8; }

        /* ── MODE BAR ── */
        .modebar { padding:18px clamp(20px,6vw,72px) 0;display:flex;align-items:flex-start;gap:18px;flex-wrap:wrap; }
        .modetoggle { display:flex;background:var(--surf);border:1.5px solid var(--bdr2);border-radius:4px;padding:4px;gap:3px;box-shadow:var(--shadow);flex-shrink:0; }
        .modebtn { font-size:10px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;padding:clamp(8px,1.5vw,11px) clamp(14px,2.2vw,22px);border-radius:3px;color:var(--ink7);transition:all .22s;min-height:38px;font-family:var(--ffb); }
        .modebtn.on { background:var(--olive);color:#fff;box-shadow:0 2px 10px rgba(61,80,22,.3); }
        .modehint { font-size:12px;font-weight:300;color:var(--ink7);line-height:1.75;max-width:420px;padding-top:10px; }

        /* ── SECTION HEADER ── */
        .sec-header { margin-bottom:20px; }
        .sec-label { font-size:8px;letter-spacing:.42em;text-transform:uppercase;color:var(--ink4);font-weight:600;display:flex;align-items:center;gap:12px;margin-bottom:8px; }
        .sec-label::after { content:'';flex:1;height:1px;background:var(--bdr); }
        .sec-desc { font-size:12px;font-weight:300;color:var(--ink7);line-height:1.7;max-width:560px; }

        /* ── LAYOUT ── */
        .layout { padding:clamp(18px,3vw,28px) clamp(20px,6vw,72px) clamp(40px,5vw,60px); }

        /* ── CARD GRID ── */
        .cgrid { display:grid;grid-template-columns:repeat(4,1fr);gap:14px; }
        @media(max-width:1100px) { .cgrid { grid-template-columns:repeat(3,1fr);gap:12px; } }
        @media(max-width:800px) { .cgrid { grid-template-columns:repeat(2,1fr);gap:10px; } }

        /* Custom combo grid — 3 cards max */
        .cgrid-custom { display:grid;grid-template-columns:repeat(3,1fr);gap:14px; }
        @media(max-width:800px) { .cgrid-custom { grid-template-columns:repeat(2,1fr);gap:10px; } }
        // @media(max-width:500px) { .cgrid-custom { grid-template-columns:1fr;gap:10px; } }

        /* ── COMBO CARD — clean, name below image ── */
        .cc-card { background:var(--surf);border:1px solid var(--bdr);display:flex;flex-direction:column;transition:box-shadow .2s,transform .2s cubic-bezier(.34,1.1,.64,1);overflow:hidden;cursor:pointer; }
        .cc-card:hover { transform:translateY(-3px);box-shadow:var(--shadow-lg);border-color:var(--bdr2); }
        .cc-card.cc-selected { border-color:var(--olive2);box-shadow:0 4px 20px rgba(61,80,22,.18); }
        .cc-img-area { position:relative;aspect-ratio:4/5;overflow:hidden; }
        .cc-img-area img { width:100%;height:100%;object-fit:cover;transition:transform .5s ease; }
        .cc-card:hover .cc-img-area img { transform:scale(1.06); }
        /* NO text overlay on image — just badges */
        .cc-pct-badge { position:absolute;top:8px;right:8px;font-size:8px;font-weight:700;background:var(--olive);color:#fff;padding:3px 8px;font-family:var(--ffb); }
        .cc-label-badge { position:absolute;top:8px;left:8px;font-size:7px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;background:rgba(255,255,255,.93);backdrop-filter:blur(4px);color:var(--ink);padding:3px 8px;font-family:var(--ffb); }
        .cc-selected-check { position:absolute;bottom:8px;right:8px;width:24px;height:24px;background:var(--olive);color:#fff;display:flex;align-items:center;justify-content:center;z-index:2; }
        .cc-chosen-thumbs { position:absolute;top:8px;right:8px;display:flex;flex-direction:column;gap:3px;z-index:3; }
        .cc-chosen-thumb-wrap { position:relative;width:26px;height:26px; }
        .cc-chosen-thumb-img { width:26px;height:26px;object-fit:cover;border:2px solid #fff;border-radius:3px;box-shadow:0 1px 4px rgba(0,0,0,.3); }
        .cc-chosen-thumb-cust { position:absolute;bottom:-2px;right:-2px;font-size:7px;color:var(--gold);background:#fff;border-radius:50%;width:11px;height:11px;display:flex;align-items:center;justify-content:center; }
        .cc-chosen-thumb-more { width:26px;height:26px;background:var(--olive);color:#fff;font-size:8px;font-weight:700;display:flex;align-items:center;justify-content:center;border-radius:3px;font-family:var(--ffb); }
        .cc-color-strip { height:2px;flex-shrink:0; }

        /* Card body — all content below image */
        .cc-body { padding:10px 11px 13px;display:flex;flex-direction:column;gap:5px; }
        .cc-name { font-family:var(--ffd);font-size:1rem;font-weight:500;color:var(--ink);line-height:1.25; }
        .cc-price-row { display:flex;align-items:baseline;gap:6px;flex-wrap:wrap; }
        .cc-price { font-family:var(--ffd);font-size:.95rem;font-weight:600;color:var(--olive); }
        .cc-original { font-size:9px;color:var(--ink4);text-decoration:line-through;font-family:var(--ffb); }
        .cc-save-tag { font-size:8px;font-weight:700;color:var(--green);background:rgba(42,96,48,.08);padding:2px 6px;font-family:var(--ffb); }
        .cc-slot-pick-label { font-size:9px;font-weight:600;color:var(--olive2);background:var(--olivedim);padding:2px 8px;border-radius:50px;font-family:var(--ffb); }
        .cc-slot-progress { display:flex;align-items:center;gap:8px; }
        .cc-slot-progress-track { flex:1;height:3px;background:var(--bdr);border-radius:2px;overflow:hidden; }
        .cc-slot-progress-fill { height:100%;background:var(--olive);border-radius:2px;transition:width .3s ease; }
        .cc-slot-progress-text { font-size:8px;font-weight:600;color:var(--olive2);white-space:nowrap;font-family:var(--ffb); }
        .cc-meta-row { display:flex;align-items:center;gap:8px; }
        .cc-pieces-count { font-size:9px;color:var(--ink4);font-family:var(--ffb); }
        .cc-cust-dot { font-size:9px;color:var(--olive2);font-weight:500;font-family:var(--ffb); }
        .cc-cta-hint { font-size:8px;color:var(--gold);font-weight:600;letter-spacing:.04em;font-family:var(--ffb); }
        .cc-selected .cc-cta-hint { color:var(--olive); }

        /* ── PANEL BACKDROP ── */
        .panel-backdrop { position:fixed;inset:0;z-index:400;background:rgba(10,12,5,.4);backdrop-filter:blur(4px);animation:fadeIn .2s ease; }

        /* ── SIDE PANEL ── */
        .side-panel { position:fixed;top:0;right:0;bottom:0;z-index:401;width:min(460px,96vw);background:var(--surf);border-left:1px solid var(--bdr);display:flex;flex-direction:column;box-shadow:-8px 0 40px rgba(26,29,13,.15);animation:slideIn .28s cubic-bezier(.34,1.05,.64,1);overflow:hidden; }
        @keyframes slideIn { from{transform:translateX(100%)} to{transform:translateX(0)} }
        @media(max-width:600px) {
          .side-panel { top:auto;right:0;left:0;bottom:0;width:100%;max-height:88dvh;border-left:none;border-top:1px solid var(--bdr);border-radius:16px 16px 0 0;animation:slideUp .28s cubic-bezier(.34,1.05,.64,1); }
          @keyframes slideUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
        }
        .panel-head { display:flex;align-items:flex-start;justify-content:space-between;padding:16px 18px 14px;background:linear-gradient(135deg,var(--olivedim),#ede9d8);border-bottom:1px solid var(--bdr);flex-shrink:0; }
        .panel-eyebrow { font-size:8px;font-weight:600;letter-spacing:.22em;text-transform:uppercase;color:var(--sage);margin-bottom:3px;display:block; }
        .panel-title { font-family:var(--ffd);font-size:1.15rem;font-weight:500;color:var(--olive); }
        .panel-head-right { display:flex;align-items:center;gap:10px;flex-shrink:0;margin-left:12px; }
        .panel-prog { font-size:9px;font-weight:600;color:var(--olive2);background:var(--olivedim);border:1px solid rgba(90,110,43,.25);padding:3px 9px;white-space:nowrap;font-family:var(--ffb); }
        .panel-prog.done-prog { color:var(--green);border-color:rgba(42,96,48,.3); }
        .panel-close { width:32px;height:32px;display:flex;align-items:center;justify-content:center;color:var(--ink4);background:rgba(255,255,255,.6);border:1px solid var(--bdr);transition:all .15s; }
        .panel-close:hover { background:#fff;color:var(--ink); }
        .panel-thumbs { display:flex;gap:8px;overflow-x:auto;padding:12px 16px;border-bottom:1px solid var(--bdr);flex-shrink:0;scroll-snap-type:x mandatory; }
        .panel-thumbs::-webkit-scrollbar { height:3px; }
        .panel-thumbs::-webkit-scrollbar-thumb { background:var(--bdr2); }
        .panel-thumb { flex-shrink:0;width:56px;height:56px;position:relative;overflow:hidden;border:2px solid var(--bdr);cursor:pointer;transition:all .18s;scroll-snap-align:start;background:none;padding:0; }
        .panel-thumb img { width:100%;height:100%;object-fit:cover; }
        .panel-thumb:hover { border-color:var(--olive2); }
        .panel-thumb.active { border-color:var(--olive); }
        .panel-thumb.done { border-color:var(--gold); }
        .panel-thumb-check { position:absolute;bottom:2px;right:2px;width:14px;height:14px;background:var(--gold);color:#fff;font-size:7px;font-weight:700;display:flex;align-items:center;justify-content:center; }
        .panel-detail { display:flex;gap:14px;padding:16px 18px;border-bottom:1px solid var(--bdr);flex-shrink:0; }
        .panel-detail-img { width:90px;height:90px;flex-shrink:0;overflow:hidden;border:1px solid var(--bdr);position:relative; }
        .panel-detail-img-link { display:block;width:100%;height:100%;text-decoration:none; }
        .panel-detail-img-link img { width:100%;height:100%;object-fit:cover; }
        .panel-detail-img-overlay { position:absolute;inset:0;background:rgba(61,80,22,0);display:flex;align-items:center;justify-content:center;transition:background .2s; }
        .panel-detail-img-link:hover .panel-detail-img-overlay { background:rgba(61,80,22,.3); }
        .panel-detail-info { flex:1;min-width:0;display:flex;flex-direction:column;gap:4px; }
        .panel-detail-name-link { text-decoration:none;color:inherit; }
        .panel-detail-name-link:hover .panel-detail-name { text-decoration:underline;text-decoration-color:var(--bdr2);text-underline-offset:3px; }
        .panel-detail-name { font-size:13px;font-weight:600;color:var(--ink);line-height:1.3;font-family:var(--ffb); }
        .panel-detail-price { font-size:12px;font-weight:600;color:var(--olive2);font-family:var(--ffb); }
        .panel-customise-btn { margin-top:5px;font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--olive);border:1.5px solid var(--olive2);padding:7px 12px;transition:all .18s;align-self:flex-start;min-height:32px;font-family:var(--ffb); }
        .panel-customise-btn:hover { background:var(--olive);color:#fff; }
        .panel-nav { display:flex;align-items:center;justify-content:space-between;padding:10px 18px;border-bottom:1px solid var(--bdr);flex-shrink:0; }
        .panel-nav-btn { font-size:10px;font-weight:600;color:var(--olive);letter-spacing:.08em;padding:6px 14px;border:1.5px solid var(--bdr2);transition:all .18s;min-height:34px;font-family:var(--ffb); }
        .panel-nav-btn:hover:not(:disabled) { border-color:var(--olive);background:var(--olivedim); }
        .panel-nav-btn:disabled { opacity:.35;cursor:default; }
        .panel-nav-count { font-size:10px;color:var(--ink4);font-family:var(--ffb); }
        .panel-tip { margin:10px 18px;padding:8px 13px;background:rgba(184,152,42,.08);font-size:9.5px;color:var(--olive2);text-align:center; }
        .panel-cart-footer { padding:12px 18px 18px;border-top:1px solid var(--bdr);background:#fafaf6;flex-shrink:0;margin-top:auto; }
        .panel-cart-meta { display:flex;align-items:center;gap:12px; }
        .panel-cart-meta-left { flex:1;min-width:0; }
        .panel-cart-label { display:block;font-size:7.5px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--ink4);margin-bottom:3px;font-family:var(--ffb); }
        .panel-cart-pricing { display:flex;align-items:baseline;gap:7px;flex-wrap:wrap; }
        .panel-cart-price { font-family:var(--ffd);font-size:1.15rem;font-weight:600;color:var(--ink); }
        .panel-cart-original { font-size:10px;color:var(--ink4);text-decoration:line-through;font-family:var(--ffb); }
        .panel-cart-save { font-size:8px;font-weight:700;color:var(--green);background:rgba(42,96,48,.08);padding:2px 7px;font-family:var(--ffb); }
        .panel-cart-btn { flex-shrink:0;display:flex;align-items:center;justify-content:center;gap:7px;font-size:9px;font-weight:700;letter-spacing:.13em;text-transform:uppercase;color:#fff;background:var(--olive);padding:12px 18px;min-height:44px;border-radius:3px;box-shadow:0 4px 14px rgba(61,80,22,.25);transition:all .2s;border:none;cursor:pointer;font-family:var(--ffb); }
        .panel-cart-btn:hover { background:#2e3c0e;transform:translateY(-1px); }
        .panel-cart-btn.done { background:var(--green) !important; }

        /* ── SLOT PANEL ── */
        .slot-progress-wrap { height:3px;background:var(--bdr);flex-shrink:0; }
        .slot-progress-bar { height:100%;background:var(--olive);transition:width .3s ease; }
        .slot-hint { font-size:10px;color:var(--olive2);font-weight:500;padding:8px 18px;background:var(--olivedim);flex-shrink:0;border-bottom:1px solid var(--bdr);line-height:1.5; }
        .slot-hint.slot-hint-done { color:var(--green);background:rgba(42,96,48,.06); }
        .slot-prod-scroll { flex:1;overflow-y:auto; }
        .slot-prod-scroll::-webkit-scrollbar { width:3px; }
        .slot-prod-scroll::-webkit-scrollbar-thumb { background:var(--bdr2); }

        /* Smaller product grid for slot picker */
        .slot-prod-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:8px;padding:10px 12px 12px; }
        @media(max-width:600px) { .slot-prod-grid { grid-template-columns:repeat(3,1fr);gap:6px;padding:8px 10px; } }
        @media(max-width:380px) { .slot-prod-grid { grid-template-columns:repeat(2,1fr);gap:6px;padding:8px 10px; } }

        /* Smaller slot product card — 4:5 ratio maintained */
        .sp-card { background:var(--surf);border:1.5px solid var(--bdr);display:flex;flex-direction:column;transition:all .2s; }
        .sp-card:hover:not(.sp-disabled) { border-color:var(--olive2);transform:translateY(-2px);box-shadow:0 4px 12px rgba(26,29,13,.09); }
        .sp-chosen { border-color:var(--gold);box-shadow:0 0 0 2px rgba(184,152,42,.15); }
        .sp-disabled { opacity:.45; }
        .sp-img { position:relative;aspect-ratio:4/5;overflow:hidden; }
        .sp-img-link { display:block;width:100%;height:100%;text-decoration:none;position:relative;z-index:0; }
        .sp-img-link img { width:100%;height:100%;object-fit:cover;transition:transform .3s;display:block; }
        .sp-card:hover:not(.sp-disabled) .sp-img-link img { transform:scale(1.05); }
        .sp-img-pdp-hint { position:absolute;bottom:3px;right:3px;width:18px;height:18px;background:rgba(61,80,22,.7);display:flex;align-items:center;justify-content:center;border-radius:2px;opacity:0;transition:opacity .2s; }
        .sp-img-link:hover .sp-img-pdp-hint { opacity:1; }
        .sp-img-toggle { position:absolute;inset:0;width:100%;height:100%;background:transparent;border:none;cursor:pointer;padding:0;z-index:1; }
        .sp-img-toggle:disabled { cursor:default; }
        .sp-chosen-overlay { position:absolute;inset:0;background:rgba(61,80,22,.4);display:flex;align-items:center;justify-content:center;pointer-events:none; }
        /* NAME BELOW IMAGE */
        .sp-body { padding:5px 6px 7px;display:flex;flex-direction:column;gap:3px; }
        .sp-name-link { text-decoration:none;color:inherit; }
        .sp-name-link:hover .sp-name { color:var(--olive); }
        .sp-name { font-size:9px;font-weight:500;color:var(--ink);line-height:1.3;font-family:var(--ffb); }
        .sp-no-cust-note { font-size:7.5px;color:var(--ink4);font-style:italic;font-family:var(--ffb); }
        .sp-actions { display:flex;flex-direction:column;gap:2px; }
        .sp-cust-btn { font-size:7px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--olive);border:1.5px solid var(--olive2);padding:3px 0;min-height:22px;transition:all .18s;font-family:var(--ffb); }
        .sp-cust-btn:hover { background:var(--olive);color:#fff; }
        .sp-remove-btn { font-size:7px;font-weight:500;text-transform:uppercase;letter-spacing:.05em;color:var(--ink4);border:1px solid var(--bdr2);padding:3px 0;min-height:20px;transition:all .18s;font-family:var(--ffb); }
        .sp-remove-btn:hover { color:var(--red);border-color:var(--red); }
        .sp-add-btn { font-size:7px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--olive);border:1.5px solid var(--olive2);padding:4px 0;min-height:22px;transition:all .18s;margin-top:2px;background:var(--olivedim);cursor:pointer;font-family:var(--ffb); }
        .sp-add-btn:hover:not(:disabled) { background:var(--olive);color:#fff;border-color:var(--olive); }
        .sp-add-btn:disabled { opacity:.4;cursor:not-allowed;background:transparent; }

        /* Selected strip */
        .slot-selected-strip { padding:8px 14px;border-top:1px solid var(--bdr);background:#fafaf6;flex-shrink:0; }
        .slot-selected-label { font-size:7.5px;font-weight:600;letter-spacing:.15em;text-transform:uppercase;color:var(--ink4);margin-bottom:5px;display:flex;align-items:center;gap:4px;font-family:var(--ffb); }
        .slot-cust-count { color:var(--gold);font-weight:600; }
        .slot-selected-thumbs { display:flex;gap:5px;flex-wrap:wrap; }
        .slot-sel-thumb { position:relative;width:36px;height:36px;border:1.5px solid var(--bdr2);overflow:visible; }
        .slot-sel-thumb img { width:100%;height:100%;object-fit:cover;display:block; }
        .slot-sel-thumb-cust { border-color:var(--gold); }
        .slot-sel-cust-dot { position:absolute;bottom:-4px;left:-4px;font-size:7px;color:var(--gold);background:#fff;border-radius:50%;width:12px;height:12px;display:flex;align-items:center;justify-content:center;box-shadow:0 1px 3px rgba(0,0,0,.15);z-index:2; }
        .slot-sel-remove { position:absolute;top:-5px;right:-5px;width:14px;height:14px;background:var(--red);color:#fff;border:none;border-radius:50%;font-size:10px;line-height:1;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:2;padding:0; }
        .slot-panel-footer { padding:10px 14px 14px;border-top:1px solid var(--bdr);background:#fafaf6;flex-shrink:0; }
        .slot-footer-row { display:flex;align-items:center;gap:12px; }
        .slot-footer-price { flex:1;min-width:0; }
        .slot-footer-price-lbl { display:block;font-size:7.5px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--ink4);margin-bottom:2px;font-family:var(--ffb); }
        .slot-footer-price-val { font-family:var(--ffd);font-size:1.1rem;font-weight:600;color:var(--ink); }
        .slot-cart-btn { flex-shrink:0;display:flex;align-items:center;justify-content:center;gap:7px;font-size:9px;font-weight:700;letter-spacing:.13em;text-transform:uppercase;color:#fff;background:var(--olive);padding:12px 16px;min-height:44px;border-radius:3px;box-shadow:0 4px 14px rgba(61,80,22,.25);transition:all .2s;border:none;cursor:pointer;font-family:var(--ffb); }
        .slot-cart-btn:hover { background:#2e3c0e;transform:translateY(-1px); }
        .slot-cart-btn.done { background:var(--green) !important; }
        .slot-done-btn { width:100%;font-size:9px;font-weight:600;letter-spacing:.13em;text-transform:uppercase;color:var(--ink4);background:transparent;padding:13px;min-height:44px;border:1.5px solid var(--bdr2);border-radius:3px;transition:all .2s;cursor:pointer;font-family:var(--ffb); }
        .slot-done-btn:hover { border-color:var(--ink4);color:var(--ink); }

        /* ── RESPONSIVE ── */
        @media(max-width:760px) {
          .hero,.modebar,.layout { padding-left:14px;padding-right:14px; }
          .hero { margin-top:48px;padding-top:24px; }
          .layout { padding-top:16px;padding-bottom:32px; }
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
              ? 'Pick a curated hamper, tap to view & personalise each piece, then add to cart.'
              : "Choose a combo bundle, pick your pieces and customise each one as you add it, then add to cart."}
          </p>
        </div>

        {mode === 'preset' && panelCombo && (
          <SidePanel
            combo={panelCombo}
            variants={presetVariants}
            onVariantChange={(pid, v) => setPresetVariants(prev => ({ ...prev, [pid]: v }))}
            onClose={() => setPanelComboId(null)}
            onAddToCart={() => handlePresetAddToCart(panelCombo)}
            cartAdded={!!presetCartAdded[panelCombo.id]}
            gender={gender}
          />
        )}

        {mode === 'custom' && openSlot && (
          <SlotPanel
            slot={openSlot}
            selectedIds={slotSelections[openSlot.id] || []}
            variants={slotVariants[openSlot.id] || {}}
            onToggle={pid => handleSlotToggle(openSlot.id, pid)}
            onVariantChange={(pid, v) => handleSlotVariantChange(openSlot.id, pid, v)}
            onClose={() => setOpenSlotId(null)}
            onAddToCart={() => handleCustomAddToCart(openSlot)}
            cartAdded={!!customCartAdded[openSlot.id]}
            gender={gender}
          />
        )}

        <div className="layout">
          {mode === 'preset' ? (
            <>
              <div className="sec-header">
                <div className="sec-label">Choose a Hamper Set</div>
                {/* <p className="sec-desc">Each set is a curated collection of complementary jewellery pieces. Tap any set to view the individual pieces and personalise them before adding to your cart.</p> */}
              </div>
              <div className="cgrid">
                {presetCombos.map(combo => (
                  <ComboCard
                    key={combo.id}
                    combo={combo}
                    selected={selectedComboId === combo.id}
                    onSelect={() => setSelectedComboId(combo.id)}
                    variants={presetVariants}
                    onOpenPanel={() => setPanelComboId(combo.id)}
                  />
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="sec-header">
                <div className="sec-label">Build Your Own Combo</div>
                {/* <p className="sec-desc">Choose a bundle size, then hand-pick your favourite pieces from our collection. Customise each one with your preferred colour, size, and a personal message as you go.</p> */}
              </div>
              <div className="cgrid-custom">
                {customSlots.map(slot => (
                  <CustomSlotCard
                    key={slot.id}
                    slot={slot}
                    selectedIds={slotSelections[slot.id] || []}
                    variants={slotVariants[slot.id] || {}}
                    onOpenPanel={() => setOpenSlotId(slot.id)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}