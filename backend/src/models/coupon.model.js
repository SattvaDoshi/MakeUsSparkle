import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
  name: String,
  discountType: {
    type: String,
    enum: ["percentage", "fixed"],
  },
  value: Number,
  applicableOn: {
    type: String,
    enum: ["product", "category", "all"],
  },
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  usageLimit: Number,
  usedCount: { type: Number, default: 0 },
});

const Coupon = mongoose.model("Coupon", couponSchema);

export default Coupon;
export { couponSchema };