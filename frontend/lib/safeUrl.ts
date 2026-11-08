/**
 * Links typed into the admin (banners, hero, founder message…) end up in href attributes.
 * Only let through addresses that are safe to navigate to; anything else (javascript:, data:, vbscript: …) becomes "".
 */
export function safeHref(raw: string | null | undefined): string {
  const href = (raw ?? "").trim();
  if (!href) return "";
  if (href.startsWith("/") && !href.startsWith("//")) return href; // same-site path
  if (href.startsWith("#")) return href;
  try {
    const u = new URL(href);
    return ["http:", "https:", "mailto:", "tel:"].includes(u.protocol) ? href : "";
  } catch {
    return "";
  }
}
