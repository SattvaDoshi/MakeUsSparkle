'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cartContext';
import {
  fetchOfferById,
  fetchProductsByIds,
  fetchProductsByCategoryId,
  type CatalogProduct,
} from '@/lib/catalogApi';
import type { OfferDetail } from '@/lib/offerTypes';

interface OfferDetailsPageProps {
  offerId: string;
}

type PageState = 'loading' | 'not-found' | 'error' | 'ready';

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────
function getOfferBadge(offer: OfferDetail): { label: string; sub: string } {
  switch (offer.offerType) {
    case 'bogo':
      return { label: `Buy ${offer.buyQuantity ?? 1} Get ${offer.getQuantity ?? 1} Free`, sub: 'Automatically applied at checkout' };
    case 'buy_x_for_y':
      return { label: `Buy ${offer.buyQuantity ?? 'X'} for ₹${offer.discountValue}`, sub: 'Special bundle price' };
    case 'percentage':
      return { label: `${offer.discountValue}% Off`, sub: 'Discount applied at checkout' };
    case 'fixed':
      return { label: `Flat ₹${offer.discountValue} Off`, sub: 'Discount applied at checkout' };
    case 'free_shipping':
      return { label: 'Free Shipping', sub: 'On all eligible products' };
    default:
      return { label: 'Special Offer', sub: '' };
  }
}

function getDiscountedPrice(product: CatalogProduct, offer: OfferDetail): number | null {
  const base = product.discountedPrice ?? product.price;
  if (offer.offerType === 'percentage') return Math.round(base * (1 - offer.discountValue / 100));
  if (offer.offerType === 'fixed') return Math.max(0, base - offer.discountValue);
  return null;
}

function getProductBadge(offer: OfferDetail): string {
  switch (offer.offerType) {
    case 'bogo': return `B${offer.buyQuantity}G${offer.getQuantity}`;
    case 'buy_x_for_y': return `₹${offer.discountValue} Deal`;
    case 'percentage': return `${offer.discountValue}% OFF`;
    case 'fixed': return `₹${offer.discountValue} OFF`;
    case 'free_shipping': return 'FREE SHIP';
    default: return 'OFFER';
  }
}

// ──────────────────────────────────────────────
// Mini product card with offer context
// ──────────────────────────────────────────────
function OfferProductCard({ product, offer }: { product: CatalogProduct; offer: OfferDetail }) {
  const router = useRouter();
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const img = product.mainImage || product.images?.[0] || '/images/hero.png';
  const base = product.discountedPrice ?? product.price;
  const afterOfferPrice = getDiscountedPrice(product, offer);
  const badgeLabel = getProductBadge(offer);
  const isOutOfStock = (product.stock ?? Infinity) <= 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    addItem({
      id: product.sourceId,
      name: product.name,
      price: afterOfferPrice ?? base,
      originalPrice: product.originalPrice ?? product.price,
      image: img,
      color: '',
      colorHex: '',
      href: product.href,
      sku: product.sku,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="odpc-card" onClick={() => router.push(product.href)} style={{ cursor: 'pointer' }}>
      <div className="odpc-img-wrap">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="odpc-img" src={img} alt={product.name} />
        <span className="odpc-badge">{badgeLabel}</span>
        {isOutOfStock && <span className="odpc-oos">Out of Stock</span>}
      </div>
      <div className="odpc-body">
        <p className="odpc-category">{product.subCategory || product.category}</p>
        <p className="odpc-name">{product.name}</p>
        <div className="odpc-price-row">
          {afterOfferPrice !== null ? (
            <>
              <span className="odpc-price-now">₹{afterOfferPrice.toLocaleString('en-IN')}</span>
              <span className="odpc-price-was">₹{base.toLocaleString('en-IN')}</span>
              <span className="odpc-saved">Save ₹{(base - afterOfferPrice).toLocaleString('en-IN')}</span>
            </>
          ) : (offer.offerType === 'bogo' || offer.offerType === 'buy_x_for_y') ? (
            <>
              <span className="odpc-price-now">₹{base.toLocaleString('en-IN')}</span>
              <span className="odpc-deal-badge">{offer.badgeLabel}</span>
            </>
          ) : (
            <span className="odpc-price-now">₹{base.toLocaleString('en-IN')}</span>
          )}
        </div>
        <button
          className={`odpc-btn${added ? ' added' : ''}${isOutOfStock ? ' oos' : ''}`}
          onClick={handleAdd}
          disabled={isOutOfStock}
        >
          {isOutOfStock ? 'Out of Stock' : added ? '✓ Added!' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="odpc-card odpc-skel">
      <div className="odpc-img-wrap odpc-skel-img" />
      <div className="odpc-body">
        <div className="odp-sk odp-sk-pill" />
        <div className="odp-sk odp-sk-name" />
        <div className="odp-sk odp-sk-price" />
        <div className="odp-sk odp-sk-btn" />
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Main page
// ──────────────────────────────────────────────
export default function OfferDetailsPage({ offerId }: OfferDetailsPageProps) {
  const [pageState, setPageState] = useState<PageState>('loading');
  const [offer, setOffer] = useState<OfferDetail | null>(null);
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);

  const load = useCallback(async () => {
    setPageState('loading');
    setOffer(null);
    setProducts([]);

    let offerData: OfferDetail | null = null;
    try {
      offerData = await fetchOfferById(offerId);
    } catch {
      setPageState('error');
      return;
    }

    if (!offerData) { setPageState('not-found'); return; }

    setOffer(offerData);
    setPageState('ready');

    setProductsLoading(true);
    try {
      const { applicableProducts, applicableCategories } = offerData;
      const [byId, ...byCategory] = await Promise.all([
        applicableProducts.length > 0
          ? fetchProductsByIds(applicableProducts)
          : Promise.resolve([] as CatalogProduct[]),
        ...applicableCategories.map((catId) =>
          fetchProductsByCategoryId(catId).catch(() => [] as CatalogProduct[])
        ),
      ]);
      const seen = new Set<string>();
      const merged: CatalogProduct[] = [];
      for (const p of [...byId, ...byCategory.flat()]) {
        if (!seen.has(p.sourceId)) { seen.add(p.sourceId); merged.push(p); }
      }
      setProducts(merged);
    } catch { /* silently fail */ }
    finally { setProductsLoading(false); }
  }, [offerId]);

  useEffect(() => { void load(); }, [load]);

  const badge = offer ? getOfferBadge(offer) : null;

  return (
    <>
      <style>{CSS}</style>
      <div className="odp-root">

        {/* Breadcrumb */}
        <div className="odp-breadcrumb">
          <Link href="/offers" className="odp-back">← All Offers</Link>
        </div>

        {/* Loading skeleton */}
        {pageState === 'loading' && (
          <div className="odp-hero odp-hero-skel">
            <div className="odp-skel-hero-img" />
            <div className="odp-hero-body" style={{ padding: '28px 24px', gap: 10 }}>
              <div className="odp-sk odp-sk-w40 odp-sk-h16" />
              <div className="odp-sk odp-sk-w80 odp-sk-h36" style={{ marginTop: 10 }} />
              <div className="odp-sk odp-sk-w60 odp-sk-h14" style={{ marginTop: 8 }} />
              <div className="odp-sk odp-sk-w100 odp-sk-h44" style={{ marginTop: 14 }} />
            </div>
          </div>
        )}

        {/* Not found */}
        {pageState === 'not-found' && (
          <div className="odp-state">
            <span className="odp-state-icon">🔍</span>
            <h1 className="odp-state-title">Offer Not Found</h1>
            <p className="odp-state-sub">This offer may have expired or no longer exists.</p>
            <Link href="/offers" className="odp-cta">Browse All Offers</Link>
          </div>
        )}

        {/* Error */}
        {pageState === 'error' && (
          <div className="odp-state">
            <span className="odp-state-icon">⚠️</span>
            <h1 className="odp-state-title">Something Went Wrong</h1>
            <p className="odp-state-sub">We couldn't load this offer. Please try again.</p>
            <button className="odp-cta" onClick={() => void load()}>Retry</button>
          </div>
        )}

        {/* Ready */}
        {pageState === 'ready' && offer && badge && (
          <>
            {/* Hero */}
            <div className="odp-hero">
              <div className="odp-hero-img-wrap">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="odp-hero-img" src={offer.image} alt={offer.title} />
                <div className="odp-hero-overlay" />
                {offer.isFeatured && (
                  <span className="odp-featured-ribbon">⭐ Featured</span>
                )}
              </div>
              <div className="odp-hero-body">
                <div className="odp-hero-tag-row">
                  <span className="odp-type-tag">{offer.offerType.replace(/_/g, ' ').toUpperCase()}</span>
                </div>
                <h1 className="odp-hero-title">{offer.title}</h1>
                {offer.description && <p className="odp-hero-desc">{offer.description}</p>}
                <div className="odp-deal-block">
                  <div className="odp-deal-label">{badge.label}</div>
                  {badge.sub && <div className="odp-deal-sub">{badge.sub}</div>}
                </div>
                <div className="odp-terms-row">
                  {(offer.startsAtFormatted || offer.expiryFormatted !== 'No expiry') && (
                    <div className="odp-term-chip">
                      <span className="odp-term-icon">🗓️</span>
                      <span className="odp-term-text">
                        {offer.startsAtFormatted
                          ? `${offer.startsAtFormatted} → ${offer.expiryFormatted}`
                          : `Expires ${offer.expiryFormatted}`}
                      </span>
                    </div>
                  )}
                  {offer.minOrderValue > 0 && (
                    <div className="odp-term-chip">
                      <span className="odp-term-icon">🛒</span>
                      <span className="odp-term-text">Min. ₹{offer.minOrderValue.toLocaleString('en-IN')} order</span>
                    </div>
                  )}
                  <div className="odp-term-chip odp-auto-chip">
                    <span className="odp-auto-dot" />
                    <span className="odp-term-text">Auto-applied at checkout</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Products */}
            <section className="odp-products">
              <div className="odp-products-header">
                <h2 className="odp-products-title"><em>Eligible</em> Products</h2>
                {!productsLoading && products.length > 0 && (
                  <span className="odp-products-count">{products.length} item{products.length !== 1 ? 's' : ''}</span>
                )}
              </div>
              {productsLoading && (
                <div className="odp-grid">
                  {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
              )}
              {!productsLoading && products.length === 0 && (
                <div className="odp-state odp-products-empty">
                  <span className="odp-state-icon">🛍️</span>
                  <p className="odp-state-title">No specific products attached</p>
                  <p className="odp-state-sub">This offer applies sitewide. Browse our catalogue to shop eligible items.</p>
                  <Link href="/categories" className="odp-cta">Shop Now</Link>
                </div>
              )}
              {!productsLoading && products.length > 0 && (
                <div className="odp-grid">
                  {products.map((p) => (
                    <OfferProductCard key={p.sourceId} product={p} offer={offer} />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </>
  );
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=DM+Sans:wght@300;400;500;600;700;800&display=swap');

.odp-root *, .odp-root *::before, .odp-root *::after { box-sizing: border-box; }

.odp-root {
  font-family: 'DM Sans', sans-serif;
  background: #f5f1ea;
  min-height: 100vh;
  padding-bottom: 60px;
}

.odp-breadcrumb { padding: 18px 16px 0; }
@media (min-width: 640px) { .odp-breadcrumb { padding: 20px 24px 0; } }
@media (min-width: 1024px) { .odp-breadcrumb { padding: 24px 48px 0; } }
.odp-back {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 11px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase;
  color: #4a7535; text-decoration: none; transition: color .18s;
}
.odp-back:hover { color: #253d18; }

/* Hero */
.odp-hero, .odp-hero-skel {
  margin: 20px 16px 0;
  border-radius: 16px; overflow: hidden;
  background: #fff;
  box-shadow: 0 6px 32px rgba(35,60,18,.1);
}
@media (min-width: 640px) { .odp-hero, .odp-hero-skel { margin: 24px 24px 0; } }
@media (min-width: 1024px) {
  .odp-hero, .odp-hero-skel { margin: 28px 48px 0; }
  .odp-hero { display: grid; grid-template-columns: 1.15fr 1fr; }
}

.odp-hero-img-wrap {
  position: relative; width: 100%; aspect-ratio: 16 / 8;
  overflow: hidden; background: #e8e2d4;
}
@media (min-width: 1024px) { .odp-hero-img-wrap { aspect-ratio: auto; min-height: 340px; } }
.odp-hero-img { width: 100%; height: 100%; object-fit: cover; display: block; }
.odp-hero-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(8,18,4,.28) 0%, transparent 60%);
  pointer-events: none;
}
.odp-featured-ribbon {
  position: absolute; top: 14px; left: 14px;
  font-size: 10px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase;
  color: #a07820; background: #fdf8ee; border: 1px solid #e8c96a;
  padding: 4px 12px; border-radius: 100px;
}

.odp-hero-body {
  padding: 24px 20px 28px;
  display: flex; flex-direction: column; gap: 12px;
  background: #fff;
}
@media (min-width: 1024px) { .odp-hero-body { padding: 36px 40px; justify-content: center; } }

.odp-hero-tag-row { display: flex; gap: 8px; flex-wrap: wrap; }
.odp-type-tag {
  font-size: 9px; font-weight: 800; letter-spacing: .2em;
  color: #4a7535; background: #eef7e8; border: 1px solid #c8e2b5;
  padding: 3px 11px; border-radius: 100px;
}

.odp-hero-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(1.6rem, 5vw, 2.5rem);
  font-weight: 600; color: #1c1c17; line-height: 1.12; margin: 0;
}
.odp-hero-desc { font-size: 13px; color: #636358; line-height: 1.65; margin: 0; }

.odp-deal-block {
  background: linear-gradient(135deg, #253d18 0%, #4a7535 100%);
  border-radius: 12px; padding: 16px 20px;
}
.odp-deal-label {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(1.4rem, 4.5vw, 2rem);
  font-weight: 600; color: #fff; line-height: 1.1;
}
.odp-deal-sub {
  font-size: 11px; font-weight: 600; letter-spacing: .08em;
  color: rgba(255,255,255,.7); margin-top: 4px; text-transform: uppercase;
}

.odp-terms-row { display: flex; flex-wrap: wrap; gap: 8px; }
.odp-term-chip {
  display: inline-flex; align-items: center; gap: 6px;
  background: #f5f1ea; border: 1px solid #ddd4bb;
  border-radius: 8px; padding: 7px 12px;
}
.odp-term-icon { font-size: 14px; flex-shrink: 0; }
.odp-term-text { font-size: 11px; font-weight: 600; color: #52524a; }
.odp-auto-chip { border-color: #c8e2b5; background: #eef7e8; }
.odp-auto-dot {
  width: 8px; height: 8px; border-radius: 50%; background: #4a7535; flex-shrink: 0;
  animation: odp-pulse 1.8s infinite;
}
@keyframes odp-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: .6; transform: scale(.85); }
}

/* Products */
.odp-products { padding: 28px 16px 0; }
@media (min-width: 640px)  { .odp-products { padding: 32px 24px 0; } }
@media (min-width: 1024px) { .odp-products { padding: 36px 48px 0; } }

.odp-products-header { display: flex; align-items: baseline; gap: 12px; margin-bottom: 20px; }
.odp-products-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(1.4rem, 4vw, 2.1rem);
  font-weight: 400; color: #1c1c17; margin: 0;
}
.odp-products-title em { font-style: italic; color: #4a7535; }
.odp-products-count {
  font-size: 11px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase;
  color: #828278; background: #f0ebe0; border: 1px solid #ddd4bb;
  padding: 3px 10px; border-radius: 100px;
}

.odp-grid {
  display: grid; gap: 14px; grid-template-columns: repeat(2, 1fr);
  animation: odp-fade .3s ease-out;
}
@keyframes odp-fade {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
@media (min-width: 640px)  { .odp-grid { grid-template-columns: repeat(3, 1fr); gap: 16px; } }
@media (min-width: 1024px) { .odp-grid { grid-template-columns: repeat(4, 1fr); gap: 20px; } }

/* Product card */
.odpc-card {
  background: #fff; border-radius: 10px; overflow: hidden;
  box-shadow: 0 2px 10px rgba(35,60,18,.07);
  transition: box-shadow .22s, transform .22s;
  display: flex; flex-direction: column;
}
.odpc-card:hover { box-shadow: 0 8px 28px rgba(35,60,18,.13); transform: translateY(-3px); }
.odpc-img-wrap { position: relative; width: 100%; aspect-ratio: 3/4; overflow: hidden; background: #ede8dc; }
.odpc-img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform .36s ease; }
.odpc-card:hover .odpc-img { transform: scale(1.04); }
.odpc-badge {
  position: absolute; top: 8px; left: 8px;
  font-size: 9px; font-weight: 800; letter-spacing: .14em;
  color: #fff; background: #253d18;
  padding: 4px 9px; border-radius: 100px;
  box-shadow: 0 2px 8px rgba(0,0,0,.18);
}
.odpc-oos {
  position: absolute; inset: 0;
  background: rgba(0,0,0,.42);
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase;
  color: #fff;
}
.odpc-body { padding: 10px 12px 14px; display: flex; flex-direction: column; gap: 5px; flex: 1; }
.odpc-category {
  font-size: 9px; font-weight: 700; letter-spacing: .15em; text-transform: uppercase;
  color: #4a7535; margin: 0;
}
.odpc-name {
  font-size: 12.5px; font-weight: 600; color: #1c1c17; margin: 0; line-height: 1.35;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.odpc-price-row { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-top: 2px; }
.odpc-price-now { font-size: 13.5px; font-weight: 800; color: #1c1c17; }
.odpc-price-was { font-size: 11px; color: #aaa8a0; text-decoration: line-through; }
.odpc-saved {
  font-size: 9px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase;
  color: #4a7535; background: #eef7e8; border: 1px solid #c8e2b5;
  padding: 2px 7px; border-radius: 100px;
}
.odpc-deal-badge {
  font-size: 9px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase;
  color: #fff; background: #253d18; padding: 2px 8px; border-radius: 100px;
}
.odpc-btn {
  margin-top: auto; padding: 9px 8px; border-radius: 7px; border: none;
  background: #253d18; color: #fff;
  font-family: 'DM Sans', sans-serif;
  font-size: 11px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase;
  cursor: pointer; transition: background .2s, transform .1s;
}
.odpc-btn:hover:not(:disabled) { background: #365928; transform: scale(1.02); }
.odpc-btn.added { background: #4a7535; }
.odpc-btn.oos { background: #c0b9ad; cursor: not-allowed; }

/* Skeleton */
.odpc-skel { pointer-events: none; }
.odpc-skel-img { width: 100%; aspect-ratio: 3/4; }
@keyframes odp-shimmer {
  from { background-position: -600px 0; }
  to   { background-position:  600px 0; }
}
.odpc-skel-img, .odp-sk {
  background: linear-gradient(90deg, #e8e2d4 25%, #f5f0e8 50%, #e8e2d4 75%);
  background-size: 1200px 100%; animation: odp-shimmer 1.4s infinite linear; border-radius: 6px;
}
.odp-skel-hero-img {
  width: 100%; aspect-ratio: 16/8;
  background: linear-gradient(90deg, #e8e2d4 25%, #f5f0e8 50%, #e8e2d4 75%);
  background-size: 1200px 100%; animation: odp-shimmer 1.4s infinite linear;
}
@media (min-width: 1024px) { .odp-skel-hero-img { aspect-ratio: auto; min-height: 340px; } }
.odp-sk-w40  { width: 40%; } .odp-sk-w60  { width: 60%; }
.odp-sk-w80  { width: 80%; } .odp-sk-w100 { width: 100%; }
.odp-sk-h14  { height: 14px; } .odp-sk-h16 { height: 16px; }
.odp-sk-h36  { height: 36px; } .odp-sk-h44 { height: 44px; }
.odp-sk-pill  { height: 18px; width: 80px; }
.odp-sk-name  { height: 13px; width: 75%; margin: 4px 0 0; }
.odp-sk-price { height: 13px; width: 40%; }
.odp-sk-btn   { height: 34px; width: 100%; margin-top: 6px; }

/* States */
.odp-state {
  display: flex; flex-direction: column; align-items: center;
  gap: 12px; padding: 80px 20px; text-align: center;
}
.odp-products-empty { padding: 48px 20px; }
.odp-state-icon { font-size: 44px; line-height: 1; }
.odp-state-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(1.5rem, 5vw, 2.2rem);
  font-weight: 600; color: #1c1c17; margin: 0;
}
.odp-state-sub { font-size: 13px; color: #828278; max-width: 360px; margin: 0; line-height: 1.6; }
.odp-cta {
  display: inline-block; margin-top: 6px; padding: 11px 28px;
  font-family: 'DM Sans', sans-serif;
  font-size: 11px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase;
  background: #253d18; color: #fff;
  border: none; border-radius: 8px; cursor: pointer; text-decoration: none;
  transition: background .2s;
}
.odp-cta:hover { background: #365928; }
`;
