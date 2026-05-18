import { Router } from "express";
import {
	createStyle,
	deleteStyle,
	updateStyle,
} from "../../controllers/style.controller.js";
import { requireAdmin, requireAuth } from "../../middleware/auth.middleware.js";
import { uploadSingleImage } from "../../middleware/upload.middleware.js";

const router = Router();

router.use(requireAuth, requireAdmin);

router.post("/", uploadSingleImage, createStyle);
router.put("/:id", uploadSingleImage, updateStyle);
router.delete("/:id", deleteStyle);

export default router;