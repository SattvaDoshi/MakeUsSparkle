import mongoose from "mongoose";

const variantSchema = new mongoose.Schema(
  {
    color: { type: String }, // e.g. "Red"
    size: { type: String },  // e.g. "S", "M", "L", "XL"
    price: { type: Number }, // Variant-specific price
    salePrice: { type: Number }, // Variant-specific sale price
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
    costPrice: Number,
    discountedPrice: Number,
    discountTag: String,
    productLabel: String,
    allowCustomization: { type: Boolean, default: false },
    maxCustomImages: { type: Number, default: 1 },
    customImageLabels: [String],
    displayOrder: { type: Number, default: 0 },

    // Admin defined limits and discounts
    maxQuantity: { type: Number, default: 10 },
    volumeDiscounts: [
      {
        quantity: { type: Number, required: true },
        discountPercentage: { type: Number, required: true },
      }
    ],

    // The number of individual products to be customized in this product listing
    numberOfProducts: { type: Number, default: 1 },
    
    // Named quantity variants (e.g., Single, Pair)
    quantityVariants: [
      {
        label: { type: String },
        quantity: { type: Number },
        price: { type: Number },
      }
    ],

    // For "Custom Charms" and "Keychains" categories:
    // The selectable number-of-pieces options shown to the user (e.g. [3, 5, 7]).
    // An empty array means no piece-count selection is required.
    charmPieceOptions: { type: [Number], default: [] },
    totalCharms: { type: Number, default: 0 },
    perCharmPrice: { type: Number, default: 0 },

    rating: { type: Number, default: 0 },

    // Main hero image (first image shown)
    mainImage: { type: String },
    mainImagePublicId: { type: String },

    // Additional gallery images (not variant-specific)
    images: [String],
    imagePublicIds: [String],

    // Per-product size chart image (Cloudinary URL) and measurement steps
    sizeChartImage: { type: String, default: null },
    sizeChartImagePublicId: { type: String, default: null },
    sizeChartSteps: { type: String, default: "" },

    // Per-product gift box upsell configuration
    giftBox: {
      enabled:       { type: Boolean, default: true },
      heading:       { type: String,  default: "Premium Gift Box" },
      description:   { type: String,  default: "Rigid magnetic-close box · satin ribbon · message card" },
      price:         { type: Number,  default: 99 },
      image:         { type: String,  default: null },
      imagePublicId: { type: String,  default: null },
    },

    // Compulsory partial COD configuration (legacy)
    partialCOD: {
      enabled: { type: Boolean, default: false },
      percentage: { type: Number, default: 0 },
    },

    // Payment mode restriction for this product
    // cod_allowed: COD is available (default)
    // prepaid_only: only online/full payment allowed, no COD or partial
    // partial_cod: partial COD is compulsory — no full COD, must pay advance online
    paymentMode: {
      type: String,
      enum: ['cod_allowed', 'prepaid_only', 'partial_cod'],
      default: 'cod_allowed',
    },

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
    styles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Style",
      }
    ],
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
