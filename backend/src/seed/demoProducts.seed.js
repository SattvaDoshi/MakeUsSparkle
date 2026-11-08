// Adds ~10 demo products on top of the base catalog (run `npm run seed:catalog` first).
// Idempotent: upserts by title, never deletes anything.
import dotenv from "dotenv";
import { connectDB, disconnectDB } from "../config/db.js";
import Category from "../models/category.model.js";
import SubCategory from "../models/subCategory.model.js";
import Style from "../models/style.model.js";
import Product from "../models/product.model.js";
import HomeSection from "../models/homeSection.model.js";

dotenv.config();

const GOLD = { name: "Gold", hex: "#C9A84C" };
const SILVER = { name: "Silver", hex: "#C0C0C0" };
const ROSE = { name: "Rose Gold", hex: "#B76E79" };

const DEMO = [
  { title: "Golden Hour Hoop Earrings", sub: "Earrings", style: "Glam Look", gender: "women", price: 1799, sale: 1299, label: "Bestseller", rating: 4.8, stock: 42, colors: [GOLD, SILVER], img: ["/images/GlamLook.jpg", "/images/hero1.png"], tags: ["hoops", "gold", "statement"] },
  { title: "Pearl Drop Earrings", sub: "Earrings", style: "Soft Girl", gender: "women", price: 1499, sale: 999, label: "New", rating: 4.6, stock: 30, colors: [GOLD], img: ["/images/FairyCoded.jpg", "/images/IslandGirl.jpg"], tags: ["pearl", "bridal", "dainty"] },
  { title: "Infinity Solitaire Ring", sub: "Rings", style: "Office Jewellery", gender: "women", price: 1299, sale: null, label: "", rating: 4.5, stock: 55, colors: [GOLD, SILVER, ROSE], img: ["/images/hero.png"], tags: ["ring", "minimal", "everyday"] },
  { title: "Stackable Twist Ring Trio", sub: "Rings", style: "Glam Look", gender: "women", price: 1899, sale: 1499, label: "Trending", rating: 4.7, stock: 24, colors: [GOLD, ROSE], img: ["/images/Maximalist.jpg", "/images/GlamLook.jpg"], tags: ["stack", "trio"] },
  { title: "Charm Bracelet - Sunset", sub: "Bracelets", style: "Island Girl", gender: "women", price: 2199, sale: 1699, label: "Limited", rating: 4.9, stock: 12, colors: [GOLD], img: ["/images/IslandGirl.jpg", "/images/FairyCoded.jpg"], tags: ["charm", "bracelet", "gift"] },
  { title: "Minimal Link Bracelet", sub: "Bracelets", style: "Office Jewellery", gender: "unisex", price: 1599, sale: 1199, label: "", rating: 4.4, stock: 60, colors: [SILVER, GOLD], img: ["/images/newHero.png"], tags: ["link", "minimal", "unisex"] },
  { title: "Celestial Pendant Necklace", sub: "Necklaces", style: "Soft Girl", gender: "women", price: 2499, sale: 1799, label: "Bestseller", rating: 4.8, stock: 38, colors: [GOLD, SILVER], img: ["/images/hero1.png", "/images/FairyCoded.jpg"], tags: ["pendant", "star", "celestial"] },
  { title: "Rope Chain Necklace", sub: "Necklaces", style: "Island Girl", gender: "men", price: 1999, sale: null, label: "New", rating: 4.5, stock: 33, colors: [SILVER], img: ["/images/hero.png", "/images/Maximalist.jpg"], tags: ["chain", "men", "street"] },
  { title: "Signet Ring - Classic", sub: "Rings", style: "Office Jewellery", gender: "men", price: 1699, sale: 1299, label: "", rating: 4.6, stock: 28, colors: [SILVER, GOLD], img: ["/images/newHero.png", "/images/hero.png"], tags: ["signet", "men", "classic"] },
  { title: "Layered Coin Necklace", sub: "Necklaces", style: "Glam Look", gender: "women", price: 2799, sale: 2099, label: "Trending", rating: 4.7, stock: 18, colors: [GOLD], img: ["/images/GlamLook.jpg", "/images/Maximalist.jpg", "/images/hero1.png"], tags: ["layered", "coin", "statement"] },
];

async function run() {
  await connectDB(process.env.MONGO_URI);
  try {
    const category = await Category.findOne({ name: "Jewellery" });
    if (!category) throw new Error("Run `npm run seed:catalog` first (Jewellery category missing).");

    for (const d of DEMO) {
      const [sub, style] = await Promise.all([
        SubCategory.findOne({ name: d.sub }),
        Style.findOne({ name: d.style }),
      ]);
      if (!sub || !style) throw new Error(`Missing subcategory/style for ${d.title}`);
      await Product.findOneAndUpdate(
        { title: d.title },
        {
          title: d.title,
          description: `${d.title} — handcrafted, skin-friendly and made to last. Pairs beautifully with everyday and occasion wear.`,
          price: d.price,
          discountedPrice: d.sale ?? undefined,
          discountTag: d.sale ? `${Math.round((1 - d.sale / d.price) * 100)}% OFF` : undefined,
          productLabel: d.label || undefined,
          rating: d.rating,
          stock: d.stock,
          mainImage: d.img[0],
          images: d.img,
          colors: d.colors,
          sizes: d.sub === "Rings" ? ["6", "7", "8", "9"] : [],
          category: category._id,
          subCategory: sub._id,
          style: style._id,
          styles: [style._id],
          gender: d.gender,
          tags: d.tags,
        },
        { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
      );
    }
    // Populate the admin-curated homepage sections so they render locally.
    const titles = DEMO.map((d) => d.title);
    const prods = await Product.find({ title: { $in: titles } }).sort({ createdAt: 1 });
    const ids = prods.map((p) => p._id);
    await HomeSection.findOneAndUpdate(
      { key: "new-arrivals" },
      { key: "new-arrivals", eyebrow: "Fresh off the shelf", title: "New Arrivals", products: ids.slice(0, 8), isActive: true },
      { upsert: true }
    );
    await HomeSection.findOneAndUpdate(
      { key: "open-section" },
      {
        key: "open-section",
        title: "Trending Now",
        isActive: true,
        items: prods.slice(0, 6).map((p, i) => ({ type: "product", product: p._id, sortOrder: i })),
      },
      { upsert: true }
    );
    console.log(`Seeded ${DEMO.length} demo products + home sections.`);
  } catch (e) {
    console.error("Demo product seed failed:", e.message || e);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
  }
}

run();
