import express from "express";
import morgan from "morgan";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import productRoutes from "./routes/product.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import subCategoryRoutes from "./routes/subcategory.routes.js";
import styleRoutes from "./routes/style.routes.js";
import comboRoutes from "./routes/combo.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import orderRoutes from "./routes/order.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import couponRoutes from "./routes/coupon.routes.js";
import offerRoutes from "./routes/offer.routes.js";
import bannerRoutes from "./routes/banner.routes.js";
import homeSectionRoutes from "./routes/homeSection.routes.js";
import abandonedRoutes from "./routes/abandoned.routes.js";
import charmItemRoutes from "./routes/charmItem.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import adminRoutes from "./routes/admin/admin.routes.js";
import adminProductRoutes from "./routes/admin/adminProduct.routes.js";
import adminCategoryRoutes from "./routes/admin/adminCategory.routes.js";
import adminSubCategoryRoutes from "./routes/admin/adminSubcategory.routes.js";
import adminStyleRoutes from "./routes/admin/adminStyle.routes.js";
import genderRoutes from "./routes/gender.routes.js";
import adminGenderRoutes from "./routes/admin/adminGender.routes.js";
import adminComboRoutes from "./routes/admin/adminCombo.routes.js";
import adminOrderRoutes from "./routes/admin/adminOrder.routes.js";
import adminCouponRoutes from "./routes/admin/adminCoupon.routes.js";
import adminBannerRoutes from "./routes/admin/adminBanner.routes.js";
import adminHomeSectionRoutes from "./routes/admin/adminHomeSection.routes.js";
import adminCharmItemRoutes from "./routes/admin/adminCharmItem.routes.js";
import adminOfferRoutes from "./routes/admin/adminOffer.routes.js";
import adminHomeContentRoutes from "./routes/admin/adminHomeContent.routes.js";
import homeContentRoutes from "./routes/homeContent.routes.js";
import rewardsRoutes from "./routes/rewards.routes.js";
import exitSurveyRoutes from "./routes/exitSurvey.routes.js";
import adminExitSurveyRoutes from "./routes/admin/adminExitSurvey.routes.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

const normalizeOrigin = (value) => {
	if (!value) return "";
	return String(value).trim().replace(/\/+$/, "");
};

const allowedOrigins = new Set(
	[
		process.env.FRONTEND_URL,
		process.env.CORS_ORIGINS,
		"http://localhost:3000",
		"http://127.0.0.1:3000",
		"https://make-us-sparkle.vercel.app",
	]
		.flatMap((value) => (value ? String(value).split(",") : []))
		.map(normalizeOrigin)
		.filter(Boolean)
);

app.use((req, res, next) => {
	const origin = normalizeOrigin(req.headers.origin);

	// Allow non-browser clients (curl/postman) which may not send Origin.
	if (!origin) {
		if (req.method === "OPTIONS") {
			return res.sendStatus(204);
		}
		return next();
	}

	if (allowedOrigins.has(origin)) {
		res.header("Access-Control-Allow-Origin", origin);
		res.header("Vary", "Origin");
		res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
		res.header(
			"Access-Control-Allow-Headers",
			"Content-Type, Authorization, X-Requested-With, Accept"
		);
		res.header("Access-Control-Max-Age", "86400");

		if (req.method === "OPTIONS") {
			return res.sendStatus(204);
		}

		return next();
	}

	if (req.method === "OPTIONS") {
		return res.status(403).end();
	}

	return res.status(403).json({
		success: false,
		message: "CORS blocked: origin not allowed",
	});
});

app.get("/", (req, res) => {
	res.json({
		message: "MakeUsSparkle backend is running",
	});
});

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/products", productRoutes);
app.use("/categories", categoryRoutes);
app.use("/subcategories", subCategoryRoutes);
app.use("/styles", styleRoutes);
app.use("/combos", comboRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);
app.use("/payment", paymentRoutes);
app.use("/coupons", couponRoutes);
app.use("/offers", offerRoutes);
app.use("/banners", bannerRoutes);
app.use("/home-sections", homeSectionRoutes);
app.use("/charm-items", charmItemRoutes);
app.use("/admin", adminRoutes);
app.use("/admin/products", adminProductRoutes);
app.use("/admin/categories", adminCategoryRoutes);
app.use("/admin/subcategories", adminSubCategoryRoutes);
app.use("/admin/styles", adminStyleRoutes);
app.use("/admin/combos", adminComboRoutes);
app.use("/admin/orders", adminOrderRoutes);
app.use("/admin/coupons", adminCouponRoutes);
app.use("/admin/banners", adminBannerRoutes);
app.use("/admin/home-sections", adminHomeSectionRoutes);
app.use("/admin/charm-items", adminCharmItemRoutes);
app.use("/admin/offers", adminOfferRoutes);
app.use("/genders", genderRoutes);
app.use("/admin/genders", adminGenderRoutes);
app.use("/exit-surveys", exitSurveyRoutes);
app.use("/admin/exit-surveys", adminExitSurveyRoutes);
app.use("/home-content", homeContentRoutes);
app.use("/admin/home-content", adminHomeContentRoutes);
app.use("/abandoned", abandonedRoutes);
app.use("/reviews", reviewRoutes);
app.use("/rewards", rewardsRoutes);

export default app;
