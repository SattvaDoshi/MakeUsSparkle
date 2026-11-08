import Product from "../models/product.model.js";
import Gender from "../models/gender.model.js";
import Category from "../models/category.model.js";
import Style from "../models/style.model.js";
import Combo from "../models/combo.model.js";
import Offer from "../models/offer.model.js";
import Coupon from "../models/coupon.model.js";
import Review from "../models/review.model.js";
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

let _cachedActiveOffers = null;
let _cachedActiveCoupons = null;
let _activeOffersCacheTime = 0;
const OFFERS_CACHE_TTL_MS = 60000; // 60 seconds

async function getCachedOffersAndCoupons() {
	const now = Date.now();
	if (_cachedActiveOffers && _cachedActiveCoupons && (now - _activeOffersCacheTime < OFFERS_CACHE_TTL_MS)) {
		return { activeOffers: _cachedActiveOffers, activeCoupons: _cachedActiveCoupons };
	}
	const [activeOffers, activeCoupons] = await Promise.all([
		Offer.find({ isActive: { $ne: false } }).lean(),
		Coupon.find({ isActive: { $ne: false } }).lean(),
	]);
	_cachedActiveOffers = activeOffers;
	_cachedActiveCoupons = activeCoupons;
	_activeOffersCacheTime = now;
	return { activeOffers, activeCoupons };
}

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
		// Only plain strings may reach the database filter (blocks ?category[$ne]=… style injection).
		const str = (v) => (typeof v === "string" && v.trim() ? v.trim() : undefined);
		const category = str(queryParams.category);
		const subCategory = str(queryParams.subCategory);
		const style = str(queryParams.style);
		const gender = str(queryParams.gender);
		const { minPrice, maxPrice, rating } = queryParams;
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

	/**
	 * Attach average rating + review count from the Review collection (customer
	 * reviews live there, not on the product document). Products with no reviews
	 * keep whatever rating the admin set.
	 */
	async attachReviewStats(productList) {
		try {
			const ids = productList
				.map((p) => p && (p._id || p.id))
				.filter(Boolean)
				.map((id) => new mongoose.Types.ObjectId(String(id)));
			if (ids.length === 0) return;
			const stats = await Review.aggregate([
				{ $match: { product: { $in: ids } } },
				{ $group: { _id: "$product", avg: { $avg: "$rating" }, count: { $sum: 1 } } },
			]);
			const byId = new Map(stats.map((s) => [String(s._id), s]));
			for (const prod of productList) {
				if (!prod) continue;
				const s = byId.get(String(prod._id || prod.id));
				if (s) {
					prod.rating = Math.round(s.avg * 10) / 10;
					prod.reviewCount = s.count;
				}
			}
		} catch (err) {
			console.error("attachReviewStats failed:", err.message);
		}
	}

	async attachOfferTags(products) {
		if (!products) return products;
		const isSingle = !Array.isArray(products);
		const productList = isSingle ? [products] : products;
		if (productList.length === 0) return products;

		// Every product-returning path calls this, so review stats ride along here.
		await this.attachReviewStats(productList);

		try {
			const now = new Date();
			const { activeOffers, activeCoupons } = await getCachedOffersAndCoupons();

			const validOffers = activeOffers.filter(
				(o) => o.isActive !== false &&
					(!o.startsAt || new Date(o.startsAt) <= now) &&
					(!o.expiryDate || new Date(o.expiryDate) >= now)
			);
			const validCoupons = activeCoupons.filter(
				(c) => c.isActive !== false &&
					(!c.startsAt || new Date(c.startsAt) <= now) &&
					(!c.expiryDate || new Date(c.expiryDate) >= now)
			);

			// Sitewide offer fallback (active offer that has no specific product or category restrictions)
			const sitewideOffer = validOffers.find(
				(o) => (!Array.isArray(o.applicableProducts) || o.applicableProducts.length === 0) &&
					(!Array.isArray(o.applicableCategories) || o.applicableCategories.length === 0)
			);

			for (const prod of productList) {
				if (!prod) continue;
				const prodIdStr = String(prod._id || prod.id || "");
				const catIdStr = prod.category ? String(prod.category._id || prod.category) : "";
				const subCatIdStr = prod.subCategory ? String(prod.subCategory._id || prod.subCategory) : "";

				// 1. Direct product match on Offer
				const matchedOfferProd = validOffers.find((o) =>
					Array.isArray(o.applicableProducts) && o.applicableProducts.some((pId) => String(pId?._id || pId || "") === prodIdStr)
				);
				if (matchedOfferProd && matchedOfferProd.title) {
					prod.offerTag = matchedOfferProd.title;
					continue;
				}

				// 2. Direct product match on Coupon
				const matchedCouponProd = validCoupons.find((c) =>
					Array.isArray(c.applicableProducts) && c.applicableProducts.some((pId) => String(pId?._id || pId || "") === prodIdStr)
				);
				if (matchedCouponProd && (matchedCouponProd.name || matchedCouponProd.code)) {
					prod.offerTag = matchedCouponProd.name || matchedCouponProd.code;
					continue;
				}

				// 3. SubCategory match on Coupon
				if (subCatIdStr) {
					const matchedCouponSubCat = validCoupons.find((c) =>
						Array.isArray(c.applicableSubCategories) && c.applicableSubCategories.some((scId) => String(scId?._id || scId || "") === subCatIdStr)
					);
					if (matchedCouponSubCat && (matchedCouponSubCat.name || matchedCouponSubCat.code)) {
						prod.offerTag = matchedCouponSubCat.name || matchedCouponSubCat.code;
						continue;
					}
				}

				// 4. Category match on Offer
				if (catIdStr) {
					const matchedOfferCat = validOffers.find((o) =>
						Array.isArray(o.applicableCategories) && o.applicableCategories.some((cId) => String(cId?._id || cId || "") === catIdStr)
					);
					if (matchedOfferCat && matchedOfferCat.title) {
						prod.offerTag = matchedOfferCat.title;
						continue;
					}

					// 5. Category match on Coupon
					const matchedCouponCat = validCoupons.find((c) =>
						Array.isArray(c.applicableCategories) && c.applicableCategories.some((cId) => String(cId?._id || cId || "") === catIdStr)
					);
					if (matchedCouponCat && (matchedCouponCat.name || matchedCouponCat.code)) {
						prod.offerTag = matchedCouponCat.name || matchedCouponCat.code;
						continue;
					}
				}

				// 6. Name / keyword fallback match (e.g. "jhumkha combo deal" matching products containing "jhumk")
				const prodText = `${prod.title || ""} ${prod.slug || ""}`.toLowerCase();
				const matchedKeywordOffer = validOffers.find((o) => {
					if (!o.title) return false;
					const words = o.title.toLowerCase().split(/\s+/).filter((w) => w.length > 3 && !["deal", "offer", "combo", "free", "sale", "save"].includes(w));
					return words.length > 0 && words.some((w) => prodText.includes(w));
				});
				if (matchedKeywordOffer && matchedKeywordOffer.title) {
					prod.offerTag = matchedKeywordOffer.title;
					continue;
				}

				// 7. Sitewide offer fallback
				if (sitewideOffer && sitewideOffer.title) {
					prod.offerTag = sitewideOffer.title;
				}
			}
		} catch (err) {
			console.error("Error attaching offer tags to products:", err);
		}

		return products;
	}

	async getProducts(queryParams = {}) {
		try {
			const query = this.buildProductQuery(queryParams);
			let productQuery = Product.find(query).lean();

			// Apply sorting
			if (queryParams.sort === "price_asc") {
				productQuery = productQuery.sort({ price: 1 });
			} else if (queryParams.sort === "price_desc") {
				productQuery = productQuery.sort({ price: -1 });
			} else if (queryParams.sort === "rating_desc") {
				productQuery = productQuery.sort({ rating: -1 });
			} else if (queryParams.sort === "rating_asc") {
				productQuery = productQuery.sort({ rating: 1 });
			} else {
				// Default sort
				productQuery = productQuery.sort({ displayOrder: -1, _id: -1 });
			}

			const page = Math.max(1, Number(queryParams.page) || 1);
			const limit = queryParams.limit ? Math.min(500, Math.max(1, Number(queryParams.limit) || 1)) : null;

			if (limit) {
				const total = await Product.countDocuments(query);
				const products = await productQuery.skip((page - 1) * limit).limit(limit);
				await this.attachOfferTags(products);
				return {
					success: true,
					products,
					pagination: {
						page,
						limit,
						total,
						totalPages: Math.ceil(total / limit),
						hasMore: page * limit < total,
					},
				};
			}

			const products = await productQuery;
			await this.attachOfferTags(products);
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
			if (!mongoose.isValidObjectId(productId)) throw new Error("Product not found");
			const product = await Product.findById(productId).lean();
			if (!product) {
				throw new Error("Product not found");
			}
			await this.attachOfferTags(product);
			return { success: true, product };
		} catch (error) {
			console.error("Error fetching product:", error);
			throw error;
		}
	}

	async searchProducts(searchQuery) {
		try {
			// Treat the search text literally: escape regex characters (stops ReDoS / regex injection) and cap the length.
			const q = (typeof searchQuery === "string" ? searchQuery : "").slice(0, 60);
			const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
			
			const [products, categories, styles, combos] = await Promise.all([
				Product.find({ title: regex }).limit(10).lean(),
				Category.find({ name: regex }).limit(5),
				Style.find({ name: regex }).limit(5),
				Combo.find({ name: regex }).limit(5)
			]);

			await this.attachOfferTags(products);
			return { success: true, products, categories, styles, combos };
		} catch (error) {
			console.error("Error searching products:", error);
			throw error;
		}
	}

	async filterProducts(filterParams) {
		try {
			const query = this.buildProductQuery(filterParams);
			const products = await Product.find(query).lean();
			await this.attachOfferTags(products);
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

	/**
	 * Parse charmPiecePricing JSON string
	 */
	/**
	 * Parse charmStocks JSON string
	 */
	_parseCharmStocks(productData) {
		try {
			if (typeof productData.charmStocks === 'string') {
				return JSON.parse(productData.charmStocks);
			}
			if (Array.isArray(productData.charmStocks)) {
				return productData.charmStocks;
			}
		} catch (_) {}
		return [];
	}

	_parseCharmPiecePricing(productData) {
		try {
			if (typeof productData.charmPiecePricing === "string") {
				return JSON.parse(productData.charmPiecePricing);
			}
			if (Array.isArray(productData.charmPiecePricing)) {
				return productData.charmPiecePricing;
			}
		} catch (_) {}
		return [];
	}

	/**
	 * Parse styles JSON string
	 */
	_parseStyles(productData) {
		try {
			if (typeof productData.styles === "string") {
				return JSON.parse(productData.styles);
			}
			if (Array.isArray(productData.styles)) {
				return productData.styles;
			}
		} catch (_) {}
		return [];
	}

	/**
	 * Parse quantityVariants JSON string
	 */
	_parseQuantityVariants(productData) {
		try {
			if (typeof productData.quantityVariants === "string") {
				return JSON.parse(productData.quantityVariants);
			}
			if (Array.isArray(productData.quantityVariants)) {
				return productData.quantityVariants;
			}
		} catch (_) {}
		return [];
	}

	/**
	 * Parse volume discounts JSON string
	 */
	_parseVolumeDiscounts(productData) {
		try {
			if (typeof productData.volumeDiscounts === "string") {
				return JSON.parse(productData.volumeDiscounts);
			}
			if (Array.isArray(productData.volumeDiscounts)) {
				return productData.volumeDiscounts;
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

			const galleryFiles = filesMap.images || [];
			let uploadedNew = [];
			if (galleryFiles.length > 0) {
				const buffers = galleryFiles.map((f) => f.buffer);
				uploadedNew = await imageService.uploadMultipleImages(buffers, "products");
			}

			let galleryOrder = productData.galleryOrder;
			if (typeof galleryOrder === "string") {
				try { galleryOrder = JSON.parse(galleryOrder); } catch (e) { galleryOrder = null; }
			}

			if (Array.isArray(galleryOrder) && galleryOrder.length > 0) {
				for (const item of galleryOrder) {
					if (item.type === "existing" && item.url) {
						imageUrls.push(item.url);
						imagePublicIds.push(null);
					} else if (item.type === "new" && typeof item.index === "number") {
						const u = uploadedNew[item.index];
						if (u) {
							imageUrls.push(u.url);
							imagePublicIds.push(u.publicId);
						}
					}
				}
			} else {
				const existingImages = productData.existingImages
					? Array.isArray(productData.existingImages)
						? productData.existingImages
						: [productData.existingImages]
					: [];
				imageUrls = [...existingImages];
				imageUrls.push(...uploadedNew.map((u) => u.url));
				imagePublicIds.push(...uploadedNew.map((u) => u.publicId));
			}

			// --- Size Chart Image ---
			let sizeChartImage = null;
			let sizeChartImagePublicId = null;
			const sizeChartFiles = filesMap.sizeChartImage || [];
			if (sizeChartFiles.length > 0) {
				const result = await imageService.uploadImage(sizeChartFiles[0].buffer, "products/size-charts");
				sizeChartImage = result.url;
				sizeChartImagePublicId = result.publicId;
			}

			// --- Gift Box Image ---
			let giftBoxImage = null;
			let giftBoxImagePublicId = null;
			const giftBoxFiles = filesMap.giftBoxImage || [];
			if (giftBoxFiles.length > 0) {
				const result = await imageService.uploadImage(giftBoxFiles[0].buffer, "products/gift-boxes");
				giftBoxImage = result.url;
				giftBoxImagePublicId = result.publicId;
			}

			// --- Variants ---
			const rawVariants = this._parseVariants(productData);
			const variants = [];

			for (const v of rawVariants) {
				const variantFile = filesMap[`variantImage_${v.variantIndex}`];
				const bandFile = filesMap[`variantBandImage_${v.variantIndex}`];
				let variantImage = v.existingImage || null;
				let variantImagePublicId = v.existingImagePublicId || null;
				let bandImage = v.bandExistingImage || null;
				let bandImagePublicId = v.bandExistingImagePublicId || null;

				if (variantFile && variantFile[0]) {
					const uploaded = await imageService.uploadImage(variantFile[0].buffer, "products/variants");
					variantImage = uploaded.url;
					variantImagePublicId = uploaded.publicId;
				}

				if (bandFile && bandFile[0]) {
					const uploaded = await imageService.uploadImage(bandFile[0].buffer, "products/variants/bands");
					bandImage = uploaded.url;
					bandImagePublicId = uploaded.publicId;
				}

				variants.push({
					color: v.color || null,
					size: v.size || null,
					price: v.price ? Number(v.price) : undefined,
					salePrice: v.salePrice ? Number(v.salePrice) : undefined,
					image: variantImage,
					imagePublicId: variantImagePublicId,
					stock: v.stock ? Number(v.stock) : 0,
					bandName: v.bandName || undefined,
					bandImage,
					bandImagePublicId,
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
			const charmPiecePricing = this._parseCharmPiecePricing(productData);
			const charmStocks = this._parseCharmStocks(productData);
			const volumeDiscounts = this._parseVolumeDiscounts(productData);
			const styles = this._parseStyles(productData);
			const quantityVariants = this._parseQuantityVariants(productData);

			const product = await Product.create({
				title: productData.title,
				description: stripHtml(productData.description),
				about: stripHtml(productData.about),
				price: productData.price ? Number(productData.price) : undefined,
				costPrice: productData.costPrice ? Number(productData.costPrice) : undefined,
				discountedPrice: productData.discountedPrice ? Number(productData.discountedPrice) : undefined,
				discountTag: productData.discountTag,
				productLabel: productData.productLabel,
				displayOrder: productData.displayOrder ? Number(productData.displayOrder) : 0,
				allowCustomization: productData.allowCustomization === "true",
				maxCustomImages: productData.maxCustomImages !== undefined ? Number(productData.maxCustomImages) : 1,
				customImageLabels: normalizeStringArray(productData.customImageLabels),
				maxQuantity: productData.maxQuantity !== undefined ? Number(productData.maxQuantity) : 10,
				volumeDiscounts,
				numberOfProducts: productData.numberOfProducts ? Number(productData.numberOfProducts) : 1,
				quantityVariants,
				charmPieceOptions,
				charmPiecePricing,
				totalCharms: productData.totalCharms ? Number(productData.totalCharms) : 0,
				charmStocks,
				perCharmPrice: productData.perCharmPrice ? Number(productData.perCharmPrice) : 0,
				stock: productData.stock ? Number(productData.stock) : undefined,
				gender,
				category: productData.category || undefined,
				subCategory: productData.subCategory || undefined,
				style: styles.length > 0 ? styles[0] : (productData.style || undefined),
				styles: styles,
				tags: normalizeStringArray(productData.tags),
				seoTags: normalizeStringArray(productData.seoTags),
				mainImage,
				mainImagePublicId,
				images: imageUrls,
				imagePublicIds,
				colors,
				sizes,
				variants,
				sizeChartImage,
				sizeChartImagePublicId,
				sizeChartSteps: productData.sizeChartSteps || "",
				giftBox: {
					enabled:       productData.giftBoxEnabled !== undefined ? parseBoolean(productData.giftBoxEnabled) : true,
					heading:       productData.giftBoxHeading || "Premium Gift Box",
					description:   productData.giftBoxDescription || "Rigid magnetic-close box · satin ribbon · message card",
					price:         productData.giftBoxPrice ? Number(productData.giftBoxPrice) : 50,
					image:         giftBoxImage,
					imagePublicId: giftBoxImagePublicId,
				},
				partialCOD: {
					enabled: productData.partialCODEnabled !== undefined ? parseBoolean(productData.partialCODEnabled) : false,
					percentage: productData.partialCODPercentage ? Number(productData.partialCODPercentage) : 0,
				},
				paymentMode: productData.paymentMode || 'cod_allowed',
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
			const galleryFiles = filesMap.images || [];
			let uploadedNew = [];
			if (galleryFiles.length > 0) {
				const buffers = galleryFiles.map((f) => f.buffer);
				uploadedNew = await imageService.uploadMultipleImages(buffers, "products");
			}

			let imageUrls = [];
			let imagePublicIds = [];
			const oldImages = product.images || [];
			const oldPublicIds = product.imagePublicIds || [];

			let galleryOrder = updateData.galleryOrder;
			if (typeof galleryOrder === "string") {
				try { galleryOrder = JSON.parse(galleryOrder); } catch (e) { galleryOrder = null; }
			}

			if (Array.isArray(galleryOrder) && galleryOrder.length > 0) {
				for (const item of galleryOrder) {
					if (item.type === "existing" && item.url) {
						const idx = oldImages.indexOf(item.url);
						imageUrls.push(item.url);
						imagePublicIds.push(idx > -1 && oldPublicIds[idx] ? oldPublicIds[idx] : null);
					} else if (item.type === "new" && typeof item.index === "number") {
						const u = uploadedNew[item.index];
						if (u) {
							imageUrls.push(u.url);
							imagePublicIds.push(u.publicId);
						}
					}
				}
			} else {
				const existingImages = updateData.existingImages
					? Array.isArray(updateData.existingImages)
						? updateData.existingImages
						: [updateData.existingImages]
					: [];

				imageUrls = [...existingImages];
				imagePublicIds = [...(product.imagePublicIds || [])];

				imageUrls.push(...uploadedNew.map((u) => u.url));
				imagePublicIds.push(...uploadedNew.map((u) => u.publicId));
			}

			// Delete removed images from Cloudinary
			if (product.images && product.images.length > 0) {
				for (let i = 0; i < product.images.length; i++) {
					if (!imageUrls.includes(product.images[i])) {
						if (product.imagePublicIds && product.imagePublicIds[i]) {
							await imageService.deleteImage(product.imagePublicIds[i]).catch((e) => console.error("Could not delete image", e));
						}
					}
				}
			}

			// --- Size Chart Image ---
			let sizeChartImage = product.sizeChartImage || null;
			let sizeChartImagePublicId = product.sizeChartImagePublicId || null;
			const sizeChartFiles = filesMap.sizeChartImage || [];
			if (sizeChartFiles.length > 0) {
				if (sizeChartImagePublicId) {
					await imageService.deleteImage(sizeChartImagePublicId).catch((e) => console.error("Could not delete old sizeChartImage", e));
				}
				const result = await imageService.uploadImage(sizeChartFiles[0].buffer, "products/size-charts");
				sizeChartImage = result.url;
				sizeChartImagePublicId = result.publicId;
			} else if (updateData.sizeChartImage === "") {
				if (sizeChartImagePublicId) {
					await imageService.deleteImage(sizeChartImagePublicId).catch((e) => console.error("Could not delete sizeChartImage", e));
				}
				sizeChartImage = null;
				sizeChartImagePublicId = null;
			}

			// --- Gift Box Image ---
			let giftBoxImage = product.giftBox?.image || null;
			let giftBoxImagePublicId = product.giftBox?.imagePublicId || null;
			const giftBoxFiles = filesMap.giftBoxImage || [];
			if (giftBoxFiles.length > 0) {
				if (giftBoxImagePublicId) {
					await imageService.deleteImage(giftBoxImagePublicId).catch((e) => console.error("Could not delete old giftBoxImage", e));
				}
				const result = await imageService.uploadImage(giftBoxFiles[0].buffer, "products/gift-boxes");
				giftBoxImage = result.url;
				giftBoxImagePublicId = result.publicId;
			} else if (updateData.giftBoxImage === "") {
				if (giftBoxImagePublicId) {
					await imageService.deleteImage(giftBoxImagePublicId).catch((e) => console.error("Could not delete giftBoxImage", e));
				}
				giftBoxImage = null;
				giftBoxImagePublicId = null;
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
				const bandFile = filesMap[`variantBandImage_${v.variantIndex}`];
				let variantImage = v.existingImage || null;
				let variantImagePublicId = v.existingImagePublicId || null;
				let bandImage = v.bandExistingImage || null;
				let bandImagePublicId = v.bandExistingImagePublicId || null;

				if (variantFile && variantFile[0]) {
					// Delete old variant image if replaced
					if (variantImagePublicId) {
						await imageService.deleteImage(variantImagePublicId).catch((e) => console.error("Could not delete old variant image", e));
					}
					const uploaded = await imageService.uploadImage(variantFile[0].buffer, "products/variants");
					variantImage = uploaded.url;
					variantImagePublicId = uploaded.publicId;
				}

				if (bandFile && bandFile[0]) {
					if (bandImagePublicId) {
						await imageService.deleteImage(bandImagePublicId).catch((e) => console.error("Could not delete old band image", e));
					}
					const uploaded = await imageService.uploadImage(bandFile[0].buffer, "products/variants/bands");
					bandImage = uploaded.url;
					bandImagePublicId = uploaded.publicId;
				}

				if (variantImage) keptVariantImages.add(variantImage);
				if (bandImage) keptVariantImages.add(bandImage);

				variants.push({
					color: v.color || null,
					size: v.size || null,
					price: v.price ? Number(v.price) : undefined,
					salePrice: v.salePrice ? Number(v.salePrice) : undefined,
					image: variantImage,
					imagePublicId: variantImagePublicId,
					stock: v.stock ? Number(v.stock) : 0,
					bandName: v.bandName || undefined,
					bandImage,
					bandImagePublicId,
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
			const charmPiecePricing = this._parseCharmPiecePricing(updateData);
			const charmStocks = updateData.charmStocks !== undefined ? this._parseCharmStocks(updateData) : undefined;
			const volumeDiscounts = this._parseVolumeDiscounts(updateData);

			const updatedProduct = await Product.findByIdAndUpdate(
				productId,
				{
					title: updateData.title,
					description: stripHtml(updateData.description),
					about: stripHtml(updateData.about),
					price: updateData.price ? Number(updateData.price) : undefined,
					discountedPrice: updateData.discountedPrice ? Number(updateData.discountedPrice) : undefined,
					discountTag: updateData.discountTag,
					allowCustomization: updateData.allowCustomization !== undefined ? updateData.allowCustomization === "true" : product.allowCustomization,
					maxCustomImages: updateData.maxCustomImages !== undefined ? Number(updateData.maxCustomImages) : product.maxCustomImages,
					customImageLabels: updateData.customImageLabels !== undefined ? normalizeStringArray(updateData.customImageLabels) : product.customImageLabels,
					maxQuantity: updateData.maxQuantity !== undefined ? Number(updateData.maxQuantity) : product.maxQuantity,
					volumeDiscounts,
					numberOfProducts: updateData.numberOfProducts !== undefined ? Number(updateData.numberOfProducts) : product.numberOfProducts,
					charmPieceOptions,
					charmPiecePricing,
					totalCharms: updateData.totalCharms !== undefined ? Number(updateData.totalCharms) : product.totalCharms,
					charmStocks: charmStocks !== undefined ? charmStocks : product.charmStocks,
					perCharmPrice: updateData.perCharmPrice !== undefined ? Number(updateData.perCharmPrice) : product.perCharmPrice,
					stock: updateData.stock ? Number(updateData.stock) : undefined,
					gender: updateData.gender === undefined ? product.gender : gender,
					category: updateData.category || undefined,
					subCategory: updateData.subCategory || undefined,
					tags: normalizeStringArray(updateData.tags),
					seoTags: normalizeStringArray(updateData.seoTags),
					costPrice: updateData.costPrice ? Number(updateData.costPrice) : undefined,
					productLabel: updateData.productLabel,
					displayOrder: updateData.displayOrder ? Number(updateData.displayOrder) : 0,
					styles: updateData.styles !== undefined ? this._parseStyles(updateData) : undefined,
					style: updateData.styles !== undefined && this._parseStyles(updateData).length > 0 ? this._parseStyles(updateData)[0] : (updateData.style || undefined),
					quantityVariants: updateData.quantityVariants !== undefined ? this._parseQuantityVariants(updateData) : undefined,
					mainImage,
					mainImagePublicId,
					images: imageUrls,
					imagePublicIds,
					colors,
					sizes,
					variants,
					sizeChartImage,
					sizeChartImagePublicId,
					sizeChartSteps: updateData.sizeChartSteps !== undefined ? updateData.sizeChartSteps : product.sizeChartSteps,
					giftBox: {
						enabled:       updateData.giftBoxEnabled !== undefined ? parseBoolean(updateData.giftBoxEnabled) : (product.giftBox?.enabled ?? true),
						heading:       updateData.giftBoxHeading || product.giftBox?.heading || "Premium Gift Box",
						description:   updateData.giftBoxDescription || product.giftBox?.description || "Rigid magnetic-close box · satin ribbon · message card",
						price:         updateData.giftBoxPrice ? Number(updateData.giftBoxPrice) : (product.giftBox?.price ?? 50),
						image:         giftBoxImage,
						imagePublicId: giftBoxImagePublicId,
					},
					partialCOD: {
						enabled: updateData.partialCODEnabled !== undefined ? parseBoolean(updateData.partialCODEnabled) : (product.partialCOD?.enabled ?? false),
						percentage: updateData.partialCODPercentage !== undefined ? Number(updateData.partialCODPercentage) : (product.partialCOD?.percentage ?? 0),
					},
					paymentMode: updateData.paymentMode || product.paymentMode || 'cod_allowed',
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
			if (!mongoose.isValidObjectId(productId)) throw new Error("Product not found");
			// Public endpoint: expose only the reviewer's name, never their account record (email, password hash, addresses…).
			const product = await Product.findById(productId).populate({ path: "reviews.user", select: "name" });
			if (!product) {
				throw new Error("Product not found");
			}

			return { success: true, reviews: product?.reviews || [] };
		} catch (error) {
			console.error("Error fetching reviews:", error);
			throw error;
		}
	}

	async reorderProducts(items) {
		// items: Array<{ id: string; displayOrder: number }>
		try {
			const ops = items.map(({ id, displayOrder }) => ({
				updateOne: {
					filter: { _id: id },
					update: { $set: { displayOrder: Number(displayOrder) } },
				},
			}));
			await Product.bulkWrite(ops);
			return { success: true, message: "Products reordered successfully" };
		} catch (error) {
			console.error("Error reordering products:", error);
			throw error;
		}
	}
}

export default new ProductService();
