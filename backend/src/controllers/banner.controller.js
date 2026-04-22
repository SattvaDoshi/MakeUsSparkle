import Banner from "../models/banner.model.js";

export async function getBanners(req, res) {
	const banners = await Banner.find();
	res.json({ success: true, banners });
}

export async function createBanner(req, res) {
	const banner = await Banner.create(req.body);
	res.status(201).json({ success: true, banner });
}

export async function updateBanner(req, res) {
	const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true });
	res.json({ success: true, banner });
}

export async function deleteBanner(req, res) {
	await Banner.findByIdAndDelete(req.params.id);
	res.json({ success: true, message: "Banner deleted" });
}