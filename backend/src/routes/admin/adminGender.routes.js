import { Router } from "express";
import { createGender, deleteGender, updateGender } from "../../controllers/gender.controller.js";
import { requireAdmin, requireAuth } from "../../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth, requireAdmin);

router.post("/", createGender);
router.put("/:id", updateGender);
router.delete("/:id", deleteGender);

export default router;
