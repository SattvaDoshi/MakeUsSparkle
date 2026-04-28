"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import { apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/authContext";

type LoginResponse = {
	success: boolean;
	message?: string;
	token: string;
	user: {
		_id: string;
		name?: string;
		email?: string;
		role?: string;
	};
};

export default function AdminLoginPage() {
	const router = useRouter();
	const [nextRoute, setNextRoute] = useState("/admin");
	const [forbidden, setForbidden] = useState(false);

	const { signIn, user, isAuthenticated, loading, signOut } = useAuth();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		setNextRoute(params.get("next") || "/admin");
		setForbidden(params.get("forbidden") === "1");
	}, []);

	useEffect(() => {
		if (!loading && isAuthenticated && user?.role === "admin") {
			router.replace(nextRoute);
		}
	}, [loading, isAuthenticated, user?.role, nextRoute, router]);

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError(null);
		setSubmitting(true);

		try {
			const result = await apiRequest<LoginResponse>("/auth/login", {
				method: "POST",
				body: JSON.stringify({ email, password }),
				authToken: null,
			});

			if (result.user.role !== "admin") {
				signOut();
				throw new Error("This account is not allowed in admin panel");
			}

			await signIn(result.token, result.user);
			router.replace(nextRoute);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Unable to login");
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<main className="admin-login-page">
			<section className="admin-login-card">
				<p className="admin-login-kicker">SECURE ZONE</p>
				<h1>Admin Access</h1>
				<p>Manage catalog, users, orders and payments from one place.</p>

				{forbidden && <p className="admin-error">You do not have admin permission.</p>}
				{error && <p className="admin-error">{error}</p>}

				<form className="admin-login-form" onSubmit={handleSubmit}>
					<label>
						Email
						<input
							type="email"
							value={email}
							onChange={(event) => setEmail(event.target.value)}
							required
						/>
					</label>
					<label>
						Password
						<input
							type="password"
							value={password}
							onChange={(event) => setPassword(event.target.value)}
							required
						/>
					</label>
					<button type="submit" disabled={submitting}>
						{submitting ? "Signing in..." : "Sign in as Admin"}
					</button>
				</form>

				<Link href="/" className="admin-back-link">
					Back to storefront
				</Link>
			</section>
		</main>
	);
}
