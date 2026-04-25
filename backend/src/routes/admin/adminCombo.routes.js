import { Router } from "express";
import {
	createCombo,
	deleteCombo,
	updateCombo,
} from "../../controllers/combo.controller.js";
import { requireAdmin, requireAuth } from "../../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth, requireAdmin);

router.post("/", createCombo);
router.put("/:id", updateCombo);
router.delete("/:id", deleteCombo);

export default router;