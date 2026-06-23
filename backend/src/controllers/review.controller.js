import Review from "../models/review.model.js";
import Order from "../models/order.model.js";
import User from "../models/user.model.js";
import { getSetting } from "../models/appSettings.model.js";

export const addReview = async (req, res) => {
	try {
		const { productId, rating, body } = req.body;
		const userId = req.user._id;

		if (!productId || !rating || !body) {
			return res.status(400).json({ success: false, message: "Missing required fields" });
		}

		// Check if the user already reviewed this product
		const existingReview = await Review.findOne({ user: userId, product: productId });
		if (existingReview) {
			return res.status(400).json({
				success: false,
				message: "You have already reviewed this product",
			});
		}

		// Check if the user has purchased the product (determines reward points eligibility)
		const userOrders = await Order.find({
			user: userId,
			status: { $ne: "cancelled" },
		});

		let hasPurchased = false;
		for (const order of userOrders) {
			const productExistsInOrder = order.items.some(
				(item) => String(item.product) === String(productId)
			);
			if (productExistsInOrder) {
				hasPurchased = true;
				break;
			}
		}

		const newReview = new Review({
			user: userId,
			product: productId,
			rating: Number(rating),
			body,
			isVerifiedPurchase: hasPurchased,
		});

		await newReview.save();

		// Award reward points only to verified purchasers
		let pointsAwarded = 0;
		if (hasPurchased) {
			const pointsPerReview = await getSetting("pointsPerReview", 50);
			pointsAwarded = Number(pointsPerReview) || 50;
			await User.findByIdAndUpdate(userId, { $inc: { rewardPoints: pointsAwarded } });
		}

		// Populate user for the response
		await newReview.populate("user", "name");

		return res.status(201).json({
			success: true,
			review: newReview,
			pointsAwarded,
			isVerifiedPurchase: hasPurchased,
		});
	} catch (error) {
		console.error("Error adding review:", error);
		return res.status(500).json({ success: false, message: "Failed to add review" });
	}
};

export const getProductReviews = async (req, res) => {
	try {
		const { productId } = req.params;

		const reviews = await Review.find({ product: productId })
			.populate("user", "name")
			.sort({ createdAt: -1 });

		return res.status(200).json({ success: true, reviews });
	} catch (error) {
		console.error("Error getting reviews:", error);
		return res.status(500).json({ success: false, message: "Failed to fetch reviews" });
	}
};
