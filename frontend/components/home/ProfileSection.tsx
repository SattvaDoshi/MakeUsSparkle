'use client';

import { useState } from 'react';

type View = 'main' | 'orders' | 'address' | 'password';

const MOCK_ORDERS = [
  { id: 'MUS2401', date: '12 Apr 2025', items: 'Pearl Necklace, Stud Earrings', amount: '₹1,299', status: 'Delivered' },
  { id: 'MUS2389', date: '28 Mar 2025', items: 'Custom Charm Bracelet', amount: '₹849', status: 'Delivered' },
  { id: 'MUS2401', date: '10 Mar 2025', items: 'Gift Box — Couple Set', amount: '₹1,999', status: 'Delivered' },
];

export default function ProfileSection() {
  const [view, setView] = useState<View>('main');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  return (
    <>
      <style>{CSS}</style>
      <section className="pf">

        {/* Top hero card */}
        <div className="pf-hero">
          <div className="pf-avatar">
            <span className="pf-avatar-init">P</span>
          </div>
          <div className="pf-hero-info">
            <h1 className="pf-name">Priya Sharma</h1>
            <p className="pf-email">priya.sharma@email.com</p>
            <span className="pf-badge">Member since Jan 2024</span>
          </div>
        </div>

        {/* Main view */}
        {view === 'main' && (
          <div className="pf-body">
            <div className="pf-section-label">Account</div>
            <div className="pf-list">
              <button className="pf-item" onClick={() => setView('orders')}>
                <span className="pf-item-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="2"/></svg>
                </span>
                <span className="pf-item-txt">
                  <span className="pf-item-name">Order History</span>
                  <span className="pf-item-sub">{MOCK_ORDERS.length} past orders</span>
                </span>
                <span className="pf-chevron">›</span>
              </button>

              <button className="pf-item" onClick={() => setView('address')}>
                <span className="pf-item-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                </span>
                <span className="pf-item-txt">
                  <span className="pf-item-name">Saved Addresses</span>
                  <span className="pf-item-sub">Manage delivery addresses</span>
                </span>
                <span className="pf-chevron">›</span>
              </button>

              <button className="pf-item" onClick={() => setView('password')}>
                <span className="pf-item-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </span>
                <span className="pf-item-txt">
                  <span className="pf-item-name">Change Password</span>
                  <span className="pf-item-sub">Update your account password</span>
                </span>
                <span className="pf-chevron">›</span>
              </button>
            </div>

            <div className="pf-section-label" style={{ marginTop: 24 }}>Support</div>
            <div className="pf-list">
              <a href="mailto:support@makeussparkle.com" className="pf-item">
                <span className="pf-item-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                </span>
                <span className="pf-item-txt">
                  <span className="pf-item-name">Contact Support</span>
                  <span className="pf-item-sub">support@makeussparkle.com</span>
                </span>
                <span className="pf-chevron">›</span>
              </a>
            </div>

            <button
              className="pf-logout"
              onClick={() => setShowLogoutConfirm(true)}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Log out
            </button>
          </div>
        )}

        {/* Order history */}
        {view === 'orders' && (
          <div className="pf-body">
            <button className="pf-back" onClick={() => setView('main')}>← Back</button>
            <div className="pf-section-label">Order History</div>
            <div className="pf-orders">
              {MOCK_ORDERS.map((o, i) => (
                <div key={i} className="pf-order">
                  <div className="pf-order-top">
                    <span className="pf-order-id">#{o.id}</span>
                    <span className={`pf-order-status ${o.status.toLowerCase()}`}>{o.status}</span>
                  </div>
                  <p className="pf-order-items">{o.items}</p>
                  <div className="pf-order-bot">
                    <span className="pf-order-date">{o.date}</span>
                    <span className="pf-order-amt">{o.amount}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Address */}
        {view === 'address' && (
          <div className="pf-body">
            <button className="pf-back" onClick={() => setView('main')}>← Back</button>
            <div className="pf-section-label">Saved Addresses</div>
            <div className="pf-address-card">
              <div className="pf-address-top">
                <span className="pf-address-tag">Home</span>
                <button className="pf-address-edit">Edit</button>
              </div>
              <p className="pf-address-txt">Priya Sharma<br/>42, Rose Garden Society<br/>Andheri West, Mumbai – 400053<br/>Maharashtra, India</p>
            </div>
            <button className="pf-add-address">+ Add New Address</button>
          </div>
        )}

        {/* Change password */}
        {view === 'password' && (
          <div className="pf-body">
            <button className="pf-back" onClick={() => setView('main')}>← Back</button>
            <div className="pf-section-label">Change Password</div>
            <div className="pf-form">
              <label className="pf-label">Current Password
                <input type="password" className="pf-input" placeholder="••••••••" />
              </label>
              <label className="pf-label">New Password
                <input type="password" className="pf-input" placeholder="••••••••" />
              </label>
              <label className="pf-label">Confirm New Password
                <input type="password" className="pf-input" placeholder="••••••••" />
              </label>
              <button className="pf-submit">Update Password</button>
            </div>
          </div>
        )}

        {/* Logout confirm overlay */}
        {showLogoutConfirm && (
          <div className="pf-overlay" onClick={() => setShowLogoutConfirm(false)}>
            <div className="pf-dialog" onClick={e => e.stopPropagation()}>
              <h3 className="pf-dialog-title">Log out?</h3>
              <p className="pf-dialog-sub">You'll need to sign in again to access your account.</p>
              <div className="pf-dialog-actions">
                <button className="pf-dialog-cancel" onClick={() => setShowLogoutConfirm(false)}>Cancel</button>
                <button className="pf-dialog-confirm">Log out</button>
              </div>
            </div>
          </div>
        )}
      </section>
    </>
  );
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;1,400&family=Nunito:wght@300;400;500;600;700&display=swap');

.pf { background: #faf8f3; min-height: 100vh; font-family: 'Nunito', sans-serif; padding-bottom: 90px; position: relative; }

.pf-hero {
    background: linear-gradient(160deg, #446c35bd 100%, #365928 0%);
  padding: 64px 20px 32px;
  display: flex; align-items: center; gap: 18px;
}
.pf-avatar {
  width: 64px; height: 64px; border-radius: 50%;
  background: rgba(200,153,46,.22); border: 2px solid rgba(200,153,46,.4);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.pf-avatar-init { font-family: 'Cormorant Garamond', serif; font-size: 1.8rem; font-style: italic; color: #c8992e; }
.pf-name { font-family: 'Cormorant Garamond', serif; font-size: 1.5rem; font-weight: 400; color: #fff; margin-bottom: 2px; }
.pf-email { font-size: 11px; color: rgba(255,255,255,.5); margin-bottom: 6px; }
.pf-badge { font-size: 8.5px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; background: rgba(200,153,46,.18); color: #c8992e; border: 1px solid rgba(200,153,46,.3); padding: 3px 10px; border-radius: 100px; }

.pf-body { padding: 20px 14px; }
@media (min-width: 600px) { .pf-body { max-width: 540px; margin: 0 auto; padding: 28px 0; } }

.pf-section-label { font-size: 8.5px; font-weight: 700; letter-spacing: .36em; text-transform: uppercase; color: #828278; margin-bottom: 8px; padding-left: 2px; }

.pf-list { background: #fff; border: 1px solid #e8dfc8; border-radius: 14px; overflow: hidden; }
.pf-item {
  width: 100%; display: flex; align-items: center; gap: 14px;
  padding: 16px 16px; text-decoration: none;
  background: transparent; border: none; border-bottom: 1px solid #f0e8d8; cursor: pointer;
  text-align: left; transition: background .16s;
  -webkit-tap-highlight-color: transparent;
}
.pf-item:last-child { border-bottom: none; }
.pf-item:active { background: #faf8f3; }
.pf-item-icon { color: #527a3e; flex-shrink: 0; display: flex; align-items: center; }
.pf-item-txt { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.pf-item-name { font-size: 13px; font-weight: 600; color: #1c1c17; }
.pf-item-sub { font-size: 10.5px; color: #828278; }
.pf-chevron { color: #b4b4a4; font-size: 18px; line-height: 1; }

.pf-logout {
  display: flex; align-items: center; gap: 8px;
  margin-top: 28px; width: 100%;
  padding: 14px 16px;
  background: #fff; border: 1.5px solid #f0c8c8; border-radius: 12px;
  font-size: 12px; font-weight: 700; letter-spacing: .1em;
  color: #c04040; cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.pf-back {
  font-size: 10px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase;
  color: #527a3e; background: none; border: none; cursor: pointer;
  margin-bottom: 16px; padding: 0;
  -webkit-tap-highlight-color: transparent;
}

.pf-orders { display: flex; flex-direction: column; gap: 10px; }
.pf-order { background: #fff; border: 1px solid #e8dfc8; border-radius: 12px; padding: 16px; }
.pf-order-top { display: flex; justify-content: space-between; margin-bottom: 6px; }
.pf-order-id { font-size: 11px; font-weight: 700; color: #484840; }
.pf-order-status { font-size: 9px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; padding: 3px 10px; border-radius: 100px; }
.pf-order-status.delivered { background: #eff6ea; color: #3b6d11; }
.pf-order-status.processing { background: #faeeda; color: #633806; }
.pf-order-items { font-size: 11.5px; color: #484840; margin-bottom: 10px; line-height: 1.45; }
.pf-order-bot { display: flex; justify-content: space-between; }
.pf-order-date { font-size: 10px; color: #828278; }
.pf-order-amt { font-size: 12px; font-weight: 700; color: #253d18; }

.pf-address-card { background: #fff; border: 1px solid #e8dfc8; border-radius: 14px; padding: 18px; margin-bottom: 12px; }
.pf-address-top { display: flex; justify-content: space-between; margin-bottom: 10px; }
.pf-address-tag { font-size: 9px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; background: #eff6ea; color: #3b6d11; border: 1px solid #c0dd97; padding: 3px 10px; border-radius: 100px; }
.pf-address-edit { font-size: 10px; font-weight: 700; color: #527a3e; background: none; border: none; cursor: pointer; }
.pf-address-txt { font-size: 12px; color: #484840; line-height: 1.7; }
.pf-add-address { width: 100%; padding: 14px; border: 1.5px dashed #c0dd97; border-radius: 12px; background: #eff6ea; color: #3b6d11; font-size: 11px; font-weight: 700; cursor: pointer; -webkit-tap-highlight-color: transparent; }

.pf-form { display: flex; flex-direction: column; gap: 14px; }
.pf-label { display: flex; flex-direction: column; gap: 5px; font-size: 10px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: #828278; }
.pf-input { padding: 12px 14px; border: 1.5px solid #e8dfc8; border-radius: 10px; font-size: 13px; font-family: 'Nunito', sans-serif; background: #fff; color: #1c1c17; outline: none; transition: border-color .2s; }
.pf-input:focus { border-color: #527a3e; }
.pf-submit { margin-top: 4px; padding: 14px; background: #253d18; color: #fff; border: none; border-radius: 12px; font-size: 11px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; cursor: pointer; -webkit-tap-highlight-color: transparent; }

.pf-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.48); z-index: 1000; display: flex; align-items: flex-end; justify-content: center; padding: 0 0 80px; }
.pf-dialog { background: #fff; border-radius: 18px 18px 0 0; padding: 28px 24px 24px; width: 100%; max-width: 480px; }
.pf-dialog-title { font-family: 'Cormorant Garamond', serif; font-size: 1.4rem; font-weight: 400; color: #1c1c17; margin-bottom: 6px; }
.pf-dialog-sub { font-size: 12px; color: #828278; margin-bottom: 20px; }
.pf-dialog-actions { display: flex; gap: 10px; }
.pf-dialog-cancel { flex: 1; padding: 13px; border: 1.5px solid #e8dfc8; border-radius: 10px; background: #fff; font-size: 11px; font-weight: 700; color: #484840; cursor: pointer; }
.pf-dialog-confirm { flex: 1; padding: 13px; background: #c04040; border: none; border-radius: 10px; font-size: 11px; font-weight: 700; color: #fff; cursor: pointer; }
`;