'use client';

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  ReactNode,
  useState,
} from 'react';
import { applyCouponToCart, fetchProductById } from '@/lib/catalogApi';
import { getApiUrl } from '@/lib/api';
import { usePathname } from 'next/navigation';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface CartItem {
  id: string;
  sourceId?: string;
  name: string;
  price: number;
  originalPrice?: number | null;
  basePrice?: number;
  image: string;
  color: string;
  colorHex: string;
  size?: string;
  qty: number;
  sku: string;
  variantLabel?: string;
  href: string;
  cartItemId?: string;
  customNote?: string;
  customImages?: string[];
  giftBox?: boolean;
  giftBoxDetails?: {
    heading?: string;
    description?: string;
    price?: number;
    image?: string;
  };
  giftMessage?: string;
  customData?: Record<string, any>;
  selectedCharms?: Array<string | {
    _id?: string;
    id?: string;
    sourceId?: string;
    name?: string;
    price?: number;
    image?: string;
    emoji?: string;
    quantity?: number;
    images?: string[];
    customText?: string;
    customData?: Record<string, unknown>;
  }>;
  selectionGroups?: Array<{
    type?: string;
    category?: string;
    label?: string;
    selectionKey?: string;
    itemRefModel?: string;
    items: Array<{
      id?: string;
      item?: string;
      sourceId?: string;
      name?: string;
      quantity?: number;
      price?: number;
      image?: string;
      images?: string[];
      emoji?: string;
      customText?: string;
      customData?: Record<string, unknown>;
    }>;
    metadata?: Record<string, unknown>;
  }>;
  category?: string;
  categoryId?: string;
  subCategoryId?: string;
  style?: string;
  styleId?: string;
  paymentMode?: 'cod_allowed' | 'prepaid_only' | 'partial_cod';
  chain?: string;
  chainLabel?: string;
}

export const GIFT_OPTIONS = [
  { id: 'classic', title: 'Classic Gift Wrap', sub: 'Kraft paper & satin ribbon', price: 25, image: '/smallerBox.png' },
  { id: 'luxury', title: 'Luxury Gift Hamper', sub: 'Ideal for 4+ products', price: 250, image: '/Biggerbox.jpg' },
];

export interface CartState {
  items: CartItem[];
  isDrawerOpen: boolean;
  isGift: boolean;
  giftMessage: string;
  discountCode: string;
  discountAmount: number;
  selectedGiftId: string | null;
  optedOutOffers: string[];
  rewardPointsRedeemed: number;
}

// ─── Actions ──────────────────────────────────────────────────────────────────
type Action =
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'qty'>; openDrawer?: boolean }
  | { type: 'REMOVE_ITEM';  payload: { id: string; colorHex: string } }
  | { type: 'UPDATE_QTY';   payload: { id: string; colorHex: string; qty: number } }
  | { type: 'OPEN_DRAWER'; openDrawer?: boolean }
  | { type: 'CLOSE_DRAWER' }
  | { type: 'TOGGLE_GIFT';  payload?: boolean }
  | { type: 'SET_GIFT_ID';  payload: string | null }
  | { type: 'SET_GIFT_MSG'; payload: string }
  | { type: 'APPLY_DISCOUNT'; payload: { code: string; amount: number } }
  | { type: 'REMOVE_DISCOUNT' }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_OFFER_OPTOUT'; payload: string }
  | { type: 'SET_REWARD_POINTS_REDEEMED'; payload: number }
  | { type: 'SYNC_PRICES'; payload: Array<{ id: string; price: number; originalPrice?: number | null }> }
  | { type: 'HYDRATE';      payload: CartState }
  | { type: 'SYNC';         payload: CartState };

// ─── Selectors (pure helpers) ─────────────────────────────────────────────────
const FREE_SHIPPING_THRESHOLD = 999;

export function cartSubtotal(items: CartItem[]) {
  return items.reduce((sum, i) => sum + i.price * i.qty, 0);
}
export function cartSavings(items: CartItem[]) {
  return items.reduce(
    (sum, i) => {
      const orig = i.originalPrice ?? i.price;
      return sum + Math.max(0, orig - i.price) * i.qty;
    },
    0,
  );
}
export function cartShipping(subtotal: number) {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 60;
}
export function cartTotal(state: CartState) {
  const sub      = cartSubtotal(state.items);
  const shipping = cartShipping(sub);
  const activeGift = state.selectedGiftId ? GIFT_OPTIONS.find(g => g.id === state.selectedGiftId) : null;
  const gift     = (state.isGift && activeGift) ? activeGift.price : 0;
  return sub + shipping + gift - state.discountAmount;
}
export function cartItemCount(items: CartItem[]) {
  return items.reduce((sum, i) => sum + i.qty, 0);
}

// ─── Reducer ──────────────────────────────────────────────────────────────────
const INITIAL: CartState = {
  items:          [],
  isDrawerOpen:   false,
  isGift:         false,
  giftMessage:    '',
  discountCode:   '',
  discountAmount: 0,
  selectedGiftId: null,
  optedOutOffers: [],
  rewardPointsRedeemed: 0,
};

function key(item: Partial<CartItem>) {
  return item.cartItemId || `${item.id}__${item.colorHex}__${item.size || ''}__${item.customNote || ''}__${item.selectedCharms?.length || 0}__${item.giftBox ? 'gb' : 'nogb'}`;
}

const newLineId = () => Date.now().toString() + Math.random().toString(36).slice(2, 11);

/**
 * Two adds are the "same line" only when everything that makes the piece what it is matches: product,
 * colour, size, note, gift box, customisation (messages / photos), charms, chain, bundle contents and price.
 * Anything else becomes its own line, so a second customised hamper never overwrites the first.
 */
function fingerprint(i: Partial<CartItem>) {
  return JSON.stringify([
    String(i.sourceId ?? i.id ?? ''), (i.colorHex ?? '').toLowerCase(), String(i.size ?? '').trim().toLowerCase(), i.customNote ?? '',
    i.giftBox ?? null, i.giftMessage ?? null, i.customData ?? null, i.selectedCharms ?? null,
    i.selectionGroups ?? null, i.chain ?? '', i.price ?? 0,
  ]);
}

/** A cart line is addressed by its own cartItemId; lines saved before ids existed fall back to product id + colour. */
function isLine(i: CartItem, id: string, colorHex: string) {
  return i.cartItemId ? i.cartItemId === id : (i.id === id && i.colorHex === colorHex);
}

const MAX_LINE_QTY = 99;

function reducer(state: CartState, action: Action): CartState {
  switch (action.type) {

case 'ADD_ITEM': {
  const fp = fingerprint(action.payload);
  const idx = state.items.findIndex(i => fingerprint(i) === fp);
  const openDrawer = action.openDrawer ?? true;

  if (idx >= 0) {
    const items = state.items.map((i, n) =>
      n === idx ? { ...i, qty: Math.min(MAX_LINE_QTY, i.qty + 1) } : i
    );
    return { ...state, items, isDrawerOpen: openDrawer };
  }

  const newItem = { ...action.payload, cartItemId: newLineId(), qty: 1 };
  return { ...state, items: [...state.items, newItem], isDrawerOpen: openDrawer };
}

    case 'REMOVE_ITEM': {
      return { ...state, items: state.items.filter(i => !isLine(i, action.payload.id, action.payload.colorHex)) };
    }

    case 'UPDATE_QTY': {
      const { id, colorHex, qty } = action.payload;
      return {
        ...state,
        items: qty <= 0
          ? state.items.filter(i => !isLine(i, id, colorHex))
          : state.items.map(i => isLine(i, id, colorHex) ? { ...i, qty: Math.min(MAX_LINE_QTY, Math.floor(qty)) } : i),
      };
    }

    case 'OPEN_DRAWER':  return { ...state, isDrawerOpen: action.openDrawer ?? true };
    case 'CLOSE_DRAWER': return { ...state, isDrawerOpen: false };

    case 'TOGGLE_GIFT':
      return {
        ...state,
        isGift: action.payload !== undefined ? action.payload : !state.isGift,
      };

    case 'SET_GIFT_MSG': return { ...state, giftMessage: action.payload };

    case 'SET_GIFT_ID':
      return {
        ...state,
        selectedGiftId: action.payload,
      };

    case 'APPLY_DISCOUNT':
      return {
        ...state,
        discountCode:   action.payload.code,
        discountAmount: action.payload.amount,
      };

    case 'REMOVE_DISCOUNT':
      return { ...state, discountCode: '', discountAmount: 0 };

    case 'TOGGLE_OFFER_OPTOUT': {
      const isOptedOut = state.optedOutOffers?.includes(action.payload);
      return {
        ...state,
        optedOutOffers: isOptedOut
          ? state.optedOutOffers.filter(id => id !== action.payload)
          : [...(state.optedOutOffers || []), action.payload],
      };
    }

    case 'SET_REWARD_POINTS_REDEEMED':
      return { ...state, rewardPointsRedeemed: action.payload };

    case 'CLEAR_CART':
      return { ...INITIAL };

    case 'SYNC': // another tab changed the cart: take its lines, keep this tab's drawer as it is
      return { ...reducer(INITIAL, { type: 'HYDRATE', payload: action.payload }), isDrawerOpen: state.isDrawerOpen };

    case 'SYNC_PRICES': {
      const priceMap = new Map(action.payload.map(p => [p.id, p]));
      const items = state.items.map(item => {
        const update = priceMap.get(item.id) || (item.sourceId ? priceMap.get(item.sourceId) : undefined);
        if (update) {
          return {
            ...item,
            price: update.price,
            originalPrice: update.originalPrice !== undefined ? update.originalPrice : item.originalPrice,
          };
        }
        return item;
      });
      return { ...state, items };
    }

    case 'HYDRATE': {
      const hydState = {
        ...action.payload,
        items: action.payload.items.map(i => i.cartItemId ? i : { ...i, cartItemId: newLineId() }),
        rewardPointsRedeemed: action.payload.rewardPointsRedeemed || 0,
        isDrawerOpen: false,
      };
      if (hydState.discountCode === 'STAYWITHUS') {
        hydState.discountCode = '';
        hydState.discountAmount = 0;
      }
      return hydState;
    }

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────
interface CartContextValue {
  state:          CartState;
  addItem: (item: Omit<CartItem, 'qty'>, openDrawer?: boolean) => void;
  removeItem:     (id: string, colorHex: string) => void;
  updateQty:      (id: string, colorHex: string, qty: number) => void;
  openDrawer:     () => void;
  closeDrawer:    () => void;
  toggleGift:     (val?: boolean) => void;
  setGiftId:      (id: string | null) => void;
  setGiftMessage: (msg: string) => void;
  applyDiscount:  (code: string, amount: number) => void;
  applyCouponCode: (code: string) => Promise<{ success: boolean; message?: string }>;
  removeDiscount: () => void;
  clearCart:      () => void;
  syncCartPrices: () => Promise<{ updated: boolean; updatedItems: string[] }>;
  // derived
  subtotal:   number;
  savings:    number;
  shipping:   number;
  autoDiscountAmount: number;
  appliedOffers: Array<{ id: string; title: string; amount: number }>;
  applicableOffers: Array<{ id: string; title: string; amount: number; applied: boolean }>;
  toggleOfferOptOut: (id: string) => void;
  setRewardPointsRedeemed: (points: number) => void;
  total:      number;
  itemCount:  number;
  /** false until the saved cart has been read from this browser (avoids a flash of an empty cart). */
  hydrated:   boolean;
  /** true when this browser could not store the cart (it will be lost on refresh). */
  persistFailed: boolean;
}

const CartContext = createContext<CartContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
const STORAGE_KEY = 'maison_cart_v1';

/** The cart lives in the browser, so never trust its shape: drop malformed lines, clamp quantities. */
function readCart(raw: string | null): CartState | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as CartState;
    const items = (Array.isArray(parsed?.items) ? parsed.items : []).filter((i) =>
      i && typeof i.id === 'string' && typeof i.name === 'string' && Number.isFinite(i.price) && i.price >= 0 && Number.isFinite(i.qty),
    ).map((i) => ({
      ...i,
      qty: Math.min(MAX_LINE_QTY, Math.max(1, Math.floor(i.qty))),
      // Links and images come from storage too: only same-site paths and http(s) images are allowed through.
      href: typeof i.href === 'string' && /^\/(?!\/)/.test(i.href) ? i.href : '',
      image: typeof i.image === 'string' && /^(https?:\/\/|\/(?!\/))/i.test(i.image) ? i.image : '',
    }));
    return { ...parsed, items, isDrawerOpen: false };
  } catch {
    return null;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL);
  const pathname = usePathname();
  const [hydrated, setHydrated] = useState(false);

  // Set when the browser refuses to store the cart (storage full, private mode): the cart still works this
  // visit, but it would be lost on refresh, so the UI tells the shopper.
  const [persistFailed, setPersistFailed] = useState(false);

  // Hydrate from localStorage once on mount, then follow changes made in other tabs
  useEffect(() => {
    let raw: string | null = null;
    try { raw = localStorage.getItem(STORAGE_KEY); } catch {}
    const saved = readCart(raw);
    if (saved) dispatch({ type: 'HYDRATE', payload: saved });
    setHydrated(true);

    const handleClearCart = () => dispatch({ type: 'CLEAR_CART' });
    const handleStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      if (e.newValue === null) { dispatch({ type: 'CLEAR_CART' }); return; } // cleared / logged out in another tab
      const next = readCart(e.newValue);
      if (next) dispatch({ type: 'SYNC', payload: next });
    };
    window.addEventListener('makeussparkle:clear-cart', handleClearCart);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('makeussparkle:clear-cart', handleClearCart);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  // Persist on every change, but only after the saved cart has been read: saving the empty starting state first
  // would overwrite the real cart. Whether the drawer is open is per-tab, so it is not saved.
  useEffect(() => {
    if (!hydrated) return;
    try {
      const { isDrawerOpen: _open, ...persisted } = state;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
      setPersistFailed(false);
    } catch {
      setPersistFailed(true);
    }
  }, [state, hydrated]);

const addItem = useCallback(
  (item: Omit<CartItem, 'qty'>, openDrawer = true) =>
    dispatch({ type: 'ADD_ITEM', payload: item, openDrawer }),
  []
);
  const removeItem     = useCallback((id: string, colorHex: string) => dispatch({ type: 'REMOVE_ITEM', payload: { id, colorHex } }), []);
  const updateQty      = useCallback((id: string, colorHex: string, qty: number) => dispatch({ type: 'UPDATE_QTY', payload: { id, colorHex, qty } }), []);
  const openDrawer     = useCallback(() => dispatch({ type: 'OPEN_DRAWER' }), []);
  const closeDrawer    = useCallback(() => dispatch({ type: 'CLOSE_DRAWER' }), []);
  const toggleGift     = useCallback((val?: boolean) => dispatch({ type: 'TOGGLE_GIFT', payload: val }), []);
  const setGiftId      = useCallback((id: string | null) => dispatch({ type: 'SET_GIFT_ID', payload: id }), []);
  const setGiftMessage = useCallback((msg: string) => dispatch({ type: 'SET_GIFT_MSG', payload: msg }), []);
  const applyDiscount  = useCallback((code: string, amount: number) => dispatch({ type: 'APPLY_DISCOUNT', payload: { code, amount } }), []);
  const removeDiscount = useCallback(() => dispatch({ type: 'REMOVE_DISCOUNT' }), []);
  const clearCart      = useCallback(() => dispatch({ type: 'CLEAR_CART' }), []);

  const syncCartPrices = useCallback(async (): Promise<{ updated: boolean; updatedItems: string[] }> => {
    if (!state.items || state.items.length === 0) return { updated: false, updatedItems: [] };
    const itemsToCheck = state.items.filter(
      (item) => item.sourceId && /^[0-9a-fA-F]{24}$/.test(item.sourceId)
    );
    if (!itemsToCheck.length) return { updated: false, updatedItems: [] };

    try {
      const updates: Array<{ id: string; price: number; originalPrice?: number | null; name: string }> = [];

      await Promise.all(
        itemsToCheck.map(async (item) => {
          try {
            const product = await fetchProductById(item.sourceId!);
            if (!product) return;

            let currentPrice = product.discountedPrice || product.price;
            if (Array.isArray(product.variants) && product.variants.length > 0) {
              const v = product.variants.find(
                (v) =>
                  (!item.color || v.color?.toLowerCase() === item.color.toLowerCase()) &&
                  (!item.size || v.size?.toLowerCase() === item.size.toLowerCase())
              );
              if (v) {
                currentPrice = v.salePrice || v.price || currentPrice;
              }
            }

            const giftBoxPrice = item.giftBox ? Number(item.giftBoxDetails?.price ?? 50) : 0;
            const finalExpectedPrice = currentPrice + giftBoxPrice;

            if (Math.abs(item.price - finalExpectedPrice) > 0.01) {
              updates.push({
                id: item.id,
                price: finalExpectedPrice,
                originalPrice: product.originalPrice ? product.originalPrice + giftBoxPrice : null,
                name: item.name || product.name || 'item',
              });
            }
          } catch (e) {
            console.warn('Failed to verify price for item:', item.name, e);
          }
        })
      );

      if (updates.length > 0) {
        dispatch({ type: 'SYNC_PRICES', payload: updates });
        return { updated: true, updatedItems: updates.map((u) => u.name) };
      }
    } catch (e) {
      console.warn('syncCartPrices error:', e);
    }
    return { updated: false, updatedItems: [] };
  }, [state.items]);

  // Automatically sync cart prices on initial load once hydrated
  useEffect(() => {
    if (hydrated && state.items.length > 0) {
      syncCartPrices();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  const [offers, setOffers] = useState<any[]>([]);

  // Fetch active offers
  useEffect(() => {
    let alive = true;
    async function loadPublicOffers() {
      try {
        const url = getApiUrl('/offers/public');
        const res = await fetch(url).catch(() => null);
        if (res && res.ok && alive) {
          const data = await res.json().catch(() => null);
          if (data && data.success && Array.isArray(data.offers)) {
            setOffers(data.offers);
          }
        }
      } catch (err) {
        // Suppress network down/offline noise
      }
    }
    loadPublicOffers();
    return () => { alive = false; };
  }, []);

  const sub = cartSubtotal(state.items);

  // Calculate automatic discounts from store offers
  let autoDiscountAmount = 0;
  const appliedOffers: Array<{ id: string; title: string; amount: number }> = [];
  const applicableOffers: Array<{ id: string; title: string; amount: number; applied: boolean }> = [];

  // Helper to determine if item is applicable to an offer.
  // Matching rule (OR logic):
  //   – If neither products nor categories are set → applies to everything
  //   – If products are set AND the item's sourceId/id is in the list → match
  //   – If categories are set AND the item's categoryId is in the list → match
  //   – Item must satisfy at least one of the above populated lists
  const isPoolItemApplicable = (item: { id: string; sourceId?: string; category?: string; categoryId?: string; subCategoryId?: string }, offer: any) => {
    const productId = item.sourceId || item.id;
    const hasProducts   = Array.isArray(offer.applicableProducts)   && offer.applicableProducts.length   > 0;
    const hasCategories = Array.isArray(offer.applicableCategories) && offer.applicableCategories.length > 0;

    // No restrictions at all → applies to every item
    if (!hasProducts && !hasCategories) return true;

    // Check product match
    const inProducts = hasProducts && offer.applicableProducts.includes(productId);
    // Check category match (categoryId or subCategoryId)
    const catId    = item.categoryId    || '';
    const subCatId = item.subCategoryId || '';
    const inCategories = hasCategories && (
      (catId    && offer.applicableCategories.includes(catId))    ||
      (subCatId && offer.applicableCategories.includes(subCatId))
    );

    // OR: item must be in at least one of the applicable lists
    if (hasProducts && hasCategories) return inProducts || inCategories;
    if (hasProducts)   return inProducts;
    if (hasCategories) return inCategories;
    return true;
  };

  // Build the pool of item instances
  let pool: Array<{ id: string; sourceId?: string; category?: string; categoryId?: string; subCategoryId?: string; price: number; isAlreadyDiscounted: boolean }> = [];
  state.items.forEach((item) => {
    const isAlreadyDiscounted = Boolean(item.originalPrice && item.originalPrice > item.price);
    for (let q = 0; q < item.qty; q++) {
      pool.push({
        id: item.id,
        sourceId: item.sourceId,
        category: item.category,
        categoryId: item.categoryId,
        subCategoryId: item.subCategoryId,
        price: item.price,
        isAlreadyDiscounted,
      });
    }
  });

  // Evaluate each active offer
  offers.forEach((offer) => {
    // Skip inactive offers
    if (!offer.isActive) return;
    // Skip offers that haven't started or have expired
    const now = Date.now();
    if (offer.startsAt && new Date(offer.startsAt).getTime() > now) return;
    if (offer.expiryDate && new Date(offer.expiryDate).getTime() < now) return;

    const matchingIndices: number[] = [];
    pool.forEach((poolItem, index) => {
      if (isPoolItemApplicable(poolItem, offer)) {
        matchingIndices.push(index);
      }
    });

    if (matchingIndices.length === 0) return;

    let offerDiscount = 0;
    const usedIndices = new Set<number>();

    if (offer.offerType === 'buy_x_for_y') {
      const X = offer.buyQuantity || 1;
      const Y = offer.discountValue || 0;
      
      const matchingItems = matchingIndices.map(idx => ({ idx, price: pool[idx].price }));
      matchingItems.sort((a, b) => b.price - a.price);

      const numGroups = Math.floor(matchingItems.length / X);
      for (let g = 0; g < numGroups; g++) {
        const group = matchingItems.slice(g * X, (g + 1) * X);
        const groupSum = group.reduce((sum, item) => sum + item.price, 0);
        if (groupSum > Y) {
          offerDiscount += (groupSum - Y);
          group.forEach(item => usedIndices.add(item.idx));
        }
      }
    } else if (offer.offerType === 'bogo') {
      const X = offer.buyQuantity || 1;
      const Y = offer.getQuantity || 1;
      const groupSize = X + Y;

      const matchingItems = matchingIndices.map(idx => ({ idx, price: pool[idx].price }));
      matchingItems.sort((a, b) => b.price - a.price);

      let i = 0;
      while (i + groupSize <= matchingItems.length) {
        const group = matchingItems.slice(i, i + groupSize);
        const freeItems = group.slice(-Y);
        offerDiscount += freeItems.reduce((sum, item) => sum + item.price, 0);
        group.forEach(item => usedIndices.add(item.idx));
        i += groupSize;
      }
    } else if (offer.offerType === 'percentage') {
      const val = offer.discountValue || 0;
      matchingIndices.forEach(idx => {
        // Avoid double-discounting if the item was already discounted directly on its line price
        if (!pool[idx].isAlreadyDiscounted) {
          offerDiscount += pool[idx].price * (val / 100);
          usedIndices.add(idx);
        }
      });
    } else if (offer.offerType === 'fixed') {
      const val = offer.discountValue || 0;
      const unDiscounted = matchingIndices.filter(idx => !pool[idx].isAlreadyDiscounted);
      if (unDiscounted.length > 0) {
        offerDiscount = val;
        unDiscounted.forEach(idx => usedIndices.add(idx));
      }
    }

    if (offerDiscount > 0) {
      // Offers apply automatically (the shopper no longer picks them), so any old opt-out saved in the browser is ignored.
      const isApplied = true;
      applicableOffers.push({
        id: offer._id,
        title: offer.title,
        amount: Math.round(offerDiscount),
        applied: isApplied,
      });

      if (isApplied) {
        autoDiscountAmount += offerDiscount;
        appliedOffers.push({
          id: offer._id,
          title: offer.title,
          amount: Math.round(offerDiscount),
        });
        pool = pool.filter((_, idx) => !usedIndices.has(idx));
      }
    }
  });

  // Calculate free shipping from offers
  const hasFreeShippingOffer = offers.some(offer => offer.offerType === "free_shipping" && offer.isActive && state.items.some(item => {
    const productId = item.sourceId || item.id;
    const hasProducts = Array.isArray(offer.applicableProducts) && offer.applicableProducts.length > 0;
    if (hasProducts && !offer.applicableProducts.includes(productId)) return false;
    const hasCategories = Array.isArray(offer.applicableCategories) && offer.applicableCategories.length > 0;
    if (hasCategories) {
      const catId = item.categoryId || '';
      if (!catId || !offer.applicableCategories.includes(catId)) return false;
    }
    return true;
  }));

  const shippingVal = hasFreeShippingOffer ? 0 : cartShipping(sub);
  const activeGift = state.selectedGiftId ? GIFT_OPTIONS.find(g => g.id === state.selectedGiftId) : null;
  const gift = (state.isGift && activeGift) ? activeGift.price : 0;
  const finalTotal = Math.max(0, sub + shippingVal + gift - state.discountAmount - Math.round(autoDiscountAmount));

  // Apply coupon via backend (validates targeting, min order, expiry, etc.)
  const applyCouponCode = useCallback(async (code: string) => {
    try {
      const payload = {
        cartTotal: sub,
        items: state.items.map((i) => ({
          product: i.sourceId || i.id,
          qty: i.qty,
          name: i.name,
          sourceId: i.sourceId,
          category: i.category,
          style: i.style,
        })),
        productIds: state.items.map((i) => i.sourceId || i.id),
        categoryIds: state.items.map((i) => i.category).filter(Boolean),
        styleIds: state.items.map((i) => i.style).filter(Boolean),
      };

      const result = await applyCouponToCart(code, payload);

      if (result && result.success) {
        const amount = Number(result.discountAmount || 0);
        dispatch({ type: 'APPLY_DISCOUNT', payload: { code, amount } });
        return { success: true };
      }

      const message = typeof result === 'object' && result && 'message' in result
        ? String((result as { message?: string }).message || 'Invalid coupon')
        : 'Invalid coupon';
      return { success: false, message };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to apply coupon';
      return { success: false, message };
    }
  }, [sub, state.items]);

  const value: CartContextValue = {
    state,
    addItem, removeItem, updateQty,
    openDrawer, closeDrawer,
    toggleGift, setGiftId,    setGiftMessage,
    applyDiscount, removeDiscount,
    clearCart,
    syncCartPrices,
    applyCouponCode,
    toggleOfferOptOut: (id: string) => dispatch({ type: 'TOGGLE_OFFER_OPTOUT', payload: id }),
    setRewardPointsRedeemed: (points: number) => dispatch({ type: 'SET_REWARD_POINTS_REDEEMED', payload: points }),
    subtotal:  sub,
    savings:   cartSavings(state.items),
    shipping:  shippingVal,
    autoDiscountAmount: Math.round(autoDiscountAmount),
    appliedOffers,
    applicableOffers,
    total:     finalTotal,
    itemCount: cartItemCount(state.items),
    hydrated,
    persistFailed,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
