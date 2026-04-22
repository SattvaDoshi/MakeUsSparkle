import Coupon from "../models/coupon.model.js";

export async function getCoupons(req, res) {
	const coupons = await Coupon.find();
	res.json({ success: true, coupons });
}

export async function validateCoupon(req, res) {
	const coupon = await Coupon.findOne({ name: req.body.name });
	res.json({ success: true, valid: Boolean(coupon), coupon });
}

export async function createCoupon(req, res) {
	const coupon = await Coupon.create(req.body);
	res.status(201).json({ success: true, coupon });
}

export async function updateCoupon(req, res) {
	const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
	res.json({ success: true, coupon });
}

export async function deleteCoupon(req, res) {
	await Coupon.findByIdAndDelete(req.params.id);
	res.json({ success: true, message: "Coupon deleted" });
}