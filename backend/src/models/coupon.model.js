import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, index: true, trim: true, uppercase: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    discountValue: { type: Number, required: true, min: 0 },
    maxDiscount: { type: Number, min: 0 },
    minOrderValue: { type: Number, default: 0, min: 0 },
    startsAt: Date,
    expiryDate: Date,
    isActive: { type: Boolean, default: true },
    usageLimit: { type: Number, default: 1, min: 1 },
    usedCount: { type: Number, default: 0, min: 0 },

    // Offer display metadata for frontend offers page.
    offerCategory: {
      type: String,
      enum: ["jewellery", "combo", "gift", "all"],
      default: "all",
    },
    image: { type: String, default: "", trim: true },
    isFeatured: { type: Boolean, default: false },

    // Targeting scope support.
    applicableCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
    applicableSubCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: "SubCategory" }],
    applicableStyles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Style" }],
    applicableProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    applicableProductTypes: [{ type: String, enum: ["male", "female", "unisex"] }],

    issuedForEmail: String,
    issuedForUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    isWelcomeOffer: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const Coupon = mongoose.model("Coupon", couponSchema);

export default Coupon;
export { couponSchema };