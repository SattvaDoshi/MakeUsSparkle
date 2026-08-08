import { Router } from "express";
import {
	createCustomCombo,
	createCuratedCombo,
	updateCombo,
	deleteCombo,
	getComboById,
	getCombos,
} from "../controllers/combo.controller.js";
import {
	getComboReviews,
	addComboReview,
} from "../controllers/review.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { uploadMultiple } from "../config/upload.config.js";

const router = Router();

router.get("/", getCombos);
router.get("/:id/reviews", getComboReviews);
router.post("/:id/reviews", requireAuth, uploadMultiple, addComboReview);
router.get("/:id", getComboById);
router.post("/curated", requireAuth, createCuratedCombo);
router.post("/custom", requireAuth, createCustomCombo);
router.put("/:id", requireAuth, updateCombo);
router.delete("/:id", requireAuth, deleteCombo);

export default router;