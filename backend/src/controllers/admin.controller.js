import adminService from "../services/admin.service.js";

export async function getDashboard(req, res) {
	try {
		const result = await adminService.getDashboardStats();
		res.json(result);
	} catch (error) {
		console.error("Get dashboard error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

export async function getUsers(req, res) {
	try {
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 10;
		const result = await adminService.getUsers(page, limit);
		res.json(result);
	} catch (error) {
		console.error("Get users error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

export async function deleteUser(req, res) {
	try {
		const result = await adminService.deleteUser(req.params.id);
		res.json(result);
	} catch (error) {
		console.error("Delete user error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

export async function createUser(req, res) {
	try {
		const result = await adminService.createUser(req.body);
		res.status(201).json(result);
	} catch (error) {
		console.error("Create user error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

export async function updateUser(req, res) {
	try {
		const result = await adminService.updateUser(req.params.id, req.body);
		res.json(result);
	} catch (error) {
		console.error("Update user error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

export async function getAnalyticsSales(req, res) {
	try {
		const startDate = req.query.startDate;
		const endDate = req.query.endDate;
		const result = await adminService.getSalesAnalytics(startDate, endDate);
		res.json(result);
	} catch (error) {
		console.error("Get sales analytics error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

export async function getAnalyticsProducts(req, res) {
	try {
		const result = await adminService.getProductAnalytics();
		res.json(result);
	} catch (error) {
		console.error("Get product analytics error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

export async function getAnalyticsOrders(req, res) {
	try {
		const status = req.query.status;
		const result = await adminService.getOrderAnalytics(status);
		res.json(result);
	} catch (error) {
		console.error("Get order analytics error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

export async function getProducts(req, res) {
	try {
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 20;
		const result = await adminService.getProducts(page, limit);
		res.json(result);
	} catch (error) {
		console.error("Get admin products error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

export async function getOrders(req, res) {
	try {
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 20;
		const result = await adminService.getOrders(page, limit);
		res.json(result);
	} catch (error) {
		console.error("Get admin orders error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

export async function getPayments(req, res) {
	try {
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 20;
		const result = await adminService.getPayments(page, limit);
		res.json(result);
	} catch (error) {
		console.error("Get payments error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

export async function updatePaymentStatus(req, res) {
	try {
		const { paymentStatus } = req.body;
		const result = await adminService.updatePaymentStatus(req.params.orderId, paymentStatus);
		res.json(result);
	} catch (error) {
		console.error("Update payment status error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

export async function deleteOrder(req, res) {
	try {
		const result = await adminService.deleteOrder(req.params.id);
		res.json(result);
	} catch (error) {
		console.error("Delete order error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

export async function getCoupons(req, res) {
	try {
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 20;
		const result = await adminService.getCoupons(page, limit);
		res.json(result);
	} catch (error) {
		console.error("Get coupons error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

export async function getBanners(req, res) {
	try {
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 20;
		const result = await adminService.getBanners(page, limit);
		res.json(result);
	} catch (error) {
		console.error("Get banners error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

export async function getReviews(req, res) {
	try {
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 30;
		const result = await adminService.getReviews(page, limit);
		res.json(result);
	} catch (error) {
		console.error("Get reviews error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

export async function updateReview(req, res) {
	try {
		const result = await adminService.updateReview(req.params.productId, req.params.reviewId, req.body);
		res.json(result);
	} catch (error) {
		console.error("Update review error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

export async function deleteReview(req, res) {
	try {
		const result = await adminService.deleteReview(req.params.productId, req.params.reviewId);
		res.json(result);
	} catch (error) {
		console.error("Delete review error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}