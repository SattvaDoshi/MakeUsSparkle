import { Router } from "express";
import {
	createPaymentOrder,
	verifyPayment,
} from "../controllers/payment.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth);

router.post("/create-order", createPaymentOrder);
router.post("/verify", verifyPayment);

export default router;