import { phonePeClient } from "../config/payment.config.js";
import { StandardCheckoutPayRequest, PrefillUserLoginDetails } from "@phonepe-pg/pg-sdk-node";
import { randomUUID } from "crypto";
import Order from "../models/order.model.js";
import User from "../models/user.model.js";
import emailService from "./email.service.js";
import { normalizeOrderItem, resolveProductId } from "./orderItemSelection.service.js";
import affiliateService from "./affiliate.service.js";
import inventoryService from "./inventory.service.js";
import Coupon from "../models/coupon.model.js";
import { priceOrder } from "./pricing.service.js";
import { failPendingOrder, settleOrderPayment, releaseOrderPerks } from "./orderLifecycle.service.js";

class PaymentService {
	async resolveProductId(item = {}) {
		return resolveProductId(item);
	}

	/**
	 * Creates a PhonePe payment session and a pending order in the database.
	 * Returns the PhonePe redirect URL so the frontend can navigate the user there.
	 */
	async createPaymentOrder(userId, orderData) {
		try {
			if (!phonePeClient) {
				throw new Error("PhonePe credentials are not configured");
			}

			// What the shopper owes is decided here, from the catalog — never from the request body.
			const priced = await priceOrder(userId, orderData);
			if (priced.paymentMode === "COD") throw new Error("Use the cash-on-delivery order flow for COD.");
			const paymentMode = priced.paymentMode;
			const totalAmount = priced.totalAmount;
			const advanceAmount = priced.advanceAmount;
			const balanceAmount = priced.balanceAmount;

			// Unique per-transaction merchant order ID
			const merchantOrderId = `MUS_${Date.now()}_${randomUUID().replace(/-/g, "").slice(0, 8)}`;

			const frontendUrl = (process.env.NODE_ENV === "production" && (!process.env.FRONTEND_URL || process.env.FRONTEND_URL.includes("localhost")))
				? "https://makeyousparkle.in"
				: (process.env.FRONTEND_URL || "https://makeyousparkle.in");
			const baseRedirectUrl = `${frontendUrl}/payment/status`;

			// Amount in paise (PhonePe expects paise)
			const amountInPaise = Math.round(advanceAmount * 100);

			const orderItems = await Promise.all(
				(orderData.items || []).map((item) => normalizeOrderItem(item))
			);
			const userDoc = await User.findById(userId);
			const shippingAddress = orderData.shippingAddress
				? { ...orderData.shippingAddress, name: orderData.shippingAddress.name || userDoc?.name || "Customer" }
				: undefined;
			const billingAddress = (orderData.billingAddress || orderData.shippingAddress)
				? { ...(orderData.billingAddress || orderData.shippingAddress), name: (orderData.billingAddress || orderData.shippingAddress)?.name || userDoc?.name || "Customer" }
				: undefined;

			// 1. Take the shopper's reward points / coupon use (atomic: only if the balance still covers it).
			const rewardPointsToRedeem = priced.rewardPointsRedeemed;
			if (rewardPointsToRedeem > 0) {
				const deducted = await User.findOneAndUpdate(
					{ _id: userId, rewardPoints: { $gte: rewardPointsToRedeem } },
					{ $inc: { rewardPoints: -rewardPointsToRedeem } }
				);
				if (!deducted) throw new Error("Insufficient reward points");
			}
			if (priced.discountCode) {
				await Coupon.updateOne({ code: priced.discountCode }, { $inc: { usedCount: 1 } });
			}

			// 2. Save the order BEFORE contacting PhonePe, so a payment can never exist without an order to match it.
			let order;
			try {
				order = await Order.create({
					user: userId,
					items: orderItems,
					totalAmount,
					advanceAmount,
					balanceAmount,
					paidAmount: 0,
					shippingAddress,
					billingAddress,
					address: shippingAddress,
					isGift: orderData.isGift,
					giftMessage: orderData.giftMessage,
					phonePeOrderId: merchantOrderId,
					status: "placed",
					paymentStatus: "pending",
					paymentMode,
					deliveryType: priced.deliveryType,
					discountAmount: priced.discountAmount,
					discountCode: priced.discountCode || undefined,
					autoDiscountAmount: priced.autoDiscountAmount,
					appliedOffers: priced.appliedOffers,
					rewardPointsRedeemed: rewardPointsToRedeem,
				});
			} catch (err) {
				// No order to release against: hand the perks straight back.
				if (rewardPointsToRedeem > 0) await User.updateOne({ _id: userId }, { $inc: { rewardPoints: rewardPointsToRedeem } });
				if (priced.discountCode) await Coupon.updateOne({ code: priced.discountCode, usedCount: { $gt: 0 } }, { $inc: { usedCount: -1 } });
				throw err;
			}

			// 3. Open the PhonePe session. If that fails, cancel the order and give everything back.
			let phonePeResponse;
			try {
				const payRequestBuilder = StandardCheckoutPayRequest.builder()
					.merchantOrderId(merchantOrderId)
					.amount(amountInPaise)
					.redirectUrl(baseRedirectUrl)
					.message("Make Us Sparkle Order Payment");

				if (orderData.shippingAddress?.phone) {
					const rawPhone = String(orderData.shippingAddress.phone).replace(/\D/g, "");
					if (rawPhone.length === 10) {
						payRequestBuilder.prefillUserLoginDetails(new PrefillUserLoginDetails(rawPhone));
					}
				}
				phonePeResponse = await phonePeClient.pay(payRequestBuilder.build());
			} catch (err) {
				await failPendingOrder(order._id).catch((e) => console.error("Could not unwind order after PhonePe error:", e.message));
				throw err;
			}

			// Record affiliate attribution (pending commission awaiting delivery)
			await affiliateService.onOrderCreated(order, orderData);

			return {
				success: true,
				orderId: order._id,
				merchantOrderId,
				redirectUrl: phonePeResponse.redirectUrl,
				amount: advanceAmount,
			};
		} catch (error) {
			console.error("Error creating payment order:", error);
			throw error;
		}
	}

	/**
	 * Called after the user returns from PhonePe's checkout page.
	 * Verifies payment status with PhonePe and updates the order.
	 */
	async verifyPayment(paymentData, userId) {
		try {
			const { orderId, merchantOrderId } = paymentData || {};
			if (typeof orderId !== "string" || typeof merchantOrderId !== "string") {
				throw new Error("Invalid payment reference");
			}

			// The PhonePe transaction must belong to THIS order, and the order to THIS user. Otherwise a ₹1
			// payment could be replayed against any other unpaid order.
			const target = await Order.findById(orderId);
			if (!target || String(target.user) !== String(userId) || target.phonePeOrderId !== merchantOrderId) {
				throw new Error("Order not found");
			}
			if (target.paymentStatus === "paid" || target.paymentStatus === "partial_paid") {
				return { success: true, state: "paid", message: "Payment already verified", order: target };
			}
			if (target.paymentStatus !== "pending") {
				throw new Error("This payment did not go through, so the order was cancelled.");
			}

			// Real-time status from PhonePe (server-side, never trust the client). Safe to call repeatedly / concurrently.
			const outcome = await settleOrderPayment(target);
			if (outcome === "paid") {
				const order = await Order.findById(orderId);
				return { success: true, state: "paid", message: "Payment verified successfully", order };
			}
			if (outcome === "failed") throw new Error("Payment was not completed, so the order was cancelled.");

			// Still processing at the bank: not a failure. The background sweeper finishes the order when it lands.
			return { success: true, state: "pending", message: "Your payment is still being confirmed." };
		} catch (error) {
			console.error("Payment verification error:", error);
			throw error;
		}
	}

	async getOrderStatus(orderId) {
		try {
			const order = await Order.findById(orderId);
			if (!order) {
				throw new Error("Order not found");
			}

			return {
				success: true,
				orderId: order._id,
				status: order.status,
				paymentStatus: order.paymentStatus,
				totalAmount: order.totalAmount,
			};
		} catch (error) {
			console.error("Error fetching order status:", error);
			throw error;
		}
	}

	async refundPayment(orderId, reason) {
		try {
			const order = await Order.findById(orderId);
			if (!order) {
				throw new Error("Order not found");
			}

			if (order.paymentStatus !== "paid" && order.paymentStatus !== "partial_paid") {
				throw new Error("Cannot refund an unpaid order");
			}

			// PhonePe refund can be triggered via their dashboard or API — mark as refunded here
			order.paymentStatus = "refunded";
			order.status = "cancelled";
			order.refundReason = reason;
			await order.save();

			await inventoryService.restoreOrderInventory(order);
			await releaseOrderPerks(order._id);

			return {
				success: true,
				message: "Refund processed successfully",
				order,
			};
		} catch (error) {
			console.error("Refund error:", error);
			throw error;
		}
	}
}

export default new PaymentService();
