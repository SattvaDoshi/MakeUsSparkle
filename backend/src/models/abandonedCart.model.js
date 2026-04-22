import mongoose from "mongoose";

const abandonedSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  reason: String,
  date: { type: Date, default: Date.now },
});

const AbandonedCart = mongoose.model("AbandonedCart", abandonedSchema);

export default AbandonedCart;
export { abandonedSchema };