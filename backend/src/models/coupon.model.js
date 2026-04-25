import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  description: String,
  discountType: {
    type: String,
    enum: ["percentage", "fixed"],
    required: true,
  },
  discountValue: { type: Number, required: true },
  maxDiscount: Number,
  expiryDate: Date,
  isActive: { type: Boolean, default: true },
  usageLimit: { type: Number, default: 1 },
  usedCount: { type: Number, default: 0 },
  issuedForEmail: String,
  issuedForUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  isWelcomeOffer: { type: Boolean, default: false },
});

const Coupon = mongoose.model("Coupon", couponSchema);

export default Coupon;
export { couponSchema };