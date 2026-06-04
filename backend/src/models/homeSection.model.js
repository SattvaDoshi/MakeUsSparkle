import mongoose from "mongoose";

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
		isActive: {
			type: Boolean,
			default: true,
		},
	},
	{ timestamps: true }
);

const HomeSection = mongoose.model("HomeSection", homeSectionSchema);

export default HomeSection;
