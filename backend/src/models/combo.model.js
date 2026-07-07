import mongoose from "mongoose";

const comboProductSchema = new mongoose.Schema({
  title: String,
  description: String,
  image: String,
  imagePublicId: String,
  variants: [{
    name: String, // e.g. "Color", "Size"
    options: [{
      name: String,
      image: String,
      imagePublicId: String
    }]
  }],
  allowTextCustomization: { type: Boolean, default: false },
  allowImageCustomization: { type: Boolean, default: false }
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

    // Combo-level Customization Toggles
    allowComboTextCustomization: { type: Boolean, default: false },
    allowComboImageCustomization: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Combo = mongoose.model("Combo", comboSchema);

export default Combo;
export { comboSchema };