import HomeSection from "../models/homeSection.model.js";
import Product from "../models/product.model.js";
import imageService from "../services/image.service.js";

const NEW_ARRIVALS_KEY = "new-arrivals";
const OPEN_SECTION_KEY = "open-section";

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

async function getOrCreateOpenSection() {
	return HomeSection.findOneAndUpdate(
		{ key: OPEN_SECTION_KEY },
		{
			$setOnInsert: {
				key: OPEN_SECTION_KEY,
				eyebrow: "",
				title: "New Arrivals",
				items: [],
				isActive: true,
			},
		},
		{ new: true, upsert: true }
	).populate("items.product");
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

export async function getOpenSection(req, res) {
	try {
		const section = await getOrCreateOpenSection();
		res.json({ success: true, section });
	} catch (error) {
		console.error("Get open section error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

export async function updateOpenSection(req, res) {
	try {
		// Parse items from body (sent as JSON string or array)
		let rawItems = [];
		try {
			rawItems = typeof req.body.items === "string"
				? JSON.parse(req.body.items)
				: Array.isArray(req.body.items)
				? req.body.items
				: [];
		} catch (_) {
			rawItems = [];
		}

		// Fetch current section to get existing image publicIds for deletion
		const existing = await HomeSection.findOne({ key: OPEN_SECTION_KEY });
		const existingItemsMap = new Map();
		if (existing?.items) {
			for (const item of existing.items) {
				existingItemsMap.set(String(item._id), item);
			}
		}

		// Handle uploaded image files (req.files is an array when using multer's .any())
		const fileArray = Array.isArray(req.files) ? req.files : [];
		const filesByField = {};
		for (const f of fileArray) {
			filesByField[f.fieldname] = f;
		}

		const processedItems = [];
		for (let i = 0; i < rawItems.length; i++) {
			const raw = rawItems[i];
			if (!raw || !raw.type) continue;

			if (raw.type === "product") {
				// Validate product exists
				const productId = String(raw.product || "").trim();
				if (!productId) continue;
				const exists = await Product.exists({ _id: productId });
				if (!exists) continue;
				processedItems.push({
					type: "product",
					product: productId,
					sortOrder: i,
				});
			} else if (raw.type === "category") {
				const itemData = {
					type: "category",
					link: String(raw.link || "").trim(),
					label: String(raw.label || "").trim(),
					sortOrder: i,
					image: raw.image || "",
					imagePublicId: raw.imagePublicId || "",
				};

				// Check if a new image file was uploaded for this index
				const fileKey = `categoryImage_${i}`;
				const uploadedFile = filesByField[fileKey];
				if (uploadedFile) {
					// Delete old image if present
					if (raw.imagePublicId) {
						try {
							await imageService.deleteImage(raw.imagePublicId);
						} catch (_) {}
					}
					const uploaded = await imageService.uploadImage(uploadedFile.buffer, "home/open-section");
					itemData.image = uploaded.url;
					itemData.imagePublicId = uploaded.publicId;
				}

				processedItems.push(itemData);
			}
		}

		const section = await HomeSection.findOneAndUpdate(
			{ key: OPEN_SECTION_KEY },
			{
				$set: {
					key: OPEN_SECTION_KEY,
					eyebrow: String(req.body.eyebrow || "").trim(),
					title: String(req.body.title || "").trim(),
					items: processedItems,
					isActive: req.body.isActive !== "false" && req.body.isActive !== false,
				},
			},
			{ new: true, upsert: true, runValidators: true }
		).populate("items.product");

		res.json({ success: true, section });
	} catch (error) {
		console.error("Update open section error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

