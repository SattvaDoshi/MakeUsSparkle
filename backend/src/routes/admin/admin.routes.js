import { Router } from "express";
import {
	createUser,
	deleteOrder,
	deleteUser,
	deleteReview,
	getAnalyticsProducts,
	getAnalyticsSales,
	getBanners,
	getCoupons,
	getDashboard,
	getOrders,
	getPayments,
	getProducts,
	getReviews,
	getUsers,
	updateReview,
	updateUser,
	updatePaymentStatus,
} from "../../controllers/admin.controller.js";
import { requireAdmin, requireAuth } from "../../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth, requireAdmin);

router.get("/dashboard", getDashboard);
router.get("/users", getUsers);
router.post("/users", createUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);
router.get("/products", getProducts);
router.get("/orders", getOrders);
router.delete("/orders/:id", deleteOrder);
router.get("/payments", getPayments);
router.put("/payments/:orderId/status", updatePaymentStatus);
router.get("/coupons", getCoupons);
router.get("/banners", getBanners);
router.get("/reviews", getReviews);
router.put("/reviews/:productId/:reviewId", updateReview);
router.delete("/reviews/:productId/:reviewId", deleteReview);
router.get("/analytics/sales", getAnalyticsSales);
router.get("/analytics/products", getAnalyticsProducts);

export default router;