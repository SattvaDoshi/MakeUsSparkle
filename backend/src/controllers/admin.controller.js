import User from "../models/user.model.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";

export async function getDashboard(req, res) {
	const [users, orders, products] = await Promise.all([
		User.countDocuments(),
		Order.countDocuments(),
		Product.countDocuments(),
	]);

	res.json({ success: true, stats: { users, orders, products } });
}

export async function getUsers(req, res) {
	const users = await User.find();
	res.json({ success: true, users });
}

export async function deleteUser(req, res) {
	await User.findByIdAndDelete(req.params.id);
	res.json({ success: true, message: "User deleted" });
}

export async function getAnalyticsSales(req, res) {
	res.json({ success: true, message: "Sales analytics endpoint" });
}

export async function getAnalyticsProducts(req, res) {
	res.json({ success: true, message: "Products analytics endpoint" });
}