
import Script from 'next/script';
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
    <html lang="en" data-scroll-behavior="smooth">
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
        {/* Back to a listing after the browser reloaded it: don't let the browser restore the scroll onto the short, still-loading page (it lands on the footer); the listing puts the page back once its cards are there. */}
        <Script
          id="plp-scroll-restoration"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `try{var n=performance.getEntriesByType('navigation')[0];if(n&&n.type==='back_forward'&&sessionStorage.getItem('mus_plp:'+location.pathname+location.search)){history.scrollRestoration='manual';document.documentElement.style.scrollBehavior='auto'}}catch(e){}`,
          }}
        />
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