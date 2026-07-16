/**
 * offerTypes.ts
 * Shared TypeScript interfaces for the offer/coupon domain.
 * Used by catalogApi.ts and the offer-detail components.
 */

/** Raw shape returned by GET /offers/:id */
export interface ApiOfferDetail {
  _id: string;
  code?: string;
  name?: string;
  title?: string;
  description?: string;
  offerType?: 'bogo' | 'percentage' | 'fixed' | 'buy_x_for_y' | 'free_shipping';
  discountType?: 'percentage' | 'fixed' | 'free_shipping';
  discountValue?: number;
  buyQuantity?: number;
  getQuantity?: number;
  minOrderValue?: number;
  applicableProducts?: string[];
  applicableCategories?: string[];
  startsAt?: string;
  expiryDate?: string;
  image?: string;
  isFeatured?: boolean;
  isActive?: boolean;
  createdAt?: string;
  offerCategory?: 'jewellery' | 'combo' | 'gift' | 'all';
}

/** Normalised, component-ready offer shape */
export interface OfferDetail {
  id: string;
  code: string;
  title: string;
  description: string;
  /** Resolved offer type used for badge rendering */
  offerType: 'bogo' | 'percentage' | 'fixed' | 'buy_x_for_y' | 'free_shipping';
  discountValue: number;
  buyQuantity?: number;
  getQuantity?: number;
  minOrderValue: number;
  applicableProducts: string[];
  applicableCategories: string[];
  startsAt: string | null;
  expiryDate: string | null;
  /** Formatted start date for display, e.g. "01 Jan 2025" */
  startsAtFormatted: string;
  /** Formatted expiry date for display, e.g. "31 Dec 2025" */
  expiryFormatted: string;
  image: string;
  isFeatured: boolean;
  /** Human-readable badge label, e.g. "Buy 2 Get 1 Free", "20% Off" */
  badgeLabel: string;
}

/** Normalises a raw API offer into the component-ready shape */
export function normalizeOfferDetail(raw: ApiOfferDetail): OfferDetail {
  // Resolve offer type
  let offerType: OfferDetail['offerType'] = 'percentage';
  if (raw.offerType === 'bogo') offerType = 'bogo';
  else if (raw.offerType === 'buy_x_for_y') offerType = 'buy_x_for_y';
  else if (raw.offerType === 'free_shipping' || raw.discountType === 'free_shipping') offerType = 'free_shipping';
  else if (raw.offerType === 'fixed' || raw.discountType === 'fixed') offerType = 'fixed';

  const discountValue = Number(raw.discountValue ?? 0);
  const buyQty = Number(raw.buyQuantity ?? 0);
  const getQty = Number(raw.getQuantity ?? 0);

  // Build human-readable badge
  let badgeLabel = '';
  if (offerType === 'bogo') {
    badgeLabel = getQty > 0
      ? `Buy ${buyQty} Get ${getQty} Free`
      : 'Buy One Get One Free';
  } else if (offerType === 'buy_x_for_y') {
    badgeLabel = buyQty > 0
      ? `Buy ${buyQty} for ₹${discountValue}`
      : `₹${discountValue} Deal`;
  } else if (offerType === 'percentage') {
    badgeLabel = `${discountValue}% Off`;
  } else if (offerType === 'fixed') {
    badgeLabel = `Flat ₹${discountValue} Off`;
  } else if (offerType === 'free_shipping') {
    badgeLabel = 'Free Shipping';
  }

  // Format dates
  const fmtDate = (iso: string | undefined): string => {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return {
    id: raw._id,
    code: raw.code || 'AUTOMATIC',
    title: raw.title || raw.name || 'Special Offer',
    description: raw.description || 'Limited period offer',
    offerType,
    discountValue,
    buyQuantity: buyQty || undefined,
    getQuantity: getQty || undefined,
    minOrderValue: Number(raw.minOrderValue ?? 0),
    applicableProducts: Array.isArray(raw.applicableProducts) ? raw.applicableProducts : [],
    applicableCategories: Array.isArray(raw.applicableCategories) ? raw.applicableCategories : [],
    startsAt: raw.startsAt || null,
    expiryDate: raw.expiryDate || null,
    startsAtFormatted: fmtDate(raw.startsAt),
    expiryFormatted: fmtDate(raw.expiryDate) || 'No expiry',
    image: raw.image || '/images/hero.png',
    isFeatured: Boolean(raw.isFeatured),
    badgeLabel,
  };
}
