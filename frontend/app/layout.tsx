
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
        {/* One stylesheet for every font the site uses (was 29 separate @imports, each chained and render-blocking) */}
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600&family=Jost:wght@200;300;400;500;600;700&family=Nunito:wght@300;400;500;600;700;800&family=DM+Sans:wght@300;400;500;600;700;800&family=Inter:wght@400;500;600&family=Montserrat:wght@300;400;500;600&display=swap" />
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