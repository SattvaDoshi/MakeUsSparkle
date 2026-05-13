'use client';

import { useState } from 'react';

interface PolicySection {
  id: string;
  icon: string;
  title: string;
  content: React.ReactNode;
}

const shippingSections: PolicySection[] = [
  {
    id: 'where',
    icon: '🌍',
    title: 'Where We Ship',
    content: (
      <>
        <p>We currently support and process orders for delivery within <strong>India only</strong> through our website.</p>
        <p style={{ marginTop: 10 }}>
          <strong>International Orders:</strong> We do ship internationally! If you are located outside India, please contact us directly and we will assist you with a custom shipping quote and delivery details.
        </p>
      </>
    ),
  },
  {
    id: 'rates',
    icon: '📦',
    title: 'Shipping Rates & Timelines',
    content: (
      <>
        <p style={{ marginBottom: 14 }}>Delivery timelines are calculated starting from the day after your order is placed.</p>
        <div className="sp-table-wrap">
          <table className="sp-table">
            <thead>
              <tr>
                <th>Shipping Method</th>
                <th>Rate</th>
                <th>Metro Cities</th>
                <th>Rest of India</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><span className="sp-badge sp-badge--std">Standard</span></td>
                <td>₹60</td>
                <td>3–5 Business Days</td>
                <td>4–7 Business Days</td>
              </tr>
              <tr>
                <td><span className="sp-badge sp-badge--exp">Express</span></td>
                <td>₹110</td>
                <td>2–3 Business Days</td>
                <td>3–4 Business Days</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="sp-note-chip">
          <span>💝</span>
          <p><strong>Free Standard Shipping</strong> on all domestic orders above ₹999.</p>
        </div>
        <div className="sp-note-chip" style={{ marginTop: 8 }}>
          <span>💵</span>
          <p><strong>Cash on Delivery (COD)</strong> available for an additional convenience fee of ₹70 (Total shipping for COD: ₹130).</p>
        </div>
      </>
    ),
  },
  {
    id: 'dispatch',
    icon: '🚀',
    title: 'Dispatch Schedule',
    content: (
      <ul className="sp-list">
        <li><strong>Standard Dispatch:</strong> Orders are typically dispatched within 2 business days.</li>
        <li><strong>Express Dispatch:</strong> Orders placed before 11:00 PM qualify for Same-Day Dispatch.</li>
      </ul>
    ),
  },
  {
    id: 'tracking',
    icon: '📍',
    title: 'Order Tracking',
    content: (
      <>
        <p>We keep you informed every step of the way. You will receive real-time updates via:</p>
        <div className="sp-channel-grid">
          {['WhatsApp', 'SMS', 'Email'].map(ch => (
            <div key={ch} className="sp-channel-chip">{ch}</div>
          ))}
        </div>
        <p style={{ marginTop: 12 }}>You can also track your shipment status directly through your <strong>Profile → Track Order</strong> section on our website.</p>
      </>
    ),
  },
  {
    id: 'changes',
    icon: '✏️',
    title: 'Order & Address Changes',
    content: (
      <>
        <p>If you need to modify your order items or update your shipping address, please contact us <strong>immediately</strong>.</p>
        <p style={{ marginTop: 10 }}>Changes can only be made <strong>before the order is dispatched</strong>. Once the order has left our facility, we are unable to modify shipment details.</p>
        <p style={{ marginTop: 10 }}>Please ensure all details are correct at checkout to avoid delays or delivery failures.</p>
        <div className="sp-contact-row">
          <a href="https://wa.me/918356939586" className="sp-contact-btn sp-contact-btn--wa">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            WhatsApp Us
          </a>
          <a href="mailto:makeyousparkle5@gmail.com" className="sp-contact-btn sp-contact-btn--email">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            Email Us
          </a>
        </div>
      </>
    ),
  },
];

function AccordionSection({ section, open, onToggle }: { section: PolicySection; open: boolean; onToggle: () => void }) {
  return (
    <div className={`sp-acc-item${open ? ' sp-acc-item--open' : ''}`}>
      <button className="sp-acc-head" onClick={onToggle}>
        <span className="sp-acc-head-left">
          <span className="sp-acc-icon">{section.icon}</span>
          <span className="sp-acc-label">{section.title}</span>
        </span>
        <span className="sp-acc-chevron">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>
      <div className={`sp-acc-body${open ? ' sp-acc-body--open' : ''}`}>
        <div className="sp-acc-body-inner">{section.content}</div>
      </div>
    </div>
  );
}

export default function ShippingPolicies() {
  const [openId, setOpenId] = useState<string | null>('rates');

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Jost:wght@300;400;500;600&display=swap');

        :root {
          --sp-beige: #f5f0e8;
          --sp-beige-dk: #ede5d5;
          --sp-beige-dkr: #d9cdb8;
          --sp-green-50: #f0f5ec;
          --sp-green-100: #dcebd3;
          --sp-green-200: #b8d5a7;
          --sp-green-400: #7aaa5e;
          --sp-green-500: #5a8c42;
          --sp-green-600: #3d6b29;
          --sp-green-700: #2a4d1c;
          --sp-gold: #c9a84c;
          --sp-ink: #1e2a14;
          --sp-mist: rgba(30,42,20,.45);
        }

        .sp-page {
          min-height: 100vh;
          background: var(--sp-beige);
          font-family: 'Jost', sans-serif;
          color: var(--sp-ink);
        }

        /* Hero */
        .sp-hero {
          background: linear-gradient(135deg, var(--sp-green-600) 0%, var(--sp-green-500) 0%, #709860 100%);
          padding: 64px 24px 48px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .sp-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
        .sp-hero-eyebrow {
          font-size: 10px;
          letter-spacing: .5em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.97);
          margin-bottom: 12px;
          display: block;
        }
        .sp-hero-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2rem, 5vw, 3.2rem);
          font-weight: 400;
          color: #fff;
          margin-bottom: 12px;
          line-height: 1.1;
        }
        .sp-hero-title em {
          font-style: italic;
          color: rgba(255,255,255,.82);
        }
        .sp-hero-sub {
          font-size: 13px;
          font-weight: 300;
          color: rgba(255,255,255,.72);
          max-width: 480px;
          margin: 0 auto;
          line-height: 1.7;
        }

        /* Back link */
        .sp-back {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: .1em;
          text-transform: uppercase;
          color: var(--sp-green-600);
          text-decoration: none;
          padding: 20px 24px 0;
          transition: color .2s;
        }
        .sp-back:hover { color: var(--sp-green-400); }

        /* Content */
        .sp-content {
          max-width: 760px;
          margin: 0 auto;
          padding: 32px 24px 64px;
        }

        /* Quick info cards */
        .sp-quick-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 36px;
        }
        .sp-quick-card {
          background: white;
          border: 1px solid var(--sp-green-100);
          border-radius: 16px;
          padding: 18px 14px;
          text-align: center;
          transition: transform .2s, box-shadow .2s;
        }
        .sp-quick-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(61,107,41,.1);
        }
        .sp-quick-icon { font-size: 22px; margin-bottom: 8px; }
        .sp-quick-title {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: .1em;
          text-transform: uppercase;
          color: var(--sp-green-600);
          margin-bottom: 4px;
        }
        .sp-quick-val {
          font-size: 14px;
          color: #101010;
          font-weight: 400;
        }

        /* Accordion */
        .sp-acc-item {
          background: white;
          border: 1px solid var(--sp-green-100);
          border-radius: 14px;
          margin-bottom: 10px;
          overflow: hidden;
          transition: box-shadow .2s;
        }
        .sp-acc-item--open {
          box-shadow: 0 4px 20px rgba(61,107,41,.08);
          border-color: var(--sp-green-200);
        }
        .sp-acc-head {
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
        }
        .sp-acc-head:hover { background: var(--sp-green-50); }
        .sp-acc-head-left { display: flex; align-items: center; gap: 12px; }
        .sp-acc-icon { font-size: 18px; }
        .sp-acc-label {
          font-size: 14px;
          font-weight: 600;
          color: var(--sp-green-700);
          letter-spacing: .02em;
        }
        .sp-acc-chevron {
          color: var(--sp-mist);
          transition: transform .32s ease;
          flex-shrink: 0;
        }
        .sp-acc-item--open .sp-acc-chevron { transform: rotate(180deg); }
        .sp-acc-body {
          max-height: 0;
          overflow: hidden;
          transition: max-height .38s cubic-bezier(.4,0,.2,1);
        }
        .sp-acc-body--open { max-height: 600px; }
        .sp-acc-body-inner {
          padding: 4px 20px 22px 50px;
          font-size: 13px;
          font-weight: 400;
          line-height: 1.85;
          color: #101010;
          letter-spacing: .03em;
        }
        .sp-acc-body-inner strong { font-weight: 600; color: var(--sp-ink); }

        /* Table */
        .sp-table-wrap { overflow-x: auto; margin-bottom: 14px; }
        .sp-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
        }
        .sp-table th {
          background: var(--sp-green-50);
          color: var(--sp-green-600);
          font-size: 9.5px;
          letter-spacing: .18em;
          text-transform: uppercase;
          padding: 10px 14px;
          text-align: left;
          border-bottom: 1px solid var(--sp-green-100);
        }
        .sp-table td {
          padding: 12px 14px;
          border-bottom: 1px solid rgba(61,107,41,.06);
          color: var(--sp-ink);
          font-weight: 400;
        }
        .sp-table tr:last-child td { border-bottom: none; }
        .sp-badge {
          display: inline-block;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: .08em;
          text-transform: uppercase;
          padding: 3px 10px;
          border-radius: 50px;
        }
        .sp-badge--std { background: var(--sp-green-100); color: var(--sp-green-600); }
        .sp-badge--exp { background: rgba(201,168,76,.15); color: #8c6b20; }

        /* Note chips */
        .sp-note-chip {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          background: var(--sp-green-50);
          border: 1px solid var(--sp-green-100);
          border-radius: 10px;
          padding: 12px 14px;
          font-size: 14px;
          font-weight: 400
          color: #101010;
        }
        .sp-note-chip strong { color: var(--sp-green-600); font-weight: 600; }

        /* Channels */
        .sp-channel-grid {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin: 12px 0;
        }
        .sp-channel-chip {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: .06em;
          color: var(--sp-green-600);
          background: var(--sp-green-100);
          padding: 5px 14px;
          border-radius: 50px;
        }

        /* List */
        .sp-list {
          list-style: none;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .sp-list li {
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }
        .sp-list li::before {
          content: '✦';
          color: var(--sp-green-400);
          font-size: 10px;
          margin-top: 4px;
          flex-shrink: 0;
        }

        /* Contact buttons */
        .sp-contact-row {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 14px;
        }
        .sp-contact-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-family: 'Jost', sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: .1em;
          text-transform: uppercase;
          text-decoration: none;
          padding: 10px 20px;
          border-radius: 50px;
          transition: all .2s;
        }
        .sp-contact-btn--wa {
          background: #25d366;
          color: white;
        }
        .sp-contact-btn--wa:hover { background: #1ebe5d; }
        .sp-contact-btn--email {
          background: var(--sp-green-600);
          color: white;
        }
        .sp-contact-btn--email:hover { background: var(--sp-green-500); }

        /* Footer note */
        .sp-footer-note {
          text-align: center;
          font-size: 11px;
          color: var(--sp-mist);
          padding-top: 32px;
          border-top: 1px solid var(--sp-beige-dkr);
          margin-top: 32px;
        }

        /* Responsive */
        @media (max-width: 600px) {
          .sp-quick-grid { grid-template-columns: repeat(2, 1fr); }
          .sp-hero { padding: 48px 20px 36px; }
          .sp-content { padding: 24px 16px 48px; }
          .sp-acc-body-inner { padding: 4px 16px 18px 16px; }
          .sp-table { font-size: 11px; }
          .sp-table th, .sp-table td { padding: 8px 10px; }
        }
        @media (max-width: 380px) {
          .sp-quick-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="sp-page">
     

        <div className="sp-hero">
          <span className="sp-hero-eyebrow">make you sparkle</span>
          <h1 className="sp-hero-title">Shipping & <em>Delivery</em> Policy</h1>
          <p className="sp-hero-sub">Every order is handled with care to ensure your pieces arrive in perfect condition and without unnecessary delay.</p>
        </div>

        <div className="sp-content">
          {/* Quick summary cards */}
          <div className="sp-quick-grid">
            <div className="sp-quick-card">
              <div className="sp-quick-icon">🚚</div>
              <div className="sp-quick-title">Standard</div>
              <div className="sp-quick-val">3–7 days · ₹60</div>
            </div>
            <div className="sp-quick-card">
              <div className="sp-quick-icon">⚡</div>
              <div className="sp-quick-title">Express</div>
              <div className="sp-quick-val">2–4 days · ₹110</div>
            </div>
            <div className="sp-quick-card">
              <div className="sp-quick-icon">🎁</div>
              <div className="sp-quick-title">Free Shipping</div>
              <div className="sp-quick-val">Orders above ₹999</div>
            </div>
          </div>

          {/* Accordion sections */}
          {shippingSections.map(section => (
            <AccordionSection
              key={section.id}
              section={section}
              open={openId === section.id}
              onToggle={() => setOpenId(o => o === section.id ? null : section.id)}
            />
          ))}

          <div className="sp-footer-note">
            © 2026 make you sparkle. All rights reserved.
          </div>
        </div>
      </div>
    </>
  );
}