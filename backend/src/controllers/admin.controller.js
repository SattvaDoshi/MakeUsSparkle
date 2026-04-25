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