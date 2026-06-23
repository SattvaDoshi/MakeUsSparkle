import express from "express";
import { submitSurvey } from "../controllers/exitSurvey.controller.js";

const router = express.Router();

router.post("/", submitSurvey);

export default router;
