// // 'use client';

// // import { useState } from 'react';
// // import Link from 'next/link';

// // interface Offer {
// //   id: string;
// //   code: string;
// //   title: string;
// //   description: string;
// //   discount: string;
// //   discountType: 'percent' | 'flat';
// //   minOrder: number;
// //   expiry: string;
// //   category: 'jewellery' | 'combo' | 'all' | 'gift';
// //   isNew?: boolean;
// // }

// // const OFFERS: Offer[] = [
// //   { id: '1', code: 'SPARK20', title: '20% off on Jewellery', description: 'Valid on all jewellery orders above ₹999', discount: '20', discountType: 'percent', minOrder: 999, expiry: '30 Apr 2025', category: 'jewellery', isNew: true },
// //   { id: '2', code: 'COMBO150', title: '₹150 off on Curated Combos', description: 'Mix and match your favourite pieces', discount: '150', discountType: 'flat', minOrder: 1499, expiry: '15 May 2025', category: 'combo' },
// //   { id: '3', code: 'GIFT10', title: '10% off on Gift Boxes', description: 'Surprise someone special today', discount: '10', discountType: 'percent', minOrder: 599, expiry: '31 May 2025', category: 'gift' },
// //   { id: '4', code: 'NEWUSER50', title: '₹50 off on First Order', description: 'Welcome to MakeUsSparkle!', discount: '50', discountType: 'flat', minOrder: 399, expiry: '31 Dec 2025', category: 'all', isNew: true },
// //   { id: '5', code: 'MONSOON15', title: '15% off Sitewide', description: 'Limited time monsoon sale — shop now', discount: '15', discountType: 'percent', minOrder: 0, expiry: '10 Jun 2025', category: 'all' },
// //   { id: '6', code: 'CHARM30', title: '30% off Custom Charms', description: 'Personalise your favourite charm jewellery', discount: '30', discountType: 'percent', minOrder: 699, expiry: '20 May 2025', category: 'jewellery' },
// // ];

// // const FILTERS = ['All', 'Jewellery', 'Combos', 'Gift', 'Sitewide'] as const;
// // type Filter = typeof FILTERS[number];

// // const categoryMap: Record<Filter, Offer['category'] | 'all-filter'> = {
// //   'All': 'all-filter',
// //   'Jewellery': 'jewellery',
// //   'Combos': 'combo',
// //   'Gift': 'gift',
// //   'Sitewide': 'all',
// // };

// // export default function OffersSection() {
// //   const [activeFilter, setActiveFilter] = useState<Filter>('All');
// //   const [copied, setCopied] = useState<string | null>(null);

// //   const filtered = activeFilter === 'All'
// //     ? OFFERS
// //     : OFFERS.filter(o => o.category === categoryMap[activeFilter]);

// //   const copyCode = (code: string) => {
// //     navigator.clipboard.writeText(code);
// //     setCopied(code);
// //     setTimeout(() => setCopied(null), 2000);
// //   };

// //   return (
// //     <>
// //       <style>{CSS}</style>
// //       <section className="os">
// //         <div className="os-hero">
// //           <span className="os-eyebrow">Exclusive Deals</span>
// //           <h1 className="os-title">Offers & <em>Coupons</em></h1>
// //           <p className="os-sub">Apply at checkout to save on your sparkle</p>
// //         </div>

// //         <div className="os-filters">
// //           {FILTERS.map(f => (
// //             <button
// //               key={f}
// //               className={`os-filter${activeFilter === f ? ' on' : ''}`}
// //               onClick={() => setActiveFilter(f)}
// //             >{f}</button>
// //           ))}
// //         </div>

// //         <div className="os-grid">
// //           {filtered.map(offer => (
// //             <div key={offer.id} className="os-card">
// //               {offer.isNew && <span className="os-new">New</span>}
// //               <div className="os-card-top">
// //                 <div className="os-discount">
// //                   <span className="os-disc-val">
// //                     {offer.discountType === 'percent' ? `${offer.discount}%` : `₹${offer.discount}`}
// //                   </span>
// //                   <span className="os-disc-off">OFF</span>
// //                 </div>
// //                 <div className="os-card-info">
// //                   <h3 className="os-card-title">{offer.title}</h3>
// //                   <p className="os-card-desc">{offer.description}</p>
// //                 </div>
// //               </div>

// //               <div className="os-card-mid">
// //                 {offer.minOrder > 0 && (
// //                   <span className="os-pill">Min order ₹{offer.minOrder}</span>
// //                 )}
// //                 <span className="os-pill">Expires {offer.expiry}</span>
// //               </div>

// //               <div className="os-card-bot">
// //                 <div className="os-code-box">
// //                   <span className="os-code">{offer.code}</span>
// //                   <button
// //                     className={`os-copy${copied === offer.code ? ' done' : ''}`}
// //                     onClick={() => copyCode(offer.code)}
// //                   >
// //                     {copied === offer.code ? '✓ Copied' : 'Copy'}
// //                   </button>
// //                 </div>
// //                 <Link href="/categories" className="os-shop">
// //                   Shop now →
// //                 </Link>
// //               </div>
// //             </div>
// //           ))}
// //         </div>

// //         {filtered.length === 0 && (
// //           <div className="os-empty">No offers in this category right now. Check back soon!</div>
// //         )}
// //       </section>
// //     </>
// //   );
// // }

// // const CSS = `
// // @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=Nunito:wght@300;400;500;600;700&display=swap');

// // .os {
// //   background: #faf8f3;
// //   min-height: 100vh;
// //   font-family: 'Nunito', sans-serif;
// //   padding-bottom: 80px;
// // }

// // .os-hero {
// //   background: linear-gradient(160deg, #446c35bd 100%, #172710 0%);
// //   padding: 55px 20px 36px;
// //   text-align: center;
// //   position: relative;
// //   overflow: hidden;
// // }
// // .os-hero::after {
// //   content: '';
// //   position: absolute; inset: 0;
// //   background: radial-gradient(ellipse 80% 60% at 50% -10%, rgba(122,170,92,.25) 0%, transparent 60%);
// //   pointer-events: none;
// // }
// // .os-eyebrow {
// //   display: inline-block;
// //   font-size: 9px; font-weight: 700; letter-spacing: .44em; text-transform: uppercase;
// //   color: #c8992e; margin-bottom: 8px;
// // }
// // .os-title {
// //   font-family: 'Cormorant Garamond', serif;
// //   font-size: clamp(2rem, 7vw, 3rem);
// //   font-weight: 400; color: #fff;
// //   letter-spacing: -.01em; line-height: 1; margin-bottom: 8px;
// // }
// // .os-title em { font-style: italic; color: #c8992e; }
// // .os-sub { font-size: 12px; color: rgba(255,255,255,.5); font-weight: 400; }

// // .os-filters {
// //   display: flex; gap: 8px; overflow-x: auto; scrollbar-width: none;
// //   padding: 20px 16px 4px;
// // }
// // .os-filters::-webkit-scrollbar { display: none; }
// // .os-filter {
// //   flex-shrink: 0;
// //   padding: 8px 18px;
// //   font-family: 'Nunito', sans-serif;
// //   font-size: 10px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase;
// //   border: 1.5px solid #d0c8b4; border-radius: 100px;
// //   background: #fff; color: #828278; cursor: pointer;
// //   transition: all .2s;
// //   -webkit-tap-highlight-color: transparent;
// // }
// // .os-filter.on {
// //   background: #253d18; border-color: #253d18; color: #fff;
// // }

// // .os-grid {
// //   padding: 16px 14px;
// //   display: grid;
// //   gap: 14px;
// //   grid-template-columns: 1fr;
// // }
// // @media (min-width: 600px) { .os-grid { grid-template-columns: repeat(2, 1fr); } }
// // @media (min-width: 960px) { .os-grid { grid-template-columns: repeat(3, 1fr); padding: 20px 40px; } }

// // .os-card {
// //   background: #fff;
// //   border: 1px solid #e8dfc8;
// //   border-radius: 14px;
// //   padding: 20px;
// //   position: relative;
// //   box-shadow: 0 2px 12px rgba(35,60,18,.07);
// //   transition: box-shadow .24s, transform .24s;
// // }
// // .os-card:hover { box-shadow: 0 6px 28px rgba(35,60,18,.12); transform: translateY(-2px); }

// // .os-new {
// //   position: absolute; top: 14px; right: 14px;
// //   font-size: 8px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase;
// //   background: #253d18; color: #fff;
// //   padding: 3px 9px; border-radius: 100px;
// // }

// // .os-card-top { display: flex; gap: 14px; align-items: flex-start; margin-bottom: 14px; }
// // .os-discount {
// //   flex-shrink: 0;
// //   display: flex; flex-direction: column; align-items: center;
// //   background: linear-gradient(135deg, #253d18, #365928);
// //   color: #fff; border-radius: 10px;
// //   padding: 10px 14px; min-width: 62px;
// // }
// // .os-disc-val { font-size: 1.3rem; font-weight: 700; line-height: 1; }
// // .os-disc-off { font-size: 8px; font-weight: 700; letter-spacing: .16em; opacity: .7; }

// // .os-card-title { font-size: 13px; font-weight: 700; color: #1c1c17; margin-bottom: 4px; line-height: 1.3; }
// // .os-card-desc { font-size: 11px; color: #828278; line-height: 1.4; margin: 4px 0 8px; }
// // .os-card-desc  { font-size: 11px; color: #828278; line-height: 1.5; }

// // .os-card-mid { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px; }
// // .os-pill {
// //   font-size: 9.5px; font-weight: 600; color: #527a3e;
// //   background: #eff6ea; border: 1px solid #c0dd97;
// //   padding: 3px 10px; border-radius: 100px;
// // }

// // .os-card-bot { display: flex; align-items: center; gap: 10px; }
// // .os-code-box {
// //   display: flex; align-items: center; gap: 0; flex: 1;
// //   border: 1.5px dashed #c8992e; border-radius: 8px; overflow: hidden;
// // }
// // .os-code {
// //   flex: 1; padding: 8px 12px;
// //   font-size: 11px; font-weight: 700; letter-spacing: .14em;
// //   color: #a07820; background: #faf4e8;
// // }
// // .os-copy {
// //   padding: 8px 14px;
// //   font-size: 10px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase;
// //   background: #253d18; color: #fff; border: none; cursor: pointer;
// //   transition: background .2s;
// //   -webkit-tap-highlight-color: transparent;
// //   white-space: nowrap;
// // }
// // .os-copy.done { background: #527a3e; }

// // .os-shop {
// //   flex-shrink: 0;
// //   font-size: 10px; font-weight: 700; letter-spacing: .14em;
// //   color: #253d18; text-decoration: none;
// //   padding: 8px 14px; border: 1.5px solid #253d18; border-radius: 8px;
// //   transition: background .2s, color .2s;
// //   -webkit-tap-highlight-color: transparent;
// //   white-space: nowrap;
// // }
// // .os-shop:hover { background: #253d18; color: #fff; }

// // .os-empty {
// //   text-align: center; padding: 60px 20px;
// //   font-size: 13px; color: #828278;
// // }
// // `;


// 'use client';

// import { useEffect, useMemo, useState } from 'react';
// import Link from 'next/link';
// import { getApiUrl } from '@/lib/api';

// interface Offer {
//   id: string;
//   code: string;
//   title: string;
//   description: string;
//   discount: string;
//   discountType: 'percent' | 'flat';
//   minOrder: number;
//   expiry: string;
//   category: 'jewellery' | 'combo' | 'all' | 'gift';
//   isNew?: boolean;
//   imageSrc: string; // Added image property
// }

// type ApiOffer = {
//   _id: string;
//   code: string;
//   name: string;
//   description?: string;
//   discountType: 'percentage' | 'fixed';
//   discountValue: number;
//   minOrderValue?: number;
//   expiryDate?: string;
//   offerCategory?: 'jewellery' | 'combo' | 'gift' | 'all';
//   image?: string;
//   isFeatured?: boolean;
//   createdAt?: string;
// };

// type PublicOffersResponse = {
//   success: boolean;
//   offers: ApiOffer[];
// };

// const FALLBACK_OFFERS: Offer[] = [
//   {
//     id: '1',
//     code: 'SPARK20',
//     title: '20% off on Jewellery',
//     description: 'Valid on all jewellery orders above INR 999',
//     discount: '20',
//     discountType: 'percent',
//     minOrder: 999,
//     expiry: '30 Apr 2027',
//     category: 'jewellery',
//     isNew: true,
//     imageSrc: '/images/hero.png'
//   },
//   {
//     id: '2',
//     code: 'COMBO150',
//     title: 'INR 150 off on Combos',
//     description: 'Mix and match your favourite pieces',
//     discount: '150',
//     discountType: 'flat',
//     minOrder: 1499,
//     expiry: '15 May 2027',
//     category: 'combo',
//     imageSrc: '/images/hero1.png'
//   },
//   {
//     id: '3',
//     code: 'GIFT10',
//     title: '10% off on Gift Boxes',
//     description: 'Surprise someone special today',
//     discount: '10',
//     discountType: 'percent',
//     minOrder: 599,
//     expiry: '31 May 2027',
//     category: 'gift',
//     imageSrc: '/images/FairyCoded.jpg'
//   },
// ];

// const mapApiOffer = (offer: ApiOffer): Offer => {
//   const parsedExpiry = offer.expiryDate ? new Date(offer.expiryDate) : null;
//   const expiryText = parsedExpiry && !Number.isNaN(parsedExpiry.getTime())
//     ? parsedExpiry.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
//     : 'No expiry';

//   const category = offer.offerCategory === 'jewellery' || offer.offerCategory === 'combo' || offer.offerCategory === 'gift' || offer.offerCategory === 'all'
//     ? offer.offerCategory
//     : 'all';

//   const createdAt = offer.createdAt ? new Date(offer.createdAt) : null;
//   const isRecent = createdAt && !Number.isNaN(createdAt.getTime())
//     ? (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24) <= 10
//     : false;

//   return {
//     id: offer._id,
//     code: offer.code,
//     title: offer.name,
//     description: offer.description || 'Limited period offer',
//     discount: String(offer.discountValue ?? 0),
//     discountType: offer.discountType === 'fixed' ? 'flat' : 'percent',
//     minOrder: Number(offer.minOrderValue || 0),
//     expiry: expiryText,
//     category,
//     isNew: Boolean(offer.isFeatured || isRecent),
//     imageSrc: offer.image || '/images/hero.png',
//   };
// };

// const FILTERS = ['All', 'Jewellery', 'Combos', 'Gift', 'Sitewide'] as const;
// type Filter = typeof FILTERS[number];

// const categoryMap: Record<Filter, Offer['category'] | 'all-filter'> = {
//   'All': 'all-filter',
//   'Jewellery': 'jewellery',
//   'Combos': 'combo',
//   'Gift': 'gift',
//   'Sitewide': 'all',
// };

// export default function OffersSection() {
//   const [activeFilter, setActiveFilter] = useState<Filter>('All');
//   const [copied, setCopied] = useState<string | null>(null);
//   const [offers, setOffers] = useState<Offer[]>(FALLBACK_OFFERS);

//   useEffect(() => {
//     let ignore = false;

//     const loadOffers = async () => {
//       try {
//         const response = await fetch(getApiUrl('/coupons/offers'));
//         if (!response.ok) {
//           return;
//         }

//         const data = (await response.json()) as PublicOffersResponse;
//         const mapped = (data.offers || []).map(mapApiOffer);

//         if (!ignore && mapped.length > 0) {
//           setOffers(mapped);
//         }
//       } catch {
//         // Keep fallback offers when API is unavailable.
//       }
//     };

//     void loadOffers();

//     return () => {
//       ignore = true;
//     };
//   }, []);

//   const filtered = useMemo(() => (
//     activeFilter === 'All'
//       ? offers
//       : offers.filter(o => o.category === categoryMap[activeFilter])
//   ), [activeFilter, offers]);

//   const copyCode = (code: string) => {
//     navigator.clipboard.writeText(code);
//     setCopied(code);
//     setTimeout(() => setCopied(null), 2000);
//   };

//   return (
//     <>
//       <style>{CSS}</style>
//       <section className="os">
//         <div className="os-hero">
//           <span className="os-eyebrow">Exclusive Deals</span>
//           <h1 className="os-title">Offers & <em>Coupons</em></h1>
//           <p className="os-sub">Apply at checkout to save on your sparkle</p>
//         </div>

//         <div className="os-filters">
//           {FILTERS.map(f => (
//             <button
//               key={f}
//               className={`os-filter${activeFilter === f ? ' on' : ''}`}
//               onClick={() => setActiveFilter(f)}
//             >{f}</button>
//           ))}
//         </div>

//         <div className="os-grid">
//           {filtered.map(offer => (
//             <div key={offer.id} className="os-card">
//               {offer.isNew && <span className="os-new">New</span>}
              
//                     <h3 className="os-card-title">{offer.title}</h3>
//                     <p className="os-card-desc">{offer.description}</p>
//                   </div>

//                   <div className="os-card-mid">
//                     {offer.minOrder > 0 && (
//                       <span className="os-pill">Min ₹{offer.minOrder}</span>
//                     )}
//                     <span className="os-pill">Exp: {offer.expiry}</span>
//                   </div>
//                 </div>
//               </div>

//               <div className="os-card-bot">
//                 <div className="os-code-box">
//                   <span className="os-code">{offer.code}</span>
//                   <button
//                     className={`os-copy${copied === offer.code ? ' done' : ''}`}
//                     onClick={() => copyCode(offer.code)}
//                   >
//                     {copied === offer.code ? '✓' : 'Copy'}
//                   </button>
//                 </div>
//                 <Link href="/categories" className="os-shop">
//                   Shop →
//                 </Link>
//               </div>
//             </div>
//           ))}
//         </div>

//         {filtered.length === 0 && (
//           <div className="os-empty">No offers in this category right now.</div>
//         )}
//       </section>
//     </>
//   );
// }

// const CSS = `
// @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=Nunito:wght@300;400;500;600;700&display=swap');

// .os { background: #faf8f3; min-height: 100vh; font-family: 'Nunito', sans-serif; padding-bottom: 80px; }

// .os-hero {
//   background: linear-gradient(160deg, #446c35bd 100%, #172710 0%);
//   padding: 55px 20px 36px; text-align: center; position: relative; overflow: hidden;
// }

// .os-title { font-family: 'Cormorant Garamond', serif; font-size: 2.5rem; color: #fff; margin-bottom: 8px; }
// .os-title em { font-style: italic; color: #c8992e; }

// .os-filters { display: flex; gap: 8px; overflow-x: auto; padding: 20px 16px; scrollbar-width: none; }
// .os-filter { 
//   flex-shrink: 0; padding: 8px 18px; font-size: 10px; font-weight: 700; text-transform: uppercase; 
//   border: 1.5px solid #d0c8b4; border-radius: 100px; background: #fff; color: #828278; cursor: pointer;
// }
// .os-filter.on { background: #253d18; border-color: #253d18; color: #fff; }

// .os-grid { padding: 16px; display: grid; gap: 16px; grid-template-columns: 1fr; }
// @media (min-width: 960px) { .os-grid { grid-template-columns: repeat(2, 1fr); padding: 20px 40px; } }

// .os-card {
//   background: #fff; border: 1px solid #e8dfc8; border-radius: 16px;
//   padding: 16px; position: relative; box-shadow: 0 4px 15px rgba(35,60,18,.05);
// }

// /* Horizontal Layout for Image + Text */
// .os-card-main { display: flex; gap: 16px; align-items: stretch; margin-bottom: 16px; }

// .os-card-img-wrap {
//   width: 90px; height: 90px; flex-shrink: 0; position: relative;
//   border-radius: 12px; overflow: hidden; border: 1px solid #f0eadd;
// }
// .os-card-img-wrap img { width: 100%; height: 100%; object-fit: cover; }

// .os-discount-tag {
//   position: absolute; bottom: 0; left: 0; right: 0;
//   background: rgba(37, 61, 24, 0.9); color: #fff;
//   font-size: 10px; font-weight: 800; text-align: center; padding: 2px 0;
// }

// .os-card-content { flex: 1; display: flex; flex-direction: column; justify-content: center; }

// .os-card-title { font-size: 14px; font-weight: 700; color: #1c1c17; margin-bottom: 4px; }
// .os-card-desc { font-size: 11px; color: #828278; line-height: 1.4; margin-bottom: 8px; }

// .os-card-mid { display: flex; flex-wrap: wrap; gap: 4px; }
// .os-pill { font-size: 9px; font-weight: 600; color: #527a3e; background: #eff6ea; padding: 2px 8px; border-radius: 4px; }

// .os-card-bot { display: flex; align-items: center; gap: 8px; }
// .os-code-box { 
//   display: flex; flex: 1; border: 1.5px dashed #c8992e; border-radius: 8px; overflow: hidden; 
// }
// .os-code { flex: 1; padding: 8px; font-size: 11px; font-weight: 700; color: #a07820; background: #faf4e8; text-align: center; }
// .os-copy { padding: 8px 12px; font-size: 10px; font-weight: 700; background: #253d18; color: #fff; border: none; cursor: pointer; }

// .os-shop { 
//   font-size: 10px; font-weight: 700; color: #253d18; border: 1.5px solid #253d18; 
//   padding: 8px 12px; border-radius: 8px; text-decoration: none; white-space: nowrap;
// }

// .os-new {
//   position: absolute; top: -10px; right: 14px; z-index: 10;
//   font-size: 8px; font-weight: 700; background: #c8992e; color: #fff;
//   padding: 3px 10px; border-radius: 100px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);
// }
// `;



'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { getApiUrl } from '@/lib/api';

interface Offer {
  id: string;
  code: string;
  title: string;
  description: string;
  discount: string;
  discountType: 'percent' | 'flat' | 'free_shipping' | 'buy_x_for_y' | 'bogo';
  buyQuantity?: number;
  getQuantity?: number;
  minOrder: number;
  expiry: string;
  category: 'jewellery' | 'combo' | 'all' | 'gift';
  isNew?: boolean;
  imageSrc: string;
  isCoupon?: boolean;
}

type ApiOffer = {
  _id: string;
  code: string;
  name: string;
  description?: string;
  discountType: 'percentage' | 'fixed' | 'free_shipping';
  discountValue: number;
  minOrderValue?: number;
  expiryDate?: string;
  offerCategory?: 'jewellery' | 'combo' | 'gift' | 'all';
  image?: string;
  isFeatured?: boolean;
  createdAt?: string;
  title?: string;
  offerType?: 'bogo' | 'percentage' | 'fixed' | 'buy_x_for_y' | 'free_shipping';
  buyQuantity?: number;
  getQuantity?: number;
};

type PublicOffersResponse = {
  success: boolean;
  offers: ApiOffer[];
};

const FALLBACK_OFFERS: Offer[] = [
  {
    id: '1',
    code: 'SPARK20',
    title: '20% off on Jewellery',
    description: 'Valid on all jewellery orders above INR 999',
    discount: '20',
    discountType: 'percent',
    minOrder: 999,
    expiry: '30 Apr 2027',
    category: 'jewellery',
    isNew: true,
    imageSrc: '/images/hero.png',
    isCoupon: true,
  },
  {
    id: '2',
    code: 'COMBO150',
    title: 'INR 150 off on Curated Combos',
    description: 'Mix and match your favourite pieces',
    discount: '150',
    discountType: 'flat',
    minOrder: 1499,
    expiry: '15 May 2027',
    category: 'combo',
    imageSrc: '/images/hero1.png',
    isCoupon: true,
  },
  {
    id: '3',
    code: 'GIFT10',
    title: '10% off on Gift Boxes',
    description: 'Surprise someone special today',
    discount: '10',
    discountType: 'percent',
    minOrder: 599,
    expiry: '31 May 2027',
    category: 'gift',
    imageSrc: '/images/FairyCoded.jpg',
    isCoupon: true,
  },
  {
    id: '4',
    code: 'NEWUSER50',
    title: 'INR 50 off First Order',
    description: 'Welcome to MakeUsSparkle!',
    discount: '50',
    discountType: 'flat',
    minOrder: 399,
    expiry: '31 Dec 2027',
    category: 'all',
    isNew: true,
    imageSrc: '/images/hero.png',
    isCoupon: true,
  },
  {
    id: '5',
    code: 'MONSOON15',
    title: '15% off Sitewide',
    description: 'Limited time monsoon sale',
    discount: '15',
    discountType: 'percent',
    minOrder: 0,
    expiry: '10 Jun 2027',
    category: 'all',
    imageSrc: '/images/hero1.png',
    isCoupon: true,
  },
  {
    id: '6',
    code: 'CHARM30',
    title: '30% off Custom Charms',
    description: 'Personalise your favourite charm jewellery',
    discount: '30',
    discountType: 'percent',
    minOrder: 699,
    expiry: '20 May 2027',
    category: 'jewellery',
    imageSrc: '/images/FairyCoded.jpg',
    isCoupon: true,
  },
  {
    id: 'off-1',
    code: 'AUTO',
    title: 'Buy 3 Get 1 Free',
    description: 'Buy 3 jewellery items and get 1 free automatically!',
    discount: '0',
    discountType: 'buy_x_for_y',
    buyQuantity: 3,
    getQuantity: 1,
    minOrder: 0,
    expiry: '30 Jun 2027',
    category: 'jewellery',
    imageSrc: '/images/hero.png',
    isCoupon: false,
  },
  {
    id: 'off-2',
    code: 'AUTO',
    title: 'Free Shipping Sitewide',
    description: 'Free standard shipping on all orders over INR 499',
    discount: '0',
    discountType: 'free_shipping',
    minOrder: 499,
    expiry: '31 Dec 2027',
    category: 'all',
    imageSrc: '/images/hero1.png',
    isCoupon: false,
  },
];

const mapApiOffer = (offer: ApiOffer, isCoupon: boolean): Offer => {
  const parsedExpiry = offer.expiryDate ? new Date(offer.expiryDate) : null;
  const expiryText =
    parsedExpiry && !Number.isNaN(parsedExpiry.getTime())
      ? parsedExpiry.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      : 'No expiry';

  const category =
    offer.offerCategory === 'jewellery' ||
    offer.offerCategory === 'combo' ||
    offer.offerCategory === 'gift' ||
    offer.offerCategory === 'all'
      ? offer.offerCategory
      : 'all';

  const createdAt = offer.createdAt ? new Date(offer.createdAt) : null;
  const isRecent =
    createdAt && !Number.isNaN(createdAt.getTime())
      ? (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24) <= 10
      : false;

  let type: Offer['discountType'] = 'percent';
  if (offer.discountType === 'free_shipping' || offer.offerType === 'free_shipping') type = 'free_shipping';
  else if (offer.discountType === 'fixed' || offer.offerType === 'fixed') type = 'flat';
  else if (offer.offerType === 'buy_x_for_y') type = 'buy_x_for_y';
  else if (offer.offerType === 'bogo') type = 'bogo';

  return {
    id: offer._id,
    code: offer.code || (isCoupon ? 'SPECIAL' : 'AUTOMATIC'),
    title: offer.title || offer.name || (isCoupon ? 'Promo Coupon' : 'Special Offer'),
    description: offer.description || (offer.offerType === 'buy_x_for_y' ? `Buy ${offer.buyQuantity} for ₹${offer.discountValue}` : 'Limited period offer'),
    discount: String(offer.discountValue ?? 0),
    discountType: type,
    buyQuantity: offer.buyQuantity,
    getQuantity: offer.getQuantity,
    minOrder: Number(offer.minOrderValue || 0),
    expiry: expiryText,
    category,
    isNew: Boolean(offer.isFeatured || isRecent),
    imageSrc: offer.image || '/images/hero.png',
    isCoupon,
  };
};

const FILTERS = ['All', 'Jewellery', 'Combos', 'Gift', 'Sitewide'] as const;
type Filter = (typeof FILTERS)[number];

const categoryMap: Record<Filter, Offer['category'] | 'all-filter'> = {
  All: 'all-filter',
  Jewellery: 'jewellery',
  Combos: 'combo',
  Gift: 'gift',
  Sitewide: 'all',
};

export default function OffersSection() {
  const [activeFilter, setActiveFilter] = useState<Filter>('All');
  const [copied, setCopied] = useState<string | null>(null);
  const [offers, setOffers] = useState<Offer[]>(FALLBACK_OFFERS);
  const [activeTab, setActiveTab] = useState<'coupons' | 'offers'>('coupons');

  useEffect(() => {
    let ignore = false;
    const loadOffers = async () => {
      try {
        const [couponsRes, offersRes] = await Promise.allSettled([
          fetch(getApiUrl('/coupons/offers')),
          fetch(getApiUrl('/offers/public'))
        ]);
        
        let mappedCoupons: Offer[] = [];
        let mappedOffers: Offer[] = [];
        
        if (couponsRes.status === 'fulfilled' && couponsRes.value.ok) {
          const data = (await couponsRes.value.json()) as PublicOffersResponse;
          if (data.offers) {
            mappedCoupons = data.offers.map((o) => mapApiOffer(o, true));
          }
        }
        if (offersRes.status === 'fulfilled' && offersRes.value.ok) {
          const data = (await offersRes.value.json()) as PublicOffersResponse;
          if (data.offers) {
            mappedOffers = data.offers.map((o) => mapApiOffer(o, false));
          }
        }

        if (!ignore) {
          const combined = [...mappedOffers, ...mappedCoupons];
          if (combined.length > 0) {
            setOffers(combined);
          }
        }
      } catch {
        // keep fallback
      }
    };
    void loadOffers();
    return () => {
      ignore = true;
    };
  }, []);

  // Filter based on active category
  const categoryOffers = useMemo(() => {
    return activeFilter === 'All'
      ? offers
      : offers.filter((o) => o.category === categoryMap[activeFilter]);
  }, [activeFilter, offers]);

  // Tab counts based on currently selected category
  const couponCount = useMemo(() => categoryOffers.filter(o => o.isCoupon).length, [categoryOffers]);
  const offerCount = useMemo(() => categoryOffers.filter(o => !o.isCoupon).length, [categoryOffers]);

  // Filter based on active tab
  const filtered = useMemo(() => {
    const isCouponTab = activeTab === 'coupons';
    return categoryOffers.filter((o) => !!o.isCoupon === isCouponTab);
  }, [categoryOffers, activeTab]);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <>
      <style>{CSS}</style>
      <section className="os">

        {/* Hero */}
        <div className="os-hero">
          <span className="os-eyebrow">Exclusive Deals</span>
          <h1 className="os-title">Offers &amp; <em>Coupons</em></h1>
          <p className="os-sub">Choose your savings at checkout or shop our automatic deals</p>
        </div>

        {/* Toggle Switcher */}
        <div className="os-toggle-container">
          <div className="os-toggle-wrapper">
            <button
              className={`os-toggle-btn ${activeTab === 'coupons' ? 'active' : ''}`}
              onClick={() => setActiveTab('coupons')}
            >
              <span className="os-toggle-icon">🎫</span>
              <span className="os-toggle-text">Promo Coupons ({couponCount})</span>
            </button>
            <button
              className={`os-toggle-btn ${activeTab === 'offers' ? 'active' : ''}`}
              onClick={() => setActiveTab('offers')}
            >
              <span className="os-toggle-icon">✨</span>
              <span className="os-toggle-text">Store Offers ({offerCount})</span>
            </button>
            <div className={`os-toggle-slider ${activeTab}`} />
          </div>
        </div>

        {/* Filters */}
        <div className="os-filters">
          {FILTERS.map((f) => (
            <button
              key={f}
              className={`os-filter${activeFilter === f ? ' on' : ''}`}
              onClick={() => setActiveFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div key={activeTab} className="os-grid">
          {filtered.map((offer) => (
            <div key={offer.id} className="os-card">

              {/* ── Image section (~80% of card) ── */}
              <div className="os-img-wrap">
                <img src={offer.imageSrc} alt={offer.title} />

                {/* New ribbon — top-right */}
                {offer.isNew && <span className="os-ribbon">New</span>}

                {/* Expiry + min order pills — bottom of image */}
                <div className="os-img-meta">
                  {offer.minOrder > 0 && (
                    <span className="os-meta-pill">Min ₹{offer.minOrder}</span>
                  )}
                  <span className="os-meta-pill">Exp {offer.expiry}</span>
                </div>
              </div>

              {/* ── Compact text strip below image ── */}
              <div className="os-foot">
                <h3 className="os-card-title">{offer.title}</h3>
                {offer.description && <p className="os-card-desc">{offer.description}</p>}

                <div className="os-foot-row">
                  {offer.isCoupon ? (
                    // Coupons: copyable coupon code
                    <>
                      <div className="os-code-box">
                        <span className="os-code">{offer.code}</span>
                        <button
                          className={`os-copy${copied === offer.code ? ' done' : ''}`}
                          onClick={() => copyCode(offer.code)}
                          aria-label={`Copy coupon code ${offer.code}`}
                        >
                          {copied === offer.code ? '✓' : 'Copy'}
                        </button>
                      </div>
                      <Link href="/categories" className="os-shop">
                        Shop &rarr;
                      </Link>
                    </>
                  ) : (
                    // Offers: Auto-applied tag + highlighted button
                    <>
                      <div className="os-auto-tag">
                        <span className="os-auto-dot"></span>
                        Auto-Applied
                      </div>
                      <Link href="/categories" className="os-shop highlight">
                        Shop Now &rarr;
                      </Link>
                    </>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="os-empty">No active {activeTab === 'coupons' ? 'coupons' : 'offers'} in this category right now. Check back soon!</div>
        )}
      </section>
    </>
  );
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=Nunito:wght@300;400;500;600;700&display=swap');

.os *, .os *::before, .os *::after { box-sizing: border-box; }

.os {
  background: #f9f7f2;
  min-height: 100vh;
  font-family: 'Nunito', sans-serif;
  padding-bottom: 80px;
}

/* Hero */
.os-hero {
  background: linear-gradient(150deg, #2d4e1e 0%, #4a7535 0%, #acdc94 100%);
  padding: 52px 20px 36px;
  text-align: center;
  position: relative;
  overflow: hidden;
}
.os-hero::before {
  content: '';
  position: absolute; inset: 0;
  background: radial-gradient(ellipse 70% 50% at 50% -5%, rgba(200,153,46,.2) 0%, transparent 65%);
  pointer-events: none;
}
.os-eyebrow {
  display: inline-block;
  font-size: 9px; font-weight: 700; letter-spacing: .48em; text-transform: uppercase;
  color: #f7f7f7; margin-bottom: 10px;
}
.os-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(1.9rem, 6vw, 3rem);
  font-weight: 400; color: #fff;
  line-height: 1; margin: 0 0 8px;
}
.os-title em { font-style: italic; color: #fee500; }
.os-sub { font-size: 13px; color: rgb(255, 255, 255); margin: 0; }

/* Toggle Switcher */
.os-toggle-container {
  display: flex;
  justify-content: center;
  margin: -24px auto 12px;
  position: relative;
  z-index: 10;
  padding: 0 16px;
}
.os-toggle-wrapper {
  position: relative;
  display: flex;
  background: #fff;
  border: 1px solid #e2d8be;
  border-radius: 100px;
  padding: 4px;
  width: 100%;
  max-width: 460px;
  box-shadow: 0 4px 20px rgba(35,60,18,0.12);
}
.os-toggle-btn {
  flex: 1;
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: transparent;
  border: none;
  padding: 11px 16px;
  font-family: 'Nunito', sans-serif;
  font-size: 11px;
  font-weight: 750;
  letter-spacing: 0.03em;
  color: #52524a;
  cursor: pointer;
  outline: none;
  transition: color 0.3s ease;
  -webkit-tap-highlight-color: transparent;
}
.os-toggle-btn.active {
  color: #fff;
}
.os-toggle-slider {
  position: absolute;
  top: 4px;
  bottom: 4px;
  left: 4px;
  width: calc(50% - 4px);
  background: #253d18;
  border-radius: 100px;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 10px rgba(37,61,24,0.3);
}
.os-toggle-slider.offers {
  transform: translateX(100%);
}
.os-toggle-icon {
  font-size: 14px;
}

/* Filters */
.os-filters {
  display: flex; gap: 8px;
  overflow-x: auto; scrollbar-width: none;
  padding: 16px 14px 6px;
  justify-content: center;
}
@media (max-width: 640px) {
  .os-filters { justify-content: flex-start; }
}
.os-filters::-webkit-scrollbar { display: none; }
.os-filter {
  flex-shrink: 0;
  padding: 7px 18px;
  font-family: 'Nunito', sans-serif;
  font-size: 9.5px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase;
  border: 1.5px solid #d0c8b4; border-radius: 100px;
  background: #fff; color: #828278; cursor: pointer;
  transition: background .18s, border-color .18s, color .18s;
  -webkit-tap-highlight-color: transparent;
}
.os-filter.on { background: #253d18; border-color: #253d18; color: #fff; }

/* Grid with fade-in animation on tab change */
.os-grid {
  padding: 10px 12px 0;
  display: grid;
  gap: 14px;
  grid-template-columns: 1fr;
  animation: os-fade-in 0.35s ease-out;
}
@keyframes os-fade-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
@media (min-width: 640px) {
  .os-grid { grid-template-columns: repeat(2, 1fr); padding: 14px 18px 0; }
}
@media (min-width: 1024px) {
  .os-grid { grid-template-columns: repeat(3, 1fr); padding: 16px 36px 0; gap: 18px; }
}

/* Card shell */
.os-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #e5dcc8;
  box-shadow: 0 3px 14px rgba(35,60,18,.07);
  background: #fff;
  transition: box-shadow .25s, transform .25s;
}
.os-card:hover {
  box-shadow: 0 8px 26px rgba(35,60,18,.14);
  transform: translateY(-2px);
}

/* Image wrap — dominant portion */
.os-img-wrap {
  position: relative;
  width: 100%;
  overflow: hidden;
  flex-shrink: 0;
  aspect-ratio: 16 / 7;
}
@media (min-width: 640px) {
  .os-img-wrap { aspect-ratio: 16 / 8; }
}
@media (min-width: 1024px) {
  .os-img-wrap { aspect-ratio: 16 / 9; }
}

.os-img-wrap img {
  width: 100%; height: 100%;
  object-fit: cover; display: block;
  transition: transform .46s ease;
}
.os-card:hover .os-img-wrap img { transform: scale(1.04); }

/* New ribbon — top-right */
.os-ribbon {
  position: absolute; top: 9px; right: 9px; z-index: 2;
  font-size: 7px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase;
  background: #fff; color: #253d18;
  padding: 3px 8px; border-radius: 100px;
  box-shadow: 0 1px 5px rgba(0,0,0,.16);
}

/* Meta pills at bottom of image */
.os-img-meta {
  position: absolute; bottom: 0; left: 0; right: 0; z-index: 2;
  display: flex; gap: 5px; flex-wrap: wrap;
  padding: 16px 9px 7px;
  background: linear-gradient(to top, rgba(8,18,4,.68) 0%, transparent 100%);
}
.os-meta-pill {
  font-size: 8px; font-weight: 600; letter-spacing: .03em;
  color: #cfe8a8;
  background: rgba(30,50,16,.5);
  border: 1px solid rgba(170,210,100,.22);
  padding: 2px 7px; border-radius: 100px;
  backdrop-filter: blur(3px);
}

/* ── Compact strip below image ── */
.os-foot {
  padding: 8px 11px 9px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: #fff;
}

.os-card-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(.82rem, 2.4vw, .95rem);
  font-weight: 600; color: #1c1c17;
  line-height: 1.2; margin: 0;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

.os-card-desc {
  font-size: 10px; color: #828278; line-height: 1.3;
  margin: 0 0 6px 0;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
  overflow: hidden; text-overflow: ellipsis;
}

/* Code + shop row */
.os-foot-row {
  display: flex; align-items: stretch; gap: 6px;
}

.os-code-box {
  display: flex; flex: 1; overflow: hidden;
  border: 1.5px dashed #c8992e; border-radius: 5px;
}
.os-code {
  flex: 1; padding: 4px 7px;
  font-size: 9px; font-weight: 800; letter-spacing: .13em;
  color: #a07820; background: #fdf8ee;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.os-copy {
  flex-shrink: 0;
  padding: 4px 9px;
  font-size: 8px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase;
  background: #253d18; color: #fff; border: none; cursor: pointer;
  transition: background .16s;
  -webkit-tap-highlight-color: transparent;
  white-space: nowrap;
}
.os-copy.done { background: #4a7535; }

.os-shop {
  flex-shrink: 0;
  display: inline-flex; align-items: center;
  font-size: 8px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase;
  color: #253d18; background: #eef4e8;
  border: 1.5px solid #b5d09a;
  padding: 4px 10px; border-radius: 5px;
  text-decoration: none;
  transition: background .16s, color .16s, border-color .16s;
  -webkit-tap-highlight-color: transparent;
  white-space: nowrap;
}
.os-shop:hover { background: #253d18; color: #fff; border-color: #253d18; }

/* Styles specific to Automatic Offers */
.os-auto-tag {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  font-size: 9px;
  font-weight: 700;
  color: #4a7535;
  background: #eef7e8;
  border: 1px solid #c8e2b5;
  border-radius: 5px;
  padding: 4px 10px;
  white-space: nowrap;
  overflow: hidden;
}
.os-auto-dot {
  width: 6px;
  height: 6px;
  background: #4a7535;
  border-radius: 50%;
  animation: os-pulse 1.6s infinite;
}
@keyframes os-pulse {
  0% { transform: scale(0.9); opacity: 0.6; }
  50% { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(0.9); opacity: 0.6; }
}
.os-shop.highlight {
  background: #253d18;
  color: #fff;
  border-color: #253d18;
}
.os-shop.highlight:hover {
  background: #365928;
  border-color: #365928;
}

/* Empty */
.os-empty {
  text-align: center; padding: 60px 20px;
  font-size: 13px; color: #828278;
}
`;