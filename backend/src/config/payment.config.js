import { StandardCheckoutClient, Env } from "@phonepe-pg/pg-sdk-node";

const clientId = process.env.PHONEPE_CLIENT_ID;
const clientSecret = process.env.PHONEPE_CLIENT_SECRET;
const clientVersion = Number(process.env.PHONEPE_CLIENT_VERSION || 1);

const hasPhonePeCredentials = clientId && clientSecret;

// Initialize PhonePe client only when credentials are available so app startup
// does not fail in local/dev environments.
let phonePeClient = null;
if (hasPhonePeCredentials) {
	try {
		const env = process.env.NODE_ENV === "production" ? Env.PRODUCTION : Env.SANDBOX;
		phonePeClient = StandardCheckoutClient.getInstance(clientId, clientSecret, clientVersion, env);
	} catch (err) {
		// Singleton may already be instantiated (hot-reload scenarios)
		console.warn("PhonePe client init warning:", err.message);
	}
}

export { phonePeClient };
