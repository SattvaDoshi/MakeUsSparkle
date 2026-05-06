import mongoose from "mongoose";

const genderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String },
  image: { type: String },
  isActive: { type: Boolean, default: true },
});

const Gender = mongoose.model("Gender", genderSchema);

export default Gender;
export { genderSchema };
