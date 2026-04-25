import { createRazorpayOrder, verifyRazorpaySignature } from "../config/payment.config.js";
import Order from "../models/order.model.js";
import emailService from "./email.service.js";

class PaymentService {
	async createPaymentOrder(userId, orderData) {
		try {
			// Validate amount
			if (!orderData.amount || orderData.amount <= 0) {
				throw new Error("Invalid amount");
			}

			// Create Razorpay order
			const razorpayOrder = await createRazorpayOrder(orderData.amount);

			// Create order record in database
			const order = await Order.create({
				user: userId,
				items: orderData.items,
				totalAmount: orderData.amount,
				razorpayOrderId: razorpayOrder.id,
				status: "pending",
				paymentStatus: "pending",
			});

			return {
				success: true,
				orderId: order._id,
				razorpayOrderId: razorpayOrder.id,
				amount: orderData.amount,
				currency: razorpayOrder.currency,
			};
		} catch (error) {
			console.error("Error creating payment order:", error);
			throw error;
		}
	}

	async verifyPayment(paymentData) {
		try {
			const { orderId, paymentId, signature, razorpayOrderId } = paymentData;

			// Verify Razorpay signature
			const isValidSignature = verifyRazorpaySignature(razorpayOrderId, paymentId, signature);
			if (!isValidSignature) {
				throw new Error("Payment verification failed");
			}

			// Update order status
			const order = await Order.findByIdAndUpdate(
				orderId,
				{
					paymentStatus: "completed",
					razorpayPaymentId: paymentId,
					status: "confirmed",
				},
				{ returnDocument: "after" }
			);

			if (!order) {
				throw new Error("Order not found");
			}

			// Send order confirmation email
			const user = await order.populate("user");
			await emailService.sendOrderConfirmationEmail(user.user.email, order._id, order.items, order.totalAmount);

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

			if (order.paymentStatus !== "completed") {
				throw new Error("Cannot refund an incomplete payment");
			}

			// Razorpay refund logic (implement based on your needs)
			// const refund = await razorpay.payments.refund(order.razorpayPaymentId, { amount: order.totalAmount * 100 });

			// Update order status
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
