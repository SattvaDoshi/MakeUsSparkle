import dotenv from "dotenv";

import { connectDB, disconnectDB } from "../config/db.js";
import Coupon from "../models/coupon.model.js";
import Category from "../models/category.model.js";
import SubCategory from "../models/subCategory.model.js";
import Style from "../models/style.model.js";

dotenv.config();

const OFFERS = [
  {
    code: "SPARK20",
    name: "20% off on Jewellery",
    description: "Valid on jewellery orders above INR 999",
    discountType: "percentage",
    discountValue: 20,
    maxDiscount: 750,
    minOrderValue: 999,
    usageLimit: 500,
    offerCategory: "jewellery",
    isFeatured: true,
    image: "/images/hero.png",
    categoryNames: ["Jewellery"],
  },
  {
    code: "COMBO150",
    name: "INR 150 off on Curated Combos",
    description: "Mix and match your favourite pieces",
    discountType: "fixed",
    discountValue: 150,
    minOrderValue: 1499,
    usageLimit: 300,
    offerCategory: "combo",
    image: "/images/hero1.png",
    categoryNames: ["Curated Combos"],
  },
  {
    code: "GIFT10",
    name: "10% off on Gift Boxes",
    description: "Perfect for gifting moments",
    discountType: "percentage",
    discountValue: 10,
    maxDiscount: 400,
    minOrderValue: 599,
    usageLimit: 200,
    offerCategory: "gift",
    image: "/images/FairyCoded.jpg",
    categoryNames: ["Gift Boxes"],
  },
  {
    code: "RINGS15",
    name: "15% off on Rings",
    description: "Applicable on ring collections",
    discountType: "percentage",
    discountValue: 15,
    maxDiscount: 600,
    minOrderValue: 899,
    usageLimit: 200,
    offerCategory: "jewellery",
    image: "/images/GlamLook.jpg",
    subCategoryNames: ["Rings"],
  },
  {
    code: "SOFT100",
    name: "INR 100 off Soft Girl Style",
    description: "Style-targeted discount for Soft Girl picks",
    discountType: "fixed",
    discountValue: 100,
    minOrderValue: 799,
    usageLimit: 150,
    offerCategory: "all",
    image: "/images/IslandGirl.jpg",
    styleNames: ["Soft Girl"],
  },
  {
    code: "MEN12",
    name: "12% off Mens Collection",
    description: "Valid on male/unisex products",
    discountType: "percentage",
    discountValue: 12,
    maxDiscount: 500,
    minOrderValue: 999,
    usageLimit: 300,
    offerCategory: "all",
    image: "/images/newHero.png",
    applicableProductTypes: ["male", "unisex"],
  },
];

async function resolveIds() {
  const categories = await Category.find({ name: { $in: [...new Set(OFFERS.flatMap((item) => item.categoryNames || []))] } }).select("_id name");
  const subCategories = await SubCategory.find({ name: { $in: [...new Set(OFFERS.flatMap((item) => item.subCategoryNames || []))] } }).select("_id name");
  const styles = await Style.find({ name: { $in: [...new Set(OFFERS.flatMap((item) => item.styleNames || []))] } }).select("_id name");

  const categoryMap = new Map(categories.map((item) => [item.name, String(item._id)]));
  const subCategoryMap = new Map(subCategories.map((item) => [item.name, String(item._id)]));
  const styleMap = new Map(styles.map((item) => [item.name, String(item._id)]));

  return { categoryMap, subCategoryMap, styleMap };
}

async function seedOffers() {
  const { categoryMap, subCategoryMap, styleMap } = await resolveIds();

  for (const offer of OFFERS) {
    const applicableCategories = (offer.categoryNames || []).map((name) => categoryMap.get(name)).filter(Boolean);
    const applicableSubCategories = (offer.subCategoryNames || []).map((name) => subCategoryMap.get(name)).filter(Boolean);
    const applicableStyles = (offer.styleNames || []).map((name) => styleMap.get(name)).filter(Boolean);

    await Coupon.findOneAndUpdate(
      { code: offer.code },
      {
        code: offer.code,
        name: offer.name,
        description: offer.description,
        discountType: offer.discountType,
        discountValue: offer.discountValue,
        maxDiscount: offer.maxDiscount,
        minOrderValue: offer.minOrderValue,
        startsAt: new Date(),
        expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 180),
        isActive: true,
        usageLimit: offer.usageLimit,
        offerCategory: offer.offerCategory,
        image: offer.image,
        isFeatured: Boolean(offer.isFeatured),
        applicableCategories,
        applicableSubCategories,
        applicableStyles,
        applicableProducts: [],
        applicableProductTypes: offer.applicableProductTypes || [],
        isWelcomeOffer: false,
      },
      {
        upsert: true,
        returnDocument: "after",
        setDefaultsOnInsert: true,
      }
    );
  }
}

async function clearOffers() {
  await Coupon.deleteMany({ code: { $in: OFFERS.map((offer) => offer.code) } });
}

async function run() {
  const reset = process.argv.includes("--reset");

  try {
    await connectDB(process.env.MONGO_URI);

    if (reset) {
      console.log("Reset flag detected. Clearing seeded offers...");
      await clearOffers();
    }

    await seedOffers();

    const seededCount = await Coupon.countDocuments({ code: { $in: OFFERS.map((offer) => offer.code) } });

    console.log("Offers seed complete.");
    console.log(JSON.stringify({ seededOffers: seededCount }, null, 2));
  } catch (error) {
    console.error("Offers seed failed:", error.message);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
  }
}

run();
