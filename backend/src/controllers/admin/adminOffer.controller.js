import Offer from "../../models/offer.model.js";
import { uploadToCloudinary } from "../../config/upload.config.js";
import { invalidateOffersAndCouponsCache } from "../../services/product.service.js";

export const createOffer = async (req, res) => {
	try {
		const offerData = { ...req.body };

		// Handle file upload
		if (req.file) {
			const uploadResult = await uploadToCloudinary(req.file.buffer, "offers");
			offerData.image = uploadResult.secure_url;
		}

		// Convert stringified arrays if sent via FormData
		if (typeof offerData.applicableCategories === "string") {
			offerData.applicableCategories = offerData.applicableCategories.split(",").map((id) => id.trim()).filter(Boolean);
		}
		if (typeof offerData.applicableSubCategories === "string") {
			offerData.applicableSubCategories = offerData.applicableSubCategories.split(",").map((id) => id.trim()).filter(Boolean);
		}
		if (typeof offerData.applicableProducts === "string") {
			offerData.applicableProducts = offerData.applicableProducts.split(",").map((id) => id.trim()).filter(Boolean);
		}
		if (offerData.isActive !== undefined) {
			offerData.isActive = offerData.isActive === true || offerData.isActive === "true" || offerData.isActive === 1 || offerData.isActive === "1";
		}

		const offer = await Offer.create(offerData);
		invalidateOffersAndCouponsCache();
		res.status(201).json({ success: true, offer });
	} catch (error) {
		console.error("Error creating offer:", error);
		res.status(400).json({ success: false, message: error.message });
	}
};

export const updateOffer = async (req, res) => {
	try {
		const offerData = { ...req.body };

		if (req.file) {
			const uploadResult = await uploadToCloudinary(req.file.buffer, "offers");
			offerData.image = uploadResult.secure_url;
		}

		// Convert stringified arrays if sent via FormData
		if (typeof offerData.applicableCategories === "string") {
			offerData.applicableCategories = offerData.applicableCategories.split(",").map((id) => id.trim()).filter(Boolean);
		}
		if (typeof offerData.applicableSubCategories === "string") {
			offerData.applicableSubCategories = offerData.applicableSubCategories.split(",").map((id) => id.trim()).filter(Boolean);
		}
		if (typeof offerData.applicableProducts === "string") {
			offerData.applicableProducts = offerData.applicableProducts.split(",").map((id) => id.trim()).filter(Boolean);
		}
		if (offerData.isActive !== undefined) {
			offerData.isActive = offerData.isActive === true || offerData.isActive === "true" || offerData.isActive === 1 || offerData.isActive === "1";
		}

		const offer = await Offer.findByIdAndUpdate(req.params.id, offerData, { new: true });
		if (!offer) {
			return res.status(404).json({ success: false, message: "Offer not found" });
		}
		invalidateOffersAndCouponsCache();
		res.json({ success: true, offer });
	} catch (error) {
		console.error("Error updating offer:", error);
		res.status(400).json({ success: false, message: error.message });
	}
};

export const deleteOffer = async (req, res) => {
	try {
		const offer = await Offer.findByIdAndDelete(req.params.id);
		if (!offer) {
			return res.status(404).json({ success: false, message: "Offer not found" });
		}
		invalidateOffersAndCouponsCache();
		res.json({ success: true, message: "Offer deleted" });
	} catch (error) {
		console.error("Error deleting offer:", error);
		res.status(400).json({ success: false, message: error.message });
	}
};

export const getAllOffers = async (req, res) => {
	try {
		const offers = await Offer.find().sort({ createdAt: -1 });
		res.json({ success: true, offers });
	} catch (error) {
		console.error("Error fetching offers:", error);
		res.status(400).json({ success: false, message: error.message });
	}
};
