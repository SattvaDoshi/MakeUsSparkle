"use client";

import { useState, useMemo } from "react";
import type { AdminProduct } from "../../_lib/admin.types";

export type AdminCategoryRef = {
	_id: string;
	name?: string;
	description?: string;
	image?: string;
};

export type AdminSubCategoryRef = {
	_id: string;
	name?: string;
	image?: string;
};

export type AdminStyleRef = {
	_id: string;
	name?: string;
	image?: string;
};

export interface AffiliateUserSummary {
	id: string;
	name: string;
	email: string;
	phone?: string;
	referralCode: string;
	totalUsersReferred: number;
	totalClicks: number;
	totalOrders: number;
	deliveredOrders: number;
	pendingOrders: number;
	totalSalesGenerated: number;
	totalEarnedDelivered: number;
	totalEarnedPending: number;
	linksCount: number;
	couponsCount: number;
	createdAt?: string;
}

export interface AdminAffiliateCommissionLog {
	id: string;
	affiliateId: string;
	affiliateName: string;
	affiliateCode: string;
	referredUserName: string;
	orderId: string;
	orderStatus: string;
	orderAmount: number;
	commission: number;
	status: string;
	productTitle?: string | null;
	couponCode?: string | null;
	date: string;
}

export interface AdminAffiliateCouponItem {
	id: string;
	code: string;
	name: string;
	description?: string;
	discountType: "percentage" | "fixed";
	discountValue: number;
	maxDiscount?: number;
	minOrderValue: number;
	usageLimit: number;
	usedCount: number;
	isActive: boolean;
	expiryDate?: string | null;
	affiliateUser?: {
		id: string;
		name: string;
		referralCode: string;
	} | null;
	applicableCategories?: Array<{ id: string; name: string }>;
	applicableSubCategories?: Array<{ id: string; name: string }>;
	applicableStyles?: Array<{ id: string; name: string }>;
	applicableProducts?: Array<{ id: string; title: string }>;
	createdAt?: string;
}

export interface AdminAffiliateStats {
	totalAffiliates: number;
	totalAffiliateSales: number;
	totalDeliveredCommission: number;
	totalPendingCommission: number;
	totalClicksAll: number;
	totalOrders: number;
}

export type AdminAffiliatesTabProps = {
	stats: AdminAffiliateStats;
	affiliates: AffiliateUserSummary[];
	commissions: AdminAffiliateCommissionLog[];
	coupons: AdminAffiliateCouponItem[];
	categories: AdminCategoryRef[];
	subcategories: AdminSubCategoryRef[];
	styles: AdminStyleRef[];
	products: AdminProduct[];
	onCreateCoupon: (data: any) => Promise<void>;
	onDeleteCoupon: (id: string) => Promise<void>;
	refreshing: boolean;
	onRefresh: () => void;
};

export default function AdminAffiliatesTab({
	stats,
	affiliates,
	commissions,
	coupons,
	categories,
	subcategories,
	styles,
	products,
	onCreateCoupon,
	onDeleteCoupon,
	refreshing,
	onRefresh,
}: AdminAffiliatesTabProps) {
	const [activeSubTab, setActiveSubTab] = useState<"affiliates" | "commissions" | "coupons">("affiliates");
	const [searchAffiliate, setSearchAffiliate] = useState("");
	const [searchCommission, setSearchCommission] = useState("");
	const [searchCoupon, setSearchCoupon] = useState("");

	// Create Coupon Modal State
	const [showCouponModal, setShowCouponModal] = useState(false);
	const [savingCoupon, setSavingCoupon] = useState(false);
	const [couponError, setCouponError] = useState("");

	const [couponForm, setCouponForm] = useState({
		code: "",
		name: "",
		description: "",
		discountType: "percentage" as "percentage" | "fixed",
		discountValue: "10",
		maxDiscount: "",
		minOrderValue: "0",
		usageLimit: "9999",
		expiryDate: "",
		affiliateUserId: "",
		applicableCategories: [] as string[],
		applicableProducts: [] as string[],
	});

	// Filter affiliates
	const filteredAffiliates = useMemo(() => {
		const q = searchAffiliate.toLowerCase().trim();
		if (!q) return affiliates;
		return affiliates.filter(
			(a) =>
				a.name.toLowerCase().includes(q) ||
				a.email.toLowerCase().includes(q) ||
				a.referralCode.toLowerCase().includes(q)
		);
	}, [affiliates, searchAffiliate]);

	// Filter commissions
	const filteredCommissions = useMemo(() => {
		const q = searchCommission.toLowerCase().trim();
		if (!q) return commissions;
		return commissions.filter(
			(c) =>
				c.affiliateName.toLowerCase().includes(q) ||
				c.affiliateCode.toLowerCase().includes(q) ||
				c.orderId.toLowerCase().includes(q) ||
				c.referredUserName.toLowerCase().includes(q) ||
				(c.couponCode && c.couponCode.toLowerCase().includes(q))
		);
	}, [commissions, searchCommission]);

	// Filter coupons
	const filteredCoupons = useMemo(() => {
		const q = searchCoupon.toLowerCase().trim();
		if (!q) return coupons;
		return coupons.filter(
			(cp) =>
				cp.code.toLowerCase().includes(q) ||
				cp.name.toLowerCase().includes(q) ||
				(cp.affiliateUser?.name && cp.affiliateUser.name.toLowerCase().includes(q)) ||
				(cp.affiliateUser?.referralCode && cp.affiliateUser.referralCode.toLowerCase().includes(q))
		);
	}, [coupons, searchCoupon]);

	const handleOpenCreateCoupon = (prefillAffiliateId?: string) => {
		setCouponForm({
			code: "",
			name: "",
			description: "",
			discountType: "percentage",
			discountValue: "10",
			maxDiscount: "",
			minOrderValue: "0",
			usageLimit: "9999",
			expiryDate: "",
			affiliateUserId: prefillAffiliateId || (affiliates[0]?.id ?? ""),
			applicableCategories: [],
			applicableProducts: [],
		});
		setCouponError("");
		setShowCouponModal(true);
	};

	const handleSubmitCoupon = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!couponForm.code.trim()) {
			setCouponError("Please provide a coupon code.");
			return;
		}
		if (!couponForm.affiliateUserId) {
			setCouponError("Please assign an affiliate partner.");
			return;
		}
		if (!couponForm.discountValue || Number(couponForm.discountValue) <= 0) {
			setCouponError("Please provide a valid discount value.");
			return;
		}

		setSavingCoupon(true);
		setCouponError("");
		try {
			await onCreateCoupon({
				code: couponForm.code.trim().toUpperCase(),
				name: couponForm.name.trim(),
				description: couponForm.description.trim(),
				discountType: couponForm.discountType,
				discountValue: Number(couponForm.discountValue),
				maxDiscount: couponForm.maxDiscount ? Number(couponForm.maxDiscount) : undefined,
				minOrderValue: Number(couponForm.minOrderValue || 0),
				usageLimit: Number(couponForm.usageLimit || 9999),
				expiryDate: couponForm.expiryDate || undefined,
				affiliateUserId: couponForm.affiliateUserId,
				applicableCategories: couponForm.applicableCategories,
				applicableProducts: couponForm.applicableProducts,
			});
			setShowCouponModal(false);
		} catch (err) {
			setCouponError(err instanceof Error ? err.message : "Failed to create coupon");
		} finally {
			setSavingCoupon(false);
		}
	};

	const toggleItem = (list: string[], item: string) => {
		return list.includes(item) ? list.filter((i) => i !== item) : [...list, item];
	};

	return (
		<section className="admin-content">
			{/* Top Action Bar */}
			<div className="admin-toolbar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
				<div>
					<h2 style={{ fontSize: "1.4rem", color: "#3d4a20", margin: 0, fontWeight: 700 }}>
						Affiliate &amp; Partner Management
					</h2>
					<p style={{ margin: "4px 0 0", fontSize: "0.85rem", color: "#666" }}>
						Monitor referred signups, affiliate link sales, track live conversion commissions, and issue dedicated affiliate promo coupons.
					</p>
				</div>
				<div style={{ display: "flex", gap: "0.8rem", alignItems: "center" }}>
					<button
						type="button"
						className="admin-btn admin-btn--outline"
						onClick={onRefresh}
						disabled={refreshing}
						style={{ display: "flex", alignItems: "center", gap: "6px" }}
					>
						<span>🔄</span> {refreshing ? "Refreshing..." : "Refresh Data"}
					</button>
					<button
						type="button"
						className="admin-btn admin-btn--primary"
						onClick={() => handleOpenCreateCoupon()}
						style={{ background: "#4a5c22", color: "#f5e6b8", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}
					>
						<span>+</span> Issue Affiliate Coupon
					</button>
				</div>
			</div>

			{/* KPI Stats Cards */}
			<div className="admin-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "1rem", marginBottom: "1.8rem" }}>
				<div className="admin-card" style={{ padding: "1.2rem", background: "#fff", border: "1px solid #e2e6d6", borderRadius: "8px" }}>
					<span style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.08em", color: "#777", textTransform: "uppercase" }}>Affiliate Partners</span>
					<div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#3d4a20", margin: "6px 0 2px" }}>{stats.totalAffiliates}</div>
					<span style={{ fontSize: "0.8rem", color: "#888" }}>Users with active referral codes</span>
				</div>

				<div className="admin-card" style={{ padding: "1.2rem", background: "#fff", border: "1px solid #e2e6d6", borderRadius: "8px" }}>
					<span style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.08em", color: "#777", textTransform: "uppercase" }}>Gross Affiliate Sales</span>
					<div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#2e6024", margin: "6px 0 2px" }}>₹{stats.totalAffiliateSales.toLocaleString("en-IN")}</div>
					<span style={{ fontSize: "0.8rem", color: "#888" }}>From {stats.totalOrders} referred orders</span>
				</div>

				<div className="admin-card" style={{ padding: "1.2rem", background: "#fff", border: "1px solid #e2e6d6", borderRadius: "8px" }}>
					<span style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.08em", color: "#777", textTransform: "uppercase" }}>Delivered Commissions</span>
					<div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#1c542e", margin: "6px 0 2px" }}>₹{stats.totalDeliveredCommission.toLocaleString("en-IN")}</div>
					<span style={{ fontSize: "0.8rem", color: "#888" }}>Earned &amp; confirmed upon delivery</span>
				</div>

				<div className="admin-card" style={{ padding: "1.2rem", background: "#fff", border: "1px solid #e2e6d6", borderRadius: "8px" }}>
					<span style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.08em", color: "#777", textTransform: "uppercase" }}>Pending Commissions</span>
					<div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#b4690e", margin: "6px 0 2px" }}>₹{stats.totalPendingCommission.toLocaleString("en-IN")}</div>
					<span style={{ fontSize: "0.8rem", color: "#888" }}>Orders placed &amp; in transit</span>
				</div>

				<div className="admin-card" style={{ padding: "1.2rem", background: "#fff", border: "1px solid #e2e6d6", borderRadius: "8px" }}>
					<span style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.08em", color: "#777", textTransform: "uppercase" }}>Total Link Clicks</span>
					<div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#4a5c22", margin: "6px 0 2px" }}>{stats.totalClicksAll}</div>
					<span style={{ fontSize: "0.8rem", color: "#888" }}>Live tracked affiliate traffic</span>
				</div>
			</div>

			{/* Sub Tabs Navigation */}
			<div style={{ display: "flex", gap: "0.5rem", borderBottom: "2px solid #e6e9dc", marginBottom: "1.2rem" }}>
				<button
					type="button"
					onClick={() => setActiveSubTab("affiliates")}
					style={{
						padding: "0.7rem 1.2rem",
						border: "none",
						background: "transparent",
						borderBottom: activeSubTab === "affiliates" ? "3px solid #4a5c22" : "3px solid transparent",
						color: activeSubTab === "affiliates" ? "#3d4a20" : "#777",
						fontWeight: activeSubTab === "affiliates" ? 700 : 500,
						fontSize: "0.92rem",
						cursor: "pointer",
					}}
				>
					👥 Affiliate Partners ({affiliates.length})
				</button>

				<button
					type="button"
					onClick={() => setActiveSubTab("commissions")}
					style={{
						padding: "0.7rem 1.2rem",
						border: "none",
						background: "transparent",
						borderBottom: activeSubTab === "commissions" ? "3px solid #4a5c22" : "3px solid transparent",
						color: activeSubTab === "commissions" ? "#3d4a20" : "#777",
						fontWeight: activeSubTab === "commissions" ? 700 : 500,
						fontSize: "0.92rem",
						cursor: "pointer",
					}}
				>
					📦 Referred Orders &amp; Commissions ({commissions.length})
				</button>

				<button
					type="button"
					onClick={() => setActiveSubTab("coupons")}
					style={{
						padding: "0.7rem 1.2rem",
						border: "none",
						background: "transparent",
						borderBottom: activeSubTab === "coupons" ? "3px solid #4a5c22" : "3px solid transparent",
						color: activeSubTab === "coupons" ? "#3d4a20" : "#777",
						fontWeight: activeSubTab === "coupons" ? 700 : 500,
						fontSize: "0.92rem",
						cursor: "pointer",
					}}
				>
					🎟️ Affiliate Promo Coupons ({coupons.length})
				</button>
			</div>

			{/* ── SUB TAB 1: AFFILIATE PARTNERS ── */}
			{activeSubTab === "affiliates" && (
				<div className="admin-card" style={{ padding: "1.2rem", background: "#fff", border: "1px solid #e2e6d6", borderRadius: "8px" }}>
					<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.8rem" }}>
						<h3 style={{ margin: 0, fontSize: "1.1rem", color: "#3d4a20" }}>Partner Performance Breakdown</h3>
						<input
							type="text"
							placeholder="Search by name, email, code..."
							value={searchAffiliate}
							onChange={(e) => setSearchAffiliate(e.target.value)}
							style={{ padding: "0.5rem 0.8rem", border: "1px solid #cbd5b5", borderRadius: "6px", fontSize: "0.85rem", width: "260px" }}
						/>
					</div>

					<div className="admin-table-container" style={{ overflowX: "auto" }}>
						<table className="admin-table" style={{ width: "100%", textAlign: "left", fontSize: "0.85rem", borderCollapse: "collapse" }}>
							<thead>
								<tr style={{ background: "#f8f9f4", borderBottom: "1px solid #e2e6d6" }}>
									<th style={{ padding: "10px 12px" }}>Affiliate Partner</th>
									<th style={{ padding: "10px 12px" }}>Code</th>
									<th style={{ padding: "10px 12px", textAlign: "center" }}>Users Referred</th>
									<th style={{ padding: "10px 12px", textAlign: "center" }}>Clicks</th>
									<th style={{ padding: "10px 12px", textAlign: "center" }}>Orders (Delivered)</th>
									<th style={{ padding: "10px 12px", textAlign: "right" }}>Total Sales</th>
									<th style={{ padding: "10px 12px", textAlign: "right" }}>Commission (Delivered)</th>
									<th style={{ padding: "10px 12px", textAlign: "right" }}>Commission (Pending)</th>
									<th style={{ padding: "10px 12px", textAlign: "center" }}>Action</th>
								</tr>
							</thead>
							<tbody>
								{filteredAffiliates.map((aff) => (
									<tr key={aff.id} style={{ borderBottom: "1px solid #eee" }}>
										<td style={{ padding: "10px 12px" }}>
											<div style={{ fontWeight: 600, color: "#222" }}>{aff.name}</div>
											<div style={{ fontSize: "0.78rem", color: "#777" }}>{aff.email}</div>
										</td>
										<td style={{ padding: "10px 12px" }}>
											<span style={{ fontFamily: "monospace", fontWeight: 700, padding: "2px 6px", background: "#f0f4ea", borderRadius: "4px", color: "#3d4a20" }}>
												{aff.referralCode}
											</span>
										</td>
										<td style={{ padding: "10px 12px", textAlign: "center", fontWeight: 600 }}>{aff.totalUsersReferred}</td>
										<td style={{ padding: "10px 12px", textAlign: "center", color: "#4a5c22", fontWeight: 700 }}>{aff.totalClicks}</td>
										<td style={{ padding: "10px 12px", textAlign: "center" }}>
											<strong>{aff.deliveredOrders}</strong> / {aff.totalOrders}
										</td>
										<td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 600 }}>₹{aff.totalSalesGenerated.toLocaleString("en-IN")}</td>
										<td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 700, color: "#1c542e" }}>₹{aff.totalEarnedDelivered.toLocaleString("en-IN")}</td>
										<td style={{ padding: "10px 12px", textAlign: "right", color: "#b4690e" }}>₹{aff.totalEarnedPending.toLocaleString("en-IN")}</td>
										<td style={{ padding: "10px 12px", textAlign: "center" }}>
											<button
												type="button"
												className="admin-btn admin-btn--outline"
												style={{ fontSize: "0.75rem", padding: "4px 8px" }}
												onClick={() => handleOpenCreateCoupon(aff.id)}
											>
												+ Issue Coupon
											</button>
										</td>
									</tr>
								))}

								{filteredAffiliates.length === 0 && (
									<tr>
										<td colSpan={9} style={{ textAlign: "center", padding: "2rem", color: "#888" }}>
											No affiliate partners found matching search.
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</div>
			)}

			{/* ── SUB TAB 2: COMMISSIONS & ORDERS ── */}
			{activeSubTab === "commissions" && (
				<div className="admin-card" style={{ padding: "1.2rem", background: "#fff", border: "1px solid #e2e6d6", borderRadius: "8px" }}>
					<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.8rem" }}>
						<h3 style={{ margin: 0, fontSize: "1.1rem", color: "#3d4a20" }}>All Referred Order Transactions</h3>
						<input
							type="text"
							placeholder="Search order ID, affiliate, customer..."
							value={searchCommission}
							onChange={(e) => setSearchCommission(e.target.value)}
							style={{ padding: "0.5rem 0.8rem", border: "1px solid #cbd5b5", borderRadius: "6px", fontSize: "0.85rem", width: "260px" }}
						/>
					</div>

					<div className="admin-table-container" style={{ overflowX: "auto" }}>
						<table className="admin-table" style={{ width: "100%", textAlign: "left", fontSize: "0.85rem", borderCollapse: "collapse" }}>
							<thead>
								<tr style={{ background: "#f8f9f4", borderBottom: "1px solid #e2e6d6" }}>
									<th style={{ padding: "10px 12px" }}>Order ID</th>
									<th style={{ padding: "10px 12px" }}>Affiliate Partner</th>
									<th style={{ padding: "10px 12px" }}>Customer</th>
									<th style={{ padding: "10px 12px" }}>Product / Coupon Used</th>
									<th style={{ padding: "10px 12px", textAlign: "right" }}>Order Amount</th>
									<th style={{ padding: "10px 12px", textAlign: "right" }}>Commission (10%)</th>
									<th style={{ padding: "10px 12px", textAlign: "center" }}>Status</th>
									<th style={{ padding: "10px 12px" }}>Date</th>
								</tr>
							</thead>
							<tbody>
								{filteredCommissions.map((c) => (
									<tr key={c.id} style={{ borderBottom: "1px solid #eee" }}>
										<td style={{ padding: "10px 12px", fontFamily: "monospace", fontWeight: 600 }}>{c.orderId}</td>
										<td style={{ padding: "10px 12px" }}>
											<div style={{ fontWeight: 600 }}>{c.affiliateName}</div>
											<span style={{ fontSize: "0.75rem", color: "#777" }}>Code: {c.affiliateCode}</span>
										</td>
										<td style={{ padding: "10px 12px" }}>{c.referredUserName}</td>
										<td style={{ padding: "10px 12px" }}>
											{c.couponCode ? (
												<span style={{ padding: "2px 6px", background: "#f7eed7", color: "#8a5806", borderRadius: "4px", fontSize: "0.78rem", fontWeight: 700 }}>
													🎟️ {c.couponCode}
												</span>
											) : c.productTitle ? (
												<span style={{ color: "#3d4a20", fontSize: "0.82rem" }}>📦 {c.productTitle}</span>
											) : (
												<span style={{ color: "#888", fontSize: "0.78rem" }}>General Store Link</span>
											)}
										</td>
										<td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 600 }}>₹{c.orderAmount.toLocaleString("en-IN")}</td>
										<td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 700, color: "#1c542e" }}>₹{c.commission.toLocaleString("en-IN")}</td>
										<td style={{ padding: "10px 12px", textAlign: "center" }}>
											<span
												style={{
													padding: "3px 8px",
													borderRadius: "12px",
													fontSize: "0.75rem",
													fontWeight: 600,
													background: c.status === "delivered" || c.status === "approved" || c.status === "paid" ? "#e6f4ea" : c.status === "cancelled" ? "#fce8e6" : "#fef7e0",
													color: c.status === "delivered" || c.status === "approved" || c.status === "paid" ? "#137333" : c.status === "cancelled" ? "#c5221f" : "#b06000",
												}}
											>
												{c.status.toUpperCase()}
											</span>
										</td>
										<td style={{ padding: "10px 12px", fontSize: "0.8rem", color: "#666" }}>
											{new Date(c.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
										</td>
									</tr>
								))}

								{filteredCommissions.length === 0 && (
									<tr>
										<td colSpan={8} style={{ textAlign: "center", padding: "2rem", color: "#888" }}>
											No affiliate orders recorded yet.
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</div>
			)}

			{/* ── SUB TAB 3: AFFILIATE PROMO COUPONS ── */}
			{activeSubTab === "coupons" && (
				<div className="admin-card" style={{ padding: "1.2rem", background: "#fff", border: "1px solid #e2e6d6", borderRadius: "8px" }}>
					<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.8rem" }}>
						<div>
							<h3 style={{ margin: 0, fontSize: "1.1rem", color: "#3d4a20" }}>Affiliate-Dedicated Coupons</h3>
							<p style={{ margin: "2px 0 0", fontSize: "0.8rem", color: "#666" }}>
								These coupons are linked directly to affiliate partners and will <strong>NOT</strong> appear on the public coupons page.
							</p>
						</div>
						<div style={{ display: "flex", gap: "0.8rem" }}>
							<input
								type="text"
								placeholder="Search coupon code or partner..."
								value={searchCoupon}
								onChange={(e) => setSearchCoupon(e.target.value)}
								style={{ padding: "0.5rem 0.8rem", border: "1px solid #cbd5b5", borderRadius: "6px", fontSize: "0.85rem", width: "240px" }}
							/>
							<button
								type="button"
								className="admin-btn admin-btn--primary"
								onClick={() => handleOpenCreateCoupon()}
								style={{ background: "#4a5c22", color: "#f5e6b8", fontWeight: 600, fontSize: "0.82rem" }}
							>
								+ New Coupon
							</button>
						</div>
					</div>

					<div className="admin-table-container" style={{ overflowX: "auto" }}>
						<table className="admin-table" style={{ width: "100%", textAlign: "left", fontSize: "0.85rem", borderCollapse: "collapse" }}>
							<thead>
								<tr style={{ background: "#f8f9f4", borderBottom: "1px solid #e2e6d6" }}>
									<th style={{ padding: "10px 12px" }}>Coupon Code</th>
									<th style={{ padding: "10px 12px" }}>Assigned Affiliate</th>
									<th style={{ padding: "10px 12px" }}>Discount</th>
									<th style={{ padding: "10px 12px" }}>Applicable Scope</th>
									<th style={{ padding: "10px 12px", textAlign: "center" }}>Min Order / Limit</th>
									<th style={{ padding: "10px 12px", textAlign: "center" }}>Times Used</th>
									<th style={{ padding: "10px 12px" }}>Expiry</th>
									<th style={{ padding: "10px 12px", textAlign: "center" }}>Action</th>
								</tr>
							</thead>
							<tbody>
								{filteredCoupons.map((cp) => (
									<tr key={cp.id} style={{ borderBottom: "1px solid #eee" }}>
										<td style={{ padding: "10px 12px" }}>
											<span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: "0.95rem", color: "#4a5c22" }}>{cp.code}</span>
											<div style={{ fontSize: "0.78rem", color: "#777" }}>{cp.name}</div>
										</td>
										<td style={{ padding: "10px 12px" }}>
											{cp.affiliateUser ? (
												<div>
													<div style={{ fontWeight: 600 }}>{cp.affiliateUser.name}</div>
													<div style={{ fontSize: "0.75rem", color: "#888" }}>Code: {cp.affiliateUser.referralCode}</div>
												</div>
											) : (
												<span style={{ color: "#999" }}>Unassigned</span>
											)}
										</td>
										<td style={{ padding: "10px 12px" }}>
											<span style={{ fontWeight: 700, color: "#2e6024" }}>
												{cp.discountType === "fixed" ? `₹${cp.discountValue} OFF` : `${cp.discountValue}% OFF`}
											</span>
											{cp.maxDiscount ? <div style={{ fontSize: "0.75rem", color: "#888" }}>Up to ₹{cp.maxDiscount}</div> : null}
										</td>
										<td style={{ padding: "10px 12px" }}>
											{cp.applicableProducts && cp.applicableProducts.length > 0 ? (
												<span style={{ fontSize: "0.78rem", background: "#f0f4ea", padding: "2px 6px", borderRadius: "4px" }}>
													{cp.applicableProducts.length} Product(s)
												</span>
											) : cp.applicableCategories && cp.applicableCategories.length > 0 ? (
												<span style={{ fontSize: "0.78rem", background: "#f5efe1", padding: "2px 6px", borderRadius: "4px" }}>
													{cp.applicableCategories.length} Category(ies)
												</span>
											) : (
												<span style={{ fontSize: "0.78rem", color: "#777" }}>All Store Products</span>
											)}
										</td>
										<td style={{ padding: "10px 12px", textAlign: "center" }}>
											<div style={{ fontSize: "0.8rem" }}>Min: ₹{cp.minOrderValue}</div>
											<div style={{ fontSize: "0.75rem", color: "#888" }}>Limit: {cp.usageLimit}</div>
										</td>
										<td style={{ padding: "10px 12px", textAlign: "center", fontWeight: 700 }}>{cp.usedCount || 0}</td>
										<td style={{ padding: "10px 12px", fontSize: "0.8rem", color: "#666" }}>
											{cp.expiryDate ? new Date(cp.expiryDate).toLocaleDateString("en-IN") : "Never"}
										</td>
										<td style={{ padding: "10px 12px", textAlign: "center" }}>
											<button
												type="button"
												className="admin-btn admin-btn--danger"
												style={{ fontSize: "0.75rem", padding: "4px 8px", background: "#d32f2f", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
												onClick={() => {
													if (confirm(`Are you sure you want to delete affiliate coupon "${cp.code}"?`)) {
														void onDeleteCoupon(cp.id);
													}
												}}
											>
												Delete
											</button>
										</td>
									</tr>
								))}

								{filteredCoupons.length === 0 && (
									<tr>
										<td colSpan={8} style={{ textAlign: "center", padding: "2rem", color: "#888" }}>
											No affiliate coupons found. Click &quot;+ New Coupon&quot; to issue one.
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</div>
			)}

			{/* ── CREATE AFFILIATE COUPON MODAL ── */}
			{showCouponModal && (
				<div
					className="admin-modal-backdrop"
					style={{
						position: "fixed",
						inset: 0,
						background: "rgba(0,0,0,0.5)",
						zIndex: 9999,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						padding: "1rem",
					}}
					onClick={() => setShowCouponModal(false)}
				>
					<div
						className="admin-modal"
						style={{
							background: "#fff",
							borderRadius: "8px",
							width: "100%",
							maxWidth: "600px",
							maxHeight: "90vh",
							overflowY: "auto",
							padding: "1.5rem",
							boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
						}}
						onClick={(e) => e.stopPropagation()}
					>
						<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
							<h3 style={{ margin: 0, fontSize: "1.2rem", color: "#3d4a20" }}>Issue Affiliate Promo Coupon</h3>
							<button
								type="button"
								onClick={() => setShowCouponModal(false)}
								style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer", color: "#666" }}
							>
								✕
							</button>
						</div>

						{couponError && (
							<div style={{ padding: "0.6rem 0.8rem", background: "#fde8e8", color: "#c5221f", borderRadius: "6px", marginBottom: "1rem", fontSize: "0.85rem" }}>
								{couponError}
							</div>
						)}

						<form onSubmit={handleSubmitCoupon} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
							{/* Affiliate Partner Selection */}
							<div>
								<label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#444", marginBottom: "4px" }}>
									Select Affiliate Partner *
								</label>
								<select
									value={couponForm.affiliateUserId}
									onChange={(e) => setCouponForm({ ...couponForm, affiliateUserId: e.target.value })}
									style={{ width: "100%", padding: "0.6rem", border: "1px solid #cbd5b5", borderRadius: "6px", fontSize: "0.9rem" }}
									required
								>
									<option value="">-- Choose an Affiliate --</option>
									{affiliates.map((a) => (
										<option key={a.id} value={a.id}>
											{a.name} ({a.email}) - Code: {a.referralCode}
										</option>
									))}
								</select>
							</div>

							<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
								<div>
									<label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#444", marginBottom: "4px" }}>
										Coupon Code *
									</label>
									<input
										type="text"
										placeholder="e.g. SPECIAL10"
										value={couponForm.code}
										onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
										style={{ width: "100%", padding: "0.6rem", border: "1px solid #cbd5b5", borderRadius: "6px", fontSize: "0.9rem", textTransform: "uppercase", fontFamily: "monospace", fontWeight: 700 }}
										required
									/>
								</div>

								<div>
									<label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#444", marginBottom: "4px" }}>
										Offer / Title Name
									</label>
									<input
										type="text"
										placeholder="e.g. Partner Special 10%"
										value={couponForm.name}
										onChange={(e) => setCouponForm({ ...couponForm, name: e.target.value })}
										style={{ width: "100%", padding: "0.6rem", border: "1px solid #cbd5b5", borderRadius: "6px", fontSize: "0.9rem" }}
									/>
								</div>
							</div>

							<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
								<div>
									<label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#444", marginBottom: "4px" }}>
										Discount Type
									</label>
									<select
										value={couponForm.discountType}
										onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value as any })}
										style={{ width: "100%", padding: "0.6rem", border: "1px solid #cbd5b5", borderRadius: "6px", fontSize: "0.9rem" }}
									>
										<option value="percentage">Percentage Off (%)</option>
										<option value="fixed">Flat Amount Off (₹)</option>
									</select>
								</div>

								<div>
									<label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#444", marginBottom: "4px" }}>
										Discount Value * ({couponForm.discountType === "percentage" ? "%" : "₹"})
									</label>
									<input
										type="number"
										value={couponForm.discountValue}
										onChange={(e) => setCouponForm({ ...couponForm, discountValue: e.target.value })}
										min="1"
										max={couponForm.discountType === "percentage" ? "100" : undefined}
										style={{ width: "100%", padding: "0.6rem", border: "1px solid #cbd5b5", borderRadius: "6px", fontSize: "0.9rem" }}
										required
									/>
								</div>
							</div>

							<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
								<div>
									<label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#444", marginBottom: "4px" }}>
										Min Order Value (₹)
									</label>
									<input
										type="number"
										placeholder="0"
										value={couponForm.minOrderValue}
										onChange={(e) => setCouponForm({ ...couponForm, minOrderValue: e.target.value })}
										min="0"
										style={{ width: "100%", padding: "0.6rem", border: "1px solid #cbd5b5", borderRadius: "6px", fontSize: "0.9rem" }}
									/>
								</div>

								<div>
									<label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#444", marginBottom: "4px" }}>
										Usage Limit
									</label>
									<input
										type="number"
										placeholder="9999"
										value={couponForm.usageLimit}
										onChange={(e) => setCouponForm({ ...couponForm, usageLimit: e.target.value })}
										min="1"
										style={{ width: "100%", padding: "0.6rem", border: "1px solid #cbd5b5", borderRadius: "6px", fontSize: "0.9rem" }}
									/>
								</div>
							</div>

							<div>
								<label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#444", marginBottom: "4px" }}>
									Expiry Date (Optional)
								</label>
								<input
									type="date"
									value={couponForm.expiryDate}
									onChange={(e) => setCouponForm({ ...couponForm, expiryDate: e.target.value })}
									style={{ width: "100%", padding: "0.6rem", border: "1px solid #cbd5b5", borderRadius: "6px", fontSize: "0.9rem" }}
								/>
							</div>

							{/* Applicable Categories Targeting */}
							<div>
								<label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#444", marginBottom: "4px" }}>
									Restrict to Specific Categories (Optional - leave empty for entire store)
								</label>
								<div style={{ display: "flex", flexWrap: "wrap", gap: "6px", maxHeight: "100px", overflowY: "auto", padding: "6px", border: "1px solid #cbd5b5", borderRadius: "6px", background: "#fcfcfb" }}>
									{categories.map((cat) => {
										const isChecked = couponForm.applicableCategories.includes(cat._id);
										return (
											<button
												key={cat._id}
												type="button"
												onClick={() => setCouponForm({ ...couponForm, applicableCategories: toggleItem(couponForm.applicableCategories, cat._id) })}
												style={{
													fontSize: "0.78rem",
													padding: "4px 8px",
													borderRadius: "4px",
													border: `1px solid ${isChecked ? "#4a5c22" : "#ccc"}`,
													background: isChecked ? "#e8ede0" : "#fff",
													color: isChecked ? "#3d4a20" : "#555",
													fontWeight: isChecked ? 600 : 400,
													cursor: "pointer",
												}}
											>
												{isChecked ? "✓ " : ""}{cat.name}
											</button>
										);
									})}
								</div>
							</div>

							{/* Applicable Products Targeting */}
							<div>
								<label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#444", marginBottom: "4px" }}>
									Restrict to Specific Products (Optional - leave empty for entire store)
								</label>
								<div style={{ display: "flex", flexWrap: "wrap", gap: "6px", maxHeight: "120px", overflowY: "auto", padding: "6px", border: "1px solid #cbd5b5", borderRadius: "6px", background: "#fcfcfb" }}>
									{products.slice(0, 40).map((prod) => {
										const isChecked = couponForm.applicableProducts.includes(prod._id);
										return (
											<button
												key={prod._id}
												type="button"
												onClick={() => setCouponForm({ ...couponForm, applicableProducts: toggleItem(couponForm.applicableProducts, prod._id) })}
												style={{
													fontSize: "0.75rem",
													padding: "3px 6px",
													borderRadius: "4px",
													border: `1px solid ${isChecked ? "#4a5c22" : "#ccc"}`,
													background: isChecked ? "#e8ede0" : "#fff",
													color: isChecked ? "#3d4a20" : "#555",
													fontWeight: isChecked ? 600 : 400,
													cursor: "pointer",
												}}
											>
												{isChecked ? "✓ " : ""}{prod.title}
											</button>
										);
									})}
								</div>
							</div>

							<div style={{ display: "flex", justifyContent: "flex-end", gap: "0.8rem", marginTop: "0.5rem" }}>
								<button
									type="button"
									className="admin-btn admin-btn--outline"
									onClick={() => setShowCouponModal(false)}
									disabled={savingCoupon}
								>
									Cancel
								</button>
								<button
									type="submit"
									className="admin-btn admin-btn--primary"
									disabled={savingCoupon}
									style={{ background: "#4a5c22", color: "#f5e6b8", fontWeight: 600 }}
								>
									{savingCoupon ? "Issuing Coupon..." : "Issue Coupon"}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</section>
	);
}
