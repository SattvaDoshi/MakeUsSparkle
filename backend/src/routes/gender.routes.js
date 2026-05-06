import { Router } from "express";
import { getGenders, getGenderById } from "../controllers/gender.controller.js";

const router = Router();

router.get("/", getGenders);
router.get("/:id", getGenderById);

export default router;
