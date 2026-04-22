import Order from "../models/order.model.js";

export async function createOrder(req, res) {
	const order = await Order.create({ ...req.body, user: req.user.id });
	res.status(201).json({ success: true, order });
}

export async function getMyOrders(req, res) {
	const orders = await Order.find({ user: req.user.id });
	res.json({ success: true, orders });
}

export async function getOrderById(req, res) {
	const order = await Order.findById(req.params.id);
	res.json({ success: true, order });
}

export async function cancelOrder(req, res) {
	const order = await Order.findByIdAndUpdate(req.params.id, { status: "cancelled" }, { new: true });
	res.json({ success: true, order });
}

export async function getOrders(req, res) {
	const orders = await Order.find();
	res.json({ success: true, orders });
}

export async function updateOrderStatus(req, res) {
	const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
	res.json({ success: true, order });
}