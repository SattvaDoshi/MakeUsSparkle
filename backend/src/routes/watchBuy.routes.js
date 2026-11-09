import { Router } from "express";
import { getWatchBuyPublic } from "../controllers/watchBuy.controller.js";

const router = Router();
router.get("/", getWatchBuyPublic);
export default router;
