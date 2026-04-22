export async function createPaymentOrder(req, res) {
	res.json({ success: true, message: "Payment order created", provider: "stripe-or-razorpay" });
}

export async function verifyPayment(req, res) {
	res.json({ success: true, message: "Payment verified" });
}