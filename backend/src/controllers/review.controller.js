import Review from "../models/review.model.js";
import Order from "../models/order.model.js";

export const addReview = async (req, res) => {
	try {
		const { productId, rating, title, body } = req.body;
		const userId = req.user._id;

		if (!productId || !rating || !title || !body) {
			return res.status(400).json({ success: false, message: "Missing required fields" });
		}

		// Verify that the user has purchased the product
		// Order status could be placed, shipped, delivered, etc.
		// Payment mode could be COD, ONLINE, PARTIAL_COD.
		// A completed purchase generally means it's an order that is not cancelled.
		const userOrders = await Order.find({
			user: userId,
			status: { $ne: "cancelled" },
		});

		let hasPurchased = false;
		for (const order of userOrders) {
			// Find if any item in the order matches the productId
			const productExistsInOrder = order.items.some(
				(item) => String(item.product) === String(productId)
			);
			if (productExistsInOrder) {
				hasPurchased = true;
				break;
			}
		}

		if (!hasPurchased) {
			return res.status(403).json({
				success: false,
				message: "You must purchase this product to review it",
			});
		}

		// Check if the user already reviewed this product
		const existingReview = await Review.findOne({ user: userId, product: productId });
		if (existingReview) {
			return res.status(400).json({
				success: false,
				message: "You have already reviewed this product",
			});
		}

		const newReview = new Review({
			user: userId,
			product: productId,
			rating: Number(rating),
			title,
			body,
			isVerifiedPurchase: true,
		});

		await newReview.save();

		// Populate user for the response
		await newReview.populate("user", "firstName lastName");

		res.status(201).json({ success: true, review: newReview });
	} catch (error) {
		console.error("Error adding review:", error);
		res.status(500).json({ success: false, message: "Failed to add review" });
	}
};

export const getProductReviews = async (req, res) => {
	try {
		const { productId } = req.params;

		const reviews = await Review.find({ product: productId })
			.populate("user", "firstName lastName")
			.sort({ createdAt: -1 });

		res.status(200).json({ success: true, reviews });
	} catch (error) {
		console.error("Error getting reviews:", error);
		res.status(500).json({ success: false, message: "Failed to fetch reviews" });
	}
};
