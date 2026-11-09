import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
	getAffiliateLink,
	getAffiliateDashboard,
	getAffiliateProducts,
	generateAffiliateLink,
	createAffiliateCoupon,
	trackAffiliateClick,
} from "../controllers/affiliate.controller.js";

const router = Router();

// Public: Track clicks from anyone clicking an affiliate link
router.post("/track-click", trackAffiliateClick);

// Protected routes below (require login)
router.use(requireAuth);

// GET /affiliate/me – returns user's base referral link & code
router.get("/me", getAffiliateLink);

// GET /affiliate/dashboard – returns commission rows + stats + links + coupons
router.get("/dashboard", getAffiliateDashboard);

// GET /affiliate/products – search & list products for affiliate link generation
router.get("/products", getAffiliateProducts);

// POST /affiliate/generate-link – generate product affiliate link
router.post("/generate-link", generateAffiliateLink);

// POST /affiliate/create-coupon – create affiliate coupon
router.post("/create-coupon", createAffiliateCoupon);

export default router;
