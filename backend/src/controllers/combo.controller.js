import comboService from "../services/combo.service.js";

function parseComboData(req) {
	let data = { ...req.body };
	if (typeof data.products === "string") {
		try {
			data.products = JSON.parse(data.products);
		} catch (e) {
			console.error("Failed to parse combo products JSON:", e);
		}
	}
	if (typeof data.pricingVariants === "string") {
		try {
			data.pricingVariants = JSON.parse(data.pricingVariants);
		} catch (e) {
			data.pricingVariants = [];
		}
	}
	if (typeof data.seoTags === "string") {
		try {
			data.seoTags = JSON.parse(data.seoTags);
		} catch (e) {
			data.seoTags = [];
		}
	}
	// Parse boolean string fields
	["allowComboTextCustomization", "allowComboImageCustomization"].forEach(k => {
		if (typeof data[k] === "string") data[k] = data[k] === "true";
	});
	if (data.comboMaxImageUploads !== undefined) data.comboMaxImageUploads = Number(data.comboMaxImageUploads) || 1;

	const files = req.files || [];
	const imageBuffer = files.find((f) => f.fieldname === "image")?.buffer;
	const galleryFiles = files.filter((f) => f.fieldname === "images");

	if (typeof data.galleryOrder === "string") {
		try {
			data.galleryOrder = JSON.parse(data.galleryOrder);
		} catch (e) {
			data.galleryOrder = [];
		}
	}
	if (typeof data.existingImages === "string") {
		try {
			data.existingImages = JSON.parse(data.existingImages);
		} catch (e) {
			data.existingImages = [];
		}
	}

	if (Array.isArray(data.products)) {
		data.products = data.products.map((p, pIndex) => {
			const productImgFile = files.find((f) => f.fieldname === `productImage_${pIndex}`);
			if (productImgFile) {
				p.imageBuffer = productImgFile.buffer;
			}
			
			// Extract variant images
			if (Array.isArray(p.variants)) {
				p.variants = p.variants.map((v, vIndex) => {
					if (Array.isArray(v.options)) {
						v.options = v.options.map((opt, optIndex) => {
							const optImgFile = files.find((f) => f.fieldname === `variantImage_${pIndex}_${vIndex}_${optIndex}`);
							if (optImgFile) {
								opt.imageBuffer = optImgFile.buffer;
							}
							return opt;
						});
					}
					return v;
				});
			}
			return p;
		});
	}

	return { data, imageBuffer, galleryFiles };
}

export async function getCombos(req, res) {
	try {
		const type = req.query.type || null;
		const result = await comboService.getCombos(type);
		res.json(result);
	} catch (error) {
		console.error("Get combos error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

export async function getComboById(req, res) {
	try {
		const result = await comboService.getComboById(req.params.id);
		res.json(result);
	} catch (error) {
		console.error("Get combo error:", error);
		res.status(404).json({ success: false, message: error.message });
	}
}

export async function createCuratedCombo(req, res) {
	try {
		const { data, imageBuffer, galleryFiles } = parseComboData(req);
		const result = await comboService.createCuratedCombo(data, imageBuffer, galleryFiles);
		res.status(201).json(result);
	} catch (error) {
		console.error("Create curated combo error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

export async function createCustomCombo(req, res) {
	try {
		const { data, imageBuffer, galleryFiles } = parseComboData(req);
		const result = await comboService.createCustomCombo(data, imageBuffer, galleryFiles);
		res.status(201).json(result);
	} catch (error) {
		console.error("Create custom combo error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

export async function updateCombo(req, res) {
	try {
		const { data, imageBuffer, galleryFiles } = parseComboData(req);
		const result = await comboService.updateCombo(req.params.id, data, imageBuffer, galleryFiles);
		res.json(result);
	} catch (error) {
		console.error("Update combo error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

export async function deleteCombo(req, res) {
	try {
		const result = await comboService.deleteCombo(req.params.id);
		res.json(result);
	} catch (error) {
		console.error("Delete combo error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}