import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        sourceId: String,
        name: String,
        category: String,
        quantity: Number,
        price: Number,
        color: String,
        colorHex: String,
        size: String,
        sku: String,
        customNote: String,
        customImages: [String],
        selectedCharms: [{ type: mongoose.Schema.Types.ObjectId, ref: "CharmItem" }],
        selectionGroups: [
          {
            type: { type: String, default: "multi_item_selection" },
            category: String,
            label: String,
            selectionKey: String,
            // itemRefModel stored for metadata / future multi-model support
            itemRefModel: { type: String, default: "CharmItem" },
            items: [
              {
                // ObjectId reference — currently always a CharmItem.
                // Using ref: "CharmItem" directly (refPath on a nested subdoc field
                // requires the refPath field to be on the same subdocument, which
                // Mongoose does not support reliably across nested arrays).
                item: { type: mongoose.Schema.Types.ObjectId, ref: "CharmItem" },
                sourceId: String,
                name: String,
                quantity: { type: Number, default: 1 },
                price: { type: Number, default: 0 },
                image: String,
                images: [String],
                emoji: String,
                customText: String,
                customData: mongoose.Schema.Types.Mixed,
              },
            ],
            metadata: mongoose.Schema.Types.Mixed,
          },
        ],
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
