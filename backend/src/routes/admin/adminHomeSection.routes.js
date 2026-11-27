import { Router } from "express";
import {
	getNewArrivalsSection,
	updateNewArrivalsSection,
	getOpenSection,
	updateOpenSection,
	getShelfSection,
	updateShelfSection,
} from "../../controllers/homeSection.controller.js";
import { requireAdmin, requireAuth } from "../../middleware/auth.middleware.js";
import { uploadOpenSection } from "../../middleware/upload.middleware.js";

const router = Router();

router.use(requireAuth, requireAdmin);

router.get("/new-arrivals", getNewArrivalsSection);
router.put("/new-arrivals", updateNewArrivalsSection);

router.get("/open-section", getOpenSection);
router.put("/open-section", uploadOpenSection, updateOpenSection);

router.get("/shelf/:mode", getShelfSection);
router.put("/shelf/:mode", updateShelfSection);

export default router;

