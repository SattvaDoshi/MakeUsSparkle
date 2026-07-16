import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
	getAffiliateLink,
	getAffiliateDashboard,
} from "../controllers/affiliate.controller.js";

const router = Router();

// All affiliate routes require authentication
router.use(requireAuth);

// GET /affiliate/me  – returns user's referral link & code
router.get("/me", getAffiliateLink);

// GET /affiliate/dashboard  – returns commission rows + stats
router.get("/dashboard", getAffiliateDashboard);

export default router;
