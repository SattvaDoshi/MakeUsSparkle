import { BandSkeleton, ProductRowSkeleton } from "@/components/home/Skeletons";

/** Shown instantly while any page without its own loading screen is being fetched. */
export default function Loading() {
  return (
    <div style={{ background: "#fff", minHeight: "100vh" }} aria-busy="true" aria-label="Loading">
      <div style={{ height: 64, borderBottom: "1px solid #ecebe4" }} />
      <BandSkeleton />
      <div style={{ height: 48 }} />
      <ProductRowSkeleton />
    </div>
  );
}
