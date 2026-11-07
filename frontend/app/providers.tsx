"use client";

import { Suspense } from "react";
import { AuthProvider } from "@/lib/authContext";
import { CartProvider } from "@/lib/cartContext";
import { WishlistProvider } from "@/lib/wishlistContext";
import AffiliateTracker from "@/components/affiliate/AffiliateTracker";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <Suspense fallback={null}>
            <AffiliateTracker />
          </Suspense>
          {children}
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}