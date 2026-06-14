import Offer from "../models/offer.model.js";

export const getPublicOffers = async (req, res) => {
	try {
		const now = new Date();
		const offers = await Offer.find({
			isActive: true,
			$or: [{ startsAt: { $exists: false } }, { startsAt: null }, { startsAt: { $lte: now } }],
			$and: [{ $or: [{ expiryDate: { $exists: false } }, { expiryDate: null }, { expiryDate: { $gte: now } }] }],
		}).sort({ createdAt: -1 });
		res.json({ success: true, offers });
	} catch (error) {
		console.error("Error fetching public offers:", error);
		res.status(400).json({ success: false, message: error.message });
	}
};
