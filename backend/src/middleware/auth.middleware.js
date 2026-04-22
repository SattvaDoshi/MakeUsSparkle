import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
	const authHeader = req.headers.authorization || "";
	const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

	if (!token) {
		return res.status(401).json({ success: false, message: "Authentication required" });
	}

	try {
		const payload = jwt.verify(token, process.env.JWT_SECRET || "dev-secret");
		req.user = {
			id: payload.sub,
			role: payload.role,
			email: payload.email,
		};
		next();
	} catch {
		return res.status(401).json({ success: false, message: "Invalid or expired token" });
	}
	
	return undefined;
	}

	export function requireAdmin(req, res, next) {
	const role = req.user?.role;

	if (role !== "admin") {
		return res.status(403).json({ success: false, message: "Admin access required" });
	}

	next();
	}