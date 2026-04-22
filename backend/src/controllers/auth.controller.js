import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

function signToken(user) {
	return jwt.sign(
		{ sub: String(user._id), role: user.role, email: user.email },
		process.env.JWT_SECRET || "dev-secret",
		{ expiresIn: "7d" }
	);
}

export async function register(req, res) {
	const { password, ...rest } = req.body;
	const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;
	const user = await User.create({
		...rest,
		password: hashedPassword,
	});

	const token = signToken(user);
	res.status(201).json({ success: true, user, token });
}

export async function login(req, res) {
	const user = await User.findOne({ email: req.body.email });
	if (!user) {
		return res.status(401).json({ success: false, message: "Invalid credentials" });
	}

	const isPasswordValid = await bcrypt.compare(req.body.password || "", user.password || "");
	if (!isPasswordValid) {
		return res.status(401).json({ success: false, message: "Invalid credentials" });
	}

	const token = signToken(user);
	res.json({ success: true, message: "Login successful", user, token });
}

export async function logout(req, res) {
	res.json({ success: true, message: "Logged out" });
}

export async function getMe(req, res) {
	res.json({ success: true, user: req.user });
}

export async function forgotPassword(req, res) {
	res.json({ success: true, message: "Password reset flow not wired yet" });
}

export async function resetPassword(req, res) {
	res.json({ success: true, message: "Password reset flow not wired yet" });
}