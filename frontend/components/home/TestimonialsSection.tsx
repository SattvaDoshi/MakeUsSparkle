'use client';

import { useState } from 'react';

interface Testimonial {
  id: number;
  name: string;
  location: string;
  rating: number;
  text: string;
  product: string;
  initials: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Priya Sharma',
    location: 'Mumbai',
    rating: 5,
    text: 'The necklace I ordered was even more beautiful in person. The packaging was so luxurious — I gifted it to my sister and she absolutely loved it. Will definitely be ordering again!',
    product: 'Bloom Necklace',
    initials: 'PS',
  },
  {
    id: 2,
    name: 'Aanya Kapoor',
    location: 'Delhi',
    rating: 5,
    text: 'I ordered a custom charm bracelet and the quality is exceptional. The charm selection process was fun and the photos on the website matched the real product perfectly.',
    product: 'Custom Charm Bracelet',
    initials: 'AK',
  },
  {
    id: 3,
    name: 'Sneha Raut',
    location: 'Pune',
    rating: 5,
    text: "Fast delivery, gorgeous packaging, and the earrings are stunning. The gift box I ordered for my friend's birthday made her cry happy tears. 10/10 experience!",
    product: 'Stellar Earrings Gift Set',
    initials: 'SR',
  },
  {
    id: 4,
    name: 'Meera Iyer',
    location: 'Bangalore',
    rating: 5,
    text: "The curated combo was worth every rupee. The pieces complement each other so well and the quality is fantastic. I've been getting compliments every day!",
    product: 'Curated Jewellery Combo',
    initials: 'MI',
  },
];

const styles = `
  .ts-section {
    background: #8bb87db5;
    padding: var(--section-padding, 4rem) 0;
    overflow: hidden;
  }

  .ts-inner {
    max-width: 900px;
    margin: 0 auto;
    padding: 0 clamp(1rem, 4vw, 4rem);
  }

  .ts-header {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: clamp(2rem, 5vw, 4rem);
  }

  .ts-eyebrow {
    font-family: var(--font-body, sans-serif);
    font-size: 0.7rem;
    letter-spacing: 0.35em;
    text-transform: uppercase;
    color: var(--olive-light, #6b7c4a);
  }

  .ts-title {
    font-family: var(--font-display, Georgia, serif);
    font-size: clamp(2rem, 5vw, 3.5rem);
    font-weight: 400;
    color: var(--olive-darkest, #1e2d0e);
  }

  .ts-divider {
    width: 40px;
    height: 1px;
    background: var(--gold, #b8960c);
  }

  /* Main testimonial box */
  .ts-main {
    background: var(--olive-fog, #f0f3ea);
    border: 1.5px solid #1a4a1a;
    border-left: 3px solid #1a4a1a;
    padding: clamp(2rem, 5vw, 4rem);
    position: relative;
    margin-bottom: 2rem;
    border-radius: 2px;
    box-shadow: 0 2px 16px 0 rgba(26, 74, 26, 0.10);
  }

  .ts-quote-symbol {
    position: absolute;
    top: -0.5rem;
    left: 2rem;
    font-family: var(--font-display, Georgia, serif);
    font-size: 8rem;
    color: var(--gold, #b8960c);
    opacity: 0.15;
    line-height: 1;
    pointer-events: none;
  }

  .ts-quote-text {
    font-family: var(--font-display, Georgia, serif);
    font-size: clamp(1.1rem, 2.5vw, 1.5rem);
    font-weight: 400;
    font-style: italic;
    color: var(--olive-darkest, #1e2d0e);
    line-height: 1.6;
    margin-bottom: 2rem;
    position: relative;
    z-index: 1;
  }

  .ts-quote-footer {
    display: flex;
    align-items: center;
    gap: 1.25rem;
  }

  .ts-avatar {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background: #2d5a1b;
    color: var(--gold-pale, #f5e9b8);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-body, sans-serif);
    font-size: 0.85rem;
    font-weight: 600;
    letter-spacing: 0.05em;
    flex-shrink: 0;
    border: 2px solid #1a4a1a;
  }

  .ts-quote-name {
    font-family: var(--font-body, sans-serif);
    font-size: 0.95rem;
    font-weight: 700;
    color: #1a4a1a;
    background: #d4e8d0;
    display: inline-block;
    padding: 0.1rem 0.55rem;
    border-radius: 3px;
    letter-spacing: 0.02em;
  }

  .ts-quote-meta {
    font-family: var(--font-body, sans-serif);
    font-size: 0.75rem;
    color: var(--warm-gray, #7a7060);
    margin-top: 0.3rem;
  }

  .ts-stars {
    display: flex;
    gap: 2px;
    margin-top: 0.3rem;
  }

  .ts-star {
    color: var(--gold, #b8960c);
    font-size: 0.85rem;
  }

  /* Thumbnails */
  .ts-thumbs {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    margin-bottom: 1.5rem;
  }

  .ts-thumb {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    background: transparent;
    border: 1px solid #1a4a1a;
    cursor: pointer;
    transition: all 0.2s ease;
    flex: 1;
    min-width: 150px;
    border-radius: 2px;
  }

  .ts-thumb:hover,
  .ts-thumb-active {
    border-color: #1a4a1a;
    background: var(--olive-fog, #f0f3ea);
    box-shadow: 0 2px 8px rgba(26, 74, 26, 0.12);
  }

  .ts-thumb-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--olive-muted, #7a9c5a);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-body, sans-serif);
    font-size: 0.7rem;
    font-weight: 600;
    flex-shrink: 0;
  }

  .ts-thumb-active .ts-thumb-avatar {
    background: #2d5a1b;
  }

  .ts-thumb-info {
    text-align: left;
  }

  .ts-thumb-name {
    display: block;
    font-family: var(--font-body, sans-serif);
    font-size: 0.8rem;
    font-weight: 600;
    color: #1a4a1a;
  }

  .ts-thumb-loc {
    font-family: var(--font-body, sans-serif);
    font-size: 0.7rem;
    color: var(--warm-gray, #7a7060);
  }

  /* Dots */
  .ts-dots {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
  }

  .ts-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--light-gray, #d0cfc8);
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
    padding: 0;
  }

  .ts-dot-active {
    background: #1a4a1a;
    transform: scale(1.3);
  }

  /* Tablet */
  @media (max-width: 768px) {
    .ts-thumbs { gap: 0.75rem; }
    .ts-thumb {
      min-width: calc(50% - 0.75rem);
      flex: 1 1 calc(50% - 0.75rem);
    }
  }

  /* Mobile */
  @media (max-width: 480px) {
    .ts-thumbs {
      gap: 0.5rem;
    }
    .ts-thumb {
      min-width: calc(50% - 0.25rem);
      flex: 1 1 calc(50% - 0.25rem);
      padding: 0.5rem 0.6rem;
      gap: 0.5rem;
    }
    .ts-thumb-avatar {
      width: 28px;
      height: 28px;
      font-size: 0.6rem;
    }
    .ts-thumb-name {
      font-size: 0.72rem;
    }
    .ts-thumb-loc {
      font-size: 0.62rem;
    }
    .ts-quote-footer {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.75rem;
    }
    .ts-title { font-size: clamp(1.5rem, 8vw, 2.5rem); }
  }
`;

export default function TestimonialsSection() {
  const [active, setActive] = useState<number>(0);
  const current = testimonials[active];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      <section className="ts-section">
        <div className="ts-inner">
          {/* Header */}
          <div className="ts-header">
            <span className="ts-eyebrow">Real Stories</span>
            <h2 className="ts-title">What Our Customers Say</h2>
            <div className="ts-divider" />
          </div>

          {/* Main testimonial */}
          <div className="ts-main">
            <div className="ts-quote-symbol" aria-hidden="true">&ldquo;</div>
            <p className="ts-quote-text">{current.text}</p>
            <div className="ts-quote-footer">
              <div className="ts-avatar" aria-label={`Avatar for ${current.name}`}>
                {current.initials}
              </div>
              <div>
                <div className="ts-quote-name">{current.name}</div>
                <div className="ts-quote-meta">
                  {current.location} &middot; {current.product}
                </div>
                <div className="ts-stars" aria-label={`${current.rating} out of 5 stars`}>
                  {Array.from({ length: current.rating }).map((_, i) => (
                    <span key={i} className="ts-star" aria-hidden="true">★</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Thumbnails */}
          <div className="ts-thumbs" role="list">
            {testimonials.map((t, i) => (
              <button
                key={t.id}
                role="listitem"
                className={`ts-thumb${i === active ? ' ts-thumb-active' : ''}`}
                onClick={() => setActive(i)}
                aria-pressed={i === active}
                aria-label={`View testimonial from ${t.name}`}
              >
                <span className="ts-thumb-avatar" aria-hidden="true">
                  {t.initials}
                </span>
                <div className="ts-thumb-info">
                  <span className="ts-thumb-name">{t.name}</span>
                  <span className="ts-thumb-loc">{t.location}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Navigation dots */}
          <div className="ts-dots" role="tablist" aria-label="Testimonial navigation">
            {testimonials.map((_, i) => (
              <button
                key={i}
                role="tab"
                aria-selected={i === active}
                className={`ts-dot${i === active ? ' ts-dot-active' : ''}`}
                onClick={() => setActive(i)}
                aria-label={`Testimonial ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}