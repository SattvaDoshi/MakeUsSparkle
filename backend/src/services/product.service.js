import Product from "../models/product.model.js";
import imageService from "./image.service.js";

class ProductService {
	buildProductQuery(queryParams) {
		const { category, style, gender, minPrice, maxPrice, rating } = queryParams;
		const query = {};

		if (category) query.category = category;
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
			const products = await Product.find({ title: new RegExp(q, "i") });
			return { success: true, products };
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

	async createProduct(productData, filesMap = {}) {
		try {
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
					image: variantImage,
					imagePublicId: variantImagePublicId,
					stock: v.stock ? Number(v.stock) : 0,
				});
			}

			// --- Colors & Sizes ---
			const colors = this._parseColors(productData);
			const sizes = this._parseSizes(productData);

			const product = await Product.create({
				title: productData.title,
				description: productData.description,
				about: productData.about,
				price: productData.price ? Number(productData.price) : undefined,
				discountedPrice: productData.discountedPrice ? Number(productData.discountedPrice) : undefined,
				discountTag: productData.discountTag,
				stock: productData.stock ? Number(productData.stock) : undefined,
				gender: productData.gender,
				category: productData.category || undefined,
				subCategory: productData.subCategory || undefined,
				style: productData.style || undefined,
				tags: Array.isArray(productData.tags) ? productData.tags : productData.tags ? [productData.tags] : [],
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
			const colors = this._parseColors(updateData);
			const sizes = this._parseSizes(updateData);

			const updatedProduct = await Product.findByIdAndUpdate(
				productId,
				{
					title: updateData.title,
					description: updateData.description,
					about: updateData.about,
					price: updateData.price ? Number(updateData.price) : undefined,
					discountedPrice: updateData.discountedPrice ? Number(updateData.discountedPrice) : undefined,
					discountTag: updateData.discountTag,
					stock: updateData.stock ? Number(updateData.stock) : undefined,
					gender: updateData.gender,
					category: updateData.category || undefined,
					subCategory: updateData.subCategory || undefined,
					style: updateData.style || undefined,
					tags: Array.isArray(updateData.tags) ? updateData.tags : updateData.tags ? [updateData.tags] : [],
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
