'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { useAuth } from '@/lib/authContext';
import { apiRequest } from '@/lib/api';

/* ─────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────── */
interface CommissionRow {
  id: string;
  orderId: string;
  referredName: string;
  productTitle: string | null;
  couponCode: string | null;
  orderAmount: number;
  date: string;
  earning: number;
  status: 'pending' | 'delivered' | 'approved' | 'paid' | 'cancelled';
  isDelivered: boolean;
  isCancelled: boolean;
  orderStatus: string;
}

interface AffiliateProduct {
  id: string;
  title: string;
  price: number;
  discountedPrice?: number | null;
  mainImage?: string | null;
  itemType?: 'product' | 'combo';
  comboType?: 'curated' | 'custom';
}

interface AffiliateLinkItem {
  id: string;
  linkCode: string;
  url: string;
  clicks: number;
  ordersCount: number;
  totalEarned: number;
  createdAt: string;
  product: AffiliateProduct | null;
}

interface AffiliateCouponItem {
  id: string;
  code: string;
  name: string;
  discountValue: number;
  discountType: string;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
}

interface DashboardStats {
  totalEarned: number;
  pendingEarned: number;
  totalOrderValue: number;
  totalClicks: number;
  totalOrders: number;
  deliveredOrders: number;
  pendingOrders: number;
  totalReferrals: number;
}

interface AffiliateDashboardResponse {
  success: boolean;
  affiliateCode: string;
  affiliateLink: string;
  stats: DashboardStats;
  commissions: CommissionRow[];
  affiliateLinks: AffiliateLinkItem[];
  coupons: AffiliateCouponItem[];
}

interface CatalogProductItem {
  _id: string;
  title: string;
  price: number;
  discountedPrice?: number | null;
  mainImage?: string | null;
  images?: string[];
  category?: { name?: string; slug?: string } | string;
  stock?: number | null;
  itemType?: 'product' | 'combo';
  comboType?: 'curated' | 'custom';
}

interface ProductsResponse {
  success: boolean;
  products: CatalogProductItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */
function formatINR(amount: number) {
  return `₹${(amount || 0).toLocaleString('en-IN')}`;
}

function formatDate(iso: string) {
  if (!iso) return 'Recent';
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return 'Recent';
  }
}

/* ─────────────────────────────────────────────────────────────
   AFFILIATE DASHBOARD COMPONENT
───────────────────────────────────────────────────────────── */
export default function AffiliatePage() {
  const { isAuthenticated, loading: authLoading, user } = useAuth();

  // Tab State
  const [activeTab, setActiveTab] = useState<'products' | 'links' | 'coupons' | 'orders'>('products');

  // Dashboard Data
  const [affiliateCode, setAffiliateCode] = useState('');
  const [generalLink, setGeneralLink] = useState('');
  const [stats, setStats] = useState<DashboardStats>({
    totalEarned: 0,
    pendingEarned: 0,
    totalOrderValue: 0,
    totalClicks: 0,
    totalOrders: 0,
    deliveredOrders: 0,
    pendingOrders: 0,
    totalReferrals: 0,
  });
  const [commissions, setCommissions] = useState<CommissionRow[]>([]);
  const [affiliateLinks, setAffiliateLinks] = useState<AffiliateLinkItem[]>([]);
  const [coupons, setCoupons] = useState<AffiliateCouponItem[]>([]);

  // Products Tab State
  const [products, setProducts] = useState<CatalogProductItem[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  // Custom Coupon State
  const [couponInput, setCouponInput] = useState('');
  const [creatingCoupon, setCreatingCoupon] = useState(false);
  const [couponMsg, setCouponMsg] = useState<{ text: string; error: boolean } | null>(null);

  // Copy Feedback
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Page Load State
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState('');

  const searchTimer = useRef<NodeJS.Timeout | null>(null);

  // Fetch Dashboard Core Data
  const fetchDashboard = useCallback(async () => {
    try {
      setError('');
      const dashRes = await apiRequest<AffiliateDashboardResponse>('/affiliate/dashboard');
      if (dashRes.success) {
        setAffiliateCode(dashRes.affiliateCode);
        const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
        let gl = dashRes.affiliateLink || '';
        if (dashRes.affiliateCode && currentOrigin) {
          gl = `${currentOrigin}/signup?ref=${dashRes.affiliateCode}`;
        }
        setGeneralLink(gl);
        setStats(dashRes.stats);
        setCommissions(dashRes.commissions || []);
        setAffiliateLinks(dashRes.affiliateLinks || []);
        setCoupons(dashRes.coupons || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load affiliate dashboard.');
    } finally {
      setPageLoading(false);
    }
  }, []);

  // Fetch Catalog Products (10 items or matching search)
  const fetchProducts = useCallback(async (search = '') => {
    setProductsLoading(true);
    try {
      const queryParam = search.trim() ? `?search=${encodeURIComponent(search.trim())}&limit=10` : '?limit=10';
      const res = await apiRequest<ProductsResponse>(`/affiliate/products${queryParam}`);
      if (res.success) {
        setProducts(res.products || []);
      }
    } catch (err) {
      console.error('Failed to load products for affiliate links:', err);
    } finally {
      setProductsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setPageLoading(false);
      return;
    }
    void fetchDashboard();
    void fetchProducts();
  }, [isAuthenticated, authLoading, fetchDashboard, fetchProducts]);

  // Search input handler with debounce
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      void fetchProducts(val);
    }, 320);
  };

  // Copy text helper
  const handleCopy = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2200);
    });
  };

  // Generate Link for a product
  const handleGenerateLink = async (productId: string) => {
    setGeneratingId(productId);
    try {
      const res = await apiRequest<{ success: boolean; link: AffiliateLinkItem; created: boolean }>(
        '/affiliate/generate-link',
        {
          method: 'POST',
          body: JSON.stringify({ productId }),
        }
      );
      if (res.success && res.link) {
        const linkItem: AffiliateLinkItem = {
          ...res.link,
          id: res.link.id || (res.link as any)._id || `link_${Date.now()}`,
        };
        // Update local affiliate links list
        setAffiliateLinks((prev) => {
          const exists = prev.some((l) => (l.id || (l as any)._id) === linkItem.id);
          return exists ? prev : [linkItem, ...prev];
        });

        // Copy link to clipboard immediately
        const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
        let targetUrl = linkItem.url;
        if (currentOrigin && targetUrl.includes('localhost')) {
          targetUrl = targetUrl.replace(/^https?:\/\/localhost(:\d+)?/, currentOrigin);
        }
        handleCopy(targetUrl, `product_${productId}`);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to generate link.');
    } finally {
      setGeneratingId(null);
    }
  };

  // Create Custom Coupon
  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingCoupon(true);
    setCouponMsg(null);
    try {
      const res = await apiRequest<{ success: boolean; coupon: AffiliateCouponItem; created: boolean }>(
        '/affiliate/create-coupon',
        {
          method: 'POST',
          body: JSON.stringify({ code: couponInput }),
        }
      );
      if (res.success && res.coupon) {
        const couponItem: AffiliateCouponItem = {
          ...res.coupon,
          id: res.coupon.id || (res.coupon as any)._id || res.coupon.code,
        };
        setCoupons((prev) => [
          couponItem,
          ...prev.filter((c) => (c.id || (c as any)._id || c.code) !== (couponItem.id || couponItem.code)),
        ]);
        setCouponInput('');
        setCouponMsg({ text: `Coupon "${couponItem.code}" created successfully with 10% discount!`, error: false });
      }
    } catch (err) {
      setCouponMsg({ text: err instanceof Error ? err.message : 'Failed to create coupon.', error: true });
    } finally {
      setCreatingCoupon(false);
    }
  };

  // Find if link is already created for a product
  const getExistingLinkForProduct = (productId: string) => {
    return affiliateLinks.find(
      (l) => l.product?.id === productId || (l.product as any)?._id === productId
    );
  };

  return (
    <>
      <style>{`

        :root {
          --bg:       #ffffff;
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
          margin-top: 55px;
          padding: 42px 24px 34px;
          background: linear-gradient(145deg, #f8f6f0 0%, #ece5d3 60%, #f4efe1 100%);
          border-bottom: 1px solid var(--bdr);
          position: relative;
        }
        .aff-hero-inner { max-width: 1180px; margin: 0 auto; display: flex; justify-content: space-between; align-items: flex-end; gap: 24px; flex-wrap: wrap; }
        .aff-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 10px; font-weight: 700; letter-spacing: 0.22em; text-transform: uppercase;
          color: var(--olive); margin-bottom: 8px;
        }
        .aff-eyebrow::before, .aff-eyebrow::after { content: ''; width: 18px; height: 1.5px; background: var(--olive); opacity: 0.5; }
        .aff-hero h1 {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: clamp(2rem, 3.8vw, 3.2rem); font-weight: 500; color: var(--olive-dark); line-height: 1.15;
        }
        .aff-hero h1 em { font-style: italic; color: var(--gold); }
        .aff-hero-desc {
          font-size: 13.5px; color: var(--ink-muted); margin-top: 8px; line-height: 1.6; max-width: 520px;
        }
        .aff-code-badge {
          background: var(--surf); border: 1.5px solid var(--bdr-strong);
          padding: 10px 18px; border-radius: 6px; box-shadow: var(--shadow-sm);
          display: flex; flex-direction: column; gap: 2px;
        }
        .aff-code-lbl { font-size: 9px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: var(--ink-faint); }
        .aff-code-val { font-family: 'Courier New', monospace; font-size: 18px; font-weight: 700; color: var(--olive); letter-spacing: 0.1em; }

        /* ── CONTAINER ── */
        .aff-container { max-width: 1180px; margin: 0 auto; padding: 28px 20px 0; }

        /* ── STATS ROW ── */
        .aff-stats-grid {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 24px;
        }
        @media(max-width: 900px) {
          .aff-stats-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media(max-width: 480px) {
          .aff-stats-grid { grid-template-columns: 1fr; }
        }
        .aff-card {
          background: var(--surf); border: 1px solid var(--bdr);
          border-radius: 8px; padding: 20px 20px; box-shadow: var(--shadow-sm);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .aff-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
        .aff-card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
        .aff-card-title { font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-muted); }
        .aff-pill {
          font-size: 9px; font-weight: 700; padding: 3px 8px; border-radius: 20px; letter-spacing: 0.04em;
        }
        .aff-pill.pill-green { background: var(--green-bg); color: var(--green); }
        .aff-pill.pill-amber { background: var(--amber-bg); color: var(--amber); }
        .aff-pill.pill-olive { background: var(--olive-light); color: var(--olive); }
        .aff-card-number { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 32px; font-weight: 600; color: var(--ink); line-height: 1; }
        .aff-card-number.delivered { color: var(--olive); }
        .aff-card-sub { font-size: 11.5px; color: var(--ink-faint); margin-top: 6px; }

        /* ── GENERAL LINK BAR ── */
        .aff-share-bar {
          background: var(--surf); border: 1.5px solid var(--bdr);
          border-radius: 8px; padding: 18px 22px; margin-bottom: 28px;
          display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap;
        }
        .aff-share-info { display: flex; flex-direction: column; gap: 4px; }
        .aff-share-title { font-size: 13px; font-weight: 700; color: var(--olive-dark); display: flex; align-items: center; gap: 6px; }
        .aff-share-desc { font-size: 12px; color: var(--ink-muted); }
        .aff-input-group { display: flex; gap: 8px; flex: 1; max-width: 520px; min-width: 280px; }
        .aff-input {
          flex: 1; font-size: 12px; font-family: 'Courier New', monospace; padding: 9px 12px;
          border: 1px solid var(--bdr-strong); border-radius: 6px; background: var(--surf-subtle); color: var(--ink);
          outline: none; transition: border-color 0.2s;
        }
        .aff-input:focus { border-color: var(--olive); background: #fff; }
        .aff-btn {
          font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
          padding: 9px 16px; border-radius: 6px; border: 1px solid transparent;
          cursor: pointer; display: inline-flex; align-items: center; gap: 6px; white-space: nowrap;
          transition: all 0.2s;
        }
        .aff-btn-primary { background: var(--olive); color: #fff; border-color: var(--olive); }
        .aff-btn-primary:hover { background: var(--olive-soft); }
        .aff-btn-outline { background: var(--surf); color: var(--olive); border-color: var(--bdr-strong); }
        .aff-btn-outline:hover { background: var(--olive-light); border-color: var(--olive); }
        .aff-btn-success { background: var(--green-bg); color: var(--green); border-color: rgba(31,102,52,0.3); }

        /* ── TABS ── */
        .aff-tabs {
          display: flex; gap: 8px; border-bottom: 2px solid var(--bdr); margin-bottom: 24px; overflow-x: auto;
        }
        .aff-tab-btn {
          padding: 12px 20px; font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
          background: transparent; border: none; border-bottom: 3px solid transparent; margin-bottom: -2px;
          color: var(--ink-muted); cursor: pointer; display: flex; align-items: center; gap: 8px;
          transition: all 0.2s; white-space: nowrap;
        }
        .aff-tab-btn:hover { color: var(--olive); }
        .aff-tab-btn.active { color: var(--olive-dark); border-bottom-color: var(--olive); }
        .aff-tab-count {
          font-size: 10px; padding: 2px 7px; border-radius: 12px; background: var(--bdr); color: var(--ink-muted);
        }
        .aff-tab-btn.active .aff-tab-count { background: var(--olive-light); color: var(--olive); font-weight: 700; }

        /* ── TAB 1: PRODUCT SEARCH & GRID ── */
        .aff-search-box {
          position: relative; margin-bottom: 20px; max-width: 580px;
        }
        .aff-search-input {
          width: 100%; font-size: 13px; padding: 12px 42px 12px 16px;
          border: 1.5px solid var(--bdr-strong); border-radius: 8px; background: var(--surf);
          color: var(--ink); outline: none; transition: border-color 0.2s, box-shadow 0.2s;
        }
        .aff-search-input:focus { border-color: var(--olive); box-shadow: 0 0 0 3px rgba(48,67,24,0.08); }
        .aff-search-clear {
          position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
          background: transparent; border: none; font-size: 14px; color: var(--ink-faint); cursor: pointer;
        }
        .aff-products-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px;
        }
        .aff-product-card {
          background: var(--surf); border: 1px solid var(--bdr); border-radius: 8px;
          overflow: hidden; display: flex; flex-direction: column; transition: transform 0.2s, box-shadow 0.2s;
        }
        .aff-product-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); border-color: var(--bdr-strong); }
        .aff-product-img-wrap {
          position: relative; width: 100%; aspect-ratio: 4/4.5; background: #eee8dc; overflow: hidden;
        }
        .aff-product-img { object-fit: cover; transition: transform 0.3s; }
        .aff-product-card:hover .aff-product-img { transform: scale(1.04); }
        .aff-product-info { padding: 14px 14px 16px; display: flex; flex-direction: column; flex: 1; }
        .aff-product-cat { font-size: 9px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--gold); margin-bottom: 4px; }
        .aff-product-title {
          font-size: 13px; font-weight: 600; color: var(--ink); line-height: 1.35;
          margin-bottom: 8px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }
        .aff-product-price-row { display: flex; align-items: baseline; gap: 8px; margin-bottom: 12px; margin-top: auto; }
        .aff-product-price { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 18px; font-weight: 700; color: var(--olive); }
        .aff-product-orig { font-size: 11px; text-decoration: line-through; color: var(--ink-faint); }
        .aff-product-comm { font-size: 10.5px; font-weight: 700; color: var(--green); margin-left: auto; }
        .aff-product-actions { display: flex; flex-direction: column; gap: 6px; }

        /* ── TAB 2: LINKS TABLE ── */
        .aff-table-wrapper {
          background: var(--surf); border: 1px solid var(--bdr); border-radius: 8px; overflow: hidden; box-shadow: var(--shadow-sm);
        }
        .aff-table-scroll { overflow-x: auto; }
        table.aff-data-table { width: 100%; border-collapse: collapse; font-size: 12.5px; min-width: 650px; }
        table.aff-data-table th {
          background: var(--surf-subtle); padding: 12px 16px; text-align: left;
          font-size: 9px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-muted);
          border-bottom: 1.5px solid var(--bdr);
        }
        table.aff-data-table td {
          padding: 14px 16px; border-bottom: 1px solid var(--bdr); vertical-align: middle;
        }
        table.aff-data-table tr:last-child td { border-bottom: none; }
        table.aff-data-table tr:hover td { background: #fafaf5; }
        .td-prod-cell { display: flex; align-items: center; gap: 12px; }
        .td-prod-thumb { width: 44px; height: 44px; border-radius: 4px; object-fit: cover; background: #eae4d8; flex-shrink: 0; }
        .td-prod-title { font-weight: 600; color: var(--ink); line-height: 1.3; }

        /* ── TAB 3: COUPON CREATOR ── */
        .aff-coupon-panel {
          display: grid; grid-template-columns: 1fr 1fr; gap: 20px;
        }
        @media(max-width: 768px) { .aff-coupon-panel { grid-template-columns: 1fr; } }
        .aff-coupon-creator-card {
          background: var(--surf); border: 1.5px solid var(--bdr); border-radius: 8px; padding: 24px;
        }
        .aff-form-label { font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-muted); margin-bottom: 6px; display: block; }
        .aff-coupon-input {
          width: 100%; font-size: 15px; font-family: 'Courier New', monospace; font-weight: 700; letter-spacing: 0.1em;
          padding: 10px 14px; border: 1.5px solid var(--bdr-strong); border-radius: 6px; text-transform: uppercase;
          margin-bottom: 12px; outline: none;
        }
        .aff-coupon-input:focus { border-color: var(--olive); }
        .aff-coupon-preview {
          background: var(--gold-light); border: 1px dashed var(--gold); border-radius: 6px;
          padding: 14px; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between;
        }
        .aff-coupon-preview-code { font-family: 'Courier New', monospace; font-size: 18px; font-weight: 700; color: var(--olive); }
        .aff-coupon-preview-disc { font-size: 11px; font-weight: 700; color: var(--gold); text-transform: uppercase; }

        /* ── NOTICES / BANNER ── */
        .aff-notice-banner {
          background: var(--olive-light); border: 1px solid rgba(48,67,24,0.18);
          border-radius: 8px; padding: 14px 18px; margin-top: 24px; font-size: 12px;
          color: var(--olive-dark); line-height: 1.6; display: flex; align-items: flex-start; gap: 10px;
        }

        /* ── SKELETON & EMPTY ── */
        .aff-skeleton-box {
          background: linear-gradient(90deg, #ede7db 25%, #f7f4ed 50%, #ede7db 75%);
          background-size: 400% 100%; animation: affShimmer 1.4s infinite linear;
          border-radius: 4px;
        }
        @keyframes affShimmer { from { background-position: 100% 0; } to { background-position: -100% 0; } }

        .aff-empty-state {
          padding: 44px 20px; text-align: center; color: var(--ink-muted);
        }
        .aff-empty-icon { font-size: 36px; margin-bottom: 8px; }
        .aff-empty-title { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 20px; font-weight: 600; color: var(--ink); margin-bottom: 4px; }
        .aff-empty-sub { font-size: 12.5px; color: var(--ink-faint); max-width: 400px; margin: 0 auto; line-height: 1.6; }
      `}</style>

      <div className="aff-page">

        {/* ── HERO ── */}
        <section className="aff-hero">
          <div className="aff-hero-inner">
            <div>
              <div className="aff-eyebrow">Affiliate & Partner Program</div>
              <h1>
                Affiliate <em>Workstation</em>
              </h1>
              <p className="aff-hero-desc">
                Generate product tracking links or personalized coupons. Earn a <strong>flat 10% commission</strong> on every order delivered to your referred shoppers.
              </p>
            </div>

            {isAuthenticated && affiliateCode && (
              <div className="aff-code-badge">
                <span className="aff-code-lbl">Your Affiliate Code</span>
                <span className="aff-code-val">{affiliateCode}</span>
              </div>
            )}
          </div>
        </section>

        {/* ── MAIN CONTENT ── */}
        <main className="aff-container">

          {/* NOT LOGGED IN */}
          {!authLoading && !isAuthenticated && (
            <div className="aff-card" style={{ textAlign: 'center', padding: '50px 24px' }}>
              <div style={{ fontSize: 44, marginBottom: 12 }}>🔐</div>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 26, color: 'var(--olive)', marginBottom: 8 }}>
                Sign in to your Affiliate Account
              </h2>
              <p style={{ fontSize: 13, color: 'var(--ink-muted)', maxWidth: 420, margin: '0 auto 20px', lineHeight: 1.6 }}>
                Create product links, monitor live click counts, and track your delivered earnings from your personal dashboard.
              </p>
              <button
                className="aff-btn aff-btn-primary"
                onClick={() => window.dispatchEvent(new CustomEvent('makeussparkle:auth-open', { detail: { tab: 'login' } }))}
              >
                Sign in / Register
              </button>
            </div>
          )}

          {/* LOADING STATE */}
          {(authLoading || pageLoading) && isAuthenticated !== false && (
            <div>
              <div className="aff-stats-grid">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="aff-card">
                    <div className="aff-skeleton-box" style={{ height: 12, width: 90, marginBottom: 12 }} />
                    <div className="aff-skeleton-box" style={{ height: 32, width: 130 }} />
                  </div>
                ))}
              </div>
              <div className="aff-skeleton-box" style={{ height: 260, borderRadius: 8 }} />
            </div>
          )}

          {/* ERROR STATE */}
          {error && !pageLoading && (
            <div className="aff-card" style={{ textAlign: 'center', color: 'var(--red)', padding: 30 }}>
              <p style={{ fontWeight: 600 }}>{error}</p>
              <button className="aff-btn aff-btn-outline" style={{ marginTop: 12 }} onClick={fetchDashboard}>
                Try again
              </button>
            </div>
          )}

          {/* AUTHENTICATED DASHBOARD */}
          {isAuthenticated && !pageLoading && !error && (
            <>
              {/* STATS OVERVIEW */}
              <section className="aff-stats-grid">
                <div className="aff-card">
                  <div className="aff-card-header">
                    <span className="aff-card-title">Delivered Earnings (10%)</span>
                    <span className="aff-pill pill-green">Reflected</span>
                  </div>
                  <div className="aff-card-number delivered">{formatINR(stats.totalEarned)}</div>
                  <div className="aff-card-sub">
                    Credited from {stats.deliveredOrders} delivered order{stats.deliveredOrders !== 1 ? 's' : ''}
                  </div>
                </div>

                <div className="aff-card">
                  <div className="aff-card-header">
                    <span className="aff-card-title">Pending Delivery</span>
                    <span className="aff-pill pill-amber">Awaiting Delivery</span>
                  </div>
                  <div className="aff-card-number">{formatINR(stats.pendingEarned)}</div>
                  <div className="aff-card-sub">
                    From {stats.pendingOrders} order{stats.pendingOrders !== 1 ? 's' : ''} currently in transit
                  </div>
                </div>

                <div className="aff-card">
                  <div className="aff-card-header">
                    <span className="aff-card-title">Total Link Clicks</span>
                    <span className="aff-pill pill-olive">Live Activity</span>
                  </div>
                  <div className="aff-card-number">{stats.totalClicks}</div>
                  <div className="aff-card-sub">Recorded across all your product links</div>
                </div>

                <div className="aff-card">
                  <div className="aff-card-header">
                    <span className="aff-card-title">Total Conversions</span>
                    <span className="aff-pill pill-olive">Orders</span>
                  </div>
                  <div className="aff-card-number">{stats.totalOrders}</div>
                  <div className="aff-card-sub">Gross order volume: {formatINR(stats.totalOrderValue)}</div>
                </div>
              </section>

              {/* GENERAL STORE LINK BAR */}
              <div className="aff-share-bar">
                <div className="aff-share-info">
                  <div className="aff-share-title">
                    <span>🌟</span> Your General Store Invite Link
                  </div>
                  <div className="aff-share-desc">
                    Share MakeUsSparkle homepage. Any order placed by visitors arriving via this link earns you 10%.
                  </div>
                </div>
                <div className="aff-input-group">
                  <input className="aff-input" type="text" readOnly value={generalLink} />
                  <button
                    className={`aff-btn ${copiedKey === 'general' ? 'aff-btn-success' : 'aff-btn-primary'}`}
                    onClick={() => handleCopy(generalLink, 'general')}
                  >
                    {copiedKey === 'general' ? '✓ Copied' : 'Copy Link'}
                  </button>
                  <a
                    className="aff-btn aff-btn-outline"
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                      `Explore handcrafted luxury jewellery & gifts at MakeUsSparkle: ${generalLink}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Share on WhatsApp"
                  >
                    WhatsApp
                  </a>
                </div>
              </div>

              {/* NAVIGATION TABS */}
              <nav className="aff-tabs">
                <button
                  className={`aff-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
                  onClick={() => setActiveTab('products')}
                >
                  <span>✨ Generate Product Links</span>
                </button>

                <button
                  className={`aff-tab-btn ${activeTab === 'links' ? 'active' : ''}`}
                  onClick={() => setActiveTab('links')}
                >
                  <span>🔗 My Generated Links</span>
                  <span className="aff-tab-count">{affiliateLinks.length}</span>
                </button>

                <button
                  className={`aff-tab-btn ${activeTab === 'coupons' ? 'active' : ''}`}
                  onClick={() => setActiveTab('coupons')}
                >
                  <span>🎟️ My Custom Coupons</span>
                  <span className="aff-tab-count">{coupons.length}</span>
                </button>

                <button
                  className={`aff-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
                  onClick={() => setActiveTab('orders')}
                >
                  <span>📦 Orders & Commissions</span>
                  <span className="aff-tab-count">{commissions.length}</span>
                </button>
              </nav>

              {/* ── TAB 1: PRODUCT PICKER & LINK GENERATOR ── */}
              {activeTab === 'products' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 24, fontWeight: 600, color: 'var(--olive-dark)' }}>
                        Choose Any Product to Create an Affiliate Link
                      </h2>
                      <p style={{ fontSize: 12.5, color: 'var(--ink-muted)' }}>
                        Showing 10 products by default. Use the search box below to search any piece from the catalog.
                      </p>
                    </div>

                    <div className="aff-search-box" style={{ margin: 0, minWidth: 280 }}>
                      <input
                        className="aff-search-input"
                        type="text"
                        placeholder="Search product by title, tag..."
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                      />
                      {searchQuery && (
                        <button className="aff-search-clear" onClick={() => handleSearchChange('')}>
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                  {productsLoading ? (
                    <div className="aff-products-grid">
                      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                        <div key={i} className="aff-product-card" style={{ padding: 14 }}>
                          <div className="aff-skeleton-box" style={{ width: '100%', aspectRatio: '4/4.5', marginBottom: 12 }} />
                          <div className="aff-skeleton-box" style={{ height: 12, width: '60%', marginBottom: 8 }} />
                          <div className="aff-skeleton-box" style={{ height: 14, width: '90%', marginBottom: 14 }} />
                          <div className="aff-skeleton-box" style={{ height: 32, width: '100%' }} />
                        </div>
                      ))}
                    </div>
                  ) : products.length === 0 ? (
                    <div className="aff-card aff-empty-state">
                      <div className="aff-empty-icon">🔍</div>
                      <div className="aff-empty-title">No matching products found</div>
                      <div className="aff-empty-sub">Try searching with a different keyword or view the full catalog.</div>
                    </div>
                  ) : (
                    <div className="aff-products-grid">
                      {products.map((p, idx) => {
                        const prodId = p._id || `prod_${idx}`;
                        const existing = getExistingLinkForProduct(p._id);
                        const isGenerating = generatingId === p._id;
                        const copyKey = `product_${p._id}`;
                        const isCopied = copiedKey === copyKey;
                        const categoryName = typeof p.category === 'object' ? p.category?.name : p.category;

                        return (
                          <div key={prodId} className="aff-product-card">
                            <div className="aff-product-img-wrap">
                              <Image
                                src={p.mainImage || p.images?.[0] || '/images/hero.png'}
                                alt={p.title}
                                fill
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
                                className="aff-product-img"
                              />
                            </div>
                            <div className="aff-product-info">
                              {categoryName && <span className="aff-product-cat">{categoryName}</span>}
                              <h3 className="aff-product-title" title={p.title}>
                                {p.title}
                              </h3>
                              <div className="aff-product-price-row">
                                <span className="aff-product-price">{formatINR(p.price)}</span>
                                {p.discountedPrice && p.discountedPrice < p.price && (
                                  <span className="aff-product-orig">{formatINR(p.price)}</span>
                                )}
                                <span className="aff-product-comm" title="10% Commission on delivery">
                                  Earn {formatINR(Math.round(p.price * 0.1))}
                                </span>
                              </div>

                              <div className="aff-product-actions">
                                {existing ? (
                                  <>
                                    <button
                                      className={`aff-btn ${isCopied ? 'aff-btn-success' : 'aff-btn-primary'}`}
                                      style={{ width: '100%', justifyContent: 'center' }}
                                      onClick={() => handleCopy(existing.url, copyKey)}
                                    >
                                      {isCopied ? '✓ Link Copied' : '⎘ Copy Affiliate Link'}
                                    </button>
                                    <a
                                      className="aff-btn aff-btn-outline"
                                      style={{ width: '100%', justifyContent: 'center', fontSize: 10 }}
                                      href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                                        `Check out "${p.title}" on MakeUsSparkle: ${existing.url}`
                                      )}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      Share on WhatsApp
                                    </a>
                                  </>
                                ) : (
                                  <button
                                    className="aff-btn aff-btn-primary"
                                    style={{ width: '100%', justifyContent: 'center' }}
                                    disabled={isGenerating}
                                    onClick={() => handleGenerateLink(p._id)}
                                  >
                                    {isGenerating ? 'Generating...' : '+ Generate Affiliate Link'}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ── TAB 2: MY GENERATED LINKS & CLICKS ── */}
              {activeTab === 'links' && (
                <div className="aff-table-wrapper">
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--bdr)', background: 'var(--surf-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, color: 'var(--olive-dark)', margin: 0 }}>
                        Your Generated Product Links &amp; Live Clicks
                      </h3>
                      <p style={{ fontSize: 12, color: 'var(--ink-muted)', margin: 0 }}>
                        Every unique click is tracked in real-time. Share your link to drive orders.
                      </p>
                    </div>
                    <span className="aff-pill pill-olive">{affiliateLinks.length} Active Link{affiliateLinks.length !== 1 ? 's' : ''}</span>
                  </div>

                  {affiliateLinks.length === 0 ? (
                    <div className="aff-empty-state">
                      <div className="aff-empty-icon">🔗</div>
                      <div className="aff-empty-title">No product links created yet</div>
                      <div className="aff-empty-sub">
                        Switch to the &ldquo;Generate Product Links&rdquo; tab to choose any product and create your first trackable link!
                      </div>
                      <button
                        className="aff-btn aff-btn-primary"
                        style={{ marginTop: 14 }}
                        onClick={() => setActiveTab('products')}
                      >
                        Browse Products
                      </button>
                    </div>
                  ) : (
                    <div className="aff-table-scroll">
                      <table className="aff-data-table">
                        <thead>
                          <tr>
                            <th>Product</th>
                            <th>Link</th>
                            <th style={{ textAlign: 'center' }}>Clicks Tracked</th>
                            <th style={{ textAlign: 'center' }}>Orders</th>
                            <th style={{ textAlign: 'right' }}>Total Earned</th>
                            <th style={{ textAlign: 'center' }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {affiliateLinks.map((l, idx) => {
                            const linkKey = l.id || (l as any)._id || l.linkCode || `link_${idx}`;
                            const isCopied = copiedKey === (l.id || l.linkCode);
                            return (
                              <tr key={linkKey}>
                                <td>
                                  <div className="td-prod-cell">
                                    {l.product?.mainImage && (
                                      <Image
                                        src={l.product.mainImage}
                                        alt={l.product.title || 'Product'}
                                        width={44}
                                        height={44}
                                        className="td-prod-thumb"
                                      />
                                    )}
                                    <div>
                                      <div className="td-prod-title">{l.product?.title || 'Product'}</div>
                                      <div style={{ fontSize: 11, color: 'var(--gold)', fontWeight: 600 }}>
                                        {l.product?.price ? formatINR(l.product.price) : ''}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  <input
                                    className="aff-input"
                                    style={{ width: 220, fontSize: 11, padding: '6px 8px' }}
                                    readOnly
                                    value={l.url}
                                  />
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                  <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--olive)' }}>
                                    {l.clicks || 0}
                                  </span>
                                </td>
                                <td style={{ textAlign: 'center', fontWeight: 600 }}>
                                  {l.ordersCount || 0}
                                </td>
                                <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--olive)' }}>
                                  {formatINR(l.totalEarned || 0)}
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                  <button
                                    className={`aff-btn ${isCopied ? 'aff-btn-success' : 'aff-btn-outline'}`}
                                    style={{ fontSize: 10, padding: '6px 12px' }}
                                    onClick={() => handleCopy(l.url, l.id)}
                                  >
                                    {isCopied ? '✓ Copied' : 'Copy'}
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* ── TAB 3: CUSTOM COUPONS ── */}
              {activeTab === 'coupons' && (
                <div className="aff-coupon-panel">
                  {/* Coupon Generator Card */}
                  <div className="aff-coupon-creator-card">
                    <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, color: 'var(--olive-dark)', marginBottom: 6 }}>
                      Create Your Custom Coupon Code
                    </h3>
                    <p style={{ fontSize: 12.5, color: 'var(--ink-muted)', marginBottom: 18, lineHeight: 1.6 }}>
                      Create a personalized coupon (e.g. <strong>{affiliateCode}10</strong> or your name). Customers get <strong>10% off</strong> at checkout, and you earn <strong>10% commission</strong> when the order is delivered!
                    </p>

                    <form onSubmit={handleCreateCoupon}>
                      <label className="aff-form-label">Coupon Code</label>
                      <input
                        className="aff-coupon-input"
                        type="text"
                        placeholder={`${affiliateCode}10`}
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        maxLength={20}
                      />

                      <div className="aff-coupon-preview">
                        <div>
                          <div className="aff-coupon-preview-code">
                            {couponInput.trim() || `${affiliateCode}10`}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--ink-faint)', marginTop: 2 }}>
                            Applies 10% discount on entire cart
                          </div>
                        </div>
                        <span className="aff-coupon-preview-disc">10% OFF</span>
                      </div>

                      {couponMsg && (
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: couponMsg.error ? 'var(--red)' : 'var(--green)',
                            marginBottom: 12,
                          }}
                        >
                          {couponMsg.text}
                        </div>
                      )}

                      <button
                        type="submit"
                        className="aff-btn aff-btn-primary"
                        style={{ width: '100%', justifyContent: 'center' }}
                        disabled={creatingCoupon}
                      >
                        {creatingCoupon ? 'Creating Coupon...' : '+ Create My Coupon Code'}
                      </button>
                    </form>
                  </div>

                  {/* Existing Coupons List */}
                  <div className="aff-table-wrapper" style={{ height: 'fit-content' }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--bdr)', background: 'var(--surf-subtle)' }}>
                      <h4 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 18, color: 'var(--olive-dark)', margin: 0 }}>
                        Your Active Affiliate Coupons
                      </h4>
                    </div>

                    {coupons.length === 0 ? (
                      <div className="aff-empty-state" style={{ padding: '30px 16px' }}>
                        <div className="aff-empty-icon">🎟️</div>
                        <div className="aff-empty-title">No coupons created yet</div>
                        <div className="aff-empty-sub">Use the form on the left to create your first branded affiliate coupon.</div>
                      </div>
                    ) : (
                      <table className="aff-data-table" style={{ minWidth: 0 }}>
                        <thead>
                          <tr>
                            <th>Coupon</th>
                            <th>Discount</th>
                            <th style={{ textAlign: 'center' }}>Times Used</th>
                            <th style={{ textAlign: 'right' }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {coupons.map((c, idx) => {
                            const cpnKey = c.id || (c as any)._id || c.code || `cpn_${idx}`;
                            const isCopied = copiedKey === c.code;
                            return (
                              <tr key={cpnKey}>
                                <td>
                                  <span style={{ fontFamily: 'Courier New, monospace', fontWeight: 700, fontSize: 13, color: 'var(--olive)' }}>
                                    {c.code}
                                  </span>
                                </td>
                                <td>
                                  <span style={{ fontWeight: 600 }}>{c.discountValue}% OFF</span>
                                </td>
                                <td style={{ textAlign: 'center', fontWeight: 700 }}>
                                  {c.usedCount || 0}
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                  <button
                                    className={`aff-btn ${isCopied ? 'aff-btn-success' : 'aff-btn-outline'}`}
                                    style={{ fontSize: 10, padding: '5px 10px' }}
                                    onClick={() => handleCopy(c.code, c.code)}
                                  >
                                    {isCopied ? '✓ Copied' : 'Copy Code'}
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}

              {/* ── TAB 4: ORDERS & COMMISSIONS ── */}
              {activeTab === 'orders' && (
                <div className="aff-table-wrapper">
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--bdr)', background: 'var(--surf-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, color: 'var(--olive-dark)', margin: 0 }}>
                        Affiliate Orders &amp; Earnings Log
                      </h3>
                      <p style={{ fontSize: 12, color: 'var(--ink-muted)', margin: 0 }}>
                        Track every order placed via your links or coupons. Earnings reflect once marked Delivered by admin.
                      </p>
                    </div>
                    <span className="aff-pill pill-olive">{commissions.length} Total Record{commissions.length !== 1 ? 's' : ''}</span>
                  </div>

                  {commissions.length === 0 ? (
                    <div className="aff-empty-state">
                      <div className="aff-empty-icon">🛍️</div>
                      <div className="aff-empty-title">No orders recorded yet</div>
                      <div className="aff-empty-sub">
                        Share your product links or custom coupons. When shoppers complete a purchase, it will appear here immediately!
                      </div>
                    </div>
                  ) : (
                    <div className="aff-table-scroll">
                      <table className="aff-data-table">
                        <thead>
                          <tr>
                            <th>Order Details</th>
                            <th>Customer</th>
                            <th>Date</th>
                            <th style={{ textAlign: 'right' }}>Order Amount</th>
                            <th style={{ textAlign: 'right' }}>Your 10% Commission</th>
                            <th style={{ textAlign: 'center' }}>Delivery &amp; Commission Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {commissions.map((row, idx) => {
                            const rowKey = row.id || (row as any)._id || `comm_${row.orderId || idx}_${idx}`;
                            return (
                              <tr key={rowKey}>
                              <td>
                                <div style={{ fontWeight: 600, color: 'var(--ink)' }}>
                                  {row.productTitle || (row.couponCode ? `Coupon: ${row.couponCode}` : 'Store Order')}
                                </div>
                                <div style={{ fontSize: 11, color: 'var(--ink-faint)', fontFamily: 'Courier New, monospace' }}>
                                  ID: #{row.orderId.slice(-6).toUpperCase()}
                                </div>
                              </td>
                              <td style={{ color: 'var(--ink-muted)', fontWeight: 500 }}>{row.referredName}</td>
                              <td style={{ fontSize: 11.5, color: 'var(--ink-faint)' }}>{formatDate(row.date)}</td>
                              <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatINR(row.orderAmount)}</td>
                              <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--olive)', fontSize: 14 }}>
                                {formatINR(row.earning)}
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                {row.isDelivered ? (
                                  <span className="aff-pill pill-green" title="Delivered & Commission Credited">
                                    ✓ Delivered (Earned)
                                  </span>
                                ) : row.isCancelled ? (
                                  <span className="aff-pill" style={{ background: 'var(--red-bg)', color: 'var(--red)' }}>
                                    ✕ Cancelled
                                  </span>
                                ) : (
                                  <span className="aff-pill pill-amber" title="Order placed / in transit. Commission will reflect upon delivery.">
                                    ⏳ Pending Delivery
                                  </span>
                                )}
                              </td>
                            </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* NOTICE BANNER */}
              <div className="aff-notice-banner">
                <span style={{ fontSize: 18 }}>💡</span>
                <div>
                  <strong>How Payouts &amp; Earnings Work:</strong>
                  <br />
                  Commissions are calculated as a flat <strong>10% of the total order value</strong>. An order must be marked as <strong>Delivered</strong> from the admin dashboard before its commission reflects in your active delivered earnings. For payout settlements or questions, write to us at <a href="mailto:makeyousparkle5@gmail.com" style={{ color: 'var(--olive)', fontWeight: 600 }}>makeyousparkle5@gmail.com</a>.
                </div>
              </div>
            </>
          )}

        </main>
      </div>
    </>
  );
}
