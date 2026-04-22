import { Router } from "express";
import {
	createBanner,
	deleteBanner,
	updateBanner,
} from "../../controllers/banner.controller.js";
import { requireAdmin, requireAuth } from "../../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth, requireAdmin);

router.post("/", createBanner);
router.put("/:id", updateBanner);
router.delete("/:id", deleteBanner);

export default router;