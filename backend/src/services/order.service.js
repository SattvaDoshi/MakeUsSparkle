import Order from "../models/order.model.js";
import emailService from "./email.service.js";

class OrderService {
	async getOrders(userId) {
		try {
			const orders = await Order.find({ user: userId }).populate("items.product").sort({ createdAt: -1 });
			return { success: true, orders };
		} catch (error) {
			console.error("Error fetching orders:", error);
			throw error;
		}
	}

	async getOrderById(orderId, userId) {
		try {
			const order = await Order.findOne({ _id: orderId, user: userId }).populate("items.product");
			if (!order) {
				throw new Error("Order not found");
			}
			return { success: true, order };
		} catch (error) {
			console.error("Error fetching order:", error);
			throw error;
		}
	}

	async createOrder(userId, orderData) {
		try {
			const order = await Order.create({
				user: userId,
				items: orderData.items,
				totalAmount: orderData.totalAmount,
				shippingAddress: orderData.shippingAddress,
				status: "pending",
				paymentStatus: "pending",
			});

			return { success: true, order };
		} catch (error) {
			console.error("Error creating order:", error);
			throw error;
		}
	}

	async updateOrder(orderId, updateData, userId) {
		try {
			const order = await Order.findOneAndUpdate({ _id: orderId, user: userId }, updateData, { new: true });

			if (!order) {
				throw new Error("Order not found");
			}

			return { success: true, order };
		} catch (error) {
			console.error("Error updating order:", error);
			throw error;
		}
	}

	async updateOrderStatus(orderId, status) {
		try {
			const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true });

			if (!order) {
				throw new Error("Order not found");
			}

			return { success: true, order };
		} catch (error) {
			console.error("Error updating order status:", error);
			throw error;
		}
	}

	async cancelOrder(orderId, userId) {
		try {
			const order = await Order.findOne({ _id: orderId, user: userId });

			if (!order) {
				throw new Error("Order not found");
			}

			if (["completed", "shipped", "delivered"].includes(order.status)) {
				throw new Error("Cannot cancel a shipped or delivered order");
			}

			order.status = "cancelled";
			await order.save();

			return { success: true, message: "Order cancelled successfully", order };
		} catch (error) {
			console.error("Error cancelling order:", error);
			throw error;
		}
	}

	async sendShipmentNotification(orderId, trackingNumber, carrier) {
		try {
			const order = await Order.findByIdAndUpdate(orderId, { status: "shipped", trackingNumber, carrier }, { new: true });

			if (!order) {
				throw new Error("Order not found");
			}

			// Send email notification
			const user = await order.populate("user");
			await emailService.sendShipmentNotificationEmail(user.user.email, trackingNumber, carrier);

			return { success: true, message: "Shipment notification sent", order };
		} catch (error) {
			console.error("Error sending shipment notification:", error);
			throw error;
		}
	}
}

export default new OrderService();
