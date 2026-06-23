import express from "express";
import { getSurveys } from "../../controllers/exitSurvey.controller.js";
import { requireAuth, requireAdmin } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", requireAuth, requireAdmin, getSurveys);

export default router;
