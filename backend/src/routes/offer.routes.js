import { Router } from "express";
import { getPublicOffers } from "../controllers/offer.controller.js";

const router = Router();

router.get("/public", getPublicOffers);

export default router;
