import mongoose from "mongoose";

const styleSchema = new mongoose.Schema({
  name: String,
  image: String,
  slug: { type: String, trim: true, lowercase: true, index: true },
  gender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Gender",
  },
});

const Style = mongoose.model("Style", styleSchema);

export default Style;
export { styleSchema };