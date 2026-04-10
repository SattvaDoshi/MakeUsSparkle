'use client';

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface CartItem {
  id: number;
  name: string;
  price: number;
  originalPrice?: number | null;
  image: string;
  color: string;
  colorHex: string;
  qty: number;
  sku: string;
  href: string;
}

export interface CartState {
  items: CartItem[];
  isDrawerOpen: boolean;
  isGift: boolean;
  giftMessage: string;
  discountCode: string;
  discountAmount: number;
}

// ─── Actions ──────────────────────────────────────────────────────────────────
type Action =
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'qty'>; openDrawer?: boolean }
  | { type: 'REMOVE_ITEM';  payload: { id: number; colorHex: string } }
  | { type: 'UPDATE_QTY';   payload: { id: number; colorHex: string; qty: number } }
  | { type: 'OPEN_DRAWER'; openDrawer?: boolean }
  | { type: 'CLOSE_DRAWER' }
  | { type: 'TOGGLE_GIFT';  payload?: boolean }
  | { type: 'SET_GIFT_MSG'; payload: string }
  | { type: 'APPLY_DISCOUNT'; payload: { code: string; amount: number } }
  | { type: 'REMOVE_DISCOUNT' }
  | { type: 'CLEAR_CART' }
  | { type: 'HYDRATE';      payload: CartState };

// ─── Selectors (pure helpers) ─────────────────────────────────────────────────
export const GIFT_CHARGE = 99;
const FREE_SHIPPING_THRESHOLD = 598;

export function cartSubtotal(items: CartItem[]) {
  return items.reduce((sum, i) => sum + i.price * i.qty, 0);
}
export function cartSavings(items: CartItem[]) {
  return items.reduce(
    (sum, i) => sum + ((i.originalPrice ?? i.price) - i.price) * i.qty,
    0,
  );
}
export function cartShipping(subtotal: number) {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 79;
}
export function cartTotal(state: CartState) {
  const sub      = cartSubtotal(state.items);
  const shipping = cartShipping(sub);
  const gift     = state.isGift ? GIFT_CHARGE : 0;
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
};

function key(id: number, colorHex: string) {
  return `${id}__${colorHex}`;
}

function reducer(state: CartState, action: Action): CartState {
  switch (action.type) {

   case 'ADD_ITEM': {
  const k   = key(action.payload.id, action.payload.colorHex);
  const idx = state.items.findIndex(
    i => key(i.id, i.colorHex) === k,
  );

  const items =
    idx >= 0
      ? state.items.map((i, n) =>
          n === idx ? { ...i, qty: i.qty + 1 } : i,
        )
      : [...state.items, { ...action.payload, qty: 1 }];

  return { 
    ...state, 
    items, 
    isDrawerOpen: action.openDrawer ?? true // ✅ THIS LINE FIXES EVERYTHING
  };
}

    case 'REMOVE_ITEM': {
      const k = key(action.payload.id, action.payload.colorHex);
      return {
        ...state,
        items: state.items.filter(i => key(i.id, i.colorHex) !== k),
      };
    }

    case 'UPDATE_QTY': {
      const k = key(action.payload.id, action.payload.colorHex);
      return {
        ...state,
        items:
          action.payload.qty <= 0
            ? state.items.filter(i => key(i.id, i.colorHex) !== k)
            : state.items.map(i =>
                key(i.id, i.colorHex) === k
                  ? { ...i, qty: action.payload.qty }
                  : i,
              ),
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

    case 'APPLY_DISCOUNT':
      return {
        ...state,
        discountCode:   action.payload.code,
        discountAmount: action.payload.amount,
      };

    case 'REMOVE_DISCOUNT':
      return { ...state, discountCode: '', discountAmount: 0 };

    case 'CLEAR_CART':
      return { ...INITIAL };

    case 'HYDRATE':
      return { ...action.payload, isDrawerOpen: false };

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────
interface CartContextValue {
  state:          CartState;
  addItem: (item: Omit<CartItem, 'qty'>, openDrawer?: boolean) => void;
  removeItem:     (id: number, colorHex: string) => void;
  updateQty:      (id: number, colorHex: string, qty: number) => void;
  openDrawer:     () => void;
  closeDrawer:    () => void;
  toggleGift:     (val?: boolean) => void;
  setGiftMessage: (msg: string) => void;
  applyDiscount:  (code: string, amount: number) => void;
  removeDiscount: () => void;
  clearCart:      () => void;
  // derived
  subtotal:   number;
  savings:    number;
  shipping:   number;
  total:      number;
  itemCount:  number;
}

const CartContext = createContext<CartContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
const STORAGE_KEY = 'maison_cart_v1';

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL);

  // Hydrate from localStorage once on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartState;
        dispatch({ type: 'HYDRATE', payload: parsed });
      }
    } catch {}
  }, []);

  // Persist to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [state]);

const addItem = useCallback(
  (item: Omit<CartItem, 'qty'>, openDrawer = true) =>
    dispatch({ type: 'ADD_ITEM', payload: item, openDrawer }),
  []
);
  const removeItem     = useCallback((id: number, colorHex: string) => dispatch({ type: 'REMOVE_ITEM', payload: { id, colorHex } }), []);
  const updateQty      = useCallback((id: number, colorHex: string, qty: number) => dispatch({ type: 'UPDATE_QTY', payload: { id, colorHex, qty } }), []);
  const openDrawer     = useCallback(() => dispatch({ type: 'OPEN_DRAWER' }), []);
  const closeDrawer    = useCallback(() => dispatch({ type: 'CLOSE_DRAWER' }), []);
  const toggleGift     = useCallback((val?: boolean) => dispatch({ type: 'TOGGLE_GIFT', payload: val }), []);
  const setGiftMessage = useCallback((msg: string) => dispatch({ type: 'SET_GIFT_MSG', payload: msg }), []);
  const applyDiscount  = useCallback((code: string, amount: number) => dispatch({ type: 'APPLY_DISCOUNT', payload: { code, amount } }), []);
  const removeDiscount = useCallback(() => dispatch({ type: 'REMOVE_DISCOUNT' }), []);
  const clearCart      = useCallback(() => dispatch({ type: 'CLEAR_CART' }), []);

  const sub  = cartSubtotal(state.items);

  const value: CartContextValue = {
    state,
    addItem, removeItem, updateQty,
    openDrawer, closeDrawer,
    toggleGift, setGiftMessage,
    applyDiscount, removeDiscount,
    clearCart,
    subtotal:  sub,
    savings:   cartSavings(state.items),
    shipping:  cartShipping(sub),
    total:     cartTotal(state),
    itemCount: cartItemCount(state.items),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}