import mongoose from "mongoose";

const comboSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    type: {
      type: String,
      enum: ["curated", "custom"],
    },
    // Fields for Curated Combos
    slots: [
      {
        category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
        allowedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
        defaultProduct: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      },
    ],
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

    // Fields for Custom Combos
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
    styles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Style" }],
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
    },
    discountRules: [
      {
        minPrice: Number, // Minimum total price of selected products
        minItems: Number, // Minimum number of selected products
        discountValue: Number, // Discount value to apply
      }
    ]
  },
  { timestamps: true }
);

const Combo = mongoose.model("Combo", comboSchema);

export default Combo;
export { comboSchema };