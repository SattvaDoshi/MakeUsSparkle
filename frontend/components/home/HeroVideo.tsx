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

// TODO: replace the image paths with your real category photos
const defaultCategories: CategoryItem[] = [
  { name: "Earrings",         slug: "earrings",    image: "/cat-earrings.jpg" },
  { name: "Rings",            slug: "rings",       image: "/cat-rings.jpg" },
  { name: "Necklace",         slug: "necklace",    image: "/cat-necklace.jpg" },
  { name: "Hair Accessories", slug: "hair",        image: "/cat-hair.jpg" },
];

// TODO: change these to match your real routes
const categoryRoute = (gender: string, slug: string) => `/shop/${gender}?category=${slug}`;

export default function HeroVideoComponent() {
  const { gender: rawCategory, setGender: setActiveCategory, genders } = useGender();
  const activeCategory = rawCategory || "women";

  const router = useRouter();

  const [marqueeItems, setMarqueeItems] = useState<string[]>(defaultMarqueeItems);
  const [heroContent, setHeroContent] = useState<Record<string, HeroItem>>(defaultHeroContent);
  const [categories, setCategories] = useState<CategoryItem[]>(defaultCategories);

  useEffect(() => {
    async function loadHomeContent() {
      try {
        const data = await apiRequest<HomeContentResponse>("/home-content");
        if (data.success && data.homeContent) {
          if (data.homeContent.marqueeItems && data.homeContent.marqueeItems.length > 0) {
            setMarqueeItems(data.homeContent.marqueeItems);
          }
          if (data.homeContent.heroContent) {
            setHeroContent((prev) => ({
              ...prev,
              ...data.homeContent.heroContent,
            }));
          }
          if (data.homeContent.categories && data.homeContent.categories.length > 0) {
            setCategories(data.homeContent.categories);
          }
        }
      } catch (err) {
        console.error("Failed to load home content:", err);
      }
    }
    loadHomeContent();
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
          padding: 16px 0 14px;
          box-sizing: border-box;
        }

        .cat-row {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          padding: 0 16px;
          scroll-snap-type: x proximity;
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
        }
        .cat-row::-webkit-scrollbar { display: none; }

        .cat-card {
          flex: 0 0 auto;
          width: clamp(104px, 28vw, 150px);
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          text-align: center;
          scroll-snap-align: start;
          font-family: 'Inter', sans-serif;
        }

        .cat-img {
          position: relative;
          width: 100%;
          aspect-ratio: 1 / 1;
          border-radius: 22px;
          overflow: hidden;
          background: #c5e0c1;
        }

        .cat-img img { object-fit: cover; transition: transform 0.4s ease; }
        .cat-card:hover .cat-img img { transform: scale(1.05); }

        .cat-name {
          display: block;
          margin-top: 8px;
          font-size: 0.82rem;
          font-weight: 500;
          color: #2a2a2a;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* tablet + laptop: centered grid, no scrolling */
        @media (min-width: 768px) {
          .cat-strip { padding: 28px 0 24px; }
          .cat-row {
            overflow: visible;
            justify-content: center;
            gap: 20px;
            max-width: 1100px;
            margin: 0 auto;
            padding: 0 24px;
          }
          .cat-card { width: calc((100% - 60px) / 4); max-width: 230px; }
          .cat-name { font-size: 0.95rem; margin-top: 10px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .bs-marquee-track { animation: none; }
          .cat-img img { transition: none; }
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
      <section className="cat-strip" aria-label="Shop by category">
        <div className="cat-row">
          {categories.map((c) => (
            <button
              key={c.slug}
              className="cat-card"
              onClick={() => router.push(categoryRoute(activeCategory, c.slug))}
            >
              <div className="cat-img">
                <Image
                  src={c.image}
                  alt={c.name}
                  fill
                  sizes="(max-width: 768px) 30vw, 230px"
                />
              </div>
              <span className="cat-name">{c.name}</span>
            </button>
          ))}
        </div>
      </section>
    </>
  );
}