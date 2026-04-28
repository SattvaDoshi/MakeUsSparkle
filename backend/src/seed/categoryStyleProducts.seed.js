import dotenv from "dotenv";

import { connectDB, disconnectDB } from "../config/db.js";
import Category from "../models/category.model.js";
import SubCategory from "../models/subCategory.model.js";
import Style from "../models/style.model.js";
import Product from "../models/product.model.js";

dotenv.config();

const CATEGORY_STYLE_PRODUCT_SEED = [
  {
    title: "Soft Girl Pearl Drop Set",
    categoryName: "Jewellery",
    subCategoryName: "Earrings",
    styleName: "Soft Girl",
    gender: "female",
    price: 1199,
    rating: 4.6,
    stock: 18,
    tags: ["soft", "pearl", "dainty"],
    images: ["/images/IslandGirl.jpg", "/images/hero1.png"],
    description: "Delicate pearl-inspired earring set made for soft everyday styling.",
  },
  {
    title: "Glam Look Festive Choker",
    categoryName: "Jewellery",
    subCategoryName: "Necklaces",
    styleName: "Glam Look",
    gender: "female",
    price: 2299,
    rating: 4.8,
    stock: 10,
    tags: ["glam", "choker", "festive"],
    images: ["/images/GlamLook.jpg"],
    description: "A statement choker designed for festive nights and elevated party edits.",
  },
  {
    title: "Street Edge Cuban Chain",
    categoryName: "Jewellery",
    subCategoryName: "Men Chains",
    styleName: "Street Edge",
    gender: "male",
    price: 1799,
    rating: 4.7,
    stock: 21,
    tags: ["street", "chain", "chunky"],
    images: ["/images/FairyCoded.jpg"],
    description: "Chunky steel chain that anchors bold street-inspired looks.",
  },
  {
    title: "Corporate Sharp Link Bracelet",
    categoryName: "Jewellery",
    subCategoryName: "Men Bracelets",
    styleName: "Corporate Sharp",
    gender: "male",
    price: 1499,
    rating: 4.5,
    stock: 16,
    tags: ["corporate", "bracelet", "clean"],
    images: ["/images/hero_new.png"],
    description: "A clean-link bracelet tailored for polished office and formal outfits.",
  },
  {
    title: "Gold Royalty Bar Pendant",
    categoryName: "Jewellery",
    subCategoryName: "Men Pendants",
    styleName: "Gold Royalty",
    gender: "male",
    price: 2599,
    rating: 4.9,
    stock: 8,
    tags: ["gold", "pendant", "luxury"],
    images: ["/images/hero.png"],
    description: "Premium gold-tone bar pendant built for rich statement layering.",
  },
  {
    title: "Corporate Strap Edition",
    categoryName: "Watch Straps",
    styleName: "Corporate Sharp",
    gender: "male",
    price: 1599,
    rating: 4.6,
    stock: 14,
    tags: ["watch", "strap", "formal"],
    images: ["/images/newHero.png"],
    description: "Smartwatch-ready strap with a professional textured finish.",
  },
];

async function seedCategoryStyleProducts() {
  const categoryMap = new Map(
    (await Category.find({ name: { $in: [...new Set(CATEGORY_STYLE_PRODUCT_SEED.map((entry) => entry.categoryName))] } }))
      .map((category) => [category.name, category._id])
  );

  const styleMap = new Map(
    (await Style.find({ name: { $in: [...new Set(CATEGORY_STYLE_PRODUCT_SEED.map((entry) => entry.styleName))] } }))
      .map((style) => [style.name, style._id])
  );

  const subCategoryNames = CATEGORY_STYLE_PRODUCT_SEED
    .map((entry) => entry.subCategoryName)
    .filter(Boolean);

  const subCategoryMap = new Map(
    (await SubCategory.find({ name: { $in: [...new Set(subCategoryNames)] } }))
      .map((subCategory) => [subCategory.name, subCategory._id])
  );

  for (const entry of CATEGORY_STYLE_PRODUCT_SEED) {
    const categoryId = categoryMap.get(entry.categoryName);
    const styleId = styleMap.get(entry.styleName);
    const subCategoryId = entry.subCategoryName ? subCategoryMap.get(entry.subCategoryName) : undefined;

    if (!categoryId) {
      throw new Error(`Category not found for seed product: ${entry.title}`);
    }

    if (!styleId) {
      throw new Error(`Style not found for seed product: ${entry.title}`);
    }

    if (entry.subCategoryName && !subCategoryId) {
      throw new Error(`Subcategory not found for seed product: ${entry.title}`);
    }

    await Product.findOneAndUpdate(
      { title: entry.title },
      {
        title: entry.title,
        description: entry.description,
        price: entry.price,
        rating: entry.rating,
        images: entry.images,
        category: categoryId,
        subCategory: subCategoryId,
        style: styleId,
        gender: entry.gender,
        stock: entry.stock,
        tags: entry.tags,
      },
      {
        upsert: true,
        returnDocument: "after",
        setDefaultsOnInsert: true,
      }
    );
  }
}

async function clearCategoryStyleProducts() {
  await Product.deleteMany({
    title: { $in: CATEGORY_STYLE_PRODUCT_SEED.map((entry) => entry.title) },
  });
}

async function run() {
  const reset = process.argv.includes("--reset");

  try {
    await connectDB(process.env.MONGO_URI);

    if (reset) {
      console.log("Reset flag detected. Clearing category-style seeded products...");
      await clearCategoryStyleProducts();
    }

    await seedCategoryStyleProducts();

    const seededProductCount = await Product.countDocuments({
      title: { $in: CATEGORY_STYLE_PRODUCT_SEED.map((entry) => entry.title) },
    });

    console.log("Category-style products seed complete.");
    console.log(
      JSON.stringify(
        {
          seededProducts: seededProductCount,
        },
        null,
        2
      )
    );
  } catch (error) {
    console.error("Category-style products seed failed:", error.message);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
  }
}

run();
