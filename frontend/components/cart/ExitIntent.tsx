'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cartContext';
import { apiRequest } from '@/lib/api';

const DISCOUNT_CODE  = 'STAYWITHUS';
const DISCOUNT_AMOUNT = 20;

const SURVEY_OPTIONS = [
  'Found a better deal elsewhere',
  'Technical issues with the website',
  'I changed my mind',
  'Have issues with coupons',
  'Others',
];

type ModalType = 'none' | 'discount' | 'claimed' | 'survey';
const OFFER_SEEN_KEY = 'exitOfferSeen';

/**
 * Mount this component on /cart and /checkout pages only.
 * It intercepts the browser back button and shows:
 *   • 1st exit attempt → discount offer modal
 *   • 2nd exit attempt → exit survey modal
 */
export default function ExitIntent() {
  const router            = useRouter();
  const { applyDiscount, applyCouponCode, state: cartState } = useCart();
  const [claiming, setClaiming] = useState(false);
  const hasCouponRef = useRef(false);
  hasCouponRef.current = Boolean(cartState.discountCode);
  const [modal,   setModal]   = useState<ModalType>('none');
  const [selected, setSelected] = useState<string>('');
  const [otherText, setOtherText] = useState('');
  const exitCountRef = useRef(0);
  const savedPath    = useRef('');

  // Push a dummy history entry so we can intercept popstate
  useEffect(() => {
    savedPath.current = window.location.pathname;
    // Add the guard entry only once (React dev mode runs this effect twice, which would leave two guards behind)
    if (!window.history.state?.exitGuard) window.history.pushState({ exitGuard: true }, '');

    const handlePop = () => {
      exitCountRef.current++;
      // Intercept the back button once only. Pressing back again always leaves, no more questions.
      if (exitCountRef.current > 1) {
        window.removeEventListener('popstate', handlePop);
        window.history.back();
        return;
      }
      window.history.pushState({ exitGuard: true }, '');
      // The discount is offered once per visit (and only without a coupon already applied); otherwise a short optional survey.
      const offerAvailable = !hasCouponRef.current && !sessionStorage.getItem(OFFER_SEEN_KEY);
      if (offerAvailable) sessionStorage.setItem(OFFER_SEEN_KEY, '1');
      setModal(offerAvailable ? 'discount' : 'survey');
    };

    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = modal !== 'none' ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [modal]);

  const closeModal = useCallback(() => setModal('none'), []);

  // Esc closes the offer like any dialog
  useEffect(() => {
    if (modal === 'none') return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeModal(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modal, closeModal]);

  // Auto-dismiss the confirmation
  useEffect(() => {
    if (modal !== 'claimed') return;
    const t = setTimeout(closeModal, 2200);
    return () => clearTimeout(t);
  }, [modal, closeModal]);

  const handleSaveNow = useCallback(async () => {
    setClaiming(true);
    // Prefer the real coupon, which the server checks. If it is not set up there yet, fall back to the built-in offer.
    let ok = false;
    try { ok = Boolean((await applyCouponCode(DISCOUNT_CODE))?.success); } catch { ok = false; }
    if (!ok) applyDiscount(DISCOUNT_CODE, DISCOUNT_AMOUNT);
    setClaiming(false);
    setModal('claimed');
  }, [applyCouponCode, applyDiscount]);

  const handleExitAnyway = useCallback(() => {
    closeModal();
    // Actually navigate back
    window.history.go(-2);
  }, [closeModal]);

  const handleSurveySubmit = useCallback(async () => {
    // The answer is optional: only send it if they picked a reason, and leave either way.
    if (selected) {
      try {
        await apiRequest('/exit-surveys', {
          method: 'POST',
          body: JSON.stringify({ reason: selected, otherText }),
        });
      } catch (err) {
        console.error('Failed to submit exit survey:', err);
      }
    }
    closeModal();
    window.history.go(-2);
  }, [selected, otherText, closeModal]);

  if (modal === 'none') return null;

  return (
    <>
      <style>{`
        .ei-overlay {
          position: fixed; inset: 0; z-index: 600;
          background: rgba(26,31,13,.6);
          display: flex; align-items: flex-end; justify-content: center;
          animation: eiFadeIn .25s ease;
        }
        @keyframes eiFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .ei-sheet {
          background: #f5f0e8;
          border-radius: 28px 28px 0 0;
          padding: 36px 28px 48px;
          width: min(480px, 100%);
          text-align: center;
          animation: eiSlideUp .38s cubic-bezier(.22,.68,0,1.12);
          position: relative;
        }
        @keyframes eiSlideUp {
          from { transform: translateY(60px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }

        /* Discount modal */
        .ei-badge {
          width: 96px; height: 96px;
          background: linear-gradient(135deg, #3d4a22, #1a1f0d);
          border-radius: 50%;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          margin: 0 auto 22px;
          box-shadow: 0 12px 40px rgba(26,31,13,.3);
          animation: eiBadgePulse 2s ease infinite;
        }
        @keyframes eiBadgePulse {
          0%,100% { transform: scale(1); }
          50%      { transform: scale(1.05); }
        }
        .ei-badge-amount {
          font-family: 'Cormorant Garamond', serif;
          font-size: 32px; font-weight: 600; color: #c9a84c; line-height: 1;
        }
        .ei-badge-label {
          font-size: 10px; letter-spacing: .28em; text-transform: uppercase;
          color: rgba(245,240,232,.7); font-family: 'Jost', sans-serif;
        }
        .ei-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 28px; font-weight: 300; color: #1a1f0d;
          margin-bottom: 8px; letter-spacing: .02em;
        }
        .ei-sub {
          font-size: 13px; font-weight: 300; color: rgba(30,35,16,.5);
          line-height: 1.65; margin-bottom: 28px;
          font-family: 'Jost', sans-serif;
        }
        .ei-btn-primary {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          width: 100%; padding: 15px;
          background: #1a1f0d; color: #f5f0e8;
          border: none; border-radius: 50px;
          font-family: 'Jost', sans-serif;
          font-size: 11px; font-weight: 600; letter-spacing: .22em; text-transform: uppercase;
          cursor: pointer; margin-bottom: 10px;
          transition: background .22s;
        }
        .ei-btn-primary:hover { background: #3d4a22; }
        .ei-btn-secondary {
          display: block; width: 100%; padding: 14px;
          background: transparent; color: rgba(30,35,16,.45);
          border: 1.5px solid #d9cdb8; border-radius: 50px;
          font-family: 'Jost', sans-serif;
          font-size: 11px; font-weight: 500; letter-spacing: .16em; text-transform: uppercase;
          cursor: pointer; transition: all .2s;
        }
        .ei-btn-secondary:hover { border-color: #7a8e3c; color: #3d4a22; }

        /* Survey modal */
        .ei-survey-icon { font-size: 48px; margin-bottom: 12px; }
        .ei-survey-options { text-align: left; margin-bottom: 18px; }
        .ei-survey-option {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid rgba(61,74,34,.08);
          cursor: pointer;
          font-family: 'Jost', sans-serif;
          font-size: 13px; color: #1e2310;
          transition: color .2s;
        }
        .ei-survey-option:hover { color: #3d4a22; }
        .ei-survey-option:last-child { border-bottom: none; }
        .ei-radio {
          width: 18px; height: 18px; border-radius: 50%;
          border: 2px solid #d9cdb8; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          transition: all .2s;
        }
        .ei-radio.checked {
          border-color: #5a6b2e;
          background: #5a6b2e;
        }
        .ei-radio.checked::after {
          content: ''; width: 6px; height: 6px;
          border-radius: 50%; background: #f5f0e8;
        }
        .ei-textarea {
          width: 100%;
          padding: 12px 14px;
          border: 1.5px solid #d9cdb8; border-radius: 12px;
          font-family: 'Jost', sans-serif;
          font-size: 13px; color: #1e2310;
          background: white; outline: none; resize: none; height: 72px;
          margin-bottom: 16px;
          transition: border-color .2s;
        }
        .ei-textarea:focus { border-color: #7a8e3c; }
        .ei-textarea::placeholder { color: rgba(30,35,16,.3); }

        /* Close X */
        .ei-close {
          position: absolute; top: 18px; right: 20px;
          width: 32px; height: 32px; border-radius: 50%;
          border: 1.5px solid #d9cdb8; background: white;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          color: rgba(30,35,16,.45); transition: all .2s;
        }
        .ei-close:hover { border-color: #7a8e3c; color: #3d4a22; }

        /* Refined look: calmer, on-brand, centred on larger screens */
        .ei-overlay { background: rgba(26,26,20,.55); backdrop-filter: blur(3px); }
        .ei-sheet { background:#fff; padding:32px 24px calc(28px + env(safe-area-inset-bottom)); }
        .ei-badge { width:84px; height:84px; background:#2a4736; animation:none; box-shadow:0 10px 28px rgba(42,71,54,.28); }
        .ei-badge--ok { background:#2a4736; }
        .ei-badge-amount { color:#fff; font-size:28px; }
        .ei-title { font-weight:600; font-size:30px; color:#1a1a14; }
        .ei-sub { color:#6f6f64; font-size:14.5px; font-weight:400; margin-bottom:24px; }
        .ei-sub strong { color:#1a1a14; }
        .ei-btn-primary { background:#2a4736; padding:16px; font-size:12px; letter-spacing:.14em; }
        .ei-btn-primary:hover:not(:disabled) { background:#1f3a2a; }
        .ei-btn-primary:disabled { opacity:.7; cursor:wait; }
        .ei-btn-secondary { border:0; color:#6f6f64; text-transform:none; letter-spacing:0; font-size:13.5px; padding:10px; text-decoration:underline; text-underline-offset:3px; }
        .ei-btn-secondary:hover { color:#1a1a14; }
        .ei-error { color:#c0392b; font-size:13px; margin:0 0 12px; }
        @media (min-width:640px) {
          .ei-overlay { align-items:center; }
          .ei-sheet { border-radius:24px; padding:36px 32px 28px; }
        }
        @media (prefers-reduced-motion:reduce) { .ei-sheet, .ei-overlay { animation:none; } }
      `}</style>

      <div className="ei-overlay" onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
        <div className="ei-sheet" role="dialog" aria-modal="true" aria-labelledby="ei-title">
          <button className="ei-close" onClick={closeModal} aria-label="Close">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>

          {/* ── Discount modal ── */}
          {modal === 'discount' && (
            <>
              <div className="ei-badge">
                <span className="ei-badge-amount">₹{DISCOUNT_AMOUNT}</span>
                <span className="ei-badge-label">OFF</span>
              </div>
              <h2 className="ei-title" id="ei-title">Before you go</h2>
              <p className="ei-sub">
                Finish your order now and take <strong>₹{DISCOUNT_AMOUNT} off</strong>. One tap and it&apos;s applied to your order, no code to type.
              </p>
              <button className="ei-btn-primary" onClick={handleSaveNow} disabled={claiming}>
                {claiming ? 'Applying…' : `Apply ₹${DISCOUNT_AMOUNT} off and continue`}
              </button>
              <button className="ei-btn-secondary" onClick={handleExitAnyway}>
                No thanks, leave
              </button>
            </>
          )}

          {modal === 'claimed' && (
            <>
              <div className="ei-badge ei-badge--ok" aria-hidden="true">
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <h2 className="ei-title" id="ei-title">₹{DISCOUNT_AMOUNT} off applied</h2>
              <p className="ei-sub" style={{ marginBottom: 22 }}>It&apos;s in your order summary. Complete your order whenever you&apos;re ready.</p>
              <button className="ei-btn-primary" onClick={closeModal}>Continue checkout</button>
            </>
          )}

          {/* ── Survey modal ── */}
          {modal === 'survey' && (
            <>
              <div className="ei-survey-icon">🎁</div>
              <h2 className="ei-title">Sorry to see you go…</h2>
              <p className="ei-sub" style={{ marginBottom: 20 }}>
                What stopped you from completing your purchase? <span style={{ whiteSpace: 'nowrap' }}>(optional)</span>
              </p>
              <div className="ei-survey-options">
                {SURVEY_OPTIONS.map(opt => (
                  <div
                    key={opt}
                    className="ei-survey-option"
                    onClick={() => setSelected(opt)}
                  >
                    <span className={`ei-radio${selected === opt ? ' checked' : ''}`} />
                    {opt}
                  </div>
                ))}
              </div>
              {selected === 'Others' && (
                <textarea
                  className="ei-textarea"
                  placeholder="Please tell us more…"
                  value={otherText}
                  onChange={e => setOtherText(e.target.value)}
                />
              )}
              <button className="ei-btn-primary" onClick={() => { closeModal(); }}>
                Stay and continue checkout
              </button>
              <button className="ei-btn-secondary" onClick={handleSurveySubmit}>
                {selected ? 'Send feedback and leave' : 'Skip and leave'}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}