"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cartContext";
import { useWishlist } from "@/lib/wishlistContext";
import { useGender } from "@/lib/genderContext";
import { getApiUrl } from "@/lib/api";
import { fetchHomeContent } from "@/lib/catalogApi";
import styles from "./UpperNav.module.css";

/* eslint-disable @typescript-eslint/no-explicit-any */
type SearchResults = { products: any[]; categories: any[]; styles: any[]; combos: any[] };
const EMPTY_RESULTS: SearchResults = { products: [], categories: [], styles: [], combos: [] };

const DEFAULT_ANNOUNCEMENTS = [
  "✦ Free Shipping above ₹999",
  "✦ Custom Jewellery",
  "✦ Free Gifts on all Orders",
];

const POPULAR = [
  { label: "Necklaces", href: "/subcategory/necklaces" },
  { label: "Earrings", href: "/subcategory/earrings" },
  { label: "Rings", href: "/subcategory/rings" },
  { label: "Bracelets", href: "/subcategory/bracelets" },
];

const NAV_LINKS = [
  { href: "/categories", label: "Shop" },
  { href: "/styles", label: "Styles" },
  { href: "/combos", label: "Combos" },
  { href: "/offers", label: "Offers" },
];

/* ── Icons ── */
const Svg = ({ children, size = 18 }: { children: React.ReactNode; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);
const SearchIcon = ({ size }: { size?: number }) => (
  <Svg size={size}><circle cx="11" cy="11" r="7" /><line x1="17" y1="17" x2="21" y2="21" /></Svg>
);
const HeartIcon = () => (
  <Svg><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" /></Svg>
);
const UserIcon = () => (
  <Svg><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></Svg>
);
const BagIcon = () => (
  <Svg><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" /></Svg>
);
const CloseIcon = () => (
  <Svg><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></Svg>
);

/* ── Search results list (shared by desktop dropdown + mobile overlay) ── */
function Results({
  term, loading, results, onNavigate,
}: { term: string; loading: boolean; results: SearchResults | null; onNavigate: () => void }) {
  if (!term.trim()) {
    return (
      <>
        <div className={styles.sectionTitle}>Popular searches</div>
        <div className={styles.chips}>
          {POPULAR.map((p) => (
            <Link key={p.href} href={p.href} className={styles.chip} onClick={onNavigate}>{p.label}</Link>
          ))}
        </div>
      </>
    );
  }
  if (loading) return <div className={styles.message} role="status">Searching…</div>;
  if (!results) return null;

  const any = results.categories.length || results.styles.length || results.products.length || results.combos.length;
  if (!any) return <div className={styles.message}>No matching results found.</div>;

  return (
    <>
      {results.categories.length > 0 && (
        <div>
          <div className={styles.sectionTitle}>Categories</div>
          {results.categories.map((c) => (
            <Link key={c._id} href={`/categories/${c._id}`} className={styles.item} onClick={onNavigate}>
              <span className={styles.itemTitle}>{c.name}</span>
            </Link>
          ))}
        </div>
      )}
      {results.styles.length > 0 && (
        <div>
          <div className={styles.sectionTitle}>Styles</div>
          {results.styles.map((s) => (
            <Link key={s._id} href={`/styles/${s._id}`} className={styles.item} onClick={onNavigate}>
              <span className={styles.itemTitle}>{s.name}</span>
            </Link>
          ))}
        </div>
      )}
      {results.products.length > 0 && (
        <div>
          <div className={styles.sectionTitle}>Products</div>
          {results.products.map((p) => (
            <Link key={p._id} href={`/products/${p._id}`} className={styles.item} onClick={onNavigate}>
              {p.mainImage && (
                <Image src={p.mainImage} alt="" width={46} height={46} className={styles.itemImg} unoptimized />
              )}
              <span className={styles.itemInfo}>
                <span className={styles.itemTitle}>{p.title}</span>
                {p.price && <span className={styles.itemPrice}>₹{p.price}</span>}
              </span>
            </Link>
          ))}
        </div>
      )}
      {results.combos.length > 0 && (
        <div>
          <div className={styles.sectionTitle}>Combos</div>
          {results.combos.map((c) => (
            <Link
              key={c._id}
              href={c.type === "custom" ? `/categories/women/curated-combos?custom=${c._id}` : `/categories/women/curated-combos?combo=${c._id}`}
              className={styles.item}
              onClick={onNavigate}
            >
              {c.image && <Image src={c.image} alt="" width={46} height={46} className={styles.itemImg} unoptimized />}
              <span className={styles.itemInfo}>
                <span className={styles.itemTitle}>{c.name}</span>
                {c.price && <span className={styles.itemPrice}>₹{c.price}</span>}
              </span>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

export default function TopNav() {
  const pathname = usePathname();
  const { itemCount, openDrawer } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { gender, setGender, genders } = useGender();

  const [announcements, setAnnouncements] = useState<string[]>(DEFAULT_ANNOUNCEMENTS);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchFocus, setSearchFocus] = useState(false);
  const [term, setTerm] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);

  const desktopWrapRef = useRef<HTMLDivElement>(null);
  const desktopInputRef = useRef<HTMLInputElement>(null);
  const mobileWrapRef = useRef<HTMLDivElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  const resetSearch = () => {
    setSearchFocus(false);
    setTerm("");
    setResults(null);
    setLoading(false);
    desktopInputRef.current?.blur();
    mobileInputRef.current?.blur();
  };

  /* Announcement items from CMS */
  useEffect(() => {
    let live = true;
    fetchHomeContent()
      .then((hc: any) => {
        if (live && hc?.marqueeItems?.length) setAnnouncements(hc.marqueeItems);
      })
      .catch(() => {});
    return () => { live = false; };
  }, []);

  /* Close menus on route change */
  useEffect(() => {
    setMenuOpen(false);
    setSearchFocus(false);
  }, [pathname]);

  /* Lock scroll + Esc while drawer is open */
  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  /* Close desktop dropdown on outside click / Esc */
  useEffect(() => {
    if (!searchFocus) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!desktopWrapRef.current?.contains(t) && !mobileWrapRef.current?.contains(t)) setSearchFocus(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") resetSearch(); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [searchFocus]);

  /* Debounced search */
  useEffect(() => {
    if (!term.trim()) { setResults(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(getApiUrl(`/products/search?q=${encodeURIComponent(term)}`));
        const data = res.ok ? await res.json() : null;
        if (cancelled) return;
        setResults(data?.success
          ? { products: data.products || [], categories: data.categories || [], styles: data.styles || [], combos: data.combos || [] }
          : EMPTY_RESULTS);
      } catch {
        if (!cancelled) setResults(EMPTY_RESULTS);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 300);
    return () => { cancelled = true; clearTimeout(t); };
  }, [term]);

  const wishlistCount = wishlistItems.length;
  const loop = [...announcements, ...announcements, ...announcements, ...announcements];

  const renderGender = (className = "") => (
    <div className={`${styles.gender} ${className}`} role="group" aria-label="Shop for">
      {genders.map((g) => (
        <button
          key={g.slug}
          type="button"
          className={`${styles.genderBtn}${gender === g.slug ? ` ${styles.genderBtnActive}` : ""}`}
          aria-pressed={gender === g.slug}
          onClick={() => setGender(g.slug)}
        >
          {g.name}
        </button>
      ))}
    </div>
  );

  return (
    <>
      {/* ── Scrolling announcement bar ── */}
      <div className={styles.announce} role="region" aria-label="Announcements">
        <div className={styles.announceTrack}>
          {loop.map((t, i) => (
            <span key={`${i}-${t}`} className={styles.announceItem}>{t}</span>
          ))}
        </div>
      </div>

      {/* ── Main nav ── */}
      <header className={styles.nav}>
        <div className={styles.inner}>
          <div className={styles.left}>
            <button
              type="button"
              className={styles.burger}
              aria-label="Open menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
            >
              <span /><span /><span />
            </button>
          </div>

          <div className={styles.logoWrap}>
            <Link href="/" className={styles.logo}>MAKE YOU SPARKLE</Link>
          </div>

          <nav className={`${styles.links} ${styles.center}`} aria-label="Primary">
            {renderGender(styles.navGender)}
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`${styles.link}${pathname.startsWith(l.href) ? ` ${styles.linkActive}` : ""}`}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className={styles.right}>
            {/* Desktop inline search */}
            <div className={styles.searchWrap} ref={desktopWrapRef}>
              <div className={styles.searchBox}>
                <SearchIcon size={16} />
                <input
                  ref={desktopInputRef}
                  className={styles.searchInput}
                  type="search"
                  placeholder="Search jewellery…"
                  aria-label="Search jewellery"
                  value={term}
                  onFocus={() => setSearchFocus(true)}
                  onChange={(e) => { setTerm(e.target.value); setSearchFocus(true); }}
                />
              </div>
              {searchFocus && (
                <div className={styles.dropdown}>
                  <Results term={term} loading={loading} results={results} onNavigate={resetSearch} />
                </div>
              )}
            </div>

            <Link href="/wishlist" className={`${styles.iconBtn} ${styles.desktopOnly}`} aria-label={`Wishlist${wishlistCount ? `, ${wishlistCount} items` : ""}`}>
              <HeartIcon />
              {wishlistCount > 0 && <span className={styles.badge}>{wishlistCount}</span>}
            </Link>
            <Link href="/profile" className={`${styles.iconBtn} ${styles.desktopOnly}`} aria-label="Account">
              <UserIcon />
            </Link>
            <button type="button" className={styles.iconBtn} onClick={openDrawer} aria-label={`Open cart${itemCount ? `, ${itemCount} items` : ""}`}>
              <BagIcon />
              {itemCount > 0 && <span className={styles.badge}>{itemCount > 99 ? "99+" : itemCount}</span>}
            </button>
          </div>
        </div>

        {/* ── Mobile row: gender + always-open search ── */}
        <div className={styles.mobileBar} ref={mobileWrapRef}>
          {renderGender()}
          <div className={styles.mobileSearch}>
            <SearchIcon size={16} />
            <input
              ref={mobileInputRef}
              className={styles.searchInput}
              type="search"
              placeholder="Search jewellery…"
              aria-label="Search jewellery"
              value={term}
              onFocus={() => setSearchFocus(true)}
              onChange={(e) => { setTerm(e.target.value); setSearchFocus(true); }}
            />
            {searchFocus && (
              <button type="button" className={styles.clearBtn} aria-label="Close search" onClick={resetSearch}>
                <CloseIcon />
              </button>
            )}
          </div>
          {searchFocus && (
            <div className={styles.mobileDropdown}>
              <Results term={term} loading={loading} results={results} onNavigate={resetSearch} />
            </div>
          )}
        </div>
      </header>

      {/* ── Slide-out menu (replaces bottom bar) ── */}
      {menuOpen && (
        <>
          <div className={styles.backdrop} onClick={() => setMenuOpen(false)} />
          <aside className={styles.drawer} role="dialog" aria-modal="true" aria-label="Menu">
            <div className={styles.drawerHead}>
              <Link href="/" className={styles.logo} style={{ fontSize: "1.1rem" }} onClick={() => setMenuOpen(false)}>
                MAKE YOU SPARKLE
              </Link>
              <button type="button" className={styles.iconBtn} aria-label="Close menu" onClick={() => setMenuOpen(false)}>
                <CloseIcon />
              </button>
            </div>

            <div className={styles.drawerBody}>
              <div className={styles.drawerGender}>{renderGender()}</div>

              <div className={styles.drawerGroupTitle}>Shop</div>
              <Link className={styles.drawerLink} href="/" onClick={() => setMenuOpen(false)}>Home</Link>
              <Link className={styles.drawerLink} href="/categories" onClick={() => setMenuOpen(false)}>Categories</Link>
              <Link className={styles.drawerLink} href="/styles" onClick={() => setMenuOpen(false)}>Shop by Style</Link>
              <Link className={styles.drawerLink} href="/combos" onClick={() => setMenuOpen(false)}>Curated Combos</Link>
              <Link className={styles.drawerLink} href="/offers" onClick={() => setMenuOpen(false)}>Offers</Link>

              <div className={styles.drawerGroupTitle}>My Account</div>
              <Link className={styles.drawerLink} href="/wishlist" onClick={() => setMenuOpen(false)}>
                Wishlist {wishlistCount > 0 && <span className={styles.pill}>{wishlistCount}</span>}
              </Link>
              <Link className={styles.drawerLink} href="/profile" onClick={() => setMenuOpen(false)}>Profile &amp; Orders</Link>
              <button type="button" className={styles.drawerLink} onClick={() => { setMenuOpen(false); openDrawer(); }}>
                Cart {itemCount > 0 && <span className={styles.pill}>{itemCount}</span>}
              </button>

              <div className={styles.drawerGroupTitle}>Help</div>
              <Link className={`${styles.drawerLink} ${styles.drawerLinkSmall}`} href="/shipping-policy" onClick={() => setMenuOpen(false)}>Shipping Policy</Link>
              <Link className={`${styles.drawerLink} ${styles.drawerLinkSmall}`} href="/refund-policy" onClick={() => setMenuOpen(false)}>Return &amp; Refund Policy</Link>
              <Link className={`${styles.drawerLink} ${styles.drawerLinkSmall}`} href="/size-guide" onClick={() => setMenuOpen(false)}>Size Guide</Link>
              <Link className={`${styles.drawerLink} ${styles.drawerLinkSmall}`} href="/affiliate" onClick={() => setMenuOpen(false)}>Affiliate</Link>
              <Link className={`${styles.drawerLink} ${styles.drawerLinkSmall}`} href="/contact" onClick={() => setMenuOpen(false)}>Contact Us</Link>
            </div>
          </aside>
        </>
      )}

    </>
  );
}
