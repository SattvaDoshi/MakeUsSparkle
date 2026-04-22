import { Router } from "express";
import { createAbandoned, getAbandoned } from "../controllers/abandoned.controller.js";
import { requireAdmin, requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", requireAuth, createAbandoned);
router.get("/admin", requireAdmin, getAbandoned);

export default router;