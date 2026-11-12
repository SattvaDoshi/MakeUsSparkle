import HomeSection from "../models/homeSection.model.js";
import Product from "../models/product.model.js";
import imageService from "../services/image.service.js";
import productService from "../services/product.service.js";

const NEW_ARRIVALS_KEY = "new-arrivals";
const OPEN_SECTION_KEY = "open-section";

function getNewArrivalsKey(gender) {
	const g = String(gender || "").trim().toLowerCase();
	if (["women", "men", "kids"].includes(g)) return `new-arrivals-${g}`;
	return NEW_ARRIVALS_KEY;
}

function getOpenSectionKey(gender) {
	const g = String(gender || "").trim().toLowerCase();
	if (["women", "men", "kids"].includes(g)) return `open-section-${g}`;
	return OPEN_SECTION_KEY;
}

function normalizeProductIds(value) {
	if (!Array.isArray(value)) return [];
	return value.map((id) => String(id || "").trim()).filter(Boolean);
}

async function getOrCreateNewArrivals(gender) {
	const key = getNewArrivalsKey(gender);
	let section = await HomeSection.findOne({ key }).populate("products");
	if (!section && key === "new-arrivals-women") {
		const legacy = await HomeSection.findOne({ key: NEW_ARRIVALS_KEY }).populate("products");
		if (legacy) {
			section = await HomeSection.create({
				key: "new-arrivals-women",
				eyebrow: legacy.eyebrow || "Fresh off the shelf",
				title: legacy.title || "New Arrivals",
				products: legacy.products || [],
				isActive: legacy.isActive !== false,
			});
			await section.populate("products");
		}
	}
	if (!section) {
		const isWomen = key.includes("women") || key === NEW_ARRIVALS_KEY;
		section = await HomeSection.create({
			key,
			eyebrow: isWomen ? "Fresh off the shelf" : "",
			title: isWomen ? "New Arrivals" : `${gender ? String(gender).charAt(0).toUpperCase() + String(gender).slice(1) : ""} New Arrivals`.trim(),
			products: [],
			isActive: true,
		});
	}
	return section;
}

async function getOrCreateOpenSection(gender) {
	const key = getOpenSectionKey(gender);
	let section = await HomeSection.findOne({ key }).populate("items.product");
	if (!section && key === "open-section-women") {
		const legacy = await HomeSection.findOne({ key: OPEN_SECTION_KEY }).populate("items.product");
		if (legacy) {
			section = await HomeSection.create({
				key: "open-section-women",
				eyebrow: legacy.eyebrow || "",
				title: legacy.title || "New Arrivals",
				items: legacy.items || [],
				isActive: legacy.isActive !== false,
			});
			await section.populate("items.product");
		}
	}
	if (!section) {
		section = await HomeSection.create({
			key,
			eyebrow: "",
			title: `${gender ? String(gender).charAt(0).toUpperCase() + String(gender).slice(1) : ""} Trending`.trim() || "Trending Now",
			items: [],
			isActive: true,
		});
	}
	return section;
}

export async function getNewArrivalsSection(req, res) {
	try {
		const gender = req.query.gender;
		const sectionDoc = await getOrCreateNewArrivals(gender);
		const section = sectionDoc ? sectionDoc.toObject() : null;
		if (section && Array.isArray(section.products)) {
			await productService.attachOfferTags(section.products);
		}
		res.json({ success: true, section });
	} catch (error) {
		console.error("Get new arrivals section error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

export async function updateNewArrivalsSection(req, res) {
	try {
		const gender = req.body.gender || req.query.gender;
		const key = getNewArrivalsKey(gender);
		const productIds = normalizeProductIds(req.body.products);
		const existingProducts = productIds.length
			? await Product.find({ _id: { $in: productIds } }).select("_id")
			: [];
		const existingIdSet = new Set(existingProducts.map((product) => String(product._id)));
		const orderedProductIds = productIds.filter((id) => existingIdSet.has(id));

		const section = await HomeSection.findOneAndUpdate(
			{ key },
			{
				$set: {
					key,
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
		const gender = req.query.gender;
		const sectionDoc = await getOrCreateOpenSection(gender);
		const section = sectionDoc ? sectionDoc.toObject() : null;
		if (section && Array.isArray(section.items)) {
			const prods = section.items.map((item) => item?.product).filter(Boolean);
			await productService.attachOfferTags(prods);
		}
		res.json({ success: true, section });
	} catch (error) {
		console.error("Get open section error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

export async function updateOpenSection(req, res) {
	try {
		const gender = req.body.gender || req.query.gender;
		const key = getOpenSectionKey(gender);

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
		const existing = await HomeSection.findOne({ key });
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
			{ key },
			{
				$set: {
					key,
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

