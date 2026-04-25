'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useCart, GIFT_CHARGE } from '@/lib/cartContext';
import ExitIntent from '@/components/cart/ExitIntent';
// ⬇️  Replace with your actual UpperNav path once confirmed
import UpperNav from '@/components/ui/UpperNav';

// ─── UPI apps ─────────────────────────────────────────────────────────────────
const UPI_APPS = [
  { id: 'gpay',    label: 'Google Pay' },
  { id: 'phonepe', label: 'PhonePe'    },
  { id: 'paytm',   label: 'Paytm'      },
  { id: 'cred',    label: 'CRED UPI'   },
];

// ─── Payment methods ───────────────────────────────────────────────────────────
const PAYMENT_METHODS = [
  { id: 'card',       label: 'Credit / Debit Card',  sub: 'Visa · Mastercard · RuPay',      prepaidOnly: true,  badge: null,     svgKey: 'card'    },
  { id: 'netbanking', label: 'Net Banking',           sub: 'All major banks supported',      prepaidOnly: true,  badge: null,     svgKey: 'bank'    },
  { id: 'wallet',     label: 'Wallets',               sub: 'Paytm · Amazon Pay & more',      prepaidOnly: true,  badge: null,     svgKey: 'wallet'  },
  { id: 'pad',        label: 'Pay After Delivery',    sub: 'Safe like COD. Quick like UPI!', prepaidOnly: false, badge: 'Popular',svgKey: 'pad'     },
  { id: 'partial',    label: 'Partial COD',           sub: 'Pay Balance at Delivery',        prepaidOnly: false, badge: null,     svgKey: 'partial' },
];

// ─── UPI brand icons (inline SVG approximations) ─────────────────────────────
const UpiIcon = ({ id, active }: { id: string; active: boolean }) => {
  const c = active ? '#2d5a27' : '#7a9e75';
  const s = { width: 28, height: 28 } as const;

  if (id === 'gpay') return (
    <svg {...s} viewBox="0 0 28 28" fill="none">
      <rect width="28" height="28" rx="7" fill={active ? '#eaf5ea' : '#f5f0e8'}/>
      <text x="14" y="20" textAnchor="middle" fontSize="14" fontWeight="700" fill={c} fontFamily="sans-serif">G</text>
    </svg>
  );
  if (id === 'phonepe') return (
    <svg {...s} viewBox="0 0 28 28" fill="none">
      <rect width="28" height="28" rx="7" fill={active ? '#eaf5ea' : '#f5f0e8'}/>
      <path d="M10 8h5a3 3 0 0 1 0 6h-3v6h-2V8z" fill={c}/>
    </svg>
  );
  if (id === 'paytm') return (
    <svg {...s} viewBox="0 0 28 28" fill="none">
      <rect width="28" height="28" rx="7" fill={active ? '#eaf5ea' : '#f5f0e8'}/>
      <rect x="8" y="12" width="12" height="8" rx="2" stroke={c} strokeWidth="1.6"/>
      <path d="M11 12V10a3 3 0 0 1 6 0v2" stroke={c} strokeWidth="1.6"/>
      <circle cx="14" cy="16" r="1.5" fill={c}/>
    </svg>
  );
  // CRED
  return (
    <svg {...s} viewBox="0 0 28 28" fill="none">
      <rect width="28" height="28" rx="7" fill={active ? '#eaf5ea' : '#f5f0e8'}/>
      <path d="M9 14a5 5 0 1 1 5 5" stroke={c} strokeWidth="1.6" strokeLinecap="round"/>
      <circle cx="14" cy="14" r="2" fill={c}/>
    </svg>
  );
};

// ─── Payment method icons ─────────────────────────────────────────────────────
const PayIcon = ({ type, active }: { type: string; active: boolean }) => {
  const c = active ? '#2d5a27' : '#7a9e75';
  const s = { width: 24, height: 24 } as const;

  switch (type) {
    case 'card': return (
      <svg {...s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7">
        <rect x="2" y="5" width="20" height="14" rx="3"/>
        <path d="M2 10h20" strokeLinecap="round"/>
        <path d="M6 15h4" strokeLinecap="round"/>
        <rect x="16" y="13" width="3" height="2" rx="0.5" fill={c} stroke="none"/>
      </svg>
    );
    case 'bank': return (
      <svg {...s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7">
        <path d="M3 21h18M3 10h18M5 6l7-3 7 3" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M5 10v11M9 10v11M15 10v11M19 10v11" strokeLinecap="round"/>
      </svg>
    );
    case 'wallet': return (
      <svg {...s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7">
        <path d="M20 12V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-4"/>
        <path d="M16 12h4v4h-4a2 2 0 0 1 0-4z" strokeLinejoin="round"/>
      </svg>
    );
    case 'pad': return (
      <svg {...s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7">
        <path d="M20 8H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2z"/>
        <path d="M12 20v-4M8 20h8" strokeLinecap="round"/>
        <path d="M7 12h.01" strokeLinecap="round" strokeWidth="2.5"/>
      </svg>
    );
    case 'partial': return (
      <svg {...s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7">
        <path d="M12 2a10 10 0 1 0 10 10" strokeLinecap="round"/>
        <path d="M12 6v6l3 3" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M18 2v4M22 2l-4 4" strokeLinecap="round"/>
      </svg>
    );
    default: return null;
  }
};

export default function CheckoutPage() {
  const {
    state, subtotal, savings, shipping, total,
    itemCount, toggleGift,
  } = useCart();

  const { items, isGift, discountCode, discountAmount } = state;

  const [selectedUPI, setSelectedUPI]       = useState('');
  const [upiId, setUpiId]                   = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');
  const [showUPIInput, setShowUPIInput]     = useState(false);
  const [orderPlaced, setOrderPlaced]       = useState(false);
  const [loading, setLoading]               = useState(false);

  const finalTotal = total;

  const handlePay = useCallback(() => {
    if (!selectedMethod && !selectedUPI && !upiId) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); setOrderPlaced(true); }, 1800);
  }, [selectedMethod, selectedUPI, upiId]);

  // ── Success screen ────────────────────────────────────────────────────────────
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
          <p className="ck-s-sub">Your order is confirmed. You'll receive a confirmation SMS shortly.</p>
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
          margin-top:60px
        }

        /* ── Prepaid banner ── */
        .ck-prepaid-banner {
          background: var(--g800);
          color: rgba(255,255,255,.88);
          padding: 9px 20px;
          font-size: 12px; font-weight: 400;
          text-align: center; letter-spacing: .04em;
        }
        .ck-prepaid-banner strong { font-weight: 700; color: #9fdc82; }

        /* ── Savings strip ── */
        .ck-savings-strip {
          background: #e5f4e0;
          padding: 9px 20px;
          font-size: 12px; color: var(--g700); font-weight: 600;
          border-bottom: 1px solid rgba(45,90,39,.09);
          display: flex; align-items: center; gap: 6px; justify-content: center;
        }

        /* ── Body ── */
        .ck-body {
          padding: 20px 16px 48px;
          max-width: 1060px; margin: 0 auto;
        }
        @media (min-width: 768px)  { .ck-body { padding: 32px 32px 60px; } }
        @media (min-width: 1024px) { .ck-body { padding: 40px 48px 60px; } }

        /* ── Two-column grid ── */
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

        /* ── Column title ── */
        .ck-col-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px; font-weight: 500; letter-spacing: .08em;
          color: var(--g900); margin-bottom: 14px;
        }

        /* ── Panel ── */
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

        /* ── UPI grid ── */
        .ck-upi-apps {
          display: grid; grid-template-columns: repeat(4, 1fr);
          gap: 10px; padding: 16px 20px;
        }
        @media (max-width: 380px) {
          .ck-upi-apps { grid-template-columns: repeat(2, 1fr); }
        }

        .ck-upi-app {
          display: flex; flex-direction: column; align-items: center; gap: 7px;
          padding: 13px 8px;
          border: 1.5px solid var(--border); border-radius: 14px;
          background: var(--beige); cursor: pointer;
          transition: all .2s; font-family: 'DM Sans', sans-serif;
        }
        .ck-upi-app:hover { border-color: var(--g400); background: var(--g50); }
        .ck-upi-app.active {
          border-color: var(--g600); background: #eaf5ea;
          box-shadow: 0 0 0 3px rgba(58,122,50,.11);
        }
        .ck-upi-app-label {
          font-size: 9.5px; color: var(--mist); font-weight: 500;
          letter-spacing: .02em; text-align: center; line-height: 1.3;
        }
        .ck-upi-app.active .ck-upi-app-label { color: var(--g700); font-weight: 600; }

        /* ── UPI ID row ── */
        .ck-upi-id-row {
          padding: 0 20px 18px;
          display: flex; gap: 8px;
        }
        .ck-upi-id-input {
          flex: 1; padding: 12px 16px;
          border: 1.5px solid var(--border); border-radius: 50px;
          font-family: 'DM Sans', sans-serif; font-size: 13px; color: var(--ink);
          background: var(--beige); outline: none; transition: border-color .2s;
        }
        .ck-upi-id-input:focus { border-color: var(--g500); }
        .ck-upi-id-input::placeholder { color: rgba(26,42,26,.3); }
        .ck-verify-btn {
          padding: 12px 20px;
          background: var(--g700); color: white;
          border: none; border-radius: 50px;
          font-family: 'DM Sans', sans-serif;
          font-size: 11px; font-weight: 600; letter-spacing: .14em; text-transform: uppercase;
          cursor: pointer; white-space: nowrap; transition: background .2s;
        }
        .ck-verify-btn:hover { background: var(--g600); }

        .ck-add-upi-btn {
          margin: 0 20px 18px;
          padding: 13px; width: calc(100% - 40px);
          border: 1.5px dashed var(--beige-drk); border-radius: 12px;
          background: transparent; font-family: 'DM Sans', sans-serif;
          font-size: 12px; color: var(--g600); font-weight: 500;
          cursor: pointer; transition: all .2s;
          display: flex; align-items: center; justify-content: center; gap: 7px;
        }
        .ck-add-upi-btn:hover { border-color: var(--g500); background: var(--g50); }

        /* ── Payment method rows ── */
        .ck-method {
          display: flex; align-items: center; gap: 14px;
          padding: 15px 20px;
          border-bottom: 1px solid var(--border);
          cursor: pointer; transition: background .15s; position: relative;
        }
        .ck-method:last-child { border-bottom: none; }
        .ck-method:hover  { background: var(--beige); }
        .ck-method.active { background: #eaf5ea; }

        .ck-method-icon {
          width: 44px; height: 44px; border-radius: 12px;
          background: var(--beige); border: 1px solid var(--border);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; transition: background .2s;
        }
        .ck-method.active .ck-method-icon { background: #d8efd8; border-color: var(--g400); }

        .ck-method-body { flex: 1; min-width: 0; }
        .ck-method-label { font-size: 13px; font-weight: 600; color: var(--ink); margin-bottom: 2px; }
        .ck-method-sub   { font-size: 11px; color: var(--mist); }

        .ck-method-right { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0; }
        .ck-method-price { font-size: 15px; font-weight: 700; color: var(--g900); }
        .ck-method-save  {
          font-size: 10px; font-weight: 600; color: var(--g700);
          background: #d4edda; padding: 2px 8px; border-radius: 4px;
        }
        .ck-method-badge {
          position: absolute; top: 10px; right: 14px;
          font-size: 8px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase;
          color: white; background: var(--g600); padding: 2px 7px; border-radius: 4px;
        }
        .ck-radio {
          width: 18px; height: 18px; border-radius: 50%;
          border: 2px solid var(--border); flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          transition: all .2s;
        }
        .ck-method.active .ck-radio { border-color: var(--g600); background: var(--g600); }
        .ck-method.active .ck-radio::after {
          content: ''; width: 6px; height: 6px; border-radius: 50%; background: white;
        }

        /* COD note */
        .ck-cod-note {
          margin: 0 20px 14px;
          padding: 11px 16px;
          background: rgba(181,52,28,.05); border: 1px solid rgba(181,52,28,.15);
          border-radius: 10px; font-size: 11px; color: #8b2e21; line-height: 1.6;
          animation: ckUp .3s ease;
        }
        .ck-cod-note strong { font-weight: 700; }

        /* ── Gift toggle ── */
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

        /* ── Summary rows ── */
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

        /* ── Pay button ── */
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

        {/* ── UpperNav replaces old header ── */}
        <UpperNav />

        {/* Prepaid banner */}
        {/* <div className="ck-prepaid-banner">
          Additional <strong>5% off</strong> on Prepaid Orders — pay online &amp; save more
        </div> */}

        {/* Savings strip */}
        {savings > 0 && (
          <div className="ck-savings-strip">
            🎉 You're saving <strong style={{ marginLeft: 3 }}>₹{savings.toLocaleString('en-IN')}</strong> on this order
          </div>
        )}

        <div className="ck-body">
          <div className="ck-layout">

            {/* ══ LEFT — Payment methods ════════════════════════════════════ */}
            <div>
              <p className="ck-col-title">Payment</p>

              {/* UPI */}
              <div className="ck-panel" style={{ animationDelay: '0s' }}>
                <div className="ck-panel-head">Pay via UPI</div>

                <div className="ck-upi-apps">
                  {UPI_APPS.map(app => (
                    <button
                      key={app.id}
                      className={`ck-upi-app${selectedUPI === app.id ? ' active' : ''}`}
                      onClick={() => { setSelectedUPI(app.id); setSelectedMethod(''); setShowUPIInput(false); }}
                    >
                      <UpiIcon id={app.id} active={selectedUPI === app.id} />
                      <span className="ck-upi-app-label">{app.label}</span>
                    </button>
                  ))}
                </div>

                {showUPIInput ? (
                  <div className="ck-upi-id-row">
                    <input
                      className="ck-upi-id-input"
                      placeholder="yourname@upi"
                      value={upiId}
                      onChange={e => setUpiId(e.target.value)}
                      autoFocus
                    />
                    <button className="ck-verify-btn">Verify</button>
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

              {/* Other methods */}
              <div className="ck-panel" style={{ animationDelay: '.08s' }}>
                <div className="ck-panel-head">Other Payment Methods</div>

                {PAYMENT_METHODS.map(method => {
                  const displayPrice = method.prepaidOnly
                    ? finalTotal - Math.round(finalTotal * 0.05)
                    : method.id === 'partial' ? 100 : finalTotal;
                  const saves    = method.prepaidOnly ? Math.round(finalTotal * 0.05) : 0;
                  const isActive = selectedMethod === method.id;

                  return (
                    <div key={method.id}>
                      <div
                        className={`ck-method${isActive ? ' active' : ''}`}
                        onClick={() => { setSelectedMethod(method.id); setSelectedUPI(''); setShowUPIInput(false); }}
                      >
                        {method.badge && !isActive && (
                          <span className="ck-method-badge">{method.badge}</span>
                        )}
                        <div className="ck-radio" />
                        <div className="ck-method-icon">
                          <PayIcon type={method.svgKey} active={isActive} />
                        </div>
                        <div className="ck-method-body">
                          <div className="ck-method-label">{method.label}</div>
                          <div className="ck-method-sub">
                            {method.id === 'partial'
                              ? `Pay balance ₹${(finalTotal - 100).toLocaleString('en-IN')} at delivery`
                              : method.sub}
                          </div>
                        </div>
                        <div className="ck-method-right">
                          <span className="ck-method-price">₹{displayPrice.toLocaleString('en-IN')}</span>
                          {saves > 0 && <span className="ck-method-save">Save ₹{saves}</span>}
                        </div>
                      </div>

                      {isActive && method.id === 'partial' && (
                        <div className="ck-cod-note">
                          Pay <strong>₹100 now</strong> · Balance ₹{(finalTotal - 100).toLocaleString('en-IN')} at delivery
                          <br /><span style={{ opacity: .7 }}>(Incl. ₹69.90 COD charges)</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Gift toggle */}
              <div className="ck-panel" style={{ animationDelay: '.14s' }}>
                <div
                  className="ck-gift"
                  onClick={() => toggleGift()}
                  role="button" tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && toggleGift()}
                >
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

            {/* ══ RIGHT — Summary + Pay ═════════════════════════════════════ */}
            <div>
              <p className="ck-col-title">Order Summary</p>

              <div className="ck-panel" style={{ animationDelay: '.18s' }}>
                <div className="ck-panel-head">{itemCount} Item{itemCount !== 1 ? 's' : ''}</div>

                {items.map(item => (
                  <div key={`${item.id}-${item.colorHex}`} className="ck-row">
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 11, color: 'var(--mist)', flexShrink: 0 }}>×{item.qty}</span>
                      {item.name}
                    </span>
                    <span>₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
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

              {/* Pay button — inline below summary */}
              <button
                className="ck-pay-btn"
                onClick={handlePay}
                disabled={(!selectedMethod && !selectedUPI && !upiId) || loading}
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

              <div className="ck-secure-note">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                100% Secure &amp; Encrypted Payment
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}