import express from "express";
import { addReview, getProductReviews } from "../controllers/review.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", requireAuth, addReview);
router.get("/product/:productId", getProductReviews);

export default router;
