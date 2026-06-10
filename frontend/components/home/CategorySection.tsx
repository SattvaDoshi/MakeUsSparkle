// 'use client';

// import { useEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent } from 'react';
// import Link from 'next/link';

// import UpperNav from '@/components/ui/UpperNav';
// import { fetchCatalogCategories, fetchCatalogSubCategories } from '@/lib/catalogApi';
// import { useGender } from '@/lib/genderContext';

// interface SubCategoryItem {
//   name: string;
//   img: string;
//   href: string;
// }

// interface CategoryItem {
//   name: string;
//   icon: string;
//   img: string;
//   href: string;
//   sub: SubCategoryItem[];
// }

// const IMG = {
//   necklace: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=90',
//   earrings: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=90',
//   rings: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=90',
//   bracelets: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=90',
//   waistChain: 'https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=800&q=90',
//   couple: 'https://images.unsplash.com/photo-1588444650733-d0f07d323dde?w=800&q=90',
//   giftBox: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&q=90',
//   fanCombo: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=800&q=90',
//   hair: 'https://images.unsplash.com/photo-1591206422576-7e00ff5f7db7?w=800&q=90',
//   keychain: 'https://images.unsplash.com/photo-1582143570735-ebf7c44a5c54?w=800&q=90',
//   combo: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=800&q=90',
//   charm: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=800&q=90',
//   menChain: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=800&q=90',
//   menBracelet: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=90',
//   menRing: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=90',
//   menEarring: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=90',
//   menWatch: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=90',
//   menPendant: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=90',
// };

// const FALLBACK_CATEGORY_IMAGE = IMG.combo;
// const FALLBACK_SUBCATEGORY_IMAGE = IMG.necklace;

// function ShineCard({ sub, index }: { sub: SubCategoryItem; index: number }) {
//   const ref = useRef<HTMLAnchorElement>(null);
//   const [shine, setShine] = useState({ x: 50, y: 50, on: false });

//   const move = (event: MouseEvent<HTMLAnchorElement>) => {
//     if (!ref.current) return;
//     const rect = ref.current.getBoundingClientRect();
//     setShine({
//       x: ((event.clientX - rect.left) / rect.width) * 100,
//       y: ((event.clientY - rect.top) / rect.height) * 100,
//       on: true,
//     });
//   };

//   return (
//     <Link
//       ref={ref}
//       href={sub.href}
//       className="sc-card"
//       onMouseMove={move}
//       onMouseLeave={() => setShine((current) => ({ ...current, on: false }))}
//       style={{ '--sx': `${shine.x}%`, '--sy': `${shine.y}%`, animationDelay: `${index * 0.065}s` } as CSSProperties & Record<string, string>}
//     >
//       <div className="sc-img">
//         <img src={sub.img} alt={sub.name} loading="lazy" />
//         <div className="sc-grad" />
//         <div className={`sc-shine${shine.on ? ' on' : ''}`} />
//       </div>
//       <div className="sc-overlay-name">
//         <span className="sc-name">{sub.name}</span>
//         <span className="sc-arr">
//           <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
//             <path d="M5 12h14M12 5l7 7-7 7" />
//           </svg>
//         </span>
//       </div>
//       <div className="sc-bar" />
//     </Link>
//   );
// }

// export default function CategorySection() {
//   const { gender: selectedGender, setGender, genders } = useGender();
//   const [categories, setCategories] = useState<CategoryItem[]>([]);
//   const [activeIdx, setActiveIdx] = useState(0);
//   const [visible, setVisible] = useState(false);
//   const sectionRef = useRef<HTMLElement>(null);

//   const genderTabs = useMemo(() => {
//     if (genders.length > 0) return genders;
//     return [
//       { id: 'women', name: 'Women', slug: 'women', isActive: true },
//       { id: 'men', name: 'Men', slug: 'men', isActive: true },
//       { id: 'kids', name: 'Kids', slug: 'kids', isActive: true },
//     ];
//   }, [genders]);

//   const tab = genderTabs.some((genderItem) => genderItem.slug === selectedGender)
//     ? selectedGender
//     : genderTabs[0]?.slug || 'women';

//   useEffect(() => {
//     if (tab !== selectedGender) {
//       // eslint-disable-next-line no-console
//       console.log("CategorySection: tab differs from selectedGender, setting global gender ->", tab, "(selectedGender:", selectedGender, ", genderTabs:", genderTabs.map(g=>g.slug));
//       setGender(tab);
//     }
//   }, [selectedGender, setGender, tab]);

//   useEffect(() => {
//     let mounted = true;

//     Promise.all([fetchCatalogCategories(), fetchCatalogSubCategories()])
//       .then(([catalogCategories, subcategories]) => {
//         if (!mounted) return;

//         const routePrefix = tab;
//         const filteredCategories = catalogCategories.filter(
//           (category) => !category.genderSlug || category.genderSlug === tab
//         );
//         const filteredIds = new Set(filteredCategories.map((category) => category.id));
//         const subcategoriesByCategory = new Map<string, SubCategoryItem[]>();

//         subcategories.forEach((sub) => {
//           if (!sub.categoryId || !filteredIds.has(sub.categoryId)) return;
//           const list = subcategoriesByCategory.get(sub.categoryId) || [];
//           list.push({
//             name: sub.name,
//             img: sub.image || FALLBACK_SUBCATEGORY_IMAGE,
//             href: `/subcategory/${sub.slug}`,
//           });
//           subcategoriesByCategory.set(sub.categoryId, list);
//         });

//         const iconMap: Record<string, string> = {
//           jewellery: '◈',
//           'gift-boxes': '⊡',
//           'fan-combos': '✦',
//           'charm-jewellery': '◎',
//           'custom-charm-jewellery': '◎',
//           'hair-accessories': '⟡',
//           keychains: '⌖',
//           'watch-straps': '⊞',
//           'curated-combos': '⊟',
//         };

//         const subcategorySlugs = new Set(['keychains', 'charm-jewellery', 'custom-charm-jewellery']);

//         const nextCategories = filteredCategories.map((category) => ({
//           name: category.name,
//           icon: iconMap[category.slug] || '◈',
//           img: category.image || FALLBACK_CATEGORY_IMAGE,
//           href: subcategorySlugs.has(category.slug)
//             ? `/subcategory/${category.slug}`
//             : `/categories/${routePrefix}/${category.slug}`,
//           sub: subcategoriesByCategory.get(category.id) || [],
//         }));

//         setCategories(nextCategories);
//         setActiveIdx(0);
//       })
//       .catch(() => {
//         if (mounted) {
//           setCategories([]);
//           setActiveIdx(0);
//         }
//       });

//     return () => {
//       mounted = false;
//     };
//   }, [tab]);

//   const active = categories[activeIdx] || categories[0] || {
//     name: 'Loading',
//     icon: '◈',
//     img: IMG.combo,
//     href: '#',
//     sub: [],
//   };

//   useEffect(() => {
//     const observer = new IntersectionObserver(
//       ([entry]) => {
//         if (entry.isIntersecting) setVisible(true);
//       },
//       { threshold: 0.08 }
//     );

//     if (sectionRef.current) observer.observe(sectionRef.current);
//     return () => observer.disconnect();
//   }, []);

//   return (
//     <>
//       <style>{CSS}</style>
//       <UpperNav />
//       <section className="cs" id="categories" ref={sectionRef}>
//         <div className={`cs-hd${visible ? ' in' : ''}`}>
//           <div className="cs-hd-left">
//             <span className="cs-eyebrow">Discover</span>
//             <h2 className="cs-title">Shop by <em>Category</em></h2>
//           </div>
//           <div className="cs-gender-bar">
//             {genderTabs.map((genderItem) => (
//               <button
//                 key={genderItem.slug}
//                 className={`gender-btn-cat ${tab === genderItem.slug ? 'active-btn-cat' : 'inactive-cat'}`}
//                 onClick={() => setGender(genderItem.slug)}
//               >
//                 {genderItem.name}
//               </button>
//             ))}
//           </div>
//         </div>

//         <div className={`cs-wrap${visible ? ' in' : ''}`}>
//           <div className="cs-panel">
//             <nav className="cs-sb" aria-label="Product categories">
//               <div className="cs-sb-hd">
//                 <span className="cs-sb-eyebrow">Collections</span>
//               </div>
//               {categories.map((category, index) => (
//                 category.sub.length === 0 ? (
//                   <Link
//                     key={category.name}
//                     href={category.href}
//                     className={`cs-sbbtn${activeIdx === index ? ' on' : ''}`}
//                   >
//                     <div className="cs-sb-thumb">
//                       <img src={category.img} alt="" aria-hidden="true" loading="lazy" />
//                     </div>
//                     <span className="cs-sb-txt">{category.name}</span>
//                   </Link>
//                 ) : (
//                   <button
//                     key={category.name}
//                     className={`cs-sbbtn${activeIdx === index ? ' on' : ''}`}
//                     onClick={() => setActiveIdx(index)}
//                     aria-current={activeIdx === index ? 'page' : undefined}
//                   >
//                     <div className="cs-sb-thumb">
//                       <img src={category.img} alt="" aria-hidden="true" loading="lazy" />
//                     </div>
//                     <span className="cs-sb-txt">{category.name}</span>
//                     <span className="cs-sb-count">{category.sub.length}</span>
//                   </button>
//                 )
//               ))}
//             </nav>

//             <div className="cs-ct">
//               <div className="cs-ct-hd">
//                 <h3 className="cs-ct-title">
//                   {active.name.includes(' ')
//                     ? <>{active.name.split(' ')[0]} <em>{active.name.split(' ').slice(1).join(' ')}</em></>
//                     : <em>{active.name}</em>}
//                 </h3>
//                 <Link href={active.href} className="cs-va">
//                   View all
//                   <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
//                     <path d="M5 12h14M12 5l7 7-7 7" />
//                   </svg>
//                 </Link>
//               </div>

//               {active.sub.length > 0 ? (
//                 <div className="cs-grid">
//                   {active.sub.map((sub, index) => (
//                     <ShineCard key={sub.name} sub={sub} index={index} />
//                   ))}
//                 </div>
//               ) : (
//                 <div className="cs-solo-placeholder">
//                   <p>Select a category from the left to explore.</p>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </section>
//     </>
//   );
// }

// const CSS = `
// @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400;1,600&family=Nunito:wght@300;400;500;600;700&display=swap');

// :root {
//   --white: #ffffff;
//   --cream: #faf8f3;
//   --cream2: #f3ede1;
//   --gd: #253d18;
//   --gs: #527a3e;
//   --gp: #ddecd1;
//   --gt: #eff6ea;
//   --gold: #a07820;
//   --t1: #1c1c17;
//   --t2: #484840;
//   --t3: #828278;
//   --t4: #b4b4a4;
//   --bs: rgba(60,90,35,0.09);
//   --bm: rgba(60,90,35,0.18);
// }

// *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

// .cs { background: var(--cream); padding: 56px 0 72px; font-family: 'Nunito', sans-serif; color: var(--t1); }
// .cs-hd { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; padding: 0 48px 24px; opacity: 0; transform: translateY(8px); transition: opacity .45s ease, transform .45s ease; }
// .cs-hd.in { opacity: 1; transform: none; }
// .cs-eyebrow, .cs-sb-eyebrow { font-size: 10px; letter-spacing: .18em; text-transform: uppercase; color: var(--t3); }
// .cs-title, .cs-ct-title { font-family: 'Cormorant Garamond', serif; font-size: clamp(1.8rem, 3.8vw, 2.7rem); font-weight: 400; }
// .cs-title em, .cs-ct-title em { font-style: italic; color: var(--gd); }
// .cs-gender-bar { display: flex; gap: 10px; flex-wrap: wrap; }
// .gender-btn-cat { border: 1px solid var(--bm); background: var(--white); color: var(--t2); border-radius: 999px; padding: 10px 18px; font-size: 11px; letter-spacing: .14em; text-transform: uppercase; cursor: pointer; transition: all .2s ease; }
// .gender-btn-cat.active-btn-cat { background: var(--gd); border-color: var(--gd); color: var(--white); }
// .gender-btn-cat.inactive-cat:hover { border-color: var(--gd); color: var(--gd); }
// .cs-wrap { padding: 0 48px; opacity: 0; transform: translateY(10px); transition: opacity .45s ease, transform .45s ease; }
// .cs-wrap.in { opacity: 1; transform: none; }
// .cs-panel { display: grid; grid-template-columns: 280px 1fr; gap: 24px; background: var(--white); border: 1px solid var(--bs); border-radius: 28px; box-shadow: 0 12px 44px rgba(35,60,18,.08); overflow: hidden; }
// .cs-sb { padding: 24px; border-right: 1px solid var(--bs); display: grid; gap: 10px; }
// .cs-sb-hd { margin-bottom: 6px; }
// .cs-sbbtn { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border: 1px solid transparent; border-radius: 16px; background: transparent; cursor: pointer; color: inherit; text-decoration: none; transition: background .2s ease, border-color .2s ease, transform .2s ease; }
// .cs-sbbtn:hover, .cs-sbbtn.on { background: var(--gt); border-color: var(--gp); transform: translateY(-1px); }
// .cs-sb-thumb { width: 56px; height: 56px; border-radius: 14px; overflow: hidden; flex-shrink: 0; background: var(--cream2); }
// .cs-sb-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
// .cs-sb-txt { font-size: 13px; font-weight: 700; letter-spacing: .02em; }
// .cs-sb-count { margin-left: auto; font-size: 10px; color: var(--t3); }
// .cs-ct { padding: 24px; }
// .cs-ct-hd { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 18px; }
// .cs-va, .cs-showall { display: inline-flex; align-items: center; gap: 6px; text-decoration: none; color: var(--gd); font-size: 11px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; }
// .cs-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
// .sc-card { position: relative; display: block; border-radius: 24px; overflow: hidden; min-height: 190px; color: inherit; text-decoration: none; box-shadow: 0 10px 30px rgba(35,60,18,.08); }
// .sc-img { position: absolute; inset: 0; }
// .sc-img img { width: 100%; height: 100%; object-fit: cover; display: block; }
// .sc-grad { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,.05), rgba(0,0,0,.5)); }
// .sc-shine { position: absolute; inset: 0; background: radial-gradient(circle at var(--sx) var(--sy), rgba(255,255,255,.2), transparent 34%); opacity: 0; transition: opacity .2s ease; }
// .sc-shine.on { opacity: 1; }
// .sc-overlay-name { position: absolute; left: 16px; right: 16px; bottom: 16px; display: flex; align-items: flex-end; justify-content: space-between; gap: 10px; color: var(--white); }
// .sc-name { font-size: 16px; font-weight: 700; }
// .sc-arr { width: 28px; height: 28px; border-radius: 50%; background: rgba(255,255,255,.18); display: grid; place-items: center; }
// .sc-bar { position: absolute; left: 0; right: 0; bottom: 0; height: 3px; background: rgba(255,255,255,.55); }
// .cs-solo-placeholder { min-height: 260px; display: grid; place-items: center; color: var(--t3); font-size: 14px; background: linear-gradient(135deg, var(--gt), var(--white)); border-radius: 24px; }

// @media (max-width: 1024px) {
//   .cs-hd, .cs-wrap { padding-left: 24px; padding-right: 24px; }
//   .cs-panel { grid-template-columns: 240px 1fr; }
//   .cs-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
// }

// @media (max-width: 768px) {
//   .cs-hd { flex-direction: column; align-items: flex-start; }
//   .cs-panel { grid-template-columns: 1fr; }
//   .cs-sb { border-right: none; border-bottom: 1px solid var(--bs); overflow-x: auto; display: flex; }
//   .cs-sbbtn { min-width: 180px; }
//   .cs-grid { grid-template-columns: 1fr; }
// }

// @media (max-width: 520px) {
//   .cs, .cs-wrap, .cs-hd { padding-left: 14px; padding-right: 14px; }
//   .cs-panel { border-radius: 22px; }
//   .cs-ct { padding: 18px; }
//   .sc-card { min-height: 160px; }
// }
// `;




'use client';

import {
  useState,
  useEffect,
  useRef,
  useMemo,
  type CSSProperties,
  type MouseEvent,
} from 'react';
import Link from 'next/link';
import { useGender } from '@/lib/genderContext';
import { fetchCatalogCategories, fetchCatalogSubCategories } from '@/lib/catalogApi';
import UpperNav from '@/components/ui/UpperNav';

interface SubCategoryItem {
  name: string;
  img: string;
  href: string;
}

interface CategoryItem {
  name: string;
  icon: string;
  img: string;
  href: string;
  sub: SubCategoryItem[];
}

const IMG = {
  necklace:    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=90',
  earrings:    'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=90',
  rings:       'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=90',
  bracelets:   'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=90',
  waistChain:  'https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=800&q=90',
  couple:      'https://images.unsplash.com/photo-1588444650733-d0f07d323dde?w=800&q=90',
  giftBox:     'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&q=90',
  fanCombo:    'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=800&q=90',
  hair:        'https://images.unsplash.com/photo-1591206422576-7e00ff5f7db7?w=800&q=90',
  keychain:    'https://images.unsplash.com/photo-1582143570735-ebf7c44a5c54?w=800&q=90',
  combo:       'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=800&q=90',
  charm:       'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=800&q=90',
  menChain:    'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=800&q=90',
  menBracelet: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=90',
  menRing:     'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=90',
  menEarring:  'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=90',
  menWatch:    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=90',
  menPendant:  'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=90',
};

const FALLBACK_CATEGORY_IMAGE = IMG.combo;
const FALLBACK_SUBCATEGORY_IMAGE = IMG.necklace;

/* ─── Desktop Sub-Card ─── */
function ShineCard({ sub, index }: { sub: SubCategoryItem; index: number }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [shine, setShine] = useState({ x: 50, y: 50, on: false });

  const move = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setShine({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100, on: true });
  };

  return (
    <Link
      ref={ref}
      href={sub.href}
      className="sc-card"
      onMouseMove={move}
      onMouseLeave={() => setShine(s => ({ ...s, on: false }))}
      style={{ '--sx': `${shine.x}%`, '--sy': `${shine.y}%`, animationDelay: `${index * 0.065}s` } as CSSProperties & Record<string, string>}
    >
      <div className="sc-img">
        <img src={sub.img} alt={sub.name} loading="lazy" />
        <div className="sc-grad" />
        <div className={`sc-shine${shine.on ? ' on' : ''}`} />
      </div>
      <div className="sc-overlay-name">
        <span className="sc-name">{sub.name}</span>
        <span className="sc-arr">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </span>
      </div>
      <div className="sc-bar" />
    </Link>
  );
}

/* ─── Mobile Split-Pane ─── */
function MobileSplit({
  categories,
  tab,
  genderTabs,
  setTab,
}: {
  categories: CategoryItem[];
  tab: string;
  genderTabs: { id: string; name: string; slug: string; isActive: boolean }[];
  setTab: (g: string) => void;
}) {
  const [activeIdx, setActiveIdx] = useState(0);
  const active = categories[activeIdx] || categories[0] || {
    name: 'Loading', icon: '◈', img: IMG.combo, href: '#', sub: [],
  };

  return (
    <div className="ms-root">
      <div className="ms-top">
        <div className="ms-top-left">
          <p className="ms-eyebrow">Discover</p>
          <h2 className="ms-title">Shop by <em>Category</em></h2>
        </div>
      </div>
      <div className="ms-gender-bar">
        {genderTabs.map((genderItem) => (
          <button
            key={genderItem.slug}
            className={`gender-btn-cat ${tab === genderItem.slug ? 'active-btn-cat' : 'inactive-cat'}`}
            onClick={() => setTab(genderItem.slug)}
          >
            {genderItem.name}
          </button>
        ))}
      </div>

      <div className="ms-pane">
        <nav className="ms-sb" aria-label="Category navigation">
          {categories.map((cat, i) => (
            cat.sub.length === 0
              ? (
                <Link
                  key={cat.name}
                  href={cat.href}
                  className={`ms-sbbtn${activeIdx === i ? ' on' : ''}`}
                >
                  <div className="ms-sb-thumb">
                    <img src={cat.img} alt="" aria-hidden="true" loading="lazy" />
                  </div>
                  <span className="ms-sb-label">{cat.name}</span>
                </Link>
              )
              : (
                <button
                  key={cat.name}
                  className={`ms-sbbtn${activeIdx === i ? ' on' : ''}`}
                  onClick={() => setActiveIdx(i)}
                  aria-current={activeIdx === i ? 'page' : undefined}
                >
                  <div className="ms-sb-thumb">
                    <img src={cat.img} alt="" aria-hidden="true" loading="lazy" />
                  </div>
                  <span className="ms-sb-label">{cat.name}</span>
                  {activeIdx === i && <span className="ms-sb-dot" aria-hidden="true" />}
                </button>
              )
          ))}
        </nav>

        <div className="ms-ct">
          <div className="ms-ct-hd">
            <span className="ms-ct-title">
              {active.name.split(' ').length > 1
                ? <>{active.name.split(' ')[0]} <em>{active.name.split(' ').slice(1).join(' ')}</em></>
                : <em>{active.name}</em>
              }
            </span>
            <Link href={active.href} className="ms-showall" aria-label={`Show all ${active.name}`}>
              Show all
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {active.sub.length > 0 ? (
            <div className="ms-subgrid">
              {active.sub.map(sub => (
                <Link key={sub.name} href={sub.href} className="ms-subcard">
                  <div className="ms-subcard-img">
                    <img src={sub.img} alt={sub.name} loading="lazy" />
                    <div className="ms-subcard-ov" />
                    <span className="ms-subcard-name">{sub.name}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <Link href={active.href} className="ms-solo">
              <img src={active.img} alt={active.name} className="ms-solo-img" />
              <div className="ms-solo-ov" />
              <div className="ms-solo-body">
                <span className="ms-solo-ttl">{active.name}</span>
                <span className="ms-solo-cta">
                  Explore
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ─── */
export default function CategorySection() {
  const { gender: selectedGender, setGender, genders } = useGender();
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const genderTabs = useMemo(() => {
    if (genders.length > 0) return genders;
    return [
      { id: 'women', name: 'Women', slug: 'women', isActive: true },
      { id: 'men', name: 'Men', slug: 'men', isActive: true },
      { id: 'kids', name: 'Kids', slug: 'kids', isActive: true },
    ];
  }, [genders]);

  const tab = genderTabs.some((genderItem) => genderItem.slug === selectedGender)
    ? selectedGender
    : genderTabs[0]?.slug || 'women';

  useEffect(() => {
    if (tab !== selectedGender) {
      setGender(tab);
    }
  }, [selectedGender, setGender, tab]);

  const setTab = (g: string) => {
    setGender(g);
    setActiveIdx(0);
  };

  useEffect(() => {
    let mounted = true;

    Promise.all([fetchCatalogCategories(), fetchCatalogSubCategories()])
      .then(([catalogCategories, subcategories]) => {
        if (!mounted) return;

        const routePrefix = tab;
        const filteredCategories = catalogCategories
          .filter((category) => !category.genderSlug || category.genderSlug === tab)
          .sort((left, right) => {
            const leftIsJewellery = left.name?.trim().toLowerCase() === 'jewellery';
            const rightIsJewellery = right.name?.trim().toLowerCase() === 'jewellery';

            if (leftIsJewellery && !rightIsJewellery) return -1;
            if (!leftIsJewellery && rightIsJewellery) return 1;
            return 0;
          });
        const filteredIds = new Set(filteredCategories.map((category) => category.id));
        const subcategoriesByCategory = new Map<string, SubCategoryItem[]>();

        subcategories.forEach((sub) => {
          if (!sub.categoryId || !filteredIds.has(sub.categoryId)) return;
          const list = subcategoriesByCategory.get(sub.categoryId) || [];
          list.push({
            name: sub.name,
            img: sub.image || FALLBACK_SUBCATEGORY_IMAGE,
            href: `/subcategory/${sub.slug}`,
          });
          subcategoriesByCategory.set(sub.categoryId, list);
        });

        const ICONS: Record<string, string> = {
          'jewellery': '◈',
          'gift-boxes': '⊡',
          'fan-combos': '✦',
          'charm-jewellery': '◎',
          'custom-charm-jewellery': '◎',
          'hair-accessories': '⟡',
          'keychains': '⌖',
          'watch-straps': '⊞',
          'curated-combos': '⊟',
        };

        const SUBCATEGORY_SLUGS = new Set(['keychains', 'charm-jewellery', 'custom-charm-jewellery']);

        const nextCategories = filteredCategories.map((category) => ({
          name: category.name,
          icon: ICONS[category.slug] || '◈',
          img: category.image || FALLBACK_CATEGORY_IMAGE,
          href: SUBCATEGORY_SLUGS.has(category.slug)
            ? `/subcategory/${category.slug}`
            : `/categories/${routePrefix}/${category.slug}`,
          sub: subcategoriesByCategory.get(category.id) || [],
        }));

        setCategories(nextCategories);
        setActiveIdx(0);
      })
      .catch(() => {
        if (mounted) {
          setCategories([]);
          setActiveIdx(0);
        }
      });

    return () => { mounted = false; };
  }, [tab]);

  const active = categories[activeIdx] || categories[0] || {
    name: 'Loading', icon: '◈', img: IMG.combo, href: '#', sub: [],
  };

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.06 },
    );
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <style>{CSS}</style>
      <UpperNav/>
      <section className="cs" id="categories" ref={sectionRef} style={{ marginTop: "60px"}}>

        {/* DESKTOP + TABLET */}
        <div className={`cs-hd${visible ? ' in' : ''}`}>
          <div className="cs-hd-left">
            <span className="cs-eyebrow">Discover</span>
            <h2 className="cs-title">Shop by <em>Category</em></h2>
          </div>
          <div className="cs-gender-bar">
            {genderTabs.map((genderItem) => (
              <button
                key={genderItem.slug}
                className={`gender-btn-cat ${tab === genderItem.slug ? 'active-btn-cat' : 'inactive-cat'}`}
                onClick={() => setTab(genderItem.slug)}
              >
                {genderItem.name}
              </button>
            ))}
          </div>
        </div>

        <div className={`cs-wrap${visible ? ' in' : ''}`}>
          <div className="cs-panel">

            {/* ── LEFT SIDEBAR ── */}
            <nav className="cs-sb" aria-label="Product categories">
              <div className="cs-sb-hd">
                <span className="cs-sb-eyebrow">Collections</span>
              </div>

              {categories.map((cat, i) => (
                cat.sub.length === 0
                  ? (
                    <Link
                      key={cat.name}
                      href={cat.href}
                      className={`cs-sbbtn${activeIdx === i ? ' on' : ''}`}
                    >
                      <div className="cs-sb-thumb">
                        <img src={cat.img} alt="" aria-hidden="true" loading="lazy" />
                      </div>
                      <span className="cs-sb-txt">{cat.name}</span>
                    </Link>
                  )
                  : (
                    <button
                      key={cat.name}
                      className={`cs-sbbtn${activeIdx === i ? ' on' : ''}`}
                      onClick={() => setActiveIdx(i)}
                      aria-current={activeIdx === i ? 'page' : undefined}
                    >
                      <div className="cs-sb-thumb">
                        <img src={cat.img} alt="" aria-hidden="true" loading="lazy" />
                      </div>
                      <span className="cs-sb-txt">{cat.name}</span>
                      <span className="cs-sb-count">{cat.sub.length}</span>
                    </button>
                  )
              ))}
            </nav>

            {/* ── RIGHT CONTENT ── */}
            <div className="cs-ct">
              <div className="cs-ct-hd">
                <h3 className="cs-ct-title">
                  {active.name.includes(' ')
                    ? <>{active.name.split(' ')[0]} <em>{active.name.split(' ').slice(1).join(' ')}</em></>
                    : <em>{active.name}</em>}
                </h3>
                <Link href={active.href} className="cs-va">
                  View all
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              {active.sub.length > 0 ? (
                <div className="cs-grid">
                  {active.sub.map((sub, i) => <ShineCard key={sub.name} sub={sub} index={i} />)}
                </div>
              ) : (
                <div className="cs-solo-placeholder">
                  <p>Select a category from the left to explore.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* MOBILE */}
        <MobileSplit key={tab} categories={categories} tab={tab} genderTabs={genderTabs} setTab={setTab} />

      </section>
    </>
  );
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=Nunito:wght@300;400;500;600;700&display=swap');

:root {
  --white:     #ffffff;
  --cream:     #faf8f3;
  --cream2:    #f3ede1;
  --gd:        #253d18;
  --gm:        #365928;
  --gs:        #527a3e;
  --gl:        #7aaa5c;
  --gp:        #ddecd1;
  --gt:        #eff6ea;
  --gold:      #a07820;
  --gold-l:    #c8992e;
  --t1:        #1c1c17;
  --t2:        #484840;
  --t3:        #828278;
  --t4:        #b4b4a4;
  --bs:        rgba(60,90,35,0.09);
  --bm:        rgba(60,90,35,0.18);
  --sxs:       0 1px 4px rgba(35,60,18,0.07);
  --ssm:       0 2px 12px rgba(35,60,18,0.09);
  --smd:       0 6px 26px rgba(35,60,18,0.11);
  --slg:       0 18px 54px rgba(35,60,18,0.14);
  --r8:        8px;
  --r12:       12px;
  --r16:       16px;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.cs {
  background: var(--cream);
  padding: 56px 0 72px;
  font-family: 'Nunito', sans-serif;
  position: relative;
  overflow: hidden;
}
.cs::before {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; height: 2.5px;
  background: linear-gradient(90deg, transparent 4%, var(--gs) 32%, var(--gold-l) 62%, transparent 96%);
  opacity: .42;
}
.cs::after {
  content: '';
  position: absolute; inset: 0; pointer-events: none; z-index: 0;
  background:
    radial-gradient(ellipse 65% 44% at 96% 4%,  rgba(82,122,62,.055) 0%, transparent 62%),
    radial-gradient(ellipse 55% 55% at 4%  96%, rgba(160,120,32,.04) 0%, transparent 56%);
}

/* ── Desktop header ── */
.cs-hd {
  display: flex; flex-direction: column; align-items: flex-start; gap: 20px;
  padding: 0 48px 32px;
  position: relative; z-index: 1;
  opacity: 0; transform: translateY(14px);
  transition: opacity .52s ease, transform .52s ease;
}
.cs-hd.in { opacity: 1; transform: translateY(0); }
.cs-hd-left { display: flex; flex-direction: column; gap: 5px; }

/* Gender toggle bar — full width row below title */
.cs-gender-bar {
  display: flex; align-items: center; gap: 12px;
}

.gender-btn-cat {
  font-family: 'Nunito', sans-serif;
  font-size: 0.85rem; font-weight: 700;
  letter-spacing: 0.12em; text-transform: uppercase;
  cursor: pointer;
  border: 1.5px solid var(--gd);
  padding: 10px 36px;
  transition: all 0.22s ease;
  min-width: 110px; text-align: center;
  background: transparent; color: var(--gd);
  border-radius: 0;
}

.gender-btn-cat.inactive-cat { background: transparent; color: var(--gd); }
.gender-btn-cat.inactive-cat:hover { background: var(--gt); }
.gender-btn-cat.active-btn-cat { background: var(--gd); color: #fff; }
.gender-btn-cat:disabled { opacity: 0.45; cursor: not-allowed; }
.gender-btn-cat:disabled:hover { background: transparent; }

.cs-eyebrow {
  font-size: 9px; font-weight: 700; letter-spacing: .46em; text-transform: uppercase;
  color: var(--gs); display: flex; align-items: center; gap: 8px;
}
.cs-eyebrow::before {
  content: ''; width: 20px; height: 1.5px;
  background: var(--gs); border-radius: 2px; opacity: .65;
}

.cs-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(1.7rem, 2.6vw, 2.5rem);
  font-weight: 400; color: var(--t1);
  letter-spacing: -.016em; line-height: 1;
}
.cs-title em { font-style: italic; color: var(--gd); }

/* ── Desktop wrap + panel ── */
.cs-wrap {
  padding: 0 48px; position: relative; z-index: 1;
  opacity: 0; transform: translateY(20px);
  transition: opacity .62s ease .1s, transform .62s ease .1s;
}
.cs-wrap.in { opacity: 1; transform: translateY(0); }

.cs-panel {
  display: grid; grid-template-columns: 200px 1fr;
  background: var(--white);
  border: 1px solid var(--bs); border-radius: var(--r16);
  overflow: hidden; box-shadow: var(--smd);
}

/* ════════════════════════════════════════
   SIDEBAR — clean, minimal, light theme
════════════════════════════════════════ */
.cs-sb {
  display: flex; flex-direction: column;
  background: var(--white);
  border-right: 1px solid var(--bs);
  position: relative; overflow: hidden;
}

.cs-sb-hd {
  padding: 20px 18px 12px;
  border-bottom: 1px solid var(--bs);
  margin-bottom: 4px;
}
.cs-sb-eyebrow {
  display: block;
  font-size: 8px; font-weight: 700;
  letter-spacing: .48em; text-transform: uppercase;
  color: var(--t4);
}

/* Each sidebar button */
.cs-sbbtn {
  display: flex; align-items: center; gap: 10px;
  width: 100%; padding: 9px 14px 9px 12px;
  background: transparent; border: none;
  border-left: 2px solid transparent;
  cursor: pointer; text-align: left;
  color: var(--t2);
  transition: color .18s, border-color .18s, background .18s;
  text-decoration: none;
}
.cs-sbbtn:hover {
  background: var(--gt);
  border-left-color: var(--gl);
  color: var(--gd);
}
.cs-sbbtn.on {
  background: var(--gp);
  border-left-color: var(--gd);
  color: var(--gd);
}

/* Small square thumbnail — no filter, crisp */
.cs-sb-thumb {
  width: 38px; height: 38px;
  border-radius: 6px; overflow: hidden; flex-shrink: 0;
  border: 1px solid var(--bs);
  transition: border-color .18s;
}
.cs-sbbtn:hover .cs-sb-thumb,
.cs-sbbtn.on   .cs-sb-thumb { border-color: var(--gl); }

.cs-sb-thumb img {
  width: 100%; height: 100%; object-fit: cover; display: block;
  transition: transform .3s ease;
}
.cs-sbbtn:hover .cs-sb-thumb img,
.cs-sbbtn.on   .cs-sb-thumb img { transform: scale(1.06); }

/* Category name */
.cs-sb-txt {
  font-size: 15px; font-weight: 500;
  letter-spacing: .01em; line-height: 1.3;
  flex: 1;
  color: inherit;
  text-decoration:none;
}
.cs-sbbtn.on .cs-sb-txt { font-weight: 700; }

/* Sub-count pill — only shown when has sub-categories */
.cs-sb-count {
  font-size: 8px; font-weight: 700;
  color: var(--gs);
  background: var(--gt);
  border: 1px solid var(--gp);
  padding: 1px 6px; border-radius: 100px;
  flex-shrink: 0;
  transition: background .18s, color .18s;
}
.cs-sbbtn.on .cs-sb-count {
  background: var(--gd);
  color: #fff;
  border-color: var(--gd);
}

/* ── Content area ── */
.cs-ct {
  padding: 28px 30px 32px;
  min-height: 440px;
  background: var(--white);
}
.cs-ct-hd {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 22px; padding-bottom: 16px;
  border-bottom: 1px solid var(--bs); position: relative;
}
.cs-ct-hd::after {
  content: ''; position: absolute; bottom: -1px; left: 0;
  width: 52px; height: 2px;
  background: linear-gradient(90deg, var(--gd), transparent); border-radius: 2px;
}
.cs-ct-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.52rem; font-weight: 400; color: var(--t1); letter-spacing: .01em;
}
.cs-ct-title em { font-style: italic; color: var(--gd); }

.cs-va {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 9px; font-weight: 700; letter-spacing: .24em; text-transform: uppercase;
  color: var(--gs); text-decoration: none;
  padding: 8px 16px; border: 1.5px solid var(--bm); border-radius: 100px;
  background: var(--gt);
  transition: background .22s, border-color .22s, color .22s, gap .22s;
}
.cs-va:hover { background: var(--gp); border-color: var(--gs); color: var(--gd); gap: 10px; }

/* ── Desktop grid ── */
.cs-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.sc-card {
  display: block; text-decoration: none;
  position: relative; overflow: hidden;
  border-radius: var(--r8);
  border: 1px solid var(--bs);
  cursor: pointer;
  aspect-ratio: 3/4;
  animation: cardIn .48s ease both;
  transition: border-color .28s, box-shadow .28s, transform .28s;
}
@keyframes cardIn {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
}
.sc-card:hover {
  border-color: var(--bm);
  box-shadow: var(--smd);
  transform: translateY(-3px);
}

.sc-img {
  position: absolute; inset: 0;
  overflow: hidden; background: var(--cream2);
}
.sc-img img {
  width: 100%; height: 100%; object-fit: cover; display: block;
  transition: transform .68s cubic-bezier(.25,.46,.45,.94);
}
.sc-card:hover .sc-img img { transform: scale(1.07); }

.sc-grad {
  position: absolute; inset: 0;
  background: linear-gradient(
    to top,
    rgba(15,28,8,.82) 0%,
    rgba(15,28,8,.28) 42%,
    rgba(15,28,8,.06) 68%,
    transparent 88%
  );
}

.sc-shine {
  position: absolute; inset: 0; pointer-events: none;
  background: radial-gradient(circle at var(--sx,50%) var(--sy,50%), rgba(255,255,255,.13) 0%, transparent 54%);
  opacity: 0; transition: opacity .28s;
}
.sc-shine.on { opacity: 1; }

.sc-overlay-name {
  position: absolute; bottom: 0; left: 0; right: 0;
  padding: 14px 14px 14px;
  display: flex; align-items: flex-end; justify-content: space-between;
  z-index: 2;
}
.sc-name {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(0.82rem, 1.4vw, 1rem);
  font-weight: 600; font-style: italic;
  color: #fff; letter-spacing: .03em; line-height: 1.2;
  text-shadow: 0 1px 6px rgba(0,0,0,0.55);
}
.sc-arr {
  color: rgba(255,255,255,0.8);
  opacity: 0; transform: translateX(-5px);
  display: flex; align-items: center;
  transition: opacity .22s, transform .22s;
  flex-shrink: 0; margin-left: 6px;
}
.sc-card:hover .sc-arr { opacity: 1; transform: translateX(0); }

.sc-bar {
  position: absolute; bottom: 0; left: 0; right: 0; height: 2.5px;
  background: linear-gradient(90deg, var(--gold-l), var(--gl));
  transform: scaleX(0); transform-origin: left;
  transition: transform .36s cubic-bezier(.25,.46,.45,.94);
  z-index: 3;
}
.sc-card:hover .sc-bar { transform: scaleX(1); }

/* ── Tablet 661–960px ── */
@media (max-width: 960px) and (min-width: 661px) {
  .cs-wrap  { padding: 0 28px; }
  .cs-hd    { padding: 0 28px 28px; }
  .cs-panel { grid-template-columns: 180px 1fr; }
  .cs-ct    { padding: 22px 22px 26px; }
  .cs-grid  { grid-template-columns: repeat(2, 1fr); gap: 8px; }
  .sc-name  { font-size: 0.88rem; }
}

/* ══════════════════════════════
   MOBILE ≤ 660px — split-pane
══════════════════════════════ */
.ms-root { display: none; }

@media (max-width: 660px) {
  .cs { padding: 28px 0 44px; }
  .cs-hd  { display: none !important; }
  .cs-wrap { display: none !important; }
  .ms-root { display: block; padding: 0 14px; position: relative; z-index: 1; }

  .ms-top {
    display: flex; align-items: flex-start;
    margin-bottom: 12px;
  }
  .ms-top-left { display: flex; flex-direction: column; gap: 4px; }

  .ms-gender-bar {
    display: flex; align-items: center; gap: 8px;
    margin-bottom: 14px;
  }
  .gender-btn-cat {
    flex: 1; padding: 8px 0;
    font-size: 0.75rem; font-weight: 700;
    letter-spacing: 0.1em; text-transform: uppercase;
    border: 1.5px solid var(--gd);
    min-width: unset; border-radius: 0;
  }

  .ms-eyebrow {
    font-size: 8.5px; font-weight: 700; letter-spacing: .42em; text-transform: uppercase;
    color: var(--gs); display: flex; align-items: center; gap: 6px;
  }
  .ms-eyebrow::before {
    content: ''; width: 13px; height: 1.5px;
    background: var(--gs); border-radius: 2px; opacity: .6;
  }
  .ms-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.8rem; font-weight: 400; color: var(--t1); line-height: 1;
  }
  .ms-title em { font-style: italic; color: var(--gd); }

  .ms-pane {
    display: grid; grid-template-columns: 86px 1fr;
    background: var(--white); border: 1px solid var(--bs);
    border-radius: var(--r12); overflow: hidden;
    box-shadow: var(--ssm); min-height: 420px;
  }

  /* Left sidebar — light on mobile too */
  .ms-sb {
    background: var(--white);
    display: flex; flex-direction: column;
    border-right: 1px solid var(--bs);
    overflow-y: auto; scrollbar-width: none; position: relative;
  }
  .ms-sb::-webkit-scrollbar { display: none; }

  .ms-sbbtn {
    display: flex; flex-direction: column; align-items: center; gap: 5px;
    width: 100%; padding: 10px 5px 8px;
    background: transparent; border: none;
    border-left: 2px solid transparent;
    cursor: pointer; text-align: center;
    color: var(--t3);
    transition: color .18s, background .18s, border-color .18s;
    -webkit-tap-highlight-color: transparent;
    text-decoration: none;
  }
  .ms-sbbtn:active { background: var(--gt); }
  .ms-sbbtn.on { color: var(--gd); background: var(--gp); border-left-color: var(--gd); }

  .ms-sb-thumb {
    width: 48px; height: 48px; border-radius: 7px; overflow: hidden;
    border: 1.5px solid var(--bs); transition: border-color .18s; flex-shrink: 0;
  }
  .ms-sbbtn.on .ms-sb-thumb { border-color: var(--gl); }
  .ms-sb-thumb img {
    width: 100%; height: 100%; object-fit: cover; display: block;
    transition: transform .28s ease;
  }
  .ms-sbbtn.on .ms-sb-thumb img { transform: scale(1.05); }

  .ms-sb-label {
    font-size: 11px !important; font-weight: 500 !important; letter-spacing: .01em;
    color: #101010; line-height: 1.3; text-align: center;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
    overflow: hidden; width: 100%; padding: 0 2px;
    text-decoration: none;
  }
  .ms-sb-dot {
    width: 4px; height: 4px; border-radius: 50%;
    background: var(--gd); flex-shrink: 0;
  }

  /* Right content */
  .ms-ct {
    display: flex; flex-direction: column;
    padding: 12px 10px 12px;
    background: var(--cream); overflow: hidden;
  }
  .ms-ct-hd {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 10px; padding-bottom: 9px;
    border-bottom: 1px solid var(--bs);
    position: relative; gap: 6px;
  }
  .ms-ct-hd::after {
    content: ''; position: absolute; bottom: -1px; left: 0;
    width: 36px; height: 2px;
    background: linear-gradient(90deg, var(--gd), transparent); border-radius: 2px;
  }
  .ms-ct-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 2rem; font-weight: 400; color: var(--t1);
    line-height: 1.2; flex: 1; min-width: 0;
  }
  .ms-ct-title em { font-style: italic; color: var(--gd); }

  .ms-showall {
    flex-shrink: 0;
    display: inline-flex; align-items: center; gap: 4px;
    font-size: 7.5px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase;
    color: var(--gs); text-decoration: none;
    padding: 5px 9px;
    border: 1.5px solid var(--bm); border-radius: 100px;
    background: var(--gt); transition: background .2s, color .2s;
    -webkit-tap-highlight-color: transparent; white-space: nowrap;
  }
  .ms-showall:active { background: var(--gp); color: var(--gd); }

  .ms-subgrid {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 4px; flex: 1;
  }
  .ms-subcard {
    display: block; text-decoration: none;
    border-radius: 6px; overflow: hidden;
    -webkit-tap-highlight-color: transparent;
    transition: transform .14s;
    position: relative;
  }
  .ms-subcard:active { transform: scale(.97); }
  .ms-subcard-img {
    position: relative; aspect-ratio: 4/5;
    overflow: hidden; background: var(--cream2);
  }
  .ms-subcard-img img {
    width: 100%; height: 100%; object-fit: cover; display: block;
    transition: transform .4s ease;
  }
  .ms-subcard:active .ms-subcard-img img { transform: scale(1.04); }
  .ms-subcard-ov {
    position: absolute; inset: 0;
    background: linear-gradient(to top, rgba(12,24,6,.78) 0%, rgba(12,24,6,.18) 42%, transparent 68%);
  }
  .ms-subcard-name {
    position: absolute; bottom: 0; left: 0; right: 0;
    padding: 10px 10px 10px;
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(1.15rem, 4.5vw, 1.5rem);
    font-weight: 600; 
    color: #f5f2f2; line-height: 1.2;
    text-shadow: 0 1px 5px rgba(0,0,0,0.5); z-index: 2;
  }

  .ms-solo {
    display: block; text-decoration: none;
    position: relative; overflow: hidden;
    border-radius: 6px; height: 148px; flex: 1;
    -webkit-tap-highlight-color: transparent;
  }
  .ms-solo-img {
    width: 100%; height: 100%; object-fit: cover;
    position: absolute; inset: 0; filter: brightness(.46);
    transition: filter .3s;
  }
  .ms-solo:active .ms-solo-img { filter: brightness(.54); }
  .ms-solo-ov {
    position: absolute; inset: 0;
    background: linear-gradient(to top, rgba(12,26,6,.9) 0%, transparent 55%);
  }
  .ms-solo-body {
    position: absolute; bottom: 0; left: 0; right: 0;
    padding: 12px 13px;
    display: flex; align-items: flex-end; justify-content: space-between; gap: 8px;
  }
  .ms-solo-ttl {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1rem; font-weight: 400; font-style: italic;
    color: #fff; line-height: 1.2; flex: 1;
  }
  .ms-solo-cta {
    flex-shrink: 0;
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 7.5px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase;
    color: #fff; padding: 6px 11px;
    background: rgba(37,61,24,.72);
    border: 1px solid rgba(255,255,255,.2); border-radius: 100px; white-space: nowrap;
  }
}

/* Very small screens ≤ 380px */
@media (max-width: 380px) {
  .ms-pane { grid-template-columns: 72px 1fr; }
  .ms-sb-thumb { width: 42px; height: 42px; }
  .ms-sb-label { font-size: 7px; }
  .ms-ct { padding: 10px 8px; }
  .ms-subcard-name { font-size: 0.74rem; padding: 8px 8px 8px; }
}

.cs-solo-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 360px;
  color: var(--t4);
  font-size: 12px;
  letter-spacing: .1em;
}
`;