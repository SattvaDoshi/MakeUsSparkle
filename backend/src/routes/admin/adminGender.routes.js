import { Router } from "express";
import { createGender, deleteGender, updateGender } from "../../controllers/gender.controller.js";
import { requireAdmin, requireAuth } from "../../middleware/auth.middleware.js";
import { uploadSingleImage } from "../../middleware/upload.middleware.js";

const router = Router();

router.use(requireAuth, requireAdmin);

router.post("/", uploadSingleImage, createGender);
router.put("/:id", uploadSingleImage, updateGender);
router.delete("/:id", deleteGender);

export default router;
