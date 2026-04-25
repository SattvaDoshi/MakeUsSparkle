import mongoose from "mongoose";

const subCategorySchema = new mongoose.Schema({
  name: String,
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },
  image: String,
});

const SubCategory = mongoose.model("SubCategory", subCategorySchema);

export default SubCategory;
export { subCategorySchema };