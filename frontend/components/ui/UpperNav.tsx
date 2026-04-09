"use client";
import { useCart } from '@/lib/cartContext';

export default function TopNav() {
const { itemCount } = useCart();



  return (
    <nav style={{
      background: "#f5f3ef",
      borderBottom: "1px solid rgba(26,26,26,0.1)",
      position: "sticky", top: 0, zIndex: 100, width: "100%"
    }}>
      <style>{`
        .nav-link { font-family:'Montserrat',sans-serif; font-size:0.6rem; font-weight:600; letter-spacing:0.2em; text-transform:uppercase; color:#1a1a1a; text-decoration:none; position:relative; transition:color 0.2s; }
        .nav-link::after { content:''; position:absolute; bottom:-3px; left:0; width:0; height:1px; background:#c9a84c; transition:width 0.3s ease; }
        .nav-link:hover { color:#525d51; }
        .nav-link:hover::after { width:100%; }
        .icon-btn { width:38px; height:38px; border-radius:50%; border:none; background:transparent; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:background 0.2s; position:relative; color:#1a1a1a; text-decoration:none; }
        .icon-btn:hover { background:rgba(26,26,26,0.06); }
        .search-form { display:flex; align-items:center; border:1px solid rgba(26,26,26,0.18); border-radius:2px; height:34px; overflow:hidden; transition:border-color 0.2s; margin-right:6px; }
        .search-form:focus-within { border-color:#c9a84c; }
        .search-form input { border:none; outline:none; background:transparent; font-family:'Montserrat',sans-serif; font-size:0.6rem; letter-spacing:0.1em; color:#1a1a1a; padding:0 12px; width:130px; height:100%; }
        .search-form input::placeholder { color:#8a8a8a; }
        .search-form button { background:transparent; border:none; cursor:pointer; padding:0 10px; height:100%; display:flex; align-items:center; color:#1a1a1a; transition:color 0.2s; }
        .search-form button:hover { color:#c9a84c; }
      `}</style>
      <div style={{ display:"grid", gridTemplateColumns:"1fr auto 1fr", alignItems:"center", padding:"0 28px", height:"64px", maxWidth:"1200px", margin:"0 auto" }}>

        {/* Left links */}
        <div style={{ display:"flex", gap:"28px", alignItems:"center" }}>
          <a className="nav-link" href="#">Collections</a>
          <a className="nav-link" href="#">New In</a>
          <a className="nav-link" href="#">Bridal</a>
        </div>

        {/* Center logo */}
        <a href="/" style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"2rem", fontWeight:700, color:"#1a1a1a", letterSpacing:"-1px", textDecoration:"none", display:"flex", alignItems:"center", gap:"6px", justifyContent:"center" }}>
          k<span style={{ width:6, height:6, borderRadius:"50%", background:"#c9a84c", marginTop:4, flexShrink:0, display:"inline-block" }}/>
        </a>

        {/* Right icons */}
        <div style={{ display:"flex", alignItems:"center", gap:"4px", justifyContent:"flex-end" }}>
          <div className="search-form">
            <input type="text" placeholder="Search jewels…" />
            <button aria-label="Search">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7"/><line x1="17" y1="17" x2="21" y2="21"/>
              </svg>
            </button>
          </div>
          <div style={{ width:1, height:20, background:"rgba(26,26,26,0.15)", margin:"0 4px" }}/>
          <a className="icon-btn" href="/profile" aria-label="Profile">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </a>
          <a className="icon-btn" href="/cart" aria-label="Cart" style={{ position:"relative" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            {/* Only show badge when there are items */}
            {itemCount > 0 && (
  <span style={{
    position:"absolute", top:5, right:4,
    width:14, height:14, borderRadius:"50%",
    background:"#c9a84c", fontSize:"0.45rem",
    fontWeight:700, color:"#1a1a1a",
    display:"flex", alignItems:"center", justifyContent:"center",
  }}>
    {itemCount > 99 ? '99+' : itemCount}
  </span>
)}
            
          </a>
        </div>
      </div>
    </nav>
  );
}