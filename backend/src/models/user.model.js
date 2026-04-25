import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    phone: String,
    password: String,
    dob: Date,
    gender: { type: String, enum: ["male", "female", "other"] },
    emailVerified: { type: Boolean, default: false },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    addresses: [
      {
        fullAddress: String,
        city: String,
        state: String,
        pincode: String,
      },
    ],
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    referralCode: String,
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
export { userSchema };