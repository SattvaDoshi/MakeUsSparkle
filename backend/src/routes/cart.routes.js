import { Router } from "express";
import {
	clearCart,
	getCart,
	removeCartCoupon,
	removeFromCart,
	updateCartItem,
	addToCart,
} from "../controllers/cart.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth);

router.get("/", getCart);
router.post("/add", addToCart);
router.put("/update/:itemId", updateCartItem);
router.delete("/remove/:itemId", removeFromCart);
router.delete("/clear", clearCart);
router.post("/remove-coupon", removeCartCoupon);

export default router;