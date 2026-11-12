import mongoose from "mongoose";

// "Watch & Buy" — short vertical videos, each linked to one product.
// Videos live on Cloudinary (uploaded straight from the admin browser); only the
// reference is stored here, so the API stays light.
const watchBuyVideoSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, default: "" },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    // Cloudinary asset id (preferred): lets us derive an optimised stream + poster.
    publicId: { type: String, trim: true, default: "" },
    // Original / external video URL (fallback when no Cloudinary id, e.g. a pasted mp4 link).
    videoUrl: { type: String, trim: true, default: "" },
    // Optional custom poster image (otherwise the first frame is used).
    posterUrl: { type: String, trim: true, default: "" },
    duration: { type: Number, default: 0 }, // seconds
    gender: { type: String, enum: ["women", "men", "kids", "all"], default: "all", index: true },
    isActive: { type: Boolean, default: true, index: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

watchBuyVideoSchema.index({ isActive: 1, gender: 1, sortOrder: 1, createdAt: -1 });

const WatchBuyVideo = mongoose.model("WatchBuyVideo", watchBuyVideoSchema);
export default WatchBuyVideo;
