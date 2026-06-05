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
		if (typeof data.slots === "string") {
			try { data.slots = JSON.parse(data.slots); } catch (e) {}
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
		if (typeof data.categories === "string") {
			try { data.categories = JSON.parse(data.categories); } catch (e) {}
		}
		if (typeof data.styles === "string") {
			try { data.styles = JSON.parse(data.styles); } catch (e) {}
		}
		if (typeof data.discountRules === "string") {
			try { data.discountRules = JSON.parse(data.discountRules); } catch (e) {}
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
		if (typeof data.slots === "string") {
			try { data.slots = JSON.parse(data.slots); } catch (e) {}
		}
		if (typeof data.categories === "string") {
			try { data.categories = JSON.parse(data.categories); } catch (e) {}
		}
		if (typeof data.styles === "string") {
			try { data.styles = JSON.parse(data.styles); } catch (e) {}
		}
		if (typeof data.discountRules === "string") {
			try { data.discountRules = JSON.parse(data.discountRules); } catch (e) {}
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