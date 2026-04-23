'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import ProductCard from '@/components/product/ProductCard';
import UpperNav from '@/components/ui/UpperNav';

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
    images: [
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=85',
      // 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=85',
    ],
    colors: [
      { label: 'Gold', hex: '#c9a84c' },
      { label: 'Silver', hex: '#b8b8b8' },
      { label: 'Rose Gold', hex: '#e8a090' },
    ],
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
    images: [
      'https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=600&q=85',
      // 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=85',
    ],
    colors: [
      { label: 'White Pearl', hex: '#f0ece0' },
      { label: 'Gold Chain', hex: '#c9a84c' },
      { label: 'Blush Pearl', hex: '#e8c4b8' },
    ],
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
    images: [
      'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=85',
    ],
    colors: [
      { label: 'Gold', hex: '#c9a84c' },
      { label: 'Silver', hex: '#b8b8b8' },
    ],
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
    images: [
      'https://images.unsplash.com/photo-1588444650733-d0f07d323dde?w=600&q=85',
    ],
    colors: [
      { label: 'Gold', hex: '#c9a84c' },
      { label: 'Silver', hex: '#b8b8b8' },
      { label: 'Rose Gold', hex: '#e8a090' },
    ],
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
    images: [
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=85',
    ],
    colors: [
      { label: 'Silver', hex: '#b8b8b8' },
      { label: 'Gold', hex: '#c9a84c' },
      { label: 'Rose Gold', hex: '#e8a090' },
      { label: 'Olive', hex: '#5a6b2e' },
    ],
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
    images: [
      'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=600&q=85',
    ],
    colors: [
      { label: 'Gold', hex: '#c9a84c' },
      { label: 'Silver', hex: '#b8b8b8' },
    ],
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
    images: [
      'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&q=85',
    ],
    colors: [
      { label: 'Olive', hex: '#7a8e3c' },
      { label: 'Terracotta', hex: '#c4704a' },
      { label: 'Sand', hex: '#d9c49c' },
    ],
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
    images: [
      'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=600&q=85',
    ],
    colors: [
      { label: 'Antique Gold', hex: '#b8902b' },
      { label: 'Gold', hex: '#c9a84c' },
      { label: 'Oxidised', hex: '#555a48' },
    ],
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
    images: [
      'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=600&q=85',
    ],
    colors: [
      { label: 'Silver', hex: '#b8b8b8' },
      { label: 'Gold', hex: '#c9a84c' },
    ],
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
    images: [
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=85',
    ],
    colors: [
      { label: 'Silver', hex: '#b8b8b8' },
      { label: 'Gold', hex: '#c9a84c' },
      { label: 'Rose Gold', hex: '#e8a090' },
    ],
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
    images: [
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=85',
    ],
    colors: [
      { label: 'Gold', hex: '#c9a84c' },
      { label: 'Silver', hex: '#b8b8b8' },
    ],
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
    images: [
      'https://images.unsplash.com/photo-1588444650733-d0f07d323dde?w=600&q=85',
    ],
    colors: [
      { label: 'Black', hex: '#1e2310' },
      { label: 'Silver', hex: '#b8b8b8' },
    ],
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
    images: [
      'https://images.unsplash.com/photo-1591206422576-7e00ff5f7db7?w=600&q=85',
    ],
    colors: [
      { label: 'Gold', hex: '#c9a84c' },
      { label: 'Silver', hex: '#b8b8b8' },
      { label: 'Olive', hex: '#5a6b2e' },
    ],
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
    images: [
      'https://images.unsplash.com/photo-1591206422576-7e00ff5f7db7?w=600&q=85',
    ],
    colors: [
      { label: 'White', hex: '#f5f0e8' },
      { label: 'Blush', hex: '#e8c4b8' },
    ],
  },
  {
    id: 15,
    name: 'Floral Hair Pins',
    type: 'hair-accessories',
    category: 'Hair Accessories',
    badge: null,
    rating: 4.2,
    reviewCount: 37,
    description: 'A set of four bobby pins each topped with a hand-painted enamel flower.',
    offer: 'Set of 4 · Great Value',
    sku: 'MJH-6603',
    stock: 50,
    price: 599,
    originalPrice: null,
    href: '/products/hair-pins',
    images: [
      'https://images.unsplash.com/photo-1591206422576-7e00ff5f7db7?w=600&q=85',
    ],
    colors: [
      { label: 'Rose', hex: '#e8a090' },
      { label: 'Lavender', hex: '#b8a0d8' },
      { label: 'Ivory', hex: '#f5f0e8' },
    ],
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
    images: [
      'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&q=85',
    ],
    colors: [
      { label: 'Gold', hex: '#c9a84c' },
      { label: 'Ivory', hex: '#f5f0e8' },
      { label: 'Olive', hex: '#5a6b2e' },
    ],
  },
  {
    id: 17,
    name: 'Birthday Gift Box',
    type: 'gift-boxes',
    category: 'Gift Boxes',
    badge: 'Trending',
    rating: 4.8,
    reviewCount: 96,
    description: 'A cheerful birthday-themed gift box with a necklace, studs, and charm bracelet.',
    offer: '20% OFF · Birthday Special',
    sku: 'MGF-7702',
    stock: 5,
    price: 1999,
    originalPrice: 2499,
    href: '/products/birthday-box',
    images: [
      'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&q=85',
    ],
    colors: [
      { label: 'Pink', hex: '#f4c1c0' },
      { label: 'Gold', hex: '#c9a84c' },
      { label: 'White', hex: '#f5f0e8' },
    ],
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
    images: [
      'https://images.unsplash.com/photo-1582143570735-ebf7c44a5c54?w=600&q=85',
    ],
    colors: [
      { label: 'Black', hex: '#1e2310' },
      { label: 'Silver', hex: '#b8b8b8' },
      { label: 'Gold', hex: '#c9a84c' },
    ],
  },
  {
    id: 19,
    name: 'Metal Charm Keychain',
    type: 'keychains',
    category: 'Key Chain/Charm',
    badge: null,
    rating: 4.4,
    reviewCount: 49,
    description: 'Polished stainless-steel keychain with three interchangeable charms.',
    offer: 'Add a photo charm for free this week',
    sku: 'MGK-8802',
    stock: 20,
    price: 499,
    originalPrice: null,
    href: '/products/charm-keychain',
    images: [
      'https://images.unsplash.com/photo-1582143570735-ebf7c44a5c54?w=600&q=85',
    ],
    colors: [
      { label: 'Silver', hex: '#b8b8b8' },
      { label: 'Gold', hex: '#c9a84c' },
    ],
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
    images: [
      'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=600&q=85',
    ],
    colors: [
      { label: 'Default', hex: '#c9a84c' },
      { label: 'Dark', hex: '#1e2310' },
    ],
  },
  {
    id: 21,
    name: 'K-pop Fan Combo',
    type: 'fan-combos',
    category: 'Fan Box',
    badge: 'New',
    rating: 4.8,
    reviewCount: 214,
    description: 'Photo card holder necklace, bias acrylic charm, and customisable box lid.',
    offer: "Upload your idol's photo · Box customised FREE",
    sku: 'MGX-9902',
    stock: 6,
    price: 2199,
    originalPrice: 2599,
    href: '/products/kpop-combo',
    images: [
      'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=600&q=85',
    ],
    colors: [
      { label: 'Purple', hex: '#7a6bff' },
      { label: 'Pink', hex: '#f4c1c0' },
      { label: 'Black', hex: '#1e2310' },
    ],
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
    images: [
      'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=600&q=85',
    ],
    colors: [
      { label: 'Gold', hex: '#c9a84c' },
      { label: 'Silver', hex: '#b8b8b8' },
    ],
  },
  {
    id: 23,
    name: 'Initial Letter Charm',
    type: 'custom-charm',
    category: 'Key Chain/Charm',
    badge: null,
    rating: 4.7,
    reviewCount: 178,
    description: 'A single initial letter charm cast in solid brass, plated in gold or silver.',
    offer: 'Any initial, any font — Ships in 1 day',
    sku: 'MGC-1102',
    stock: 45,
    price: 699,
    originalPrice: null,
    href: '/products/initial-charm',
    images: [
      'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=600&q=85',
    ],
    colors: [
      { label: 'Silver', hex: '#b8b8b8' },
      { label: 'Gold', hex: '#c9a84c' },
    ],
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
    images: [
      'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&q=85',
    ],
    colors: [
      { label: 'Gold', hex: '#c9a84c' },
      { label: 'Antique', hex: '#b8902b' },
    ],
  },
  {
    id: 25,
    name: 'Bridal Combo Set',
    type: 'curated-combos',
    category: 'Curated Combos',
    badge: 'Best Seller',
    rating: 4.9,
    reviewCount: 88,
    description: 'Complete bridal set — choker, chandelier earrings, two bangles, and maang tikka.',
    offer: 'Free Express Shipping on Bridal Sets',
    sku: 'MCC-2202',
    stock: 4,
    price: 3999,
    originalPrice: null,
    href: '/products/bridal-combo',
    images: [
      'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&q=85',
    ],
    colors: [
      { label: 'Red Gold', hex: '#c0392b' },
      { label: 'Gold', hex: '#c9a84c' },
    ],
  },
];

const FILTER_TAGS = ['All', 'New', 'Trending', 'Sale', 'Best Seller'];
// const SORT_OPTIONS = [
//   { label: 'Featured', value: 'featured' },
//   { label: 'Price: Low–High', value: 'price_asc' },
//   { label: 'Price: High–Low', value: 'price_desc' },
//   { label: 'Newest First', value: 'newest' },
// ];

type Product = (typeof ALL_PRODUCTS)[number] & { tags?: string[] };

// function sortProducts(products: Product[], sortBy: string): Product[] {
//   const arr = [...products];
//   if (sortBy === 'price_asc') return arr.sort((a, b) => a.price - b.price);
//   if (sortBy === 'price_desc') return arr.sort((a, b) => b.price - a.price);
//   if (sortBy === 'newest') return arr.sort((a, b) => b.id - a.id);
//   return arr;
// }

export default function ProductsPage({
  type,
  subtype,
  embedded = false,
}: {
  type: string;
  subtype?: string;
  embedded?: boolean;
}) {
  const [activeTag, setActiveTag] = useState('All');
  // const [sortBy, setSortBy] = useState('featured');
  const [search, setSearch] = useState('');
  // const [sortOpen, setSortOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  // const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // useEffect(() => {
  //   const handleClickOutside = (e: MouseEvent) => {
  //     if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
  //       setSortOpen(false);
  //     }
  //   };
  //   document.addEventListener('mousedown', handleClickOutside);
  //   return () => document.removeEventListener('mousedown', handleClickOutside);
  // }, []);

  const filtered = useMemo(() => {
    let list: Product[] = ALL_PRODUCTS as Product[];
    if (type && subtype) {
      list = list.filter(
        (p) => p.type === type && (p as any).subtype?.toLowerCase() === subtype.toLowerCase()
      );
    } else if (type) {
      list = list.filter((p) => p.type === type);
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
    return list;
  }, [activeTag, search, type, subtype]);

  // const activeSortLabel = SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? 'Featured';
  const displayType = type ? type.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '';
  const displaySubtype = subtype
    ? subtype.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : '';
  const pageTitle = displaySubtype ? `${displaySubtype} ${displayType}` : displayType || 'All Products';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400;1,500&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

        :root {
          --sage-dark:   #3a5c3b;
          --sage:        #567a57;
          --sage-mid:    #789e79;
          --sage-light:  #b2cdb3;
          --sage-xlt:    #e6efe6;
          --sage-bg:     #f1f5f0;

          --beige-deep:  #c4b28e;
          --beige:       #e4d8c0;
          --beige-light: #f2e8d8;
          --beige-xlt:   #faf5ed;
          --beige-bg:    #fdf8f2;

          --gold:        #b8902b;
          --gold-lt:     #d4ae6a;
          --gold-xlt:    #f5e8ca;

          --ink:         #1a241b;
          --ink-70:      rgba(26,36,27,.7);
          --ink-45:      rgba(26,36,27,.45);
          --ink-20:      rgba(26,36,27,.20);
          --ink-08:      rgba(26,36,27,.08);

          --white:       #ffffff;
          --r-pill:      999px;
          --r-md:        12px;
          --r-lg:        20px;
        }

        *, *::before, *::after { box-sizing: border-box; }

        .pp-root {
          min-height: 100vh;
          background: var(--beige-bg);
          font-family: 'DM Sans', sans-serif;
          color: var(--ink);
        }

        /* ── NAV WRAPPER: gives transparent nav a solid sage bg ── */
        .pp-nav-wrap {
          background: var(--sage-dark);
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 2px 16px rgba(26,36,27,.18);
        }

        /* ── HERO BAND ── */
        .pp-hero {
          background: linear-gradient(130deg, var(--sage-dark) 0%, #4a7050 50%, var(--sage-mid) 100%);
          padding: 20px 48px 18px;
          position: relative;
          overflow: hidden;
        }
        .pp-hero::before {
          content: '';
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 70% 90% at 90% 60%, rgba(184,144,43,.2) 0%, transparent 65%),
            radial-gradient(ellipse 50% 70% at 5% 90%, rgba(232,228,208,.06) 0%, transparent 55%);
          pointer-events: none;
        }
        /* decorative bottom shimmer line */
        .pp-hero::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent 0%, rgba(212,174,106,.6) 40%, rgba(212,174,106,.6) 60%, transparent 100%);
        }

        .pp-hero-inner {
          position: relative; z-index: 1;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }

        /* breadcrumb */
        .pp-crumb {
          display: flex; align-items: center; gap: 6px;
          margin-bottom: 7px;
        }
        .pp-crumb a, .pp-crumb span {
          font-size: 10px; letter-spacing: .1em; text-transform: uppercase;
          color: rgba(255,255,255,.5); text-decoration: none;
          transition: color .18s;
        }
        .pp-crumb a:hover { color: rgba(255,255,255,.9); }
        .pp-crumb .sep { color: rgba(255,255,255,.22); font-size: 9px; }
        .pp-crumb .cur { color: rgba(255,255,255,.8); }

        /* page title */
        .pp-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(1.3rem, 2.8vw, 1.9rem);
          font-weight: 400;
          color: var(--white);
          margin: 0;
          line-height: 1.15;
          letter-spacing: -.01em;
        }
        .pp-title em { font-style: italic; color: var(--gold-lt); }

        /* right meta */
        .pp-hero-right {
          display: flex; flex-direction: column; align-items: flex-end; gap: 5px;
        }
        .pp-count-pill {
          background: rgba(255,255,255,.1);
          border: 1px solid rgba(255,255,255,.22);
          backdrop-filter: blur(8px);
          color: rgba(255,255,255,.85);
          font-size: 10px; letter-spacing: .09em; text-transform: uppercase;
          padding: 4px 13px; border-radius: var(--r-pill);
        }
        .pp-hero-tagline {
          font-size: 10px; letter-spacing: .08em; text-transform: uppercase;
          color: rgba(255,255,255,.38);
        }

        /* ── STICKY TOOLBAR ── */
        .pp-toolbar {
          position: sticky; top: 0; z-index: 50;
          background: var(--white);
          border-bottom: 1px solid var(--ink-20);
          padding: 9px 48px;
          display: flex; align-items: center; gap: 8px;
          flex-wrap: wrap;
          transition: box-shadow .3s;
        }
        .pp-toolbar--scrolled {
          box-shadow: 0 4px 20px rgba(26,36,27,.09);
        }

        /* search */
        .pp-search { position: relative; flex-shrink: 0; }
        .pp-search svg {
          position: absolute; left: 11px; top: 50%;
          transform: translateY(-50%);
          width: 13px; height: 13px;
          stroke: var(--ink-45); pointer-events: none;
        }
        .pp-search input {
          font-family: 'DM Sans', sans-serif;
          font-size: 12.5px; color: var(--ink);
          background: var(--beige-xlt);
          border: 1.5px solid var(--ink-20);
          border-radius: var(--r-pill);
          padding: 7px 14px 7px 31px;
          outline: none; width: 195px;
          transition: all .18s;
        }
        .pp-search input:focus {
          background: var(--white);
          border-color: var(--sage-mid);
          box-shadow: 0 0 0 3px rgba(120,158,121,.13);
        }
        .pp-search input::placeholder { color: var(--ink-45); font-size: 11.5px; }

        /* divider */
        .pp-divider {
          width: 1px; height: 20px;
          background: var(--ink-20); flex-shrink: 0;
        }

        /* pills */
        .pp-pills { display: flex; align-items: center; gap: 5px; flex-wrap: wrap; }
        .pp-pill {
          font-family: 'DM Sans', sans-serif;
          font-size: 10.5px; font-weight: 400;
          letter-spacing: .07em; text-transform: uppercase;
          color: var(--ink-70); padding: 6px 15px;
          border: 1.5px solid var(--ink-20);
          border-radius: var(--r-pill);
          background: transparent; cursor: pointer;
          transition: all .17s ease; white-space: nowrap;
        }
        .pp-pill:hover {
          color: var(--sage-dark);
          border-color: var(--sage-mid);
          background: var(--sage-xlt);
          transform: translateY(-1px);
        }
        .pp-pill--active {
          color: var(--white) !important;
          background: var(--sage-dark) !important;
          border-color: var(--sage-dark) !important;
          box-shadow: 0 3px 10px rgba(58,92,59,.28);
          transform: translateY(-1px);
        }

        /* toolbar right cluster */
        .pp-toolbar-right {
          margin-left: auto;
          display: flex; align-items: center; gap: 8px;
        }

        /* sort */
        .pp-sort { position: relative; }
        .pp-sort-btn {
          display: flex; align-items: center; gap: 6px;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px; color: var(--ink);
          background: var(--white);
          border: 1.5px solid var(--ink-20);
          border-radius: var(--r-pill);
          padding: 7px 15px; cursor: pointer;
          transition: all .17s; white-space: nowrap;
        }
        .pp-sort-btn:hover {
          border-color: var(--sage-mid);
          background: var(--sage-xlt);
          color: var(--sage-dark);
        }
        .pp-sort-icon { width: 11px; height: 11px; stroke: var(--ink-45); }
        .pp-sort-chevron {
          width: 10px; height: 10px;
          stroke: var(--ink-45);
          transition: transform .2s;
        }
        .pp-sort-chevron--open { transform: rotate(180deg); }

        .pp-sort-menu {
          position: absolute; top: calc(100% + 8px); right: 0;
          background: var(--white);
          border: 1.5px solid var(--ink-20);
          border-radius: var(--r-md);
          overflow: hidden; min-width: 168px;
          z-index: 80;
          box-shadow: 0 12px 32px rgba(26,36,27,.1);
          animation: dropIn .18s ease;
        }
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .pp-sort-opt {
          display: block; width: 100%; text-align: left;
          font-family: 'DM Sans', sans-serif;
          font-size: 12.5px; color: var(--ink);
          background: transparent; border: none;
          padding: 11px 18px; cursor: pointer;
          transition: background .12s;
        }
        .pp-sort-opt + .pp-sort-opt { border-top: 1px solid var(--ink-08); }
        .pp-sort-opt:hover { background: var(--beige-xlt); }
        .pp-sort-opt--active {
          color: var(--sage-dark); font-weight: 500;
          background: var(--sage-xlt);
        }

        /* count chip (embedded or hero fallback) */
        .pp-count-chip {
          font-size: 10px; letter-spacing: .09em; text-transform: uppercase;
          color: var(--ink-45); white-space: nowrap;
        }

        /* ── PAGE BODY ── */
        .pp-body { padding: 0 48px 96px; }
/* When embedded inside SubcategoryPage, body has no horizontal padding
   — the parent SubcategoryPage wrapper controls it */
.pp-root--embedded .pp-body {
  padding-left: 0 !important;
  padding-right: 0 !important;
}
.pp-root--embedded .pp-toolbar {
  padding-left: 0 !important;
  padding-right: 0 !important;
}
        /* ── PRODUCT GRID ── */
        .pp-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          padding-top: 24px;
        }

        .pp-item {
          opacity: 0;
          transform: translateY(12px);
          animation: itemIn .42s ease forwards;
        }
        @keyframes itemIn {
          to { opacity: 1; transform: translateY(0); }
        }

        /* ── EMPTY STATE ── */
        .pp-empty {
          grid-column: 1 / -1;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 100px 20px; gap: 14px;
        }
        .pp-empty-icon {
          width: 58px; height: 58px; border-radius: 50%;
          border: 1.5px dashed var(--ink-20);
          display: flex; align-items: center; justify-content: center;
        }
        .pp-empty-icon svg { width: 22px; height: 22px; stroke: var(--ink-45); }
        .pp-empty h3 {
          font-family: 'Playfair Display', serif;
          font-size: 1.05rem; font-weight: 400;
          color: var(--ink-70); margin: 0;
        }
        .pp-empty p {
          font-size: 12px; color: var(--ink-45); margin: 0;
          letter-spacing: .04em;
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 1280px) {
          .pp-grid { grid-template-columns: repeat(3, 1fr); }
          .pp-toolbar, .pp-body { padding-left: 32px; padding-right: 32px; }
          .pp-hero { padding-left: 32px; padding-right: 32px; }
        }
        @media (max-width: 900px) {
          .pp-grid { grid-template-columns: repeat(3, 1fr); gap: 14px; }
          .pp-toolbar { padding: 9px 20px; }
          .pp-body { padding: 0 20px 72px; }
          .pp-hero { padding: 18px 20px 16px; }
          .pp-search input { width: 155px; }
        }
@media (max-width: 640px) {
  /* Grid — smaller cards with proper margins */
  .pp-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  /* Body — generous side padding = smaller cards */
  .pp-body { padding: 0 20px 64px; }

  /* Toolbar — side padding so search/pills breathe from screen edges */
  .pp-toolbar {
    padding: 10px 16px 8px;
    flex-wrap: wrap;
    gap: 0;
    row-gap: 8px;
    overflow-x: visible;
  }

  /* Row 1 left: search with left breathing room */
  .pp-search {
    order: 1;
    flex: 0 1 auto;
    max-width: 100%;
    margin-left: 8px;
  }
  .pp-search input {
    width: 100%;
    font-size: 11.5px;
    padding: 6px 12px 6px 28px;
  }
  .pp-search svg {
    left: 9px;
    width: 12px; height: 12px;
  }

  /* Row 1 right: count chip with right breathing room */
  .pp-toolbar-right {
    order: 2;
    margin-left: auto;
    flex-shrink: 0;
    padding-right: 2px;
    margin-right: 8px;
  }

  /* Row 2: pills — left padding matches toolbar, horizontal scroll */
  .pp-pills {
    order: 3;
    flex: 0 0 100%;
    flex-wrap: nowrap;
    overflow-x: auto;
    scrollbar-width: none;
    gap: 6px;
    padding-left: 2px;   /* aligns ALL pill with search bar above */
    padding-bottom: 3px;
  }
  .pp-pills::-webkit-scrollbar { display: none; }

  /* Pill size — compact */
  .pp-pill {
    font-size: 9.5px;
    padding: 5px 13px;
    letter-spacing: .06em;
  }

  .pp-divider { display: none; }

  .pp-count-chip {
    font-size: 9px;
    letter-spacing: .07em;
  }

  .pp-hero { padding: 16px 16px 14px; }
  .pp-hero-right { display: none; }
  .pp-title { font-size: 1.25rem; }
}

@media (max-width: 360px) {
  .pp-grid { gap: 10px; }
  .pp-body { padding: 0 14px 56px; }
  .pp-toolbar { padding: 8px 12px 6px; }
  .pp-search { max-width: 52%; }
}
    
      `}</style>

      <div className={`pp-root${embedded ? ' pp-root--embedded' : ''}`}>

        {/* Nav — wrapped in sage-dark so transparent nav is visible */}
        {!embedded && (
          <div className="pp-nav-wrap">
            <UpperNav />
          </div>
        )}

        {/* Compact hero band */}
        {/* {!embedded && (
          <div className="pp-hero">
            <div className="pp-hero-inner">
              <div>
                <nav className="pp-crumb" aria-label="Breadcrumb">
                  <a href="/">Home</a>
                  {displayType && (
                    <>
                      <span className="sep">›</span>
                      <a href={`/products/${type}`}>{displayType}</a>
                    </>
                  )}
                  {displaySubtype ? (
                    <>
                      <span className="sep">›</span>
                      <span className="cur">{displaySubtype}</span>
                    </>
                  ) : displayType ? (
                    <span className="cur">{displayType}</span>
                  ) : null}
                </nav>
                <h1 className="pp-title">
                  {displaySubtype
                    ? <><em>{displaySubtype}</em> {displayType}</>
                    : <em>{pageTitle}</em>}
                </h1>
              </div>
              <div className="pp-hero-right">
                <span className="pp-count-pill">{filtered.length} pieces</span>
                <span className="pp-hero-tagline">Handcrafted · Ethically Made</span>
              </div>
            </div>
          </div>
        )} */}

        {/* Sticky toolbar */}
        {!embedded && <div style={{ height: '18px', background: 'var(--beige-bg)' }} />}

        <div className={`pp-toolbar${scrolled ? ' pp-toolbar--scrolled' : ''}`}>

          {/* Search */}
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

          {/* Filter pills */}
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

          {/* Right cluster */}
          <div className="pp-toolbar-right">
            {embedded && (
              <>
                <span className="pp-count-chip">{filtered.length} pieces</span>
                <div className="pp-divider" />
              </>
            )}

            {/* <div className="pp-sort" ref={sortRef}>
              <button
                className="pp-sort-btn"
                onClick={() => setSortOpen((o) => !o)}
                aria-label="Sort products"
              >
                <svg className="pp-sort-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M3 6h18M7 12h10M11 18h2" />
                </svg>
                {activeSortLabel}
                <svg
                  className={`pp-sort-chevron${sortOpen ? ' pp-sort-chevron--open' : ''}`}
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {sortOpen && (
                <div className="pp-sort-menu">
                  {SORT_OPTIONS.map((o) => (
                    <button
                      key={o.value}
                      className={`pp-sort-opt${sortBy === o.value ? ' pp-sort-opt--active' : ''}`}
                      onClick={() => { setSortBy(o.value); setSortOpen(false); }}
                    >
                      {o.label}
                    </button>
                  ))}
                </div> */}
              {/* )} */}
            {/* </div> */}
          </div>
        </div>

        {/* Product grid */}
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
                  style={{ animationDelay: `${Math.min(i * 0.04, 0.55)}s` }}
                >
                  <ProductCard product={product} />
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </>
  );
}