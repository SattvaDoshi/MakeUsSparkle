import { Router } from "express";
import {
	getCoupons,
	validateCoupon,
} from "../controllers/coupon.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth);

router.get("/", getCoupons);
router.post("/validate", validateCoupon);

export default router;