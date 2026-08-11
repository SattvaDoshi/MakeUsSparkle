"use client";

import Image from "next/image";
import { useGender } from "@/lib/genderContext";
import { useAuth } from "@/lib/authContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";

type Category = "women" | "men" | "kids";

type HomeContentResponse = {
  success: boolean;
  homeContent: {
    marqueeItems: string[];
    heroContent: {
      women?: { image: string };
      men?: { image: string };
      kids?: { image: string };
    };
  };
};

const defaultHeroContent = {
  women: { image: "/island-girl.jpg" },
  men:   { image: "/trial.png" },
  kids:  { image: "/trial.png" },
};

const defaultMarqueeItems = [
  '✦ Free Shipping above ₹999',
  '✦ Custom Jewellery',
  '✦ Free Gifts on all Orders',
];

export default function HeroVideoComponent() {
  const { gender: rawCategory, setGender: setActiveCategory, genders } = useGender();
  const activeCategory = rawCategory || "women";
    
  const { isAuthenticated, signOut } = useAuth();
  const router = useRouter();

  const [marqueeItems, setMarqueeItems] = useState<string[]>(defaultMarqueeItems);
  const [heroContent, setHeroContent] = useState<Record<string, { image: string }>>(defaultHeroContent);

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
              ...data.homeContent.heroContent
            }));
          }
        }
      } catch (err) {
        console.error("Failed to load home content:", err);
      }
    }
    loadHomeContent();
  }, []);

  const content = heroContent[activeCategory] || defaultHeroContent.women;

  const handleAuthClick = () => {
    if (isAuthenticated) {
      signOut();
      router.push("/");
      return;
    }
    window.dispatchEvent(
      new CustomEvent("makeussparkle:auth-open", { detail: { tab: "register" } })
    );
  };

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
          // margin-top: 50px;
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

        /* ── IMAGE + AUTH SECTION ── */
        .hero-image-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          padding: 24px 0;
        }

        /* 4/5 aspect ratio — no background, no border */
        .hero-img-frame {
          position: relative;
          width: min(340px, 85vw);
          aspect-ratio: 4 / 5;
          overflow: hidden;
        }

        .hero-img-frame img {
          object-fit: cover;
          object-position: top center;
        }

        /* Auth button */
        .hero-auth-btn {
          margin-top: 20px;
          font-family: 'Inter', sans-serif;
          font-size: 0.82rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 12px 36px;
          border: 1.5px solid rgb(42, 71, 54);
          background: transparent;
          color: rgb(42, 71, 54);
          cursor: pointer;
          transition: background 0.25s, color 0.25s;
          border-radius: 0;
          width: min(340px, 85vw);
        }

        .hero-auth-btn:hover {
          background: rgb(42, 71, 54);
          color: #f2e4d6;
        }

        .hero-auth-btn.logout {
          border-color: #8a3a2a;
          color: #8a3a2a;
        }

        .hero-auth-btn.logout:hover {
          background: #8a3a2a;
          color: #fff;
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

      {/* ── IMAGE + AUTH BUTTON ── */}
      <div className="hero-image-section">
        <div className="hero-img-frame">
          <Image
            src={content.image}
            alt={`${activeCategory} fashion model`}
            fill
            priority
            sizes="(max-width: 600px) 85vw, 340px"
          />
        </div>

        <button
          className={`hero-auth-btn${isAuthenticated ? " logout" : ""}`}
          onClick={handleAuthClick}
        >
          {isAuthenticated ? "Logout" : "Login / Sign Up"}
        </button>
      </div>
    </>
  );
}