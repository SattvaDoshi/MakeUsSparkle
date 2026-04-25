import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    price: Number,
    rating: { type: Number, default: 0 },
    images: [String],
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
    },
    style: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Style",
    },
    gender: {
      type: String,
      enum: ["male", "female", "unisex"],
    },
    stock: Number,
    tags: [String],
    faqs: [
      {
        question: String,
        answer: String,
      },
    ],
    reviews: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        rating: Number,
        comment: String,
      },
    ],
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
export { productSchema };