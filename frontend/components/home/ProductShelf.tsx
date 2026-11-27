"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import ProductCard from "@/components/product/ProductCard";
import CarouselArrows from "@/components/ui/CarouselArrows";
import { fetchCatalogProducts, fetchShelfSection, type CatalogProduct } from "@/lib/catalogApi";
import { useGender } from "@/lib/genderContext";
import { useNearViewport } from "./useNearViewport";
import { ProductRowSkeleton } from "./Skeletons";
import styles from "./ProductShelf.module.css";

/**
 * A product-card carousel for the homepage, filled from the catalog.
 * Each shelf ranks products differently so back-to-back rows don't repeat the same pieces:
 *  - "popular":  most-reviewed / best-rated
 *  - "gifts":    gift / combo / charm / box pieces
 *  - "deals":    biggest discount
 */
export type ShelfMode = "popular" | "gifts" | "deals";

const MIN_ITEMS = 4;
const MAX_ITEMS = 10;
const GIFTY = /gift|combo|hamper|charm|box|set\b|pair|couple/i;

const price = (p: CatalogProduct) => (p.discountedPrice ?? p.price) || 0;
const discountPct = (p: CatalogProduct) => {
  const was = p.originalPrice ?? 0;
  const now = price(p);
  return was > now && now > 0 ? (was - now) / was : 0;
};
const isGifty = (p: CatalogProduct) =>
  GIFTY.test([p.name, p.category, p.subCategory, p.type, p.subtype, ...(p.tags || [])].filter(Boolean).join(" "));
const inStock = (p: CatalogProduct) => (p.stock ?? 1) > 0;

function pick(all: CatalogProduct[], mode: ShelfMode, skip: Set<string>): CatalogProduct[] {
  const pool = all.filter((p) => inStock(p) && !skip.has(p.sourceId));
  let ranked: CatalogProduct[];
  if (mode === "gifts") {
    ranked = pool.filter(isGifty).sort((a, b) => discountPct(b) - discountPct(a) || b.rating - a.rating);
  } else if (mode === "deals") {
    ranked = pool.filter((p) => discountPct(p) > 0).sort((a, b) => discountPct(b) - discountPct(a) || b.rating - a.rating);
  } else {
    ranked = [...pool].sort((a, b) => b.reviewCount - a.reviewCount || b.rating - a.rating);
  }
  // Not enough in this lane? top up with the next-best products rather than leaving a short row.
  if (ranked.length < MIN_ITEMS) {
    const have = new Set(ranked.map((p) => p.sourceId));
    ranked = ranked.concat([...pool].filter((p) => !have.has(p.sourceId)).sort((a, b) => b.rating - a.rating));
  }
  return ranked.slice(0, MAX_ITEMS);
}

export default function ProductShelf({
  mode, eyebrow, title, em, href, linkLabel = "View all", tint = false,
}: {
  mode: ShelfMode;
  eyebrow: string;
  title: string;
  /** Italic green part of the title, e.g. title="Customer" em="favourites" */
  em?: string;
  href?: string;
  linkLabel?: string;
  tint?: boolean;
}) {
  const [ref, near] = useNearViewport<HTMLElement>();
  const { gender } = useGender();
  const trackRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<CatalogProduct[] | null>(null);
  const [heading, setHeading] = useState<{ eyebrow: string; title: string; customTitle: boolean; hidden: boolean }>({
    eyebrow,
    title: em ? `${title} ${em}` : title,
    customTitle: false,
    hidden: false,
  });

  useEffect(() => {
    if (!near) return;
    let alive = true;
    const defaultTitle = em ? `${title} ${em}` : title;
    Promise.all([
      fetchShelfSection(mode, gender).catch(() => null),
      fetchCatalogProducts(),
    ])
      .then(([section, all]) => {
        if (!alive) return;
        if (section && !section.isActive) {
          setHeading({ eyebrow: "", title: "", customTitle: false, hidden: true });
          setItems([]);
          return;
        }
        const nextEyebrow = section?.eyebrow !== undefined ? section.eyebrow : eyebrow;
        const nextTitle = section?.title || defaultTitle;
        setHeading({
          eyebrow: nextEyebrow,
          title: nextTitle,
          customTitle: Boolean(section?.title && section.title !== defaultTitle),
          hidden: false,
        });
        if (section && section.products.length > 0 && section.collectionType !== "auto") {
          setItems(section.products);
          return;
        }
        const g = String(gender || "").toLowerCase();
        const forGender = g ? all.filter((p) => !p.gender || p.gender === g || p.gender === "unisex") : all;
        setItems(pick(forGender, mode, new Set()));
      })
      .catch(() => alive && setItems([]));
    return () => { alive = false; };
  }, [near, gender, mode, eyebrow, title, em]);

  // Reserve the spot until we know, but disappear cleanly if hidden or nothing worth showing.
  if (heading.hidden) return null;
  if (items && items.length < MIN_ITEMS) return <section ref={ref} aria-hidden="true" />;

  return (
    <section ref={ref} className={`${styles.section}${tint ? ` ${styles.tint}` : ""}`} data-home-section="shelf" data-shelf={mode} aria-label={`${heading.eyebrow} ${heading.title}`}>
      {items === null ? (
        <ProductRowSkeleton count={5} />
      ) : (
        <div className={styles.inner}>
          <div className={styles.header}>
            <div className={styles.titleGroup}>
              {heading.eyebrow && <span className={styles.eyebrow}>{heading.eyebrow}</span>}
              <h2 className={styles.title}>
                {heading.customTitle ? heading.title : <>{title}{em ? <> <em>{em}</em></> : null}</>}
              </h2>
            </div>
            <div className={styles.headRight}>
              {href && <Link href={href} className={styles.viewAll}>{linkLabel}</Link>}
              <div className={styles.arrows}><CarouselArrows targetRef={trackRef} label="products" /></div>
            </div>
          </div>
          <div className={styles.wrap}>
            <div className={styles.track} ref={trackRef}>
              {items.map((p) => (
                <div key={p.sourceId} className={styles.slot}><ProductCard product={p} /></div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
