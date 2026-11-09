import mongoose from "mongoose";

const faqSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true, maxlength: 200 },
    answer: { type: String, required: true, trim: true, maxlength: 3000 },
    isActive: { type: Boolean, default: true, index: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

faqSchema.index({ isActive: 1, sortOrder: 1, createdAt: 1 });

const Faq = mongoose.model("Faq", faqSchema);
export default Faq;
