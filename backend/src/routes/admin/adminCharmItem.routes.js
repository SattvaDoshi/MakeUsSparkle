import { Router } from "express";
import {
  createCharmItem,
  updateCharmItem,
  deleteCharmItem,
  getAllCharmItems,
} from "../../controllers/admin/adminCharmItem.controller.js";
import { requireAuth, requireAdmin } from "../../middleware/auth.middleware.js";
import { uploadSingleImage } from "../../middleware/upload.middleware.js";

const router = Router();

router.use(requireAuth, requireAdmin);

router.get("/", getAllCharmItems);
router.post("/", uploadSingleImage, createCharmItem);
router.put("/:id", uploadSingleImage, updateCharmItem);
router.delete("/:id", deleteCharmItem);

export default router;
