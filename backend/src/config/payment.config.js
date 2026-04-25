import crypto from "crypto";
import Razorpay from "razorpay";

const hasRazorpayCredentials = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET;

// Initialize Razorpay only when credentials are available so app startup does not fail in local/dev environments.
export const razorpay = hasRazorpayCredentials
	? new Razorpay({
		key_id: process.env.RAZORPAY_KEY_ID,
		key_secret: process.env.RAZORPAY_KEY_SECRET,
	})
	: null;

export const createRazorpayOrder = async (amount, currency = "INR") => {
	try {
		if (!razorpay) {
			throw new Error("Razorpay credentials are not configured");
		}

		const order = await razorpay.orders.create({
			amount: Math.round(amount * 100), // Convert to paise
			currency,
			receipt: `receipt_${Date.now()}`,
		});
		return order;
	} catch (error) {
		throw new Error(`Razorpay order creation failed: ${error.message}`);
	}
};

export const verifyRazorpaySignature = (orderId, paymentId, signature, secret = process.env.RAZORPAY_KEY_SECRET) => {
	if (!secret) {
		throw new Error("Razorpay credentials are not configured");
	}

	const body = orderId + "|" + paymentId;
	const expectedSignature = crypto.createHmac("sha256", secret).update(body).digest("hex");
	return expectedSignature === signature;
};
