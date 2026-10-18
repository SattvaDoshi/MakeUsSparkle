"use client";

import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/lib/cartContext";
import { useWishlist } from "@/lib/wishlistContext";
import { fetchOpenSection, type CatalogOpenSection, type CatalogOpenSectionItem, type CatalogProduct } from "@/lib/catalogApi";

/* ─────────────────────────────────────────
   Product Card
───────────────────────────────────────── */
function ProductCard({
  product,
  style,
}: {
  product: CatalogProduct;
  style?: CSSProperties;
}) {
  const router = useRouter();
  const { addItem } = useCart();
  const { toggleItem, isWished } = useWishlist();

  const { name, price, originalPrice, badge, images, colors, href } = product;
  const [activeImage, setActiveImage] = useState(0);
  const [cartAnim, setCartAnim] = useState(false);
  const [wishAnim, setWishAnim] = useState(false);

  const displayImage = images[activeImage] ?? images[0];
  const discount = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : null;

  const wishlistItem = {
    id: product.id,
    name: product.name,
    price: product.price,
    originalPrice: product.originalPrice ?? undefined,
    image: images[0],
    category: product.category,
    href: product.href,
    colors: product.colors,
    badge: product.badge ?? null,
    rating: product.rating ?? 0,
    reviewCount: product.reviewCount ?? 0,
  };

  const wished = isWished(product.id);

  const handleWish = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setWishAnim(true);
    setTimeout(() => setWishAnim(false), 400);
    toggleItem(wishlistItem);
  };

  const handleAddToCart = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(
      {
        id: String(product.id),
        sourceId: product.sourceId ?? String(product.id),
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice ?? undefined,
        image: images[0],
        color: colors[0]?.label ?? "",
        colorHex: colors[0]?.hex ?? "#c9a84c",
        href: product.href,
        category: product.category,
        categoryId: product.categoryId,
        subCategoryId: product.subCategoryId,
        styleId: product.styleId,
        sku: `OS-${product.id}`,
      },
      true,
    );
    setCartAnim(true);
    setTimeout(() => setCartAnim(false), 700);
  };

  return (
    <div
      className="pc"
      style={style}
      onClick={() => router.push(href)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") router.push(href);
      }}
      aria-label={`View ${name}`}
    >
      <div className="pc-img-zone">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="pc-img" src={displayImage} alt={name} loading="lazy" width={400} height={500} />
        <div className="pc-overlay" />
        {badge && !discount && (
          <span className={`pc-badge${badge === "Sale" ? " pc-badge--sale" : ""}`}>{badge}</span>
        )}
        {discount && <span className="pc-discount">−{discount}%</span>}
        <button
          className={`pc-wish${wished ? " active" : ""}${wishAnim ? " pc-wish--pop" : ""}`}
          onClick={handleWish}
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={wished}
        >
          <svg viewBox="0 0 24 24" fill={wished ? "#f7f2ea" : "none"} stroke={wished ? "none" : "var(--olive)"} strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
        {images.length > 1 && (
          <div className="pc-dots">
            {images.map((_, i) => (
              <button
                key={i}
                className={`pc-dot${activeImage === i ? " active" : ""}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setActiveImage(i);
                }}
                aria-label={`Image ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
      <div className="pc-info">
        <p className="pc-name">{name}</p>
        {/* {colors.length > 1 && (
          <div className="pc-colors">
            {colors.map((c) => (
              <span key={c.label} className="pc-swatch" style={{ background: c.hex }} title={c.label} />
            ))}
          </div>
        )} */}
        <div className="pc-price-row">
          <span className="pc-price">₹{price.toLocaleString("en-IN")}</span>
          {originalPrice && <span className="pc-original">₹{originalPrice.toLocaleString("en-IN")}</span>}
          {discount && <span className="pc-saving">{discount}% off</span>}
        </div>
        <button
          className={`pc-cart-btn${cartAnim ? " pc-cart-btn--added" : ""}`}
          onClick={handleAddToCart}
          aria-label={`Add ${name} to cart`}
        >
          {cartAnim ? "Added ✓" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Category Banner Card
───────────────────────────────────────── */
function CategoryBannerCard({ item }: { item: CatalogOpenSectionItem }) {
  return (
    <Link
      href={item.link || "#"}
      className="os-cat-card"
      aria-label={item.label || "Shop category"}
      style={!item.image ? { background: "linear-gradient(135deg, #3d6b4f 0%, #1a1a14 100%)" } : undefined}
    >
      {item.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="os-cat-img" src={item.image} alt={item.label || "Category"} loading="lazy" />
      )}
      <div className="os-cat-scrim" />
      {item.label && (
        <div className="os-cat-label">
          <span>{item.label}</span>
        </div>
      )}
    </Link>
  );
}


/* ─────────────────────────────────────────
   Open Section
───────────────────────────────────────── */
export default function OpenSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [section, setSection] = useState<CatalogOpenSection | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    console.log("[OpenSection] Fetching data...");
    fetchOpenSection()
      .then((data) => {
        console.log("[OpenSection] Data received:", data);
        if (!alive) return;
        setSection(data);
      })
      .catch((err) => {
        console.error("[OpenSection] Error fetching:", err);
        if (alive) setSection(null);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => { alive = false; };
  }, []);

  // console.log("[OpenSection] Render state:", { loading, section });

  if (loading) return null;
  if (!section || section.items.length === 0) return null;

  const allCategories = section.items.every((i) => i.type === "category");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Jost:wght@300;400;500;600&display=swap');

        .os-section {
          background-color: #faf7f2;
          padding: 56px 0 72px;
          font-family: 'Jost', sans-serif;
          overflow: hidden;
        }
        .os-inner {
          max-width: 1360px;
          margin: 0 auto;
          padding: 0 40px;
        }
        .os-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 40px;
          gap: 16px;
          flex-wrap: wrap;
        }
        .os-title-group { display: flex; flex-direction: column; gap: 6px; }
        .os-eyebrow {
          font-size: 11px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #3d6b4f;
          font-weight: 500;
        }
        .os-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(34px, 4.5vw, 56px);
          font-weight: 600;
          color: #1a1a14;
          line-height: 1;
          letter-spacing: -0.01em;
          margin: 0;
        }

        /* Product track */
        .os-track-wrapper {
          position: relative;
          margin-left: -40px;
          margin-right: -40px;
        }
        .os-track {
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
        .os-track::-webkit-scrollbar { display: none; }
        .os-track-wrapper::after {
          content: '';
          position: absolute;
          right: 0; top: 0; bottom: 8px;
          width: 80px;
          background: linear-gradient(to left, #faf7f2 10%, transparent);
          pointer-events: none;
          z-index: 1;
        }

        /* Category banner cards */
        .os-cat-row {
          display: flex;
          gap: 16px;
          flex-wrap: nowrap;
          overflow-x: auto;
          padding-bottom: 4px;
          scrollbar-width: none;
        }
        .os-cat-row::-webkit-scrollbar { display: none; }
        .os-cat-card {
          position: relative;
          flex: 0 0 calc(50% - 8px);
          border-radius: 10px;
          overflow: hidden;
          height: clamp(200px, 28vw, 400px);
          display: block;
          text-decoration: none;
          cursor: pointer;
          scroll-snap-align: start;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .os-cat-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(0,0,0,0.14); }
        .os-cat-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          display: block;
          transition: transform 0.6s ease;
        }
        .os-cat-card:hover .os-cat-img { transform: scale(1.04); }
        .os-cat-scrim {
          position: absolute;
          inset: 0;
          background: linear-gradient(0deg, rgba(10,10,10,0.52) 0%, transparent 55%);
          z-index: 1;
        }
        .os-cat-label {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          z-index: 2;
          padding: 1.2rem 1.4rem;
          text-align: center;
        }
        .os-cat-label span {
          font-family: 'Jost', sans-serif;
          font-size: clamp(0.75rem, 1.6vw, 1rem);
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #f5f0e8;
          display: inline-block;
          border-bottom: 1px solid rgba(245,240,232,0.6);
          padding-bottom: 4px;
          text-shadow: 0 1px 4px rgba(0,0,0,0.4);
          transition: letter-spacing 0.3s ease;
        }
        .os-cat-card:hover .os-cat-label span { letter-spacing: 0.18em; }
        .os-cat-row.os-single .os-cat-card { flex: 0 0 100%; height: clamp(220px, 32vw, 460px); }

        /* Responsive */
        @media (min-width: 1280px) { .pc { flex: 0 0 248px; } }
        @media (min-width: 1024px) and (max-width: 1279px) {
          .pc { flex: 0 0 240px; }
          .os-inner { padding: 0 32px; }
          .os-track-wrapper { margin-left: -32px; margin-right: -32px; }
          .os-track { padding-left: 32px; padding-right: 32px; }
        }
        @media (min-width: 640px) and (max-width: 1023px) {
          .os-section { padding: 44px 0 56px; }
          .os-inner { padding: 0 28px; }
          .os-header { margin-bottom: 28px; }
          .pc { flex: 0 0 220px; }
          .os-track-wrapper { margin-left: -28px; margin-right: -28px; }
          .os-track { padding-left: 28px; padding-right: 28px; }
        }
        @media (max-width: 639px) {
          .os-section { padding: 36px 0 48px; }
          .os-inner { padding: 0 18px; }
          .os-header { margin-bottom: 20px; }
          .os-track { gap: 14px; }
          .os-track-wrapper { margin-left: -18px; margin-right: -18px; }
          .os-track { padding-left: 18px; padding-right: 18px; }
          .pc { flex: 0 0 165px; border-radius: 8px; }
          .pc-info { padding: 10px 10px 12px; gap: 5px; }
          .pc-name { font-size: 14px; }
          .pc-price { font-size: 12px; }
          .os-cat-card { flex: 0 0 80%; height: clamp(160px, 60vw, 300px); }
          .os-cat-row.os-single .os-cat-card { flex: 0 0 100%; height: clamp(200px, 70vw, 380px); }
        }
        @media (max-width: 374px) {
          .pc { flex: 0 0 150px; }
          .os-inner { padding: 0 14px; }
          .os-track-wrapper { margin-left: -14px; margin-right: -14px; }
          .os-track { padding-left: 14px; padding-right: 14px; }
        }
      `}</style>

      <section className="os-section" aria-label={section.title || "Featured Section"}>
        <div className="os-inner">
          <div className="os-header">
            <div className="os-title-group">
              {section.eyebrow && <span className="os-eyebrow">{section.eyebrow}</span>}
              <h2 className="os-title">{section.title}</h2>
            </div>
          </div>

          {allCategories ? (
            <div className={`os-cat-row${section.items.length === 1 ? " os-single" : ""}`}>
              {section.items.map((item) => (
                <CategoryBannerCard key={item._id} item={item} />
              ))}
            </div>
          ) : (
            <div className="os-track-wrapper">
              <div className="os-track" ref={scrollRef}>
                {section.items.map((item) =>
                  item.type === "product" && item.product ? (
                    <ProductCard key={item._id} product={item.product} />
                  ) : item.type === "category" ? (
                    <CategoryBannerCard key={item._id} item={item} />
                  ) : null
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
