'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import Footer from '@/components/home/Footer';

const sections = [
  {
    gender: 'Women',
    slug: 'women',
    intro: 'Crafted for the woman who wears her story',
    categories: [
      { name: 'Jewellery', icon: '✦', slug: 'jewellery', sub: ['Necklaces', 'Earrings', 'Rings', 'Bracelets', 'Waist Chains', 'Couple Jewellery'] },
      { name: 'Gift Boxes', icon: '◻', slug: 'gift-boxes', sub: [] },
      { name: 'Fan Combos', icon: '★', slug: 'fan-combos', sub: [] },
      { name: 'Custom Charm Jewellery', icon: '❋', slug: 'custom-charm', sub: [] },
      { name: 'Hair Accessories', icon: '◌', slug: 'hair-accessories', sub: [] },
      { name: 'Keychains & Phone Charms', icon: '⌘', slug: 'keychains', sub: [] },
      { name: 'Curated Combos', icon: '⬡', slug: 'curated-combos', sub: [] },
    ],
  },
  {
    gender: 'Men',
    slug: 'men',
    intro: 'Bold essentials for the modern man',
    categories: [
      { name: 'Jewellery', icon: '✦', slug: 'jewellery', sub: ['Necklaces', 'Earrings', 'Rings', 'Bracelets', 'Waist Chains', 'Couple Jewellery'] },
      { name: 'Gift Boxes', icon: '◻', slug: 'gift-boxes', sub: [] },
      { name: 'Fan Combos', icon: '★', slug: 'fan-combos', sub: [] },
      { name: 'Custom Charm Jewellery', icon: '❋', slug: 'custom-charm', sub: [] },
      { name: 'Keychains & Phone Charms', icon: '⌘', slug: 'keychains', sub: [] },
      { name: 'Curated Combos', icon: '⬡', slug: 'curated-combos', sub: [] },
    ],
  },
];

export default function CategoriesPage() {
  const [activeGender, setActiveGender] = useState<'women' | 'men'>('women');

  const section = sections.find(s => s.slug === activeGender)!;

  return (
    <main>
      {/* Hero */}
      <div className={styles.hero}>
        <span className={styles.heroEyebrow}>Browse</span>
        <h1 className={styles.heroTitle}>Categories</h1>
        <div className={styles.heroDivider} />
      </div>

      {/* Gender tabs */}
      <div className={styles.tabs}>
        {sections.map(s => (
          <button
            key={s.slug}
            className={`${styles.tab} ${activeGender === s.slug ? styles.tabActive : ''}`}
            onClick={() => setActiveGender(s.slug as 'women' | 'men')}
          >
            {s.gender}
          </button>
        ))}
      </div>

      {/* Category grid */}
      <div className={styles.container}>
        <p className={styles.intro}>{section.intro}</p>
        <div className={styles.grid}>
          {section.categories.map(cat => (
            <div key={cat.slug} className={styles.catGroup}>
              <Link href={`/categories/${activeGender}/${cat.slug}`} className={styles.catCard}>
                <div className={styles.catImg}>
                  <span className={styles.catIcon}>{cat.icon}</span>
                </div>
                <div className={styles.catInfo}>
                  <h2 className={styles.catName}>{cat.name}</h2>
                  {cat.sub.length > 0 && (
                    <p className={styles.catSub}>{cat.sub.slice(0, 3).join(' · ')}{cat.sub.length > 3 ? ` +${cat.sub.length - 3} more` : ''}</p>
                  )}
                  <span className={styles.catCta}>Shop Now →</span>
                </div>
              </Link>

              {cat.sub.length > 0 && (
                <div className={styles.subRow}>
                  {cat.sub.map(sub => (
                    <Link
                      key={sub}
                      href={`/categories/${activeGender}/${cat.slug}/${sub.toLowerCase().replace(/ /g, '-')}`}
                      className={styles.subChip}
                    >
                      {sub}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </main>
  );
}