"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { fetchFaqs, type FaqItem, type FaqSettings } from "@/lib/siteContentApi";
import { useNearViewport } from "./useNearViewport";
import styles from "./FaqSection.module.css";

/** Admin-managed FAQ accordion (+ FAQPage structured data for search engines). Hidden when there are no active FAQs. */
export default function FaqSection() {
  const [ref, near] = useNearViewport<HTMLDivElement>();
  const [data, setData] = useState<{ settings: FaqSettings; faqs: FaqItem[] } | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const base = useId();

  useEffect(() => {
    if (!near) return;
    let live = true;
    fetchFaqs().then((d) => { if (live) { setData(d); setOpen(d.faqs[0]?._id ?? null); } }).catch(() => {});
    return () => { live = false; };
  }, [near]);

  if (!data || data.faqs.length === 0) return <div ref={ref} aria-hidden="true" />;
  const { settings, faqs } = data;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
  };

  return (
    <section className={styles.section} data-home-section="faq" aria-label="Frequently asked questions">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <div className={styles.inner}>
        <div className={styles.intro}>
          {settings.eyebrow && <span className={styles.eyebrow}>{settings.eyebrow}</span>}
          <h2 className={styles.title}>{settings.title}</h2>
          {settings.subtitle && <p className={styles.sub}>{settings.subtitle}</p>}
          <div className={styles.help}>
            <span className={styles.helpTitle}>Still have questions?</span>
            <span className={styles.helpText}>Our team is happy to help with orders, sizing and gifting.</span>
            <Link href="/contact" className={styles.helpLink}>Contact us</Link>
          </div>
        </div>

        <ul className={styles.list}>
          {faqs.map((f) => {
            const isOpen = open === f._id;
            const pid = `${base}-p-${f._id}`;
            return (
              <li key={f._id} className={`${styles.item}${isOpen ? ` ${styles.open}` : ""}`}>
                <h3 style={{ margin: 0 }}>
                  <button type="button" className={styles.q} aria-expanded={isOpen} aria-controls={pid} onClick={() => setOpen(isOpen ? null : f._id)}>
                    <span className={styles.text}>{f.question}</span>
                    <span className={styles.icon} aria-hidden="true">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    </span>
                  </button>
                </h3>
                <div id={pid} role="region" className={styles.panel}>
                  <div className={styles.panelInner}><p className={styles.answer}>{f.answer}</p></div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
