import { Router } from "express";
import {
	applyCoupon,
	clearCart,
	getCart,
	giftWrap,
	removeCartCoupon,
	removeCartItem,
	updateCartItem,
	addCartItem,
} from "../controllers/cart.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth);

router.get("/", getCart);
router.post("/add", addCartItem);
router.put("/update/:itemId", updateCartItem);
router.delete("/remove/:itemId", removeCartItem);
router.delete("/clear", clearCart);
router.post("/apply-coupon", applyCoupon);
router.post("/remove-coupon", removeCartCoupon);
router.post("/gift-wrap", giftWrap);

export default router;