import mongoose from "mongoose";

const styleSchema = new mongoose.Schema({
  name: String,
  image: String,
});

const Style = mongoose.model("Style", styleSchema);

export default Style;
export { styleSchema };