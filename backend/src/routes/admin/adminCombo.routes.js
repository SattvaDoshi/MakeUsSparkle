import { Router } from "express";
import {
	createCuratedCombo,
	createCustomCombo,
	deleteCombo,
	updateCombo,
} from "../../controllers/combo.controller.js";
import { requireAdmin, requireAuth } from "../../middleware/auth.middleware.js";
import { uploadCombo } from "../../middleware/upload.middleware.js";

const router = Router();

router.use(requireAuth, requireAdmin);

router.post("/", uploadCombo, createCuratedCombo);
router.post("/custom", uploadCombo, createCustomCombo);
router.put("/:id", uploadCombo, updateCombo);
router.delete("/:id", deleteCombo);

export default router;