import { Router } from "express";
import { getStyles } from "../controllers/style.controller.js";

const router = Router();

router.get("/", getStyles);

export default router;