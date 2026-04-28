import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
	title: "Admin | MakeUsSparkle",
	description: "Manage products, orders, users and payments.",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
	return (
		<div className="admin-shell">
			{children}
		</div>
	);
}
