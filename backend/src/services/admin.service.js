import User from "../models/user.model.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import Coupon from "../models/coupon.model.js";
import Banner from "../models/banner.model.js";
import Review from "../models/review.model.js";
import bcrypt from "bcryptjs";

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

	async createUser(userData) {
		try {
			if (!userData.email || !userData.name || !userData.password) {
				throw new Error("Name, email and password are required");
			}

			const existingUser = await User.findOne({ email: userData.email });
			if (existingUser) {
				throw new Error("User with this email already exists");
			}

			const hashedPassword = await bcrypt.hash(userData.password, 10);

			const user = await User.create({
				name: userData.name,
				email: userData.email,
				phone: userData.phone,
				role: userData.role === "admin" ? "admin" : "user",
				password: hashedPassword,
			});

			const safeUser = await User.findById(user._id).select("-password");
			return { success: true, user: safeUser };
		} catch (error) {
			console.error("Error creating user:", error);
			throw error;
		}
	}

	async updateUser(userId, userData) {
		try {
			const allowedUpdate = {
				name: userData.name,
				email: userData.email,
				phone: userData.phone,
				role: userData.role,
			};

			const user = await User.findByIdAndUpdate(userId, allowedUpdate, { returnDocument: "after" }).select("-password");
			if (!user) {
				throw new Error("User not found");
			}

			return { success: true, user };
		} catch (error) {
			console.error("Error updating user:", error);
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

	async getProducts(page = 1, limit = 20) {
		try {
			const skip = (page - 1) * limit;
			const products = await Product.find()
				.populate("category", "name title")
				.populate("subCategory", "name title")
				.populate("crossProducts", "_id title price mainImage images")
				.sort({ createdAt: -1 })
				.skip(skip)
				.limit(limit);
			const total = await Product.countDocuments();

			return {
				success: true,
				products,
				pagination: { page, limit, total },
			};
		} catch (error) {
			console.error("Error fetching admin products:", error);
			throw error;
		}
	}

	async getOrders(page = 1, limit = 20) {
		try {
			const skip = (page - 1) * limit;
			const orders = await Order.find()
				.populate("user", "name email phone")
				.populate("items.product", "name images")
				.populate("items.selectedCharms")
				.populate("items.selectionGroups.items.item")
				.sort({ createdAt: -1 })
				.skip(skip)
				.limit(limit);
			const total = await Order.countDocuments();

			return {
				success: true,
				orders,
				pagination: { page, limit, total },
			};
		} catch (error) {
			console.error("Error fetching admin orders:", error);
			throw error;
		}
	}

	async getUserOrderHistory({ userId, email, phone }) {
		try {
			const conditions = [];
			if (userId && /^[0-9a-fA-F]{24}$/.test(String(userId))) {
				conditions.push({ user: userId });
			}
			if (email && typeof email === "string" && email.trim()) {
				const cleanEmail = email.trim().toLowerCase();
				conditions.push({ "shippingAddress.email": cleanEmail });
				conditions.push({ "address.email": cleanEmail });
			}
			if (phone && typeof phone === "string" && phone.trim()) {
				const cleanPhone = phone.replace(/\D/g, "");
				if (cleanPhone.length >= 10) {
					conditions.push({ "shippingAddress.phone": new RegExp(cleanPhone.slice(-10) + "$") });
					conditions.push({ "address.phone": new RegExp(cleanPhone.slice(-10) + "$") });
				}
			}

			if (conditions.length === 0) {
				return { success: true, orders: [], totalOrders: 0, totalSpent: 0 };
			}

			const orders = await Order.find({ $or: conditions })
				.populate("user", "name email phone")
				.populate("items.product", "name images title")
				.populate("items.selectedCharms")
				.populate("items.selectionGroups.items.item")
				.sort({ createdAt: -1 })
				.lean();

			const totalOrders = orders.length;
			const totalSpent = orders
				.filter((o) => o.status !== "cancelled")
				.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

			return {
				success: true,
				orders,
				totalOrders,
				totalSpent,
			};
		} catch (error) {
			console.error("Error fetching user order history:", error);
			throw error;
		}
	}

	async deleteOrder(orderId) {
		try {
			const order = await Order.findByIdAndDelete(orderId);
			if (!order) {
				throw new Error("Order not found");
			}

			return { success: true, message: "Order deleted successfully" };
		} catch (error) {
			console.error("Error deleting order:", error);
			throw error;
		}
	}

	async getPayments(page = 1, limit = 20) {
		try {
			const skip = (page - 1) * limit;
			const payments = await Order.find()
				.select("_id user totalAmount paymentMode paymentStatus status createdAt")
				.populate("user", "name email")
				.sort({ createdAt: -1 })
				.skip(skip)
				.limit(limit);
			const total = await Order.countDocuments();

			return {
				success: true,
				payments,
				pagination: { page, limit, total },
			};
		} catch (error) {
			console.error("Error fetching payments:", error);
			throw error;
		}
	}

	async updatePaymentStatus(orderId, paymentStatus) {
		try {
			const allowedStatuses = ["pending", "paid", "partial_paid", "failed"];
			if (!allowedStatuses.includes(paymentStatus)) {
				throw new Error("Invalid payment status");
			}

			const order = await Order.findByIdAndUpdate(orderId, { paymentStatus }, { returnDocument: "after" });
			if (!order) {
				throw new Error("Order not found");
			}

			return {
				success: true,
				message: "Payment status updated",
				order,
			};
		} catch (error) {
			console.error("Error updating payment status:", error);
			throw error;
		}
	}

	async getCoupons(page = 1, limit = 20) {
		try {
			const skip = (page - 1) * limit;
			const coupons = await Coupon.find()
				.populate("applicableCategories", "name")
				.populate("applicableSubCategories", "name")
				.populate("applicableStyles", "name")
				.populate("applicableProducts", "title")
				.sort({ createdAt: -1 })
				.skip(skip)
				.limit(limit);
			const total = await Coupon.countDocuments();

			return {
				success: true,
				coupons,
				pagination: { page, limit, total },
			};
		} catch (error) {
			console.error("Error fetching coupons:", error);
			throw error;
		}
	}

	async getBanners(page = 1, limit = 20) {
		try {
			const skip = (page - 1) * limit;
			const filter = { $or: [{ bannerType: "promo" }, { bannerType: { $exists: false } }] };
			const banners = await Banner.find(filter).populate("product", "title").sort({ sortOrder: 1, createdAt: -1 }).skip(skip).limit(limit);
			const total = await Banner.countDocuments(filter);

			return {
				success: true,
				banners,
				pagination: { page, limit, total },
			};
		} catch (error) {
			console.error("Error fetching banners:", error);
			throw error;
		}
	}

	async getReviews(page = 1, limit = 30) {
		try {
			const skip = (page - 1) * limit;
			const reviewsData = await Review.find()
				.populate("user", "firstName lastName name email")
				.populate("product", "title")
				.sort({ createdAt: -1 })
				.skip(skip)
				.limit(limit);

			const reviews = reviewsData.map((review) => {
				const user = review.user;
				let userName = "Unknown";
				if (user) {
					userName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.name || "Unknown";
				}
				return {
					productId: String(review.product?._id || ""),
					productTitle: review.product?.title || "Unknown",
					reviewId: String(review._id),
					rating: review.rating,
					comment: review.body,
					isVerifiedPurchase: review.isVerifiedPurchase || false,
					user: {
						name: userName,
						email: user?.email || "",
					},
				};
			});
			
			const total = await Review.countDocuments();

			return {
				success: true,
				reviews,
				pagination: { page, limit, total },
			};
		} catch (error) {
			console.error("Error fetching reviews:", error);
			throw error;
		}
	}

	async updateReview(productId, reviewId, reviewData) {
		try {
			const review = await Review.findById(reviewId);
			if (!review) {
				throw new Error("Review not found");
			}

			if (reviewData.comment !== undefined) {
				review.body = reviewData.comment;
			}
			if (reviewData.rating !== undefined) {
				review.rating = reviewData.rating;
			}

			await review.save();
			return { success: true, review };
		} catch (error) {
			console.error("Error updating review:", error);
			throw error;
		}
	}

	async deleteReview(productId, reviewId) {
		try {
			const review = await Review.findByIdAndDelete(reviewId);
			if (!review) {
				throw new Error("Review not found");
			}

			return { success: true, message: "Review deleted successfully" };
		} catch (error) {
			console.error("Error deleting review:", error);
			throw error;
		}
	}
}

export default new AdminService();
