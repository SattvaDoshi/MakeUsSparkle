'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { apiRequest } from '@/lib/api';
import { lockScroll } from '@/lib/scrollLock';
import { useSheetSwipe, SHEET_GRAB_CSS } from '@/lib/useSheetSwipe';

interface PublicCoupon {
  code: string;
  name: string;
  description?: string;
  discountType: 'percentage' | 'fixed' | 'free_shipping';
  discountValue: number;
  maxDiscount?: number | null;
  minOrderValue?: number;
  expiryDate?: string | null;
}

const inr = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

function headline(c: PublicCoupon) {
  if (c.discountType === 'free_shipping') return 'Free shipping';
  if (c.discountType === 'percentage') return `${c.discountValue}% off${c.maxDiscount ? ` · up to ${inr(c.maxDiscount)}` : ''}`;
  return `${inr(c.discountValue)} off`;
}

function expiryText(iso?: string | null) {
  if (!iso) return '';
  const days = Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000);
  if (days <= 0) return '';
  if (days <= 7) return `Ends in ${days} day${days === 1 ? '' : 's'}`;
  return `Valid till ${new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`;
}

/**
 * "Available coupons": every public coupon with an Apply button. Rises from the bottom on phones, a centred window on desktop.
 * A coupon the cart doesn't reach yet is shown greyed with how much more to add; targeting rules (a style, a category…)
 * are checked by the server when Apply is pressed and any reason is shown on the coupon itself.
 */
export default function CouponSheet({
  open, onClose, subtotal, appliedCode, onApply,
}: {
  open: boolean;
  onClose: () => void;
  subtotal: number;
  appliedCode?: string;
  onApply: (code: string) => Promise<{ success: boolean; message?: string }>;
}) {
  const [coupons, setCoupons] = useState<PublicCoupon[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { sheetRef, grabProps } = useSheetSwipe(onClose);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    let live = true;
    setFailed(false);
    apiRequest<{ success: boolean; offers: PublicCoupon[] }>('/coupons/offers')
      .then((r) => { if (live) setCoupons(r.offers || []); })
      .catch(() => { if (live) { setCoupons([]); setFailed(true); } });
    return () => { live = false; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const unlock = lockScroll();
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', esc);
    return () => { unlock(); document.removeEventListener('keydown', esc); };
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') return null;

  // Coupons you can use now first, then the ones that need a bigger cart.
  const sorted = (coupons || []).filter((c) => !c.expiryDate || new Date(c.expiryDate).getTime() > Date.now()).sort((a, b) => {
    const ea = subtotal >= (a.minOrderValue || 0) ? 0 : 1;
    const eb = subtotal >= (b.minOrderValue || 0) ? 0 : 1;
    return ea - eb;
  });

  const apply = async (code: string) => {
    setBusy(code);
    setErrors((e) => ({ ...e, [code]: '' }));
    try {
      const res = await onApply(code);
      if (res?.success) onClose();
      else setErrors((e) => ({ ...e, [code]: res?.message || 'This coupon can\'t be applied to your cart.' }));
    } catch (err) {
      setErrors((e) => ({ ...e, [code]: err instanceof Error ? err.message : 'Could not apply this coupon.' }));
    } finally {
      setBusy('');
    }
  };

  return createPortal(
    <div className="cs-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <style>{`
        .cs-overlay{position:fixed;inset:0;z-index:9600;background:rgba(26,31,13,.55);display:flex;align-items:center;justify-content:center;padding:20px;animation:csFade .2s ease;font-family:'Jost',sans-serif}
        @keyframes csFade{from{opacity:0}to{opacity:1}}
        .cs-sheet{width:100%;max-width:480px;max-height:80vh;background:#fff;border-radius:20px;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 24px 80px rgba(26,31,13,.35);animation:csPop .26s cubic-bezier(.22,.68,0,1.1)}
        @keyframes csPop{from{opacity:0;transform:translateY(14px) scale(.98)}to{opacity:1;transform:none}}
        .cs-head{display:flex;align-items:center;justify-content:space-between;padding:16px 20px 12px;border-bottom:1px solid #ecebe4}
        .cs-title{margin:0;font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:600;color:#1a1a14}
        .cs-close{all:unset;box-sizing:border-box;width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#4a4a40;background:#f4f3ee}
        .cs-close:focus-visible{outline:2px solid #2a4736}
        .cs-list{overflow-y:auto;padding:14px 16px 20px;display:flex;flex-direction:column;gap:12px;overscroll-behavior:contain}
        .cs-card{display:flex;gap:12px;padding:14px;border:1.5px dashed #d8cfa6;border-radius:14px;background:#fffdf6}
        .cs-card.is-locked{border-color:#e6e4da;background:#fafaf6}
        .cs-card.is-applied{border-color:#2a4736;border-style:solid;background:#f3f8f4}
        .cs-body{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px}
        .cs-code{align-self:flex-start;font-size:12px;font-weight:700;letter-spacing:.12em;color:#2a4736;background:#e8f3ec;border:1px dashed #9cc0aa;border-radius:6px;padding:3px 9px}
        .cs-card.is-locked .cs-code{color:#7b7b72;background:#f0efe8;border-color:#d6d3c4}
        .cs-off{margin-top:4px;font-size:15px;font-weight:600;color:#1a1a14;line-height:1.3}
        .cs-desc{font-size:12.5px;color:#6f6f64;line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;white-space:pre-line}
        .cs-meta{font-size:12px;color:#8a6a1c;margin-top:2px}
        .cs-need{font-size:12.5px;font-weight:600;color:#a2461f;margin-top:2px}
        .cs-err{font-size:12.5px;font-weight:500;color:#b3261e;margin-top:4px}
        .cs-act{flex:0 0 auto;align-self:center}
        .cs-apply{all:unset;box-sizing:border-box;min-width:76px;height:38px;padding:0 16px;display:inline-flex;align-items:center;justify-content:center;border-radius:999px;background:#1a1a14;color:#fff;font-size:12.5px;font-weight:700;letter-spacing:.06em;cursor:pointer}
        @media(hover:hover){.cs-apply:hover{background:#000}}
        .cs-apply:focus-visible{outline:2px solid #2a4736;outline-offset:2px}
        .cs-apply[aria-disabled="true"]{background:#e6e4da;color:#9a9a8e;cursor:not-allowed}
        .cs-applied-tag{font-size:12.5px;font-weight:700;color:#2a4736}
        .cs-empty{padding:36px 20px;text-align:center;color:#6f6f64;font-size:14px}
        .cs-skel{height:96px;border-radius:14px;background:linear-gradient(90deg,#f4f3ee,#faf9f5,#f4f3ee);background-size:200% 100%;animation:csShine 1.2s linear infinite}
        @keyframes csShine{to{background-position:-200% 0}}
        ${SHEET_GRAB_CSS}
        @media (max-width:767px){
          .cs-overlay{align-items:flex-end;padding:0}
          .cs-sheet{max-width:none;max-height:86dvh;border-radius:22px 22px 0 0;animation:csUp .34s cubic-bezier(.22,.68,0,1);padding-bottom:env(safe-area-inset-bottom)}
          @keyframes csUp{from{transform:translateY(100%)}to{transform:none}}
          .cs-head{padding-top:2px}
        }
      `}</style>

      <div ref={sheetRef as React.RefObject<HTMLDivElement>} className="cs-sheet" role="dialog" aria-modal="true" aria-label="Available coupons">
        <div className="sheet-grab" {...grabProps} aria-hidden="true"><span /></div>
        <div className="cs-head">
          <h2 className="cs-title">Available coupons</h2>
          <button type="button" className="cs-close" onClick={onClose} aria-label="Close">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        <div className="cs-list">
          {coupons === null && <><div className="cs-skel" /><div className="cs-skel" /><div className="cs-skel" /></>}
          {coupons !== null && sorted.length === 0 && (
            <p className="cs-empty">{failed ? 'Couldn\'t load coupons right now. You can still type a code.' : 'No coupons are available right now.'}</p>
          )}
          {sorted.map((c) => {
            const min = c.minOrderValue || 0;
            const eligible = subtotal >= min;
            const isApplied = !!appliedCode && appliedCode.toUpperCase() === c.code.toUpperCase();
            const note = [min > 0 ? `Min order ${inr(min)}` : '', expiryText(c.expiryDate)].filter(Boolean).join(' · ');
            return (
              <div key={c.code} className={`cs-card${isApplied ? ' is-applied' : !eligible ? ' is-locked' : ''}`}>
                <div className="cs-body">
                  <span className="cs-code">{c.code}</span>
                  <span className="cs-off">{headline(c)}</span>
                  {(c.description || c.name) && <span className="cs-desc">{c.description || c.name}</span>}
                  {note && <span className="cs-meta">{note}</span>}
                  {!eligible && !isApplied && <span className="cs-need">Add {inr(min - subtotal)} more to use this</span>}
                  {errors[c.code] && <span className="cs-err" role="alert">{errors[c.code]}</span>}
                </div>
                <div className="cs-act">
                  {isApplied ? (
                    <span className="cs-applied-tag">✓ Applied</span>
                  ) : (
                    <button
                      type="button"
                      className="cs-apply"
                      aria-disabled={!eligible || busy === c.code}
                      onClick={() => { if (eligible && !busy) apply(c.code); }}
                    >
                      {busy === c.code ? '…' : 'Apply'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>,
    document.body,
  );
}
