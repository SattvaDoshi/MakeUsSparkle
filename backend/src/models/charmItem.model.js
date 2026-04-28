import mongoose from "mongoose";

const charmItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, default: "/images/hero.png" },
    imagePublicId: String,
    emoji: { type: String, default: "" },
    charmCategory: {
      type: String,
      enum: ["initials", "symbols", "birthstones", "custom", "designs", "characters"],
      default: "designs",
    },
    // Which product category this charm belongs to: "custom-charm-jewellery" or "keychains"
    parentCategory: {
      type: String,
      enum: ["custom-charm-jewellery", "keychains"],
      required: true,
    },
    customisable: { type: Boolean, default: false },
    hasPhotoUpload: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

charmItemSchema.index({ parentCategory: 1, charmCategory: 1, sortOrder: 1 });

const CharmItem = mongoose.model("CharmItem", charmItemSchema);

export default CharmItem;
export { charmItemSchema };
