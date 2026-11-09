import { apiRequest } from "@/lib/api";
import { DEMO_ENABLED, DEMO_FAQS, DEMO_FAQ_SETTINGS, DEMO_FOUNDER } from "@/lib/demoContent";

export interface FounderMessage {
  isActive: boolean;
  desktopImage: string;
  desktopWidth: number;
  desktopHeight: number;
  mobileImage: string;
  mobileWidth: number;
  mobileHeight: number;
  alt: string;
  link: string;
}

export interface FaqSettings { eyebrow: string; title: string; subtitle: string }
export interface FaqItem { _id: string; question: string; answer: string }

export interface FeaturedReview {
  id: string;
  rating: number;
  body: string;
  name: string;
  verified: boolean;
  date: string;
  image: string;
  product: { id: string; title: string; image: string };
}
export interface ReviewStats { average: number; count: number }

export async function fetchFounderMessage(): Promise<FounderMessage | null> {
  const res = await apiRequest<{ success: boolean; founder: FounderMessage | null }>("/site/founder-message");
  if (res.founder) return res.founder;
  return DEMO_ENABLED ? DEMO_FOUNDER : null;
}

export async function fetchFaqs(): Promise<{ settings: FaqSettings; faqs: FaqItem[] }> {
  const res = await apiRequest<{ success: boolean; settings: FaqSettings; faqs: FaqItem[] }>("/site/faqs");
  const faqs = res.faqs || [];
  if (faqs.length === 0 && DEMO_ENABLED) return { settings: DEMO_FAQ_SETTINGS, faqs: DEMO_FAQS };
  return { settings: res.settings, faqs };
}

export async function fetchFeaturedReviews(): Promise<{ reviews: FeaturedReview[]; stats: ReviewStats }> {
  const res = await apiRequest<{ success: boolean; reviews: FeaturedReview[]; stats: ReviewStats }>("/reviews/featured");
  return { reviews: res.reviews || [], stats: res.stats || { average: 0, count: 0 } };
}

export { cdnImage } from "@/lib/cdn";
