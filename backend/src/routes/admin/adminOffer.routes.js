import { Router } from "express";
import {
	createOffer,
	deleteOffer,
	updateOffer,
	getAllOffers,
} from "../../controllers/admin/adminOffer.controller.js";
import { requireAdmin, requireAuth } from "../../middleware/auth.middleware.js";
import { uploadSingleImage } from "../../middleware/upload.middleware.js";

const router = Router();

router.use(requireAuth, requireAdmin);

router.get("/", getAllOffers);
router.post("/", uploadSingleImage, createOffer);
router.put("/:id", uploadSingleImage, updateOffer);
router.delete("/:id", deleteOffer);

export default router;
