"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { useEffect } from "react";
import BottomNav from "@/components/ui/BottomNav";
import UpperNav from "@/components/ui/UpperNav";
import Footer from "@/components/home/Footer";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import LoginPopup from "@/components/ui/LoginPopup";
import CartDrawer from "@/components/cart/CartDrawer";
import { ConfettiManager } from "@/components/cart/ConfettiManager";

type SiteChromeProps = {
	children: ReactNode;
};

export default function SiteChrome({ children }: SiteChromeProps) {
	const pathname = usePathname();
	const isAdminRoute = pathname.startsWith("/admin");
	// Every storefront page gets the header, footer and bottom menu, except once the shopper has added to cart:
	// cart, checkout and payment stay distraction-free.
	const hideChrome = ["/cart", "/checkout", "/payment"].some((p) => pathname.startsWith(p));

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
			<div className={hideChrome ? undefined : "has-bottom-nav"}>
				{!hideChrome && <UpperNav />}
				{children}
				{!hideChrome && <div className="footer-wrap"><Footer /></div>}
			</div>
			{!hideChrome && <BottomNav />}
			{!hideChrome && <WhatsAppButton />}
			<LoginPopup />
			<CartDrawer />
			<ConfettiManager />
		</>
	);
}
