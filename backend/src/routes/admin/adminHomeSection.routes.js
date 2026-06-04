import { Router } from "express";
import {
	getNewArrivalsSection,
	updateNewArrivalsSection,
} from "../../controllers/homeSection.controller.js";
import { requireAdmin, requireAuth } from "../../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth, requireAdmin);

router.get("/new-arrivals", getNewArrivalsSection);
router.put("/new-arrivals", updateNewArrivalsSection);

export default router;
