"use client";

import { useEffect, useRef, useState } from "react";
import ProductCard from "@/components/product/ProductCard";
import CarouselArrows from "@/components/ui/CarouselArrows";
import { fetchNewArrivalsSection, type CatalogProduct } from "@/lib/catalogApi";
import { useGender } from "@/lib/genderContext";
/* ─────────────────────────────────────────
   New Arrivals Section
───────────────────────────────────────── */
export default function NewArrivals() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { gender } = useGender();
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [eyebrow, setEyebrow] = useState("");
  const [title, setTitle] = useState("New Arrivals");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);

    fetchNewArrivalsSection(gender)
      .then((section) => {
        if (!alive) return;
        setEyebrow(section?.eyebrow || "");
        setTitle(section?.title || "New Arrivals");
        setProducts(section?.products || []);
      })
      .catch(() => {
        if (!alive) return;
        setProducts([]);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [gender]);

  if (!loading && products.length === 0) return null;
 

  return (
    <>
      <style>{`

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* ══════════════════════════════════════
           SECTION SHELL
        ══════════════════════════════════════ */
        .na-section {
          background-color: #ffffff;
          padding: 72px 0 88px;
          font-family: 'Jost', sans-serif;
          overflow: hidden;
        }

        .na-inner {
          max-width: 1360px;
          margin: 0 auto;
          padding: 0 40px;
        }

        .na-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 44px;
          gap: 16px;
          flex-wrap: wrap;
        }

        .na-title-group { display: flex; flex-direction: column; gap: 8px; }

        .na-eyebrow {
          font-size: 11px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #3d6b4f;
          font-weight: 500;
        }

        .na-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(38px, 5vw, 60px);
          font-weight: 600;
          color: #1a1a14;
          line-height: 1;
          letter-spacing: -0.01em;
        }
        .na-title em { font-style: italic; color: #3d6b4f; }

        .na-nav { display: flex; align-items: center; gap: 10px; }

        .na-btn {
          width: 46px; height: 46px;
          border-radius: 50%;
          border: 1.5px solid #3d6b4f;
          background: transparent;
          color: #3d6b4f;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.22s ease;
          font-size: 18px;
        }
        .na-btn:hover { background: #3d6b4f; color: #f5f0e8; }

        .na-view-all {
          font-size: 13px; font-weight: 500;
          color: #3d6b4f;
          text-decoration: none;
          letter-spacing: 0.04em;
          border-bottom: 1px solid #3d6b4f;
          padding-bottom: 2px;
          transition: opacity 0.2s;
        }
        .na-view-all:hover { opacity: 0.6; }

        /* ══════════════════════════════════════
           TRACK
        ══════════════════════════════════════ */
        .na-track-wrapper {
          position: relative;
          margin-left: -40px;
          margin-right: -40px;
        }

        .na-track {
          display: flex;
          gap: 20px;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
          padding-bottom: 8px;
          padding-left: 40px;
          padding-right: 40px;
          scrollbar-width: none;
          align-items: stretch;
        }
        .na-track::-webkit-scrollbar { display: none; }

        .na-track-wrapper::after {
          content: '';
          position: absolute;
          right: 0; top: 0; bottom: 8px;
          width: 100px;
          background: linear-gradient(to left, #ffffff 10%, transparent);
          pointer-events: none;
          z-index: 1;
        }

        /* Carousel slot — sizes the shared <ProductCard/> */
        .na-slot { flex: 0 0 248px; scroll-snap-align: start; display: flex; }
        .na-slot > * { flex: 1; min-width: 0; }

        /* ══════════════════════════════════════
           RESPONSIVE
        ══════════════════════════════════════ */
        @media (min-width: 1280px) {
          .na-slot { flex: 0 0 264px; }
        }

        @media (min-width: 1024px) and (max-width: 1279px) {
          .na-slot { flex: 0 0 248px; }
          .na-inner { padding: 0 32px; }
          .na-track-wrapper { margin-left: -32px; margin-right: -32px; }
          .na-track { padding-left: 32px; padding-right: 32px; }
        }

        @media (min-width: 640px) and (max-width: 1023px) {
          .na-section { padding: 56px 0 72px; }
          .na-inner { padding: 0 28px; }
          .na-header { margin-bottom: 32px; }
          .na-slot { flex: 0 0 224px; }
          .na-view-all { display: none; }
          .na-track-wrapper { margin-left: -28px; margin-right: -28px; }
          .na-track { padding-left: 28px; padding-right: 28px; }
        }

        @media (max-width: 639px) {
          .na-section { padding: 40px 0 56px; }
          .na-inner { padding: 0 18px; }
          .na-header { margin-bottom: 24px; }
          .na-view-all { display: none; }
          .na-track { gap: 14px; }
          .na-track-wrapper { margin-left: -18px; margin-right: -18px; }
          .na-track { padding-left: 18px; padding-right: 18px; }
          .na-slot { flex: 0 0 168px; }
          .na-btn { width: 38px; height: 38px; font-size: 15px; }
        }

        @keyframes naShimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .na-skeleton-card { flex-direction: column; border-radius: 10px; overflow: hidden; background: #fff; }
        .na-skeleton-img {
          width: 100%;
          aspect-ratio: 4 / 5;
          background: linear-gradient(90deg, #eeede8 25%, #f7f6f2 50%, #eeede8 75%);
          background-size: 200% 100%;
          animation: naShimmer 1.5s infinite;
        }
        .na-skeleton-body {
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex: 1;
        }
        .na-skeleton-bar {
          border-radius: 3px;
          background: linear-gradient(90deg, #eeede8 25%, #f7f6f2 50%, #eeede8 75%);
          background-size: 200% 100%;
          animation: naShimmer 1.5s infinite;
        }

        @media (max-width: 374px) {
          .na-slot { flex: 0 0 150px; }
          .na-inner { padding: 0 14px; }
          .na-track-wrapper { margin-left: -14px; margin-right: -14px; }
          .na-track { padding-left: 14px; padding-right: 14px; }
        }
      `}</style>

      <section className="na-section">
        <div className="na-inner">
          {/* Header */}
          <div className="na-header">
            <div className="na-title-group">
              {eyebrow ? <span className="na-eyebrow">{eyebrow}</span> : null}
              <h2 className="na-title">{title}</h2>
            </div>

            <CarouselArrows targetRef={scrollRef} label="new arrivals" />
          </div>

          {/* Scrollable Product Cards */}
          <div className="na-track-wrapper">
            <div className="na-track" ref={scrollRef}>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="na-slot na-skeleton-card">
                    <div className="na-skeleton-img" />
                    <div className="na-skeleton-body">
                      <div className="na-skeleton-bar" style={{ width: '80%', height: 14 }} />
                      <div className="na-skeleton-bar" style={{ width: '45%', height: 12 }} />
                      <div className="na-skeleton-bar" style={{ width: '100%', height: 32, marginTop: 'auto' }} />
                    </div>
                  </div>
                ))
              ) : (
                products.map((p) => (
                  <div key={p.id} className="na-slot"><ProductCard product={p} /></div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
