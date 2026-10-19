import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/user.model.js";
import emailService from "./email.service.js";
import couponService from "./coupon.service.js";
import affiliateService from "./affiliate.service.js";

class AuthService {
	signToken(user) {
		return jwt.sign(
			{
				sub: String(user._id),
				role: user.role,
				email: user.email,
			},
			process.env.JWT_SECRET || "dev-secret",
			{ expiresIn: "7d" }
		);
	}

	async register(userData) {
		try {
			if (!userData.password) {
				throw new Error("Password is required");
			}

			// Separate the referral code (from URL) from the user data before saving
			const { refCode, ...userFields } = userData;

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

			const welcomeCouponResult = await couponService.createWelcomeCoupon(user);
			const welcomeCoupon = welcomeCouponResult.coupon;

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
					welcomeCoupon.code,
					welcomeCoupon.discountValue
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
				welcomeCoupon: {
					code: welcomeCoupon.code,
					discountType: welcomeCoupon.discountType,
					discountValue: welcomeCoupon.discountValue,
					expiryDate: welcomeCoupon.expiryDate,
				},
			};
		} catch (error) {
			console.error("Registration error:", error);
			throw error;
		}
	}

	async login(email, password) {
		try {
			// Find user
			const user = await User.findOne({ email });
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
			const user = await User.findOne({ email });
			if (!user) {
				// Don't reveal if email exists
				return {
					success: true,
					message: "If email exists, OTP has been sent",
				};
			}

			// Generate 6 digit OTP
			const otp = Math.floor(100000 + Math.random() * 900000).toString();
			user.resetPasswordOtp = otp;
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
			// Find user
			const user = await User.findOne({ email });
			if (!user) {
				throw new Error("Invalid or expired OTP");
			}

			if (!user.resetPasswordOtp || user.resetPasswordOtp !== otp || user.resetPasswordOtpExpiry < new Date()) {
				throw new Error("Invalid or expired OTP");
			}

			// Hash new password
			const hashedPassword = await bcrypt.hash(newPassword, 10);

			// Update password
			user.password = hashedPassword;
			user.resetPasswordOtp = undefined;
			user.resetPasswordOtpExpiry = undefined;
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
			const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev-secret");
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
