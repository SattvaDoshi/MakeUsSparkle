import Combo from "../models/combo.model.js";
import imageService from "./image.service.js";

const normalizeObjectId = (value) => {
	if (typeof value === "string") {
		const trimmed = value.trim();
		return trimmed || undefined;
	}

	if (value && typeof value === "object" && typeof value._id === "string") {
		const trimmed = value._id.trim();
		return trimmed || undefined;
	}

	return undefined;
};

const normalizeObjectIdArray = (values) => {
	if (!Array.isArray(values)) {
		return [];
	}

	return values.map(normalizeObjectId).filter(Boolean);
};

const normalizeCuratedSlots = (slots) => {
	if (!Array.isArray(slots)) {
		return slots;
	}

	return slots
		.map((slot) => {
			if (!slot || typeof slot !== "object") {
				return null;
			}

			const normalizedSlot = {
				...slot,
				category: normalizeObjectId(slot.category),
				allowedProducts: normalizeObjectIdArray(slot.allowedProducts),
			};

			const defaultProduct = normalizeObjectId(slot.defaultProduct);
			if (defaultProduct) {
				normalizedSlot.defaultProduct = defaultProduct;
			} else {
				delete normalizedSlot.defaultProduct;
			}

			if (!normalizedSlot.category) {
				return null;
			}

			return normalizedSlot;
		})
		.filter(Boolean);
};

class ComboService {
	async getCombos(type = null) {
		try {
			const query = type ? { type } : {};
			const combos = await Combo.find(query)
				.populate(["slots.category", "slots.allowedProducts", "slots.defaultProduct"])
				.populate("categories")
				.populate("styles")
				.sort({ createdAt: -1 });
			return { success: true, combos };
		} catch (error) {
			console.error("Error fetching combos:", error);
			throw error;
		}
	}

	async getComboById(comboId) {
		try {
			const combo = await Combo.findById(comboId)
				.populate(["slots.category", "slots.allowedProducts", "slots.defaultProduct"])
				.populate("categories")
				.populate("styles");
			if (!combo) {
				throw new Error("Combo not found");
			}
			return { success: true, combo };
		} catch (error) {
			console.error("Error fetching combo:", error);
			throw error;
		}
	}

	async createCuratedCombo(comboData, imageBuffer = null) {
		try {
			const curatedData = {
				...comboData,
				slots: normalizeCuratedSlots(comboData.slots),
			};

			let imageUrl = null;
			let imagePublicId = null;

			// Upload image if provided
			if (imageBuffer) {
				const uploadedImage = await imageService.uploadImage(imageBuffer, "combos");
				imageUrl = uploadedImage.url;
				imagePublicId = uploadedImage.publicId;
			}

			const combo = await Combo.create({
				...curatedData,
				type: "curated",
				image: imageUrl,
				imagePublicId,
			});

			await combo.populate(["slots.category", "slots.allowedProducts", "slots.defaultProduct"]);

			return { success: true, combo };
		} catch (error) {
			console.error("Error creating curated combo:", error);
			throw error;
		}
	}

	async createCustomCombo(comboData, imageBuffer = null) {
		try {
			const customData = {
				...comboData,
				categories: normalizeObjectIdArray(comboData.categories),
				styles: normalizeObjectIdArray(comboData.styles),
			};

			let imageUrl = null;
			let imagePublicId = null;

			// Upload image if provided
			if (imageBuffer) {
				const uploadedImage = await imageService.uploadImage(imageBuffer, "combos");
				imageUrl = uploadedImage.url;
				imagePublicId = uploadedImage.publicId;
			}

			const combo = await Combo.create({
				...customData,
				type: "custom",
				image: imageUrl,
				imagePublicId,
			});

			await combo.populate(["categories", "styles"]);

			return { success: true, combo };
		} catch (error) {
			console.error("Error creating custom combo:", error);
			throw error;
		}
	}

	async updateCombo(comboId, updateData, newImageBuffer = null) {
		try {
			const normalizedUpdateData = { ...updateData };

			if (Object.prototype.hasOwnProperty.call(updateData, "slots")) {
				normalizedUpdateData.slots = normalizeCuratedSlots(updateData.slots);
			}

			if (Object.prototype.hasOwnProperty.call(updateData, "categories")) {
				normalizedUpdateData.categories = normalizeObjectIdArray(updateData.categories);
			}

			if (Object.prototype.hasOwnProperty.call(updateData, "styles")) {
				normalizedUpdateData.styles = normalizeObjectIdArray(updateData.styles);
			}

			const combo = await Combo.findById(comboId);
			if (!combo) {
				throw new Error("Combo not found");
			}

			// Handle image update for curated combos
			if (newImageBuffer) {
				if (combo.imagePublicId) {
					await imageService.deleteImage(combo.imagePublicId);
				}

				const uploadedImage = await imageService.uploadImage(newImageBuffer, "combos");
				normalizedUpdateData.image = uploadedImage.url;
				normalizedUpdateData.imagePublicId = uploadedImage.publicId;
			}

			const updatedCombo = await Combo.findByIdAndUpdate(comboId, normalizedUpdateData, { returnDocument: "after" })
				.populate(["slots.category", "slots.allowedProducts", "slots.defaultProduct"])
				.populate("categories")
				.populate("styles");

			return { success: true, combo: updatedCombo };
		} catch (error) {
			console.error("Error updating combo:", error);
			throw error;
		}
	}

	async deleteCombo(comboId) {
		try {
			const combo = await Combo.findById(comboId);
			if (!combo) {
				throw new Error("Combo not found");
			}

			// Delete image from Cloudinary if it exists
			if (combo.imagePublicId) {
				await imageService.deleteImage(combo.imagePublicId);
			}

			await Combo.findByIdAndDelete(comboId);

			return { success: true, message: "Combo deleted successfully" };
		} catch (error) {
			console.error("Error deleting combo:", error);
			throw error;
		}
	}
}

export default new ComboService();
