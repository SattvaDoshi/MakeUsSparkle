import Cart from "../models/cart.model.js";

class CartService {
	async getCart(userId) {
		try {
			let cart = await Cart.findOne({ user: userId }).populate("items.product");
			if (!cart) {
				cart = await Cart.create({ user: userId, items: [] });
			}
			return { success: true, cart };
		} catch (error) {
			console.error("Error fetching cart:", error);
			throw error;
		}
	}

	async addToCart(userId, productId, quantity = 1) {
		try {
			let cart = await Cart.findOne({ user: userId });

			if (!cart) {
				cart = await Cart.create({
					user: userId,
					items: [{ product: productId, quantity }],
				});
			} else {
				// Check if product already in cart
				const existingItem = cart.items.find((item) => item.product.toString() === productId);

				if (existingItem) {
					existingItem.quantity += quantity;
				} else {
					cart.items.push({ product: productId, quantity });
				}
			}

			await cart.save();
			await cart.populate("items.product");

			return { success: true, cart };
		} catch (error) {
			console.error("Error adding to cart:", error);
			throw error;
		}
	}

	async removeFromCart(userId, productId) {
		try {
			const cart = await Cart.findOne({ user: userId });
			if (!cart) {
				throw new Error("Cart not found");
			}

			cart.items = cart.items.filter((item) => item.product.toString() !== productId);
			await cart.save();

			return { success: true, cart };
		} catch (error) {
			console.error("Error removing from cart:", error);
			throw error;
		}
	}

	async updateCartItem(userId, productId, quantity) {
		try {
			const cart = await Cart.findOne({ user: userId });
			if (!cart) {
				throw new Error("Cart not found");
			}

			const item = cart.items.find((item) => item.product.toString() === productId);
			if (!item) {
				throw new Error("Product not in cart");
			}

			if (quantity <= 0) {
				cart.items = cart.items.filter((item) => item.product.toString() !== productId);
			} else {
				item.quantity = quantity;
			}

			await cart.save();
			await cart.populate("items.product");

			return { success: true, cart };
		} catch (error) {
			console.error("Error updating cart:", error);
			throw error;
		}
	}

	async clearCart(userId) {
		try {
			const cart = await Cart.findOne({ user: userId });
			if (!cart) {
				throw new Error("Cart not found");
			}

			cart.items = [];
			await cart.save();

			return { success: true, cart };
		} catch (error) {
			console.error("Error clearing cart:", error);
			throw error;
		}
	}
}

export default new CartService();
