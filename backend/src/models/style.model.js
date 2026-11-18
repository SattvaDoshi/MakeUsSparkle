import mongoose from "mongoose";

const styleSchema = new mongoose.Schema({
  name: String,
  image: String,
  slug: { type: String, trim: true, lowercase: true, index: true },
  // Shown on the style page above/below the heading (the heading itself is `name`).
  // Left undefined until an admin sets them; an empty string means "intentionally blank".
  eyebrow: { type: String, trim: true },
  caption: { type: String, trim: true },
  gender: {
    type: mongoose.Schema.Types.Mixed,
    ref: "Gender",
  },
});

const Style = mongoose.model("Style", styleSchema);

export default Style;
export { styleSchema };