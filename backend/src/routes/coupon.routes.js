import { Router } from "express";
import {
	applyCoupon,
	getPublicOffers,
	getCoupons,
	validateCoupon,
} from "../controllers/coupon.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/offers", getPublicOffers);

router.use(requireAuth);

router.get("/", getCoupons);
router.post("/validate", validateCoupon);
router.post("/apply", applyCoupon);

export default router;