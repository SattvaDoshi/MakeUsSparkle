'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/cartContext';
import { useAuth } from '@/lib/authContext';
import { apiRequest } from '@/lib/api';
import UpperNav from '@/components/ui/UpperNav';
import CartBanner from '@/components/cart/CartBanner';

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

  const { user } = useAuth();
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

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=Jost:wght@300;400;500;600;700&display=swap');

        :root {
          --beige: #fbf8f3;
          --beige-surface: #f5efe6;
          --beige-dk: #ede5d5;
          --beige-dkr: #dcd0bc;
          --olive-900: #1a1f0d;
          --olive-800: #2a3315;
          --olive-700: #38451c;
          --olive-600: #4a5b25;
          --olive-500: #5c7030;
          --olive-400: #7a8e3c;
          --olive-200: #c4cc9a;
          --olive-50: #f2f5e8;
          --gold: #c9a84c;
          --gold-lt: #eedfa0;
          --gold-bg: rgba(201, 168, 76, 0.12);
          --ink: #1a1d13;
          --mist: #6e7264;
          --mist-lt: #999d91;
          --red: #c0392b;
          --green: #2e7d32;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .cp-root {
          min-height: 100vh;
          background: var(--beige);
          font-family: 'Jost', sans-serif;
          color: var(--ink);
        }

        /* ── Breadcrumb & Header ── */
        .cp-header-wrap {
          max-width: 1220px;
          margin: 68px auto 0;
          padding: 24px 32px 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }
        .cp-breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: var(--mist);
          letter-spacing: .08em;
          text-transform: uppercase;
        }
        .cp-breadcrumb a {
          color: var(--mist);
          text-decoration: none;
          transition: color .2s;
        }
        .cp-breadcrumb a:hover {
          color: var(--olive-700);
        }
        .cp-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 34px;
          font-weight: 600;
          color: var(--olive-900);
          letter-spacing: .02em;
        }
        .cp-item-count-badge {
          font-size: 12px;
          font-weight: 600;
          font-family: 'Jost', sans-serif;
          color: var(--olive-700);
          background: rgba(74, 91, 37, 0.1);
          padding: 3px 10px;
          border-radius: 50px;
          margin-left: 8px;
          vertical-align: middle;
        }

        /* ── Layout Grid ── */
        .cp-layout {
          display: grid;
          grid-template-columns: 1fr 390px;
          gap: 28px;
          max-width: 1220px;
          margin: 0 auto;
          padding: 12px 32px 80px;
          align-items: start;
        }
        .cp-left { display: flex; flex-direction: column; gap: 20px; }
        .cp-right { position: sticky; top: 88px; display: flex; flex-direction: column; gap: 18px; }

        /* ── Elevated Glass/Card Panels ── */
        .cp-panel {
          background: #ffffff;
          border-radius: 20px;
          border: 1px solid rgba(201, 168, 76, 0.2);
          box-shadow: 0 4px 20px rgba(26, 31, 13, 0.03);
          overflow: hidden;
        }
        .cp-panel-head {
          padding: 18px 24px;
          border-bottom: 1px solid rgba(61, 74, 34, 0.08);
          font-size: 11px;
          letter-spacing: .25em;
          text-transform: uppercase;
          color: var(--mist);
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        /* ── Offer / Banner Meter ── */
        .cp-banner-meter {
          padding: 18px 22px;
        }

        /* ── Savings Celebration Strip ── */
        .cp-savings-strip {
          margin: 16px 24px 8px;
          background: linear-gradient(135deg, #eaf6ea 0%, #f3faf2 100%);
          border: 1px solid #b7e4b9;
          border-radius: 12px;
          padding: 12px 18px;
          font-size: 13.5px;
          color: #1e6b22;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        /* ── Cart Item Row ── */
        .cp-item {
          display: flex;
          flex-direction: column;
          gap: 14px;
          padding: 22px 24px;
          border-bottom: 1px solid rgba(61, 74, 34, 0.07);
          transition: background-color .18s;
        }
        .cp-item:last-child { border-bottom: none; }
        .cp-item:hover { background-color: rgba(251, 248, 243, 0.4); }

        .cp-item-top {
          display: flex;
          gap: 18px;
          align-items: flex-start;
        }
        .cp-item-img-link {
          flex-shrink: 0;
          border-radius: 14px;
          overflow: hidden;
          border: 1px solid rgba(201, 168, 76, 0.22);
          box-shadow: 0 3px 12px rgba(0, 0, 0, 0.04);
          background: var(--beige-surface);
          transition: transform .2s, border-color .2s;
        }
        .cp-item-img-link:hover {
          transform: scale(1.02);
          border-color: var(--gold);
        }
        .cp-item-img {
          width: 96px;
          height: 96px;
          object-fit: cover;
          display: block;
        }

        .cp-item-body {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .cp-item-name {
          font-size: 16px;
          font-weight: 600;
          color: var(--olive-900);
          line-height: 1.4;
          text-decoration: none;
          transition: color .2s;
        }
        .cp-item-name:hover {
          color: var(--olive-600);
        }

        /* Price display */
        .cp-item-pricing {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-top: 4px;
        }
        .cp-item-price-row {
          display: flex;
          align-items: baseline;
          gap: 10px;
          flex-wrap: wrap;
        }
        .cp-item-price {
          font-size: 18px;
          font-weight: 700;
          color: var(--olive-900);
          letter-spacing: -.01em;
        }
        .cp-item-original {
          font-size: 13.5px;
          color: var(--mist-lt);
          text-decoration: line-through;
          font-weight: 400;
        }
        .cp-gift-math-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 600;
          color: #8c6b20;
          background: rgba(201, 168, 76, 0.14);
          border: 1px solid rgba(201, 168, 76, 0.28);
          border-radius: 8px;
          padding: 3px 9px;
          width: fit-content;
          margin-top: 2px;
        }

        .cp-item-per {
          font-size: 11.5px;
          color: var(--mist);
          margin-top: 2px;
        }

        .cp-item-actions {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          justify-content: space-between;
          flex-shrink: 0;
          gap: 18px;
        }
        .cp-item-remove {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--mist-lt);
          font-size: 22px;
          line-height: 1;
          padding: 4px;
          transition: color .2s, transform .15s;
          border-radius: 6px;
        }
        .cp-item-remove:hover {
          color: var(--red);
          transform: scale(1.15);
        }

        /* Quantity pill */
        .cp-qty {
          display: flex;
          align-items: center;
          border: 1.5px solid var(--beige-dkr);
          border-radius: 50px;
          overflow: hidden;
          background: var(--beige-surface);
          box-shadow: 0 1px 4px rgba(0,0,0,0.03);
        }
        .cp-qty-btn {
          width: 32px;
          height: 32px;
          background: none;
          border: none;
          font-size: 17px;
          cursor: pointer;
          color: var(--olive-700);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background .15s, color .15s;
        }
        .cp-qty-btn:hover {
          background: var(--olive-50);
          color: var(--olive-900);
        }
        .cp-qty-val {
          min-width: 32px;
          text-align: center;
          font-size: 13px;
          font-weight: 600;
          color: var(--ink);
        }

        /* ── Included Items / Pieces / Customization Box ── */
        .cp-included-box {
          background: linear-gradient(135deg, #f9f6ef 0%, #f4efe4 100%);
          border: 1px solid rgba(201, 168, 76, 0.2);
          border-radius: 12px;
          padding: 12px 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .cp-included-head {
          font-size: 10px;
          letter-spacing: .24em;
          text-transform: uppercase;
          color: var(--mist);
          font-weight: 700;
        }
        .cp-included-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 6px 0;
          border-bottom: 1px solid rgba(61, 74, 34, 0.06);
        }
        .cp-included-row:last-child { border-bottom: none; }
        .cp-included-name {
          font-size: 13px;
          color: var(--olive-900);
          font-weight: 500;
        }

        /* ── Gift Packaging Added Banner on Item ── */
        .cp-giftbox-card {
          background: linear-gradient(135deg, rgba(201, 168, 76, 0.12) 0%, rgba(92, 112, 48, 0.06) 100%);
          border: 1.5px solid rgba(201, 168, 76, 0.32);
          border-radius: 14px;
          padding: 12px 16px;
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .cp-giftbox-img {
          width: 52px;
          height: 52px;
          border-radius: 10px;
          object-fit: cover;
          flex-shrink: 0;
          border: 1px solid rgba(201, 168, 76, 0.35);
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        .cp-giftbox-icon-box {
          width: 52px;
          height: 52px;
          border-radius: 10px;
          background: rgba(201, 168, 76, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          flex-shrink: 0;
        }
        .cp-giftbox-body {
          flex: 1;
          min-width: 0;
        }
        .cp-giftbox-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          flex-wrap: wrap;
        }
        .cp-giftbox-badge {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: .12em;
          text-transform: uppercase;
          color: #8c6b20;
          background: rgba(201, 168, 76, 0.22);
          padding: 3px 8px;
          border-radius: 6px;
        }
        .cp-giftbox-title {
          font-size: 13.5px;
          font-weight: 600;
          color: var(--olive-900);
        }
        .cp-giftbox-price {
          font-size: 13.5px;
          font-weight: 700;
          color: var(--olive-700);
        }
        .cp-giftbox-desc {
          margin-top: 4px;
          font-size: 12px;
          color: var(--mist);
          line-height: 1.4;
        }
        .cp-giftbox-msg {
          margin-top: 4px;
          font-size: 12px;
          color: var(--olive-600);
          font-style: italic;
        }

        /* ── Right Panel: Gift Wrap Selector ── */
        .cp-gift-panel {
          padding: 20px 22px;
        }
        .cp-gift-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        .cp-gift-heading {
          font-size: 11px;
          letter-spacing: .25em;
          text-transform: uppercase;
          color: var(--mist);
          font-weight: 600;
        }
        .cp-gift-optional {
          font-size: 11px;
          color: var(--mist-lt);
          font-style: italic;
        }
        .cp-gift-cards {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .cp-gift-card {
          position: relative;
          border: 1.5px solid var(--beige-dkr);
          border-radius: 14px;
          overflow: hidden;
          cursor: pointer;
          background: #ffffff;
          transition: all .2s ease;
        }
        .cp-gift-card:hover {
          border-color: var(--olive-400);
          box-shadow: 0 4px 16px rgba(92, 112, 48, 0.12);
          transform: translateY(-2px);
        }
        .cp-gift-card--selected {
          border-color: var(--olive-600);
          background: rgba(92, 112, 48, 0.03);
          box-shadow: 0 6px 20px rgba(92, 112, 48, 0.18);
        }
        .cp-gift-card-img {
          width: 100%;
          aspect-ratio: 1/1;
          object-fit: cover;
          display: block;
          background: var(--beige-dk);
        }
        .cp-gift-card-body {
          padding: 10px 12px 12px;
        }
        .cp-gift-card-title {
          font-size: 13px;
          font-weight: 600;
          color: var(--olive-900);
          margin-bottom: 3px;
          line-height: 1.3;
        }
        .cp-gift-card-sub {
          font-size: 11px;
          color: var(--mist);
          line-height: 1.35;
          margin-bottom: 6px;
        }
        .cp-gift-card-price {
          font-size: 13.5px;
          font-weight: 700;
          color: var(--olive-600);
        }
        .cp-gift-card-check {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: var(--olive-600);
          border: 2px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          color: white;
          opacity: 0;
          transform: scale(.6);
          transition: all .2s;
        }
        .cp-gift-card--selected .cp-gift-card-check {
          opacity: 1;
          transform: scale(1);
        }
        .cp-gift-msg-wrap {
          margin-top: 14px;
        }
        .cp-gift-msg {
          width: 100%;
          padding: 12px 14px;
          border: 1.5px solid var(--beige-dkr);
          border-radius: 12px;
          font-family: 'Jost', sans-serif;
          font-size: 12.5px;
          color: var(--ink);
          background: #ffffff;
          outline: none;
          resize: none;
          height: 72px;
          transition: border-color .2s;
        }
        .cp-gift-msg:focus {
          border-color: var(--olive-500);
        }

        /* ── Coupon & Rewards ── */
        .cp-coupon-row {
          display: flex;
          gap: 10px;
        }
        .cp-coupon-input {
          flex: 1;
          padding: 12px 16px;
          border: 1.5px solid var(--beige-dkr);
          border-radius: 50px;
          font-family: 'Jost', sans-serif;
          font-size: 13px;
          color: var(--ink);
          background: #ffffff;
          outline: none;
          text-transform: uppercase;
          letter-spacing: .05em;
          transition: border-color .2s;
        }
        .cp-coupon-input:focus {
          border-color: var(--olive-500);
        }
        .cp-coupon-input::placeholder {
          text-transform: none;
          color: var(--mist-lt);
          letter-spacing: normal;
        }
        .cp-coupon-btn {
          padding: 12px 22px;
          background: var(--olive-700);
          color: var(--beige);
          border: none;
          border-radius: 50px;
          font-family: 'Jost', sans-serif;
          font-size: 11.5px;
          font-weight: 600;
          letter-spacing: .15em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background .2s, transform .15s;
          white-space: nowrap;
        }
        .cp-coupon-btn:hover {
          background: var(--olive-600);
          transform: translateY(-1px);
        }
        .cp-coupon-msg {
          font-size: 12px;
          margin-top: 8px;
        }
        .cp-coupon-msg--error { color: var(--red); }
        .cp-coupon-msg--success { color: var(--green); }
        .cp-coupon-applied {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #eaf6ea;
          border: 1px solid #c0e8c2;
          border-radius: 12px;
          padding: 10px 16px;
          font-size: 13px;
          color: #1e6b22;
          font-weight: 600;
        }
        .cp-coupon-remove {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 16px;
          color: var(--mist);
          transition: color .2s;
        }
        .cp-coupon-remove:hover { color: var(--red); }

        /* ── Price Summary Panel ── */
        .cp-summary-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 14px;
          color: var(--mist);
          margin-bottom: 12px;
        }
        .cp-summary-row span:last-child {
          font-weight: 600;
          color: var(--olive-900);
        }
        .cp-summary-row--savings {
          color: #1e6b22;
          font-weight: 600;
        }
        .cp-summary-row--savings span:last-child {
          color: #1e6b22;
        }
        .cp-summary-row--total {
          font-size: 18px;
          font-weight: 700;
          color: var(--olive-900);
          border-top: 1px solid rgba(61, 74, 34, 0.1);
          padding-top: 16px;
          margin-top: 8px;
          margin-bottom: 0;
        }
        .cp-summary-row--total span:last-child {
          font-size: 22px;
          font-weight: 700;
          color: var(--olive-900);
        }
        .cp-free-tag {
          background: #2e7d32;
          color: #ffffff;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: .14em;
          padding: 3px 8px;
          border-radius: 4px;
          text-transform: uppercase;
        }

        /* ── Checkout CTA ── */
        .cp-checkout-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          width: 100%;
          padding: 18px;
          background: var(--olive-900);
          color: #ffffff;
          border: none;
          border-radius: 50px;
          font-family: 'Jost', sans-serif;
          font-size: 12.5px;
          font-weight: 700;
          letter-spacing: .22em;
          text-transform: uppercase;
          cursor: pointer;
          text-decoration: none;
          box-shadow: 0 8px 30px rgba(26, 31, 13, 0.25);
          transition: all .25s ease;
          position: relative;
          overflow: hidden;
        }
        .cp-checkout-btn:hover {
          background: var(--olive-700);
          transform: translateY(-2px);
          box-shadow: 0 12px 38px rgba(26, 31, 13, 0.32);
        }

        /* ── Trust Badges Strip ── */
        .cp-trust-strip {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          padding: 16px 20px;
          background: #ffffff;
          border-radius: 16px;
          border: 1px solid rgba(201, 168, 76, 0.2);
        }
        .cp-trust-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11.5px;
          color: var(--olive-800);
          font-weight: 500;
          line-height: 1.3;
        }

        /* ── Empty Cart View ── */
        .cp-empty {
          text-align: center;
          padding: 90px 24px;
          grid-column: 1 / -1;
          background: #ffffff;
          border-radius: 24px;
          border: 1px solid rgba(201, 168, 76, 0.2);
        }
        .cp-empty-icon {
          font-family: 'Cormorant Garamond', serif;
          font-size: 64px;
          color: rgba(61, 74, 34, 0.2);
          margin-bottom: 16px;
        }
        .cp-empty-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 28px;
          font-weight: 600;
          color: var(--olive-900);
          margin-bottom: 8px;
        }
        .cp-empty-text {
          font-size: 14px;
          color: var(--mist);
          margin-bottom: 24px;
        }
        .cp-empty-link {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 15px 34px;
          background: var(--olive-900);
          color: #ffffff;
          border-radius: 50px;
          text-decoration: none;
          font-size: 11.5px;
          font-weight: 600;
          letter-spacing: .2em;
          text-transform: uppercase;
          transition: all .2s;
          box-shadow: 0 4px 18px rgba(26, 31, 13, 0.2);
        }
        .cp-empty-link:hover {
          background: var(--olive-700);
          transform: translateY(-2px);
        }

        /* ── Responsive ── */
        @media (max-width: 960px) {
          .cp-header-wrap { padding: 20px 20px 8px; }
          .cp-layout { grid-template-columns: 1fr; padding: 12px 20px 60px; gap: 24px; }
          .cp-right { position: static; }
        }
        @media (max-width: 540px) {
          .cp-header-wrap { margin-top: 55px; padding: 16px 16px 8px; }
          .cp-title { font-size: 28px; }
          .cp-layout { padding: 12px 16px 60px; gap: 18px; }
          .cp-item { padding: 16px; gap: 12px; }
          .cp-item-img { width: 80px; height: 80px; }
          .cp-item-name { font-size: 14.5px; }
          .cp-item-price { font-size: 16.5px; }
          .cp-qty-btn { width: 28px; height: 28px; font-size: 15px; }
          .cp-qty-val { min-width: 28px; font-size: 12px; }
          .cp-giftbox-card { padding: 10px 12px; gap: 10px; }
          .cp-giftbox-img, .cp-giftbox-icon-box { width: 42px; height: 42px; }
          .cp-trust-strip { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="cp-root">
        <UpperNav />

        {/* Header Strip */}
        <div className="cp-header-wrap">
          <div className="cp-breadcrumb">
            <Link href="/">Home</Link>
            <span>/</span>
            <span>Shopping Cart</span>
          </div>
          <h1 className="cp-title">
            Your Sparkle Bag
            {itemCount > 0 && (
              <span className="cp-item-count-badge">
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </span>
            )}
          </h1>
        </div>

        <div className="cp-layout">
          {/* ── EMPTY STATE ── */}
          {items.length === 0 && (
            <div className="cp-empty">
              <div className="cp-empty-icon">◇</div>
              <h2 className="cp-empty-title">Your shopping cart is empty</h2>
              <p className="cp-empty-text">Discover our exquisite handcrafted silver jewellery collections.</p>
              <Link href="/categories" className="cp-empty-link">
                Explore Collections
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          )}

          {items.length > 0 && (
            <>
              {/* ── LEFT COLUMN: ITEMS & PROGRESS ── */}
              <div className="cp-left">
                {/* Offer Milestone Goal Meter */}
                <div className="cp-panel">
                  <div className="cp-banner-meter">
                    <CartBanner />
                  </div>
                </div>

                {/* Cart Items Panel */}
                <div className="cp-panel">
                  <div className="cp-panel-head">
                    <span>Products In Your Bag</span>
                    <span>{itemCount} {itemCount === 1 ? 'Item' : 'Items'}</span>
                  </div>

                  {savings > 0 && (
                    <div className="cp-savings-strip">
                      <span>🎉</span>
                      <span>You are saving ₹{savings.toLocaleString('en-IN')} on this order!</span>
                    </div>
                  )}

                  {items.map((item) => {
                    const giftPrice = item.giftBox ? Number(item.giftBoxDetails?.price ?? 50) : 0;
                    const basePrice = item.basePrice ?? Math.max(0, item.price - giftPrice);
                    const itemTotal = item.price * item.qty;
                    const hasStrikethrough = Boolean(item.originalPrice && item.originalPrice > item.price);

                    return (
                      <div
                        className="cp-item"
                        key={item.cartItemId ?? `${item.id}-${item.colorHex}`}
                      >
                        <div className="cp-item-top">
                          <Link
                            href={item.href || `/products/${item.id}`}
                            className="cp-item-img-link"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              className="cp-item-img"
                              src={item.image}
                              alt={item.name}
                            />
                          </Link>

                          <div className="cp-item-body">
                            <Link
                              href={item.href || `/products/${item.id}`}
                              className="cp-item-name"
                            >
                              {item.name}
                            </Link>

                            <div className="cp-item-pricing">
                              <div className="cp-item-price-row">
                                <span className="cp-item-price">
                                  ₹{itemTotal.toLocaleString('en-IN')}
                                </span>
                                {hasStrikethrough && (
                                  <span className="cp-item-original">
                                    ₹{(item.originalPrice! * item.qty).toLocaleString('en-IN')}
                                  </span>
                                )}
                              </div>

                              {giftPrice > 0 && (
                                <div className="cp-gift-math-badge">
                                  🎁 ₹{(basePrice * item.qty).toLocaleString('en-IN')} + ₹{(giftPrice * item.qty).toLocaleString('en-IN')} Gift box added
                                </div>
                              )}
                            </div>

                            {(item as any).priceBreakdown && (
                              <div style={{ fontSize: 11, color: 'var(--mist)', marginTop: 4 }}>
                                {(item as any).priceBreakdown}
                              </div>
                            )}

                            {item.chain && (
                              <div style={{ fontSize: 12.5, color: 'var(--olive-600)', marginTop: 4 }}>
                                Chain: <strong>{item.chainLabel || item.chain}</strong>
                              </div>
                            )}

                            {(!item.selectedCharms?.length && !item.selectionGroups?.length && item.qty > 1) && (
                              <p className="cp-item-per">
                                ₹{item.price.toLocaleString('en-IN')} per item
                              </p>
                            )}
                          </div>

                          <div className="cp-item-actions">
                            <button
                              className="cp-item-remove"
                              onClick={() => removeItem(item.id, item.colorHex)}
                              aria-label={`Remove ${item.name}`}
                              title="Remove item"
                            >
                              ×
                            </button>

                            {(!item.selectedCharms?.length && !item.selectionGroups?.length) && (
                              <div className="cp-qty">
                                <button
                                  className="cp-qty-btn"
                                  onClick={() => updateQty(item.id, item.colorHex, item.qty - 1)}
                                  aria-label="Decrease quantity"
                                >
                                  −
                                </button>
                                <span className="cp-qty-val">{item.qty}</span>
                                <button
                                  className="cp-qty-btn"
                                  onClick={() => updateQty(item.id, item.colorHex, item.qty + 1)}
                                  aria-label="Increase quantity"
                                >
                                  +
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

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
                                  ) : <span>🪡</span>}
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
                                        <div style={{ fontSize: 11, color: 'var(--olive-600)', marginTop: 2 }}>
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
                              <div className="cp-giftbox-icon-box">🎁</div>
                            )}
                            <div className="cp-giftbox-body">
                              <div className="cp-giftbox-top">
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                  <span className="cp-giftbox-badge">🎁 Gift Packaging Added</span>
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
                    );
                  })}
                </div>
              </div>

              {/* ── RIGHT COLUMN: GIFT SELECTOR, COUPON, SUMMARY ── */}
              <div className="cp-right">
                {/* Gift Box Selector Panel */}
                <div className="cp-panel">
                  <GiftBoxSelector
                    selectedGiftId={selectedGiftId}
                    onSelect={handleSelectGift}
                    giftMessage={giftMessage}
                    onMessageChange={setGiftMessage}
                    isGift={isGift}
                  />
                </div>

                {/* Apply Coupon Panel */}
                <div className="cp-panel" style={{ padding: '20px 22px' }}>
                  <p className="cp-panel-head" style={{ padding: 0, border: 'none', marginBottom: 14 }}>
                    Apply Coupon
                  </p>
                  {discountCode ? (
                    <div className="cp-coupon-applied">
                      <span>&ldquo;{discountCode}&rdquo; — ₹{discountAmount} OFF</span>
                      <button className="cp-coupon-remove" onClick={removeDiscount} aria-label="Remove coupon">
                        ×
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="cp-coupon-row">
                        <input
                          className="cp-coupon-input"
                          value={couponInput}
                          onChange={(e) => {
                            setCouponInput(e.target.value);
                            setCouponError('');
                            setCouponSuccess('');
                          }}
                          placeholder="Enter promo code"
                          onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                        />
                        <button className="cp-coupon-btn" onClick={handleApplyCoupon}>
                          Apply
                        </button>
                      </div>
                      {couponError && <p className="cp-coupon-msg cp-coupon-msg--error">{couponError}</p>}
                      {couponSuccess && <p className="cp-coupon-msg cp-coupon-msg--success">{couponSuccess}</p>}
                    </>
                  )}
                </div>

                {/* Reward Points Panel */}
                {userRewardPoints > 0 && (
                  <div className="cp-panel" style={{ padding: '20px 22px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <p className="cp-panel-head" style={{ padding: 0, border: 'none' }}>Sparkle Points</p>
                      <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--olive-600)', background: 'var(--olive-50)', padding: '3px 8px', border: '1px solid var(--olive-200)', borderRadius: 6 }}>
                        Balance: {userRewardPoints} pts
                      </span>
                    </div>
                    <div className="cp-coupon-row">
                      <input
                        className="cp-coupon-input"
                        type="number"
                        min="0"
                        max={Math.min(userRewardPoints, baseTotal)}
                        value={pointsInput}
                        onChange={(e) => setPointsInput(e.target.value)}
                        placeholder={`Up to ${Math.min(userRewardPoints, baseTotal)} pts`}
                      />
                      <button
                        className="cp-coupon-btn"
                        onClick={() => {
                          const parsedVal = parseInt(pointsInput, 10);
                          const val = Math.max(0, Math.min(isNaN(parsedVal) ? 0 : parsedVal, userRewardPoints, baseTotal));
                          setRewardPointsRedeemed(val);
                          setPointsInput(val.toString());
                        }}
                      >
                        Redeem
                      </button>
                    </div>
                    {actualRedeemedPoints > 0 && (
                      <div className="cp-coupon-applied" style={{ marginTop: 10 }}>
                        <span>−₹{actualRedeemedPoints} points redeemed</span>
                        <button className="cp-coupon-remove" onClick={() => { setRewardPointsRedeemed(0); setPointsInput(''); }}>×</button>
                      </div>
                    )}
                  </div>
                )}

                {/* Order Summary Panel */}
                <div className="cp-panel" style={{ padding: '22px 24px' }}>
                  <p className="cp-panel-head" style={{ padding: 0, border: 'none', marginBottom: 16 }}>
                    Order Summary
                  </p>
                  <div className="cp-summary-row">
                    <span>Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
                    <span>₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>

                  {savings > 0 && (
                    <div className="cp-summary-row cp-summary-row--savings">
                      <span>Product Savings</span>
                      <span>−₹{savings.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  {discountAmount > 0 && (
                    <div className="cp-summary-row cp-summary-row--savings">
                      <span>Coupon Discount</span>
                      <span>−₹{discountAmount}</span>
                    </div>
                  )}

                  {actualRedeemedPoints > 0 && (
                    <div className="cp-summary-row cp-summary-row--savings">
                      <span>Sparkle Points</span>
                      <span>−₹{actualRedeemedPoints}</span>
                    </div>
                  )}

                  {/* Store Offers Checklist */}
                  {applicableOffers.length > 0 && (
                    <div style={{ margin: '12px 0 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--mist)' }}>
                          Available Store Offers
                        </span>
                        <span style={{ height: 1, flex: 1, background: 'rgba(61,74,34,.1)' }} />
                      </div>
                      {applicableOffers.map((o) => (
                        <div
                          key={o.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: o.applied ? 'rgba(46,125,50,.07)' : 'rgba(0,0,0,.02)',
                            border: `1px solid ${o.applied ? 'rgba(46,125,50,.25)' : 'rgba(0,0,0,.08)'}`,
                            borderRadius: 10,
                            padding: '8px 12px',
                          }}
                        >
                          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', flex: 1 }}>
                            <input
                              type="checkbox"
                              checked={o.applied}
                              onChange={() => toggleOfferOptOut(o.id)}
                              style={{ cursor: 'pointer', accentColor: '#2e7d32', width: 15, height: 15, flexShrink: 0 }}
                            />
                            <span style={{ fontSize: 13, fontWeight: 500, color: o.applied ? 'var(--olive-900)' : 'var(--mist)' }}>
                              {o.title}
                            </span>
                          </label>
                          <span style={{ fontSize: 13, fontWeight: 700, color: o.applied ? '#2e7d32' : 'var(--mist)', marginLeft: 8 }}>
                            {o.applied ? `−₹${o.amount.toLocaleString('en-IN')}` : 'Off'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="cp-summary-row">
                    <span>Shipping & Delivery</span>
                    <span>
                      {shipping === 0 ? (
                        <span className="cp-free-tag">FREE</span>
                      ) : (
                        `₹${shipping}`
                      )}
                    </span>
                  </div>

                  {activeGift && (
                    <div className="cp-summary-row">
                      <span>🎁 {activeGift.title}</span>
                      <span>₹{activeGift.price}</span>
                    </div>
                  )}

                  <div className="cp-summary-row cp-summary-row--total">
                    <span>Total Amount</span>
                    <span>₹{displayTotal.toLocaleString('en-IN')}</span>
                  </div>

                  {/* Checkout CTA */}
                  <div style={{ marginTop: 22 }}>
                    <Link href="/checkout" className="cp-checkout-btn">
                      Proceed to Checkout
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>

                {/* Trust and Assurance Strip */}
                <div className="cp-trust-strip">
                  <div className="cp-trust-item">
                    <span>💎</span>
                    <span>Certified Anti-Tarnish Finish</span>
                  </div>
                  <div className="cp-trust-item">
                    <span>🚚</span>
                    <span>Free Delivery on ₹999+</span>
                  </div>
                  <div className="cp-trust-item">
                    <span>🔄</span>
                    <span>Easy 7-Day Exchange</span>
                  </div>
                  <div className="cp-trust-item">
                    <span>🔒</span>
                    <span>100% Secure Checkout</span>
                  </div>
                </div>
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
