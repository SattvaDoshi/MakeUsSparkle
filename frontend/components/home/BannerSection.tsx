// 'use client';

// import { useRef, useState, useEffect } from 'react';
// import Link from 'next/link';

// /* ─────────────────────────────────────────────
//    IMAGE SIZES REQUIRED (replace src with actual assets):
//    banners[0] hero image   → 900 × 1100 px  (portrait, covers right 55% of large card)
//    banners[1] small image  → 600 × 560 px   (landscape)
//    banners[2] small image  → 600 × 560 px   (landscape)
//    favicon / sparkle icon  → any SVG
// ───────────────────────────────────────────── */

// const banners = [
//   // {
//   //   id: 1,
//   //   tag: 'New Arrival',
//   //   title: 'The Bloom\nCollection',
//   //   subtitle: 'Handcrafted necklaces inspired by nature',
//   //   cta: 'Discover',
//   //   href: '/categories/women/jewellery/necklace',
//   //   accent: 'Necklaces',
//   //   bg: '#1e2410',
//   //   overlay: 'linear-gradient(100deg,#1e2410 38%,transparent 70%)',
//   //   textColor: '#e8ead0',
//   //   // 900×1100px portrait — replace with next/image in production
//   //   imgSrc: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=900&q=85&auto=format&fit=crop',
//   //   imgAlt: 'Woman wearing delicate gold necklace with floral pendant',
//   // },
//   {
//     id: 1,
//     tag: 'Bestseller',
//     title: 'Gift Boxes\nCurated',
//     subtitle: 'The perfect present, thoughtfully wrapped',
//     cta: 'Shop Gifts',
//     href: '/categories/women/gift-boxes',
//     accent: 'Gift Sets',
//     bg: '#2a3315',
//     overlay: 'linear-gradient(90deg,#2a3315 42%,transparent 80%)',
//     textColor: '#f5e6b8',
//     // 600×560px landscape
//     imgSrc: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&q=85&auto=format&fit=crop',
//     imgAlt: 'Elegant jewellery gift box with ribbon',
//   },
//   {
//     id: 2,
//     tag: 'Limited',
//     title: 'Custom Charm\nJewellery',
//     subtitle: 'Design your story, wear your world',
//     cta: 'Customise',
//     href: '/categories/women/custom-charm',
//     accent: 'Custom',
//     bg: '#151a09',
//     overlay: 'linear-gradient(90deg,#151a09 42%,transparent 80%)',
//     textColor: '#e8ead0',
//     // 600×560px landscape
//     imgSrc: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=600&q=85&auto=format&fit=crop',
//     imgAlt: 'Assorted charm jewellery laid on dark surface',
//   },
// ];

// const marqueeItems = ['✦ New Arrivals', '✦ Free Shipping ₹599+', '✦ Custom Jewellery', '✦ Gift Boxes', '✦ Trending Now'];

// export default function BannerSection() {
//   const [hovered, setHovered] = useState<number | null>(null);
//   const [visible, setVisible] = useState(false);
//   const sectionRef = useRef<HTMLElement>(null);

//   useEffect(() => {
//     const observer = new IntersectionObserver(
//       ([entry]) => { if (entry.isIntersecting) setVisible(true); },
//       { threshold: 0.1 }
//     );
//     if (sectionRef.current) observer.observe(sectionRef.current);
//     return () => observer.disconnect();
//   }, []);

//   return (
//     <>
//       <style>{`
//         /* ── Tokens ── */
//         :root {
//           --gold: #c9a84c;
//           --gold-light: #e8c97a;
//           --gold-pale: #f5e6b8;
//           --olive-darkest: #0f1308;
//           --olive-dark: #1e2710;
//           --olive-mid: #3a4a1c;
//           --olive-light: #6b7a3a;
//           --olive-cream: #e8ead0;
//           --white: #ffffff;
//           --charcoal: #1a1a1a;
//         }

//         /* ── Marquee ── */
//         .bs-marquee-wrap {
//           width: 100%;
//           overflow: hidden;
//           background: var(--olive-dark);
//           border-bottom: 1px solid rgba(201,168,76,0.18);
//           padding: 0.7rem 0;
//         }
//         .bs-marquee-track {
//           display: flex;
//           width: max-content;
//           animation: bsMarquee 28s linear infinite;
//         }
//         .bs-marquee-track:hover { animation-play-state: paused; }
//         @keyframes bsMarquee {
//           from { transform: translateX(0); }
//           to   { transform: translateX(-50%); }
//         }
//         .bs-marquee-item {
//           font-size: 0.68rem;
//           font-weight: 400;
//           letter-spacing: 0.22em;
//           text-transform: uppercase;
//           color: var(--gold-pale);
//           padding: 0 2.5rem;
//           white-space: nowrap;
//           opacity: 0.85;
//         }

//         /* ── Section header ── */
//         .bs-header {
//           text-align: center;
//           padding: clamp(2.5rem, 6vw, 4.5rem) 1.5rem clamp(1.5rem, 3vw, 2.5rem);
//           display: flex;
//           flex-direction: column;
//           align-items: center;
//           gap: 0.6rem;
//         }
//         .bs-eyebrow {
//           font-size: 0.65rem;
//           letter-spacing: 0.38em;
//           text-transform: uppercase;
//           color: var(--olive-light);
//         }
//         .bs-header-title {
//           font-family: Georgia, 'Times New Roman', serif;
//           font-size: clamp(2rem, 5vw, 3.8rem);
//           font-weight: 400;
//           color: var(--olive-darkest);
//           margin: 0;
//           line-height: 1.1;
//         }
//         .bs-header-ornament {
//           display: flex;
//           align-items: center;
//           gap: 0.75rem;
//           margin-top: 0.25rem;
//         }
//         .bs-header-ornament span {
//           display: block;
//           width: 40px;
//           height: 1px;
//           background: var(--gold);
//         }
//         .bs-header-ornament em {
//           font-size: 0.75rem;
//           color: var(--gold);
//           font-style: normal;
//         }

//         /* ── Grid ── */
//         .bs-grid {
//           display: grid;
//           grid-template-columns: 3fr 2fr;
//           gap: 1.25rem;
//           padding: 0 clamp(1rem, 4vw, 4rem);
//           max-width: 1400px;
//           margin: 0 auto;
//         }
//         @media (max-width: 860px) {
//           .bs-grid { grid-template-columns: 1fr; }
//         }

//         /* ── Large banner ── */
//         .bs-large {
//           position: relative;
//           display: block;
//           overflow: hidden;
//           cursor: pointer;
//           text-decoration: none;
//           border-radius: 6px;
//           height: clamp(420px, 58vw, 640px);
//           opacity: 0;
//           transform: translateY(32px);
//           transition: opacity 0.7s ease, transform 0.7s ease;
//         }
//         .bs-large.visible { opacity: 1; transform: translateY(0); }

//         /* ── Small banners ── */
//         .bs-small-stack {
//           display: flex;
//           flex-direction: column;
//           gap: 1.25rem;
//         }
//         .bs-small {
//           position: relative;
//           display: block;
//           overflow: hidden;
//           cursor: pointer;
//           text-decoration: none;
//           border-radius: 6px;
//           height: clamp(190px, 24vw, 300px);
//           opacity: 0;
//           transform: translateX(32px);
//           transition: opacity 0.7s ease, transform 0.7s ease;
//         }
//         .bs-small.visible { opacity: 1; transform: translateX(0); }
//         .bs-small:nth-child(2) { transition-delay: 0.12s; }

//         /* ── Shared bg / image ── */
//         .bs-bg {
//           position: absolute;
//           inset: 0;
//           z-index: 0;
//         }
//         .bs-bg img {
//           width: 100%;
//           height: 100%;
//           object-fit: cover;
//           object-position: center;
//           transition: transform 0.75s cubic-bezier(0.25, 0.46, 0.45, 0.94);
//           display: block;
//         }
//         .bs-large:hover .bs-bg img,
//         .bs-small:hover .bs-bg img { transform: scale(1.06); }

//         /* ── Overlay gradient ── */
//         .bs-overlay {
//           position: absolute;
//           inset: 0;
//           z-index: 1;
//           transition: opacity 0.4s ease;
//         }
//         .bs-large:hover .bs-overlay,
//         .bs-small:hover .bs-overlay { opacity: 0.88; }

//         /* ── Content ── */
//         .bs-content {
//           position: absolute;
//           inset: 0;
//           z-index: 2;
//           display: flex;
//           flex-direction: column;
//           justify-content: flex-end;
//           padding: clamp(1.5rem, 4vw, 2.5rem);
//           width: 60%;
//         }
//         .bs-content-sm {
//           position: absolute;
//           inset: 0;
//           z-index: 2;
//           display: flex;
//           flex-direction: column;
//           justify-content: flex-end;
//           padding: clamp(1.2rem, 3vw, 1.75rem);
//           width: 60%;
//         }

//         .bs-tag {
//           font-size: 0.62rem;
//           letter-spacing: 0.3em;
//           text-transform: uppercase;
//           color: var(--gold);
//           font-weight: 600;
//           margin-bottom: 0.5rem;
//           display: flex;
//           align-items: center;
//           gap: 0.4rem;
//         }
//         .bs-tag::before {
//           content: '';
//           display: inline-block;
//           width: 18px;
//           height: 1px;
//           background: var(--gold);
//         }

//         .bs-title {
//           font-family: Georgia, 'Times New Roman', serif;
//           font-size: clamp(2rem, 3.8vw, 3.4rem);
//           font-weight: 400;
//           line-height: 1.05;
//           margin: 0 0 0.6rem;
//         }
//         .bs-title-sm {
//           font-family: Georgia, 'Times New Roman', serif;
//           font-size: clamp(1.4rem, 2.5vw, 2rem);
//           font-weight: 400;
//           line-height: 1.1;
//           margin: 0 0 0.5rem;
//         }

//         .bs-sub {
//           font-size: 0.82rem;
//           font-weight: 300;
//           color: rgba(232,234,208,0.72);
//           line-height: 1.55;
//           margin: 0 0 1rem;
//           max-width: 26ch;
//         }

//         .bs-cta {
//           display: inline-flex;
//           align-items: center;
//           gap: 0.6rem;
//           font-size: 0.75rem;
//           letter-spacing: 0.06em;
//           text-transform: none;
//           color: var(--gold-light);
//           font-weight: 500;
//           background: transparent;
//           border: 1px solid rgba(201,168,76,0.45);
//           border-radius: 100px;
//           padding: 0.5rem 1rem 0.5rem 1.1rem;
//           width: fit-content;
//           transition: border-color 0.25s ease, color 0.25s ease, gap 0.25s ease;
//         }
//         .bs-cta .cta-arrow {
//           font-size: 0.85rem;
//           line-height: 1;
//           flex-shrink: 0;
//           transition: transform 0.25s ease;
//         }
//         .bs-large:hover .bs-cta,
//         .bs-small:hover .bs-cta {
//           border-color: var(--gold);
//           color: var(--gold);
//         }
//         .bs-large:hover .bs-cta .cta-arrow,
//         .bs-small:hover .bs-cta .cta-arrow {
//           transform: translateX(4px);
//         }

//         /* ── Watermark accent ── */
//         .bs-watermark {
//           position: absolute;
//           bottom: 1.5rem;
//           right: -0.5rem;
//           font-family: Georgia, serif;
//           font-size: clamp(4rem, 9vw, 8rem);
//           font-weight: 700;
//           color: rgba(255,255,255,0.04);
//           letter-spacing: -0.02em;
//           text-transform: uppercase;
//           pointer-events: none;
//           z-index: 1;
//           line-height: 1;
//         }

//         /* ── Shimmer badge ── */
//         .bs-badge {
//           position: absolute;
//           top: 1.5rem;
//           right: 1.5rem;
//           z-index: 3;
//           width: 56px;
//           height: 56px;
//           border-radius: 50%;
//           background: rgba(201,168,76,0.12);
//           border: 1px solid rgba(201,168,76,0.4);
//           backdrop-filter: blur(6px);
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           flex-direction: column;
//           gap: 1px;
//         }
//         .bs-badge span {
//           font-size: 0.48rem;
//           letter-spacing: 0.15em;
//           text-transform: uppercase;
//           color: var(--gold-pale);
//           text-align: center;
//           line-height: 1.4;
//         }

//         /* ── Floating stat strip (large banner only) ── */
//         .bs-stat-strip {
//           position: absolute;
//           bottom: 2rem;
//           right: 2rem;
//           z-index: 3;
//           display: flex;
//           flex-direction: column;
//           gap: 0.5rem;
//           align-items: flex-end;
//         }
//         .bs-stat {
//           background: rgba(0,0,0,0.45);
//           border: 1px solid rgba(201,168,76,0.25);
//           backdrop-filter: blur(10px);
//           border-radius: 4px;
//           padding: 0.4rem 0.75rem;
//           text-align: center;
//         }
//         .bs-stat-num {
//           font-family: Georgia, serif;
//           font-size: 1.15rem;
//           font-weight: 400;
//           color: var(--gold-light);
//           display: block;
//           line-height: 1.2;
//         }
//         .bs-stat-label {
//           font-size: 0.55rem;
//           letter-spacing: 0.18em;
//           text-transform: uppercase;
//           color: rgba(232,234,208,0.6);
//           display: block;
//         }

//         /* ── Offer pill ── */
//         .bs-offer {
//           display: flex;
//           align-items: center;
//           gap: 1rem;
//           background: linear-gradient(135deg, var(--olive-darkest) 0%, var(--olive-dark) 100%);
//           border: 1px solid rgba(201,168,76,0.3);
//           border-radius: 100px;
//           padding: 1rem 1.5rem 1rem 1rem;
//           margin: 2.5rem auto 0;
//           max-width: 580px;
//           width: calc(100% - clamp(2rem, 8vw, 8rem));
//           box-shadow: 0 0 0 6px rgba(201,168,76,0.04);
//         }
//         .bs-offer-icon {
//           width: 38px;
//           height: 38px;
//           background: var(--gold);
//           color: var(--charcoal);
//           border-radius: 50%;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           font-weight: 700;
//           font-size: 0.9rem;
//           flex-shrink: 0;
//           box-shadow: 0 0 16px rgba(201,168,76,0.5);
//         }
//         .bs-offer-text {
//           flex: 1;
//           font-size: 0.88rem;
//           color: var(--olive-cream);
//           line-height: 1.4;
//         }
//         .bs-offer-text strong { color: var(--gold-light); }
//         .bs-offer-btn {
//           background: transparent;
//           color: var(--gold);
//           border: 1px solid rgba(201,168,76,0.5);
//           padding: 0.55rem 1.25rem;
//           font-size: 0.78rem;
//           font-weight: 500;
//           letter-spacing: 0.04em;
//           text-transform: none;
//           cursor: pointer;
//           border-radius: 100px;
//           white-space: nowrap;
//           transition: border-color 0.2s, color 0.2s;
//         }
//         .bs-offer-btn:hover {
//           border-color: var(--gold);
//           color: var(--gold-light);
//         }

//         /* ── Divider below ── */
//         .bs-section-end {
//           padding-bottom: clamp(3rem, 8vw, 6rem);
//         }

//         @media (max-width: 480px) {
//           .bs-content { width: 100%; }
//           .bs-content-sm { width: 100%; }
//           .bs-offer { flex-wrap: wrap; border-radius: 14px; }
//           .bs-stat-strip { display: none; }
//         }
//         @media (min-width: 481px) and (max-width: 860px) {
//           .bs-large { height: 480px; }
//           .bs-small { height: 220px; }
//         }
//       `}</style>

//       <section ref={sectionRef} style={{ background: '#fafaf7' }} className="bs-section-end">

//         {/* ── Marquee ── */}
//         <div className="bs-marquee-wrap">
//           <div className="bs-marquee-track">
//             {Array.from({ length: 4 }).flatMap((_, i) =>
//               marqueeItems.map(t => (
//                 <span key={`${i}-${t}`} className="bs-marquee-item">{t}</span>
//               ))
//             )}
//           </div>
//         </div>

//         {/* ── Header ── */}
//         {/* <div className="bs-header"> */}
//           {/* <span className="bs-eyebrow">Featured</span> */}
//           {/* <h2 className="bs-header-title">Collections &amp; Stories</h2> */}
//           {/* <div className="bs-header-ornament"> */}
//             {/* <span /> */}
//             {/* <em>✦</em> */}
//             {/* <span /> */}
//           {/* </div> */}
//         {/* </div> */}

//         {/* ── Grid ── */}
//         <div className="bs-grid">

//           {/* Large banner */}
//           <Link
//             href={banners[0].href}
//             className={`bs-large${visible ? ' visible' : ''}`}
//             aria-label={`${banners[0].title.replace('\n', ' ')} — ${banners[0].cta}`}
//           >
//             {/* Background image — replace with next/image */}
//             {/* IMAGE: 900×1100px portrait of woman wearing necklace */}
//             <div className="bs-bg" style={{ background: banners[0].bg }}>
//               {/* eslint-disable-next-line @next/next/no-img-element */}
//               <img
//                 src={banners[0].imgSrc}
//                 alt={banners[0].imgAlt}
//                 loading="eager"
//               />
//             </div>

//             {/* Gradient overlay */}
//             <div
//               className="bs-overlay"
//               style={{ background: banners[0].overlay }}
//             />

//             {/* Content */}
//             <div className="bs-content">
//               <p className="bs-tag">{banners[0].tag}</p>
//               <h3 className="bs-title" style={{ color: banners[0].textColor }}>
//                 {banners[0].title.split('\n').map((l, i) => <span key={i} style={{ display: 'block' }}>{l}</span>)}
//               </h3>
//               <p className="bs-sub">{banners[0].subtitle}</p>
//               <span className="bs-cta">{banners[0].cta} <span className="cta-arrow">→</span></span>
//             </div>

//             {/* Watermark */}
//             <span className="bs-watermark" aria-hidden="true">{banners[0].accent}</span>

//             {/* Floating stats */}
//             <div className="bs-stat-strip" aria-hidden="true">
//               <div className="bs-stat">
//                 <span className="bs-stat-num">240+</span>
//                 <span className="bs-stat-label">Designs</span>
//               </div>
//               <div className="bs-stat">
//                 <span className="bs-stat-num">4.9★</span>
//                 <span className="bs-stat-label">Rated</span>
//               </div>
//             </div>

//             {/* Badge */}
//             <div className="bs-badge" aria-hidden="true">
//               <span>New</span>
//               <span>Season</span>
//             </div>
//           </Link>

//           {/* Small banners */}
//           <div className="bs-small-stack">
//             {banners.slice(1).map((b, idx) => (
//               <Link
//                 key={b.id}
//                 href={b.href}
//                 className={`bs-small${visible ? ' visible' : ''}`}
//                 style={{ transitionDelay: `${(idx + 1) * 0.15}s` }}
//                 aria-label={`${b.title.replace('\n', ' ')} — ${b.cta}`}
//               >
//                 {/* IMAGE: 600×560px landscape of gift/charm jewellery */}
//                 <div className="bs-bg" style={{ background: b.bg }}>
//                   {/* eslint-disable-next-line @next/next/no-img-element */}
//                   <img
//                     src={b.imgSrc}
//                     alt={b.imgAlt}
//                     loading="lazy"
//                   />
//                 </div>

//                 <div
//                   className="bs-overlay"
//                   style={{ background: b.overlay }}
//                 />

//                 <div className="bs-content-sm">
//                   <p className="bs-tag">{b.tag}</p>
//                   <h3 className="bs-title-sm" style={{ color: b.textColor }}>
//                     {b.title.split('\n').map((l, i) => <span key={i} style={{ display: 'block' }}>{l}</span>)}
//                   </h3>
//                   <span className="bs-cta">{b.cta} <span className="cta-arrow">→</span></span>
//                 </div>

//                 <span className="bs-watermark" aria-hidden="true"
//                   style={{ fontSize: 'clamp(2.5rem,6vw,4.5rem)', bottom: '0.75rem' }}>
//                   {b.accent}
//                 </span>
//               </Link>
//             ))}
//           </div>
//         </div>

//         {/* ── Offer pill ── */}
//         <div className="bs-offer" role="complementary" aria-label="Promotional offer">
//           <div className="bs-offer-icon" aria-hidden="true">%</div>
//           <p className="bs-offer-text">
//             First order? Get <strong>10% off</strong> when you sign up
//           </p>
//           <button className="bs-offer-btn" type="button">Claim Now</button>
//         </div>

//       </section>
//     </>
//   );
// }


'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

/*
  REPLACE these with your actual Palmonas image assets:
  - Each banner: desktop 900×560px landscape, mobile 430×580px portrait
  - Use next/image in production for optimisation
*/

type Banner = {
  id: number;
  tag: string;
  headline: string;
  cta: string;
  href: string;
  imgDesktop: string;
  imgAlt: string;
  textSide: 'left' | 'right';
};

const banners: Banner[] = [
  {
    id: 1,
    tag: 'Gift Combos',
    headline: 'FLAT 50%\nOFF',
    cta: 'Shop Now',
    href: '/categories/women/gift-boxes',
    imgDesktop:
      'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=900&q=85&auto=format&fit=crop',
    imgAlt: 'Palmonas gift boxes — flat 50% off',
    textSide: 'right',
  },
  {
    id: 2,
    tag: 'Custom Charm',
    headline: 'DESIGN\nYOUR STORY',
    cta: 'Customise',
    href: '/categories/women/custom-charm',
    imgDesktop:
      'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=900&q=85&auto=format&fit=crop',
    imgAlt: 'Custom charm jewellery',
    textSide: 'right',
  },
  {
    id: 3,
    tag: 'Bestseller',
    headline: 'NEW\nARRIVALS',
    cta: 'Discover',
    href: '/categories/women/new-arrivals',
    imgDesktop:
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=900&q=85&auto=format&fit=crop',
    imgAlt: 'New jewellery arrivals',
    textSide: 'right',
  },
];

const marqueeItems = [
  '✦ New Arrivals',
  '✦ Free Shipping ₹599+',
  '✦ Custom Jewellery',
  '✦ Gift Boxes',
  '✦ Trending Now',
];

// Desktop shows 2 cards at a time
const DESKTOP_VISIBLE = 2;

export default function BannerSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);

  const maxIndex = banners.length - DESKTOP_VISIBLE; // last valid left-card index

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.08 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const prev = useCallback(() => setSlideIndex((i) => Math.max(0, i - 1)), []);
  const next = useCallback(() => setSlideIndex((i) => Math.min(maxIndex, i + 1)), [maxIndex]);

  // translateX: each step moves one card-width + gap
  // card width on desktop = 50% of track - half gap (gap 20px)
  // We express this as a percentage of the viewport (track width)
  const trackShift = slideIndex * (50 + (10 / 100)); // approximate — refined via CSS var

  return (
    <>
      <style>{`
        :root {
          --gold: #c9a84c;
          --gold-light: #e8c97a;
          --gold-pale: #f5e6b8;
          --olive-dark: #1e2710;
          --white: #ffffff;
          --bg: #fafaf7;
          --card-gap: 1.25rem;
          --card-radius: 10px;
        }

        /* ─── Marquee ─── */
        .bs-marquee-wrap {
          width: 100%;
          overflow: hidden;
          background: var(--olive-dark);
          padding: 0.35rem 0;
        }
        .bs-marquee-track {
          display: flex;
          width: max-content;
          animation: bsMarquee 28s linear infinite;
        }
        .bs-marquee-track:hover { animation-play-state: paused; }
        @keyframes bsMarquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .bs-marquee-item {
          font-size: 0.68rem;
          font-weight: 400;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--gold-pale);
          padding: 0 2.5rem;
          white-space: nowrap;
          opacity: 0.85;
        }

        /* ─── Section ─── */
        .bs-section {
          background: var(--bg);
          padding-bottom: clamp(2rem, 4vw, 3rem);
        }

        /* ─── Slider container ─── */
        .bs-slider-shell {
          margin-top: clamp(1.5rem, 3vw, 2.5rem);
          position: relative;
          /* side padding makes room for arrow buttons sitting outside the viewport */
          padding: 0 clamp(2.5rem, 4vw, 3.5rem);
        }

        /* Clips the scrolling track */
        .bs-slider-viewport {
          overflow: hidden;
          border-radius: var(--card-radius);
        }

        /* Scrolling row of cards */
        .bs-slider-track {
          display: flex;
          gap: var(--card-gap);
          /* JS sets transform via inline style */
          transition: transform 0.55s cubic-bezier(0.4, 0, 0.2, 1);
          will-change: transform;
        }

        /* ─── Single card ─── */
        .bs-card {
          /* Desktop: 2 cards exactly fill the viewport width */
          flex: 0 0 calc(50% - var(--card-gap) / 2);
          position: relative;
          overflow: hidden;
          // border-radius: var(--card-radius);
          height: clamp(300px, 36vw, 520px);
          display: block;
          text-decoration: none;
          cursor: pointer;
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .bs-card.visible { opacity: 1; transform: translateY(0); }
        .bs-card:nth-child(2) { transition-delay: 0.1s; }
        .bs-card:nth-child(3) { transition-delay: 0.2s; }

        .bs-card-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          display: block;
          transition: transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        .bs-card:hover .bs-card-img { transform: scale(1.04); }

        /* Gradient scrim for readability */
        .bs-card-scrim {
          position: absolute;
          inset: 0;
          z-index: 1;
          background: linear-gradient(270deg, rgba(8,8,8,0.56) 0%, transparent 55%);
        }
        .bs-card-scrim.left {
          background: linear-gradient(90deg, rgba(8,8,8,0.56) 0%, transparent 55%);
        }

        /* Text positioned on the specified side */
        .bs-card-text {
          position: absolute;
          inset: 0;
          z-index: 2;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: flex-end;
          padding: clamp(1.4rem, 3vw, 2.4rem);
          text-align: right;
        }
        .bs-card-text.left {
          align-items: flex-start;
          text-align: left;
        }

        .bs-card-tag {
          font-size: 0.65rem;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: var(--gold-pale);
          margin-bottom: 0.5rem;
          font-weight: 500;
          opacity: 0.88;
        }
        .bs-card-headline {
          font-family: Georgia, 'Times New Roman', serif;
          font-size: clamp(1.8rem, 3vw, 3rem);
          font-weight: 700;
          color: var(--white);
          line-height: 1.05;
          margin: 0 0 1.1rem;
          white-space: pre-line;
        }
.bs-card-cta {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.7rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #000000;
  font-family: sans-serif;
  font-weight: 500;
  background: rgba(126, 111, 11, 0.36);          /* ← semi-dark bg */
  border: 1px solid rgb(239, 178, 10);   /* ← gold border */
  border-radius: 100px;
  padding: 0.45rem 1.1rem 0.45rem 1.25rem;
  text-decoration: none;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  transition: background 0.22s ease, border-color 0.22s ease, color 0.22s ease;
}
.bs-card-cta::after {
  content: '→';
  font-size: 0.85rem;
  line-height: 1;
  transition: transform 0.22s ease;
}
.bs-card:hover .bs-card-cta {
  background: rgba(201, 168, 76, 0.18);
  border-color: var(--gold);
  color: var(--gold-light);
}
.bs-card:hover .bs-card-cta::after {
  transform: translateX(3px);
}


        /* ─── Arrow buttons ─── */
        .bs-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 10;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255,255,255,0.93);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.3rem;
          line-height: 1;
          box-shadow: 0 2px 12px rgba(0,0,0,0.16);
          color: #222;
          transition: background 0.2s, opacity 0.2s, box-shadow 0.2s;
        }
        .bs-arrow:hover { background: #fff; box-shadow: 0 4px 18px rgba(0,0,0,0.2); }
        .bs-arrow:disabled { opacity: 0.28; cursor: default; }
        .bs-arrow-prev { left: 0; }
        .bs-arrow-next { right: 0; }

        /* ─── Dots ─── */
        .bs-dots {
          display: flex;
          justify-content: center;
          gap: 0.45rem;
          margin-top: 1.1rem;
        }
        .bs-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: rgba(201,168,76,0.3);
          border: none;
          cursor: pointer;
          padding: 0;
          transition: background 0.25s, transform 0.25s;
        }
        .bs-dot.active {
          background: var(--gold);
          transform: scale(1.4);
        }

        /* ─── Offer band ─── */
        .bs-offer-wrap {
          padding: clamp(2rem, 4vw, 3rem) clamp(1rem, 3vw, 2.5rem) 0;
        }
        .bs-offer {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: var(--olive-dark);
          border: 1px solid rgba(201,168,76,0.28);
          border-radius: 100px;
          padding: 1rem 1.5rem 1rem 1rem;
          max-width: 600px;
          margin: 0 auto;
          box-shadow: 0 0 0 5px rgba(201,168,76,0.05);
        }
        .bs-offer-icon {
          width: 36px;
          height: 36px;
          background: var(--gold);
          color: #fff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.85rem;
          flex-shrink: 0;
          box-shadow: 0 0 14px rgba(201,168,76,0.45);
        }
        .bs-offer-text {
          flex: 1;
          font-size: 0.86rem;
          color: var(--gold-pale);
          line-height: 1.4;
        }
        .bs-offer-text strong { color: var(--gold-light); }
        .bs-offer-btn {
          background: transparent;
          color: var(--gold-light);
          border: 1px solid rgba(201,168,76,0.5);
          padding: 0.52rem 1.25rem;
          font-size: 0.76rem;
          font-weight: 500;
          letter-spacing: 0.06em;
          cursor: pointer;
          border-radius: 100px;
          white-space: nowrap;
          transition: border-color 0.2s, color 0.2s;
        }
        .bs-offer-btn:hover { border-color: var(--gold); color: var(--gold); }

        /* ═══════════════════════════════════════
           MOBILE  ≤ 639px — vertical stack
        ═══════════════════════════════════════ */
        @media (max-width: 639px) {
          /* Hide arrows + dots on mobile */
          .bs-arrow { display: none; }
          .bs-dots  { display: none; }

          /* Reset slider to vertical */
          .bs-slider-shell  { padding: 0 1rem; }
          .bs-slider-viewport { overflow: visible; border-radius: 0; }
          .bs-slider-track {
            flex-direction: column;
            gap: 0.9rem;
            transform: none !important; /* block JS transform */
          }

          /* All cards: full width */
          .bs-card {
            flex: none;
            width: 100%;
          }

          /* First card — large */
          .bs-card:nth-child(1) {
            height: clamp(320px, 95vw, 480px);
          }

          /* Second and beyond — smaller */
          .bs-card:nth-child(n+2) {
            height: clamp(190px, 55vw, 260px);
          }

          /* Text: top-centre on mobile */
          .bs-card-text,
          .bs-card-text.left {
            justify-content: space-between;
            align-items: right;
            text-align: right;
            padding-top: clamp(1.5rem, 7vw, 2.5rem);
          }
  .bs-card-cta {
    font-size: 0.65rem;
    padding: 0.4rem 0.9rem 0.4rem 1rem;
  }
          /* Scrim: top-fade on mobile */
          .bs-card-scrim,
          .bs-card-scrim.left {
            background: linear-gradient(180deg, rgba(8,8,8,0.54) 0%, transparent 52%);
          }

          /* Offer band adjustments */
          .bs-offer-wrap { padding: 1.75rem 1rem 0; }
          .bs-offer {
            border-radius: 14px;
            flex-wrap: wrap;
            justify-content: center;
            text-align: center;
          }
        }

        /* ═══════════════════════════════════════
           TABLET  640–1023px
           Show 1 full card + peek of next
        ═══════════════════════════════════════ */
        @media (min-width: 640px) and (max-width: 1023px) {
          .bs-card {
            flex: 0 0 calc(72% - var(--card-gap) / 2);
            height: clamp(280px, 46vw, 420px);
          }
        }
      `}</style>

      <section ref={sectionRef} className="bs-section">

        {/* ── Marquee ── */}
        <div className="bs-marquee-wrap">
          <div className="bs-marquee-track">
            {Array.from({ length: 4 }).flatMap((_, i) =>
              marqueeItems.map((t) => (
                <span key={`${i}-${t}`} className="bs-marquee-item">{t}</span>
              ))
            )}
          </div>
        </div>

        {/* ── Slider / mobile stack ── */}
        <div className="bs-slider-shell">

          {/* Prev */}
          <button
            className="bs-arrow bs-arrow-prev"
            onClick={prev}
            disabled={slideIndex === 0}
            aria-label="Previous"
          >
            ‹
          </button>

          <div className="bs-slider-viewport">
            <div
              className="bs-slider-track"
              style={{
                // move by exactly one card width + gap per step
                transform: `translateX(calc(-${slideIndex} * (50% + var(--card-gap) / 2)))`,
              }}
            >
              {banners.map((b, idx) => (
                <Link
                  key={b.id}
                  href={b.href}
                  className={`bs-card${visible ? ' visible' : ''}`}
                  style={{ transitionDelay: `${idx * 0.1}s` }}
                  aria-label={`${b.tag} — ${b.cta}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="bs-card-img"
                    src={b.imgDesktop}
                    alt={b.imgAlt}
                    loading={idx === 0 ? 'eager' : 'lazy'}
                  />

                  <div className={`bs-card-scrim${b.textSide === 'left' ? ' left' : ''}`} />

                  <div className={`bs-card-text${b.textSide === 'left' ? ' left' : ''}`}>
                    <div>
                    <p className="bs-card-tag">{b.tag}</p>
                    <h2 className="bs-card-headline">{b.headline}</h2>
                    </div>
                    <span className="bs-card-cta">{b.cta}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Next */}
          <button
            className="bs-arrow bs-arrow-next"
            onClick={next}
            disabled={slideIndex >= maxIndex}
            aria-label="Next"
          >
            ›
          </button>
        </div>

        {/* Dots (desktop/tablet only via CSS) */}
        <div className="bs-dots">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              className={`bs-dot${slideIndex === i ? ' active' : ''}`}
              onClick={() => setSlideIndex(i)}
              aria-label={`Go to slide group ${i + 1}`}
            />
          ))}
        </div>

        {/* ── Offer band ── */}
        <div className="bs-offer-wrap">
          <div className="bs-offer" role="complementary" aria-label="Promotional offer">
            <div className="bs-offer-icon" aria-hidden="true">%</div>
            <p className="bs-offer-text">
              First order? Get <strong>10% off</strong> when you sign up
            </p>
            <button className="bs-offer-btn" type="button">Claim Now</button>
          </div>
        </div>

      </section>
    </>
  );
}