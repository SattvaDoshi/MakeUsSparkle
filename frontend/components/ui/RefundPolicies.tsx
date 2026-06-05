'use client';

import { useState } from 'react';

interface PolicySection {
  id: string;
  icon: string;
  title: string;
  badge?: string;
  content: React.ReactNode;
}

const refundSections: PolicySection[] = [
  {
    id: 'no-returns',
    icon: '🔒',
    title: 'No Returns & No Cancellations (Prepaid)',
    badge: 'Important',
    content: (
      <>
        <div className="rp-alert">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <p>Once a prepaid order is placed, it is considered <strong>final sale</strong>. We do not offer returns or cash refunds for change of mind.</p>
        </div>
        <p style={{ marginTop: 12 }}>We are unable to cancel or modify prepaid orders once they have been confirmed on our website.</p>
      </>
    ),
  },
  {
    id: 'cod-cancel',
    icon: '💵',
    title: 'COD Cancellation Policy',
    content: (
      <>
        <p>Cash on Delivery (COD) orders can <strong>only be cancelled</strong> if they have not yet been processed by our team.</p>
        <p style={{ marginTop: 10 }}>Once we have processed and booked the order, cancellation directly from the website will <strong>no longer be possible</strong>.</p>
      </>
    ),
  },
  {
    id: 'modifications',
    icon: '✏️',
    title: 'Order Modifications',
    content: (
      <>
        <p>Product, size, or color changes are only possible if the order <strong>has not yet been shipped</strong>.</p>
        <p style={{ marginTop: 10 }}>Please reach out immediately via:</p>
        <div className="rp-contact-row" style={{ marginTop: 12 }}>
          <a href="https://wa.me/918356939586" className="rp-contact-btn rp-contact-btn--wa">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            WhatsApp: +91 8356939586
          </a>
          <a href="mailto:makeyousparkle5@gmail.com" className="rp-contact-btn rp-contact-btn--email">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            makeyousparkle5@gmail.com
          </a>
        </div>
      </>
    ),
  },
  {
    id: 'exchange',
    icon: '🔄',
    title: 'Exchange Policy (Damaged or Wrong Products)',
    badge: 'Exchanges Only',
    content: (
      <>
        <div className="rp-alert rp-alert--green">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
          <p>We <strong>only offer exchanges</strong> if you receive a damaged or incorrect item.</p>
        </div>
        <div className="rp-steps">
          <div className="rp-step">
            <div className="rp-step-num">1</div>
            <div>
              <p className="rp-step-title">Report within 2–3 days of delivery</p>
              <p className="rp-step-body">You must notify us within 2 to 3 days of receiving your order.</p>
            </div>
          </div>
          <div className="rp-step">
            <div className="rp-step-num">2</div>
            <div>
              <p className="rp-step-title">Record an unboxing video</p>
              <p className="rp-step-body">A clear, single, unedited unboxing video is <strong>mandatory</strong>. The clip must start with a 360° view of the unopened package, showing the shipping label and intact seal, and must clearly show the opening and defect.</p>
            </div>
          </div>
          <div className="rp-step">
            <div className="rp-step-num">3</div>
            <div>
              <p className="rp-step-title">Contact us with your Order ID + video</p>
              <p className="rp-step-body">Send both via WhatsApp or email to initiate the exchange process.</p>
            </div>
            
          </div>
             <div className="rp-contact-row" style={{ marginTop: 12 }}>
          <a href="https://wa.me/918356939586" className="rp-contact-btn rp-contact-btn--wa">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            WhatsApp: +91 8356939586
          </a>
          <a href="mailto:makeyousparkle5@gmail.com" className="rp-contact-btn rp-contact-btn--email">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            makeyousparkle5@gmail.com
          </a>
        </div>
        </div>
      </>
    ),
  },
{
  id: 'shipping-redelivery',
  icon: '📬',
  title: 'Shipping & Re-delivery',
  content: (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--rp-green-600)', marginBottom: 6 }}>
          📦 Approved Exchanges
        </p>
        <p>For exchanges approved due to our error, make you sparkle will cover <strong>all shipping charges</strong>.</p>
      </div>
      <div style={{ height: 1, background: 'var(--rp-green-100)' }} />
      <div>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--rp-green-600)', marginBottom: 6 }}>
          🔁 Prepaid Re-delivery
        </p>
        <p>If a prepaid order is returned because the customer was unavailable or did not accept the package, a new delivery attempt can be made — however, the customer must <strong>pay the shipping charges again</strong>.</p>
      </div>
    </div>
  ),
},
{
  id: 'refunds',
  icon: '💸',
  title: 'Refunds & Stock Issues',
  content: (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--rp-green-600)', marginBottom: 6 }}>
          📦 Out of Stock
        </p>
        <p>If an exchange is approved but the item is no longer available, we will issue a <strong>full refund</strong> to your original payment method.</p>
      </div>
      <div style={{ height: 1, background: 'var(--rp-green-100)' }} />
      <div>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--rp-green-600)', marginBottom: 6 }}>
          🕐 Extended Delivery Delay
        </p>
        <p>If your order has not arrived within <strong>30 days of dispatch</strong> due to courier issues, we will issue a refund.</p>
      </div>
      <div style={{ height: 1, background: 'var(--rp-green-100)' }} />
      <div>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--rp-green-600)', marginBottom: 6 }}>
          ✨ Exceptional Cases
        </p>
        <p>We may issue a refund sooner in exceptional cases, provided the customer <strong>reaches out to us directly</strong>.</p>
      </div>
    </div>
  ),
},
];

function AccordionSection({ section, open, onToggle }: { section: PolicySection; open: boolean; onToggle: () => void }) {
  return (
    <div className={`rp-acc-item${open ? ' rp-acc-item--open' : ''}`}>
      <button className="rp-acc-head" onClick={onToggle}>
        <span className="rp-acc-head-left">
          <span className="rp-acc-icon">{section.icon}</span>
          <span className="rp-acc-label">{section.title}</span>
          {section.badge && <span className="rp-acc-badge">{section.badge}</span>}
        </span>
        <span className="rp-acc-chevron">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>
      <div className={`rp-acc-body${open ? ' rp-acc-body--open' : ''}`}>
        <div className="rp-acc-body-inner">{section.content}</div>
      </div>
    </div>
  );
}

export default function RefundPolicies() {
  const [openId, setOpenId] = useState<string | null>('exchange');

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Jost:wght@300;400;500;600&display=swap');

        :root {
          --rp-beige: #f5f0e8;
          --rp-beige-dk: #ede5d5;
          --rp-beige-dkr: #d9cdb8;
          --rp-green-50: #f0f5ec;
          --rp-green-100: #dcebd3;
          --rp-green-200: #b8d5a7;
          --rp-green-400: #7aaa5e;
          --rp-green-500: #5a8c42;
          --rp-green-600: #3d6b29;
          --rp-green-700: #2a4d1c;
          --rp-gold: #c9a84c;
          --rp-ink: #1e2a14;
          --rp-mist: rgba(30,42,20,.45);
          --rp-red: #c0392b;
        }

        .rp-page {
          min-height: 100vh;
          background: var(--rp-beige);
          font-family: 'Jost', sans-serif;
          color: var(--rp-ink);
        }

        /* Hero */
        .rp-hero {
          background: linear-gradient(135deg, #709860 0%, var(--rp-green-600) 0%, #709860 100%);
          padding: 64px 24px 48px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .rp-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.04' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E");
        }
        .rp-hero-eyebrow {
          font-size: 10px;
          letter-spacing: .5em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.96);
          margin-bottom: 12px;
          display: block;
        }
        .rp-hero-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2rem, 5vw, 3.2rem);
          font-weight: 400;
          color: #fff;
          margin-bottom: 12px;
          line-height: 1.1;
        }
        .rp-hero-title em { font-style: italic; color: rgba(255,255,255,.82); }
        .rp-hero-sub {
          font-size: 13px;
          font-weight: 300;
          color: rgba(255,255,255,.72);
          max-width: 480px;
          margin: 0 auto;
          line-height: 1.7;
        }

        /* Back link */
        .rp-back {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: .1em;
          text-transform: uppercase;
          color: var(--rp-green-600);
          text-decoration: none;
          padding: 20px 24px 0;
          transition: color .2s;
        }
        .rp-back:hover { color: var(--rp-green-400); }

        /* Content */
        .rp-content {
          max-width: 760px;
          margin: 0 auto;
          padding: 32px 24px 64px;
        }

        /* Summary banner */
        .rp-summary-banner {
          background: linear-gradient(135deg, rgba(201,168,76,.12), rgba(61,107,41,.08));
          border: 1.5px solid rgba(201,168,76,.3);
          border-radius: 16px;
          padding: 20px 22px;
          margin-bottom: 28px;
          display: flex;
          align-items: flex-start;
          gap: 14px;
        }
        .rp-summary-banner-icon { font-size: 24px; flex-shrink: 0; }
        .rp-summary-banner-title {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: .14em;
          text-transform: uppercase;
          color: var(--rp-green-600);
          margin-bottom: 6px;
        }
        .rp-summary-banner-body {
          font-size: 13px;
          font-weight: 400;
          color: #101010;
          line-height: 1.75;
        }
        .rp-summary-banner-body strong { color: var(--rp-ink); font-weight: 600; }

        /* Accordion */
        .rp-acc-item {
          background: white;
          border: 1px solid var(--rp-green-100);
          border-radius: 14px;
          margin-bottom: 10px;
          overflow: hidden;
          transition: box-shadow .2s;
        }
        .rp-acc-item--open {
          box-shadow: 0 4px 20px rgba(61,107,41,.08);
          border-color: var(--rp-green-200);
        }
        .rp-acc-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 18px 20px;
          background: none;
          border: none;
          cursor: pointer;
          text-align: left;
          transition: background .15s;
          gap: 12px;
        }
        .rp-acc-head:hover { background: var(--rp-green-50); }
        .rp-acc-head-left { display: flex; align-items: center; gap: 10px; flex: 1; flex-wrap: wrap; }
        .rp-acc-icon { font-size: 18px; flex-shrink: 0; }
        .rp-acc-label {
          font-size: 13px;
          font-weight: 600;
          color: var(--rp-green-700);
          letter-spacing: .02em;
        }
        .rp-acc-badge {
          font-size: 8.5px;
          font-weight: 700;
          letter-spacing: .1em;
          text-transform: uppercase;
          color: #8c6b20;
          background: rgba(201,168,76,.15);
          padding: 2px 8px;
          border-radius: 4px;
        }
        .rp-acc-chevron {
          color: var(--rp-mist);
          transition: transform .32s ease;
          flex-shrink: 0;
        }
        .rp-acc-item--open .rp-acc-chevron { transform: rotate(180deg); }
        .rp-acc-body {
          max-height: 0;
          overflow: hidden;
          transition: max-height .38s cubic-bezier(.4,0,.2,1);
        }
        .rp-acc-body--open { max-height: 800px; }
        .rp-acc-body-inner {
          padding: 4px 20px 22px 48px;
          font-size: 13px;
          font-weight: 400;
          line-height: 1.85;
          color: #101010;
          letter-spacing: .03em;
        }
        .rp-acc-body-inner strong { font-weight: 600; color: var(--rp-ink); }

        /* Alert boxes */
        .rp-alert {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          background: rgba(192,57,43,.06);
          border: 1px solid rgba(192,57,43,.18);
          border-left: 3px solid rgba(192,57,43,.5);
          border-radius: 8px;
          padding: 12px 14px;
          font-size: 13px;
          font weight: 400;
          color: #101010;
        }
        .rp-alert svg { color: #c0392b; flex-shrink: 0; margin-top: 2px; }
        .rp-alert strong { color: #c0392b; }

        .rp-alert--green {
          background: var(--rp-green-50);
          border-color: var(--rp-green-100);
          border-left-color: var(--rp-green-400);
        }
        .rp-alert--green svg { color: var(--rp-green-500); }
        .rp-alert--green strong { color: var(--rp-green-600); }

        /* Steps */
        .rp-steps {
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-top: 16px;
        }
        .rp-step {
          display: flex;
          align-items: flex-start;
          gap: 14px;
        }
        .rp-step-num {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: var(--rp-green-600);
          color: white;
          font-size: 11px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .rp-step-title {
          font-size: 12.5px;
          font-weight: 600;
          color: var(--rp-ink);
          margin-bottom: 4px;
        }
        .rp-step-body {
          font-size: 13px;
          color: #101010;
          line-height: 1.7;
        }

        /* List */
        .rp-list {
          list-style: none;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .rp-list li {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          line-height: 1.7;
        }
        .rp-list li::before {
          content: '✦';
          color: var(--rp-green-400);
          font-size: 10px;
          margin-top: 4px;
          flex-shrink: 0;
        }

        /* Contact */
        .rp-contact-row { display: flex; gap: 10px; flex-wrap: wrap; }
        .rp-contact-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-family: 'Jost', sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: .1em;
          text-transform: uppercase;
          text-decoration: none;
          padding: 9px 18px;
          border-radius: 50px;
          transition: all .2s;
        }
  .rp-contact-btn--wa {
  background: rgba(101,158,124,.12);
  color: #2a6b47;
  border: 1.5px solid rgba(101,158,124,.35);
}
.rp-contact-btn--wa:hover {
  background: rgba(101,158,124,.22);
  border-color: rgba(101,158,124,.55);
}
.rp-contact-btn--email {
  background: rgba(184,213,167,.18);
  color: var(--rp-green-700);
  border: 1.5px solid var(--rp-green-200);
}
.rp-contact-btn--email:hover {
  background: rgba(184,213,167,.32);
  border-color: var(--rp-green-400);
}

        /* Footer */
        .rp-footer-note {
          text-align: center;
          font-size: 11px;
          color: var(--rp-mist);
          padding-top: 32px;
          border-top: 1px solid var(--rp-beige-dkr);
          margin-top: 32px;
        }

        /* Responsive */
        @media (max-width: 600px) {
          .rp-hero { padding: 48px 20px 36px; }
          .rp-content { padding: 24px 16px 48px; }
          .rp-acc-body-inner { padding: 4px 16px 18px 16px; }
          .rp-acc-head { padding: 16px 14px; }
          .rp-summary-banner { flex-direction: column; gap: 10px; }
        }
      `}</style>

      <div className="rp-page">
       

        <div className="rp-hero">
          <span className="rp-hero-eyebrow">make you sparkle</span>
          <h1 className="rp-hero-title">Returns, Refunds & <em>Exchange</em> Policy</h1>
          <p className="rp-hero-sub">We believe in transparency. Here's everything you need to know about our return and exchange process.</p>
        </div>

        <div className="rp-content">
          {/* Summary banner */}
          <div className="rp-summary-banner">
            <div className="rp-summary-banner-icon">📌</div>
            <div>
              <div className="rp-summary-banner-title">Quick Summary</div>
              <div className="rp-summary-banner-body">
                Prepaid orders are <strong>final sale</strong> — no returns or cancellations. COD orders can be cancelled before processing. We offer <strong>exchanges only</strong> for damaged or incorrect items, provided you report within 2–3 days with an unboxing video.
              </div>
            </div>
          </div>

          {/* Accordion sections */}
          {refundSections.map(section => (
            <AccordionSection
              key={section.id}
              section={section}
              open={openId === section.id}
              onToggle={() => setOpenId(o => o === section.id ? null : section.id)}
            />
          ))}

          <div className="rp-footer-note">
            © 2026 make you sparkle. All rights reserved.
          </div>
        </div>
      </div>
    </>
  );
}