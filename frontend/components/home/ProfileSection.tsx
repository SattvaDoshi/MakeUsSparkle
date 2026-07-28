
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/lib/authContext';

type View = 'main' | 'orders' | 'address' | 'password';

interface OrderItem {
  name: string;
  productId: string; // MongoDB _id for review API
  reviewed: boolean;
  rating: number;
  reviewText: string;
}

interface Order {
  id: string;
  date: string;
  items: OrderItem[];
  amount: string;
  status: string;
  shipping?: ShippingInfo;
}

const INITIAL_ORDERS: Order[] = [
  {
    id: 'MUS2401',
    date: '12 Apr 2025',
    items: [
      { productId: 'dummy1', name: 'Pearl Necklace', reviewed: false, rating: 0, reviewText: '' },
      { productId: 'dummy2', name: 'Stud Earrings', reviewed: false, rating: 0, reviewText: '' },
    ],
    amount: '₹1,299',
    status: 'Delivered',
  },
  {
    id: 'MUS2389',
    date: '28 Mar 2025',
    items: [
      { productId: 'dummy3', name: 'Custom Charm Bracelet', reviewed: false, rating: 0, reviewText: '' },
    ],
    amount: '₹849',
    status: 'Delivered',
  },
  {
    id: 'MUS2378',
    date: '10 Mar 2025',
    items: [
      { productId: 'dummy4', name: 'Gift Box — Couple Set', reviewed: false, rating: 0, reviewText: '' },
    ],
    amount: '₹1,999',
    status: 'Delivered',
  },
];

const POINTS_PER_REVIEW = 50;

interface ReviewModalProps {
  itemName: string;
  pointsPerReview: number;
  onClose: () => void;
  onSubmit: (rating: number, text: string, files: File[]) => void;
}

function ReviewModal({ itemName, pointsPerReview, onClose, onSubmit }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [text, setText] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0 || busy) return;
    setBusy(true);
    await onSubmit(rating, text, files);
    setBusy(false);
  };

  return (
    <div className="pf-overlay" onClick={onClose}>
      <div className="pf-dialog pf-review-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="pf-dialog-handle" />
        <p className="pf-review-item-name">{itemName}</p>
        <h3 className="pf-dialog-title">How was it?</h3>
        <div className="pf-stars-row">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              className={`pf-star ${s <= (hovered || rating) ? 'active' : ''}`}
              onMouseEnter={() => setHovered(s)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setRating(s)}
            >
              ★
            </button>
          ))}
        </div>
        <textarea
          className="pf-review-textarea"
          placeholder="Share your experience… (optional)"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
        />
        <div style={{ margin: '12px 0' }}>
          <label style={{ display: 'inline-block', cursor: 'pointer', fontSize: 13, color: 'var(--olive-600)', fontWeight: 600, border: '1px solid var(--olive-600)', padding: '6px 12px', borderRadius: 4 }}>
            <input
              type="file"
              multiple
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => {
                if (e.target.files) {
                  setFiles((prev) => [...prev, ...Array.from(e.target.files as FileList)]);
                }
              }}
            />
            + Add Photos
          </label>
          {files.length > 0 && (
            <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
              {files.map((file, idx) => (
                <div key={idx} style={{ position: 'relative', width: 56, height: 56 }}>
                  <img
                    src={URL.createObjectURL(file)}
                    alt="Preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }}
                  />
                  <button
                    type="button"
                    onClick={() => setFiles((prev) => prev.filter((_, i) => i !== idx))}
                    style={{
                      position: 'absolute',
                      top: -6,
                      right: -6,
                      background: 'var(--red)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: 18,
                      height: 18,
                      fontSize: 10,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="pf-reward-hint">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          Earn <strong>{pointsPerReview} Sparkle Points</strong> for this review
        </div>
        <div className="pf-dialog-actions">
          <button className="pf-dialog-cancel" onClick={onClose} disabled={busy}>Cancel</button>
          <button
            className="pf-dialog-confirm pf-review-submit"
            disabled={rating === 0 || busy}
            onClick={handleSubmit}
          >
            {busy ? 'Submitting…' : 'Submit & Earn'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function LegacyProfileSection() {
  const [view, setView] = useState<View>('main');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [reviewTarget, setReviewTarget] = useState<{ orderId: string; itemIndex: number } | null>(null);
  const [rewardPoints, setRewardPoints] = useState(120); // existing points
  const [justEarned, setJustEarned] = useState<number | null>(null);

  const totalReviewed = orders.flatMap((o) => o.items).filter((i) => i.reviewed).length;
  const pendingReviews = orders
    .filter((o) => o.status === 'Delivered')
    .flatMap((o) => o.items)
    .filter((i) => !i.reviewed).length;

  function handleSubmitReview(rating: number, text: string) {
    if (!reviewTarget) return;
    setOrders((prev) =>
      prev.map((o) =>
        o.id === reviewTarget.orderId
          ? {
              ...o,
              items: o.items.map((item, idx) =>
                idx === reviewTarget.itemIndex
                  ? { ...item, reviewed: true, rating, reviewText: text }
                  : item
              ),
            }
          : o
      )
    );
    setRewardPoints((p) => p + POINTS_PER_REVIEW);
    setJustEarned(POINTS_PER_REVIEW);
    setTimeout(() => setJustEarned(null), 3000);
    setReviewTarget(null);
  }

  const reviewingItem = reviewTarget
    ? orders.find((o) => o.id === reviewTarget.orderId)?.items[reviewTarget.itemIndex]
    : null;

  // Reward tier
  const tier =
    rewardPoints >= 500 ? { name: 'Gold', color: '#c8992e', next: null, nextAt: 500 } :
    rewardPoints >= 250 ? { name: 'Silver', color: '#8a9ba8', next: 'Gold', nextAt: 500 } :
    { name: 'Bronze', color: '#a97c50', next: 'Silver', nextAt: 250 };

  const progress = tier.nextAt ? Math.min((rewardPoints / tier.nextAt) * 100, 100) : 100;

  return (
    <>
      <style>{CSS}</style>
      <section className="pf">

        {/* Hero */}
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

        {/* ── MAIN VIEW ── */}
        {view === 'main' && (
          <div className="pf-body">

            {/* Reward Summary Card */}
            <div className="pf-reward-card">
              <div className="pf-reward-card-top">
                <div>
                  <p className="pf-reward-label">Sparkle Points</p>
                  <p className="pf-reward-pts">
                    {rewardPoints}
                    <span className="pf-reward-pts-unit"> pts</span>
                  </p>
                </div>
                <div className="pf-reward-tier-badge" style={{ background: tier.color + '22', color: tier.color, borderColor: tier.color + '55' }}>
                  ✦ {tier.name}
                </div>
              </div>
              {tier.next && (
                <>
                  <div className="pf-reward-bar-track">
                    <div className="pf-reward-bar-fill" style={{ width: `${progress}%`, background: tier.color }} />
                  </div>
                  <p className="pf-reward-bar-hint">
                    {tier.nextAt! - rewardPoints} pts to {tier.next}
                  </p>
                </>
              )}
              {pendingReviews > 0 && (
                <button className="pf-reward-cta" onClick={() => setView('orders')}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                  Review {pendingReviews} item{pendingReviews > 1 ? 's' : ''} · Earn {pendingReviews * POINTS_PER_REVIEW} pts
                </button>
              )}
            </div>

            <div className="pf-section-label" style={{ marginTop: 24 }}>Account</div>
            <div className="pf-list">
              <button className="pf-item" onClick={() => setView('orders')}>
                <span className="pf-item-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="2"/></svg>
                </span>
                <span className="pf-item-txt">
                  <span className="pf-item-name">Order History</span>
                  <span className="pf-item-sub">{orders.length} past orders{pendingReviews > 0 ? ` · ${pendingReviews} awaiting review` : ''}</span>
                </span>
                {pendingReviews > 0 && <span className="pf-item-dot" />}
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

            <button className="pf-logout" onClick={() => setShowLogoutConfirm(true)}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Log out
            </button>
          </div>
        )}

        {/* ── ORDER HISTORY VIEW ── */}
        {view === 'orders' && (
          <div className="pf-body">
            <button className="pf-back" onClick={() => setView('main')}>← Back</button>
            <div className="pf-section-label">Order History</div>

            {pendingReviews > 0 && (
              <div className="pf-review-banner">
                <div className="pf-review-banner-icon">✦</div>
                <div>
                  <p className="pf-review-banner-title">Review & Earn</p>
                  <p className="pf-review-banner-sub">Earn {POINTS_PER_REVIEW} Sparkle Points per review. {pendingReviews} item{pendingReviews > 1 ? 's' : ''} waiting!</p>
                </div>
              </div>
            )}

            <div className="pf-orders">
              {orders.map((o) => (
                <div key={o.id} className="pf-order">
                  <div className="pf-order-top">
                    <span className="pf-order-id">#{o.id}</span>
                    <span className={`pf-order-status ${o.status.toLowerCase()}`}>{o.status}</span>
                  </div>
                  <div className="pf-order-date-row">
                    <span className="pf-order-date">{o.date}</span>
                    <span className="pf-order-amt">{o.amount}</span>
                  </div>

                  {/* Per-product rows */}
                  <div className="pf-order-products">
                    {o.items.map((item, idx) => (
                      <div key={idx} className="pf-product-row">
                        <div className="pf-product-info">
                          <span className="pf-product-name">{item.name}</span>
                          {item.reviewed && (
                            <span className="pf-product-stars">
                              {'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}
                            </span>
                          )}
                        </div>
                        {o.status === 'Delivered' && (
                          item.reviewed ? (
                            <span className="pf-reviewed-badge">✓ Reviewed</span>
                          ) : (
                            <button
                              className="pf-review-btn"
                              onClick={() => setReviewTarget({ orderId: o.id, itemIndex: idx })}
                            >
                              Review &amp; Earn
                            </button>
                          )
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Reward Points Section */}
            <div className="pf-section-label" style={{ marginTop: 28 }}>Your Rewards</div>
            <div className="pf-reward-full-card">
              <div className="pf-reward-full-top">
                <div>
                  <p className="pf-reward-full-label">Total Sparkle Points</p>
                  <p className="pf-reward-full-pts">
                    {rewardPoints}<span className="pf-reward-full-unit"> pts</span>
                  </p>
                </div>
                <div className="pf-reward-full-tier" style={{ color: tier.color }}>
                  <div className="pf-reward-full-tier-icon" style={{ background: tier.color + '22', border: `1px solid ${tier.color}55` }}>✦</div>
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase' }}>{tier.name}</span>
                </div>
              </div>

              {tier.next && (
                <div className="pf-reward-progress-wrap">
                  <div className="pf-reward-bar-track">
                    <div className="pf-reward-bar-fill" style={{ width: `${progress}%`, background: tier.color }} />
                  </div>
                  <p className="pf-reward-bar-hint">{tier.nextAt! - rewardPoints} more pts to reach {tier.next}</p>
                </div>
              )}

              <div className="pf-reward-breakdown">
                <div className="pf-reward-stat">
                  <span className="pf-reward-stat-val">{totalReviewed}</span>
                  <span className="pf-reward-stat-lbl">Reviews</span>
                </div>
                <div className="pf-reward-divider" />
                <div className="pf-reward-stat">
                  <span className="pf-reward-stat-val">{totalReviewed * POINTS_PER_REVIEW}</span>
                  <span className="pf-reward-stat-lbl">Pts Earned</span>
                </div>
                <div className="pf-reward-divider" />
                <div className="pf-reward-stat">
                  <span className="pf-reward-stat-val">{pendingReviews}</span>
                  <span className="pf-reward-stat-lbl">Pending</span>
                </div>
              </div>

              {/* <div className="pf-reward-how">
                <p className="pf-reward-how-title">How to earn</p>
                <div className="pf-reward-how-row">
                  <span className="pf-reward-how-icon">✍</span>
                  <span>Write a product review</span>
                  <span className="pf-reward-how-pts">+{POINTS_PER_REVIEW} pts</span>
                </div>
                <div className="pf-reward-how-row">
                  <span className="pf-reward-how-icon">🛍</span>
                  <span>Every purchase</span>
                  <span className="pf-reward-how-pts">+10 pts</span>
                </div>
                <div className="pf-reward-how-row">
                  <span className="pf-reward-how-icon">🎂</span>
                  <span>Birthday bonus</span>
                  <span className="pf-reward-how-pts">+100 pts</span>
                </div>
              </div> */}
            </div>
          </div>
        )}

        {/* ── ADDRESS VIEW ── */}
        {view === 'address' && (
          <div className="pf-body">
            <button className="pf-back" onClick={() => setView('main')}>← Back</button>
            <div className="pf-section-label">Saved Addresses</div>
            <div className="pf-address-card">
              <div className="pf-address-top">
                <span className="pf-address-tag">Home</span>
                <button className="pf-address-edit">Edit</button>
              </div>
              <p className="pf-address-txt">Priya Sharma<br />42, Rose Garden Society<br />Andheri West, Mumbai – 400053<br />Maharashtra, India</p>
            </div>
            <button className="pf-add-address">+ Add New Address</button>
          </div>
        )}

        {/* ── PASSWORD VIEW ── */}
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

        {/* ── LOGOUT CONFIRM ── */}
        {showLogoutConfirm && (
          <div className="pf-overlay" onClick={() => setShowLogoutConfirm(false)}>
            <div className="pf-dialog" onClick={(e) => e.stopPropagation()}>
              <div className="pf-dialog-handle" />
              <h3 className="pf-dialog-title">Log out?</h3>
              <p className="pf-dialog-sub">You&apos;ll need to sign in again to access your account.</p>
              <div className="pf-dialog-actions">
                <button className="pf-dialog-cancel" onClick={() => setShowLogoutConfirm(false)}>Cancel</button>
                <button className="pf-dialog-confirm">Log out</button>
              </div>
            </div>
          </div>
        )}

        {/* ── REVIEW MODAL ── */}
        {reviewTarget && reviewingItem && (
          <ReviewModal
            itemName={reviewingItem.name}
            pointsPerReview={POINTS_PER_REVIEW}
            onClose={() => setReviewTarget(null)}
            onSubmit={handleSubmitReview}
          />
        )}

        {/* ── TOAST ── */}
        {justEarned !== null && (
          <div className="pf-toast">
            ✦ +{justEarned} Sparkle Points earned!
          </div>
        )}
      </section>
    </>
  );
}

type ShippingInfo = {
  awbNumber?: string | null;
  logisticName?: string | null;
  trackingUrl?: string | null;
  currentStatus?: string | null;
  currentStatusCode?: string | null;
  expectedDeliveryDate?: string | null;
  lastSyncedAt?: string | null;
};

type BackendOrder = {
  _id: string;
  items: Array<{
    product?: { _id?: string; name?: string } | string;
    sourceId?: string;
    _id?: string;
    name?: string;
    productId?: string;
    reviewed?: boolean;
    rating?: number;
    reviewText?: string;
    quantity?: number;
    price?: number;
  }>;
  totalAmount?: number;
  status?: string;
  createdAt?: string;
  shipping?: ShippingInfo;
};

export default function ProfileSection() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading, signOut, refreshUser } = useAuth();
  const [view, setView] = useState<View>('main');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressBusy, setAddressBusy] = useState(false);
  const [deletingAddressId, setDeletingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState({
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    alternativePhone: '',
  });

  useEffect(() => {
    let active = true;

    const loadAccount = async () => {
      if (!isAuthenticated) {
        if (active) {
          setOrders([]);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setError('');

      try {
        const result = await apiRequest<{ success: boolean; orders: BackendOrder[] }>('/orders/my-orders');
        if (!active) {
          return;
        }

        setOrders((result.orders || []).map((order) => ({
          id: order._id,
          date: order.createdAt
            ? new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
            : 'Recently',
          items: (order.items || []).map((item) => ({
            name: item.name || (typeof item.product === 'object' && item.product ? item.product.name || 'Order item' : 'Order item'),
            productId: item.productId || (typeof item.product === 'object' && item.product ? item.product._id || '' : item.sourceId || item._id || ''),
            reviewed: Boolean(item.reviewed),
            rating: item.rating || 0,
            reviewText: item.reviewText || '',
          })),
          amount: `₹${Number(order.totalAmount || 0).toLocaleString('en-IN')}`,
          status: (order.status || 'placed').charAt(0).toUpperCase() + (order.status || 'placed').slice(1),
          shipping: order.shipping,
        })));
      } catch (requestError) {
        if (active) {
          setError(requestError instanceof Error ? requestError.message : 'Failed to load your account.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadAccount();

    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  const addresses = user?.addresses ?? [];
  const [rewardPoints, setRewardPoints] = useState(0);
  const [pointsPerReview, setPointsPerReview] = useState(50);
  const [reviewTarget, setReviewTarget] = useState<{ orderId: string; itemIndex: number } | null>(null);
  const [justEarned, setJustEarned] = useState<number | null>(null);

  // Fetch real reward points balance from backend
  useEffect(() => {
    if (!isAuthenticated) return;
    apiRequest<{ success: boolean; rewardPoints: number }>('/rewards/points')
      .then((data) => setRewardPoints(data.rewardPoints || 0))
      .catch(() => setRewardPoints(0));
  }, [isAuthenticated]);

  // Fetch points-per-review setting (for display in review modal)
  useEffect(() => {
    apiRequest<{ success: boolean; pointsPerReview: number }>('/rewards/settings')
      .then((data) => setPointsPerReview(data.pointsPerReview || 50))
      .catch(() => setPointsPerReview(50));
  }, []);

  const pendingReviews = orders
    .filter((o) => o.status === 'Delivered')
    .reduce((count, order) => count + order.items.filter((i) => !i.reviewed).length, 0);

  const tier =
    rewardPoints >= 500 ? { name: 'Gold', color: '#c8992e', next: null, nextAt: 500 } :
    rewardPoints >= 250 ? { name: 'Silver', color: '#8a9ba8', next: 'Gold', nextAt: 500 } :
    { name: 'Bronze', color: '#a97c50', next: 'Silver', nextAt: 250 };

  const progress = tier.nextAt ? Math.min((rewardPoints / tier.nextAt) * 100, 100) : 100;

  const heroName = user?.name || 'Guest';
  const heroEmail = user?.email || 'Sign in to see your account details';
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : 'Recently joined';

  const formatAddress = (address: NonNullable<typeof addresses>[number]) => {
    const parts = [
      address.addressLine1 || address.fullAddress,
      address.addressLine2,
      address.city,
      address.state,
      address.pincode
    ].filter(Boolean);
    return parts.join(', ');
  };

  const resetAddressForm = () => {
    setAddressForm({ addressLine1: '', addressLine2: '', landmark: '', city: '', state: '', pincode: '', phone: '', alternativePhone: '' });
    setEditingAddressId(null);
    setIsAddressFormOpen(false);
  };

  const openAddAddressForm = () => {
    setAddressForm({ addressLine1: '', addressLine2: '', landmark: '', city: '', state: '', pincode: '', phone: '', alternativePhone: '' });
    setEditingAddressId(null);
    setIsAddressFormOpen(true);
  };

  const startEditAddress = (address: NonNullable<typeof addresses>[number]) => {
    setAddressForm({
      addressLine1: address.addressLine1 || address.fullAddress || '',
      addressLine2: address.addressLine2 || '',
      landmark: address.landmark || '',
      city: address.city || '',
      state: address.state || '',
      pincode: address.pincode || '',
      phone: address.phone || '',
      alternativePhone: address.alternativePhone || '',
    });
    setEditingAddressId(address._id || null);
    setIsAddressFormOpen(true);
  };

  const submitAddressForm = async () => {
    const payload = {
      addressLine1: addressForm.addressLine1.trim(),
      addressLine2: addressForm.addressLine2.trim(),
      landmark: addressForm.landmark.trim(),
      fullAddress: `${addressForm.addressLine1.trim()}${addressForm.addressLine2.trim() ? ', ' + addressForm.addressLine2.trim() : ''}`,
      city: addressForm.city.trim(),
      state: addressForm.state.trim(),
      pincode: addressForm.pincode.trim(),
      phone: addressForm.phone.trim(),
      alternativePhone: addressForm.alternativePhone.trim(),
    };

    if (!payload.addressLine1 || !payload.city || !payload.state || !payload.pincode || !payload.phone) {
      setError('Please fill all mandatory address fields.');
      return;
    }
    if (payload.pincode.length !== 6 || !/^\d{6}$/.test(payload.pincode)) {
      setError('Pincode must be exactly 6 digits.'); return;
    }
    if (payload.phone.length !== 10 || !/^\d{10}$/.test(payload.phone)) {
      setError('Phone number must be exactly 10 digits.'); return;
    }
    if (payload.alternativePhone && (payload.alternativePhone.length !== 10 || !/^\d{10}$/.test(payload.alternativePhone))) {
      setError('Alternative phone number must be exactly 10 digits.'); return;
    }

    try {
      setAddressBusy(true);
      setError('');

      if (editingAddressId) {
        await apiRequest(`/users/address/${editingAddressId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await apiRequest('/users/address', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }

      await refreshUser();
      resetAddressForm();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to save address.');
    } finally {
      setAddressBusy(false);
    }
  };

  const handleDeleteAddress = async (addressId?: string) => {
    if (!addressId) {
      return;
    }

    const confirmDelete = window.confirm('Delete this address?');
    if (!confirmDelete) {
      return;
    }

    try {
      setDeletingAddressId(addressId);
      setError('');
      await apiRequest(`/users/address/${addressId}`, {
        method: 'DELETE',
      });
      await refreshUser();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to delete address.');
    } finally {
      setDeletingAddressId(null);
    }
  };

  const handleLogout = () => {
    signOut();
    router.push('/');
  };

  const handleSubmitReview = async (rating: number, text: string, files: File[] = []) => {
    if (!reviewTarget) return;
    const order = orders.find((o) => o.id === reviewTarget.orderId);
    const item = order?.items[reviewTarget.itemIndex];
    if (!item || !item.productId) {
      setError('Could not identify the product. Please try again.');
      setReviewTarget(null);
      return;
    }
    try {
      const formData = new FormData();
      formData.append('productId', item.productId);
      formData.append('rating', String(rating));
      formData.append('body', text || item.name);
      if (files && files.length > 0) {
        files.forEach((file) => {
          formData.append('images', file);
        });
      }

      const result = await apiRequest<{
        success: boolean;
        pointsAwarded: number;
        isVerifiedPurchase: boolean;
      }>('/reviews', {
        method: 'POST',
        body: formData as any,
      });

      // Mark item as reviewed in local state
      setOrders((prev) =>
        prev.map((o) =>
          o.id === reviewTarget.orderId
            ? {
                ...o,
                items: o.items.map((it, idx) =>
                  idx === reviewTarget.itemIndex
                    ? { ...it, reviewed: true, rating }
                    : it
                ),
              }
            : o
        )
      );

      // Update points balance
      if (result.pointsAwarded > 0) {
        setRewardPoints((p) => p + result.pointsAwarded);
        setJustEarned(result.pointsAwarded);
        setTimeout(() => setJustEarned(null), 3500);
      } else {
        setJustEarned(0); // submitted but no points (non-purchaser)
        setTimeout(() => setJustEarned(null), 3500);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review. Please try again.');
    } finally {
      setReviewTarget(null);
    }
  };

  if (authLoading || loading) {
    return (
      <>
        <style>{CSS}</style>
        <section className="pf">
          <div className="pf-hero">
            <div className="pf-avatar"><span className="pf-avatar-init">…</span></div>
            <div className="pf-hero-info">
              <h1 className="pf-name">Loading account</h1>
              <p className="pf-email">Fetching your profile details...</p>
              <span className="pf-badge">Please wait</span>
            </div>
          </div>
        </section>
      </>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <>
        <style>{CSS}</style>
        <section className="pf">
          <div className="pf-hero">
            <div className="pf-avatar"><span className="pf-avatar-init">?</span></div>
            <div className="pf-hero-info">
              <h1 className="pf-name">Welcome back</h1>
              <p className="pf-email">Sign in to view your saved details.</p>
              <span className="pf-badge">Account locked</span>
            </div>
          </div>
          <div className="pf-body">
            <button className="pf-item" onClick={() => window.dispatchEvent(new CustomEvent('makeussparkle:auth-open', { detail: { tab: 'login' } }))}>
              <span className="pf-item-txt">
                <span className="pf-item-name">Login / Signup</span>
                <span className="pf-item-sub">Open the sign in form to access your account.</span>
              </span>
              <span className="pf-chevron">›</span>
            </button>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <style>{CSS}</style>
      <section className="pf">
        <div className="pf-hero">
          <div className="pf-avatar">
            <span className="pf-avatar-init">{heroName.charAt(0).toUpperCase()}</span>
          </div>
          <div className="pf-hero-info">
            <h1 className="pf-name">{heroName}</h1>
            <p className="pf-email">{heroEmail}</p>
            <span className="pf-badge">Member since {memberSince}</span>
          </div>
        </div>

        {view === 'main' && (
          <div className="pf-body">
            <div className="pf-reward-card">
              <div className="pf-reward-card-top">
                <div>
                  <p className="pf-reward-label">Sparkle Points</p>
                  <p className="pf-reward-pts">{rewardPoints}<span className="pf-reward-pts-unit"> pts</span></p>
                </div>
                <div className="pf-reward-tier-badge" style={{ background: `${tier.color}22`, color: tier.color, borderColor: `${tier.color}55` }}>
                  ✦ {tier.name}
                </div>
              </div>
              {tier.next && (
                <>
                  <div className="pf-reward-bar-track">
                    <div className="pf-reward-bar-fill" style={{ width: `${progress}%`, background: tier.color }} />
                  </div>
                  <p className="pf-reward-bar-hint">{tier.nextAt! - rewardPoints} pts to {tier.next}</p>
                </>
              )}
              <button className="pf-reward-cta" onClick={() => setView('orders')}>
                View {orders.length} order{orders.length === 1 ? '' : 's'}
              </button>
            </div>

            <div className="pf-section-label" style={{ marginTop: 24 }}>Account</div>
            <div className="pf-list">
              <button className="pf-item" onClick={() => setView('orders')}>
                <span className="pf-item-icon">⌁</span>
                <span className="pf-item-txt">
                  <span className="pf-item-name">Order History</span>
                  <span className="pf-item-sub">{orders.length} past orders{pendingReviews > 0 ? ` · ${pendingReviews} items` : ''}</span>
                </span>
                <span className="pf-chevron">›</span>
              </button>

              <button className="pf-item" onClick={() => setView('address')}>
                <span className="pf-item-icon">⌂</span>
                <span className="pf-item-txt">
                  <span className="pf-item-name">Saved Addresses</span>
                  <span className="pf-item-sub">{addresses.length > 0 ? `${addresses.length} saved address${addresses.length > 1 ? 'es' : ''}` : 'Manage delivery addresses'}</span>
                </span>
                <span className="pf-chevron">›</span>
              </button>

              <button className="pf-item" onClick={() => setView('password')}>
                <span className="pf-item-icon">⌘</span>
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
                <span className="pf-item-icon">✉</span>
                <span className="pf-item-txt">
                  <span className="pf-item-name">Contact Support</span>
                  <span className="pf-item-sub">support@makeussparkle.com</span>
                </span>
                <span className="pf-chevron">›</span>
              </a>
            </div>

            <button className="pf-logout" onClick={() => setShowLogoutConfirm(true)}>Log out</button>
          </div>
        )}

        {view === 'orders' && (
          <div className="pf-body">
            <button className="pf-back" onClick={() => setView('main')}>← Back</button>
            <div className="pf-section-label">Order History</div>

            {pendingReviews > 0 && (
              <div className="pf-review-banner">
                <div className="pf-review-banner-icon">✦</div>
                <div>
                  <p className="pf-review-banner-title">Review & Earn</p>
                  <p className="pf-review-banner-sub">Earn {pointsPerReview} Sparkle Points per review. {pendingReviews} item{pendingReviews > 1 ? 's' : ''} waiting!</p>
                </div>
              </div>
            )}

            <div className="pf-orders">
              {orders.length > 0 ? orders.map((order) => (
                <div key={order.id} className="pf-order">
                  <div className="pf-order-top">
                    <span className="pf-order-id">#{order.id}</span>
                    <span className={`pf-order-status ${order.status.toLowerCase()}`}>{order.status}</span>
                  </div>
                  <div className="pf-order-date-row">
                    <span className="pf-order-date">{order.date}</span>
                    <span className="pf-order-amt">{order.amount}</span>
                  </div>

                  {/* ── Shipment Timeline ── */}
                  {order.shipping?.awbNumber && (() => {
                    const STEPS = ['Manifested', 'Picked Up', 'In Transit', 'Out For Delivery', 'Delivered'];
                    const code = (order.shipping.currentStatusCode || '').toUpperCase();
                    const str  = (order.shipping.currentStatus || '').toLowerCase();
                    const activeStep =
                      code === 'DL' || str.includes('deliver') ? 4 :
                      code === 'UD' || str.includes('out for') ? 3 :
                      ['IT', 'NDR', 'EX'].includes(code) || str.includes('transit') ? 2 :
                      ['PU', 'OP'].includes(code) || str.includes('pick') ? 1 :
                      0;
                    return (
                      <div style={{ marginTop: 12, marginBottom: 4 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#2d5a27', marginBottom: 8 }}>
                          Shipment Tracking
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                          {STEPS.map((step, i) => (
                            <div key={step} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? '1 1 0' : 'none' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                                <div style={{
                                  width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                                  background: i <= activeStep ? '#2d5a27' : '#e0e0e0',
                                  border: i === activeStep ? '3px solid #2d5a27' : '2px solid ' + (i < activeStep ? '#2d5a27' : '#ccc'),
                                  boxSizing: 'border-box',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                  {i < activeStep && <span style={{ color: 'white', fontSize: 10, fontWeight: 900 }}>✓</span>}
                                </div>
                                <span style={{ fontSize: 9, color: i <= activeStep ? '#2d5a27' : '#aaa', fontWeight: 700, whiteSpace: 'nowrap', textAlign: 'center' }}>
                                  {step}
                                </span>
                              </div>
                              {i < STEPS.length - 1 && (
                                <div style={{ flex: 1, height: 2, background: i < activeStep ? '#2d5a27' : '#e0e0e0', marginBottom: 20, minWidth: 8 }} />
                              )}
                            </div>
                          ))}
                        </div>
                        <div style={{ marginTop: 6, fontSize: 12, color: '#5a7a5e', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                          <span><strong>AWB:</strong> {order.shipping.awbNumber}</span>
                          {order.shipping.logisticName && <span><strong>Courier:</strong> {order.shipping.logisticName}</span>}
                          {order.shipping.trackingUrl && (
                            <a href={order.shipping.trackingUrl} target="_blank" rel="noreferrer" style={{ color: '#2d5a27', textDecoration: 'underline', fontSize: 12 }}>
                              Track Shipment ↗
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                  <div className="pf-order-products">
                    {order.items.map((item, index) => (
                      <div key={index} className="pf-product-row">
                        <div className="pf-product-info">
                          <span className="pf-product-name">{item.name}</span>
                          {item.reviewed && (
                            <span className="pf-product-stars">
                              {'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}
                            </span>
                          )}
                        </div>
                        {order.status === 'Delivered' && (
                          item.reviewed ? (
                            <span className="pf-reviewed-badge">✓ Reviewed</span>
                          ) : (
                            <button
                              className="pf-review-btn"
                              onClick={() => setReviewTarget({ orderId: order.id, itemIndex: index })}
                            >
                              Review &amp; Earn
                            </button>
                          )
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )) : (
                <div className="pf-address-card"><p className="pf-address-txt">No orders yet.</p></div>
              )}
            </div>
          </div>
        )}

        {view === 'address' && (
          <div className="pf-body">
            <button className="pf-back" onClick={() => setView('main')}>← Back</button>
            <div className="pf-section-label">Saved Addresses</div>
            {addresses.length > 0 ? addresses.map((address, index) => (
              <div className="pf-address-card" key={address._id || index}>
                <div className="pf-address-top">
                  <span className="pf-address-tag">Address {index + 1}</span>
                  <div className="pf-address-actions">
                    <button className="pf-address-edit" onClick={() => startEditAddress(address)}>Edit</button>
                    <button
                      className="pf-address-delete"
                      onClick={() => handleDeleteAddress(address._id)}
                      disabled={deletingAddressId === address._id}
                    >
                      {deletingAddressId === address._id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
                <p className="pf-address-txt">{formatAddress(address)}</p>
              </div>
            )) : (
              <div className="pf-address-card"><p className="pf-address-txt">No saved addresses yet.</p></div>
            )}

            {!isAddressFormOpen && (
              <button className="pf-add-address" onClick={openAddAddressForm}>+ Add New Address</button>
            )}

            {isAddressFormOpen && (
              <div className="pf-address-card">
                <div className="pf-section-label">{editingAddressId ? 'Edit Address' : 'Add Address'}</div>
                <div className="pf-form">
                  {error && <div style={{ color: 'var(--red, #d32f2f)', fontSize: 13, padding: '8px 12px', background: 'rgba(211,47,47,0.1)', borderRadius: 6, marginBottom: 10, textAlign: 'center' }}>{error}</div>}
                  <label className="pf-label">Address Line 1 *
                    <input
                      className="pf-input"
                      value={addressForm.addressLine1}
                      onChange={(event) => setAddressForm((prev) => ({ ...prev, addressLine1: event.target.value }))}
                      placeholder="House no, street name, apartment"
                    />
                  </label>
                  <label className="pf-label">Address Line 2 (Optional)
                    <input
                      className="pf-input"
                      value={addressForm.addressLine2}
                      onChange={(event) => setAddressForm((prev) => ({ ...prev, addressLine2: event.target.value }))}
                      placeholder="Area"
                    />
                  </label>
                  <label className="pf-label">Landmark (Optional)
                    <input
                      className="pf-input"
                      value={addressForm.landmark}
                      onChange={(event) => setAddressForm((prev) => ({ ...prev, landmark: event.target.value }))}
                      placeholder="Landmark"
                    />
                  </label>
                  <label className="pf-label">City *
                    <input
                      className="pf-input"
                      value={addressForm.city}
                      onChange={(event) => setAddressForm((prev) => ({ ...prev, city: event.target.value }))}
                      placeholder="City"
                    />
                  </label>
                  <label className="pf-label">State *
                    <input
                      className="pf-input"
                      value={addressForm.state}
                      onChange={(event) => setAddressForm((prev) => ({ ...prev, state: event.target.value }))}
                      placeholder="State"
                    />
                  </label>
                  <label className="pf-label">Pincode (6 digits) *
                    <input
                      className="pf-input"
                      maxLength={6}
                      value={addressForm.pincode}
                      onChange={(event) => setAddressForm((prev) => ({ ...prev, pincode: event.target.value.replace(/\D/g, '') }))}
                      placeholder="Pincode"
                    />
                  </label>
                  <label className="pf-label">Phone Number (10 digits) *
                    <input
                      className="pf-input"
                      maxLength={10}
                      value={addressForm.phone}
                      onChange={(event) => setAddressForm((prev) => ({ ...prev, phone: event.target.value.replace(/\D/g, '') }))}
                      placeholder="Phone Number"
                    />
                  </label>
                  <label className="pf-label">Alternative Phone (Optional)
                    <input
                      className="pf-input"
                      maxLength={10}
                      value={addressForm.alternativePhone}
                      onChange={(event) => setAddressForm((prev) => ({ ...prev, alternativePhone: event.target.value.replace(/\D/g, '') }))}
                      placeholder="Alternative Phone"
                    />
                  </label>
                  <div className="pf-dialog-actions">
                    <button className="pf-dialog-cancel" onClick={resetAddressForm} disabled={addressBusy}>Cancel</button>
                    <button className="pf-submit" onClick={submitAddressForm} disabled={addressBusy}>
                      {addressBusy ? 'Saving...' : editingAddressId ? 'Update Address' : 'Save Address'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {view === 'password' && (
          <div className="pf-body">
            <button className="pf-back" onClick={() => setView('main')}>← Back</button>
            <div className="pf-section-label">Change Password</div>
            <div className="pf-form">
              <label className="pf-label">Current Password<input type="password" className="pf-input" placeholder="••••••••" /></label>
              <label className="pf-label">New Password<input type="password" className="pf-input" placeholder="••••••••" /></label>
              <label className="pf-label">Confirm New Password<input type="password" className="pf-input" placeholder="••••••••" /></label>
              <button className="pf-submit">Update Password</button>
            </div>
          </div>
        )}

        {showLogoutConfirm && (
          <div className="pf-overlay" onClick={() => setShowLogoutConfirm(false)}>
            <div className="pf-dialog" onClick={(e) => e.stopPropagation()}>
              <div className="pf-dialog-handle" />
              <h3 className="pf-dialog-title">Log out?</h3>
              <p className="pf-dialog-sub">You&apos;ll need to sign in again to access your account.</p>
              <div className="pf-dialog-actions">
                <button className="pf-dialog-cancel" onClick={() => setShowLogoutConfirm(false)}>Cancel</button>
                <button className="pf-dialog-confirm" onClick={handleLogout}>Log out</button>
              </div>
            </div>
          </div>
        )}

        {reviewTarget && (() => {
          const order = orders.find(o => o.id === reviewTarget.orderId);
          const item = order?.items[reviewTarget.itemIndex];
          if (!item) return null;
          return (
            <ReviewModal
              itemName={item.name}
              pointsPerReview={pointsPerReview}
              onClose={() => setReviewTarget(null)}
              onSubmit={handleSubmitReview}
            />
          );
        })()}

        {justEarned !== null && (
          <div className="pf-toast">
            {justEarned > 0 ? `✦ +${justEarned} Sparkle Points earned!` : '✓ Review submitted successfully!'}
          </div>
        )}

        {error && <div className="pf-toast">{error}</div>}
      </section>
    </>
  );
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;1,400&family=Nunito:wght@300;400;500;600;700&display=swap');

*, *::before, *::after { box-sizing: border-box; }

.pf {
  background: #faf8f3;
  min-height: 100vh;
  font-family: 'Nunito', sans-serif;
  padding-bottom: 90px;
  position: relative;
}

/* ── HERO ── */
.pf-hero {
  background: linear-gradient(160deg, #446c35bd 100%, #365928 0%);
  padding: 64px 20px 32px;
  display: flex;
  align-items: center;
  gap: 18px;
}
.pf-avatar {
  width: 64px; height: 64px; border-radius: 50%;
  background: rgba(192, 167, 107, 0.22);
  border: 2px solid rgba(200,153,46,.4);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.pf-avatar-init {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.8rem; font-style: italic; color: #ffd000;
}
.pf-name {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.5rem; font-weight: 400; color: #fff; margin-bottom: 2px;
}
.pf-email { font-size: 11px; color: rgb(255, 255, 255); margin-bottom: 6px; }
.pf-badge {
  font-size: 8.5px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase;
  background: rgba(224, 192, 119, 0.18); color: #ffd000;
  border: 2px solid rgba(192, 167, 107, 0.22);
  padding: 3px 10px; border-radius: 100px;
}

/* ── BODY ── */
.pf-body { padding: 20px 14px; }

@media (min-width: 600px) {
  .pf-body { max-width: 600px; margin: 0 auto; padding: 28px 0; }
  .pf-hero { padding-left: calc(50% - 286px); padding-right: calc(50% - 286px); }
}
@media (min-width: 1024px) {
  .pf-body { max-width: 720px; }
  .pf-hero { padding-left: calc(50% - 346px); padding-right: calc(50% - 346px); }
}

.pf-section-label {
  font-size: 8.5px; font-weight: 700; letter-spacing: .36em;
  text-transform: uppercase; color: #828278;
  margin-bottom: 8px; padding-left: 2px;
}

/* ── LIST ── */
.pf-list {
  background: #fff;
  border: 1px solid #e8dfc8;
  border-radius: 14px;
  overflow: hidden;
}
.pf-item {
  width: 100%; display: flex; align-items: center; gap: 14px;
  padding: 16px; text-decoration: none;
  background: transparent; border: none;
  border-bottom: 1px solid #f0e8d8;
  cursor: pointer; text-align: left;
  transition: background .16s;
  -webkit-tap-highlight-color: transparent;
}
.pf-item:last-child { border-bottom: none; }
.pf-item:active, .pf-item:hover { background: #faf8f3; }
.pf-item-icon { color: #527a3e; flex-shrink: 0; display: flex; align-items: center; }
.pf-item-txt { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.pf-item-name { font-size: 13px; font-weight: 600; color: #1c1c17; }
.pf-item-sub { font-size: 10.5px; color: #828278; }
.pf-chevron { color: #b4b4a4; font-size: 18px; line-height: 1; }
.pf-item-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: #c8992e; flex-shrink: 0;
}

/* ── LOGOUT ── */
.pf-logout {
  display: flex; align-items: center; gap: 8px;
  margin-top: 28px; width: 100%; padding: 14px 16px;
  background: #fff; border: 1.5px solid #f0c8c8;
  border-radius: 12px; font-size: 12px; font-weight: 700;
  letter-spacing: .1em; color: #c04040; cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

/* ── REWARD CARD (main view) ── */
.pf-reward-card {
  background: linear-gradient(135deg, #253d18 0%, #3b6228 100%);
  border-radius: 16px; padding: 20px 18px; margin-bottom: 6px;
}
.pf-reward-card-top {
  display: flex; justify-content: space-between; align-items: flex-start;
  margin-bottom: 12px;
}
.pf-reward-label {
  font-size: 9px; font-weight: 700; letter-spacing: .22em;
  text-transform: uppercase; color: rgba(255,255,255,.55); margin-bottom: 4px;
}
.pf-reward-pts {
  font-family: 'Cormorant Garamond', serif;
  font-size: 2.4rem; color: #fff; line-height: 1;
}
.pf-reward-pts-unit { font-size: 1rem; color: rgba(255,255,255,.6); }
.pf-reward-tier-badge {
  font-size: 9px; font-weight: 700; letter-spacing: .14em;
  text-transform: uppercase; padding: 5px 12px; border-radius: 100px;
  border: 1px solid;
}
.pf-reward-bar-track {
  background: rgba(255,255,255,.15); border-radius: 100px;
  height: 5px; overflow: hidden; margin-bottom: 5px;
}
.pf-reward-bar-fill {
  height: 100%; border-radius: 100px;
  transition: width .6s cubic-bezier(.4,0,.2,1);
}
.pf-reward-bar-hint { font-size: 9.5px; color: rgba(255,255,255,.5); }
.pf-reward-cta {
  display: flex; align-items: center; gap: 7px; margin-top: 14px;
  background: rgba(200,153,46,.18); border: 1px solid rgba(200,153,46,.4);
  color: #f0d080; border-radius: 10px; padding: 10px 14px;
  font-size: 11px; font-weight: 700; cursor: pointer; width: 100%;
  -webkit-tap-highlight-color: transparent;
}

/* ── BACK ── */
.pf-back {
  font-size: 10px; font-weight: 700; letter-spacing: .16em;
  text-transform: uppercase; color: #527a3e;
  background: none; border: none; cursor: pointer;
  margin-bottom: 16px; padding: 0;
  -webkit-tap-highlight-color: transparent;
}

/* ── REVIEW BANNER ── */
.pf-review-banner {
  display: flex; align-items: flex-start; gap: 12px;
  background: linear-gradient(135deg, #fdf6e3, #fbefd0);
  border: 1px solid #e8d48a; border-radius: 12px;
  padding: 14px 16px; margin-bottom: 14px;
}
.pf-review-banner-icon {
  font-size: 18px; color: #c8992e; flex-shrink: 0; line-height: 1.4;
}
.pf-review-banner-title {
  font-size: 12px; font-weight: 700; color: #7a5a0a; margin-bottom: 2px;
}
.pf-review-banner-sub { font-size: 10.5px; color: #a07832; }

/* ── ORDERS ── */
.pf-orders { display: flex; flex-direction: column; gap: 10px; }
.pf-order {
  background: #fff; border: 1px solid #e8dfc8;
  border-radius: 14px; padding: 16px;
}
.pf-order-top {
  display: flex; justify-content: space-between;
  align-items: center; margin-bottom: 6px;
}
.pf-order-id { font-size: 11px; font-weight: 700; color: #484840; }
.pf-order-status {
  font-size: 9px; font-weight: 700; letter-spacing: .14em;
  text-transform: uppercase; padding: 3px 10px; border-radius: 100px;
}
.pf-order-status.delivered { background: #eff6ea; color: #3b6d11; }
.pf-order-status.processing { background: #faeeda; color: #633806; }
.pf-order-date-row {
  display: flex; justify-content: space-between;
  margin-bottom: 12px;
}
.pf-order-date { font-size: 10px; color: #828278; }
.pf-order-amt { font-size: 12px; font-weight: 700; color: #253d18; }

/* ── PRODUCT ROWS ── */
.pf-order-products {
  display: flex; flex-direction: column; gap: 8px;
  border-top: 1px solid #f0e8d8; padding-top: 10px;
}
.pf-product-row {
  display: flex; align-items: center;
  justify-content: space-between; gap: 10px;
}
.pf-product-info {
  display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0;
}
.pf-product-name {
  font-size: 11.5px; font-weight: 600; color: #484840;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.pf-product-stars { font-size: 10px; color: #c8992e; letter-spacing: 1px; }
.pf-review-btn {
  flex-shrink: 0;
  font-size: 9.5px; font-weight: 700; letter-spacing: .08em;
  background: #f0f7eb; border: 1.5px solid #b4d97a;
  color: #3b6d11; padding: 5px 10px; border-radius: 8px;
  cursor: pointer; white-space: nowrap;
  transition: background .15s;
  -webkit-tap-highlight-color: transparent;
}
.pf-review-btn:hover { background: #e2f0d0; }
.pf-reviewed-badge {
  flex-shrink: 0; font-size: 9.5px; font-weight: 700;
  color: #527a3e; background: #eff6ea;
  padding: 5px 10px; border-radius: 8px; white-space: nowrap;
}

/* ── REWARD FULL CARD (orders view) ── */
.pf-reward-full-card {
  background: #fff; border: 1px solid #e8dfc8;
  border-radius: 16px; padding: 20px; overflow: hidden;
}
.pf-reward-full-top {
  display: flex; justify-content: space-between;
  align-items: flex-start; margin-bottom: 14px;
}
.pf-reward-full-label {
  font-size: 9px; font-weight: 700; letter-spacing: .22em;
  text-transform: uppercase; color: #828278; margin-bottom: 4px;
}
.pf-reward-full-pts {
  font-family: 'Cormorant Garamond', serif;
  font-size: 2.2rem; color: #253d18; line-height: 1;
}
.pf-reward-full-unit { font-size: .9rem; color: #828278; }
.pf-reward-full-tier {
  display: flex; flex-direction: column; align-items: center; gap: 5px;
}
.pf-reward-full-tier-icon {
  width: 36px; height: 36px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 16px;
}
.pf-reward-progress-wrap { margin-bottom: 16px; }
.pf-reward-breakdown {
  display: flex; align-items: center;
  background: #faf8f3; border-radius: 10px;
  padding: 14px; margin-bottom: 16px; gap: 0;
}
.pf-reward-stat {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; gap: 3px;
}
.pf-reward-stat-val {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.5rem; color: #253d18;
}
.pf-reward-stat-lbl {
  font-size: 9px; font-weight: 700; letter-spacing: .14em;
  text-transform: uppercase; color: #828278;
}
.pf-reward-divider {
  width: 1px; height: 32px; background: #e8dfc8;
}
.pf-reward-how { display: flex; flex-direction: column; gap: 8px; }
.pf-reward-how-title {
  font-size: 9px; font-weight: 700; letter-spacing: .22em;
  text-transform: uppercase; color: #828278; margin-bottom: 2px;
}
.pf-reward-how-row {
  display: flex; align-items: center; gap: 10px;
  font-size: 11.5px; color: #484840;
}
.pf-reward-how-icon { font-size: 14px; flex-shrink: 0; }
.pf-reward-how-pts {
  margin-left: auto; font-size: 11px; font-weight: 700;
  color: #3b6d11; background: #eff6ea;
  padding: 2px 8px; border-radius: 100px;
}

/* ── ADDRESS ── */
.pf-address-card {
  background: #fff; border: 1px solid #e8dfc8;
  border-radius: 14px; padding: 18px; margin-bottom: 12px;
}
.pf-address-top {
  display: flex; justify-content: space-between; margin-bottom: 10px;
}
.pf-address-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}
.pf-address-tag {
  font-size: 9px; font-weight: 700; letter-spacing: .2em;
  text-transform: uppercase; background: #eff6ea; color: #3b6d11;
  border: 1px solid #c0dd97; padding: 3px 10px; border-radius: 100px;
}
.pf-address-edit {
  font-size: 10px; font-weight: 700; color: #527a3e;
  background: none; border: none; cursor: pointer;
}
.pf-address-delete {
  font-size: 10px;
  font-weight: 700;
  color: #c04040;
  background: none;
  border: none;
  cursor: pointer;
}
.pf-address-txt { font-size: 12px; color: #484840; line-height: 1.7; }
.pf-add-address {
  margin-top: 10px;
  width: 100%; padding: 14px; border: 1.5px dashed #c0dd97;
  border-radius: 12px; background: #eff6ea; color: #3b6d11;
  font-size: 11px; font-weight: 700; cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

/* ── PASSWORD FORM ── */
.pf-form { display: flex; flex-direction: column; gap: 14px; }
.pf-label {
  display: flex; flex-direction: column; gap: 5px;
  font-size: 10px; font-weight: 700; letter-spacing: .1em;
  text-transform: uppercase; color: #828278;
}
.pf-input {
  padding: 12px 14px; border: 1.5px solid #e8dfc8;
  border-radius: 10px; font-size: 13px;
  font-family: 'Nunito', sans-serif; background: #fff;
  color: #1c1c17; outline: none; transition: border-color .2s;
}
.pf-input:focus { border-color: #527a3e; }
.pf-submit {
  margin-top: 4px; padding: 14px; background: #253d18;
  color: #fff; border: none; border-radius: 12px;
  font-size: 11px; font-weight: 700; letter-spacing: .16em;
  text-transform: uppercase; cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.pf-submit:disabled,
.pf-dialog-cancel:disabled,
.pf-address-delete:disabled {
  opacity: .65;
  cursor: not-allowed;
}

/* ── OVERLAYS & DIALOGS ── */
.pf-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,.48);
  z-index: 1000; display: flex; align-items: flex-end;
  justify-content: center;
}
.pf-dialog {
  background: #fff; border-radius: 18px 18px 0 0;
  padding: 16px 24px 32px; width: 100%; max-width: 520px;
}
.pf-review-dialog { padding-bottom: 36px; }
.pf-dialog-handle {
  width: 36px; height: 4px; border-radius: 100px;
  background: #e0d8c8; margin: 0 auto 20px;
}
.pf-dialog-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.4rem; font-weight: 400; color: #1c1c17; margin-bottom: 6px;
}
.pf-dialog-sub { font-size: 12px; color: #828278; margin-bottom: 20px; }
.pf-dialog-actions { display: flex; gap: 10px; }
.pf-dialog-cancel {
  flex: 1; padding: 13px; border: 1.5px solid #e8dfc8;
  border-radius: 10px; background: #fff; font-size: 11px;
  font-weight: 700; color: #484840; cursor: pointer;
}
.pf-dialog-confirm {
  flex: 1; padding: 13px; background: #c04040;
  border: none; border-radius: 10px; font-size: 11px;
  font-weight: 700; color: #fff; cursor: pointer;
}

/* ── REVIEW MODAL ── */
.pf-review-item-name {
  font-size: 10px; font-weight: 700; letter-spacing: .16em;
  text-transform: uppercase; color: #828278; margin-bottom: 2px;
}
.pf-stars-row {
  display: flex; gap: 6px; margin: 12px 0 16px;
}
.pf-star {
  font-size: 28px; background: none; border: none;
  cursor: pointer; color: #ddd; transition: color .12s, transform .12s;
  padding: 0; line-height: 1;
}
.pf-star.active { color: #c8992e; }
.pf-star:hover { transform: scale(1.15); }
.pf-review-textarea {
  width: 100%; padding: 12px 14px;
  border: 1.5px solid #e8dfc8; border-radius: 10px;
  font-size: 12.5px; font-family: 'Nunito', sans-serif;
  color: #1c1c17; background: #faf8f3;
  outline: none; resize: none; margin-bottom: 12px;
  transition: border-color .2s;
}
.pf-review-textarea:focus { border-color: #527a3e; }
.pf-reward-hint {
  display: flex; align-items: center; gap: 6px;
  font-size: 10.5px; color: #e3a407;
  background: #fdf6e3; border: 1px solid #e1b20b;
  border-radius: 8px; padding: 8px 12px; margin-bottom: 18px;
}
.pf-review-submit {
  background: #253d18 !important;
}
.pf-review-submit:disabled {
  background: #ccc !important; cursor: not-allowed;
}

/* ── TOAST ── */
.pf-toast {
  position: fixed; bottom: 100px; left: 50%;
  transform: translateX(-50%);
  background: #253d18; color: #f0d080;
  font-size: 12px; font-weight: 700; letter-spacing: .1em;
  padding: 12px 20px; border-radius: 100px;
  z-index: 2000; white-space: nowrap;
  animation: toastIn .3s ease, toastOut .3s ease 2.7s forwards;
  pointer-events: none;
}
@keyframes toastIn {
  from { opacity: 0; transform: translateX(-50%) translateY(12px); }
  to   { opacity: 1; transform: translateX(-50%) translateY(0); }
}
@keyframes toastOut {
  from { opacity: 1; }
  to   { opacity: 0; }
}

@media (min-width: 768px) {
  .pf-overlay { align-items: center; padding: 0; }
  .pf-dialog { border-radius: 18px; max-width: 440px; }
  .pf-toast { bottom: 32px; }
}
`;