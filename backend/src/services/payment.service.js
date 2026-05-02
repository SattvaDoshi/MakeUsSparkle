import { createRazorpayOrder, verifyRazorpaySignature } from "../config/payment.config.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import emailService from "./email.service.js";

class PaymentService {
	async resolveProductId(item = {}) {
		const directId = String(item.product || item.sourceId || item.id || "").trim();
		if (/^[0-9a-fA-F]{24}$/.test(directId)) {
			return directId;
		}

		const title = String(item.name || "").trim();
		if (!title) {
			return undefined;
		}

		const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		const product = await Product.findOne({ title: new RegExp(`^${escaped}$`, "i") }).select("_id").lean();
		return product ? String(product._id) : undefined;
	}

	async createPaymentOrder(userId, orderData) {
		try {
			// Validate amount
			if (!orderData.amount || orderData.amount <= 0) {
				throw new Error("Invalid amount");
			}

			const paymentMode = orderData.paymentMode || "ONLINE";
			const totalAmount = Number(orderData.totalAmount || orderData.amount || 0);
			const advanceAmount = Number(orderData.amount || 0);
			const balanceAmount = Math.max(totalAmount - advanceAmount, 0);

			// Create Razorpay order
			const razorpayOrder = await createRazorpayOrder(orderData.amount);

			// Create order record in database
			const orderItems = await Promise.all(orderData.items.map(async (item) => ({
				product: await this.resolveProductId(item),
				quantity: item.quantity,
				price: item.price,
				customNote: item.customNote,
				customImages: item.customImages,
				selectedCharms: item.selectedCharms,
			})));

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
				razorpayOrderId: razorpayOrder.id,
				status: "placed",
				paymentStatus: "pending",
				paymentMode,
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
					paidAmount: isPartialCod ? Number(existingOrder.advanceAmount || existingOrder.totalAmount || 0) : Number(existingOrder.totalAmount || 0),
					razorpayPaymentId: paymentId,
					status: "placed",
				},
				{ returnDocument: "after" }
			);

			if (!order) {
				throw new Error("Order not found");
			}

			// Send order confirmation email
			const user = await order.populate([
				{ path: "user" },
				{ path: "items.product", select: "title" }
			]);
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
