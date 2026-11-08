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
import { loginLimiter, accountLimiter } from "../middleware/rateLimit.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", accountLimiter, register);
router.post("/login", loginLimiter, login);
router.post("/logout", logout);
router.get("/me", requireAuth, getMe);
router.post("/forgot-password", accountLimiter, forgotPassword);
router.post("/reset-password", accountLimiter, resetPassword);
router.post("/verify-email", accountLimiter, verifyEmail);

export default router;