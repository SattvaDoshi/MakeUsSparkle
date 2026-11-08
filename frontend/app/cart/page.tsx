'use client';

import Em from "@/components/ui/Em";
import { CartSkeleton } from '@/components/ui/PageSkeletons';
import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/lib/cartContext';
import { useAuth } from '@/lib/authContext';
import { apiRequest } from '@/lib/api';
import { cdnImage } from '@/lib/cdn';
import CartUpsell from '@/components/cart/CartUpsell';
import { fetchCatalogProducts, type CatalogProduct } from '@/lib/catalogApi';

// ─── Gift Box Options (Cart level) ──────────────────────────────────────────
export const GIFT_OPTIONS = [
  {
    id: 'classic',
    title: 'Classic Gift Wrap',
    sub: 'Kraft paper & satin ribbon',
    price: 25,
    image: '/smallerBox.png',
  },
  {
    id: 'luxury',
    title: 'Luxury Gift Hamper',
    sub: 'Ideal for 4+ products',
    price: 250,
    image: '/Biggerbox.jpg',
  },
];

export default function CartPage() {
  const {
    state,
    subtotal,
    savings,
    shipping,
    total,
    itemCount,
    removeItem,
    updateQty,
    toggleGift,
    setGiftId,
    setGiftMessage,
    removeDiscount,
    applyCouponCode,
    setRewardPointsRedeemed,
    autoDiscountAmount,
    appliedOffers,
    applicableOffers,
    toggleOfferOptOut,
  } = useCart();

  const {
    items,
    isGift,
    giftMessage,
    discountCode,
    discountAmount,
    selectedGiftId,
    rewardPointsRedeemed,
  } = state;

  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { hydrated } = useCart();
  const router = useRouter();
  // Guests get the sign-up popup right here; once they are in, they continue straight to checkout.
  const goCheckout = (e: React.MouseEvent) => {
    e.preventDefault();
    if (authLoading) return;
    if (isAuthenticated) { router.push('/checkout'); return; }
    window.dispatchEvent(new CustomEvent('makeussparkle:auth-open', { detail: { tab: 'register', next: '/checkout' } }));
  };
  const [userRewardPoints, setUserRewardPoints] = useState(0);
  const [pointsInput, setPointsInput] = useState('');

  useEffect(() => {
    if (user) {
      apiRequest<{ success: boolean; rewardPoints: number }>('/rewards/points')
        .then((data) => setUserRewardPoints(data.rewardPoints || 0))
        .catch(console.error);
    }
  }, [user]);

  // Sync initial input if there's already points redeemed in state
  useEffect(() => {
    if (rewardPointsRedeemed > 0 && !pointsInput) {
      setPointsInput(rewardPointsRedeemed.toString());
    }
  }, [rewardPointsRedeemed, pointsInput]);

  const handleSelectGift = (id: string) => {
    if (selectedGiftId === id) {
      setGiftId(null);
      if (isGift) toggleGift();
    } else {
      setGiftId(id);
      if (!isGift) toggleGift();
    }
  };

  const activeGift = GIFT_OPTIONS.find((g) => g.id === selectedGiftId) ?? null;
  const baseTotal = total;
  const safeRewardPointsRedeemed = rewardPointsRedeemed || 0;
  const actualRedeemedPoints = Math.min(safeRewardPointsRedeemed, userRewardPoints, baseTotal);
  const displayTotal = baseTotal - actualRedeemedPoints;

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [openDetails, setOpenDetails] = useState<Record<string, boolean>>({});
  const [showPoints, setShowPoints] = useState(false);
  const [catalog, setCatalog] = useState<CatalogProduct[]>([]);
  const FREE_SHIP = 999;
  const toFree = Math.max(0, FREE_SHIP - subtotal);
  const shipPct = Math.min(100, Math.round((subtotal / FREE_SHIP) * 100));
  useEffect(() => {
    let live = true;
    fetchCatalogProducts().then((c) => live && setCatalog(c)).catch(() => {});
    return () => { live = false; };
  }, []);

  const handleApplyCoupon = useCallback(async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) {
      setCouponError('Enter a coupon code.');
      return;
    }
    if (discountCode === code) {
      setCouponError('This coupon is already applied.');
      return;
    }
    setCouponError('');
    setCouponSuccess('');
    try {
      const res = await applyCouponCode(code);
      if (res?.success) {
        setCouponSuccess('Coupon applied successfully!');
        setCouponInput('');
      } else {
        setCouponError(res?.message || 'Invalid coupon code.');
      }
    } catch (err: any) {
      setCouponError(err?.message || 'Failed to validate coupon');
    }
  }, [couponInput, discountCode, applyCouponCode]);

  if (!hydrated) return <CartSkeleton items={Math.max(1, state.items.length)} />;

  return (
    <>
      <style>{`
:root { --ink:#1a1a14; --mist:#6f6f64; --line:#ecebe4; --forest:#2a4736; --forest-d:#1f3a2a; --soft:#f1f5f1; --gold:#9a7a2e; --red:#c0392b; }
*, *::before, *::after { box-sizing: border-box; }
.cp-root { min-height:100vh; background:#fff; font-family:'Jost',sans-serif; color:var(--ink); overflow-x:clip; width:100%; }

/* Minimal top bar: cart is a focused, distraction-free step */
.cp-top { border-bottom:1px solid var(--line); background:#fff; }
.cp-top-in { max-width:1240px; margin:0 auto; padding:14px 20px; display:flex; align-items:center; justify-content:space-between; gap:12px; }
.cp-logo { font-family:'Cormorant Garamond',serif; font-weight:700; font-size:20px; letter-spacing:.14em; color:var(--ink); text-decoration:none; text-transform:uppercase; }
.cp-secure { display:inline-flex; align-items:center; gap:7px; font-size:12px; color:var(--mist); letter-spacing:.04em; }
.cp-secure svg { color:var(--forest); }

.cp-wrap { max-width:1240px; margin:0 auto; padding:22px 20px 120px; }
.cp-head { display:flex; align-items:baseline; gap:12px; margin-bottom:18px; }
.cp-title { font-family:'Cormorant Garamond',serif; font-size:clamp(1.9rem,4vw,2.6rem); font-weight:600; line-height:1.05; margin:0; }
.cp-count { font-size:14px; color:var(--mist); }

.cp-layout { display:grid; grid-template-columns:minmax(0,1fr); gap:20px; align-items:start; }
.cp-left, .cp-right { display:flex; flex-direction:column; gap:16px; min-width:0; }

.cp-card { background:#fff; border:1px solid var(--line); border-radius:18px; min-width:0; }

/* Free shipping progress */
.cp-ship { padding:16px 18px; background:#fafaf6; }
.cp-ship-msg { margin:0 0 10px; font-size:14px; color:#3a3a32; display:flex; align-items:center; gap:8px; }
.cp-ship-msg b { color:var(--forest); }
.cp-ship-track { height:8px; background:#e7e5da; border-radius:99px; overflow:hidden; }
.cp-ship-fill { display:block; height:100%; border-radius:99px; background:linear-gradient(90deg,#3d6b4f,var(--forest)); transition:width .5s ease; }
.cp-savings { margin:0; padding:11px 18px; background:var(--soft); color:var(--forest-d); font-size:13.5px; font-weight:500; display:flex; align-items:center; gap:8px; border-top:1px solid var(--line); border-radius:0 0 17px 17px; }

/* Items */
.cp-list { display:flex; flex-direction:column; }
.cp-item { padding:20px; border-top:1px solid var(--line); display:grid; grid-template-columns:132px minmax(0,1fr); gap:20px; align-items:start; }
.cp-item:first-child { border-top:0; }
.cp-item-img-link { position:relative; display:block; width:132px; aspect-ratio:4/5; border-radius:14px; overflow:hidden; background:#f4f3ee; }
.cp-item-img { width:100%; height:100%; object-fit:cover; display:block; }
.cp-item-off { position:absolute; left:8px; top:8px; background:#fff; color:var(--forest); font-size:11px; font-weight:600; padding:3px 9px; border-radius:999px; box-shadow:0 2px 8px rgba(0,0,0,.08); }
.cp-item-body { min-width:0; display:flex; flex-direction:column; gap:10px; }
.cp-item-top { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; }
.cp-item-name { font-size:17px; font-weight:500; line-height:1.3; color:var(--ink); text-decoration:none; overflow-wrap:anywhere; }
.cp-item-name:hover { text-decoration:underline; }
.cp-item-remove { flex-shrink:0; width:36px; height:36px; display:flex; align-items:center; justify-content:center; background:none; border:0; border-radius:50%; cursor:pointer; color:#8b8b80; transition:color .2s, background .2s; margin:-6px -6px 0 0; }
.cp-item-remove:hover { color:var(--red); background:#fbeeec; }
.cp-chips { display:flex; flex-wrap:wrap; gap:6px; }
.cp-chip { display:inline-flex; align-items:center; gap:6px; font-size:12.5px; color:#3a3a32; background:#f4f3ee; border-radius:999px; padding:4px 11px; line-height:1.3; }
.cp-chip i { width:11px; height:11px; border-radius:50%; border:1px solid rgba(0,0,0,.15); display:inline-block; }
.cp-chip--set { background:var(--soft); color:var(--forest); font-weight:500; }
.cp-meta { font-size:13px; color:var(--mist); line-height:1.5; }
.cp-gift-math-badge { display:inline-flex; align-items:center; gap:6px; font-size:12.5px; color:#7a5d17; background:#fbf7ea; border:1px solid #eadfb8; border-radius:999px; padding:4px 11px; width:fit-content; max-width:100%; }
.cp-item-foot { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-top:2px; }
.cp-qty { display:inline-flex; align-items:center; border:1px solid #dcdacf; border-radius:999px; background:#fff; height:42px; }
.cp-qty-btn { width:40px; height:40px; background:none; border:0; font-size:19px; cursor:pointer; color:var(--ink); border-radius:50%; display:flex; align-items:center; justify-content:center; }
.cp-qty-btn:hover { background:#f4f3ee; }
.cp-qty-btn:disabled { opacity:.35; cursor:not-allowed; }
.cp-qty-val { min-width:30px; text-align:center; font-size:15px; font-weight:600; }
.cp-tag { font-size:12.5px; color:var(--mist); }
.cp-item-price { display:flex; align-items:baseline; gap:8px; }
.cp-item-price b { font-size:19px; font-weight:600; }
.cp-item-price s { font-size:13.5px; color:#8b8b80; }
.cp-item-sub { display:flex; align-items:center; justify-content:space-between; gap:10px; font-size:12.5px; color:var(--mist); margin-top:-4px; }
.cp-save { color:var(--forest); font-weight:500; }
.cp-details-btn { align-self:flex-start; display:inline-flex; align-items:center; gap:7px; background:none; border:0; padding:4px 0; font:inherit; font-size:13px; font-weight:500; color:var(--forest); cursor:pointer; text-decoration:underline; text-underline-offset:3px; text-decoration-color:rgba(42,71,54,.35); }
.cp-details-btn:hover { text-decoration-color:var(--forest); }
.cp-item-extra { grid-column:1 / -1; display:flex; flex-direction:column; gap:10px; }

/* Included items / charms */
.cp-included-box { background:#fafaf6; border:1px solid var(--line); border-radius:14px; padding:12px 14px; display:flex; flex-direction:column; gap:6px; min-width:0; }
.cp-included-head { font-size:11px; letter-spacing:.14em; text-transform:uppercase; color:var(--mist); font-weight:600; }
.cp-included-row { display:flex; align-items:center; justify-content:space-between; gap:8px; padding:7px 0; border-bottom:1px solid var(--line); min-width:0; }
.cp-included-row:last-child { border-bottom:0; padding-bottom:0; }
.cp-included-name { font-size:13.5px; color:var(--ink); font-weight:500; overflow-wrap:anywhere; }

/* Gift packaging on an item */
.cp-giftbox-card { display:flex; align-items:center; gap:12px; background:#fbf7ea; border:1px solid #eadfb8; border-radius:14px; padding:10px 12px; min-width:0; }
.cp-giftbox-img, .cp-giftbox-icon-box { width:44px; height:44px; border-radius:10px; flex-shrink:0; }
.cp-giftbox-img { object-fit:cover; }
.cp-giftbox-icon-box { background:#f3e8c3; display:flex; align-items:center; justify-content:center; }
.cp-giftbox-body { flex:1; min-width:0; }
.cp-giftbox-top { display:flex; align-items:center; justify-content:space-between; gap:8px; flex-wrap:wrap; }
.cp-giftbox-badge { font-size:11px; font-weight:600; letter-spacing:.08em; text-transform:uppercase; color:#7a5d17; }
.cp-giftbox-title { font-size:13px; font-weight:500; }
.cp-giftbox-price { font-size:13px; font-weight:600; color:#7a5d17; }
.cp-giftbox-desc { margin:3px 0 0; font-size:12px; color:var(--mist); line-height:1.4; }
.cp-giftbox-msg { margin-top:3px; font-size:12px; color:#7a5d17; font-style:italic; }

/* Gift selector */
.cp-gift-panel { padding:18px; }
.cp-gift-header { display:flex; align-items:baseline; justify-content:space-between; margin-bottom:14px; }
.cp-gift-heading { font-family:'Cormorant Garamond',serif; font-size:22px; font-weight:600; }
.cp-gift-optional { font-size:12px; color:var(--mist); }
.cp-gift-cards { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px; }
.cp-gift-card { position:relative; display:grid; grid-template-columns:72px minmax(0,1fr); gap:12px; align-items:center; border:1.5px solid var(--line); border-radius:14px; padding:10px; cursor:pointer; background:#fff; transition:border-color .2s, box-shadow .2s; min-width:0; }
.cp-gift-card:hover { border-color:#cfcbb8; }
.cp-gift-card--selected { border-color:var(--forest); box-shadow:0 0 0 3px rgba(42,71,54,.1); background:#fafcfa; }
.cp-gift-card-img { width:72px; height:72px; object-fit:cover; border-radius:10px; background:#f4f3ee; }
.cp-gift-card-title { font-size:14px; font-weight:500; line-height:1.3; }
.cp-gift-card-sub { font-size:12px; color:var(--mist); margin:2px 0 4px; line-height:1.35; }
.cp-gift-card-price { font-size:14px; font-weight:600; color:var(--forest); }
.cp-gift-card-check { position:absolute; top:8px; right:8px; width:20px; height:20px; border-radius:50%; background:var(--forest); color:#fff; font-size:11px; display:flex; align-items:center; justify-content:center; opacity:0; transform:scale(.6); transition:all .2s; }
.cp-gift-card--selected .cp-gift-card-check { opacity:1; transform:scale(1); }
.cp-gift-msg-wrap { margin-top:12px; }
.cp-gift-msg { width:100%; padding:12px 14px; border:1px solid #dcdacf; border-radius:12px; font-family:inherit; font-size:14px; color:var(--ink); background:#fff; outline:none; resize:none; height:76px; }
.cp-gift-msg:focus { border-color:var(--forest); box-shadow:0 0 0 3px rgba(42,71,54,.1); }

/* Summary */
.cp-sum { padding:20px; }
.cp-sum-title { font-family:'Cormorant Garamond',serif; font-size:24px; font-weight:600; margin:0 0 14px; }
.cp-summary-row { display:flex; justify-content:space-between; align-items:center; gap:10px; font-size:14px; color:#3a3a32; margin-bottom:11px; }
.cp-summary-row span:last-child { font-weight:500; color:var(--ink); }
.cp-summary-row--savings, .cp-summary-row--savings span:last-child { color:var(--forest); }
.cp-summary-row--total { font-size:16px; font-weight:600; border-top:1px solid var(--line); padding-top:14px; margin:6px 0 0; }
.cp-summary-row--total span:last-child { font-size:22px; font-weight:600; }
.cp-tax-note { margin:4px 0 0; font-size:12px; color:var(--mist); text-align:right; }
.cp-summary-row .cp-free-tag, .cp-free-tag { background:var(--forest); color:#fff !important; font-size:10.5px; font-weight:600; letter-spacing:.1em; padding:3px 9px; border-radius:999px; }

.cp-offers { margin:4px 0 14px; display:flex; flex-direction:column; gap:8px; }
.cp-offer { display:flex; align-items:center; justify-content:space-between; gap:10px; border:1px solid var(--line); border-radius:12px; padding:9px 12px; background:#fff; }
.cp-offer.on { background:var(--soft); border-color:#cfd8cf; }
.cp-offer label { display:flex; align-items:center; gap:9px; cursor:pointer; flex:1; font-size:13.5px; }
.cp-offer input { accent-color:var(--forest); width:16px; height:16px; }
.cp-offer b { font-size:13.5px; font-weight:600; color:var(--forest); }

.cp-promo { background:#fafaf6; border:1px solid var(--line); border-radius:14px; padding:14px; margin-bottom:16px; }
.cp-promo-head { display:flex; align-items:center; gap:8px; font-size:13.5px; font-weight:600; margin-bottom:10px; color:var(--ink); }
.cp-promo-head svg { color:var(--forest); }
.cp-promo .cp-coupon-row { padding-bottom:0; }
.cp-promo .cp-coupon-msg { margin:8px 0 0; }
.cp-promo .cp-toggle { border-top:1px solid var(--line); margin-top:12px; padding:12px 0 0; }
.cp-toggle { width:100%; display:flex; align-items:center; justify-content:space-between; background:none; border:0; border-top:1px solid var(--line); padding:14px 0; font:inherit; font-size:14px; font-weight:500; color:var(--ink); cursor:pointer; }
.cp-toggle span:last-child { color:var(--forest); font-size:13px; }
.cp-coupon-row { display:flex; gap:8px; padding-bottom:14px; }
.cp-coupon-input { flex:1; min-width:0; height:46px; padding:0 16px; border:1px solid #dcdacf; border-radius:999px; font:inherit; font-size:14px; background:#fff; outline:none; text-transform:uppercase; letter-spacing:.04em; }
.cp-coupon-input:focus { border-color:var(--forest); box-shadow:0 0 0 3px rgba(42,71,54,.1); }
.cp-coupon-input::placeholder { text-transform:none; letter-spacing:normal; color:#9a9a8e; }
.cp-coupon-btn { height:46px; padding:0 22px; background:var(--ink); color:#fff; border:0; border-radius:999px; font:inherit; font-size:12px; font-weight:600; letter-spacing:.12em; text-transform:uppercase; cursor:pointer; }
.cp-coupon-btn:hover { background:#000; }
.cp-coupon-msg { font-size:12.5px; margin:-6px 0 12px; }
.cp-coupon-msg--error { color:var(--red); }
.cp-coupon-msg--success { color:var(--forest); }
.cp-coupon-applied { display:flex; align-items:center; justify-content:space-between; gap:8px; background:var(--soft); border:1px solid #cfd8cf; border-radius:12px; padding:10px 14px; font-size:13.5px; color:var(--forest-d); font-weight:500; margin-bottom:14px; }
.cp-coupon-remove { background:none; border:0; cursor:pointer; font-size:18px; color:var(--mist); line-height:1; }
.cp-coupon-remove:hover { color:var(--red); }
.cp-pts-bal { font-size:12.5px; color:var(--forest); background:var(--soft); padding:3px 10px; border-radius:999px; font-weight:500; }

.cp-checkout-btn { display:flex; align-items:center; justify-content:center; gap:10px; width:100%; height:56px; margin-top:16px; background:var(--forest); color:#fff; border:0; border-radius:999px; font:inherit; font-size:13px; font-weight:600; letter-spacing:.16em; text-transform:uppercase; text-decoration:none; cursor:pointer; transition:background .2s, transform .15s; }
.cp-checkout-btn:hover { background:var(--forest-d); }
.cp-checkout-btn:active { transform:scale(.99); }
.cp-pay-note { display:flex; align-items:center; justify-content:center; gap:7px; margin:12px 0 0; font-size:12px; color:var(--mist); }
.cp-pay-note svg { color:var(--forest); }

.cp-trust { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:0; border:1px solid var(--line); border-radius:16px; overflow:hidden; background:#fafaf6; }
.cp-trust-item { display:flex; align-items:center; gap:10px; padding:13px 14px; font-size:12.5px; color:#3a3a32; border-bottom:1px solid var(--line); border-right:1px solid var(--line); line-height:1.3; }
.cp-trust-item:nth-child(2n) { border-right:0; }
.cp-trust-item:nth-last-child(-n+2) { border-bottom:0; }

/* Upsell restyle on this page */
.cp-root .cu { margin:0; border-top:0; padding:20px 18px 18px; }
.cp-root .cu-row { margin:0 -18px; padding:2px 18px 8px; scroll-padding-left:18px; }

/* Empty */
.cp-empty { text-align:center; padding:72px 20px 40px; }
.cp-empty-icon { width:84px; height:84px; margin:0 auto 18px; border-radius:50%; background:var(--soft); color:var(--forest); display:flex; align-items:center; justify-content:center; font-size:36px; }
.cp-empty-title { font-family:'Cormorant Garamond',serif; font-size:2rem; font-weight:600; margin:0 0 6px; }
.cp-empty-text { font-size:15px; color:var(--mist); margin:0 0 22px; }
.cp-empty-link { display:inline-flex; align-items:center; gap:10px; padding:15px 32px; background:var(--forest); color:#fff; border-radius:999px; text-decoration:none; font-size:12.5px; font-weight:600; letter-spacing:.16em; text-transform:uppercase; }

/* Mobile sticky checkout */
.cp-sticky { position:fixed; left:0; right:0; bottom:0; z-index:50; background:#fff; border-top:1px solid var(--line); padding:10px 16px calc(10px + env(safe-area-inset-bottom)); display:flex; align-items:center; gap:14px; box-shadow:0 -8px 24px rgba(26,26,20,.08); }
.cp-sticky-total { display:flex; flex-direction:column; line-height:1.15; min-width:0; }
.cp-sticky-total small { font-size:11.5px; color:var(--mist); }
.cp-sticky-total b { font-size:19px; font-weight:600; }
.cp-sticky .cp-checkout-btn { margin:0; height:50px; flex:1; font-size:12px; letter-spacing:.12em; }

@media (min-width:1024px) {
  .cp-layout { grid-template-columns:minmax(0,1fr) 400px; gap:32px; }
  .cp-right { position:sticky; top:20px; }
  .cp-sticky { display:none; }
  .cp-wrap { padding-bottom:80px; }
}
@media (max-width:639px) {
  .cp-top-in { padding:12px 16px; }
  .cp-wrap { padding:16px 14px 110px; }
  .cp-item { padding:16px 14px; grid-template-columns:96px minmax(0,1fr); gap:14px; }
  .cp-item-img-link { width:96px; }
  .cp-item-name { font-size:15.5px; }
  .cp-item-price b { font-size:17px; }
  .cp-gift-cards { grid-template-columns:1fr; }
  .cp-ship { padding:14px; }
  .cp-root .cu { padding:16px 14px 14px; }
  .cp-root .cu-row { margin:0 -14px; padding:2px 14px 8px; scroll-padding-left:14px; }
  .cp-trust-item { padding:11px 12px; font-size:12px; }
}
@media (prefers-reduced-motion:reduce) { .cp-ship-fill { transition:none; } }
`}</style>

      <div className="cp-root">
        <header className="cp-top">
          <div className="cp-top-in">
            <Link href="/" className="cp-logo" aria-label="Make You Sparkle home">Make You Sparkle</Link>
            <span className="cp-secure">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
              Secure checkout
            </span>
          </div>
        </header>

        <div className="cp-wrap">
          {items.length === 0 ? (
            <>
              <div className="cp-empty">
                <div className="cp-empty-icon"><Em c="🛍" size="1em" /></div>
                <h1 className="cp-empty-title">Your bag is empty</h1>
                <p className="cp-empty-text">Find something you&apos;ll love.</p>
                <Link href="/categories" className="cp-empty-link">
                  Start shopping
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </Link>
              </div>
              <div className="cp-card" style={{ marginTop: 24 }}>
                <CartUpsell items={items} products={catalog} onNavigate={() => {}} quiet />
              </div>
            </>
          ) : (
            <>
              <div className="cp-head">
                <h1 className="cp-title">Your bag</h1>
                <span className="cp-count">{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
              </div>

              <div className="cp-layout">
                <div className="cp-left">
                  <div className="cp-card">
                    <div className="cp-ship">
                      <p className="cp-ship-msg">
                        {toFree > 0
                          ? <><Em c="🚚" /> <span>You&apos;re <b>₹{toFree.toLocaleString('en-IN')}</b> away from <b>free shipping</b></span></>
                          : <><Em c="🎉" /> <span>You&apos;ve unlocked <b>free shipping</b></span></>}
                      </p>
                      <div className="cp-ship-track" role="progressbar" aria-valuenow={shipPct} aria-valuemin={0} aria-valuemax={100}>
                        <span className="cp-ship-fill" style={{ width: `${shipPct}%` }} />
                      </div>
                    </div>
                    {savings > 0 && (
                      <p className="cp-savings"><Em c="🎉" /> You&apos;re saving ₹{savings.toLocaleString('en-IN')} on this order</p>
                    )}
                    <div className="cp-list">
                  {items.map((item) => {
                    const key = item.cartItemId ?? `${item.id}-${item.colorHex}`;
                    const giftPrice = item.giftBox ? Number(item.giftBoxDetails?.price ?? 50) : 0;
                    const basePrice = item.basePrice ?? Math.max(0, item.price - giftPrice);
                    const itemTotal = item.price * item.qty;
                    const hasStrikethrough = Boolean(item.originalPrice && item.originalPrice > item.price);
                    const youSave = hasStrikethrough ? (item.originalPrice! - item.price) * item.qty : 0;
                    const offPct = hasStrikethrough ? Math.round(((item.originalPrice! - item.price) / item.originalPrice!) * 100) : 0;
                    const charmCount = item.selectedCharms?.length ?? 0;
                    // "What's included" only earns its place when there is something real to show:
                    // named charms/pieces or the shopper's own choices, never a bare "Piece 1".
                    const selections = (item.selectionGroups ?? []).flatMap((g) => g.items ?? []);
                    const namedPieces = selections.filter((sel) => sel.name && !/^piece\s*\d+$/i.test(sel.name.trim()));
                    const pieceChoices = selections.some((sel) => {
                      const cd = (sel.customData ?? {}) as Record<string, any>;
                      return Boolean(cd.color || cd.size || cd.chain || cd.presetMessage || cd.personalMessage || Object.keys(cd.selections ?? {}).length);
                    });
                    const hasDetails = charmCount > 0 || namedPieces.length > 0 || pieceChoices || Boolean(item.customData?.comboPresetMessage || item.customData?.comboPersonalMessage);
                    const detailsOpen = Boolean(openDetails[key]);
                    const colour = item.color && !/^(default|none)$/i.test(item.color) ? item.color : '';
                    const chips: React.ReactNode[] = [];
                    if (colour) chips.push(<span key="c" className="cp-chip"><i style={{ background: item.colorHex }} />{colour}</span>);
                    if (item.size) chips.push(<span key="s" className="cp-chip">Size {item.size}</span>);
                    if (item.variantLabel) chips.push(<span key="v" className="cp-chip">{item.variantLabel}</span>);
                    if (item.chain) chips.push(<span key="ch" className="cp-chip">Chain: {item.chainLabel || item.chain}</span>);
                    if (charmCount > 0) chips.push(<span key="cm" className="cp-chip cp-chip--set">{charmCount} {charmCount === 1 ? 'charm' : 'charms'}</span>);
                    else if (namedPieces.length > 1) chips.push(<span key="pc" className="cp-chip cp-chip--set">Set of {namedPieces.length}</span>);

                    return (
                      <article className="cp-item" key={key}>
                        <Link href={item.href || `/products/${item.id}`} className="cp-item-img-link" aria-label={item.name}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img className="cp-item-img" src={cdnImage(item.image, 360)} alt="" width={132} height={165} decoding="async" />
                          {offPct > 0 && <span className="cp-item-off">{offPct}% off</span>}
                        </Link>

                        <div className="cp-item-body">
                          <div className="cp-item-top">
                            <Link href={item.href || `/products/${item.id}`} className="cp-item-name">{item.name}</Link>
                            <button className="cp-item-remove" onClick={() => removeItem(item.id, item.colorHex)} aria-label={`Remove ${item.name}`} title="Remove">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /></svg>
                            </button>
                          </div>

                          {chips.length > 0 && <div className="cp-chips">{chips}</div>}
                          {(item as any).priceBreakdown && <div className="cp-meta">{(item as any).priceBreakdown}</div>}
                          {giftPrice > 0 && (
                            <div className="cp-gift-math-badge"><Em c="🎁" /> Gift box · +₹{(giftPrice * item.qty).toLocaleString('en-IN')}</div>
                          )}

                          <div className="cp-item-foot">
                            <div className="cp-qty" role="group" aria-label={`Quantity of ${item.name}`}>
                              <button className="cp-qty-btn" onClick={() => updateQty(item.id, item.colorHex, item.qty - 1)} disabled={item.qty <= 1} aria-label="Decrease quantity">−</button>
                              <span className="cp-qty-val" aria-live="polite">{item.qty}</span>
                              <button className="cp-qty-btn" onClick={() => updateQty(item.id, item.colorHex, item.qty + 1)} disabled={item.qty >= 10} aria-label="Increase quantity">+</button>
                            </div>
                            <div className="cp-item-price">
                              <b>₹{itemTotal.toLocaleString('en-IN')}</b>
                              {hasStrikethrough && <s>₹{(item.originalPrice! * item.qty).toLocaleString('en-IN')}</s>}
                            </div>
                          </div>
                          {(youSave > 0 || item.qty > 1) && (
                            <div className="cp-item-sub">
                              {youSave > 0 && <span className="cp-save">You save ₹{youSave.toLocaleString('en-IN')}</span>}
                              {item.qty > 1 && <span>₹{item.price.toLocaleString('en-IN')} each</span>}
                            </div>
                          )}

                          {hasDetails && (
                            <button type="button" className="cp-details-btn" onClick={() => setOpenDetails((o) => ({ ...o, [key]: !o[key] }))} aria-expanded={detailsOpen}>
                              <span>{detailsOpen ? 'Hide' : 'View'} what&apos;s included</span>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ transform: detailsOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}><polyline points="6 9 12 15 18 9" /></svg>
                            </button>
                          )}
                        </div>

                        {(detailsOpen || item.giftBox) && (
                          <div className="cp-item-extra">
                            {detailsOpen && (
                              <>
                        {/* Charms Section */}
                        {item.selectedCharms && item.selectedCharms.length > 0 && (
                          <div className="cp-included-box">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                              <span className="cp-included-head">
                                {item.selectedCharms.length} Charms Selected
                              </span>
                              {(item as any).band?.name && (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, color: 'var(--olive-600)', background: 'rgba(74,92,34,.08)', padding: '2px 8px', borderRadius: 20 }}>
                                  {(item as any).band?.image ? (
                                    <img src={(item as any).band.image} alt={(item as any).band.name} style={{ width: 14, height: 14, borderRadius: '50%', objectFit: 'cover' }} />
                                  ) : <span><Em c="🪡" /></span>}
                                  {(item as any).band.name}
                                </span>
                              )}
                              {(item as any).selectionGroups?.[0]?.metadata?.packAddOn > 0 && (
                                <span style={{ fontSize: 11, color: 'var(--mist)', fontStyle: 'italic' }}>
                                  +₹{(item as any).selectionGroups[0].metadata.packAddOn} pack add-on
                                </span>
                              )}
                            </div>
                            {item.selectedCharms.map((selection, idx: number) => {
                              const charm = typeof selection === 'string' ? { id: selection, name: selection } : selection;
                              return (
                                <div key={(charm as any).id || (charm as any)._id || idx} className="cp-included-row">
                                  <span style={{ fontSize: 13, color: 'var(--olive-900)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--olive-600)', color: '#ffffff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                      {idx + 1}
                                    </span>
                                    {(charm as any).name || 'Charm'}
                                  </span>
                                  {(charm as any).price ? (
                                    <span style={{ fontWeight: 600, color: 'var(--olive-600)', fontSize: 12 }}>
                                      ₹{(charm as any).price.toLocaleString('en-IN')}
                                    </span>
                                  ) : null}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Included Items Section */}
                        {!item.selectedCharms?.length && item.selectionGroups && item.selectionGroups.length > 0 && (
                          <div className="cp-included-box">
                            <div className="cp-included-head">Included Items</div>
                            {Boolean(item.customData) && (Boolean(item.customData?.comboPresetMessage) || Boolean(item.customData?.comboPersonalMessage)) && (
                              <div style={{ padding: '6px 10px', background: 'rgba(201,168,76,0.14)', borderRadius: 8, fontSize: 12, color: 'var(--olive-700)', marginBottom: 4 }}>
                                <div style={{ fontWeight: 600, fontSize: 10.5, color: '#8c6b20', textTransform: 'uppercase', letterSpacing: '.06em' }}>Custom Message Card</div>
                                {Boolean(item.customData?.comboPresetMessage) && <div>Card: <em>{String(item.customData?.comboPresetMessage)}</em></div>}
                                {Boolean(item.customData?.comboPersonalMessage) && <div>Personal Note: &ldquo;{String(item.customData?.comboPersonalMessage)}&rdquo;</div>}
                              </div>
                            )}
                            {item.selectionGroups.flatMap((group) =>
                              group.items.map((selection, idx) => (
                                <div key={selection.id || idx} className="cp-included-row">
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    {selection.image && (
                                      <img src={selection.image} alt={selection.name} style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover' }} />
                                    )}
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                      <span style={{ fontSize: 10.5, color: 'var(--mist)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                                        {group.label || group.category}
                                      </span>
                                      <span className="cp-included-name">{selection.name}</span>
                                    {Boolean(selection.customData) && (
  <div style={{ fontSize: 12.5, color: 'var(--olive-700)', marginTop: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
    {Object.entries((selection.customData?.selections as Record<string, string>) || {}).map(([k, v]) => (
      <div key={k}>{k}: <strong>{String(v)}</strong></div>
    ))}
    {Boolean(selection.customData?.color) && <div>Colour: <strong>{String(selection.customData?.color)}</strong></div>}
    {Boolean(selection.customData?.size) && <div>Size: <strong>{String(selection.customData?.size)}</strong></div>}
    {Boolean(selection.customData?.presetMessage) && <div>Card: <em>{String(selection.customData?.presetMessage)}</em></div>}
    {Boolean(selection.customData?.personalMessage) && <div>Msg: &ldquo;{String(selection.customData?.personalMessage)}&rdquo;</div>}
    {Boolean(selection.customData?.chain) && <div>Chain: <strong>{String(selection.customData?.chain)}</strong></div>}
  </div>
)}
                                    </div>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        )}

                              </>
                            )}
                        {/* Gift Packaging Card for this item */}
                        {item.giftBox && (
                          <div className="cp-giftbox-card">
                            {item.giftBoxDetails?.image ? (
                              <img
                                src={item.giftBoxDetails.image}
                                alt={item.giftBoxDetails.heading || 'Gift Box'}
                                className="cp-giftbox-img"
                              />
                            ) : (
                              <div className="cp-giftbox-icon-box"><Em c="🎁" /></div>
                            )}
                            <div className="cp-giftbox-body">
                              <div className="cp-giftbox-top">
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                  <span className="cp-giftbox-badge"><Em c="🎁" /> Gift Packaging Added</span>
                                  <span className="cp-giftbox-title">
                                    {item.giftBoxDetails?.heading || 'Premium Gift Box'}
                                  </span>
                                </div>
                                <span className="cp-giftbox-price">
                                  +₹{giftPrice.toLocaleString('en-IN')}
                                </span>
                              </div>
                              {item.giftBoxDetails?.description && (
                                <p className="cp-giftbox-desc">{item.giftBoxDetails.description}</p>
                              )}
                              {item.giftMessage && (
                                <div className="cp-giftbox-msg">
                                  Message card: &ldquo;{item.giftMessage}&rdquo;
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                          </div>
                        )}
                      </article>
                    );
                  })}
                    </div>
                  </div>

                  <div className="cp-card">
                    <GiftBoxSelector
                      selectedGiftId={selectedGiftId}
                      onSelect={handleSelectGift}
                      giftMessage={giftMessage}
                      onMessageChange={setGiftMessage}
                      isGift={isGift}
                    />
                  </div>

                  <div className="cp-card">
                    <CartUpsell items={items} products={catalog} onNavigate={() => {}} quiet />
                  </div>
                </div>

                <aside className="cp-right" aria-label="Order summary">
                  <div className="cp-card cp-sum">
                    <h2 className="cp-sum-title">Order summary</h2>

                    {/* Promotions */}
                    <div className="cp-promo" id="promo">
                      <div className="cp-promo-head">
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>
                        Promo code
                      </div>
                      {discountCode ? (
                        <div className="cp-coupon-applied">
                          <span>&ldquo;{discountCode}&rdquo; applied — ₹{discountAmount} off</span>
                          <button className="cp-coupon-remove" onClick={removeDiscount} aria-label="Remove coupon">×</button>
                        </div>
                      ) : (
                        <>
                          <div className="cp-coupon-row">
                            <input
                              className="cp-coupon-input"
                              value={couponInput}
                              onChange={(e) => { setCouponInput(e.target.value); setCouponError(''); setCouponSuccess(''); }}
                              placeholder="Enter code"
                              aria-label="Promo code"
                              onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                            />
                            <button className="cp-coupon-btn" onClick={handleApplyCoupon}>Apply</button>
                          </div>
                          {couponError && <p className="cp-coupon-msg cp-coupon-msg--error">{couponError}</p>}
                          {couponSuccess && <p className="cp-coupon-msg cp-coupon-msg--success">{couponSuccess}</p>}
                        </>
                      )}

                      {userRewardPoints > 0 && (
                        <>
                          <button type="button" className="cp-toggle" onClick={() => setShowPoints((v) => !v)} aria-expanded={showPoints}>
                            <span>Sparkle points <span className="cp-pts-bal">{userRewardPoints} pts</span></span><span>{showPoints ? 'Hide' : 'Use'}</span>
                          </button>
                          {(showPoints || actualRedeemedPoints > 0) && (
                            <>
                              <div className="cp-coupon-row">
                                <input
                                  className="cp-coupon-input"
                                  type="number"
                                  min="0"
                                  max={Math.min(userRewardPoints, baseTotal)}
                                  value={pointsInput}
                                  onChange={(e) => setPointsInput(e.target.value)}
                                  placeholder={`Up to ${Math.min(userRewardPoints, baseTotal)} pts`}
                                  aria-label="Points to redeem"
                                />
                                <button
                                  className="cp-coupon-btn"
                                  onClick={() => {
                                    const parsedVal = parseInt(pointsInput, 10);
                                    const val = Math.max(0, Math.min(isNaN(parsedVal) ? 0 : parsedVal, userRewardPoints, baseTotal));
                                    setRewardPointsRedeemed(val);
                                    setPointsInput(val.toString());
                                  }}
                                >Redeem</button>
                              </div>
                              {actualRedeemedPoints > 0 && (
                                <div className="cp-coupon-applied">
                                  <span>−₹{actualRedeemedPoints} points redeemed</span>
                                  <button className="cp-coupon-remove" onClick={() => { setRewardPointsRedeemed(0); setPointsInput(''); }} aria-label="Remove points">×</button>
                                </div>
                              )}
                            </>
                          )}
                        </>
                      )}
                    </div>


                    <div className="cp-summary-row">
                      <span>Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
                      <span>₹{subtotal.toLocaleString('en-IN')}</span>
                    </div>
                    {savings > 0 && (
                      <div className="cp-summary-row cp-summary-row--savings">
                        <span>Product savings</span><span>−₹{savings.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    {discountAmount > 0 && (
                      <div className="cp-summary-row cp-summary-row--savings">
                        <span>Coupon discount</span><span>−₹{discountAmount}</span>
                      </div>
                    )}
                    {actualRedeemedPoints > 0 && (
                      <div className="cp-summary-row cp-summary-row--savings">
                        <span>Sparkle points</span><span>−₹{actualRedeemedPoints}</span>
                      </div>
                    )}

                    {applicableOffers.length > 0 && (
                      <div className="cp-offers">
                        {applicableOffers.map((o) => (
                          <div key={o.id} className={`cp-offer${o.applied ? ' on' : ''}`}>
                            <label>
                              <input type="checkbox" checked={o.applied} onChange={() => toggleOfferOptOut(o.id)} />
                              <span>{o.title}</span>
                            </label>
                            <b>{o.applied ? `−₹${o.amount.toLocaleString('en-IN')}` : 'Off'}</b>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="cp-summary-row">
                      <span>Shipping</span>
                      <span>{shipping === 0 ? <span className="cp-free-tag">FREE</span> : `₹${shipping}`}</span>
                    </div>
                    {activeGift && (
                      <div className="cp-summary-row">
                        <span><Em c="🎁" /> {activeGift.title}</span><span>₹{activeGift.price}</span>
                      </div>
                    )}

                    <div className="cp-summary-row cp-summary-row--total">
                      <span>Total</span><span>₹{displayTotal.toLocaleString('en-IN')}</span>
                    </div>
                    <p className="cp-tax-note">Inclusive of all taxes</p>

                    <Link href="/checkout" className="cp-checkout-btn" onClick={goCheckout}>
                      Proceed to checkout
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </Link>
                    <p className="cp-pay-note">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
                      Secure payment · UPI, cards &amp; COD
                    </p>
                  </div>

                  <div className="cp-trust">
                    <div className="cp-trust-item"><Em c="💎" /><span>Anti-tarnish finish</span></div>
                    <div className="cp-trust-item"><Em c="🚚" /><span>Free delivery on ₹999+</span></div>
                    <div className="cp-trust-item"><Em c="🔄" /><span>Easy 7-day exchange</span></div>
                    <div className="cp-trust-item"><Em c="🔒" /><span>100% secure checkout</span></div>
                  </div>
                </aside>
              </div>

              <div className="cp-sticky">
                <div className="cp-sticky-total"><small>Total</small><b>₹{displayTotal.toLocaleString('en-IN')}</b></div>
                <Link href="/checkout" className="cp-checkout-btn" onClick={goCheckout}>Checkout</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   GiftBoxSelector Component
───────────────────────────────────────────────────────────────────────────── */
function GiftBoxSelector({
  selectedGiftId,
  onSelect,
  giftMessage,
  onMessageChange,
  isGift,
}: {
  selectedGiftId: string | null;
  onSelect: (id: string) => void;
  giftMessage: string;
  onMessageChange: (msg: string) => void;
  isGift: boolean;
}) {
  return (
    <div className="cp-gift-panel">
      <div className="cp-gift-header">
        <span className="cp-gift-heading">Make it a Gift</span>
        <span className="cp-gift-optional">optional</span>
      </div>

      <div className="cp-gift-cards">
        {GIFT_OPTIONS.map((opt) => {
          const isSelected = selectedGiftId === opt.id;
          return (
            <div
              key={opt.id}
              className={`cp-gift-card${isSelected ? ' cp-gift-card--selected' : ''}`}
              onClick={() => onSelect(opt.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onSelect(opt.id)}
              aria-pressed={isSelected}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="cp-gift-card-img" src={opt.image} alt={opt.title} />
              <div className="cp-gift-card-body">
                <div className="cp-gift-card-title">{opt.title}</div>
                <div className="cp-gift-card-sub">{opt.sub}</div>
                <div className="cp-gift-card-price">+₹{opt.price}</div>
              </div>
              <div className="cp-gift-card-check" aria-hidden="true">
                ✓
              </div>
            </div>
          );
        })}
      </div>

      {selectedGiftId && (
        <div className="cp-gift-msg-wrap">
          <textarea
            className="cp-gift-msg"
            placeholder="Write a gift message card (optional)…"
            value={giftMessage}
            onChange={(e) => onMessageChange(e.target.value)}
            maxLength={160}
          />
        </div>
      )}
    </div>
  );
}
