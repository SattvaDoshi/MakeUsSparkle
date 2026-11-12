import affiliateService from "../services/affiliate.service.js";

/**
 * GET /affiliate/me
 * Returns the logged-in user's affiliate link (generates a code if missing).
 */
export async function getAffiliateLink(req, res) {
	try {
		const result = await affiliateService.ensureAffiliateLink(req.user._id);
		res.json(result);
	} catch (error) {
		console.error("getAffiliateLink error:", error);
		res.status(500).json({ success: false, message: error.message });
	}
}

/**
 * GET /affiliate/dashboard
 * Returns commission rows, generated links, coupons, and summary stats.
 */
export async function getAffiliateDashboard(req, res) {
	try {
		const result = await affiliateService.getDashboard(req.user._id);
		res.json(result);
	} catch (error) {
		console.error("getAffiliateDashboard error:", error);
		res.status(500).json({ success: false, message: error.message });
	}
}

/**
 * GET /affiliate/products
 * Returns products for affiliate link generation (10 by default, with search).
 */
export async function getAffiliateProducts(req, res) {
	try {
		const { search, page, limit } = req.query;
		const result = await affiliateService.getProducts({ search, page, limit });
		res.json(result);
	} catch (error) {
		console.error("getAffiliateProducts error:", error);
		res.status(500).json({ success: false, message: error.message });
	}
}

/**
 * POST /affiliate/generate-link
 * Generates an affiliate tracking link for a given product.
 */
export async function generateAffiliateLink(req, res) {
	try {
		const { productId } = req.body;
		const result = await affiliateService.generateProductLink(req.user._id, productId);
		res.json(result);
	} catch (error) {
		console.error("generateAffiliateLink error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

/**
 * POST /affiliate/create-coupon
 * (Disabled for regular users)
 */
export async function createAffiliateCoupon(req, res) {
	try {
		const { code } = req.body;
		const result = await affiliateService.createAffiliateCoupon(req.user._id, code);
		res.json(result);
	} catch (error) {
		console.error("createAffiliateCoupon error:", error);
		res.status(403).json({ success: false, message: error.message });
	}
}

/**
 * GET /admin/affiliate/dashboard
 * Returns complete affiliate analytics, performance by user, commission logs, and affiliate coupons.
 */
export async function getAdminAffiliatesOverview(req, res) {
	try {
		const result = await affiliateService.getAdminAffiliatesOverview();
		res.json(result);
	} catch (error) {
		console.error("getAdminAffiliatesOverview error:", error);
		res.status(500).json({ success: false, message: error.message });
	}
}

/**
 * POST /admin/affiliate/coupons
 * Admin creates an affiliate coupon under a specific affiliate user with targeting and limits.
 */
export async function createAdminAffiliateCoupon(req, res) {
	try {
		const result = await affiliateService.createAdminAffiliateCoupon(req.body);
		res.status(201).json(result);
	} catch (error) {
		console.error("createAdminAffiliateCoupon error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

/**
 * DELETE /admin/affiliate/coupons/:id
 * Admin deletes an affiliate coupon.
 */
export async function deleteAdminAffiliateCoupon(req, res) {
	try {
		const result = await affiliateService.deleteAdminAffiliateCoupon(req.params.id);
		res.json(result);
	} catch (error) {
		console.error("deleteAdminAffiliateCoupon error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

/**
 * POST /affiliate/track-click
 * Public endpoint to track clicks on an affiliate link.
 */
export async function trackAffiliateClick(req, res) {
	try {
		const { affiliateCode, productId, linkCode } = req.body;
		const result = await affiliateService.trackClick({ affiliateCode, productId, linkCode });
		res.json(result);
	} catch (error) {
		console.error("trackAffiliateClick error:", error);
		res.status(500).json({ success: false, message: error.message });
	}
}
