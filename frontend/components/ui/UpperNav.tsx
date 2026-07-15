// // "use client";
// // import { useCart } from "@/lib/cartContext";
// // import { useAuth } from "@/lib/authContext";
// // import { useState, useEffect, useRef } from "react";
// // import { useRouter } from "next/navigation";
// // import Link from "next/link";

// // export default function TopNav() {
// //   const { itemCount } = useCart();
// //   const { isAuthenticated, signOut } = useAuth();
// //   const [searchOpen, setSearchOpen] = useState(false);
// //   const [menuOpen, setMenuOpen] = useState(false);
// //   const [theme, setTheme] = useState("dark");
// //   const navRef = useRef<HTMLElement | null>(null);
// //   const router = useRouter();

// //   useEffect(() => {
// //     type RGBA = { r: number; g: number; b: number; a: number };

// //     function parseRgb(str: string): RGBA | null {
// //       const m = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
// //       if (!m) return null;
// //       return {
// //         r: Number(m[1]),
// //         g: Number(m[2]),
// //         b: Number(m[3]),
// //         a: m[4] !== undefined ? Number(m[4]) : 1,
// //       };
// //     }

// //     function relativeLuminance({ r, g, b }: { r: number; g: number; b: number }) {
// //       return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
// //     }

// //     function getComputedBgColor(x: number, y: number): RGBA {
// //       const el = document.elementFromPoint(x, y);
// //       if (!el) return { r: 255, g: 255, b: 255, a: 1 };
// //       let node: HTMLElement | null = el as HTMLElement;
// //       while (node && node !== document.documentElement) {
// //         const bg = getComputedStyle(node).backgroundColor;
// //         const parsed = parseRgb(bg);
// //         if (parsed && parsed.a > 0.05) return parsed;
// //         node = node.parentElement;
// //       }
// //       const bodyBg = parseRgb(getComputedStyle(document.body).backgroundColor);
// //       return bodyBg || { r: 255, g: 255, b: 255, a: 1 };
// //     }

// //     function updateTheme() {
// //       if (!navRef.current) return;
// //       const navH = navRef.current.getBoundingClientRect().height;
// //       const bgColor = getComputedBgColor(window.innerWidth / 2, navH + 4);
// //       const lum = relativeLuminance(bgColor);
// //        setTheme(lum > 0.4 ? "light" : "dark");
// //     }

// //     updateTheme();

// //     let ticking = false;
// //     const onScroll = () => {
// //       if (!ticking) {
// //         requestAnimationFrame(() => {
// //           updateTheme();
// //           ticking = false;
// //         });
// //         ticking = true;
// //       }
// //     };

// //     window.addEventListener("scroll", onScroll, { passive: true });
// //     return () => window.removeEventListener("scroll", onScroll);
// //   }, []);

// //   return (
// //     <>
// //       <style>{`
// //         @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Montserrat:wght@300;400;500;600&display=swap');

// //         /* ── NAV SHELL ── */
// //         .sparkle-nav {
// //           position: fixed;
// //           top: 0; left: 0; right: 0;
// //           z-index: 200;
// //           padding: 0 24px;
// //           background: transparent;
// //           border-bottom: none;
// //           transition: color 0.25s;
// //         }
// //         .sparkle-nav-inner {
// //           max-width: 1280px;
// //           margin: 0 auto;
// //           height: 72px;
// //           display: grid;
// //           grid-template-columns: 1fr auto 1fr;
// //           align-items: center;
// //           gap: 16px;
// //         }

// //         /* ── THEME-AWARE COLOURS ── */
// //         .sparkle-nav[data-theme="light"] .sparkle-logo,
// //         .sparkle-nav[data-theme="light"] .sparkle-icon-btn {
// //           color: #2a2a27;
// //           text-shadow: 0 1px 3px rgba(255,255,255,0.5);
// //         }
// //         .sparkle-nav[data-theme="light"] .sparkle-hamburger span { background: #2a2a27; }
// //         .sparkle-nav[data-theme="light"] .sparkle-divider { background: rgba(42,42,39,0.25); }
// //         .sparkle-nav[data-theme="light"] .sparkle-search-box {
// //           border-color: rgba(42,42,39,0.25);
// //           background: rgba(42,42,39,0.04);
// //         }
// //         .sparkle-nav[data-theme="light"] .sparkle-search-box.open {
// //           border-color: #c9a84c;
// //           background: rgba(201,168,76,0.06);
// //         }
// //         .sparkle-nav[data-theme="light"] .sparkle-search-box input { color: #2a2a27; }
// //         .sparkle-nav[data-theme="light"] .sparkle-search-box input::placeholder { color: rgba(42,42,39,0.45); }

// //         .sparkle-nav[data-theme="dark"] .sparkle-logo,
// //         .sparkle-nav[data-theme="dark"] .sparkle-icon-btn {
// //           color: rgba(255,255,255,0.92);
// //           text-shadow: 0 1px 6px rgba(0,0,0,0.5);
// //         }
// //         .sparkle-nav[data-theme="dark"] .sparkle-hamburger span { background: rgba(255,255,255,0.88); }
// //         .sparkle-nav[data-theme="dark"] .sparkle-divider { background: rgba(255,255,255,0.22); }
// //         .sparkle-nav[data-theme="dark"] .sparkle-search-box {
// //           border-color: rgba(255,255,255,0.22);
// //           background: rgba(255,255,255,0.06);
// //         }
// //         .sparkle-nav[data-theme="dark"] .sparkle-search-box.open {
// //           border-color: #c9a84c;
// //           background: rgba(201,168,76,0.08);
// //         }
// //         .sparkle-nav[data-theme="dark"] .sparkle-search-box input { color: #fff; }
// //         .sparkle-nav[data-theme="dark"] .sparkle-search-box input::placeholder { color: rgba(255,255,255,0.45); }

// //         /* ── LOGO ── */
// //         .sparkle-logo {
// //           font-family: 'Cormorant Garamond', serif;
// //           font-size: 1.15rem;
// //           font-weight: 700;
// //           text-decoration: none;
// //           letter-spacing: 0.08em;
// //           display: flex;
// //           align-items: center;
// //           white-space: nowrap;
// //           transition: color 0.25s, text-shadow 0.25s;
// //           text-transform: uppercase;
// //         }

// //         /* ── RIGHT ICONS ── */
// //         .sparkle-nav-right {
// //           display: flex;
// //           align-items: center;
// //           gap: 6px;
// //           justify-content: flex-end;
// //         }
// //         .sparkle-icon-btn {
// //           width: 38px; height: 38px;
// //           border-radius: 50%;
// //           border: none;
// //           background: transparent;
// //           display: flex;
// //           align-items: center;
// //           justify-content: center;
// //           cursor: pointer;
// //           position: relative;
// //           text-decoration: none;
// //           transition: background 0.2s, color 0.25s, text-shadow 0.25s;
// //         }
// //         .sparkle-icon-btn:hover {
// //           background: rgba(201,168,76,0.15);
// //           color: #c9a84c !important;
// //           text-shadow: none !important;
// //         }

// //         /* ── SEARCH ── */
// //         .sparkle-search-wrap { display: flex; align-items: center; position: relative; }
// //         .sparkle-search-box {
// //           display: flex;
// //           align-items: center;
// //           overflow: hidden;
// //           height: 34px;
// //           border: 1px solid transparent;
// //           border-radius: 2px;
// //           transition: border-color 0.25s, background 0.25s, width 0.4s ease, opacity 0.3s;
// //           width: 0;
// //           opacity: 0;
// //           pointer-events: none;
// //         }
// //         .sparkle-search-box.open {
// //           width: 160px;
// //           opacity: 1;
// //           pointer-events: all;
// //           margin-right: 6px;
// //         }
// //         .sparkle-search-box input {
// //           border: none;
// //           outline: none;
// //           background: transparent;
// //           font-family: 'Montserrat', sans-serif;
// //           font-size: 0.58rem;
// //           letter-spacing: 0.1em;
// //           padding: 0 12px;
// //           width: 100%;
// //           height: 100%;
// //         }
// //         .sparkle-divider { width: 1px; height: 18px; margin: 0 2px; transition: background 0.25s; }
// //         .sparkle-badge {
// //           position: absolute;
// //           top: 4px; right: 4px;
// //           width: 14px; height: 14px;
// //           border-radius: 50%;
// //           background: #c9a84c;
// //           font-size: 0.42rem;
// //           font-weight: 700;
// //           color: #1a1a1a;
// //           display: flex;
// //           align-items: center;
// //           justify-content: center;
// //           font-family: 'Montserrat', sans-serif;
// //         }

// //         /* ── HAMBURGER (Global Visible) ── */
// //         .sparkle-hamburger {
// //           display: flex;
// //           flex-direction: column;
// //           gap: 5px;
// //           cursor: pointer;
// //           background: transparent;
// //           border: none;
// //           padding: 4px;
// //           justify-self: start;
// //         }
// //         .sparkle-hamburger span {
// //           display: block;
// //           width: 22px; height: 1.5px;
// //           transition: transform 0.3s, opacity 0.3s, background 0.25s;
// //         }
// //         .sparkle-hamburger.open span:nth-child(1) { transform: translateY(6.5px) rotate(45deg); }
// //         .sparkle-hamburger.open span:nth-child(2) { opacity: 0; }
// //         .sparkle-hamburger.open span:nth-child(3) { transform: translateY(-6.5px) rotate(-45deg); }

// //         /* ── CLAMPED DROP-DOWN MENU ── */
// //         .sparkle-menu-dropdown {
// //           display: none;
// //           position: fixed;
// //           top: 72px; left: 0; right: 0;
// //           background: rgba(10,28,14,0.96);
// //           backdrop-filter: blur(20px);
// //           padding: 24px 32px;
// //           flex-direction: column;
// //           gap: 0;
// //           z-index: 199;
// //           border-top: 1px solid rgba(201,168,76,0.2);
// //           animation: slideDown 0.3s ease;
// //           max-height: calc(100vh - 72px);
// //           overflow-y: auto;
// //         }
// //         .sparkle-menu-dropdown.open { display: flex; }
// //         .sparkle-menu-link {
// //           font-family: 'Montserrat', sans-serif;
// //           font-size: 0.7rem;
// //           font-weight: 600;
// //           letter-spacing: 0.22em;
// //           text-transform: uppercase;
// //           color: rgba(255,255,255,0.8);
// //           text-decoration: none;
// //           padding: 14px 0;
// //           border-bottom: 1px solid rgba(255,255,255,0.08);
// //           transition: color 0.2s;
// //           display: block;
// //         }
// //         .sparkle-menu-link:hover { color: #c9a84c; }

// //         /* ── POLICY LINKS ── */
// //         .sparkle-policy-group {
// //           display: flex;
// //           flex-direction: column;
// //           gap: 0;
// //           margin-top: 12px;
// //           border-top: 1px solid rgba(201,168,76,0.18);
// //           padding-top: 8px;
// //         }
// //         .sparkle-policy-link {
// //           font-family: 'Montserrat', sans-serif;
// //           font-size: 0.65rem;
// //           font-weight: 500;
// //           letter-spacing: 0.18em;
// //           text-transform: uppercase;
// //           color: rgba(255,255,255,0.6);
// //           text-decoration: none;
// //           padding: 12px 0;
// //           border-bottom: 1px solid rgba(255,255,255,0.05);
// //           transition: color 0.2s;
// //           display: block;
// //           cursor: pointer;
// //           background: none;
// //           border-left: none;
// //           border-right: none;
// //           border-top: none;
// //           text-align: left;
// //           width: 100%;
// //         }
// //         .sparkle-policy-link:hover { color: #c9a84c; }
// //         .sparkle-policy-link:last-child { border-bottom: none; }

// //         @keyframes slideDown {
// //           from { opacity: 0; transform: translateY(-12px); }
// //           to   { opacity: 1; transform: translateY(0); }
// //         }

// //         /* ── RESPONSIVE BREAKPOINTS ── */
// //         @media (max-width: 768px) {
// //           .sparkle-logo { font-size: 0.95rem; }
// //           .sparkle-search-box.open { width: 110px; }
// //         }
// //         @media (max-width: 480px) {
// //           .sparkle-nav { padding: 0 12px; }
// //           .sparkle-nav-inner { height: 60px; gap: 4px; }
// //           .sparkle-menu-dropdown { top: 60px; max-height: calc(100vh - 60px); }
// //           .sparkle-logo { font-size: 0.85rem; }
// //           .sparkle-search-box.open { width: 90px; }
// //         }
// //       `}</style>

// //       {/* ── MAIN NAV BAR ── */}
// //       <nav ref={navRef} className="sparkle-nav" data-theme={theme}>
// //         <div className="sparkle-nav-inner">

// //           {/* LEFT: Globally Available Hamburger Menu Trigger */}
// //           <button
// //             className={`sparkle-hamburger${menuOpen ? " open" : ""}`}
// //             aria-label="Navigation Menu"
// //             onClick={() => setMenuOpen(!menuOpen)}
// //           >
// //             <span /><span /><span />
// //           </button>

// //           {/* CENTER: Clean Text Logo */}
// //           {/* <Link href="/" className="sparkle-logo">
// //             Make Us Sparkle
// //           </Link> */}

// //           {/* RIGHT: Global Utilities (Search, Profile, Cart Icons) */}
// //           <div className="sparkle-nav-right">
// //             <div className="sparkle-search-wrap">
// //               <div className={`sparkle-search-box${searchOpen ? " open" : ""}`}>
// //                 <input type="text" placeholder="Search jewels…" autoFocus={searchOpen} />
// //               </div>
// //               <button
// //                 className="sparkle-icon-btn"
// //                 aria-label="Search"
// //                 onClick={() => setSearchOpen(!searchOpen)}
// //               >
// //                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
// //                   <circle cx="11" cy="11" r="7" /><line x1="17" y1="17" x2="21" y2="21" />
// //                 </svg>
// //               </button>
// //             </div>

// //             <div className="sparkle-divider" />

// //             <Link className="sparkle-icon-btn" href="/profile" aria-label="Profile">
// //               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
// //                 <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
// //               </svg>
// //             </Link>

// //             <Link className="sparkle-icon-btn" href="/cart" aria-label="Cart">
// //               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
// //                 <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
// //                 <line x1="3" y1="6" x2="21" y2="6" />
// //                 <path d="M16 10a4 4 0 01-8 0" />
// //               </svg>
// //               {itemCount > 0 && (
// //                 <span className="sparkle-badge">{itemCount > 99 ? "99+" : itemCount}</span>
// //               )}
// //             </Link>
// //           </div>

// //         </div>
// //       </nav>

// //       {/* ── THE CLAMPED THREE-LINE DROPDOWN MENU ── */}
// //       <div className={`sparkle-menu-dropdown${menuOpen ? " open" : ""}`}>
// //         {/* Core Store Links */}
// //         <Link className="sparkle-menu-link" href="/collections" onClick={() => setMenuOpen(false)}>Collections</Link>
// //         <Link className="sparkle-menu-link" href="/new-in" onClick={() => setMenuOpen(false)}>New In</Link>
// //         <Link className="sparkle-menu-link" href="/bridal" onClick={() => setMenuOpen(false)}>Bridal</Link>

// //         {/* Requested Specialized and Policy Content Links */}
// //         <div className="sparkle-policy-group">
// //           <Link 
// //             className="sparkle-policy-link" 
// //             href="/shipping-policy" 
// //             onClick={() => setMenuOpen(false)}
// //           >
// //             Shipping Policy
// //           </Link>

// //           <Link 
// //             className="sparkle-policy-link" 
// //             href="/refund-policy" 
// //             onClick={() => setMenuOpen(false)}
// //           >
// //             Return &amp; Refund Policy
// //           </Link>

// //           <Link 
// //             className="sparkle-policy-link" 
// //             href="/affiliate" 
// //             onClick={() => setMenuOpen(false)}
// //           >
// //             Affiliate
// //           </Link>

// //           <button
// //             className="sparkle-policy-link"
// //             onClick={() => {
// //               setMenuOpen(false);
// //               document.getElementById("footer")?.scrollIntoView({ behavior: "smooth" });
// //             }}
// //           >
// //             Contact Us
// //           </button>
// //         </div>
// //       </div>
// //     </>
// //   );
// // }



// "use client";
// import { useCart } from "@/lib/cartContext";
// import { useAuth } from "@/lib/authContext";
// import { useState, useEffect, useRef } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";
// import Image from "next/image";
// import { getApiUrl } from "@/lib/api";

// export default function TopNav() {
//   const { itemCount } = useCart();
//   const { isAuthenticated, signOut } = useAuth();
//   const [menuOpen, setMenuOpen] = useState(false);
//   const theme = "light"; // Constant theme
//   const navRef = useRef<HTMLElement | null>(null);
//   const searchDropdownRef = useRef<HTMLDivElement>(null);
//   const router = useRouter();

//   // Search State
//   const [searchTerm, setSearchTerm] = useState("");
//   const [searchResults, setSearchResults] = useState<{ products: any[], categories: any[], styles: any[] } | null>(null);
//   const [isSearching, setIsSearching] = useState(false);
//   const [showDropdown, setShowDropdown] = useState(false);

//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target as Node)) {
//         setShowDropdown(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   useEffect(() => {
//     if (!searchTerm.trim()) {
//       setSearchResults(null);
//       setShowDropdown(false);
//       return;
//     }

//     setShowDropdown(true);
//     setIsSearching(true);

//     const timer = setTimeout(async () => {
//       try {
//         const url = getApiUrl(`/products/search?q=${encodeURIComponent(searchTerm)}`);
//         const res = await fetch(url);
//         if (res.ok) {
//           const data = await res.json();
//           if (data.success) {
//             setSearchResults({
//               products: data.products || [],
//               categories: data.categories || [],
//               styles: data.styles || [],
//             });
//             return;
//           }
//         }
//         setSearchResults({ products: [], categories: [], styles: [] });
//       } catch (error) {
//         console.error("Search error:", error);
//         setSearchResults({ products: [], categories: [], styles: [] });
//       } finally {
//         setIsSearching(false);
//       }
//     }, 300);

//     return () => clearTimeout(timer);
//   }, [searchTerm]);

//   // Removed dynamic scroll theme logic as nav is now constant and sticky

//   return (
//     <>
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Montserrat:wght@300;400;500;600&display=swap');

//         /* ── NAV SHELL ── */
//         .sparkle-nav {
//           position: sticky;
//           top: 0; left: 0; right: 0;
//           z-index: 200;
//           padding: 0 24px;
//           background: rgba(255, 255, 255, 0.98);
//           backdrop-filter: blur(12px);
//           -webkit-backdrop-filter: blur(12px);
//           border-bottom: 1px solid rgba(0, 0, 0, 0.08);
//           transition: color 0.25s;
//         }
//         .sparkle-nav-inner {
//           max-width: 1280px;
//           margin: 0 auto;
//           height: 72px;
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           gap: 16px;
//           width: 100%;
//         }

//         /* ── THEME-AWARE COLOURS ── */
//         .sparkle-nav[data-theme="light"] .sparkle-icon-btn {
//           color: #2a2a27;
//           text-shadow: 0 1px 3px rgba(255,255,255,0.5);
//         }
//         .sparkle-nav[data-theme="light"] .sparkle-hamburger span { background: #2a2a27; }
//         .sparkle-nav[data-theme="light"] .sparkle-divider { background: rgba(42,42,39,0.25); }
//         .sparkle-nav[data-theme="light"] .sparkle-search-box {
//           border-color: rgba(42,42,39,0.25);
//           background: rgba(42,42,39,0.04);
//         }
//         .sparkle-nav[data-theme="light"] .sparkle-search-box:focus-within {
//           border-color: #c9a84c;
//           background: rgba(201,168,76,0.06);
//         }
//         .sparkle-nav[data-theme="light"] .sparkle-search-box input { color: #2a2a27; }
//         .sparkle-nav[data-theme="light"] .sparkle-search-box input::placeholder { color: rgba(42,42,39,0.45); }

//         .sparkle-nav[data-theme="dark"] .sparkle-icon-btn {
//           color: rgba(255,255,255,0.92);
//           text-shadow: 0 1px 6px rgba(0,0,0,0.5);
//         }
//         .sparkle-nav[data-theme="dark"] .sparkle-hamburger span { background: rgba(255,255,255,0.88); }
//         .sparkle-nav[data-theme="dark"] .sparkle-divider { background: rgba(255,255,255,0.22); }
//         .sparkle-nav[data-theme="dark"] .sparkle-search-box {
//           border-color: rgba(255,255,255,0.22);
//           background: rgba(255,255,255,0.06);
//         }
//         .sparkle-nav[data-theme="dark"] .sparkle-search-box:focus-within {
//           border-color: #c9a84c;
//           background: rgba(201,168,76,0.08);
//         }
//         .sparkle-nav[data-theme="dark"] .sparkle-search-box input { color: #fff; }
//         .sparkle-nav[data-theme="dark"] .sparkle-search-box input::placeholder { color: rgba(255,255,255,0.45); }

//         /* ── RIGHT UTILITIES & SEARCH ── */
//        .sparkle-nav-right {
//   display: flex;
//   align-items: center;
//   gap: 8px;
//   flex: 1;
//   min-width: 0;        /* allows children to shrink below content size */
//   justify-content: flex-end;
// }
// .sparkle-search-wrap {
//   display: flex;
//   align-items: center;
//   position: relative;
//   flex: 1;
//   min-width: 0;
//   max-width: 220px; /* desktop cap */
// }
// .sparkle-search-box {
//   display: flex;
//   align-items: center;
//   overflow: hidden;
//   height: 36px;
//   border: 1px solid transparent;
//   border-radius: 4px;
//   transition: border-color 0.25s, background 0.25s, width 0.3s ease;
//   width: 100%;       /* fills its wrapper instead of fixed px */
//   min-width: 0;
// }
// .sparkle-search-box input {
//   border: none;
//   outline: none;
//   background: transparent;
//   font-family: 'Montserrat', sans-serif;
//   font-size: 0.7rem;
//   letter-spacing: 0.05em;
//   padding: 0 12px;
//   width: 100%;
//   height: 100%;
//   min-width: 0;
// }
//         .sparkle-search-icon-inline {
//           display: flex;
//           align-items: center;
//           padding-right: 10px;
//           color: inherit;
//           opacity: 0.7;
//         }
        
// .sparkle-icon-btn {
//   width: 38px;
//   height: 38px;
//   border-radius: 50%;
//   border: none;
//   background: transparent;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   cursor: pointer;
//   position: relative;
//   text-decoration: none;
//   transition: background 0.2s, color 0.25s, text-shadow 0.25s;
//   flex-shrink: 0;
// }
//         .sparkle-icon-btn:hover {
//           background: rgba(201,168,76,0.15);
//           color: #c9a84c !important;
//           text-shadow: none !important;
//         }

// .sparkle-divider {
//   width: 1px;
//   height: 18px;
//   margin: 0 4px;
//   transition: background 0.25s;
//   flex-shrink: 0;
// }
//           .sparkle-badge {
//           position: absolute;
//           top: 4px; right: 4px;
//           width: 14px; height: 14px;
//           border-radius: 50%;
//           background: #c9a84c;
//           font-size: 0.42rem;
//           font-weight: 700;
//           color: #1a1a1a;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           font-family: 'Montserrat', sans-serif;
//         }

//         /* ── HAMBURGER ── */
//         .sparkle-hamburger { 
//           display: flex;
//           flex-direction: column;
//           gap: 5px;
//           cursor: pointer;
//           background: transparent;
//           border: none;
//           padding: 4px;
//         }
//         .sparkle-hamburger span {
//           display: block;
//           width: 22px; height: 1.5px;
//           transition: transform 0.3s, opacity 0.3s, background 0.25s;
//         }
//         .sparkle-hamburger.open span:nth-child(1) { transform: translateY(6.5px) rotate(45deg); }
//         .sparkle-hamburger.open span:nth-child(2) { opacity: 0; }
//         .sparkle-hamburger.open span:nth-child(3) { transform: translateY(-6.5px) rotate(-45deg); }

//         /* ── CLAMPED DROP-DOWN MENU ── */
//         .sparkle-menu-dropdown {
//           display: none;
//           position: fixed;
//           top: 72px; left: 0; right: 0;
//           background: #c8dfc0;
//           backdrop-filter: blur(20px);
//           padding: 16px 32px 24px 32px;
//           flex-direction: column;
//           gap: 0;
//           z-index: 199;
//           border-top: 1px solid rgba(201,168,76,0.2);
//           animation: slideDown 0.3s ease;
//           max-height: calc(100vh - 72px);
//           overflow-y: auto;
//         }
//         .sparkle-menu-dropdown.open { display: flex; }

//         /* ── POLICY LINKS ── */
//         .sparkle-policy-group {
//           display: flex;
//           flex-direction: column;
//           gap: 0;
//         }
//         .sparkle-policy-link {
//           font-family: 'Montserrat', sans-serif;
//           font-size: 0.65rem;
//           font-weight: 500;
//           letter-spacing: 0.18em;
//           text-transform: uppercase;
//           color: #101010;
//           text-decoration: none;
//           padding: 14px 0;
//           border-bottom: 1px solid rgba(255,255,255,0.05);
//           transition: color 0.2s;
//           display: block;
//           cursor: pointer;
//           background: none;
//           border-left: none;
//           border-right: none;
//           border-top: none;
//           text-align: left;
//           width: 100%;
//         }
//         .sparkle-policy-link:hover { color: #c9a84c; }
//         .sparkle-policy-link:last-child { border-bottom: none; }

//         @keyframes slideDown {
//           from { opacity: 0; transform: translateY(-12px); }
//           to   { opacity: 1; transform: translateY(0); }
//         }

//         /* ── SEARCH DROPDOWN ── */
//         .sparkle-search-dropdown {
//           position: absolute;
//           top: 100%;
//           right: 0;
//           width: 340px;
//           max-height: 450px;
//           overflow-y: auto;
//           background: #f1f4f0;
//           backdrop-filter: blur(20px);
//           border: 1px solid rgba(201,168,76,0.3);
//           border-radius: 4px;
//           margin-top: 10px;
//           padding: 8px 0;
//           display: flex;
//           flex-direction: column;
//           z-index: 201;
//           box-shadow: 0 4px 24px rgba(0,0,0,0.4);
//           animation: slideDown 0.2s ease forwards;
//         }
//         .sparkle-search-section-title {
//           font-family: 'Montserrat', sans-serif;
//           font-size: 0.65rem;
//           font-weight: 600;
//           color: #c9a84c;
//           letter-spacing: 0.1em;
//           text-transform: uppercase;
//           padding: 12px 16px 6px 16px;
//           border-bottom: 1px solid rgba(255,255,255,0.05);
//           margin-bottom: 4px;
//         }
//         .sparkle-search-item {
//           display: flex;
//           align-items: center;
//           gap: 12px;
//           padding: 8px 16px;
//           color: #101010;
//           text-decoration: none;
//           transition: background 0.2s, color 0.2s;
//         }
//         .sparkle-search-item:hover {
//           background: rgba(255, 255, 255, 0.4);
//           color: #101010;
//         }
//         .sparkle-search-item-img {
//           width: 32px;
//           height: 32px;
//           border-radius: 4px;
//           object-fit: cover;
//           background: rgba(255,255,255,0.1);
//         }
//         .sparkle-search-item-info {
//           display: flex;
//           flex-direction: column;
//           flex: 1;
//           overflow: hidden;
//         }
//         .sparkle-search-item-title {
//           font-family: 'Montserrat', sans-serif;
//           font-size: 0.75rem;
//           white-space: nowrap;
//           overflow: hidden;
//           text-overflow: ellipsis;
//         }
//         .sparkle-search-item-price {
//           font-family: 'Montserrat', sans-serif;
//           font-size: 0.65rem;
//           color: #c9a84c;
//           margin-top: 2px;
//         }
//         .sparkle-search-message {
//           padding: 16px;
//           text-align: center;
//           font-family: 'Montserrat', sans-serif;
//           font-size: 0.75rem;
//           color: #101010;
//         }

//         /* ── RESPONSIVE BREAKPOINTS ── */
//         /* ── TABLET ── */
// @media (max-width: 768px) {
//   .sparkle-search-wrap { max-width: 160px; }
// }

// /* ── MOBILE ── */
// @media (max-width: 480px) {
//   .sparkle-nav { padding: 0 16px; }
//   .sparkle-nav-inner { height: 64px; gap: 8px; }
//   .sparkle-menu-dropdown { top: 64px; max-height: calc(100vh - 64px); }
//   .sparkle-search-wrap { max-width: 130px; }
//   .sparkle-search-box { height: 32px; }
//   .sparkle-search-box input { padding: 0 8px; font-size: 0.65rem; }
//   .sparkle-search-dropdown { width: 280px; right: -40px; }
//   .sparkle-search-icon-inline { padding-right: 6px; }
//   .sparkle-search-icon-inline svg { width: 14px; height: 14px; }
//   .sparkle-icon-btn { width: 34px; height: 34px; }
//   .sparkle-divider { margin: 0 2px; }
// }

// /* ── EXTRA SMALL (≤360px) ── */
// @media (max-width: 360px) {
//   .sparkle-nav { padding: 0 10px; }
//   .sparkle-nav-inner { gap: 4px; }
//   .sparkle-search-wrap { max-width: 95px; }
//   .sparkle-search-box input { padding: 0 6px; font-size: 0.6rem; }
//   .sparkle-icon-btn { width: 30px; height: 30px; }
//   .sparkle-icon-btn svg { width: 14px; height: 14px; }
//   .sparkle-divider { margin: 0 1px; }
// }
//       `}</style>

//       {/* ── MAIN NAV BAR ── */}
//       <nav ref={navRef} className="sparkle-nav" data-theme={theme}>
//         <div className="sparkle-nav-inner">

//           {/* LEFT: Hamburger Menu Trigger */}
//           <button
//             className={`sparkle-hamburger${menuOpen ? " open" : ""}`}
//             aria-label="Navigation Menu"
//             onClick={() => setMenuOpen(!menuOpen)}
//           >
//             <span />
//             <span />
//             <span />
//           </button>

//           {/* RIGHT: Combined Utilities (Inline Search, Profile, Cart) */}
//           <div className="sparkle-nav-right">
//             <div className="sparkle-search-wrap" ref={searchDropdownRef}>
//               <div className="sparkle-search-box">
//                 <input
//                   type="text"
//                   placeholder="Search jewels…"
//                   aria-label="Search jewels"
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   onFocus={() => {
//                     if (searchTerm.trim()) setShowDropdown(true);
//                   }}
//                 />
//                 <div className="sparkle-search-icon-inline">
//                   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
//                     <circle cx="11" cy="11" r="7" />
//                     <line x1="17" y1="17" x2="21" y2="21" />
//                   </svg>
//                 </div>
//               </div>

//               {/* SEARCH DROPDOWN */}
//               {showDropdown && (isSearching || searchResults) && (
//                 <div className="sparkle-search-dropdown">
//                   {isSearching ? (
//                     <div className="sparkle-search-message">Searching...</div>
//                   ) : searchResults ? (
//                     <>
//                       {/* Categories */}
//                       {searchResults.categories.length > 0 && (
//                         <div>
//                           <div className="sparkle-search-section-title">Categories</div>
//                           {searchResults.categories.map((cat) => (
//                             <Link
//                               key={cat._id}
//                               href={`/categories/${cat._id}`}
//                               className="sparkle-search-item"
//                               onClick={() => setShowDropdown(false)}
//                             >
//                               <div className="sparkle-search-item-info">
//                                 <span className="sparkle-search-item-title">{cat.name}</span>
//                               </div>
//                             </Link>
//                           ))}
//                         </div>
//                       )}

//                       {/* Styles */}
//                       {searchResults.styles.length > 0 && (
//                         <div>
//                           <div className="sparkle-search-section-title">Styles</div>
//                           {searchResults.styles.map((style) => (
//                             <Link
//                               key={style._id}
//                               href={`/styles/${style._id}`}
//                               className="sparkle-search-item"
//                               onClick={() => setShowDropdown(false)}
//                             >
//                               <div className="sparkle-search-item-info">
//                                 <span className="sparkle-search-item-title">{style.name}</span>
//                               </div>
//                             </Link>
//                           ))}
//                         </div>
//                       )}

//                       {/* Products */}
//                       {searchResults.products.length > 0 && (
//                         <div>
//                           <div className="sparkle-search-section-title">Products</div>
//                           {searchResults.products.map((product) => (
//                             <Link
//                               key={product._id}
//                               href={`/products/${product._id}`}
//                               className="sparkle-search-item"
//                               onClick={() => setShowDropdown(false)}
//                             >
//                               {product.mainImage && (
//                                 <Image
//                                   src={product.mainImage}
//                                   alt={product.title}
//                                   width={32} height={32}
//                                   className="sparkle-search-item-img"
//                                 />
//                               )}
//                               <div className="sparkle-search-item-info">
//                                 <span className="sparkle-search-item-title">{product.title}</span>
//                                 {product.price && (
//                                   <span className="sparkle-search-item-price">₹{product.price}</span>
//                                 )}
//                               </div>
//                             </Link>
//                           ))}
//                         </div>
//                       )}

//                       {/* No Results */}
//                       {searchResults.categories.length === 0 && searchResults.styles.length === 0 && searchResults.products.length === 0 && (
//                         <div className="sparkle-search-message">No matching results found.</div>
//                       )}
//                     </>
//                   ) : null}
//                 </div>
//               )}
//             </div>

//             <div className="sparkle-divider" />

//             <Link className="sparkle-icon-btn" href="/profile" aria-label="Profile">
//               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
//                 <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
//                 <circle cx="12" cy="7" r="4" />
//               </svg>
//             </Link>

//             <Link className="sparkle-icon-btn" href="/cart" aria-label="Cart">
//               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
//                 <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
//                 <line x1="3" y1="6" x2="21" y2="6" />
//                 <path d="M16 10a4 4 0 01-8 0" />
//               </svg>
//               {itemCount > 0 && (
//                 <span className="sparkle-badge">{itemCount > 99 ? "99+" : itemCount}</span>
//               )}
//             </Link>
//           </div>

//         </div>
//       </nav>

//       {/* ── DROPDOWN MENU (Policies Only) ── */}
//       <div className={`sparkle-menu-dropdown${menuOpen ? " open" : ""}`}>
//         <div className="sparkle-policy-group">
//           <Link
//             className="sparkle-policy-link"
//             href="/categories"
//             onClick={() => setMenuOpen(false)}
//           >
//             Categories
//           </Link>
//           <Link
//             className="sparkle-policy-link"
//             href="/shipping-policy"
//             onClick={() => setMenuOpen(false)}
//           >
//             Shipping Policy
//           </Link>

//           <Link
//             className="sparkle-policy-link"
//             href="/refund-policy"
//             onClick={() => setMenuOpen(false)}
//           >
//             Return &amp; Refund Policy
//           </Link>

//           <Link
//             className="sparkle-policy-link"
//             href="/affiliate"
//             onClick={() => setMenuOpen(false)}
//           >
//             Affiliate
//           </Link>
          
//           <button
//             className="sparkle-policy-link"
//             onClick={() => {
//               setMenuOpen(false);
//               document.getElementById("footer")?.scrollIntoView({ behavior: "smooth" });
//             }}
//           >
//             Contact Us
//           </button>
//         </div>
//       </div>
//     </>
//   );
// }


"use client";
import { useCart } from "@/lib/cartContext";
import { useAuth } from "@/lib/authContext";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getApiUrl } from "@/lib/api";

export default function TopNav() {
  const { itemCount } = useCart();
  const { isAuthenticated, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const theme = "light";
  const navRef = useRef<HTMLElement | null>(null);
  const searchDropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<{ products: any[]; categories: any[]; styles: any[] } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Close search dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
        setSearchOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus input when search opens
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  // Debounced search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults(null);
      setShowDropdown(false);
      return;
    }

    setShowDropdown(true);
    setIsSearching(true);

    const timer = setTimeout(async () => {
      try {
        const url = getApiUrl(`/products/search?q=${encodeURIComponent(searchTerm)}`);
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setSearchResults({
              products: data.products || [],
              categories: data.categories || [],
              styles: data.styles || [],
            });
            return;
          }
        }
        setSearchResults({ products: [], categories: [], styles: [] });
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults({ products: [], categories: [], styles: [] });
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSearchIconClick = () => {
    if (searchOpen && !searchTerm.trim()) {
      setSearchOpen(false);
    } else {
      setSearchOpen(true);
    }
  };

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

        /* ── LEFT: Hamburger ── */
        .sparkle-nav-left {
          display: flex;
          align-items: center;
          justify-content: flex-start;
        }

        /* ── CENTER: Logo ── */
        .sparkle-nav-center {
          display: flex;
          align-items: center;
          justify-content: center;
        }
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

        /* ── RIGHT: Search icon + Cart ── */
        .sparkle-nav-right {
          display: flex;
          align-items: center;
          gap: 4px;
          justify-content: flex-end;
          position: relative;
        }

        /* Search flyout container */
        .sparkle-search-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        /* Expanding search box */
        .sparkle-search-box {
          display: flex;
          align-items: center;
          overflow: hidden;
          height: 36px;
          border: 1px solid transparent;
          border-radius: 4px;
          transition: border-color 0.25s, background 0.25s, width 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.25s;
          width: 0;
          opacity: 0;
          pointer-events: none;
        }
        .sparkle-search-box.open {
          width: 180px;
          opacity: 1;
          pointer-events: all;
          border-color: rgba(42,42,39,0.25);
          background: rgba(42,42,39,0.04);
          margin-right: 4px;
        }
        .sparkle-search-box.open:focus-within {
          border-color: #c9a84c;
          background: rgba(201,168,76,0.06);
        }
        .sparkle-search-box input {
          border: none;
          outline: none;
          background: transparent;
          font-family: 'Montserrat', sans-serif;
          font-size: 0.68rem;
          letter-spacing: 0.05em;
          color: #2a2a27;
          padding: 0 12px;
          width: 100%;
          height: 100%;
        }
        .sparkle-search-box input::placeholder { color: rgba(42,42,39,0.45); }

        /* Icon button (search + cart) */
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
        .sparkle-icon-btn:hover {
          background: rgba(201,168,76,0.15);
          color: #c9a84c;
        }
        .sparkle-icon-btn.active {
          color: #c9a84c;
        }

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

        /* ── SEARCH DROPDOWN ── */
        .sparkle-search-dropdown {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          width: 340px;
          max-height: 450px;
          overflow-y: auto;
          background: #f1f4f0;
          border: 1px solid rgba(201,168,76,0.3);
          border-radius: 4px;
          padding: 8px 0;
          display: flex;
          flex-direction: column;
          z-index: 201;
          box-shadow: 0 4px 24px rgba(0,0,0,0.15);
          animation: slideDown 0.2s ease forwards;
        }
        .sparkle-search-section-title {
          font-family: 'Montserrat', sans-serif;
          font-size: 0.65rem;
          font-weight: 600;
          color: #c9a84c;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 12px 16px 6px 16px;
          border-bottom: 1px solid rgba(0,0,0,0.06);
          margin-bottom: 4px;
        }
        .sparkle-search-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 16px;
          color: #101010;
          text-decoration: none;
          transition: background 0.2s;
        }
        .sparkle-search-item:hover { background: rgba(255,255,255,0.6); }
        .sparkle-search-item-img {
          width: 32px; height: 32px;
          border-radius: 4px;
          object-fit: cover;
          background: rgba(0,0,0,0.06);
        }
        .sparkle-search-item-info {
          display: flex;
          flex-direction: column;
          flex: 1;
          overflow: hidden;
        }
        .sparkle-search-item-title {
          font-family: 'Montserrat', sans-serif;
          font-size: 0.75rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          color: #101010;
        }
        .sparkle-search-item-price {
          font-family: 'Montserrat', sans-serif;
          font-size: 0.65rem;
          color: #c9a84c;
          margin-top: 2px;
        }
        .sparkle-search-message {
          padding: 16px;
          text-align: center;
          font-family: 'Montserrat', sans-serif;
          font-size: 0.75rem;
          color: #101010;
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 768px) {
          .sparkle-search-box.open { width: 140px; }
          .sparkle-logo { font-size: 1.45rem; letter-spacing: 0.12em; }
        }
        @media (max-width: 480px) {
          .sparkle-nav { padding: 0 16px; }
          .sparkle-nav-inner { height: 64px; gap: 8px; }
          .sparkle-menu-dropdown { top: 64px; max-height: calc(100vh - 64px); }
          .sparkle-logo { font-size: 1.05rem; letter-spacing: 0.1em; }
          .sparkle-search-box.open { width: 110px; }
          .sparkle-search-dropdown { width: 260px; }
          .sparkle-icon-btn { width: 34px; height: 34px; }
        }
        @media (max-width: 360px) {
          .sparkle-nav { padding: 0 10px; }
          .sparkle-nav-inner { gap: 4px; }
          .sparkle-logo { font-size: 1.05rem; letter-spacing: 0.08em; }
          .sparkle-search-box.open { width: 85px; }
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
            <div className="sparkle-search-wrap" ref={searchDropdownRef}>
              {/* Expanding input */}
              <div className={`sparkle-search-box${searchOpen ? " open" : ""}`}>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search jewels…"
                  aria-label="Search jewels"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => { if (searchTerm.trim()) setShowDropdown(true); }}
                />
              </div>

              {/* Search icon button */}
              <button
                className={`sparkle-icon-btn${searchOpen ? " active" : ""}`}
                aria-label="Toggle search"
                onClick={handleSearchIconClick}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="7" />
                  <line x1="17" y1="17" x2="21" y2="21" />
                </svg>
              </button>

              {/* Search results dropdown */}
              {showDropdown && (isSearching || searchResults) && (
                <div className="sparkle-search-dropdown">
                  {isSearching ? (
                    <div className="sparkle-search-message">Searching...</div>
                  ) : searchResults ? (
                    <>
                      {searchResults.categories.length > 0 && (
                        <div>
                          <div className="sparkle-search-section-title">Categories</div>
                          {searchResults.categories.map((cat) => (
                            <Link key={cat._id} href={`/categories/${cat._id}`} className="sparkle-search-item" onClick={() => { setShowDropdown(false); setSearchOpen(false); setSearchTerm(""); }}>
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
                            <Link key={style._id} href={`/styles/${style._id}`} className="sparkle-search-item" onClick={() => { setShowDropdown(false); setSearchOpen(false); setSearchTerm(""); }}>
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
                            <Link key={product._id} href={`/products/${product._id}`} className="sparkle-search-item" onClick={() => { setShowDropdown(false); setSearchOpen(false); setSearchTerm(""); }}>
                              {product.mainImage && (
                                <Image src={product.mainImage} alt={product.title} width={32} height={32} className="sparkle-search-item-img" />
                              )}
                              <div className="sparkle-search-item-info">
                                <span className="sparkle-search-item-title">{product.title}</span>
                                {product.price && <span className="sparkle-search-item-price">₹{product.price}</span>}
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}

                      {searchResults.categories.length === 0 && searchResults.styles.length === 0 && searchResults.products.length === 0 && (
                        <div className="sparkle-search-message">No matching results found.</div>
                      )}
                    </>
                  ) : null}
                </div>
              )}
            </div>

            <div className="sparkle-divider" />

            {/* Cart */}
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
    </>
  );
}