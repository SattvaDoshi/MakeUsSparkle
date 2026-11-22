/**
 * Order payment lifecycle. Every transition is ONE atomic claim on the order document
 * (findOneAndUpdate with the expected previous state), so two callers racing — a refresh on the status page,
 * the background sweeper, an admin cancel — can never both run the side effects (stock, emails, refunds).
 *
 *   pending ──paid──▶ paid | partial_paid      (stock deducted, email, affiliate)
 *   pending ──failed─▶ failed + cancelled      (reward points and coupon use handed back)
 */
import Order from "../models/order.model.js";
import User from "../models/user.model.js";
import Coupon from "../models/coupon.model.js";
import { phonePeClient } from "../config/payment.config.js";
import inventoryService from "./inventory.service.js";
import emailService from "./email.service.js";
import affiliateService from "./affiliate.service.js";

/** Give back the reward points and the coupon use an order took when it was created. Safe to call repeatedly. */
export async function releaseOrderPerks(orderId) {
	const claimed = await Order.findOneAndUpdate(
		{ _id: orderId, perksReleased: { $ne: true } },
		{ $set: { perksReleased: true } },
		{ returnDocument: "after" }
	);
	if (!claimed) return false; // already released (or no such order)
	if (claimed.rewardPointsRedeemed > 0) {
		await User.updateOne({ _id: claimed.user }, { $inc: { rewardPoints: claimed.rewardPointsRedeemed } });
	}
	if (claimed.discountCode) {
		await Coupon.updateOne({ code: claimed.discountCode, usedCount: { $gt: 0 } }, { $inc: { usedCount: -1 } });
	}
	return true;
}

/** Payment did not happen: cancel the order and hand the perks back. Only acts on orders still awaiting payment. */
export async function failPendingOrder(orderId) {
	const order = await Order.findOneAndUpdate(
		{ _id: orderId, paymentStatus: "pending" },
		{ $set: { paymentStatus: "failed", status: "cancelled" } },
		{ returnDocument: "after" }
	);
	if (!order) return false;
	await releaseOrderPerks(order._id).catch((e) => console.error("[orderLifecycle] release perks failed:", e.message));
	void affiliateService.onOrderCancelled(order);
	return true;
}

/** Payment confirmed: mark paid and run the one-time side effects. Returns the order, and whether THIS call did the work. */
export async function completePaidOrder(orderId, { transactionId = null, paidPaise = NaN } = {}) {
	const current = await Order.findById(orderId);
	if (!current) throw new Error("Order not found");
	if (current.paymentStatus === "paid" || current.paymentStatus === "partial_paid") return { order: current, didWork: false };

	const expectedPaise = Math.round(Number(current.advanceAmount || current.totalAmount || 0) * 100);
	if (Number.isFinite(paidPaise) && paidPaise < expectedPaise) throw new Error("Paid amount does not match the order amount");

	const isPartialCod = current.paymentMode === "PARTIAL_COD";
	const order = await Order.findOneAndUpdate(
		{ _id: orderId, paymentStatus: "pending" },
		{
			$set: {
				paymentStatus: isPartialCod ? "partial_paid" : "paid",
				paidAmount: isPartialCod ? Number(current.advanceAmount || current.totalAmount || 0) : Number(current.totalAmount || 0),
				phonePeTransactionId: transactionId,
				status: "placed",
			},
		},
		{ returnDocument: "after" }
	);
	if (!order) {
		// Lost the race (someone else completed or failed it): report what it is now.
		return { order: await Order.findById(orderId), didWork: false };
	}

	await inventoryService.deductOrderInventory(order);

	try {
		const populated = await order.populate([
			{ path: "user" },
			{ path: "items.product", select: "title" },
			{ path: "items.selectedCharms" },
			{ path: "items.selectionGroups.items.item" },
		]);
		await emailService.sendOrderConfirmationEmail(populated.user.email, order._id, order.items, order.totalAmount);
	} catch (e) {
		console.error("[orderLifecycle] confirmation email failed (order is still paid):", e.message);
	}
	void affiliateService.onOrderPaid(order);
	return { order, didWork: true };
}

/**
 * Ask PhonePe what happened to an order's payment and bring our record in line.
 * @returns "paid" | "failed" | "pending"
 */
export async function settleOrderPayment(order) {
	if (order.paymentStatus === "paid" || order.paymentStatus === "partial_paid") return "paid";
	if (order.paymentStatus !== "pending") return "failed";
	if (!phonePeClient) throw new Error("PhonePe credentials are not configured");

	const res = await phonePeClient.getOrderStatus(order.phonePeOrderId);
	const state = res?.state; // COMPLETED | FAILED | PENDING
	if (state === "COMPLETED") {
		await completePaidOrder(order._id, { transactionId: res?.paymentDetails?.[0]?.transactionId || null, paidPaise: Number(res?.amount) });
		return "paid";
	}
	if (state === "FAILED" || state === "CANCELLED") {
		await failPendingOrder(order._id);
		return "failed";
	}
	return "pending";
}

const SWEEP_EVERY_MS = 5 * 60 * 1000;
const GIVE_UP_AFTER_MS = 45 * 60 * 1000; // PhonePe sessions expire well before this
const LOOKBACK_MS = 3 * 24 * 60 * 60 * 1000;

/**
 * Orders whose shopper never came back (closed the PhonePe tab, lost signal…):
 * complete them if the money did arrive, cancel them and return points/coupons if it never will.
 */
export async function sweepStalePayments() {
	const now = Date.now();
	const stale = await Order.find({
		paymentStatus: "pending",
		paymentMode: { $in: ["ONLINE", "PARTIAL_COD"] },
		phonePeOrderId: { $exists: true },
		createdAt: { $lte: new Date(now - 10 * 60 * 1000), $gte: new Date(now - LOOKBACK_MS) },
	}).limit(50);

	for (const order of stale) {
		try {
			const outcome = await settleOrderPayment(order);
			if (outcome === "pending" && now - new Date(order.createdAt).getTime() > GIVE_UP_AFTER_MS) await failPendingOrder(order._id);
		} catch (e) {
			console.error(`[orderLifecycle] sweep ${order._id}:`, e.message);
		}
	}
}

export function startPaymentSweeper() {
	if (!phonePeClient) return null; // nothing to reconcile without a payment provider
	const run = () => sweepStalePayments().catch((e) => console.error("[orderLifecycle] sweep failed:", e.message));
	setTimeout(run, 30 * 1000);
	const timer = setInterval(run, SWEEP_EVERY_MS);
	timer.unref?.();
	return timer;
}
