'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useCart, GIFT_CHARGE } from '@/lib/cartContext';
import { useAuth } from '@/lib/authContext';
import ExitIntent from '@/components/cart/ExitIntent';
import UpperNav from '@/components/ui/UpperNav';
import { apiRequest } from '@/lib/api';

const PAYMENT_METHODS = [
  { id: 'ONLINE', label: 'Pay Online in Full', sub: 'UPI, Credit/Debit Cards, NetBanking, Wallets via Razorpay', badge: 'Recommended' },
  { id: 'PARTIAL_COD', label: 'Partial COD', sub: 'Pay a portion now, balance on delivery', badge: null },
  { id: 'COD', label: 'Cash on Delivery', sub: 'Pay when your order arrives · +₹70 convenience fee', badge: null },
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

export default function CheckoutPage() {
  const { state, savings, shipping, total, itemCount, toggleGift, clearCart } = useCart();
  const { items, isGift, discountCode, discountAmount } = state;

  const [selectedMethod, setSelectedMethod] = useState('ONLINE');
  const [partialPercentage, setPartialPercentage] = useState<25 | 50>(25);
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [showExpressPopup, setShowExpressPopup] = useState(false);
  const [deliveryType, setDeliveryType] = useState<'standard' | 'express'>('standard');

  const { user, refreshUser } = useAuth();
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({ fullAddress: '', city: '', state: '', pincode: '' });
  const [addressBusy, setAddressBusy] = useState(false);

  const CHECKOUT_GIFT_OPTIONS = [
    { id: 'classic', title: 'Classic Gift Wrap', sub: 'Kraft paper & satin ribbon', price: 25, image: '/smallerBox.png' },
    { id: 'luxury', title: 'Luxury Gift Hamper', sub: 'Ideal for 4+ products', price: 250, image: '/Biggerbox.jpg' },
  ];
  const [selectedGiftId, setSelectedGiftId] = useState<string | null>(null);
  const [checkoutGiftMsg, setCheckoutGiftMsg] = useState('');
  const activeCheckoutGift = CHECKOUT_GIFT_OPTIONS.find(g => g.id === selectedGiftId) ?? null;
  const giftCharge = activeCheckoutGift?.price ?? 0;
  const deliveryCharge = deliveryType === 'express' ? 110 : 0;
  const codCharge = selectedMethod === 'COD' ? 70 : 0;

  const finalTotal = total + deliveryCharge + giftCharge + codCharge;
  let amountToPayNow = finalTotal;
  if (selectedMethod === 'PARTIAL_COD') amountToPayNow = Math.round(finalTotal * (partialPercentage / 100));
  else if (selectedMethod === 'COD') amountToPayNow = 0;

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  const handleDeliveryTypeChange = (id: 'standard' | 'express') => {
    if (id === 'express') {
      setShowExpressPopup(true);
      if (selectedMethod === 'COD') setSelectedMethod('PARTIAL_COD');
    }
    setDeliveryType(id);
  };

  const handleSaveAddress = async () => {
    if (!addressForm.fullAddress || !addressForm.city || !addressForm.state || !addressForm.pincode) {
      alert('Please fill all address fields.'); return;
    }
    setAddressBusy(true);
    try {
      const addresses = [...(user?.addresses || []), addressForm];
      await apiRequest('/users/profile', { method: 'PUT', body: JSON.stringify({ addresses }) });
      await refreshUser();
      setShowAddressForm(false);
      setSelectedAddressIndex(addresses.length - 1);
      setAddressForm({ fullAddress: '', city: '', state: '', pincode: '' });
    } catch (err) { console.error(err); alert('Failed to save address.'); }
    finally { setAddressBusy(false); }
  };

  const handlePay = useCallback(async () => {
    if (!selectedMethod) return;
    const currentAddress = user?.addresses?.[selectedAddressIndex] ?? null;
    if (!currentAddress) { alert('Please add a shipping address.'); return; }
    setLoading(true);
    try {
      const orderPayload = {
        amount: amountToPayNow, totalAmount: finalTotal, advanceAmount: amountToPayNow,
        balanceAmount: Math.max(finalTotal - amountToPayNow, 0), paymentMode: selectedMethod,
        items: items.map(item => {
          const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(item.id);
          const mappedProduct = (!item.id.startsWith('custom-') && isValidObjectId) ? item.id : undefined;
          const selectedCharms = item.selectedCharms?.map((c: { id?: string; _id?: string } | string) => {
            if (typeof c === 'string') return c;
            return c.id || c._id || '';
          }).filter(Boolean);
          const selectionGroups = item.selectionGroups || (item.selectedCharms?.length ? [{
            type: 'multi_item_selection', category: item.category || item.sourceId, label: item.name,
            selectionKey: 'selectedCharms', itemRefModel: 'CharmItem',
            items: item.selectedCharms.map((c) => {
              const fallbackCharmPrice = item.selectedCharms?.length ? item.price / item.selectedCharms.length : 0;
              if (typeof c === 'string') return { id: c, quantity: 1, price: fallbackCharmPrice };
              return { id: c.id, sourceId: c.sourceId, name: c.name, quantity: c.quantity || 1,
                price: typeof c.price === 'number' && Number.isFinite(c.price) ? c.price : fallbackCharmPrice,
                image: c.image, images: c.images, emoji: c.emoji, customText: c.customText, customData: c.customData };
            }),
          }] : undefined);
          return { product: mappedProduct, sourceId: item.sourceId, name: item.name, category: item.category,
            quantity: item.qty, price: item.price, color: item.color, colorHex: item.colorHex, size: item.size, sku: item.sku, customNote: item.customNote, customImages: item.customImages,
            selectedCharms, selectionGroups };
        }),
        shippingAddress: currentAddress, isGift, giftMessage: state.giftMessage,
      };
      if (selectedMethod === 'ONLINE' || selectedMethod === 'PARTIAL_COD') {
        const rzpOrder = await apiRequest<{ success: boolean; orderId: string; razorpayOrderId: string; amount: number; currency: string }>('/payment/create-order', { method: 'POST', body: JSON.stringify(orderPayload) });
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_RmCmc4bECn3PRU',
          amount: rzpOrder.amount * 100, currency: rzpOrder.currency, name: 'MakeUsSparkle',
          description: 'Order Payment', order_id: rzpOrder.razorpayOrderId,
          handler: async function (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) {
            try {
              setLoading(true);
              await apiRequest('/payment/verify', { method: 'POST', body: JSON.stringify({ orderId: rzpOrder.orderId, razorpayOrderId: response.razorpay_order_id, paymentId: response.razorpay_payment_id, signature: response.razorpay_signature, paymentMode: selectedMethod }) });
              clearCart(); setOrderPlaced(true);
            } catch (err) { console.error('Verification failed:', err); alert('Payment verification failed. Please contact support.'); }
            finally { setLoading(false); }
          },
          prefill: { name: user?.name || '', email: user?.email || '', contact: user?.phone || '' },
          theme: { color: '#2d5a27' },
        };
        const razorpayClass = (window as unknown as { Razorpay: new (opts: object) => { on: (e: string, h: (r: { error: { description: string } }) => void) => void; open: () => void } }).Razorpay;
        const rzp = new razorpayClass(options);
        rzp.on('payment.failed', function (response: { error: { description: string } }) { console.error(response.error); alert('Payment failed: ' + response.error.description); setLoading(false); });
        rzp.open();
      } else {
        await apiRequest('/orders/create', { method: 'POST', body: JSON.stringify(orderPayload) });
        clearCart(); setOrderPlaced(true);
      }
    } catch (err) { console.error('Order failed:', err); alert('Failed to place order. Please try again.'); setLoading(false); }
  }, [selectedMethod, items, finalTotal, amountToPayNow, isGift, state.giftMessage, clearCart, user, selectedAddressIndex]);

  if (orderPlaced) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400&family=DM+Sans:wght@400;500;600;700&display=swap');
          .ck-s{min-height:100vh;background:#f5f0e8;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 24px;font-family:'DM Sans',sans-serif;text-align:center}
          .ck-s-icon{font-size:64px;margin-bottom:20px;animation:pop .5s cubic-bezier(.34,1.56,.64,1)}
          @keyframes pop{from{transform:scale(0);opacity:0}to{transform:scale(1);opacity:1}}
          .ck-s-title{font-family:'Cormorant Garamond',serif;font-size:36px;font-weight:300;color:#1a3a1a;margin-bottom:8px}
          .ck-s-sub{font-size:14px;color:rgba(26,58,26,.6);line-height:1.7;margin-bottom:32px;max-width:320px}
          .ck-s-btn{padding:14px 40px;background:#2d5a27;color:white;border:none;border-radius:50px;font-family:'DM Sans',sans-serif;font-size:11px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;cursor:pointer;text-decoration:none;display:inline-block}
        `}</style>
        <div className="ck-s">
          <div className="ck-s-icon">✅</div>
          <h1 className="ck-s-title">Order Placed!</h1>
          <p className="ck-s-sub">Your order is confirmed. You&apos;ll receive a confirmation email shortly.</p>
          <Link href="/shop" className="ck-s-btn">Continue Shopping</Link>
        </div>
      </>
    );
  }

  const handleCheckoutGiftSelect = (id: string) => {
    if (selectedGiftId === id) { setSelectedGiftId(null); if (isGift) toggleGift(); }
    else { setSelectedGiftId(id); if (!isGift) toggleGift(); }
  };

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

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=DM+Sans:wght@400;500;600;700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .ck-root {
          min-height: 100vh;
          background: #f5f0e8;
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
            <div className="ck-popup-icon">⚡</div>
            <h2 className="ck-popup-title">Express Delivery</h2>
            <p className="ck-popup-body">
              Delivered in <strong>2–3 days</strong> (Metro) or <strong>3–4 days</strong> (Rest of India) at <strong>₹110</strong>.
            </p>
            <div className="ck-popup-avail">
              <p className="ck-popup-avail-title">Available payment methods</p>
              <div className="ck-popup-avail-row">
                <span className="ck-popup-avail-dot" />
                Online Payment — Pay in full via Razorpay
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
        <UpperNav />

        {savings > 0 && (
          <div className="ck-savings-strip">
            🎉 You&apos;re saving <strong style={{ marginLeft: 3 }}>₹{savings.toLocaleString('en-IN')}</strong> on this order
          </div>
        )}

        <div className="ck-body">
          <div className="ck-layout">

            {/* ── LEFT COLUMN ── */}
            <div>
              <p className="ck-col-title">Shipping Address</p>
              <div className="ck-panel" style={{ animationDelay: '0s', padding: 16 }}>
                {user?.addresses && user.addresses.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: showAddressForm ? 14 : 0 }}>
                    {user.addresses.map((addr, idx) => (
                      <label key={idx} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer', padding: '11px 12px', borderRadius: 10, border: selectedAddressIndex === idx ? '2px solid #3a7a32' : '1.5px solid rgba(45,90,39,.15)', background: selectedAddressIndex === idx ? '#eaf5ea' : 'transparent', transition: 'background .15s, border-color .2s' }}>
                        <input type="radio" name="address" checked={selectedAddressIndex === idx} onChange={() => { setSelectedAddressIndex(idx); setShowAddressForm(false); }} style={{ marginTop: 3, flexShrink: 0 }} />
                        <div>
                          <div style={{ fontWeight: 700, marginBottom: 3, color: ink, fontSize: 13 }}>{user.name}</div>
                          <div style={{ color: ink2, fontSize: 12, lineHeight: 1.5, fontWeight: 500 }}>{addr.fullAddress}</div>
                          <div style={{ color: ink2, fontSize: 12, fontWeight: 500 }}>{addr.city}, {addr.state} - {addr.pincode}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: 13, color: ink2, marginBottom: 14, fontWeight: 600 }}>No saved addresses.</div>
                )}
                {!showAddressForm ? (
                  <button onClick={() => setShowAddressForm(true)} style={{ background: 'none', border: '1.5px dashed #4a9e40', color: g700, padding: '11px 12px', borderRadius: 8, cursor: 'pointer', width: '100%', fontSize: 13, fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>
                    + Add New Address
                  </button>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div className="ck-addr-grid">
                      <input className="ck-addr-input ck-addr-full" placeholder="Full Address (House No, Street, Area)" value={addressForm.fullAddress} onChange={e => setAddressForm({ ...addressForm, fullAddress: e.target.value })} />
                      <input className="ck-addr-input" placeholder="City" value={addressForm.city} onChange={e => setAddressForm({ ...addressForm, city: e.target.value })} />
                      <input className="ck-addr-input" placeholder="State" value={addressForm.state} onChange={e => setAddressForm({ ...addressForm, state: e.target.value })} />
                      <input className="ck-addr-input" placeholder="Pincode" value={addressForm.pincode} onChange={e => setAddressForm({ ...addressForm, pincode: e.target.value })} />
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
                      <button onClick={() => setShowAddressForm(false)} style={{ flex: 1, padding: '10px 8px', borderRadius: 8, border: '1px solid rgba(45,90,39,.15)', background: 'transparent', cursor: 'pointer', fontSize: 13, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, color: ink }}>Cancel</button>
                      <button onClick={handleSaveAddress} disabled={addressBusy} style={{ flex: 1, padding: '10px 8px', borderRadius: 8, border: 'none', background: g700, color: 'white', fontWeight: 800, cursor: 'pointer', fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>
                        {addressBusy ? 'Saving…' : 'Save Address'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <p className="ck-col-title" style={{ marginTop: 20 }}>Payment Options</p>
              <div className="ck-panel" style={{ animationDelay: '.08s' }}>
                <div className="ck-panel-head">Select Payment Method</div>
                {PAYMENT_METHODS.map(method => {
                  const isActive = selectedMethod === method.id;
                  const isDisabled = deliveryType === 'express' && method.id === 'COD';
                  return (
                    <div key={method.id}>
                      <div className={`ck-method${isActive ? ' active' : ''}${isDisabled ? ' ck-method-disabled' : ''}`} onClick={() => !isDisabled && setSelectedMethod(method.id)}>
                        <div className="ck-radio" />
                        <div className="ck-method-body">
                          <div className="ck-method-label">
                            {method.label}
                            {method.badge && <span className="ck-method-badge">{method.badge}</span>}
                            {isDisabled && <span className="ck-method-no-express">Not for Express</span>}
                          </div>
                          <div className="ck-method-sub">{method.sub}</div>
                          {isActive && method.id === 'PARTIAL_COD' && (
                            <div className="ck-partial-options" onClick={e => e.stopPropagation()}>
                              <button className={`ck-partial-btn${partialPercentage === 25 ? ' active' : ''}`} onClick={() => setPartialPercentage(25)}>Pay 25% Advance</button>
                              <button className={`ck-partial-btn${partialPercentage === 50 ? ' active' : ''}`} onClick={() => setPartialPercentage(50)}>Pay 50% Advance</button>
                            </div>
                          )}
                        </div>
                      </div>
                      {isActive && method.id === 'PARTIAL_COD' && (
                        <div className="ck-cod-note">
                          Pay <strong>₹{Math.round(finalTotal * (partialPercentage / 100)).toLocaleString('en-IN')} now</strong> via Razorpay. Balance of <strong>₹{(finalTotal - Math.round(finalTotal * (partialPercentage / 100))).toLocaleString('en-IN')}</strong> collected on delivery.
                        </div>
                      )}
                      {isActive && method.id === 'COD' && (
                        <div className="ck-cod-note">
                          Pay <strong>₹{(total + deliveryCharge + giftCharge).toLocaleString('en-IN')}</strong> + <strong>₹70 convenience fee</strong> in cash or UPI on delivery. Total: <strong>₹{finalTotal.toLocaleString('en-IN')}</strong>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <p className="ck-col-title" style={{ marginTop: 20 }}>Estimated Delivery</p>
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
                      <div className="ck-dc-icon">{opt.icon}</div>
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

                {/* Free shipping banner — full width inside panel */}
                <div className="ck-free-ship">
                  <span className="ck-free-ship-icon">🎁</span>
                  <span>Free Standard Shipping on orders above <strong>₹999</strong></span>
                </div>
              </div>

              {/* Gift Box Selector */}
              <div className="ck-panel" style={{ animationDelay: '.22s' }}>
                <div className="ck-panel-head">
                  <span>Make it a Gift</span>
                  <span style={{ fontSize: 9, fontStyle: 'italic', textTransform: 'none', letterSpacing: 0, color: ink2, fontWeight: 600 }}>optional</span>
                </div>
                <div className="ck-gift-cards">
                  {CHECKOUT_GIFT_OPTIONS.map(opt => {
                    const isSel = selectedGiftId === opt.id;
                    return (
                      <div key={opt.id} className={`ck-gift-card${isSel ? ' active' : ''}`} onClick={() => handleCheckoutGiftSelect(opt.id)} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && handleCheckoutGiftSelect(opt.id)} aria-pressed={isSel}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={opt.image} alt={opt.title} />
                        <div className="ck-gift-card-body">
                          <div className="ck-gift-card-title">{opt.title}</div>
                          <div className="ck-gift-card-sub">{opt.sub}</div>
                          <div className="ck-gift-card-price">+₹{opt.price}</div>
                        </div>
                        <div className="ck-gift-card-badge" aria-hidden="true">✓</div>
                      </div>
                    );
                  })}
                </div>
                {selectedGiftId && (
                  <div className="ck-gift-msg-wrap">
                    <textarea className="ck-gift-msg" placeholder="Write a gift message (optional)…" value={checkoutGiftMsg} onChange={e => setCheckoutGiftMsg(e.target.value)} maxLength={160} />
                  </div>
                )}
              </div>
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
                        <span className="ck-qty-badge">×{item.qty}</span>
                        <span className="ck-row-label-text">{item.name}</span>
                      </div>
                      <span className="ck-row-value">₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
                    </div>
                    {item.selectedCharms && item.selectedCharms.length > 0 && (
                      <div className="ck-charms">
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
                <div className="ck-row">
                  <div className="ck-row-label">Shipping</div>
                  <span className="ck-row-value">{shipping === 0 ? <span className="ck-free-badge">FREE</span> : `₹${shipping}`}</span>
                </div>
                {isGift && (
                  <div className="ck-row">
                    <div className="ck-row-label">Gift wrap</div>
                    <span className="ck-row-value">₹{GIFT_CHARGE}</span>
                  </div>
                )}
                {deliveryType === 'express' && (
                  <div className="ck-row">
                    <div className="ck-row-label">⚡ Express Delivery</div>
                    <span className="ck-row-value">+₹110</span>
                  </div>
                )}
                {activeCheckoutGift && (
                  <div className="ck-row">
                    <div className="ck-row-label">🎁 {activeCheckoutGift.title}</div>
                    <span className="ck-row-value">+₹{activeCheckoutGift.price}</span>
                  </div>
                )}
                {selectedMethod === 'COD' && (
                  <div className="ck-row">
                    <div className="ck-row-label">COD Convenience Fee</div>
                    <span className="ck-row-value">+₹70</span>
                  </div>
                )}
                <div className="ck-row total">
                  <div className="ck-row-label" style={{ color: g900, fontWeight: 800 }}>Total</div>
                  <span className="ck-row-value">₹{finalTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button className="ck-pay-btn" onClick={handlePay} disabled={!selectedMethod || loading}>
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

              <div className="ck-secure-note">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                100% Secure &amp; Encrypted Payment via Razorpay
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

