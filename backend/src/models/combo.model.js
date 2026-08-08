import mongoose from "mongoose";

const comboProductSchema = new mongoose.Schema({
  title: String,
  description: String,
  image: String,
  imagePublicId: String,
  tags: [String],          // e.g. "Best Seller", "New"
  seoTags: [String],       // SEO meta tags
  stock: Number,           // Optional stock quantity
  variants: [{
    name: String, // e.g. "Color", "Size"
    options: [{
      name: String,
      image: String,
      imagePublicId: String,
      stock: Number
    }]
  }],
  allowTextCustomization: { type: Boolean, default: false },
  textCustomizationTitle: String,       // Title/prompt shown to user
  allowImageCustomization: { type: Boolean, default: false },
  imageCustomizationTitle: String,      // Title/prompt shown to user
  maxImageUploads: { type: Number, default: 1 }  // How many photos allowed
});

const comboSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    type: {
      type: String,
      enum: ["curated", "custom"],
    },
    // Styling Fields
    tagline: String,
    badge: String,
    tint: String,
    // Shared or Curated fields
    products: [comboProductSchema],
    price: Number,
    originalPrice: Number,
    image: String,
    imagePublicId: String,
    images: [String],
    imagePublicIds: [String],
    
    // Management Fields
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active"
    },
    displayOrder: {
      type: Number,
      default: 0
    },

    // Fields specific to Custom Combos
    itemsCount: Number, // Number of items the user must select from the products list

    // Combo-level SEO
    seoTags: [String],

    // Combo-level Customization Toggles
    allowComboTextCustomization: { type: Boolean, default: false },
    comboTextCustomizationTitle: String,
    allowComboImageCustomization: { type: Boolean, default: false },
    comboImageCustomizationTitle: String,
    comboMaxImageUploads: { type: Number, default: 1 },

    // Variable pricing tiers (e.g. "With Box": 1999, "Without Box": 1599)
    pricingVariants: [{
      label: String,
      price: Number
    }],
  },
  { timestamps: true }
);

const Combo = mongoose.model("Combo", comboSchema);

export default Combo;
export { comboSchema };