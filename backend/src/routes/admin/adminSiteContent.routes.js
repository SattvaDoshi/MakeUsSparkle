import { Router } from "express";
import {
	createFaq, deleteFaq, getFaqsAdmin, getFounderAdmin, saveFaqSettings, saveFounderAdmin, updateFaq,
} from "../../controllers/siteContent.controller.js";
import { requireAdmin, requireAuth } from "../../middleware/auth.middleware.js";
import { uploadFounder } from "../../middleware/upload.middleware.js";

const router = Router();
router.use(requireAuth, requireAdmin);

router.get("/founder-message", getFounderAdmin);
router.put("/founder-message", uploadFounder, saveFounderAdmin);

router.get("/faqs", getFaqsAdmin);
router.put("/faqs/settings", saveFaqSettings); // before "/:id"
router.post("/faqs", createFaq);
router.put("/faqs/:id", updateFaq);
router.delete("/faqs/:id", deleteFaq);

export default router;
