'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import CarouselArrows from '@/components/ui/CarouselArrows';
import { cdnImage, fetchFeaturedReviews, type ReviewStats } from '@/lib/siteContentApi';
import { useNearViewport } from './useNearViewport';
import styles from './TestimonialsSection.module.css';

/**
 * Customer reviews.
 * Shows real, recent 4–5★ reviews from the store (with the product they bought and a
 * "verified buyer" badge). If there aren't enough real reviews yet it falls back to the
 * curated quotes below, so the section is never empty.
 */

interface Item {
  id: string;
  name: string;
  rating: number;
  body: string;
  verified: boolean;
  meta: string;        // "Mumbai" / "Jun 2026"
  productTitle: string;
  productImage?: string;
  productHref?: string;
  photo?: string;
}

const MIN_REAL_REVIEWS = 3;

const CURATED: Item[] = [
  { id: 'c1', name: 'Priya Sharma', rating: 5, verified: false, meta: 'Mumbai', productTitle: 'Bloom Necklace',
    body: 'The necklace I ordered was even more beautiful in person. The packaging was so luxurious — I gifted it to my sister and she absolutely loved it. Will definitely be ordering again!' },
  { id: 'c2', name: 'Aanya Kapoor', rating: 5, verified: false, meta: 'Delhi', productTitle: 'Custom Charm Bracelet',
    body: 'I ordered a custom charm bracelet and the quality is exceptional. The charm selection process was fun and the photos on the website matched the real product perfectly.' },
  { id: 'c3', name: 'Sneha Raut', rating: 5, verified: false, meta: 'Pune', productTitle: 'Stellar Earrings Gift Set',
    body: "Fast delivery, gorgeous packaging, and the earrings are stunning. The gift box I ordered for my friend's birthday made her cry happy tears. 10/10 experience!" },
  { id: 'c4', name: 'Meera Iyer', rating: 5, verified: false, meta: 'Bangalore', productTitle: 'Curated Jewellery Combo',
    body: "The curated combo was worth every rupee. The pieces complement each other so well and the quality is fantastic. I've been getting compliments every day!" },
];

const initials = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || '★';
const starsFor = (n: number) => '★'.repeat(Math.round(n)) + '☆'.repeat(5 - Math.round(n));
const monthYear = (iso: string) => {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
};

export default function TestimonialsSection() {
  const [ref, near] = useNearViewport<HTMLElement>();
  const trackRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<Item[] | null>(null); // null = not loaded yet
  const [stats, setStats] = useState<ReviewStats | null>(null);

  useEffect(() => {
    if (!near) return;
    let live = true;
    fetchFeaturedReviews()
      .then(({ reviews, stats: s }) => {
        if (!live) return;
        if (reviews.length >= MIN_REAL_REVIEWS) {
          setStats(s.count > 0 ? s : null);
          setItems(reviews.map((r) => ({
            id: r.id, name: r.name, rating: r.rating, body: r.body, verified: r.verified,
            meta: monthYear(r.date),
            productTitle: r.product.title.trim(), productImage: r.product.image, productHref: `/products/${r.product.id}`,
            photo: r.image || undefined,
          })));
        } else {
          setItems(CURATED);
        }
      })
      .catch(() => live && setItems(CURATED));
    return () => { live = false; };
  }, [near]);

  const list = items ?? CURATED;
  const loading = items === null; // placeholder cards until we know which set to show (no flash of curated quotes)

  return (
    <section ref={ref} className={styles.section} data-home-section="reviews" aria-label="Customer reviews">
      <div className={styles.inner}>
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <span className={styles.eyebrow}>Real stories</span>
            <h2 className={styles.title}>Loved by <em>our customers</em></h2>
          </div>
          <div className={styles.right}>
            {stats && (
              <div className={styles.rating} aria-label={`Rated ${stats.average} out of 5 from ${stats.count} reviews`}>
                <span className={styles.ratingNum}>{stats.average.toFixed(1)}</span>
                <span className={styles.ratingMeta}>
                  <span className={styles.stars} aria-hidden="true">{starsFor(stats.average)}</span>
                  <span className={styles.ratingCount}>{stats.count} review{stats.count === 1 ? '' : 's'}</span>
                </span>
              </div>
            )}
            {list.length > 3 && <div className={styles.arrows}><CarouselArrows targetRef={trackRef} label="reviews" /></div>}
          </div>
        </div>

        <div className={styles.trackWrap}>
          <div className={styles.track} ref={trackRef}>
            {loading
              ? Array.from({ length: 3 }).map((_, i) => <div key={i} className={styles.skel} aria-hidden="true" />)
              : list.map((t) => (
                  <article key={t.id} className={styles.card}>
                    <div className={styles.cardTop}>
                      <span className={styles.stars} role="img" aria-label={`${t.rating} out of 5 stars`}>{starsFor(t.rating)}</span>
                      {t.verified && <span className={styles.verified}>✓ Verified buyer</span>}
                    </div>

                    <div className={styles.quoteMark} aria-hidden="true">&ldquo;</div>
                    <div className={styles.bodyRow}>
                      <p className={styles.body}>{t.body}</p>
                      {t.photo && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img className={styles.photo} src={cdnImage(t.photo, 240)} alt={`Photo from ${t.name}'s review`} loading="lazy" decoding="async" />
                      )}
                    </div>

                    <div className={styles.foot}>
                      <div className={styles.who}>
                        <span className={styles.avatar} aria-hidden="true">{initials(t.name)}</span>
                        <div>
                          <div className={styles.name}>{t.name}</div>
                          {t.meta && <div className={styles.meta}>{t.meta}</div>}
                        </div>
                      </div>

                      {t.productTitle && (() => {
                        const inner = (
                          <>
                            {t.productImage && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img className={styles.pImg} src={cdnImage(t.productImage, 120)} alt="" loading="lazy" decoding="async" />
                            )}
                            <span className={styles.pText}>
                              <span className={styles.pLabel}>Purchased</span>
                              <span className={styles.pTitle}>{t.productTitle}</span>
                            </span>
                          </>
                        );
                        return t.productHref
                          ? <Link href={t.productHref} className={styles.product}>{inner}</Link>
                          : <div className={styles.product}>{inner}</div>;
                      })()}
                    </div>
                  </article>
                ))}
          </div>
        </div>
      </div>
    </section>
  );
}
