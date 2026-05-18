'use client';

import { useEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent } from 'react';
import Link from 'next/link';

import UpperNav from '@/components/ui/UpperNav';
import { fetchCatalogCategories, fetchCatalogSubCategories } from '@/lib/catalogApi';
import { useGender } from '@/lib/genderContext';

type Gender = string;

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
  necklace: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=90',
  earrings: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=90',
  rings: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=90',
  bracelets: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=90',
  waistChain: 'https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=800&q=90',
  couple: 'https://images.unsplash.com/photo-1588444650733-d0f07d323dde?w=800&q=90',
  giftBox: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&q=90',
  fanCombo: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=800&q=90',
  hair: 'https://images.unsplash.com/photo-1591206422576-7e00ff5f7db7?w=800&q=90',
  keychain: 'https://images.unsplash.com/photo-1582143570735-ebf7c44a5c54?w=800&q=90',
  combo: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=800&q=90',
  charm: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=800&q=90',
  menChain: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=800&q=90',
  menBracelet: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=90',
  menRing: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=90',
  menEarring: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=90',
  menWatch: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=90',
  menPendant: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=90',
};

const womenJewellery: SubCategoryItem[] = [
  { name: 'Necklaces', img: IMG.necklace, href: '/subcategory/necklace' },
  { name: 'Earrings', img: IMG.earrings, href: '/subcategory/earrings' },
  { name: 'Rings', img: IMG.rings, href: '/subcategory/rings' },
  { name: 'Bracelets', img: IMG.bracelets, href: '/subcategory/bracelets' },
  { name: 'Waist Chains', img: IMG.waistChain, href: '/subcategory/waist-chains' },
  { name: 'Couple Sets', img: IMG.couple, href: '/subcategory/couple-sets' },
];

const menJewellery: SubCategoryItem[] = [
  { name: 'Chains', img: IMG.menChain, href: '/subcategory/men-chains' },
  { name: 'Bracelets', img: IMG.menBracelet, href: '/subcategory/men-bracelets' },
  { name: 'Rings', img: IMG.menRing, href: '/subcategory/men-rings' },
  { name: 'Earrings', img: IMG.menEarring, href: '/subcategory/men-earrings' },
  { name: 'Pendants', img: IMG.menPendant, href: '/subcategory/men-pendants' },
  { name: 'Couple Sets', img: IMG.couple, href: '/subcategory/couple-sets' },
];

const KIDS_JEWELLERY = new Set(['Necklaces', 'Earrings', 'Rings', 'Bracelets', 'Couple Sets']);

function buildCategories(gender: Gender): CategoryItem[] {
  const isMen = gender === 'men';
  const isKids = gender === 'kids';
  const routePrefix = isKids ? 'kids' : isMen ? 'men' : 'women';
  const jewellerySubcategories = isMen
    ? menJewellery
    : isKids
      ? womenJewellery.filter((item) => KIDS_JEWELLERY.has(item.name))
      : womenJewellery;

  return [
    { name: 'Jewellery', icon: '◈', img: isMen ? IMG.menChain : IMG.necklace, href: `/categories/${routePrefix}/jewellery`, sub: jewellerySubcategories },
    { name: 'Gift Boxes', icon: '⊡', img: IMG.giftBox, href: `/categories/${routePrefix}/gift-boxes`, sub: [] },
    { name: 'Fan Combos', icon: '✦', img: IMG.fanCombo, href: `/categories/${routePrefix}/fan-combos`, sub: [] },
    { name: 'Charm Jewellery', icon: '◎', img: IMG.charm, href: '/subcategory/charm-jewellery', sub: [] },
    {
      name: isMen ? 'Watch Straps' : 'Hair Accessories',
      icon: isMen ? '⊞' : '⟡',
      img: isMen ? IMG.menWatch : IMG.hair,
      href: isMen ? `/categories/${routePrefix}/watch-straps` : `/categories/${routePrefix}/hair-accessories`,
      sub: [],
    },
    { name: 'Keychains', icon: '⌖', img: IMG.keychain, href: '/subcategory/keychains', sub: [] },
    { name: 'Curated Combos', icon: isMen ? '⊟' : '⊞', img: IMG.combo, href: `/categories/${routePrefix}/curated-combos`, sub: [] },
  ];
}

function ShineCard({ sub, index }: { sub: SubCategoryItem; index: number }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [shine, setShine] = useState({ x: 50, y: 50, on: false });

  const move = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setShine({
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
      on: true,
    });
  };

  return (
    <Link
      ref={ref}
      href={sub.href}
      className="sc-card"
      onMouseMove={move}
      onMouseLeave={() => setShine((current) => ({ ...current, on: false }))}
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

  useEffect(() => {
    let mounted = true;

    Promise.all([fetchCatalogCategories(), fetchCatalogSubCategories()])
      .then(([catalogCategories, subcategories]) => {
        if (!mounted) return;

        const templateCategories = buildCategories(tab);
        const jewelleryCategory = catalogCategories.find((category) => category.slug === 'jewellery');
        const allowedSubcategories = tab === 'men'
          ? new Set(['Men Chains', 'Men Bracelets', 'Men Rings', 'Men Earrings', 'Men Pendants', 'Couple Sets'])
          : tab === 'kids'
            ? KIDS_JEWELLERY
            : new Set(['Necklaces', 'Earrings', 'Rings', 'Bracelets', 'Waist Chains', 'Couple Sets']);

        const jewellerySub = subcategories
          .filter((sub) => sub.categoryId && sub.categoryId === jewelleryCategory?.id && allowedSubcategories.has(sub.name))
          .map((sub) => ({
            name: sub.name,
            img: sub.image || IMG.necklace,
            href: `/subcategory/${sub.slug}`,
          }));

        const iconMap: Record<string, string> = {
          jewellery: '◈',
          'gift-boxes': '⊡',
          'fan-combos': '✦',
          'charm-jewellery': '◎',
          'custom-charm-jewellery': '◎',
          'hair-accessories': '⟡',
          keychains: '⌖',
          'watch-straps': '⊞',
          'curated-combos': '⊟',
        };

        const excludedSlugs = tab === 'men'
          ? new Set(['hair-accessories'])
          : tab === 'kids'
            ? new Set(['hair-accessories', 'watch-straps'])
            : new Set(['watch-straps']);

        const subcategorySlugs = new Set(['keychains', 'charm-jewellery', 'custom-charm-jewellery']);

        const nextCategories = catalogCategories
          .filter((category) => !excludedSlugs.has(category.slug))
          .map((category) => ({
            name: category.name,
            icon: iconMap[category.slug] || '◈',
            img: category.image || IMG.combo,
            href: subcategorySlugs.has(category.slug)
              ? `/subcategory/${category.slug}`
              : `/categories/${tab}/${category.slug}`,
            sub: category.slug === 'jewellery' ? jewellerySub : [],
          }));

        setCategories(nextCategories.length > 0 ? nextCategories : templateCategories);
        setActiveIdx(0);
      })
      .catch(() => {
        if (mounted) {
          setCategories(buildCategories(tab));
          setActiveIdx(0);
        }
      });

    return () => {
      mounted = false;
    };
  }, [tab]);

  const active = categories[activeIdx] || categories[0] || {
    name: 'Loading',
    icon: '◈',
    img: IMG.combo,
    href: '#',
    sub: [],
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.08 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <style>{CSS}</style>
      <UpperNav />
      <section className="cs" id="categories" ref={sectionRef}>
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
                onClick={() => setGender(genderItem.slug)}
              >
                {genderItem.name}
              </button>
            ))}
          </div>
        </div>

        <div className={`cs-wrap${visible ? ' in' : ''}`}>
          <div className="cs-panel">
            <nav className="cs-sb" aria-label="Product categories">
              <div className="cs-sb-hd">
                <span className="cs-sb-eyebrow">Collections</span>
              </div>
              {categories.map((category, index) => (
                category.sub.length === 0 ? (
                  <Link
                    key={category.name}
                    href={category.href}
                    className={`cs-sbbtn${activeIdx === index ? ' on' : ''}`}
                  >
                    <div className="cs-sb-thumb">
                      <img src={category.img} alt="" aria-hidden="true" loading="lazy" />
                    </div>
                    <span className="cs-sb-txt">{category.name}</span>
                  </Link>
                ) : (
                  <button
                    key={category.name}
                    className={`cs-sbbtn${activeIdx === index ? ' on' : ''}`}
                    onClick={() => setActiveIdx(index)}
                    aria-current={activeIdx === index ? 'page' : undefined}
                  >
                    <div className="cs-sb-thumb">
                      <img src={category.img} alt="" aria-hidden="true" loading="lazy" />
                    </div>
                    <span className="cs-sb-txt">{category.name}</span>
                    <span className="cs-sb-count">{category.sub.length}</span>
                  </button>
                )
              ))}
            </nav>

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
                  {active.sub.map((sub, index) => (
                    <ShineCard key={sub.name} sub={sub} index={index} />
                  ))}
                </div>
              ) : (
                <div className="cs-solo-placeholder">
                  <p>Select a category from the left to explore.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400;1,600&family=Nunito:wght@300;400;500;600;700&display=swap');

:root {
  --white: #ffffff;
  --cream: #faf8f3;
  --cream2: #f3ede1;
  --gd: #253d18;
  --gs: #527a3e;
  --gp: #ddecd1;
  --gt: #eff6ea;
  --gold: #a07820;
  --t1: #1c1c17;
  --t2: #484840;
  --t3: #828278;
  --t4: #b4b4a4;
  --bs: rgba(60,90,35,0.09);
  --bm: rgba(60,90,35,0.18);
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.cs { background: var(--cream); padding: 56px 0 72px; font-family: 'Nunito', sans-serif; color: var(--t1); }
.cs-hd { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; padding: 0 48px 24px; opacity: 0; transform: translateY(8px); transition: opacity .45s ease, transform .45s ease; }
.cs-hd.in { opacity: 1; transform: none; }
.cs-eyebrow, .cs-sb-eyebrow { font-size: 10px; letter-spacing: .18em; text-transform: uppercase; color: var(--t3); }
.cs-title, .cs-ct-title { font-family: 'Cormorant Garamond', serif; font-size: clamp(1.8rem, 3.8vw, 2.7rem); font-weight: 400; }
.cs-title em, .cs-ct-title em { font-style: italic; color: var(--gd); }
.cs-gender-bar { display: flex; gap: 10px; flex-wrap: wrap; }
.gender-btn-cat { border: 1px solid var(--bm); background: var(--white); color: var(--t2); border-radius: 999px; padding: 10px 18px; font-size: 11px; letter-spacing: .14em; text-transform: uppercase; cursor: pointer; transition: all .2s ease; }
.gender-btn-cat.active-btn-cat { background: var(--gd); border-color: var(--gd); color: var(--white); }
.gender-btn-cat.inactive-cat:hover { border-color: var(--gd); color: var(--gd); }
.cs-wrap { padding: 0 48px; opacity: 0; transform: translateY(10px); transition: opacity .45s ease, transform .45s ease; }
.cs-wrap.in { opacity: 1; transform: none; }
.cs-panel { display: grid; grid-template-columns: 280px 1fr; gap: 24px; background: var(--white); border: 1px solid var(--bs); border-radius: 28px; box-shadow: 0 12px 44px rgba(35,60,18,.08); overflow: hidden; }
.cs-sb { padding: 24px; border-right: 1px solid var(--bs); display: grid; gap: 10px; }
.cs-sb-hd { margin-bottom: 6px; }
.cs-sbbtn { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border: 1px solid transparent; border-radius: 16px; background: transparent; cursor: pointer; color: inherit; text-decoration: none; transition: background .2s ease, border-color .2s ease, transform .2s ease; }
.cs-sbbtn:hover, .cs-sbbtn.on { background: var(--gt); border-color: var(--gp); transform: translateY(-1px); }
.cs-sb-thumb { width: 56px; height: 56px; border-radius: 14px; overflow: hidden; flex-shrink: 0; background: var(--cream2); }
.cs-sb-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
.cs-sb-txt { font-size: 13px; font-weight: 700; letter-spacing: .02em; }
.cs-sb-count { margin-left: auto; font-size: 10px; color: var(--t3); }
.cs-ct { padding: 24px; }
.cs-ct-hd { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 18px; }
.cs-va, .cs-showall { display: inline-flex; align-items: center; gap: 6px; text-decoration: none; color: var(--gd); font-size: 11px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; }
.cs-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
.sc-card { position: relative; display: block; border-radius: 24px; overflow: hidden; min-height: 190px; color: inherit; text-decoration: none; box-shadow: 0 10px 30px rgba(35,60,18,.08); }
.sc-img { position: absolute; inset: 0; }
.sc-img img { width: 100%; height: 100%; object-fit: cover; display: block; }
.sc-grad { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,.05), rgba(0,0,0,.5)); }
.sc-shine { position: absolute; inset: 0; background: radial-gradient(circle at var(--sx) var(--sy), rgba(255,255,255,.2), transparent 34%); opacity: 0; transition: opacity .2s ease; }
.sc-shine.on { opacity: 1; }
.sc-overlay-name { position: absolute; left: 16px; right: 16px; bottom: 16px; display: flex; align-items: flex-end; justify-content: space-between; gap: 10px; color: var(--white); }
.sc-name { font-size: 16px; font-weight: 700; }
.sc-arr { width: 28px; height: 28px; border-radius: 50%; background: rgba(255,255,255,.18); display: grid; place-items: center; }
.sc-bar { position: absolute; left: 0; right: 0; bottom: 0; height: 3px; background: rgba(255,255,255,.55); }
.cs-solo-placeholder { min-height: 260px; display: grid; place-items: center; color: var(--t3); font-size: 14px; background: linear-gradient(135deg, var(--gt), var(--white)); border-radius: 24px; }

@media (max-width: 1024px) {
  .cs-hd, .cs-wrap { padding-left: 24px; padding-right: 24px; }
  .cs-panel { grid-template-columns: 240px 1fr; }
  .cs-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (max-width: 768px) {
  .cs-hd { flex-direction: column; align-items: flex-start; }
  .cs-panel { grid-template-columns: 1fr; }
  .cs-sb { border-right: none; border-bottom: 1px solid var(--bs); overflow-x: auto; display: flex; }
  .cs-sbbtn { min-width: 180px; }
  .cs-grid { grid-template-columns: 1fr; }
}

@media (max-width: 520px) {
  .cs, .cs-wrap, .cs-hd { padding-left: 14px; padding-right: 14px; }
  .cs-panel { border-radius: 22px; }
  .cs-ct { padding: 18px; }
  .sc-card { min-height: 160px; }
}
`;
