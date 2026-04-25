import { Router } from "express";
import { createAbandonedCart, getAbandonedCarts } from "../controllers/abandoned.controller.js";
import { requireAdmin, requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", requireAuth, createAbandonedCart);
router.get("/admin", requireAdmin, getAbandonedCarts);

export default router;