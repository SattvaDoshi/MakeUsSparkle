import { Router } from "express";
import {
	createSubCategory,
	deleteSubCategory,
	updateSubCategory,
} from "../../controllers/category.controller.js";
import { requireAdmin, requireAuth } from "../../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth, requireAdmin);

router.post("/", createSubCategory);
router.put("/:id", updateSubCategory);
router.delete("/:id", deleteSubCategory);

export default router;