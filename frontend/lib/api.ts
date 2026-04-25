const DEFAULT_API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export function getApiUrl(path: string) {
	return `${DEFAULT_API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
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

	if (token) {
		headers.Authorization = `Bearer ${token}`;
	}

	const response = await fetch(getApiUrl(path), {
		...requestOptions,
		headers,
	});

	const data = await response.json().catch(() => ({}));

	if (!response.ok) {
		throw new Error(data.message || "Request failed");
	}

	return data as T;
}