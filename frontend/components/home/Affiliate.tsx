'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { apiRequest } from '@/lib/api';
import UpperNav from '@/components/ui/UpperNav';

/* ─────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────── */
interface CommissionRow {
  id: string;
  referredName: string;
  orderAmount: number;
  date: string;      // ISO string
  earning: number;
  status: 'pending' | 'approved' | 'paid';
}

interface DashboardStats {
  totalReferrals: number;
  totalOrderValue: number;
  totalEarned: number;
  paidEarned: number;
  pendingEarned: number;
}

interface AffiliateMe {
  success: boolean;
  affiliateCode: string;
  affiliateLink: string;
}

interface AffiliateDashboard {
  success: boolean;
  commissions: CommissionRow[];
  stats: DashboardStats;
}

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */
function formatINR(amount: number) {
  return `₹${amount.toLocaleString('en-IN')}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

/* ─────────────────────────────────────────────────────────────
   AFFILIATE PAGE
───────────────────────────────────────────────────────────── */
export default function AffiliatePage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [copied, setCopied] = useState(false);

  const [affiliateLink, setAffiliateLink] = useState('');
  const [commissions, setCommissions] = useState<CommissionRow[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalReferrals: 0,
    totalOrderValue: 0,
    totalEarned: 0,
    paidEarned: 0,
    pendingEarned: 0,
  });
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setPageLoading(false);
      return;
    }
    fetchData();
  }, [isAuthenticated, authLoading]);

  async function fetchData() {
    setPageLoading(true);
    setError('');
    try {
      const [meRes, dashRes] = await Promise.all([
        apiRequest<AffiliateMe>('/affiliate/me'),
        apiRequest<AffiliateDashboard>('/affiliate/dashboard'),
      ]);
      const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
      let link = meRes.affiliateLink || '';
      if (meRes.affiliateCode && currentOrigin) {
        link = `${currentOrigin}/signup?ref=${meRes.affiliateCode}`;
      } else if (link && currentOrigin && link.includes('localhost')) {
        link = link.replace(/^https?:\/\/localhost(:\d+)?/, currentOrigin);
      }
      setAffiliateLink(link);
      setCommissions(dashRes.commissions);
      setStats(dashRes.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load affiliate data.');
    } finally {
      setPageLoading(false);
    }
  }

  function handleCopy() {
    if (!affiliateLink) return;
    navigator.clipboard.writeText(affiliateLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

        :root {
          --bg:       #f5f2eb;
          --surf:     #ffffff;
          --bdr:      #e0d8c8;
          --bdr2:     #c9bfa8;
          --olive:    #3d5016;
          --olive2:   #5a6e2b;
          --olivedim: #eef1e3;
          --gold:     #b8982a;
          --golddim:  #fdf8e8;
          --ink:      #1a1d0d;
          --ink7:     rgba(26,29,13,.7);
          --ink4:     rgba(26,29,13,.4);
          --green:    #2a6030;
          --greendim: rgba(42,96,48,.07);
          --sage:     #8a9e6a;
          --red:      #c0392b;
          --ffd:      'Cormorant Garamond', Georgia, serif;
          --ffb:      'DM Sans', system-ui, sans-serif;
          --shadow:   0 4px 24px rgba(26,29,13,.10);
          --shadow-lg:0 8px 40px rgba(26,29,13,.16);
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: var(--ffb); background: var(--bg); color: var(--ink); }
        button { font-family: var(--ffb); cursor: pointer; background: transparent; border: none; }
        img { display: block; max-width: 100%; }

        /* ── PAGE ── */
        .aff-page { min-height: 100dvh; background: var(--bg); }

        /* ── HERO ── */
        .aff-hero {
          padding: clamp(28px, 4vw, 52px) clamp(20px, 6vw, 72px) clamp(20px, 3vw, 36px);
          background: linear-gradient(155deg, #f5f2eb 0%, #ede5d0 55%, #f5f2eb 100%);
          border-bottom: 1px solid var(--bdr);
          position: relative; overflow: hidden;
        }
        .aff-hero::before {
          content: ''; position: absolute; right: -80px; top: -80px;
          width: 320px; height: 320px; border-radius: 50%;
          background: radial-gradient(circle, rgba(184,152,42,.1) 0%, transparent 68%);
          pointer-events: none;
        }
        .aff-eyebrow {
          display: flex; align-items: center; gap: 10px;
          font-size: 8px; letter-spacing: .44em; text-transform: uppercase;
          color: var(--gold); font-weight: 600; margin-bottom: 12px;
        }
        .aff-hero-line { width: 24px; height: 1px; background: var(--gold); opacity: .5; }
        .aff-hero h1 {
          font-family: var(--ffd); font-size: clamp(1.6rem, 4.5vw, 3rem);
          font-weight: 500; color: var(--olive); line-height: 1.1; margin-bottom: 8px;
        }
        .aff-hero h1 em { font-style: italic; color: var(--gold); }
        .aff-hero-desc {
          font-size: clamp(12px, 1.2vw, 13.5px); font-weight: 300;
          color: var(--ink7); max-width: 380px; line-height: 1.8;
        }

        /* ── BODY ── */
        .aff-body {
          padding: clamp(20px, 3vw, 32px) clamp(20px, 6vw, 72px) clamp(40px, 5vw, 64px);
          display: flex; flex-direction: column; gap: 20px;
        }

        /* ── LINK CARD ── */
        .aff-link-card {
          background: var(--surf); border: 1px solid var(--bdr);
          padding: 20px 24px; display: flex; flex-direction: column; gap: 10px;
        }
        .aff-link-label {
          font-size: 9px; font-weight: 600; letter-spacing: .18em;
          text-transform: uppercase; color: var(--ink4);
        }
        .aff-link-row { display: flex; gap: 10px; align-items: stretch; }
        .aff-link-input {
          flex: 1; min-width: 0;
          font-size: 12px; font-family: 'Courier New', monospace;
          padding: 10px 14px;
          border: 1.5px solid var(--bdr2); background: var(--bg);
          color: var(--ink); outline: none;
          transition: border-color .2s;
        }
        .aff-link-input:focus { border-color: var(--olive2); background: #fff; }
        .aff-copy-btn {
          flex-shrink: 0; display: flex; align-items: center; gap: 6px;
          font-size: 9px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase;
          padding: 10px 18px; border: 1.5px solid var(--bdr2);
          color: var(--ink7); transition: all .18s; min-height: 40px; white-space: nowrap;
        }
        .aff-copy-btn:hover { border-color: var(--olive2); color: var(--olive); background: var(--olivedim); }
        .aff-copy-btn.copied {
          background: var(--greendim); border-color: rgba(42,96,48,.3);
          color: var(--green);
        }
        .aff-copy-icon { font-size: 14px; }
        .aff-link-hint { font-size: 11px; color: #101010; line-height: 1.6; }

        /* ── STAT CARDS ── */
        .aff-stats {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;
        }
        @media(max-width: 640px) {
          .aff-stats { grid-template-columns: 1fr 1fr; }
          .aff-stats .aff-stat:last-child { grid-column: 1 / -1; }
        }
        .aff-stat {
          background: var(--surf); border: 1px solid var(--bdr); padding: 16px 18px;
        }
        .aff-stat-lbl {
          font-size: 8px; font-weight: 600; letter-spacing: .18em;
          text-transform: uppercase; color: var(--ink4); margin-bottom: 6px;
        }
        .aff-stat-val {
          font-family: var(--ffd); font-size: 1.6rem;
          font-weight: 500; color: var(--ink); line-height: 1;
        }
        .aff-stat-val.earn { color: var(--olive); }
        .aff-stat-note { font-size: 9px; color: #101010; margin-top: 4px; }

        /* ── TABLE CARD ── */
        .aff-table-card { background: var(--surf); border: 1px solid var(--bdr); overflow: hidden; }
        .aff-table-head {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 20px; border-bottom: 1px solid var(--bdr);
          background: linear-gradient(135deg, var(--olivedim), #ede9d8);
        }
        .aff-table-title { font-family: var(--ffd); font-size: 1.1rem; font-weight: 500; color: var(--olive); }
        .aff-table-badge {
          font-size: 8px; font-weight: 700; letter-spacing: .1em;
          text-transform: uppercase; background: rgba(61,80,22,.1); color: var(--olive2);
          padding: 3px 10px;
        }

        /* Table */
        .aff-table-wrap { overflow-x: auto; }
        .aff-table-wrap::-webkit-scrollbar { height: 3px; }
        .aff-table-wrap::-webkit-scrollbar-thumb { background: var(--bdr2); }
        table.aff-t { width: 100%; border-collapse: collapse; font-size: 12.5px; min-width: 560px; }
        table.aff-t thead tr { background: #fafaf6; }
        table.aff-t th {
          font-size: 8px; font-weight: 700; letter-spacing: .16em;
          text-transform: uppercase; color: var(--ink4);
          padding: 10px 18px; text-align: left;
          border-bottom: 1px solid var(--bdr);
        }
        table.aff-t th:nth-child(2),
        table.aff-t th:nth-child(4) { text-align: right; }
        table.aff-t th:last-child { text-align: center; }

        table.aff-t td {
          padding: 13px 18px; border-bottom: 1px solid var(--bdr);
          color: var(--ink); vertical-align: middle;
        }
        table.aff-t tbody tr:last-child td { border-bottom: none; }
        table.aff-t tbody tr:hover td { background: #fafaf6; }

        .td-name { font-weight: 500; }
        .td-amount { text-align: right; font-family: var(--ffd); font-size: 0.95rem; }
        .td-date { color: var(--ink4); font-size: 11px; }
        .td-earn {
          text-align: right;
          font-family: var(--ffd); font-size: 0.95rem;
          color: var(--olive); font-weight: 500;
        }
        .td-status { text-align: center; }
        .status-pill {
          display: inline-block; font-size: 8px; font-weight: 700;
          letter-spacing: .08em; text-transform: uppercase;
          padding: 3px 10px;
        }
        .status-paid     { background: var(--greendim); color: var(--green); }
        .status-approved { background: rgba(61,80,22,.08); color: var(--olive); }
        .status-pending  { background: rgba(184,152,42,.1); color: var(--gold); }

        /* Skeleton shimmer */
        @keyframes shimmer { from { background-position: -400px 0; } to { background-position: 400px 0; } }
        .aff-skeleton {
          background: linear-gradient(90deg, #ece8df 25%, #f5f2eb 50%, #ece8df 75%);
          background-size: 800px 100%;
          animation: shimmer 1.4s infinite linear;
          border-radius: 4px;
        }

        /* Empty / Error state */
        .aff-empty {
          padding: 40px 20px; text-align: center; color: var(--ink4);
          font-size: 13px; font-weight: 300; line-height: 1.8;
        }
        .aff-empty strong { display: block; font-size: 1rem; font-family: var(--ffd); color: var(--ink7); margin-bottom: 6px; }
        .aff-error {
          padding: 40px 20px; text-align: center; color: var(--red);
          font-size: 13px; font-weight: 300;
        }

        /* Not-logged-in banner */
        .aff-login-notice {
          background: var(--surf); border: 1px solid var(--bdr);
          padding: 28px 24px; text-align: center;
        }
        .aff-login-notice p { font-size: 13px; color: var(--ink7); line-height: 1.7; }
        .aff-login-btn {
          margin-top: 14px; display: inline-block;
          font-size: 9px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase;
          padding: 10px 24px; border: 1.5px solid var(--olive2);
          color: var(--olive); background: var(--olivedim);
          cursor: pointer; transition: all .18s;
        }
        .aff-login-btn:hover { background: var(--olive); color: #fff; }

        /* ── FOOTER NOTE ── */
        .aff-footer-note {
          font-size: 12px; color: #101010; line-height: 1.8;
          border-top: 1px solid var(--bdr); padding-top: 16px;
        }

        /* ── RESPONSIVE ── */
        @media(max-width: 760px) {
          .aff-hero, .aff-body { padding-left: 14px; padding-right: 14px; }
          .aff-hero { padding-top: 24px; }
        }
        @media(max-width: 480px) {
          .aff-link-row { flex-direction: column; }
          .aff-copy-btn { width: 100%; justify-content: center; }
        }
      `}</style>

      <div className="aff-page">
        <UpperNav />

        {/* HERO */}
        <div className="aff-hero" style={{ marginTop: 45 }}>
          <div className="aff-eyebrow">
            <span className="aff-hero-line" />
            <span>Affiliate Programme</span>
            <span className="aff-hero-line" />
          </div>
          <h1>Your <em>Referral</em><br />Dashboard</h1>
          <p className="aff-hero-desc">
            Share your link and earn <strong>10%</strong> on every order placed by people you refer to MakeUsSparkle.
          </p>
        </div>

        {/* BODY */}
        <div className="aff-body">

          {/* ── NOT LOGGED IN ── */}
          {!authLoading && !isAuthenticated && (
            <div className="aff-login-notice">
              <p>Please log in to access your affiliate dashboard and referral link.</p>
              <button
                className="aff-login-btn"
                onClick={() => window.dispatchEvent(new CustomEvent('makeussparkle:auth-open', { detail: { tab: 'login' } }))}
              >
                Sign in to continue
              </button>
            </div>
          )}

          {/* ── LOADING SKELETON ── */}
          {(authLoading || pageLoading) && isAuthenticated !== false && (
            <>
              <div className="aff-link-card">
                <div className="aff-skeleton" style={{ height: 14, width: 120, marginBottom: 8 }} />
                <div className="aff-skeleton" style={{ height: 40 }} />
              </div>
              <div className="aff-stats">
                {[0, 1, 2].map(i => (
                  <div key={i} className="aff-stat">
                    <div className="aff-skeleton" style={{ height: 10, width: 80, marginBottom: 10 }} />
                    <div className="aff-skeleton" style={{ height: 28, width: 100 }} />
                  </div>
                ))}
              </div>
              <div className="aff-table-card">
                <div className="aff-table-head">
                  <div className="aff-skeleton" style={{ height: 16, width: 140 }} />
                </div>
                <div style={{ padding: 20 }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} className="aff-skeleton" style={{ height: 14, marginBottom: 14 }} />
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── ERROR ── */}
          {error && !pageLoading && (
            <div className="aff-table-card">
              <div className="aff-error">
                <strong>Something went wrong</strong>
                {error}
                <br />
                <button
                  onClick={fetchData}
                  style={{ marginTop: 12, textDecoration: 'underline', color: 'inherit', cursor: 'pointer', background: 'none', border: 'none', fontSize: 'inherit' }}
                >
                  Try again
                </button>
              </div>
            </div>
          )}

          {/* ── AUTHENTICATED CONTENT ── */}
          {isAuthenticated && !pageLoading && !error && (
            <>
              {/* REFERRAL LINK */}
              <div className="aff-link-card">
                <div className="aff-link-label">Your referral link</div>
                <div className="aff-link-row">
                  <input
                    className="aff-link-input"
                    type="text"
                    value={affiliateLink}
                    readOnly
                    aria-label="Referral link"
                  />
                  <button
                    className={`aff-copy-btn${copied ? ' copied' : ''}`}
                    onClick={handleCopy}
                    aria-label={copied ? 'Link copied' : 'Copy referral link'}
                    disabled={!affiliateLink}
                  >
                    <span className="aff-copy-icon">{copied ? '✓' : '⎘'}</span>
                    {copied ? 'Copied!' : 'Copy link'}
                  </button>
                </div>
                <p className="aff-link-hint">
                  Share this link via WhatsApp, Instagram, or email. When someone places an order using it, you automatically earn 10% of their order value.
                </p>
              </div>

              {/* SUMMARY STATS */}
              <div className="aff-stats">
                <div className="aff-stat">
                  <div className="aff-stat-lbl">Total referrals</div>
                  <div className="aff-stat-val">{stats.totalReferrals}</div>
                </div>
                <div className="aff-stat">
                  <div className="aff-stat-lbl">Orders value</div>
                  <div className="aff-stat-val">{formatINR(stats.totalOrderValue)}</div>
                </div>
                <div className="aff-stat">
                  <div className="aff-stat-lbl">Total earned (10%)</div>
                  <div className="aff-stat-val earn">{formatINR(stats.totalEarned)}</div>
                  <div className="aff-stat-note">
                    {formatINR(stats.paidEarned)} paid · {formatINR(stats.pendingEarned)} pending
                  </div>
                </div>
              </div>

              {/* REFERRED ORDERS TABLE */}
              <div className="aff-table-card">
                <div className="aff-table-head">
                  <span className="aff-table-title">Referred orders</span>
                  <span className="aff-table-badge">
                    {commissions.length} order{commissions.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {commissions.length === 0 ? (
                  <div className="aff-empty">
                    <strong>No orders placed yet</strong>
                    {stats.totalReferrals > 0
                      ? 'Users have signed up with your link! When they place their first order, your 10% commission will appear here.'
                      : 'Share your link above to start earning!'}
                  </div>
                ) : (
                  <div className="aff-table-wrap">
                    <table className="aff-t">
                      <thead>
                        <tr>
                          <th>Referred person</th>
                          <th>Order amount</th>
                          <th>Date</th>
                          <th>Your earning (10%)</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {commissions.map(row => (
                          <tr key={row.id}>
                            <td className="td-name">{row.referredName}</td>
                            <td className="td-amount">{formatINR(row.orderAmount)}</td>
                            <td className="td-date">{formatDate(row.date)}</td>
                            <td className="td-earn">{formatINR(row.earning)}</td>
                            <td className="td-status">
                              <span className={`status-pill status-${row.status}`}>
                                {row.status === 'paid' ? '✓ Paid'
                                  : row.status === 'approved' ? '✔ Approved'
                                  : '⏳ Pending'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* FOOTER NOTE */}
              <p className="aff-footer-note">
                Earnings are calculated at 10% of the referred order&apos;s final value (after discounts, before shipping).
                Pending earnings are processed within 7 business days of the order being delivered.
                For queries, contact makeyousparkle5@gmail.com or WhatsApp at +91 8356939586.
              </p>
            </>
          )}

        </div>
      </div>
    </>
  );
}