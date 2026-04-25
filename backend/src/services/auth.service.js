import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import emailService from "./email.service.js";

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
			// Check if user already exists
			const existingUser = await User.findOne({ email: userData.email });
			if (existingUser) {
				throw new Error("User with this email already exists");
			}

			// Hash password
			const hashedPassword = userData.password ? await bcrypt.hash(userData.password, 10) : undefined;

			// Create user
			const user = await User.create({
				...userData,
				password: hashedPassword,
			});

			// Generate token
			const token = this.signToken(user);

			// Send welcome email
			const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
			await emailService.sendWelcomeEmail(user.email, user.name || "User", verificationLink);

			return {
				success: true,
				user: {
					_id: user._id,
					name: user.name,
					email: user.email,
					role: user.role,
				},
				token,
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
					message: "If email exists, reset link has been sent",
				};
			}

			// Generate reset token (valid for 1 hour)
			const resetToken = jwt.sign({ sub: String(user._id) }, process.env.JWT_SECRET || "dev-secret", {
				expiresIn: "1h",
			});

			// Send reset email
			const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
			await emailService.sendPasswordResetEmail(user.email, resetLink);

			return {
				success: true,
				message: "Password reset email sent",
			};
		} catch (error) {
			console.error("Password reset request error:", error);
			throw error;
		}
	}

	async resetPassword(token, newPassword) {
		try {
			// Verify token
			const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev-secret");

			// Find user
			const user = await User.findById(decoded.sub);
			if (!user) {
				throw new Error("User not found");
			}

			// Hash new password
			const hashedPassword = await bcrypt.hash(newPassword, 10);

			// Update password
			user.password = hashedPassword;
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
			const user = await User.findByIdAndUpdate(decoded.sub, { emailVerified: true }, { new: true });

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
