import express from "express";
import { getHomeContent } from "../controllers/homeContent.controller.js";

const router = express.Router();

router.get("/", getHomeContent);

export default router;
