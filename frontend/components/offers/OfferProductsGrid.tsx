'use client';

import ProductCard from '@/components/product/ProductCard';
import type { CatalogProduct } from '@/lib/catalogApi';

interface OfferProductsGridProps {
  products: CatalogProduct[];
  loading?: boolean;
  error?: string | null;
}

const SKELETON_COUNT = 4;

export default function OfferProductsGrid({ products, loading, error }: OfferProductsGridProps) {
  return (
    <>
      <style>{CSS}</style>

      <section className="opg-section">
        <div className="opg-section-header">
          <h2 className="opg-section-title">
            <em>Eligible</em> Products
          </h2>
          {!loading && !error && products.length > 0 && (
            <span className="opg-count">{products.length} item{products.length !== 1 ? 's' : ''}</span>
          )}
        </div>

        {/* Loading skeletons */}
        {loading && (
          <div className="opg-grid">
            {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <div key={i} className="opg-skeleton-card">
                <div className="opg-sk opg-sk-img" />
                <div className="opg-sk-body">
                  <div className="opg-sk opg-sk-name" />
                  <div className="opg-sk opg-sk-price" />
                  <div className="opg-sk opg-sk-btn" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="opg-state opg-error">
            <span className="opg-state-icon">⚠️</span>
            <p className="opg-state-title">Could not load products</p>
            <p className="opg-state-sub">{error}</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && products.length === 0 && (
          <div className="opg-state opg-empty">
            <span className="opg-state-icon">🛍️</span>
            <p className="opg-state-title">No eligible products</p>
            <p className="opg-state-sub">
              This offer doesn't have any specific products attached yet.
              Browse our full catalogue to find great deals.
            </p>
          </div>
        )}

        {/* Product grid */}
        {!loading && !error && products.length > 0 && (
          <div className="opg-grid">
            {products.map((product) => (
              <ProductCard key={product.sourceId} product={product} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=Nunito:wght@300;400;500;600;700&display=swap');

.opg-section *, .opg-section *::before, .opg-section *::after { box-sizing: border-box; }

.opg-section {
  font-family: 'Nunito', sans-serif;
  padding: 28px 16px 60px;
}
@media (min-width: 640px)  { .opg-section { padding: 32px 24px 72px; } }
@media (min-width: 1024px) { .opg-section { padding: 36px 40px 80px; } }

/* Section header */
.opg-section-header {
  display: flex; align-items: baseline; gap: 12px;
  margin-bottom: 20px;
}
.opg-section-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(1.4rem, 4vw, 2rem);
  font-weight: 400; color: #1c1c17; margin: 0;
}
.opg-section-title em { font-style: italic; color: #4a7535; }
.opg-count {
  font-size: 11px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase;
  color: #828278; background: #f0ebe0; border: 1px solid #ddd4bb;
  padding: 3px 10px; border-radius: 100px;
}

/* Product grid */
.opg-grid {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(2, 1fr);
  animation: opg-fade 0.3s ease-out;
}
@keyframes opg-fade {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}
@media (min-width: 640px)  { .opg-grid { grid-template-columns: repeat(3, 1fr); gap: 16px; } }
@media (min-width: 1024px) { .opg-grid { grid-template-columns: repeat(4, 1fr); gap: 20px; } }

/* Skeleton card */
.opg-skeleton-card {
  border-radius: 4px;
  overflow: hidden;
  background: #f7f2ea;
  box-shadow: 0 1px 4px rgba(61,74,34,.08);
}
.opg-sk-body { padding: 10px 12px 14px; display: flex; flex-direction: column; gap: 8px; }

@keyframes opg-shimmer {
  from { background-position: -600px 0; }
  to   { background-position:  600px 0; }
}
.opg-sk {
  border-radius: 4px;
  background: linear-gradient(90deg, #ede8dc 25%, #f7f2ea 50%, #ede8dc 75%);
  background-size: 1200px 100%;
  animation: opg-shimmer 1.4s infinite linear;
}
.opg-sk-img   { width: 100%; aspect-ratio: 4 / 5; }
.opg-sk-name  { height: 14px; width: 75%; }
.opg-sk-price { height: 14px; width: 40%; }
.opg-sk-btn   { height: 34px; width: 100%; margin-top: 4px; }

/* Empty / error states */
.opg-state {
  display: flex; flex-direction: column; align-items: center;
  gap: 10px; padding: 60px 20px; text-align: center;
}
.opg-state-icon { font-size: 40px; line-height: 1; }
.opg-state-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.3rem; font-weight: 600; color: #1c1c17; margin: 0;
}
.opg-state-sub {
  font-size: 13px; color: #828278; max-width: 360px; margin: 0; line-height: 1.6;
}
.opg-error .opg-state-icon { font-size: 36px; }
.opg-error .opg-state-title { color: #8a2f2f; }
`;
