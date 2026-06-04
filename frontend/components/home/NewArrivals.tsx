"use client";

import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cartContext";
import { useWishlist } from "@/lib/wishlistContext";
import { fetchNewArrivalsSection, type CatalogProduct } from "@/lib/catalogApi";
/* ─────────────────────────────────────────
   Types
───────────────────────────────────────── */
interface ProductColor {
  label: string;
  hex: string;
  images?: string[];
}

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  originalPrice?: number | null;
  badge?: string | null;
  images: string[];
  colors: ProductColor[];
  href: string;
  rating?: number;
  reviewCount?: number;
}

/* ─────────────────────────────────────────
   Data
───────────────────────────────────────── */

/* ─────────────────────────────────────────
   ProductCard
───────────────────────────────────────── */
function ProductCard({
  product,
  style,
  className = "",
}: {
  product: Product;
  style?: CSSProperties;
  className?: string;
}) {
  const router = useRouter();
  // addItem from cartContext — by default openDrawer=true, so the cart
  // drawer slides open immediately after the item is added.
  const { addItem } = useCart();
  // toggleItem flips wishlist state; isWished drives the heart fill.
  // The BottomNav reads wishlistItems.length for the badge count automatically.
  const { toggleItem, isWished } = useWishlist();

  const { name, price, originalPrice, badge, images, colors, href } = product;

  const [activeImage, setActiveImage] = useState(0);
  const [cartAnim, setCartAnim] = useState(false);
  // Optimistic wishlist animation state (instant visual feedback before context updates)
  const [wishAnim, setWishAnim] = useState(false);

  const displayImage = images[activeImage] ?? images[0];

  const discount = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : null;

  // Build a wishlist-compatible item — shape matches WishlistItem interface
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

  // Wishlist toggle — stops card navigation, toggles item in context.
  // The BottomNav /wishlist badge updates automatically because it reads
  // items.length from the same WishlistContext.
  const handleWish = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setWishAnim(true);
    setTimeout(() => setWishAnim(false), 400);
    toggleItem(wishlistItem);
  };

  // Add to Cart — stops card navigation, adds item to CartContext.
  // CartContext reducer's ADD_ITEM action sets isDrawerOpen: true by default
  // (openDrawer param defaults to true in addItem), so CartDrawer opens.
  const handleAddToCart = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // addItem(item, openDrawer=true) — the second arg triggers isDrawerOpen
    // in cartContext, which CartDrawer reads to slide open.
    addItem(
      {
        id: String(product.id),
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice ?? undefined,
        image: images[0],
        color: colors[0]?.label ?? "",
        colorHex: colors[0]?.hex ?? "#c9a84c",
        href: product.href,
        // sku is required by CartItem; use a slug-based fallback
        sku: `NA-${product.id}`,
      },
      true, // openDrawer = true → CartDrawer slides open
    );

    setCartAnim(true);
    setTimeout(() => setCartAnim(false), 700);
  };

  // Card click → navigate to Product Detail Page.
  // The href in each product object maps to the PDP route, e.g.
  // "/products/linen-tote-bag" which Next.js resolves to
  // app/products/[slug]/page.tsx → ProductDetailPage component.
  const handleCardClick = () => {
    router.push(href);
  };

  return (
    <div
      className={`pc ${className}`}
      style={style}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") router.push(href);
      }}
      aria-label={`View ${name}`}
    >
      {/* IMAGE ZONE */}
      <div className="pc-img-zone">
        <img
          className="pc-img"
          src={displayImage}
          alt={name}
          loading="lazy"
          width={400}
          height={600}
        />

        <div className="pc-overlay" />

        {badge && !discount && (
          <span
            className={`pc-badge${badge === "Sale" ? " pc-badge--sale" : ""}`}
          >
            {badge}
          </span>
        )}
        {discount && (
          <span className="pc-discount">−{discount}%</span>
        )}

        {/* Wishlist button — fills heart & increments BottomNav badge */}
        <button
          className={`pc-wish${wished ? " active" : ""}${wishAnim ? " pc-wish--pop" : ""}`}
          onClick={handleWish}
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={wished}
        >
          <svg
            viewBox="0 0 24 24"
            fill={wished ? "#f7f2ea" : "none"}
            stroke={wished ? "none" : "var(--olive)"}
            strokeWidth="2"
          >
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

      {/* INFO STRIP */}
      <div className="pc-info">
        {/* <p className="pc-category">{product.category}</p> */}
        <p className="pc-name">{name}</p>

        {colors.length > 1 && (
          <div className="pc-colors">
            {colors.map((c) => (
              <span
                key={c.label}
                className="pc-swatch"
                style={{ background: c.hex }}
                title={c.label}
              />
            ))}
          </div>
        )}

        <div className="pc-price-row">
          <span className="pc-price">₹{price.toLocaleString("en-IN")}</span>
          {originalPrice && (
            <span className="pc-original">
              ₹{originalPrice.toLocaleString("en-IN")}
            </span>
          )}
          {discount && (
            <span className="pc-saving">{discount}% off</span>
          )}
        </div>

        {/* {product.rating && (
          <div className="pc-rating">
            <span className="pc-stars">
              {"★".repeat(Math.round(product.rating))}
              {"☆".repeat(5 - Math.round(product.rating))}
            </span>
            <span className="pc-reviews">({product.reviewCount})</span>
          </div>
        )} */}

        {/* Add to Cart button — triggers cart drawer open via CartContext */}
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
   New Arrivals Section
───────────────────────────────────────── */
export default function NewArrivals() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [eyebrow, setEyebrow] = useState("");
  const [title, setTitle] = useState("New Arrivals");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    fetchNewArrivalsSection()
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
  }, []);

  if (!loading && products.length === 0) return null;
 

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: dir === "right" ? 300 : -300,
      behavior: "smooth",
    });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Jost:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* ══════════════════════════════════════
           SECTION SHELL
        ══════════════════════════════════════ */
        .na-section {
          background-color: #f5f0e8;
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
          background: linear-gradient(to left, #f5f0e8 10%, transparent);
          pointer-events: none;
          z-index: 1;
        }

        /* ══════════════════════════════════════
           PRODUCT CARD (pc-*)
        ══════════════════════════════════════ */
        .pc {
          --beige:    #f7f2ea;
          --beige-dk: #ede5d5;
          --olive:    #3d4a22;
          --olive-md: #5a6b2e;
          --ink:      #1e2310;
          --mist:     rgba(30,35,16,.42);
          --t: .24s cubic-bezier(.4,0,.2,1);

          font-family: 'Jost', sans-serif;
          background: var(--beige);
          border-radius: 10px;
          overflow: hidden;
          position: relative;
          display: flex;
          flex-direction: column;

          flex: 0 0 260px;
          scroll-snap-align: start;

          box-shadow: 0 1px 4px rgba(61,74,34,.08);
          transition: box-shadow var(--t), transform var(--t);
          cursor: pointer;
          user-select: none;
        }

        .pc:hover {
          box-shadow: 0 8px 28px rgba(61,74,34,.16), 0 2px 6px rgba(61,74,34,.08);
          transform: translateY(-4px);
        }
        .pc:active { transform: translateY(0); box-shadow: 0 1px 4px rgba(61,74,34,.08); }

        .pc-img-zone {
          position: relative;
          width: 100%;
          aspect-ratio: 2 / 3;
          background: var(--beige-dk);
          overflow: hidden;
          flex-shrink: 0;
        }

        .pc-img {
          width: 100%; height: 100%;
          object-fit: cover;
          object-position: center top;
          display: block;
          transition: transform .5s cubic-bezier(.25,.46,.45,.94);
        }
        .pc:hover .pc-img { transform: scale(1.05); }

        .pc-overlay {
          position: absolute; inset: 0;
          background: rgba(20,26,10,.1);
          opacity: 0;
          transition: opacity var(--t);
          pointer-events: none;
        }
        .pc:hover .pc-overlay { opacity: 1; }

        .pc-badge {
          position: absolute; top: 10px; left: 10px; z-index: 2;
          font-size: 8px; font-weight: 600; letter-spacing: .08em;
          text-transform: uppercase;
          color: var(--ink); background: var(--beige);
          padding: 3px 9px 2px; border-radius: 2px;
          box-shadow: 0 1px 4px rgba(0,0,0,.1);
        }
        .pc-badge--sale { background: var(--olive); color: var(--beige); }

        .pc-discount {
          position: absolute; top: 10px; left: 10px; z-index: 2;
          font-size: 8px; font-weight: 700; letter-spacing: .06em;
          color: var(--beige); background: var(--olive-md);
          padding: 3px 9px 2px; border-radius: 2px;
        }

        /* ── Wishlist heart button ──
           .active  → product is in wishlist → olive background + cream heart
           .pc-wish--pop → brief scale-pop animation on toggle for tactile feedback
           The BottomNav /wishlist tab badge auto-updates because WishlistContext
           items array length is read directly in BottomNav component.
        ── */
        .pc-wish {
          position: absolute; top: 8px; right: 8px; z-index: 3;
          width: 30px; height: 30px; border-radius: 50%;
          background: rgba(247,242,234,.88);
          border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 1px 4px rgba(0,0,0,.1);
          transition: transform .18s, background .18s;
          backdrop-filter: blur(4px);
        }
        .pc-wish:hover { transform: scale(1.12); background: var(--beige); }
        .pc-wish.active { background: var(--olive); }
        .pc-wish--pop { animation: wishPop .35s cubic-bezier(.34,1.56,.64,1) both; }
        @keyframes wishPop {
          0%   { transform: scale(1); }
          50%  { transform: scale(1.35); }
          100% { transform: scale(1); }
        }
        .pc-wish svg { width: 14px; height: 14px; }

        /* Image dots */
        .pc-dots {
          position: absolute; bottom: 10px; left: 50%;
          transform: translateX(-50%);
          display: flex; gap: 5px;
          z-index: 2; opacity: 0;
          transition: opacity var(--t);
        }
        .pc:hover .pc-dots { opacity: 1; }
        .pc-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: rgba(247,242,234,.5);
          border: none; cursor: pointer; padding: 0;
          transition: background .18s, width .18s;
        }
        .pc-dot.active { background: #f7f2ea; width: 14px; border-radius: 2px; }

        /* Info strip */
        .pc-info {
          padding: 14px 14px 16px;
          background: var(--beige);
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex: 1;
          border-top: 1px solid rgba(61,74,34,.06);
        }

        .pc-category {
          font-size: 9px; font-weight: 500;
          letter-spacing: .12em;
          text-transform: uppercase;
          color: #3d6b4f;
        }

        .pc-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 17px; font-weight: 600;
          color: var(--ink);
          line-height: 1.2;
          letter-spacing: -.01em;
        }

        .pc-colors { display: flex; gap: 5px; align-items: center; }
        .pc-swatch {
          width: 12px; height: 12px;
          border-radius: 50%;
          display: inline-block;
          border: 1.5px solid rgba(0,0,0,.12);
          flex-shrink: 0;
        }

        .pc-price-row {
          display: flex; align-items: center; gap: 7px; flex-wrap: wrap;
        }
        .pc-price {
          font-size: 14px; font-weight: 600;
          color: var(--ink); letter-spacing: -.01em;
        }
        .pc-original {
          font-size: 11px; font-weight: 400;
          color: var(--mist); text-decoration: line-through;
        }
        .pc-saving {
          font-size: 9px; font-weight: 600;
          color: var(--olive-md); letter-spacing: .04em;
        }

        .pc-rating { display: flex; align-items: center; gap: 5px; }
        .pc-stars { font-size: 10px; color: #c9a84c; letter-spacing: .04em; }
        .pc-reviews { font-size: 10px; color: var(--mist); }

        /* ── Add to Cart button ──
           On click: addItem(item, openDrawer=true) triggers CartContext to set
           isDrawerOpen: true, which CartDrawer reads and slides in from the right.
           The .pc-cart-btn--added state gives a brief "Added ✓" confirmation.
        ── */
        .pc-cart-btn {
          margin-top: 4px;
          width: 100%;
          padding: 9px 0;
          border: 1.5px solid var(--olive);
          background: transparent;
          color: var(--olive);
          font-family: 'Jost', sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: .1em;
          text-transform: uppercase;
          border-radius: 4px;
          cursor: pointer;
          transition: background .22s, color .22s, border-color .22s;
        }
        .pc-cart-btn:hover { background: var(--olive); color: var(--beige); }
        .pc-cart-btn--added {
          background: var(--olive);
          color: var(--beige);
          border-color: var(--olive);
        }

        /* ══════════════════════════════════════
           RESPONSIVE
        ══════════════════════════════════════ */
        @media (min-width: 1280px) {
          .pc { flex: 0 0 248px; }
        }

        @media (min-width: 1024px) and (max-width: 1279px) {
          .pc { flex: 0 0 240px; }
          .na-inner { padding: 0 32px; }
          .na-track-wrapper { margin-left: -32px; margin-right: -32px; }
          .na-track { padding-left: 32px; padding-right: 32px; }
        }

        @media (min-width: 640px) and (max-width: 1023px) {
          .na-section { padding: 56px 0 72px; }
          .na-inner { padding: 0 28px; }
          .na-header { margin-bottom: 32px; }
          .pc { flex: 0 0 220px; }
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
          .pc { flex: 0 0 165px; border-radius: 8px; }
          .pc-info { padding: 10px 10px 12px; gap: 5px; }
          .pc-name { font-size: 14px; }
          .pc-price { font-size: 12px; }
          .pc-original { font-size: 10px; }
          .pc-category { font-size: 8px; }
          .pc-cart-btn { font-size: 10px; padding: 7px 0; }
          .pc-badge, .pc-discount { font-size: 7px; top: 7px; left: 7px; padding: 2px 6px; }
          .pc-wish { width: 26px; height: 26px; top: 6px; right: 6px; }
          .pc-wish svg { width: 12px; height: 12px; }
          .na-btn { width: 38px; height: 38px; font-size: 15px; }
          .pc-swatch { width: 10px; height: 10px; }
        }

        @media (max-width: 374px) {
          .pc { flex: 0 0 150px; }
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

            {/* <div className="na-nav">
              <a href="/new-arrivals" className="na-view-all">
                View All
              </a>
              <button
                className="na-btn"
                aria-label="Scroll left"
                onClick={() => scroll("left")}
              >
                ←
              </button>
              <button
                className="na-btn"
                aria-label="Scroll right"
                onClick={() => scroll("right")}
              >
                →
              </button>
            </div> */}
          </div>

          {/* Scrollable Product Cards */}
          <div className="na-track-wrapper">
            <div className="na-track" ref={scrollRef}>
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
