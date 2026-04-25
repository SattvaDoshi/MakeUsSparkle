import paymentService from "../services/payment.service.js";

export async function createPaymentOrder(req, res) {
	try {
		const userId = req.user._id;
		const result = await paymentService.createPaymentOrder(userId, req.body);
		res.status(201).json(result);
	} catch (error) {
		console.error("Create payment order error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

export async function verifyPayment(req, res) {
	try {
		const result = await paymentService.verifyPayment(req.body);
		res.json(result);
	} catch (error) {
		console.error("Verify payment error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

export async function getOrderStatus(req, res) {
	try {
		const result = await paymentService.getOrderStatus(req.params.orderId);
		res.json(result);
	} catch (error) {
		console.error("Get order status error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

export async function refundPayment(req, res) {
	try {
		const result = await paymentService.refundPayment(req.params.orderId, req.body.reason);
		res.json(result);
	} catch (error) {
		console.error("Refund payment error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}