import { CircleRowSkeleton } from "@/components/home/Skeletons";
import listing from "@/components/product/ProductListing.module.css";
import sk from "@/components/home/Skeletons.module.css";

/** Listing-page skeleton: heading, style circles, filter bar and a grid of product cards. */
export default function Loading() {
  return (
    <div style={{ background: "#fff", minHeight: "100vh" }} aria-busy="true" aria-label="Loading products">
      <div style={{ height: 64, borderBottom: "1px solid #ecebe4" }} />
      <div style={{ maxWidth: 1360, margin: "0 auto", padding: "40px 28px 8px" }}>
        <span className={`${sk.sk}`} style={{ display: "block", height: 12, width: 220, borderRadius: 4, marginBottom: 16 }} />
        <span className={`${sk.sk}`} style={{ display: "block", height: 52, width: "min(360px, 70%)", borderRadius: 6 }} />
      </div>
      <div style={{ maxWidth: 1360, margin: "0 auto", padding: "24px 28px 10px" }}><CircleRowSkeleton /></div>
      <div className={listing.root}>
        <div className={listing.toolbar}>
          <div className={listing.pills}>
            {[60, 70, 90, 60, 100].map((w, i) => <span key={i} className={sk.sk} style={{ width: w, height: 34, borderRadius: 999 }} />)}
          </div>
        </div>
        <div className={listing.body}>
          <div className={listing.grid}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={listing.skel}>
                <div className={listing.skelImg} />
                <div className={listing.skelLine} style={{ width: "40%" }} />
                <div className={listing.skelLine} style={{ width: "85%" }} />
                <div className={listing.skelLine} style={{ width: "30%" }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
