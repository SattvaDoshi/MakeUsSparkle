import Cart from "../models/cart.model.js";
import Offer from "../models/offer.model.js";

const FREE_SHIPPING_THRESHOLD = 999;

function isOfferActiveQuery(now = new Date()) {
	return {
		isActive: true,
		$or: [{ startsAt: { $exists: false } }, { startsAt: null }, { startsAt: { $lte: now } }],
		$and: [{ $or: [{ expiryDate: { $exists: false } }, { expiryDate: null }, { expiryDate: { $gte: now } }] }],
	};
}

function idSet(values = []) {
	return new Set(values.map((value) => String(value?._id || value)).filter(Boolean));
}

function itemPrice(product) {
	return Number(product?.discountedPrice || product?.price || 0);
}

function isApplicable(item, offer) {
	const product = item.product;
	if (!product) return false;

	const productIds = idSet(offer.applicableProducts);
	if (productIds.size > 0 && !productIds.has(String(product._id))) return false;

	const categoryIds = idSet(offer.applicableCategories);
	if (categoryIds.size > 0 && !categoryIds.has(String(product.category))) return false;

	return true;
}

async function decorateCart(cart) {
	const plainCart = typeof cart.toObject === "function" ? cart.toObject() : cart;
	const offers = await Offer.find(isOfferActiveQuery()).sort({ createdAt: -1 });
	const subtotal = (plainCart.items || []).reduce((sum, item) => sum + itemPrice(item.product) * Number(item.quantity || 0), 0);

	let pool = [];
	(plainCart.items || []).forEach((item) => {
		for (let q = 0; q < Number(item.quantity || 0); q += 1) {
			pool.push({ product: item.product, price: itemPrice(item.product) });
		}
	});

	let autoDiscountAmount = 0;
	const appliedOffers = [];

	offers.forEach((offer) => {
		const matching = [];
		pool.forEach((item, index) => {
			if (isApplicable(item, offer)) matching.push({ index, price: item.price });
		});
		if (matching.length === 0) return;

		let offerDiscount = 0;
		const used = new Set();

		if (offer.offerType === "buy_x_for_y") {
			const quantity = offer.buyQuantity || 1;
			const targetPrice = offer.discountValue || 0;
			matching.sort((a, b) => b.price - a.price);
			const groups = Math.floor(matching.length / quantity);
			for (let groupIndex = 0; groupIndex < groups; groupIndex += 1) {
				const group = matching.slice(groupIndex * quantity, (groupIndex + 1) * quantity);
				const groupTotal = group.reduce((sum, item) => sum + item.price, 0);
				if (groupTotal > targetPrice) {
					offerDiscount += groupTotal - targetPrice;
					group.forEach((item) => used.add(item.index));
				}
			}
		} else if (offer.offerType === "bogo") {
			const buyQuantity = offer.buyQuantity || 1;
			const getQuantity = offer.getQuantity || 1;
			const groupSize = buyQuantity + getQuantity;
			matching.sort((a, b) => b.price - a.price);
			for (let index = 0; index + groupSize <= matching.length; index += groupSize) {
				const group = matching.slice(index, index + groupSize);
				const freeItems = group.slice(-getQuantity);
				offerDiscount += freeItems.reduce((sum, item) => sum + item.price, 0);
				group.forEach((item) => used.add(item.index));
			}
		} else if (offer.offerType === "percentage") {
			const percentage = offer.discountValue || 0;
			matching.forEach((item) => {
				offerDiscount += item.price * (percentage / 100);
				used.add(item.index);
			});
		} else if (offer.offerType === "fixed") {
			const matchingTotal = matching.reduce((sum, item) => sum + item.price, 0);
			offerDiscount = Math.min(offer.discountValue || 0, matchingTotal);
			matching.forEach((item) => used.add(item.index));
		}

		if (offerDiscount > 0) {
			const roundedDiscount = Math.round(offerDiscount);
			autoDiscountAmount += roundedDiscount;
			appliedOffers.push({ id: String(offer._id), title: offer.title, amount: roundedDiscount });
			pool = pool.filter((_, index) => !used.has(index));
		}
	});

	const hasFreeShippingOffer = offers.some(
		(offer) => offer.offerType === "free_shipping" && (plainCart.items || []).some((item) => isApplicable(item, offer))
	);
	const shipping = hasFreeShippingOffer || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 60;
	const total = Math.max(0, subtotal + shipping - autoDiscountAmount);

	return {
		cart: plainCart,
		pricing: {
			subtotal,
			shipping,
			autoDiscountAmount,
			appliedOffers,
			total,
		},
	};
}

class CartService {
	async getCart(userId) {
		try {
			let cart = await Cart.findOne({ user: userId }).populate("items.product");
			if (!cart) {
				cart = await Cart.create({ user: userId, items: [] });
			}
			return { success: true, ...(await decorateCart(cart)) };
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

			return { success: true, ...(await decorateCart(cart)) };
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

			await cart.populate("items.product");

			return { success: true, ...(await decorateCart(cart)) };
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

			return { success: true, ...(await decorateCart(cart)) };
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

			await cart.populate("items.product");

			return { success: true, ...(await decorateCart(cart)) };
		} catch (error) {
			console.error("Error clearing cart:", error);
			throw error;
		}
	}
}

export default new CartService();
