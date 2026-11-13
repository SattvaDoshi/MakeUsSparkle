
'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import ProductCard from '@/components/product/ProductCard';
import { fetchCatalogProducts, type CatalogProduct } from '@/lib/catalogApi';
import SortFilter, { sortProducts, type SortOption } from '@/components/ui/SortFilter';
import styles from './ProductListing.module.css';
export const ALL_PRODUCTS = [
  {
    id: 1,
    name: 'Dainty Layered Necklace',
    type: 'necklace',
    subtype: 'dainty',
    category: "Women's Jewellery",
    badge: 'Best Seller',
    rating: 4.7,
    reviewCount: 248,
    description: 'A beautifully crafted multi-strand layered necklace featuring delicate 18k gold-plated chains at three varying lengths.',
    offer: '41% OFF · Limited Time Deal — Ends Tonight',
    sku: 'MJN-4421',
    stock: 7,
    price: 1299,
    originalPrice: 2199,
    href: '/products/dainty-layered-necklace',
    images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=85'],
    colors: [{ label: 'Gold', hex: '#c9a84c' }, { label: 'Silver', hex: '#b8b8b8' }, { label: 'Rose Gold', hex: '#e8a090' }],
  },
  {
    id: 2,
    name: 'Pearl Pendant Necklace',
    type: 'necklace',
    subtype: 'pendant',
    category: "Women's Jewellery",
    badge: 'Sale',
    rating: 4.5,
    reviewCount: 134,
    description: 'A timeless single-pearl pendant suspended on a slim 18k gold-plated chain.',
    offer: '24% OFF · Weekend Special',
    sku: 'MJN-4422',
    stock: 12,
    price: 2499,
    originalPrice: 3299,
    href: '/products/pearl-pendant-necklace',
    images: ['https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=600&q=85'],
    colors: [{ label: 'White Pearl', hex: '#f0ece0' }, { label: 'Gold Chain', hex: '#c9a84c' }],
  },
  {
    id: 3,
    name: 'Layered Gold Chain',
    type: 'necklace',
    subtype: 'layered',
    category: "Women's Jewellery",
    badge: 'Trending',
    rating: 4.6,
    reviewCount: 192,
    description: 'Three interlinked gold chains in varying weights create an effortless layered look.',
    offer: 'Buy 2 Get 15% OFF on entire jewellery',
    sku: 'MJN-4423',
    stock: 20,
    price: 1599,
    originalPrice: null,
    href: '/products/layered-gold-chain',
    images: ['https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=85'],
    colors: [{ label: 'Gold', hex: '#c9a84c' }, { label: 'Silver', hex: '#b8b8b8' }],
  },
  {
    id: 4,
    name: 'Gold Hoop Earrings',
    type: 'earrings',
    subtype: 'hoops',
    category: "Women's Jewellery",
    badge: 'New',
    rating: 4.8,  
    reviewCount: 312,
    description: 'Classic oversized hoops in high-polish 18k gold plating.',
    offer: 'Flat ₹200 OFF on orders above ₹799',
    sku: 'MJE-2201',
    stock: 15,
    price: 899,
    originalPrice: null,
    href: '/products/gold-hoop-earrings',
    images: ['https://images.unsplash.com/photo-1588444650733-d0f07d323dde?w=600&q=85'],
    colors: [{ label: 'Gold', hex: '#c9a84c' }, { label: 'Silver', hex: '#b8b8b8' }, { label: 'Rose Gold', hex: '#e8a090' }],
  },
  {
    id: 5,
    name: 'Minimal Stud Earrings',
    type: 'earrings',
    subtype: 'studs',
    category: "Women's Jewellery",
    badge: 'Best Seller',
    rating: 4.9,
    reviewCount: 540,
    description: 'Barely-there dome studs that sit flush against the earlobe.',
    offer: '31% OFF · Most Loved Pick',
    sku: 'MJE-2202',
    stock: 30,
    price: 549,
    originalPrice: 799,
    href: '/products/minimal-studs',
    images: ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=85'],
    colors: [{ label: 'Silver', hex: '#b8b8b8' }, { label: 'Gold', hex: '#c9a84c' }, { label: 'Rose Gold', hex: '#e8a090' }, { label: 'Olive', hex: '#5a6b2e' }],
  },
  {
    id: 6,
    name: 'Korean Ear Cuffs',
    type: 'earrings',
    subtype: 'korean',
    category: "Women's Jewellery",
    badge: 'New',
    rating: 4.6,
    reviewCount: 88,
    description: 'Inspired by K-jewellery trends — slim cuffs wrap the upper ear cartilage.',
    offer: 'New Arrival — Get ₹100 OFF on first order',
    sku: 'MJE-2203',
    stock: 18,
    price: 699,
    originalPrice: null,
    href: '/products/korean-ear-cuffs',
    images: ['https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=600&q=85'],
    colors: [{ label: 'Gold', hex: '#c9a84c' }, { label: 'Silver', hex: '#b8b8b8' }],
  },
  {
    id: 7,
    name: 'Beaded Charm Bracelet',
    type: 'bracelets',
    subtype: 'beaded',
    category: "Women's Jewellery",
    badge: 'New',
    rating: 4.4,
    reviewCount: 76,
    description: 'Natural stone beads on a durable elastic cord with a gold-plated charm.',
    offer: 'Buy 2 Save ₹150',
    sku: 'MJB-3301',
    stock: 25,
    price: 749,
    originalPrice: null,
    href: '/products/beaded-bracelet',
    images: ['https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&q=85'],
    colors: [{ label: 'Olive', hex: '#7a8e3c' }, { label: 'Terracotta', hex: '#c4704a' }, { label: 'Sand', hex: '#d9c49c' }],
  },
  {
    id: 8,
    name: 'Kada Bangle Set',
    type: 'bracelets',
    subtype: 'kada',
    category: "Women's Jewellery",
    badge: null,
    rating: 4.5,
    reviewCount: 110,
    description: 'A set of three rigid bangles in antique gold with hand-engraved floral motifs.',
    offer: '27% OFF · Festive Season Deal',
    sku: 'MJB-3302',
    stock: 9,
    price: 1899,
    originalPrice: 2599,
    href: '/products/kada-bangle',
    images: ['https://images.unsplash.com/photo-1612817288484-6f916006741a?w=600&q=85'],
    colors: [{ label: 'Antique Gold', hex: '#b8902b' }, { label: 'Gold', hex: '#c9a84c' }, { label: 'Oxidised', hex: '#555a48' }],
  },
  {
    id: 9,
    name: 'Minimal Chain Bracelet',
    type: 'bracelets',
    subtype: 'chain',
    category: "Women's Jewellery",
    badge: null,
    rating: 4.3,
    reviewCount: 64,
    description: 'Ultra-thin rhodium-plated chain bracelet with an adjustable slider clasp.',
    offer: 'Free Gift Wrap on orders above ₹999',
    sku: 'MJB-3303',
    stock: 22,
    price: 999,
    originalPrice: null,
    href: '/products/minimal-bracelet',
    images: ['https://images.unsplash.com/photo-1612817288484-6f916006741a?w=600&q=85'],
    colors: [{ label: 'Silver', hex: '#b8b8b8' }, { label: 'Gold', hex: '#c9a84c' }],
  },
  {
    id: 10,
    name: 'Diamond Ring',
    type: 'rings',
    category: "Women's Jewellery",
    badge: 'Best Seller',
    rating: 4.8,
    reviewCount: 290,
    description: 'A brilliant-cut cubic zirconia set in a four-prong silver-plated band.',
    offer: '₹500 OFF on orders above ₹2499',
    sku: 'MJR-5501',
    stock: 11,
    price: 2999,
    originalPrice: null,
    href: '/products/diamond-ring',
    images: ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=85'],
    colors: [{ label: 'Silver', hex: '#b8b8b8' }, { label: 'Gold', hex: '#c9a84c' }, { label: 'Rose Gold', hex: '#e8a090' }],
  },
  {
    id: 11,
    name: 'Minimal Gold Ring',
    type: 'rings',
    category: "Women's Jewellery",
    badge: null,
    rating: 4.6,
    reviewCount: 155,
    description: 'A slim, stackable 18k gold-plated band with a smooth domed profile.',
    offer: 'Buy 2 Rings Get 20% OFF',
    sku: 'MJR-5502',
    stock: 35,
    price: 999,
    originalPrice: null,
    href: '/products/minimal-ring',
    images: ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=85'],
    colors: [{ label: 'Gold', hex: '#c9a84c' }, { label: 'Silver', hex: '#b8b8b8' }],
  },
  {
    id: 12,
    name: 'Couple Rings Set',
    type: 'rings',
    category: "Women's Jewellery",
    badge: 'Trending',
    rating: 4.7,
    reviewCount: 203,
    description: "Two matching bands — matte black and silver — designed as a couple's set.",
    offer: 'Perfect Gift — Free Engraving on this set',
    sku: 'MJR-5503',
    stock: 14,
    price: 1999,
    originalPrice: null,
    href: '/products/couple-rings',
    images: ['https://images.unsplash.com/photo-1588444650733-d0f07d323dde?w=600&q=85'],
    colors: [{ label: 'Black', hex: '#1e2310' }, { label: 'Silver', hex: '#b8b8b8' }],
  },
  {
    id: 13,
    name: 'Elegant Hair Clip',
    type: 'hair-accessories',
    category: 'Hair Accessories',
    badge: null,
    rating: 4.3,
    reviewCount: 58,
    description: 'A sturdy alligator-style clip finished in high-polish gold.',
    offer: 'Free Shipping on this item',
    sku: 'MJH-6601',
    stock: 40,
    price: 499,
    originalPrice: null,
    href: '/products/hair-clip',
    images: ['https://images.unsplash.com/photo-1591206422576-7e00ff5f7db7?w=600&q=85'],
    colors: [{ label: 'Gold', hex: '#c9a84c' }, { label: 'Silver', hex: '#b8b8b8' }, { label: 'Olive', hex: '#5a6b2e' }],
  },
  {
    id: 14,
    name: 'Pearl Hair Band',
    type: 'hair-accessories',
    category: 'Hair Accessories',
    badge: 'New',
    rating: 4.5,
    reviewCount: 43,
    description: 'A satin-wrapped headband dotted with hand-placed faux pearls.',
    offer: 'New Arrival — Get ₹100 OFF on first order',
    sku: 'MJH-6602',
    stock: 28,
    price: 799,
    originalPrice: null,
    href: '/products/hair-band',
    images: ['https://images.unsplash.com/photo-1591206422576-7e00ff5f7db7?w=600&q=85'],
    colors: [{ label: 'White', hex: '#f5f0e8' }, { label: 'Blush', hex: '#e8c4b8' }],
  },
  {
    id: 16,
    name: 'Luxury Gift Box',
    type: 'gift-boxes',
    category: 'Gift Boxes',
    badge: 'Best Seller',
    rating: 4.9,
    reviewCount: 182,
    description: 'A premium rigid gift box lined in ivory satin, curated with your choice of jewellery.',
    offer: 'Customise FREE · Delivery in 2–3 days',
    sku: 'MGF-7701',
    stock: 8,
    price: 2499,
    originalPrice: null,
    href: '/products/gift-box',
    images: ['https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&q=85'],
    colors: [{ label: 'Gold', hex: '#c9a84c' }, { label: 'Ivory', hex: '#f5f0e8' }, { label: 'Olive', hex: '#5a6b2e' }],
  },
  {
    id: 18,
    name: 'Personalised Keychain',
    type: 'keychains',
    category: 'Key Chain/Charm',
    badge: 'New',
    rating: 4.6,
    reviewCount: 71,
    description: 'A heavy-duty metal keychain with a blank oval tag — perfect for engraving.',
    offer: 'Personalise FREE of charge',
    sku: 'MGK-8801',
    stock: 33,
    price: 399,
    originalPrice: null,
    href: '/products/keychain',
    images: ['https://images.unsplash.com/photo-1582143570735-ebf7c44a5c54?w=600&q=85'],
    colors: [{ label: 'Black', hex: '#1e2310' }, { label: 'Silver', hex: '#b8b8b8' }, { label: 'Gold', hex: '#c9a84c' }],
  },
  {
    id: 20,
    name: 'Anime Fan Combo',
    type: 'fan-combos',
    category: 'Fan Box',
    badge: 'Trending',
    rating: 4.7,
    reviewCount: 128,
    description: 'A curated fan box — character charm necklace, enamel pin badge, and photo card.',
    offer: 'Customise the box lid FREE',
    sku: 'MGX-9901',
    stock: 10,
    price: 1999,
    originalPrice: null,
    href: '/products/anime-combo',
    images: ['https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=600&q=85'],
    colors: [{ label: 'Default', hex: '#c9a84c' }, { label: 'Dark', hex: '#1e2310' }],
  },
  {
    id: 22,
    name: 'Custom Name Charm',
    type: 'custom-charm',
    category: 'Key Chain/Charm',
    badge: 'Best Seller',
    rating: 4.9,
    reviewCount: 302,
    description: 'A hand-stamped gold-plated charm with a name of your choice (up to 8 characters).',
    offer: 'Personalise FREE — Ships in 2 days',
    sku: 'MGC-1101',
    stock: 50,
    price: 799,
    originalPrice: null,
    href: '/products/custom-charm',
    images: ['https://images.unsplash.com/photo-1612817288484-6f916006741a?w=600&q=85'],
    colors: [{ label: 'Gold', hex: '#c9a84c' }, { label: 'Silver', hex: '#b8b8b8' }],
  },
  {
    id: 24,
    name: 'Festive Combo Set',
    type: 'curated-combos',
    category: 'Curated Combos',
    badge: 'Trending',
    rating: 4.8,
    reviewCount: 161,
    description: 'Curated trio — layered necklace, jhumka earrings, and a stack of four bangles.',
    offer: '25% OFF · Festive Season — Ends Sunday',
    sku: 'MCC-2201',
    stock: 7,
    price: 2999,
    originalPrice: 3999,
    href: '/products/festive-combo',
    images: ['https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&q=85'],
    colors: [{ label: 'Gold', hex: '#c9a84c' }, { label: 'Antique', hex: '#b8902b' }],
  },
];

const FILTER_TAGS = ['All', 'New', 'Trending', 'Sale', 'Best Seller'];

type Product = ((typeof ALL_PRODUCTS)[number] | CatalogProduct) & {
  tags?: string[];
  categorySlug?: string;
};

export default function ProductsPage({
  type,
  subtype,
  gender,
  embedded = false,
  products,
  productLinkBase,
  loading: propLoading,
}: {
  type: string;
  subtype?: string;
  gender?: string;
  embedded?: boolean;
  products?: Product[];
  productLinkBase?: string;
  loading?: boolean;
}) {
  const [activeTag, setActiveTag] = useState('All');
  const [dynamicProducts, setDynamicProducts] = useState<Product[]>([]);
  const [sort, setSort] = useState<SortOption>('default');
  const [internalLoading, setInternalLoading] = useState(products ? false : true);
  const isLoading = propLoading !== undefined ? propLoading : internalLoading;

  // First screen shows 16 pieces; after that more load automatically as the shopper nears the bottom.
  const ITEMS_PER_PAGE = 16;
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;

    if (products) {
      setDynamicProducts(products);
      setInternalLoading(false);
      return () => {
        mounted = false;
      };
    }

    setInternalLoading(true);
    fetchCatalogProducts()
      .then((products) => {
        if (mounted) {
          setDynamicProducts(products as Product[]);
          setInternalLoading(false);
        }
      })
      .catch(() => {
        if (mounted) {
          setDynamicProducts([]);
          setInternalLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [products]);

  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [type, subtype, gender, activeTag, sort]);

  const filtered = useMemo(() => {
    let list: Product[] = [...dynamicProducts];

    if (gender) {
      list = list.filter((p) => {
        const productGender = (p as Product & { gender?: string }).gender || 'unisex';

        if (gender === 'women') {
          return productGender === 'women' || productGender === 'unisex';
        }

        if (gender === 'men') {
          return productGender === 'men' || productGender === 'unisex';
        }

        if (gender === 'kids') {
          return productGender === 'unisex' || (p.tags || []).some((tag) => /kid|child|children/i.test(tag));
        }

        return true;
      });
    }

    if (type) {
      list = list.filter((p) => p.type === type || p.categorySlug === type);
    }
    if (type && subtype) {
      const refined = list.filter((p) => {
        const productSubtype = ((p as any).subtype || '').toLowerCase();
        const tags = Array.isArray((p as any).tags) ? (p as any).tags.map((tag: string) => tag.toLowerCase()) : [];
        return productSubtype === subtype.toLowerCase() || tags.includes(subtype.toLowerCase());
      });

      if (refined.length > 0) {
        list = refined;
      }
    }
    if (activeTag !== 'All') {
      const normTag = activeTag.toLowerCase().trim();
      list = list.filter((p) => {
        const badge = String(p.badge || '').toLowerCase().trim();
        const productLabel = String((p as any).productLabel || '').toLowerCase().trim();
        const tags = Array.isArray((p as any).tags)
          ? (p as any).tags.map((t: string) => String(t).toLowerCase().trim())
          : [];
        return badge === normTag || productLabel === normTag || tags.includes(normTag);
      });
    }
    return sortProducts(list, sort);  
  }, [dynamicProducts, gender, activeTag, type, subtype, sort]);

  const totalItems = filtered.length;
  const shown = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);
  const hasMore = visibleCount < totalItems;

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) setVisibleCount((c) => Math.min(c + ITEMS_PER_PAGE, totalItems));
      },
      { rootMargin: '900px 0px' }, // start loading well before the shopper reaches the end
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, totalItems, visibleCount]);

  const displayType = type ? type.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '';
  const displaySubtype = subtype
    ? subtype.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : '';
  const pageTitle = displaySubtype ? `${displaySubtype} ${displayType}` : displayType || 'All Products';

  return (
    <div className={`${styles.root}${embedded ? ` ${styles.embedded}` : ''}`}>
      {!embedded && (
        <header className={styles.pageHeader}>
          <span className={styles.eyebrow}>Handcrafted · Ethically Made</span>
          <h1 className={styles.pageTitle}>{displaySubtype ? <><em>{displaySubtype}</em> {displayType}</> : <em>{pageTitle}</em>}</h1>
        </header>
      )}

      {/* Filter bar */}
      <div className={styles.toolbar}>
        <div className={styles.pills} role="tablist" aria-label="Filter pieces">
          {FILTER_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              role="tab"
              aria-selected={activeTag === tag}
              className={`${styles.pill}${activeTag === tag ? ` ${styles.pillOn}` : ''}`}
              onClick={() => setActiveTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
        <div className={styles.toolbarRight}>
          <span className={styles.count} aria-live="polite">{isLoading ? 'Loading…' : `${totalItems} ${totalItems === 1 ? 'piece' : 'pieces'}`}</span>
          <SortFilter value={sort} onChange={setSort} variant="olive" />
        </div>
      </div>

      {/* Grid */}
      <div className={styles.body}>
        <div className={styles.grid}>
          {isLoading ? (
            Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className={styles.skel} aria-hidden="true">
                <div className={styles.skelImg} />
                <div className={styles.skelLine} style={{ width: '40%' }} />
                <div className={styles.skelLine} style={{ width: '85%' }} />
                <div className={styles.skelLine} style={{ width: '30%' }} />
              </div>
            ))
          ) : totalItems === 0 ? (
            <div className={styles.empty}>
              <h3>Nothing here yet</h3>
              <p>{activeTag !== 'All' ? 'No pieces match this filter.' : 'New pieces are on the way.'}</p>
              {activeTag !== 'All' && (
                <button type="button" className={styles.emptyBtn} onClick={() => setActiveTag('All')}>Show all pieces</button>
              )}
            </div>
          ) : (
            shown.map((product, i) => (
              <div key={product.id} className={styles.item} style={{ animationDelay: `${Math.min((i % ITEMS_PER_PAGE) * 0.035, 0.4)}s` }}>
                <ProductCard product={product} productLinkBase={productLinkBase} />
              </div>
            ))
          )}
        </div>

        {/* Infinite scroll */}
        {!isLoading && hasMore && (
          <div ref={sentinelRef} className={styles.more} aria-hidden="true">
            <span className={styles.spinner} />
          </div>
        )}
        {!isLoading && !hasMore && totalItems > ITEMS_PER_PAGE && (
          <p className={styles.end}>You&apos;ve seen all {totalItems} pieces</p>
        )}
      </div>

    </div>
  );

}
