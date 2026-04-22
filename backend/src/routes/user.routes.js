import { Router } from "express";
import {
	addAddress,
	deleteAccount,
	deleteAddress,
	deleteWishlistItem,
	getProfile,
	getWishlist,
	updateAddress,
	updateProfile,
	addWishlistItem,
} from "../controllers/user.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth);

router.get("/profile", getProfile);
router.put("/profile/update", updateProfile);
router.delete("/account", deleteAccount);

router.post("/address", addAddress);
router.put("/address/:id", updateAddress);
router.delete("/address/:id", deleteAddress);

router.get("/wishlist", getWishlist);
router.post("/wishlist/:productId", addWishlistItem);
router.delete("/wishlist/:productId", deleteWishlistItem);

export default router;