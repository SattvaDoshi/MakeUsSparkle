import Cart from "../models/cart.model.js";

async function getOrCreateCart(userId) {
	let cart = await Cart.findOne({ user: userId });
	if (!cart) {
		cart = await Cart.create({ user: userId, items: [], total: 0, shipping: 0 });
	}
	return cart;
}

export async function getCart(req, res) {
	const cart = await getOrCreateCart(req.user.id);
	res.json({ success: true, cart });
}

export async function addCartItem(req, res) {
	const cart = await getOrCreateCart(req.user.id);
	cart.items.push(req.body);
	await cart.save();
	res.status(201).json({ success: true, cart });
}

export async function updateCartItem(req, res) {
	const cart = await getOrCreateCart(req.user.id);
	const item = cart.items.id(req.params.itemId);
	if (!item) {
		return res.status(404).json({ success: false, message: "Cart item not found" });
	}
	Object.assign(item, req.body);
	await cart.save();
	res.json({ success: true, cart });
}

export async function removeCartItem(req, res) {
	const cart = await getOrCreateCart(req.user.id);
	cart.items.pull(req.params.itemId);
	await cart.save();
	res.json({ success: true, cart });
}

export async function clearCart(req, res) {
	const cart = await getOrCreateCart(req.user.id);
	cart.items = [];
	await cart.save();
	res.json({ success: true, cart });
}

export async function applyCoupon(req, res) {
	res.json({ success: true, message: "Coupon applied" });
}

export async function removeCartCoupon(req, res) {
	res.json({ success: true, message: "Coupon removed" });
}

export async function giftWrap(req, res) {
	const cart = await getOrCreateCart(req.user.id);
	cart.giftWrap = { ...cart.giftWrap, ...req.body, isSelected: true };
	await cart.save();
	res.json({ success: true, cart });
}