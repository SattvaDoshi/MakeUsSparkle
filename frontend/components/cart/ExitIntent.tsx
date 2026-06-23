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

type ModalType = 'none' | 'discount' | 'survey';

/**
 * Mount this component on /cart and /checkout pages only.
 * It intercepts the browser back button and shows:
 *   • 1st exit attempt → discount offer modal
 *   • 2nd exit attempt → exit survey modal
 */
export default function ExitIntent() {
  const router            = useRouter();
  const { applyDiscount } = useCart();
  const [modal,   setModal]   = useState<ModalType>('none');
  const [selected, setSelected] = useState<string>('');
  const [otherText, setOtherText] = useState('');
  const exitCountRef = useRef(0);
  const savedPath    = useRef('');

  // Push a dummy history entry so we can intercept popstate
  useEffect(() => {
    savedPath.current = window.location.pathname;
    window.history.pushState({ exitGuard: true }, '');

    const handlePop = () => {
      exitCountRef.current++;
      if (exitCountRef.current === 1) {
        // Re-push so the guard stays in place for 2nd attempt
        window.history.pushState({ exitGuard: true }, '');
        setModal('discount');
      } else {
        window.history.pushState({ exitGuard: true }, '');
        setModal('survey');
      }
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

  const handleSaveNow = useCallback(() => {
    applyDiscount(DISCOUNT_CODE, DISCOUNT_AMOUNT);
    closeModal();
  }, [applyDiscount, closeModal]);

  const handleExitAnyway = useCallback(() => {
    closeModal();
    // Actually navigate back
    window.history.go(-2);
  }, [closeModal]);

  const handleSurveySubmit = useCallback(async () => {
    try {
      await apiRequest('/exit-surveys', {
        method: 'POST',
        body: JSON.stringify({ reason: selected, otherText }),
      });
    } catch (err) {
      console.error('Failed to submit exit survey:', err);
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
      `}</style>

      <div className="ei-overlay" onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
        <div className="ei-sheet">
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
              <h2 className="ei-title">Wait — don't go!</h2>
              <p className="ei-sub">
                Here's an exclusive <strong>₹{DISCOUNT_AMOUNT} discount</strong> just for you.
                Applied automatically at checkout.
              </p>
              <button className="ei-btn-primary" onClick={handleSaveNow}>
                🎉 Claim ₹{DISCOUNT_AMOUNT} Off
              </button>
              <button className="ei-btn-secondary" onClick={handleExitAnyway}>
                No thank you
              </button>
            </>
          )}

          {/* ── Survey modal ── */}
          {modal === 'survey' && (
            <>
              <div className="ei-survey-icon">🎁</div>
              <h2 className="ei-title">Sorry to see you go…</h2>
              <p className="ei-sub" style={{ marginBottom: 20 }}>
                You might miss out on a <strong>FREE GIFT</strong>!<br />
                What stopped you from completing your purchase?
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
              <button className="ei-btn-primary" onClick={handleSurveySubmit}>
                Submit &amp; Exit
              </button>
              <button className="ei-btn-secondary" onClick={() => { closeModal(); }}>
                No, continue checkout
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}