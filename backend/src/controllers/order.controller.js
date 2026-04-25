import orderService from "../services/order.service.js";

export async function getOrders(req, res) {
	try {
		const result = await orderService.getOrders(req.user._id);
		res.json(result);
	} catch (error) {
		console.error("Get orders error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

export async function getOrderById(req, res) {
	try {
		const result = await orderService.getOrderById(req.params.id, req.user._id);
		res.json(result);
	} catch (error) {
		console.error("Get order by ID error:", error);
		res.status(404).json({ success: false, message: error.message });
	}
}

export async function createOrder(req, res) {
	try {
		const result = await orderService.createOrder(req.user._id, req.body);
		res.status(201).json(result);
	} catch (error) {
		console.error("Create order error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

export async function updateOrder(req, res) {
	try {
		const result = await orderService.updateOrder(req.params.id, req.body, req.user._id);
		res.json(result);
	} catch (error) {
		console.error("Update order error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

export async function cancelOrder(req, res) {
	try {
		const result = await orderService.cancelOrder(req.params.id, req.user._id);
		res.json(result);
	} catch (error) {
		console.error("Cancel order error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

// Admin endpoint
export async function updateOrderStatus(req, res) {
	try {
		const { status } = req.body;
		const result = await orderService.updateOrderStatus(req.params.id, status);
		res.json(result);
	} catch (error) {
		console.error("Update order status error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

// Admin endpoint
export async function sendShipmentNotification(req, res) {
	try {
		const { trackingNumber, carrier } = req.body;
		const result = await orderService.sendShipmentNotification(req.params.id, trackingNumber, carrier);
		res.json(result);
	} catch (error) {
		console.error("Send shipment notification error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}