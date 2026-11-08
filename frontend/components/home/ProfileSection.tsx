
'use client';

import { INDIAN_STATES } from '@/lib/indianStates';
import Em from "@/components/ui/Em";
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/lib/authContext';

type View = 'main' | 'orders' | 'address' | 'password';

interface OrderItem {
  name: string;
  productId: string; // MongoDB _id for review API
  image?: string | null;
  quantity?: number;
  price?: number;
  color?: string;
  size?: string;
  reviewed: boolean;
  rating: number;
  reviewText: string;
  giftBox?: boolean;
  giftBoxDetails?: {
    heading?: string;
    description?: string;
    price?: number;
    image?: string;
  };
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
                  <span className="pf-reward-how-icon"><Em c="🛍" /></span>
                  <span>Every purchase</span>
                  <span className="pf-reward-how-pts">+10 pts</span>
                </div>
                <div className="pf-reward-how-row">
                  <span className="pf-reward-how-icon"><Em c="🎂" /></span>
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
    product?: { _id?: string; name?: string; mainImage?: string } | string;
    sourceId?: string;
    _id?: string;
    name?: string;
    image?: string | null;
    productId?: string;
    reviewed?: boolean;
    rating?: number;
    reviewText?: string;
    quantity?: number;
    price?: number;
    color?: string;
    size?: string;
    giftBox?: boolean;
    giftBoxDetails?: {
      heading?: string;
      description?: string;
      price?: number;
      image?: string;
    };
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
    name: '',
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
            image: item.image || (typeof item.product === 'object' && item.product ? item.product.mainImage || null : null),
            quantity: item.quantity || 1,
            price: item.price || 0,
            color: item.color,
            size: item.size,
            reviewed: Boolean(item.reviewed),
            rating: item.rating || 0,
            reviewText: item.reviewText || '',
            giftBox: Boolean(item.giftBox),
            giftBoxDetails: item.giftBoxDetails,
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
    setAddressForm({ name: '', addressLine1: '', addressLine2: '', landmark: '', city: '', state: '', pincode: '', phone: '', alternativePhone: '' });
    setEditingAddressId(null);
    setIsAddressFormOpen(false);
  };

  const openAddAddressForm = () => {
    setAddressForm({ name: '', addressLine1: '', addressLine2: '', landmark: '', city: '', state: '', pincode: '', phone: '', alternativePhone: '' });
    setEditingAddressId(null);
    setIsAddressFormOpen(true);
  };

  const startEditAddress = (address: NonNullable<typeof addresses>[number]) => {
    setAddressForm({
      name: address.name || '',
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

  const scrollToAddressError = (id: string = 'pf-pincode-error-banner') => {
    setTimeout(() => {
      const el = document.getElementById(id) || document.getElementById('pf-address-error-banner');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 50);
  };

  const submitAddressForm = async () => {
    const payload = {
      name: addressForm.name.trim(),
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

    if (!payload.name || !payload.addressLine1 || !payload.city || !payload.state || !payload.pincode || !payload.phone) {
      setError('Please fill all mandatory address fields (including Name and a 6-digit Pincode).');
      scrollToAddressError('pf-pincode-error-banner');
      return;
    }
    if (payload.pincode.length !== 6 || !/^\d{6}$/.test(payload.pincode)) {
      setError('A 6-digit Pincode is required.');
      scrollToAddressError('pf-pincode-error-banner');
      return;
    }
    if (payload.phone.length !== 10 || !/^\d{10}$/.test(payload.phone)) {
      setError('Phone number must be exactly 10 digits.');
      scrollToAddressError('pf-pincode-error-banner');
      return;
    }
    if (payload.alternativePhone && (payload.alternativePhone.length !== 10 || !/^\d{10}$/.test(payload.alternativePhone))) {
      setError('Alternative phone number must be exactly 10 digits.');
      scrollToAddressError('pf-pincode-error-banner');
      return;
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
              {orders.length > 0 ? orders.map((order) => {
                const statusLower = order.status.toLowerCase();
                const statusColor =
                  statusLower === 'delivered' ? { bg: '#eff6ea', text: '#3b6d11', border: '#c0dd97' } :
                  statusLower === 'shipped' ? { bg: '#e8f4fd', text: '#1565c0', border: '#90caf9' } :
                  statusLower === 'cancelled' || statusLower === 'rto' ? { bg: '#fdecea', text: '#c62828', border: '#ef9a9a' } :
                  statusLower === 'manifested' ? { bg: '#fff3e0', text: '#e65100', border: '#ffcc80' } :
                  { bg: '#fdf6e3', text: '#7a5a0a', border: '#e8d48a' }; // placed / processing
                const shortId = order.id.length > 8 ? order.id.slice(-8).toUpperCase() : order.id;

                return (
                  <div key={order.id} className="pf-order">
                    {/* Order Header */}
                    <div className="pf-order-header">
                      <div className="pf-order-header-left">
                        <span className="pf-order-id">Order #{shortId}</span>
                        <span className="pf-order-date">{order.date}</span>
                      </div>
                      <div className="pf-order-header-right">
                        <span
                          className="pf-order-status-badge"
                          style={{ background: statusColor.bg, color: statusColor.text, borderColor: statusColor.border }}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>

                    {/* Shipment Timeline */}
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
                        <div className="pf-shipment-tracking">
                          <div className="pf-shipment-label">Shipment Tracking</div>
                          <div className="pf-shipment-steps">
                            {STEPS.map((step, i) => (
                              <div key={step} className="pf-shipment-step-wrap" style={{ flex: i < STEPS.length - 1 ? '1 1 0' : 'none' }}>
                                <div className="pf-shipment-step-col">
                                  <div className={`pf-shipment-dot ${i <= activeStep ? 'active' : ''} ${i === activeStep ? 'current' : ''}`}>
                                    {i < activeStep && <span className="pf-shipment-check">✓</span>}
                                  </div>
                                  <span className={`pf-shipment-step-label ${i <= activeStep ? 'active' : ''}`}>{step}</span>
                                </div>
                                {i < STEPS.length - 1 && (
                                  <div className={`pf-shipment-line ${i < activeStep ? 'active' : ''}`} />
                                )}
                              </div>
                            ))}
                          </div>
                          <div className="pf-shipment-meta">
                            <span><strong>AWB:</strong> {order.shipping.awbNumber}</span>
                            {order.shipping.logisticName && <span><strong>Courier:</strong> {order.shipping.logisticName}</span>}
                            {order.shipping.trackingUrl && (
                              <a href={order.shipping.trackingUrl} target="_blank" rel="noreferrer" className="pf-shipment-link">
                                Track Shipment ↗
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Product Items */}
                    <div className="pf-order-items">
                      {order.items.map((item, index) => (
                        <div key={index} className="pf-order-item">
                          <div className="pf-order-item-thumb">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="pf-order-item-img" />
                            ) : (
                              <div className="pf-order-item-placeholder">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#b4b4a4" strokeWidth="1.5">
                                  <rect x="3" y="3" width="18" height="18" rx="2" />
                                  <circle cx="8.5" cy="8.5" r="1.5" />
                                  <path d="m21 15-5-5L5 21" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="pf-order-item-details">
                            <span className="pf-order-item-name">{item.name}</span>
                            <div className="pf-order-item-meta">
                              {item.quantity && item.quantity > 1 && <span className="pf-order-item-qty">Qty: {item.quantity}</span>}
                              {item.color && <span className="pf-order-item-variant">{item.color}</span>}
                              {item.size && <span className="pf-order-item-variant">Size: {item.size}</span>}
                              {item.price ? <span className="pf-order-item-price">₹{Number(item.price).toLocaleString('en-IN')}</span> : null}
                            </div>
                            {(item.giftBox || item.giftBoxDetails) && (
                              <div className="pf-order-item-gift">
                                <Em c="🎁" /> {item.giftBoxDetails?.heading || 'Premium Gift Box'} (+₹{item.giftBoxDetails?.price ?? 99})
                              </div>
                            )}
                            {item.reviewed && (
                              <span className="pf-product-stars">
                                {'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}
                              </span>
                            )}
                          </div>
                          <div className="pf-order-item-action">
                            {order.status === 'Delivered' && (
                              item.reviewed ? (
                                <span className="pf-reviewed-badge">✓ Reviewed</span>
                              ) : (
                                <button
                                  className="pf-review-btn"
                                  onClick={() => setReviewTarget({ orderId: order.id, itemIndex: index })}
                                >
                                  Review
                                </button>
                              )
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Footer */}
                    <div className="pf-order-footer">
                      <span className="pf-order-item-count">{order.items.length} item{order.items.length > 1 ? 's' : ''}</span>
                      <span className="pf-order-total">Total: {order.amount}</span>
                    </div>
                  </div>
                );
              }) : (
                <div className="pf-empty-orders">
                  <div className="pf-empty-orders-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#b4b4a4" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
                      <line x1="3" x2="21" y1="6" y2="6"/>
                      <path d="M16 10a4 4 0 0 1-8 0"/>
                    </svg>
                  </div>
                  <p className="pf-empty-orders-title">No orders yet</p>
                  <p className="pf-empty-orders-sub">Your order history will appear here once you place your first order.</p>
                </div>
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
                <div style={{ marginBottom: 4, fontWeight: 700, color: '#1f381c', fontSize: 14 }}>{address.name || user?.name || 'Customer'}</div>
                <p className="pf-address-txt" style={{ marginTop: 0 }}>{formatAddress(address)}</p>
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
                  {error && <div id="pf-address-error-banner" style={{ color: 'var(--red, #d32f2f)', fontSize: 13, padding: '8px 12px', background: 'rgba(211,47,47,0.1)', borderRadius: 6, marginBottom: 10, textAlign: 'center' }}>{error}</div>}
                  <label className="pf-label">Full Name *
                    <input
                      className="pf-input"
                      value={addressForm.name}
                      onChange={(event) => setAddressForm((prev) => ({ ...prev, name: event.target.value }))}
                      placeholder="Recipient's Full Name"
                    />
                  </label>
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
                    <select
                      className="pf-input"
                      value={addressForm.state}
                      onChange={(event) => setAddressForm((prev) => ({ ...prev, state: event.target.value }))}
                    >
                      <option value="">Select state</option>
                      {addressForm.state && !(INDIAN_STATES as readonly string[]).includes(addressForm.state) && <option value={addressForm.state}>{addressForm.state}</option>}
                      {INDIAN_STATES.map((st) => <option key={st} value={st}>{st}</option>)}
                    </select>
                  </label>
                  {error && (
                    <div id="pf-pincode-error-banner" style={{ color: 'var(--red, #d32f2f)', fontSize: 13, padding: '8px 12px', background: 'rgba(211,47,47,0.1)', borderRadius: 6, marginBottom: 4, textAlign: 'center', fontWeight: 600 }}>
                      {error}
                    </div>
                  )}
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

*, *::before, *::after { box-sizing: border-box; }

.pf {
  --olive-600: #2f4d22;
  --red: #c0392b;
  --ink: #1a1a14;
  --ink-2: #3f3f36;
  --ink-3: #5b5b4f;
  --line: #e2d9c2;
  background: #f6f2e9;
  min-height: 100vh;
  width: 100%;
  max-width: 100%;
  overflow-x: clip;
  font-family: 'Nunito', sans-serif;
  color: var(--ink);
  padding-bottom: 90px;
  position: relative;
  -webkit-font-smoothing: antialiased;
}

/* ── HERO ── */
.pf-hero {
  background: linear-gradient(135deg, #243d19 0%, #3a6128 100%);
  padding: 26px 16px 22px;
  display: flex; align-items: center; gap: 14px;
}
.pf-avatar {
  width: 58px; height: 58px; border-radius: 50%;
  background: #fff7dc; border: 2px solid #e9c46a;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.pf-avatar-init { font-family: 'Cormorant Garamond', serif; font-size: 1.7rem; font-weight: 700; color: #2f4d22; }
.pf-hero-info { min-width: 0; flex: 1; }
.pf-name { font-family: 'Cormorant Garamond', serif; font-size: 1.55rem; font-weight: 700; color: #fff; line-height: 1.1; margin-bottom: 2px; overflow-wrap: anywhere; }
.pf-email { font-size: 12.5px; font-weight: 500; color: #fff; opacity: .92; margin-bottom: 7px; overflow-wrap: anywhere; }
.pf-badge {
  display: inline-block; font-size: 9.5px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase;
  background: #e9c46a; color: #2a2a1a; padding: 4px 10px; border-radius: 100px;
}

/* ── BODY ── */
.pf-body { padding: 16px 14px; min-width: 0; }

.pf-section-label {
  font-size: 11px; font-weight: 800; letter-spacing: .2em; text-transform: uppercase;
  color: var(--ink-2); margin-bottom: 8px; padding-left: 2px;
}

/* ── LIST ── */
.pf-list { background: #fff; border: 1px solid var(--line); border-radius: 14px; overflow: hidden; box-shadow: 0 2px 8px rgba(40,50,20,.05); }
.pf-item {
  width: 100%; display: flex; align-items: center; gap: 12px;
  padding: 14px; text-decoration: none; background: transparent; border: none;
  border-bottom: 1px solid #efe8d6; cursor: pointer; text-align: left; transition: background .16s;
  -webkit-tap-highlight-color: transparent; font-family: inherit;
}
.pf-item:last-child { border-bottom: none; }
.pf-item:hover, .pf-item:active { background: #f6f2e9; }
.pf-item-icon {
  width: 34px; height: 34px; border-radius: 9px; flex-shrink: 0;
  background: #e8f0e1; color: #2f4d22; font-size: 16px;
  display: flex; align-items: center; justify-content: center;
}
.pf-item-txt { flex: 1; display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.pf-item-name { font-size: 14px; font-weight: 700; color: var(--ink); }
.pf-item-sub { font-size: 12px; font-weight: 500; color: var(--ink-3); overflow-wrap: anywhere; }
.pf-chevron { color: #6b6b5c; font-size: 20px; line-height: 1; }
.pf-item-dot { width: 8px; height: 8px; border-radius: 50%; background: #d98e04; flex-shrink: 0; }

/* ── LOGOUT ── */
.pf-logout {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  margin-top: 22px; width: 100%; padding: 13px;
  background: #fff; border: 1.5px solid #e5a9a9; border-radius: 12px;
  font-family: inherit; font-size: 13px; font-weight: 800; letter-spacing: .08em;
  color: #b02a2a; cursor: pointer; -webkit-tap-highlight-color: transparent;
}
.pf-logout:hover { background: #fdf0f0; }

/* ── REWARD CARD ── */
.pf-reward-card {
  background: linear-gradient(135deg, #1f3615 0%, #356024 100%);
  border-radius: 16px; padding: 18px 16px; margin-bottom: 6px;
  box-shadow: 0 5px 16px rgba(31,54,21,.22);
}
.pf-reward-card-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; margin-bottom: 12px; }
.pf-reward-label { font-size: 10.5px; font-weight: 800; letter-spacing: .16em; text-transform: uppercase; color: #fff; opacity: .85; margin-bottom: 3px; }
.pf-reward-pts { font-family: 'Cormorant Garamond', serif; font-size: 2.5rem; font-weight: 700; color: #fff; line-height: 1; }
.pf-reward-pts-unit { font-size: 1rem; color: #fff; opacity: .85; }
.pf-reward-tier-badge {
  font-size: 10.5px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase;
  padding: 5px 11px; border-radius: 100px; border: 1.5px solid; white-space: nowrap;
  background: #fff7dc !important; color: #6b4b00 !important; border-color: #e9c46a !important;
}
.pf-reward-bar-track { background: rgba(255,255,255,.25); border-radius: 100px; height: 6px; overflow: hidden; margin-bottom: 6px; }
.pf-reward-bar-fill { height: 100%; border-radius: 100px; background: #e9c46a !important; transition: width .6s cubic-bezier(.4,0,.2,1); }
.pf-reward-bar-hint { font-size: 12px; font-weight: 600; color: #fff; opacity: .9; }
.pf-reward-cta {
  display: flex; align-items: center; justify-content: center; gap: 7px; margin-top: 14px;
  background: #e9c46a; border: none; color: #2a2200; border-radius: 10px; padding: 11px 12px;
  font-family: inherit; font-size: 13px; font-weight: 800; cursor: pointer; width: 100%;
  -webkit-tap-highlight-color: transparent;
}

/* ── BACK ── */
.pf-back {
  font-family: inherit; font-size: 12px; font-weight: 800; letter-spacing: .06em;
  color: #2f4d22; background: #e8f0e1; border: none; cursor: pointer;
  margin-bottom: 14px; padding: 7px 14px; border-radius: 100px; -webkit-tap-highlight-color: transparent;
}

/* ── REVIEW BANNER ── */
.pf-review-banner {
  display: flex; align-items: flex-start; gap: 10px;
  background: #fff3d1; border: 1.5px solid #e0b93f; border-radius: 12px;
  padding: 12px 14px; margin-bottom: 14px;
}
.pf-review-banner-icon { font-size: 18px; color: #a06d00; flex-shrink: 0; line-height: 1.2; }
.pf-review-banner-title { font-size: 13.5px; font-weight: 800; color: #5a3f00; margin-bottom: 1px; }
.pf-review-banner-sub { font-size: 12px; font-weight: 500; color: #6b4e08; line-height: 1.45; }

/* ── ORDERS ── */
.pf-orders { display: flex; flex-direction: column; gap: 12px; }
.pf-order { background: #fff; border: 1px solid var(--line); border-radius: 14px; overflow: hidden; box-shadow: 0 2px 8px rgba(40,50,20,.05); min-width: 0; }

.pf-order-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; padding: 12px 14px; border-bottom: 1px solid #efe8d6; }
.pf-order-header-left { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.pf-order-header-right { flex-shrink: 0; }
.pf-order-id { font-size: 13px; font-weight: 800; color: var(--ink); }
.pf-order-date { font-size: 11.5px; font-weight: 500; color: var(--ink-3); }
.pf-order-status-badge {
  font-size: 10px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase;
  padding: 4px 10px; border-radius: 100px; border: 1.5px solid; white-space: nowrap;
}

/* Shipment tracking — scrolls inside its own box, never pushes the page wider */
.pf-shipment-tracking { padding: 12px 14px; border-bottom: 1px solid #efe8d6; background: #f3f8ee; overflow-x: auto; -webkit-overflow-scrolling: touch; }
.pf-shipment-label { font-size: 10.5px; font-weight: 800; text-transform: uppercase; letter-spacing: .12em; color: #2f4d22; margin-bottom: 10px; }
.pf-shipment-steps { display: flex; align-items: flex-start; min-width: 340px; }
.pf-shipment-step-wrap { display: flex; align-items: flex-start; }
.pf-shipment-step-col { display: flex; flex-direction: column; align-items: center; gap: 5px; }
.pf-shipment-dot {
  width: 18px; height: 18px; border-radius: 50%; flex-shrink: 0;
  background: #e3e3dc; border: 2px solid #b9b9ae;
  display: flex; align-items: center; justify-content: center; transition: all .2s;
}
.pf-shipment-dot.active { background: #2f4d22; border-color: #2f4d22; }
.pf-shipment-dot.current { box-shadow: 0 0 0 3px rgba(47,77,34,.2); }
.pf-shipment-check { color: #fff; font-size: 9px; font-weight: 900; }
.pf-shipment-step-label { font-size: 9.5px; font-weight: 700; white-space: nowrap; text-align: center; color: #6b6b5c; }
.pf-shipment-step-label.active { color: #2f4d22; }
.pf-shipment-line { flex: 1; height: 2px; background: #d4d4c8; margin-top: 8px; min-width: 8px; }
.pf-shipment-line.active { background: #2f4d22; }
.pf-shipment-meta { margin-top: 10px; font-size: 12px; color: var(--ink-2); display: flex; gap: 12px; flex-wrap: wrap; }
.pf-shipment-link { color: #1d5fa8; text-decoration: underline; font-size: 12px; font-weight: 700; }

/* Order items */
.pf-order-items { padding: 0; }
.pf-order-item { display: flex; align-items: flex-start; gap: 11px; padding: 12px 14px; border-bottom: 1px solid #f1ebdb; }
.pf-order-item:last-child { border-bottom: none; }
.pf-order-item-thumb { flex-shrink: 0; }
.pf-order-item-img { width: 56px; height: 56px; border-radius: 10px; object-fit: cover; background: #f1ebdb; border: 1px solid var(--line); }
.pf-order-item-placeholder { width: 56px; height: 56px; border-radius: 10px; background: #f1ebdb; border: 1px solid var(--line); display: flex; align-items: center; justify-content: center; }
.pf-order-item-details { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
.pf-order-item-name { font-size: 13px; font-weight: 700; color: var(--ink); line-height: 1.35; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; overflow-wrap: anywhere; }
.pf-order-item-meta { display: flex; flex-wrap: wrap; gap: 5px; align-items: center; }
.pf-order-item-qty, .pf-order-item-variant { font-size: 10.5px; font-weight: 700; color: var(--ink-2); background: #efe8d6; padding: 2px 7px; border-radius: 5px; }
.pf-order-item-price { font-size: 12.5px; font-weight: 800; color: #1f3615; }
.pf-order-item-gift {
  display: inline-flex; align-items: center; gap: 4px; width: fit-content; max-width: 100%;
  font-size: 10.5px; font-weight: 700; color: #6b4b00;
  background: #fff3d1; border: 1px solid #e0b93f; padding: 2px 8px; border-radius: 5px;
}
.pf-order-item-action { flex-shrink: 0; display: flex; align-items: center; padding-top: 2px; }

.pf-order-footer { display: flex; justify-content: space-between; align-items: center; padding: 11px 14px; border-top: 1px solid #efe8d6; background: #faf6ea; }
.pf-order-item-count { font-size: 11.5px; font-weight: 700; color: var(--ink-3); }
.pf-order-total { font-size: 14px; font-weight: 800; color: #1f3615; }

.pf-empty-orders { display: flex; flex-direction: column; align-items: center; padding: 40px 20px; background: #fff; border: 1px solid var(--line); border-radius: 14px; text-align: center; }
.pf-empty-orders-icon { margin-bottom: 12px; opacity: .7; }
.pf-empty-orders-title { font-size: 15px; font-weight: 800; color: var(--ink); margin-bottom: 4px; }
.pf-empty-orders-sub { font-size: 12.5px; font-weight: 500; color: var(--ink-3); max-width: 240px; line-height: 1.5; }

/* Legacy order styles */
.pf-order-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; padding: 12px 14px 0; }
.pf-order-status { font-size: 10px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; padding: 4px 10px; border-radius: 100px; }
.pf-order-status.delivered { background: #e3f1d8; color: #2c5a0c; }
.pf-order-status.processing { background: #fbe7c4; color: #6b3a00; }
.pf-order-date-row { display: flex; justify-content: space-between; margin-bottom: 10px; padding: 0 14px; }
.pf-order-amt { font-size: 13.5px; font-weight: 800; color: #1f3615; }
.pf-order-products { display: flex; flex-direction: column; gap: 8px; border-top: 1px solid #efe8d6; padding: 10px 14px 14px; }
.pf-product-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.pf-product-info { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; }
.pf-product-name { font-size: 13px; font-weight: 700; color: var(--ink); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pf-product-stars { font-size: 12px; color: #b57a00; letter-spacing: 1px; }

.pf-review-btn {
  flex-shrink: 0; font-family: inherit; font-size: 11.5px; font-weight: 800;
  background: #2f4d22; border: none; color: #fff; padding: 7px 13px; border-radius: 8px;
  cursor: pointer; white-space: nowrap; transition: background .15s; -webkit-tap-highlight-color: transparent;
}
.pf-review-btn:hover { background: #3d6a2c; }
.pf-reviewed-badge { flex-shrink: 0; font-size: 11px; font-weight: 800; color: #2c5a0c; background: #e3f1d8; padding: 6px 10px; border-radius: 8px; white-space: nowrap; }

/* ── REWARD FULL CARD ── */
.pf-reward-full-card { background: #fff; border: 1px solid var(--line); border-radius: 14px; padding: 16px; overflow: hidden; }
.pf-reward-full-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; gap: 10px; }
.pf-reward-full-label { font-size: 10.5px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; color: var(--ink-2); margin-bottom: 3px; }
.pf-reward-full-pts { font-family: 'Cormorant Garamond', serif; font-size: 2.2rem; font-weight: 700; color: #1f3615; line-height: 1; }
.pf-reward-full-unit { font-size: .95rem; color: var(--ink-3); }
.pf-reward-full-tier { display: flex; flex-direction: column; align-items: center; gap: 5px; }
.pf-reward-full-tier-icon { width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 17px; }
.pf-reward-progress-wrap { margin-bottom: 14px; }
.pf-reward-full-card .pf-reward-bar-track { background: #e5dfcc; }
.pf-reward-full-card .pf-reward-bar-hint { color: var(--ink-2); opacity: 1; }
.pf-reward-breakdown { display: flex; align-items: center; background: #f6f2e9; border-radius: 10px; padding: 12px; margin-bottom: 12px; }
.pf-reward-stat { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 3px; }
.pf-reward-stat-val { font-family: 'Cormorant Garamond', serif; font-size: 1.6rem; font-weight: 700; color: #1f3615; line-height: 1; }
.pf-reward-stat-lbl { font-size: 10px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; color: var(--ink-2); }
.pf-reward-divider { width: 1px; height: 30px; background: #d9d0b6; }
.pf-reward-how { display: flex; flex-direction: column; gap: 8px; }
.pf-reward-how-title { font-size: 10.5px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; color: var(--ink-2); }
.pf-reward-how-row { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; color: var(--ink); }
.pf-reward-how-icon { font-size: 14px; flex-shrink: 0; }
.pf-reward-how-pts { margin-left: auto; font-size: 11.5px; font-weight: 800; color: #2c5a0c; background: #e3f1d8; padding: 2px 9px; border-radius: 100px; }

/* ── ADDRESS ── */
.pf-address-card { background: #fff; border: 1px solid var(--line); border-radius: 14px; padding: 14px; margin-bottom: 12px; }
.pf-address-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; gap: 8px; }
.pf-address-actions { display: flex; align-items: center; gap: 4px; }
.pf-address-tag { font-size: 10.5px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; background: #e3f1d8; color: #2c5a0c; padding: 4px 10px; border-radius: 100px; }
.pf-address-edit, .pf-address-delete { font-family: inherit; font-size: 12px; font-weight: 800; background: none; border: none; cursor: pointer; padding: 5px 7px; }
.pf-address-edit { color: #2f4d22; }
.pf-address-delete { color: #b02a2a; }
.pf-address-txt { font-size: 13px; font-weight: 500; color: var(--ink-2); line-height: 1.65; overflow-wrap: anywhere; }
.pf-add-address {
  margin-top: 6px; width: 100%; padding: 13px; border: 2px dashed #7fae60; border-radius: 12px;
  background: #eef6e8; color: #2c5a0c; font-family: inherit; font-size: 13px; font-weight: 800;
  cursor: pointer; -webkit-tap-highlight-color: transparent;
}

/* ── FORMS ── */
.pf-form { display: flex; flex-direction: column; gap: 13px; }
.pf-label { display: flex; flex-direction: column; gap: 6px; font-size: 11.5px; font-weight: 800; letter-spacing: .04em; color: var(--ink-2); }
.pf-input {
  width: 100%; padding: 12px 13px; border: 1.5px solid #cfc6aa; border-radius: 10px;
  font-size: 16px; font-weight: 500; font-family: 'Nunito', sans-serif;
  background: #fff; color: var(--ink); outline: none; transition: border-color .2s, box-shadow .2s;
}
.pf-input::placeholder { color: #8a8a7c; }
.pf-input:focus { border-color: #2f4d22; box-shadow: 0 0 0 3px rgba(47,77,34,.15); }
.pf-submit {
  margin-top: 4px; padding: 13px; background: #2f4d22; color: #fff; border: none; border-radius: 10px;
  font-family: inherit; font-size: 13px; font-weight: 800; letter-spacing: .08em;
  cursor: pointer; -webkit-tap-highlight-color: transparent;
}
.pf-submit:hover { background: #3d6a2c; }
.pf-submit:disabled, .pf-dialog-cancel:disabled, .pf-address-delete:disabled { opacity: .6; cursor: not-allowed; }

/* ── OVERLAYS & DIALOGS ── */
.pf-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.55); z-index: 1000; display: flex; align-items: flex-end; justify-content: center; }
.pf-dialog { background: #fff; border-radius: 20px 20px 0 0; padding: 14px 20px 26px; width: 100%; max-width: 520px; max-height: 92vh; overflow-y: auto; }
.pf-review-dialog { padding-bottom: 28px; }
.pf-dialog-handle { width: 36px; height: 4px; border-radius: 100px; background: #d4cbb0; margin: 0 auto 16px; }
.pf-dialog-title { font-family: 'Cormorant Garamond', serif; font-size: 1.5rem; font-weight: 700; color: var(--ink); margin-bottom: 4px; }
.pf-dialog-sub { font-size: 13px; font-weight: 500; color: var(--ink-2); margin-bottom: 18px; }
.pf-dialog-actions { display: flex; gap: 10px; }
.pf-dialog-cancel { flex: 1; padding: 12px; border: 1.5px solid #cfc6aa; border-radius: 10px; background: #fff; font-family: inherit; font-size: 13px; font-weight: 800; color: var(--ink-2); cursor: pointer; }
.pf-dialog-confirm { flex: 1; padding: 12px; background: #b02a2a; border: none; border-radius: 10px; font-family: inherit; font-size: 13px; font-weight: 800; color: #fff; cursor: pointer; }

/* ── REVIEW MODAL ── */
.pf-review-item-name { font-size: 11px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; color: var(--ink-3); margin-bottom: 2px; overflow-wrap: anywhere; }
.pf-stars-row { display: flex; gap: 6px; margin: 10px 0 14px; }
.pf-star { font-size: 30px; background: none; border: none; cursor: pointer; color: #cfcfc4; transition: color .12s, transform .12s; padding: 0; line-height: 1; }
.pf-star.active { color: #d99a00; }
.pf-star:hover { transform: scale(1.12); }
.pf-review-textarea {
  width: 100%; padding: 12px; border: 1.5px solid #cfc6aa; border-radius: 10px;
  font-size: 16px; font-family: 'Nunito', sans-serif; color: var(--ink);
  background: #fff; outline: none; resize: none; margin-bottom: 10px;
}
.pf-review-textarea:focus { border-color: #2f4d22; }
.pf-reward-hint {
  display: flex; align-items: center; gap: 7px; font-size: 12.5px; font-weight: 600; color: #5a3f00;
  background: #fff3d1; border: 1.5px solid #e0b93f; border-radius: 9px; padding: 9px 12px; margin-bottom: 16px;
}
.pf-review-submit { background: #2f4d22 !important; }
.pf-review-submit:disabled { background: #b5b5aa !important; cursor: not-allowed; }
.pf-review-dialog .pf-dialog-confirm { color: #fff; }

/* ── TOAST ── */
.pf-toast {
  position: fixed; bottom: 96px; left: 50%; transform: translateX(-50%);
  background: #1f3615; color: #ffe9a8; font-size: 12.5px; font-weight: 800; letter-spacing: .03em;
  padding: 11px 18px; border-radius: 100px; z-index: 2000;
  max-width: calc(100vw - 32px); text-align: center; box-shadow: 0 8px 24px rgba(0,0,0,.25);
  animation: toastIn .3s ease, toastOut .3s ease 2.7s forwards; pointer-events: none;
}
@keyframes toastIn { from { opacity: 0; transform: translateX(-50%) translateY(12px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
@keyframes toastOut { from { opacity: 1; } to { opacity: 0; } }

/* ═══ TABLET ≥ 600px ═══ */
@media (min-width: 600px) {
  .pf-hero { padding: 30px calc(50% - 300px) 26px; gap: 18px; }
  .pf-avatar { width: 68px; height: 68px; }
  .pf-name { font-size: 1.8rem; }
  .pf-email { font-size: 13.5px; }
  .pf-body { max-width: 640px; margin: 0 auto; padding: 26px 0; }
  .pf-section-label { font-size: 11.5px; }
  .pf-item { padding: 16px; }
  .pf-item-name { font-size: 15px; }
  .pf-item-sub { font-size: 12.5px; }
  .pf-reward-card { padding: 22px 20px; }
  .pf-reward-pts { font-size: 2.9rem; }
  .pf-order-id { font-size: 14px; }
  .pf-order-item-name { font-size: 14px; }
  .pf-order-item-img, .pf-order-item-placeholder { width: 64px; height: 64px; }
  .pf-address-txt { font-size: 14px; }
  .pf-shipment-steps { min-width: 0; }
  .pf-overlay { align-items: center; }
  .pf-dialog { border-radius: 20px; max-width: 440px; }
  .pf-toast { bottom: 32px; }
}

/* ═══ LAPTOP ≥ 1024px ═══ */
@media (min-width: 1024px) {
  .pf-hero { padding-left: calc(50% - 360px); padding-right: calc(50% - 360px); }
  .pf-body { max-width: 720px; }
  .pf-name { font-size: 2rem; }
  .pf-item-name { font-size: 15.5px; }
}

/* ═══ SMALL PHONES ═══ */
@media (max-width: 380px) {
  .pf-hero { gap: 11px; padding: 22px 12px 18px; }
  .pf-avatar { width: 50px; height: 50px; }
  .pf-name { font-size: 1.35rem; }
  .pf-body { padding: 14px 10px; }
  .pf-reward-pts { font-size: 2.2rem; }
  .pf-order-item-img, .pf-order-item-placeholder { width: 50px; height: 50px; }
}
`;