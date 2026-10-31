"use client";
import { useCart } from "@/lib/cartContext";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { getApiUrl } from "@/lib/api";

type SearchResults = { products: any[]; categories: any[]; styles: any[]; combos: any[] };
const EMPTY_RESULTS: SearchResults = { products: [], categories: [], styles: [], combos: [] };

export default function TopNav() {
  const { itemCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const theme = "light";
  const navRef = useRef<HTMLElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchTerm("");
    setSearchResults(null);
    setIsSearching(false);
  };

  const openSearch = () => {
    setMenuOpen(false);
    setSearchOpen(true);
  };

  // Focus input + lock page scroll + Esc to close while overlay is open
  useEffect(() => {
    if (!searchOpen) return;
    const t = setTimeout(() => searchInputRef.current?.focus(), 50);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSearch();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [searchOpen]);

  // Debounced search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults(null);
      setIsSearching(false);
      return;
    }

    let cancelled = false;
    setIsSearching(true);

    const timer = setTimeout(async () => {
      try {
        const url = getApiUrl(`/products/search?q=${encodeURIComponent(searchTerm)}`);
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data.success && !cancelled) {
            setSearchResults({
              products: data.products || [],
              categories: data.categories || [],
              styles: data.styles || [],
              combos: data.combos || [],
            });
            return;
          }
        }
        if (!cancelled) setSearchResults(EMPTY_RESULTS);
      } catch (error) {
        console.error("Search error:", error);
        if (!cancelled) setSearchResults(EMPTY_RESULTS);
      } finally {
        if (!cancelled) setIsSearching(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchTerm]);

  const hasAnyResult =
    !!searchResults &&
    (searchResults.categories.length > 0 ||
      searchResults.styles.length > 0 ||
      searchResults.products.length > 0 ||
      searchResults.combos.length > 0);

  return (
    <>
      <style>{`
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=Montserrat:wght@300;400;500;600&display=swap');
        /* ── NAV SHELL ── */
        .sparkle-nav {
          position: sticky;
          top: 0; left: 0; right: 0;
          z-index: 200;
          padding: 0 24px;
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
          transition: color 0.25s;
        }
        .sparkle-nav-inner {
          max-width: 1280px;
          margin: 0 auto;
          height: 72px;
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          gap: 16px;
          width: 100%;
        }

        .sparkle-nav-left { display: flex; align-items: center; justify-content: flex-start; }
        .sparkle-nav-center { display: flex; align-items: center; justify-content: center; }
        .sparkle-logo {
          font-family: 'Cinzel', serif;
          font-size: 1.7rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          color: #1a1a1a;
          text-decoration: none;
          line-height: 1;
          transition: color .25s;
        }
        .sparkle-logo:hover { color: #c9a84c; }

        .sparkle-nav-right {
          display: flex;
          align-items: center;
          gap: 4px;
          justify-content: flex-end;
          position: relative;
        }

        .sparkle-icon-btn {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: none;
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          position: relative;
          text-decoration: none;
          color: #2a2a27;
          transition: background 0.2s, color 0.2s;
          flex-shrink: 0;
        }
        .sparkle-icon-btn:hover { background: rgba(201,168,76,0.15); color: #c9a84c; }

        .sparkle-divider {
          width: 1px;
          height: 18px;
          margin: 0 4px;
          background: rgba(42,42,39,0.2);
          flex-shrink: 0;
        }

        .sparkle-badge {
          position: absolute;
          top: 4px; right: 4px;
          width: 14px; height: 14px;
          border-radius: 50%;
          background: #c9a84c;
          font-size: 0.42rem;
          font-weight: 700;
          color: #1a1a1a;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Montserrat', sans-serif;
        }

        /* ── HAMBURGER ── */
        .sparkle-hamburger {
          display: flex;
          flex-direction: column;
          gap: 5px;
          cursor: pointer;
          background: transparent;
          border: none;
          padding: 4px;
        }
        .sparkle-hamburger span {
          display: block;
          width: 22px; height: 1.5px;
          background: #2a2a27;
          transition: transform 0.3s, opacity 0.3s;
        }
        .sparkle-hamburger.open span:nth-child(1) { transform: translateY(6.5px) rotate(45deg); }
        .sparkle-hamburger.open span:nth-child(2) { opacity: 0; }
        .sparkle-hamburger.open span:nth-child(3) { transform: translateY(-6.5px) rotate(-45deg); }

        /* ── DROPDOWN MENU ── */
        .sparkle-menu-dropdown {
          display: none;
          position: fixed;
          top: 72px; left: 0; right: 0;
          background: #ffffff;
          backdrop-filter: blur(20px);
          padding: 16px 32px 24px 32px;
          flex-direction: column;
          gap: 0;
          z-index: 199;
          border-top: 1px solid rgba(201,168,76,0.2);
          animation: slideDown 0.3s ease;
          max-height: calc(100vh - 72px);
          overflow-y: auto;
        }
        .sparkle-menu-dropdown.open { display: flex; }

        .sparkle-policy-group { display: flex; flex-direction: column; gap: 0; }
        .sparkle-policy-link {
          font-family: 'Montserrat', sans-serif;
          font-size: 0.65rem;
          font-weight: 500;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #101010;
          text-decoration: none;
          padding: 14px 0;
          border-bottom: 1px solid rgba(0,0,0,0.07);
          transition: color 0.2s;
          display: block;
          cursor: pointer;
          background: none;
          border-left: none;
          border-right: none;
          border-top: none;
          text-align: left;
          width: 100%;
        }
        .sparkle-policy-link:hover { color: #c9a84c; }
        .sparkle-policy-link:last-child { border-bottom: none; }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        /* ── SEARCH OVERLAY ── */
        .sparkle-search-overlay {
          position: fixed;
          inset: 0;
          z-index: 300;
          background: rgba(20, 20, 18, 0.45);
          animation: fadeIn 0.2s ease;
        }
        .sparkle-search-panel {
          background: #ffffff;
          width: 100%;
          max-height: 80vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 12px 40px rgba(0,0,0,0.18);
          animation: slideDown 0.25s ease;
        }
        .sparkle-search-top {
          flex-shrink: 0;
          height: 72px;
          padding: 0 24px;
          border-bottom: 1px solid rgba(0,0,0,0.08);
        }
        .sparkle-search-top-inner {
          max-width: 760px;
          height: 100%;
          margin: 0 auto;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .sparkle-search-top-inner > svg { flex-shrink: 0; color: #2a2a27; }
        .sparkle-search-input {
          flex: 1;
          min-width: 0;
          border: none;
          outline: none;
          background: transparent;
          font-family: 'Montserrat', sans-serif;
          font-size: 1rem;
          letter-spacing: 0.04em;
          color: #2a2a27;
          height: 100%;
        }
        .sparkle-search-input::placeholder { color: rgba(42,42,39,0.4); }
        .sparkle-search-close {
          width: 40px; height: 40px;
          flex-shrink: 0;
          border-radius: 50%;
          border: none;
          background: rgba(42,42,39,0.06);
          color: #2a2a27;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
        }
        .sparkle-search-close:hover { background: rgba(201,168,76,0.2); color: #c9a84c; }

        .sparkle-search-results {
          flex: 1;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          padding: 8px 24px 24px;
        }
        .sparkle-search-results-inner { max-width: 760px; margin: 0 auto; }

        .sparkle-search-section-title {
          font-family: 'Montserrat', sans-serif;
          font-size: 0.65rem;
          font-weight: 600;
          color: #c9a84c;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 14px 0 6px;
          border-bottom: 1px solid rgba(0,0,0,0.06);
          margin-bottom: 4px;
        }
        .sparkle-search-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 4px;
          color: #101010;
          text-decoration: none;
          transition: background 0.2s;
          border-radius: 6px;
        }
        .sparkle-search-item:hover { background: rgba(201,168,76,0.08); }
        .sparkle-search-item-img {
          width: 44px; height: 44px;
          border-radius: 6px;
          object-fit: cover;
          background: rgba(0,0,0,0.06);
          flex-shrink: 0;
        }
        .sparkle-search-item-info {
          display: flex;
          flex-direction: column;
          flex: 1;
          overflow: hidden;
        }
        .sparkle-search-item-title {
          font-family: 'Montserrat', sans-serif;
          font-size: 0.85rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          color: #101010;
        }
        .sparkle-search-item-price {
          font-family: 'Montserrat', sans-serif;
          font-size: 0.72rem;
          color: #3d3d37;
          margin-top: 2px;
        }
        .sparkle-search-message {
          padding: 28px 0;
          text-align: center;
          font-family: 'Montserrat', sans-serif;
          font-size: 0.8rem;
          color: #101010;
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 768px) {
          .sparkle-logo { font-size: 1.45rem; letter-spacing: 0.12em; }
          /* Full-screen search on mobile */
          .sparkle-search-overlay { background: #ffffff; }
          .sparkle-search-panel {
            height: 100vh;
            height: 100dvh;
            max-height: none;
            box-shadow: none;
          }
          .sparkle-search-top { padding: 0 16px; }
          .sparkle-search-results { padding: 8px 16px 24px; }
        }
        @media (max-width: 480px) {
          .sparkle-nav { padding: 0 16px; }
          .sparkle-nav-inner { height: 64px; gap: 8px; }
          .sparkle-menu-dropdown { top: 64px; max-height: calc(100vh - 64px); }
          .sparkle-logo { font-size: 1.05rem; letter-spacing: 0.1em; }
          .sparkle-icon-btn { width: 34px; height: 34px; }
          .sparkle-search-top { height: 64px; }
        }
        @media (max-width: 360px) {
          .sparkle-nav { padding: 0 10px; }
          .sparkle-nav-inner { gap: 4px; }
          .sparkle-logo { font-size: 1.05rem; letter-spacing: 0.08em; }
          .sparkle-icon-btn { width: 30px; height: 30px; }
          .sparkle-icon-btn svg { width: 14px; height: 14px; }
        }
      `}</style>

      {/* ── MAIN NAV BAR ── */}
      <nav ref={navRef} className="sparkle-nav" data-theme={theme}>
        <div className="sparkle-nav-inner">

          {/* LEFT: Hamburger */}
          <div className="sparkle-nav-left">
            <button
              className={`sparkle-hamburger${menuOpen ? " open" : ""}`}
              aria-label="Navigation Menu"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <span /><span /><span />
            </button>
          </div>

          {/* CENTER: Brand name */}
          <div className="sparkle-nav-center">
            <Link href="/" className="sparkle-logo">
              MAKE YOU SPARKLE
            </Link>
          </div>

          {/* RIGHT: Search icon + Cart */}
          <div className="sparkle-nav-right">
            <button
              className="sparkle-icon-btn"
              aria-label="Open search"
              onClick={openSearch}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7" />
                <line x1="17" y1="17" x2="21" y2="21" />
              </svg>
            </button>

            <div className="sparkle-divider" />

            <Link className="sparkle-icon-btn" href="/cart" aria-label="Cart">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              {itemCount > 0 && (
                <span className="sparkle-badge">{itemCount > 99 ? "99+" : itemCount}</span>
              )}
            </Link>
          </div>

        </div>
      </nav>

      {/* ── DROPDOWN MENU ── */}
      <div className={`sparkle-menu-dropdown${menuOpen ? " open" : ""}`}>
        <div className="sparkle-policy-group">
          <Link className="sparkle-policy-link" href="/categories" onClick={() => setMenuOpen(false)}>Categories</Link>
          <Link className="sparkle-policy-link" href="/shipping-policy" onClick={() => setMenuOpen(false)}>Shipping Policy</Link>
          <Link className="sparkle-policy-link" href="/refund-policy" onClick={() => setMenuOpen(false)}>Return &amp; Refund Policy</Link>
          <Link className="sparkle-policy-link" href="/affiliate" onClick={() => setMenuOpen(false)}>Affiliate</Link>
          <button
            className="sparkle-policy-link"
            onClick={() => {
              setMenuOpen(false);
              document.getElementById("footer")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Contact Us
          </button>
        </div>
      </div>

      {/* ── SEARCH OVERLAY ── */}
      {searchOpen && (
        <div
          className="sparkle-search-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Search"
          onMouseDown={(e) => { if (e.target === e.currentTarget) closeSearch(); }}
        >
          <div className="sparkle-search-panel">
            <div className="sparkle-search-top">
              <div className="sparkle-search-top-inner">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="7" />
                  <line x1="17" y1="17" x2="21" y2="21" />
                </svg>
                <input
                  ref={searchInputRef}
                  className="sparkle-search-input"
                  type="text"
                  placeholder="Search jewels…"
                  aria-label="Search jewels"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button className="sparkle-search-close" aria-label="Close search" onClick={closeSearch}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>

            {searchTerm.trim() && (
              <div className="sparkle-search-results">
                <div className="sparkle-search-results-inner">
                  {isSearching ? (
                    <div className="sparkle-search-message">Searching...</div>
                  ) : searchResults ? (
                    <>
                      {searchResults.categories.length > 0 && (
                        <div>
                          <div className="sparkle-search-section-title">Categories</div>
                          {searchResults.categories.map((cat) => (
                            <Link key={cat._id} href={`/categories/${cat._id}`} className="sparkle-search-item" onClick={closeSearch}>
                              <div className="sparkle-search-item-info">
                                <span className="sparkle-search-item-title">{cat.name}</span>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}

                      {searchResults.styles.length > 0 && (
                        <div>
                          <div className="sparkle-search-section-title">Styles</div>
                          {searchResults.styles.map((style) => (
                            <Link key={style._id} href={`/styles/${style._id}`} className="sparkle-search-item" onClick={closeSearch}>
                              <div className="sparkle-search-item-info">
                                <span className="sparkle-search-item-title">{style.name}</span>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}

                      {searchResults.products.length > 0 && (
                        <div>
                          <div className="sparkle-search-section-title">Products</div>
                          {searchResults.products.map((product) => (
                            <Link key={product._id} href={`/products/${product._id}`} className="sparkle-search-item" onClick={closeSearch}>
                              {product.mainImage && (
                                <Image src={product.mainImage} alt={product.title} width={44} height={44} className="sparkle-search-item-img" />
                              )}
                              <div className="sparkle-search-item-info">
                                <span className="sparkle-search-item-title">{product.title}</span>
                                {product.price && <span className="sparkle-search-item-price">₹{product.price}</span>}
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}

                      {searchResults.combos.length > 0 && (
                        <div>
                          <div className="sparkle-search-section-title">Combos</div>
                          {searchResults.combos.map((combo) => (
                            <Link
                              key={combo._id}
                              href={combo.type === 'custom' ? `/categories/women/curated-combos?custom=${combo._id}` : `/categories/women/curated-combos?combo=${combo._id}`}
                              className="sparkle-search-item"
                              onClick={closeSearch}
                            >
                              {combo.image && (
                                <Image src={combo.image} alt={combo.name} width={44} height={44} className="sparkle-search-item-img" />
                              )}
                              <div className="sparkle-search-item-info">
                                <span className="sparkle-search-item-title">{combo.name}</span>
                                {combo.price && <span className="sparkle-search-item-price">₹{combo.price}</span>}
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}

                      {!hasAnyResult && (
                        <div className="sparkle-search-message">No matching results found.</div>
                      )}
                    </>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}