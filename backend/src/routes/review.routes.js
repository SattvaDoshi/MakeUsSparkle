import express from "express";
import { addReview, getProductReviews } from "../controllers/review.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

import { uploadMultiple } from "../config/upload.config.js";

const router = express.Router();

router.post("/", requireAuth, uploadMultiple, addReview);
router.get("/product/:productId", getProductReviews);

export default router;
