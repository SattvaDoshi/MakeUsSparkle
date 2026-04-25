"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { apiRequest, getStoredAuthToken } from "./api";

export type AuthUser = {
	_id: string;
	name?: string;
	email?: string;
	phone?: string;
	role?: string;
	createdAt?: string;
	addresses?: Array<{
		_id?: string;
		fullAddress?: string;
		city?: string;
		state?: string;
		pincode?: string;
	}>;
};

type AuthContextValue = {
	token: string | null;
	user: AuthUser | null;
	loading: boolean;
	isAuthenticated: boolean;
	signIn: (token: string, user?: AuthUser | null) => Promise<void>;
	signOut: () => void;
	refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [token, setToken] = useState<string | null>(null);
	const [user, setUser] = useState<AuthUser | null>(null);
	const [loading, setLoading] = useState(true);

	const loadUser = async (authToken: string) => {
		try {
			const result = await apiRequest<{ success: boolean; user: AuthUser }>("/users/profile", {
				authToken,
			});
			setUser(result.user);
		} catch {
			setToken(null);
			setUser(null);
			localStorage.removeItem("authToken");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		const storedToken = getStoredAuthToken();
		if (!storedToken) {
			setLoading(false);
			return;
		}

		setToken(storedToken);
		void loadUser(storedToken);
	}, []);

	const signIn = async (nextToken: string, nextUser?: AuthUser | null) => {
		setToken(nextToken);
		localStorage.setItem("authToken", nextToken);
		if (nextUser) {
			setUser(nextUser);
		}
		setLoading(true);
		await loadUser(nextToken);
	};

	const signOut = () => {
		setToken(null);
		setUser(null);
		setLoading(false);
		localStorage.removeItem("authToken");
	};

	const refreshUser = async () => {
		if (!token) {
			setUser(null);
			return;
		}

		setLoading(true);
		await loadUser(token);
	};

	const value = useMemo<AuthContextValue>(() => ({
		token,
		user,
		loading,
		isAuthenticated: Boolean(token),
		signIn,
		signOut,
		refreshUser,
	}), [token, user, loading]);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used inside <AuthProvider>");
	}

	return context;
}
