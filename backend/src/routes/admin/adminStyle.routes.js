import { Router } from "express";
import {
	createStyle,
	deleteStyle,
	updateStyle,
} from "../../controllers/style.controller.js";
import { requireAdmin, requireAuth } from "../../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth, requireAdmin);

router.post("/", createStyle);
router.put("/:id", updateStyle);
router.delete("/:id", deleteStyle);

export default router;