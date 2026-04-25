
import type { Metadata } from 'next';
import './globals.css';

import BottomNav from '@/components/ui/BottomNav';
import LoginPopup from '@/components/ui/LoginPopup';
import TopNav from '@/components/ui/UpperNav';

import { CartProvider } from '@/lib/cartContext';
import CartDrawer from '@/components/cart/CartDrawer';
import { ConfettiManager } from '@/components/cart/ConfettiManager';
import { WishlistProvider } from '@/lib/wishlistContext';
import Providers from "./providers";
import { GenderProvider } from "@/lib/genderContext";

export const metadata: Metadata = {
  title: 'MakeUsSparkle — Luxury Jewellery & Gifts',
  description:
    'Discover exquisite jewellery, curated gift boxes, and custom charms. Where every piece tells a story.',
  keywords:
    'jewellery, gifts, necklace, earrings, bracelets, custom jewellery, India',
  openGraph: {
    title: 'MakeUsSparkle — Luxury Jewellery & Gifts',
    description:
      'Discover exquisite jewellery, curated gift boxes, and custom charms.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>

      <body className="has-bottom-nav">
        <GenderProvider> 
        <Providers>
            
            {/* <TopNav/> */}
            {children}
          {/* Existing global UI */}
          <BottomNav />
          <LoginPopup />

          {/* Cart system */}
          <CartDrawer />
          <ConfettiManager />
          </Providers>
          </GenderProvider>
      </body>
    </html>
  );
}