import bannerService from "../services/banner.service.js";

export async function getBanners(req, res) {
	try {
		const result = await bannerService.getBanners();
		res.json(result);
	} catch (error) {
		console.error("Get banners error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

export async function createBanner(req, res) {
	try {
		const imageBuffer = req.file?.buffer;
		const result = await bannerService.createBanner(req.body, imageBuffer);
		res.status(201).json(result);
	} catch (error) {
		console.error("Create banner error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

export async function updateBanner(req, res) {
	try {
		const imageBuffer = req.file?.buffer;
		const result = await bannerService.updateBanner(req.params.id, req.body, imageBuffer);
		res.json(result);
	} catch (error) {
		console.error("Update banner error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

export async function deleteBanner(req, res) {
	try {
		const result = await bannerService.deleteBanner(req.params.id);
		res.json(result);
	} catch (error) {
		console.error("Delete banner error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}