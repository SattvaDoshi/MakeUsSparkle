import { createRateLimiter } from "./security.middleware.js";

// 20 attempts / 15 min / IP — slows password guessing without bothering real customers.
export const loginLimiter = createRateLimiter({
	windowMs: 15 * 60 * 1000,
	max: 20,
	message: "Too many login attempts. Please try again in a few minutes.",
});

// Sign-up, forgot-password, verify-email: 10 / hour / IP (also stops email-bombing).
export const accountLimiter = createRateLimiter({
	windowMs: 60 * 60 * 1000,
	max: 10,
	message: "Too many requests. Please try again later.",
});

// Whole API, generous: 600 requests / minute / IP.
export const globalLimiter = createRateLimiter({ windowMs: 60 * 1000, max: 600 });
