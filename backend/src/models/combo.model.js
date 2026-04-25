import mongoose from "mongoose";

const comboSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    type: {
      type: String,
      enum: ["curated", "custom"],
    },
    products: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: Number,
      },
    ],
    price: Number,
    image: String,
  },
  { timestamps: true }
);

const Combo = mongoose.model("Combo", comboSchema);

export default Combo;
export { comboSchema };