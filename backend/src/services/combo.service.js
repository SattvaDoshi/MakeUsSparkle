import Combo from "../models/combo.model.js";
import imageService from "./image.service.js";

const processProductsImages = async (products, imageService) => {
	if (!Array.isArray(products)) {
		return [];
	}

	return await Promise.all(
		products.map(async (p) => {
			const newProduct = { ...p };
			if (p.imageBuffer) {
				const uploadedImage = await imageService.uploadImage(p.imageBuffer, "combo-products");
				newProduct.image = uploadedImage.url;
				newProduct.imagePublicId = uploadedImage.publicId;
				delete newProduct.imageBuffer;
			}
			return newProduct;
		})
	);
};
class ComboService {
	async getCombos(type = null) {
		try {
			const query = type ? { type } : {};
			const combos = await Combo.find(query)
				.sort({ createdAt: -1 });
			return { success: true, combos };
		} catch (error) {
			console.error("Error fetching combos:", error);
			throw error;
		}
	}

	async getComboById(comboId) {
		try {
			const combo = await Combo.findById(comboId);
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
			const processedProducts = await processProductsImages(comboData.products, imageService);
			const curatedData = {
				...comboData,
				products: processedProducts,
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

			// Products are now embedded, no need to populate
			// await combo.populate("products");

			return { success: true, combo };
		} catch (error) {
			console.error("Error creating curated combo:", error);
			throw error;
		}
	}

	async createCustomCombo(comboData, imageBuffer = null) {
		try {
			const processedProducts = await processProductsImages(comboData.products, imageService);
			const customData = {
				...comboData,
				products: processedProducts,
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

			// Products are now embedded, no need to populate
			// await combo.populate("products");

			return { success: true, combo };
		} catch (error) {
			console.error("Error creating custom combo:", error);
			throw error;
		}
	}

	async updateCombo(comboId, updateData, newImageBuffer = null) {
		try {
			const normalizedUpdateData = { ...updateData };

			if (Object.prototype.hasOwnProperty.call(updateData, "products")) {
				normalizedUpdateData.products = await processProductsImages(updateData.products, imageService);
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

			const updatedCombo = await Combo.findByIdAndUpdate(comboId, normalizedUpdateData, { returnDocument: "after" });

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
