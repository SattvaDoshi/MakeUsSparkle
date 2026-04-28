import { Router } from "express";
import {
  getCharmItems,
  getCharmItemById,
  getCharmCategories,
} from "../controllers/charmItem.controller.js";

const router = Router();

router.get("/", getCharmItems);
router.get("/categories", getCharmCategories);
router.get("/:id", getCharmItemById);

export default router;
