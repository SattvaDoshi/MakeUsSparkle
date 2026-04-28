import productService from "../services/product.service.js";

export async function getProducts(req, res) {
	try {
		const result = await productService.getProducts(req.query);
		res.json(result);
	} catch (error) {
		console.error("Get products error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

export async function getTags(req, res) {
	try {
		const result = await productService.getTags();
		res.json(result);
	} catch (error) {
		console.error("Get tags error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

export async function getProductById(req, res) {
	try {
		const result = await productService.getProductById(req.params.id);
		res.json(result);
	} catch (error) {
		console.error("Get product by ID error:", error);
		res.status(404).json({ success: false, message: error.message });
	}
}

export async function searchProducts(req, res) {
	try {
		const result = await productService.searchProducts(req.query.q);
		res.json(result);
	} catch (error) {
		console.error("Search products error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

export async function filterProducts(req, res) {
	try {
		const result = await productService.filterProducts(req.query);
		res.json(result);
	} catch (error) {
		console.error("Filter products error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

export async function createProduct(req, res) {
	try {
		const files = req.files || [];
		const result = await productService.createProduct(req.body, files);
		res.status(201).json(result);
	} catch (error) {
		console.error("Create product error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

export async function updateProduct(req, res) {
	try {
		const files = req.files || [];
		const result = await productService.updateProduct(req.params.id, req.body, files);
		res.json(result);
	} catch (error) {
		console.error("Update product error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

export async function deleteProduct(req, res) {
	try {
		const result = await productService.deleteProduct(req.params.id);
		res.json(result);
	} catch (error) {
		console.error("Delete product error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

export async function addProductReview(req, res) {
	try {
		const result = await productService.addProductReview(req.params.id, req.user._id, req.body);
		res.status(201).json(result);
	} catch (error) {
		console.error("Add review error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

export async function getProductReviews(req, res) {
	try {
		const result = await productService.getProductReviews(req.params.id);
		res.json(result);
	} catch (error) {
		console.error("Get reviews error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}