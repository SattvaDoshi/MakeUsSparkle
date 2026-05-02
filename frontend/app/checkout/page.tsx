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
  { id: 'COD', label: 'Cash on Delivery', sub: 'Pay when your order arrives', badge: null },
];

export default function CheckoutPage() {
  const {
    state, savings, shipping, total,
    itemCount, toggleGift, clearCart
  } = useCart();

  const { items, isGift, discountCode, discountAmount } = state;

  const [selectedMethod, setSelectedMethod] = useState('ONLINE');
  const [partialPercentage, setPartialPercentage] = useState<25 | 50>(25);
  const [loading, setLoading]               = useState(false);
  const [orderPlaced, setOrderPlaced]       = useState(false);
  
  const { user, refreshUser } = useAuth();
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({
    fullAddress: '',
    city: '',
    state: '',
    pincode: ''
  });
  const [addressBusy, setAddressBusy] = useState(false);

  const finalTotal = total;
  let amountToPayNow = finalTotal;
  if (selectedMethod === 'PARTIAL_COD') {
    amountToPayNow = Math.round(finalTotal * (partialPercentage / 100));
  } else if (selectedMethod === 'COD') {
    amountToPayNow = 0;
  }

  // Load Razorpay script dynamically
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  const handleSaveAddress = async () => {
    if (!addressForm.fullAddress || !addressForm.city || !addressForm.state || !addressForm.pincode) {
      alert("Please fill all address fields.");
      return;
    }
    setAddressBusy(true);
    try {
      const addresses = [...(user?.addresses || []), addressForm];
      await apiRequest('/users/profile', {
        method: 'PUT',
        body: JSON.stringify({ addresses })
      });
      await refreshUser();
      setShowAddressForm(false);
      setSelectedAddressIndex(addresses.length - 1);
      setAddressForm({ fullAddress: '', city: '', state: '', pincode: '' });
    } catch (err) {
      console.error(err);
      alert("Failed to save address.");
    } finally {
      setAddressBusy(false);
    }
  };

  const handlePay = useCallback(async () => {
    if (!selectedMethod) return;

    let currentAddress = null;
    if (user?.addresses && user.addresses.length > 0) {
      currentAddress = user.addresses[selectedAddressIndex];
    }

    if (!currentAddress) {
      alert("Please add a shipping address.");
      return;
    }

    setLoading(true);
    
    try {
      const orderPayload = {
        amount: amountToPayNow,
        totalAmount: finalTotal,
        advanceAmount: amountToPayNow,
        balanceAmount: Math.max(finalTotal - amountToPayNow, 0),
        paymentMode: selectedMethod,
        items: items.map(item => {
          // Check if item.id is a valid 24-char hex string
          const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(item.id);
          const mappedProduct = (!item.id.startsWith('custom-') && isValidObjectId) ? item.id : undefined;
          
          return {
            product: mappedProduct,
            name: item.name,
            quantity: item.qty,
            price: item.price,
            customNote: item.customNote,
            customImages: item.customImages,
            selectedCharms: item.selectedCharms?.map((c: { id?: string; _id?: string } | string) => {
              if (typeof c === 'string') return c;
              return c.id || c._id || c;
            }),
          };
        }),
        shippingAddress: currentAddress,
        isGift: isGift,
        giftMessage: state.giftMessage,
      };

      if (selectedMethod === 'ONLINE' || selectedMethod === 'PARTIAL_COD') {
        // Online Payment via Razorpay
        const rzpOrder = await apiRequest<{ success: boolean, orderId: string, razorpayOrderId: string, amount: number, currency: string }>('/payment/create-order', {
          method: 'POST',
          body: JSON.stringify(orderPayload)
        });

        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_RmCmc4bECn3PRU", // Fallback if env is missing
          amount: rzpOrder.amount * 100,
          currency: rzpOrder.currency,
          name: "MakeUsSparkle",
          description: "Order Payment",
          order_id: rzpOrder.razorpayOrderId,
          handler: async function (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) {
            try {
              setLoading(true);
              await apiRequest('/payment/verify', {
                method: 'POST',
                body: JSON.stringify({
                  orderId: rzpOrder.orderId,
                  razorpayOrderId: response.razorpay_order_id,
                  paymentId: response.razorpay_payment_id,
                  signature: response.razorpay_signature,
                  paymentMode: selectedMethod,
                })
              });
              clearCart();
              setOrderPlaced(true);
            } catch (err) {
              console.error("Verification failed:", err);
              alert("Payment verification failed. Please contact support.");
            } finally {
              setLoading(false);
            }
          },
          prefill: {
            name: user?.name || "",
            email: user?.email || "",
            contact: user?.phone || ""
          },
          theme: {
            color: "#2d5a27"
          }
        };

        const razorpayClass = (window as unknown as { Razorpay: new (opts: object) => { on: (event: string, handler: (res: { error: { description: string } }) => void) => void; open: () => void } }).Razorpay;
        const rzp = new razorpayClass(options);
        rzp.on('payment.failed', function (response: { error: { description: string } }) {
          console.error(response.error);
          alert("Payment failed: " + response.error.description);
          setLoading(false);
        });
        rzp.open();

      } else {
        // COD Order
        await apiRequest('/orders/create', {
          method: 'POST',
          body: JSON.stringify(orderPayload)
        });
        
        clearCart();
        setOrderPlaced(true);
      }
    } catch (err) {
      console.error("Order failed:", err);
      alert("Failed to place order. Please try again.");
      setLoading(false);
    }
  }, [selectedMethod, items, finalTotal, amountToPayNow, isGift, state.giftMessage, clearCart, user, selectedAddressIndex]);

  // Success screen
  if (orderPlaced) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400&family=DM+Sans:wght@300;400;500;600&display=swap');
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

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=DM+Sans:wght@300;400;500;600&display=swap');

        :root {
          --g900: #1a3a1a;
          --g800: #1e4d1e;
          --g700: #2d5a27;
          --g600: #3a7a32;
          --g500: #4a9e40;
          --g400: #6abf5e;
          --g100: #e8f5e9;
          --g50:  #f0f7f0;
          --beige:     #f5f0e8;
          --beige-mid: #ede7d9;
          --beige-drk: #cfc6b0;
          --ink:   #1a2a1a;
          --mist:  rgba(26,42,26,.42);
          --border: rgba(45,90,39,.13);
          --white: #ffffff;
          --red:   #b5341c;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .ck-root {
          min-height: 100vh;
          background: var(--beige);
          font-family: 'DM Sans', sans-serif;
          color: var(--ink);
          margin-top: 60px;
        }

        .ck-savings-strip {
          background: #e5f4e0;
          padding: 9px 20px;
          font-size: 12px; color: var(--g700); font-weight: 600;
          border-bottom: 1px solid rgba(45,90,39,.09);
          display: flex; align-items: center; gap: 6px; justify-content: center;
        }

        .ck-body {
          padding: 20px 16px 48px;
          max-width: 1060px; margin: 0 auto;
        }
        @media (min-width: 768px)  { .ck-body { padding: 32px 32px 60px; } }
        @media (min-width: 1024px) { .ck-body { padding: 40px 48px 60px; } }

        .ck-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
        }
        @media (min-width: 768px) {
          .ck-layout { grid-template-columns: 1fr 360px; align-items: start; }
        }
        @media (min-width: 1024px) {
          .ck-layout { grid-template-columns: 1fr 400px; gap: 28px; }
        }

        .ck-col-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px; font-weight: 500; letter-spacing: .08em;
          color: var(--g900); margin-bottom: 14px;
        }

        .ck-panel {
          background: var(--white);
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid var(--border);
          box-shadow: 0 2px 14px rgba(45,90,39,.07);
          margin-bottom: 14px;
          animation: ckUp .35s ease both;
        }
        @keyframes ckUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ck-panel-head {
          padding: 12px 20px 10px;
          font-size: 9px; letter-spacing: .44em; text-transform: uppercase;
          color: var(--mist); font-weight: 600;
          border-bottom: 1px solid var(--border);
          background: var(--beige);
        }

        .ck-method {
          display: flex; align-items: flex-start; gap: 14px;
          padding: 15px 20px;
          border-bottom: 1px solid var(--border);
          cursor: pointer; transition: background .15s; position: relative;
        }
        .ck-method:last-child { border-bottom: none; }
        .ck-method:hover  { background: var(--beige); }
        .ck-method.active { background: #eaf5ea; }

        .ck-method-body { flex: 1; min-width: 0; }
        .ck-method-label { font-size: 14px; font-weight: 600; color: var(--ink); margin-bottom: 4px; display: flex; align-items: center; gap: 8px; }
        .ck-method-sub   { font-size: 12px; color: var(--mist); line-height: 1.4; }
        .ck-method-badge {
          font-size: 8px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase;
          color: white; background: var(--g600); padding: 2px 7px; border-radius: 4px;
        }

        .ck-radio {
          width: 20px; height: 20px; border-radius: 50%;
          border: 2px solid var(--border); flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          transition: all .2s; margin-top: 2px;
        }
        .ck-method.active .ck-radio { border-color: var(--g600); background: var(--g600); }
        .ck-method.active .ck-radio::after {
          content: ''; width: 8px; height: 8px; border-radius: 50%; background: white;
        }

        .ck-cod-note {
          padding: 12px 20px;
          background: rgba(181,52,28,.05); border-bottom: 1px solid rgba(181,52,28,.15);
          font-size: 12px; color: #8b2e21; line-height: 1.6;
        }
        .ck-cod-note strong { font-weight: 700; }

        .ck-partial-options {
          display: flex; gap: 10px; margin-top: 10px;
        }
        .ck-partial-btn {
          flex: 1; padding: 8px; border: 1.5px solid var(--border); border-radius: 8px;
          background: var(--white); cursor: pointer; text-align: center;
          font-size: 13px; font-weight: 600; color: var(--ink); transition: all 0.2s;
        }
        .ck-partial-btn.active {
          border-color: var(--g600); background: var(--g50); color: var(--g700);
        }

        .ck-gift {
          display: flex; align-items: center; gap: 14px;
          padding: 16px 20px; cursor: pointer; transition: background .15s;
        }
        .ck-gift:hover { background: var(--beige); }
        .ck-gift-body { flex: 1; }
        .ck-gift-title { font-size: 13px; font-weight: 600; color: var(--ink); margin-bottom: 2px; }
        .ck-gift-sub   { font-size: 11px; color: var(--mist); }
        .ck-gift-price { font-size: 13px; font-weight: 700; color: var(--g700); flex-shrink: 0; }
        .ck-gift-check {
          width: 22px; height: 22px; border-radius: 50%;
          border: 2px solid var(--border);
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; transition: all .22s; flex-shrink: 0;
        }
        .ck-gift-check.on { background: var(--g600); border-color: var(--g600); color: white; }

        .ck-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 12px 20px; font-size: 13px; color: var(--mist);
          border-bottom: 1px solid var(--border);
        }
        .ck-row:last-child { border-bottom: none; }
        .ck-row span:last-child { font-weight: 500; color: var(--ink); }
        .ck-row.total {
          font-size: 15px; font-weight: 700; color: var(--g900);
          background: var(--beige);
        }
        .ck-row.total span:last-child { font-size: 18px; font-weight: 800; color: var(--g900); }
        .ck-row.save { color: var(--g700); font-weight: 600; }
        .ck-free {
          background: var(--g600); color: white;
          font-size: 9px; font-weight: 700; padding: 2px 8px; border-radius: 4px;
          text-transform: uppercase; letter-spacing: .1em;
        }

        .ck-pay-btn {
          display: flex; align-items: center; justify-content: center; gap: 10px;
          width: 100%; padding: 18px;
          background: linear-gradient(135deg, var(--g700), var(--g800));
          color: white; border: none; border-radius: 14px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase;
          cursor: pointer;
          box-shadow: 0 6px 28px rgba(45,90,39,.26);
          transition: all .22s; margin-top: 4px;
        }
        .ck-pay-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, var(--g600), var(--g700));
          transform: translateY(-1px);
          box-shadow: 0 8px 32px rgba(45,90,39,.32);
        }
        .ck-pay-btn:disabled { opacity: .45; cursor: not-allowed; }

        .ck-spinner {
          width: 18px; height: 18px; border-radius: 50%;
          border: 2px solid rgba(255,255,255,.3); border-top-color: white;
          animation: spin .7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .ck-secure-note {
          display: flex; align-items: center; justify-content: center; gap: 5px;
          font-size: 10px; color: var(--mist); margin-top: 10px;
          font-weight: 500; letter-spacing: .05em;
        }
      `}</style>

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

            {/* LEFT COLUMN */}
            <div>
              <p className="ck-col-title">Shipping Address</p>
              <div className="ck-panel" style={{ animationDelay: '0s', padding: 20 }}>
                {user?.addresses && user.addresses.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: showAddressForm ? 16 : 0 }}>
                    {user.addresses.map((addr, idx) => (
                      <label key={idx} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer', padding: 12, border: selectedAddressIndex === idx ? '2px solid var(--g600)' : '1.5px solid var(--border)', borderRadius: 10, background: selectedAddressIndex === idx ? '#eaf5ea' : 'transparent' }}>
                        <input type="radio" name="address" checked={selectedAddressIndex === idx} onChange={() => { setSelectedAddressIndex(idx); setShowAddressForm(false); }} style={{ marginTop: 4 }} />
                        <div style={{ fontSize: 13, color: 'var(--ink)' }}>
                          <div style={{ fontWeight: 600, marginBottom: 4 }}>{user.name}</div>
                          <div>{addr.fullAddress}</div>
                          <div>{addr.city}, {addr.state} - {addr.pincode}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: 13, color: 'var(--mist)', marginBottom: 16 }}>No saved addresses.</div>
                )}
                
                {!showAddressForm ? (
                  <button onClick={() => setShowAddressForm(true)} style={{ background: 'none', border: '1.5px dashed var(--g500)', color: 'var(--g700)', padding: 12, borderRadius: 8, cursor: 'pointer', width: '100%', fontSize: 13, fontWeight: 600 }}>
                    + Add New Address
                  </button>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <input placeholder="Full Address" value={addressForm.fullAddress} onChange={e => setAddressForm({...addressForm, fullAddress: e.target.value})} style={{ padding: 10, borderRadius: 8, border: '1px solid var(--border)', fontFamily: 'inherit', fontSize: 13 }} />
                    <div style={{ display: 'flex', gap: 10 }}>
                      <input placeholder="City" value={addressForm.city} onChange={e => setAddressForm({...addressForm, city: e.target.value})} style={{ padding: 10, borderRadius: 8, border: '1px solid var(--border)', fontFamily: 'inherit', fontSize: 13, flex: 1 }} />
                      <input placeholder="State" value={addressForm.state} onChange={e => setAddressForm({...addressForm, state: e.target.value})} style={{ padding: 10, borderRadius: 8, border: '1px solid var(--border)', fontFamily: 'inherit', fontSize: 13, width: 80 }} />
                      <input placeholder="Pincode" value={addressForm.pincode} onChange={e => setAddressForm({...addressForm, pincode: e.target.value})} style={{ padding: 10, borderRadius: 8, border: '1px solid var(--border)', fontFamily: 'inherit', fontSize: 13, width: 100 }} />
                    </div>
                    <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                      <button onClick={() => setShowAddressForm(false)} style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer' }}>Cancel</button>
                      <button onClick={handleSaveAddress} disabled={addressBusy} style={{ flex: 1, padding: 10, borderRadius: 8, border: 'none', background: 'var(--g700)', color: 'white', fontWeight: 600, cursor: 'pointer' }}>{addressBusy ? 'Saving...' : 'Save Address'}</button>
                    </div>
                  </div>
                )}
              </div>

              <p className="ck-col-title" style={{ marginTop: 24 }}>Payment Options</p>
              <div className="ck-panel" style={{ animationDelay: '.08s' }}>
                <div className="ck-panel-head">Select Payment Method</div>

                {PAYMENT_METHODS.map(method => {
                  const isActive = selectedMethod === method.id;

                  return (
                    <div key={method.id}>
                      <div className={`ck-method${isActive ? ' active' : ''}`} onClick={() => setSelectedMethod(method.id)}>
                        <div className="ck-radio" />
                        <div className="ck-method-body">
                          <div className="ck-method-label">
                            {method.label}
                            {method.badge && <span className="ck-method-badge">{method.badge}</span>}
                          </div>
                          <div className="ck-method-sub">{method.sub}</div>
                          
                          {isActive && method.id === 'PARTIAL_COD' && (
                            <div className="ck-partial-options" onClick={e => e.stopPropagation()}>
                              <button 
                                className={`ck-partial-btn ${partialPercentage === 25 ? 'active' : ''}`}
                                onClick={() => setPartialPercentage(25)}
                              >
                                Pay 25% Advance
                              </button>
                              <button 
                                className={`ck-partial-btn ${partialPercentage === 50 ? 'active' : ''}`}
                                onClick={() => setPartialPercentage(50)}
                              >
                                Pay 50% Advance
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {isActive && method.id === 'PARTIAL_COD' && (
                        <div className="ck-cod-note">
                          Pay <strong>₹{Math.round(finalTotal * (partialPercentage / 100)).toLocaleString('en-IN')} now</strong> via Razorpay.<br/>
                          The balance of <strong>₹{(finalTotal - Math.round(finalTotal * (partialPercentage / 100))).toLocaleString('en-IN')}</strong> will be collected on delivery.
                        </div>
                      )}
                      
                      {isActive && method.id === 'COD' && (
                        <div className="ck-cod-note">
                          Pay the full amount of <strong>₹{finalTotal.toLocaleString('en-IN')}</strong> in cash or UPI when your order arrives.
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="ck-panel" style={{ animationDelay: '.14s' }}>
                <div className="ck-gift" onClick={() => toggleGift()} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && toggleGift()}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={isGift ? '#2d5a27' : '#7a9e75'} strokeWidth="1.6">
                    <rect x="3" y="8" width="18" height="14" rx="2"/>
                    <path d="M12 8V22M3 13h18" strokeLinecap="round"/>
                    <path d="M8 8c0-2.2 1.8-4 4-4s4 1.8 4 4" strokeLinecap="round"/>
                  </svg>
                  <div className="ck-gift-body">
                    <div className="ck-gift-title">Make it a Gift</div>
                    <div className="ck-gift-sub">Premium gift wrap + personalised note</div>
                  </div>
                  <div className="ck-gift-price">+₹{GIFT_CHARGE}</div>
                  <div className={`ck-gift-check${isGift ? ' on' : ''}`}>{isGift ? '✓' : ''}</div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div>
              <p className="ck-col-title">Order Summary</p>

              <div className="ck-panel" style={{ animationDelay: '.18s' }}>
                <div className="ck-panel-head">{itemCount} Item{itemCount !== 1 ? 's' : ''}</div>

                {items.map(item => (
                  <div key={`${item.id}-${item.colorHex}`}>
                    <div className="ck-row">
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 11, color: 'var(--mist)', flexShrink: 0 }}>×{item.qty}</span>
                        {item.name}
                      </span>
                      <span>₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
                    </div>
                    {item.selectedCharms && item.selectedCharms.length > 0 && (
                      <div style={{ padding: '4px 20px 10px', display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {item.selectedCharms.map((charm: { id?: string; _id?: string; name?: string; price?: number; emoji?: string }, idx: number) => (
                          <div key={charm.id || charm._id || idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--mist)' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <span>{charm.emoji || '◈'}</span> {charm.name}
                            </span>
                            <span style={{ fontWeight: 500 }}>₹{(charm.price || 0).toLocaleString('en-IN')}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {savings > 0 && (
                  <div className="ck-row save">
                    <span>Savings</span>
                    <span style={{ color: 'var(--g700)' }}>−₹{savings.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {discountAmount > 0 && (
                  <div className="ck-row save">
                    <span>Coupon ({discountCode})</span>
                    <span style={{ color: 'var(--g700)' }}>−₹{discountAmount}</span>
                  </div>
                )}

                <div className="ck-row">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? <span className="ck-free">FREE</span> : `₹${shipping}`}</span>
                </div>

                {isGift && (
                  <div className="ck-row">
                    <span>Gift wrap</span>
                    <span>₹{GIFT_CHARGE}</span>
                  </div>
                )}

                <div className="ck-row total">
                  <span>Total</span>
                  <span>₹{finalTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button
                className="ck-pay-btn"
                onClick={handlePay}
                disabled={!selectedMethod || loading}
              >
                {loading ? (
                  <><div className="ck-spinner" /> Processing…</>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                    </svg>
                    {selectedMethod === 'PARTIAL_COD' 
                      ? `Pay Advance ₹${amountToPayNow.toLocaleString('en-IN')}` 
                      : selectedMethod === 'COD' 
                        ? `Place Order (Pay ₹${finalTotal.toLocaleString('en-IN')} on Delivery)` 
                        : `Pay ₹${finalTotal.toLocaleString('en-IN')} Now`
                    }
                  </>
                )}
              </button>

              <div className="ck-secure-note">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
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