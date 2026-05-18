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

export async function getMainBanner(req, res) {
	try {
		const result = await bannerService.getMainBanner();
		res.json(result);
	} catch (error) {
		console.error("Get main banner error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

export async function getMainBannersAdmin(req, res) {
	try {
		const result = await bannerService.getMainBannersAdmin();
		res.json(result);
	} catch (error) {
		console.error("Get main banners error:", error);
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

export async function createMainBanner(req, res) {
	try {
		const imageBuffer = req.file?.buffer;
		const result = await bannerService.createMainBanner(req.body, imageBuffer);
		res.status(201).json(result);
	} catch (error) {
		console.error("Create main banner error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

export async function updateMainBanner(req, res) {
	try {
		const imageBuffer = req.file?.buffer;
		const result = await bannerService.updateMainBanner(req.params.id, req.body, imageBuffer);
		res.json(result);
	} catch (error) {
		console.error("Update main banner error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}