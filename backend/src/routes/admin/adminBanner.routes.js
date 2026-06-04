import { Router } from "express";
import {
	createBanner,
	createMainBanner,
	deleteBanner,
	getMainBannersAdmin,
	updateMainBanner,
	updateBanner,
} from "../../controllers/banner.controller.js";
import { requireAdmin, requireAuth } from "../../middleware/auth.middleware.js";
import { uploadSingleImage } from "../../middleware/upload.middleware.js";

const router = Router();

router.use(requireAuth, requireAdmin);

router.get("/main", getMainBannersAdmin);
router.post("/main", uploadSingleImage, createMainBanner);
router.put("/main/:id", uploadSingleImage, updateMainBanner);
router.delete("/main/:id", deleteBanner);

router.post("/", uploadSingleImage, createBanner);
router.put("/:id", uploadSingleImage, updateBanner);
router.delete("/:id", deleteBanner);

export default router;