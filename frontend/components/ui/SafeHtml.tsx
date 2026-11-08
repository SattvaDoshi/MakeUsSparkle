"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { sanitizeHtml } from "@/lib/sanitizeHtml";

/** Renders admin-authored HTML after sanitising it in the browser (avoids server/client markup mismatch). */
export default function SafeHtml({ html, style, className }: { html: string; style?: CSSProperties; className?: string }) {
  const [clean, setClean] = useState("");
  useEffect(() => { setClean(sanitizeHtml(html)); }, [html]);
  return <div className={className} style={style} dangerouslySetInnerHTML={{ __html: clean }} />;
}
