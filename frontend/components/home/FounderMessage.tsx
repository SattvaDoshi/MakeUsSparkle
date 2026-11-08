"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { safeHref } from "@/lib/safeUrl";
import { cdnImage, fetchFounderMessage, type FounderMessage as Founder } from "@/lib/siteContentApi";
import { useNearViewport } from "./useNearViewport";
import styles from "./FounderMessage.module.css";

/**
 * "Message from the founder" — an admin-managed, edge-to-edge banner image.
 * Fetched only when it's about to scroll into view; hidden entirely when switched off
 * or when no image has been uploaded.
 */
export default function FounderMessage() {
  const [ref, near] = useNearViewport<HTMLDivElement>();
  const [founder, setFounder] = useState<Founder | null>(null);

  useEffect(() => {
    if (!near) return;
    let live = true;
    fetchFounderMessage().then((f) => live && setFounder(f)).catch(() => {});
    return () => { live = false; };
  }, [near]);

  if (!founder || !founder.isActive || !founder.desktopImage) return <div ref={ref} aria-hidden="true" />;

  const d = founder.desktopImage;
  const m = founder.mobileImage;
  const style = {
    ["--ar-d" as string]: founder.desktopWidth && founder.desktopHeight ? `${founder.desktopWidth} / ${founder.desktopHeight}` : undefined,
    ["--ar-m" as string]: m && founder.mobileWidth && founder.mobileHeight ? `${founder.mobileWidth} / ${founder.mobileHeight}` : undefined,
  } as React.CSSProperties;

  const picture = (
    <picture className={styles.pic}>
      {m && <source media="(max-width: 767px)" srcSet={`${cdnImage(m, 640)} 640w, ${cdnImage(m, 960)} 960w`} sizes="100vw" />}
      <img
        className={styles.img}
        src={cdnImage(d, 1600)}
        srcSet={`${cdnImage(d, 960)} 960w, ${cdnImage(d, 1600)} 1600w, ${cdnImage(d, 2400)} 2400w`}
        sizes="100vw"
        alt={founder.alt}
        loading="lazy"
        decoding="async"
        width={founder.desktopWidth || undefined}
        height={founder.desktopHeight || undefined}
      />
    </picture>
  );

  const href = safeHref(founder.link);
  return (
    <section className={styles.section} data-home-section="founder" aria-label="A message from our founder" style={style}>
      {href ? (
        /^https?:\/\//i.test(href)
          ? <a className={styles.link} href={href}>{picture}</a>
          : <Link className={styles.link} href={href}>{picture}</Link>
      ) : picture}
    </section>
  );
}
