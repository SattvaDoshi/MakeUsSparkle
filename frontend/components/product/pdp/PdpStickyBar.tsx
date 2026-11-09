'use client';

import { useEffect } from 'react';
import { cdnImage } from '@/lib/cdn';
import styles from './pdp.module.css';

/** Add-to-cart bar that slides up once the main buttons scroll out of view. */
export default function PdpStickyBar({ show, image, name, price, original, soldOut, onAdd, qty, maxQty, onQty, label }: {
  show: boolean; image: string; name: string; price: number; original?: number | null; soldOut: boolean; onAdd: () => void;
  qty?: number; maxQty?: number; onQty?: (delta: number) => void; label?: string;
}) {
  useEffect(() => {
    document.body.classList.toggle('has-sticky-atc', show);
    return () => document.body.classList.remove('has-sticky-atc');
  }, [show]);

  return (
    <div className={`${styles.sticky}${show ? ` ${styles.stickyOn}` : ''}`} aria-hidden={!show}>
      <div className={styles.stickyIn}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className={styles.stickyImg} src={cdnImage(image, 120)} alt="" />
        <div className={styles.stickyInfo}>
          <div className={styles.stickyName}>{name}</div>
          <div className={styles.stickyPrice}>
            <span>₹{Math.round(price).toLocaleString('en-IN')}</span>
            {original && original > price ? <s>₹{Math.round(original).toLocaleString('en-IN')}</s> : null}
          </div>
        </div>
        {onQty && qty !== undefined && maxQty !== undefined && (
        <div className={styles.stickyQty} role="group" aria-label="Quantity">
          <button type="button" aria-label="Decrease quantity" onClick={() => onQty(-1)} disabled={qty <= 1} tabIndex={show ? 0 : -1}>−</button>
          <span aria-live="polite">{qty}</span>
          <button type="button" aria-label="Increase quantity" onClick={() => onQty(1)} disabled={qty >= maxQty} tabIndex={show ? 0 : -1}>+</button>
        </div>
        )}
        <button type="button" className={styles.stickyBtn} onClick={onAdd} disabled={soldOut} tabIndex={show ? 0 : -1}>
          {soldOut ? 'Sold out' : (label || 'Add to Cart')}
        </button>
      </div>
    </div>
  );
}
