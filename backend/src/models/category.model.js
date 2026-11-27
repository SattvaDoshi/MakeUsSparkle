import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: String,
  description: String,
  image: String,
  eyebrow: { type: String, trim: true },
  caption: { type: String, trim: true },
  gender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Gender",
  },
});

const Category = mongoose.model("Category", categorySchema);

export default Category;
export { categorySchema };