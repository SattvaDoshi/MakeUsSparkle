import { Router } from "express";
import { getNewArrivalsSection, getOpenSection } from "../controllers/homeSection.controller.js";

const router = Router();

router.get("/new-arrivals", getNewArrivalsSection);
router.get("/open-section", getOpenSection);

export default router;
