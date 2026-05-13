
'use client';

import { useState, useMemo, useEffect } from 'react';
import ProductCard from '@/components/product/ProductCard';
import UpperNav from '@/components/ui/UpperNav';
import { fetchCatalogProducts, type CatalogProduct } from '@/lib/catalogApi';
import SortFilter, { sortProducts, type SortOption } from '@/components/ui/SortFilter';
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
  productLinkBase,
}: {
  type: string;
  subtype?: string;
  gender?: string;
  embedded?: boolean;
  productLinkBase?: string;
}) {
    
  const [activeTag, setActiveTag] = useState('All');
  const [search, setSearch] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [dynamicProducts, setDynamicProducts] = useState<Product[]>([]);
const [sort, setSort] = useState<SortOption>('default');
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    let mounted = true;

    fetchCatalogProducts()
      .then((products) => {
        if (mounted) {
          setDynamicProducts(products as Product[]);
        }
      })
      .catch(() => {
        if (mounted) {
          setDynamicProducts([]);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    let list: Product[] = [...dynamicProducts];
    

    if (gender === 'women') {
      list = list.filter((p) => {
        const productGender = (p as Product & { gender?: string }).gender;
        return productGender === 'female' || productGender === 'unisex';
      });
    } else if (gender === 'men') {
      list = list.filter((p) => {
        const productGender = (p as Product & { gender?: string }).gender;
        return productGender === 'male' || productGender === 'unisex';
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
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
      );
    }
    if (activeTag !== 'All') {
      list = list.filter((p) => p.badge === activeTag || (p as any).tags?.includes(activeTag));
    }
    return sortProducts(list, sort);  
  }, [dynamicProducts, gender, activeTag, search, type, subtype, sort])

  const displayType = type ? type.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '';
  const displaySubtype = subtype
    ? subtype.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : '';
  const pageTitle = displaySubtype ? `${displaySubtype} ${displayType}` : displayType || 'All Products';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Jost:wght@300;400;500;600;700&display=swap');

        :root {
          --pp-cream:   #faf8f3;
          --pp-cream2:  #f3ede1;
          --pp-white:   #ffffff;
          --pp-gd:      #253d18;
          --pp-gs:      #527a3e;
          --pp-gp:      #ddecd1;
          --pp-gt:      #eff6ea;
          --pp-gold:    #a07820;
          --pp-t1:      #1c1c17;
          --pp-t3:      #828278;
          --pp-t4:      #b4b4a4;
          --pp-bs:      rgba(60,90,35,0.09);
          --pp-bm:      rgba(60,90,35,0.18);
        }

        *, *::before, *::after { box-sizing: border-box; }

        .pp-root {
          min-height: 100vh;
          background: var(--pp-cream);
          font-family: 'Jost', sans-serif;
          color: var(--pp-t1);
          padding-top: 40px
        }
        .pp-root--embedded {
          padding-top: 0
          min-height: unset;
          background: transparent;
        }

        /* ── TOOLBAR ── */
        .pp-toolbar {
          position: sticky; top: 0; z-index: 50;
          background: var(--pp-white);
          border-bottom: 1px solid var(--pp-bs);
          padding: 12px 40px;
          display: flex; align-items: center; gap: 10px;
          flex-wrap: wrap;
          transition: box-shadow .3s;
        }
        .pp-toolbar--scrolled { box-shadow: 0 4px 20px rgba(26,36,27,.09); }
        .pp-root--embedded .pp-toolbar {
          padding: 12px 40px;
        }

        /* search */
        .pp-search { position: relative; flex-shrink: 0; }
        .pp-search svg {
          position: absolute; left: 12px; top: 50%;
          transform: translateY(-50%);
          width: 13px; height: 13px;
          stroke: var(--pp-t3); pointer-events: none;
        }
        .pp-search input {
          font-family: 'Jost', sans-serif;
          font-size: 12px; color: var(--pp-t1);
          background: var(--pp-cream);
          border: 1.5px solid var(--pp-bs);
          border-radius: 3px;
          padding: 8px 14px 8px 32px;
          outline: none; width: 200px;
          transition: all .18s;
        }
        .pp-search input:focus {
          background: var(--pp-white);
          border-color: var(--pp-gs);
          box-shadow: 0 0 0 3px rgba(82,122,62,.1);
        }
        .pp-search input::placeholder { color: var(--pp-t4); font-size: 11px; }

        .pp-divider {
          width: 1px; height: 22px;
          background: var(--pp-bs); flex-shrink: 0;
        }

        /* pills */
        .pp-pills { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
        .pp-pill {
          font-family: 'Jost', sans-serif;
          font-size: 10px; font-weight: 600;
          letter-spacing: .08em; text-transform: uppercase;
          color: var(--pp-t3); padding: 6px 14px;
          border: 1.5px solid var(--pp-bs);
          border-radius: 3px;
          background: transparent; cursor: pointer;
          transition: all .17s ease; white-space: nowrap;
        }
        .pp-pill:hover {
          color: var(--pp-gd); border-color: var(--pp-bm);
          background: var(--pp-gt);
        }
        .pp-pill--active {
          color: #fff !important;
          background: var(--pp-gd) !important;
          border-color: var(--pp-gd) !important;
          box-shadow: 0 2px 8px rgba(37,61,24,.22);
        }

        .pp-toolbar-right {
          margin-left: auto;
          display: flex; align-items: center; gap: 8px;
        }
        .pp-count-chip {
          font-size: 10px; letter-spacing: .06em; text-transform: uppercase;
          color: var(--pp-t4); white-space: nowrap;
          font-family: 'Jost', sans-serif;
        }

        /* ── PAGE TITLE (non-embedded) ── */
        .pp-page-header {
          padding: 40px 40px 8px;
          border-bottom: 1px solid var(--pp-bs);
          
        }
        .pp-page-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(1.6rem, 3vw, 2.2rem);
          font-weight: 400;
          color: var(--pp-t1);
          letter-spacing: -.01em;
          line-height: 1.1;
        }
        .pp-page-title em { font-style: italic; color:#1a2e0f; font-weight: 200; font-size: clamp(2rem, 4vw, 2.8rem); }
        .pp-page-subtitle {
          margin-top: 6px;
          font-size: 11px; color: var(--pp-t3); letter-spacing: .06em;
          text-transform: uppercase; font-family: 'Jost', sans-serif;
        }

        /* ── PAGE BODY ── */
        .pp-body {
          padding: 24px 40px 80px;
        }
        .pp-root--embedded .pp-body {
          padding: 24px 40px 60px;
        }

        /* ── PRODUCT GRID ── */
        .pp-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }
        .pp-root--embedded .pp-grid {
          grid-template-columns: repeat(4, 1fr);
        }

        .pp-item {
          opacity: 0;
          transform: translateY(8px);
          animation: ppItemIn .38s ease forwards;
        }
        @keyframes ppItemIn {
          to { opacity: 1; transform: translateY(0); }
        }

        /* ── EMPTY STATE ── */
        .pp-empty {
          grid-column: 1 / -1;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 80px 20px; gap: 12px;
        }
        .pp-empty-icon {
          width: 52px; height: 52px; border-radius: 50%;
          border: 1.5px dashed var(--pp-bs);
          display: flex; align-items: center; justify-content: center;
        }
        .pp-empty-icon svg { width: 20px; height: 20px; stroke: var(--pp-t4); }
        .pp-empty h3 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1rem; font-weight: 400; color: var(--pp-t3); margin: 0;
        }
        .pp-empty p { font-size: 11px; color: var(--pp-t4); margin: 0; }

        /* ── TABLET 769–1024px ── */
        @media (max-width: 1024px) {
          .pp-grid { grid-template-columns: repeat(3, 1fr); gap: 16px; }
          .pp-toolbar, .pp-body, .pp-page-header { padding-left: 28px; padding-right: 28px; }
          .pp-root--embedded .pp-toolbar,
          .pp-root--embedded .pp-body { padding-left: 28px; padding-right: 28px; }
        }

        /* ── TABLET SMALL 601–768px ── */
        @media (max-width: 768px) {
          .pp-grid { grid-template-columns: repeat(2, 1fr); gap: 14px; }
          .pp-toolbar, .pp-body, .pp-page-header { padding-left: 20px; padding-right: 20px; }
          .pp-root--embedded .pp-toolbar,
          .pp-root--embedded .pp-body { padding-left: 20px; padding-right: 20px; }
        }

        /* ── MOBILE ≤ 600px ── */
        @media (max-width: 600px) {
          /* toolbar */
          .pp-toolbar {
            padding: 10px 14px 8px;
            gap: 0;
            row-gap: 8px;
            flex-wrap: wrap;
          }
          .pp-root--embedded .pp-toolbar {
            padding: 10px 14px 8px;
          }
            /* ADD this inside the mobile media query */
.pp-root--embedded .pp-toolbar {
  padding-top: 6px;
}

          .pp-search { order: 1; flex: 1; min-width: 0; }
          .pp-search input { width: 100%; min-width: 0; border-radius: 3px; }

          .pp-toolbar-right { order: 2; margin-left: 10px; flex-shrink: 0; }

          .pp-pills {
            order: 3;
            flex: 0 0 100%;
            flex-wrap: nowrap;
            overflow-x: auto;
            scrollbar-width: none;
            gap: 6px;
            padding-bottom: 2px;
          }
          .pp-pills::-webkit-scrollbar { display: none; }
          .pp-pill { font-size: 9px; padding: 5px 12px; flex-shrink: 0; }

          .pp-divider { display: none; }

          /* page header */
          .pp-page-header { padding: 20px 14px 16px;}
          .pp-page-title { font-size: 1.4rem; }
          .pp-page-subtitle { font-size: 10px; }

          /* body — proper horizontal padding on mobile */
          .pp-body {
            padding: 16px 14px 60px;
          }
          .pp-root--embedded .pp-body {
            padding: 16px 14px 48px;
          }

          /* grid — consistent gap, proper sizing */
          .pp-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }
          .pp-root--embedded .pp-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }

          /* ensure cards fill their cells */
          .pp-item {
            min-width: 0;
          }
        }

        /* ── SMALL MOBILE ≤ 380px ── */
        @media (max-width: 380px) {
          .pp-toolbar { padding: 8px 12px 6px; }
          .pp-page-header { padding: 16px 12px 14px; }
          .pp-body, .pp-root--embedded .pp-body { padding-left: 12px; padding-right: 12px; }
          .pp-grid { gap: 8px; }
          .pp-page-title { font-size: 1.25rem; }
        }
      `}</style>

      <div className={`pp-root${embedded ? ' pp-root--embedded' : ''}`}>
         {!embedded && <UpperNav />}
        {!embedded && (
          <div className="pp-page-header">
            <div className="pp-page-title">
              {displaySubtype
                ? <><em>{displaySubtype}</em> {displayType}</>
                : <em>{pageTitle}</em>}
            </div>
            <div className="pp-page-subtitle">
              Handcrafted · Ethically Made · {filtered.length} pieces
            </div>
          </div>
        )}

        {/* Toolbar */}
        <div className={`pp-toolbar${scrolled ? ' pp-toolbar--scrolled' : ''}`}>
          <div className="pp-search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search pieces…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="pp-divider" />

          <div className="pp-pills">
            {FILTER_TAGS.map((tag) => (
              <button
                key={tag}
                className={`pp-pill${activeTag === tag ? ' pp-pill--active' : ''}`}
                onClick={() => setActiveTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>

          <div className="pp-toolbar-right">
            <SortFilter value={sort} onChange={setSort} variant="olive" />
            <span className="pp-count-chip">{filtered.length} pieces</span>
          </div>
        </div>

        {/* Grid */}
        <div className="pp-body">
          <div className="pp-grid">
            {filtered.length === 0 ? (
              <div className="pp-empty">
                <div className="pp-empty-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                  </svg>
                </div>
                <h3>Nothing found</h3>
                <p>Try adjusting your filters or search</p>
              </div>
            ) : (
              filtered.map((product, i) => (
                <div
                  key={product.id}
                  className="pp-item"
                  style={{ animationDelay: `${Math.min(i * 0.04, 0.5)}s` }}
                >
                  <ProductCard product={product} productLinkBase={productLinkBase} 
                  
                  
              />
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </>
  );
}