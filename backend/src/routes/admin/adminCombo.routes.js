import { Router } from "express";
import {
	createCuratedCombo,
	createCustomCombo,
	deleteCombo,
	updateCombo,
} from "../../controllers/combo.controller.js";
import { requireAdmin, requireAuth } from "../../middleware/auth.middleware.js";
import { uploadSingleImage } from "../../middleware/upload.middleware.js";

const router = Router();

router.use(requireAuth, requireAdmin);

router.post("/", uploadSingleImage, createCuratedCombo);
router.post("/custom", uploadSingleImage, createCustomCombo);
router.put("/:id", uploadSingleImage, updateCombo);
router.delete("/:id", deleteCombo);

export default router;