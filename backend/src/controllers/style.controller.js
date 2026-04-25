import styleService from "../services/style.service.js";

export async function getStyles(req, res) {
	try {
		const result = await styleService.getStyles();
		res.json(result);
	} catch (error) {
		console.error("Get styles error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

export async function getStyleById(req, res) {
	try {
		const result = await styleService.getStyleById(req.params.id);
		res.json(result);
	} catch (error) {
		console.error("Get style error:", error);
		res.status(404).json({ success: false, message: error.message });
	}
}

export async function createStyle(req, res) {
	try {
		const result = await styleService.createStyle(req.body);
		res.status(201).json(result);
	} catch (error) {
		console.error("Create style error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

export async function updateStyle(req, res) {
	try {
		const result = await styleService.updateStyle(req.params.id, req.body);
		res.json(result);
	} catch (error) {
		console.error("Update style error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

export async function deleteStyle(req, res) {
	try {
		const result = await styleService.deleteStyle(req.params.id);
		res.json(result);
	} catch (error) {
		console.error("Delete style error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}
