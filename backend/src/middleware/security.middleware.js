/**
 * Cross-cutting security middleware (no extra dependencies).
 *  - securityHeaders:     standard hardening headers on every response
 *  - rejectOperatorQuery: blocks NoSQL operator injection (?field[$ne]=x) on every route
 *  - hidePrivateFields:   never lets internal business fields (e.g. costPrice) leave on public routes
 */

export function securityHeaders(req, res, next) {
	res.setHeader("X-Content-Type-Options", "nosniff");
	res.setHeader("X-Frame-Options", "DENY");
	res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
	res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
	if (req.secure || req.headers["x-forwarded-proto"] === "https") {
		res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
	}
	next();
}

/** Query values must be plain strings (or arrays of strings). Objects are how Mongo operators get smuggled in. */
export function rejectOperatorQuery(req, res, next) {
	const isBad = (v) =>
		Array.isArray(v) ? v.some(isBad) : v !== null && typeof v === "object";
	for (const value of Object.values(req.query || {})) {
		if (isBad(value)) {
			return res.status(400).json({ success: false, message: "Invalid query parameters" });
		}
	}
	next();
}

const PRIVATE_KEYS = new Set(["costPrice"]);
const stripPrivate = (key, value) => (PRIVATE_KEYS.has(key) ? undefined : value);

/** Admin routes (authenticated) keep the full documents; everything else loses private fields. */
export function hidePrivateFields(req, res, next) {
	if (req.path.startsWith("/admin")) return next();
	const originalJson = res.json.bind(res);
	res.json = (body) => {
		if (body && typeof body === "object") {
			res.type("application/json");
			return res.send(JSON.stringify(body, stripPrivate));
		}
		return originalJson(body);
	};
	next();
}

/** Small in-memory rate limiter (per IP). Fine for a single instance; swap for Redis if you scale out. */
export function createRateLimiter({ windowMs, max, message = "Too many requests, please try again later." }) {
	const hits = new Map();
	const timer = setInterval(() => {
		const now = Date.now();
		for (const [key, entry] of hits) if (entry.resetAt <= now) hits.delete(key);
	}, Math.max(windowMs, 60_000));
	timer.unref?.();

	return (req, res, next) => {
		if (req.method === "OPTIONS") return next();
		const now = Date.now();
		const key = req.ip || "unknown";
		let entry = hits.get(key);
		if (!entry || entry.resetAt <= now) {
			entry = { count: 0, resetAt: now + windowMs };
			hits.set(key, entry);
		}
		entry.count += 1;
		if (entry.count > max) {
			res.setHeader("Retry-After", String(Math.ceil((entry.resetAt - now) / 1000)));
			return res.status(429).json({ success: false, message });
		}
		next();
	};
}
