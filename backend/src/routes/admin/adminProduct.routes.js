import { Router } from "express";
import {
	createProduct,
	deleteProduct,
	updateProduct,
} from "../../controllers/product.controller.js";
import { requireAdmin, requireAuth } from "../../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth, requireAdmin);

router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

export default router;