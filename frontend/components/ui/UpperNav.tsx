// "use client";
// import { useCart } from '@/lib/cartContext';

// export default function TopNav() {
// const { itemCount } = useCart();



//   return (
//     <nav style={{
//       background: "#f5f3ef",
//       borderBottom: "1px solid rgba(26,26,26,0.1)",
//       position: "sticky", top: 0, zIndex: 100, width: "100%"
//     }}>
//       <style>{`
//         .nav-link { font-family:'Montserrat',sans-serif; font-size:0.6rem; font-weight:600; letter-spacing:0.2em; text-transform:uppercase; color:#1a1a1a; text-decoration:none; position:relative; transition:color 0.2s; }
//         .nav-link::after { content:''; position:absolute; bottom:-3px; left:0; width:0; height:1px; background:#c9a84c; transition:width 0.3s ease; }
//         .nav-link:hover { color:#525d51; }
//         .nav-link:hover::after { width:100%; }
//         .icon-btn { width:38px; height:38px; border-radius:50%; border:none; background:transparent; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:background 0.2s; position:relative; color:#1a1a1a; text-decoration:none; }
//         .icon-btn:hover { background:rgba(26,26,26,0.06); }
//         .search-form { display:flex; align-items:center; border:1px solid rgba(26,26,26,0.18); border-radius:2px; height:34px; overflow:hidden; transition:border-color 0.2s; margin-right:6px; }
//         .search-form:focus-within { border-color:#c9a84c; }
//         .search-form input { border:none; outline:none; background:transparent; font-family:'Montserrat',sans-serif; font-size:0.6rem; letter-spacing:0.1em; color:#1a1a1a; padding:0 12px; width:130px; height:100%; }
//         .search-form input::placeholder { color:#8a8a8a; }
//         .search-form button { background:transparent; border:none; cursor:pointer; padding:0 10px; height:100%; display:flex; align-items:center; color:#1a1a1a; transition:color 0.2s; }
//         .search-form button:hover { color:#c9a84c; }
//       `}</style>
//       <div style={{ display:"grid", gridTemplateColumns:"1fr auto 1fr", alignItems:"center", padding:"0 28px", height:"64px", maxWidth:"1200px", margin:"0 auto" }}>

//         {/* Left links */}
//         <div style={{ display:"flex", gap:"28px", alignItems:"center" }}>
//           <a className="nav-link" href="#">Collections</a>
//           <a className="nav-link" href="#">New In</a>
//           <a className="nav-link" href="#">Bridal</a>
//         </div>

//         {/* Center logo */}
//         <a href="/" style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"2rem", fontWeight:700, color:"#1a1a1a", letterSpacing:"-1px", textDecoration:"none", display:"flex", alignItems:"center", gap:"6px", justifyContent:"center" }}>
//           k<span style={{ width:6, height:6, borderRadius:"50%", background:"#c9a84c", marginTop:4, flexShrink:0, display:"inline-block" }}/>
//         </a>

//         {/* Right icons */}
//         <div style={{ display:"flex", alignItems:"center", gap:"4px", justifyContent:"flex-end" }}>
//           <div className="search-form">
//             <input type="text" placeholder="Search jewels…" />
//             <button aria-label="Search">
//               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
//                 <circle cx="11" cy="11" r="7"/><line x1="17" y1="17" x2="21" y2="21"/>
//               </svg>
//             </button>
//           </div>
//           <div style={{ width:1, height:20, background:"rgba(26,26,26,0.15)", margin:"0 4px" }}/>
//           <a className="icon-btn" href="/profile" aria-label="Profile">
//             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
//               <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
//             </svg>
//           </a>
//           <a className="icon-btn" href="/cart" aria-label="Cart" style={{ position:"relative" }}>
//             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
//               <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
//             </svg>
//             {/* Only show badge when there are items */}
//             {itemCount > 0 && (
//   <span style={{
//     position:"absolute", top:5, right:4,
//     width:14, height:14, borderRadius:"50%",
//     background:"#c9a84c", fontSize:"0.45rem",
//     fontWeight:700, color:"#1a1a1a",
//     display:"flex", alignItems:"center", justifyContent:"center",
//   }}>
//     {itemCount > 99 ? '99+' : itemCount}
//   </span>
// )}
            
//           </a>
//         </div>
//       </div>
//     </nav>
//   );
// }


"use client";
import { useCart } from "@/lib/cartContext";
import { useState, useEffect } from "react";

export default function TopNav() {
  const { itemCount } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Montserrat:wght@300;400;500;600&display=swap');

        .k-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 200;
          padding: 0 24px;
          transition: background 0.4s ease, backdrop-filter 0.4s ease, box-shadow 0.4s ease;
        }
        .k-nav.scrolled {
          background: rgba(10, 30, 15, 0.72);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          box-shadow: 0 1px 32px rgba(0,0,0,0.18);
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

        /* ---- Left links ---- */
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
          color: rgba(255,255,255,0.82);
          text-decoration: none;
          position: relative;
          transition: color 0.2s;
        }
        .k-link::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 0;
          height: 1px;
          background: #c9a84c;
          transition: width 0.35s ease;
        }
        .k-link:hover { color: #c9a84c; }
        .k-link:hover::after { width: 100%; }

        /* ---- Logo ---- */
        .k-logo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2.1rem;
          font-weight: 700;
          color: #fff;
          text-decoration: none;
          letter-spacing: -0.5px;
          display: flex;
          align-items: center;
          gap: 5px;
          white-space: nowrap;
        }
        .k-logo-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #c9a84c;
          margin-top: 6px;
          flex-shrink: 0;
        }

        /* ---- Right icons ---- */
        .k-nav-right {
          display: flex;
          align-items: center;
          gap: 6px;
          justify-content: flex-end;
        }
        .k-icon-btn {
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
          color: rgba(255,255,255,0.85);
          text-decoration: none;
          transition: background 0.2s, color 0.2s;
        }
        .k-icon-btn:hover {
          background: rgba(201,168,76,0.15);
          color: #c9a84c;
        }

        /* ---- Search overlay ---- */
        .k-search-wrap {
          display: flex;
          align-items: center;
          position: relative;
        }
        .k-search-box {
          display: flex;
          align-items: center;
          overflow: hidden;
          height: 34px;
          border: 1px solid rgba(255,255,255,0.22);
          border-radius: 2px;
          background: rgba(255,255,255,0.06);
          transition: border-color 0.25s, background 0.25s, width 0.4s ease;
          width: 0;
          opacity: 0;
          pointer-events: none;
        }
        .k-search-box.open {
          width: 160px;
          opacity: 1;
          pointer-events: all;
          border-color: #c9a84c;
          background: rgba(255,255,255,0.1);
          margin-right: 6px;
        }
        .k-search-box input {
          border: none;
          outline: none;
          background: transparent;
          font-family: 'Montserrat', sans-serif;
          font-size: 0.58rem;
          letter-spacing: 0.1em;
          color: #fff;
          padding: 0 12px;
          width: 100%;
          height: 100%;
        }
        .k-search-box input::placeholder { color: rgba(255,255,255,0.45); }

        /* ---- Divider ---- */
        .k-divider {
          width: 1px;
          height: 18px;
          background: rgba(255,255,255,0.2);
          margin: 0 2px;
        }

        /* ---- Cart badge ---- */
        .k-badge {
          position: absolute;
          top: 4px;
          right: 4px;
          width: 14px;
          height: 14px;
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

        /* ---- Hamburger (mobile) ---- */
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
          width: 22px;
          height: 1.5px;
          background: rgba(255,255,255,0.85);
          transition: transform 0.3s, opacity 0.3s;
        }
        .k-hamburger.open span:nth-child(1) { transform: translateY(6.5px) rotate(45deg); }
        .k-hamburger.open span:nth-child(2) { opacity: 0; }
        .k-hamburger.open span:nth-child(3) { transform: translateY(-6.5px) rotate(-45deg); }

        /* ---- Mobile drawer ---- */
        .k-mobile-menu {
          display: none;
          position: fixed;
          top: 72px;
          left: 0;
          right: 0;
          background: rgba(10, 28, 14, 0.96);
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

        /* ---- Responsive ---- */
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

      <nav className={`k-nav${scrolled ? " scrolled" : ""}`}>
        <div className="k-nav-inner">

          {/* Left */}
          <div className="k-nav-left">
            <a className="k-link" href="#">Collections</a>
            <a className="k-link" href="#">New In</a>
            <a className="k-link" href="#">Bridal</a>
          </div>

          {/* Logo */}
          <a href="/" className="k-logo">
            k<span className="k-logo-dot" />
          </a>

          {/* Right */}
          <div className="k-nav-right">
            {/* Search */}
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

            {/* Profile */}
            <a className="k-icon-btn" href="/profile" aria-label="Profile">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
              </svg>
            </a>

            {/* Cart */}
            <a className="k-icon-btn" href="/cart" aria-label="Cart">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" />
              </svg>
              {itemCount > 0 && (
                <span className="k-badge">{itemCount > 99 ? "99+" : itemCount}</span>
              )}
            </a>

            {/* Hamburger (mobile) */}
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

      {/* Mobile drawer */}
      <div className={`k-mobile-menu${menuOpen ? " open" : ""}`}>
        <a className="k-mobile-link" href="#">Collections</a>
        <a className="k-mobile-link" href="#">New In</a>
        <a className="k-mobile-link" href="#">Bridal</a>
        <a className="k-mobile-link" href="/profile">Profile</a>
        <a className="k-mobile-link" href="/cart">Cart {itemCount > 0 ? `(${itemCount})` : ""}</a>
      </div>
    </>
  );
}