'use client';

import { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/lib/authContext';

type AuthResponse = {
  success: boolean;
  message?: string;
  token?: string;
  user?: { _id: string; name?: string; email?: string; role?: string };
  welcomeEmailSent?: boolean;
  welcomeCoupon?: {
    code: string; discountType: string;
    discountValue: number; expiryDate?: string;
  };
};

export default function LoginPopup() {
  const { signIn, isAuthenticated } = useAuth();
  const [visible, setVisible] = useState(false);
  const [closed, setClosed] = useState(false);
  const [tab, setTab] = useState<'login' | 'register'>('register');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [form, setForm] = useState({
    name: '', email: '', phone: '', gender: '',
    day: '', month: '', year: '', password: '',
  });

  useEffect(() => {
    if (isAuthenticated || sessionStorage.getItem('loginPopupDismissed')) return;
    const timer = setTimeout(() => { if (!closed) setVisible(true); }, 15000);
    return () => clearTimeout(timer);
  }, [closed, isAuthenticated]);

  useEffect(() => {
    const open = (e: Event) => {
      if (isAuthenticated) return;
      const ev = e as CustomEvent<{ tab?: 'login' | 'register' }>;
      setTab(ev.detail?.tab || 'register');
      setVisible(true);
      setClosed(false);
    };
    window.addEventListener('makeussparkle:auth-open', open);
    return () => window.removeEventListener('makeussparkle:auth-open', open);
  }, [isAuthenticated]);

  const handleClose = () => {
    setVisible(false);
    setClosed(true);
    sessionStorage.setItem('loginPopupDismissed', '1');
  };

  const buildDob = () => {
    const { day, month, year } = form;
    if (!day || !month || !year) return undefined;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback('');
    try {
      if (tab === 'register') {
        const result = await apiRequest<AuthResponse>('/auth/register', {
          method: 'POST',
          body: JSON.stringify({
            name: form.name, email: form.email,
            phone: form.phone, gender: form.gender || undefined,
            dob: buildDob(), password: form.password,
          }),
        });
        if (result.token) await signIn(result.token, result.user ?? null);
        const couponText = result.welcomeCoupon?.code
          ? ` Your 5% code is ${result.welcomeCoupon.code}.` : '';
        setFeedback(`Signup successful.${couponText} Check your email.`);
        handleClose();
        return;
      }
      const result = await apiRequest<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      if (result.token) await signIn(result.token, result.user ?? null);
      setFeedback(result.message || 'Login successful.');
      handleClose();
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  if (!visible || isAuthenticated) return null;

  return (
    <>
      <style>{`
        .mu-backdrop {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: rgba(40, 70, 30, 0.55);
          backdrop-filter: blur(5px);
          -webkit-backdrop-filter: blur(5px);
          display: flex;
          align-items: flex-end;
          justify-content: center;
          animation: muFadeIn 0.25s ease;
        }
        @keyframes muFadeIn { from { opacity: 0 } to { opacity: 1 } }

        .mu-sheet {
          background: #c8dfc0;
          width: 100%;
          max-width: 480px;
          border-radius: 24px 24px 0 0;
          padding: 2rem 1.75rem 2.5rem;
          position: relative;
          animation: muSlideUp 0.35s cubic-bezier(0.32, 0.72, 0, 1);
          max-height: 92dvh;
          overflow-y: auto;
          scrollbar-width: none;
        }
        .mu-sheet::-webkit-scrollbar { display: none; }
        @keyframes muSlideUp {
          from { transform: translateY(60px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }

        .mu-handle {
          width: 36px;
          height: 4px;
          background: rgba(90, 110, 80, 0.25);
          border-radius: 2px;
          margin: 0 auto 1.5rem;
        }

        .mu-close {
          position: absolute;
          top: 1.1rem;
          right: 1.1rem;
          background: rgba(255, 255, 255, 0.5);
          border: 1px solid rgba(90, 110, 80, 0.2);
          color: #4a6040;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          transition: background 0.2s;
        }
        .mu-close:hover { background: rgba(255, 255, 255, 0.8); }

        .mu-brand {
          text-align: center;
          margin-bottom: 1.2rem;
        }
        .mu-brand-name {
          font-family: Georgia, 'Times New Roman', serif;
          font-size: 1.4rem;
          font-weight: 700;
          color: #2e4a28;
          letter-spacing: 0.03em;
        }
        .mu-brand-name span {
          color: #7a9c6a;
          font-size: 1rem;
        }

        .mu-title {
          font-family: Georgia, 'Times New Roman', serif;
          font-size: clamp(1.15rem, 4.5vw, 1.45rem);
          font-weight: 700;
          color: #1e3a18;
          text-align: center;
          margin: 0 0 0.35rem;
          line-height: 1.2;
        }
        .mu-sub {
          font-size: 0.78rem;
          color: #4a6040;
          text-align: center;
          margin: 0 0 1.4rem;
          line-height: 1.5;
        }

        .mu-tabs {
          display: flex;
          background: rgba(255, 255, 255, 0.4);
          border-radius: 100px;
          padding: 3px;
          margin-bottom: 1.3rem;
          border: 1px solid rgba(90, 110, 80, 0.18);
        }
        .mu-tab {
          flex: 1;
          background: none;
          border: none;
          color: #4a6040;
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          padding: 0.5rem;
          border-radius: 100px;
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
          font-family: Georgia, serif;
        }
        .mu-tab.active {
          background: #f5eedb;
          color: #3b5230;
          box-shadow: 0 1px 4px rgba(60, 80, 40, 0.12);
        }

        .mu-form { display: flex; flex-direction: column; gap: 0.65rem; }

        .mu-input {
          width: 100%;
          background: rgba(255, 255, 255, 0.58);
          border: 1px solid rgba(90, 120, 70, 0.22);
          border-radius: 12px;
          color: #2e4a28;
          font-size: 0.86rem;
          padding: 0.7rem 1rem;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
          font-family: Georgia, serif;
          box-sizing: border-box;
          -webkit-appearance: none;
        }
        .mu-input::placeholder { color: rgba(60, 90, 40, 0.38); }
        .mu-input:focus {
          border-color: rgba(80, 130, 60, 0.55);
          background: rgba(255, 255, 255, 0.78);
        }
        .mu-input option { background: #eef4e8; }

        .mu-phone-row {
          display: flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.58);
          border: 1px solid rgba(90, 120, 70, 0.22);
          border-radius: 12px;
          overflow: hidden;
          transition: border-color 0.2s;
        }
        .mu-phone-row:focus-within {
          border-color: rgba(80, 130, 60, 0.55);
          background: rgba(255, 255, 255, 0.78);
        }
        .mu-phone-flag {
          padding: 0 0.7rem 0 0.9rem;
          font-size: 0.85rem;
          color: #3b5230;
          white-space: nowrap;
          border-right: 1px solid rgba(90, 120, 70, 0.18);
          align-self: stretch;
          display: flex;
          align-items: center;
          background: rgba(240, 248, 232, 0.4);
        }
        .mu-phone-input {
          flex: 1;
          background: transparent;
          border: none;
          color: #2e4a28;
          font-size: 0.86rem;
          padding: 0.7rem 0.9rem;
          outline: none;
          font-family: Georgia, serif;
        }
        .mu-phone-input::placeholder { color: rgba(60, 90, 40, 0.38); }

        .mu-dob-row { display: flex; gap: 0.45rem; }
        .mu-dob-row .mu-input { text-align: center; }

        .mu-forgot {
          font-size: 0.73rem;
          color: #4a7a38;
          text-decoration: none;
          text-align: right;
          display: block;
          opacity: 0.85;
        }
        .mu-forgot:hover { opacity: 1; }

        .mu-submit {
          width: 100%;
          background: #3e6b30;
          color: #f5eedb;
          border: none;
          border-radius: 14px;
          font-size: 0.88rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          padding: 0.85rem;
          cursor: pointer;
          margin-top: 0.45rem;
          transition: opacity 0.2s, transform 0.15s;
          font-family: Georgia, serif;
        }
        .mu-submit:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
        .mu-submit:disabled { opacity: 0.45; cursor: not-allowed; }

        .mu-feedback {
          font-size: 0.77rem;
          text-align: center;
          color: #3e6b30;
          margin-top: 0.7rem;
          line-height: 1.4;
        }

        .mu-terms {
          font-size: 0.68rem;
          color: #4a6040;
          text-align: center;
          margin-top: 0.9rem;
          line-height: 1.5;
        }
        .mu-terms a { color: #3e6b30; text-decoration: underline; }

        /* Tablet / Desktop — centered modal */
        @media (min-width: 640px) {
          .mu-backdrop { align-items: center; }
          .mu-sheet {
            border-radius: 24px;
            max-height: 90dvh;
          }
          .mu-handle { display: none; }
        }
      `}</style>

      <div
        className="mu-backdrop"
        onClick={e => { if (e.target === e.currentTarget) handleClose(); }}
        role="dialog"
        aria-modal="true"
        aria-label="Sign up or sign in"
      >
        <div className="mu-sheet">
          <div className="mu-handle" />
          <button className="mu-close" onClick={handleClose} aria-label="Close">✕</button>

          <div className="mu-brand">
            <div className="mu-brand-name">Make You Sparkle <span>✦</span></div>
          </div>

          <h2 className="mu-title">Unlock Exclusive Offers!</h2>
          <p className="mu-sub">
            Join and get early access to offers, launches &amp; more.
          </p>

          <div className="mu-tabs">
            <button
              className={`mu-tab${tab === 'register' ? ' active' : ''}`}
              onClick={() => setTab('register')}
            >
              New Here
            </button>
            <button
              className={`mu-tab${tab === 'login' ? ' active' : ''}`}
              onClick={() => setTab('login')}
            >
              Sign In
            </button>
          </div>

          <form className="mu-form" onSubmit={handleSubmit}>
            {tab === 'register' ? (
              <>
                <input className="mu-input" type="text" placeholder="Your Name"
                  value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />

                <input className="mu-input" type="email" placeholder="Email Address"
                  value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />

                <div className="mu-phone-row">
                  <span className="mu-phone-flag">🇮🇳 +91</span>
                  <input className="mu-phone-input" type="tel" placeholder="Mobile Number"
                    value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    maxLength={10} required />
                </div>

              

             

                <input className="mu-input" type="password" placeholder="Create Password"
                  value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
              </>
            ) : (
              <>
                <input className="mu-input" type="email" placeholder="Email Address"
                  value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />

                <input className="mu-input" type="password" placeholder="Password"
                  value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />

                <a href="/forgot-password" className="mu-forgot">Forgot password?</a>
              </>
            )}

            <button type="submit" className="mu-submit" disabled={loading}>
              {loading ? 'Please wait…' : tab === 'register' ? '✦ Unlock My Reward' : 'Sign In'}
            </button>
          </form>

          {feedback && <p className="mu-feedback">{feedback}</p>}

          <p className="mu-terms">
            By continuing, you agree to our{' '}
            <a href="/terms">Terms</a> &amp; <a href="/privacy">Privacy Policy</a>.
            Offer valid on first order only, one per number.
          </p>
        </div>
      </div>
    </>
  );
}