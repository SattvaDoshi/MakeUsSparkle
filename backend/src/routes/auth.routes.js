import { Router } from "express";
import {
	forgotPassword,
	getMe,
	login,
	logout,
	register,
	resetPassword,
	verifyEmail,
} from "../controllers/auth.controller.js";
import { loginLimiter } from "../middleware/rateLimit.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", loginLimiter, login);
router.post("/logout", logout);
router.get("/me", requireAuth, getMe);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/verify-email", verifyEmail);

export default router;