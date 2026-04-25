


'use client';

import {
  useState,
  useEffect,
  useRef,
  type CSSProperties,
  type MouseEvent,
} from 'react';
import Link from 'next/link';
import { useGender } from '@/lib/genderContext';

type Gender = 'women' | 'men';

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

const womenJewellery: SubCategoryItem[] = [
  { name: 'Necklaces',    img: IMG.necklace,   href: '/subcategory/necklace'     },
  { name: 'Earrings',     img: IMG.earrings,   href: '/subcategory/earrings'     },
  { name: 'Rings',        img: IMG.rings,      href: '/subcategory/rings'        },
  { name: 'Bracelets',    img: IMG.bracelets,  href: '/subcategory/bracelets'    },
  { name: 'Waist Chains', img: IMG.waistChain, href: '/subcategory/waist-chains' },
  { name: 'Couple Sets',  img: IMG.couple,     href: '/subcategory/couple-sets'  },
];

const menJewellery: SubCategoryItem[] = [
  { name: 'Chains',      img: IMG.menChain,    href: '/subcategory/men-chains'    },
  { name: 'Bracelets',   img: IMG.menBracelet, href: '/subcategory/men-bracelets' },
  { name: 'Rings',       img: IMG.menRing,     href: '/subcategory/men-rings'     },
  { name: 'Earrings',    img: IMG.menEarring,  href: '/subcategory/men-earrings'  },
  { name: 'Pendants',    img: IMG.menPendant,  href: '/subcategory/men-pendants'  },
  { name: 'Couple Sets', img: IMG.couple,      href: '/subcategory/couple-sets'   },
];

const buildCategories = (gender: Gender): CategoryItem[] =>
  gender === 'women'
    ? [
        { name: 'Jewellery',              icon: '◈', img: IMG.necklace,  href: `/categories/women/jewellery`,        sub: womenJewellery },
        { name: 'Gift Boxes',             icon: '⊡', img: IMG.giftBox,   href: `/categories/women/gift-boxes`,       sub: [] },
        { name: 'Fan Combos',             icon: '✦', img: IMG.fanCombo,  href: `/categories/women/fan-combos`,       sub: [] },
        { name: 'Custom Charm Jewellery', icon: '◎', img: IMG.charm,     href: `/categories/women/custom-charm`,     sub: [] },
        { name: 'Hair Accessories',       icon: '⟡', img: IMG.hair,      href: `/categories/women/hair-accessories`, sub: [] },
        { name: 'Keychains',              icon: '⌖', img: IMG.keychain,  href: `/categories/women/keychains`,        sub: [] },
        { name: 'Curated Combos',         icon: '⊞', img: IMG.combo,     href: `/categories/women/curated-combos`,  sub: [] },
      ]
    : [
        { name: 'Jewellery',              icon: '◈', img: IMG.menChain,  href: `/categories/men/jewellery`,         sub: menJewellery },
        { name: 'Gift Boxes',             icon: '⊡', img: IMG.giftBox,   href: `/categories/men/gift-boxes`,        sub: [] },
        { name: 'Fan Combos',             icon: '✦', img: IMG.fanCombo,  href: `/categories/men/fan-combos`,        sub: [] },
        { name: 'Custom Charm Jewellery', icon: '◎', img: IMG.charm,     href: `/categories/men/custom-charm`,      sub: [] },
        { name: 'Keychains',              icon: '⌖', img: IMG.keychain,  href: `/categories/men/keychains`,         sub: [] },
        { name: 'Watch Straps',           icon: '⊞', img: IMG.menWatch,  href: `/categories/men/watch-straps`,      sub: [] },
        { name: 'Curated Combos',         icon: '⊟', img: IMG.combo,     href: `/categories/men/curated-combos`,   sub: [] },
      ];

/* ─── Desktop Sub-Card: image fills entire card, name overlaid on image ─── */
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
      {/* Full-bleed image — no white footer */}
      <div className="sc-img">
        <img src={sub.img} alt={sub.name} loading="lazy" />
        {/* gradient bottom overlay for text legibility */}
        <div className="sc-grad" />
        <div className={`sc-shine${shine.on ? ' on' : ''}`} />
      </div>

      {/* Name overlaid on image */}
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
  setTab,
}: {
  categories: CategoryItem[];
  tab: Gender;
  setTab: (g: Gender) => void;
}) {
  const [activeIdx, setActiveIdx] = useState(0);
  useEffect(() => { setActiveIdx(0); }, [tab]);
  const active = categories[activeIdx];

  return (
    <div className="ms-root">
      <div className="ms-top">
        <div className="ms-top-left">
          <p className="ms-eyebrow">Discover</p>
          <h2 className="ms-title">Shop by <em>Category</em></h2>
        </div>
        <div className="ms-toggle">
          <div className={`ms-pill${tab === 'men' ? ' right' : ''}`} />
          <button className={`ms-tbtn${tab === 'women' ? ' on' : ''}`} onClick={() => setTab('women')}>Women</button>
          <button className={`ms-tbtn${tab === 'men' ? ' on' : ''}`} onClick={() => setTab('men')}>Men</button>
        </div>
      </div>

      <div className="ms-pane">
        {/* LEFT sidebar */}
        <nav className="ms-sb" aria-label="Category navigation">
          {categories.map((cat, i) => (
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
          ))}
        </nav>

        {/* RIGHT content */}
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
            /* Sub-category grid: image fills card, name on image */
            <div className="ms-subgrid">
              {active.sub.map(sub => (
                <Link key={sub.name} href={sub.href} className="ms-subcard">
                  <div className="ms-subcard-img">
                    <img src={sub.img} alt={sub.name} loading="lazy" />
                    <div className="ms-subcard-ov" />
                    {/* Name on image */}
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
  const { gender: globalGender, setGender: setGlobalGender } = useGender();
  const [tab, setTabLocal] = useState<Gender>(globalGender);
  const [activeIdx, setActiveIdx] = useState(0);
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setTabLocal(globalGender);
    setActiveIdx(0);
  }, [globalGender]);

  const setTab = (g: Gender) => {
    setTabLocal(g);
    setGlobalGender(g);
    setActiveIdx(0);
  };

  const categories = buildCategories(tab);
  const active = categories[activeIdx];

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
      <section className="cs" id="categories" ref={sectionRef}>

        {/* DESKTOP + TABLET */}
        <div className={`cs-hd${visible ? ' in' : ''}`}>
          <div className="cs-hd-left">
            <span className="cs-eyebrow">Discover</span>
            <h2 className="cs-title">Shop by <em>Category</em></h2>
          </div>
          <div className="cs-toggle">
            <div className={`cs-pill${tab === 'men' ? ' right' : ''}`} />
            <button className={`cs-tbtn${tab === 'women' ? ' on' : ''}`} onClick={() => setTab('women')}>Women</button>
            <button className={`cs-tbtn${tab === 'men' ? ' on' : ''}`}   onClick={() => setTab('men')}>Men</button>
          </div>
        </div>

        <div className={`cs-wrap${visible ? ' in' : ''}`}>
          <div className="cs-panel">
            <nav className="cs-sb" aria-label="Product categories">
              <div className="cs-sb-hd">
                <span className="cs-sb-eyebrow">Browse</span>
                <span className="cs-sb-heading">Collections</span>
              </div>

              {categories.map((cat, i) => (
                <button
                  key={cat.name}
                  className={`cs-sbbtn${activeIdx === i ? ' on' : ''}`}
                  onClick={() => setActiveIdx(i)}
                  aria-current={activeIdx === i ? 'page' : undefined}
                >
                  <span className="cs-sb-icon" aria-hidden="true">{cat.icon}</span>
                  <span className="cs-sb-txt">{cat.name}</span>
                  <span className="cs-sb-badge">{cat.sub.length > 0 ? cat.sub.length : '→'}</span>
                </button>
              ))}

              <div className="cs-sb-preview">
                <img src={active.img} alt={active.name} />
                <div className="cs-sb-preview-ov" />
                <span className="cs-sb-preview-lbl">{active.name}</span>
              </div>
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
                  {active.sub.map((sub, i) => <ShineCard key={sub.name} sub={sub} index={i} />)}
                </div>
              ) : (
                <Link href={active.href} className="cs-solo">
                  <img src={active.img} alt={active.name} className="cs-solo-img" />
                  <div className="cs-solo-ov" />
                  <div className="cs-solo-inset" />
                  <div className="cs-solo-body">
                    <div className="cs-solo-ey">Collection</div>
                    <span className="cs-solo-ttl">{active.name}</span>
                    <span className="cs-solo-cta">
                      Explore the edit
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* MOBILE */}
        <MobileSplit categories={categories} tab={tab} setTab={setTab} />

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
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 48px 32px;
  position: relative; z-index: 1;
  opacity: 0; transform: translateY(14px);
  transition: opacity .52s ease, transform .52s ease;
}
.cs-hd.in { opacity: 1; transform: translateY(0); }
.cs-hd-left { display: flex; flex-direction: column; gap: 5px; }

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

.cs-toggle {
  display: flex; align-items: center;
  background: var(--white); border: 1.5px solid var(--bm);
  border-radius: 100px; padding: 4px; position: relative;
  box-shadow: var(--sxs);
}
.cs-pill {
  position: absolute; top: 4px; bottom: 4px;
  width: calc(50% - 4px); left: 4px;
  background: var(--gd); border-radius: 100px;
  transition: transform .36s cubic-bezier(.77,0,.18,1);
  box-shadow: 0 2px 8px rgba(37,61,24,.3);
}
.cs-pill.right { transform: translateX(100%); }
.cs-tbtn {
  position: relative; z-index: 1; padding: 9px 26px;
  font-family: 'Nunito', sans-serif;
  font-size: 10px; font-weight: 700; letter-spacing: .22em; text-transform: uppercase;
  background: transparent; border: none; cursor: pointer; border-radius: 100px;
  color: var(--t3); transition: color .26s;
}
.cs-tbtn.on { color: #fff; }

/* ── Desktop wrap + panel ── */
.cs-wrap {
  padding: 0 48px; position: relative; z-index: 1;
  opacity: 0; transform: translateY(20px);
  transition: opacity .62s ease .1s, transform .62s ease .1s;
}
.cs-wrap.in { opacity: 1; transform: translateY(0); }

.cs-panel {
  display: grid; grid-template-columns: 175px 1fr;
  background: var(--white);
  border: 1px solid var(--bs); border-radius: var(--r16);
  overflow: hidden; box-shadow: var(--smd);
}

/* ── Sidebar ── */
.cs-sb {
  display: flex; flex-direction: column;
  background: linear-gradient(168deg, #253d18 0%, #172710 100%);
  border-right: 1px solid rgba(255,255,255,.06);
  position: relative; overflow: hidden;
}
.cs-sb::before {
  content: ''; position: absolute; inset: 0; z-index: 0; pointer-events: none;
  background:
    radial-gradient(ellipse 130% 55% at 50% -2%, rgba(82,122,62,.38) 0%, transparent 62%),
    radial-gradient(ellipse 80%  80% at 100% 100%, rgba(160,120,32,.1) 0%, transparent 55%);
}

.cs-sb-hd {
  padding: 20px 16px 14px; position: relative; z-index: 1;
  border-bottom: 1px solid rgba(255,255,255,.07); margin-bottom: 4px;
}
.cs-sb-eyebrow {
  display: block; font-size: 7.5px; font-weight: 700;
  letter-spacing: .52em; text-transform: uppercase;
  color: rgba(255,255,255,.35); margin-bottom: 3px;
}
.cs-sb-heading {
  display: block; font-family: 'Cormorant Garamond', serif;
  font-size: .95rem; font-style: italic; font-weight: 300;
  color: rgba(255,255,255,.7); letter-spacing: .02em;
}

.cs-sbbtn {
  display: flex; align-items: center; gap: 8px;
  width: 100%; padding: 10px 14px 10px 15px;
  background: transparent; border: none;
  border-left: 2.5px solid transparent;
  cursor: pointer; text-align: left;
  color: rgba(255,255,255,.48); position: relative; z-index: 1;
  transition: color .2s, border-color .2s, background .2s;
}
.cs-sbbtn:hover { color: rgba(255,255,255,.82); background: rgba(255,255,255,.06); border-left-color: rgba(255,255,255,.22); }
.cs-sbbtn.on   { color: #fff; border-left-color: var(--gold-l); background: rgba(255,255,255,.09); }

.cs-sb-icon { font-size: 10px; color: var(--gold-l); opacity: .45; flex-shrink: 0; transition: opacity .2s; }
.cs-sbbtn:hover .cs-sb-icon { opacity: .75; }
.cs-sbbtn.on   .cs-sb-icon { opacity: 1; }

.cs-sb-txt { font-size: 11px; font-weight: 400; letter-spacing: .025em; flex: 1; line-height: 1.3; }
.cs-sbbtn.on .cs-sb-txt { font-weight: 600; }

.cs-sb-badge {
  font-size: 8px; font-weight: 700; letter-spacing: .04em; color: var(--gold-l);
  background: rgba(200,153,46,.14); border: 1px solid rgba(200,153,46,.22);
  padding: 1px 6px; border-radius: 100px; transition: background .2s;
}
.cs-sbbtn.on .cs-sb-badge { background: rgba(200,153,46,.26); }

.cs-sb-preview {
  margin-top: auto; position: relative; z-index: 1;
  aspect-ratio: 3/2; overflow: hidden;
  border-top: 1px solid rgba(255,255,255,.07);
}
.cs-sb-preview img {
  width: 100%; height: 100%; object-fit: cover;
  filter: brightness(.42) saturate(.7);
  transition: transform .6s ease, filter .4s;
}
.cs-sb-preview:hover img { transform: scale(1.05); filter: brightness(.52) saturate(.82); }
.cs-sb-preview-ov {
  position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(15,30,8,.88) 0%, rgba(15,30,8,.16) 60%, transparent 100%);
}
.cs-sb-preview-lbl {
  position: absolute; bottom: 11px; left: 13px; right: 13px;
  font-size: 9px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase;
  color: rgba(255,255,255,.65);
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

/* ── Desktop grid — image-only cards, name on image ── */
.cs-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

/* Card: no white footer, image fills entire card */
.sc-card {
  display: block; text-decoration: none;
  position: relative; overflow: hidden;
  border-radius: var(--r8);
  border: 1px solid var(--bs);
  cursor: pointer;
  aspect-ratio: 3/4;       /* portrait ratio, no extra white space */
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

/* Image fills 100% of card */
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

/* Name + arrow overlaid on image bottom */
.sc-overlay-name {
  position: absolute; bottom: 0; left: 0; right: 0;
  padding: 14px 14px 14px;
  display: flex; align-items: flex-end; justify-content: space-between;
  z-index: 2;
}
.sc-name {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(0.82rem, 1.4vw, 1rem);
  font-weight: 600;
  font-style: italic;
  color: #fff;
  letter-spacing: .03em;
  line-height: 1.2;
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

/* ── Solo banner ── */
.cs-solo {
  display: block; text-decoration: none;
  position: relative; overflow: hidden;
  height: 100%; min-height: 360px;
  border-radius: var(--r12); border: 1px solid var(--bs);
  transition: box-shadow .34s, border-color .34s;
}
.cs-solo:hover { box-shadow: var(--slg); border-color: var(--bm); }
.cs-solo-img {
  width: 100%; height: 100%; object-fit: cover;
  position: absolute; inset: 0;
  filter: brightness(.5) saturate(.75);
  transition: transform .84s cubic-bezier(.25,.46,.45,.94), filter .44s;
}
.cs-solo:hover .cs-solo-img { transform: scale(1.04); filter: brightness(.62) saturate(.88); }
.cs-solo-ov {
  position: absolute; inset: 0;
  background:
    linear-gradient(to top, rgba(18,36,10,.92) 0%, rgba(18,36,10,.28) 50%, transparent 70%),
    linear-gradient(135deg, rgba(37,61,24,.22) 0%, transparent 50%);
}
.cs-solo-inset {
  position: absolute; inset: 16px;
  border: 1px solid transparent; border-radius: 8px;
  transition: border-color .4s; pointer-events: none;
}
.cs-solo:hover .cs-solo-inset { border-color: rgba(255,255,255,.1); }
.cs-solo-body { position: absolute; bottom: 0; left: 0; right: 0; padding: 30px 28px; }
.cs-solo-ey {
  display: flex; align-items: center; gap: 8px;
  font-size: 8px; font-weight: 700; letter-spacing: .44em; text-transform: uppercase;
  color: rgba(255,255,255,.52); margin-bottom: 10px;
}
.cs-solo-ey::before { content: ''; width: 18px; height: 1px; background: currentColor; }
.cs-solo-ttl {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(1.8rem, 3vw, 2.6rem);
  font-weight: 400; font-style: italic;
  color: #fff; display: block; margin-bottom: 18px; line-height: 1.08;
}
.cs-solo-cta {
  display: inline-flex; align-items: center; gap: 9px;
  font-size: 9px; font-weight: 700; letter-spacing: .26em; text-transform: uppercase;
  color: #fff; padding: 10px 20px;
  background: rgba(37,61,24,.6); border: 1px solid rgba(255,255,255,.2);
  border-radius: 100px; backdrop-filter: blur(8px);
  transition: background .3s, border-color .3s, gap .24s;
}
.cs-solo:hover .cs-solo-cta { background: rgba(37,61,24,.82); border-color: rgba(255,255,255,.35); gap: 13px; }

/* ── Tablet 661–960px ── */
@media (max-width: 960px) and (min-width: 661px) {
  .cs-wrap  { padding: 0 28px; }
  .cs-hd    { padding: 0 28px 28px; }
  .cs-panel { grid-template-columns: 165px 1fr; }
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
    display: flex; align-items: flex-start; justify-content: space-between;
    gap: 12px; margin-bottom: 16px;
  }
  .ms-top-left { display: flex; flex-direction: column; gap: 4px; }

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

  .ms-toggle {
    flex-shrink: 0; display: flex; align-items: center;
    background: var(--white); border: 1.5px solid var(--bm);
    border-radius: 100px; padding: 3px; position: relative;
    box-shadow: var(--sxs); align-self: flex-start; margin-top: 3px;
  }
  .ms-pill {
    position: absolute; top: 3px; bottom: 3px;
    width: calc(50% - 3px); left: 3px;
    background: var(--gd); border-radius: 100px;
    transition: transform .34s cubic-bezier(.77,0,.18,1);
    box-shadow: 0 2px 6px rgba(37,61,24,.28);
  }
  .ms-pill.right { transform: translateX(100%); }
  .ms-tbtn {
    position: relative; z-index: 1; padding: 7px 16px;
    font-family: 'Nunito', sans-serif;
    font-size: 9.5px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase;
    background: transparent; border: none; cursor: pointer; border-radius: 100px;
    color: var(--t3); transition: color .26s;
    -webkit-tap-highlight-color: transparent;
  }
  .ms-tbtn.on { color: #fff; }

  .ms-pane {
    display: grid; grid-template-columns: 86px 1fr;
    background: var(--white); border: 1px solid var(--bs);
    border-radius: var(--r12); overflow: hidden;
    box-shadow: var(--ssm); min-height: 420px;
  }

  /* Left sidebar */
  .ms-sb {
    background: linear-gradient(175deg, #253d18 0%, #446c35bd 100%);
    display: flex; flex-direction: column;
    border-right: 1px solid rgba(255,255,255,.06);
    overflow-y: auto; scrollbar-width: none; position: relative;
  }
  .ms-sb::before {
    content: ''; position: absolute; inset: 0; z-index: 0; pointer-events: none;
    background: radial-gradient(ellipse 160% 65% at 50% -5%, rgba(82,122,62,.32) 0%, transparent 56%);
  }
  .ms-sb::-webkit-scrollbar { display: none; }

  .ms-sbbtn {
    display: flex; flex-direction: column; align-items: center; gap: 5px;
    width: 100%; padding: 12px 5px 10px;
    background: transparent; border: none;
    border-left: 2.5px solid transparent;
    cursor: pointer; text-align: center;
    color: rgba(255,255,255,.45);
    position: relative; z-index: 1;
    transition: color .2s, background .2s, border-color .2s;
    -webkit-tap-highlight-color: transparent;
  }
  .ms-sbbtn:active { background: rgba(255,255,255,.08); }
  .ms-sbbtn.on { color: #fff; background: rgba(255,255,255,.1); border-left-color: var(--gold-l); }

  .ms-sb-thumb {
    width: 52px; height: 52px; border-radius: 8px; overflow: hidden;
    border: 1.5px solid rgba(255,255,255,.1); transition: border-color .22s; flex-shrink: 0;
  }
  .ms-sbbtn.on .ms-sb-thumb { border-color: rgba(200,153,46,.5); }
  .ms-sb-thumb img {
    width: 100%; height: 100%; object-fit: cover; display: block;
    filter: brightness(.52) saturate(.68); transition: filter .28s;
  }
  .ms-sbbtn.on .ms-sb-thumb img { filter: brightness(.72) saturate(.85); }

  .ms-sb-label {
    font-size: 8px; font-weight: 600; letter-spacing: .02em;
    color: inherit; line-height: 1.3; text-align: center;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
    overflow: hidden; width: 100%; padding: 0 2px;
  }
  .ms-sb-dot {
    width: 4px; height: 4px; border-radius: 50%;
    background: var(--gold-l); flex-shrink: 0;
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
    font-size: 1rem; font-weight: 400; color: var(--t1);
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

  /* ── Sub-category grid: image fills card, name on image ── */
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

  /* Image fills entire card — 4:5 portrait ratio */
  .ms-subcard-img {
    position: relative;
    aspect-ratio: 4/5;
    overflow: hidden; background: var(--cream2);
  }
  .ms-subcard-img img {
    width: 100%; height: 100%; object-fit: cover; display: block;
    transition: transform .4s ease;
  }
  .ms-subcard:active .ms-subcard-img img { transform: scale(1.04); }

  /* Gradient overlay for text readability */
  .ms-subcard-ov {
    position: absolute; inset: 0;
    background: linear-gradient(
      to top,
      rgba(12,24,6,.78) 0%,
      rgba(12,24,6,.18) 42%,
      transparent 68%
    );
  }

  /* Name overlaid on image */
  .ms-subcard-name {
    position: absolute; bottom: 0; left: 0; right: 0;
    padding: 10px 10px 10px;
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(0.78rem, 3vw, 0.92rem);
    font-weight: 600; font-style: italic;
    color: #fff; line-height: 1.2;
    text-shadow: 0 1px 5px rgba(0,0,0,0.5);
    z-index: 2;
  }

  /* Solo banner */
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
  .ms-pane { grid-template-columns: 74px 1fr; }
  .ms-sb-thumb { width: 44px; height: 44px; }
  .ms-sb-label { font-size: 7px; }
  .ms-ct { padding: 10px 8px; }
  .ms-subcard-name { font-size: 0.74rem; padding: 8px 8px 8px; }
}
`;

