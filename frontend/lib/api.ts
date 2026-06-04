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
	const headers: Record<string, string> = {
		"Content-Type": "application/json",
		...(requestOptions.headers as Record<string, string> | undefined),
	};

	if (options.body instanceof FormData) {
		delete headers["Content-Type"];
	}

	if (token) {
		headers.Authorization = `Bearer ${token}`;
	}

	const response = await fetch(getApiUrl(path), {
		// avoid 304 Not Modified causing response.ok === false by default
		cache: (requestOptions as any).cache ?? "no-store",
		...requestOptions,
		headers,
	});

	const data = await response.json().catch(() => ({}));

	if (!response.ok) {
		throw new Error(data.message || "Request failed");
	}

	return data as T;
}