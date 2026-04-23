"use client";
import { useCart } from "@/lib/cartContext";
import { useState, useEffect, useRef } from "react";

export default function TopNav() {
  const { itemCount } = useCart();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState("dark");
  const navRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    type RGBA = { r: number; g: number; b: number; a: number };

    function parseRgb(str: string): RGBA | null {
      const m = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
      if (!m) return null;
      return {
        r: Number(m[1]),
        g: Number(m[2]),
        b: Number(m[3]),
        a: m[4] !== undefined ? Number(m[4]) : 1,
      };
    }

    function relativeLuminance({ r, g, b }: { r: number; g: number; b: number }) {
      return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    }

    function getComputedBgColor(x: number, y: number): RGBA {
      const el = document.elementFromPoint(x, y);
      if (!el) return { r: 255, g: 255, b: 255, a: 1 };
      let node: HTMLElement | null = el as HTMLElement;
      while (node && node !== document.documentElement) {
        const bg = getComputedStyle(node).backgroundColor;
        const parsed = parseRgb(bg);
        if (parsed && parsed.a > 0.05) return parsed;
        node = node.parentElement;
      }
      const bodyBg = parseRgb(getComputedStyle(document.body).backgroundColor);
      return bodyBg || { r: 255, g: 255, b: 255, a: 1 };
    }

    function updateTheme() {
      if (!navRef.current) return;
      const navH = navRef.current.getBoundingClientRect().height;
      const bgColor = getComputedBgColor(window.innerWidth / 2, navH + 4);
      const lum = relativeLuminance(bgColor);
      setTheme(lum > 0.4 ? "light" : "dark");
    }

    updateTheme();

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateTheme();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Montserrat:wght@300;400;500;600&display=swap');

        .k-nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 200;
          padding: 0 24px;
          background: transparent;
          border-bottom: none;
          transition: color 0.25s;
        }
        .k-nav-inner {
          max-width: 1280px;
          margin: 0 auto;
          height: 72px;
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          gap: 16px;
        }
        .k-nav-left {
          display: flex;
          gap: 32px;
          align-items: center;
        }
        .k-link {
          font-family: 'Montserrat', sans-serif;
          font-size: 0.6rem;
          font-weight: 600;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          text-decoration: none;
          position: relative;
          transition: color 0.25s, text-shadow 0.25s;
        }
        .k-nav[data-theme="light"] .k-link,
        .k-nav[data-theme="light"] .k-logo,
        .k-nav[data-theme="light"] .k-icon-btn {
          color: #2a2a27;
          text-shadow: 0 1px 3px rgba(255,255,255,0.5);
        }
        .k-nav[data-theme="light"] .k-hamburger span { background: #2a2a27; }
        .k-nav[data-theme="light"] .k-divider { background: rgba(42,42,39,0.25); }
        .k-nav[data-theme="light"] .k-search-box {
          border-color: rgba(42,42,39,0.25);
          background: rgba(42,42,39,0.04);
        }
        .k-nav[data-theme="light"] .k-search-box.open {
          border-color: #c9a84c;
          background: rgba(201,168,76,0.06);
        }
        .k-nav[data-theme="light"] .k-search-box input { color: #2a2a27; }
        .k-nav[data-theme="light"] .k-search-box input::placeholder { color: rgba(42,42,39,0.45); }

        .k-nav[data-theme="dark"] .k-link,
        .k-nav[data-theme="dark"] .k-logo,
        .k-nav[data-theme="dark"] .k-icon-btn {
          color: rgba(255,255,255,0.92);
          text-shadow: 0 1px 6px rgba(0,0,0,0.5);
        }
        .k-nav[data-theme="dark"] .k-hamburger span { background: rgba(255,255,255,0.88); }
        .k-nav[data-theme="dark"] .k-divider { background: rgba(255,255,255,0.22); }
        .k-nav[data-theme="dark"] .k-search-box {
          border-color: rgba(255,255,255,0.22);
          background: rgba(255,255,255,0.06);
        }
        .k-nav[data-theme="dark"] .k-search-box.open {
          border-color: #c9a84c;
          background: rgba(201,168,76,0.08);
        }
        .k-nav[data-theme="dark"] .k-search-box input { color: #fff; }
        .k-nav[data-theme="dark"] .k-search-box input::placeholder { color: rgba(255,255,255,0.45); }

        .k-link:hover { color: #c9a84c !important; text-shadow: none !important; }
        .k-link::after {
          content: '';
          position: absolute;
          bottom: -4px; left: 0;
          width: 0; height: 1px;
          background: #c9a84c;
          transition: width 0.35s ease;
        }
        .k-link:hover::after { width: 100%; }

        .k-logo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2.1rem;
          font-weight: 700;
          text-decoration: none;
          letter-spacing: -0.5px;
          display: flex;
          align-items: center;
          gap: 5px;
          white-space: nowrap;
          transition: color 0.25s, text-shadow 0.25s;
        }
        .k-logo-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: #c9a84c;
          margin-top: 6px;
          flex-shrink: 0;
        }
        .k-nav-right {
          display: flex;
          align-items: center;
          gap: 6px;
          justify-content: flex-end;
        }
        .k-icon-btn {
          width: 38px; height: 38px;
          border-radius: 50%;
          border: none;
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          position: relative;
          text-decoration: none;
          transition: background 0.2s, color 0.25s, text-shadow 0.25s;
        }
        .k-icon-btn:hover {
          background: rgba(201,168,76,0.15);
          color: #c9a84c !important;
          text-shadow: none !important;
        }
        .k-search-wrap { display: flex; align-items: center; position: relative; }
        .k-search-box {
          display: flex;
          align-items: center;
          overflow: hidden;
          height: 34px;
          border: 1px solid transparent;
          border-radius: 2px;
          transition: border-color 0.25s, background 0.25s, width 0.4s ease, opacity 0.3s;
          width: 0;
          opacity: 0;
          pointer-events: none;
        }
        .k-search-box.open {
          width: 160px;
          opacity: 1;
          pointer-events: all;
          margin-right: 6px;
        }
        .k-search-box input {
          border: none;
          outline: none;
          background: transparent;
          font-family: 'Montserrat', sans-serif;
          font-size: 0.58rem;
          letter-spacing: 0.1em;
          padding: 0 12px;
          width: 100%;
          height: 100%;
        }
        .k-divider { width: 1px; height: 18px; margin: 0 2px; transition: background 0.25s; }
        .k-badge {
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
        .k-hamburger {
          display: none;
          flex-direction: column;
          gap: 5px;
          cursor: pointer;
          background: transparent;
          border: none;
          padding: 4px;
        }
        .k-hamburger span {
          display: block;
          width: 22px; height: 1.5px;
          transition: transform 0.3s, opacity 0.3s, background 0.25s;
        }
        .k-hamburger.open span:nth-child(1) { transform: translateY(6.5px) rotate(45deg); }
        .k-hamburger.open span:nth-child(2) { opacity: 0; }
        .k-hamburger.open span:nth-child(3) { transform: translateY(-6.5px) rotate(-45deg); }
        .k-mobile-menu {
          display: none;
          position: fixed;
          top: 72px; left: 0; right: 0;
          background: rgba(10,28,14,0.96);
          backdrop-filter: blur(20px);
          padding: 28px 32px;
          flex-direction: column;
          gap: 24px;
          z-index: 199;
          border-top: 1px solid rgba(201,168,76,0.2);
          animation: slideDown 0.3s ease;
        }
        .k-mobile-menu.open { display: flex; }
        .k-mobile-link {
          font-family: 'Montserrat', sans-serif;
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.8);
          text-decoration: none;
          padding: 8px 0;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          transition: color 0.2s;
        }
        .k-mobile-link:hover { color: #c9a84c; }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 768px) {
          .k-nav-left { display: none; }
          .k-hamburger { display: flex; }
          .k-search-box.open { width: 120px; }
          .k-nav-inner { grid-template-columns: auto 1fr auto; }
          .k-logo { font-size: 1.7rem; justify-content: center; }
        }
        @media (max-width: 480px) {
          .k-nav { padding: 0 16px; }
          .k-nav-inner { height: 60px; }
          .k-mobile-menu { top: 60px; }
        }
      `}</style>

      <nav ref={navRef} className="k-nav" data-theme={theme}>
        <div className="k-nav-inner">
          <div className="k-nav-left">
            <a className="k-link" href="#">Collections</a>
            <a className="k-link" href="#">New In</a>
            <a className="k-link" href="#">Bridal</a>
          </div>

          <a href="/" className="k-logo">
            k<span className="k-logo-dot" />
          </a>

          <div className="k-nav-right">
            <div className="k-search-wrap">
              <div className={`k-search-box${searchOpen ? " open" : ""}`}>
                <input type="text" placeholder="Search jewels…" autoFocus={searchOpen} />
              </div>
              <button
                className="k-icon-btn"
                aria-label="Search"
                onClick={() => setSearchOpen(!searchOpen)}
                style={{ background: "transparent", border: "none" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="7" /><line x1="17" y1="17" x2="21" y2="21" />
                </svg>
              </button>
            </div>

            <div className="k-divider" />

            <a className="k-icon-btn" href="/profile" aria-label="Profile">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
              </svg>
            </a>

            <a className="k-icon-btn" href="/cart" aria-label="Cart">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              {itemCount > 0 && (
                <span className="k-badge">{itemCount > 99 ? "99+" : itemCount}</span>
              )}
            </a>

            <button
              className={`k-hamburger${menuOpen ? " open" : ""}`}
              aria-label="Menu"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </nav>

      <div className={`k-mobile-menu${menuOpen ? " open" : ""}`}>
        <a className="k-mobile-link" href="#">Collections</a>
        <a className="k-mobile-link" href="#">New In</a>
        <a className="k-mobile-link" href="#">Bridal</a>
        <a className="k-mobile-link" href="/profile">Profile</a>
        <a className="k-mobile-link" href="/cart">
          Cart {itemCount > 0 ? `(${itemCount})` : ""}
        </a>
      </div>
    </>
  );
}