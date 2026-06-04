import HomeSection from "../models/homeSection.model.js";
import Product from "../models/product.model.js";

const NEW_ARRIVALS_KEY = "new-arrivals";

function normalizeProductIds(value) {
	if (!Array.isArray(value)) return [];
	return value.map((id) => String(id || "").trim()).filter(Boolean);
}

async function getOrCreateNewArrivals() {
	return HomeSection.findOneAndUpdate(
		{ key: NEW_ARRIVALS_KEY },
		{
			$setOnInsert: {
				key: NEW_ARRIVALS_KEY,
				eyebrow: "Fresh off the shelf",
				title: "New Arrivals",
				products: [],
				isActive: true,
			},
		},
		{ new: true, upsert: true }
	).populate("products");
}

export async function getNewArrivalsSection(req, res) {
	try {
		const section = await getOrCreateNewArrivals();
		res.json({ success: true, section });
	} catch (error) {
		console.error("Get new arrivals section error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

export async function updateNewArrivalsSection(req, res) {
	try {
		const productIds = normalizeProductIds(req.body.products);
		const existingProducts = productIds.length
			? await Product.find({ _id: { $in: productIds } }).select("_id")
			: [];
		const existingIdSet = new Set(existingProducts.map((product) => String(product._id)));
		const orderedProductIds = productIds.filter((id) => existingIdSet.has(id));

		const section = await HomeSection.findOneAndUpdate(
			{ key: NEW_ARRIVALS_KEY },
			{
				$set: {
					key: NEW_ARRIVALS_KEY,
					eyebrow: String(req.body.eyebrow || "").trim(),
					title: String(req.body.title || "").trim(),
					products: orderedProductIds,
					isActive: req.body.isActive !== false,
				},
			},
			{ new: true, upsert: true, runValidators: true }
		).populate("products");

		res.json({ success: true, section });
	} catch (error) {
		console.error("Update new arrivals section error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}
