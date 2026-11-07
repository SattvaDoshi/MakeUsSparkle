import mongoose from "mongoose";

const affiliateLinkSchema = new mongoose.Schema(
	{
		affiliate: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
		product: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Product",
			default: null,
			index: true,
		},
		combo: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Combo",
			default: null,
			index: true,
		},
		itemType: {
			type: String,
			enum: ["product", "combo"],
			default: "product",
		},
		itemTitle: {
			type: String,
			default: "",
		},
		itemImage: {
			type: String,
			default: "",
		},
		itemPrice: {
			type: Number,
			default: 0,
		},
		itemCategory: {
			type: String,
			default: "",
		},
		affiliateCode: {
			type: String,
			required: true,
			index: true,
		},
		linkCode: {
			type: String,
			required: true,
			unique: true,
			index: true,
		},
		url: {
			type: String,
			required: true,
		},
		clicks: {
			type: Number,
			default: 0,
		},
		ordersCount: {
			type: Number,
			default: 0,
		},
		totalEarned: {
			type: Number,
			default: 0,
		},
	},
	{ timestamps: true }
);

affiliateLinkSchema.index({ affiliate: 1, product: 1 }, { sparse: true });
affiliateLinkSchema.index({ affiliate: 1, combo: 1 }, { sparse: true });

const AffiliateLink = mongoose.model("AffiliateLink", affiliateLinkSchema);
export default AffiliateLink;

