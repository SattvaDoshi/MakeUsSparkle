import { phonePeClient } from "../config/payment.config.js";
import { StandardCheckoutPayRequest } from "@phonepe-pg/pg-sdk-node";
import { randomUUID } from "crypto";
import Order from "../models/order.model.js";
import User from "../models/user.model.js";
import emailService from "./email.service.js";
import { normalizeOrderItem, resolveProductId } from "./orderItemSelection.service.js";

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
			if (!orderData.amount || orderData.amount <= 0) {
				throw new Error("Invalid amount");
			}

			if (!phonePeClient) {
				throw new Error("PhonePe credentials are not configured");
			}

			const paymentMode = orderData.paymentMode || "ONLINE";
			const totalAmount = Number(orderData.totalAmount || orderData.amount || 0);
			const advanceAmount = Number(orderData.amount || 0);
			const balanceAmount = Math.max(totalAmount - advanceAmount, 0);

			// Unique per-transaction merchant order ID
			const merchantOrderId = `MUS_${Date.now()}_${randomUUID().replace(/-/g, "").slice(0, 8)}`;

			const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
			// Build redirect URL with merchantOrderId — orderId will be appended after order creation
			const baseRedirectUrl = `${frontendUrl}/payment/status`;

			// Amount in paise (PhonePe expects paise)
			const amountInPaise = Math.round(advanceAmount * 100);

			const payRequest = StandardCheckoutPayRequest.builder()
				.merchantOrderId(merchantOrderId)
				.amount(amountInPaise)
				.redirectUrl(baseRedirectUrl)
				.build();

			const phonePeResponse = await phonePeClient.pay(payRequest);

			// Create order record in database
			const orderItems = await Promise.all(
				(orderData.items || []).map((item) => normalizeOrderItem(item))
			);

			// Handle reward points redemption
			const rewardPointsToRedeem = Number(orderData.rewardPointsRedeemed || 0);
			if (rewardPointsToRedeem > 0) {
				const userDoc = await User.findById(userId).select("rewardPoints");
				if (!userDoc || (userDoc.rewardPoints || 0) < rewardPointsToRedeem) {
					throw new Error("Insufficient reward points");
				}
				await User.findByIdAndUpdate(userId, { $inc: { rewardPoints: -rewardPointsToRedeem } });
			}

			const order = await Order.create({
				user: userId,
				items: orderItems,
				totalAmount,
				advanceAmount,
				balanceAmount,
				paidAmount: 0,
				address: orderData.shippingAddress,
				isGift: orderData.isGift,
				giftMessage: orderData.giftMessage,
				phonePeOrderId: merchantOrderId,
				status: "placed",
				paymentStatus: "pending",
				paymentMode,
				rewardPointsRedeemed: rewardPointsToRedeem,
			});

			// Build final redirect URL including orderId so status page can verify without sessionStorage
			const finalRedirectUrl = phonePeResponse.redirectUrl;

			return {
				success: true,
				orderId: order._id,
				merchantOrderId,
				redirectUrl: finalRedirectUrl,
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
	async verifyPayment(paymentData) {
		try {
			const { orderId, merchantOrderId } = paymentData;

			if (!phonePeClient) {
				throw new Error("PhonePe credentials are not configured");
			}

			// Fetch real-time status from PhonePe (server-side, never trust client)
			const statusResponse = await phonePeClient.getOrderStatus(merchantOrderId);

			const paymentState = statusResponse?.state;  // "COMPLETED" | "FAILED" | "PENDING"
			const transactionId = statusResponse?.paymentDetails?.[0]?.transactionId || null;

			if (paymentState !== "COMPLETED") {
				throw new Error(`Payment not completed. Current state: ${paymentState}`);
			}

			const existingOrder = await Order.findById(orderId);
			if (!existingOrder) {
				throw new Error("Order not found");
			}

			const isPartialCod = existingOrder.paymentMode === "PARTIAL_COD";

			// Update order status
			const order = await Order.findByIdAndUpdate(
				orderId,
				{
					paymentStatus: isPartialCod ? "partial_paid" : "paid",
					paidAmount: isPartialCod
						? Number(existingOrder.advanceAmount || existingOrder.totalAmount || 0)
						: Number(existingOrder.totalAmount || 0),
					phonePeTransactionId: transactionId,
					status: "placed",
				},
				{ returnDocument: "after" }
			);

			if (!order) {
				throw new Error("Order not found");
			}

			// Send order confirmation email
			const populated = await order.populate([
				{ path: "user" },
				{ path: "items.product", select: "title" },
				{ path: "items.selectedCharms" },
				{ path: "items.selectionGroups.items.item" },
			]);
			await emailService.sendOrderConfirmationEmail(
				populated.user.email,
				order._id,
				order.items,
				order.totalAmount
			);

			return {
				success: true,
				message: "Payment verified successfully",
				order,
			};
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
