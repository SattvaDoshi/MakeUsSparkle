'use client';

import { useEffect, useState } from 'react';
import styles from './LoginPopup.module.css';

export default function LoginPopup() {
  const [visible, setVisible] = useState(false);
  const [closed, setClosed] = useState(false);
  const [tab, setTab] = useState<'login' | 'register'>('register');
  const [form, setForm] = useState({
    name: '', email: '', phone: '', gender: '',
    day: '', month: '', year: '', password: '',
  });

  useEffect(() => {
    // Don't show if already dismissed this session
    if (sessionStorage.getItem('loginPopupDismissed')) return;
    const timer = setTimeout(() => {
      if (!closed) setVisible(true);
    }, 15000); // 15 seconds
    return () => clearTimeout(timer);
  }, [closed]);

  const handleClose = () => {
    setVisible(false);
    setClosed(true);
    sessionStorage.setItem('loginPopupDismissed', '1');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: wire up to backend auth
    handleClose();
  };

  if (!visible) return null;

  return (
    <div className={styles.backdrop} onClick={e => { if (e.target === e.currentTarget) handleClose(); }}>
      <div className={styles.modal}>
        {/* Close */}
        <button className={styles.close} onClick={handleClose} aria-label="Close">
          <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>

        {/* Offer badge */}
        <div className={styles.offerBadge}>
          <span className={styles.offerPct}>10% OFF</span>
          <span className={styles.offerLabel}>Your First Order</span>
        </div>

        <h2 className={styles.title}>Unlock Your Reward</h2>
        <p className={styles.subtitle}>
          Join MakeUsSparkle and get exclusive access to offers, early launches and more.
        </p>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tabBtn} ${tab === 'register' ? styles.tabBtnActive : ''}`}
            onClick={() => setTab('register')}
          >
            New Here
          </button>
          <button
            className={`${styles.tabBtn} ${tab === 'login' ? styles.tabBtnActive : ''}`}
            onClick={() => setTab('login')}
          >
            Sign In
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {tab === 'register' ? (
            <>
              <input
                className={styles.input}
                type="text"
                placeholder="Your Name"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
              />
              <input
                className={styles.input}
                type="email"
                placeholder="Email Address"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
              />
              <div className={styles.phoneRow}>
                <span className={styles.phoneFlag}>🇮🇳 +91</span>
                <input
                  className={`${styles.input} ${styles.phoneInput}`}
                  type="tel"
                  placeholder="Phone Number"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  maxLength={10}
                  required
                />
              </div>
              <div className={styles.dobRow}>
                <input className={styles.input} type="text" placeholder="DD" maxLength={2} style={{ width: '25%' }}
                  value={form.day} onChange={e => setForm(f => ({ ...f, day: e.target.value }))} />
                <input className={styles.input} type="text" placeholder="MM" maxLength={2} style={{ width: '25%' }}
                  value={form.month} onChange={e => setForm(f => ({ ...f, month: e.target.value }))} />
                <input className={styles.input} type="text" placeholder="YYYY" maxLength={4} style={{ flex: 1 }}
                  value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} />
              </div>
              <select className={styles.input} value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}>
                <option value="">Gender (optional)</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Prefer not to say</option>
              </select>
            </>
          ) : (
            <>
              <input className={styles.input} type="email" placeholder="Email or Phone" required />
              <input className={styles.input} type="password" placeholder="Password" required />
              <a href="/forgot-password" className={styles.forgotLink}>Forgot password?</a>
            </>
          )}

          <button type="submit" className={styles.submitBtn}>
            {tab === 'register' ? '✦ Unlock My 10% Reward' : 'Sign In'}
          </button>
        </form>

        <p className={styles.terms}>
          By continuing, you agree to our{' '}
          <a href="/terms">Terms</a> & <a href="/privacy">Privacy Policy</a>.
          Offer valid on first order only, one per number.
        </p>
      </div>
    </div>
  );
}