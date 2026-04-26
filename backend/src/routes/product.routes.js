import { Router } from "express";
import {
	createProduct,
	deleteProduct,
	filterProducts,
	getProductById,
	getProductReviews,
	getProducts,
	searchProducts,
	updateProduct,
	addProductReview,
	getTags,
} from "../controllers/product.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", getProducts);
router.get("/tags", getTags);
router.get("/search", searchProducts);
router.get("/filter", filterProducts);
router.get("/:id", getProductById);
router.post("/:id/review", requireAuth, addProductReview);
router.get("/:id/reviews", getProductReviews);

export default router;