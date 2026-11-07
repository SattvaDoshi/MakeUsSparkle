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
		// The user who signed up or ordered via the affiliate link (optional for guests)
		referredUser: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			default: null,
		},
		// The order placed that triggered this commission
		order: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Order",
			default: null,
		},
		// Specific product if generated via product affiliate link
		product: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Product",
			default: null,
		},
		// The affiliate link document if applicable
		affiliateLink: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "AffiliateLink",
			default: null,
		},
		// The coupon code if commission was driven by an affiliate coupon
		couponCode: {
			type: String,
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
		// pending (awaiting delivery) → delivered/approved (credited) → paid (transferred) | cancelled
		status: {
			type: String,
			enum: ["pending", "delivered", "approved", "paid", "cancelled"],
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
