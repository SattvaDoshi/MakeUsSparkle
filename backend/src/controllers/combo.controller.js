import comboService from "../services/combo.service.js";

export async function getCombos(req, res) {
	try {
		const type = req.query.type || null;
		const result = await comboService.getCombos(type);
		res.json(result);
	} catch (error) {
		console.error("Get combos error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

export async function getComboById(req, res) {
	try {
		const result = await comboService.getComboById(req.params.id);
		res.json(result);
	} catch (error) {
		console.error("Get combo error:", error);
		res.status(404).json({ success: false, message: error.message });
	}
}

export async function createCuratedCombo(req, res) {
	try {
		const imageBuffer = req.file?.buffer;
		let data = { ...req.body };
		if (typeof data.products === "string") {
			try { data.products = JSON.parse(data.products); } catch (e) {}
		}
		const result = await comboService.createCuratedCombo(data, imageBuffer);
		res.status(201).json(result);
	} catch (error) {
		console.error("Create curated combo error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

export async function createCustomCombo(req, res) {
	try {
		const imageBuffer = req.file?.buffer;
		let data = { ...req.body };
		if (typeof data.products === "string") {
			try { data.products = JSON.parse(data.products); } catch (e) {}
		}
		const result = await comboService.createCustomCombo(data, imageBuffer);
		res.status(201).json(result);
	} catch (error) {
		console.error("Create custom combo error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

export async function updateCombo(req, res) {
	try {
		const imageBuffer = req.file?.buffer;
		let data = { ...req.body };
		if (typeof data.products === "string") {
			try { data.products = JSON.parse(data.products); } catch (e) {}
		}
		const result = await comboService.updateCombo(req.params.id, data, imageBuffer);
		res.json(result);
	} catch (error) {
		console.error("Update combo error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

export async function deleteCombo(req, res) {
	try {
		const result = await comboService.deleteCombo(req.params.id);
		res.json(result);
	} catch (error) {
		console.error("Delete combo error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}