// "use client";

// import Image from "next/image";
// import { useState } from "react";

// type Category = "women" | "men" | "kids";

// const heroContent = {
//   women: {
//     image: "/trial.png",
//     titleLine1: "MAKE YOU",
//     titleLine2: "SPARKLE",
//     subtitle: "Even the Tiniest Piece Tells A Sreat Story ",
//     kicker: "THE NEW CLASSIC",
//   },
//   men: {
//     image: "/trial.png",
//     titleLine1: "MODERN",
//     titleLine2: "EDGE",
//     subtitle: "Street Style & Tailoring",
//     kicker: "THE URBAN EDIT",
//   },
//   kids: {
//     image: "/trial.png",
//     titleLine1: "PLAYFUL",
//     titleLine2: "DAYS",
//     subtitle: "Everyday Fun & Comfort",
//     kicker: "THE LITTLE ONES",
//   },
// };

// export default function Hero() {
//   const [activeCategory, setActiveCategory] = useState<Category>("women");
//   const content = heroContent[activeCategory];

//   return (
//     <>
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@400;500;600&display=swap');

//         /* ── GENDER TOGGLE BAR ── */
//         .gender-toggle-bar {
//           background-color: #fff;
//           width: 100%;
//           display: flex;
//           justify-content: center;
//           align-items: center;
//           gap: 24px;
//           padding: 28px 20px;
//           position: sticky;
//           top: 0;
//           z-index: 100;
//           border-bottom: 1px solid #e8e8e8;
//         }

//         .gender-btn {
//           font-family: 'Inter', sans-serif;
//           font-size: 1.05rem;
//           font-weight: 500;
//           letter-spacing: 0.02em;
//           cursor: pointer;
//           border: 1.5px solid rgb(42, 71, 54);
//           padding: 10px 52px;
//           transition: all 0.25s ease;
//           min-width: 140px;
//           text-align: center;
//           border-radius: 0;
//         }

//         .gender-btn.inactive {
//           background-color: #fff;
//           color: rgb(42, 71, 54);
//         }

//         .gender-btn.inactive:hover {
//           background-color: #f5f5f5;
//         }

//         .gender-btn.active-btn {
//           background-color: rgb(42, 71, 54);
//           color: #fff;
//           border-color: rgb(42, 71, 54);
//         }

//         /* ── SCROLLABLE HERO SECTION ── */
//         .hero-scroll-wrapper {
//           overflow-y: auto;
//           /* Full remaining viewport height below the sticky bar */
//           /* Height is managed by the parent layout */
//         }

//         /* ── HERO CONTAINER ── */
//         .hero-container {
//           background-color: #d1dfd0;
//           min-height: 100vh;
//           width: 100%;
//           display: flex;
//           flex-direction: column;
//           font-family: 'Inter', sans-serif;
//           color: #2a4736;
//           position: relative;
//           padding: 40px 6vw 60px;
//           overflow: hidden;
//         }

//         /* Top Right Badge */
//         .source-badge {
//           position: absolute;
//           top: 40px;
//           right: 6vw;
//           color: #637765;
//           font-size: 0.9rem;
//           font-weight: 500;
//           text-transform: uppercase;
//           letter-spacing: 0.05em;
//           z-index: 10;
//         }

//         /* ── MAIN HERO GRID ── */
//         .hero-grid {
//           display: grid;
//           grid-template-columns: 1fr 1fr;
//           gap: 40px;
//           align-items: center;
//           max-width: 1400px;
//           margin: 0 auto;
//           width: 100%;
//           flex: 1;
//           padding-top: 20px;
//         }

//         /* ── LEFT TEXT CONTENT ── */
//         .hero-text-content {
//           display: flex;
//           flex-direction: column;
//           align-items: flex-start;
//           justify-content: center;
//         }

//         .hero-title {
//           font-family: 'Playfair Display', serif;
//           font-size: clamp(3.5rem, 7vw, 6.5rem);
//           font-weight: 700;
//           line-height: 0.95;
//           margin-bottom: 24px;
//           letter-spacing: -0.02em;
//         }

//         .hero-subtitle {
//           font-family: 'Playfair Display', serif;
//           font-size: clamp(1.5rem, 2.5vw, 2.2rem);
//           font-weight: 400;
//           color: #5c6c59;
//           margin-bottom: 40px;
//         }

//         .hero-kicker {
//           font-size: clamp(0.85rem, 1.5vw, 1rem);
//           font-weight: 500;
//           letter-spacing: 0.15em;
//           text-transform: uppercase;
//           margin-bottom: 20px;
//         }

//         .explore-btn {
//           background-color: #f2e4d6;
//           color: #2a4736;
//           border: 1px solid #2a4736;
//           padding: 16px 32px;
//           font-size: 0.9rem;
//           font-weight: 600;
//           letter-spacing: 0.05em;
//           text-transform: uppercase;
//           cursor: pointer;
//           transition: all 0.3s ease;
//           font-family: 'Inter', sans-serif;
//         }

//         .explore-btn:hover {
//           background-color: #2a4736;
//           color: #f2e4d6;
//         }

//         /* ── RIGHT IMAGE CONTENT ── */
//         .hero-image-wrapper {
//           display: flex;
//           justify-content: flex-end;
//           width: 100%;
//         }

//         .image-frame {
//           background-color: #f2e4d6;
//           padding: clamp(15px, 3vw, 30px);
//           position: relative;
//           width: 100%;
//           max-width: 550px;
//           aspect-ratio: 4 / 4.5;
//           box-shadow: 0 20px 40px rgba(0, 0, 0, 0.05);
//         }

//         .hero-image {
//           object-fit: cover;
//           object-position: center;
//           width: 100%;
//           height: 100%;
//         }

//         /* Decorative SVG */
//         .decorative-star {
//           position: absolute;
//           bottom: 30px;
//           right: 30px;
//           width: 40px;
//           height: 40px;
//           opacity: 0.8;
//           pointer-events: none;
//         }

//         /* ════════ RESPONSIVE ════════ */

//         @media (max-width: 1024px) {
//           .hero-grid { gap: 20px; }
//           .image-frame { max-width: 450px; }
//           .hero-subtitle { margin-bottom: 30px; }
//           .gender-btn { padding: 10px 36px; min-width: 120px; }
//         }

//         @media (max-width: 768px) {
//           .hero-container { padding: 30px 20px 50px; }
//           .source-badge { top: 30px; right: 20px; }
//           .hero-grid {
//             grid-template-columns: 1fr;
//             text-align: center;
//             gap: 40px;
//           }
//           .hero-text-content {
//             align-items: center;
//             order: 1;
//           }
//           .hero-image-wrapper {
//             justify-content: center;
//             order: 2;
//           }
//           .image-frame { max-width: 500px; padding: 15px; }
//           .gender-btn { padding: 10px 28px; min-width: 100px; font-size: 0.95rem; }
//           .gender-toggle-bar { gap: 16px; padding: 20px 16px; }
//         }

//         @media (max-width: 480px) {
//           .gender-btn { padding: 9px 20px; min-width: 80px; font-size: 0.88rem; }
//           .gender-toggle-bar { gap: 12px; padding: 16px 12px; }
//           .explore-btn { padding: 14px 24px; font-size: 0.85rem; }
//         }
//       `}</style>

//       {/* ── STICKY GENDER TOGGLE BAR ── */}
//       <div className="gender-toggle-bar" style={{marginTop: "50px"}}>
//         <button
//           className={`gender-btn ${activeCategory === "women" ? "active-btn" : "inactive"}`}
//           onClick={() => setActiveCategory("women")}
//         >
//           Women
//         </button>
//         <button
//           className={`gender-btn ${activeCategory === "men" ? "active-btn" : "inactive"}`}
//           onClick={() => setActiveCategory("men")}
//         >
//           Men
//         </button>
//         <button
//           className={`gender-btn ${activeCategory === "kids" ? "active-btn" : "inactive"}`}
//           onClick={() => setActiveCategory("kids")}
//         >
//           Kids
//         </button>
//       </div>

//       {/* ── SCROLLABLE HERO CONTENT ── */}
//       <section className="hero-container">

//         {/* TOP RIGHT TEXT */}
//         {/* <div className="source-badge">T</div> */}

//         {/* HERO GRID */}
//         <div className="hero-grid" key={activeCategory}>

//           {/* LEFT: TEXT CONTENT */}
//           <div className="hero-text-content">
//             <h1 className="hero-title">
//               {content.titleLine1}
//               <br />
//               {content.titleLine2}
//             </h1>
//             <p className="hero-subtitle">{content.subtitle}</p>
//             <span className="hero-kicker">{content.kicker}</span>
//             <button className="explore-btn">EXPLORE MORE</button>
//           </div>

//           {/* RIGHT: IMAGE CONTENT */}
//           <div className="hero-image-wrapper">
//             <div className="image-frame">
//               <Image
//                 src={content.image}
//                 alt={`${activeCategory} fashion model`}
//                 fill
//                 priority
//                 className="hero-image"
//                 sizes="(max-width: 768px) 95vw, (max-width: 1024px) 50vw, 550px"
//               />
//             </div>
//           </div>

//         </div>

//         {/* Decorative Star */}
//         <svg
//           className="decorative-star"
//           viewBox="0 0 24 24"
//           fill="none"
//           xmlns="http://www.w3.org/2000/svg"
//         >
//           <path
//             d="M12 0L13.5 10.5L24 12L13.5 13.5L12 24L10.5 13.5L0 12L10.5 10.5L12 0Z"
//             fill="#f2e4d6"
//           />
//         </svg>

//       </section>
//     </>
//   );
// }


"use client";

import Image from "next/image";
import { useState } from "react";
import { useGender } from "@/lib/genderContext";

type Category = "women" | "men" | "kids";

const heroContent = {
  women: {
    image: "/trial.png",
    titleLine1: "MAKE YOU",
    titleLine2: "SPARKLE",
    subtitle: "Even the Tiniest Piece Tells A Great Story",
    kicker: "THE NEW CLASSIC",
  },
  men: {
    image: "/trial.png",
    titleLine1: "MODERN",
    titleLine2: "EDGE",
    subtitle: "Street Style & Tailoring",
    kicker: "THE URBAN EDIT",
  },
  kids: {
    image: "/trial.png",
    titleLine1: "PLAYFUL",
    titleLine2: "DAYS",
    subtitle: "Everyday Fun & Comfort",
    kicker: "THE LITTLE ONES",
  },
};

export default function Hero() {
  const { gender: rawCategory, setGender: setActiveCategory } = useGender();
  const activeCategory = (["women", "men", "kids"].includes(rawCategory) ? rawCategory : "women") as Category;
  const content = heroContent[activeCategory];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@400;500;600&display=swap');

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
          margin-top: 50px;
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

        /* ── HERO CONTAINER ── */
        .hero-container {
          background-color: #d1dfd0;
          min-height: 100vh;
          width: 100%;
          display: flex;
          flex-direction: column;
          font-family: 'Inter', sans-serif;
          color: #2a4736;
          position: relative;
          padding: 40px 6vw 60px;
          box-sizing: border-box;
        }

        /* ── MAIN HERO GRID ── */
        .hero-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          align-items: center;
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
          flex: 1;
          padding-top: 20px;
        }

        /* ── LEFT TEXT CONTENT ── */
        .hero-text-content {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: center;
        }

        .hero-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(3.5rem, 7vw, 6.5rem);
          font-weight: 700;
          line-height: 0.95;
          margin-bottom: 24px;
          letter-spacing: -0.02em;
        }

        .hero-subtitle {
          font-family: 'Playfair Display', serif;
          font-size: clamp(1.3rem, 2.5vw, 2.2rem);
          font-weight: 400;
          color: #5c6c59;
          margin-bottom: 40px;
          line-height: 1.4;
        }

        .hero-kicker {
          font-size: clamp(0.75rem, 1.5vw, 1rem);
          font-weight: 500;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          margin-bottom: 20px;
        }

        .explore-btn {
          background-color: #f2e4d6;
          color: #2a4736;
          border: 1px solid #2a4736;
          padding: 16px 32px;
          font-size: 0.9rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: 'Inter', sans-serif;
        }

        .explore-btn:hover {
          background-color: #2a4736;
          color: #f2e4d6;
        }

        /* ── RIGHT IMAGE CONTENT ── */
        .hero-image-wrapper {
          display: flex;
          justify-content: flex-end;
          width: 100%;
        }

        .image-frame {
          background-color: #f2e4d6;
          padding: clamp(12px, 2.5vw, 28px);
          position: relative;
          width: 100%;
          max-width: 550px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.05);
          box-sizing: border-box;
        }

        /*
          KEY FIX: Wrap Next.js fill image inside a relative div with
          padding-bottom to create a reliable aspect ratio container.
          This prevents the image from overflowing or being cut on mobile.
        */
        .image-inner {
          position: relative;
          width: 100%;
          padding-bottom: 112.5%; /* 4:4.5 ratio */
          overflow: hidden;
        }

        .hero-image {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: 100% !important;
          object-fit: cover;
          object-position: top center;
        }

        /* Decorative SVG */
        .decorative-star {
          position: absolute;
          bottom: 30px;
          right: 30px;
          width: 40px;
          height: 40px;
          opacity: 0.8;
          pointer-events: none;
        }

        /* ════════ LAPTOP ≤ 1280px ════════ */
        @media (max-width: 1280px) {
          .hero-grid { gap: 28px; }
          .image-frame { max-width: 460px; }
        }

        /* ════════ TABLET ≤ 1024px ════════ */
        @media (max-width: 1024px) {
          .hero-grid { gap: 20px; }
          .image-frame { max-width: 420px; }
          .hero-subtitle { margin-bottom: 28px; }
          .gender-btn { padding: 10px 36px; min-width: 120px; }
        }

        /* ════════ TABLET PORTRAIT ≤ 768px ════════ */
        @media (max-width: 768px) {
          .hero-container { padding: 30px 5vw 50px; }
          .hero-grid {
            grid-template-columns: 1fr;
            text-align: center;
            gap: 32px;
          }
          .hero-text-content {
            align-items: center;
            order: 1;
          }
          .hero-image-wrapper {
            justify-content: center;
            order: 2;
            width: 100%;
          }
          .image-frame {
            max-width: 400px;
            width: 85%;
            padding: 14px;
          }
          /* Tighten ratio on tablet portrait so image doesn't get too tall */
          .image-inner { padding-bottom: 100%; }
          .gender-btn { padding: 10px 28px; min-width: 100px; font-size: 0.95rem; }
          .gender-toggle-bar { gap: 16px; padding: 20px 16px; }
        }

        /* ════════ MOBILE ≤ 600px ════════ */
        @media (max-width: 600px) {
          .hero-container { padding: 24px 16px 40px; }
          .hero-grid { gap: 24px; }
          .hero-image-wrapper { width: 100%; }
          .image-frame {
            max-width: 100%;
            width: 100%;
            padding: 12px;
          }
          /* Reduce ratio on mobile: image shows nicely without being cut */
          .image-inner { padding-bottom: 85%; }
          .hero-title { margin-bottom: 16px; }
          .hero-subtitle { font-size: 1.1rem; margin-bottom: 20px; }
          .hero-kicker { font-size: 0.72rem; margin-bottom: 14px; }
          .explore-btn { padding: 13px 22px; font-size: 0.82rem; }
          .gender-btn { padding: 9px 20px; min-width: 80px; font-size: 0.88rem; }
          .gender-toggle-bar { gap: 12px; padding: 16px 12px; }
        }

        /* ════════ SMALL MOBILE ≤ 390px ════════ */
        @media (max-width: 390px) {
          .image-inner { padding-bottom: 75%; }
          .hero-title { font-size: 2.6rem; }
          .gender-btn { padding: 8px 14px; min-width: 70px; font-size: 0.8rem; }
          .gender-toggle-bar { gap: 8px; }
        }
      `}</style>

      {/* ── STICKY GENDER TOGGLE BAR ── */}
      <div className="gender-toggle-bar">
        <button
          className={`gender-btn ${activeCategory === "women" ? "active-btn" : "inactive"}`}
          onClick={() => setActiveCategory("women")}
        >
          Women
        </button>
        <button
          className={`gender-btn ${activeCategory === "men" ? "active-btn" : "inactive"}`}
          onClick={() => setActiveCategory("men")}
        >
          Men
        </button>
        <button
          className={`gender-btn ${activeCategory === "kids" ? "active-btn" : "inactive"}`}
          onClick={() => setActiveCategory("kids")}
        >
          Kids
        </button>
      </div>

      {/* ── HERO CONTENT ── */}
      <section className="hero-container">

        {/* HERO GRID */}
        <div className="hero-grid" key={activeCategory}>

          {/* LEFT: TEXT CONTENT */}
          <div className="hero-text-content">
            <h1 className="hero-title">
              {content.titleLine1}
              <br />
              {content.titleLine2}
            </h1>
            <p className="hero-subtitle">{content.subtitle}</p>
            <span className="hero-kicker">{content.kicker}</span>
            <button className="explore-btn">EXPLORE MORE</button>
          </div>

          {/* RIGHT: IMAGE CONTENT */}
          <div className="hero-image-wrapper">
            <div className="image-frame">
              <div className="image-inner">
                <Image
                  src={content.image}
                  alt={`${activeCategory} fashion model`}
                  fill
                  priority
                  className="hero-image"
                  sizes="(max-width: 600px) 100vw, (max-width: 768px) 85vw, (max-width: 1024px) 50vw, 550px"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Decorative Star */}
        <svg
          className="decorative-star"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 0L13.5 10.5L24 12L13.5 13.5L12 24L10.5 13.5L0 12L10.5 10.5L12 0Z"
            fill="#f2e4d6"
          />
        </svg>

      </section>
    </>
  );
}