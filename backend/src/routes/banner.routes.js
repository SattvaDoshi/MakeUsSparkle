import { Router } from "express";
import {
	getBanners,
	getMainBanner,
} from "../controllers/banner.controller.js";

const router = Router();

router.get("/", getBanners);
router.get("/main", getMainBanner);

export default router;