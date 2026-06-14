import Coupon from "../models/coupon.model.js";
import Product from "../models/product.model.js";
import Category from "../models/category.model.js";
import SubCategory from "../models/subCategory.model.js";
import Style from "../models/style.model.js";
import crypto from "crypto";

class CouponService {
	normalizeCode(code = "") {
		return String(code).trim().toUpperCase();
	}

	normalizeLookupKey(value = "") {
		return String(value || "").trim().toLowerCase();
	}

	normalizeObjectIdArray(values) {
		if (!Array.isArray(values)) {
			return [];
		}

		return [...new Set(values.map((value) => String(value).trim()).filter(Boolean))];
	}

	buildCouponPayload(couponData = {}, existingCoupon = null) {
		const base = existingCoupon ? existingCoupon.toObject() : {};
		const payload = {
			...base,
			...couponData,
		};

		if (payload.code !== undefined) {
			payload.code = this.normalizeCode(payload.code);
		}

		if (payload.name !== undefined) {
			payload.name = String(payload.name || "").trim();
		}

		if (payload.description !== undefined) {
			payload.description = String(payload.description || "").trim();
		}

		if (payload.discountType !== undefined) {
			payload.discountType = payload.discountType === "fixed" ? "fixed" : payload.discountType === "free_shipping" ? "free_shipping" : "percentage";
		}

		if (payload.discountValue !== undefined) {
			payload.discountValue = Number(payload.discountValue || 0);
		}

		if (payload.maxDiscount !== undefined && payload.maxDiscount !== null && payload.maxDiscount !== "") {
			payload.maxDiscount = Number(payload.maxDiscount);
		} else {
			payload.maxDiscount = undefined;
		}

		if (payload.minOrderValue !== undefined) {
			payload.minOrderValue = Number(payload.minOrderValue || 0);
		}

		if (payload.usageLimit !== undefined) {
			payload.usageLimit = Number(payload.usageLimit || 1);
		}

		if (payload.expiryDate !== undefined && payload.expiryDate !== null && payload.expiryDate !== "") {
			payload.expiryDate = new Date(payload.expiryDate);
		} else {
			payload.expiryDate = undefined;
		}

		if (payload.startsAt !== undefined && payload.startsAt !== null && payload.startsAt !== "") {
			payload.startsAt = new Date(payload.startsAt);
		} else {
			payload.startsAt = undefined;
		}

		if (payload.offerCategory !== undefined) {
			const allowed = new Set(["jewellery", "combo", "gift", "all"]);
			payload.offerCategory = allowed.has(payload.offerCategory) ? payload.offerCategory : "all";
		}

		if (payload.image !== undefined) {
			payload.image = String(payload.image || "").trim();
		}

		if (payload.isFeatured !== undefined) {
			payload.isFeatured = Boolean(payload.isFeatured);
		}

		payload.applicableCategories = this.normalizeObjectIdArray(payload.applicableCategories);
		payload.applicableSubCategories = this.normalizeObjectIdArray(payload.applicableSubCategories);
		payload.applicableStyles = this.normalizeObjectIdArray(payload.applicableStyles);
		payload.applicableProducts = this.normalizeObjectIdArray(payload.applicableProducts);
		payload.applicableProductTypes = Array.isArray(payload.applicableProductTypes)
			? [...new Set(payload.applicableProductTypes.map((value) => String(value).trim()).filter(Boolean))]
			: [];

		if (payload.isActive !== undefined) {
			payload.isActive = Boolean(payload.isActive);
		}

		return payload;
	}

	isCouponAvailable(coupon, now = new Date()) {
		if (!coupon?.isActive) {
			return { valid: false, message: "Coupon is not active" };
		}

		if (coupon.startsAt && coupon.startsAt > now) {
			return { valid: false, message: "Coupon is not active yet" };
		}

		if (coupon.expiryDate && coupon.expiryDate < now) {
			return { valid: false, message: "Coupon has expired" };
		}

		if (typeof coupon.usageLimit === "number" && coupon.usedCount >= coupon.usageLimit) {
			return { valid: false, message: "Coupon usage limit reached" };
		}

		return { valid: true };
	}

	async hydrateCartProducts(items = []) {
		const mongoose = await import('mongoose').then((m) => m.default || m);
		const rawIds = [...new Set(items.map((item) => String(item?.product || item?._id || item?.sourceId || item?.id || "").trim()).filter(Boolean))];
		const rawNames = [...new Set(items.map((item) => String(item?.name || "").trim()).filter(Boolean))];
		const normalizedNames = rawNames.map((name) => this.normalizeLookupKey(name));
		const productIds = rawIds.filter((id) => mongoose.Types.ObjectId.isValid(id));
		const productMap = new Map();

		console.log("[coupon] hydrateCartProducts input", {
			itemCount: items.length,
			rawIds,
			validProductIds: productIds,
			rawNames,
			normalizedNames,
		});

		if (productIds.length > 0) {
			const productsById = await Product.find({ _id: { $in: productIds } })
				.populate({ path: "category", select: "name" })
				.populate({ path: "subCategory", select: "name" })
				.populate({ path: "style", select: "name" })
				.select("_id title category subCategory style gender")
				.lean();

			for (const product of productsById) {
				productMap.set(String(product._id), product);
				productMap.set(this.normalizeLookupKey(product.title), product);
			}
		}

		const missingNames = rawNames.filter((name) => !productMap.has(this.normalizeLookupKey(name)));
		if (missingNames.length > 0) {
			const productsByName = await Product.find({
				title: { $in: missingNames.map((name) => new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i")) },
			})
				.populate({ path: "category", select: "name" })
				.populate({ path: "subCategory", select: "name" })
				.populate({ path: "style", select: "name" })
				.select("_id title category subCategory style gender")
				.lean();

			for (const product of productsByName) {
				productMap.set(String(product._id), product);
				productMap.set(this.normalizeLookupKey(product.title), product);
			}
		}

		console.log("[coupon] hydrateCartProducts resolved", {
			resolvedCount: productMap.size,
			resolvedKeys: [...productMap.keys()],
		});

		return productMap;
	}

	async matchesTargeting(coupon, context = {}) {
		const {
			items = [],
			categoryIds = [],
			subCategoryIds = [],
			styleIds = [],
			productIds = [],
			productTypes = [],
		} = context;

		const needsProductScopedCheck =
			(coupon.applicableCategories || []).length > 0 ||
			(coupon.applicableSubCategories || []).length > 0 ||
			(coupon.applicableStyles || []).length > 0 ||
			(coupon.applicableProducts || []).length > 0 ||
			(coupon.applicableProductTypes || []).length > 0;

		console.log("[coupon] matchesTargeting start", {
			code: coupon.code,
			offerCategory: coupon.offerCategory,
			needsProductScopedCheck,
			applicableCounts: {
				categories: (coupon.applicableCategories || []).length,
				subCategories: (coupon.applicableSubCategories || []).length,
				styles: (coupon.applicableStyles || []).length,
				products: (coupon.applicableProducts || []).length,
				productTypes: (coupon.applicableProductTypes || []).length,
			},
			contextKeys: {
				categoryIds,
				subCategoryIds,
				styleIds,
				productIds,
				productTypes,
				itemNames: items.map((item) => item?.name).filter(Boolean),
			},
		});

		if (!needsProductScopedCheck) {
			console.log("[coupon] matchesTargeting bypassed because coupon has no scoped targets", {
				code: coupon.code,
			});
			return true;
		}

		const productMap = await this.hydrateCartProducts(items);
		const [couponCategories, couponSubCategories, couponStyles] = await Promise.all([
			coupon.applicableCategories?.length ? Category.find({ _id: { $in: coupon.applicableCategories } }).select("name").lean() : [],
			coupon.applicableSubCategories?.length ? SubCategory.find({ _id: { $in: coupon.applicableSubCategories } }).select("name").lean() : [],
			coupon.applicableStyles?.length ? Style.find({ _id: { $in: coupon.applicableStyles } }).select("name").lean() : [],
		]);

		const couponCategoryNames = new Set(couponCategories.map((item) => this.normalizeLookupKey(item.name)));
		const couponSubCategoryNames = new Set(couponSubCategories.map((item) => this.normalizeLookupKey(item.name)));
		const couponStyleNames = new Set(couponStyles.map((item) => this.normalizeLookupKey(item.name)));

		const resolvedProducts = items
			.map((item) => {
				const lookupKeys = [
					String(item?.product || item?._id || item?.sourceId || item?.id || "").trim(),
					this.normalizeLookupKey(item?.name),
				].filter(Boolean);

				for (const key of lookupKeys) {
					const found = productMap.get(key) || productMap.get(this.normalizeLookupKey(key));
					if (found) {
						return found;
					}
				}

				return null;
			})
			.filter(Boolean);

		const getRefName = (ref) => {
			if (!ref) return "";
			if (typeof ref === "string") return ref;
			return String(ref.name || "").trim();
		};

		const categorySet = new Set([...categoryIds, ...resolvedProducts.map((product) => String(product?.category || "")).filter(Boolean)]);
		const subCategorySet = new Set([...subCategoryIds, ...resolvedProducts.map((product) => String(product?.subCategory || "")).filter(Boolean)]);
		const styleSet = new Set([...styleIds, ...resolvedProducts.map((product) => String(product?.style || "")).filter(Boolean)]);
		const productSet = new Set([...productIds, ...resolvedProducts.map((product) => String(product?._id || "")).filter(Boolean)]);
		const typeSet = new Set([
			...productTypes.map((item) => String(item).trim()),
			...resolvedProducts.map((product) => String(product?.gender || "")).filter(Boolean),
		]);

		const categoryNameSet = new Set(resolvedProducts.map((product) => this.normalizeLookupKey(getRefName(product?.category))).filter(Boolean));
		const subCategoryNameSet = new Set(resolvedProducts.map((product) => this.normalizeLookupKey(getRefName(product?.subCategory))).filter(Boolean));
		const styleNameSet = new Set(resolvedProducts.map((product) => this.normalizeLookupKey(getRefName(product?.style))).filter(Boolean));

		const matchesCategory = (coupon.applicableCategories || []).length === 0 || coupon.applicableCategories.some((id) => categorySet.has(String(id)) || couponCategoryNames.has(this.normalizeLookupKey(id)) || [...categoryNameSet].some((name) => couponCategoryNames.has(name)));
		const matchesSubCategory = (coupon.applicableSubCategories || []).length === 0 || coupon.applicableSubCategories.some((id) => subCategorySet.has(String(id)) || couponSubCategoryNames.has(this.normalizeLookupKey(id)) || [...subCategoryNameSet].some((name) => couponSubCategoryNames.has(name)));
		const matchesStyle = (coupon.applicableStyles || []).length === 0 || coupon.applicableStyles.some((id) => styleSet.has(String(id)) || couponStyleNames.has(this.normalizeLookupKey(id)) || [...styleNameSet].some((name) => couponStyleNames.has(name)));
		const matchesProduct = (coupon.applicableProducts || []).length === 0 || coupon.applicableProducts.some((id) => productSet.has(String(id)));
		const matchesType = (coupon.applicableProductTypes || []).length === 0 || coupon.applicableProductTypes.some((value) => typeSet.has(String(value)));

		const offerCategory = this.normalizeLookupKey(coupon.offerCategory);
		const offerCategoryMatches =
			offerCategory === "all" ||
			(offerCategory === "jewellery" && categoryNameSet.has("jewellery")) ||
			(offerCategory === "combo" && (categoryNameSet.has("curated combos") || categoryNameSet.has("fan combos"))) ||
			(offerCategory === "gift" && categoryNameSet.has("gift boxes"));

		const result =
			matchesCategory &&
			matchesSubCategory &&
			matchesStyle &&
			matchesProduct &&
			matchesType &&
			offerCategoryMatches;

		console.log("[coupon] matchesTargeting result", {
			code: coupon.code,
			resolvedProducts: resolvedProducts.map((product) => ({
				id: String(product?._id || ""),
				title: product?.title,
				category: getRefName(product?.category),
				subCategory: getRefName(product?.subCategory),
				style: getRefName(product?.style),
				gender: product?.gender,
			})),
			categorySet: [...categorySet],
			subCategorySet: [...subCategorySet],
			styleSet: [...styleSet],
			productSet: [...productSet],
			typeSet: [...typeSet],
			categoryNameSet: [...categoryNameSet],
			subCategoryNameSet: [...subCategoryNameSet],
			styleNameSet: [...styleNameSet],
			couponCategoryNames: [...couponCategoryNames],
			couponSubCategoryNames: [...couponSubCategoryNames],
			couponStyleNames: [...couponStyleNames],
			offerCategory,
			offerCategoryMatches,
			matches: {
				category: matchesCategory,
				subCategory: matchesSubCategory,
				style: matchesStyle,
				product: matchesProduct,
				type: matchesType,
			},
			result,
		});

		return result;
	}

	calculateDiscount(coupon, cartTotal) {
		let discountAmount = 0;

		if (coupon.discountType === "percentage") {
			discountAmount = (cartTotal * coupon.discountValue) / 100;
		} else if (coupon.discountType === "fixed") {
			discountAmount = coupon.discountValue;
		}

		if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
			discountAmount = coupon.maxDiscount;
		}

		if (discountAmount > cartTotal) {
			discountAmount = cartTotal;
		}

		return discountAmount;
	}

	generateWelcomeCouponCode() {
		return `WELCOME10-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
	}

	async createWelcomeCoupon(user) {
		try {
			const expiryDate = new Date();
			expiryDate.setDate(expiryDate.getDate() + 30);

			const coupon = await Coupon.create({
				code: this.generateWelcomeCouponCode(),
				name: "Welcome 10% Off",
				description: "One-time welcome coupon for a new signup",
				discountType: "percentage",
				discountValue: 10,
				maxDiscount: 500,
				expiryDate,
				isActive: true,
				usageLimit: 1,
				usedCount: 0,
				issuedForEmail: user.email,
				issuedForUserId: user._id,
				isWelcomeOffer: true,
			});

			return { success: true, coupon };
		} catch (error) {
			console.error("Error creating welcome coupon:", error);
			throw error;
		}
	}

	async getCoupons() {
		try {
			const coupons = await Coupon.find().sort({ createdAt: -1 });
			return { success: true, coupons };
		} catch (error) {
			console.error("Error fetching coupons:", error);
			throw error;
		}
	}

	async getPublicOffers() {
		try {
			const now = new Date();
			const offers = await Coupon.find({
				isActive: true,
				isWelcomeOffer: false,
				$or: [{ startsAt: { $exists: false } }, { startsAt: null }, { startsAt: { $lte: now } }],
				$and: [{ $or: [{ expiryDate: { $exists: false } }, { expiryDate: null }, { expiryDate: { $gte: now } }] }],
			})
				.select("code name description discountType discountValue maxDiscount minOrderValue expiryDate offerCategory image isFeatured")
				.sort({ isFeatured: -1, createdAt: -1 });

			return { success: true, offers };
		} catch (error) {
			console.error("Error fetching public offers:", error);
			throw error;
		}
	}

	async validateCoupon(couponCode, context = {}, userContext = {}) {
		try {
			console.log("[coupon] validateCoupon request", {
				couponCode,
				cartTotal: context.cartTotal,
				contextKeys: {
					categoryIds: context.categoryIds,
					subCategoryIds: context.subCategoryIds,
					styleIds: context.styleIds,
					productIds: context.productIds,
					productTypes: context.productTypes,
					itemCount: Array.isArray(context.items) ? context.items.length : 0,
				},
				userContext,
			});

			const coupon = await Coupon.findOne({ code: this.normalizeCode(couponCode) });

			if (!coupon) {
				console.log("[coupon] validateCoupon not found", { couponCode });
				return { success: false, valid: false, message: "Coupon not found" };
			}

			console.log("[coupon] validateCoupon coupon loaded", {
				code: coupon.code,
				offerCategory: coupon.offerCategory,
				applicableCounts: {
					categories: (coupon.applicableCategories || []).length,
					subCategories: (coupon.applicableSubCategories || []).length,
					styles: (coupon.applicableStyles || []).length,
					products: (coupon.applicableProducts || []).length,
					productTypes: (coupon.applicableProductTypes || []).length,
				},
			});

			const availability = this.isCouponAvailable(coupon);
			if (!availability.valid) {
				console.log("[coupon] validateCoupon unavailable", {
					code: coupon.code,
					message: availability.message,
				});
				return { success: false, valid: false, message: availability.message };
			}

			if (coupon.minOrderValue && Number(context.cartTotal || 0) < coupon.minOrderValue) {
				return {
					success: false,
					valid: false,
					message: `Minimum order value is INR ${coupon.minOrderValue}`,
				};
			}

			if (coupon.issuedForEmail && userContext.email && coupon.issuedForEmail !== userContext.email) {
				return { success: false, valid: false, message: "Coupon is not assigned to this account" };
			}

			if (coupon.issuedForUserId && userContext.userId && String(coupon.issuedForUserId) !== String(userContext.userId)) {
				return { success: false, valid: false, message: "Coupon is not assigned to this user" };
			}

			const targetMatch = await this.matchesTargeting(coupon, context);
			if (!targetMatch) {
				console.log("[coupon] validateCoupon targeting failed", {
					code: coupon.code,
					offerCategory: coupon.offerCategory,
				});
				return {
					success: false,
					valid: false,
					message: "Coupon does not apply to selected products/categories",
				};
			}

			console.log("[coupon] validateCoupon success", {
				code: coupon.code,
				cartTotal: context.cartTotal,
			});

			return { success: true, valid: true, coupon };
		} catch (error) {
			console.error("Error validating coupon:", error);
			throw error;
		}
	}

	async createCoupon(couponData) {
		try {
			const payload = this.buildCouponPayload(couponData);
			const coupon = await Coupon.create(payload);
			return { success: true, coupon };
		} catch (error) {
			console.error("Error creating coupon:", error);
			throw error;
		}
	}

	async updateCoupon(couponId, updateData) {
		try {
			const existing = await Coupon.findById(couponId);
			if (!existing) {
				throw new Error("Coupon not found");
			}

			const payload = this.buildCouponPayload(updateData, existing);
			const coupon = await Coupon.findByIdAndUpdate(couponId, payload, { returnDocument: "after" });
			if (!coupon) {
				throw new Error("Coupon not found");
			}
			return { success: true, coupon };
		} catch (error) {
			console.error("Error updating coupon:", error);
			throw error;
		}
	}

	async deleteCoupon(couponId) {
		try {
			await Coupon.findByIdAndDelete(couponId);
			return { success: true, message: "Coupon deleted successfully" };
		} catch (error) {
			console.error("Error deleting coupon:", error);
			throw error;
		}
	}

	async applyCoupon(couponCode, cartTotal, context = {}, userContext = {}) {
		try {
			console.log("[coupon] applyCoupon request", {
				couponCode,
				cartTotal,
				contextKeys: {
					categoryIds: context.categoryIds,
					subCategoryIds: context.subCategoryIds,
					styleIds: context.styleIds,
					productIds: context.productIds,
					productTypes: context.productTypes,
					itemCount: Array.isArray(context.items) ? context.items.length : 0,
				},
			});

			const validation = await this.validateCoupon(couponCode, { ...context, cartTotal }, userContext);
			if (!validation.valid) {
				console.log("[coupon] applyCoupon validation failed", {
					code: couponCode,
					message: validation.message,
				});
				throw new Error(validation.message || "Invalid coupon code");
			}

			const coupon = validation.coupon;
			const discountAmount = this.calculateDiscount(coupon, Number(cartTotal || 0));

			return {
				success: true,
				discountAmount,
				finalTotal: cartTotal - discountAmount,
				coupon,
			};
		} catch (error) {
			console.error("Error applying coupon:", error);
			throw error;
		}
	}
}

export default new CouponService();
