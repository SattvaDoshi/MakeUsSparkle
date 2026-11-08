import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/user.model.js";
import emailService from "./email.service.js";
import couponService from "./coupon.service.js";
import affiliateService from "./affiliate.service.js";
import { getJwtSecret } from "../config/jwt.js";

/** Accept only real strings; anything else (objects, arrays, numbers) becomes undefined. */
const str = (v) => (typeof v === "string" ? v.trim() : undefined);

class AuthService {
	signToken(user) {
		return jwt.sign(
			{
				sub: String(user._id),
				role: user.role,
				email: user.email,
			},
			getJwtSecret(),
			{ expiresIn: "7d" }
		);
	}

	async register(userData) {
		try {
			if (!userData.password) {
				throw new Error("Password is required");
			}

			// Only these fields may come from the client. Never role, rewardPoints, emailVerified, OTP fields, etc.
			const { refCode } = userData;
			const userFields = {
				name: str(userData.name),
				email: str(userData.email)?.toLowerCase(),
				phone: str(userData.phone),
				gender: str(userData.gender) || undefined,
				dob: userData.dob || undefined,
				password: str(userData.password),
			};
			if (!userFields.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userFields.email)) {
				throw new Error("A valid email is required");
			}
			if (!userFields.password || userFields.password.length < 6) {
				throw new Error("Password must be at least 6 characters");
			}

			// Check if user already exists
			const existingUser = await User.findOne({ email: userFields.email });
			if (existingUser) {
				throw new Error("User with this email already exists");
			}

			// Hash password
			const hashedPassword = userFields.password
				? await bcrypt.hash(userFields.password, 10)
				: undefined;

			// Generate a unique referral code for the new user
			let referralCode;
			for (let i = 0; i < 5; i++) {
				const candidate = crypto.randomBytes(4).toString("hex").toUpperCase();
				const conflict = await User.findOne({ referralCode: candidate });
				if (!conflict) { referralCode = candidate; break; }
			}
			if (!referralCode) referralCode = crypto.randomBytes(8).toString("hex").toUpperCase();

			// Create user
			const user = await User.create({
				...userFields,
				password: hashedPassword,
				referralCode,
			});

			// Record referral relationship if a refCode was supplied
			if (refCode) {
				await affiliateService.recordReferral(user._id, refCode);
			}

			// A failed welcome coupon must never break signup: the account already exists at this point.
			let welcomeCoupon = null;
			try {
				welcomeCoupon = (await couponService.createWelcomeCoupon(user)).coupon;
			} catch (couponError) {
				console.warn("Welcome coupon could not be created:", couponError.message);
			}

			// Generate token
			const token = this.signToken(user);

			// Send welcome email
			const frontendUrl = (process.env.NODE_ENV === "production" && (!process.env.FRONTEND_URL || process.env.FRONTEND_URL.includes("localhost")))
				? "https://makeyousparkle.in"
				: (process.env.FRONTEND_URL || "https://makeyousparkle.in");
			const verificationLink = `${frontendUrl}/verify-email?token=${token}`;
			let welcomeEmailSent = true;

			try {
				await emailService.sendWelcomeEmail(
					user.email,
					user.name || "User",
					verificationLink,
					welcomeCoupon?.code,
					welcomeCoupon?.discountValue
				);
			} catch (emailError) {
				welcomeEmailSent = false;
				console.warn("Welcome email could not be sent:", emailError.message);
			}

			return {
				success: true,
				user: {
					_id: user._id,
					name: user.name,
					email: user.email,
					role: user.role,
				},
				token,
				welcomeEmailSent,
				welcomeCoupon: welcomeCoupon
					? {
						code: welcomeCoupon.code,
						discountType: welcomeCoupon.discountType,
						discountValue: welcomeCoupon.discountValue,
						expiryDate: welcomeCoupon.expiryDate,
					}
					: null,
			};
		} catch (error) {
			console.error("Registration error:", error);
			throw error;
		}
	}

	async login(email, password) {
		try {
			if (typeof email !== "string" || typeof password !== "string") throw new Error("Invalid credentials");
			// Find user
			const user = await User.findOne({ email: email.trim().toLowerCase() });
			if (!user) {
				throw new Error("Invalid credentials");
			}

			// Verify password
			const isPasswordValid = await bcrypt.compare(password || "", user.password || "");
			if (!isPasswordValid) {
				throw new Error("Invalid credentials");
			}

			// Generate token
			const token = this.signToken(user);

			return {
				success: true,
				message: "Login successful",
				user: {
					_id: user._id,
					name: user.name,
					email: user.email,
					role: user.role,
				},
				token,
			};
		} catch (error) {
			console.error("Login error:", error);
			throw error;
		}
	}

	async logout() {
		// In a stateless JWT system, logout is handled on the client side
		// You can implement token blacklisting if needed
		return {
			success: true,
			message: "Logged out successfully",
		};
	}

	async requestPasswordReset(email) {
		try {
			if (typeof email !== "string") throw new Error("A valid email is required");
			const user = await User.findOne({ email: email.trim().toLowerCase() });
			if (!user) {
				// Don't reveal if email exists
				return {
					success: true,
					message: "If email exists, OTP has been sent",
				};
			}

			// Generate 6 digit OTP
			const otp = crypto.randomInt(100000, 1000000).toString(); // cryptographically random
			user.resetPasswordOtp = otp;
			user.resetPasswordOtpAttempts = 0;
			user.resetPasswordOtpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
			await user.save();

			// Send OTP email
			await emailService.sendPasswordResetOtpEmail(user.email, otp);

			return {
				success: true,
				message: "Password reset OTP sent",
			};
		} catch (error) {
			console.error("Password reset request error:", error);
			throw error;
		}
	}

	async resetPassword(email, otp, newPassword) {
		try {
			if (typeof email !== "string" || typeof otp !== "string" || typeof newPassword !== "string") {
				throw new Error("Invalid or expired OTP");
			}
			if (newPassword.length < 6) throw new Error("Password must be at least 6 characters");
			// Find user
			const user = await User.findOne({ email: email.trim().toLowerCase() });
			if (!user || !user.resetPasswordOtp) {
				throw new Error("Invalid or expired OTP");
			}

			// A 6-digit code must not be guessable: 5 wrong tries burns it.
			if ((user.resetPasswordOtpAttempts || 0) >= 5 || user.resetPasswordOtpExpiry < new Date()) {
				user.resetPasswordOtp = undefined;
				user.resetPasswordOtpExpiry = undefined;
				user.resetPasswordOtpAttempts = 0;
				await user.save();
				throw new Error("Invalid or expired OTP");
			}
			const a = Buffer.from(user.resetPasswordOtp);
			const b = Buffer.from(otp.trim());
			const match = a.length === b.length && crypto.timingSafeEqual(a, b);
			if (!match) {
				user.resetPasswordOtpAttempts = (user.resetPasswordOtpAttempts || 0) + 1;
				await user.save();
				throw new Error("Invalid or expired OTP");
			}

			// Hash new password
			const hashedPassword = await bcrypt.hash(newPassword, 10);

			// Update password
			user.password = hashedPassword;
			user.resetPasswordOtp = undefined;
			user.resetPasswordOtpExpiry = undefined;
			user.resetPasswordOtpAttempts = 0;
			await user.save();

			return {
				success: true,
				message: "Password reset successfully",
			};
		} catch (error) {
			console.error("Password reset error:", error);
			throw error;
		}
	}

	async verifyEmail(token) {
		try {
			const decoded = jwt.verify(token, getJwtSecret());
			const user = await User.findByIdAndUpdate(decoded.sub, { emailVerified: true }, { returnDocument: "after" });

			return {
				success: true,
				message: "Email verified successfully",
				user,
			};
		} catch (error) {
			console.error("Email verification error:", error);
			throw error;
		}
	}
}

export default new AuthService();
