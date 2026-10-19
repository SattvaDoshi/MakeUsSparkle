"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { useEffect } from "react";
import BottomNav from "@/components/ui/BottomNav";
import LoginPopup from "@/components/ui/LoginPopup";
import CartDrawer from "@/components/cart/CartDrawer";
import { ConfettiManager } from "@/components/cart/ConfettiManager";

type SiteChromeProps = {
	children: ReactNode;
};

export default function SiteChrome({ children }: SiteChromeProps) {
	const pathname = usePathname();
	const isAdminRoute = pathname.startsWith("/admin");

	useEffect(() => {
		if (typeof window !== "undefined") {
			const ref = new URLSearchParams(window.location.search).get("ref");
			if (ref) {
				const clean = ref.trim().toUpperCase();
				sessionStorage.setItem("mus_ref", clean);
				localStorage.setItem("mus_ref", clean);
			}
		}
	}, []);

	if (isAdminRoute) {
		return <>{children}</>;
	}

	return (
		<>
			<div className="has-bottom-nav">{children}</div>
			<BottomNav />
			<LoginPopup />
			<CartDrawer />
			<ConfettiManager />
		</>
	);
}
