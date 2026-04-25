import { Router } from "express";
import {
	createCuratedCombo,
	deleteCombo,
	updateCombo,
} from "../../controllers/combo.controller.js";
import { requireAdmin, requireAuth } from "../../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth, requireAdmin);

router.post("/", createCuratedCombo);
router.put("/:id", updateCombo);
router.delete("/:id", deleteCombo);

export default router;