
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGender } from "@/lib/genderContext";
import { fetchCatalogStyles, slugifyCatalog } from "@/lib/catalogApi";

// Swiper imports
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Navigation, Autoplay } from "swiper/modules";

// Swiper styles
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/navigation";

const womenStyles = [
  { id: 1, name: "Soft Girl",          slug: "soft-girl",       img: "/images/IslandGirl.jpg",  fallback: "/images/IslandGirl.jpg" },
  { id: 2, name: "Glam Look",          slug: "glam-look",       img: "/images/GlamLook.jpg",    fallback: "/images/GlamLook.jpg" },
  { id: 3, name: "Island Girl",        slug: "island-girl",     img: "/images/IslandGirl.jpg",  fallback: "/images/IslandGirl.jpg" },
  { id: 4, name: "Office Jewellery",   slug: "office-jewellery",img: "/images/GlamLook.jpg",    fallback: "/images/hero1.png" },
  { id: 5, name: "Maximalist",         slug: "maximalist",      img: "/images/Maximalist.jpg",  fallback: "/images/FairyCoded.jpg" },
  { id: 6, name: "Fairy Coded",        slug: "fairy-coded",     img: "/images/FairyCoded.jpg",  fallback: "/images/FairyCoded.jpg" },
];

const menStyles = [
  { id: 1, name: "Street Edge",     slug: "men-street-edge", img: "/images/men-street.jpg",    fallback: "/images/FairyCoded.jpg" },
  { id: 2, name: "Corporate Sharp", slug: "men-corporate",   img: "/images/men-corporate.jpg", fallback: "/images/GlamLook.jpg" },
  { id: 3, name: "Island King",     slug: "men-island",      img: "/images/men-island.jpg",    fallback: "/images/IslandGirl.jpg" },
  { id: 4, name: "Minimal Stack",   slug: "men-minimal",     img: "/images/men-minimal.jpg",   fallback: "/images/FairyCoded.jpg" },
  { id: 5, name: "Rocker Noir",     slug: "men-rocker",      img: "/images/men-rocker.jpg",    fallback: "/images/Maximalist.jpg" },
  { id: 6, name: "Gold Royalty",    slug: "men-gold",        img: "/images/men-gold.jpg",      fallback: "/images/hero.png" },
];

type StyleItem = (typeof womenStyles)[number];

export default function ShopByStyle() {
  const router = useRouter();
  const { gender } = useGender();
  const [dynamicStyles, setDynamicStyles] = useState<StyleItem[]>([]);
  const base: StyleItem[] = gender === "men" ? menStyles : womenStyles;
  const styles: StyleItem[] = dynamicStyles.length > 0 ? dynamicStyles : base;

  // Fetch catalog
  useEffect(() => {
    let alive = true;
    const tmpl = gender === "men" ? menStyles : womenStyles;
    fetchCatalogStyles()
      .then((api) => {
        if (!alive) return;
        const bySlug = new Map(api.map((s) => [s.slug || slugifyCatalog(s.name), s]));
        setDynamicStyles(
          tmpl.map((t, i) => {
            const m = bySlug.get(t.slug) || bySlug.get(slugifyCatalog(t.name));
            return { ...t, id: i + 1, name: m?.name || t.name, slug: m?.slug || t.slug, img: m?.image || t.img };
          }) as StyleItem[]
        );
      })
      .catch(() => { if (alive) setDynamicStyles(tmpl as StyleItem[]); });
    return () => { alive = false; };
  }, [gender]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@300;400;500&display=swap');

        .sbs {
          background: #ffffff;
          padding: 52px 0 64px;
          font-family: 'Jost', sans-serif;
          overflow: hidden;
          position: relative;
        }

        .sbs__hdr {
          text-align: center;
          padding: 0 20px 40px;
          max-width: 1280px;
          margin: 0 auto;
        }

        .sbs__title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(28px, 4vw, 44px);
          font-weight: 400;
          color: #1a1a1a;
          margin: 0;
          text-transform: uppercase;
        }

        /* ── Swiper Stage ── */
        .sbs__swiper-container {
          width: 100%;
          padding: 20px 0;
          position: relative;
        }

        .swiper-slide-custom {
          width: 32vw;
          max-width: 550px;
          aspect-ratio: 3 / 4;
          background-position: center;
          background-size: cover;
          position: relative;
          cursor: pointer;
          border-radius: 4px;
          overflow: hidden;
          transition: box-shadow 0.3s ease;
        }

        .swiper-slide-active {
          box-shadow: 0 20px 50px rgba(0,0,0,0.2);
        }

        .swiper-slide-custom img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: none;
          -webkit-filter: none;
        }

        /* ── Label ── */
        .sbs__lbl {
          position: absolute;
          bottom: 30px;
          left: 0;
          width: 100%;
          text-align: center;
          z-index: 10;
        }

        .sbs__lbl span {
          /* CHANGED: larger font + darker off-white (#f0ece4 instead of pure white) */
          color: #f0ece4;
          font-family: 'Jost', sans-serif;
          font-size: 19px;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding-bottom: 7px;
          border-bottom: 1px solid rgba(240, 236, 228, 0.75);
          display: inline-block;
          /* Slightly stronger shadow to keep legibility on light images */
          text-shadow: 1px 2px 6px rgba(0,0,0,0.55);
        }

        /* ── Custom Navigation Arrows ── */
        .custom-swiper-button-prev,
        .custom-swiper-button-next {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 48px;
          height: 48px;
          background-color: #ffffff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 20;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          color: #000;
          font-size: 22px;
          transition: background-color 0.2s, transform 0.2s;
        }

        .custom-swiper-button-prev:hover,
        .custom-swiper-button-next:hover {
          background-color: #f0f0f0;
          transform: translateY(-50%) scale(1.05);
        }

        .custom-swiper-button-prev { left: 2%; }
        .custom-swiper-button-next { right: 2%; }

        /* ── Responsive ── */
        @media (max-width: 1200px) {
          .swiper-slide-custom { width: 420px; }
        }

        @media (max-width: 1024px) {
          .swiper-slide-custom { width: 360px; }
        }

        @media (max-width: 768px) {
          .swiper-slide-custom { width: 320px; }
          .sbs__lbl span { font-size: 17px; }
          .custom-swiper-button-prev { left: 2%; width: 40px; height: 40px; font-size: 18px; }
          .custom-swiper-button-next { right: 2%; width: 40px; height: 40px; font-size: 18px; }
        }

        @media (max-width: 480px) {
          .swiper-slide-custom { width: 260px; }
          .sbs__lbl { bottom: 20px; }
          .sbs__lbl span { font-size: 14px; border-bottom: 0.5px solid rgba(240,236,228,0.75); }
        }
      `}</style>

      <section className="sbs" aria-label="Shop by Style">
        <div className="sbs__hdr">
          <h2 className="sbs__title">
            {gender === "men" ? "Shop by His Style" : "Shop by Your Style"}
          </h2>
        </div>

        <div className="sbs__swiper-container">
          <Swiper
            effect={"coverflow"}
            grabCursor={true}
            centeredSlides={true}
            slidesPerView={"auto"}
            loop={true}
            coverflowEffect={{
              rotate: 15,
              stretch: 0,
              depth: 350,
              modifier: 1,
              slideShadows: false,
            }}
            navigation={{
              nextEl: ".custom-swiper-button-next",
              prevEl: ".custom-swiper-button-prev",
            }}
            autoplay={{
              delay: 3800,
              disableOnInteraction: false,
            }}
            modules={[EffectCoverflow, Navigation, Autoplay]}
            className="styleSwiper"
          >
            {styles.map((card) => (
              <SwiperSlide
                key={card.id}
                className="swiper-slide-custom"
                onClick={() => router.push(`/styles/${card.slug}`)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={card.img}
                  alt={card.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = card.fallback;
                  }}
                />
                <div className="sbs__lbl">
                  <span>{card.name}</span>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom Navigation Arrows */}
          <div className="custom-swiper-button-prev">❮</div>
          <div className="custom-swiper-button-next">❯</div>
        </div>
      </section>
    </>
  );
}