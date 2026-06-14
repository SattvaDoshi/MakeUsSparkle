import mongoose from "mongoose";

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
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
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
  },
  { timestamps: true }
);

const Combo = mongoose.model("Combo", comboSchema);

export default Combo;
export { comboSchema };