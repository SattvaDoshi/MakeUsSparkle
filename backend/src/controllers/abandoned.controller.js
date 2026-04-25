import abandonedService from "../services/abandoned.service.js";

export async function createAbandonedCart(req, res) {
	try {
		const result = await abandonedService.createAbandonedCart(req.body);
		res.status(201).json(result);
	} catch (error) {
		console.error("Create abandoned cart error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

export async function getAbandonedCarts(req, res) {
	try {
		const filters = {
			userId: req.query.userId,
			status: req.query.status,
		};
		const result = await abandonedService.getAbandonedCarts(filters);
		res.json(result);
	} catch (error) {
		console.error("Get abandoned carts error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

export async function getAbandonedCartById(req, res) {
	try {
		const result = await abandonedService.getAbandonedCartById(req.params.id);
		res.json(result);
	} catch (error) {
		console.error("Get abandoned cart error:", error);
		res.status(404).json({ success: false, message: error.message });
	}
}

export async function sendRecoveryEmail(req, res) {
	try {
		const result = await abandonedService.sendRecoveryEmail(req.params.id);
		res.json(result);
	} catch (error) {
		console.error("Send recovery email error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

export async function markAsRecovered(req, res) {
	try {
		const result = await abandonedService.markAsRecovered(req.params.id);
		res.json(result);
	} catch (error) {
		console.error("Mark as recovered error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}