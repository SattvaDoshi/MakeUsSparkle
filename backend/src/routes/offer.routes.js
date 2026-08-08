import { Router } from "express";
import { getPublicOffers, getOfferById } from "../controllers/offer.controller.js";

const router = Router();

router.get("/public", getPublicOffers);
router.get("/:id", getOfferById);

export default router;
