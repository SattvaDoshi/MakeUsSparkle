
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

function normaliseKey(s: string) {
  return s.trim().toLowerCase();
}

function isColourVariantName(name: string) {
  const n = normaliseKey(name);
  return n === 'colour' || n === 'color' || n === 'colours' || n === 'colors';
}

function isSizeVariantName(name: string) {
  const n = normaliseKey(name);
  return n === 'size' || n === 'sizes';
}

function lookupColorImage(colorImages: Record<string, string> | undefined, option: string) {
  if (!colorImages) return undefined;
  if (colorImages[option]) return colorImages[option];
  const target = normaliseKey(option);
  const match = Object.keys(colorImages).find(k => normaliseKey(k) === target);
  return match ? colorImages[match] : undefined;
}

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

const COLOURS = [{name:'Gold'}, {name:'Silver'}, {name:'Rose Gold'}, {name:'Antique Gold'}];
const SIZES   = [{name:'XS'}, {name:'S'}, {name:'M'}, {name:'L'}, {name:'XL'}];

const ALL_PRODUCTS: ComboProduct[] = [
  {
    id: 'r1', name: 'Floral Solitaire Ring', price: 1299, image: IMG.ring1,
    description: 'A delicate floral-cut solitaire designed for everyday wear, finished with a hand-polished band that catches the light from every angle.',
    customisable: true, variants: [{name: 'Colour', options: COLOURS}, {name: 'Size', options: [{name:'5'},{name:'6'},{name:'7'},{name:'8'},{name:'9'}]}],
    colorImages: { Gold: IMG.ring1, Silver: IMG.ring2, 'Rose Gold': IMG.ring3, 'Antique Gold': IMG.ring1 },
  },
  {
    id: 'r2', name: 'Twisted Band Ring', price: 999, image: IMG.ring2,
    description: 'A sculptural twisted band that adds subtle texture and movement — pairs beautifully with stacking rings.',
    customisable: true, variants: [{name: 'Colour', options: COLOURS}, {name: 'Size', options: [{name:'5'},{name:'6'},{name:'7'},{name:'8'},{name:'9'}]}],
    colorImages: { Gold: IMG.ring2, Silver: IMG.ring1, 'Rose Gold': IMG.ring3, 'Antique Gold': IMG.ring2 },
  },
  {
    id: 'r3', name: 'Stacking Midi Ring', price: 799, image: IMG.ring3,
    description: 'A slim, understated midi ring made for layering — light enough to wear two or three at once.',
    customisable: false, variants: [{name: 'Colour', options: COLOURS}, {name: 'Size', options: [{name:'5'},{name:'6'},{name:'7'},{name:'8'}]}],
    colorImages: { Gold: IMG.ring3, Silver: IMG.ring2, 'Rose Gold': IMG.ring1, 'Antique Gold': IMG.ring3 },
  },
  {
    id: 'n1', name: 'Layered Gold Necklace', price: 1899, image: IMG.necklace1,
    description: 'Three fine chains of varying lengths layered into one piece, so you get the "stacked necklace" look without the tangle.',
    customisable: true, variants: [{name: 'Colour', options: [{name:'Gold'},{name:'Rose Gold'}]}, {name: 'Size', options: SIZES}],
    colorImages: { Gold: IMG.necklace1, 'Rose Gold': IMG.necklace3 },
  },
  {
    id: 'n2', name: 'Delicate Pearl Pendant', price: 1499, image: IMG.necklace2,
    description: 'A single freshwater pearl set on a thread-thin chain — quiet, classic, and easy to dress up or down.',
    customisable: true, variants: [{name: 'Colour', options: COLOURS}, {name: 'Size', options: SIZES}],
    colorImages: { Gold: IMG.necklace2, Silver: IMG.necklace1, 'Rose Gold': IMG.necklace3, 'Antique Gold': IMG.necklace2 },
  },
  {
    id: 'n3', name: 'Antique Coin Necklace', price: 2199, image: IMG.necklace3,
    description: 'An heirloom-inspired coin pendant with a hand-finished antique texture, designed to feel like it has a story behind it.',
    customisable: true, variants: [{name: 'Colour', options: [{name:'Gold'},{name:'Antique Gold'}]}, {name: 'Size', options: SIZES}],
    colorImages: { Gold: IMG.necklace3, 'Antique Gold': IMG.necklace1 },
  },
  {
    id: 'e1', name: 'Jhumki Drop Earrings', price: 1199, image: IMG.earring1,
    description: 'Traditional jhumki silhouette with a soft bell drop — lightweight enough for all-day wear, festive enough for evenings.',
    customisable: true, variants: [{name: 'Colour', options: COLOURS}, {name: 'Size', options: []}],
    colorImages: { Gold: IMG.earring1, Silver: IMG.earring2, 'Rose Gold': IMG.earring3, 'Antique Gold': IMG.earring1 },
  },
  {
    id: 'e2', name: 'Minimal Hoop Earrings', price: 799, image: IMG.earring2,
    description: 'Clean, medium-width hoops that work as an everyday staple — the kind you forget you\'re wearing.',
    customisable: false, variants: [{name: 'Colour', options: COLOURS}, {name: 'Size', options: []}],
    colorImages: { Gold: IMG.earring2, Silver: IMG.earring1, 'Rose Gold': IMG.earring3, 'Antique Gold': IMG.earring2 },
  },
  {
    id: 'e3', name: 'Chandelier Statement Earrings', price: 1699, image: IMG.earring3,
    description: 'Tiered, cascading drops built for occasion wear — the piece that carries an outfit on its own.',
    customisable: true, variants: [{name: 'Colour', options: COLOURS}, {name: 'Size', options: []}],
    colorImages: { Gold: IMG.earring3, Silver: IMG.earring2, 'Rose Gold': IMG.earring1, 'Antique Gold': IMG.earring3 },
  },
  {
    id: 'b1', name: 'Kundan Bangle Set', price: 2499, image: IMG.bangle1,
    description: 'A set of hand-set kundan bangles inspired by traditional bridal craftsmanship — sold as a stackable set of two.',
    customisable: true, variants: [{name: 'Colour', options: [{name:'Gold'},{name:'Antique Gold'}]}, {name: 'Size', options: [{name:'2.4'},{name:'2.6'},{name:'2.8'}]}],
    colorImages: { Gold: IMG.bangle1, 'Antique Gold': IMG.bangle3 },
  },
  {
    id: 'b2', name: 'Slim Gold Bangle', price: 1299, image: IMG.bangle2,
    description: 'A slim, polished bangle designed to stack cleanly with other pieces or stand alone.',
    customisable: false, variants: [{name: 'Colour', options: COLOURS}, {name: 'Size', options: [{name:'2.4'},{name:'2.6'},{name:'2.8'}]}],
    colorImages: { Gold: IMG.bangle2, Silver: IMG.bangle1, 'Rose Gold': IMG.bangle3, 'Antique Gold': IMG.bangle2 },
  },
  {
    id: 'b3', name: 'Beaded Charm Bracelet', price: 999, image: IMG.bangle3,
    description: 'A playful beaded bracelet finished with a single signature charm — an easy everyday layering piece.',
    customisable: true, variants: [{name: 'Colour', options: COLOURS}, {name: 'Size', options: [{name:'2.4'},{name:'2.6'},{name:'2.8'}]}],
    colorImages: { Gold: IMG.bangle3, Silver: IMG.bangle2, 'Rose Gold': IMG.bangle1, 'Antique Gold': IMG.bangle3 },
  },
];

const byId = (id: string) => ALL_PRODUCTS.find(p => p.id === id)!;

const PRESET_COMBOS: PresetCombo[] = [
  {
    id: 'pc1', name: 'Bridal Glow Set',
    tagline: 'The complete bridal jewellery edit — layered, luminous, unforgettable.',
    price: 5499, originalPrice: 7396,
    image: IMG.combo1, badge: 'Best Seller',
    includedProducts: [byId('n3'), byId('e1'), byId('b1'), byId('r1')],
  },
  {
    id: 'pc2', name: 'Everyday Minimal Set',
    tagline: 'Understated elegance for every day, wherever it takes you.',
    price: 2999, originalPrice: 3997,
    image: IMG.combo2, badge: 'New Arrival',
    includedProducts: [byId('n2'), byId('e2'), byId('r2')],
  },
  {
    id: 'pc3', name: 'Statement Night Set',
    tagline: 'Turn heads at every occasion with this bold, layered edit.',
    price: 4299, originalPrice: 5597,
    image: IMG.combo3, badge: 'Limited',
    includedProducts: [byId('n1'), byId('e3'), byId('b1'), byId('r3')],
  },
  {
    id: 'pc4', name: 'Pearl & Gold Duo',
    tagline: 'A timeless pearl-and-gold pairing for effortless days.',
    price: 2699, originalPrice: 3398,
    image: IMG.combo4, badge: '',
    includedProducts: [byId('n2'), byId('e2')],
  },
];

const CUSTOM_SLOTS: CustomComboSlot[] = [
  {
    id: 'cs1', name: 'Any 3 for ₹1,999',
    tagline: 'Pick 3 pieces from our ring & earring edit',
    maxItems: 3, fixedPrice: 1999,
    image: IMG.ring1, badge: 'Save up to 40%',
    allowedProducts: [byId('r1'), byId('r2'), byId('r3'), byId('e1'), byId('e2'), byId('e3')],
  },
  {
    id: 'cs2', name: 'Any 4 for ₹3,499',
    tagline: 'Build your dream necklace & bangle stack',
    maxItems: 4, fixedPrice: 3499,
    image: IMG.necklace1, badge: 'Most Popular',
    allowedProducts: [byId('n1'), byId('n2'), byId('n3'), byId('b1'), byId('b2'), byId('b3')],
  },
  {
    id: 'cs3', name: 'Any 5 for ₹4,999',
    tagline: 'Full head-to-toe jewellery wardrobe',
    maxItems: 5, fixedPrice: 4999,
    image: IMG.combo2, badge: 'Best Value',
    allowedProducts: ALL_PRODUCTS,
  },
];

export function hasCustomisation(v: ProductVariant) {
  return (v.selections && Object.keys(v.selections).length > 0) || !!v.presetMessage || !!v.personalMessage || !!v.uploadedImageBase64 || (v.uploadedImagesBase64 && v.uploadedImagesBase64.length > 0);
}

/** Returns the list of variant groups (colour/size/etc.) that require a mandatory selection for a product. */
function getRequiredVariants(product: ComboProduct) {
  return (product.variants || []).filter(v => v.options && v.options.length > 0);
}

/** True only if every mandatory variant (colour, size, etc.) has been selected for this product. */
function isProductSelectionComplete(product: ComboProduct, v: ProductVariant) {
  const required = getRequiredVariants(product);
  if (required.length === 0) return true;
  return required.every(variant => !!v.selections?.[variant.name]);
}

/** Returns the names of variant groups still missing a selection. */
function getMissingVariantNames(product: ComboProduct, v: ProductVariant) {
  return getRequiredVariants(product)
    .filter(variant => !v.selections?.[variant.name])
    .map(variant => variant.name);
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
   PRICING TIER SELECTOR — side-by-side pill buttons
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

/* ── ACCORDION + POLICY LINKS ── */
function ComboAccordionItem({ emoji, label, children, open, onToggle }: { emoji: string; label: string; children: React.ReactNode; open: boolean; onToggle: () => void }) {
  return (
    <div className={`combo-acc-item${open ? ' combo-acc-item--open' : ''}`}>
      <button className="combo-acc-head" onClick={onToggle}>
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

function ComboNavLinkRow({ emoji, label, href }: { emoji: string; label: string; href: string }) {
  return (
    <Link href={href} className="combo-acc-nav-link">
      <span className="combo-acc-head-left"><span className="combo-acc-emoji">{emoji}</span>{label}</span>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
    </Link>
  );
}

const CANCELLATION_POLICY_TEXT = 'Prepaid orders are not eligible for cancellation, modification, or refund once the order has been placed. For Cash on Delivery (COD) orders, cancellation requests can only be accepted if the order has not yet been processed by our team. Once an order has been processed, no cancellations will be permitted. Refunds are not applicable for prepaid orders or for orders cancelled after processing.';

function ComboPolicySection({ description }: { description?: string }) {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div className="combo-accordion">
      {description && description.trim() && (
        <ComboAccordionItem emoji="💎" label="About This Set" open={open === 'about'} onToggle={() => setOpen(o => (o === 'about' ? null : 'about'))}>
          <p style={{ whiteSpace: 'pre-line' }}>{description}</p>
        </ComboAccordionItem>
      )}
      <ComboAccordionItem emoji="↩️" label="Cancellation Policy" open={open === 'cancel'} onToggle={() => setOpen(o => (o === 'cancel' ? null : 'cancel'))}>
        <p>{CANCELLATION_POLICY_TEXT}</p>
      </ComboAccordionItem>
      <ComboNavLinkRow emoji="🚚" label="Shipping Policy" href="/shipping-policy" />
      <ComboNavLinkRow emoji="🔄" label="Returns & Refund Policy" href="/refund-policy" />
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
        <div>{filterStar !== null && <button className="combo-rev-clear" onClick={() => setFilterStar(null)}>Showing {filterStar}★ only ×</button>}</div>
        {!showForm && <button className="combo-rev-write-btn" onClick={() => setShowForm(true)}>Write a Review</button>}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="combo-rev-card" style={{ marginBottom: 16 }}>
          {errorMsg && <div style={{ color: 'var(--red)', fontSize: 12, marginBottom: 12 }}>{errorMsg}</div>}
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            {[1, 2, 3, 4, 5].map(star => (
              <span key={star} onClick={() => setFormState(s => ({ ...s, rating: star }))} style={{ fontSize: 22, cursor: 'pointer', color: star <= formState.rating ? 'var(--gold)' : '#ccc' }}>★</span>
            ))}
          </div>
          <textarea required placeholder="Share your experience with this set…" value={formState.body} onChange={e => setFormState(s => ({ ...s, body: e.target.value }))} rows={3} className="modal-textarea" style={{ marginBottom: 14 }} />
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
                    <img src={URL.createObjectURL(file)} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }} />
                    <button type="button" onClick={() => setFormState(s => ({ ...s, images: s.images.filter((_, i) => i !== idx) }))} style={{ position: 'absolute', top: -6, right: -6, background: 'var(--red)', color: 'white', border: 'none', borderRadius: '50%', width: 18, height: 18, fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
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

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.currentTarget.files || []);
    if (!files.length) return;
    files.forEach(f => {
      const r = new FileReader();
      r.onload = ev => {
        setLocal(prev => {
          const arr = prev.uploadedImagesBase64 || (prev.uploadedImageBase64 ? [prev.uploadedImageBase64] : []);
          if (arr.length < (product.maxImageUploads || 1)) {
            return { ...prev, uploadedImagesBase64: [...arr, ev.target?.result as string], uploadedImageBase64: undefined };
          }
          return prev;
        });
      };
      r.readAsDataURL(f);
    });
  };
  
  const removeImage = (index: number) => {
    setLocal(prev => {
      const arr = prev.uploadedImagesBase64 || (prev.uploadedImageBase64 ? [prev.uploadedImageBase64] : []);
      const newArr = [...arr];
      newArr.splice(index, 1);
      return { ...prev, uploadedImagesBase64: newArr, uploadedImageBase64: undefined };
    });
  };

  const variants = hideVariants ? [] : (product.variants || []);
  const hasAny  = (local.selections && Object.keys(local.selections).length > 0) || !!local.personalMessage || !!local.uploadedImageBase64;

  const requiredVariants = hideVariants ? [] : getRequiredVariants(product);
  const missing = requiredVariants.filter(variant => !local.selections?.[variant.name]);
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
          {variants.map((variant, idx) => {
            const isRequired = variant.options.length > 0;
            const isMissing = showValidation && isRequired && !local.selections?.[variant.name];
            return (
            <div key={variant.name} className="modal-field">
              <label className="modal-field-label">
                <span className="modal-field-num">{idx + 1}</span>
                {variant.name}
                {isRequired && !local.selections?.[variant.name] && <span className="modal-field-required">required</span>}
                {local.selections?.[variant.name] && <span className="modal-selected-badge">{local.selections[variant.name]}</span>}
              </label>
              <div className={`modal-chips${isMissing ? ' modal-chips-error' : ''}`} style={{ display: 'flex', flexWrap: 'nowrap', overflowX: 'auto', gap: '0.8rem', paddingBottom: '4px' }}>
                {variant.options.map(opt => {
                  const isSelected = local.selections?.[variant.name] === opt.name;
                  return (
                    <button key={opt.name} 
                      className={`chip${isSelected ? ' chip-on' : ''}`}
                      onClick={() => { setShowValidation(false); setLocal(p => ({ ...p, selections: { ...(p.selections || {}), [variant.name]: opt.name } })); }}
                      disabled={opt.stock === 0}
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', padding: '0.5rem', height: 'auto', flexShrink: 0, opacity: opt.stock === 0 ? 0.5 : 1, cursor: opt.stock === 0 ? 'not-allowed' : 'pointer' }}>
                      {opt.image && (
                        <img src={opt.image} alt={opt.name} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }} />
                      )}
                      <span>{opt.name} {opt.stock === 0 ? '(Out of Stock)' : ''}</span>
                    </button>
                  );
                })}
              </div>
              {isMissing && <span className="modal-field-error-text">Please select a {variant.name.toLowerCase()}</span>}
            </div>
            );
          })}

          {product.allowTextCustomization && (
            <div className="modal-field">
              <label className="modal-field-label" style={{ marginBottom: '0.4rem' }}>
                <span className="modal-field-num">{msgNum}</span>
                Select Occasion / Template Card
                <span className="modal-field-optional">optional</span>
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
                <span className="modal-field-optional">optional</span>
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
                  <span className="modal-field-optional">optional</span>
                </label>
                <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                  {Array.from({ length: maxCount }).map((_, i) => {
                    const tag = titles[i] || titles[0] || `Photo ${i + 1}`;
                    const currentImg = uploaded[i];
                    
                    return (
                      <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4a5c22' }}>{tag}</span>
                        {currentImg ? (
                          <div className="modal-upload-preview" style={{ position: 'relative', width: 80, height: 80, padding: 0, borderRadius: 8, overflow: 'hidden' }}>
                            <img src={currentImg} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <button type="button" onClick={(e) => { e.preventDefault(); removeImage(i); }} style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.6)', color: 'white', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, border: 'none', cursor: 'pointer' }}>&times;</button>
                          </div>
                        ) : (
                          <label className="modal-upload-zone" style={{ width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: 0, padding: 0 }}>
                            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                const base64String = reader.result as string;
                                const newUploaded = [...uploaded];
                                newUploaded[i] = base64String;
                                setLocal(prev => ({ ...prev, uploadedImagesBase64: newUploaded, uploadedImageBase64: undefined }));
                              };
                              reader.readAsDataURL(file);
                            }} />
                            <div className="modal-upload-empty" style={{ padding: 0 }}>
                              <span className="modal-upload-cta" style={{ fontSize: 24, lineHeight: 1 }}>+</span>
                            </div>
                          </label>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {hasAny && (
            <div className="modal-summary-box">
              <div className="modal-summary-title">Your selections</div>
              <div className="modal-summary-tags">
                {Object.entries(local.selections || {}).map(([key, val]) => (
                  <span key={key} className="modal-sum-tag">{key}: {val}</span>
                ))}
                {local.personalMessage     && <span className="modal-sum-tag">Message added</span>}
                {local.uploadedImagesBase64?.map((_, i) => <span key={i} className="modal-sum-tag">Photo added</span>)}
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
    </div>
  );
}

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

interface PresetHamperSectionProps {
  combo: PresetCombo;
  variants: Record<string, ProductVariant>;
  comboVariant: ProductVariant;
  onComboVariantChange: (v: ProductVariant) => void;
  onVariantChange: (pid: string, v: ProductVariant) => void;
  onAddToCart: (combo: PresetCombo) => void;
  cartAdded: boolean;
  onBack: () => void;
}

function PresetHamperSection({ combo, variants, comboVariant, onComboVariantChange, onVariantChange, onAddToCart, cartAdded, onBack }: PresetHamperSectionProps) {
  const [showValidation, setShowValidation] = useState(false);
  const [activeComboImgIdx, setActiveComboImgIdx] = useState(0);
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
    onVariantChange(pid, { ...v, uploadedImagesBase64: newArr, uploadedImageBase64: undefined });
  };
  
  const removeComboFile = (index: number) => {
    const arr = comboVariant.uploadedImagesBase64 || (comboVariant.uploadedImageBase64 ? [comboVariant.uploadedImageBase64] : []);
    const newArr = [...arr];
    newArr.splice(index, 1);
    onComboVariantChange({ ...comboVariant, uploadedImagesBase64: newArr, uploadedImageBase64: undefined });
  };

  const products = combo.includedProducts;
  const currentPrice = comboVariant.selectedPricingVariant?.price ?? combo.price;
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

  return (
    <div className="hamper-page">
      <button className="hamper-back-btn" onClick={onBack}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        Back to all sets
      </button>

      <div className="hamper-main-block">
        <div>
          <div className="hamper-main-img-wrap">
            <img src={allComboImages[activeComboImgIdx] || safeImageSrc(combo.image)} alt={combo.name} />
            {pct > 0 && <span className="hamper-pct-badge">{pct}% off</span>}
            {combo.badge && <span className="hamper-label-badge">{combo.badge}</span>}
          </div>
          {allComboImages.length > 1 && (
            <div className="hamper-gallery-thumbs" style={{ display: 'flex', gap: '0.5rem', marginTop: '0.6rem', flexWrap: 'wrap' }}>
              {allComboImages.map((imgUrl: string, i: number) => (
                <button
                  key={`${imgUrl}-${i}`}
                  type="button"
                  onClick={() => setActiveComboImgIdx(i)}
                  style={{
                    width: '58px',
                    height: '58px',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    border: activeComboImgIdx === i ? '2px solid #3d4a20' : '1px solid #d4d4c8',
                    padding: 0,
                    cursor: 'pointer',
                    background: '#f5f4ef',
                    opacity: activeComboImgIdx === i ? 1 : 0.75,
                    transition: 'all 0.2s ease',
                    flexShrink: 0,
                  }}
                >
                  <img src={imgUrl} alt={`${combo.name} ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="hamper-main-info">
          <span className="hamper-eyebrow">{combo.badge || 'Curated Set'}</span>
          <h1 className="hamper-title">{combo.name}</h1>
          <p className="hamper-tagline">{combo.tagline}</p>
          {combo.description && <p className="hamper-description" style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#484840', whiteSpace: 'pre-line' }}>{combo.description}</p>}
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
        </div>
      </div>

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
                  <a className="hamper-piece-name-link">
                    <span className="hamper-piece-name">{p.name}</span>
                  </a>
                  {p.price != null && <span className="hamper-piece-price">₹{p.price.toLocaleString('en-IN')}</span>}
                  {p.tags && p.tags.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
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
                        <span className="hamper-piece-field-required">required</span>
                        {selectedOpt && <em>· {selectedOpt}</em>}
                      </span>
                      <div className={`hamper-colour-swatch-row${isMissing ? ' hamper-colour-swatch-row-error' : ''}`}>
                        {variant.options.map(opt => {
                          const isOn = selectedOpt === opt.name;
                          return (
                            <button
                              key={opt.name}
                              type="button"
                              className={`hamper-colour-swatch${isOn ? ' on' : ''}`}
                              aria-pressed={isOn}
                              onClick={() => { setShowValidation(false); onVariantChange(p.id, { ...v, selections: { ...(v.selections || {}), [variant.name]: opt.name } }); }}
                              disabled={opt.stock === 0}
                              style={{ opacity: opt.stock === 0 ? 0.5 : 1, cursor: opt.stock === 0 ? 'not-allowed' : 'pointer' }}
                            >
                              {opt.image && (
                                <span className="hamper-colour-swatch-img-wrap">
                                  <img src={opt.image} alt={opt.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </span>
                              )}
                              <span className="hamper-colour-swatch-label">{opt.name} {opt.stock === 0 ? '(Out of Stock)' : ''}</span>
                            </button>
                          );
                        })}
                      </div>
                      {isMissing && <span className="hamper-piece-field-error-text">Please select a {variant.name.toLowerCase()}</span>}
                    </div>
                  );
                })}

                {p.allowTextCustomization && (
                  <div className="hamper-piece-field">
                    <span className="hamper-piece-field-label">Select Occasion / Template Card <span className="modal-field-optional">optional</span></span>
                    <select className="modal-textarea" style={{ marginBottom: '0.6rem', appearance: 'auto' }}
                      value={PRESET_MESSAGES.find(m => m.label === v.presetMessage)?.value || ''}
                      onChange={e => {
                        const val = e.target.value;
                        const msg = PRESET_MESSAGES.find(m => m.value === val)?.label || '';
                        onVariantChange(p.id, { ...v, presetMessage: msg || undefined });
                      }}>
                      {PRESET_MESSAGES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                    <span className="hamper-piece-field-label">{p.textCustomizationTitle || 'Personal Message'} <span className="modal-field-optional">optional</span></span>
                    <textarea
                      className="modal-textarea"
                      placeholder="E.g. 'To my dearest Priya, with love…'"
                      value={v.personalMessage || ''}
                      onChange={e => onVariantChange(p.id, { ...v, personalMessage: e.target.value })}
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
                      <span className="hamper-piece-field-label">Image Customisation <span className="modal-field-optional">optional</span></span>
                      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        {Array.from({ length: maxCount }).map((_, i) => {
                          const tag = titles[i] || titles[0] || `Photo ${i + 1}`;
                          const currentImg = uploaded[i];
                          
                          return (
                            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4a5c22' }}>{tag}</span>
                              {currentImg ? (
                                <div className="modal-upload-preview" style={{ position: 'relative', width: 80, height: 80, padding: 0, borderRadius: 8, overflow: 'hidden' }}>
                                  <img src={currentImg} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                  <button type="button" onClick={(e) => { e.preventDefault(); removeFileFor(p.id, i); }} style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.6)', color: 'white', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, border: 'none', cursor: 'pointer' }}>&times;</button>
                                </div>
                              ) : (
                                <label className="modal-upload-zone" style={{ width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: 0, padding: 0 }}>
                                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      const base64String = reader.result as string;
                                      const newUploaded = [...uploaded];
                                      newUploaded[i] = base64String;
                                      onVariantChange(p.id, { ...v, uploadedImagesBase64: newUploaded, uploadedImageBase64: undefined });
                                    };
                                    reader.readAsDataURL(file);
                                  }} />
                                  <div className="modal-upload-empty" style={{ padding: 0 }}>
                                    <span className="modal-upload-cta" style={{ fontSize: 24, lineHeight: 1 }}>+</span>
                                  </div>
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
          );
        })}
      </div>

      {(combo.allowComboTextCustomization || combo.allowComboImageCustomization) && (
        <>
          <div className="hamper-divider" style={{ margin: "2rem 0" }} />
          <div className="hamper-piece">
            <span className="hamper-piece-index"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg></span>
            <div className="hamper-piece-head">
              <div className="hamper-piece-headinfo" style={{ marginLeft: 0 }}>
                <span className="hamper-piece-name">Box Customisation</span>
              </div>
            </div>
            <p className="hamper-piece-desc">Add a personal touch to the entire hamper box.</p>
            
            <div className="hamper-piece-body">
              {combo.allowComboTextCustomization && (
                <div className="hamper-piece-field">
                  <span className="hamper-piece-field-label">Select Occasion / Template Card <span className="modal-field-optional">optional</span></span>
                  <select className="modal-textarea" style={{ marginBottom: '0.6rem', appearance: 'auto' }}
                    value={PRESET_MESSAGES.find(m => m.label === comboVariant.presetMessage)?.value || ''}
                    onChange={e => {
                      const val = e.target.value;
                      const msg = PRESET_MESSAGES.find(m => m.value === val)?.label || '';
                      onComboVariantChange({ ...comboVariant, presetMessage: msg || undefined });
                    }}>
                    {PRESET_MESSAGES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                  <span className="hamper-piece-field-label">{combo.comboTextCustomizationTitle || 'Personal Message on Box'} <span className="modal-field-optional">optional</span></span>
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
                const uploaded = comboVariant.uploadedImagesBase64 || (comboVariant.uploadedImageBase64 ? [comboVariant.uploadedImageBase64] : []);

                return (
                  <div className="hamper-piece-field">
                    <span className="hamper-piece-field-label">Combo Image Customisation <span className="modal-field-optional">optional</span></span>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      {Array.from({ length: maxCount }).map((_, i) => {
                        const tag = titles[i] || titles[0] || `Photo ${i + 1}`;
                        const currentImg = uploaded[i];
                        
                        return (
                          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4a5c22' }}>{tag}</span>
                            {currentImg ? (
                              <div className="modal-upload-preview" style={{ position: 'relative', width: 80, height: 80, padding: 0, borderRadius: 8, overflow: 'hidden' }}>
                                <img src={currentImg} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <button type="button" onClick={(e) => {
                                  e.preventDefault();
                                  const arr = comboVariant.uploadedImagesBase64 || (comboVariant.uploadedImageBase64 ? [comboVariant.uploadedImageBase64] : []);
                                  const newArr = [...arr];
                                  newArr.splice(i, 1);
                                  onComboVariantChange({ ...comboVariant, uploadedImagesBase64: newArr, uploadedImageBase64: undefined });
                                }} style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.6)', color: 'white', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, border: 'none', cursor: 'pointer' }}>&times;</button>
                              </div>
                            ) : (
                              <label className="modal-upload-zone" style={{ width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: 0, padding: 0 }}>
                                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    const base64String = reader.result as string;
                                    const newUploaded = [...uploaded];
                                    newUploaded[i] = base64String;
                                    onComboVariantChange({ ...comboVariant, uploadedImagesBase64: newUploaded, uploadedImageBase64: undefined });
                                  };
                                  reader.readAsDataURL(file);
                                }} />
                                <div className="modal-upload-empty" style={{ padding: 0 }}>
                                  <span className="modal-upload-cta" style={{ fontSize: 24, lineHeight: 1 }}>+</span>
                                </div>
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
<div className="hamper-divider" style={{ margin: '2rem 0 1.5rem' }} />
<ComboTrustBadges />
<ComboPolicySection description={combo.description} />
<ComboEstimatedDelivery />

      {showValidation && !canAddToCart && (
        <div className="hamper-global-error">
          Please select {incompleteProducts.map(p => p.name).join(', ')} options before adding to cart.
        </div>
      )}

      <div className="hamper-sticky-bar">
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
      <ComboReviewsSection comboId={combo.id} />
    </div>
  );
}

interface CustomBuilderSectionProps {
  slot: CustomComboSlot;
  selectedIds: string[];
  variants: Record<string, ProductVariant>;
  comboVariant: ProductVariant;
  onComboVariantChange: (v: ProductVariant) => void;
  onToggle: (pid: string) => void;
  onVariantChange: (pid: string, v: ProductVariant) => void;
  onAddToCart: (slot: CustomComboSlot) => void;
  cartAdded: boolean;
  onBack: () => void;
  gender?: string;
}

function CustomBuilderSection({ slot, selectedIds, variants, comboVariant, onComboVariantChange, onToggle, onVariantChange, onAddToCart, cartAdded, onBack, gender = 'women' }: CustomBuilderSectionProps) {
  const [customising, setCustomising] = useState<{ product: ComboProduct; isAddFlow: boolean } | null>(null);
  const [activeSlotImgIdx, setActiveSlotImgIdx] = useState(0);
  const allSlotImages = useMemo(() => {
    return [safeImageSrc(slot.image), ...(slot.images || []).map(img => safeImageSrc(img))].filter((v, i, a) => v && a.indexOf(v) === i);
  }, [slot.image, slot.images]);

  useEffect(() => {
    setActiveSlotImgIdx(0);
  }, [slot.id]);

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
  const [expanded, setExpanded] = useState(false);

  if (!slot) return null;

  const remaining = slot.maxItems - selectedIds.length;
  const currentPrice = comboVariant.selectedPricingVariant?.price ?? slot.fixedPrice;
  const selectedProducts = slot.allowedProducts.filter(p => selectedIds.includes(p.id));
  const canAddToCart = selectedIds.length === slot.maxItems;

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
    <div className="builder-page">
      <button className="hamper-back-btn" onClick={onBack}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        Back to bundle options
      </button>

      <div className="builder-header-row" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '1.2rem' }}>
        {allSlotImages.length > 0 && (
          <div style={{ flexShrink: 0 }}>
            <div style={{ width: '120px', height: '120px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--bdr, #d4d4c8)' }}>
              <img src={allSlotImages[activeSlotImgIdx] || safeImageSrc(slot.image)} alt={slot.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            {allSlotImages.length > 1 && (
              <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                {allSlotImages.map((imgUrl: string, i: number) => (
                  <button
                    key={`${imgUrl}-${i}`}
                    type="button"
                    onClick={() => setActiveSlotImgIdx(i)}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: activeSlotImgIdx === i ? '2px solid var(--gold, #c9a84c)' : '1px solid var(--bdr, #d4d4c8)',
                      padding: 0,
                      cursor: 'pointer',
                      background: 'var(--surf, #f5f4ef)',
                      opacity: activeSlotImgIdx === i ? 1 : 0.75,
                    }}
                  >
                    <img src={imgUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        <div style={{ flex: 1, minWidth: '200px' }}>
          <h2 className="builder-header-title">{slot.name}</h2>
          <p className="builder-header-tagline">{slot.tagline}</p>
          {slot.description && <p style={{ marginTop: '0.4rem', fontSize: '0.9rem', color: '#555', whiteSpace: 'pre-line' }}>{slot.description}</p>}
        </div>
      </div>

      {slot.pricingVariants && slot.pricingVariants.length > 0 && (
        <div className="builder-pricing-wrap">
          <PricingTierSelector
            basePrice={slot.fixedPrice}
            pricingVariants={slot.pricingVariants}
            selected={comboVariant.selectedPricingVariant}
            onChange={opt => onComboVariantChange({ ...comboVariant, selectedPricingVariant: opt })}
          />
        </div>
      )}

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
                <a href={`/products/${p.id}?fromCombo=true`} className="builder-card-img-link">
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
                    <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
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
        <div style={{ margin: "2rem auto", padding: "0 1.5rem", maxWidth: "600px" }}>
          <div className="hamper-divider" style={{ margin: "0 0 2rem 0" }} />
          <div className="hamper-piece">
            <span className="hamper-piece-index"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg></span>
            <div className="hamper-piece-head">
              <div className="hamper-piece-headinfo" style={{ marginLeft: 0 }}>
                <span className="hamper-piece-name">Box Customisation</span>
              </div>
            </div>
            <p className="hamper-piece-desc">Add a personal touch to the entire hamper box.</p>
            
            <div className="hamper-piece-body">
              {slot.allowComboTextCustomization && (
                <div className="hamper-piece-field">
                  <span className="hamper-piece-field-label">Select Occasion / Template Card <span className="modal-field-optional">optional</span></span>
                  <select className="modal-textarea" style={{ marginBottom: '0.6rem', appearance: 'auto' }}
                    value={PRESET_MESSAGES.find(m => m.label === comboVariant.presetMessage)?.value || ''}
                    onChange={e => {
                      const val = e.target.value;
                      const msg = PRESET_MESSAGES.find(m => m.value === val)?.label || '';
                      onComboVariantChange({ ...comboVariant, presetMessage: msg || undefined });
                    }}>
                    {PRESET_MESSAGES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                  <span className="hamper-piece-field-label">{slot.comboTextCustomizationTitle || 'Personal Message on Box'} <span className="modal-field-optional">optional</span></span>
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
                  <span className="hamper-piece-field-label">{slot.comboImageCustomizationTitle || 'Upload Photo for Box'} <span className="modal-field-optional">optional</span></span>
                    
                    <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                      {(comboVariant.uploadedImagesBase64 || (comboVariant.uploadedImageBase64 ? [comboVariant.uploadedImageBase64] : [])).map((img, i) => (
                        <div key={i} className="modal-upload-preview" style={{ position: 'relative', width: 80, height: 80, padding: 0, borderRadius: 8, overflow: 'hidden' }}>
                          <img src={img} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button type="button" onClick={(e) => { e.preventDefault(); removeComboFile(i); }} style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.6)', color: 'white', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, border: 'none', cursor: 'pointer' }}>&times;</button>
                        </div>
                      ))}
                      
                      {((comboVariant.uploadedImagesBase64 || (comboVariant.uploadedImageBase64 ? [comboVariant.uploadedImageBase64] : [])).length < (slot.comboMaxImageUploads || 1)) && (
                        <label className="modal-upload-zone" style={{ width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: 0, padding: 0 }}>
                          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleComboFile} multiple />
                          <div className="modal-upload-empty" style={{ padding: 0 }}>
                            <span className="modal-upload-cta" style={{ fontSize: 24, lineHeight: 1 }}>+</span>
                          </div>
                        </label>
                      )}
                    </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
<div style={{ margin: '2rem auto 0', padding: '0 1.5rem', maxWidth: '700px' }}>
  <ComboTrustBadges />
  <ComboPolicySection description={slot.description} />
  <ComboEstimatedDelivery />
  <ComboReviewsSection comboId={slot.id} />
</div>
      {expanded && selectedProducts.length > 0 && (
        <div className="builder-drawer">
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
      )}

      <div className="builder-sticky-bar">
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
          {cartAdded ? 'Added' : `Add to Cart`}
        </button>
      </div>
    </div>
  );
}

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
    addItem({
      id: combo.id, name: combo.name, price: cv.selectedPricingVariant?.price ?? combo.price,
      originalPrice: (cv.selectedPricingVariant?.price ?? combo.price) > combo.price ? combo.originalPrice + ((cv.selectedPricingVariant?.price ?? combo.price) - combo.price) : combo.originalPrice, image: combo.image,
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
    const cv   = comboVariants[slot.id]  || {};
    if (ids.length !== slot.maxItems) return;
    addItem({
      id: `custom-slot-${slot.id}-${Date.now()}`,
      sourceId: slot.id,
      name: slot.name, price: cv.selectedPricingVariant?.price ?? slot.fixedPrice, originalPrice: cv.selectedPricingVariant?.price ?? slot.fixedPrice,
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
        body { font-family: var(--ffb); background: var(--bg); color: var(--ink); overflow-x: hidden; }
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
        .modal-field-required { font-size:8px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--red);padding:2px 7px;border:1px solid rgba(192,57,43,.35);background:rgba(192,57,43,.06);border-radius:50px; }
        .modal-field-error-text { font-size:10.5px;font-weight:500;color:var(--red); }
        .modal-selected-badge { font-size:9px;font-weight:600;text-transform:none;letter-spacing:.03em;background:var(--olivedim);color:var(--olive);border:1px solid rgba(90,110,43,.3);padding:2px 9px;border-radius:50px;margin-left:auto; }
        .modal-chips { display:flex;flex-wrap:wrap;gap:8px; }
        .modal-chips-error { box-shadow: inset 0 0 0 1.5px var(--red); border-radius: 8px; padding: 6px; }
        .chip { font-size:12px;font-weight:500;padding:8px 16px;border-radius:4px;border:1.5px solid var(--bdr2);color:var(--ink7);transition:all .18s;min-height:38px;display:flex;align-items:center;background:transparent;cursor:pointer;font-family:var(--ffb); }
        .chip:hover { border-color:var(--olive2);color:var(--olive);background:var(--olivedim); }
        .chip-on { background:var(--olivedim) !important;color:var(--olive) !important;border-color:var(--olive) !important;font-weight:600 !important;box-shadow:inset 0 0 0 1px var(--olive); }
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
        .modal-btn-save.modal-btn-disabled { background:var(--bdr2);color:var(--ink4);box-shadow:none;cursor:not-allowed; }
        .modal-btn-save.modal-btn-disabled:hover { background:var(--bdr2);transform:none; }

        .cust-compact { display:flex;flex-wrap:wrap;gap:4px;margin-top:3px; }
        .combo-product-tag { font-size:9px;font-weight:600;letter-spacing:.03em;background:var(--olivedim);color:var(--olive);border:1px solid rgba(90,110,43,.3);padding:2px 6px;border-radius:4px;text-transform:uppercase;white-space:nowrap; }
        .cust-chip { font-size:9px;font-weight:500;color:var(--olive);background:var(--olivedim);border:1px solid rgba(90,110,43,.2);padding:2px 8px;border-radius:50px;white-space:nowrap; }

        /* ── PRICING TIER SELECTOR (side-by-side, top of page) ── */
        .pricing-tier-block { margin-top:14px;display:flex;flex-direction:column;gap:8px; }
        .pricing-tier-label { font-size:9px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:var(--ink4); }
        .pricing-tier-row { display:flex;flex-wrap:wrap;gap:10px; }
        .pricing-tier-btn { display:flex;flex-direction:column;align-items:flex-start;gap:2px;padding:9px 16px;border-radius:8px;border:1.5px solid var(--bdr2);background:var(--surf);transition:all .18s;min-width:88px; }
        .pricing-tier-btn:hover { border-color:var(--olive2); }
        .pricing-tier-btn.on { border-color:var(--olive);background:var(--olivedim);box-shadow:inset 0 0 0 1px var(--olive); }
        .pricing-tier-btn-name { font-size:12px;font-weight:700;color:var(--ink); }
        .pricing-tier-btn.on .pricing-tier-btn-name { color:var(--olive); }
        .pricing-tier-btn-price { font-size:11px;font-weight:500;color:var(--ink7); }
        .pricing-tier-btn.on .pricing-tier-btn-price { color:var(--olive2); }
        .builder-pricing-wrap { max-width:1280px;margin:0 auto 18px; }

        /* ── PAGE ── */
        .page { min-height:100dvh;background:var(--bg);overflow-x:hidden;width:100%; }

        /* ── HERO ── */
        .hero { margin-top:56px;padding:clamp(24px,4vw,52px) clamp(16px,6vw,72px) clamp(18px,3vw,36px);background:linear-gradient(155deg,#f5f2eb 0%,#ede5d0 55%,#f5f2eb 100%);border-bottom:1px solid var(--bdr);position:relative;overflow:hidden; }
        .hero::before { content:'';position:absolute;right:-80px;top:-80px;width:360px;height:360px;border-radius:50%;background:radial-gradient(circle,rgba(184,152,42,.1) 0%,transparent 68%);pointer-events:none; }
        .hero-eyebrow { display:flex;align-items:center;gap:10px;font-size:8px;letter-spacing:.44em;text-transform:uppercase;color:var(--gold);font-weight:600;margin-bottom:12px; }
        .hero-line { width:24px;height:1px;background:var(--gold);opacity:.5; }
        .hero h1 { font-family:var(--ffd);font-size:clamp(1.6rem,5vw,3.4rem);font-weight:500;color:var(--olive);line-height:1.1;margin-bottom:10px; }
        .hero h1 em { font-style:italic;color:var(--gold); }
        .hero-desc { font-size:clamp(12px,1.3vw,13.5px);font-weight:300;color:var(--ink7);max-width:400px;line-height:1.8; }

        /* ── MODE BAR ── */
        .modebar { padding:18px clamp(16px,6vw,72px) 0;display:flex;align-items:flex-start;gap:18px;flex-wrap:wrap; }
        .modetoggle { display:flex;background:var(--surf);border:1.5px solid var(--bdr2);border-radius:4px;padding:4px;gap:3px;box-shadow:var(--shadow);flex-shrink:0;width:100%;max-width:340px; }
        .modebtn { flex:1;font-size:10px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;padding:clamp(8px,1.5vw,11px) clamp(10px,2.2vw,22px);border-radius:3px;color:var(--ink7);transition:all .22s;min-height:38px;font-family:var(--ffb);white-space:nowrap; }
        .modebtn.on { background:var(--olive);color:#fff;box-shadow:0 2px 10px rgba(61,80,22,.3); }
        .modehint { font-size:12px;font-weight:300;color:var(--ink7);line-height:1.75;max-width:420px;padding-top:10px; }

        @media(min-width:640px) {
          .modetoggle { width:auto; }
          .modebtn { flex:none; }
        }

        /* ── LAYOUT WRAPPER ── */
        .layout { padding-bottom:clamp(90px,10vw,100px);width:100%; }

        /* ── PRESET / CUSTOM GRID (shared) ── */
        .combo-grid { display:grid;grid-template-columns:repeat(4,1fr);gap:16px;max-width:1280px;margin:0 auto;padding:20px clamp(16px,4vw,52px) 0; width:100%; }
        .combo-card { background:var(--surf);border:1.5px solid var(--bdr);overflow:hidden;display:flex;flex-direction:column;text-align:left;transition:all .2s;min-width:0; }
        .combo-card:hover { border-color:var(--olive2);transform:translateY(-3px);box-shadow:var(--shadow-lg); }
        .combo-card-img-wrap { position:relative;aspect-ratio:4/5;overflow:hidden;background:var(--olivedim); }
        .combo-card-img-wrap img { width:100%;height:100%;object-fit:cover;transition:transform .35s ease; }
        .combo-card:hover .combo-card-img-wrap img { transform:scale(1.06); }
        .combo-card-pct { position:absolute;top:8px;right:8px;font-size:9px;font-weight:700;background:var(--olive);color:#fff;padding:3px 8px;border-radius:4px; }
        .combo-card-badge { position:absolute;top:8px;left:8px;font-size:8px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;background:rgba(255,255,255,.93);color:var(--ink);padding:3px 8px;border-radius:4px;max-width:calc(100% - 16px);overflow:hidden;text-overflow:ellipsis;white-space:nowrap; }
        .combo-card-body { padding:12px;display:flex;flex-direction:column;gap:6px;flex:1;min-width:0; }
        .combo-card-name { font-family:var(--ffd);font-size:1rem;font-weight:600;color:var(--ink);line-height:1.25;word-break:break-word; }
        .combo-card-tagline { font-size:11px;font-weight:300;color:var(--ink7);line-height:1.55;flex:1; }
        .combo-card-price-row { display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;margin-top:auto; }
        .combo-card-price { font-size:13px;font-weight:700;color:var(--olive2); }
        .combo-card-original { font-size:11px;color:var(--ink4);text-decoration:line-through; }
        .combo-card-items-tag { font-size:9px;font-weight:600;color:var(--olive2);background:var(--olivedim);border:1px solid rgba(90,110,43,.2);padding:2px 8px;border-radius:50px;white-space:nowrap; }

        @media(max-width:1200px) { .combo-grid { grid-template-columns:repeat(4,1fr); } }
        @media(max-width:1100px) { .combo-grid { grid-template-columns:repeat(3,1fr); } }
        @media(max-width:900px) { .combo-grid { grid-template-columns:repeat(3,1fr);gap:14px; } }
        @media(max-width:760px) { .combo-grid { grid-template-columns:repeat(2,1fr);gap:12px; } }
        @media(max-width:480px) { .combo-grid { grid-template-columns:repeat(2,1fr);gap:10px;padding-left:12px;padding-right:12px; } }
        @media(max-width:380px) { .combo-grid { grid-template-columns:repeat(2,1fr);gap:9px; } }

        /* ══════════════════ HAMPER (PRESET) — portrait hero + stacked piece list ══════════════════ */
        .hamper-page { padding:20px clamp(16px,4vw,52px) 0;max-width:560px;margin:0 auto;width:100%; }
        .hamper-back-btn { display:flex;align-items:center;gap:6px;font-size:11px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--olive2);margin-bottom:14px; }
        .hamper-back-btn:hover { color:var(--olive); }

        .hamper-main-block { display:flex;flex-direction:column;gap:14px;margin-bottom:22px; }
        .hamper-main-img-wrap { position:relative;width:100%;aspect-ratio:2/3;border-radius:16px;overflow:hidden;background:var(--surf);border:1px solid var(--bdr); }
        .hamper-main-img-wrap img { width:100%;height:100%;object-fit:cover; }
        .hamper-pct-badge { position:absolute;top:10px;right:10px;font-size:10px;font-weight:700;background:var(--olive);color:#fff;padding:4px 10px;border-radius:4px; }
        .hamper-label-badge { position:absolute;top:10px;left:10px;font-size:8px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;background:rgba(255,255,255,.93);color:var(--ink);padding:4px 9px;border-radius:4px; }

        .hamper-main-info { flex:1;min-width:0; }
        .hamper-eyebrow { display:block;font-size:9px;font-weight:600;letter-spacing:.3em;text-transform:uppercase;color:var(--gold);margin-bottom:6px; }
        .hamper-title { font-family:var(--ffd);font-size:clamp(1.5rem,3vw,2rem);font-weight:500;color:var(--olive);line-height:1.15;margin-bottom:6px; }
        .hamper-tagline { font-size:12.5px;font-weight:300;color:var(--ink7);line-height:1.65;margin-bottom:10px; }
        .hamper-price-row { display:flex;align-items:baseline;gap:9px;flex-wrap:wrap; }
        .hamper-price { font-family:var(--ffd);font-size:1.35rem;font-weight:600;color:var(--ink); }
        .hamper-original { font-size:12px;color:var(--ink4);text-decoration:line-through; }
        .hamper-save-tag { font-size:9px;font-weight:700;color:var(--green);background:rgba(42,96,48,.08);padding:3px 8px;border-radius:4px; }

        .hamper-divider { height:1px;background:var(--bdr);margin-bottom:18px; }
        .hamper-section-label-row { display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;flex-wrap:wrap;gap:8px; }
        .hamper-section-label { font-size:9px;letter-spacing:.3em;text-transform:uppercase;color:var(--ink4);font-weight:600; }
        .hamper-cust-progress { font-size:9px;font-weight:600;color:var(--olive2);background:var(--olivedim);border:1px solid rgba(90,110,43,.25);padding:3px 10px;border-radius:50px; }

        .hamper-piece-list { display:flex;flex-direction:column;gap:16px; }
        .hamper-piece { display:flex;flex-direction:column;gap:10px;padding:14px;border-radius:14px;border:1.5px solid var(--bdr);background:var(--surf);position:relative;transition:border-color .2s,box-shadow .2s; }
        .hamper-piece.hamper-piece-error { border-color:var(--red);box-shadow:0 0 0 1px rgba(192,57,43,.25); }
        .hamper-piece-index { position:absolute;top:-8px;left:10px;width:20px;height:20px;border-radius:50%;background:var(--olive);color:#fff;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center; }

        .hamper-piece-head { display:flex;align-items:center;gap:10px; }
        .hamper-piece-img-link { flex-shrink:0;display:block;width:56px;height:56px;border-radius:8px;overflow:hidden;border:1px solid var(--bdr); }
        .hamper-piece-img-link img { width:100%;height:100%;object-fit:cover;transition:transform .3s; }
        .hamper-piece-img-link:hover img { transform:scale(1.06); }
        .hamper-piece-headinfo { flex:1;min-width:0;display:flex;flex-direction:column;gap:2px; }
        .hamper-piece-name-link { text-decoration:none;color:inherit; }
        .hamper-piece-name-link:hover .hamper-piece-name { text-decoration:underline;text-decoration-color:var(--bdr2); }
        .hamper-piece-name { font-size:13px;font-weight:600;color:var(--ink); }
        .hamper-piece-price { font-size:11.5px;font-weight:600;color:var(--olive2); }

        .hamper-piece-desc { font-size:11.5px;font-weight:300;color:var(--ink7);line-height:1.6; }

        .hamper-piece-body { display:flex;flex-direction:column;gap:9px; }
        .hamper-piece-variant-img { width:100%;aspect-ratio:1/1;border-radius:10px;overflow:hidden;background:var(--olivedim);border:1px solid var(--bdr); }
        .hamper-piece-variant-img img { width:100%;height:100%;object-fit:cover; }
        .hamper-piece-field { display:flex;flex-direction:column;gap:6px; }
        .hamper-piece-field-label { font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--ink);display:flex;align-items:center;gap:6px;flex-wrap:wrap; }
        .hamper-piece-field-label em { font-style:normal;color:var(--olive2);text-transform:none;letter-spacing:0;font-weight:600; }
        .hamper-piece-field-required { font-size:8px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--red);padding:2px 7px;border:1px solid rgba(192,57,43,.35);background:rgba(192,57,43,.06);border-radius:50px; }
        .hamper-piece-field-error-text { font-size:10.5px;font-weight:500;color:var(--red); }
        .hamper-chip-row { display:flex;flex-wrap:wrap;gap:6px; }
        .hamper-chip { font-size:10.5px;font-weight:500;padding:6px 12px;border-radius:50px;border:1.3px solid var(--bdr2);color:var(--ink7);background:transparent;transition:all .18s; }
        .hamper-chip:hover { border-color:var(--olive2);color:var(--olive);background:var(--olivedim); }
        .hamper-chip.on { background:var(--olive);color:#fff !important;border-color:var(--olive);font-weight:600; }
        .hamper-chip-sm { min-width:34px;text-align:center; }

        .hamper-colour-swatch-row { display:flex;flex-wrap:nowrap;overflow-x:auto;gap:2px;padding-bottom:4px;scrollbar-width:thin; }
        .hamper-colour-swatch-row::-webkit-scrollbar { height:4px; }
        .hamper-colour-swatch-row::-webkit-scrollbar-thumb { background:var(--bdr2);border-radius:3px; }
        .hamper-colour-swatch-row-error { box-shadow: inset 0 0 0 1.5px var(--red); border-radius: 10px; padding: 6px 6px 10px; }
        .hamper-colour-swatch { display:flex;flex-direction:column;align-items:center;gap:5px;background:transparent;border:none;padding:6px 10px;cursor:pointer;flex-shrink:0;border-radius:8px;transition:background .18s; }
        .hamper-colour-swatch:hover { background:var(--olivedim); }
        .hamper-colour-swatch-img-wrap { width:56px;height:56px;overflow:hidden;transition:all .18s; }
        .hamper-colour-swatch-img-wrap img { width:100%;height:100%;object-fit:cover; }
        .hamper-colour-swatch:hover .hamper-colour-swatch-img-wrap { border-color:var(--olive2); }
        .hamper-colour-swatch.on .hamper-colour-swatch-img-wrap { border-color:var(--olive);box-shadow:0 0 0 2px rgba(61,80,22,.15); }
        .hamper-colour-swatch-label { font-size:12.5px;font-weight:600;color:var(--ink7);white-space:nowrap; }
        .hamper-colour-swatch.on .hamper-colour-swatch-label { color:var(--olive);font-weight:700; }

        .hamper-global-error { margin-top:16px;padding:10px 14px;border-radius:8px;background:rgba(192,57,43,.06);border:1px solid rgba(192,57,43,.3);color:var(--red);font-size:12px;font-weight:500;line-height:1.5; }

        .hamper-sticky-bar { position:fixed;left:0;right:0;bottom:0;z-index:300;background:var(--surf);border-top:1.5px solid var(--bdr);box-shadow:0 -6px 24px rgba(26,29,13,.10);padding:12px clamp(16px,4vw,52px);padding-bottom:calc(12px + env(safe-area-inset-bottom));display:flex;align-items:center;gap:16px; }
        .hamper-sticky-info { flex:1;min-width:0; }
        .hamper-sticky-label { display:block;font-size:8px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:var(--ink4);margin-bottom:2px; }
        .hamper-sticky-price { display:flex;align-items:baseline;gap:8px;flex-wrap:wrap; }
        .hamper-sticky-price-val { font-family:var(--ffd);font-size:1.25rem;font-weight:600;color:var(--ink); }
        .hamper-sticky-price-orig { font-size:11px;color:var(--ink4);text-decoration:line-through; }
        .hamper-sticky-btn { flex-shrink:0;display:flex;align-items:center;justify-content:center;gap:8px;font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#fff;background:var(--olive);padding:13px 22px;border-radius:50px;box-shadow:0 4px 14px rgba(61,80,22,.25);transition:all .2s;white-space:nowrap; }
        .hamper-sticky-btn:hover { background:#2e3c0e;transform:translateY(-1px); }
        .hamper-sticky-btn.done { background:var(--green) !important; }
        .hamper-sticky-btn.hamper-sticky-btn-disabled { background:var(--bdr2);color:var(--ink4);box-shadow:none;cursor:not-allowed; }
        .hamper-sticky-btn.hamper-sticky-btn-disabled:hover { background:var(--bdr2);transform:none; }

        @media(max-width:768px) {
          .hamper-page { max-width:520px; }
        }
        @media(max-width:520px) {
          .hamper-page { padding:14px 14px 0; }
          .hamper-main-img-wrap { aspect-ratio:2/3;  }
          .hamper-piece-img-link { width:48px;height:48px; }
          .hamper-colour-swatch-img-wrap { width:65px;height:90px; }
          .hamper-colour-swatch-label { font-size:11.5px; }
          .hamper-sticky-bar { padding:10px 14px;padding-bottom:calc(10px + env(safe-area-inset-bottom)); gap:10px; }
          .hamper-sticky-price-val { font-size:1.05rem; }
          .hamper-sticky-btn { padding:12px 16px;font-size:9px; }
          .pricing-tier-btn { padding:8px 12px;min-width:76px; }
        }
        @media(max-width:360px) {
          .hamper-sticky-label { font-size:7px; }
          .hamper-sticky-btn { padding:11px 12px;font-size:8px;gap:5px; }
        }

        /* ══════════════════ BUILD YOUR OWN — bundle grid + product picker + sticky bar ══════════════════ */
        .builder-page { padding:20px clamp(16px,4vw,52px) 0;width:100%; }
        .builder-header-row { max-width:1280px;margin:0 auto 16px; }
        .builder-header-title { font-family:var(--ffd);font-size:clamp(1.3rem,2.6vw,1.7rem);font-weight:600;color:var(--olive);line-height:1.2;margin-bottom:4px; }
        .builder-header-tagline { font-size:12px;font-weight:300;color:var(--ink7);line-height:1.6; }
        .builder-progress-wrap { max-width:1280px;margin:0 auto 18px; }
        .builder-progress-track { height:5px;background:var(--bdr);border-radius:3px;overflow:hidden;margin-bottom:8px; }
        .builder-progress-fill { height:100%;background:var(--olive);border-radius:3px;transition:width .3s ease; }
        .builder-hint { font-size:11px;font-weight:500;color:var(--olive2); }
        .builder-hint.done { color:var(--green); }

        .builder-grid { display:grid;grid-template-columns:repeat(4,1fr);gap:16px;max-width:1280px;margin:0 auto; }
        .builder-card { background:var(--surf);border:1.5px solid var(--bdr);overflow:hidden;display:flex;flex-direction:column;transition:all .2s;min-width:0; }
        .builder-card:hover:not(.disabled) { border-color:var(--olive2);transform:translateY(-3px);box-shadow:var(--shadow-lg); }
        .builder-card.chosen { border-color:var(--gold);box-shadow:0 0 0 2px rgba(184,152,42,.15); }
        .builder-card.disabled { opacity:.5; }
        .builder-card-img-wrap { position:relative;aspect-ratio:4/5;overflow:hidden;background:var(--olivedim); }
        .builder-card-img-link { display:block;width:100%;height:100%; }
        .builder-card-img-link img { width:100%;height:100%;object-fit:cover;transition:transform .35s ease; }
        .builder-card:hover:not(.disabled) .builder-card-img-link img { transform:scale(1.06); }
        .builder-card-check { position:absolute;top:8px;right:8px;width:24px;height:24px;background:var(--olive);color:#fff;display:flex;align-items:center;justify-content:center;border-radius:50%;font-size:11px;font-weight:700; }
        .builder-card-body { padding:12px 12px 14px;display:flex;flex-direction:column;gap:6px;min-width:0; }
        .builder-card-name-link { text-decoration:none;color:inherit; }
        .builder-card-name-link:hover .builder-card-name { color:var(--olive); }
        .builder-card-name { font-family:var(--ffd);font-size:.95rem;font-weight:600;color:var(--ink);line-height:1.25;word-break:break-word; }
        .builder-card-price { font-size:12px;font-weight:600;color:var(--olive2); }
        .builder-no-cust { font-size:9.5px;color:var(--ink4);font-style:italic; }
        .builder-card-actions { display:flex;gap:6px;margin-top:2px; }
        .builder-edit-btn { flex:1;font-size:9px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--olive);border:1.3px solid var(--olive2);border-radius:50px;padding:7px 0;transition:all .18s; }
        .builder-edit-btn:hover { background:var(--olive);color:#fff; }
        .builder-remove-btn { flex:1;font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:var(--ink4);border:1.3px solid var(--bdr2);border-radius:50px;padding:7px 0;transition:all .18s; }
        .builder-remove-btn:hover { color:var(--red);border-color:var(--red); }
        .builder-add-btn { margin-top:2px;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#fff;background:var(--olive);border-radius:50px;padding:10px 0;transition:all .2s; }
        .builder-add-btn:hover:not(:disabled) { background:#2e3c0e; }
        .builder-add-btn:disabled { opacity:.4;cursor:not-allowed;background:var(--bdr2);color:var(--ink4); }

        .builder-sticky-bar { position:fixed;left:0;right:0;bottom:0;z-index:300;background:var(--surf);border-top:1.5px solid var(--bdr);box-shadow:0 -6px 24px rgba(26,29,13,.10);padding:12px clamp(16px,4vw,52px);padding-bottom:calc(12px + env(safe-area-inset-bottom));display:flex;align-items:center;gap:14px; }
        .builder-sticky-toggle { flex-shrink:0;display:flex;align-items:center;gap:6px;background:var(--olivedim);border:1.5px solid var(--bdr2);border-radius:50px;padding:9px 14px;color:var(--olive);transition:all .18s; }
        .builder-sticky-toggle:disabled { opacity:.5; }
        .builder-sticky-count { font-size:13px;font-weight:700; }
        .builder-sticky-info { flex:1;min-width:0; }
        .builder-sticky-label { font-size:12px;font-weight:600;color:var(--ink);line-height:1.4;display:block; }
        .builder-sticky-label--done { color:var(--green); }
        .builder-sticky-cart { flex-shrink:0;font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#fff;background:var(--olive);padding:13px 20px;border-radius:50px;box-shadow:0 4px 14px rgba(61,80,22,.25);transition:all .2s;white-space:nowrap; }
        .builder-sticky-cart:hover:not(:disabled) { background:#2e3c0e;transform:translateY(-1px); }
        .builder-sticky-cart:disabled { opacity:.4;cursor:not-allowed; }
        .builder-sticky-cart.done { background:var(--green) !important; }

        .builder-drawer { position:fixed;left:0;right:0;bottom:64px;z-index:299;max-height:50vh;overflow-y:auto;background:var(--surf);border-top:1.5px solid var(--bdr);box-shadow:0 -6px 24px rgba(26,29,13,.10);padding:14px clamp(16px,4vw,52px); }
        .builder-drawer-head { display:flex;align-items:center;justify-content:space-between;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--olive);margin-bottom:10px; }
        .builder-drawer-head button { font-size:10px;color:var(--ink4);text-decoration:underline; }
        .builder-drawer-items { display:flex;flex-direction:column;gap:8px; }
        .builder-drawer-item { display:flex;align-items:center;gap:10px;background:var(--bg);border-radius:8px;padding:6px 10px; }
        .builder-drawer-item img { width:36px;height:36px;object-fit:cover;border-radius:6px;flex-shrink:0; }
        .builder-drawer-item-name { flex:1;font-size:12px;color:var(--ink);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap; }
        .builder-drawer-item-name em { font-style:normal;color:var(--gold);font-size:10px; }
        .builder-drawer-item button { width:22px;height:22px;border-radius:50%;background:var(--red);color:#fff;font-size:13px;line-height:1;flex-shrink:0; }

        @media(max-width:1200px) { .builder-grid { grid-template-columns:repeat(4,1fr); } }
        @media(max-width:1100px) { .builder-grid { grid-template-columns:repeat(3,1fr); } }
        @media(max-width:900px) { .builder-grid { grid-template-columns:repeat(3,1fr);gap:14px; } }
        @media(max-width:760px) { .builder-grid { grid-template-columns:repeat(2,1fr);gap:12px; } }
        @media(max-width:600px) {
          .builder-page { padding:14px 14px 0; }
          .builder-sticky-bar { padding:10px 14px;padding-bottom:calc(10px + env(safe-area-inset-bottom)); gap:10px; }
          .builder-sticky-label { font-size:10.5px; }
          .builder-sticky-cart { padding:11px 14px;font-size:9px; }
          .builder-drawer { bottom:60px; }
        }
        @media(max-width:480px) { .builder-grid { grid-template-columns:repeat(2,1fr);gap:10px; } }
        @media(max-width:380px) { .builder-grid { grid-template-columns:repeat(2,1fr);gap:9px; } }
        @media(max-width:340px) {
          .builder-sticky-label { font-size:9px; }
          .builder-sticky-cart { padding:10px 10px;font-size:8px; }
          .builder-sticky-toggle { padding:8px 10px; }
        }

        /* ── RESPONSIVE (hero/modebar/general page) ── */
        @media(max-width:1024px) {
          .hero { margin-top:52px; }
        }
        @media(max-width:900px) {
          .hero { padding-left:24px;padding-right:24px; }
          .modebar { padding-left:24px;padding-right:24px; }
        }
        @media(max-width:760px) {
          .hero,.modebar { padding-left:14px;padding-right:14px; }
          .hero { margin-top:48px;padding-top:22px;padding-bottom:16px; }
          .modebar { gap:12px; }
          .modehint { padding-top:6px;max-width:100%; }
        }
        @media(max-width:420px) {
          .hero { margin-top:44px; }
          .hero-desc { max-width:100%; }
        }
        @media(max-width:340px) {
          .hero h1 { font-size:1.5rem; }
        }
          /* ── TRUST BADGES ── */
.combo-trust{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:20px 0;}
.combo-trust-item{display:flex;flex-direction:column;align-items:center;text-align:center;padding:14px 8px;background:var(--surf);border:1px solid var(--bdr);border-radius:14px;transition:transform .2s,box-shadow .2s;}
.combo-trust-item:hover{transform:translateY(-3px);box-shadow:var(--shadow);}
.combo-trust-icon{width:36px;height:36px;color:var(--olive2);margin-bottom:7px;}
.combo-trust-title{font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--olive);margin-bottom:2px;}
.combo-trust-sub{font-size:9px;color:var(--ink7);}

/* ── ACCORDION / POLICY LINKS ── */
.combo-accordion{border-top:1px solid var(--bdr);margin:20px 0;}
.combo-acc-item{border-bottom:1px solid var(--bdr);}
.combo-acc-head{display:flex;align-items:center;justify-content:space-between;width:100%;padding:14px 2px;background:none;border:none;cursor:pointer;transition:background .15s;}
.combo-acc-head:hover{background:rgba(61,80,22,.03);}
.combo-acc-head-left{display:flex;align-items:center;gap:9px;font-size:12.5px;font-weight:500;color:var(--ink);text-align:left;}
.combo-acc-emoji{font-size:15px;}
.combo-acc-chevron{color:var(--ink4);flex-shrink:0;transition:transform .32s ease;}
.combo-acc-item--open .combo-acc-chevron{transform:rotate(180deg);}
.combo-acc-body{padding:0 2px 16px 33px;font-size:12px;font-weight:300;line-height:1.8;color:var(--ink7);}
.combo-acc-nav-link{display:flex;align-items:center;justify-content:space-between;padding:14px 2px;text-decoration:none;color:var(--ink);border-bottom:1px solid var(--bdr);font-size:12.5px;font-weight:500;transition:background .15s;}
.combo-acc-nav-link:hover{background:rgba(61,80,22,.03);}
.combo-acc-nav-link svg{color:var(--ink4);flex-shrink:0;}

/* ── ESTIMATED DELIVERY ── */
.combo-delivery{margin:20px 0;}
.combo-delivery-label{font-size:9px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--olive2);margin-bottom:10px;}
.combo-delivery-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
.combo-delivery-card{border:1.5px solid var(--bdr);border-radius:14px;padding:14px 12px;background:var(--surf);}
.combo-delivery-icon{font-size:22px;margin-bottom:4px;}
.combo-delivery-opt-label{font-size:14px;font-weight:800;color:var(--ink);margin-bottom:10px;}
.combo-delivery-tier{margin-bottom:6px;}
.combo-delivery-tier-label{font-size:9px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--olive2);margin-bottom:1px;}
.combo-delivery-tier-val{font-size:12px;font-weight:600;color:var(--ink);}
.combo-delivery-rate{font-size:13px;font-weight:800;color:var(--olive2);}
.combo-delivery-freebar{margin-top:10px;padding:11px 14px;background:linear-gradient(135deg,#e6f4e7,#f0faf0);border:1.5px solid rgba(42,96,48,.22);border-radius:10px;display:flex;align-items:center;gap:9px;font-size:12px;font-weight:700;color:#0a2e12;line-height:1.4;}

/* ── REVIEWS ── */
.combo-rev-section{margin:24px 0 4px;padding-top:24px;border-top:1px solid var(--bdr);}
.combo-rev-header{text-align:center;margin-bottom:20px;}
.combo-rev-eyebrow{display:block;font-size:9px;letter-spacing:.4em;text-transform:uppercase;color:var(--gold);margin-bottom:5px;}
.combo-rev-title{font-family:var(--ffd);font-size:1.3rem;font-weight:400;font-style:italic;color:var(--olive);}
.combo-rev-summary{display:flex;background:var(--surf);border:1px solid var(--bdr);border-radius:14px;overflow:hidden;margin-bottom:18px;flex-wrap:wrap;}
.combo-rev-score{background:linear-gradient(160deg,var(--olive),var(--olive2));padding:20px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;flex:0 0 130px;}
.combo-rev-big-num{font-family:var(--ffd);font-size:2.6rem;font-weight:600;color:#f5f0e8;line-height:1;}
.combo-rev-big-stars{font-size:13px;color:var(--gold);letter-spacing:2px;}
.combo-rev-total{font-size:8px;letter-spacing:.16em;text-transform:uppercase;color:rgba(245,240,232,.6);}
.combo-rev-bars{display:flex;flex-direction:column;gap:5px;padding:14px 16px;flex:1;justify-content:center;min-width:180px;}
.combo-rev-bar-row{display:flex;align-items:center;gap:8px;background:none;border:none;cursor:pointer;padding:2px 5px;border-radius:6px;}
.combo-rev-bar-row:hover{background:rgba(61,80,22,.05);}
.combo-rev-bar-row--active{background:var(--golddim);}
.combo-rev-bar-label{font-size:10px;font-weight:600;color:var(--olive2);min-width:20px;text-align:right;}
.combo-rev-bar-track{flex:1;height:5px;background:var(--bdr);border-radius:50px;overflow:hidden;}
.combo-rev-bar-fill{height:100%;background:linear-gradient(90deg,var(--gold),var(--olive2));border-radius:50px;}
.combo-rev-bar-count{font-size:9px;color:var(--ink4);min-width:20px;}
.combo-rev-controls{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:16px;}
.combo-rev-clear{font-size:10px;font-weight:600;color:var(--gold);background:var(--golddim);border:1px solid rgba(184,152,42,.3);border-radius:50px;padding:5px 12px;cursor:pointer;}
.combo-rev-write-btn{font-size:10.5px;font-weight:600;color:#fff;background:var(--olive);border:none;border-radius:50px;padding:9px 18px;cursor:pointer;}
.combo-rev-empty{font-size:12.5px;color:var(--ink4);text-align:center;padding:16px 0;}
.combo-rev-list{display:flex;flex-direction:column;gap:12px;}
.combo-rev-card{background:var(--surf);border:1px solid var(--bdr);border-radius:14px;padding:16px 18px;}
.combo-rev-card-top{display:flex;align-items:flex-start;gap:12px;margin-bottom:10px;}
.combo-rev-avatar{width:36px;height:36px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;background:var(--golddim);color:var(--gold);}
.combo-rev-meta-row{display:flex;align-items:center;flex-wrap:wrap;gap:7px;}
.combo-rev-name{font-size:12px;font-weight:600;color:var(--ink);}
.combo-rev-verified{display:flex;align-items:center;gap:3px;font-size:9px;font-weight:600;text-transform:uppercase;color:var(--olive2);}
.combo-rev-stars-sm{font-size:11px;color:var(--gold);}
.combo-rev-date{font-size:10px;color:var(--ink4);}
.combo-rev-body{font-size:12px;font-weight:300;color:var(--ink7);line-height:1.75;}
.combo-rev-load{display:flex;justify-content:center;margin-top:20px;}
.combo-rev-load-btn{font-size:10px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--olive);background:var(--surf);border:1.5px solid var(--bdr2);border-radius:50px;padding:11px 26px;cursor:pointer;}
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
                onVariantChange={(pid, v) => setPresetVariants(prev => ({ ...prev, [pid]: v }))}
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