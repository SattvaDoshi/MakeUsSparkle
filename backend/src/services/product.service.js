import Product from "../models/product.model.js";
import Gender from "../models/gender.model.js";
import Category from "../models/category.model.js";
import Style from "../models/style.model.js";
import imageService from "./image.service.js";
import mongoose from "mongoose";

const PRODUCT_GENDERS = ["men", "women", "kids", "unisex"];

const toSlug = (value = "") =>
	String(value)
		.toLowerCase()
		.trim()
		.replace(/&/g, " and ")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/(^-|-$)/g, "");

const stripHtml = (value = "") =>
	String(value)
		.replace(/<br\s*\/?>/gi, "\n")
		.replace(/<\/(p|div|li|h[1-6])>/gi, "\n")
		.replace(/<[^>]*>/g, "")
		.replace(/&nbsp;/gi, " ")
		.replace(/&amp;/gi, "&")
		.replace(/&lt;/gi, "<")
		.replace(/&gt;/gi, ">")
		.replace(/\r\n/g, "\n")
		.replace(/\n{3,}/g, "\n\n")
		.trim();

const escapeRegExp = (value = "") => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const parseBoolean = (value) => value === true || value === "true" || value === "1" || value === 1;

const normalizeStringArray = (value) => {
	if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
	if (!value) return [];
	return String(value)
		.split(",")
		.map((item) => item.trim())
		.filter(Boolean);
};

class ProductService {
	async _normalizeProductGender(value) {
		if (!value) return undefined;
		const raw = String(value).trim();
		const directSlug = toSlug(raw);
		if (PRODUCT_GENDERS.includes(directSlug)) return directSlug;

		let genderDoc = null;
		if (mongoose.Types.ObjectId.isValid(raw)) {
			genderDoc = await Gender.findById(raw).lean();
		}
		if (!genderDoc) {
			genderDoc = await Gender.findOne({
				$or: [{ slug: directSlug }, { name: new RegExp(`^${escapeRegExp(raw)}$`, "i") }],
			}).lean();
		}

		const resolvedSlug = toSlug(genderDoc?.slug || genderDoc?.name || "");
		return PRODUCT_GENDERS.includes(resolvedSlug) ? resolvedSlug : undefined;
	}

	buildProductQuery(queryParams) {
		const { category, subCategory, style, gender, minPrice, maxPrice, rating } = queryParams;
		const query = {};

		if (category) query.category = category;
		if (subCategory) query.subCategory = subCategory;
		if (style) query.style = style;
		if (gender) query.gender = gender;
		if (rating) query.rating = { $gte: Number(rating) };
		if (minPrice || maxPrice) {
			query.price = {};
			if (minPrice) query.price.$gte = Number(minPrice);
			if (maxPrice) query.price.$lte = Number(maxPrice);
		}

		return query;
	}

	async getProducts(queryParams = {}) {
		try {
			const query = this.buildProductQuery(queryParams);
			let productQuery = Product.find(query);

			// Apply sorting
			if (queryParams.sort === "price_asc") productQuery = productQuery.sort({ price: 1 });
			if (queryParams.sort === "price_desc") productQuery = productQuery.sort({ price: -1 });
			if (queryParams.sort === "rating_desc") productQuery = productQuery.sort({ rating: -1 });
			if (queryParams.sort === "rating_asc") productQuery = productQuery.sort({ rating: 1 });

			const products = await productQuery;
			return { success: true, products };
		} catch (error) {
			console.error("Error fetching products:", error);
			throw error;
		}
	}

	async getTags() {
		try {
			const tags = await Product.distinct("tags");
			return { success: true, tags: tags.filter(Boolean) };
		} catch (error) {
			console.error("Error fetching tags:", error);
			throw error;
		}
	}

	async getProductById(productId) {
		try {
			const product = await Product.findById(productId);
			if (!product) {
				throw new Error("Product not found");
			}
			return { success: true, product };
		} catch (error) {
			console.error("Error fetching product:", error);
			throw error;
		}
	}

	async searchProducts(searchQuery) {
		try {
			const q = searchQuery || "";
			const regex = new RegExp(q, "i");
			
			const [products, categories, styles] = await Promise.all([
				Product.find({ title: regex }).limit(10),
				Category.find({ name: regex }).limit(5),
				Style.find({ name: regex }).limit(5)
			]);

			return { success: true, products, categories, styles };
		} catch (error) {
			console.error("Error searching products:", error);
			throw error;
		}
	}

	async filterProducts(filterParams) {
		try {
			const query = this.buildProductQuery(filterParams);
			const products = await Product.find(query);
			return { success: true, products };
		} catch (error) {
			console.error("Error filtering products:", error);
			throw error;
		}
	}

	/**
	 * Parse variants JSON string sent from the frontend.
	 * Variants format: [{ color, size, existingImage, existingImagePublicId, variantIndex }]
	 */
	_parseVariants(productData) {
		try {
			if (typeof productData.variants === "string") {
				return JSON.parse(productData.variants);
			}
			if (Array.isArray(productData.variants)) return productData.variants;
		} catch (_) {}
		return [];
	}

	/**
	 * Parse colors JSON string sent from the frontend.
	 * Colors format: [{ name, hex }]
	 */
	_parseColors(productData) {
		try {
			if (typeof productData.colors === "string") return JSON.parse(productData.colors);
			if (Array.isArray(productData.colors)) return productData.colors;
		} catch (_) {}
		return [];
	}

	/**
	 * Parse sizes – can be a JSON array string or repeated form fields.
	 */
	_parseSizes(productData) {
		try {
			if (typeof productData.sizes === "string") {
				// Try JSON parse first
				try { return JSON.parse(productData.sizes); } catch (_) {}
				// Fallback: comma-separated
				return productData.sizes.split(",").map((s) => s.trim()).filter(Boolean);
			}
			if (Array.isArray(productData.sizes)) return productData.sizes;
		} catch (_) {}
		return [];
	}

	/**
	 * Parse charmPieceOptions – can be a JSON array string or repeated form fields.
	 * e.g. "[3,5,7]" or ["3","5","7"] → [3, 5, 7]
	 */
	_parseCharmPieceOptions(productData) {
		try {
			if (typeof productData.charmPieceOptions === "string") {
				try { return JSON.parse(productData.charmPieceOptions).map(Number).filter(n => Number.isFinite(n) && n > 0); } catch (_) {}
				return productData.charmPieceOptions.split(",").map(s => Number(s.trim())).filter(n => Number.isFinite(n) && n > 0);
			}
			if (Array.isArray(productData.charmPieceOptions)) {
				return productData.charmPieceOptions.map(Number).filter(n => Number.isFinite(n) && n > 0);
			}
		} catch (_) {}
		return [];
	}

	async createProduct(productData, filesMap = {}) {
		try {
			const gender = await this._normalizeProductGender(productData.gender);
			// --- Main image ---
			let mainImage = productData.mainImage || null;
			let mainImagePublicId = null;

			const mainImageFiles = filesMap.mainImage || [];
			if (mainImageFiles.length > 0) {
				const result = await imageService.uploadImage(mainImageFiles[0].buffer, "products");
				mainImage = result.url;
				mainImagePublicId = result.publicId;
			}

			// --- Gallery images ---
			let imageUrls = [];
			let imagePublicIds = [];

			const existingImages = productData.existingImages
				? Array.isArray(productData.existingImages)
					? productData.existingImages
					: [productData.existingImages]
				: [];
			imageUrls = [...existingImages];

			const galleryFiles = filesMap.images || [];
			if (galleryFiles.length > 0) {
				const buffers = galleryFiles.map((f) => f.buffer);
				const uploaded = await imageService.uploadMultipleImages(buffers, "products");
				imageUrls.push(...uploaded.map((u) => u.url));
				imagePublicIds.push(...uploaded.map((u) => u.publicId));
			}

			// --- Variants ---
			const rawVariants = this._parseVariants(productData);
			const variants = [];

			for (const v of rawVariants) {
				const variantFile = filesMap[`variantImage_${v.variantIndex}`];
				let variantImage = v.existingImage || null;
				let variantImagePublicId = v.existingImagePublicId || null;

				if (variantFile && variantFile[0]) {
					const uploaded = await imageService.uploadImage(variantFile[0].buffer, "products/variants");
					variantImage = uploaded.url;
					variantImagePublicId = uploaded.publicId;
				}

				variants.push({
					color: v.color || null,
					size: v.size || null,
					price: v.price ? Number(v.price) : undefined,
					image: variantImage,
					imagePublicId: variantImagePublicId,
					stock: v.stock ? Number(v.stock) : 0,
				});
			}

			// --- Colors & Sizes ---
			const rawColors = this._parseColors(productData);
			const colors = [];

			for (let i = 0; i < rawColors.length; i++) {
				const c = rawColors[i];
				const colorFile = filesMap[`colorImage_${i}`];
				let colorImage = c.existingImage || null;
				let colorImagePublicId = c.existingImagePublicId || null;

				if (colorFile && colorFile[0]) {
					const uploaded = await imageService.uploadImage(colorFile[0].buffer, "products/colors");
					colorImage = uploaded.url;
					colorImagePublicId = uploaded.publicId;
				}

				colors.push({
					name: c.name,
					hex: c.hex,
					image: colorImage,
					imagePublicId: colorImagePublicId,
				});
			}

			const sizes = this._parseSizes(productData);
			const charmPieceOptions = this._parseCharmPieceOptions(productData);

			const product = await Product.create({
				title: productData.title,
				description: stripHtml(productData.description),
				about: stripHtml(productData.about),
				price: productData.price ? Number(productData.price) : undefined,
				discountedPrice: productData.discountedPrice ? Number(productData.discountedPrice) : undefined,
				discountTag: productData.discountTag,
				allowCustomization: parseBoolean(productData.allowCustomization),
				numberOfProducts: productData.numberOfProducts ? Number(productData.numberOfProducts) : 1,
				charmPieceOptions,
				totalCharms: productData.totalCharms ? Number(productData.totalCharms) : 0,
				stock: productData.stock ? Number(productData.stock) : undefined,
				gender,
				category: productData.category || undefined,
				subCategory: productData.subCategory || undefined,
				style: productData.style || undefined,
				tags: normalizeStringArray(productData.tags),
				seoTags: normalizeStringArray(productData.seoTags),
				mainImage,
				mainImagePublicId,
				images: imageUrls,
				imagePublicIds,
				colors,
				sizes,
				variants,
			});

			return { success: true, product };
		} catch (error) {
			console.error("Error creating product:", error);
			throw error;
		}
	}

	async updateProduct(productId, updateData, filesMap = {}) {
		try {
			const gender = await this._normalizeProductGender(updateData.gender);
			const product = await Product.findById(productId);
			if (!product) {
				throw new Error("Product not found");
			}

			// --- Main image ---
			let mainImage = product.mainImage;
			let mainImagePublicId = product.mainImagePublicId;

			const mainImageFiles = filesMap.mainImage || [];
			if (mainImageFiles.length > 0) {
				// Delete old main image if it exists
				if (mainImagePublicId) {
					await imageService.deleteImage(mainImagePublicId).catch((e) => console.error("Could not delete old mainImage", e));
				}
				const result = await imageService.uploadImage(mainImageFiles[0].buffer, "products");
				mainImage = result.url;
				mainImagePublicId = result.publicId;
			} else if (updateData.mainImage === "") {
				// Explicitly cleared
				if (mainImagePublicId) {
					await imageService.deleteImage(mainImagePublicId).catch((e) => console.error("Could not delete mainImage", e));
				}
				mainImage = null;
				mainImagePublicId = null;
			}

			// --- Gallery images ---
			const existingImages = updateData.existingImages
				? Array.isArray(updateData.existingImages)
					? updateData.existingImages
					: [updateData.existingImages]
				: [];

			let imageUrls = [...existingImages];
			let imagePublicIds = product.imagePublicIds ? [...product.imagePublicIds] : [];

			// Delete removed images from Cloudinary
			if (product.images && product.images.length > 0) {
				for (let i = 0; i < product.images.length; i++) {
					if (!existingImages.includes(product.images[i])) {
						if (product.imagePublicIds && product.imagePublicIds[i]) {
							await imageService.deleteImage(product.imagePublicIds[i]).catch((e) => console.error("Could not delete image", e));
							const pIdx = imagePublicIds.indexOf(product.imagePublicIds[i]);
							if (pIdx > -1) imagePublicIds.splice(pIdx, 1);
						}
					}
				}
			}

			const galleryFiles = filesMap.images || [];
			if (galleryFiles.length > 0) {
				const buffers = galleryFiles.map((f) => f.buffer);
				const uploaded = await imageService.uploadMultipleImages(buffers, "products");
				imageUrls.push(...uploaded.map((u) => u.url));
				imagePublicIds.push(...uploaded.map((u) => u.publicId));
			}

			// --- Variants ---
			const rawVariants = this._parseVariants(updateData);
			const variants = [];

			// Build a map of existing variant publicIds by image URL for cleanup
			const existingVariantPublicIds = {};
			if (product.variants) {
				for (const v of product.variants) {
					if (v.image && v.imagePublicId) {
						existingVariantPublicIds[v.image] = v.imagePublicId;
					}
				}
			}

			const keptVariantImages = new Set();

			for (const v of rawVariants) {
				const variantFile = filesMap[`variantImage_${v.variantIndex}`];
				let variantImage = v.existingImage || null;
				let variantImagePublicId = v.existingImagePublicId || null;

				if (variantFile && variantFile[0]) {
					// Delete old variant image if replaced
					if (variantImagePublicId) {
						await imageService.deleteImage(variantImagePublicId).catch((e) => console.error("Could not delete old variant image", e));
					}
					const uploaded = await imageService.uploadImage(variantFile[0].buffer, "products/variants");
					variantImage = uploaded.url;
					variantImagePublicId = uploaded.publicId;
				}

				if (variantImage) keptVariantImages.add(variantImage);

				variants.push({
					color: v.color || null,
					size: v.size || null,
					price: v.price ? Number(v.price) : undefined,
					image: variantImage,
					imagePublicId: variantImagePublicId,
					stock: v.stock ? Number(v.stock) : 0,
				});
			}

			// Clean up orphaned variant images (variants that were deleted)
			for (const [imgUrl, pubId] of Object.entries(existingVariantPublicIds)) {
				if (!keptVariantImages.has(imgUrl)) {
					await imageService.deleteImage(pubId).catch((e) => console.error("Could not delete orphaned variant image", e));
				}
			}

			// --- Colors & Sizes ---
			const rawColors = this._parseColors(updateData);
			const colors = [];

			const existingColorPublicIds = {};
			if (product.colors) {
				for (const c of product.colors) {
					if (c.image && c.imagePublicId) {
						existingColorPublicIds[c.image] = c.imagePublicId;
					}
				}
			}

			const keptColorImages = new Set();

			for (let i = 0; i < rawColors.length; i++) {
				const c = rawColors[i];
				const colorFile = filesMap[`colorImage_${i}`];
				let colorImage = c.existingImage || null;
				let colorImagePublicId = c.existingImagePublicId || null;

				if (colorFile && colorFile[0]) {
					if (colorImagePublicId) {
						await imageService.deleteImage(colorImagePublicId).catch((e) => console.error("Could not delete old color image", e));
					}
					const uploaded = await imageService.uploadImage(colorFile[0].buffer, "products/colors");
					colorImage = uploaded.url;
					colorImagePublicId = uploaded.publicId;
				}

				if (colorImage) keptColorImages.add(colorImage);

				colors.push({
					name: c.name,
					hex: c.hex,
					image: colorImage,
					imagePublicId: colorImagePublicId,
				});
			}

			for (const [imgUrl, pubId] of Object.entries(existingColorPublicIds)) {
				if (!keptColorImages.has(imgUrl)) {
					await imageService.deleteImage(pubId).catch((e) => console.error("Could not delete orphaned color image", e));
				}
			}

			const sizes = this._parseSizes(updateData);
			const charmPieceOptions = this._parseCharmPieceOptions(updateData);

			const updatedProduct = await Product.findByIdAndUpdate(
				productId,
				{
					title: updateData.title,
					description: stripHtml(updateData.description),
					about: stripHtml(updateData.about),
					price: updateData.price ? Number(updateData.price) : undefined,
					discountedPrice: updateData.discountedPrice ? Number(updateData.discountedPrice) : undefined,
					discountTag: updateData.discountTag,
					allowCustomization: updateData.allowCustomization === undefined ? product.allowCustomization : parseBoolean(updateData.allowCustomization),
					numberOfProducts: updateData.numberOfProducts !== undefined ? Number(updateData.numberOfProducts) : product.numberOfProducts,
					charmPieceOptions,
					totalCharms: updateData.totalCharms !== undefined ? Number(updateData.totalCharms) : product.totalCharms,
					stock: updateData.stock ? Number(updateData.stock) : undefined,
					gender: updateData.gender === undefined ? product.gender : gender,
					category: updateData.category || undefined,
					subCategory: updateData.subCategory || undefined,
					style: updateData.style || undefined,
					tags: normalizeStringArray(updateData.tags),
					seoTags: normalizeStringArray(updateData.seoTags),
					mainImage,
					mainImagePublicId,
					images: imageUrls,
					imagePublicIds,
					colors,
					sizes,
					variants,
				},
				{ new: true }
			);

			return { success: true, product: updatedProduct };
		} catch (error) {
			console.error("Error updating product:", error);
			throw error;
		}
	}

	async deleteProduct(productId) {
		try {
			const product = await Product.findById(productId);
			if (!product) {
				throw new Error("Product not found");
			}

			// Delete main image from Cloudinary
			if (product.mainImagePublicId) {
				await imageService.deleteImage(product.mainImagePublicId).catch(() => {});
			}

			// Delete gallery images from Cloudinary
			if (product.imagePublicIds && product.imagePublicIds.length > 0) {
				await imageService.deleteMultipleImages(product.imagePublicIds).catch(() => {});
			}

			// Delete variant images from Cloudinary
			if (product.variants && product.variants.length > 0) {
				const variantPublicIds = product.variants
					.filter((v) => v.imagePublicId)
					.map((v) => v.imagePublicId);
				if (variantPublicIds.length > 0) {
					await imageService.deleteMultipleImages(variantPublicIds).catch(() => {});
				}
			}

			// Delete color images from Cloudinary
			if (product.colors && product.colors.length > 0) {
				const colorPublicIds = product.colors
					.filter((c) => c.imagePublicId)
					.map((c) => c.imagePublicId);
				if (colorPublicIds.length > 0) {
					await imageService.deleteMultipleImages(colorPublicIds).catch(() => {});
				}
			}

			await Product.findByIdAndDelete(productId);

			return { success: true, message: "Product deleted successfully" };
		} catch (error) {
			console.error("Error deleting product:", error);
			throw error;
		}
	}

	async addProductReview(productId, userId, reviewData) {
		try {
			const product = await Product.findById(productId);
			if (!product) {
				throw new Error("Product not found");
			}

			product.reviews.push({
				...reviewData,
				user: userId,
				createdAt: new Date(),
			});

			await product.save();

			return { success: true, reviews: product.reviews };
		} catch (error) {
			console.error("Error adding review:", error);
			throw error;
		}
	}

	async getProductReviews(productId) {
		try {
			const product = await Product.findById(productId).populate("reviews.user");
			if (!product) {
				throw new Error("Product not found");
			}

			return { success: true, reviews: product?.reviews || [] };
		} catch (error) {
			console.error("Error fetching reviews:", error);
			throw error;
		}
	}
}

export default new ProductService();
