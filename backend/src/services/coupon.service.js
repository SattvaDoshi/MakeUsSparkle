import Coupon from "../models/coupon.model.js";

class CouponService {
	async getCoupons() {
		try {
			const coupons = await Coupon.find().sort({ createdAt: -1 });
			return { success: true, coupons };
		} catch (error) {
			console.error("Error fetching coupons:", error);
			throw error;
		}
	}

	async validateCoupon(couponCode) {
		try {
			const coupon = await Coupon.findOne({ code: couponCode });

			if (!coupon) {
				return { success: false, valid: false, message: "Coupon not found" };
			}

			// Check if coupon is active and not expired
			const now = new Date();
			if (coupon.expiryDate && coupon.expiryDate < now) {
				return { success: false, valid: false, message: "Coupon has expired" };
			}

			if (!coupon.isActive) {
				return { success: false, valid: false, message: "Coupon is not active" };
			}

			return { success: true, valid: true, coupon };
		} catch (error) {
			console.error("Error validating coupon:", error);
			throw error;
		}
	}

	async createCoupon(couponData) {
		try {
			const coupon = await Coupon.create(couponData);
			return { success: true, coupon };
		} catch (error) {
			console.error("Error creating coupon:", error);
			throw error;
		}
	}

	async updateCoupon(couponId, updateData) {
		try {
			const coupon = await Coupon.findByIdAndUpdate(couponId, updateData, { new: true });
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

	async applyCoupon(couponCode, cartTotal) {
		try {
			const coupon = await Coupon.findOne({ code: couponCode });

			if (!coupon) {
				throw new Error("Invalid coupon code");
			}

			// Check expiry
			const now = new Date();
			if (coupon.expiryDate && coupon.expiryDate < now) {
				throw new Error("Coupon has expired");
			}

			if (!coupon.isActive) {
				throw new Error("Coupon is not active");
			}

			// Calculate discount
			let discountAmount = 0;
			if (coupon.discountType === "percentage") {
				discountAmount = (cartTotal * coupon.discountValue) / 100;
			} else if (coupon.discountType === "fixed") {
				discountAmount = coupon.discountValue;
			}

			// Apply max discount if set
			if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
				discountAmount = coupon.maxDiscount;
			}

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
