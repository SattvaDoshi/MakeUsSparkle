"use client";

import { AuthProvider } from "@/lib/authContext";
import { CartProvider } from "@/lib/cartContext";
import { WishlistProvider } from "@/lib/wishlistContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          {children}
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}