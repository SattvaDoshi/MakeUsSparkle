import express from "express";
import { updateHomeContent, getHomeContent } from "../../controllers/homeContent.controller.js";
import { uploadHomeContent } from "../../middleware/upload.middleware.js";
import { requireAuth, requireAdmin } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.use(requireAuth, requireAdmin);

router.get("/", getHomeContent);
router.put("/", uploadHomeContent, updateHomeContent);

export default router;
