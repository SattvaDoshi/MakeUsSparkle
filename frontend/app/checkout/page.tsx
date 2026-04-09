'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useCart, GIFT_CHARGE } from '@/lib/cartContext';
import ExitIntent from '@/components/cart/ExitIntent';

// ─── UPI apps ─────────────────────────────────────────────────────────────────
const UPI_APPS = [
  { id: 'gpay',    label: 'Google Pay',  emoji: '🇬',  color: '#4285f4' },
  { id: 'phonepe', label: 'PhonePe',     emoji: '💜',  color: '#5f259f' },
  { id: 'paytm',   label: 'Paytm',       emoji: '💙',  color: '#00b9f1' },
  { id: 'cred',    label: 'CRED UPI',    emoji: '⚫',  color: '#1a1a1a' },
];

// ─── Payment methods ───────────────────────────────────────────────────────────
const PAYMENT_METHODS = [
  {
    id: 'card',
    icon: '💳',
    label: 'Credit/Debit Card',
    sub: 'Visa, Mastercard, Rupay',
    prepaidOnly: true,
  },
  {
    id: 'netbanking',
    icon: '🏦',
    label: 'Net Banking',
    sub: 'All major banks supported',
    prepaidOnly: true,
  },
  {
    id: 'wallet',
    icon: '👛',
    label: 'Wallets',
    sub: 'Paytm, Amazon Pay & more',
    prepaidOnly: true,
  },
  {
    id: 'pad',
    icon: '🚪',
    label: 'Pay After Delivery',
    sub: 'Safe like COD. Quick like UPI!',
    prepaidOnly: false,
    badge: 'Popular',
  },
  {
    id: 'partial',
    icon: '⚡',
    label: 'Partial COD',
    sub: 'Pay Balance at Delivery',
    prepaidOnly: false,
    badge: null,
  },
];

export default function CheckoutPage() {
  const {
    state, subtotal, savings, shipping, total,
    itemCount, toggleGift,
  } = useCart();

  const { items, isGift, discountCode, discountAmount } = state;
  const giftCharge = isGift ? GIFT_CHARGE : 0;

  const [selectedUPI, setSelectedUPI]         = useState('');
  const [upiId, setUpiId]                     = useState('');
  const [selectedMethod, setSelectedMethod]   = useState('');
  const [showUPIInput, setShowUPIInput]       = useState(false);
  const [orderPlaced, setOrderPlaced]         = useState(false);
  const [loading, setLoading]                 = useState(false);

  const finalTotal = total; // already includes gift/discount from cartContext

  // Savings shown on the prepaid banner
  const prepaidSaving = Math.round(finalTotal * 0.05); // 5% prepaid discount example

  const handlePay = useCallback(() => {
    if (!selectedMethod && !selectedUPI && !upiId) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOrderPlaced(true);
    }, 1800);
  }, [selectedMethod, selectedUPI, upiId]);

  // ── Success screen ──────────────────────────────────────────────────────────
  if (orderPlaced) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@300;400;500;600&display=swap');
          .ck-success { min-height: 100vh; background: #f0f7f0; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 24px; font-family: 'Jost', sans-serif; text-align: center; }
          .ck-success-icon { font-size: 72px; margin-bottom: 20px; animation: successPop .5s cubic-bezier(.34,1.56,.64,1); }
          @keyframes successPop { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
          .ck-success-title { font-family: 'Cormorant Garamond', serif; font-size: 32px; font-weight: 300; color: #1a3a1a; margin-bottom: 8px; }
          .ck-success-sub { font-size: 14px; color: rgba(26,58,26,.6); line-height: 1.6; margin-bottom: 32px; max-width: 320px; }
          .ck-success-btn { padding: 14px 36px; background: #2d5a27; color: white; border: none; border-radius: 50px; font-family: 'Jost', sans-serif; font-size: 12px; font-weight: 600; letter-spacing: .2em; text-transform: uppercase; cursor: pointer; text-decoration: none; }
        `}</style>
        <div className="ck-success">
          <div className="ck-success-icon">✅</div>
          <h1 className="ck-success-title">Order Placed!</h1>
          <p className="ck-success-sub">Your order has been confirmed. You'll receive a confirmation SMS shortly.</p>
          <Link href="/shop" className="ck-success-btn">Continue Shopping</Link>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@300;400;500;600&display=swap');

        :root {
          --g900: #1a3a1a;
          --g800: #1e4d1e;
          --g700: #2d5a27;
          --g600: #3a7a32;
          --g500: #4a9e40;
          --g400: #6abf5e;
          --g100: #e8f5e9;
          --g50:  #f0f7f0;
          --gold: #c9a84c;
          --ink:  #1a2a1a;
          --mist: rgba(26,42,26,.45);
          --border: rgba(45,90,39,.12);
          --beige: #f5f0e8;
          --white: #ffffff;
          --red:   #c0392b;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .ck-root {
          min-height: 100vh;
          background: var(--g50);
          font-family: 'Jost', sans-serif;
          color: var(--ink);
        }

        /* ── Header ── */
        .ck-header {
          background: var(--white);
          border-bottom: 1px solid var(--border);
          padding: 14px 20px;
          display: flex; align-items: center; gap: 14px;
          position: sticky; top: 0; z-index: 100;
          box-shadow: 0 2px 12px rgba(45,90,39,.08);
        }
        .ck-back {
          display: flex; align-items: center;
          background: none; border: none; cursor: pointer;
          color: var(--mist); padding: 4px; transition: color .2s;
        }
        .ck-back:hover { color: var(--g700); }
        .ck-header-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 20px; font-weight: 300; letter-spacing: .06em;
          color: var(--g900); flex: 1;
        }
        .ck-secure {
          font-size: 9px; letter-spacing: .22em; text-transform: uppercase;
          color: var(--g500); display: flex; align-items: center; gap: 4px;
          font-weight: 600;
        }

        /* ── Prepaid banner ── */
        .ck-prepaid-banner {
          background: linear-gradient(90deg, var(--g700), var(--g600));
          color: white;
          padding: 9px 20px;
          font-size: 12px; font-weight: 500;
          text-align: center; letter-spacing: .04em;
        }
        .ck-prepaid-banner strong { font-weight: 700; }

        /* ── Savings strip ── */
        .ck-savings-strip {
          background: var(--g100);
          padding: 10px 20px;
          font-size: 12px; color: var(--g700);
          font-weight: 600;
          border-bottom: 1px solid rgba(45,90,39,.1);
          display: flex; align-items: center; gap: 6px;
        }

        /* ── Body ── */
        .ck-body {
          padding: 16px 20px 120px;
          max-width: 520px; margin: 0 auto;
          display: flex; flex-direction: column; gap: 14px;
        }

        /* ── Section panel ── */
        .ck-panel {
          background: var(--white);
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid var(--border);
          box-shadow: 0 2px 12px rgba(45,90,39,.06);
          animation: ckFadeUp .4s ease both;
        }
        @keyframes ckFadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ck-panel-head {
          padding: 14px 18px 10px;
          font-size: 10px; letter-spacing: .38em; text-transform: uppercase;
          color: var(--mist); font-weight: 600;
          border-bottom: 1px solid var(--border);
        }

        /* ── UPI apps row ── */
        .ck-upi-apps {
          display: grid; grid-template-columns: repeat(4, 1fr);
          gap: 8px; padding: 14px 18px;
        }
        .ck-upi-app {
          display: flex; flex-direction: column; align-items: center; gap: 6px;
          padding: 10px 6px;
          border: 1.5px solid var(--border); border-radius: 12px;
          background: white; cursor: pointer;
          transition: all .2s; font-family: 'Jost', sans-serif;
        }
        .ck-upi-app:hover { border-color: var(--g400); background: var(--g50); }
        .ck-upi-app.active { border-color: var(--g600); background: var(--g100); box-shadow: 0 0 0 3px rgba(58,122,50,.12); }
        .ck-upi-app-icon { font-size: 22px; }
        .ck-upi-app-label { font-size: 9px; color: var(--mist); font-weight: 500; letter-spacing: .04em; text-align: center; }
        .ck-upi-app.active .ck-upi-app-label { color: var(--g700); font-weight: 600; }

        /* ── Add UPI ID ── */
        .ck-upi-id-row {
          padding: 0 18px 16px;
          display: flex; gap: 8px;
        }
        .ck-upi-id-input {
          flex: 1; padding: 11px 14px;
          border: 1.5px solid var(--border); border-radius: 50px;
          font-family: 'Jost', sans-serif; font-size: 13px; color: var(--ink);
          background: var(--g50); outline: none;
          transition: border-color .2s;
        }
        .ck-upi-id-input:focus { border-color: var(--g500); }
        .ck-upi-id-input::placeholder { color: rgba(26,42,26,.3); }
        .ck-upi-verify {
          padding: 11px 18px;
          background: var(--g700); color: white;
          border: none; border-radius: 50px;
          font-family: 'Jost', sans-serif;
          font-size: 11px; font-weight: 600; letter-spacing: .14em; text-transform: uppercase;
          cursor: pointer; white-space: nowrap;
          transition: background .2s;
        }
        .ck-upi-verify:hover { background: var(--g600); }

        .ck-add-upi-btn {
          margin: 0 18px 16px;
          padding: 12px;
          width: calc(100% - 36px);
          border: 1.5px dashed var(--border); border-radius: 12px;
          background: transparent;
          font-family: 'Jost', sans-serif;
          font-size: 12px; color: var(--g600); font-weight: 500;
          cursor: pointer; transition: all .2s;
          display: flex; align-items: center; justify-content: center; gap: 6px;
        }
        .ck-add-upi-btn:hover { border-color: var(--g500); background: var(--g50); }

        /* ── Payment method rows ── */
        .ck-method {
          display: flex; align-items: center; gap: 14px;
          padding: 15px 18px;
          border-bottom: 1px solid var(--border);
          cursor: pointer; transition: background .15s;
          position: relative;
        }
        .ck-method:last-child { border-bottom: none; }
        .ck-method:hover { background: var(--g50); }
        .ck-method.active { background: var(--g100); }
        .ck-method-icon {
          width: 40px; height: 40px; border-radius: 10px;
          background: var(--g50); display: flex; align-items: center; justify-content: center;
          font-size: 18px; flex-shrink: 0; border: 1px solid var(--border);
        }
        .ck-method.active .ck-method-icon { background: var(--g100); border-color: var(--g400); }
        .ck-method-body { flex: 1; }
        .ck-method-label { font-size: 13px; font-weight: 600; color: var(--ink); margin-bottom: 2px; }
        .ck-method-sub { font-size: 11px; color: var(--mist); }
        .ck-method-right { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
        .ck-method-price { font-size: 16px; font-weight: 700; color: var(--g900); }
        .ck-method-save {
          font-size: 10px; font-weight: 600; color: var(--g600);
          background: var(--g100); padding: 2px 8px; border-radius: 4px;
        }
        .ck-method-badge {
          position: absolute; top: 10px; right: 14px;
          font-size: 8px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase;
          color: white; background: var(--g600); padding: 2px 7px; border-radius: 3px;
        }
        .ck-method-radio {
          width: 18px; height: 18px; border-radius: 50%;
          border: 2px solid var(--border); flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          transition: all .2s;
        }
        .ck-method.active .ck-method-radio { border-color: var(--g600); background: var(--g600); }
        .ck-method.active .ck-method-radio::after {
          content: ''; width: 6px; height: 6px; border-radius: 50%; background: white;
        }

        /* COD note */
        .ck-cod-note {
          margin: 0 18px 14px;
          padding: 10px 14px;
          background: rgba(192,57,43,.06); border: 1px solid rgba(192,57,43,.15);
          border-radius: 10px;
          font-size: 11px; color: #8b2e21; line-height: 1.5;
          animation: ckFadeUp .3s ease;
        }
        .ck-cod-note strong { font-weight: 700; }

        /* ── Order summary ── */
        .ck-summary-row {
          display: flex; justify-content: space-between;
          padding: 11px 18px;
          font-size: 13px; color: var(--mist);
          border-bottom: 1px solid var(--border);
        }
        .ck-summary-row:last-child { border-bottom: none; }
        .ck-summary-row.total { font-size: 16px; font-weight: 700; color: var(--g900); }
        .ck-summary-row span:last-child { font-weight: 500; color: var(--ink); }
        .ck-summary-row.total span:last-child { font-weight: 800; font-size: 18px; color: var(--g900); }
        .ck-free-tag {
          background: var(--g600); color: white;
          font-size: 9px; font-weight: 700; padding: 2px 8px; border-radius: 3px;
          text-transform: uppercase; letter-spacing: .1em;
        }
        .ck-savings-row { color: var(--g600); font-weight: 600; }

        /* ── Gift toggle ── */
        .ck-gift {
          display: flex; align-items: center; gap: 14px;
          padding: 16px 18px;
          cursor: pointer; transition: background .15s;
        }
        .ck-gift:hover { background: var(--g50); }
        .ck-gift-icon { font-size: 28px; }
        .ck-gift-body { flex: 1; }
        .ck-gift-title { font-size: 13px; font-weight: 600; color: var(--ink); margin-bottom: 2px; }
        .ck-gift-sub { font-size: 11px; color: var(--mist); }
        .ck-gift-price { font-size: 13px; font-weight: 700; color: var(--g700); }
        .ck-gift-check {
          width: 22px; height: 22px; border-radius: 50%;
          border: 2px solid var(--border);
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; transition: all .22s;
        }
        .ck-gift-check.on { background: var(--g600); border-color: var(--g600); color: white; }

        /* ── Sticky Pay button ── */
        .ck-pay-bar {
          position: fixed; bottom: 0; left: 0; right: 0;
          background: white; border-top: 1px solid var(--border);
          padding: 14px 20px 20px;
          box-shadow: 0 -4px 24px rgba(45,90,39,.12);
          z-index: 90;
        }
        .ck-pay-btn {
          display: flex; align-items: center; justify-content: center; gap: 10px;
          width: 100%; padding: 17px;
          background: linear-gradient(135deg, var(--g700), var(--g800));
          color: white; border: none; border-radius: 50px;
          font-family: 'Jost', sans-serif;
          font-size: 13px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase;
          cursor: pointer;
          box-shadow: 0 6px 24px rgba(45,90,39,.3);
          transition: all .22s;
        }
        .ck-pay-btn:hover { background: linear-gradient(135deg, var(--g600), var(--g700)); transform: translateY(-1px); }
        .ck-pay-btn:disabled { opacity: .5; cursor: not-allowed; transform: none; }
        .ck-pay-btn.loading { pointer-events: none; }

        /* Loading spinner */
        .ck-spinner {
          width: 18px; height: 18px; border-radius: 50%;
          border: 2px solid rgba(255,255,255,.3);
          border-top-color: white;
          animation: spin .7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Trust strip ── */
        .ck-trust {
          display: flex; justify-content: center; gap: 20px;
          padding: 14px 18px;
          flex-wrap: wrap;
        }
        .ck-trust-item {
          display: flex; align-items: center; gap: 5px;
          font-size: 10px; color: var(--mist); font-weight: 500; letter-spacing: .06em;
        }
        .ck-trust-dot { color: var(--g500); font-size: 12px; }

        /* Account section */
        .ck-account {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 18px; cursor: pointer;
        }
        .ck-account-left { display: flex; align-items: center; gap: 12px; font-size: 14px; font-weight: 500; color: var(--ink); }
        .ck-account-chevron { color: var(--mist); transition: transform .2s; }

        @media (min-width: 600px) {
          .ck-body { padding: 24px 24px 120px; }
        }
      `}</style>

      <div className="ck-root">
        {/* ExitIntent — intercepts back button */}
        <ExitIntent />

        {/* Header */}
        <header className="ck-header">
          <Link href="/cart">
            <button className="ck-back" aria-label="Back to cart">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
          </Link>
          <span className="ck-header-title">Jewelsmars</span>
          <span className="ck-secure">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            Secure
          </span>
        </header>

        {/* Prepaid discount banner */}
        <div className="ck-prepaid-banner">
          💳 Additional discount on <strong>Prepaid Orders</strong>
        </div>

        {/* Savings strip */}
        {savings > 0 && (
          <div className="ck-savings-strip">
            🎉 Yay! You've saved <strong style={{marginLeft:4}}>₹{savings.toLocaleString('en-IN')}</strong> so far
          </div>
        )}

        <div className="ck-body">

          {/* ── UPI Section ── */}
          <div className="ck-panel" style={{ animationDelay: '0s' }}>
            <div className="ck-panel-head">Pay via UPI</div>

            {/* UPI app grid */}
            <div className="ck-upi-apps">
              {UPI_APPS.map(app => (
                <button
                  key={app.id}
                  className={`ck-upi-app${selectedUPI === app.id ? ' active' : ''}`}
                  onClick={() => { setSelectedUPI(app.id); setSelectedMethod(''); setShowUPIInput(false); }}
                >
                  <span className="ck-upi-app-icon">{app.emoji}</span>
                  <span className="ck-upi-app-label">{app.label}</span>
                </button>
              ))}
            </div>

            {/* Add UPI ID */}
            {showUPIInput ? (
              <div className="ck-upi-id-row">
                <input
                  className="ck-upi-id-input"
                  placeholder="yourname@upi"
                  value={upiId}
                  onChange={e => setUpiId(e.target.value)}
                  autoFocus
                />
                <button className="ck-upi-verify">Verify</button>
              </div>
            ) : (
              <button
                className="ck-add-upi-btn"
                onClick={() => { setShowUPIInput(true); setSelectedUPI(''); setSelectedMethod(''); }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
                </svg>
                Add UPI ID
              </button>
            )}
          </div>

          {/* ── Other payment methods ── */}
          <div className="ck-panel" style={{ animationDelay: '.08s' }}>
            <div className="ck-panel-head">Other Payment Methods</div>

            {PAYMENT_METHODS.map(method => {
              // Prepaid methods show discounted price, others show full
              const displayPrice = method.prepaidOnly
                ? finalTotal - Math.round(finalTotal * 0.05)
                : method.id === 'partial'
                ? 100
                : finalTotal;
              const saves = method.prepaidOnly ? Math.round(finalTotal * 0.05) : 0;

              return (
                <div key={method.id}>
                  <div
                    className={`ck-method${selectedMethod === method.id ? ' active' : ''}`}
                    onClick={() => { setSelectedMethod(method.id); setSelectedUPI(''); setShowUPIInput(false); }}
                  >
                    {method.badge && selectedMethod !== method.id && (
                      <span className="ck-method-badge">{method.badge}</span>
                    )}
                    <div className="ck-method-radio" />
                    <div className="ck-method-icon">{method.icon}</div>
                    <div className="ck-method-body">
                      <div className="ck-method-label">{method.label}</div>
                      <div className="ck-method-sub">
                        {method.id === 'partial'
                          ? `Pay Balance ₹${(finalTotal - 100).toLocaleString('en-IN')} at Delivery`
                          : method.sub}
                      </div>
                    </div>
                    <div className="ck-method-right">
                      <span className="ck-method-price">₹{displayPrice.toLocaleString('en-IN')}</span>
                      {saves > 0 && <span className="ck-method-save">Save ₹{saves}</span>}
                    </div>
                  </div>

                  {/* COD charge note */}
                  {selectedMethod === method.id && method.id === 'partial' && (
                    <div className="ck-cod-note">
                      Pay <strong>₹100 now</strong> · Balance ₹{(finalTotal - 100).toLocaleString('en-IN')} at delivery
                      <br /><span style={{ opacity: .7 }}>(Inc. ₹69.90 COD charges)</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── Make it a Gift toggle ── */}
          <div className="ck-panel" style={{ animationDelay: '.14s' }}>
            <div
              className="ck-gift"
              onClick={() => toggleGift()}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && toggleGift()}
            >
              <div className="ck-gift-icon">🎁</div>
              <div className="ck-gift-body">
                <div className="ck-gift-title">Make it a Gift</div>
                <div className="ck-gift-sub">Premium gift wrap + personalised note</div>
              </div>
              <div className="ck-gift-price">+₹{GIFT_CHARGE}</div>
              <div className={`ck-gift-check${isGift ? ' on' : ''}`}>
                {isGift ? '✓' : ''}
              </div>
            </div>
          </div>

          {/* ── Order summary ── */}
          <div className="ck-panel" style={{ animationDelay: '.18s' }}>
            <div className="ck-panel-head">Order Summary · {itemCount} item{itemCount !== 1 ? 's' : ''}</div>

            {items.map(item => (
              <div key={`${item.id}-${item.colorHex}`} className="ck-summary-row">
                <span style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ fontSize:11, color:'var(--mist)' }}>×{item.qty}</span>
                  {item.name}
                </span>
                <span>₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
              </div>
            ))}

            {savings > 0 && (
              <div className="ck-summary-row ck-savings-row">
                <span>🎉 Savings</span>
                <span>−₹{savings.toLocaleString('en-IN')}</span>
              </div>
            )}
            {discountAmount > 0 && (
              <div className="ck-summary-row ck-savings-row">
                <span>Coupon ({discountCode})</span>
                <span>−₹{discountAmount}</span>
              </div>
            )}
            <div className="ck-summary-row">
              <span>Shipping</span>
              <span>{shipping === 0 ? <span className="ck-free-tag">FREE</span> : `₹${shipping}`}</span>
            </div>
            {isGift && (
              <div className="ck-summary-row">
                <span>🎁 Gift wrap</span>
                <span>₹{GIFT_CHARGE}</span>
              </div>
            )}
            <div className="ck-summary-row total">
              <span>Total</span>
              <span>₹{finalTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* ── Trust badges ── */}
          <div className="ck-panel" style={{ animationDelay: '.22s' }}>
            <div className="ck-trust">
              {[
                { icon: '🔒', label: '100% Secure' },
                { icon: '↩️', label: 'Easy Returns' },
                { icon: '✅', label: 'Authentic' },
                { icon: '🚚', label: 'Fast Delivery' },
              ].map(t => (
                <div key={t.label} className="ck-trust-item">
                  <span className="ck-trust-dot">{t.icon}</span>
                  {t.label}
                </div>
              ))}
            </div>
          </div>

          {/* ── Account section ── */}
          <div className="ck-panel" style={{ animationDelay: '.26s' }}>
            <div className="ck-account">
              <div className="ck-account-left">
                <span style={{ fontSize: 20 }}>👤</span>
                Account
              </div>
              <svg className="ck-account-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </div>
          </div>

        </div>

        {/* ── Sticky Pay button ── */}
        <div className="ck-pay-bar">
          <button
            className={`ck-pay-btn${loading ? ' loading' : ''}`}
            onClick={handlePay}
            disabled={!selectedMethod && !selectedUPI && !upiId}
          >
            {loading ? (
              <><div className="ck-spinner" /> Processing…</>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
                Pay ₹{finalTotal.toLocaleString('en-IN')}
              </>
            )}
          </button>
        </div>

      </div>
    </>
  );
}