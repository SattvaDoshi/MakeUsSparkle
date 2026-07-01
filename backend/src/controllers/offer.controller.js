import Offer from "../models/offer.model.js";

export const getPublicOffers = async (req, res) => {
	try {
		const now = new Date();
		const offers = await Offer.find({
			isActive: true,
		}).sort({ createdAt: -1 });
		res.json({ success: true, offers });
	} catch (error) {
		console.error("Error fetching public offers:", error);
		res.status(400).json({ success: false, message: error.message });
	}
};
