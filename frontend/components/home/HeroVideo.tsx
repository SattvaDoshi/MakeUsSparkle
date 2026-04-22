// // "use client";
// // import { useEffect, useRef } from "react";

// // export default function Home() {
// //   const curveRef = useRef(null);

// //   useEffect(() => {
// //     const el = document.querySelector(".hero-content");
// //     if (el) {
// //       setTimeout(() => el.classList.add("visible"), 100);
// //     }
// //   }, []);

// //   return (
// //     <main style={{ margin: 0, padding: 0, fontFamily: "'Cormorant Garamond', serif", background: "#f5f3ef" }}>
// //       <style>{`
// //         @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=Montserrat:wght@300;400;500;600;700&display=swap');

// //         *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

// //         :root {
// //           --sage: #525d51;
// //           --cream: #f5f3ef;
// //           --dark: #1a1a1a;
// //           --gold: #c9a84c;
// //           --gold-light: #e8c96d;
// //           --white: #ffffff;
// //           --gray-mid: #8a8a8a;
// //         }

// //         body { overflow-x: hidden; }

// //         .page-wrapper {
// //           display: grid;
// //           grid-template-columns: 42% 58%;
// //           min-height: 100vh;
// //           position: relative;
// //         }

// //         /* ── LEFT PANEL ── */
// //         .left-panel {
// //           position: relative;
// //           background: var(--sage);
// //           overflow: hidden;
// //           display: flex;
// //           flex-direction: column;
// //           justify-content: space-between;
// //         }

// //         .hero-image {
// //           position: absolute;
// //           inset: 0;
// //           width: 100%;
// //           height: 100%;
// //           object-fit: cover;
// //           object-position: center top;
// //           opacity: 0.92;
// //         }

// //         .hero-overlay {
// //           position: absolute;
// //           inset: 0;
// //           background: linear-gradient(
// //             160deg,
// //             rgba(109, 185, 88, 0.25) 0%,
// //             rgba(59, 213, 108, 0.35)35) 100%
// //           );
// //         }

// //         /* circular arc decoration */
// //         .arc-svg {
// //           position: absolute;
// //           top: 50%;
// //           left: 50%;
// //           transform: translate(-55%, -48%);
// //           width: 420px;
// //           height: 420px;
// //           pointer-events: none;
// //           z-index: 2;
// //           animation: rotateArc 18s linear infinite;
// //         }
// //         @keyframes rotateArc {
// //           from { transform: translate(-55%, -48%) rotate(0deg); }
// //           to   { transform: translate(-55%, -48%) rotate(360deg); }
// //         }

// //         /* logo */
// //         .logo {
// //           position: absolute;
// //           top: 28px;
// //           left: 32px;
// //           z-index: 10;
// //           font-family: 'Cormorant Garamond', serif;
// //           font-size: 2.2rem;
// //           font-weight: 700;
// //           color: var(--white);
// //           letter-spacing: -1px;
// //           line-height: 1;
// //         }

// //         /* dot accent */
// //         .dot-accent {
// //           position: absolute;
// //           top: 110px;
// //           left: 120px;
// //           width: 12px;
// //           height: 12px;
// //           background: var(--white);
// //           border-radius: 50%;
// //           z-index: 10;
// //           animation: pulse 3s ease-in-out infinite;
// //         }
// //         @keyframes pulse {
// //           0%,100% { transform: scale(1); opacity: 1; }
// //           50% { transform: scale(1.4); opacity: 0.7; }
// //         }

// //         /* hero text */
// //         .hero-content {
// //           position: absolute;
// //           bottom: 120px;
// //           left: 32px;
// //           right: 24px;
// //           z-index: 10;
// //           opacity: 0;
// //           transform: translateY(24px);
// //           transition: opacity 0.9s ease, transform 0.9s ease;
// //         }
// //         .hero-content.visible {
// //           opacity: 1;
// //           transform: translateY(0);
// //         }

// //         .hero-title {
// //           font-family: 'Cormorant Garamond', serif;
// //           font-size: clamp(2.8rem, 5vw, 4rem);
// //           font-weight: 700;
// //           color: var(--white);
// //           line-height: 1.0;
// //           letter-spacing: 0.04em;
// //           text-transform: uppercase;
// //           margin-bottom: 18px;
// //           text-shadow: 0 2px 24px rgba(0,0,0,0.18);
// //         }

// //         .hero-title .sparkle-word {
// //           display: block;
// //           font-style: italic;
// //           font-weight: 300;
// //           letter-spacing: 0.08em;
// //         }

// //         .hero-body {
// //           font-family: 'Montserrat', sans-serif;
// //           font-size: 0.72rem;
// //           font-weight: 300;
// //           color: rgba(255,255,255,0.82);
// //           line-height: 1.7;
// //           max-width: 240px;
// //           letter-spacing: 0.02em;
// //         }

// //         /* contact us */
// //         .contact-us {
// //           position: absolute;
// //           bottom: 28px;
// //           left: 32px;
// //           z-index: 10;
// //           font-family: 'Montserrat', sans-serif;
// //           font-size: 0.6rem;
// //           font-weight: 600;
// //           letter-spacing: 0.22em;
// //           color: rgba(255,255,255,0.75);
// //           text-transform: uppercase;
// //           text-decoration: none;
// //           transition: color 0.2s;
// //         }
// //         .contact-us:hover { color: var(--white); }

// //         /* ── RIGHT PANEL ── */
// //         .right-panel {
// //           background: var(--cream);
// //           display: flex;
// //           flex-direction: column;
// //           justify-content: space-between;
// //           padding: 28px 56px 0 48px;
// //           position: relative;
// //         }

// //         /* hamburger */
// //         .hamburger {
// //           position: absolute;
// //           top: 28px;
// //           right: 28px;
// //           width: 52px;
// //           height: 52px;
// //           border-radius: 50%;
// //           border: 1.5px solid rgba(26,26,26,0.2);
// //           display: flex;
// //           flex-direction: column;
// //           align-items: center;
// //           justify-content: center;
// //           gap: 5px;
// //           cursor: pointer;
// //           transition: border-color 0.2s, background 0.2s;
// //           background: transparent;
// //           z-index: 10;
// //         }
// //         .hamburger:hover { background: var(--dark); border-color: var(--dark); }
// //         .hamburger:hover span { background: var(--white); }
// //         .hamburger span {
// //           display: block;
// //           width: 18px;
// //           height: 1.5px;
// //           background: var(--dark);
// //           border-radius: 2px;
// //           transition: background 0.2s;
// //         }
// //         .hamburger span:nth-child(2) { width: 13px; align-self: flex-start; margin-left: 14px; }

// //         /* top image strip */
// //         .top-images {
// //           display: flex;
// //           gap: 12px;
// //           margin-top: 4px;
// //           margin-bottom: 0;
// //         }

// //         .img-card {
// //           position: relative;
// //           overflow: hidden;
// //           border-radius: 2px;
// //         }
// //         .img-card:first-child {
// //           width: 130px;
// //           height: 130px;
// //         }
// //         .img-card:last-child {
// //           width: 220px;
// //           height: 275px;
// //         }

// //         .img-card img {
// //           width: 100%;
// //           height: 100%;
// //           object-fit: cover;
// //           display: block;
// //           transition: transform 0.6s ease;
// //         }
// //         .img-card:hover img { transform: scale(1.04); }

// //         .img-label {
// //           position: absolute;
// //           bottom: 10px;
// //           left: 10px;
// //           font-family: 'Montserrat', sans-serif;
// //           font-size: 0.55rem;
// //           font-weight: 600;
// //           letter-spacing: 0.18em;
// //           color: var(--white);
// //           text-transform: uppercase;
// //           background: rgba(0,0,0,0.4);
// //           padding: 3px 7px;
// //           border-radius: 1px;
// //           backdrop-filter: blur(4px);
// //         }

// //         /* mid content */
// //         .mid-content {
// //           padding: 36px 0 0;
// //           flex: 1;
// //           display: flex;
// //           flex-direction: column;
// //           justify-content: center;
// //         }

// //         .star-icon {
// //           font-size: 2rem;
// //           color: var(--gold);
// //           line-height: 1;
// //           margin-bottom: 14px;
// //           display: block;
// //           animation: spinStar 8s linear infinite;
// //           width: fit-content;
// //         }
// //         @keyframes spinStar {
// //           from { transform: rotate(0deg); }
// //           to   { transform: rotate(360deg); }
// //         }

// //         .even-the {
// //           font-family: 'Montserrat', sans-serif;
// //           font-size: 0.72rem;
// //           font-weight: 600;
// //           letter-spacing: 0.22em;
// //           color: var(--dark);
// //           text-transform: uppercase;
// //           margin-bottom: 12px;
// //         }

// //         .tagline {
// //           font-family: 'Cormorant Garamond', serif;
// //           font-size: clamp(2.2rem, 4vw, 3.2rem);
// //           font-weight: 700;
// //           line-height: 1.05;
// //           color: var(--dark);
// //           text-transform: uppercase;
// //           letter-spacing: 0.01em;
// //           max-width: 440px;
// //         }

// //         .tagline .underline-gold {
// //           display: inline;
// //           position: relative;
// //         }
// //         .tagline .underline-gold::after {
// //           content: '';
// //           position: absolute;
// //           bottom: -3px;
// //           left: 0;
// //           right: 0;
// //           height: 2px;
// //           background: var(--gold);
// //           border-radius: 2px;
// //         }

// //         .tagline .gold-outline {
// //           -webkit-text-stroke: 1.5px var(--dark);
// //           color: transparent;
// //           font-style: italic;
// //         }

// //         /* social sidebar */
// //         .social-sidebar {
// //           position: absolute;
// //           right: 0;
// //           top: 50%;
// //           transform: translateY(-50%);
// //           display: flex;
// //           flex-direction: column;
// //           gap: 32px;
// //           z-index: 10;
// //         }

// //         .social-link {
// //           font-family: 'Montserrat', sans-serif;
// //           font-size: 0.52rem;
// //           font-weight: 600;
// //           letter-spacing: 0.22em;
// //           color: var(--gray-mid);
// //           text-transform: uppercase;
// //           text-decoration: none;
// //           writing-mode: vertical-rl;
// //           transform: rotate(180deg);
// //           transition: color 0.2s;
// //         }
// //         .social-link:hover { color: var(--dark); }

// //         /* bottom bar */
// //         .bottom-bar {
// //           display: grid;
// //           grid-template-columns: 1fr 1fr 1fr;
// //           align-items: center;
// //           margin-top: auto;
// //           border-top: 1px solid rgba(26,26,26,0.1);
// //           margin-left: -48px;
// //           margin-right: -56px;
// //         }

// //         .bottom-btn {
// //           padding: 22px 32px;
// //           font-family: 'Montserrat', sans-serif;
// //           font-size: 0.6rem;
// //           font-weight: 600;
// //           letter-spacing: 0.22em;
// //           text-transform: uppercase;
// //           text-decoration: none;
// //           color: var(--dark);
// //           transition: background 0.2s, color 0.2s;
// //           border: none;
// //           background: transparent;
// //           cursor: pointer;
// //           text-align: center;
// //         }
// //         .bottom-btn:hover { background: rgba(26,26,26,0.04); }
// //         .bottom-btn.discover {
// //           background: var(--dark);
// //           color: var(--white);
// //           letter-spacing: 0.28em;
// //         }
// //         .bottom-btn.discover:hover { background: #333; }

// //         .bottom-divider {
// //           width: 1px;
// //           height: 24px;
// //           background: rgba(26,26,26,0.15);
// //           justify-self: center;
// //         }

// //         /* responsive */
// //         @media (max-width: 860px) {
// //           .page-wrapper { grid-template-columns: 1fr; min-height: auto; }
// //           .left-panel { height: 60vh; }
// //           .right-panel { padding: 24px; }
// //           .social-sidebar { display: none; }
// //           .tagline { font-size: 2rem; }
// //         }
// //       `}</style>

// //       <div className="page-wrapper">

// //         {/* ── LEFT PANEL ── */}
// //         <div className="left-panel">
// //           {/* placeholder gradient bg as hero image */}
// //           <div style={{
// //             position:"absolute", inset:0,
// //             background:"linear-gradient(160deg,#b5c4b1 0%,#8a9e85 40%,#4a5e47 100%)"
// //           }}/>
// //           <div className="hero-overlay"/>

// //           {/* animated arc */}
// //           <svg className="arc-svg" viewBox="0 0 420 420" fill="none">
// //             <circle cx="210" cy="210" r="195" stroke="rgba(255,255,255,0.22)" strokeWidth="1"/>
// //             <circle cx="210" cy="210" r="195"
// //               stroke="rgba(255,255,255,0.7)"
// //               strokeWidth="1"
// //               strokeDasharray="60 1160"
// //               strokeLinecap="round"
// //             />
// //           </svg>

// //           <div className="logo">k</div>
// //           <div className="dot-accent"/>

// //           <div className="hero-content">
// //             <h1 className="hero-title">
// //               Make U
// //               <span className="sparkle-word">Sparkle</span>
// //             </h1>
// //             <p className="hero-body">
// //               Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat.
// //             </p>
// //           </div>

// //           <a className="contact-us" href="#">Contact Us</a>
// //         </div>

// //         {/* ── RIGHT PANEL ── */}
// //         <div className="right-panel">

// //           {/* hamburger */}
// //           <div className="hamburger" role="button" aria-label="Menu">
// //             <span/><span/><span/>
// //           </div>

// //           {/* top images */}
// //           <div className="top-images">
// //             <div className="img-card">
// //               {/* placeholder small image */}
// //               <div style={{
// //                 width:"130px", height:"130px",
// //                 background:"linear-gradient(135deg,#2a2a2a 0%,#4a3728 100%)",
// //                 display:"flex", alignItems:"center", justifyContent:"center"
// //               }}>
// //                 <span style={{color:"rgba(255,255,255,0.4)",fontSize:"2rem"}}>✦</span>
// //               </div>
// //               <span className="img-label">Gold Earrings</span>
// //             </div>
// //             <div className="img-card">
// //               {/* placeholder large image */}
// //               <div style={{
// //                 width:"220px", height:"275px",
// //                 background:"linear-gradient(160deg,#1a3a2a 0%,#0d2218 100%)",
// //                 display:"flex", alignItems:"center", justifyContent:"center"
// //               }}>
// //                 <span style={{color:"rgba(255,255,255,0.3)",fontSize:"3rem"}}>✦</span>
// //               </div>
// //               <span className="img-label">New Collection</span>
// //             </div>
// //           </div>

// //           {/* mid content */}
// //           <div className="mid-content">
// //             <span className="star-icon">✦</span>
// //             <p className="even-the">Even The</p>
// //             <h2 className="tagline">
// //               Tiniest Piece<br/>
// //               Of Jewelry Tells<br/>
// //               A{" "}
// //               <span className="underline-gold">
// //                 <span className="gold-outline">Great Story</span>
// //               </span>
// //             </h2>
// //           </div>

// //           {/* social sidebar */}
// //           <div className="social-sidebar">
// //             <a className="social-link" href="#">Instagram</a>
// //             <a className="social-link" href="#">Facebook</a>
// //             <a className="social-link" href="#">Twitter</a>
// //           </div>

// //           {/* bottom bar */}
// //           <div className="bottom-bar">
// //             <a className="bottom-btn" href="#">About Us</a>
// //             <div className="bottom-divider"/>
// //             <a className="bottom-btn discover" href="#">Discover</a>
// //           </div>

// //         </div>
// //       </div>
// //     </main>
// //   );
// // }


// "use client";
// import Image from "next/image";
// import { useEffect, useRef } from "react";

// export default function Hero() {
//   const headingRef = useRef<HTMLHeadingElement>(null);

//   useEffect(() => {
//     const el = headingRef.current;
//     if (!el) return;
//     el.style.opacity = "0";
//     requestAnimationFrame(() => {
//       el.style.transition = "opacity 1.4s ease 0.1s";
//       el.style.opacity = "1";
//     });
//   }, []);

//   return (
//     <>
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500&family=Montserrat:wght@300;400;500;600&display=swap');

//         .hero-root {
//           position: relative;
//           width: 100%;
//           height: 100svh;
//           min-height: 620px;
//           overflow: hidden;
//           background: #0d2614;
//           display: flex;
//           align-items: stretch;
//         }

//         .hero-bg-overlay {
//           position: absolute;
//           inset: 0;
//           background:
//             radial-gradient(ellipse 70% 80% at 60% 50%, rgba(30, 80, 40, 0.55) 0%, transparent 70%),
//             radial-gradient(ellipse 50% 60% at 20% 80%, rgba(10, 25, 12, 0.85) 0%, transparent 60%),
//             linear-gradient(160deg, #0a1c0d 0%, #1a4424 40%, #1e5228 65%, #0d2614 100%);
//           z-index: 1;
//         }

//         .hero-grain {
//           position: absolute;
//           inset: 0;
//           z-index: 2;
//           opacity: 0.045;
//           background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
//           background-size: 200px 200px;
//           pointer-events: none;
//         }

//         .hero-circle {
//           position: absolute;
//           border-radius: 50%;
//           border: 1px solid rgba(201, 168, 76, 0.11);
//           pointer-events: none;
//           z-index: 2;
//           top: 50%;
//           left: 50%;
//           transform: translate(-50%, -50%);
//         }
//         .hero-circle-1 { width: 520px; height: 520px; animation: ringPulse 6s ease-in-out infinite; }
//         .hero-circle-2 { width: 740px; height: 740px; opacity: 0.6; animation: ringPulse 6s ease-in-out 1.5s infinite; }
//         .hero-circle-3 { width: 960px; height: 960px; opacity: 0.3; animation: ringPulse 6s ease-in-out 3s infinite; }

//         .hero-particle {
//           position: absolute;
//           width: 4px;
//           height: 4px;
//           border-radius: 50%;
//           background: #c9a84c;
//           z-index: 4;
//           pointer-events: none;
//           opacity: 0;
//         }
//         .hero-particle-1 { top: 22%; left: 12%; animation: floatDot 7s ease-in-out 0.2s infinite; }
//         .hero-particle-2 { top: 38%; right: 14%; width: 3px; height: 3px; animation: floatDot 9s ease-in-out 1.1s infinite; }
//         .hero-particle-3 { top: 68%; left: 18%; width: 3px; height: 3px; animation: floatDot 8s ease-in-out 0.7s infinite; }
//         .hero-particle-4 { top: 55%; right: 9%; animation: floatDot 10s ease-in-out 2s infinite; }
//         .hero-particle-5 { top: 15%; right: 22%; width: 2px; height: 2px; animation: floatDot 6.5s ease-in-out 1.8s infinite; }

//         .hero-model-wrap {
//           position: absolute;
//           bottom: 0;
//           left: 55%;
//           transform: translateX(-50%);
//           height: 96%;
//           aspect-ratio: 3 / 4;
//           z-index: 3;
//           display: flex;
//           align-items: flex-end;
//         }
//         .hero-model-img {
//           object-fit: cover;
//           object-position: top center;
//           width: 100%;
//           height: 100%;
//           -webkit-mask-image: linear-gradient(to bottom, black 55%, transparent 100%);
//           mask-image: linear-gradient(to bottom, black 55%, transparent 100%);
//         }

//         .hero-heading {
//           font-family: 'Cormorant Garamond', serif;
//           font-weight: 700;
//           font-size: clamp(3.8rem, 10vw, 9.5rem);
//           line-height: 0.88;
//           letter-spacing: -0.01em;
//           color: rgba(255, 255, 255, 0.13);
//           position: absolute;
//           top: 8%;
//           left: 30%;
//           transform: translate(-50%);
//           width: 95%;
//           text-align: center;
//           z-index: 2;
//           pointer-events: none;
//           user-select: none;
//           gap: 0.1em;
//           display: flex;
// flex-direction: column;
// align-items: center;
//         }
//           .hero-heading .line1 {
//   font-weight: 400;         /* lighter */
//   color: rgba(255,255,255,0.13);
// }

// .hero-heading .line2 {
//   font-weight: 700;         /* bolder */
//   color: #c9a84c;
//   text-shadow: 0 0 18px rgba(201,168,76,0.25);
// }
//         .hero-content-right {
//           position: absolute;
//           top: 50%;
//           right: 6%;
//           transform: translateY(-40%);
//           z-index: 5;
//           max-width: 260px;
//           animation: fadeUp 1s ease 0.9s both;
//           display: flex;
//           flex-direction: column;
//           align-items: flex-start;
//           gap: 20px;
//         }
//         .hero-tagline {
//           font-family: 'Cormorant Garamond', serif;
//           font-size: clamp(1.3rem, 2.4vw, 2rem);
//           font-weight: 400;
//           font-style: italic;
//           color: rgba(255, 255, 255, 0.82);
//           line-height: 1.38;
//           margin: 0;
//         }
//         .hero-tagline em {
//           font-style: normal;
//           color: #c9a84c;
//         }

//         .hero-divider {
//           display: flex;
//           align-items: center;
//           gap: 10px;
//           width: 100%;
//         }
//         .hero-divider-line {
//           flex: 1;
//           height: 1px;
//           background: linear-gradient(to right, transparent, rgba(201,168,76,0.55), transparent);
//         }
//         .hero-divider-gem {
//           color: #c9a84c;
//           font-size: 0.55rem;
//           flex-shrink: 0;
//           opacity: 0.85;
//         }

//         .hero-cta {
//           font-family: 'Montserrat', sans-serif;
//           font-size: 0.58rem;
//           font-weight: 600;
//           letter-spacing: 0.26em;
//           text-transform: uppercase;
//           color: #c9a84c;
//           background: transparent;
//           border: 1px solid rgba(201,168,76,0.5);
//           padding: 12px 24px;
//           border-radius: 1px;
//           cursor: pointer;
//           text-decoration: none;
//           display: inline-block;
//           position: relative;
//           overflow: hidden;
//           transition: color 0.35s ease;
//           z-index: 0;
//         }
//         .hero-cta::before {
//           content: '';
//           position: absolute;
//           inset: 0;
//           background: #c9a84c;
//           transform: translateX(-101%);
//           transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
//           z-index: -1;
//         }
//         .hero-cta:hover { color: #0d2614; }
//         .hero-cta:hover::before { transform: translateX(0); }

//         .hero-star {
//           position: absolute;
//           color: #c9a84c;
//           z-index: 5;
//           font-size: 1.4rem;
//           animation: spinStar 12s linear infinite;
//           pointer-events: none;
//         }
//         .hero-star-1 { right: 7%; bottom: 28%; }
//         .hero-star-2 { left: 3.5%; top: 28%; font-size: 0.9rem; animation-direction: reverse; }

//         .hero-scroll {
//           position: absolute;
//           bottom: 36px;
//           left: 50%;
//           transform: translateX(-50%);
//           z-index: 5;
//           display: flex;
//           flex-direction: column;
//           align-items: center;
//           gap: 8px;
//           animation: fadeUp 1s ease 1.3s both;
//         }
//         .hero-scroll-line {
//           width: 1px;
//           height: 40px;
//           background: linear-gradient(to bottom, rgba(201,168,76,0.6), transparent);
//           animation: scrollPulse 2s ease-in-out infinite;
//         }
//         .hero-scroll-label {
//           font-family: 'Montserrat', sans-serif;
//           font-size: 0.45rem;
//           letter-spacing: 0.3em;
//           text-transform: uppercase;
//           color: rgba(255,255,255,0.35);
//           writing-mode: vertical-rl;
//           text-orientation: mixed;
//           transform: rotate(180deg);
//         }

//         @keyframes fadeUp {
//           from { opacity: 0; transform: translateY(20px); }
//           to   { opacity: 1; transform: translateY(0); }
//         }
//         @keyframes spinStar {
//           from { transform: rotate(0deg) scale(1); }
//           50%  { transform: rotate(180deg) scale(1.15); }
//           to   { transform: rotate(360deg) scale(1); }
//         }
//         @keyframes scrollPulse {
//           0%, 100% { opacity: 0.4; }
//           50%       { opacity: 1; }
//         }
//         @keyframes ringPulse {
//           0%, 100% { opacity: 0.4; transform: translate(-50%, -50%) scale(1); }
//           50%       { opacity: 0.9; transform: translate(-50%, -50%) scale(1.015); }
//         }
//         @keyframes floatDot {
//           0%   { opacity: 0; transform: translateY(0px); }
//           15%  { opacity: 0.7; }
//           50%  { opacity: 0.5; transform: translateY(-18px); }
//           85%  { opacity: 0.7; }
//           100% { opacity: 0; transform: translateY(0px); }
//         }

//         @media (max-width: 1024px) {
//           .hero-content-right { right: 4%; max-width: 210px; }
//         }

//         @media (max-width: 640px) {
//           .hero-model-wrap { height: 85%; width: 100%; }
//           .hero-content-right {
//             top: auto;
//             bottom: 10%;
//             right: 50%;
//             transform: translateX(50%);
//             max-width: 220px;
//             align-items: center;
//             text-align: center;
//           }
//           .hero-tagline { font-size: 1.15rem; }
//           .hero-star-1 { right: 5%; bottom: 22%; }
//           .hero-scroll { display: none; }
//           .hero-circle-1 { width: 320px; height: 320px; }
//           .hero-circle-2 { width: 460px; height: 460px; }
//           .hero-circle-3 { width: 600px; height: 600px; }
//           .hero-particle-3, .hero-particle-4 { display: none; }
//         }
//       `}</style>

//       <section className="hero-root">
//         <div className="hero-bg-overlay" />
//         <div className="hero-grain" />

//         <div className="hero-circle hero-circle-1" />
//         <div className="hero-circle hero-circle-2" />
//         <div className="hero-circle hero-circle-3" />

//         <div className="hero-particle hero-particle-1" />
//         <div className="hero-particle hero-particle-2" />
//         <div className="hero-particle hero-particle-3" />
//         <div className="hero-particle hero-particle-4" />
//         <div className="hero-particle hero-particle-5" />

//         <h1 className="hero-heading" ref={headingRef}>
//   <span className="line1">MAKE YOU</span>
//   <span className="line2">SPARKLE</span>
// </h1>

//         <div className="hero-model-wrap">
//           <Image
//             src="/trial.png"
//             alt="Model wearing jewellery"
//             fill
//             priority
//             sizes="(max-width: 640px) 100vw, (max-width: 1024px) 70vw, 55vw"
//             className="hero-model-img"
//           />
//         </div>

//         <span className="hero-star hero-star-1" aria-hidden="true">✦</span>
//         <span className="hero-star hero-star-2" aria-hidden="true">✦</span>

//         <div className="hero-content-right">
//           <p className="hero-tagline">
//             Even The Tiniest Piece<br />
//             Of Jewelry Tells<br />
//             <em>A Great Story</em>
//           </p>
//           <div className="hero-divider">
//             <div className="hero-divider-line" />
//             <span className="hero-divider-gem">◆</span>
//             <div className="hero-divider-line" />
//           </div>
//           <a href="/shop" className="hero-cta">Shop Collection</a>
//         </div>

//         <div className="hero-scroll" aria-hidden="true">
//           <div className="hero-scroll-line" />
//           <span className="hero-scroll-label">Scroll</span>
//         </div>
//       </section>
//     </>
//   );
// }


"use client";
import Image from "next/image";
import { useEffect, useRef } from "react";

export default function Hero() {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = headingRef.current;
    if (!el) return;
    el.style.opacity = "0";
    requestAnimationFrame(() => {
      el.style.transition = "opacity 1.4s ease 0.1s";
      el.style.opacity = "1";
    });
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500&family=Montserrat:wght@300;400;500;600&display=swap');

        .hero-root {
          position: relative;
          width: 100%;
          height: 100svh;
          min-height: 620px;
          overflow: hidden;
          background: #0d2614;
          display: flex;
          align-items: stretch;
        }

        .hero-bg-overlay {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 70% 80% at 60% 50%, rgba(30, 80, 40, 0.55) 0%, transparent 70%),
            radial-gradient(ellipse 50% 60% at 20% 80%, rgba(10, 25, 12, 0.85) 0%, transparent 60%),
            linear-gradient(160deg, #0a1c0d 0%, #1a4424 40%, #1e5228 65%, #0d2614 100%);
          z-index: 1;
        }

        .hero-grain {
          position: absolute;
          inset: 0;
          z-index: 2;
          opacity: 0.045;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          background-size: 200px 200px;
          pointer-events: none;
        }

        /* ── CIRCLES ── */
        .hero-circle {
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgba(201, 168, 76, 0.11);
          pointer-events: none;
          z-index: 2;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
        .hero-circle-1 { width: 520px; height: 520px; animation: ringPulse 6s ease-in-out infinite; }
        .hero-circle-2 { width: 740px; height: 740px; opacity: 0.6; animation: ringPulse 6s ease-in-out 1.5s infinite; }
        .hero-circle-3 { width: 960px; height: 960px; opacity: 0.3; animation: ringPulse 6s ease-in-out 3s infinite; }

        /* ── PARTICLES ── */
        .hero-particle {
          position: absolute;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #c9a84c;
          z-index: 4;
          pointer-events: none;
          opacity: 0;
        }
        .hero-particle-1 { top: 22%; left: 12%; animation: floatDot 7s ease-in-out 0.2s infinite; }
        .hero-particle-2 { top: 38%; right: 14%; width: 3px; height: 3px; animation: floatDot 9s ease-in-out 1.1s infinite; }
        .hero-particle-3 { top: 68%; left: 18%; width: 3px; height: 3px; animation: floatDot 8s ease-in-out 0.7s infinite; }
        .hero-particle-4 { top: 55%; right: 9%; animation: floatDot 10s ease-in-out 2s infinite; }
        .hero-particle-5 { top: 15%; right: 22%; width: 2px; height: 2px; animation: floatDot 6.5s ease-in-out 1.8s infinite; }

        /* ── MODEL ── */
        .hero-model-wrap {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          height: 96%;
          aspect-ratio: 3 / 4;
          z-index: 3;
          display: flex;
          align-items: flex-end;
        }
        .hero-model-img {
          object-fit: cover;
          object-position: top center;
          width: 100%;
          height: 100%;
          -webkit-mask-image: linear-gradient(to bottom, black 55%, transparent 100%);
          mask-image: linear-gradient(to bottom, black 55%, transparent 100%);
        }

        /* ── LARGE HEADING ── */
        .hero-heading {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 700;
          font-size: clamp(3.8rem, 10vw, 9.5rem);
          line-height: 0.88;
          letter-spacing: -0.01em;
          color: rgba(255, 255, 255, 0.13);
          position: absolute;
          top: 20%;
          left: 30%;
          transform: translate(-50%);
          width: 95%;
          text-align: center;
          z-index: 2;
          pointer-events: none;
          user-select: none;
          gap: 0.1em;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .hero-heading .line1 {
          font-weight: 400;
          color: rgba(255,255,255,0.13);
        }
        .hero-heading .line2 {
          font-weight: 700;
          color: #c9a84c;
          text-shadow: 0 0 18px rgba(201,168,76,0.25);
        }

        /* ── RIGHT CONTENT ── */
        .hero-content-right {
          position: absolute;
          top: 50%;
          right: 6%;
          transform: translateY(-40%);
          z-index: 5;
          max-width: 260px;
          animation: fadeUp 1s ease 0.9s both;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 20px;
        }
        .hero-tagline {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(1.3rem, 2.4vw, 2rem);
          font-weight: 400;
          font-style: italic;
          color: rgba(255, 255, 255, 0.82);
          line-height: 1.38;
          margin: 0;
        }
        .hero-tagline em {
          font-style: normal;
          color: #c9a84c;
        }

        .hero-divider {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
        }
        .hero-divider-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(201,168,76,0.55), transparent);
        }
        .hero-divider-gem {
          color: #c9a84c;
          font-size: 0.55rem;
          flex-shrink: 0;
          opacity: 0.85;
        }

        .hero-cta {
          font-family: 'Montserrat', sans-serif;
          font-size: 0.58rem;
          font-weight: 600;
          letter-spacing: 0.26em;
          text-transform: uppercase;
          color: #c9a84c;
          background: transparent;
          border: 1px solid rgba(201,168,76,0.5);
          padding: 12px 24px;
          border-radius: 1px;
          cursor: pointer;
          text-decoration: none;
          display: inline-block;
          position: relative;
          overflow: hidden;
          transition: color 0.35s ease;
          z-index: 0;
        }
        .hero-cta::before {
          content: '';
          position: absolute;
          inset: 0;
          background: #c9a84c;
          transform: translateX(-101%);
          transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: -1;
        }
        .hero-cta:hover { color: #0d2614; }
        .hero-cta:hover::before { transform: translateX(0); }

        /* ── STARS ── */
        .hero-star {
          position: absolute;
          color: #c9a84c;
          z-index: 5;
          font-size: 1.4rem;
          animation: spinStar 12s linear infinite;
          pointer-events: none;
        }
        .hero-star-1 { right: 7%; bottom: 28%; }
        .hero-star-2 { left: 3.5%; top: 28%; font-size: 0.9rem; animation-direction: reverse; }

        /* ── SCROLL INDICATOR ── */
        .hero-scroll {
          position: absolute;
          bottom: 36px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 5;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          animation: fadeUp 1s ease 1.3s both;
        }
        .hero-scroll-line {
          width: 1px;
          height: 40px;
          background: linear-gradient(to bottom, rgba(201,168,76,0.6), transparent);
          animation: scrollPulse 2s ease-in-out infinite;
        }
        .hero-scroll-label {
          font-family: 'Montserrat', sans-serif;
          font-size: 0.45rem;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.35);
          writing-mode: vertical-rl;
          text-orientation: mixed;
          transform: rotate(180deg);
        }

        /* ── KEYFRAMES ── */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spinStar {
          from { transform: rotate(0deg) scale(1); }
          50%  { transform: rotate(180deg) scale(1.15); }
          to   { transform: rotate(360deg) scale(1); }
        }
        @keyframes scrollPulse {
          0%, 100% { opacity: 0.4; }
          50%       { opacity: 1; }
        }
        @keyframes ringPulse {
          0%, 100% { opacity: 0.4; transform: translate(-50%, -50%) scale(1); }
          50%       { opacity: 0.9; transform: translate(-50%, -50%) scale(1.015); }
        }
        @keyframes floatDot {
          0%   { opacity: 0; transform: translateY(0px); }
          15%  { opacity: 0.7; }
          50%  { opacity: 0.5; transform: translateY(-18px); }
          85%  { opacity: 0.7; }
          100% { opacity: 0; transform: translateY(0px); }
        }

        /* ════════════════════════════════
           LAPTOP  ≤ 1280px
        ════════════════════════════════ */
        @media (max-width: 1280px) {
          .hero-model-wrap {
            height: 92%;
            left: 48%;
          }
          .hero-content-right {
            right: 4%;
            max-width: 230px;
            gap: 16px;
          }
          .hero-heading {
            left: 28%;
            font-size: clamp(3.2rem, 8.5vw, 8rem);
          }
          .hero-circle-1 { width: 420px; height: 420px; }
          .hero-circle-2 { width: 600px; height: 600px; }
          .hero-circle-3 { width: 780px; height: 780px; }
        }

        /* ════════════════════════════════
           TABLET  ≤ 1024px
        ════════════════════════════════ */
        @media (max-width: 1024px) {
          .hero-root { min-height: 700px; }

          /* heading: centred, pushed up */
          .hero-heading {
            left: 50%;
            transform: translateX(-50%);
            top: 10%;
            width: 100%;
            font-size: clamp(3rem, 9vw, 6rem);
          }

          /* model: centred, slightly narrower */
          .hero-model-wrap {
            left: 50%;
            transform: translateX(-50%);
            height: 82%;
            width: 56%;
            aspect-ratio: unset;
          }

          /* content panel: bottom-left, horizontal layout */
          .hero-content-right {
            top: auto;
            bottom: 6%;
            left: 5%;
            right: auto;
            transform: none;
            max-width: 340px;
            gap: 14px;
            align-items: flex-start;
            animation: fadeUp 1s ease 0.9s both;
          }

          .hero-tagline {
            font-size: clamp(1.1rem, 2.2vw, 1.5rem);
          }

          .hero-star-1 { right: 5%; bottom: 12%; }
          .hero-star-2 { left: 3%; top: 20%; }

          .hero-circle-1 { width: 360px; height: 360px; }
          .hero-circle-2 { width: 520px; height: 520px; }
          .hero-circle-3 { width: 680px; height: 680px; }

          /* hide some particles on tablet */
          .hero-particle-3 { display: none; }
          .hero-particle-4 { display: none; }
        }

        /* ════════════════════════════════
           TABLET PORTRAIT  ≤ 768px
        ════════════════════════════════ */
        @media (max-width: 768px) {
          .hero-root { min-height: 660px; }

          .hero-heading {
            top: 12%;
            font-size: clamp(2.8rem, 10vw, 5rem);
          }

          .hero-model-wrap {
            height: 78%;
            width: 70%;
          }

          .hero-content-right {
            bottom: 5%;
            left: 4%;
            max-width: 300px;
            gap: 12px;
          }

          .hero-tagline {
            font-size: clamp(1rem, 3vw, 1.3rem);
          }

          .hero-star-1 { right: 4%; bottom: 10%; font-size: 1.1rem; }
          .hero-star-2 { display: none; }

          .hero-scroll { display: none; }

          .hero-circle-1 { width: 300px; height: 300px; }
          .hero-circle-2 { width: 440px; height: 440px; }
          .hero-circle-3 { width: 580px; height: 580px; }

          .hero-particle-5 { display: none; }
        }

        /* ════════════════════════════════
           MOBILE  ≤ 640px
        ════════════════════════════════ */
        @media (max-width: 640px) {
          .hero-root {
            min-height: 100svh;
            height: 100svh;
          }

          /* heading sits at the very top, full-width, smaller */
          .hero-heading {
            top: 12%;
            left: 50%;
            transform: translateX(-50%);
            width: 100%;
            font-size: clamp(2.4rem, 12vw, 3.6rem);
            text-align: center;
          }

          /* model: full-width, tall, fade at feet */
          .hero-model-wrap {
            left: 50%;
            transform: translateX(-50%);
            height: 80%;
            width: 100%;
            aspect-ratio: unset;
          }
          .hero-model-img {
            object-position: top center;
            -webkit-mask-image: linear-gradient(to bottom, black 50%, transparent 100%);
            mask-image: linear-gradient(to bottom, black 50%, transparent 100%);
          }

          /* content: centred, above the fold bottom */
          .hero-content-right {
            top: auto;
            bottom: 5%;
            left: 50%;
            right: auto;
            transform: translateX(-50%);
            max-width: 260px;
            align-items: center;
            text-align: center;
            gap: 12px;
          }

          .hero-tagline {
            font-size: clamp(1rem, 4.5vw, 1.2rem);
          }

          .hero-cta {
            font-size: 0.55rem;
            padding: 11px 22px;
          }

          .hero-star-1 { display: none; }
          .hero-star-2 { display: none; }
          .hero-scroll { display: none; }

          .hero-circle-1 { width: 240px; height: 240px; }
          .hero-circle-2 { width: 360px; height: 360px; }
          .hero-circle-3 { width: 480px; height: 480px; }

          .hero-particle-1, .hero-particle-2,
          .hero-particle-3, .hero-particle-4,
          .hero-particle-5 { display: none; }
        }

        /* ════════════════════════════════
           SMALL MOBILE  ≤ 390px
        ════════════════════════════════ */
        @media (max-width: 390px) {
          .hero-heading {
            font-size: clamp(2rem, 13vw, 3rem);
            top: 6%;
          }
          .hero-content-right {
            bottom: 4%;
            max-width: 230px;
            gap: 10px;
          }
          .hero-tagline {
            font-size: 0.95rem;
          }
        }
      `}</style>

      <section className="hero-root">
        <div className="hero-bg-overlay" />
        <div className="hero-grain" />

        <div className="hero-circle hero-circle-1" />
        <div className="hero-circle hero-circle-2" />
        <div className="hero-circle hero-circle-3" />

        <div className="hero-particle hero-particle-1" />
        <div className="hero-particle hero-particle-2" />
        <div className="hero-particle hero-particle-3" />
        <div className="hero-particle hero-particle-4" />
        <div className="hero-particle hero-particle-5" />

        <h1 className="hero-heading" ref={headingRef}>
          <span className="line1">MAKE YOU</span>
          <span className="line2">SPARKLE</span>
        </h1>

        <div className="hero-model-wrap">
          <Image
            src="/trial.png"
            alt="Model wearing jewellery"
            fill
            priority
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 70vw, (max-width: 1024px) 56vw, 55vw"
            className="hero-model-img"
          />
        </div>

        <span className="hero-star hero-star-1" aria-hidden="true">✦</span>
        <span className="hero-star hero-star-2" aria-hidden="true">✦</span>

        <div className="hero-content-right">
          <p className="hero-tagline">
            Even The Tiniest Piece<br />
            Of Jewelry Tells<br />
            <em>A Great Story</em>
          </p>
          <div className="hero-divider">
            <div className="hero-divider-line" />
            <span className="hero-divider-gem">◆</span>
            <div className="hero-divider-line" />
          </div>
          <a href="/shop" className="hero-cta">Shop Collection</a>
        </div>

        <div className="hero-scroll" aria-hidden="true">
          <div className="hero-scroll-line" />
          <span className="hero-scroll-label">Scroll</span>
        </div>
      </section>
    </>
  );
}