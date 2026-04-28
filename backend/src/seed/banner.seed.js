import dotenv from "dotenv";

import { connectDB, disconnectDB } from "../config/db.js";
import Banner from "../models/banner.model.js";

dotenv.config();

// Source data copied from frontend fallback promo banners.
const PROMO_BANNER_SOURCE = [
  {
    id: 1,
    tag: "New Launch",
    title: "Pinteresty Necklaces",
    subtitle: "Dainty chains you've been dreaming of",
    cta: "Shop Now",
    bg: "linear-gradient(135deg, #e8c07d 0%, #c9a96e 40%, #a07840 100%)",
    textDark: true,
    pattern: "circles",
    imageSrc: "/images/hero.png",
    imageAlt: "Pinteresty Necklaces Collection",
    titleColor: "#000000",
    subtitleColor: "rgba(0, 0, 0, 0.62)",
    tagColor: "#311f01",
    ctaBorderColor: "rgba(37, 20, 0, 0.55)",
    ctaTextColor: "#1a0d00",
  },
  {
    id: 2,
    tag: "Bestseller",
    title: "Anti-Tarnish Collection",
    subtitle: "Wear it every day, forever gold",
    cta: "Explore",
    bg: "linear-gradient(135deg, #b8c9a3 0%, #8fa870 40%, #6b7c45 100%)",
    textDark: false,
    pattern: "dots",
    imageSrc: "/images/hero.png",
    imageAlt: "Anti-Tarnish Collection",
    titleColor: "#fdf6e9",
    subtitleColor: "rgba(253,246,233,0.75)",
    tagColor: "#fdf6e9",
    ctaBorderColor: "rgba(253,246,233,0.5)",
    ctaTextColor: "#fdf6e9",
  },
  {
    id: 3,
    tag: "Limited Edition",
    title: "Stack & Layer",
    subtitle: "Build your perfect arm party",
    cta: "Shop Bracelets",
    bg: "linear-gradient(135deg, #f5e6c8 0%, #e8c87d 50%, #d4a843 100%)",
    textDark: true,
    pattern: "lines",
    imageSrc: "/images/hero.png",
    imageAlt: "Stack and Layer Bracelets",
    titleColor: "#1a0d00",
    subtitleColor: "rgba(40,20,0,0.62)",
    tagColor: "#5c3a00",
    ctaBorderColor: "rgba(90,50,0,0.55)",
    ctaTextColor: "#1a0d00",
  },
  {
    id: 4,
    tag: "Trending",
    title: "Ring Obsessed",
    subtitle: "Stack every finger, no rules",
    cta: "Shop Rings",
    bg: "linear-gradient(135deg, #3b4a2f 0%, #4e6035 50%, #6b7c45 100%)",
    textDark: false,
    pattern: "circles",
    imageSrc: "/images/hero.png",
    imageAlt: "Ring Obsessed Collection",
    titleColor: "#fdf6e9",
    subtitleColor: "rgba(253,246,233,0.75)",
    tagColor: "#fdf6e9",
    ctaBorderColor: "rgba(253,246,233,0.5)",
    ctaTextColor: "#fdf6e9",
  },
];

const toBannerDocument = (entry) => ({
  text: entry.title,
  title: entry.title,
  subtitle: entry.subtitle,
  tag: entry.tag,
  cta: entry.cta,
  description: entry.subtitle,
  image: entry.imageSrc,
  imageAlt: entry.imageAlt,
  isActive: true,
  sortOrder: entry.id,
  // Keep visual metadata for traceability/debug even if not rendered directly by backend.
  tags: [entry.pattern, entry.textDark ? "text-dark" : "text-light"],
});

async function seedBanners() {
  for (const entry of PROMO_BANNER_SOURCE) {
    const document = toBannerDocument(entry);

    await Banner.findOneAndUpdate(
      { title: document.title },
      document,
      {
        upsert: true,
        returnDocument: "after",
        setDefaultsOnInsert: true,
      }
    );
  }
}

async function clearSeededBanners() {
  await Banner.deleteMany({
    title: { $in: PROMO_BANNER_SOURCE.map((entry) => entry.title) },
  });
}

async function run() {
  const reset = process.argv.includes("--reset");

  try {
    await connectDB(process.env.MONGO_URI);

    if (reset) {
      console.log("Reset flag detected. Clearing seeded banners...");
      await clearSeededBanners();
    }

    await seedBanners();

    const seededCount = await Banner.countDocuments({
      title: { $in: PROMO_BANNER_SOURCE.map((entry) => entry.title) },
    });

    console.log("Banner seed complete.");
    console.log(
      JSON.stringify(
        {
          seededBanners: seededCount,
          imagePaths: [...new Set(PROMO_BANNER_SOURCE.map((entry) => entry.imageSrc))],
        },
        null,
        2
      )
    );
  } catch (error) {
    console.error("Banner seed failed:", error.message);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
  }
}

run();
