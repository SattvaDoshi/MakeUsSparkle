import cartService from "../services/cart.service.js";
import { getSetting } from "../models/appSettings.model.js";

export async function getCart(req, res) {
	try {
		const result = await cartService.getCart(req.user._id);
		res.json(result);
	} catch (error) {
		console.error("Get cart error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

export async function addToCart(req, res) {
	try {
		const { productId, quantity } = req.body;
		const result = await cartService.addToCart(req.user._id, productId, quantity);
		res.json(result);
	} catch (error) {
		console.error("Add to cart error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

export async function removeFromCart(req, res) {
	try {
		const result = await cartService.removeFromCart(req.user._id, req.params.productId);
		res.json(result);
	} catch (error) {
		console.error("Remove from cart error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

export async function updateCartItem(req, res) {
	try {
		const { quantity } = req.body;
		const result = await cartService.updateCartItem(req.user._id, req.params.productId, quantity);
		res.json(result);
	} catch (error) {
		console.error("Update cart item error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

export async function clearCart(req, res) {
	try {
		const result = await cartService.clearCart(req.user._id);
		res.json(result);
	} catch (error) {
		console.error("Clear cart error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
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

export async function getCartBannerText(req, res) {
	try {
		const cartBannerText = await getSetting("cartBannerText", "");
		res.json({ success: true, cartBannerText });
	} catch (error) {
		console.error("Get cart banner error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}