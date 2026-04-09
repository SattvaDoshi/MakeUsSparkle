'use client';

import { useState, useMemo } from 'react';
import ProductCard from '@/components/product/ProductCard';

// ─── Product data ─────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// ALL_PRODUCTS
//
// Fields used by ProductDetailPage:
//   name, category, rating, reviewCount, description,
//   price, originalPrice?, offer, sku, stock,
//   images (array OR object keyed by hex),
//   colors [{ label, hex }],
//   href, badge?
//
// CUSTOMISABLE_CATEGORIES in ProductDetailPage = ['Gift Boxes','Fan Box','Key Chain/Charm']
// Any product whose `category` matches one of those will show the customise panel.
// ─────────────────────────────────────────────────────────────────────────────
 
export const ALL_PRODUCTS = [

  // ─── NECKLACES ─────────────────────────────────────────────────────────────
  {
    id: 1,
    name: 'Dainty Layered Necklace',
    type: 'necklace',
    subtype: 'dainty',
    category: "Women's Jewellery",          // ← ADD (shown as eyebrow on detail page)
    badge: 'Best Seller',                   // ← ADD (shown on gallery image)
    rating: 4.7,                            // ← ADD
    reviewCount: 248,                       // ← ADD
    description: 'A beautifully crafted multi-strand layered necklace featuring delicate 18k gold-plated chains at three varying lengths. Each strand finishes with a tiny charm — a crescent, a star, and a teardrop. Hypoallergenic and nickel-free.',
    offer: '41% OFF · Limited Time Deal — Ends Tonight',  // ← ADD
    sku: 'MJN-4421',                        // ← ADD
    stock: 7,                               // ← ADD
    price: 1299,
    originalPrice: 2199,
    href: '/products/dainty-layered-necklace',
    images: [
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=85',
      'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=85',
    ],
    colors: [
      { label: 'Gold',      hex: '#c9a84c' },
      { label: 'Silver',    hex: '#b8b8b8' },
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
    description: 'A timeless single-pearl pendant suspended on a slim 18k gold-plated chain. Each pearl is individually hand-selected for lustre and roundness. Pairs beautifully with formal and casual looks alike.',
    offer: '24% OFF · Weekend Special',
    sku: 'MJN-4422',
    stock: 12,
    price: 2499,
    originalPrice: 3299,
    href: '/products/pearl-pendant-necklace',
    images: [
      'https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=600&q=85',
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=85',
    ],
    colors: [
      { label: 'White Pearl', hex: '#f0ece0' },
      { label: 'Gold Chain',  hex: '#c9a84c' },
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
    description: 'Three interlinked gold chains in varying weights create an effortless layered look straight out of the box. Wear all three together or mix and match individually. Finished with a gold lobster clasp.',
    offer: 'Buy 2 Get 15% OFF on entire jewellery',
    sku: 'MJN-4423',
    stock: 20,
    price: 1599,
    originalPrice: null,
    href: '/products/layered-gold-chain',
    images: [
      'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=85',
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=85',
    ],
    colors: [
      { label: 'Gold',   hex: '#c9a84c' },
      { label: 'Silver', hex: '#b8b8b8' },
    ],
  },

  // ─── EARRINGS ──────────────────────────────────────────────────────────────
  {
    id: 4,
    name: 'Gold Hoop Earrings',
    type: 'earrings',
    subtype: 'hoops',
    category: "Women's Jewellery",
    badge: 'New',
    rating: 4.8,
    reviewCount: 312,
    description: 'Classic oversized hoops in high-polish 18k gold plating. Lightweight despite the bold size — comfortable enough for all-day wear. A wardrobe essential that elevates any outfit instantly.',
    offer: 'Flat ₹200 OFF on orders above ₹799',
    sku: 'MJE-2201',
    stock: 15,
    price: 899,
    originalPrice: null,
    href: '/products/gold-hoop-earrings',
    images: [
      'https://images.unsplash.com/photo-1588444650733-d0f07d323dde?w=600&q=85',
      'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=600&q=85',
    ],
    colors: [
      { label: 'Gold',      hex: '#c9a84c' },
      { label: 'Silver',    hex: '#b8b8b8' },
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
    description: 'Barely-there dome studs that sit flush against the earlobe for a sleek, minimalist look. Secure butterfly back closure. Available in gold, silver, and rose gold. Nickel-free and perfect for sensitive ears.',
    offer: '31% OFF · Most Loved Pick',
    sku: 'MJE-2202',
    stock: 30,
    price: 549,
    originalPrice: 799,
    href: '/products/minimal-studs',
    images: [
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=85',
      'https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=600&q=85',
    ],
    colors: [
      { label: 'Silver',    hex: '#b8b8b8' },
      { label: 'Gold',      hex: '#c9a84c' },
      { label: 'Rose Gold', hex: '#e8a090' },
      { label: 'Olive',     hex: '#5a6b2e' },
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
    description: 'Inspired by K-jewellery trends — these slim cuffs wrap the upper ear cartilage without needing a piercing. Adjustable tension band fits all ear sizes. Sold as a set of two.',
    offer: 'New Arrival — Get ₹100 OFF on first order',
    sku: 'MJE-2203',
    stock: 18,
    price: 699,
    originalPrice: null,
    href: '/products/korean-ear-cuffs',
    images: [
      'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=600&q=85',
      'https://images.unsplash.com/photo-1588444650733-d0f07d323dde?w=600&q=85',
    ],
    colors: [
      { label: 'Gold',   hex: '#c9a84c' },
      { label: 'Silver', hex: '#b8b8b8' },
    ],
  },

  // ─── BRACELETS ─────────────────────────────────────────────────────────────
  {
    id: 7,
    name: 'Beaded Charm Bracelet',
    type: 'bracelets',
    category: "Women's Jewellery",
    badge: 'New',
    rating: 4.4,
    reviewCount: 76,
    description: 'Natural stone beads strung on a durable elastic cord, finished with a signature gold-plated charm. Each bead is individually polished for a smooth, comfortable fit. Makes a perfect gift.',
    offer: 'Buy 2 Save ₹150',
    sku: 'MJB-3301',
    stock: 25,
    price: 749,
    originalPrice: null,
    href: '/products/beaded-bracelet',
    images: [
      'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&q=85',
      'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=600&q=85',
    ],
    colors: [
      { label: 'Olive',      hex: '#7a8e3c' },
      { label: 'Terracotta', hex: '#c4704a' },
      { label: 'Sand',       hex: '#d9c49c' },
    ],
  },

  {
    id: 8,
    name: 'Kada Bangle Set',
    type: 'bracelets',
    category: "Women's Jewellery",
    badge: null,
    rating: 4.5,
    reviewCount: 110,
    description: 'A set of three rigid bangles in antique gold finish with delicate hand-engraved floral motifs. Stack all three for a traditional look or wear individually for everyday elegance.',
    offer: '27% OFF · Festive Season Deal',
    sku: 'MJB-3302',
    stock: 9,
    price: 1899,
    originalPrice: 2599,
    href: '/products/kada-bangle',
    images: [
      'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=600&q=85',
      'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&q=85',
    ],
    colors: [
      { label: 'Antique Gold', hex: '#b8902b' },
      { label: 'Gold',         hex: '#c9a84c' },
      { label: 'Oxidised',     hex: '#555a48' },
    ],
  },

  {
    id: 9,
    name: 'Minimal Chain Bracelet',
    type: 'bracelets',
    category: "Women's Jewellery",
    badge: null,
    rating: 4.3,
    reviewCount: 64,
    description: 'Ultra-thin rhodium-plated chain bracelet with an adjustable slider clasp. Sits flat on the wrist for a barely-there, modern look. Pairs effortlessly with watches or stacked with other bracelets.',
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
      { label: 'Gold',   hex: '#c9a84c' },
    ],
  },

  // ─── RINGS ─────────────────────────────────────────────────────────────────
  {
    id: 10,
    name: 'Diamond Ring',
    type: 'rings',
    category: "Women's Jewellery",
    badge: 'Best Seller',
    rating: 4.8,
    reviewCount: 290,
    description: 'A brilliant-cut cubic zirconia set in a four-prong silver-plated band. The stone catches light beautifully from every angle. Suitable for everyday wear or special occasions.',
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
      { label: 'Silver',    hex: '#b8b8b8' },
      { label: 'Gold',      hex: '#c9a84c' },
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
    description: 'A slim, stackable 18k gold-plated band with a smooth domed profile. Wear solo for understated elegance or stack multiple for a bold layered look.',
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
      { label: 'Gold',   hex: '#c9a84c' },
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
    description: 'Two matching bands — one in matte black and one in silver — designed as a couple\'s set. Adjustable in size and engraved with an infinity motif on the inner band. Packaged in a premium two-slot gift box.',
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
      { label: 'Black',  hex: '#1e2310' },
      { label: 'Silver', hex: '#b8b8b8' },
    ],
  },

  // ─── HAIR ACCESSORIES ──────────────────────────────────────────────────────
  {
    id: 13,
    name: 'Elegant Hair Clip',
    type: 'hair-accessories',
    category: 'Hair Accessories',
    badge: null,
    rating: 4.3,
    reviewCount: 58,
    description: 'A sturdy alligator-style clip finished in high-polish gold. Wide jaw fits thick and thin hair equally well. Adds a touch of luxury to an everyday updo.',
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
      { label: 'Gold',   hex: '#c9a84c' },
      { label: 'Silver', hex: '#b8b8b8' },
      { label: 'Olive',  hex: '#5a6b2e' },
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
    description: 'A satin-wrapped headband dotted with hand-placed faux pearls. Stretchy inner band fits all head sizes comfortably. Instantly elevates bridal, festive, or everyday looks.',
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
    description: 'A set of four bobby pins each topped with a hand-painted enamel flower in soft rose hues. Perfect for adding a pop of colour to braids, buns, or loose waves.',
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
      { label: 'Rose',    hex: '#e8a090' },
      { label: 'Lavender',hex: '#b8a0d8' },
      { label: 'Ivory',   hex: '#f5f0e8' },
    ],
  },

  // ─── GIFT BOXES ── category MUST be 'Gift Boxes' to trigger customise panel ─
  {
    id: 16,
    name: 'Luxury Gift Box',
    type: 'gift-boxes',
    category: 'Gift Boxes',               // ← EXACT MATCH triggers customise panel
    badge: 'Best Seller',
    rating: 4.9,
    reviewCount: 182,
    description: 'A premium rigid gift box lined in ivory satin and filled with your choice of jewellery pieces. Add a personalised message card, custom photo print, or custom name tag. Ideal for birthdays, anniversaries, and celebrations.',
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
      { label: 'Gold',  hex: '#c9a84c' },
      { label: 'Ivory', hex: '#f5f0e8' },
      { label: 'Olive', hex: '#5a6b2e' },
    ],
  },

  {
    id: 17,
    name: 'Birthday Gift Box',
    type: 'gift-boxes',
    category: 'Gift Boxes',               // ← EXACT MATCH triggers customise panel
    badge: 'Trending',
    rating: 4.8,
    reviewCount: 96,
    description: 'A cheerful birthday-themed gift box curated with a necklace, pair of studs, and charm bracelet. Fully customisable — upload a photo for the box lid or add a personalised message.',
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
      { label: 'Pink',  hex: '#f4c1c0' },
      { label: 'Gold',  hex: '#c9a84c' },
      { label: 'White', hex: '#f5f0e8' },
    ],
  },

  // ─── KEYCHAINS ── category MUST be 'Key Chain/Charm' to trigger customise panel
  {
    id: 18,
    name: 'Personalised Keychain',
    type: 'keychains',
    category: 'Key Chain/Charm',          // ← EXACT MATCH triggers customise panel
    badge: 'New',
    rating: 4.6,
    reviewCount: 71,
    description: 'A heavy-duty metal keychain with a blank oval tag — perfect for engraving a name, date, or short message. Upload your photo and we\'ll laser-print it directly onto the tag. Comes in a small gift pouch.',
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
      { label: 'Black',  hex: '#1e2310' },
      { label: 'Silver', hex: '#b8b8b8' },
      { label: 'Gold',   hex: '#c9a84c' },
    ],
  },

  {
    id: 19,
    name: 'Metal Charm Keychain',
    type: 'keychains',
    category: 'Key Chain/Charm',          // ← EXACT MATCH triggers customise panel
    badge: null,
    rating: 4.4,
    reviewCount: 49,
    description: 'A polished stainless-steel keychain with three interchangeable charms — star, heart, and initial letter. Add your own photo charm by uploading an image. Scratch-resistant coating for long-lasting shine.',
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
      { label: 'Gold',   hex: '#c9a84c' },
    ],
  },

  // ─── FAN COMBOS ── category MUST be 'Fan Box' to trigger customise panel ──
  {
    id: 20,
    name: 'Anime Fan Combo',
    type: 'fan-combos',
    category: 'Fan Box',                  // ← EXACT MATCH triggers customise panel
    badge: 'Trending',
    rating: 4.7,
    reviewCount: 128,
    description: 'A curated fan box for anime lovers — includes a character charm necklace, enamel pin badge, and a printed photo card. Fully customisable: upload a favourite scene or character artwork and we\'ll print it on the box lid.',
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
      { label: 'Dark',    hex: '#1e2310' },
    ],
  },

  {
    id: 21,
    name: 'K-pop Fan Combo',
    type: 'fan-combos',
    category: 'Fan Box',                  // ← EXACT MATCH triggers customise panel
    badge: 'New',
    rating: 4.8,
    reviewCount: 214,
    description: 'The ultimate K-pop fan gift box — photo card holder necklace, bias acrylic charm, and a customisable photo box lid. Upload an official or fan art image and choose your idol\'s colour palette for the box lining.',
    offer: 'Upload your idol\'s photo · Box customised FREE',
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
      { label: 'Pink',   hex: '#f4c1c0' },
      { label: 'Black',  hex: '#1e2310' },
    ],
  },

  // ─── CUSTOM CHARMS ── category MUST be 'Key Chain/Charm' ─────────────────
  {
    id: 22,
    name: 'Custom Name Charm',
    type: 'custom-charm',
    category: 'Key Chain/Charm',          // ← EXACT MATCH triggers customise panel
    badge: 'Best Seller',
    rating: 4.9,
    reviewCount: 302,
    description: 'A hand-stamped gold-plated charm with a name of your choice (up to 8 characters). Attach it to a necklace, bracelet, or keychain. Upload a photo for a photo-charm version. Each charm is made to order.',
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
      { label: 'Gold',   hex: '#c9a84c' },
      { label: 'Silver', hex: '#b8b8b8' },
    ],
  },

  {
    id: 23,
    name: 'Initial Letter Charm',
    type: 'custom-charm',
    category: 'Key Chain/Charm',          // ← EXACT MATCH triggers customise panel
    badge: null,
    rating: 4.7,
    reviewCount: 178,
    description: 'A single initial letter charm cast in solid brass and plated in your choice of gold or silver. Block or script font available. Compatible with all standard charm bracelets and necklaces.',
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
      { label: 'Gold',   hex: '#c9a84c' },
    ],
  },

  // ─── CURATED COMBOS ────────────────────────────────────────────────────────
  {
    id: 24,
    name: 'Festive Combo Set',
    type: 'curated-combos',
    category: 'Curated Combos',
    badge: 'Trending',
    rating: 4.8,
    reviewCount: 161,
    description: 'A curated trio of festive jewellery — layered necklace, jhumka earrings, and a stack of four bangles. All gold-plated, all matching. Arrives in a premium keepsake box ready for gifting.',
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
      { label: 'Gold',   hex: '#c9a84c' },
      { label: 'Antique',hex: '#b8902b' },
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
    description: 'The complete bridal jewellery set — choker necklace, chandelier earrings, two bangles, and a maang tikka. Heavy gold-plated brass with hand-set cubic zirconia stones throughout. Presented in a red bridal gift box.',
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
      { label: 'Gold',     hex: '#c9a84c' },
    ],
  },

];

const FILTER_TAGS  = ['All', 'New', 'Trending', 'Sale', 'Best Seller'];
const SORT_OPTIONS = [
  { label: 'Featured',       value: 'featured' },
  { label: 'Price: Low–High', value: 'price_asc' },
  { label: 'Price: High–Low', value: 'price_desc' },
  { label: 'Newest First',   value: 'newest' },
];

function sortProducts(products, sortBy) {
  const arr = [...products];
  if (sortBy === 'price_asc')  return arr.sort((a, b) => a.price - b.price);
  if (sortBy === 'price_desc') return arr.sort((a, b) => b.price - a.price);
  if (sortBy === 'newest')     return arr.sort((a, b) => b.id - a.id);
  return arr; // featured — original order
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ProductsPage({type, subtype}) {
  const [activeTag,  setActiveTag]  = useState('All');
  const [sortBy,     setSortBy]     = useState('featured');
  const [search,     setSearch]     = useState('');
  const [sortOpen,   setSortOpen]   = useState(false);

  const filtered = useMemo(() => {
    let list = ALL_PRODUCTS;

// CASE 1: with subtype
if (type && subtype) {
  list = list.filter(p =>
    p.subtype === subtype
  );
}

// CASE 2: only type
else if (type) {
  list = list.filter(p =>
    p.type === type
  );
}

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }

    // Tag filter
    if (activeTag !== 'All') {
      list = list.filter(p =>
        p.badge === activeTag || p.tags?.includes(activeTag)
      );
    }

    return sortProducts(list, sortBy);
  }, [activeTag, sortBy, search]);

  const activeSortLabel = SORT_OPTIONS.find(o => o.value === sortBy)?.label ?? 'Featured';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@200;300;400;500;600&display=swap');

        :root {
          --beige:      #f5f0e8;
          --beige-dk:   #ede5d5;
          --beige-dkr:  #d9cdb8;
          --olive-900:  #1a1f0d;
          --olive-800:  #252d12;
          --olive-600:  #3d4a22;
          --olive-500:  #5a6b2e;
          --olive-400:  #7a8e3c;
          --olive-300:  #9cac5e;
          --olive-200:  #c4cc9a;
          --olive-100:  #e4e8cc;
          --olive-50:   #f2f4e8;
          --gold:       #c9a84c;
          --gold-glow:  rgba(201,168,76,.12);
          --ink:        #1e2310;
          --mist:       rgba(30,35,16,.45);
        }

        /* ── Page ── */
        .pp {
          min-height: 100vh;
          background: var(--beige);
          background-image:
            radial-gradient(ellipse 80% 30% at 50% -5%, rgba(201,168,76,.08) 0%, transparent 60%),
            radial-gradient(ellipse 40% 50% at 100% 100%, rgba(90,110,35,.07) 0%, transparent 55%);
          font-family: 'Jost', sans-serif;
          color: var(--ink);
        }

        /* Subtle grain */
        .pp::before {
          content: '';
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='512' height='512' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
          opacity: .018; mix-blend-mode: multiply;
        }
        .pp > * { position: relative; z-index: 1; }

        /* ── Topbar ── */
        .pp-topbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 52px;
          border-bottom: 1px solid rgba(61,74,34,.1);
          background: rgba(245,240,232,.8);
          backdrop-filter: blur(12px);
          position: sticky; top: 0; z-index: 100;
        }
        .pp-logo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px; font-weight: 300; letter-spacing: .14em;
          color: var(--olive-600); text-decoration: none;
        }
        .pp-logo em { font-style: italic; color: var(--gold); }
        .pp-nav {
          display: flex; gap: 28px;
        }
        .pp-nav a {
          font-size: 10px; letter-spacing: .28em; text-transform: uppercase;
          color: var(--mist); text-decoration: none; font-weight: 500;
          transition: color .2s;
        }
        .pp-nav a:hover, .pp-nav a.active { color: var(--olive-600); }

        /* ── Hero ── */
        .pp-hero {
          padding: 52px 52px 36px;
          border-bottom: 1px solid rgba(61,74,34,.08);
          animation: ppFadeUp .65s ease both;
        }
        .pp-hero-eyebrow {
          font-size: 9px; letter-spacing: .5em; text-transform: uppercase;
          color: var(--gold); margin-bottom: 12px;
          display: flex; align-items: center; gap: 12px;
        }
        .pp-hero-eyebrow::before {
          content: ''; width: 32px; height: 1px;
          background: linear-gradient(90deg, var(--gold), transparent);
        }
        .pp-hero h1 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2.5rem, 5vw, 4.2rem);
          font-weight: 300; color: var(--olive-600); line-height: 1.05;
          letter-spacing: -.02em;
        }
        .pp-hero h1 em { font-style: italic; color: var(--gold); }
        .pp-hero-desc {
          font-size: 12px; font-weight: 300; color: var(--mist);
          max-width: 480px; line-height: 1.8; margin-top: 10px; letter-spacing: .04em;
        }

        /* ── Controls ── */
        .pp-controls {
          display: flex; align-items: center;
          justify-content: space-between;
          padding: 22px 52px;
          gap: 16px; flex-wrap: wrap;
          animation: ppFadeUp .65s ease .1s both;
        }

        .pp-controls-left {
          display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
        }

        /* Search */
        .pp-search {
          position: relative;
        }
        .pp-search svg {
          position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
          width: 14px; height: 14px; stroke: var(--mist); pointer-events: none;
        }
        .pp-search input {
          font-family: 'Jost', sans-serif;
          font-size: 11px; font-weight: 400; letter-spacing: .06em;
          color: var(--ink); background: white;
          border: 1.5px solid var(--beige-dkr);
          border-radius: 50px;
          padding: 8px 16px 8px 34px;
          outline: none; width: 200px;
          transition: border-color .2s, box-shadow .2s;
        }
        .pp-search input:focus {
          border-color: var(--olive-400);
          box-shadow: 0 0 0 3px rgba(90,110,35,.08);
        }
        .pp-search input::placeholder { color: rgba(30,35,16,.3); }

        /* Filter pills */
        .pp-filter-lbl {
          font-size: 8.5px; letter-spacing: .44em; text-transform: uppercase;
          color: var(--mist); margin: 0 4px;
        }
        .pp-fpill {
          font-size: 9px; letter-spacing: .18em; text-transform: uppercase;
          color: var(--mist); padding: 7px 16px;
          border: 1.5px solid rgba(61,74,34,.15);
          border-radius: 50px; background: transparent;
          cursor: pointer; font-family: 'Jost', sans-serif; font-weight: 400;
          transition: all .2s;
        }
        .pp-fpill:hover { color: var(--olive-600); border-color: var(--olive-400); background: var(--olive-50); }
        .pp-fpill--active { color: var(--beige) !important; background: var(--olive-600) !important; border-color: var(--olive-600) !important; }

        /* Sort dropdown */
        .pp-sort {
          position: relative;
        }
        .pp-sort-btn {
          display: flex; align-items: center; gap: 6px;
          font-family: 'Jost', sans-serif;
          font-size: 10px; letter-spacing: .12em; text-transform: uppercase;
          color: var(--olive-600); background: white;
          border: 1.5px solid var(--beige-dkr);
          border-radius: 50px; padding: 8px 16px;
          cursor: pointer; transition: border-color .2s;
          white-space: nowrap;
        }
        .pp-sort-btn:hover { border-color: var(--olive-400); }
        .pp-sort-btn svg { width: 11px; height: 11px; }
        .pp-sort-menu {
          position: absolute; top: calc(100% + 6px); right: 0;
          background: white; border: 1.5px solid var(--beige-dkr);
          border-radius: 12px; overflow: hidden;
          min-width: 180px; z-index: 50;
          box-shadow: 0 8px 28px rgba(61,74,34,.12);
        }
        .pp-sort-opt {
          display: block; width: 100%; text-align: left;
          font-family: 'Jost', sans-serif;
          font-size: 11px; letter-spacing: .06em;
          color: var(--ink); background: transparent;
          border: none; padding: 11px 18px; cursor: pointer;
          transition: background .15s;
        }
        .pp-sort-opt:hover { background: var(--olive-50); }
        .pp-sort-opt--active { color: var(--olive-600); font-weight: 600; }

        /* Count */
        .pp-count {
          font-size: 10px; letter-spacing: .1em;
          color: var(--mist); margin-left: 4px;
          white-space: nowrap;
        }

        /* ── Grid ── */
        .pp-grid-wrap {
          padding: 8px 52px 72px;
          animation: ppFadeUp .65s ease .18s both;
        }
        .pp-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 24px;
        }

        /* card entrance */
        .pp-grid-item {
          animation: ppCardIn .55s ease both;
        }
        @keyframes ppCardIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Empty state */
        .pp-empty {
          grid-column: 1 / -1;
          text-align: center; padding: 80px 20px;
        }
        .pp-empty-icon {
          font-family: 'Cormorant Garamond', serif;
          font-size: 52px; font-style: italic; font-weight: 300;
          color: rgba(61,74,34,.12); margin-bottom: 12px;
        }
        .pp-empty p {
          font-size: 12px; letter-spacing: .12em; color: var(--mist);
          text-transform: uppercase;
        }

        /* ── Footer ── */
        .pp-footer {
          border-top: 1px solid rgba(61,74,34,.08);
          padding: 28px 52px;
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 12px;
        }
        .pp-footer-brand {
          font-family: 'Cormorant Garamond', serif;
          font-size: 18px; font-weight: 300; letter-spacing: .15em;
          color: rgba(61,74,34,.3);
        }
        .pp-footer-copy {
          font-size: 9px; letter-spacing: .3em; text-transform: uppercase;
          color: var(--mist); opacity: .5;
        }

        /* ── Responsive ── */
        @media (max-width: 860px) {
          .pp-topbar, .pp-hero, .pp-controls, .pp-grid-wrap, .pp-footer { padding-left: 24px; padding-right: 24px; }
          .pp-nav { display: none; }
        }
        @media (max-width: 520px) {
          .pp-topbar, .pp-hero, .pp-controls, .pp-grid-wrap, .pp-footer { padding-left: 16px; padding-right: 16px; }
          .pp-search input { width: 140px; }
          .pp-grid { grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; }
        }

        @keyframes ppFadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="pp">

        {/* ── Sticky Topbar ── */}
        <nav className="pp-topbar">
          <a href="/" className="pp-logo">Mai<em>son</em></a>
          <div className="pp-nav">
            <a href="#">Collections</a>
            <a href="#" className="active">Shop</a>
            <a href="#">About</a>
            <a href="#">Journal</a>
          </div>
        </nav>

        {/* ── Hero ── */}
        <div className="pp-hero">
          <div className="pp-hero-eyebrow">Women · Jewellery · {type}</div>
          <h1> The <em>{type}</em> {subtype}</h1>
          <p className="pp-hero-desc">
            Handcrafted pieces for every mood — from barely-there dainty chains
            to statement pieces that own the room.
          </p>
        </div>

        {/* ── Controls ── */}
        <div className="pp-controls">
          <div className="pp-controls-left">
            {/* Search */}
            <div className="pp-search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {/* Filter pills */}
            <span className="pp-filter-lbl">Filter</span>
            {FILTER_TAGS.map(tag => (
              <button
                key={tag}
                className={`pp-fpill${activeTag === tag ? ' pp-fpill--active' : ''}`}
                onClick={() => setActiveTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="pp-count">{filtered.length} item{filtered.length !== 1 ? 's' : ''}</span>

            {/* Sort */}
            <div className="pp-sort">
              <button className="pp-sort-btn" onClick={() => setSortOpen(o => !o)}>
                {activeSortLabel}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {sortOpen && (
                <div className="pp-sort-menu">
                  {SORT_OPTIONS.map(o => (
                    <button
                      key={o.value}
                      className={`pp-sort-opt${sortBy === o.value ? ' pp-sort-opt--active' : ''}`}
                      onClick={() => { setSortBy(o.value); setSortOpen(false); }}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Product Grid ── */}
        <div className="pp-grid-wrap">
          <div className="pp-grid">
            {filtered.length === 0 ? (
              <div className="pp-empty">
                <div className="pp-empty-icon">◆</div>
                <p>No pieces found</p>
              </div>
            ) : (
              filtered.map((product, i) => (
                <div
                  key={product.id}
                  className="pp-grid-item"
                  style={{ animationDelay: `${i * 0.06}s` }}
                >
                  <ProductCard product={product} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── Footer ── */}
        <footer className="pp-footer">
          <div className="pp-footer-brand">Maison</div>
          <div className="pp-footer-copy">Fine Jewellery · Est. 2019</div>
        </footer>

      </div>
    </>
  );
}