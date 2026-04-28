
import type { Metadata } from 'next';
import './globals.css';

import Providers from "./providers";
import { GenderProvider } from "@/lib/genderContext";
import SiteChrome from "@/components/ui/SiteChrome";

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

      <body>
        <GenderProvider> 
          <Providers>
            <SiteChrome>
            {children}
            </SiteChrome>
          </Providers>
        </GenderProvider>
      </body>
    </html>
  );
}