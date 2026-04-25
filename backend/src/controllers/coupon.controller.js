import couponService from "../services/coupon.service.js";

export async function getCoupons(req, res) {
	try {
		const result = await couponService.getCoupons();
		res.json(result);
	} catch (error) {
		console.error("Get coupons error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

export async function validateCoupon(req, res) {
	try {
		const result = await couponService.validateCoupon(req.body.code);
		res.json(result);
	} catch (error) {
		console.error("Validate coupon error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

export async function createCoupon(req, res) {
	try {
		const result = await couponService.createCoupon(req.body);
		res.status(201).json(result);
	} catch (error) {
		console.error("Create coupon error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

export async function updateCoupon(req, res) {
	try {
		const result = await couponService.updateCoupon(req.params.id, req.body);
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
		const result = await couponService.applyCoupon(code, cartTotal);
		res.json(result);
	} catch (error) {
		console.error("Apply coupon error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}