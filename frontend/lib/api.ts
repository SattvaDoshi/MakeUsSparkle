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