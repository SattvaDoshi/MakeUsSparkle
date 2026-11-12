"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { fetchPromoBanners } from "@/lib/catalogApi";
import { safeHref } from "@/lib/safeUrl";
import CarouselArrows from "@/components/ui/CarouselArrows";
import { useGender } from "@/lib/genderContext";
import styles from "./PromoSection.module.css";

/**
 * "What's Hot Right Now" — promo banner carousel.
 *
 * Scroll-snap track (native swipe on touch, arrows + counter on desktop), large
 * rounded cards with the tag on the image and title / subtitle / CTA below.
 * Gentle autoplay that stops on hover, focus, touch, hidden tab, off-screen and
 * reduced-motion. Banners come from the admin (GET /banners); if there are none
 * the section hides itself instead of showing placeholder content.
 */

type ApiBanner = {
  _id: string;
  text?: string;
  title?: string;
  subtitle?: string;
  tag?: string;
  cta?: string;
  link?: string;
  image?: string;
  imageAlt?: string;
  isActive?: boolean;
};

interface Slide {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  image: string;
  alt: string;
}

const AUTOPLAY_MS = 5000;
const INTERACTION_PAUSE_MS = 10000;
// Banners saved in the admin sometimes carry absolute URLs to a deploy or to
// localhost; treat those hosts as "this site" so the click stays in-app.
const OWN_HOSTS = new Set(["localhost", "127.0.0.1", "makeyousparkle.in", "www.makeyousparkle.in", "make-us-sparkle.vercel.app"]);

function normalizeHref(raw?: string): string {
  const href = (raw || "").trim();
  if (!href) return "";
  if (/^https?:\/\//i.test(href)) {
    try {
      const u = new URL(href);
      if (OWN_HOSTS.has(u.hostname)) return `${u.pathname}${u.search}${u.hash}` || "/";
    } catch {
      return "";
    }
  }
  return href;
}

const toSlide = (b: ApiBanner): Slide => {
  const title = (b.title || b.text || "").trim();
  return {
    id: b._id,
    tag: (b.tag || "").trim(),
    title,
    subtitle: (b.subtitle || "").trim(),
    cta: (b.cta || "Shop now").trim(),
    href: safeHref(normalizeHref(b.link)),
    image: (b.image || "").trim(),
    alt: (b.imageAlt || title).trim(),
  };
};

function CardLink({ href, className, label, style, children }: {
  href: string; className: string; label: string; style?: React.CSSProperties; children: React.ReactNode;
}) {
  if (!href) return <div className={className} style={style} aria-label={label}>{children}</div>;
  if (/^https?:\/\//i.test(href)) {
    return <a href={href} className={className} style={style} aria-label={label}>{children}</a>;
  }
  return <Link href={href} className={className} style={style} aria-label={label}>{children}</Link>;
}

export default function PromoSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const hoverRef = useRef(false);
  const pausedUntil = useRef(0);
  const inViewRef = useRef(false);

  const { gender } = useGender();
  const [slides, setSlides] = useState<Slide[] | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [active, setActive] = useState(0);

  /* Load banners */
  useEffect(() => {
    let live = true;
    fetchPromoBanners(gender)
      .then((rows: ApiBanner[]) => {
        if (!live) return;
        setSlides((rows || []).filter((r) => r && r.isActive !== false).map(toSlide).filter((s) => s.image));
      })
      .catch(() => live && setSlides([]));
    return () => { live = false; };
  }, [gender]);

  /* Reveal on first view; remember whether we're on screen for autoplay */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = entry.isIntersecting;
        if (entry.isIntersecting) setRevealed(true);
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [slides]);

  /* Card step (card width + gap) */
  const step = useCallback(() => {
    const track = trackRef.current;
    const first = track?.firstElementChild as HTMLElement | null;
    if (!track || !first) return 0;
    const gap = parseFloat(getComputedStyle(track).columnGap || "0") || 0;
    return first.offsetWidth + gap;
  }, []);

  /* Which card is current (drives counter + dots) */
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const s = step();
        if (!s) return;
        const count = track.children.length;
        const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
        setActive(atEnd ? count - 1 : Math.min(count - 1, Math.round(track.scrollLeft / s)));
      });
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => { cancelAnimationFrame(raf); track.removeEventListener("scroll", onScroll); };
  }, [slides, step]);

  const goTo = useCallback((i: number) => {
    trackRef.current?.scrollTo({ left: i * step(), behavior: "smooth" });
  }, [step]);

  /* Autoplay */
  useEffect(() => {
    if (!slides || slides.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      const track = trackRef.current;
      if (!track || document.hidden || !inViewRef.current || hoverRef.current) return;
      if (Date.now() < pausedUntil.current) return;
      if (track.scrollWidth <= track.clientWidth + 4) return; // everything already fits
      const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
      track.scrollTo({ left: atEnd ? 0 : track.scrollLeft + step(), behavior: "smooth" });
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [slides, step]);

  const holdAutoplay = () => { pausedUntil.current = Date.now() + INTERACTION_PAUSE_MS; };

  if (slides && slides.length === 0) return null;

  const count = slides?.length ?? 0;
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <section
      ref={sectionRef}
      data-home-section="hot"
      className={`${styles.section}${revealed ? ` ${styles.in}` : ""}`}
      aria-roledescription="carousel"
      aria-label="What's hot right now"
    >
      <div className={styles.inner}>
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <span className={styles.eyebrow}>Handpicked for you</span>
            <h2 className={styles.title}>What&apos;s <em>Hot</em> Right Now</h2>
          </div>

          {count > 1 && (
            <div className={styles.controls}>
              <span className={styles.counter} aria-hidden="true">
                <b>{pad(active + 1)}</b> / {pad(count)}
              </span>
              <CarouselArrows targetRef={trackRef} label="banner" />
            </div>
          )}
        </div>

        <div
          className={styles.trackWrap}
          onMouseEnter={() => { hoverRef.current = true; }}
          onMouseLeave={() => { hoverRef.current = false; }}
          onFocusCapture={() => { hoverRef.current = true; }}
          onBlurCapture={() => { hoverRef.current = false; }}
          onPointerDown={holdAutoplay}
          onWheel={holdAutoplay}
        >
          <div className={styles.track} ref={trackRef}>
            {slides === null
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className={styles.skel} aria-hidden="true">
                    <div className={styles.skelImg} />
                    <div className={styles.skelLine} style={{ width: "60%" }} />
                    <div className={styles.skelLine} style={{ width: "85%" }} />
                  </div>
                ))
              : slides.map((s, i) => (
                  <CardLink
                    key={s.id}
                    href={s.href}
                    className={styles.card}
                    style={{ ["--i" as string]: i } as React.CSSProperties}
                    label={`${s.title}${s.cta ? ` — ${s.cta}` : ""}`}
                  >
                    <div className={styles.media}>
                      <Image
                        src={s.image}
                        alt={s.alt}
                        fill
                        sizes="(max-width: 639px) 84vw, (max-width: 1023px) 64vw, 560px"
                        className={styles.img}
                        quality={80}
                      />
                      {s.tag && <span className={styles.chip}>{s.tag}</span>}
                      <span className={styles.go} aria-hidden="true">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="7" y1="17" x2="17" y2="7" /><polyline points="8 7 17 7 17 16" />
                        </svg>
                      </span>
                    </div>

                    <div className={styles.caption}>
                      <h3 className={styles.cardTitle}>{s.title}</h3>
                      {s.subtitle && <p className={styles.sub}>{s.subtitle}</p>}
                      {s.cta && <span className={styles.cta}>{s.cta}</span>}
                    </div>
                  </CardLink>
                ))}
          </div>
        </div>

        {count > 1 && (
          <div className={styles.dots} role="tablist" aria-label="Choose banner">
            {slides!.map((s, i) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={i === active}
                aria-label={`Go to banner ${i + 1}`}
                className={`${styles.dot}${i === active ? ` ${styles.dotOn}` : ""}`}
                onClick={() => { holdAutoplay(); goTo(i); }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
