'use client';

import { useRef, useState } from 'react';
import styles from './BannerSection.module.css';
import Link from 'next/link';

const banners = [
  {
    id: 1,
    tag: 'New Arrival',
    title: 'The Bloom\nCollection',
    subtitle: 'Handcrafted necklaces inspired by nature',
    cta: 'Discover',
    href: '/categories/women/jewellery/necklace',
    accent: 'Necklaces',
    bg: '#2d3318',
    textColor: '#e8ead0',
  },
  {
    id: 2,
    tag: 'Bestseller',
    title: 'Gift Boxes\nCurated',
    subtitle: 'The perfect present, thoughtfully wrapped',
    cta: 'Shop Gifts',
    href: '/categories/women/gift-boxes',
    accent: 'Gift Sets',
    bg: '#3d4a20',
    textColor: '#f5e6b8',
  },
  {
    id: 3,
    tag: 'Limited',
    title: 'Custom Charm\nJewellery',
    subtitle: 'Design your story, wear your world',
    cta: 'Customise',
    href: '/categories/women/custom-charm',
    accent: 'Custom',
    bg: '#1a1f0f',
    textColor: '#e8ead0',
  },
];

export default function BannerSection() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section className={styles.section} id="banners">
      {/* Marquee strip */}
      <div className={styles.marqueeWrap}>
        <div className={styles.marqueeTrack}>
          {Array.from({ length: 4 }).flatMap((_, i) =>
            ['✦ New Arrivals', '✦ Free Shipping ₹599+', '✦ Custom Jewellery', '✦ Gift Boxes', '✦ Trending Now'].map(t => (
              <span key={`${i}-${t}`} className={styles.marqueeItem}>{t}</span>
            ))
          )}
        </div>
      </div>

      {/* Section header */}
      <div className={styles.header}>
        <span className={styles.headerEyebrow}>Featured</span>
        <h2 className={styles.headerTitle}>Collections & Stories</h2>
        <div className={styles.headerLine} />
      </div>

      {/* Banner grid */}
      <div className={styles.grid}>
        {/* Large featured banner */}
        <Link
          href={banners[0].href}
          className={`${styles.bannerLarge} ${hovered === 0 ? styles.bannerHovered : ''}`}
          onMouseEnter={() => setHovered(0)}
          onMouseLeave={() => setHovered(null)}
          style={{ '--bg': banners[0].bg } as React.CSSProperties}
        >
          <div className={styles.bannerBg} />
          <div className={styles.bannerImagePlaceholder}>
            {/* Replace with next/image */}
            <div className={styles.imgPlaceholder}>
              <span className={styles.imgIcon}>✦</span>
            </div>
          </div>
          <div className={styles.bannerContent}>
            <span className={styles.bannerTag}>{banners[0].tag}</span>
            <h3 className={styles.bannerTitle} style={{ color: banners[0].textColor }}>
              {banners[0].title.split('\n').map((line, i) => (
                <span key={i}>{line}<br /></span>
              ))}
            </h3>
            <p className={styles.bannerSub}>{banners[0].subtitle}</p>
            <div className={styles.bannerCta}>
              <span>{banners[0].cta}</span>
              <span className={styles.ctaArrow}>→</span>
            </div>
          </div>
          <span className={styles.bannerAccent}>{banners[0].accent}</span>
        </Link>

        {/* Small banners stack */}
        <div className={styles.smallStack}>
          {banners.slice(1).map((b, idx) => (
            <Link
              key={b.id}
              href={b.href}
              className={`${styles.bannerSmall} ${hovered === idx + 1 ? styles.bannerHovered : ''}`}
              onMouseEnter={() => setHovered(idx + 1)}
              onMouseLeave={() => setHovered(null)}
              style={{ '--bg': b.bg } as React.CSSProperties}
            >
              <div className={styles.bannerBg} />
              <div className={styles.bannerSmallImg}>
                <span className={styles.imgIcon}>✦</span>
              </div>
              <div className={styles.bannerContent}>
                <span className={styles.bannerTag}>{b.tag}</span>
                <h3 className={styles.bannerTitleSm} style={{ color: b.textColor }}>
                  {b.title.split('\n').map((line, i) => (
                    <span key={i}>{line}<br /></span>
                  ))}
                </h3>
                <div className={styles.bannerCta}>
                  <span>{b.cta}</span>
                  <span className={styles.ctaArrow}>→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Offer pill */}
      <div className={styles.offerPill}>
        <span className={styles.offerIcon}>%</span>
        <span className={styles.offerText}>
          First order? Get <strong>10% off</strong> when you sign up
        </span>
        <button className={styles.offerBtn}>Claim Now</button>
      </div>
    </section>
  );
}