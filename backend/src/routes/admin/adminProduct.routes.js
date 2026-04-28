import { Router } from "express";
import {
	createProduct,
	deleteProduct,
	updateProduct,
} from "../../controllers/product.controller.js";
import { requireAdmin, requireAuth } from "../../middleware/auth.middleware.js";
import { uploadMultipleImages } from "../../middleware/upload.middleware.js";

const router = Router();

router.use(requireAuth, requireAdmin);

router.post("/", uploadMultipleImages, createProduct);
router.put("/:id", uploadMultipleImages, updateProduct);
router.delete("/:id", deleteProduct);

export default router;