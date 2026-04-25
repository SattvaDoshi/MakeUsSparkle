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
import bannerRoutes from "./routes/banner.routes.js";
import abandonedRoutes from "./routes/abandoned.routes.js";
import adminRoutes from "./routes/admin/admin.routes.js";
import adminProductRoutes from "./routes/admin/adminProduct.routes.js";
import adminCategoryRoutes from "./routes/admin/adminCategory.routes.js";
import adminSubCategoryRoutes from "./routes/admin/adminSubcategory.routes.js";
import adminStyleRoutes from "./routes/admin/adminStyle.routes.js";
import adminComboRoutes from "./routes/admin/adminCombo.routes.js";
import adminOrderRoutes from "./routes/admin/adminOrder.routes.js";
import adminCouponRoutes from "./routes/admin/adminCoupon.routes.js";
import adminBannerRoutes from "./routes/admin/adminBanner.routes.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use((req, res, next) => {
	const origin = req.headers.origin;
	if (origin) {
		res.header("Access-Control-Allow-Origin", origin);
		res.header("Vary", "Origin");
	} else {
		res.header("Access-Control-Allow-Origin", "*");
	}
	res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
	res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

	if (req.method === "OPTIONS") {
		return res.sendStatus(204);
	}

	return next();
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
app.use("/banners", bannerRoutes);
app.use("/admin", adminRoutes);
app.use("/admin/products", adminProductRoutes);
app.use("/admin/categories", adminCategoryRoutes);
app.use("/admin/subcategories", adminSubCategoryRoutes);
app.use("/admin/styles", adminStyleRoutes);
app.use("/admin/combos", adminComboRoutes);
app.use("/admin/orders", adminOrderRoutes);
app.use("/admin/coupons", adminCouponRoutes);
app.use("/admin/banners", adminBannerRoutes);
app.use("/abandoned", abandonedRoutes);

export default app;