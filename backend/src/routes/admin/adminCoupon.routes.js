import { Router } from "express";
import {
	createCoupon,
	deleteCoupon,
	updateCoupon,
} from "../../controllers/coupon.controller.js";
import { requireAdmin, requireAuth } from "../../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth, requireAdmin);

router.post("/", createCoupon);
router.put("/:id", updateCoupon);
router.delete("/:id", deleteCoupon);

export default router;