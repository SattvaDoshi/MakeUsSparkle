import couponService from "../services/coupon.service.js";
import { uploadToCloudinary } from "../config/upload.config.js";

export async function getCoupons(req, res) {
	try {
		const result = await couponService.getCoupons();
		res.json(result);
	} catch (error) {
		console.error("Get coupons error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

export async function getPublicOffers(req, res) {
	try {
		const result = await couponService.getPublicOffers();
		res.json(result);
	} catch (error) {
		console.error("Get public offers error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

export async function validateCoupon(req, res) {
	try {
		const context = {
			cartTotal: req.body.cartTotal,
			items: req.body.items,
			categoryIds: req.body.categoryIds,
			subCategoryIds: req.body.subCategoryIds,
			styleIds: req.body.styleIds,
			productIds: req.body.productIds,
			productTypes: req.body.productTypes,
		};
		const userContext = {
			userId: req.user?._id,
			email: req.user?.email,
		};
		const result = await couponService.validateCoupon(req.body.code, context, userContext);
		res.json(result);
	} catch (error) {
		console.error("Validate coupon error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

export async function createCoupon(req, res) {
	try {
		const payload = { ...req.body };
		if (req.file) {
			const uploadResult = await uploadToCloudinary(req.file.buffer, "coupons");
			payload.image = uploadResult.secure_url;
		}
		const result = await couponService.createCoupon(payload);
		res.status(201).json(result);
	} catch (error) {
		console.error("Create coupon error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

export async function updateCoupon(req, res) {
	try {
		const payload = { ...req.body };
		if (req.file) {
			const uploadResult = await uploadToCloudinary(req.file.buffer, "coupons");
			payload.image = uploadResult.secure_url;
		}
		const result = await couponService.updateCoupon(req.params.id, payload);
		res.json(result);
	} catch (error) {
		console.error("Update coupon error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

export async function deleteCoupon(req, res) {
	try {
		const result = await couponService.deleteCoupon(req.params.id);
		res.json(result);
	} catch (error) {
		console.error("Delete coupon error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

export async function applyCoupon(req, res) {
	try {
		const { code, cartTotal } = req.body;
		const context = {
			items: req.body.items,
			categoryIds: req.body.categoryIds,
			subCategoryIds: req.body.subCategoryIds,
			styleIds: req.body.styleIds,
			productIds: req.body.productIds,
			productTypes: req.body.productTypes,
		};
		const userContext = {
			userId: req.user?._id,
			email: req.user?.email,
		};
		const result = await couponService.applyCoupon(code, cartTotal, context, userContext);
		res.json(result);
	} catch (error) {
		console.error("Apply coupon error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}