import { Router } from "express";
import { getNewArrivalsSection } from "../controllers/homeSection.controller.js";

const router = Router();

router.get("/new-arrivals", getNewArrivalsSection);

export default router;
