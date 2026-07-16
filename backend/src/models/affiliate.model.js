import mongoose from "mongoose";

/**
 * Affiliate Commission Model
 *
 * Each document represents a commission earned by an affiliate (referrer)
 * when a referred user places and pays for an order.
 *
 * One affiliate can refer many users; each referred user can place many
 * orders — so there will be one document per (affiliate, referredUser, order).
 */
const affiliateCommissionSchema = new mongoose.Schema(
	{
		// The user who owns the referral link (earns commission)
		affiliate: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
		// The user who signed up via the affiliate link
		referredUser: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		// The order placed by the referred user that triggered this commission.
		// Null means the referred user has signed up but not yet ordered.
		order: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Order",
			default: null,
		},
		// Amount of the order (captured at commission creation time)
		orderAmount: {
			type: Number,
			default: 0,
		},
		// 10% of orderAmount
		commission: {
			type: Number,
			default: 0,
		},
		// pending → approved → paid
		status: {
			type: String,
			enum: ["pending", "approved", "paid"],
			default: "pending",
		},
	},
	{ timestamps: true }
);

// Prevent duplicate commission records for the same order
affiliateCommissionSchema.index({ order: 1 }, { unique: true, sparse: true });

const AffiliateCommission = mongoose.model(
	"AffiliateCommission",
	affiliateCommissionSchema
);

export default AffiliateCommission;
