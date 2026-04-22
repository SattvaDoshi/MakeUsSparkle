import { Router } from "express";
import {
	cancelOrder,
	createOrder,
	getMyOrders,
	getOrderById,
} from "../controllers/order.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth);

router.post("/create", createOrder);
router.get("/my-orders", getMyOrders);
router.get("/:id", getOrderById);
router.post("/cancel/:id", cancelOrder);

export default router;