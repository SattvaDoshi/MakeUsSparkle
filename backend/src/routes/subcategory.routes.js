import { Router } from "express";
import { getSubCategories } from "../controllers/category.controller.js";

const router = Router();

router.get("/", getSubCategories);

export default router;