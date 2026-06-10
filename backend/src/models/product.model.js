import mongoose from "mongoose";

const variantSchema = new mongoose.Schema(
  {
    color: { type: String }, // e.g. "Red"
    size: { type: String },  // e.g. "S", "M", "L", "XL"
    price: { type: Number }, // Variant-specific price
    image: { type: String }, // Cloudinary URL for this variant's image
    imagePublicId: { type: String },
    stock: { type: Number, default: 0 },
  },
  { _id: true }
);

const productSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    about: String,
    price: Number,
    discountedPrice: Number,
    discountTag: String,
    allowCustomization: { type: Boolean, default: false },

    // The number of individual products to be customized in this product listing
    numberOfProducts: { type: Number, default: 1 },

    // For "Custom Charms" and "Keychains" categories:
    // The selectable number-of-pieces options shown to the user (e.g. [3, 5, 7]).
    // An empty array means no piece-count selection is required.
    charmPieceOptions: { type: [Number], default: [] },
    totalCharms: { type: Number, default: 0 },

    rating: { type: Number, default: 0 },

    // Main hero image (first image shown)
    mainImage: { type: String },
    mainImagePublicId: { type: String },

    // Additional gallery images (not variant-specific)
    images: [String],
    imagePublicIds: [String],

    // Available colors for this product
    colors: [
      {
        name: { type: String }, // e.g. "Gold", "Silver"
        hex: { type: String },  // e.g. "#FFD700"
        image: { type: String },
        imagePublicId: { type: String },
      },
    ],

    // Available sizes for this product
    sizes: [String], // e.g. ["XS", "S", "M", "L", "XL", "XXL"]

    // Variants: each variant links a color + size to a specific image
    variants: [variantSchema],

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
      enum: ["men", "women", "kids", "unisex"],
    },
    stock: Number,
    tags: [String],
    seoTags: [String],
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
