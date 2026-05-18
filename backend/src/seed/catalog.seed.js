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
        gender: "women",
    image: "/images/FairyCoded.jpg",
  },
  {
    name: "Custom Charm Jewellery",
    description: "Personalised charms and keepsakes",
    image: "/images/GlamLook.jpg",
  },
  {
    name: "Hair Accessories",
    import dotenv from "dotenv";

    import { connectDB, disconnectDB } from "../config/db.js";
    import Category from "../models/category.model.js";
    import SubCategory from "../models/subCategory.model.js";
    import Style from "../models/style.model.js";
    import Product from "../models/product.model.js";

    dotenv.config();

    const CATEGORY_SEED = [
      { name: "Jewellery", description: "Everyday and statement jewellery edits", image: "/images/hero.png" },
      { name: "Gift Boxes", description: "Curated gifting collections", image: "/images/hero1.png" },
      { name: "Keychains", description: "Custom and premium keychains", image: "/images/hero.png" },
      { name: "Watch Straps", description: "Designer watch strap edits", image: "/images/newHero.png" },
      { name: "Curated Combos", description: "Pre-styled jewellery combos", image: "/images/newHero.png" },
    ];

    const SUBCATEGORY_SEED = [
      { name: "Necklaces", categoryName: "Jewellery", image: "/images/hero.png" },
      { name: "Earrings", categoryName: "Jewellery", image: "/images/FairyCoded.jpg" },
      { name: "Rings", categoryName: "Jewellery", image: "/images/GlamLook.jpg" },
      { name: "Bracelets", categoryName: "Jewellery", image: "/images/IslandGirl.jpg" },
    ];

    const STYLE_SEED = [
      { name: "Soft Girl", image: "/images/IslandGirl.jpg" },
      { name: "Glam Look", image: "/images/GlamLook.jpg" },
      { name: "Island Girl", image: "/images/IslandGirl.jpg" },
      { name: "Office Jewellery", image: "/images/hero1.png" },
    ];

    const PRODUCT_SEED = [
      {
        title: "Dainty Layered Necklace",
        categoryName: "Jewellery",
        subCategoryName: "Necklaces",
        styleName: "Soft Girl",
        gender: "women",
        price: 1299,
        rating: 4.7,
        stock: 35,
        tags: ["dainty", "layered", "minimal"],
        images: ["/images/hero1.png", "/images/IslandGirl.jpg"],
        description: "Delicate layered necklace made for everyday wear and soft looks.",
      },
      {
        title: "Steel Chain Necklace",
        categoryName: "Jewellery",
        subCategoryName: "Necklaces",
        styleName: "Island Girl",
        gender: "men",
        price: 1499,
        rating: 4.6,
        stock: 26,
        tags: ["chain", "street", "men"],
        images: ["/images/FairyCoded.jpg"],
        description: "Bold steel chain crafted for street-inspired looks.",
      },
      {
        title: "Couple Rings Set",
        categoryName: "Jewellery",
        subCategoryName: "Rings",
        styleName: "Glam Look",
        gender: "unisex",
        price: 1999,
        rating: 4.7,
        stock: 16,
        tags: ["couple", "rings", "gift"],
        images: ["/images/GlamLook.jpg"],
        description: "Matching ring set designed as a thoughtful couple gift.",
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
        if (!categoryId) throw new Error(`Category not found for subcategory seed: ${entry.name}`);
        const subCategory = await SubCategory.findOneAndUpdate(
          { name: entry.name, category: categoryId },
          { name: entry.name, image: entry.image, category: categoryId },
          { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
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
        if (!categoryId) throw new Error(`Missing category for product seed: ${entry.title}`);
        if (entry.subCategoryName && !subCategoryId) throw new Error(`Missing subcategory for product seed: ${entry.title}`);
        if (!styleId) throw new Error(`Missing style for product seed: ${entry.title}`);
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
          { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
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
    );
  } catch (error) {
    console.error("Catalog seed failed:", error.message);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
  }
}

run();
