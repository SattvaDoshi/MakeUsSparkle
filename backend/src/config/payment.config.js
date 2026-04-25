import Razorpay from "razorpay";

// Initialize Razorpay
export const razorpay = new Razorpay({
	key_id: process.env.RAZORPAY_KEY_ID,
	key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createRazorpayOrder = async (amount, currency = "INR") => {
	try {
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
	const crypto = require("crypto");
	const body = orderId + "|" + paymentId;
	const expectedSignature = crypto.createHmac("sha256", secret).update(body).digest("hex");
	return expectedSignature === signature;
};
