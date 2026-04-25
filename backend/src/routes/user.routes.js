import { Router } from "express";
import {
	addAddress,
	deleteAddress,
	removeFromWishlist,
	getUserProfile,
	getWishlist,
	updateAddress,
	updateUserProfile,
	addToWishlist,
} from "../controllers/user.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth);

router.get("/profile", getUserProfile);
router.put("/profile/update", updateUserProfile);

router.post("/address", addAddress);
router.put("/address/:id", updateAddress);
router.delete("/address/:id", deleteAddress);

router.get("/wishlist", getWishlist);
router.post("/wishlist/:productId", addToWishlist);
router.delete("/wishlist/:productId", removeFromWishlist);

export default router;