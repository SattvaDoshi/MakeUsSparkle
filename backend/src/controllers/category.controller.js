import Category from "../models/category.model.js";
import SubCategory from "../models/subCategory.model.js";
import Style from "../models/style.model.js";

export async function getCategories(req, res) {
	const categories = await Category.find();
	res.json({ success: true, categories });
}

export async function getCategoryById(req, res) {
	const category = await Category.findById(req.params.id);
	res.json({ success: true, category });
}

export async function createCategory(req, res) {
	const category = await Category.create(req.body);
	res.status(201).json({ success: true, category });
}

export async function updateCategory(req, res) {
	const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
	res.json({ success: true, category });
}

export async function deleteCategory(req, res) {
	await Category.findByIdAndDelete(req.params.id);
	res.json({ success: true, message: "Category deleted" });
}

export async function getSubCategories(req, res) {
	const subcategories = await SubCategory.find();
	res.json({ success: true, subcategories });
}

export async function createSubCategory(req, res) {
	const subCategory = await SubCategory.create(req.body);
	res.status(201).json({ success: true, subCategory });
}

export async function updateSubCategory(req, res) {
	const subCategory = await SubCategory.findByIdAndUpdate(req.params.id, req.body, { new: true });
	res.json({ success: true, subCategory });
}

export async function deleteSubCategory(req, res) {
	await SubCategory.findByIdAndDelete(req.params.id);
	res.json({ success: true, message: "Subcategory deleted" });
}

export async function getStyles(req, res) {
	const styles = await Style.find();
	res.json({ success: true, styles });
}

export async function createStyle(req, res) {
	const style = await Style.create(req.body);
	res.status(201).json({ success: true, style });
}

export async function updateStyle(req, res) {
	const style = await Style.findByIdAndUpdate(req.params.id, req.body, { new: true });
	res.json({ success: true, style });
}

export async function deleteStyle(req, res) {
	await Style.findByIdAndDelete(req.params.id);
	res.json({ success: true, message: "Style deleted" });
}