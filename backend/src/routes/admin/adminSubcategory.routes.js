import { Router } from "express";
import {
	createSubCategory,
	deleteSubCategory,
	updateSubCategory,
} from "../../controllers/category.controller.js";
import { requireAdmin, requireAuth } from "../../middleware/auth.middleware.js";
import { uploadSingleImage } from "../../middleware/upload.middleware.js";

const router = Router();

router.use(requireAuth, requireAdmin);

router.post("/", uploadSingleImage, createSubCategory);
router.put("/:id", uploadSingleImage, updateSubCategory);
router.delete("/:id", deleteSubCategory);

export default router;