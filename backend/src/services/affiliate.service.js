import crypto from "crypto";
import User from "../models/user.model.js";
import AffiliateCommission from "../models/affiliate.model.js";

const COMMISSION_RATE = 0.1; // 10%
const FRONTEND_URL =
	process.env.FRONTEND_URL || "https://makeussparkle.com";

/**
 * Generate a collision-resistant 8-char uppercase hex code.
 * Retries up to 5 times to avoid duplicates (extremely unlikely).
 */
async function generateUniqueCode() {
	for (let i = 0; i < 5; i++) {
		const code = crypto.randomBytes(4).toString("hex").toUpperCase();
		const existing = await User.findOne({ referralCode: code });
		if (!existing) return code;
	}
	// Fallback: longer code
	return crypto.randomBytes(8).toString("hex").toUpperCase();
}

class AffiliateService {
	/**
	 * Ensure the user has a referral code, generating one if missing.
	 * Returns the affiliate link.
	 */
	async ensureAffiliateLink(userId) {
		const user = await User.findById(userId);
		if (!user) throw new Error("User not found");

		if (!user.referralCode) {
			user.referralCode = await generateUniqueCode();
			await user.save();
		}

		const affiliateLink = `${FRONTEND_URL}/signup?ref=${user.referralCode}`;
		return {
			success: true,
			affiliateCode: user.referralCode,
			affiliateLink,
		};
	}

	/**
	 * Record a referral during signup.
	 * Called from auth service after creating a new user.
	 *
	 * @param {string} newUserId   - ID of the newly registered user
	 * @param {string} refCode     - referral code from the URL (?ref=...)
	 */
	async recordReferral(newUserId, refCode) {
		if (!refCode) return;

		// Find the affiliate by their referral code
		const affiliate = await User.findOne({ referralCode: refCode });
		if (!affiliate) return; // silently ignore invalid codes

		// Prevent self-referral
		if (affiliate._id.toString() === newUserId.toString()) return;

		// Prevent duplicate referral (user already has a referredBy)
		const alreadyReferred = await User.findById(newUserId);
		if (alreadyReferred?.referredBy) return;

		// Store referredBy on the new user
		await User.findByIdAndUpdate(newUserId, {
			referredBy: affiliate._id,
		});
	}

	/**
	 * Called when an order's payment status becomes "paid".
	 * Creates a commission record for the affiliate who referred the buyer.
	 *
	 * @param {object} order  - Mongoose order document (must have .user & .totalAmount)
	 */
	async onOrderPaid(order) {
		try {
			if (!order?.user) return;

			// Find out who referred this buyer
			const buyer = await User.findById(order.user).select("referredBy");
			if (!buyer?.referredBy) return;

			// Avoid creating duplicate commissions for the same order
			const existing = await AffiliateCommission.findOne({
				order: order._id,
			});
			if (existing) return;

			const orderAmount = order.totalAmount || 0;
			const commission = Math.round(orderAmount * COMMISSION_RATE);

			await AffiliateCommission.create({
				affiliate: buyer.referredBy,
				referredUser: order.user,
				order: order._id,
				orderAmount,
				commission,
				status: "pending",
			});
		} catch (err) {
			// Log but don't crash the order flow
			console.error("[AffiliateService] onOrderPaid error:", err.message);
		}
	}

	/**
	 * Fetch affiliate dashboard data for the given user.
	 * Returns commission rows with referred-user names/emails.
	 */
	async getDashboard(affiliateId) {
		const commissions = await AffiliateCommission.find({ affiliate: affiliateId })
			.sort({ createdAt: -1 })
			.populate("referredUser", "name email")
			.populate("order", "totalAmount createdAt")
			.lean();

		const rows = commissions.map((c) => ({
			id: c._id.toString(),
			referredName:
				c.referredUser?.name ||
				c.referredUser?.email ||
				"Unknown",
			orderAmount: c.orderAmount,
			date: c.createdAt.toISOString(),
			earning: c.commission,
			status: c.status,
		}));

		// Aggregate stats
		const totalOrderValue = rows.reduce((s, r) => s + r.orderAmount, 0);
		const totalEarned = rows.reduce((s, r) => s + r.earning, 0);
		const paidEarned = rows
			.filter((r) => r.status === "paid")
			.reduce((s, r) => s + r.earning, 0);

		// Count distinct referred users (signup count)
		const distinctReferredUsers = await AffiliateCommission.distinct(
			"referredUser",
			{ affiliate: affiliateId }
		);

		return {
			success: true,
			commissions: rows,
			stats: {
				totalReferrals: distinctReferredUsers.length,
				totalOrderValue,
				totalEarned,
				paidEarned,
				pendingEarned: totalEarned - paidEarned,
			},
		};
	}
}

export default new AffiliateService();
export { generateUniqueCode };
