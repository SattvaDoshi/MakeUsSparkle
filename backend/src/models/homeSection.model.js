import mongoose from "mongoose";

const openSectionItemSchema = new mongoose.Schema(
	{
		type: {
			type: String,
			enum: ["product", "category"],
			required: true,
		},
		// If type === "product"
		product: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Product",
			default: null,
		},
		// If type === "category"
		image: {
			type: String,
			default: "",
		},
		imagePublicId: {
			type: String,
			default: "",
		},
		link: {
			type: String,
			default: "",
		},
		label: {
			type: String,
			default: "",
		},
		sortOrder: {
			type: Number,
			default: 0,
		},
	},
	{ _id: true }
);

const homeSectionSchema = new mongoose.Schema(
	{
		key: {
			type: String,
			required: true,
			unique: true,
			trim: true,
		},
		eyebrow: {
			type: String,
			default: "",
			trim: true,
		},
		title: {
			type: String,
			default: "",
			trim: true,
		},
		products: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Product",
			},
		],
		// Used by the "open-section" key — supports mixed product/category items
		items: [openSectionItemSchema],
		isActive: {
			type: Boolean,
			default: true,
		},
	},
	{ timestamps: true }
);

const HomeSection = mongoose.model("HomeSection", homeSectionSchema);

export default HomeSection;
