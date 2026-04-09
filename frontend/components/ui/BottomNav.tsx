"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useWishlist } from '@/lib/wishlistContext';

const tabs = [
  { href: "/", label: "Home", icon: <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>, icon2: <polyline points="9 22 9 12 15 12 15 22"/> },
  { href: "/categories", label: "Categories", icon: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></> },
  { href: "/wishlist", label: "Wishlist", icon: <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/> },
  { href: "/offers", label: "Offers", icon: <><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5" rx="1"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></> },
  { href: "/profile", label: "Profile", icon: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></> },
];

export default function BottomNav() {
  const pathname = usePathname();
    const { items: wishlistItems } = useWishlist();
  return (
    <>
      <style>{`
        .btab { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:4px; text-decoration:none; padding:8px 4px; position:relative; transition:background 0.2s; flex:1; }
        .btab:hover { background:rgba(255,255,255,0.05); }
        .btab.active::before { content:''; position:absolute; top:0; left:50%; transform:translateX(-50%); width:28px; height:2px; background:#c9a84c; border-radius:0 0 2px 2px; }
        .btab-label { font-family:'Montserrat',sans-serif; font-size:0.5rem; font-weight:600; letter-spacing:0.18em; text-transform:uppercase; }
      `}</style>
      <nav style={{ position:"fixed", bottom:0, left:0, right:0, background:"#1a1a1a", borderTop:"1px solid rgba(255,255,255,0.1)", zIndex:100, height:64, display:"flex", alignItems:"stretch" }}>
        <div style={{ display:"flex", width:"100%", maxWidth:600, margin:"0 auto" }}>
      {tabs.map(({ href, label, icon, icon2 }) => {
  const active = pathname === href;
  const isWishlist = href === "/wishlist"; // ✅ ADD THIS

  return (
    <Link
      key={href}
      href={href}
      className={`btab${active ? " active" : ""}`}
      style={{ position: "relative" }} // ✅ IMPORTANT
    >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? "#c9a84c" : "rgba(255,255,255,0.45)"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  {icon}{icon2}
                </svg>
                {isWishlist && wishlistItems.length > 0 && (
  <span
    style={{
      position: "absolute",
      top: 6,
      right: "50%",
      transform: "translateX(14px)",
      width: 14,
      height: 14,
      borderRadius: "50%",
      background: "#c9a84c",
      fontSize: "0.42rem",
      fontWeight: 700,
      color: "#1a1a1a",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    {wishlistItems.length}
  </span>
)}
                <span className="btab-label" style={{ color: active ? "#c9a84c" : "rgba(255,255,255,0.45)" }}>{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
      <div style={{ height: 64 }} /> {/* spacer so content isn't hidden behind nav */}
    </>
  );
}