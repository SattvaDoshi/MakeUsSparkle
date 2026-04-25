import categoryService from "../services/category.service.js";

export async function getCategories(req, res) {
	try {
		const result = await categoryService.getCategories();
		res.json(result);
	} catch (error) {
		console.error("Get categories error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

export async function getCategoryById(req, res) {
	try {
		const result = await categoryService.getCategoryById(req.params.id);
		res.json(result);
	} catch (error) {
		console.error("Get category error:", error);
		res.status(404).json({ success: false, message: error.message });
	}
}

export async function createCategory(req, res) {
	try {
		const result = await categoryService.createCategory(req.body);
		res.status(201).json(result);
	} catch (error) {
		console.error("Create category error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

export async function updateCategory(req, res) {
	try {
		const result = await categoryService.updateCategory(req.params.id, req.body);
		res.json(result);
	} catch (error) {
		console.error("Update category error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

export async function deleteCategory(req, res) {
	try {
		const result = await categoryService.deleteCategory(req.params.id);
		res.json(result);
	} catch (error) {
		console.error("Delete category error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

export async function getSubCategories(req, res) {
	try {
		const categoryId = req.query.categoryId || null;
		const result = await categoryService.getSubCategories(categoryId);
		res.json(result);
	} catch (error) {
		console.error("Get subcategories error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

export async function createSubCategory(req, res) {
	try {
		const result = await categoryService.createSubCategory(req.body);
		res.status(201).json(result);
	} catch (error) {
		console.error("Create subcategory error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

export async function updateSubCategory(req, res) {
	try {
		const result = await categoryService.updateSubCategory(req.params.id, req.body);
		res.json(result);
	} catch (error) {
		console.error("Update subcategory error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

export async function deleteSubCategory(req, res) {
	try {
		const result = await categoryService.deleteSubCategory(req.params.id);
		res.json(result);
	} catch (error) {
		console.error("Delete subcategory error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

export async function updateStyle(req, res) {
	const style = await Style.findByIdAndUpdate(req.params.id, req.body, { returnDocument: "after" });
	res.json({ success: true, style });
}

export async function deleteStyle(req, res) {
	await Style.findByIdAndDelete(req.params.id);
	res.json({ success: true, message: "Style deleted" });
}