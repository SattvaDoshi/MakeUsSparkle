import { Router } from "express";
import {
	getOrders,
	updateOrderStatus,
} from "../../controllers/order.controller.js";
import { requireAdmin, requireAuth } from "../../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth, requireAdmin);

router.get("/", getOrders);
router.put("/:id/status", updateOrderStatus);

export default router;