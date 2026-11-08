/** Cloudinary: ask for an auto-format (WebP/AVIF), auto-quality, width-capped rendition of an uploaded image. */
export function cdnImage(url: string | null | undefined, width: number): string {
  if (!url) return "";
  if (!url.includes("res.cloudinary.com") || !url.includes("/image/upload/") || /\/image\/upload\/[^/]*(f_auto|w_\d+)/.test(url)) return url;
  return url.replace("/image/upload/", `/image/upload/f_auto,q_auto,c_limit,w_${width}/`);
}
