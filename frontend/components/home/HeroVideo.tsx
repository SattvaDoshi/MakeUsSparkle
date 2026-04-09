"use client";
import { useEffect, useRef } from "react";

export default function Home() {
  const curveRef = useRef(null);

  useEffect(() => {
    const el = document.querySelector(".hero-content");
    if (el) {
      setTimeout(() => el.classList.add("visible"), 100);
    }
  }, []);

  return (
    <main style={{ margin: 0, padding: 0, fontFamily: "'Cormorant Garamond', serif", background: "#f5f3ef" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=Montserrat:wght@300;400;500;600;700&display=swap');

        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

        :root {
          --sage: #525d51;
          --cream: #f5f3ef;
          --dark: #1a1a1a;
          --gold: #c9a84c;
          --gold-light: #e8c96d;
          --white: #ffffff;
          --gray-mid: #8a8a8a;
        }

        body { overflow-x: hidden; }

        .page-wrapper {
          display: grid;
          grid-template-columns: 42% 58%;
          min-height: 100vh;
          position: relative;
        }

        /* ── LEFT PANEL ── */
        .left-panel {
          position: relative;
          background: var(--sage);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .hero-image {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center top;
          opacity: 0.92;
        }

        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            160deg,
            rgba(109, 185, 88, 0.25) 0%,
            rgba(59, 213, 108, 0.35)35) 100%
          );
        }

        /* circular arc decoration */
        .arc-svg {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-55%, -48%);
          width: 420px;
          height: 420px;
          pointer-events: none;
          z-index: 2;
          animation: rotateArc 18s linear infinite;
        }
        @keyframes rotateArc {
          from { transform: translate(-55%, -48%) rotate(0deg); }
          to   { transform: translate(-55%, -48%) rotate(360deg); }
        }

        /* logo */
        .logo {
          position: absolute;
          top: 28px;
          left: 32px;
          z-index: 10;
          font-family: 'Cormorant Garamond', serif;
          font-size: 2.2rem;
          font-weight: 700;
          color: var(--white);
          letter-spacing: -1px;
          line-height: 1;
        }

        /* dot accent */
        .dot-accent {
          position: absolute;
          top: 110px;
          left: 120px;
          width: 12px;
          height: 12px;
          background: var(--white);
          border-radius: 50%;
          z-index: 10;
          animation: pulse 3s ease-in-out infinite;
        }
        @keyframes pulse {
          0%,100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.4); opacity: 0.7; }
        }

        /* hero text */
        .hero-content {
          position: absolute;
          bottom: 120px;
          left: 32px;
          right: 24px;
          z-index: 10;
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.9s ease, transform 0.9s ease;
        }
        .hero-content.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .hero-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2.8rem, 5vw, 4rem);
          font-weight: 700;
          color: var(--white);
          line-height: 1.0;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          margin-bottom: 18px;
          text-shadow: 0 2px 24px rgba(0,0,0,0.18);
        }

        .hero-title .sparkle-word {
          display: block;
          font-style: italic;
          font-weight: 300;
          letter-spacing: 0.08em;
        }

        .hero-body {
          font-family: 'Montserrat', sans-serif;
          font-size: 0.72rem;
          font-weight: 300;
          color: rgba(255,255,255,0.82);
          line-height: 1.7;
          max-width: 240px;
          letter-spacing: 0.02em;
        }

        /* contact us */
        .contact-us {
          position: absolute;
          bottom: 28px;
          left: 32px;
          z-index: 10;
          font-family: 'Montserrat', sans-serif;
          font-size: 0.6rem;
          font-weight: 600;
          letter-spacing: 0.22em;
          color: rgba(255,255,255,0.75);
          text-transform: uppercase;
          text-decoration: none;
          transition: color 0.2s;
        }
        .contact-us:hover { color: var(--white); }

        /* ── RIGHT PANEL ── */
        .right-panel {
          background: var(--cream);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 28px 56px 0 48px;
          position: relative;
        }

        /* hamburger */
        .hamburger {
          position: absolute;
          top: 28px;
          right: 28px;
          width: 52px;
          height: 52px;
          border-radius: 50%;
          border: 1.5px solid rgba(26,26,26,0.2);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 5px;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s;
          background: transparent;
          z-index: 10;
        }
        .hamburger:hover { background: var(--dark); border-color: var(--dark); }
        .hamburger:hover span { background: var(--white); }
        .hamburger span {
          display: block;
          width: 18px;
          height: 1.5px;
          background: var(--dark);
          border-radius: 2px;
          transition: background 0.2s;
        }
        .hamburger span:nth-child(2) { width: 13px; align-self: flex-start; margin-left: 14px; }

        /* top image strip */
        .top-images {
          display: flex;
          gap: 12px;
          margin-top: 4px;
          margin-bottom: 0;
        }

        .img-card {
          position: relative;
          overflow: hidden;
          border-radius: 2px;
        }
        .img-card:first-child {
          width: 130px;
          height: 130px;
        }
        .img-card:last-child {
          width: 220px;
          height: 275px;
        }

        .img-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.6s ease;
        }
        .img-card:hover img { transform: scale(1.04); }

        .img-label {
          position: absolute;
          bottom: 10px;
          left: 10px;
          font-family: 'Montserrat', sans-serif;
          font-size: 0.55rem;
          font-weight: 600;
          letter-spacing: 0.18em;
          color: var(--white);
          text-transform: uppercase;
          background: rgba(0,0,0,0.4);
          padding: 3px 7px;
          border-radius: 1px;
          backdrop-filter: blur(4px);
        }

        /* mid content */
        .mid-content {
          padding: 36px 0 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .star-icon {
          font-size: 2rem;
          color: var(--gold);
          line-height: 1;
          margin-bottom: 14px;
          display: block;
          animation: spinStar 8s linear infinite;
          width: fit-content;
        }
        @keyframes spinStar {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        .even-the {
          font-family: 'Montserrat', sans-serif;
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.22em;
          color: var(--dark);
          text-transform: uppercase;
          margin-bottom: 12px;
        }

        .tagline {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2.2rem, 4vw, 3.2rem);
          font-weight: 700;
          line-height: 1.05;
          color: var(--dark);
          text-transform: uppercase;
          letter-spacing: 0.01em;
          max-width: 440px;
        }

        .tagline .underline-gold {
          display: inline;
          position: relative;
        }
        .tagline .underline-gold::after {
          content: '';
          position: absolute;
          bottom: -3px;
          left: 0;
          right: 0;
          height: 2px;
          background: var(--gold);
          border-radius: 2px;
        }

        .tagline .gold-outline {
          -webkit-text-stroke: 1.5px var(--dark);
          color: transparent;
          font-style: italic;
        }

        /* social sidebar */
        .social-sidebar {
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          flex-direction: column;
          gap: 32px;
          z-index: 10;
        }

        .social-link {
          font-family: 'Montserrat', sans-serif;
          font-size: 0.52rem;
          font-weight: 600;
          letter-spacing: 0.22em;
          color: var(--gray-mid);
          text-transform: uppercase;
          text-decoration: none;
          writing-mode: vertical-rl;
          transform: rotate(180deg);
          transition: color 0.2s;
        }
        .social-link:hover { color: var(--dark); }

        /* bottom bar */
        .bottom-bar {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          align-items: center;
          margin-top: auto;
          border-top: 1px solid rgba(26,26,26,0.1);
          margin-left: -48px;
          margin-right: -56px;
        }

        .bottom-btn {
          padding: 22px 32px;
          font-family: 'Montserrat', sans-serif;
          font-size: 0.6rem;
          font-weight: 600;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          text-decoration: none;
          color: var(--dark);
          transition: background 0.2s, color 0.2s;
          border: none;
          background: transparent;
          cursor: pointer;
          text-align: center;
        }
        .bottom-btn:hover { background: rgba(26,26,26,0.04); }
        .bottom-btn.discover {
          background: var(--dark);
          color: var(--white);
          letter-spacing: 0.28em;
        }
        .bottom-btn.discover:hover { background: #333; }

        .bottom-divider {
          width: 1px;
          height: 24px;
          background: rgba(26,26,26,0.15);
          justify-self: center;
        }

        /* responsive */
        @media (max-width: 860px) {
          .page-wrapper { grid-template-columns: 1fr; min-height: auto; }
          .left-panel { height: 60vh; }
          .right-panel { padding: 24px; }
          .social-sidebar { display: none; }
          .tagline { font-size: 2rem; }
        }
      `}</style>

      <div className="page-wrapper">

        {/* ── LEFT PANEL ── */}
        <div className="left-panel">
          {/* placeholder gradient bg as hero image */}
          <div style={{
            position:"absolute", inset:0,
            background:"linear-gradient(160deg,#b5c4b1 0%,#8a9e85 40%,#4a5e47 100%)"
          }}/>
          <div className="hero-overlay"/>

          {/* animated arc */}
          <svg className="arc-svg" viewBox="0 0 420 420" fill="none">
            <circle cx="210" cy="210" r="195" stroke="rgba(255,255,255,0.22)" strokeWidth="1"/>
            <circle cx="210" cy="210" r="195"
              stroke="rgba(255,255,255,0.7)"
              strokeWidth="1"
              strokeDasharray="60 1160"
              strokeLinecap="round"
            />
          </svg>

          <div className="logo">k</div>
          <div className="dot-accent"/>

          <div className="hero-content">
            <h1 className="hero-title">
              Make U
              <span className="sparkle-word">Sparkle</span>
            </h1>
            <p className="hero-body">
              Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat.
            </p>
          </div>

          <a className="contact-us" href="#">Contact Us</a>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="right-panel">

          {/* hamburger */}
          <div className="hamburger" role="button" aria-label="Menu">
            <span/><span/><span/>
          </div>

          {/* top images */}
          <div className="top-images">
            <div className="img-card">
              {/* placeholder small image */}
              <div style={{
                width:"130px", height:"130px",
                background:"linear-gradient(135deg,#2a2a2a 0%,#4a3728 100%)",
                display:"flex", alignItems:"center", justifyContent:"center"
              }}>
                <span style={{color:"rgba(255,255,255,0.4)",fontSize:"2rem"}}>✦</span>
              </div>
              <span className="img-label">Gold Earrings</span>
            </div>
            <div className="img-card">
              {/* placeholder large image */}
              <div style={{
                width:"220px", height:"275px",
                background:"linear-gradient(160deg,#1a3a2a 0%,#0d2218 100%)",
                display:"flex", alignItems:"center", justifyContent:"center"
              }}>
                <span style={{color:"rgba(255,255,255,0.3)",fontSize:"3rem"}}>✦</span>
              </div>
              <span className="img-label">New Collection</span>
            </div>
          </div>

          {/* mid content */}
          <div className="mid-content">
            <span className="star-icon">✦</span>
            <p className="even-the">Even The</p>
            <h2 className="tagline">
              Tiniest Piece<br/>
              Of Jewelry Tells<br/>
              A{" "}
              <span className="underline-gold">
                <span className="gold-outline">Great Story</span>
              </span>
            </h2>
          </div>

          {/* social sidebar */}
          <div className="social-sidebar">
            <a className="social-link" href="#">Instagram</a>
            <a className="social-link" href="#">Facebook</a>
            <a className="social-link" href="#">Twitter</a>
          </div>

          {/* bottom bar */}
          <div className="bottom-bar">
            <a className="bottom-btn" href="#">About Us</a>
            <div className="bottom-divider"/>
            <a className="bottom-btn discover" href="#">Discover</a>
          </div>

        </div>
      </div>
    </main>
  );
}

// import Image from "next/image";

// export default function Home() {
//   return (
//     <main className="w-full h-screen relative overflow-hidden">
//       <Image
//         src="/images/hero.png"
//         alt="MakeUsSparkle Hero"
//         fill
//         priority
//         className="object-cover"
//       />
//     </main>
//   );
// }