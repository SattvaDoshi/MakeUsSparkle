import Order from "../models/order.model.js";
import User from "../models/user.model.js";
import Review from "../models/review.model.js";
import emailService from "./email.service.js";
import { normalizeOrderItem, resolveProductId, isSelectableCategory } from "./orderItemSelection.service.js";
import Offer from "../models/offer.model.js";

class OrderService {
	async resolveProductId(item = {}) {
		return resolveProductId(item);
	}

	async getOrders(userId) {
		try {
			const rawOrders = await Order.find({ user: userId })
				.populate("items.product")
				.populate("items.selectedCharms")
				.populate("items.selectionGroups.items.item")
				.sort({ createdAt: -1 })
				.lean();

			const userReviews = await Review.find({ user: userId }).lean();
			const reviewMap = new Map();
			for (const r of userReviews) {
				if (r.product) reviewMap.set(String(r.product), r);
				if (r.combo) reviewMap.set(String(r.combo), r);
			}

			const orders = rawOrders.map((order) => {
				const items = (order.items || []).map((item) => {
					const prodObj =
						item.product && typeof item.product === "object" ? item.product : null;
					const targetId =
						(prodObj ? String(prodObj._id) : null) ||
						(typeof item.product === "string" ? String(item.product) : null) ||
						item.sourceId ||
						item._id;

					const name =
						item.name ||
						(prodObj ? prodObj.name || prodObj.title : null) ||
						"Order item";
					const rev = targetId ? reviewMap.get(String(targetId)) : null;

					return {
						...item,
						name,
						productId: targetId,
						reviewed: Boolean(rev),
						rating: rev ? rev.rating || 5 : 0,
						reviewText: rev ? rev.body || "" : "",
					};
				});
				return {
					...order,
					items,
				};
			});

			return { success: true, orders };
		} catch (error) {
			console.error("Error fetching orders:", error);
			throw error;
		}
	}

	async getOrderById(orderId, userId) {
		try {
			const order = await Order.findOne({ _id: orderId, user: userId })
				.populate("items.product")
				.populate("items.selectedCharms")
				.populate("items.selectionGroups.items.item");
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
			// Validate: warn (don't block) when a selectable-category item has no selections
			for (const item of orderData.items || []) {
				const cat = item.category || item.parentCategory || item.sourceId || "";
				if (isSelectableCategory(cat)) {
					const hasSelections =
						(Array.isArray(item.selectionGroups) && item.selectionGroups.some((g) => g.items?.length > 0)) ||
						(Array.isArray(item.selectedCharms) && item.selectedCharms.length > 0);
					if (!hasSelections) {
						console.warn(
							`[Order] Item "${item.name || cat}" belongs to selectable category "${cat}" but has no selectionGroups or selectedCharms.`
						);
					}
				}
			}

			const orderItems = await Promise.all((orderData.items || []).map((item) => normalizeOrderItem(item)));

			// Handle reward points redemption
			const rewardPointsToRedeem = Number(orderData.rewardPointsRedeemed || 0);
			if (rewardPointsToRedeem > 0) {
				const userDoc = await User.findById(userId).select("rewardPoints");
				if (!userDoc || (userDoc.rewardPoints || 0) < rewardPointsToRedeem) {
					throw new Error("Insufficient reward points");
				}
				await User.findByIdAndUpdate(userId, { $inc: { rewardPoints: -rewardPointsToRedeem } });
			}

			const userDoc = await User.findById(userId);
			const shippingAddress = orderData.shippingAddress
				? { ...orderData.shippingAddress, name: orderData.shippingAddress.name || userDoc?.name || "Customer" }
				: undefined;
			const billingAddress = (orderData.billingAddress || orderData.shippingAddress)
				? { ...(orderData.billingAddress || orderData.shippingAddress), name: (orderData.billingAddress || orderData.shippingAddress)?.name || userDoc?.name || "Customer" }
				: undefined;

			const order = await Order.create({
				user: userId,
				items: orderItems,
				totalAmount: orderData.totalAmount,
				advanceAmount: Number(orderData.advanceAmount || 0),
				balanceAmount: Number(orderData.balanceAmount || 0),
				paidAmount: Number(orderData.paidAmount || 0),
				shippingAddress,
				billingAddress,
				address: shippingAddress,
				isGift: orderData.isGift,
				giftMessage: orderData.giftMessage,
				status: "placed",
				paymentStatus: "pending",
				paymentMode: orderData.paymentMode || "COD",
				deliveryType: orderData.deliveryType || "standard",
				discountAmount: orderData.discountAmount || 0,
				discountCode: orderData.discountCode,
				autoDiscountAmount: orderData.autoDiscountAmount || 0,
				rewardPointsRedeemed: rewardPointsToRedeem,
				appliedOffers: orderData.appliedOffers || [],
			});

			if (orderData.appliedOffers && orderData.appliedOffers.length > 0) {
				const offerIds = orderData.appliedOffers.map((o) => o.id);
				await Offer.updateMany(
					{ _id: { $in: offerIds } },
					{ $inc: { usedCount: 1 } }
				);
			}

			if (orderData.paymentMode === 'COD') {
				const populatedOrder = await order.populate([
					{ path: "user" },
					{ path: "items.product", select: "title" },
					{ path: "items.selectedCharms" },
					{ path: "items.selectionGroups.items.item" },
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
