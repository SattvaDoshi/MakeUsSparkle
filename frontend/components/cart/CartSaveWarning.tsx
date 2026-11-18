'use client';

import { useCart } from '@/lib/cartContext';

/** Shown only when this browser could not store the cart, so the shopper knows it would not survive a refresh. */
export default function CartSaveWarning() {
  const { persistFailed, state } = useCart();
  if (!persistFailed || state.items.length === 0) return null;
  return (
    <div role="alert" style={{ margin: '10px 16px 0', padding: '10px 12px', borderRadius: 10, background: '#fdf3e3', border: '1px solid #f0d9a8', color: '#7a5a12', fontSize: 12.5, lineHeight: 1.45 }}>
      Your cart couldn&apos;t be saved on this device (storage is full — large uploaded photos are the usual cause).
      It will work for now, but please check out before refreshing or closing this tab.
    </div>
  );
}
