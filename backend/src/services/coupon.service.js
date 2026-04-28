import Coupon from "../models/coupon.model.js";
import Product from "../models/product.model.js";
import crypto from "crypto";

class CouponService {
	normalizeCode(code = "") {
		return String(code).trim().toUpperCase();
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
			payload.discountType = payload.discountType === "fixed" ? "fixed" : "percentage";
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
		const productIds = [...new Set(items.map((item) => String(item?.product || item?._id || "").trim()).filter(Boolean))];

		if (productIds.length === 0) {
			return new Map();
		}

		const products = await Product.find({ _id: { $in: productIds } })
			.select("_id category subCategory style gender")
			.lean();

		return new Map(products.map((product) => [String(product._id), product]));
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

		if (!needsProductScopedCheck) {
			return true;
		}

		const productMap = await this.hydrateCartProducts(items);
		const categorySet = new Set([...categoryIds, ...items.map((item) => String(productMap.get(String(item?.product || item?._id || ""))?.category || "")).filter(Boolean)]);
		const subCategorySet = new Set([...subCategoryIds, ...items.map((item) => String(productMap.get(String(item?.product || item?._id || ""))?.subCategory || "")).filter(Boolean)]);
		const styleSet = new Set([...styleIds, ...items.map((item) => String(productMap.get(String(item?.product || item?._id || ""))?.style || "")).filter(Boolean)]);
		const productSet = new Set([...productIds, ...items.map((item) => String(item?.product || item?._id || "")).filter(Boolean)]);
		const typeSet = new Set([
			...productTypes.map((item) => String(item).trim()),
			...items.map((item) => String(productMap.get(String(item?.product || item?._id || ""))?.gender || "")).filter(Boolean),
		]);

		const matchesCategory = (coupon.applicableCategories || []).length === 0 || coupon.applicableCategories.some((id) => categorySet.has(String(id)));
		const matchesSubCategory = (coupon.applicableSubCategories || []).length === 0 || coupon.applicableSubCategories.some((id) => subCategorySet.has(String(id)));
		const matchesStyle = (coupon.applicableStyles || []).length === 0 || coupon.applicableStyles.some((id) => styleSet.has(String(id)));
		const matchesProduct = (coupon.applicableProducts || []).length === 0 || coupon.applicableProducts.some((id) => productSet.has(String(id)));
		const matchesType = (coupon.applicableProductTypes || []).length === 0 || coupon.applicableProductTypes.some((value) => typeSet.has(String(value)));

		return matchesCategory && matchesSubCategory && matchesStyle && matchesProduct && matchesType;
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
			const coupon = await Coupon.findOne({ code: this.normalizeCode(couponCode) });

			if (!coupon) {
				return { success: false, valid: false, message: "Coupon not found" };
			}

			const availability = this.isCouponAvailable(coupon);
			if (!availability.valid) {
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
				return {
					success: false,
					valid: false,
					message: "Coupon does not apply to selected products/categories",
				};
			}

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
			const validation = await this.validateCoupon(couponCode, { ...context, cartTotal }, userContext);
			if (!validation.valid) {
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
