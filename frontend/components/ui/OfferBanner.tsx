'use client';

import { useState } from 'react';
import styles from './OfferBanner.module.css';

interface Offer {
  type: 'combo' | 'discount' | 'threshold';
  label: string;
  code?: string;
  detail?: string;
  href?: string;
}

interface Props {
  offers?: Offer[];
  productPrice?: number;
}

const defaultOffers: Offer[] = [
  { type: 'combo', label: 'Buy any 2 Products and get Flat 15% Off', code: 'GET15' },
  { type: 'threshold', label: 'Free Shipping above ₹599', detail: 'Add more to unlock' },
  { type: 'threshold', label: 'Free Gift on shopping above ₹699', detail: 'Keep shopping' },
  { type: 'threshold', label: 'Free Organiser on shopping above ₹1199' },
  { type: 'threshold', label: 'Get ₹100 off on shopping above ₹1499' },
];

export default function OfferBanner({ offers = defaultOffers, productPrice }: Props) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    });
  };

  // Main combo offer (shown prominently)
  const comboOffer = offers.find(o => o.type === 'combo');
  // Threshold offers
  const thresholdOffers = offers.filter(o => o.type === 'threshold');

  return (
    <div className={styles.wrap}>
      {/* Primary offer */}
      {comboOffer && (
        <div className={styles.primary}>
          <div className={styles.primaryLeft}>
            <span className={styles.primaryIcon}>%</span>
            <div>
              {productPrice && (
                <div className={styles.getAtPrice}>
                  Get this at <strong>₹{Math.round(productPrice * 0.85)}</strong>
                </div>
              )}
              <div className={styles.primaryLabel}>{comboOffer.label}</div>
              {comboOffer.code && (
                <div className={styles.codeRow}>
                  <span className={styles.useCode}>Use Code:</span>
                  <span className={styles.code}>{comboOffer.code}</span>
                  <button
                    className={`${styles.copyBtn} ${copiedCode === comboOffer.code ? styles.copied : ''}`}
                    onClick={() => copyCode(comboOffer.code!)}
                    aria-label="Copy code"
                  >
                    {copiedCode === comboOffer.code ? (
                      <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
                        <path d="M3 8l3 3 7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : (
                      <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
                        <rect x="5" y="5" width="9" height="9" rx="1" stroke="currentColor" strokeWidth="1.3"/>
                        <path d="M11 5V3a1 1 0 00-1-1H3a1 1 0 00-1 1v7a1 1 0 001 1h2" stroke="currentColor" strokeWidth="1.3"/>
                      </svg>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
          {comboOffer.href && (
            <a href={comboOffer.href} className={styles.viewLink}>
              View Products →
            </a>
          )}
        </div>
      )}

      {/* Threshold offers */}
      {thresholdOffers.length > 0 && (
        <div className={styles.thresholds}>
          {thresholdOffers.map((offer, i) => (
            <div key={i} className={styles.thresholdItem}>
              <span className={styles.thresholdIcon}>%</span>
              <span className={styles.thresholdLabel}>{offer.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}