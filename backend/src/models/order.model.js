import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: Number,
        price: Number,
        customNote: String,
        customImages: [String],
        selectedCharms: [{ type: mongoose.Schema.Types.ObjectId, ref: "CharmItem" }],
      },
    ],
    totalAmount: Number,
    advanceAmount: { type: Number, default: 0 },
    balanceAmount: { type: Number, default: 0 },
    paidAmount: { type: Number, default: 0 },
    isGift: Boolean,
    giftMessage: String,
    paymentMode: {
      type: String,
      enum: ["COD", "ONLINE", "PARTIAL_COD"],
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "partial_paid", "failed"],
      default: "pending",
    },
    deliveryCharge: Number,
    address: {
      fullAddress: String,
      city: String,
      state: String,
      pincode: String,
    },
    status: {
      type: String,
      enum: ["placed", "shipped", "delivered", "cancelled"],
      default: "placed",
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
export { orderSchema };