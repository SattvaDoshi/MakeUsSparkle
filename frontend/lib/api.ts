const DEFAULT_API_BASE = (process.env.NEXT_PUBLIC_API_URL ||
	(process.env.NODE_ENV === "production" ? "https://makeussparkle.onrender.com" : "http://localhost:5000")
).replace(/\/+$/, "");

export function getApiUrl(path: string) {
	const normalizedPath = path.startsWith("/") ? path : `/${path}`;
	return `${DEFAULT_API_BASE}${normalizedPath}`;
}

export function getStoredAuthToken() {
	if (typeof window === "undefined") {
		return null;
	}

	return localStorage.getItem("authToken");
}



type ApiRequestOptions = RequestInit & {
	authToken?: string | null;
};

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
	const { authToken, ...requestOptions } = options;
	const token = authToken ?? getStoredAuthToken();
	// Only declare a JSON body when there is one. A Content-Type header on a plain GET makes
	// the browser send a separate CORS "preflight" request first — a wasted round trip per call.
	const headers: Record<string, string> = {
		...(requestOptions.body && !(requestOptions.body instanceof FormData) ? { "Content-Type": "application/json" } : {}),
		...(requestOptions.headers as Record<string, string> | undefined),
	};

	if (token) {
		headers.Authorization = `Bearer ${token}`;
	}

	const isMutation = requestOptions.method && requestOptions.method !== "GET";
	const response = await fetch(getApiUrl(path), {
		cache: (requestOptions as any).cache ?? (isMutation ? "no-store" : "default"),
		...requestOptions,
		headers,
	});

	const data = await response.json().catch(() => ({}));

	if (!response.ok) {
		if (response.status === 401 && typeof window !== "undefined") {
			window.dispatchEvent(new Event("makeussparkle:logout"));
		}
		throw new Error(data.message || "Request failed");
	}

	return data as T;
}