"use client";

import { useRef, useState } from "react";

const products = [
  {
    id: 1,
    name: "Linen Tote Bag",
    price: "$48",
    tag: "Just In",
    image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&q=80",
  },
  {
    id: 2,
    name: "Ceramic Planter",
    price: "$35",
    tag: "New",
    image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400&q=80",
  },
  {
    id: 3,
    name: "Woven Throw Blanket",
    price: "$89",
    tag: "Trending",
    image: "https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?w=400&q=80",
  },
  {
    id: 4,
    name: "Soy Candle Set",
    price: "$42",
    tag: "Just In",
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&q=80",
  },
  {
    id: 5,
    name: "Rattan Side Table",
    price: "$124",
    tag: "New",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80",
  },
  {
    id: 6,
    name: "Handmade Soap Bar",
    price: "$18",
    tag: "Just In",
    image: "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=400&q=80",
  },
  {
    id: 7,
    name: "Bamboo Cutlery Set",
    price: "$27",
    tag: "Eco Pick",
    image: "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=400&q=80",
  },
  {
    id: 8,
    name: "Dried Flower Wreath",
    price: "$56",
    tag: "New",
    image: "https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=400&q=80",
  },
];

export default function NewArrivals() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: dir === "right" ? 320 : -320,
      behavior: "smooth",
    });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .na-section {
          background-color: #f5f0e8;
          padding: 64px 0 80px;
          font-family: 'DM Sans', sans-serif;
          overflow: hidden;
        }

        .na-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 32px;
        }

        .na-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 40px;
          gap: 16px;
          flex-wrap: wrap;
        }

        .na-title-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .na-eyebrow {
          font-size: 11px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #3d6b4f;
          font-weight: 500;
        }

        .na-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(36px, 5vw, 56px);
          font-weight: 600;
          color: #1a1a14;
          line-height: 1;
          letter-spacing: -0.01em;
        }

        .na-title em {
          font-style: italic;
          color: #3d6b4f;
        }

        .na-nav {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .na-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 1.5px solid #3d6b4f;
          background: transparent;
          color: #3d6b4f;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          font-size: 18px;
          line-height: 1;
        }

        .na-btn:hover {
          background: #3d6b4f;
          color: #f5f0e8;
        }

        .na-view-all {
          font-size: 13px;
          font-weight: 500;
          color: #3d6b4f;
          text-decoration: none;
          letter-spacing: 0.04em;
          border-bottom: 1px solid #3d6b4f;
          padding-bottom: 1px;
          transition: opacity 0.2s;
        }
        .na-view-all:hover { opacity: 0.6; }

        .na-track-wrapper {
          position: relative;
        }

        .na-track {
          display: flex;
          gap: 20px;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
          padding-bottom: 12px;
          scrollbar-width: none;
        }
        .na-track::-webkit-scrollbar { display: none; }

        .na-card {
          flex: 0 0 260px;
          scroll-snap-align: start;
          background: #faf7f2;
          border-radius: 16px;
          overflow: hidden;
          cursor: pointer;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          position: relative;
        }

        .na-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 48px rgba(61,107,79,0.15);
        }

        .na-card-img-wrap {
          overflow: hidden;
          position: relative;
        }

        .na-card-img {
          width: 100%;
          height: 280px;
          object-fit: cover;
          display: block;
          transition: transform 0.5s ease;
        }

        .na-card:hover .na-card-img {
          transform: scale(1.04);
        }

        .na-card-tag {
          position: absolute;
          top: 14px;
          left: 14px;
          background: #3d6b4f;
          color: #f5f0e8;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 5px 10px;
          border-radius: 20px;
          z-index: 2;
        }

        .na-card-wish {
          position: absolute;
          top: 12px;
          right: 14px;
          background: rgba(245,240,232,0.85);
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
          backdrop-filter: blur(4px);
          transition: transform 0.2s;
          z-index: 2;
        }
        .na-card-wish:hover { transform: scale(1.15); }

        .na-card-body {
          padding: 18px 18px 20px;
        }

        .na-card-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 19px;
          font-weight: 600;
          color: #1a1a14;
          margin-bottom: 10px;
          line-height: 1.2;
        }

        .na-card-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .na-card-price {
          font-size: 15px;
          font-weight: 500;
          color: #3d6b4f;
        }

        .na-card-add {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #1a1a14;
          background: none;
          border: 1px solid #c8b99a;
          padding: 7px 14px;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .na-card-add:hover {
          background: #1a1a14;
          color: #f5f0e8;
          border-color: #1a1a14;
        }

        .na-track-wrapper::after {
          content: '';
          position: absolute;
          right: 0;
          top: 0;
          bottom: 12px;
          width: 80px;
          background: linear-gradient(to left, #f5f0e8 10%, transparent);
          pointer-events: none;
        }

        @media (max-width: 1024px) {
          .na-card { flex: 0 0 240px; }
        }

        @media (max-width: 768px) {
          .na-section { padding: 48px 0 64px; }
          .na-inner { padding: 0 20px; }
          .na-header { margin-bottom: 28px; }
          .na-view-all { display: none; }
          .na-card { flex: 0 0 210px; }
          .na-card-img { height: 220px; }
          .na-track { gap: 14px; }
        }

        @media (max-width: 480px) {
          .na-inner { padding: 0 16px; }
          .na-card { flex: 0 0 175px; }
          .na-card-img { height: 185px; }
          .na-card-name { font-size: 16px; }
          .na-card-add { font-size: 10px; padding: 5px 10px; }
          .na-btn { width: 38px; height: 38px; font-size: 15px; }
        }
      `}</style>

      <section className="na-section">
        <div className="na-inner">
          <div className="na-header">
            <div className="na-title-group">
              <span className="na-eyebrow">— Fresh off the shelf</span>
              <h2 className="na-title">
                New <em>Arrivals</em>
              </h2>
            </div>
           
          </div>

          <div className="na-track-wrapper">
            <div className="na-track" ref={scrollRef}>
              {products.map((p) => (
                <div
                  key={p.id}
                  className="na-card"
                  onMouseEnter={() => setHoveredId(p.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <div className="na-card-img-wrap">
                    <span className="na-card-tag">{p.tag}</span>
                    <button className="na-card-wish" aria-label="Wishlist">
                      {hoveredId === p.id ? "♥" : "♡"}
                    </button>
                    <img
                      src={p.image}
                      alt={p.name}
                      className="na-card-img"
                      loading="lazy"
                    />
                  </div>
                  <div className="na-card-body">
                    <div className="na-card-name">{p.name}</div>
                    <div className="na-card-bottom">
                      <span className="na-card-price">{p.price}</span>
                      <button className="na-card-add">Add to cart</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}