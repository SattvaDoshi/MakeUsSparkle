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
			
			// Process variant images
			if (Array.isArray(newProduct.variants)) {
				newProduct.variants = await Promise.all(
					newProduct.variants.map(async (v) => {
						const newVariant = { ...v };
						if (Array.isArray(newVariant.options)) {
							newVariant.options = await Promise.all(
								newVariant.options.map(async (opt) => {
									const newOpt = { ...opt };
									if (opt.imageBuffer) {
										const uploadedOptImage = await imageService.uploadImage(opt.imageBuffer, "combo-variants");
										newOpt.image = uploadedOptImage.url;
										newOpt.imagePublicId = uploadedOptImage.publicId;
										delete newOpt.imageBuffer;
									}
									return newOpt;
								})
							);
						}
						return newVariant;
					})
				);
			}

			// Process chainOptions images
			if (Array.isArray(newProduct.chainOptions)) {
				newProduct.chainOptions = await Promise.all(
					newProduct.chainOptions.map(async (opt) => {
						const newOpt = { ...opt };
						if (opt.imageBuffer) {
							const uploadedOptImage = await imageService.uploadImage(opt.imageBuffer, "combo-chains");
							newOpt.image = uploadedOptImage.url;
							newOpt.imagePublicId = uploadedOptImage.publicId;
							delete newOpt.imageBuffer;
						}
						return newOpt;
					})
				);
			}
			
			return newProduct;
		})
	);
};
const processGalleryImages = async (galleryFiles, data, oldImages = [], oldPublicIds = [], imageService) => {
	let uploadedNew = [];
	if (galleryFiles && galleryFiles.length > 0) {
		const buffers = galleryFiles.map((f) => f.buffer);
		uploadedNew = await imageService.uploadMultipleImages(buffers, "combos");
	}

	let finalImages = [];
	let finalPublicIds = [];

	if (Array.isArray(data.galleryOrder) && data.galleryOrder.length > 0) {
		for (const item of data.galleryOrder) {
			if (item.type === "existing" && item.url) {
				const idx = oldImages.indexOf(item.url);
				finalImages.push(item.url);
				if (idx > -1 && oldPublicIds[idx]) {
					finalPublicIds.push(oldPublicIds[idx]);
				} else {
					finalPublicIds.push(null);
				}
			} else if (item.type === "new" && typeof item.index === "number") {
				const u = uploadedNew[item.index];
				if (u) {
					finalImages.push(u.url);
					finalPublicIds.push(u.publicId);
				}
			}
		}
	} else {
		const existing = data.existingImages
			? Array.isArray(data.existingImages)
				? data.existingImages
				: [data.existingImages]
			: [];
		for (const url of existing) {
			const idx = oldImages.indexOf(url);
			finalImages.push(url);
			if (idx > -1 && oldPublicIds[idx]) {
				finalPublicIds.push(oldPublicIds[idx]);
			} else {
				finalPublicIds.push(null);
			}
		}
		for (const u of uploadedNew) {
			finalImages.push(u.url);
			finalPublicIds.push(u.publicId);
		}
	}

	for (let i = 0; i < oldImages.length; i++) {
		if (!finalImages.includes(oldImages[i])) {
			if (oldPublicIds[i]) {
				await imageService.deleteImage(oldPublicIds[i]).catch((e) =>
					console.error("Could not delete old combo gallery image:", e)
				);
			}
		}
	}

	return { images: finalImages, imagePublicIds: finalPublicIds };
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

	async createCuratedCombo(comboData, imageBuffer = null, galleryFiles = []) {
		try {
			const processedProducts = await processProductsImages(comboData.products, imageService);
			const { images, imagePublicIds } = await processGalleryImages(galleryFiles, comboData, [], [], imageService);
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
				images,
				imagePublicIds,
			});

			return { success: true, combo };
		} catch (error) {
			console.error("Error creating curated combo:", error);
			throw error;
		}
	}

	async createCustomCombo(comboData, imageBuffer = null, galleryFiles = []) {
		try {
			const processedProducts = await processProductsImages(comboData.products, imageService);
			const { images, imagePublicIds } = await processGalleryImages(galleryFiles, comboData, [], [], imageService);
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
				images,
				imagePublicIds,
			});

			return { success: true, combo };
		} catch (error) {
			console.error("Error creating custom combo:", error);
			throw error;
		}
	}

	async updateCombo(comboId, updateData, newImageBuffer = null, galleryFiles = []) {
		try {
			const normalizedUpdateData = { ...updateData };

			if (Object.prototype.hasOwnProperty.call(updateData, "products")) {
				normalizedUpdateData.products = await processProductsImages(updateData.products, imageService);
			}

			const combo = await Combo.findById(comboId);
			if (!combo) {
				throw new Error("Combo not found");
			}

			const { images, imagePublicIds } = await processGalleryImages(
				galleryFiles,
				updateData,
				combo.images || [],
				combo.imagePublicIds || [],
				imageService
			);
			normalizedUpdateData.images = images;
			normalizedUpdateData.imagePublicIds = imagePublicIds;

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
			if (combo.imagePublicIds && combo.imagePublicIds.length > 0) {
				const validIds = combo.imagePublicIds.filter(Boolean);
				if (validIds.length > 0) {
					await imageService.deleteMultipleImages(validIds).catch((e) => console.error("Could not delete combo gallery images:", e));
				}
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
