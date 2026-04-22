import { Router } from "express";
import {
	createCustomCombo,
	getComboById,
	getCombos,
} from "../controllers/combo.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", getCombos);
router.get("/:id", getComboById);
router.post("/custom", requireAuth, createCustomCombo);

export default router;