import { Router } from "express";
import {
	createCoupon,
	deleteCoupon,
	updateCoupon,
} from "../../controllers/coupon.controller.js";
import { requireAdmin, requireAuth } from "../../middleware/auth.middleware.js";
import { uploadSingleImage } from "../../middleware/upload.middleware.js";

const router = Router();

router.use(requireAuth, requireAdmin);

router.post("/", uploadSingleImage, createCoupon);
router.put("/:id", uploadSingleImage, updateCoupon);
router.delete("/:id", deleteCoupon);

export default router;