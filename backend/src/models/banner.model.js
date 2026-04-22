import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema({
  text: String,
  link: String,
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  },
  description: String,
  tags: [String],
});

const Banner = mongoose.model("Banner", bannerSchema);

export default Banner;
export { bannerSchema };