'use client';

import { cdnImage } from '@/lib/cdn';
import { CheckoutSkeleton } from '@/components/ui/PageSkeletons';
import { INDIAN_STATES } from '@/lib/indianStates';
import Em from "@/components/ui/Em";
import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useCart, GIFT_OPTIONS } from '@/lib/cartContext';
import { useAuth, type AuthUser } from '@/lib/authContext';
import ExitIntent from '@/components/cart/ExitIntent';
import { apiRequest } from '@/lib/api';

const PAYMENT_METHODS = [
  { id: 'ONLINE', label: 'Pay Online in Full', sub: 'UPI, Credit/Debit Cards, NetBanking, Wallets via PhonePe', badge: 'Recommended' },
  { id: 'PARTIAL_COD', label: 'Partial COD (20% Advance)', sub: 'Pay 20% advance online, pay balance on delivery · +₹80 convenience fee', badge: null },
  { id: 'COD', label: 'Cash on Delivery', sub: 'Pay when your order arrives · +₹80 convenience fee', badge: null },
];

const DELIVERY_OPTIONS = [
  {
    id: 'standard' as const,
    icon: '🚚',
    label: 'Standard',
    rate: '₹60',
    metro: '3–5 business days',
    rest: '4–7 business days',
  },
  {
    id: 'express' as const,
    icon: '⚡',
    label: 'Express',
    rate: '₹110',
    metro: '2–3 business days',
    rest: '3–4 business days',
  },
];
interface PincodeResponse {
  status?: string;
  [key: string]: any;
}
export default function CheckoutPage() {
  const { state, savings, shipping, total, itemCount, toggleGift, clearCart, autoDiscountAmount, appliedOffers, setRewardPointsRedeemed, hydrated, removeDiscount } = useCart();
  const { items, isGift, discountCode, discountAmount, selectedGiftId, rewardPointsRedeemed } = state;

  const [selectedMethod, setSelectedMethod] = useState('ONLINE');
  const [loading, setLoading] = useState(false);
  // Two steps: 1) where it's going and how fast, 2) how you'll pay
  const [step, setStep] = useState<1 | 2>(1);
  const [stepError, setStepError] = useState('');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [showExpressPopup, setShowExpressPopup] = useState(false);
  const [deliveryType, setDeliveryType] = useState<'standard' | 'express'>('standard');

  const { user, refreshUser, isAuthenticated, loading: authLoading } = useAuth();
  const needsLogin = !authLoading && !isAuthenticated;
  useEffect(() => {
    if (needsLogin) window.dispatchEvent(new CustomEvent('makeussparkle:auth-open', { detail: { tab: 'login' } }));
  }, [needsLogin]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({ name: '', addressLine1: '', addressLine2: '', landmark: '', city: '', state: '', pincode: '', phone: '', alternativePhone: '' });
  const [addressBusy, setAddressBusy] = useState(false);
  const [addressError, setAddressError] = useState('');

  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
  const [selectedBillingAddressIndex, setSelectedBillingAddressIndex] = useState(0);
  const [showBillingAddressForm, setShowBillingAddressForm] = useState(false);
  const [billingAddressForm, setBillingAddressForm] = useState({ name: '', addressLine1: '', addressLine2: '', landmark: '', city: '', state: '', pincode: '', phone: '', alternativePhone: '' });
  const [billingAddressBusy, setBillingAddressBusy] = useState(false);
  // Recipient name and phone default to what the shopper gave at signup (10-digit Indian number); they can still edit them.
  const accountName = user?.name?.trim() || '';
  const accountPhone = (user?.phone || '').replace(/\D/g, '').slice(-10);
  const withAccount = (f: typeof addressForm) => ({ ...f, name: f.name || accountName, phone: f.phone || (accountPhone.length === 10 ? accountPhone : '') });
  useEffect(() => {
    setAddressForm(withAccount);
    setBillingAddressForm(withAccount);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountName, accountPhone]);

  const [billingAddressError, setBillingAddressError] = useState('');

  const [userRewardPoints, setUserRewardPoints] = useState(0);
  const [pointsInput, setPointsInput] = useState('');

  useEffect(() => {
    if (user) {
      apiRequest<{ success: boolean; rewardPoints: number }>('/rewards/points')
        .then(data => setUserRewardPoints(data.rewardPoints || 0))
        .catch(console.error);
    }
  }, [user]);

  // Sync initial input if there's already points redeemed in state
  useEffect(() => {
    if (rewardPointsRedeemed > 0 && !pointsInput) {
      setPointsInput(rewardPointsRedeemed.toString());
    }
  }, [rewardPointsRedeemed, pointsInput]);

  const activeGift = GIFT_OPTIONS.find(g => g.id === selectedGiftId) ?? null;
  
  const deliveryCharge = deliveryType === 'express' ? 110 : shipping;
  const codCharge = (selectedMethod === 'COD' || selectedMethod === 'PARTIAL_COD') ? 80 : 0;

  // Derive the strictest payment constraint from all cart items.
  // Priority: prepaid_only > partial_cod > cod_allowed
  const cartPaymentConstraint: 'cod_allowed' | 'partial_cod' | 'prepaid_only' = (() => {
    const modes = items.map(i => (i as any).paymentMode || 'cod_allowed');
    if (modes.includes('prepaid_only')) return 'prepaid_only';
    if (modes.includes('partial_cod')) return 'partial_cod';
    return 'cod_allowed';
  })();

  // Names of products driving the constraint (for the notice)
  const constraintProducts = items
    .filter(i => (i as any).paymentMode === cartPaymentConstraint && cartPaymentConstraint !== 'cod_allowed')
    .map(i => i.name);

  // Auto-enforce method when cart constraint changes
  useEffect(() => {
    if (cartPaymentConstraint === 'prepaid_only' && selectedMethod !== 'ONLINE') {
      setSelectedMethod('ONLINE');
    } else if (cartPaymentConstraint === 'partial_cod' && selectedMethod === 'COD') {
      setSelectedMethod('PARTIAL_COD');
    }
  }, [cartPaymentConstraint]); // eslint-disable-line react-hooks/exhaustive-deps

  const baseTotal = (total - shipping) + deliveryCharge + codCharge;
  const safeRewardPointsRedeemed = rewardPointsRedeemed || 0;
  const actualRedeemedPoints = Math.min(safeRewardPointsRedeemed, userRewardPoints, baseTotal);
  
  const finalTotal = baseTotal - actualRedeemedPoints;

  let amountToPayNow = finalTotal;
  if (selectedMethod === 'PARTIAL_COD') amountToPayNow = Math.round(finalTotal * 0.20);
  else if (selectedMethod === 'COD') amountToPayNow = 0;

  // PhonePe uses a redirect flow — no external script needed

  const handleDeliveryTypeChange = (id: 'standard' | 'express') => {
    if (id === 'express') {
      setShowExpressPopup(true);
      if (selectedMethod === 'COD') setSelectedMethod('PARTIAL_COD');
    }
    // Also enforce cart constraint when switching delivery
    if (cartPaymentConstraint === 'prepaid_only') setSelectedMethod('ONLINE');
    else if (cartPaymentConstraint === 'partial_cod' && selectedMethod === 'COD') setSelectedMethod('PARTIAL_COD');
    setDeliveryType(id);
  };

  const scrollToAddressError = (id: string = 'ck-pincode-error-banner') => {
    setTimeout(() => {
      const el = document.getElementById(id) || document.getElementById('ck-address-error-banner');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 50);
  };

  const handleSaveAddress = async () => {
    setAddressError('');
    if (!addressForm.name || !addressForm.addressLine1 || !addressForm.city || !addressForm.state || !addressForm.pincode || !addressForm.phone) {
      setAddressError('Please fill all mandatory address fields (including Name and a 6-digit Pincode).');
      scrollToAddressError('ck-pincode-error-banner');
      return;
    }
    if (addressForm.pincode.length !== 6 || !/^\d{6}$/.test(addressForm.pincode)) {
      setAddressError('A 6-digit Pincode is required.');
      scrollToAddressError('ck-pincode-error-banner');
      return;
    }
    if (addressForm.phone.length !== 10 || !/^\d{10}$/.test(addressForm.phone)) {
      setAddressError('Phone number must be exactly 10 digits.');
      scrollToAddressError('ck-pincode-error-banner');
      return;
    }
    if (addressForm.alternativePhone && (addressForm.alternativePhone.length !== 10 || !/^\d{10}$/.test(addressForm.alternativePhone))) {
      setAddressError('Alternative phone number must be exactly 10 digits.');
      scrollToAddressError('ck-pincode-error-banner');
      return;
    }

    setAddressBusy(true);
    try {
      const fullAddress = `${addressForm.addressLine1}${addressForm.addressLine2 ? ', ' + addressForm.addressLine2 : ''}`;
      const payload = { ...addressForm, fullAddress };
      const res = await apiRequest<{ success: boolean; addresses: any[] }>('/users/address', { method: 'POST', body: JSON.stringify(payload) });
      await refreshUser();
      setShowAddressForm(false);
      const newAddresses = res?.addresses || [...(user?.addresses || []), payload];
      setSelectedAddressIndex(Math.max(0, newAddresses.length - 1));
      setAddressForm(withAccount({ name: '', addressLine1: '', addressLine2: '', landmark: '', city: '', state: '', pincode: '', phone: '', alternativePhone: '' }));
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : '';
      if (/auth|token/i.test(msg)) { window.dispatchEvent(new CustomEvent('makeussparkle:auth-open', { detail: { tab: 'login' } })); setAddressError('Please sign in again to save your address.'); }
      else alert('Failed to save address.');
    }
    finally { setAddressBusy(false); }
  };

  const handleSaveBillingAddress = async () => {
    setBillingAddressError('');
    if (!billingAddressForm.name || !billingAddressForm.addressLine1 || !billingAddressForm.city || !billingAddressForm.state || !billingAddressForm.pincode || !billingAddressForm.phone) {
      setBillingAddressError('Please fill all mandatory billing address fields (including Name and a 6-digit Pincode).');
      scrollToAddressError('ck-billing-pincode-error-banner');
      return;
    }
    if (billingAddressForm.pincode.length !== 6 || !/^\d{6}$/.test(billingAddressForm.pincode)) {
      setBillingAddressError('A 6-digit Pincode is required for billing address.');
      scrollToAddressError('ck-billing-pincode-error-banner');
      return;
    }
    if (billingAddressForm.phone.length !== 10 || !/^\d{10}$/.test(billingAddressForm.phone)) {
      setBillingAddressError('Phone number must be exactly 10 digits.');
      scrollToAddressError('ck-billing-pincode-error-banner');
      return;
    }
    if (billingAddressForm.alternativePhone && (billingAddressForm.alternativePhone.length !== 10 || !/^\d{10}$/.test(billingAddressForm.alternativePhone))) {
      setBillingAddressError('Alternative phone number must be exactly 10 digits.');
      scrollToAddressError('ck-billing-pincode-error-banner');
      return;
    }

    setBillingAddressBusy(true);
    try {
      const fullAddress = `${billingAddressForm.addressLine1}${billingAddressForm.addressLine2 ? ', ' + billingAddressForm.addressLine2 : ''}`;
      const payload = { ...billingAddressForm, fullAddress };
      const res = await apiRequest<{ success: boolean; addresses: any[] }>('/users/address', { method: 'POST', body: JSON.stringify(payload) });
      await refreshUser();
      setShowBillingAddressForm(false);
      const newAddresses = res?.addresses || [...(user?.addresses || []), payload];
      setSelectedBillingAddressIndex(Math.max(0, newAddresses.length - 1));
      setBillingAddressForm(withAccount({ name: '', addressLine1: '', addressLine2: '', landmark: '', city: '', state: '', pincode: '', phone: '', alternativePhone: '' }));
    } catch (err) { console.error(err); alert('Failed to save address.'); }
    finally { setBillingAddressBusy(false); }
  };

  const goToPayment = () => {
    const ship = user?.addresses?.[selectedAddressIndex];
    const bill = billingSameAsShipping ? ship : user?.addresses?.[selectedBillingAddressIndex];
    if (!ship) { setStepError('Please add or select a shipping address to continue.'); return; }
    if (!bill) { setStepError('Please select a billing address.'); return; }
    setStepError('');
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePay = useCallback(async () => {
    if (!selectedMethod) return;
    const shippingAddress = user?.addresses?.[selectedAddressIndex] ?? null;
    if (!shippingAddress) { alert('Please select a shipping address.'); return; }
    const billingAddress = billingSameAsShipping
      ? shippingAddress
      : (user?.addresses?.[selectedBillingAddressIndex] ?? null);
    if (!billingAddress) { alert('Please select a billing address.'); return; }

    setLoading(true);
    try {
      const orderPayload = {
        amount: amountToPayNow, totalAmount: finalTotal, advanceAmount: amountToPayNow,
        balanceAmount: Math.max(finalTotal - amountToPayNow, 0), paymentMode: selectedMethod,
        discountCode, discountAmount, autoDiscountAmount, appliedOffers, deliveryType,
        items: items.map(item => {
          const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(item.id);
          const mappedProduct = (!item.id.startsWith('custom-') && isValidObjectId) ? item.id : undefined;
          const selectedCharms = item.selectedCharms?.map((c: { id?: string; _id?: string } | string) => {
            if (typeof c === 'string') return c;
            return c.id || c._id || '';
          }).filter(Boolean);
          const comboNoteParts = [];
          if (item.customData?.comboPresetMessage) comboNoteParts.push(`Card: ${item.customData.comboPresetMessage}`);
          if (item.customData?.comboPersonalMessage) comboNoteParts.push(`Message: ${item.customData.comboPersonalMessage}`);
          const combinedNote = [item.customNote, ...comboNoteParts].filter(Boolean).join(' | ');
          const combinedImages = [
            ...(item.customImages || []),
            ...(item.customData?.comboUploadedImagesBase64 || []),
            ...(item.customData?.comboUploadedImageBase64 ? [item.customData.comboUploadedImageBase64] : [])
          ].filter(Boolean);

          const selectionGroups = (
            item.selectionGroups ||
            (item.selectedCharms?.length
              ? [
                  {
                    type: 'multi_item_selection',
                    category: item.category || item.sourceId,
                    label: item.name,
                    selectionKey: 'selectedCharms',
                    itemRefModel: 'CharmItem',
                    items: item.selectedCharms.map((c) => {
                      const fallbackCharmPrice = item.selectedCharms?.length
                        ? item.price / item.selectedCharms.length
                        : 0;
                      if (typeof c === 'string')
                        return { id: c, quantity: 1, price: fallbackCharmPrice };
                      return {
                        id: c.id,
                        sourceId: c.sourceId,
                        name: c.name,
                        quantity: c.quantity || 1,
                        price:
                          typeof c.price === 'number' && Number.isFinite(c.price)
                            ? c.price
                            : fallbackCharmPrice,
                        image: c.image,
                        images: c.images,
                        emoji: c.emoji,
                        customText: c.customText,
                        customData: c.customData,
                      };
                    }),
                  },
                ]
              : undefined)
          )?.map((sg: any) => ({
            ...sg,
            items: sg.items?.map((sgi: any) => ({
              ...sgi,
              customData: sgi.customData || undefined,
            })),
          }));

          return {
            product: mappedProduct,
            sourceId: item.sourceId,
            name: item.name,
            category: item.category,
            quantity: item.qty,
            price: item.price,
            color: item.color,
            colorHex: item.colorHex,
            size: item.size,
            sku: item.sku,
            customNote: combinedNote || undefined,
            customImages: combinedImages.length ? combinedImages : undefined,
            customData: item.customData || undefined,
            giftBox: Boolean(item.giftBox),
            giftBoxDetails: item.giftBoxDetails || (item.giftBox ? {
              heading: 'Premium Gift Box',
              price: 50,
            } : undefined),
            selectedCharms,
            selectionGroups,
          };
        }),
        shippingAddress,
        billingAddress,
        isGift, selectedGiftId, giftMessage: state.giftMessage,
        rewardPointsRedeemed,
      };
      if (selectedMethod === 'ONLINE' || selectedMethod === 'PARTIAL_COD') {
        const ppOrder = await apiRequest<{ success: boolean; orderId: string; merchantOrderId: string; redirectUrl: string; amount: number }>('/payment/create-order', { method: 'POST', body: JSON.stringify(orderPayload) });
        // Store pending payment info in sessionStorage so the status page can verify after redirect
        sessionStorage.setItem('pendingPayment', JSON.stringify({ orderId: ppOrder.orderId, merchantOrderId: ppOrder.merchantOrderId, paymentMode: selectedMethod }));
        // Redirect user to PhonePe checkout page
        window.location.href = ppOrder.redirectUrl;
      } else {
        await apiRequest('/orders/create', { method: 'POST', body: JSON.stringify(orderPayload) });
        clearCart(); setOrderPlaced(true);
      }
    } catch (err) {
      console.error('Order failed:', err);
      // The server prices every order itself; when it disagrees with what was shown, it says why.
      const msg = err instanceof Error && err.message && err.message !== 'Request failed' ? err.message : 'Failed to place order. Please try again.';
      // A coupon the server can't honour would keep blocking checkout, so drop it and let them retry.
      if (discountCode && /changed/i.test(msg)) removeDiscount();
      alert(msg);
      setLoading(false);
    }
  }, [selectedMethod, items, finalTotal, amountToPayNow, isGift, selectedGiftId, discountCode, removeDiscount, state.giftMessage, clearCart, user, selectedAddressIndex, billingSameAsShipping, selectedBillingAddressIndex]);

  if (orderPlaced) {
    return (
      <>
        <style>{`
          .ck-s{min-height:100vh;background:#ffffff;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 24px;font-family:'DM Sans',sans-serif;text-align:center}
          .ck-s-icon{font-size:64px;margin-bottom:20px;animation:pop .5s cubic-bezier(.34,1.56,.64,1)}
          @keyframes pop{from{transform:scale(0);opacity:0}to{transform:scale(1);opacity:1}}
          .ck-s-title{font-family:'Cormorant Garamond',serif;font-size:36px;font-weight:300;color:#1a3a1a;margin-bottom:8px}
          .ck-s-sub{font-size:14px;color:rgba(26,58,26,.6);line-height:1.7;margin-bottom:32px;max-width:320px}
          .ck-s-btn{padding:14px 40px;background:#2d5a27;color:white;border:none;border-radius:50px;font-family:'DM Sans',sans-serif;font-size:11px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;cursor:pointer;text-decoration:none;display:inline-block}
        `}</style>
        <div className="ck-s">
          <div className="ck-s-icon"><Em c="✅" /></div>
          <h1 className="ck-s-title">Order Placed!</h1>
          <p className="ck-s-sub">Your order is confirmed. You&apos;ll receive a confirmation email shortly.</p>
          <Link href="/" className="ck-s-btn">Continue Shopping</Link>
        </div>
      </>
    );
  }


  // ── Shared style tokens ──
  const ink = '#0f1a0f';
  const ink2 = '#1e3020';
  const g700 = '#2d5a27';
  const g600 = '#3a7a32';
  const g900 = '#0a140a';
  const beige = '#f5f0e8';
  const beigeM = '#ede7d9';
  const border = 'rgba(45,90,39,.15)';
  const white = '#ffffff';

  if (!hydrated || authLoading) return <CheckoutSkeleton />;

  return (
    <>
      <style>{`

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .ck-root {
          min-height: 100vh;
          background: #ffffff;
          font-family: 'DM Sans', sans-serif;
          color: #0f1a0f;
          margin-top: 60px;
          overflow-x: hidden;
          width: 100%;
        }

        .ck-savings-strip {
          background: #d4edda;
          padding: 10px 16px;
          font-size: 13px;
          color: #0a2e12;
          font-weight: 700;
          border-bottom: 1px solid rgba(45,90,39,.18);
          display: flex;
          align-items: center;
          gap: 6px;
          justify-content: center;
          flex-wrap: wrap;
          text-align: center;
        }

        .ck-body {
          padding: 16px 12px 60px;
          max-width: 1060px;
          margin: 0 auto;
          width: 100%;
        }
        @media (min-width: 480px)  { .ck-body { padding: 20px 16px 60px; } }
        @media (min-width: 768px)  { .ck-body { padding: 32px 28px 60px; } }
        @media (min-width: 1024px) { .ck-body { padding: 40px 48px 60px; } }

        .ck-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        @media (min-width: 768px) { .ck-layout { grid-template-columns: 1fr 340px; align-items: start; gap: 20px; } }
        @media (min-width: 1024px) { .ck-layout { grid-template-columns: 1fr 400px; gap: 28px; } }

        .ck-col-right { order: 2; }
        @media (min-width: 768px) { .ck-col-right { order: unset; } }

        .ck-col-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 20px;
          font-weight: 500;
          letter-spacing: .06em;
          color: #0a140a;
          margin-bottom: 10px;
        }
        @media (min-width: 480px) { .ck-col-title { font-size: 22px; } }

        .ck-panel {
          background: #ffffff;
          border-radius: 14px;
          overflow: hidden;
          border: 1px solid rgba(45,90,39,.15);
          box-shadow: 0 2px 14px rgba(45,90,39,.07);
          margin-bottom: 12px;
          animation: ckUp .35s ease both;
          width: 100%;
          min-width: 0;
        }
        @media (min-width: 480px) { .ck-panel { border-radius: 16px; margin-bottom: 14px; } }
        @keyframes ckUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes ckPinSpin { to { transform: rotate(360deg); } }

        .ck-panel-head {
          padding: 11px 16px 9px;
          font-size: 9px;
          letter-spacing: .44em;
          text-transform: uppercase;
          color: #1e3020;
          font-weight: 700;
          border-bottom: 1px solid rgba(45,90,39,.15);
          background: #f5f0e8;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        @media (min-width: 480px) { .ck-panel-head { padding: 12px 20px 10px; } }

        /* Payment methods */
        .ck-method {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 14px 16px;
          border-bottom: 1px solid rgba(45,90,39,.15);
          cursor: pointer;
          transition: background .15s;
          min-width: 0;
        }
        @media (min-width: 480px) { .ck-method { gap: 14px; padding: 15px 20px; } }
        .ck-method:last-child { border-bottom: none; }
        .ck-method:hover { background: #f5f0e8; }
        .ck-method.active { background: #eaf5ea; }
        .ck-method.ck-method-disabled { opacity: .45; cursor: not-allowed; pointer-events: none; }

        .ck-method-body { flex: 1; min-width: 0; }
        .ck-method-label {
          font-size: 13px;
          font-weight: 700;
          color: #0f1a0f;
          margin-bottom: 3px;
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }
        @media (min-width: 480px) { .ck-method-label { font-size: 14px; } }
        .ck-method-sub { font-size: 12px; color: #1e3020; line-height: 1.5; word-break: break-word; font-weight: 500; }
        .ck-method-badge { font-size: 8px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: white; background: #3a7a32; padding: 2px 7px; border-radius: 4px; white-space: nowrap; flex-shrink: 0; }
        .ck-method-no-express { font-size: 8px; font-weight: 700; color: #8b2e21; background: rgba(181,52,28,.1); padding: 2px 7px; border-radius: 4px; letter-spacing: .08em; text-transform: uppercase; white-space: nowrap; }

        .ck-radio { width: 20px; height: 20px; border-radius: 50%; border: 2px solid rgba(45,90,39,.15); flex-shrink: 0; display: flex; align-items: center; justify-content: center; transition: all .2s; margin-top: 2px; }
        .ck-method.active .ck-radio { border-color: #3a7a32; background: #3a7a32; }
        .ck-method.active .ck-radio::after { content: ''; width: 8px; height: 8px; border-radius: 50%; background: white; }

        .ck-cod-note { padding: 11px 16px; background: rgba(181,52,28,.05); border-bottom: 1px solid rgba(181,52,28,.15); font-size: 12px; color: #5a1a0e; line-height: 1.6; word-break: break-word; font-weight: 500; }
        @media (min-width: 480px) { .ck-cod-note { padding: 12px 20px; } }
        .ck-cod-note strong { font-weight: 800; color: #3d0e06; }

        .ck-express-schedule-note {
          margin: 12px;
          padding: 14px 16px;
          background: #fff9e6;
          border: 1.5px solid rgba(212,143,56,.25);
          border-radius: 12px;
          font-size: 12.5px;
          color: #664d03;
          line-height: 1.5;
          animation: ckUp .3s ease;
        }
        @media (min-width: 480px) {
          .ck-express-schedule-note {
            margin: 14px 16px 16px;
          }
        }
        .ck-es-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 700;
          margin-bottom: 6px;
          color: #856404;
        }
        .ck-es-icon {
          font-size: 16px;
        }
        .ck-es-list {
          padding-left: 18px;
          margin: 0;
        }
        .ck-es-list li {
          margin-bottom: 6px;
        }
        .ck-es-list li:last-child {
          margin-bottom: 0;
        }
        .ck-popup-schedule {
          background: #fff9e6;
          border: 1px solid rgba(212,143,56,.25);
          border-radius: 12px;
          padding: 12px 14px;
          margin-bottom: 14px;
        }

        .ck-partial-options { display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap; }
        .ck-partial-btn { flex: 1; min-width: 110px; padding: 8px 6px; border: 1.5px solid rgba(45,90,39,.15); border-radius: 8px; background: #ffffff; cursor: pointer; text-align: center; font-size: 12px; font-weight: 700; color: #0f1a0f; transition: all 0.2s; white-space: nowrap; font-family: 'DM Sans', sans-serif; }
        .ck-partial-btn.active { border-color: #3a7a32; background: #f0f7f0; color: #2d5a27; }

        /* ── Delivery cards ── */
        .ck-delivery-cards {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          padding: 12px;
        }
        @media (min-width: 480px) { .ck-delivery-cards { padding: 14px 16px 0; gap: 12px; } }

        .ck-delivery-card {
          border: 2px solid rgba(45,90,39,.15);
          border-radius: 14px;
          padding: 14px 12px;
          cursor: pointer;
          background: #ffffff;
          transition: border-color .2s, background .2s, box-shadow .2s;
          position: relative;
          min-width: 0;
        }
        .ck-delivery-card:hover { border-color: #4a9e40; box-shadow: 0 4px 16px rgba(45,90,39,.1); }
        .ck-delivery-card.active { border-color: #3a7a32; background: #f0f7f0; }

        .ck-dc-icon { font-size: 22px; margin-bottom: 4px; }
        .ck-dc-label { font-size: 14px; font-weight: 800; color: #0f1a0f; margin-bottom: 10px; }

        /* zone block: label on top, days below */
        .ck-dc-zone-block { margin-bottom: 6px; }
        .ck-dc-zone-block:last-of-type { margin-bottom: 10px; }
        .ck-dc-zone-name {
          font-size: 9px;
          font-weight: 800;
          letter-spacing: .12em;
          text-transform: uppercase;
          color: #3a7a32;
          margin-bottom: 1px;
        }
        .ck-dc-zone-days {
          font-size: 12px;
          font-weight: 600;
          color: #0f1a0f;
          line-height: 1.3;
        }
        @media (max-width: 380px) { .ck-dc-zone-days { font-size: 11px; } }

        .ck-dc-rate { font-size: 13px; font-weight: 800; color: #2d5a27; }
        @media (min-width: 480px) { .ck-dc-rate { font-size: 14px; } }

        .ck-dc-check {
          position: absolute; top: 8px; right: 8px;
          width: 18px; height: 18px; border-radius: 50%;
          background: #3a7a32; border: 2px solid white;
          display: flex; align-items: center; justify-content: center;
          font-size: 9px; color: white;
          opacity: 0; transform: scale(.5);
          transition: opacity .2s, transform .25s cubic-bezier(.34,1.56,.64,1);
        }
        .ck-delivery-card.active .ck-dc-check { opacity: 1; transform: scale(1); }

        /* ── Free shipping banner ── */
        .ck-free-ship {
          margin: 10px 12px 12px;
          padding: 11px 14px;
          background: linear-gradient(135deg, #e6f4e7, #f0faf0);
          border: 1.5px solid rgba(45,90,39,.22);
          border-radius: 10px;
          display: flex;
          align-items: center;
          gap: 9px;
          font-size: 12px;
          font-weight: 700;
          color: #0a2e12;
          line-height: 1.4;
        }
        @media (min-width: 480px) { .ck-free-ship { margin: 10px 16px 14px; font-size: 13px; padding: 12px 16px; } }
        .ck-free-ship-icon { font-size: 18px; flex-shrink: 0; }

        /* Gift cards */
        .ck-gift-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 12px; }
        @media (min-width: 480px) { .ck-gift-cards { padding: 14px 16px 0; } }
        .ck-gift-card { position: relative; border: 2px solid rgba(45,90,39,.15); border-radius: 12px; overflow: hidden; cursor: pointer; background: #ffffff; transition: border-color .2s, box-shadow .2s, transform .15s; min-width: 0; }
        @media (min-width: 480px) { .ck-gift-card { border-radius: 14px; } }
        .ck-gift-card:hover { border-color: #4a9e40; box-shadow: 0 4px 16px rgba(45,90,39,.12); transform: translateY(-2px); }
        .ck-gift-card.active { border-color: #3a7a32; box-shadow: 0 6px 22px rgba(45,90,39,.2); }
        .ck-gift-card img { width: 100%; aspect-ratio: 1/1; object-fit: cover; display: block; background: #ede7d9; }
        .ck-gift-card-body { padding: 8px 10px 10px; }
        @media (min-width: 480px) { .ck-gift-card-body { padding: 10px 12px 12px; } }
        .ck-gift-card-title { font-size: 11px; font-weight: 700; color: #0f1a0f; margin-bottom: 2px; }
        @media (min-width: 480px) { .ck-gift-card-title { font-size: 12.5px; } }
        .ck-gift-card-sub { font-size: 10px; color: #1e3020; margin-bottom: 4px; line-height: 1.3; font-weight: 500; }
        @media (min-width: 480px) { .ck-gift-card-sub { font-size: 11px; margin-bottom: 6px; } }
        .ck-gift-card-price { font-size: 12px; font-weight: 800; color: #2d5a27; }
        @media (min-width: 480px) { .ck-gift-card-price { font-size: 13px; } }
        .ck-gift-card-badge { position: absolute; top: 7px; right: 7px; width: 18px; height: 18px; border-radius: 50%; background: #3a7a32; border: 2px solid white; display: flex; align-items: center; justify-content: center; font-size: 9px; color: white; opacity: 0; transform: scale(.5); transition: opacity .2s, transform .25s cubic-bezier(.34,1.56,.64,1); pointer-events: none; }
        .ck-gift-card.active .ck-gift-card-badge { opacity: 1; transform: scale(1); }
        .ck-gift-msg-wrap { padding: 10px 12px 12px; animation: ckUp .3s ease; }
        @media (min-width: 480px) { .ck-gift-msg-wrap { padding: 12px 16px 16px; } }
        .ck-gift-msg { width: 100%; padding: 10px 12px; border: 1.5px solid rgba(45,90,39,.15); border-radius: 10px; font-family: 'DM Sans', sans-serif; font-size: 13px; color: #0f1a0f; background: white; outline: none; resize: none; height: 68px; transition: border-color .2s; }
        .ck-gift-msg:focus { border-color: #4a9e40; }
        .ck-gift-msg::placeholder { color: rgba(15,26,15,.4); }

        /* Order rows */
        .ck-row { display: flex; justify-content: space-between; align-items: center; padding: 11px 16px; font-size: 13px; color: #1e3020; border-bottom: 1px solid rgba(45,90,39,.12); gap: 8px; min-width: 0; font-weight: 600; }
        @media (min-width: 480px) { .ck-row { padding: 12px 20px; } }
        .ck-row:last-child { border-bottom: none; }
        .ck-row-label { display: flex; align-items: center; gap: 6px; flex: 1; min-width: 0; flex-wrap: wrap; color: #1e3020; font-weight: 600; }
        .ck-row-label-text { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 160px; }
        @media (min-width: 360px) { .ck-row-label-text { max-width: 180px; } }
        @media (min-width: 480px) { .ck-row-label-text { max-width: 220px; } }
        @media (min-width: 768px) { .ck-row-label-text { max-width: none; white-space: normal; } }
        .ck-row-value { font-weight: 700; color: #0f1a0f; flex-shrink: 0; white-space: nowrap; }
        .ck-row.save .ck-row-value { color: #2d5a27; }
        .ck-row.save { color: #2d5a27; font-weight: 700; }
        .ck-row.total { font-size: 15px; font-weight: 800; color: #0a140a; background: #f5f0e8; padding: 14px 16px; }
        @media (min-width: 480px) { .ck-row.total { padding: 14px 20px; } }
        .ck-row.total .ck-row-value { font-size: 18px; font-weight: 900; color: #0a140a; }
        .ck-free-badge { background: #2d5a27; color: white; font-size: 9px; font-weight: 800; padding: 2px 8px; border-radius: 4px; text-transform: uppercase; letter-spacing: .1em; white-space: nowrap; }
        .ck-qty-badge { font-size: 11px; color: #1e3020; flex-shrink: 0; font-weight: 700; }

        .ck-charms { padding: 0 16px 10px; display: flex; flex-direction: column; gap: 3px; }
        @media (min-width: 480px) { .ck-charms { padding: 0 20px 10px; } }
        .ck-charm-row { display: flex; justify-content: space-between; font-size: 11px; color: #1e3020; gap: 6px; min-width: 0; font-weight: 500; }
        .ck-charm-name { display: flex; align-items: center; gap: 4px; flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .ck-charm-price { font-weight: 700; flex-shrink: 0; white-space: nowrap; }

        /* Pay button */

        .ck-steps { list-style:none; display:flex; align-items:center; gap:8px; margin:0 auto 22px; padding:0; max-width:1120px; font-size:13px; color:#6f6f64; flex-wrap:wrap; }
        .ck-step { display:flex; align-items:center; gap:8px; }
        .ck-step + .ck-step::before { content:''; width:28px; height:1px; background:#d9d6c8; margin-right:4px; }
        .ck-step button { all:unset; display:flex; align-items:center; gap:8px; cursor:pointer; }
        .ck-step button:disabled { cursor:default; }
        .ck-step > span, .ck-step button > span { width:26px; height:26px; border-radius:50%; background:#f1f0ea; color:#6f6f64; display:inline-flex; align-items:center; justify-content:center; font-size:12px; font-weight:600; }
        .ck-step.on { color:#1a1a14; font-weight:600; }
        .ck-step.on > span, .ck-step.on button > span { background:#2a4736; color:#fff; }
        .ck-step.done { color:#2a4736; }
        .ck-step.done > span, .ck-step.done button > span { background:#e1ece3; color:#2a4736; }
        .ck-recap { background:#fafaf6; border:1px solid #ecebe4; border-radius:14px; padding:4px 16px; margin-bottom:16px; }
        .ck-recap-row { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:12px 0; }
        .ck-recap-row + .ck-recap-row { border-top:1px solid #ecebe4; }
        .ck-recap-label { font-size:11px; letter-spacing:.12em; text-transform:uppercase; color:#6f6f64; margin-bottom:3px; }
        .ck-recap-text { font-size:14px; color:#1a1a14; line-height:1.4; overflow-wrap:anywhere; }
        .ck-recap-edit { background:none; border:0; color:#2a4736; font:inherit; font-size:13px; font-weight:600; cursor:pointer; text-decoration:underline; text-underline-offset:3px; flex-shrink:0; }
        .ck-cont-left { display:none; }
        .ck-step-error { color:#c0392b; font-size:13px; margin:0 0 10px; }

        /* ═════ Checkout refresh ═════ */
        .ck-top { border-bottom:1px solid #ecebe4; background:#fff; }
        .ck-top-in { max-width:1180px; margin:0 auto; padding:14px 20px; display:flex; align-items:center; justify-content:space-between; gap:12px; }
        .ck-logo { font-family:'Cormorant Garamond',serif; font-weight:700; font-size:20px; letter-spacing:.14em; color:#1a1a14; text-decoration:none; text-transform:uppercase; }
        .ck-secure-top { display:inline-flex; align-items:center; gap:7px; font-size:12px; color:#6f6f64; letter-spacing:.04em; }
        .ck-secure-top svg { color:#2a4736; }
        .ck-body { max-width:1180px; }
        @media (min-width:1024px) { .ck-top-in { padding-left:48px; padding-right:48px; } }
        @media (min-width:768px) and (max-width:1023px) { .ck-top-in { padding-left:28px; padding-right:28px; } }
        @media (min-width:768px) { .ck-layout { grid-template-columns:minmax(0,1fr) 380px; gap:32px; } }
        @media (min-width:1024px) { .ck-layout { grid-template-columns:minmax(0,1fr) 420px; gap:44px; } .ck-col-right { position:sticky; top:20px; } }
        .ck-col-title { font-size:26px; font-weight:600; letter-spacing:0; color:#1a1a14; margin-bottom:14px; }
        .ck-panel { border:1px solid #ecebe4; border-radius:18px; box-shadow:none; }
        .ck-panel-head { background:#fafaf6; color:#6f6f64; }
        .ck-thumb { position:relative; width:48px; height:60px; border-radius:10px; overflow:hidden; background:#f4f3ee; flex-shrink:0; display:inline-block; }
        .ck-thumb img { width:100%; height:100%; object-fit:cover; display:block; }
        .ck-thumb i { position:absolute; right:3px; bottom:3px; min-width:18px; height:18px; padding:0 5px; border-radius:9px; background:#1a1a14; color:#fff; font:600 11px/18px 'DM Sans',sans-serif; text-align:center; font-style:normal; }

        /* Address picker + form */
        .ck2 + .ck2 { margin-top:28px; }
        .ck2-card { background:#fff; border:1px solid #ecebe4; border-radius:18px; padding:18px; }
        .ck2-list { display:flex; flex-direction:column; gap:12px; margin-bottom:14px; }
        .ck2-addr { position:relative; display:flex; gap:14px; align-items:flex-start; padding:16px; border:1.5px solid #e6e4da; border-radius:14px; cursor:pointer; background:#fff; transition:border-color .2s, box-shadow .2s, background .2s; }
        .ck2-addr:hover { border-color:#cfcbb8; }
        .ck2-addr.on { border-color:#2a4736; background:#fafcfa; box-shadow:0 0 0 3px rgba(42,71,54,.09); }
        .ck2-addr input { position:absolute; opacity:0; inset:0; margin:0; cursor:pointer; }
        .ck2-addr input:focus-visible + .ck2-dot { box-shadow:0 0 0 3px rgba(42,71,54,.25); }
        .ck2-dot { width:20px; height:20px; border-radius:50%; border:2px solid #cfcbb8; flex-shrink:0; margin-top:2px; position:relative; transition:border-color .2s; }
        .ck2-addr.on .ck2-dot { border-color:#2a4736; }
        .ck2-addr.on .ck2-dot::after { content:''; position:absolute; inset:3px; border-radius:50%; background:#2a4736; }
        .ck2-addr-body { display:flex; flex-direction:column; gap:3px; min-width:0; }
        .ck2-addr-name { font-size:15px; font-weight:600; color:#1a1a14; }
        .ck2-addr-line { font-size:14px; color:#3a3a32; line-height:1.45; overflow-wrap:anywhere; }
        .ck2-addr-phone { font-size:13px; color:#6f6f64; margin-top:2px; }
        .ck2-empty { margin:0 0 14px; font-size:14px; color:#6f6f64; }
        .ck2-add { display:flex; align-items:center; justify-content:center; gap:8px; width:100%; padding:14px; border:1.5px dashed #b8c6bd; border-radius:14px; background:#fafcfa; color:#2a4736; font:600 14px 'DM Sans',sans-serif; cursor:pointer; transition:background .2s, border-color .2s; }
        .ck2-add:hover { background:#f1f5f1; border-color:#2a4736; }
        .ck2-add span { font-size:20px; line-height:1; }
        .ck2-form { margin-top:4px; }
        .ck2-form-title { font-family:'Cormorant Garamond',serif; font-size:21px; font-weight:600; margin:2px 0 14px; color:#1a1a14; }
        .ck2-error { color:#b4301f; background:#fbeeec; border:1px solid #f1c9c3; border-radius:12px; padding:10px 14px; font-size:13.5px; margin-bottom:14px; font-weight:500; }
        .ck2-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:14px; }
        .ck2-full { grid-column:1 / -1; }
        .ck2-f { display:flex; flex-direction:column; gap:6px; min-width:0; }
        .ck2-f > span { font-size:13px; font-weight:500; color:#1a1a14; }
        .ck2-f > span em { font-style:normal; color:#8b8b80; font-weight:400; }
        .ck2-f input, .ck2-f select { width:100%; height:48px; padding:0 14px; border:1px solid #dcdacf; border-radius:12px; background:#fff; font:400 16px 'DM Sans',sans-serif; color:#1a1a14; outline:none; transition:border-color .2s, box-shadow .2s; appearance:none; -webkit-appearance:none; }
        .ck2-f select { background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236f6f64' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 14px center; padding-right:38px; }
        .ck2-f input::placeholder { color:#a2a296; }
        .ck2-f input:focus, .ck2-f select:focus { border-color:#2a4736; box-shadow:0 0 0 3px rgba(42,71,54,.12); }
        .ck2-phone { display:flex; align-items:stretch; border:1px solid #dcdacf; border-radius:12px; background:#fff; overflow:hidden; transition:border-color .2s, box-shadow .2s; }
        .ck2-phone:focus-within { border-color:#2a4736; box-shadow:0 0 0 3px rgba(42,71,54,.12); }
        .ck2-phone i { display:flex; align-items:center; padding:0 12px; background:#f4f3ee; color:#6f6f64; font:500 14px 'DM Sans',sans-serif; font-style:normal; border-right:1px solid #dcdacf; }
        .ck2-phone input { border:0; border-radius:0; box-shadow:none !important; }
        .ck2-actions { display:flex; gap:12px; margin-top:18px; }
        .ck2-btn { flex:1; height:48px; border:0; border-radius:999px; background:#2a4736; color:#fff; font:600 13px 'DM Sans',sans-serif; letter-spacing:.08em; text-transform:uppercase; cursor:pointer; transition:background .2s; }
        .ck2-btn:hover:not(:disabled) { background:#1f3a2a; }
        .ck2-btn:disabled { opacity:.6; cursor:wait; }
        .ck2-btn--ghost { background:#fff; color:#1a1a14; border:1px solid #dcdacf; }
        .ck2-btn--ghost:hover:not(:disabled) { background:#f4f3ee; }
        .ck2-check { display:flex; align-items:center; gap:10px; margin-top:16px; padding-top:16px; border-top:1px solid #ecebe4; font-size:14px; color:#1a1a14; cursor:pointer; }
        .ck2-check input { width:18px; height:18px; accent-color:#2a4736; }
        @media (max-width:639px) {
          .ck-top-in { padding:12px 16px; }
          .ck2-card { padding:14px; }
          .ck2-grid { grid-template-columns:minmax(0,1fr); }
          .ck2-grid .ck2-f { grid-column:1 / -1; }
          .ck-col-title { font-size:23px; }
        }
        .ck-pay-btn.ck-pay-inline { display:none; }
        .ck-sticky { position:fixed; left:0; right:0; bottom:0; z-index:60; background:#fff; border-top:1px solid #ecebe4; padding:10px 14px calc(10px + env(safe-area-inset-bottom)); display:flex; align-items:center; gap:14px; box-shadow:0 -8px 24px rgba(26,26,20,.08); }
        .ck-sticky-total { display:flex; flex-direction:column; line-height:1.15; min-width:0; }
        .ck-sticky-total small { font-size:11.5px; color:#6f6f64; }
        .ck-sticky-total b { font-size:19px; font-weight:600; color:#1a1a14; }
        .ck-sticky .ck-pay-btn { flex:1; width:auto; padding:14px 12px; font-size:12px; letter-spacing:.1em; margin:0; }
        .ck-body { padding-bottom:110px; }
        @media (min-width: 1024px) {
          .ck-sticky { display:none; }
          .ck-pay-btn.ck-pay-inline { display:flex; }
          .ck-body { padding-bottom:60px; }
        }
        .ck-pay-btn.ck-cont-right { display:none; }
        .ck-step-error--right { display:none; }
        @media (min-width: 1024px) { .ck-pay-btn.ck-cont-right { display:flex; } .ck-step-error--right { display:block; margin-top:12px; } }
        .ck-pay-btn { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 16px 12px; background: linear-gradient(135deg, #2d5a27, #1a3a1a); color: white; border: none; border-radius: 14px; font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; cursor: pointer; box-shadow: 0 6px 28px rgba(45,90,39,.3); transition: all .22s; margin-top: 4px; flex-wrap: wrap; text-align: center; line-height: 1.4; }
        @media (min-width: 480px) { .ck-pay-btn { font-size: 13px; letter-spacing: .18em; padding: 18px; } }
        .ck-pay-btn:hover:not(:disabled) { background: linear-gradient(135deg, #3a7a32, #2d5a27); transform: translateY(-1px); box-shadow: 0 8px 32px rgba(45,90,39,.36); }
        .ck-pay-btn:disabled { opacity: .45; cursor: not-allowed; }
        .ck-spinner { width: 16px; height: 16px; border-radius: 50%; border: 2px solid rgba(255,255,255,.3); border-top-color: white; animation: spin .7s linear infinite; flex-shrink: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .ck-secure-note { display: flex; align-items: center; justify-content: center; gap: 5px; font-size: 11px; color: #1e3020; margin-top: 10px; font-weight: 600; flex-wrap: wrap; text-align: center; }

        /* Address */
        .ck-addr-grid { display: grid; grid-template-columns: 1fr; gap: 8px; }
        @media (min-width: 400px) { .ck-addr-grid { grid-template-columns: 1fr 1fr; gap: 10px; } .ck-addr-full { grid-column: 1 / -1; } }
        .ck-addr-input { padding: 10px 12px; border-radius: 10px; border: 1.5px solid rgba(45,90,39,.15); font-family: 'DM Sans', sans-serif; font-size: 16px; color: #0f1a0f; background: white; outline: none; width: 100%; transition: border-color .2s; font-weight: 500; }
        @media (min-width: 480px) { .ck-addr-input { font-size: 14px; padding: 10px 14px; } }
        .ck-addr-input:focus { border-color: #4a9e40; }
        .ck-addr-input::placeholder { color: rgba(15,26,15,.4); }

        /* Express Popup */
        .ck-popup-overlay { position: fixed; inset: 0; background: rgba(5,15,5,.6); backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px); z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 20px; animation: ckFadeIn .2s ease; }
        @keyframes ckFadeIn { from { opacity: 0; } to { opacity: 1; } }
        .ck-popup { background: white; border-radius: 22px; padding: 30px 24px 26px; max-width: 360px; width: 100%; box-shadow: 0 24px 80px rgba(5,15,5,.35); animation: ckPopIn .3s cubic-bezier(.34,1.56,.64,1); }
        @keyframes ckPopIn { from { opacity: 0; transform: scale(.88) translateY(14px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        .ck-popup-icon { width: 56px; height: 56px; background: linear-gradient(135deg, #fff8e1, #ffe082); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 28px; margin: 0 auto 16px; }
        .ck-popup-title { font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 500; color: #0a140a; text-align: center; margin-bottom: 8px; letter-spacing: .02em; }
        .ck-popup-body { font-size: 13px; font-weight: 500; color: #1e3020; line-height: 1.7; text-align: center; margin-bottom: 18px; }
        .ck-popup-body strong { font-weight: 800; color: #0f1a0f; }
        .ck-popup-avail { background: #f0f7f0; border: 1px solid rgba(45,90,39,.2); border-radius: 12px; padding: 14px 16px; margin-bottom: 20px; }
        .ck-popup-avail-title { font-size: 9px; font-weight: 800; letter-spacing: .22em; text-transform: uppercase; color: #2d5a27; margin-bottom: 10px; }
        .ck-popup-avail-row { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; color: #0f1a0f; margin-bottom: 6px; }
        .ck-popup-avail-row:last-child { margin-bottom: 0; }
        .ck-popup-avail-dot { width: 7px; height: 7px; border-radius: 50%; background: #3a7a32; flex-shrink: 0; }
        .ck-popup-warn { background: #fdf3f2; border: 1px solid rgba(181,52,28,.2); border-radius: 12px; padding: 12px 16px; margin-bottom: 20px; font-size: 13px; font-weight: 600; color: #5a1a0e; }
        .ck-popup-warn strong { font-weight: 800; color: #3d0e06; }
        .ck-popup-close { width: 100%; padding: 14px; background: #2d5a27; color: white; border: none; border-radius: 12px; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; cursor: pointer; transition: background .2s; }
        .ck-popup-close:hover { background: #3a7a32; }
      `}</style>

      {/* ── Express Popup ── */}
      {showExpressPopup && (
        <div className="ck-popup-overlay" onClick={() => setShowExpressPopup(false)}>
          <div className="ck-popup" onClick={e => e.stopPropagation()}>
            <div className="ck-popup-icon"><Em c="⚡" /></div>
            <h2 className="ck-popup-title">Express Delivery</h2>
            <p className="ck-popup-body">
              Delivered in <strong>2–3 days</strong> (Metro Cities) or <strong>3–4 days</strong> (Rest of India) at <strong>₹110</strong>.
            </p>
            <div className="ck-popup-avail">
              <p className="ck-popup-avail-title">Available payment methods</p>
              <div className="ck-popup-avail-row">
                <span className="ck-popup-avail-dot" />
                Online Payment — Pay in full via Online Payment
              </div>
              <div className="ck-popup-avail-row">
                <span className="ck-popup-avail-dot" />
                Partial COD — Pay a portion now, rest on delivery
              </div>
            </div>
            <div className="ck-popup-warn">
              <strong>Cash on Delivery is not available</strong> for Express orders. Please choose Online Payment or Partial COD.
            </div>
            <button className="ck-popup-close" onClick={() => setShowExpressPopup(false)}>Got it, Continue</button>
          </div>
        </div>
      )}

      <div className="ck-root">
        <ExitIntent />

        <header className="ck-top">
          <div className="ck-top-in">
            <Link href="/" className="ck-logo" aria-label="Make You Sparkle home">Make You Sparkle</Link>
            <span className="ck-secure-top">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
              Secure checkout
            </span>
          </div>
        </header>

        {savings > 0 && (
          <div className="ck-savings-strip">
            <Em c="🎉" /> You&apos;re saving <strong style={{ marginLeft: 3 }}>₹{savings.toLocaleString('en-IN')}</strong> on this order
          </div>
        )}

        {needsLogin && (
          <div style={{ maxWidth: 440, margin: '80px auto', padding: '0 20px', textAlign: 'center' }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, margin: '0 0 8px' }}>Sign in to continue</h2>
            <p style={{ color: '#6f6f64', margin: '0 0 20px' }}>We need your account to save your address and place the order. Your cart is safe.</p>
            <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('makeussparkle:auth-open', { detail: { tab: 'login' } }))}
              style={{ padding: '14px 28px', borderRadius: 999, border: 0, background: '#2a4736', color: '#fff', fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', fontSize: 12, cursor: 'pointer' }}>
              Sign in / Sign up
            </button>
          </div>
        )}

        <div className="ck-body" style={needsLogin ? { display: 'none' } : undefined}>
          <ol className="ck-steps" aria-label="Checkout steps">
            <li className="ck-step done"><span>✓</span>Cart</li>
            <li className={`ck-step${step === 1 ? ' on' : ' done'}`}>
              <button type="button" onClick={() => step === 2 && setStep(1)} disabled={step === 1}><span>{step === 2 ? '✓' : '1'}</span>Address &amp; delivery</button>
            </li>
            <li className={`ck-step${step === 2 ? ' on' : ''}`}><span>2</span>Payment</li>
          </ol>
          <div className="ck-layout">

            {/* ── LEFT COLUMN ── */}
            <div>
              {step === 1 && (<>
              <AddressSection
                title="Shipping address"
                errorId="ck-pincode-error-banner"
                addresses={user?.addresses ?? []}
                userName={user?.name}
                selected={selectedAddressIndex}
                onSelect={(i) => { setSelectedAddressIndex(i); setShowAddressForm(false); }}
                showForm={showAddressForm}
                setShowForm={setShowAddressForm}
                form={addressForm}
                setForm={setAddressForm}
                busy={addressBusy}
                error={addressError}
                onSave={handleSaveAddress}
                footer={
                  <label className="ck2-check">
                    <input type="checkbox" checked={billingSameAsShipping} onChange={(e) => setBillingSameAsShipping(e.target.checked)} />
                    <span>Billing address is the same as shipping</span>
                  </label>
                }
              />

              {!billingSameAsShipping && (
                <AddressSection
                  title="Billing address"
                  errorId="ck-billing-pincode-error-banner"
                  addresses={user?.addresses ?? []}
                  userName={user?.name}
                  selected={selectedBillingAddressIndex}
                  onSelect={(i) => { setSelectedBillingAddressIndex(i); setShowBillingAddressForm(false); }}
                  showForm={showBillingAddressForm}
                  setShowForm={setShowBillingAddressForm}
                  form={billingAddressForm}
                  setForm={setBillingAddressForm}
                  busy={billingAddressBusy}
                  error={billingAddressError}
                  onSave={handleSaveBillingAddress}
                  radioName="billingAddress"
                />
              )}

              <p className="ck-col-title" style={{ marginTop: 28 }}>Delivery</p>
              <div className="ck-panel" style={{ animationDelay: '.18s' }}>
                <div className="ck-panel-head">Choose Delivery Speed</div>

                <div className="ck-delivery-cards">
                  {DELIVERY_OPTIONS.map(opt => (
                    <div
                      key={opt.id}
                      className={`ck-delivery-card${deliveryType === opt.id ? ' active' : ''}`}
                      onClick={() => handleDeliveryTypeChange(opt.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => e.key === 'Enter' && handleDeliveryTypeChange(opt.id)}
                    >
                      <div className="ck-dc-icon"><Em c={opt.icon} /></div>
                      <div className="ck-dc-label">{opt.label}</div>

                      {/* Metro block */}
                      <div className="ck-dc-zone-block">
                        <div className="ck-dc-zone-name">Metro Cities</div>
                        <div className="ck-dc-zone-days">{opt.metro}</div>
                      </div>

                      {/* Rest of India block */}
                      <div className="ck-dc-zone-block">
                        <div className="ck-dc-zone-name">Rest of India</div>
                        <div className="ck-dc-zone-days">{opt.rest}</div>
                      </div>

                      <div className="ck-dc-rate">{opt.rate}</div>
                      <div className="ck-dc-check">✓</div>
                    </div>
                  ))}
                </div>

                {deliveryType === 'express' && (
                  <div className="ck-express-schedule-note">
                    <div className="ck-es-header">
                      <span className="ck-es-icon"><Em c="⏰" /></span>
                      <strong>Express Dispatch Schedule</strong>
                    </div>
                    <ul className="ck-es-list">
                      <li>Orders placed <strong>after 11:00 AM</strong> will be dispatched the <strong>next day</strong> (delivery takes 2-3 days for Metro / 3-4 days for Rest of India from dispatch).</li>
                      <li>Orders placed on <strong>Saturday post 11:00 AM</strong> will be dispatched on <strong>Monday</strong> (with same transit timeline starting from Monday).</li>
                    </ul>
                  </div>
                )}

                {/* Free shipping banner — full width inside panel */}
                <div className="ck-free-ship">
                  <span className="ck-free-ship-icon"><Em c="🎁" /></span>
                  <span>Free Standard Shipping on orders above <strong>₹999</strong></span>
                </div>
              </div>

              <div className="ck-cont-left">
                {stepError && <p className="ck-step-error" role="alert">{stepError}</p>}
                <button type="button" className="ck-pay-btn" onClick={goToPayment}>
                  Continue to payment
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </button>
              </div>
              </>)}
              {step === 2 && (<>
              <div className="ck-recap">
                <div className="ck-recap-row">
                  <div>
                    <div className="ck-recap-label">Delivering to</div>
                    <div className="ck-recap-text">
                      {(() => { const a = user?.addresses?.[selectedAddressIndex]; return a ? `${a.name || user?.name || 'Customer'} · ${a.addressLine1 || a.fullAddress || ''}${a.city ? ', ' + a.city : ''}${a.pincode ? ' - ' + a.pincode : ''}` : '—'; })()}
                    </div>
                  </div>
                  <button type="button" className="ck-recap-edit" onClick={() => { setStep(1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Change</button>
                </div>
                <div className="ck-recap-row">
                  <div>
                    <div className="ck-recap-label">Delivery</div>
                    <div className="ck-recap-text">{deliveryType === 'express' ? 'Express' : 'Standard'}</div>
                  </div>
                  <button type="button" className="ck-recap-edit" onClick={() => { setStep(1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Change</button>
                </div>
              </div>

              <p className="ck-col-title">Payment</p>
              <div className="ck-panel" style={{ animationDelay: '.08s' }}>
                <div className="ck-panel-head">Select Payment Method</div>
                {/* Cart-level payment constraint notice */}
                {cartPaymentConstraint !== 'cod_allowed' && (
                  <div style={{ margin: '0 0 4px', padding: '10px 16px', background: '#fdf6e3', borderLeft: '3px solid #c9a84c', borderRadius: '0 6px 6px 0', fontSize: 12, color: '#7a5c10', lineHeight: 1.5 }}>
                    <strong><Em c="⚠" /> Payment restriction applies:</strong>{' '}
                    {cartPaymentConstraint === 'prepaid_only'
                      ? <>Full online payment is required for <strong>{constraintProducts.slice(0, 2).join(', ')}{constraintProducts.length > 2 ? ` +${constraintProducts.length - 2} more` : ''}</strong>. COD &amp; Partial COD are disabled.</>  
                      : <>Partial COD is mandatory for <strong>{constraintProducts.slice(0, 2).join(', ')}{constraintProducts.length > 2 ? ` +${constraintProducts.length - 2} more` : ''}</strong>. Full COD is disabled.</> 
                    }
                  </div>
                )}
                {PAYMENT_METHODS.map(method => {
                  const isActive = selectedMethod === method.id;
                  // Disable logic — apply strictest constraint
                  const isDisabled =
                    (deliveryType === 'express' && method.id === 'COD') ||
                    (cartPaymentConstraint === 'prepaid_only' && (method.id === 'COD' || method.id === 'PARTIAL_COD')) ||
                    (cartPaymentConstraint === 'partial_cod' && method.id === 'COD');
                  const disabledReason =
                    isDisabled && cartPaymentConstraint === 'prepaid_only' ? 'Not available — cart contains Prepaid Only item' :
                    isDisabled && cartPaymentConstraint === 'partial_cod' ? 'Not available — cart requires Partial payment' :
                    isDisabled ? 'Not for Express' : null;
                  return (
                    <div key={method.id}>
                      <div className={`ck-method${isActive ? ' active' : ''}${isDisabled ? ' ck-method-disabled' : ''}`} onClick={() => !isDisabled && setSelectedMethod(method.id)}>
                        <div className="ck-radio" />
                        <div className="ck-method-body">
                          <div className="ck-method-label">
                            {method.label}
                            {method.badge && <span className="ck-method-badge">{method.badge}</span>}
                            {isDisabled && disabledReason && <span className="ck-method-no-express">{disabledReason}</span>}
                          </div>
                          <div className="ck-method-sub">{method.sub}</div>
                        </div>
                      </div>
                      {isActive && method.id === 'PARTIAL_COD' && (
                        <div className="ck-cod-note">
                          Pay <strong>₹{Math.round(finalTotal * 0.20).toLocaleString('en-IN')} now</strong> via PhonePe (20% required upfront). Balance of <strong>₹{(finalTotal - Math.round(finalTotal * 0.20)).toLocaleString('en-IN')}</strong> collected on delivery.
                        </div>
                      )}
                      {isActive && method.id === 'COD' && (
                        <div className="ck-cod-note">
                          Pay <strong>₹{finalTotal.toLocaleString('en-IN')}</strong> (includes standard shipping and ₹80 COD convenience fee) in cash or UPI on delivery.
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              </>)}
            </div>

            {/* ── RIGHT COLUMN ── */}
            <div className="ck-col-right">
              <p className="ck-col-title">Order Summary</p>
              <div className="ck-panel" style={{ animationDelay: '.18s' }}>
                <div className="ck-panel-head">{itemCount} Item{itemCount !== 1 ? 's' : ''}</div>

                {items.map(item => (
                  <div key={`${item.id}-${item.colorHex}`}>
                    <div className="ck-row">
                      <div className="ck-row-label">
                        {item.image && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <span className="ck-thumb"><img src={cdnImage(item.image, 120)} alt="" width={48} height={60} /><i>{item.qty}</i></span>
                        )}
                        {!item.image && <span className="ck-qty-badge">×{item.qty}</span>}
                        <span className="ck-row-label-text">{item.name}</span>
                      </div>
                      <span className="ck-row-value">₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
                    </div>
                    {item.selectedCharms && item.selectedCharms.length > 0 && (
                      <div className="ck-charms">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 2 }}>
                          <span style={{ fontSize: 9, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--mist)', fontWeight: 600 }}>
                            {item.selectedCharms.length} Charms Selected
                          </span>
                          {(item as any).band?.name && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, fontWeight: 600, color: 'var(--olive-600)', background: 'rgba(74,92,34,.08)', padding: '2px 6px', borderRadius: 12 }}>
                              <Em c="🪡" /> {(item as any).band.name}
                            </span>
                          )}
                          {(item as any).selectionGroups?.[0]?.metadata?.packAddOn > 0 && (
                            <span style={{ fontSize: 9, color: 'var(--mist)', fontStyle: 'italic' }}>
                              +₹{(item as any).selectionGroups[0].metadata.packAddOn} add-on
                            </span>
                          )}
                        </div>
                        {item.selectedCharms.map((selection, idx: number) => {
                          const charm = typeof selection === 'string' ? { id: selection, name: selection } : selection;
                          const charmPrice = typeof charm.price === 'number' && Number.isFinite(charm.price) ? charm.price : item.selectedCharms?.length ? item.price / item.selectedCharms.length : 0;
                          return (
                            <div key={charm.id || charm._id || idx} className="ck-charm-row">
                              <span className="ck-charm-name"><span>{charm.emoji || '◈'}</span><span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{charm.name}</span></span>
                              <span className="ck-charm-price">₹{charmPrice.toLocaleString('en-IN')}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {item.giftBox && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '5px 8px',
                          background: 'rgba(201,168,76,0.12)',
                          border: '1px solid rgba(201,168,76,0.25)',
                          borderRadius: 6,
                          marginTop: 6,
                          fontSize: 11,
                          color: 'var(--olive-900)',
                        }}
                      >
                        <span><Em c="🎁" /></span>
                        <span style={{ fontWeight: 600 }}>{item.giftBoxDetails?.heading || 'Premium Gift Box'}</span>
                        <span style={{ color: 'var(--olive-700)', marginLeft: 'auto', fontWeight: 600 }}>
                          +₹{item.giftBoxDetails?.price ?? 50}
                        </span>
                      </div>
                    )}
                  </div>
                ))}

                {savings > 0 && (
                  <div className="ck-row save">
                    <div className="ck-row-label">Savings</div>
                    <span className="ck-row-value" style={{ color: g700 }}>−₹{savings.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {discountAmount > 0 && (
                  <div className="ck-row save">
                    <div className="ck-row-label">Coupon ({discountCode})</div>
                    <span className="ck-row-value" style={{ color: g700 }}>−₹{discountAmount}</span>
                  </div>
                )}
                {autoDiscountAmount > 0 && (
                  <>
                    {appliedOffers.map((o) => (
                      <div key={o.id} className="ck-row save">
                        <div className="ck-row-label">Store Offer ({o.title})</div>
                        <span className="ck-row-value" style={{ color: g700 }}>−₹{o.amount.toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </>
                )}
                {deliveryType === 'standard' ? (
                  <div className="ck-row">
                    <div className="ck-row-label">Shipping (Standard)</div>
                    <span className="ck-row-value">{shipping === 0 ? <span className="ck-free-badge">FREE</span> : `₹${shipping}`}</span>
                  </div>
                ) : (
                  <div className="ck-row">
                    <div className="ck-row-label"><Em c="⚡" /> Express Delivery</div>
                    <span className="ck-row-value">₹110</span>
                  </div>
                )}
                {isGift && activeGift && (
                  <div className="ck-row">
                    <div className="ck-row-label"><Em c="🎁" /> {activeGift.title}</div>
                    <span className="ck-row-value">₹{activeGift.price}</span>
                  </div>
                )}
                {(selectedMethod === 'COD' || selectedMethod === 'PARTIAL_COD') && (
                  <div className="ck-row">
                    <div className="ck-row-label">{selectedMethod === 'COD' ? 'COD Convenience Fee' : 'Partial COD Fee'}</div>
                    <span className="ck-row-value">+₹80</span>
                  </div>
                )}
                {userRewardPoints > 0 && (
                  <div className="ck-row" style={{ background: '#f8f4ed', padding: '12px 16px', borderBottom: '1px solid rgba(45,90,39,.12)', display: 'block' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#0f1a0f', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ color: '#d4af37' }}>✦</span> Redeem Sparkle Points
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 500, color: '#2d5a27', background: 'rgba(45,90,39,.1)', padding: '2px 6px', borderRadius: 4 }}>
                        Balance: {userRewardPoints}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input 
                        type="number" 
                        min="0" 
                        max={Math.min(userRewardPoints, baseTotal)}
                        value={pointsInput} 
                        onChange={(e) => setPointsInput(e.target.value)}
                        placeholder={`Up to ${Math.min(userRewardPoints, baseTotal)}`}
                        style={{ flex: 1, padding: '8px 12px', border: '1.5px solid #d9cdb8', borderRadius: 8, fontSize: 12, outline: 'none' }}
                      />
                      <button 
                        onClick={() => {
                          const parsedVal = parseInt(pointsInput, 10);
                          const val = Math.max(0, Math.min(isNaN(parsedVal) ? 0 : parsedVal, userRewardPoints, baseTotal));
                          setRewardPointsRedeemed(val);
                          setPointsInput(val.toString());
                        }}
                        style={{ background: '#2d5a27', color: 'white', border: 'none', borderRadius: 8, padding: '0 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                      >
                        Apply
                      </button>
                    </div>
                    {actualRedeemedPoints > 0 && (
                      <div style={{ fontSize: 11, color: '#2d5a27', marginTop: 8, fontWeight: 500 }}>
                        −₹{actualRedeemedPoints} will be deducted from your total.
                        <button 
                          onClick={() => { setRewardPointsRedeemed(0); setPointsInput(''); }} 
                          style={{ background: 'none', border: 'none', color: '#c0392b', marginLeft: 10, cursor: 'pointer', textDecoration: 'underline' }}
                        >Remove</button>
                      </div>
                    )}
                  </div>
                )}
                <div className="ck-row total">
                  <div className="ck-row-label" style={{ color: g900, fontWeight: 800 }}>Total</div>
                  <span className="ck-row-value">₹{finalTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {step === 1 ? (
                <>
                {stepError && <p className="ck-step-error ck-step-error--right" role="alert">{stepError}</p>}
                <button type="button" className="ck-pay-btn ck-cont-right" onClick={goToPayment}>
                  Continue to payment
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </button>
                </>
              ) : (
              <button className="ck-pay-btn ck-pay-inline" onClick={handlePay} disabled={!selectedMethod || loading}>
                {loading ? (
                  <><div className="ck-spinner" /> Processing…</>
                ) : (
                  <>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
                      <rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" />
                    </svg>
                    {selectedMethod === 'PARTIAL_COD' ? `Pay Advance ₹${amountToPayNow.toLocaleString('en-IN')}` : selectedMethod === 'COD' ? `Place Order · ₹${finalTotal.toLocaleString('en-IN')} on Delivery` : `Pay ₹${finalTotal.toLocaleString('en-IN')} Now`}
                  </>
                )}
              </button>
              )}

              <div className="ck-secure-note">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                100% Secure &amp; Encrypted Payment via PhonePe
              </div>
            </div>

          </div>

          {/* Mobile: the main action is always one tap away */}
          <div className="ck-sticky">
            <div className="ck-sticky-total">
              <small>{step === 1 ? 'Total' : selectedMethod === 'PARTIAL_COD' ? 'Pay now' : 'Total'}</small>
              <b>₹{(step === 2 && selectedMethod === 'PARTIAL_COD' ? amountToPayNow : finalTotal).toLocaleString('en-IN')}</b>
            </div>
            {step === 1 ? (
              <button type="button" className="ck-pay-btn" onClick={goToPayment}>
                Continue to payment
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </button>
            ) : (
              <button type="button" className="ck-pay-btn" onClick={handlePay} disabled={!selectedMethod || loading}>
                {loading ? (<><div className="ck-spinner" /> Processing…</>) : (selectedMethod === 'COD' ? 'Place order' : selectedMethod === 'PARTIAL_COD' ? 'Pay advance' : 'Pay now')}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   Address picker + form (used for both shipping and billing)
───────────────────────────────────────────────────────────── */
type AddrForm = { name: string; addressLine1: string; addressLine2: string; landmark: string; city: string; state: string; pincode: string; phone: string; alternativePhone: string };

function AddressSection({
  title, errorId, addresses, userName, selected, onSelect, showForm, setShowForm, form, setForm, busy, error, onSave, footer, radioName = 'address',
}: {
  title: string; errorId: string; addresses: NonNullable<AuthUser['addresses']>; userName?: string;
  selected: number; onSelect: (i: number) => void; showForm: boolean; setShowForm: (v: boolean) => void;
  form: AddrForm; setForm: (f: AddrForm) => void; busy: boolean; error: string; onSave: () => void;
  footer?: React.ReactNode; radioName?: string;
}) {
  const set = (k: keyof AddrForm) => (v: string) => setForm({ ...form, [k]: v });
  const digits = (v: string) => v.replace(/\D/g, '');
  return (
    <section className="ck2" aria-label={title}>
      <h2 className="ck-col-title">{title}</h2>
      <div className="ck2-card">
        {addresses.length > 0 ? (
          <div className="ck2-list" role="radiogroup" aria-label={title}>
            {addresses.map((addr, idx) => (
              <label key={addr._id ?? idx} className={`ck2-addr${selected === idx && !showForm ? ' on' : ''}`}>
                <input type="radio" name={radioName} checked={selected === idx} onChange={() => onSelect(idx)} />
                <span className="ck2-dot" aria-hidden="true" />
                <span className="ck2-addr-body">
                  <span className="ck2-addr-name">{addr.name || userName || 'Customer'}</span>
                  <span className="ck2-addr-line">
                    {[addr.addressLine1 || addr.fullAddress, addr.addressLine2].filter(Boolean).join(', ')}
                  </span>
                  <span className="ck2-addr-line">{[addr.city, addr.state].filter(Boolean).join(', ')}{addr.pincode ? ` - ${addr.pincode}` : ''}</span>
                  {addr.phone && <span className="ck2-addr-phone">Phone: {addr.phone}</span>}
                </span>
              </label>
            ))}
          </div>
        ) : !showForm ? (
          <p className="ck2-empty">You haven&apos;t saved an address yet.</p>
        ) : null}

        {!showForm ? (
          <button type="button" className="ck2-add" onClick={() => setShowForm(true)}>
            <span aria-hidden="true">+</span> {addresses.length ? 'Add a new address' : 'Add your address'}
          </button>
        ) : (
          <div className="ck2-form">
            <h3 className="ck2-form-title">New address</h3>
            {error && <div id={errorId} className="ck2-error" role="alert">{error}</div>}
            <div className="ck2-grid">
              <label className="ck2-f">
                <span>Full name *</span>
                <input autoComplete="name" value={form.name} onChange={(e) => set('name')(e.target.value)} placeholder="Recipient's name" />
              </label>
              <label className="ck2-f">
                <span>Phone *</span>
                <div className="ck2-phone"><i>+91</i>
                  <input autoComplete="tel-national" inputMode="numeric" maxLength={10} value={form.phone} onChange={(e) => set('phone')(digits(e.target.value))} placeholder="10-digit mobile number" />
                </div>
              </label>
              <label className="ck2-f ck2-full">
                <span>Address line 1 *</span>
                <input autoComplete="address-line1" value={form.addressLine1} onChange={(e) => set('addressLine1')(e.target.value)} placeholder="House no., building, street" />
              </label>
              <label className="ck2-f">
                <span>Area / locality <em>(optional)</em></span>
                <input autoComplete="address-line2" value={form.addressLine2} onChange={(e) => set('addressLine2')(e.target.value)} />
              </label>
              <label className="ck2-f">
                <span>Landmark <em>(optional)</em></span>
                <input value={form.landmark} onChange={(e) => set('landmark')(e.target.value)} placeholder="Near…" />
              </label>
              <label className="ck2-f">
                <span>Pincode *</span>
                <input id={errorId === 'ck-pincode-error-banner' ? 'ck-pincode-input' : undefined} autoComplete="postal-code" inputMode="numeric" maxLength={6} value={form.pincode} onChange={(e) => set('pincode')(digits(e.target.value))} placeholder="6 digits" />
              </label>
              <label className="ck2-f">
                <span>City *</span>
                <input autoComplete="address-level2" value={form.city} onChange={(e) => set('city')(e.target.value)} />
              </label>
              <label className="ck2-f ck2-full">
                <span>State *</span>
                <select autoComplete="address-level1" value={form.state} onChange={(e) => set('state')(e.target.value)}>
                  <option value="">Select state</option>
                  {form.state && !(INDIAN_STATES as readonly string[]).includes(form.state) && <option value={form.state}>{form.state}</option>}
                  {INDIAN_STATES.map((st) => <option key={st} value={st}>{st}</option>)}
                </select>
              </label>
              <label className="ck2-f ck2-full">
                <span>Alternative phone <em>(optional)</em></span>
                <div className="ck2-phone"><i>+91</i>
                  <input inputMode="numeric" maxLength={10} value={form.alternativePhone} onChange={(e) => set('alternativePhone')(digits(e.target.value))} />
                </div>
              </label>
            </div>
            <div className="ck2-actions">
              <button type="button" className="ck2-btn ck2-btn--ghost" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="button" className="ck2-btn" onClick={onSave} disabled={busy}>{busy ? 'Saving…' : 'Save address'}</button>
            </div>
          </div>
        )}
        {footer}
      </div>
    </section>
  );
}
