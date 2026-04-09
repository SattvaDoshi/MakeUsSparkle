  "use client";
  import { useState, useRef, useEffect } from "react";
  import { useRouter } from "next/navigation";

  const styles = [
    {
      id: 1,
      name: "Soft Girl",
      sub: "Minimal & Dainty",
      slug: "soft-girl",
      emoji: "🌸",
      desc: "Delicate pieces that whisper, never shout",
      tag: "Bestseller",
      pattern: "radial-gradient(ellipse at 20% 80%, rgba(201,169,110,0.18) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(255,236,210,0.15) 0%, transparent 55%)",
    },
    {
      id: 2,
      name: "Glam Look",
      sub: "Bold & Luminous",
      slug: "glam-look",
      emoji: "✨",
      desc: "Statement jewels for your most radiant moments",
      tag: "Trending",
      pattern: "radial-gradient(ellipse at 75% 25%, rgba(212,175,55,0.22) 0%, transparent 55%), radial-gradient(ellipse at 25% 75%, rgba(201,169,110,0.15) 0%, transparent 50%)",
    },
    {
      id: 3,
      name: "Island Girl",
      sub: "Free & Sun-Kissed",
      slug: "island-girl",
      emoji: "🌊",
      desc: "Effortless layers, salt air & golden skin",
      tag: "New",
      pattern: "radial-gradient(ellipse at 60% 80%, rgba(107,124,69,0.25) 0%, transparent 60%), radial-gradient(ellipse at 30% 20%, rgba(255,248,220,0.12) 0%, transparent 50%)",
    },
    {
      id: 4,
      name: "Office Jewellery",
      sub: "Refined & Polished",
      slug: "office-jewellery",
      emoji: "💼",
      desc: "Power dressing starts with the right accent",
      tag: "Essential",
      pattern: "radial-gradient(ellipse at 50% 0%, rgba(201,169,110,0.2) 0%, transparent 60%), radial-gradient(ellipse at 50% 100%, rgba(78,96,53,0.2) 0%, transparent 50%)",
    },
    {
      id: 5,
      name: "Maximalist",
      sub: "Bold & Fearless",
      slug: "maximalist",
      emoji: "👑",
      desc: "More is more — stack, layer, conquer",
      tag: "Fan Fav",
      pattern: "radial-gradient(ellipse at 0% 50%, rgba(212,175,55,0.2) 0%, transparent 60%), radial-gradient(ellipse at 100% 50%, rgba(201,169,110,0.18) 0%, transparent 55%)",
    },
    {
      id: 6,
      name: "Fairy Coded",
      sub: "Whimsical & Ethereal",
      slug: "fairy-coded",
      emoji: "🧚",
      desc: "Enchanted adornments from another realm",
      tag: "Magical",
      pattern: "radial-gradient(ellipse at 30% 30%, rgba(255,248,220,0.18) 0%, transparent 55%), radial-gradient(ellipse at 70% 70%, rgba(107,124,69,0.2) 0%, transparent 60%)",
    },
  ];

  export default function ShopByStyle() {
    const router = useRouter();
    const [visible, setVisible] = useState(false);
    const sectionRef = useRef(null);

    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setVisible(true); },
        { threshold: 0.08 }
      );
      if (sectionRef.current) observer.observe(sectionRef.current);
      return () => observer.disconnect();
    }, []);

    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Jost:wght@200;300;400;500&display=swap');

          .sbs-root {
            background: #141a0f;
            padding: 44px 36px 72px;
            position: relative;
            overflow: hidden;
            font-family: 'Jost', sans-serif;
          }

          /* Ambient background orbs */
          .sbs-orb {
            position: absolute;
            border-radius: 50%;
            pointer-events: none;
            z-index: 0;
          }
          .sbs-orb-1 {
            width: 500px; height: 500px;
            top: -180px; right: -120px;
            background: radial-gradient(circle, rgba(78,96,53,0.12) 0%, transparent 70%);
          }
          .sbs-orb-2 {
            width: 380px; height: 380px;
            bottom: -80px; left: -100px;
            background: radial-gradient(circle, rgba(212,175,55,0.07) 0%, transparent 70%);
          }
          .sbs-orb-3 {
            width: 260px; height: 260px;
            top: 50%; left: 50%;
            transform: translate(-50%, -50%);
            background: radial-gradient(circle, rgba(107,124,69,0.05) 0%, transparent 70%);
          }

          /* ── HEADER ── */
          .sbs-header {
            text-align: center;
            margin-bottom: 44px;
            position: relative;
            z-index: 2;
          }

          .sbs-eyebrow {
            font-size: 10px;
            font-weight: 300;
            letter-spacing: 6px;
            text-transform: uppercase;
            color: #c9a96e;
            margin-bottom: 10px;
            opacity: 0;
            transform: translateY(10px);
            transition: all 0.7s ease;
          }
          .sbs-eyebrow.on { opacity: 1; transform: translateY(0); }

          .sbs-title {
            font-family: 'Cormorant Garamond', serif;
            font-size: clamp(38px, 5.5vw, 66px);
            font-weight: 300;
            line-height: 1.05;
            color: #fdf6e9;
            margin: 0 0 14px;
            opacity: 0;
            transform: translateY(18px);
            transition: all 0.85s ease 0.15s;
          }
          .sbs-title.on { opacity: 1; transform: translateY(0); }
          .sbs-title em { font-style: italic; color: #d4af37; }

          .sbs-rule {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            opacity: 0;
            transition: opacity 0.8s ease 0.3s;
          }
          .sbs-rule.on { opacity: 1; }
          .sbs-rule-line {
            width: 55px; height: 1px;
            background: linear-gradient(90deg, transparent, #c9a96e);
          }
          .sbs-rule-line:last-child {
            background: linear-gradient(90deg, #c9a96e, transparent);
          }
          .sbs-rule-diamond {
            width: 5px; height: 5px;
            background: #d4af37;
            transform: rotate(45deg);
          }

          /* ── GRID ── */
          .sbs-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            max-width: 1060px;
            margin: 0 auto;
            position: relative;
            z-index: 2;
          }
          @media (max-width: 860px) {
            .sbs-grid { grid-template-columns: repeat(2, 1fr); }
          }
          @media (max-width: 540px) {
            .sbs-grid { grid-template-columns: 1fr; }
            .sbs-root { padding: 36px 20px 56px; }
          }

          /* ── CARD ── */
          .sbs-card {
            aspect-ratio: 1 / 1;
            border-radius: 3px;
            position: relative;
            overflow: hidden;
            cursor: pointer;
            border: 1px solid rgba(201,169,110,0.14);
            opacity: 0;
            transform: translateY(28px) scale(0.97);
            transition:
              opacity 0.6s ease,
              transform 0.6s ease,
              border-color 0.35s ease,
              box-shadow 0.35s ease;
            group: '';
          }
          .sbs-card.on { opacity: 1; transform: translateY(0) scale(1); }
          .sbs-card:hover {
            border-color: rgba(212,175,55,0.45);
            box-shadow:
              0 0 0 1px rgba(212,175,55,0.08),
              0 24px 64px rgba(0,0,0,0.55),
              0 0 50px rgba(201,169,110,0.07);
            transform: translateY(-5px) scale(1.015) !important;
          }

          /* card base */
          .card-base {
            position: absolute;
            inset: 0;
            background: #1e2817;
            transition: transform 0.55s ease;
          }
          .sbs-card:hover .card-base { transform: scale(1.04); }

          /* gradient layer */
          .card-grad {
            position: absolute;
            inset: 0;
            transition: opacity 0.4s ease;
          }
          .sbs-card:hover .card-grad { opacity: 1.5; }

          /* shimmer sweep */
          .card-shimmer {
            position: absolute;
            inset: 0;
            background: linear-gradient(
              115deg,
              transparent 35%,
              rgba(212,175,55,0.06) 50%,
              transparent 65%
            );
            transform: translateX(-100%);
            transition: transform 0s;
            z-index: 3;
          }
          .sbs-card:hover .card-shimmer {
            transform: translateX(100%);
            transition: transform 0.65s ease;
          }

          /* inner glow */
          .card-inner-glow {
            position: absolute;
            inset: 0;
            box-shadow: inset 0 0 70px rgba(212,175,55,0);
            transition: box-shadow 0.5s ease;
            z-index: 4;
            pointer-events: none;
            border-radius: 3px;
          }
          .sbs-card:hover .card-inner-glow {
            box-shadow: inset 0 0 70px rgba(212,175,55,0.05);
          }

          /* corner brackets */
          .card-corner {
            position: absolute;
            width: 16px; height: 16px;
            z-index: 6;
            opacity: 0;
            transition: opacity 0.4s ease;
          }
          .sbs-card:hover .card-corner { opacity: 1; }
          .cc-tl { top: 12px; left: 12px; border-top: 1px solid rgba(212,175,55,0.7); border-left: 1px solid rgba(212,175,55,0.7); }
          .cc-tr { top: 12px; right: 12px; border-top: 1px solid rgba(212,175,55,0.7); border-right: 1px solid rgba(212,175,55,0.7); }
          .cc-bl { bottom: 12px; left: 12px; border-bottom: 1px solid rgba(212,175,55,0.7); border-left: 1px solid rgba(212,175,55,0.7); }
          .cc-br { bottom: 12px; right: 12px; border-bottom: 1px solid rgba(212,175,55,0.7); border-right: 1px solid rgba(212,175,55,0.7); }

          /* large watermark emoji */
          .card-watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -58%);
            font-size: 100px;
            opacity: 0.05;
            pointer-events: none;
            z-index: 1;
            filter: blur(2px);
            transition: opacity 0.4s ease, transform 0.5s ease;
          }
          .sbs-card:hover .card-watermark {
            opacity: 0.1;
            transform: translate(-50%, -54%) scale(1.06);
          }

          /* badge */
          .card-badge {
            position: absolute;
            top: 16px;
            right: 16px;
            z-index: 7;
            font-size: 8.5px;
            font-weight: 400;
            letter-spacing: 2.5px;
            text-transform: uppercase;
            color: #141a0f;
            background: #c9a96e;
            padding: 4px 9px 3px;
            border-radius: 2px;
          }

          /* content panel */
          .card-content {
            position: absolute;
            inset: 0;
            z-index: 5;
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
            padding: 24px;
            background: linear-gradient(
              to top,
              rgba(12,16,8,0.94) 0%,
              rgba(12,16,8,0.52) 42%,
              transparent 100%
            );
            transition: background 0.4s ease;
          }
          .sbs-card:hover .card-content {
            background: linear-gradient(
              to top,
              rgba(12,16,8,0.97) 0%,
              rgba(12,16,8,0.68) 50%,
              rgba(12,16,8,0.08) 100%
            );
          }

          .card-emoji {
            font-size: 26px;
            display: block;
            margin-bottom: 9px;
            filter: drop-shadow(0 2px 6px rgba(0,0,0,0.6));
            transform: translateY(0) scale(1);
            transition: transform 0.4s ease;
          }
          .sbs-card:hover .card-emoji { transform: translateY(-3px) scale(1.12); }

          .card-name {
            font-family: 'Cormorant Garamond', serif;
            font-size: 24px;
            font-weight: 400;
            color: #fdf6e9;
            line-height: 1.1;
            margin-bottom: 2px;
          }

          .card-sub {
            font-size: 9.5px;
            font-weight: 300;
            letter-spacing: 3px;
            text-transform: uppercase;
            color: #c9a96e;
            margin-bottom: 0;
            transition: margin 0.35s ease;
          }
          .sbs-card:hover .card-sub { margin-bottom: 9px; }

          .card-desc {
            font-size: 12px;
            font-weight: 300;
            color: rgba(240,226,192,0.55);
            line-height: 1.6;
            max-height: 0;
            overflow: hidden;
            opacity: 0;
            transform: translateY(6px);
            transition: max-height 0.38s ease, opacity 0.35s ease, transform 0.35s ease, margin 0.35s ease;
            margin-bottom: 0;
          }
          .sbs-card:hover .card-desc {
            max-height: 60px;
            opacity: 1;
            transform: translateY(0);
            margin-bottom: 13px;
          }

          .card-cta {
            display: flex;
            align-items: center;
            gap: 7px;
            font-size: 9.5px;
            font-weight: 400;
            letter-spacing: 3px;
            text-transform: uppercase;
            color: #d4af37;
            opacity: 0;
            transform: translateY(5px);
            transition: opacity 0.3s ease 0.05s, transform 0.3s ease 0.05s;
          }
          .sbs-card:hover .card-cta { opacity: 1; transform: translateY(0); }
          .cta-dash {
            width: 18px; height: 1px;
            background: #d4af37;
            transition: width 0.35s ease;
          }
          .sbs-card:hover .cta-dash { width: 28px; }

          /* ── FOOTER ── */
          .sbs-foot {
            text-align: center;
            margin-top: 46px;
            position: relative;
            z-index: 2;
            opacity: 0;
            transition: opacity 0.8s ease 0.55s;
          }
          .sbs-foot.on { opacity: 1; }
          .sbs-foot p {
            font-family: 'Cormorant Garamond', serif;
            font-size: 16px;
            font-style: italic;
            font-weight: 300;
            color: rgba(240,226,192,0.38);
            letter-spacing: 0.5px;
          }
        `}</style>

        <section className="sbs-root" ref={sectionRef}>
          {/* Ambient orbs */}
          <div className="sbs-orb sbs-orb-1" />
          <div className="sbs-orb sbs-orb-2" />
          <div className="sbs-orb sbs-orb-3" />

          {/* Header */}
          <header className="sbs-header">
            <p className={`sbs-eyebrow ${visible ? "on" : ""}`}>Curated Collections</p>
            <h2 className={`sbs-title ${visible ? "on" : ""}`}>
              Shop by <em>Your</em> Style
            </h2>
            <div className={`sbs-rule ${visible ? "on" : ""}`}>
              <div className="sbs-rule-line" />
              <div className="sbs-rule-diamond" />
              <div className="sbs-rule-line" />
            </div>
          </header>

          {/* Grid */}
          <div className="sbs-grid">
            {styles.map((s, i) => (
              <div
    key={s.id}
    className={`sbs-card ${visible ? "on" : ""}`}
    style={{ transitionDelay: `${0.08 + i * 0.09}s` }}
    onClick={() => router.push(`/styles/${s.slug}`)}
  >
                {/* Layers */}
                <div className="card-base" />
                <div className="card-grad" style={{ background: s.pattern }} />
                <div className="card-watermark">{s.emoji}</div>
                <div className="card-shimmer" />
                <div className="card-inner-glow" />

                {/* Corner brackets */}
                <div className="card-corner cc-tl" />
                <div className="card-corner cc-tr" />
                <div className="card-corner cc-bl" />
                <div className="card-corner cc-br" />

                {/* Badge */}
                <span className="card-badge">{s.tag}</span>

                {/* Content */}
                <div className="card-content">
                  <span className="card-emoji">{s.emoji}</span>
                  <p className="card-name">{s.name}</p>
                  <p className="card-sub">{s.sub}</p>
                  <p className="card-desc">{s.desc}</p>
                  <div className="card-cta">
                    <span className="cta-dash" />
                    Explore
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <footer className={`sbs-foot ${visible ? "on" : ""}`}>
            <p>Every jewel tells a story — find yours</p>
          </footer>
        </section>
      </>
    );
  }  