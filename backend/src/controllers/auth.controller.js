import authService from "../services/auth.service.js";

export async function register(req, res) {
	try {
		const result = await authService.register(req.body);
		res.status(201).json(result);
	} catch (error) {
		console.error("Register error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

export async function login(req, res) {
	try {
		const { email, password } = req.body;
		const result = await authService.login(email, password);
		res.json(result);
	} catch (error) {
		console.error("Login error:", error);
		res.status(401).json({ success: false, message: error.message });
	}
}

export async function logout(req, res) {
	try {
		const result = await authService.logout();
		res.json(result);
	} catch (error) {
		console.error("Logout error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

export async function getMe(req, res) {
	try {
		res.json({ success: true, user: req.user });
	} catch (error) {
		console.error("GetMe error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

export async function forgotPassword(req, res) {
	try {
		const { email } = req.body;
		const result = await authService.requestPasswordReset(email);
		res.json(result);
	} catch (error) {
		console.error("Forgot password error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

export async function resetPassword(req, res) {
	try {
		const { token, newPassword } = req.body;
		const result = await authService.resetPassword(token, newPassword);
		res.json(result);
	} catch (error) {
		console.error("Reset password error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

export async function verifyEmail(req, res) {
	try {
		const { token } = req.body;
		const result = await authService.verifyEmail(token);
		res.json(result);
	} catch (error) {
		console.error("Email verification error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}