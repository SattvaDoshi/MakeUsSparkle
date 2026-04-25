import User from "../models/user.model.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";

class AdminService {
	async getDashboardStats() {
		try {
			const [usersCount, ordersCount, productsCount, totalRevenue] = await Promise.all([
				User.countDocuments(),
				Order.countDocuments(),
				Product.countDocuments(),
				Order.aggregate([{ $group: { _id: null, total: { $sum: "$totalAmount" } } }]),
			]);

			return {
				success: true,
				stats: {
					users: usersCount,
					orders: ordersCount,
					products: productsCount,
					revenue: totalRevenue[0]?.total || 0,
				},
			};
		} catch (error) {
			console.error("Error fetching dashboard stats:", error);
			throw error;
		}
	}

	async getUsers(page = 1, limit = 10) {
		try {
			const skip = (page - 1) * limit;
			const users = await User.find().select("-password").skip(skip).limit(limit).sort({ createdAt: -1 });
			const total = await User.countDocuments();

			return {
				success: true,
				users,
				pagination: { page, limit, total },
			};
		} catch (error) {
			console.error("Error fetching users:", error);
			throw error;
		}
	}

	async deleteUser(userId) {
		try {
			await User.findByIdAndDelete(userId);
			return { success: true, message: "User deleted successfully" };
		} catch (error) {
			console.error("Error deleting user:", error);
			throw error;
		}
	}

	async getSalesAnalytics(startDate, endDate) {
		try {
			const query = {};
			if (startDate || endDate) {
				query.createdAt = {};
				if (startDate) query.createdAt.$gte = new Date(startDate);
				if (endDate) query.createdAt.$lte = new Date(endDate);
			}

			const analytics = await Order.aggregate([
				{ $match: query },
				{
					$group: {
						_id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
						totalSales: { $sum: "$totalAmount" },
						totalOrders: { $sum: 1 },
					},
				},
				{ $sort: { _id: 1 } },
			]);

			return { success: true, analytics };
		} catch (error) {
			console.error("Error fetching sales analytics:", error);
			throw error;
		}
	}

	async getProductAnalytics() {
		try {
			const analytics = await Product.aggregate([
				{
					$lookup: {
						from: "orders",
						localField: "_id",
						foreignField: "items.product",
						as: "orders",
					},
				},
				{
					$project: {
						name: 1,
						price: 1,
						ordersCount: { $size: "$orders" },
					},
				},
				{ $sort: { ordersCount: -1 } },
				{ $limit: 20 },
			]);

			return { success: true, analytics };
		} catch (error) {
			console.error("Error fetching product analytics:", error);
			throw error;
		}
	}

	async getOrderAnalytics(status) {
		try {
			const query = status ? { status } : {};
			const analytics = await Order.aggregate([
				{ $match: query },
				{
					$group: {
						_id: "$status",
						count: { $sum: 1 },
						total: { $sum: "$totalAmount" },
					},
				},
			]);

			return { success: true, analytics };
		} catch (error) {
			console.error("Error fetching order analytics:", error);
			throw error;
		}
	}
}

export default new AdminService();
