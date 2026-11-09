'use client';

import { useEffect, useState, type CSSProperties, type MouseEvent } from 'react';
import Link from 'next/link';
import { useWishlist } from '@/lib/wishlistContext';
import { cdnImage } from '@/lib/cdn';
import styles from './ProductCard.module.css';

/**
 * ProductCard — the single product card used across the site
 * (homepage carousels, listing grids, offers, related products).
 *
 * White, image-led, 4:5 media. Second image on hover, wishlist, label chips,
 * rating. The whole card is one stretched link, so it is
 * keyboard/screen-reader friendly and middle-click works.
 *
 * Sizing is the parent's job — the card fills its container.
 */

interface ProductColor {
  label: string;
  hex: string;
  images?: string[];
}

export interface ProductCardProduct {
  id: number;
  name: string;
  category: string;
  price: number;
  originalPrice?: number | null;
  badge?: string | null;
  offer?: string | null;
  offerTag?: string | null;
  mainImage?: string | null;
  images: string[];
  colors: ProductColor[];
  href: string;
  sku?: string;
  sourceId?: string;
  categoryId?: string;
  subCategoryId?: string;
  styleId?: string;
  rating?: number;
  reviewCount?: number;
  type?: string;
  perCharmPrice?: number;
  charmPieceOptions?: number[];
  stock?: number;
  sizes?: string[];
  allowCustomization?: boolean;
  createdAt?: string;
}

const FREE_SHIPPING_MIN = 999; // matches the "Free Shipping above ₹999" announcement
const NEW_WINDOW_DAYS = 30;
const TAG_ROTATE_MS = 3000; // how often the chip on the image changes tag
const TAG_FADE_MS = 450;    // fade-out before the swap

const formatINR = (n: number) => `₹${n.toLocaleString('en-IN')}`;

export default function ProductCard({
  product,
  style,
  className = '',
  productLinkBase,
}: {
  product: ProductCardProduct;
  style?: CSSProperties;
  className?: string;
  productLinkBase?: string;
}) {
  const {
    name, price, originalPrice, badge, images, colors, perCharmPrice, charmPieceOptions,
  } = product;

  const { toggleItem, isWished } = useWishlist();
  const [wishPop, setWishPop] = useState(false);

  const wished = isWished(product.id);
  const isOutOfStock = (product.stock ?? Infinity) <= 0;
  const offerTitle = product.offerTag || product.offer;

  /* Images: main first, de-duplicated. The second one is shown on hover. */
  const gallery = Array.from(
    new Set([product.mainImage, ...(images ?? [])].filter((i): i is string => Boolean(i))),
  );
  const primary = gallery[0];
  const secondary = gallery[1];

  const discount =
    originalPrice && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : null;

  const isFromPrice = Boolean(perCharmPrice && perCharmPrice > 0);
  const shownPrice = isFromPrice
    ? price + (charmPieceOptions?.[0] ?? 1) * (perCharmPrice as number)
    : price;

  const slug = (product.href ?? '').split('/').pop() || String(product.id);
  const target = productLinkBase ? `${productLinkBase}/${slug}` : product.href || `/products/${slug}`;

  const stop = (e: MouseEvent) => { e.preventDefault(); e.stopPropagation(); };

  const handleWish = (e: MouseEvent<HTMLButtonElement>) => {
    stop(e);
    toggleItem({
      id: product.id,
      name,
      price,
      originalPrice: originalPrice ?? null,
      image: primary ?? '',
      category: product.category,
      href: product.href ?? '',
      colors,
      badge: badge ?? null,
      rating: product.rating,
      reviewCount: product.reviewCount,
    });
    setWishPop(true);
    setTimeout(() => setWishPop(false), 500);
  };

  /* One rotating chip on the image cycles through every tag that applies:
     product label, offer, low stock, free shipping, new arrival. */
  const tagList: { key: string; text: string; kind: 'plain' | 'offer' | 'warn' | 'good' }[] = [];
  if (!isOutOfStock) {
    if (badge) tagList.push({ key: 'badge', text: badge, kind: 'plain' });
    if (offerTitle) tagList.push({ key: 'offer', text: offerTitle, kind: 'offer' });
    const stock = product.stock ?? Infinity;
    if (stock > 0 && stock <= 5) tagList.push({ key: 'low', text: `Only ${stock} left`, kind: 'warn' });
    if (price >= FREE_SHIPPING_MIN) tagList.push({ key: 'ship', text: 'Free Shipping', kind: 'good' });
    const ageDays = product.createdAt ? (Date.now() - new Date(product.createdAt).getTime()) / 86_400_000 : Infinity;
    if (ageDays <= NEW_WINDOW_DAYS) tagList.push({ key: 'new', text: 'New Arrival', kind: 'plain' });
  }
  const [tagIdx, setTagIdx] = useState(0);
  const [tagFading, setTagFading] = useState(false);
  const tagCount = tagList.length;
  useEffect(() => {
    if (tagCount < 2) return;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let swap: ReturnType<typeof setTimeout>;
    const id = setInterval(() => {
      setTagFading(true);                 // fade out…
      swap = setTimeout(() => {           // …swap text, fade back in
        setTagIdx((i) => i + 1);
        setTagFading(false);
      }, TAG_FADE_MS);
    }, TAG_ROTATE_MS);
    return () => { clearInterval(id); clearTimeout(swap); };
  }, [tagCount]);
  const activeTag = tagCount > 0 ? tagList[tagIdx % tagCount] : null;

  const hasRating = (product.rating ?? 0) > 0;

  return (
    <article
      className={`${styles.card}${isOutOfStock ? ` ${styles.soldOut}` : ''} ${className}`}
      style={style}
    >
      <div className={styles.media}>
        {!primary && <div className={styles.placeholder} aria-hidden="true">✦</div>}
        {primary && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className={styles.img} src={cdnImage(primary, 640)} alt={name} loading="lazy" width={400} height={500} />
        )}
        {secondary && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className={`${styles.img} ${styles.imgAlt}`} src={cdnImage(secondary, 640)} alt="" aria-hidden loading="lazy" width={400} height={500} />
        )}

        <div className={styles.chips}>
          {isOutOfStock ? (
            <span className={`${styles.chip} ${styles.chipSale}`}>Sold out</span>
          ) : (
            <>
              {activeTag && (
                <span
                  key={activeTag.key}
                  className={`${styles.chip} ${styles.chipRotate}${tagFading ? ` ${styles.chipFading}` : ''} ${
                    activeTag.kind === 'offer' ? styles.chipOffer
                    : activeTag.kind === 'warn' ? styles.chipWarn
                    : activeTag.kind === 'good' ? styles.chipGood : ''
                  }`}
                  title={activeTag.text}
                >
                  {activeTag.text}
                </span>
              )}
            </>
          )}
        </div>

        {hasRating && !isOutOfStock && (
          <div className={styles.ratingBadge} aria-label={`Rated ${(product.rating as number).toFixed(1)} out of 5${(product.reviewCount ?? 0) > 0 ? ` from ${product.reviewCount} reviews` : ''}`}>
            <span>{(product.rating as number).toFixed(1)}</span>
            <span className={styles.star} aria-hidden="true">★</span>
            {(product.reviewCount ?? 0) > 0 && <span className={styles.ratingCount}>{product.reviewCount}</span>}
          </div>
        )}

        <button
          type="button"
          className={`${styles.wish}${wished ? ` ${styles.wishOn}` : ''}${wishPop ? ` ${styles.wishPop}` : ''}`}
          onClick={handleWish}
          aria-pressed={wished}
          aria-label={wished ? `Remove ${name} from wishlist` : `Add ${name} to wishlist`}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill={wished ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>

      <div className={styles.body}>
        {product.category && <span className={styles.eyebrow}>{product.category}</span>}

        <h3 className={styles.name}>
          <Link href={target} className={styles.link}>{name}</Link>
        </h3>

        <div className={styles.priceRow}>
          <span className={styles.price}>{isFromPrice ? `From ${formatINR(shownPrice)}` : formatINR(price)}</span>
          {discount && originalPrice ? <span className={styles.was}>{formatINR(originalPrice)}</span> : null}
          {discount ? <span className={styles.off}>{discount}% off</span> : null}
        </div>
      </div>
    </article>
  );
}
