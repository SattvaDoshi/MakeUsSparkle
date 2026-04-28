import dotenv from "dotenv";
import { connectDB, disconnectDB } from "../config/db.js";
import CharmItem from "../models/charmItem.model.js";

dotenv.config();

const CHARM_SEED = [
  // ═══════════════════════════════════════════
  //  CUSTOM CHARM JEWELLERY — Initials
  // ═══════════════════════════════════════════
  { name: "Letter A", price: 199, emoji: "A", charmCategory: "initials", parentCategory: "custom-charm-jewellery", image: "/images/hero.png", sortOrder: 1 },
  { name: "Letter B", price: 199, emoji: "B", charmCategory: "initials", parentCategory: "custom-charm-jewellery", image: "/images/hero.png", sortOrder: 2 },
  { name: "Letter C", price: 199, emoji: "C", charmCategory: "initials", parentCategory: "custom-charm-jewellery", image: "/images/hero.png", sortOrder: 3 },
  { name: "Letter D", price: 199, emoji: "D", charmCategory: "initials", parentCategory: "custom-charm-jewellery", image: "/images/hero.png", sortOrder: 4 },
  { name: "Letter E", price: 199, emoji: "E", charmCategory: "initials", parentCategory: "custom-charm-jewellery", image: "/images/hero.png", sortOrder: 5 },
  { name: "Letter F", price: 199, emoji: "F", charmCategory: "initials", parentCategory: "custom-charm-jewellery", image: "/images/hero.png", sortOrder: 6 },
  { name: "Letter G", price: 199, emoji: "G", charmCategory: "initials", parentCategory: "custom-charm-jewellery", image: "/images/hero.png", sortOrder: 7 },
  { name: "Letter H", price: 199, emoji: "H", charmCategory: "initials", parentCategory: "custom-charm-jewellery", image: "/images/hero.png", sortOrder: 8 },
  { name: "Letter I", price: 199, emoji: "I", charmCategory: "initials", parentCategory: "custom-charm-jewellery", image: "/images/hero.png", sortOrder: 9 },
  { name: "Letter J", price: 199, emoji: "J", charmCategory: "initials", parentCategory: "custom-charm-jewellery", image: "/images/hero.png", sortOrder: 10 },
  { name: "Letter K", price: 199, emoji: "K", charmCategory: "initials", parentCategory: "custom-charm-jewellery", image: "/images/hero.png", sortOrder: 11 },
  { name: "Letter L", price: 199, emoji: "L", charmCategory: "initials", parentCategory: "custom-charm-jewellery", image: "/images/hero.png", sortOrder: 12 },
  { name: "Letter M", price: 199, emoji: "M", charmCategory: "initials", parentCategory: "custom-charm-jewellery", image: "/images/hero.png", sortOrder: 13 },
  { name: "Letter N", price: 199, emoji: "N", charmCategory: "initials", parentCategory: "custom-charm-jewellery", image: "/images/hero.png", sortOrder: 14 },
  { name: "Letter O", price: 199, emoji: "O", charmCategory: "initials", parentCategory: "custom-charm-jewellery", image: "/images/hero.png", sortOrder: 15 },
  { name: "Letter P", price: 199, emoji: "P", charmCategory: "initials", parentCategory: "custom-charm-jewellery", image: "/images/hero.png", sortOrder: 16 },
  { name: "Letter Q", price: 199, emoji: "Q", charmCategory: "initials", parentCategory: "custom-charm-jewellery", image: "/images/hero.png", sortOrder: 17 },
  { name: "Letter R", price: 199, emoji: "R", charmCategory: "initials", parentCategory: "custom-charm-jewellery", image: "/images/hero.png", sortOrder: 18 },
  { name: "Letter S", price: 199, emoji: "S", charmCategory: "initials", parentCategory: "custom-charm-jewellery", image: "/images/hero.png", sortOrder: 19 },
  { name: "Letter T", price: 199, emoji: "T", charmCategory: "initials", parentCategory: "custom-charm-jewellery", image: "/images/hero.png", sortOrder: 20 },
  { name: "Letter U", price: 199, emoji: "U", charmCategory: "initials", parentCategory: "custom-charm-jewellery", image: "/images/hero.png", sortOrder: 21 },
  { name: "Letter V", price: 199, emoji: "V", charmCategory: "initials", parentCategory: "custom-charm-jewellery", image: "/images/hero.png", sortOrder: 22 },
  { name: "Letter W", price: 199, emoji: "W", charmCategory: "initials", parentCategory: "custom-charm-jewellery", image: "/images/hero.png", sortOrder: 23 },
  { name: "Letter X", price: 199, emoji: "X", charmCategory: "initials", parentCategory: "custom-charm-jewellery", image: "/images/hero.png", sortOrder: 24 },
  { name: "Letter Y", price: 199, emoji: "Y", charmCategory: "initials", parentCategory: "custom-charm-jewellery", image: "/images/hero.png", sortOrder: 25 },
  { name: "Letter Z", price: 199, emoji: "Z", charmCategory: "initials", parentCategory: "custom-charm-jewellery", image: "/images/hero.png", sortOrder: 26 },

  // ═══════════════════════════════════════════
  //  CUSTOM CHARM JEWELLERY — Symbols
  // ═══════════════════════════════════════════
  { name: "Gold Star", price: 249, emoji: "⭐", charmCategory: "symbols", parentCategory: "custom-charm-jewellery", image: "/images/GlamLook.jpg", sortOrder: 1 },
  { name: "Heart", price: 249, emoji: "❤️", charmCategory: "symbols", parentCategory: "custom-charm-jewellery", image: "/images/GlamLook.jpg", sortOrder: 2 },
  { name: "Crescent Moon", price: 299, emoji: "🌙", charmCategory: "symbols", parentCategory: "custom-charm-jewellery", image: "/images/GlamLook.jpg", sortOrder: 3 },
  { name: "Crown", price: 349, emoji: "👑", charmCategory: "symbols", parentCategory: "custom-charm-jewellery", image: "/images/GlamLook.jpg", sortOrder: 4 },
  { name: "Butterfly", price: 299, emoji: "🦋", charmCategory: "symbols", parentCategory: "custom-charm-jewellery", image: "/images/GlamLook.jpg", sortOrder: 5 },
  { name: "Flower", price: 249, emoji: "🌸", charmCategory: "symbols", parentCategory: "custom-charm-jewellery", image: "/images/GlamLook.jpg", sortOrder: 6 },
  { name: "Evil Eye", price: 299, emoji: "🧿", charmCategory: "symbols", parentCategory: "custom-charm-jewellery", image: "/images/GlamLook.jpg", sortOrder: 7 },
  { name: "Infinity", price: 349, emoji: "∞", charmCategory: "symbols", parentCategory: "custom-charm-jewellery", image: "/images/GlamLook.jpg", sortOrder: 8 },
  { name: "Clover", price: 249, emoji: "🍀", charmCategory: "symbols", parentCategory: "custom-charm-jewellery", image: "/images/GlamLook.jpg", sortOrder: 9 },
  { name: "Angel Wings", price: 349, emoji: "🪽", charmCategory: "symbols", parentCategory: "custom-charm-jewellery", image: "/images/GlamLook.jpg", sortOrder: 10 },

  // ═══════════════════════════════════════════
  //  CUSTOM CHARM JEWELLERY — Birthstones
  // ═══════════════════════════════════════════
  { name: "Garnet — Jan", price: 399, emoji: "🔴", charmCategory: "birthstones", parentCategory: "custom-charm-jewellery", image: "/images/FairyCoded.jpg", sortOrder: 1 },
  { name: "Amethyst — Feb", price: 399, emoji: "🟣", charmCategory: "birthstones", parentCategory: "custom-charm-jewellery", image: "/images/FairyCoded.jpg", sortOrder: 2 },
  { name: "Aquamarine — Mar", price: 399, emoji: "🔵", charmCategory: "birthstones", parentCategory: "custom-charm-jewellery", image: "/images/FairyCoded.jpg", sortOrder: 3 },
  { name: "Diamond — Apr", price: 499, emoji: "💎", charmCategory: "birthstones", parentCategory: "custom-charm-jewellery", image: "/images/FairyCoded.jpg", sortOrder: 4 },
  { name: "Emerald — May", price: 449, emoji: "💚", charmCategory: "birthstones", parentCategory: "custom-charm-jewellery", image: "/images/FairyCoded.jpg", sortOrder: 5 },
  { name: "Pearl — Jun", price: 349, emoji: "⚪", charmCategory: "birthstones", parentCategory: "custom-charm-jewellery", image: "/images/FairyCoded.jpg", sortOrder: 6 },
  { name: "Ruby — Jul", price: 449, emoji: "🔻", charmCategory: "birthstones", parentCategory: "custom-charm-jewellery", image: "/images/FairyCoded.jpg", sortOrder: 7 },
  { name: "Peridot — Aug", price: 399, emoji: "🟢", charmCategory: "birthstones", parentCategory: "custom-charm-jewellery", image: "/images/FairyCoded.jpg", sortOrder: 8 },
  { name: "Sapphire — Sep", price: 449, emoji: "🔷", charmCategory: "birthstones", parentCategory: "custom-charm-jewellery", image: "/images/FairyCoded.jpg", sortOrder: 9 },
  { name: "Opal — Oct", price: 399, emoji: "🌈", charmCategory: "birthstones", parentCategory: "custom-charm-jewellery", image: "/images/FairyCoded.jpg", sortOrder: 10 },
  { name: "Topaz — Nov", price: 399, emoji: "🟡", charmCategory: "birthstones", parentCategory: "custom-charm-jewellery", image: "/images/FairyCoded.jpg", sortOrder: 11 },
  { name: "Turquoise — Dec", price: 399, emoji: "🩵", charmCategory: "birthstones", parentCategory: "custom-charm-jewellery", image: "/images/FairyCoded.jpg", sortOrder: 12 },

  // ═══════════════════════════════════════════
  //  CUSTOM CHARM JEWELLERY — Custom
  // ═══════════════════════════════════════════
  { name: "Custom Name", price: 799, emoji: "🔤", charmCategory: "custom", parentCategory: "custom-charm-jewellery", image: "/images/hero1.png", sortOrder: 1, customisable: true },
  { name: "Special Date", price: 699, emoji: "📅", charmCategory: "custom", parentCategory: "custom-charm-jewellery", image: "/images/hero1.png", sortOrder: 2, customisable: true },
  { name: "Photo Locket", price: 999, emoji: "🖼️", charmCategory: "custom", parentCategory: "custom-charm-jewellery", image: "/images/hero1.png", sortOrder: 3, customisable: true, hasPhotoUpload: true },

  // ═══════════════════════════════════════════
  //  KEYCHAINS — Initials
  // ═══════════════════════════════════════════
  { name: "Letter A", price: 149, emoji: "A", charmCategory: "initials", parentCategory: "keychains", image: "/images/hero.png", sortOrder: 1 },
  { name: "Letter B", price: 149, emoji: "B", charmCategory: "initials", parentCategory: "keychains", image: "/images/hero.png", sortOrder: 2 },
  { name: "Letter C", price: 149, emoji: "C", charmCategory: "initials", parentCategory: "keychains", image: "/images/hero.png", sortOrder: 3 },
  { name: "Letter D", price: 149, emoji: "D", charmCategory: "initials", parentCategory: "keychains", image: "/images/hero.png", sortOrder: 4 },
  { name: "Letter E", price: 149, emoji: "E", charmCategory: "initials", parentCategory: "keychains", image: "/images/hero.png", sortOrder: 5 },
  { name: "Letter F", price: 149, emoji: "F", charmCategory: "initials", parentCategory: "keychains", image: "/images/hero.png", sortOrder: 6 },
  { name: "Letter G", price: 149, emoji: "G", charmCategory: "initials", parentCategory: "keychains", image: "/images/hero.png", sortOrder: 7 },
  { name: "Letter H", price: 149, emoji: "H", charmCategory: "initials", parentCategory: "keychains", image: "/images/hero.png", sortOrder: 8 },
  { name: "Letter I", price: 149, emoji: "I", charmCategory: "initials", parentCategory: "keychains", image: "/images/hero.png", sortOrder: 9 },
  { name: "Letter J", price: 149, emoji: "J", charmCategory: "initials", parentCategory: "keychains", image: "/images/hero.png", sortOrder: 10 },
  { name: "Letter K", price: 149, emoji: "K", charmCategory: "initials", parentCategory: "keychains", image: "/images/hero.png", sortOrder: 11 },
  { name: "Letter L", price: 149, emoji: "L", charmCategory: "initials", parentCategory: "keychains", image: "/images/hero.png", sortOrder: 12 },
  { name: "Letter M", price: 149, emoji: "M", charmCategory: "initials", parentCategory: "keychains", image: "/images/hero.png", sortOrder: 13 },
  { name: "Letter N", price: 149, emoji: "N", charmCategory: "initials", parentCategory: "keychains", image: "/images/hero.png", sortOrder: 14 },
  { name: "Letter O", price: 149, emoji: "O", charmCategory: "initials", parentCategory: "keychains", image: "/images/hero.png", sortOrder: 15 },
  { name: "Letter P", price: 149, emoji: "P", charmCategory: "initials", parentCategory: "keychains", image: "/images/hero.png", sortOrder: 16 },
  { name: "Letter Q", price: 149, emoji: "Q", charmCategory: "initials", parentCategory: "keychains", image: "/images/hero.png", sortOrder: 17 },
  { name: "Letter R", price: 149, emoji: "R", charmCategory: "initials", parentCategory: "keychains", image: "/images/hero.png", sortOrder: 18 },
  { name: "Letter S", price: 149, emoji: "S", charmCategory: "initials", parentCategory: "keychains", image: "/images/hero.png", sortOrder: 19 },
  { name: "Letter T", price: 149, emoji: "T", charmCategory: "initials", parentCategory: "keychains", image: "/images/hero.png", sortOrder: 20 },
  { name: "Letter U", price: 149, emoji: "U", charmCategory: "initials", parentCategory: "keychains", image: "/images/hero.png", sortOrder: 21 },
  { name: "Letter V", price: 149, emoji: "V", charmCategory: "initials", parentCategory: "keychains", image: "/images/hero.png", sortOrder: 22 },
  { name: "Letter W", price: 149, emoji: "W", charmCategory: "initials", parentCategory: "keychains", image: "/images/hero.png", sortOrder: 23 },
  { name: "Letter X", price: 149, emoji: "X", charmCategory: "initials", parentCategory: "keychains", image: "/images/hero.png", sortOrder: 24 },
  { name: "Letter Y", price: 149, emoji: "Y", charmCategory: "initials", parentCategory: "keychains", image: "/images/hero.png", sortOrder: 25 },
  { name: "Letter Z", price: 149, emoji: "Z", charmCategory: "initials", parentCategory: "keychains", image: "/images/hero.png", sortOrder: 26 },

  // ═══════════════════════════════════════════
  //  KEYCHAINS — Symbols
  // ═══════════════════════════════════════════
  { name: "Gold Star", price: 199, emoji: "⭐", charmCategory: "symbols", parentCategory: "keychains", image: "/images/IslandGirl.jpg", sortOrder: 1 },
  { name: "Heart", price: 199, emoji: "❤️", charmCategory: "symbols", parentCategory: "keychains", image: "/images/IslandGirl.jpg", sortOrder: 2 },
  { name: "Crescent Moon", price: 249, emoji: "🌙", charmCategory: "symbols", parentCategory: "keychains", image: "/images/IslandGirl.jpg", sortOrder: 3 },
  { name: "Crown", price: 299, emoji: "👑", charmCategory: "symbols", parentCategory: "keychains", image: "/images/IslandGirl.jpg", sortOrder: 4 },
  { name: "Butterfly", price: 249, emoji: "🦋", charmCategory: "symbols", parentCategory: "keychains", image: "/images/IslandGirl.jpg", sortOrder: 5 },
  { name: "Flower", price: 199, emoji: "🌸", charmCategory: "symbols", parentCategory: "keychains", image: "/images/IslandGirl.jpg", sortOrder: 6 },
  { name: "Evil Eye", price: 249, emoji: "🧿", charmCategory: "symbols", parentCategory: "keychains", image: "/images/IslandGirl.jpg", sortOrder: 7 },
  { name: "Paw Print", price: 199, emoji: "🐾", charmCategory: "symbols", parentCategory: "keychains", image: "/images/IslandGirl.jpg", sortOrder: 8 },
  { name: "Music Note", price: 199, emoji: "🎵", charmCategory: "symbols", parentCategory: "keychains", image: "/images/IslandGirl.jpg", sortOrder: 9 },
  { name: "Lightning", price: 249, emoji: "⚡", charmCategory: "symbols", parentCategory: "keychains", image: "/images/IslandGirl.jpg", sortOrder: 10 },

  // ═══════════════════════════════════════════
  //  KEYCHAINS — Characters
  // ═══════════════════════════════════════════
  { name: "Mini Bear", price: 299, emoji: "🧸", charmCategory: "characters", parentCategory: "keychains", image: "/images/newHero.png", sortOrder: 1 },
  { name: "Sakura Cat", price: 349, emoji: "🐱", charmCategory: "characters", parentCategory: "keychains", image: "/images/newHero.png", sortOrder: 2 },
  { name: "Bunny", price: 299, emoji: "🐰", charmCategory: "characters", parentCategory: "keychains", image: "/images/newHero.png", sortOrder: 3 },
  { name: "Lucky Frog", price: 249, emoji: "🐸", charmCategory: "characters", parentCategory: "keychains", image: "/images/newHero.png", sortOrder: 4 },
  { name: "Fox", price: 299, emoji: "🦊", charmCategory: "characters", parentCategory: "keychains", image: "/images/newHero.png", sortOrder: 5 },
  { name: "Penguin", price: 299, emoji: "🐧", charmCategory: "characters", parentCategory: "keychains", image: "/images/newHero.png", sortOrder: 6 },

  // ═══════════════════════════════════════════
  //  KEYCHAINS — Custom
  // ═══════════════════════════════════════════
  { name: "Custom Name Tag", price: 599, emoji: "🔤", charmCategory: "custom", parentCategory: "keychains", image: "/images/hero1.png", sortOrder: 1, customisable: true },
  { name: "Photo Keychain", price: 799, emoji: "🖼️", charmCategory: "custom", parentCategory: "keychains", image: "/images/hero1.png", sortOrder: 2, customisable: true, hasPhotoUpload: true },
];

async function run() {
  const reset = process.argv.includes("--reset");

  try {
    await connectDB(process.env.MONGO_URI);

    if (reset) {
      console.log("Reset flag detected. Clearing existing charm items...");
      await CharmItem.deleteMany({});
    }

    for (const entry of CHARM_SEED) {
      await CharmItem.findOneAndUpdate(
        { name: entry.name, parentCategory: entry.parentCategory, charmCategory: entry.charmCategory },
        entry,
        { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
      );
    }

    const count = await CharmItem.countDocuments();
    console.log(`Charm items seed complete. Total: ${count}`);
  } catch (error) {
    console.error("Charm seed failed:", error.message);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
  }
}

run();
