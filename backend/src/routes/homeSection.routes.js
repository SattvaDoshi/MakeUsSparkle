import { Router } from "express";
import { getNewArrivalsSection, getOpenSection, getShelfSection } from "../controllers/homeSection.controller.js";

const router = Router();

router.get("/new-arrivals", getNewArrivalsSection);
router.get("/open-section", getOpenSection);
router.get("/shelf/:mode", getShelfSection);

export default router;
