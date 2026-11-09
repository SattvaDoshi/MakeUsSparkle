'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiRequest } from '@/lib/api';

export default function AffiliateTracker() {
  const searchParams = useSearchParams();
  const trackedSetRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    try {
      const aff = searchParams.get('aff') || searchParams.get('ref');
      const link = searchParams.get('link');

      if (!aff) return;

      const path = typeof window !== 'undefined' ? window.location.pathname : '';
      let productId: string | undefined;

      // Match standard product URL: /products/:id
      const productMatch = path.match(/\/products\/([^/?#]+)/);
      if (productMatch) {
        productId = productMatch[1];
      } else {
        // Also check if combo / custom combo parameter is in the query params
        const comboParam = searchParams.get('combo') || searchParams.get('custom');
        if (comboParam) {
          productId = comboParam;
        }
      }

      // Memory-level and session-level key to strictly avoid duplicate calls in React StrictMode and refreshes
      const trackingKey = `${aff}_${link || ''}_${productId || ''}`;
      if (trackedSetRef.current.has(trackingKey)) {
        return;
      }
      trackedSetRef.current.add(trackingKey);

      const sessionKey = `aff_tracked_${trackingKey}`;
      const alreadyTracked = typeof window !== 'undefined' ? sessionStorage.getItem(sessionKey) : null;

      // Store in localStorage for checkout attribution
      if (typeof window !== 'undefined') {
        const affData = {
          code: aff,
          linkCode: link || undefined,
          productId: productId || undefined,
          timestamp: Date.now(),
        };
        localStorage.setItem('sparkle_affiliate', JSON.stringify(affData));
      }

      if (!alreadyTracked) {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(sessionKey, '1');
        }

        void apiRequest('/affiliate/track-click', {
          method: 'POST',
          body: JSON.stringify({
            affiliateCode: aff,
            linkCode: link || undefined,
            productId: productId || undefined,
          }),
        }).catch(() => {
          // Silent ignore for tracking failure
        });
      }
    } catch {
      // Ignore client tracking errors
    }
  }, [searchParams]);

  return null;
}

