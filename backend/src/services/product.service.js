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

	async createProduct(productData, imageBuffer = null) {
		try {
			let imageUrl = null;
			let imagePublicId = null;

			// Upload image if provided
			if (imageBuffer) {
				const uploadedImage = await imageService.uploadImage(imageBuffer, "products");
				imageUrl = uploadedImage.url;
				imagePublicId = uploadedImage.publicId;
			}

			// Create product
			const product = await Product.create({
				...productData,
				image: imageUrl,
				imagePublicId,
			});

			return { success: true, product };
		} catch (error) {
			console.error("Error creating product:", error);
			throw error;
		}
	}

	async updateProduct(productId, updateData, newImageBuffer = null) {
		try {
			const product = await Product.findById(productId);
			if (!product) {
				throw new Error("Product not found");
			}

			// Handle image update
			if (newImageBuffer) {
				// Delete old image if exists
				if (product.imagePublicId) {
					await imageService.deleteImage(product.imagePublicId);
				}

				// Upload new image
				const uploadedImage = await imageService.uploadImage(newImageBuffer, "products");
				updateData.image = uploadedImage.url;
				updateData.imagePublicId = uploadedImage.publicId;
			}

			// Update product
			const updatedProduct = await Product.findByIdAndUpdate(productId, updateData, { returnDocument: "after" });

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

			// Delete image from Cloudinary
			if (product.imagePublicId) {
				await imageService.deleteImage(product.imagePublicId);
			}

			// Delete product
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
