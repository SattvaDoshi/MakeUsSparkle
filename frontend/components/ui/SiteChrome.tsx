"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

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
