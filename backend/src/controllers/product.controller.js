import Product from "../models/product.model.js";

function buildProductQuery(queryParams) {
	const { category, style, gender, minPrice, maxPrice, rating } = queryParams;
	const query = {};

	if (category) query.category = category;
	if (style) query.style = style;
	if (gender) query.gender = gender;
	if (rating) query.rating = { $gte: Number(rating) };
	if (minPrice || maxPrice) {
		query.price = {};
		if (minPrice) query.price.$gte = Number(minPrice);
		if (maxPrice) query.price.$lte = Number(maxPrice);
	}

	return query;
}

export async function getProducts(req, res) {
	const query = buildProductQuery(req.query);
	let productQuery = Product.find(query);

	if (req.query.sort === "price_asc") productQuery = productQuery.sort({ price: 1 });
	if (req.query.sort === "price_desc") productQuery = productQuery.sort({ price: -1 });
	if (req.query.sort === "rating_desc") productQuery = productQuery.sort({ rating: -1 });
	if (req.query.sort === "rating_asc") productQuery = productQuery.sort({ rating: 1 });

	const products = await productQuery;
	res.json({ success: true, products });
}

export async function getProductById(req, res) {
	const product = await Product.findById(req.params.id);
	res.json({ success: true, product });
}

export async function searchProducts(req, res) {
	const q = req.query.q || "";
	const products = await Product.find({ title: new RegExp(q, "i") });
	res.json({ success: true, products });
}

export async function filterProducts(req, res) {
	const products = await Product.find(buildProductQuery(req.query));
	res.json({ success: true, products });
}

export async function addProductReview(req, res) {
	const product = await Product.findById(req.params.id);
	product.reviews.push({ ...req.body, user: req.user.id });
	await product.save();
	res.status(201).json({ success: true, reviews: product.reviews });
}

export async function getProductReviews(req, res) {
	const product = await Product.findById(req.params.id).populate("reviews.user");
	res.json({ success: true, reviews: product?.reviews || [] });
}

export async function createProduct(req, res) {
	const product = await Product.create(req.body);
	res.status(201).json({ success: true, product });
}

export async function updateProduct(req, res) {
	const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
	res.json({ success: true, product });
}

export async function deleteProduct(req, res) {
	await Product.findByIdAndDelete(req.params.id);
	res.json({ success: true, message: "Product deleted" });
}