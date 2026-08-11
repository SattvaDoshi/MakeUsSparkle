
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useGender } from "@/lib/genderContext";
import { fetchCatalogStyles, slugifyCatalog } from "@/lib/catalogApi";
import { apiRequest } from "@/lib/api";

// Swiper imports
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Navigation, Autoplay } from "swiper/modules";

// Swiper styles
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/navigation";

type StyleItem = {
  id: number;
  name: string;
  slug: string;
  img?: string;
  fallback?: string;
  gender?: unknown;
};

export default function ShopByStyle() {
  const router = useRouter();
  const { gender } = useGender();
  const [dynamicStyles, setDynamicStyles] = useState<StyleItem[]>([]);
  const [styleHeading, setStyleHeading] = useState<string>("");
  const [loading, setLoading] = useState(true);
  // show only backend-provided styles; do not fall back to local templates
  const styles: StyleItem[] = dynamicStyles;

  // Fetch catalog
  useEffect(() => {
    let alive = true;
    // eslint-disable-next-line no-console
    console.log("StyleSection effect running, selected gender:", gender);
    
    Promise.all([
      fetchCatalogStyles(),
      apiRequest<{ success: boolean; homeContent: any }>("/home-content").catch(() => null)
    ])
      .then(([api, homeContentResult]) => {
        if (!alive) return;
        
        if (homeContentResult?.success && homeContentResult.homeContent) {
          const hc = homeContentResult.homeContent;
          const heading = hc.genderContent?.[gender]?.styleHeading;
          if (heading) {
            setStyleHeading(heading);
          } else {
            setStyleHeading(gender === "men" ? "Shop by His Style" : gender === "kids" ? "Shop by Kids Style" : "Shop by Your Style");
          }
        } else {
          setStyleHeading(gender === "men" ? "Shop by His Style" : gender === "kids" ? "Shop by Kids Style" : "Shop by Your Style");
        }

        if (!Array.isArray(api) || api.length === 0) {
          setDynamicStyles([] as StyleItem[]);
          setLoading(false);
          return;
        }
        // If any returned style is missing a name, show an empty section (no fallback)
        if (api.some((s) => !s.name || !String(s.name).trim())) {
          setDynamicStyles([] as StyleItem[]);
          return;
        }
        function genderMatches(raw: unknown, selected: string) {
          const sel = String(selected || "").toLowerCase();
          if (!raw) return false;
          if (typeof raw === "string") return String(raw).toLowerCase() === sel;
          if (typeof raw === "object" && raw !== null) {
            const obj = raw as { slug?: unknown; name?: unknown };
            const slug = (obj.slug || "").toString().toLowerCase();
            const name = (obj.name || "").toString().toLowerCase();
            if (slug === sel) return true;
            if (name === sel) return true;
          }
          return false;
        }

        const mapped = api.map((s, i) => {
          const name = s.name as string;
          const slug = s.slug || slugifyCatalog(name);
          return {
            id: i + 1,
            name,
            slug,
            img: (s as any).image || "",
            fallback: "",
            gender: (s as any).gender,
          } as StyleItem;
        });
        // filter by selected gender (if any) using the mapped item's gender
        const filtered = mapped.filter((m) => genderMatches(m.gender, gender));
        // debug logs to help diagnose empty state
        // eslint-disable-next-line no-console
        console.log("StyleSection — api:", api);
        // eslint-disable-next-line no-console
        console.log("StyleSection — mapped:", mapped);
        // eslint-disable-next-line no-console
        console.log("StyleSection — selected gender:", gender);
        // eslint-disable-next-line no-console
        console.log("StyleSection — filtered:", filtered);

        // show only backend data (no local fallbacks)
        setDynamicStyles(filtered as StyleItem[]);
        setLoading(false);
      })
      .catch(() => {
        if (alive) setDynamicStyles([] as StyleItem[]);
        if (alive) setLoading(false);
      });
    return () => { alive = false; };
  }, [gender]);
  
  // If we've finished loading and there are no styles, hide the whole section
  if (!loading && styles.length === 0) return null;
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
            {styleHeading || (gender === "men" ? "Shop by His Style" : "Shop by Your Style")}
          </h2>
        </div>

        <div className="sbs__swiper-container">
          <Swiper
            effect={"coverflow"}
            grabCursor={true}
            centeredSlides={true}
            slidesPerView={"auto"}
            preventClicks={false}
            preventClicksPropagation={false}
            // enable loop only if there are at least 2 slides
            loop={styles.length > 1}
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
            {styles.filter(card => Boolean(card.img)).map((card) => (
              <SwiperSlide
                key={card.id}
                className="swiper-slide-custom"
              >
                <Link
                  href={`/styles/${card.slug}`}
                  style={{ display: "block", width: "100%", height: "100%", zIndex: 10, position: "relative" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={card.img}
                    alt={card.name}
                    // no fallback — only show backend images
                  />
                  <div className="sbs__lbl">
                    <span>{card.name}</span>
                  </div>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Debug helper: show backend data when no styles render */}
          {styles.length === 0 && (
            <div style={{ padding: 16, textAlign: "center", color: "#666" }}>
              <strong>No styles to show.</strong>
              <div style={{ marginTop: 8, fontSize: 12, whiteSpace: "pre-wrap", textAlign: "left", maxWidth: 800, margin: "8px auto" }}>
                {JSON.stringify(dynamicStyles, null, 2)}
              </div>
            </div>
          )}

          {/* Custom Navigation Arrows */}
          <div className="custom-swiper-button-prev">❮</div>
          <div className="custom-swiper-button-next">❯</div>
        </div>
      </section>
    </>
  );
}