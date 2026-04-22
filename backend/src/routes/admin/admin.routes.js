import { Router } from "express";
import {
	deleteUser,
	getAnalyticsProducts,
	getAnalyticsSales,
	getDashboard,
	getUsers,
} from "../../controllers/admin.controller.js";
import { requireAdmin, requireAuth } from "../../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth, requireAdmin);

router.get("/dashboard", getDashboard);
router.get("/users", getUsers);
router.delete("/users/:id", deleteUser);
router.get("/analytics/sales", getAnalyticsSales);
router.get("/analytics/products", getAnalyticsProducts);

export default router;