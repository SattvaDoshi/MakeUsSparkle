import { Router } from "express";
import { getFaqsPublic, getFounderPublic } from "../controllers/siteContent.controller.js";

const router = Router();
router.get("/founder-message", getFounderPublic);
router.get("/faqs", getFaqsPublic);
export default router;
