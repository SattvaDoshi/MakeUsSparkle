'use client';

import { useState } from 'react';
import styles from './TestimonialsSection.module.css';

const testimonials = [
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
    text: 'Fast delivery, gorgeous packaging, and the earrings are stunning. The gift box I ordered for my friend\'s birthday made her cry happy tears. 10/10 experience!',
    product: 'Stellar Earrings Gift Set',
    initials: 'SR',
  },
  {
    id: 4,
    name: 'Meera Iyer',
    location: 'Bangalore',
    rating: 5,
    text: 'The curated combo was worth every rupee. The pieces complement each other so well and the quality is fantastic. I\'ve been getting compliments every day!',
    product: 'Curated Jewellery Combo',
    initials: 'MI',
  },
];

export default function TestimonialsSection() {
  const [active, setActive] = useState(0);

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        {/* Header */}
        <div className={styles.header}>
          <span className={styles.eyebrow}>Real Stories</span>
          <h2 className={styles.title}>What Our Customers Say</h2>
          <div className={styles.divider} />
        </div>

        {/* Main testimonial */}
        <div className={styles.mainTestimonial}>
          <div className={styles.quoteSymbol}>"</div>
          <p className={styles.quoteText}>{testimonials[active].text}</p>
          <div className={styles.quoteFooter}>
            <div className={styles.avatar}>
              {testimonials[active].initials}
            </div>
            <div>
              <div className={styles.quoteName}>{testimonials[active].name}</div>
              <div className={styles.quoteMeta}>
                {testimonials[active].location} · {testimonials[active].product}
              </div>
              <div className={styles.stars}>
                {Array.from({ length: testimonials[active].rating }).map((_, i) => (
                  <span key={i} className={styles.star}>★</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Thumbnails */}
        <div className={styles.thumbs}>
          {testimonials.map((t, i) => (
            <button
              key={t.id}
              className={`${styles.thumb} ${i === active ? styles.thumbActive : ''}`}
              onClick={() => setActive(i)}
            >
              <span className={styles.thumbAvatar}>{t.initials}</span>
              <div className={styles.thumbInfo}>
                <span className={styles.thumbName}>{t.name}</span>
                <span className={styles.thumbLoc}>{t.location}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Navigation dots */}
        <div className={styles.dots}>
          {testimonials.map((_, i) => (
            <button
              key={i}
              className={`${styles.dot} ${i === active ? styles.dotActive : ''}`}
              onClick={() => setActive(i)}
              aria-label={`Testimonial ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}