import { Router } from "express";
import { requireAdmin, requireAuth } from "../../middleware/auth.middleware.js";
import {
	getAdminAffiliatesOverview,
	createAdminAffiliateCoupon,
	deleteAdminAffiliateCoupon,
} from "../../controllers/affiliate.controller.js";

const router = Router();

router.use(requireAuth, requireAdmin);

// GET /admin/affiliate/dashboard
router.get("/dashboard", getAdminAffiliatesOverview);

// POST /admin/affiliate/coupons
router.post("/coupons", createAdminAffiliateCoupon);

// DELETE /admin/affiliate/coupons/:id
router.delete("/coupons/:id", deleteAdminAffiliateCoupon);

export default router;

