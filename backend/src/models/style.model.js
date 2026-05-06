import mongoose from "mongoose";

const styleSchema = new mongoose.Schema({
  name: String,
  image: String,
  slug: { type: String, trim: true, lowercase: true, index: true },
  gender: { type: String, enum: ["male", "female", "unisex"], default: "unisex" },
});

const Style = mongoose.model("Style", styleSchema);

export default Style;
export { styleSchema };