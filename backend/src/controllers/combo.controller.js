import Combo from "../models/combo.model.js";

export async function getCombos(req, res) {
	const combos = await Combo.find();
	res.json({ success: true, combos });
}

export async function getComboById(req, res) {
	const combo = await Combo.findById(req.params.id);
	res.json({ success: true, combo });
}

export async function createCombo(req, res) {
	const combo = await Combo.create({ ...req.body, type: "curated" });
	res.status(201).json({ success: true, combo });
}

export async function updateCombo(req, res) {
	const combo = await Combo.findByIdAndUpdate(req.params.id, req.body, { new: true });
	res.json({ success: true, combo });
}

export async function deleteCombo(req, res) {
	await Combo.findByIdAndDelete(req.params.id);
	res.json({ success: true, message: "Combo deleted" });
}

export async function createCustomCombo(req, res) {
	const combo = await Combo.create({ ...req.body, type: "custom" });
	res.status(201).json({ success: true, combo });
}