"use client";

import Image from "next/image";
import { useGender } from "@/lib/genderContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";

type Category = "women" | "men" | "kids";

type HeroItem = {
  image: string;          // used on mobile (and on desktop if desktopImage is missing)
  desktopImage?: string;  // optional wide image for tablet / laptop
};

type CategoryItem = { name: string; slug: string; image: string };

type HomeContentResponse = {
  success: boolean;
  homeContent: {
    marqueeItems: string[];
    secondMarqueeItems?: string[];
    heroContent: {
      women?: HeroItem;
      men?: HeroItem;
      kids?: HeroItem;
    };
    // optional – if your API doesn't send it, the defaults below are used
    categories?: CategoryItem[];
  };
};

const defaultHeroContent: Record<string, HeroItem> = {
  women: { image: "/island-girl.jpg" },
  men:   { image: "/trial.png" },
  kids:  { image: "/trial.png" },
};

const defaultMarqueeItems = [
  "✦ Free Shipping above ₹999",
  "✦ Custom Jewellery",
  "✦ Free Gifts on all Orders",
];

type BackendCategory = {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  gender?: { _id: string; name: string; slug: string } | string | null;
};

type BackendSubCategory = {
  _id: string;
  name: string;
  image?: string;
  category?: {
    _id: string;
    name: string;
    description?: string;
    image?: string;
    gender?: { _id: string; name: string; slug: string } | string | null;
  } | string;
};

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const FALLBACK_JEWELLERY_IMAGE = "https://res.cloudinary.com/diodxwxrl/image/upload/v1781547302/makeusparkle/subcategories/olkaipfizchqi5fwskgj.jpg";

const SUBCATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  bracelets: "https://res.cloudinary.com/diodxwxrl/image/upload/v1781551076/makeusparkle/subcategories/ndmqu1fwuteg5dainrbd.jpg",
  earrings: "https://res.cloudinary.com/diodxwxrl/image/upload/v1781547302/makeusparkle/subcategories/olkaipfizchqi5fwskgj.jpg",
  "hand-chain": "https://res.cloudinary.com/diodxwxrl/image/upload/v1781551145/makeusparkle/subcategories/nb2nomsu7caogkuismh5.jpg",
  jhumkha: "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=800&q=90",
  necklaces: "https://res.cloudinary.com/diodxwxrl/image/upload/v1781547311/makeusparkle/subcategories/xopdbf3wjnj6jrvcsrmp.jpg",
  necklace: "https://res.cloudinary.com/diodxwxrl/image/upload/v1781547311/makeusparkle/subcategories/xopdbf3wjnj6jrvcsrmp.jpg",
  rings: "https://res.cloudinary.com/diodxwxrl/image/upload/v1781551124/makeusparkle/subcategories/wbi5bd8gwlaze75xmvav.jpg",
};

const defaultJewellerySubcategories: CategoryItem[] = [
  {
    name: "Bracelets",
    slug: "bracelets",
    image: "https://res.cloudinary.com/diodxwxrl/image/upload/v1781551076/makeusparkle/subcategories/ndmqu1fwuteg5dainrbd.jpg",
  },
  {
    name: "Earrings",
    slug: "earrings",
    image: "https://res.cloudinary.com/diodxwxrl/image/upload/v1781547302/makeusparkle/subcategories/olkaipfizchqi5fwskgj.jpg",
  },
  {
    name: "Hand chain",
    slug: "hand-chain",
    image: "https://res.cloudinary.com/diodxwxrl/image/upload/v1781551145/makeusparkle/subcategories/nb2nomsu7caogkuismh5.jpg",
  },
  {
    name: "Jhumkha",
    slug: "jhumkha",
    image: "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=800&q=90",
  },
  {
    name: "Necklaces",
    slug: "necklaces",
    image: "https://res.cloudinary.com/diodxwxrl/image/upload/v1781547311/makeusparkle/subcategories/xopdbf3wjnj6jrvcsrmp.jpg",
  },
  {
    name: "Rings",
    slug: "rings",
    image: "https://res.cloudinary.com/diodxwxrl/image/upload/v1781551124/makeusparkle/subcategories/wbi5bd8gwlaze75xmvav.jpg",
  },
];

const categoryRoute = (_gender: string, slug: string) => `/subcategory/${slug}`;

function SubcategoryCard({
  item,
  onClick,
}: {
  item: CategoryItem;
  onClick: () => void;
}) {
  const [imgSrc, setImgSrc] = useState(
    item.image || SUBCATEGORY_FALLBACK_IMAGES[item.slug] || FALLBACK_JEWELLERY_IMAGE
  );

  useEffect(() => {
    setImgSrc(item.image || SUBCATEGORY_FALLBACK_IMAGES[item.slug] || FALLBACK_JEWELLERY_IMAGE);
  }, [item.image, item.slug]);

  return (
    <button
      className="cat-card"
      onClick={onClick}
      type="button"
      aria-label={`Shop ${item.name}`}
    >
      <div className="cat-img">
        <Image
          src={imgSrc}
          alt={item.name}
          fill
          unoptimized
          sizes="(max-width: 768px) 30vw, 180px"
          onError={() => {
            const fallback = SUBCATEGORY_FALLBACK_IMAGES[item.slug] || FALLBACK_JEWELLERY_IMAGE;
            if (imgSrc !== fallback) {
              setImgSrc(fallback);
            }
          }}
        />
      </div>
      <span className="cat-name">{item.name}</span>
    </button>
  );
}

export default function HeroVideoComponent() {
  const { gender: rawCategory, setGender: setActiveCategory, genders } = useGender();
  const activeCategory = rawCategory || "women";

  const router = useRouter();

  const [marqueeItems, setMarqueeItems] = useState<string[]>(defaultMarqueeItems);
  const [heroContent, setHeroContent] = useState<Record<string, HeroItem>>(defaultHeroContent);
  const [categories, setCategories] = useState<CategoryItem[]>(defaultJewellerySubcategories);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      // 1. Fetch home content
      try {
        const homeData = await apiRequest<HomeContentResponse>("/home-content");
        if (!isMounted) return;
        if (homeData.success && homeData.homeContent) {
          if (homeData.homeContent.marqueeItems && homeData.homeContent.marqueeItems.length > 0) {
            setMarqueeItems(homeData.homeContent.marqueeItems);
          }
          if (homeData.homeContent.heroContent) {
            setHeroContent((prev) => ({
              ...prev,
              ...homeData.homeContent.heroContent,
            }));
          }
        }
      } catch (err) {
        console.error("Failed to load home content:", err);
      }

      // 2. Fetch categories & subcategories from API to dynamically display Jewellery subcategories
      try {
        const [catData, subData] = await Promise.all([
          apiRequest<{ success: boolean; categories?: BackendCategory[] }>("/categories").catch(() => null),
          apiRequest<{ success: boolean; subcategories?: BackendSubCategory[] }>("/subcategories").catch(() => null),
        ]);

        if (!isMounted) return;

        const allCategories = catData?.categories || [];
        const allSubcategories = subData?.subcategories || [];

        // Identify Jewellery Category ID
        const jewelleryCat = allCategories.find(
          (c) => c.name?.trim().toLowerCase() === "jewellery"
        );
        const jewelleryId = jewelleryCat?._id;

        // Filter subcategories that belong to "Jewellery"
        const jewellerySubs = allSubcategories.filter((sub) => {
          if (sub.category && typeof sub.category === "object") {
            const catName = sub.category.name?.trim().toLowerCase();
            const catId = sub.category._id;
            return catName === "jewellery" || (jewelleryId && catId === jewelleryId);
          }
          if (typeof sub.category === "string" && jewelleryId) {
            return sub.category === jewelleryId;
          }
          return false;
        });

        if (jewellerySubs.length > 0) {
          const mapped: CategoryItem[] = jewellerySubs.map((sub) => {
            const slug = toSlug(sub.name);
            const image = sub.image || SUBCATEGORY_FALLBACK_IMAGES[slug] || FALLBACK_JEWELLERY_IMAGE;
            return {
              name: sub.name,
              slug,
              image,
            };
          });
          setCategories(mapped);
        }
      } catch (err) {
        console.error("Failed to load jewellery subcategories:", err);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const content = heroContent[activeCategory] || defaultHeroContent.women;
  const hasDesktopImage = !!content.desktopImage;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

        /* ─── Marquee ─── */
        .bs-marquee-wrap {
          width: 100%;
          overflow: hidden;
          background: #1e2710;
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
          color: #f5e6b8;
          padding: 0 2.5rem;
          white-space: nowrap;
          opacity: 0.85;
        }

        /* ── GENDER TOGGLE BAR ── */
        .gender-toggle-bar {
          background-color: #fff;
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 24px;
          padding: 28px 20px;
          position: sticky;
          top: 0;
          z-index: 100;
          border-bottom: 1px solid #e8e8e8;
          box-sizing: border-box;
        }

        .gender-btn {
          font-family: 'Inter', sans-serif;
          font-size: 1.05rem;
          font-weight: 500;
          letter-spacing: 0.02em;
          cursor: pointer;
          border: 1.5px solid rgb(42, 71, 54);
          padding: 10px 52px;
          transition: all 0.25s ease;
          min-width: 140px;
          text-align: center;
          border-radius: 0;
        }

        .gender-btn.inactive {
          background-color: #fff;
          color: rgb(42, 71, 54);
        }

        .gender-btn.inactive:hover {
          background-color: #f5f5f5;
        }

        .gender-btn.active-btn {
          background-color: rgb(42, 71, 54);
          color: #fff;
          border-color: rgb(42, 71, 54);
        }

        @media (max-width: 1024px) {
          .gender-btn { padding: 10px 36px; min-width: 120px; }
        }

        @media (max-width: 768px) {
          .gender-btn { padding: 10px 28px; min-width: 100px; font-size: 0.95rem; }
          .gender-toggle-bar { gap: 16px; padding: 20px 16px; }
        }

        @media (max-width: 480px) {
          .gender-btn { padding: 9px 20px; min-width: 80px; font-size: 0.88rem; }
          .gender-toggle-bar { gap: 12px; padding: 16px 12px; }
        }

        @media (max-width: 390px) {
          .gender-btn { padding: 8px 14px; min-width: 70px; font-size: 0.8rem; }
          .gender-toggle-bar { gap: 8px; }
        }

        /* ── FULL-BLEED HERO ── */
        .hero-banner {
          position: relative;
          width: 100%;
          overflow: hidden;
          background: #1b1b1b;
          /* mobile: portrait, like the reference */
          aspect-ratio: 4 / 5;
        }

        .hero-banner .hero-bg {
          object-fit: cover;
          object-position: center top;
        }

        /* swap images only when a separate desktop image is supplied */
        .hero-bg-desktop { display: none; }
        .hero-banner.has-desktop .hero-bg-mobile { display: block; }

        .cat-card:focus-visible { outline: 2px solid rgb(42, 71, 54); outline-offset: 3px; }

        /* tablet */
        @media (min-width: 768px) {
          .hero-banner { aspect-ratio: 4 / 3; }
        }

        /* laptop / desktop: wide, never taller than the viewport */
        @media (min-width: 1100px) {
          .hero-banner {
            aspect-ratio: auto;
            height: min(78vh, 760px);
            min-height: 520px;
          }
          .hero-banner .hero-bg { object-position: center 25%; }
          .hero-banner.has-desktop .hero-bg-mobile { display: none; }
          .hero-banner.has-desktop .hero-bg-desktop { display: block; }
        }

        /* ── CATEGORY STRIP ── */
        .cat-strip {
          width: 100%;
          background: #dcefd9;
          padding: 18px 0 16px;
          box-sizing: border-box;
        }

        .cat-row {
          display: flex;
          gap: 14px;
          overflow-x: auto;
          padding: 0 16px;
          scroll-snap-type: x proximity;
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
        }
        .cat-row::-webkit-scrollbar { display: none; }

        .cat-card {
          flex: 0 0 auto;
          width: clamp(100px, 26vw, 130px);
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          text-align: center;
          scroll-snap-align: start;
          font-family: 'Inter', sans-serif;
          transition: transform 0.25s ease;
        }

        .cat-card:hover {
          transform: translateY(-2px);
        }

        .cat-img {
          position: relative;
          width: 100%;
          aspect-ratio: 1 / 1;
          border-radius: 20px;
          overflow: hidden;
          background: #c5e0c1;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .cat-img img { object-fit: cover; transition: transform 0.4s ease; }
        .cat-card:hover .cat-img img { transform: scale(1.06); }

        .cat-name {
          display: block;
          margin-top: 8px;
          font-size: 0.85rem;
          font-weight: 500;
          color: #243522;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* tablet + laptop: centered, beautifully spaced */
        @media (min-width: 768px) {
          .cat-strip { padding: 26px 0 22px; }
          .cat-row {
            overflow: visible;
            justify-content: center;
            gap: 18px;
            max-width: 1100px;
            margin: 0 auto;
            padding: 0 20px;
          }
          .cat-card {
            flex: 0 1 150px;
            width: clamp(110px, 14vw, 155px);
            max-width: 160px;
          }
          .cat-name { font-size: 0.92rem; margin-top: 10px; }
        }

        @media (min-width: 768px) and (max-width: 991px) {
          .cat-row {
            overflow-x: auto;
            justify-content: flex-start;
            padding: 0 20px;
          }
          .cat-card {
            flex: 0 0 130px;
            width: 130px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .bs-marquee-track { animation: none; }
          .cat-img img { transition: none; }
          .cat-card { transition: none; }
        }
      `}</style>

      {/* ── STICKY GENDER TOGGLE BAR ── */}
      <div className="gender-toggle-bar">
        {genders.map((g) => (
          <button
            key={g.slug}
            className={`gender-btn ${activeCategory === g.slug ? "active-btn" : "inactive"}`}
            onClick={() => setActiveCategory(g.slug)}
          >
            {g.name}
          </button>
        ))}
      </div>

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

      {/* ── FULL-BLEED HERO ── */}
      <section className={`hero-banner${hasDesktopImage ? " has-desktop" : ""}`}>
        <Image
          className="hero-bg hero-bg-mobile"
          src={content.image}
          alt={`${activeCategory} jewellery model`}
          fill
          priority
          sizes="100vw"
        />
        {hasDesktopImage && (
          <Image
            className="hero-bg hero-bg-desktop"
            src={content.desktopImage as string}
            alt={`${activeCategory} jewellery model`}
            fill
            priority
            sizes="100vw"
          />
        )}
      </section>

      {/* ── CATEGORY STRIP ── */}
      <section className="cat-strip" aria-label="Shop jewellery subcategories">
        <div className="cat-row">
          {categories.map((c) => (
            <SubcategoryCard
              key={c.slug}
              item={c}
              onClick={() => router.push(categoryRoute(activeCategory, c.slug))}
            />
          ))}
        </div>
      </section>
    </>
  );
}