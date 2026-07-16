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
 * Returns commission rows and summary stats for the logged-in affiliate.
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
