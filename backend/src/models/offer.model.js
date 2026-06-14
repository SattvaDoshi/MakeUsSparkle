import mongoose from "mongoose";

const offerSchema = new mongoose.Schema(
	{
		title: { type: String, required: true, trim: true },
		description: { type: String, default: "", trim: true },
		offerType: {
			type: String,
			enum: ["bogo", "percentage", "fixed", "buy_x_for_y", "free_shipping"],
			required: true,
		},
		discountValue: { type: Number, default: 0, min: 0 },
		buyQuantity: { type: Number, default: 1, min: 1 },
		getQuantity: { type: Number, default: 1, min: 1 },
		startsAt: Date,
		expiryDate: Date,
		isActive: { type: Boolean, default: true },
		usageLimit: { type: Number, default: 0, min: 0 },
		usedCount: { type: Number, default: 0, min: 0 },
		image: { type: String, default: "", trim: true },
		applicableCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
		applicableProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
	},
	{
		timestamps: true,
	}
);

const Offer = mongoose.model("Offer", offerSchema);

export default Offer;
export { offerSchema };
