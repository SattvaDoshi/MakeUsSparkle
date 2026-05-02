import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import emailService from "./email.service.js";

class OrderService {
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
				totalAmount: orderData.totalAmount,
				advanceAmount: Number(orderData.advanceAmount || 0),
				balanceAmount: Number(orderData.balanceAmount || 0),
				paidAmount: Number(orderData.paidAmount || 0),
				address: orderData.shippingAddress,
				isGift: orderData.isGift,
				giftMessage: orderData.giftMessage,
				status: "placed",
				paymentStatus: "pending",
				paymentMode: orderData.paymentMode || "COD",
			});

			if (orderData.paymentMode === 'COD') {
				const populatedOrder = await order.populate([
					{ path: "user" },
					{ path: "items.product", select: "title" }
				]);
				await emailService.sendOrderConfirmationEmail(populatedOrder.user.email, populatedOrder._id, populatedOrder.items, populatedOrder.totalAmount);
			}

			return { success: true, order };
		} catch (error) {
			console.error("Error creating order:", error);
			throw error;
		}
	}

	async updateOrder(orderId, updateData, userId) {
		try {
			const order = await Order.findOneAndUpdate({ _id: orderId, user: userId }, updateData, { returnDocument: "after" });

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
			const order = await Order.findByIdAndUpdate(orderId, { status }, { returnDocument: "after" });

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
			const order = await Order.findByIdAndUpdate(orderId, { status: "shipped", trackingNumber, carrier }, { returnDocument: "after" });

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
