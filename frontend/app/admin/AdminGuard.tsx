"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";

type AdminGuardProps = {
	children: React.ReactNode;
};

export default function AdminGuard({ children }: AdminGuardProps) {
	const router = useRouter();
	const pathname = usePathname();
	const { loading, isAuthenticated, user } = useAuth();

	useEffect(() => {
		if (loading) {
			return;
		}

		if (!isAuthenticated) {
			router.replace(`/admin/login?next=${encodeURIComponent(pathname)}`);
			return;
		}

		if (user?.role !== "admin") {
			router.replace("/admin/login?forbidden=1");
		}
	}, [loading, isAuthenticated, user?.role, router, pathname]);

	if (loading || !isAuthenticated || user?.role !== "admin") {
		return <div className="admin-loading">Checking admin access...</div>;
	}

	return <>{children}</>;
}
