import { Router } from "express";
import { getRewardPoints, getRewardsSettings } from "../controllers/rewards.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

// Public — used in review modal to show points-per-review
router.get("/settings", getRewardsSettings);

// Auth required — returns logged-in user's points balance
router.get("/points", requireAuth, getRewardPoints);

export default router;
