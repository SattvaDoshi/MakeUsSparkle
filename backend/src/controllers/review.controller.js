import Review from "../models/review.model.js";
import Order from "../models/order.model.js";
import User from "../models/user.model.js";
import Product from "../models/product.model.js";
import Combo from "../models/combo.model.js";
import { getSetting } from "../models/appSettings.model.js";
import imageService from "../services/image.service.js";

export const addReview = async (req, res) => {
	try {
		const { productId, rating, body } = req.body;
		const userId = req.user._id;

		if (!productId || !rating || !body) {
			return res.status(400).json({ success: false, message: "Missing required fields" });
		}

		let isCombo = false;
		let prodDoc = await Product.findById(productId);
		let comboDoc = null;
		if (!prodDoc) {
			comboDoc = await Combo.findById(productId);
			if (comboDoc) isCombo = true;
		}
		if (!prodDoc && !comboDoc) {
			return res.status(404).json({ success: false, message: "Product or combo not found" });
		}

		// Check if the user already reviewed this product or combo
		const existingReview = await Review.findOne({
			user: userId,
			[isCombo ? "combo" : "product"]: productId,
		});
		if (existingReview) {
			return res.status(400).json({
				success: false,
				message: "You have already reviewed this item",
			});
		}

		// Check if the user has purchased the product/combo (determines reward points eligibility)
		const userOrders = await Order.find({
			user: userId,
			status: { $ne: "cancelled" },
		});

		let hasPurchased = false;
		for (const order of userOrders) {
			const itemExistsInOrder = (order.items || []).some((item) => {
				const prodId =
					(item.product && typeof item.product === "object"
						? item.product._id
						: item.product) ||
					item.sourceId ||
					item._id;
				return String(prodId) === String(productId);
			});
			if (itemExistsInOrder) {
				hasPurchased = true;
				break;
			}
		}

		// Handle image uploads if present
		const images = [];
		const imagePublicIds = [];

		if (req.files && req.files.length > 0) {
			const fileBuffers = req.files.map((file) => file.buffer);
			const uploadResults = await imageService.uploadMultipleImages(fileBuffers, "makeusparkle/reviews");

			uploadResults.forEach((result) => {
				images.push(result.url);
				imagePublicIds.push(result.publicId);
			});
		}

		const newReview = new Review({
			user: userId,
			product: isCombo ? undefined : productId,
			combo: isCombo ? productId : undefined,
			rating: Number(rating),
			body,
			isVerifiedPurchase: hasPurchased,
			images,
			imagePublicIds,
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
		await newReview.populate("user", "name firstName lastName");

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
			.populate("user", "name firstName lastName")
			.sort({ createdAt: -1 });

		return res.status(200).json({ success: true, reviews });
	} catch (error) {
		console.error("Error getting reviews:", error);
		return res.status(500).json({ success: false, message: "Failed to fetch reviews" });
	}
};

export const getComboReviews = async (req, res) => {
	try {
		const { id } = req.params;

		const reviews = await Review.find({ combo: id })
			.populate("user", "name firstName lastName")
			.sort({ createdAt: -1 });

		return res.status(200).json({ success: true, reviews });
	} catch (error) {
		console.error("Error getting combo reviews:", error);
		return res.status(500).json({ success: false, message: "Failed to fetch reviews" });
	}
};

export const addComboReview = async (req, res) => {
	try {
		const { id } = req.params;
		const { rating, body } = req.body;
		const userId = req.user._id;

		if (!rating || !body) {
			return res.status(400).json({ success: false, message: "Missing required fields" });
		}

		const existingReview = await Review.findOne({ user: userId, combo: id });
		if (existingReview) {
			return res.status(400).json({
				success: false,
				message: "You have already reviewed this combo",
			});
		}

		const userOrders = await Order.find({
			user: userId,
			status: { $ne: "cancelled" },
		});

		let hasPurchased = false;
		for (const order of userOrders) {
			const itemExistsInOrder = (order.items || []).some((item) => {
				const prodId =
					(item.product && typeof item.product === "object"
						? item.product._id
						: item.product) ||
					item.sourceId ||
					item._id;
				return String(prodId) === String(id);
			});
			if (itemExistsInOrder) {
				hasPurchased = true;
				break;
			}
		}

		const images = [];
		const imagePublicIds = [];

		if (req.files && req.files.length > 0) {
			const fileBuffers = req.files.map((file) => file.buffer);
			const uploadResults = await imageService.uploadMultipleImages(fileBuffers, "makeusparkle/reviews");

			uploadResults.forEach((result) => {
				images.push(result.url);
				imagePublicIds.push(result.publicId);
			});
		}

		const newReview = new Review({
			user: userId,
			combo: id,
			rating: Number(rating),
			body,
			isVerifiedPurchase: hasPurchased,
			images,
			imagePublicIds,
		});

		await newReview.save();

		let pointsAwarded = 0;
		if (hasPurchased) {
			const pointsPerReview = await getSetting("pointsPerReview", 50);
			pointsAwarded = Number(pointsPerReview) || 50;
			await User.findByIdAndUpdate(userId, { $inc: { rewardPoints: pointsAwarded } });
		}

		await newReview.populate("user", "name firstName lastName");

		return res.status(201).json({
			success: true,
			review: newReview,
			pointsAwarded,
			isVerifiedPurchase: hasPurchased,
		});
	} catch (error) {
		console.error("Error adding combo review:", error);
		return res.status(500).json({ success: false, message: "Failed to add review" });
	}
};

