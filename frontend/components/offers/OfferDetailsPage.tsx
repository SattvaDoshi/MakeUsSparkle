'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  fetchOfferById,
  fetchProductsByIds,
  fetchProductsByCategoryId,
  type CatalogProduct,
} from '@/lib/catalogApi';
import type { OfferDetail } from '@/lib/offerTypes';
import OfferHeader, { OfferHeaderSkeleton } from '@/components/offers/OfferHeader';
import OfferProductsGrid from '@/components/offers/OfferProductsGrid';

interface OfferDetailsPageProps {
  offerId: string;
}

type PageState = 'loading' | 'not-found' | 'error' | 'ready';

export default function OfferDetailsPage({ offerId }: OfferDetailsPageProps) {
  const [pageState, setPageState] = useState<PageState>('loading');
  const [offer, setOffer] = useState<OfferDetail | null>(null);
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setPageState('loading');
    setOffer(null);
    setProducts([]);
    setProductsError(null);

    // Step 1: fetch offer details
    let offerData: OfferDetail | null = null;
    try {
      offerData = await fetchOfferById(offerId);
    } catch {
      setPageState('error');
      return;
    }

    if (!offerData) {
      setPageState('not-found');
      return;
    }

    setOffer(offerData);
    setPageState('ready');

    // Step 2: fetch eligible products in parallel
    setProductsLoading(true);
    try {
      const { applicableProducts, applicableCategories } = offerData;

      // Fan-out both fetches in parallel
      const [byId, ...byCategory] = await Promise.all([
        applicableProducts.length > 0
          ? fetchProductsByIds(applicableProducts)
          : Promise.resolve([] as CatalogProduct[]),
        ...applicableCategories.map((catId) =>
          fetchProductsByCategoryId(catId).catch(() => [] as CatalogProduct[])
        ),
      ]);

      // Merge and deduplicate by sourceId
      const seen = new Set<string>();
      const merged: CatalogProduct[] = [];
      for (const p of [...byId, ...byCategory.flat()]) {
        if (!seen.has(p.sourceId)) {
          seen.add(p.sourceId);
          merged.push(p);
        }
      }

      setProducts(merged);
    } catch (err) {
      setProductsError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setProductsLoading(false);
    }
  }, [offerId]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <>
      <style>{CSS}</style>
      <div className="odp-root">

        {/* Back nav */}
        <div className="odp-breadcrumb">
          <Link href="/offers" className="odp-back">
            ← Back to Offers
          </Link>
        </div>

        {/* Offer header */}
        {pageState === 'loading' && <OfferHeaderSkeleton />}

        {pageState === 'not-found' && (
          <div className="odp-state">
            <span className="odp-state-icon">🔍</span>
            <h1 className="odp-state-title">Offer Not Found</h1>
            <p className="odp-state-sub">
              This offer may have expired or doesn't exist.
            </p>
            <Link href="/offers" className="odp-cta">Browse All Offers</Link>
          </div>
        )}

        {pageState === 'error' && (
          <div className="odp-state">
            <span className="odp-state-icon">⚠️</span>
            <h1 className="odp-state-title">Something Went Wrong</h1>
            <p className="odp-state-sub">
              We couldn't load this offer. Please try again.
            </p>
            <button className="odp-cta" onClick={() => void load()}>Retry</button>
          </div>
        )}

        {pageState === 'ready' && offer && (
          <>
            <OfferHeader offer={offer} />
            <OfferProductsGrid
              products={products}
              loading={productsLoading}
              error={productsError}
            />
          </>
        )}
      </div>
    </>
  );
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=Nunito:wght@300;400;500;600;700&display=swap');

.odp-root *, .odp-root *::before, .odp-root *::after { box-sizing: border-box; }

.odp-root {
  font-family: 'Nunito', sans-serif;
  background: #f9f7f2;
  min-height: 100vh;
  padding-bottom: 40px;
}

/* Breadcrumb */
.odp-breadcrumb {
  padding: 16px 16px 0;
}
@media (min-width: 640px)  { .odp-breadcrumb { padding: 20px 24px 0; } }
@media (min-width: 1024px) { .odp-breadcrumb { padding: 24px 40px 0; } }

.odp-back {
  display: inline-flex; align-items: center;
  font-size: 11px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase;
  color: #4a7535; text-decoration: none;
  transition: color .18s;
}
.odp-back:hover { color: #253d18; }

/* Full-page states */
.odp-state {
  display: flex; flex-direction: column; align-items: center;
  gap: 12px; padding: 80px 20px; text-align: center;
}
.odp-state-icon { font-size: 48px; line-height: 1; }
.odp-state-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(1.6rem, 5vw, 2.4rem);
  font-weight: 600; color: #1c1c17; margin: 0;
}
.odp-state-sub {
  font-size: 13px; color: #828278; max-width: 360px; margin: 0; line-height: 1.6;
}
.odp-cta {
  display: inline-block; margin-top: 8px;
  padding: 11px 28px;
  font-family: 'Nunito', sans-serif;
  font-size: 11px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase;
  background: #253d18; color: #fff;
  border: none; border-radius: 6px; cursor: pointer; text-decoration: none;
  transition: background .2s;
}
.odp-cta:hover { background: #365928; }
`;
