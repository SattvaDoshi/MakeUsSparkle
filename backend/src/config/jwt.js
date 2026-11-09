/** One place for the JWT secret. Warns loudly in production if it is missing or weak. */
const secret = process.env.JWT_SECRET;

if (process.env.NODE_ENV === "production" && (!secret || secret.length < 32)) {
	console.error(
		"[SECURITY] JWT_SECRET is " + (secret ? "too short (<32 chars)" : "NOT SET (falling back to a public default!)") +
			". Anyone could forge login tokens. Set a long random value (e.g. `openssl rand -hex 48`)."
	);
}

export function getJwtSecret() {
	return secret || "dev-secret";
}
