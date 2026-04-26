import type { ReactNode } from "react";
import AdminGuard from "../AdminGuard";

export default function AdminPanelLayout({ children }: { children: ReactNode }) {
	return <AdminGuard>{children}</AdminGuard>;
}
