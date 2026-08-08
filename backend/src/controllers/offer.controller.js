import Offer from "../models/offer.model.js";

export const getPublicOffers = async (req, res) => {
	try {
		const now = new Date();
		const offers = await Offer.find({
			isActive: true,
			$or: [{ expiryDate: { $exists: false } }, { expiryDate: null }, { expiryDate: { $gte: now } }],
		}).sort({ createdAt: -1 });
		res.json({ success: true, offers });
	} catch (error) {
		console.error("Error fetching public offers:", error);
		res.status(400).json({ success: false, message: error.message });
	}
};

export const getOfferById = async (req, res) => {
	try {
		const offer = await Offer.findById(req.params.id);
		if (!offer || !offer.isActive) {
			return res.status(404).json({ success: false, message: "Offer not found or inactive" });
		}
		if (offer.expiryDate) {
			const exp = new Date(offer.expiryDate);
			if (!Number.isNaN(exp.getTime()) && exp.getTime() < Date.now()) {
				return res.status(404).json({ success: false, message: "Offer has expired" });
			}
		}
		res.json({ success: true, offer });
	} catch (error) {
		console.error("Error fetching offer by id:", error);
		res.status(404).json({ success: false, message: "Offer not found" });
	}
};
