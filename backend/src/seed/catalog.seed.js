import dotenv from "dotenv";

import { connectDB, disconnectDB } from "../config/db.js";
import Category from "../models/category.model.js";
import SubCategory from "../models/subCategory.model.js";
import Style from "../models/style.model.js";
import Product from "../models/product.model.js";

dotenv.config();

const CATEGORY_SEED = [
  {
    name: "Jewellery",
    description: "Everyday and statement jewellery edits",
    image: "/images/hero.png",
  },
  {
    name: "Gift Boxes",
    description: "Curated gifting collections",
    image: "/images/hero1.png",
  },
  {
    name: "Fan Combos",
    description: "Pop-culture inspired combo sets",
    image: "/images/FairyCoded.jpg",
  },
  {
    name: "Custom Charm Jewellery",
    description: "Personalised charms and keepsakes",
    image: "/images/GlamLook.jpg",
  },
  {
    name: "Hair Accessories",
    description: "Hair jewellery and accessories",
    image: "/images/hero_new.png",
  },
  {
    name: "Keychains",
    description: "Custom and premium keychains",
    image: "/images/hero.png",
  },
  {
    name: "Watch Straps",
    description: "Designer watch strap edits",
    image: "/images/newHero.png",
  },
  {
    name: "Curated Combos",
    description: "Pre-styled jewellery combos",
    image: "/images/newHero.png",
  },
];

const SUBCATEGORY_SEED = [
  {
    name: "Necklaces",
    categoryName: "Jewellery",
    image: "/images/hero.png",
  },
  {
    name: "Earrings",
    categoryName: "Jewellery",
    image: "/images/FairyCoded.jpg",
  },
  {
    name: "Rings",
    categoryName: "Jewellery",
    image: "/images/GlamLook.jpg",
  },
  {
    name: "Bracelets",
    categoryName: "Jewellery",
    image: "/images/IslandGirl.jpg",
  },
  {
    name: "Waist Chains",
    categoryName: "Jewellery",
     image: "/images/hero1.png",
  },
  {
    name: "Couple Sets",
    categoryName: "Jewellery",
    image: "/images/GlamLook.jpg",
  },
  {
    name: "Men Chains",
    categoryName: "Jewellery",
    image: "/images/FairyCoded.jpg",
  },
  {
    name: "Men Bracelets",
    categoryName: "Jewellery",
    image: "/images/IslandGirl.jpg",
  },
  {
    name: "Men Rings",
    categoryName: "Jewellery",
    image: "/images/GlamLook.jpg",
  },
  {
    name: "Men Earrings",
    categoryName: "Jewellery",
    image: "/images/FairyCoded.jpg",
  },
  {
    name: "Men Pendants",
    categoryName: "Jewellery",
    image: "/images/hero.png",
  },
];

const STYLE_SEED = [
  { name: "Soft Girl", image: "/images/IslandGirl.jpg" },
  { name: "Glam Look", image: "/images/GlamLook.jpg" },
  { name: "Island Girl", image: "/images/IslandGirl.jpg" },
  { name: "Office Jewellery", image: "/images/hero1.png" },
  { name: "Maximalist", image: "/images/FairyCoded.jpg" },
  { name: "Fairy Coded", image: "/images/FairyCoded.jpg" },
  { name: "Street Edge", image: "/images/FairyCoded.jpg" },
  { name: "Corporate Sharp", image: "/images/GlamLook.jpg" },
  { name: "Island King", image: "/images/IslandGirl.jpg" },
  { name: "Minimal Stack", image: "/images/FairyCoded.jpg" },
  { name: "Rocker Noir", image: "/images/newHero.png" },
  { name: "Gold Royalty", image: "/images/hero.png" },
];

const PRODUCT_SEED = [
  {
    title: "Dainty Layered Necklace",
    categoryName: "Jewellery",
    subCategoryName: "Necklaces",
    styleName: "Soft Girl",
    gender: "female",
    price: 1299,
    rating: 4.7,
    stock: 35,
    tags: ["dainty", "layered", "minimal"],
    images: [
      "/images/hero1.png",
      "/images/IslandGirl.jpg",
    ],
    description: "Delicate layered necklace made for everyday wear and soft looks.",
  },
  {
    title: "Pearl Pendant Necklace",
    categoryName: "Jewellery",
    subCategoryName: "Necklaces",
    styleName: "Office Jewellery",
    gender: "female",
    price: 1899,
    rating: 4.5,
    stock: 22,
    tags: ["pendant", "pearl", "office"],
    images: [
      "/images/hero1.png",
      "/images/FairyCoded.jpg",
    ],
    description: "Timeless pearl pendant with premium chain finishing.",
  },
  {
    title: "Korean Ear Cuffs",
    categoryName: "Jewellery",
    subCategoryName: "Earrings",
    styleName: "Fairy Coded",
    gender: "female",
    price: 699,
    rating: 4.4,
    stock: 44,
    tags: ["korean", "ear-cuff", "trendy"],
    images: ["/images/FairyCoded.jpg"],
    description: "Lightweight cuffs inspired by Korean minimal styling.",
  },
  {
    title: "Gold Hoop Earrings",
    categoryName: "Jewellery",
    subCategoryName: "Earrings",
    styleName: "Glam Look",
    gender: "female",
    price: 999,
    rating: 4.8,
    stock: 28,
    tags: ["hoops", "party", "bold"],
    images: ["/images/GlamLook.jpg"],
    description: "Classic statement hoop earrings for bold glam looks.",
  },
  {
    title: "Diamond Accent Ring",
    categoryName: "Jewellery",
    subCategoryName: "Rings",
    styleName: "Glam Look",
    gender: "female",
    price: 2499,
    rating: 4.9,
    stock: 12,
    tags: ["diamond", "ring", "statement"],
    images: ["/images/GlamLook.jpg"],
    description: "Brilliant ring design to elevate festive and evening outfits.",
  },
  {
    title: "Minimal Gold Ring",
    categoryName: "Jewellery",
    subCategoryName: "Rings",
    styleName: "Soft Girl",
    gender: "female",
    price: 899,
    rating: 4.6,
    stock: 40,
    tags: ["minimal", "stackable", "daily"],
    images: ["/images/GlamLook.jpg"],
    description: "Elegant stackable ring designed for clean everyday styling.",
  },
  {
    title: "Beaded Charm Bracelet",
    categoryName: "Jewellery",
    subCategoryName: "Bracelets",
    styleName: "Island Girl",
    gender: "female",
    price: 749,
    rating: 4.4,
    stock: 31,
    tags: ["beaded", "boho", "charm"],
    images: ["/images/newHero.png"],
    description: "Beach-ready bracelet with colorful charm accents.",
  },
  {
    title: "Kada Bangle Set",
    categoryName: "Jewellery",
    subCategoryName: "Bracelets",
    styleName: "Maximalist",
    gender: "female",
    price: 1799,
    rating: 4.5,
    stock: 17,
    tags: ["kada", "traditional", "festival"],
    images: ["/images/GlamLook.jpg"],
    description: "Traditional kada stack with premium antique finish.",
  },
  {
    title: "Dainty Waist Chain",
    categoryName: "Jewellery",
    subCategoryName: "Waist Chains",
    styleName: "Island Girl",
    gender: "female",
    price: 1099,
    rating: 4.3,
    stock: 19,
    tags: ["dainty", "waist-chain", "beach"],
      images: ["/images/hero1.png"],
    description: "Subtle waist chain with tropical-inspired detailing.",
  },
  {
    title: "Couple Rings Set",
    categoryName: "Jewellery",
    subCategoryName: "Couple Sets",
    styleName: "Office Jewellery",
    gender: "unisex",
    price: 1999,
    rating: 4.7,
    stock: 16,
    tags: ["couple", "rings", "gift"],
    images: ["/images/GlamLook.jpg"],
    description: "Matching ring set designed as a thoughtful couple gift.",
  },
  {
    title: "Steel Chain Necklace",
    categoryName: "Jewellery",
    subCategoryName: "Men Chains",
    styleName: "Street Edge",
    gender: "male",
    price: 1499,
    rating: 4.6,
    stock: 26,
    tags: ["chain", "street", "men"],
    images: ["/images/FairyCoded.jpg"],
    description: "Bold steel chain crafted for street-inspired looks.",
  },
  {
    title: "Executive Leather Bracelet",
    categoryName: "Jewellery",
    subCategoryName: "Men Bracelets",
    styleName: "Corporate Sharp",
    gender: "male",
    price: 1299,
    rating: 4.4,
    stock: 20,
    tags: ["bracelet", "leather", "corporate"],
    images: ["/images/IslandGirl.jpg"],
    description: "Sleek bracelet designed for everyday office wear.",
  },
  {
    title: "Onyx Signet Ring",
    categoryName: "Jewellery",
    subCategoryName: "Men Rings",
    styleName: "Rocker Noir",
    gender: "male",
    price: 1699,
    rating: 4.5,
    stock: 18,
    tags: ["ring", "onyx", "rocker"],
    images: ["/images/GlamLook.jpg"],
    description: "Dark signet ring with polished onyx center stone.",
  },
  {
    title: "Stud Set for Men",
    categoryName: "Jewellery",
    subCategoryName: "Men Earrings",
    styleName: "Minimal Stack",
    gender: "male",
    price: 699,
    rating: 4.2,
    stock: 38,
    tags: ["studs", "minimal", "men"],
    images: ["/images/FairyCoded.jpg"],
    description: "Minimal earrings set for daily wear and stacking.",
  },
  {
    title: "Gold Bar Pendant",
    categoryName: "Jewellery",
    subCategoryName: "Men Pendants",
    styleName: "Gold Royalty",
    gender: "male",
    price: 2099,
    rating: 4.8,
    stock: 13,
    tags: ["pendant", "gold", "luxury"],
    images: ["/images/hero.png"],
    description: "Premium pendant crafted for luxury-led styling.",
  },
  {
    title: "Luxury Gift Box",
    categoryName: "Gift Boxes",
    styleName: "Soft Girl",
    gender: "unisex",
    price: 2499,
    rating: 4.9,
    stock: 9,
    tags: ["gift", "box", "curated"],
    images: ["/images/hero1.png"],
    description: "Premium gift box with curated jewellery assortments.",
  },
  {
    title: "Anime Fan Combo",
    categoryName: "Fan Combos",
    styleName: "Maximalist",
    gender: "unisex",
    price: 1999,
    rating: 4.7,
    stock: 15,
    tags: ["fan", "combo", "anime"],
    images: ["/images/FairyCoded.jpg"],
    description: "Fan combo with themed accessories and collectibles.",
  },
  {
    title: "Custom Name Charm",
    categoryName: "Custom Charm Jewellery",
    styleName: "Fairy Coded",
    gender: "unisex",
    price: 899,
    rating: 4.8,
    stock: 45,
    tags: ["custom", "charm", "name"],
    images: ["/images/GlamLook.jpg"],
    description: "Personalized charm with custom name engraving.",
  },
  {
    title: "Pearl Hair Band",
    categoryName: "Hair Accessories",
    styleName: "Soft Girl",
    gender: "female",
    price: 799,
    rating: 4.3,
    stock: 30,
    tags: ["hair", "pearl", "accessory"],
    images: ["/images/hero_new.png"],
    description: "Elegant pearl band to elevate casual and occasion looks.",
  },
  {
    title: "Personalized Keychain",
    categoryName: "Keychains",
    styleName: "Street Edge",
    gender: "unisex",
    price: 499,
    rating: 4.4,
    stock: 50,
    tags: ["keychain", "personalized", "gift"],
    images: ["/images/hero.png"],
    description: "Durable custom keychain with engraved plate option.",
  },
  {
    title: "Premium Watch Strap",
    categoryName: "Watch Straps",
    styleName: "Corporate Sharp",
    gender: "male",
    price: 1399,
    rating: 4.5,
    stock: 24,
    tags: ["watch", "strap", "premium"],
    images: ["/images/newHero.png"],
    description: "Premium textured strap compatible with modern smartwatches.",
  },
  {
    title: "Festive Combo Set",
    categoryName: "Curated Combos",
    styleName: "Glam Look",
    gender: "female",
    price: 2999,
    rating: 4.8,
    stock: 11,
    tags: ["combo", "festive", "party"],
    images: ["/images/newHero.png"],
    description: "Festive ready combo with necklace, earrings, and bracelet.",
  },
];

async function seedCategories() {
  const categoryMap = new Map();

  for (const entry of CATEGORY_SEED) {
    const category = await Category.findOneAndUpdate({ name: entry.name }, entry, {
      upsert: true,
      returnDocument: "after",
      setDefaultsOnInsert: true,
    });

    categoryMap.set(entry.name, category._id);
  }

  return categoryMap;
}

async function seedSubCategories(categoryMap) {
  const subCategoryMap = new Map();

  for (const entry of SUBCATEGORY_SEED) {
    const categoryId = categoryMap.get(entry.categoryName);
    if (!categoryId) {
      throw new Error(`Category not found for subcategory seed: ${entry.name}`);
    }

    const subCategory = await SubCategory.findOneAndUpdate(
      { name: entry.name, category: categoryId },
      { name: entry.name, image: entry.image, category: categoryId },
      {
        upsert: true,
        returnDocument: "after",
        setDefaultsOnInsert: true,
      }
    );

    subCategoryMap.set(entry.name, subCategory._id);
  }

  return subCategoryMap;
}

async function seedStyles() {
  const styleMap = new Map();

  for (const entry of STYLE_SEED) {
    const style = await Style.findOneAndUpdate({ name: entry.name }, entry, {
      upsert: true,
      returnDocument: "after",
      setDefaultsOnInsert: true,
    });

    styleMap.set(entry.name, style._id);
  }

  return styleMap;
}

async function seedProducts(categoryMap, subCategoryMap, styleMap) {
  for (const entry of PRODUCT_SEED) {
    const categoryId = categoryMap.get(entry.categoryName);
    const subCategoryId = entry.subCategoryName ? subCategoryMap.get(entry.subCategoryName) : undefined;
    const styleId = styleMap.get(entry.styleName);

    if (!categoryId) {
      throw new Error(`Missing category for product seed: ${entry.title}`);
    }
    if (entry.subCategoryName && !subCategoryId) {
      throw new Error(`Missing subcategory for product seed: ${entry.title}`);
    }
    if (!styleId) {
      throw new Error(`Missing style for product seed: ${entry.title}`);
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

async function clearCatalog() {
  await Product.deleteMany({});
  await SubCategory.deleteMany({});
  await Category.deleteMany({});
  await Style.deleteMany({});
}

async function run() {
  const reset = process.argv.includes("--reset");

  try {
    await connectDB(process.env.MONGO_URI);

    if (reset) {
      console.log("Reset flag detected. Clearing existing catalog data...");
      await clearCatalog();
    }

    const categoryMap = await seedCategories();
    const subCategoryMap = await seedSubCategories(categoryMap);
    const styleMap = await seedStyles();
    await seedProducts(categoryMap, subCategoryMap, styleMap);

    const [categoryCount, subCategoryCount, styleCount, productCount] = await Promise.all([
      Category.countDocuments(),
      SubCategory.countDocuments(),
      Style.countDocuments(),
      Product.countDocuments(),
    ]);

    console.log("Catalog seed complete.");
    console.log(
      JSON.stringify(
        {
          categories: categoryCount,
          subCategories: subCategoryCount,
          styles: styleCount,
          products: productCount,
        },
        null,
        2
      )
    );
  } catch (error) {
    console.error("Catalog seed failed:", error.message);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
  }
}

run();
