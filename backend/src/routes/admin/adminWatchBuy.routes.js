import { Router } from "express";
import {
	createWatchBuy,
	deleteWatchBuy,
	getWatchBuyAdmin,
	signWatchBuyUpload,
	updateWatchBuy,
} from "../../controllers/watchBuy.controller.js";
import { requireAdmin, requireAuth } from "../../middleware/auth.middleware.js";

const router = Router();
router.use(requireAuth, requireAdmin);

router.get("/", getWatchBuyAdmin);
router.post("/sign-upload", signWatchBuyUpload);
router.post("/", createWatchBuy);
router.put("/:id", updateWatchBuy);
router.delete("/:id", deleteWatchBuy);

export default router;
