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
    resetPasswordOtp: String,
    resetPasswordOtpExpiry: Date,
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    addresses: [
      {
        addressLine1: String,
        addressLine2: String,
        fullAddress: String,
        landmark: String,
        city: String,
        state: String,
        pincode: String,
        phone: String,
        alternativePhone: String,
      },
    ],
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    referralCode: String,
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    rewardPoints: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
export { userSchema };