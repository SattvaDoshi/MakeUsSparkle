import adminService from "../services/admin.service.js";
import { getSetting, setSetting } from "../models/appSettings.model.js";

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

export async function getRewardsSettings(req, res) {
	try {
		const pointsPerReview = await getSetting("pointsPerReview", 50);
		res.json({ success: true, pointsPerReview });
	} catch (error) {
		console.error("Get rewards settings error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

export async function updateRewardsSettings(req, res) {
	try {
		const { pointsPerReview } = req.body;
		if (pointsPerReview === undefined || pointsPerReview === null) {
			return res.status(400).json({ success: false, message: "pointsPerReview is required" });
		}
		const parsed = Number(pointsPerReview);
		if (isNaN(parsed) || parsed < 0) {
			return res.status(400).json({ success: false, message: "pointsPerReview must be a non-negative number" });
		}
		await setSetting("pointsPerReview", parsed);
		res.json({ success: true, pointsPerReview: parsed });
	} catch (error) {
		console.error("Update rewards settings error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

export async function getCartBannerSettings(req, res) {
	try {
		const cartBannerText = await getSetting("cartBannerText", "");
		res.json({ success: true, cartBannerText });
	} catch (error) {
		console.error("Get cart banner settings error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

export async function updateCartBannerSettings(req, res) {
	try {
		const { cartBannerText } = req.body;
		if (cartBannerText === undefined || cartBannerText === null) {
			return res.status(400).json({ success: false, message: "cartBannerText is required" });
		}
		await setSetting("cartBannerText", String(cartBannerText));
		res.json({ success: true, cartBannerText: String(cartBannerText) });
	} catch (error) {
		console.error("Update cart banner settings error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}