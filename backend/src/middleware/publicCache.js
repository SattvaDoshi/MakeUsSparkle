/**
 * Short in-memory cache for the public storefront catalogue (products, categories, styles, home content…).
 *
 * Why: the database is far from the API server, so every query costs a long round trip and one storefront request
 * makes several. Serving the same public JSON from memory for a short while turns 1–3s responses into a few ms.
 *
 * Safety:
 *  - Only GET requests to the public paths below and only 200 responses. These routes don't look at who is
 *    signed in (shoppers send their token on every call, so it is ignored here); a response from any route that
 *    did authenticate the user (req.user set) is never stored, so nothing user-specific is ever cached.
 *  - Any successful change (admin edits, orders/payments that move stock, reviews…) clears the whole cache, so
 *    edits show up straight away on this server. With several server processes, the others catch up within TTL.
 */

const TTL_MS = 60 * 1000;
const MAX_ENTRIES = 500;

const PUBLIC_PREFIXES = [
	"/products",
	"/categories",
	"/subcategories",
	"/styles",
	"/genders",
	"/combos",
	"/offers",
	"/banners",
	"/watch-buy",
	"/site",
	"/home-sections",
	"/home-content",
	"/charm-items",
	"/reviews/featured",
	"/reviews/product",
	"/coupons/offers",
];

// Changes on these paths never alter catalogue data, so they don't need to clear the cache.
const NO_INVALIDATE_PREFIXES = ["/cart", "/auth", "/abandoned", "/exit-surveys", "/api/shipping"];

const store = new Map(); // url -> { body, type, expires }

const startsWithAny = (path, list) => list.some((p) => path === p || path.startsWith(`${p}/`) || path.startsWith(`${p}?`));

export function clearPublicCache() {
	store.clear();
}

export function publicCache(req, res, next) {
	const path = req.path;

	if (req.method !== "GET" && req.method !== "HEAD") {
		if (req.method !== "OPTIONS" && !startsWithAny(path, NO_INVALIDATE_PREFIXES)) {
			res.on("finish", () => {
				if (res.statusCode < 400) clearPublicCache();
			});
		}
		return next();
	}

	if (!startsWithAny(path, PUBLIC_PREFIXES)) return next();

	const key = req.originalUrl;
	const hit = store.get(key);
	if (hit && hit.expires > Date.now()) {
		res.setHeader("X-Cache", "HIT");
		res.type(hit.type);
		return res.send(hit.body);
	}
	if (hit) store.delete(key);

	const originalSend = res.send.bind(res);
	res.send = (body) => {
		// req.user is only set by requireAuth: a response built for a signed-in user is never stored.
		if (res.statusCode === 200 && !req.user && (typeof body === "string" || Buffer.isBuffer(body))) {
			if (store.size >= MAX_ENTRIES) store.delete(store.keys().next().value);
			store.set(key, { body, type: res.get("Content-Type") || "application/json", expires: Date.now() + TTL_MS });
		}
		res.setHeader("X-Cache", "MISS");
		return originalSend(body);
	};
	next();
}
