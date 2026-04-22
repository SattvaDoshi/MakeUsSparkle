import AbandonedCart from "../models/abandonedCart.model.js";

export async function createAbandoned(req, res) {
	const abandoned = await AbandonedCart.create(req.body);
	res.status(201).json({ success: true, abandoned });
}

export async function getAbandoned(req, res) {
	const abandoned = await AbandonedCart.find();
	res.json({ success: true, abandoned });
}