import { Router } from "express";
import {
	createCategory,
	deleteCategory,
	updateCategory,
} from "../../controllers/category.controller.js";
import { requireAdmin, requireAuth } from "../../middleware/auth.middleware.js";
import { uploadSingleImage } from "../../middleware/upload.middleware.js";

const router = Router();

router.use(requireAuth, requireAdmin);

router.post("/", uploadSingleImage, createCategory);
router.put("/:id", uploadSingleImage, updateCategory);
router.delete("/:id", deleteCategory);

export default router;