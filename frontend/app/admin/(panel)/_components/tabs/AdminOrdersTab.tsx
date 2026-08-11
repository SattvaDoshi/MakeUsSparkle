import { useState, useMemo, useCallback, useEffect } from "react";
import { apiRequest } from "@/lib/api";
import type { AdminOrder, Warehouse } from "../../_lib/admin.types";
import { formatAddress, formatDateTime, formatMoney, formatShortId, normalizeOrderStatus, normalizePaymentStatus } from "../../_lib/admin.helpers";
import { listWarehouses, createShipment, trackShipment, cancelShipment, printLabel as fetchLabel } from "@/lib/shippingApi";

type AdminOrdersTabProps = {
	orders: AdminOrder[];
	onStatusChange: (orderId: string, status: NonNullable<AdminOrder["status"]>) => void;
	onDelete: (id: string) => void;
	onShippingUpdate?: (orderId: string, shipping: AdminOrder["shipping"]) => void;
};

const orderStatuses: Array<AdminOrder["status"]> = ["placed", "shipped", "delivered", "cancelled"];
const paymentStatuses = ["all", "pending", "paid", "partial_paid", "failed", "completed"];

/** Resolve the display name for an order item */
function getItemName(item: NonNullable<AdminOrder["items"]>[number]): string {
	if (item.name) return item.name;
	const p = item.product;
	if (p && typeof p === "object" && p !== null && "title" in p && p.title) return p.title as string;
	if (typeof p === "string" && p.length >= 6) return `Product …${p.slice(-6).toUpperCase()}`;
	const charms = item.selectedCharms?.length || 0;
	if (charms > 0) return `Custom Charm Jewellery (${charms} charm${charms === 1 ? "" : "s"})`;
	return "Custom Item";
}

/** Get image URL for an order item */
function getItemImage(item: NonNullable<AdminOrder["items"]>[number]): string {
	const p = item.product;
	if (p && typeof p === "object" && p !== null && "images" in p && Array.isArray((p as any).images)) {
		return (p as any).images[0] || "";
	}
	return "";
}

/** Format customData selections for display */
function formatSelections(customData?: { selections?: Record<string, string>; color?: string; size?: string; colorHex?: string; [key: string]: any }): string[] {
	if (!customData) return [];
	const lines: string[] = [];
	if (customData.selections) {
		for (const [k, v] of Object.entries(customData.selections)) {
			if (v && String(v).trim()) lines.push(`${k}: ${v}`);
		}
	}
	if (!lines.length) {
		if (customData.color && customData.color.trim()) lines.push(`Color: ${customData.color}`);
		if (customData.size && customData.size.trim()) lines.push(`Size: ${customData.size}`);
	}
	return lines;
}

export default function AdminOrdersTab({ orders, onStatusChange, onDelete, onShippingUpdate }: AdminOrdersTabProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [paymentFilter, setPaymentFilter] = useState("all");
	const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});

	// Warehouses — loaded once for the pickup dropdown
	const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
	const [warehousesLoaded, setWarehousesLoaded] = useState(false);

	const [cartBannerText, setCartBannerText] = useState("");
	const [isSavingBanner, setIsSavingBanner] = useState(false);

	useEffect(() => {
		apiRequest<{ success: boolean; cartBannerText: string }>("/admin/cart-banner")
			.then(res => {
				if (res.success && res.cartBannerText) setCartBannerText(res.cartBannerText);
			})
			.catch(console.error);
	}, []);

	const handleSaveBanner = async () => {
		setIsSavingBanner(true);
		try {
			await apiRequest("/admin/cart-banner", {
				method: "PUT",
				body: JSON.stringify({ cartBannerText })
			});
			alert("Cart banner text saved successfully!");
		} catch (error) {
			console.error("Failed to save cart banner text", error);
			alert("Failed to save cart banner text");
		} finally {
			setIsSavingBanner(false);
		}
	};

	const loadWarehouses = useCallback(async () => {
		if (warehousesLoaded) return;
		try {
			const res = await listWarehouses();
			const raw = res.data;
			const list: Warehouse[] = Array.isArray(raw)
				? raw
				: Array.isArray((raw as any)?.warehouse_list)
				? (raw as any).warehouse_list
				: [];
			setWarehouses(list);
		} catch { /* silently ignore */ }
		setWarehousesLoaded(true);
	}, [warehousesLoaded]);

	// Per-order shipping action state
	const [shippingBusy, setShippingBusy] = useState<Record<string, boolean>>({});
	const [shippingError, setShippingError] = useState<Record<string, string>>({});
	const [selectedWarehouse, setSelectedWarehouse] = useState<Record<string, string>>({});
	const [shippingOverride, setShippingOverride] = useState<Record<string, { weightKg: string; lengthCm: string; widthCm: string; heightCm: string }>>({});

	const getOverride = (id: string) => shippingOverride[id] ?? { weightKg: "", lengthCm: "", widthCm: "", heightCm: "" };
	const setOverride = (id: string, field: string, val: string) =>
		setShippingOverride((p) => ({ ...p, [id]: { ...getOverride(id), [field]: val } }));

	const setBusy = (id: string, b: boolean) => setShippingBusy((p) => ({ ...p, [id]: b }));
	const setErr  = (id: string, msg: string) => setShippingError((p) => ({ ...p, [id]: msg }));

	const handleCreateShipment = async (order: AdminOrder) => {
		setErr(order._id, "");
		const pickupId = selectedWarehouse[order._id] ||
			(warehouses[0]
				? String(warehouses[0].warehouse_id ?? warehouses[0].id ?? "")
				: "");
		const ov = getOverride(order._id);
		setBusy(order._id, true);
		try {
			const res = await createShipment(order._id, {
				pickupAddressId: pickupId || undefined,
				weightKg: ov.weightKg ? parseFloat(ov.weightKg) : undefined,
				lengthCm: ov.lengthCm ? parseFloat(ov.lengthCm) : undefined,
				widthCm:  ov.widthCm  ? parseFloat(ov.widthCm)  : undefined,
				heightCm: ov.heightCm ? parseFloat(ov.heightCm) : undefined,
			});
			if (res.success) onShippingUpdate?.(order._id, res.order?.shipping);
			else setErr(order._id, res.message || "Failed to create shipment.");
		} catch (e: unknown) {
			setErr(order._id, e instanceof Error ? e.message : "Failed to create shipment.");
		} finally { setBusy(order._id, false); }
	};

	const handleTrack = async (order: AdminOrder) => {
		setErr(order._id, "");
		setBusy(order._id, true);
		try {
			const res = await trackShipment(order._id);
			if (res.success) onShippingUpdate?.(order._id, res.shipping);
			else setErr(order._id, "Tracking failed.");
		} catch (e: unknown) {
			setErr(order._id, e instanceof Error ? e.message : "Tracking failed.");
		} finally { setBusy(order._id, false); }
	};

	const handleCancel = async (order: AdminOrder) => {
		if (!window.confirm(`Cancel shipment for order ${formatShortId(order._id)}? This cannot be undone.`)) return;
		setErr(order._id, "");
		setBusy(order._id, true);
		try {
			const res = await cancelShipment(order._id);
			if (!res.success) setErr(order._id, res.message || "Failed to cancel.");
			else onShippingUpdate?.(order._id, { ...(order.shipping ?? {}), cancelStatus: "Cancelled", currentStatus: "Cancelled" });
		} catch (e: unknown) {
			setErr(order._id, e instanceof Error ? e.message : "Failed to cancel.");
		} finally { setBusy(order._id, false); }
	};

	const handlePrintLabel = async (order: AdminOrder) => {
		setErr(order._id, "");
		setBusy(order._id, true);
		try {
			const res = await fetchLabel(order._id);
			if (res.labelUrl) window.open(res.labelUrl, "_blank");
			else setErr(order._id, "Label URL not available.");
		} catch (e: unknown) {
			setErr(order._id, e instanceof Error ? e.message : "Label fetch failed.");
		} finally { setBusy(order._id, false); }
	};

	const toggleExpand = (id: string) => {
		void loadWarehouses();
		setExpandedOrders(prev => ({ ...prev, [id]: !prev[id] }));
	};

	const filteredOrders = useMemo(() => {
		return orders.filter(order => {
			const q = searchQuery.toLowerCase();
			const matchesSearch = !q
				|| order._id?.toLowerCase().includes(q)
				|| order.user?.name?.toLowerCase().includes(q)
				|| order.user?.email?.toLowerCase().includes(q)
				|| order.phonePeOrderId?.toLowerCase().includes(q)
				|| order.discountCode?.toLowerCase().includes(q);

			const matchesStatus = statusFilter === "all" || normalizeOrderStatus(order.status) === statusFilter;

			const pStatus = normalizePaymentStatus(order.paymentStatus);
			const matchesPayment = paymentFilter === "all" || pStatus === paymentFilter;

			return matchesSearch && matchesStatus && matchesPayment;
		});
	}, [orders, searchQuery, statusFilter, paymentFilter]);

	return (
		<section className="admin-content">
			<style>{`
				.ao-card {
					background: white; border: 1px solid rgba(61,74,34,0.10); border-radius: 14px;
					margin-bottom: 14px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.03);
					transition: box-shadow 0.2s;
				}
				.ao-card:hover { box-shadow: 0 4px 20px rgba(61,74,34,0.10); }
				.ao-header {
					display: grid; grid-template-columns: 110px 1fr 120px 150px 140px auto;
					gap: 14px; padding: 16px 20px; align-items: center; cursor: pointer;
					background: #fdfdfd; transition: background 0.2s;
				}
				.ao-header:hover { background: #f9fbf4; }

				.ao-col { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
				.ao-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: var(--mist); font-weight: 600; white-space: nowrap; }
				.ao-val { font-size: 13px; color: var(--ink); font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
				.ao-val-sub { font-size: 11.5px; color: var(--mist); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

				.ao-badge {
					display: inline-flex; align-items: center; padding: 3px 8px; border-radius: 20px;
					font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;
					white-space: nowrap;
				}
				.ao-badge-paid { background: #e8f5e9; color: #2e7d32; }
				.ao-badge-partial { background: #fff8e1; color: #f57f17; }
				.ao-badge-pending { background: #fff3cd; color: #856404; }
				.ao-badge-failed { background: #ffebee; color: #c62828; }
				.ao-badge-completed { background: #e3f2fd; color: #1565c0; }

				.ao-status-badge {
					display: inline-flex; align-items: center; padding: 3px 8px; border-radius: 20px;
					font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em;
					white-space: nowrap;
				}
				.ao-status-placed { background: #e8f5e9; color: #2e7d32; }
				.ao-status-shipped { background: #e3f2fd; color: #1565c0; }
				.ao-status-delivered { background: #f3e5f5; color: #6a1b9a; }
				.ao-status-cancelled { background: #ffebee; color: #c62828; }

				.ao-expand-btn {
					background: none; border: none; cursor: pointer; padding: 8px;
					color: var(--mist); display: flex; align-items: center; justify-content: center;
					border-radius: 8px; transition: background 0.15s;
				}
				.ao-expand-btn:hover { background: #f0f4e8; color: var(--olive-900); }
				.ao-expand-btn svg { width: 18px; height: 18px; transition: transform 0.2s; }
				.ao-expand-btn.expanded svg { transform: rotate(180deg); }

				.ao-body {
					border-top: 1px solid rgba(61,74,34,0.08); padding: 20px 24px; background: #fafbf7;
					display: grid; grid-template-columns: 300px 1fr; gap: 28px;
				}

				.ao-section-title { font-size: 11px; text-transform: uppercase; letter-spacing: 0.09em; color: var(--olive-600); font-weight: 700; margin-bottom: 12px; }

				.ao-detail-card {
					background: white; border: 1px solid #eaeaea; border-radius: 10px; padding: 16px; margin-bottom: 12px;
				}
				.ao-detail-row { display: flex; gap: 6px; font-size: 12.5px; margin-bottom: 6px; align-items: baseline; }
				.ao-detail-row:last-child { margin-bottom: 0; }
				.ao-detail-label { color: var(--mist); font-size: 11px; text-transform: uppercase; font-weight: 600; min-width: 90px; }
				.ao-detail-val { color: var(--ink); font-size: 13px; word-break: break-word; }

				.ao-tag { display: inline-flex; padding: 2px 7px; border-radius: 12px; font-size: 10.5px; font-weight: 600; }
				.ao-tag-green { background: #e8f5e9; color: #2e7d32; }
				.ao-tag-blue { background: #e3f2fd; color: #1565c0; }
				.ao-tag-amber { background: #fff8e1; color: #e65100; }
				.ao-tag-gift { background: linear-gradient(135deg, #fce4ec, #f8bbd0); color: #880e4f; }
				.ao-tag-discount { background: #f3e5f5; color: #6a1b9a; }

				.ao-items-table { width: 100%; border-collapse: collapse; font-size: 13px; }
				.ao-items-table th { text-align: left; padding: 9px 12px; color: var(--mist); font-size: 10.5px; text-transform: uppercase; border-bottom: 1px solid #eaeaea; letter-spacing: 0.05em; font-weight: 700; }
				.ao-items-table td { padding: 12px; border-bottom: 1px solid #f5f5f5; vertical-align: top; }
				.ao-items-table tr:last-child td { border-bottom: none; }

				.ao-item-img { width: 46px; height: 46px; object-fit: cover; border-radius: 8px; background: #f4f4f4; border: 1px solid #eee; }
				.ao-item-img-placeholder { width: 46px; height: 46px; border-radius: 8px; background: linear-gradient(135deg, #f0f4e8, #e8ecde); display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }

				.ao-item-name { font-weight: 600; color: var(--olive-900); font-size: 13px; margin-bottom: 3px; }
				.ao-item-category { font-size: 11px; color: var(--mist); margin-bottom: 6px; }

				.ao-nested {
					margin-top: 10px; padding: 10px 12px; border-left: 2px solid #d1e4c8;
					background: #f7fbf4; border-radius: 0 8px 8px 0;
					display: flex; flex-direction: column; gap: 8px;
				}
				.ao-nested-title { font-size: 10px; color: var(--olive-600); text-transform: uppercase; font-weight: 700; letter-spacing: 0.07em; margin-bottom: 4px; }
				.ao-nested-item { display: flex; align-items: flex-start; gap: 8px; font-size: 12px; }
				.ao-nested-img { width: 28px; height: 28px; object-fit: cover; border-radius: 5px; background: #eee; flex-shrink: 0; }
				.ao-nested-content { flex: 1; }
				.ao-nested-name { font-weight: 500; color: var(--ink); }
				.ao-nested-price { font-weight: 600; color: var(--olive-600); }
				.ao-nested-selections { margin-top: 3px; display: flex; flex-wrap: wrap; gap: 4px; }
				.ao-selection-chip { font-size: 10px; background: #e8f0e0; color: #3d4a22; padding: 2px 7px; border-radius: 10px; font-weight: 500; }

				.ao-financials { background: white; border: 1px solid #eaeaea; border-radius: 10px; overflow: hidden; }
				.ao-fin-row { display: flex; justify-content: space-between; padding: 9px 16px; font-size: 13px; border-bottom: 1px solid #f5f5f5; }
				.ao-fin-row:last-child { border-bottom: none; }
				.ao-fin-row.total { font-weight: 700; background: #f9fbf4; }
				.ao-fin-label { color: var(--mist); }
				.ao-fin-val { color: var(--ink); font-weight: 500; }
				.ao-fin-val.red { color: #c62828; }
				.ao-fin-val.green { color: #2e7d32; }

				/* ── Shipping Panel ─────────────────────────────────── */
				.ao-ship-card { background: #f0f7ef; border: 1px solid #c8e6c9; border-radius: 10px; padding: 14px; margin-top: 4px; }
				.ao-ship-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #2e7d32; margin-bottom: 10px; display: flex; align-items: center; gap: 6px; }
				.ao-ship-row { display: flex; gap: 8px; font-size: 12px; margin-bottom: 5px; align-items: baseline; }
				.ao-ship-row strong { min-width: 80px; color: var(--ink); font-weight: 600; }
				.ao-ship-row span { color: var(--mist); }
				.ao-ship-btn-row { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
				.ao-ship-btn {
					padding: 7px 12px; border-radius: 7px; border: none; font-size: 12px; font-weight: 700;
					cursor: pointer; transition: opacity 0.15s, transform 0.1s;
				}
				.ao-ship-btn:active { transform: scale(0.97); }
				.ao-ship-btn:disabled { opacity: 0.5; cursor: not-allowed; }
				.ao-ship-btn-green  { background: #2e7d32; color: white; }
				.ao-ship-btn-blue   { background: #1565c0; color: white; }
				.ao-ship-btn-orange { background: #e65100; color: white; }
				.ao-ship-btn-red    { background: #c62828; color: white; }
				.ao-ship-select { width: 100%; padding: 7px 10px; border: 1px solid #c8e6c9; border-radius: 7px; font-size: 13px; background: white; margin-bottom: 6px; outline: none; }
				.ao-ship-override { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin: 8px 0; }
				.ao-ship-override input { padding: 6px 8px; border: 1px solid #c8e6c9; border-radius: 7px; font-size: 12px; width: 100%; box-sizing: border-box; outline: none; }
				.ao-ship-err { color: #c62828; font-size: 12px; margin-top: 6px; }
				.ao-ship-awb-link { color: #1565c0; font-size: 12px; text-decoration: underline; word-break: break-all; }

				@media (max-width: 1200px) {
					.ao-header { grid-template-columns: 100px 1fr 110px 130px auto; }
					.ao-col-created { display: none; }
					.ao-body { grid-template-columns: 1fr; gap: 16px; }
				}
				@media (max-width: 900px) {
					.ao-header { grid-template-columns: 90px 1fr 100px auto; }
					.ao-col-payment, .ao-col-status { display: none; }
				}
			`}</style>

			<div className="admin-panel">
				<h2>Orders <span style={{ fontSize: 16, color: "var(--mist)", fontWeight: 400 }}>({filteredOrders.length})</span></h2>

				<div style={{ background: "white", padding: "16px 20px", borderRadius: 12, border: "1px solid #eaeaea", marginBottom: 20 }}>
					<h3 style={{ fontSize: 14, marginBottom: 8, color: "var(--olive-900)" }}>Cart Banner Settings</h3>
					<p style={{ fontSize: 12, color: "var(--mist)", marginBottom: 12 }}>
						Configure the text that replaces the progress bar on the cart page and cart drawer.
					</p>
					<div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
						<input 
							type="text" 
							placeholder="e.g. Free Gift on ₹1700!" 
							value={cartBannerText} 
							onChange={(e) => setCartBannerText(e.target.value)} 
							style={{ flex: 1, minWidth: "200px", padding: "10px 14px", border: "1px solid #d4d4c8", borderRadius: 8, fontSize: 13, outline: "none" }} 
						/>
						<button 
							type="button"
							onClick={handleSaveBanner} 
							disabled={isSavingBanner}
							style={{ flexShrink: 0, padding: "10px 20px", background: "#1a1f0d", color: "#ffffff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: isSavingBanner ? "not-allowed" : "pointer", opacity: isSavingBanner ? 0.7 : 1 }}
						>
							{isSavingBanner ? "Saving..." : "Save Banner"}
						</button>
					</div>
				</div>

				<div className="admin-controls">
					<input
						type="text"
						className="admin-search"
						placeholder="Search by Order ID, Customer, Email, Payment ID, Coupon…"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>

					<select className="admin-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
						<option value="all">All Statuses</option>
						{orderStatuses.map(s => <option key={s} value={s}>{s?.toUpperCase()}</option>)}
					</select>

					<select className="admin-filter" value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}>
						{paymentStatuses.map(s => <option key={s} value={s}>{s === "all" ? "All Payments" : s.replace(/_/g, " ").toUpperCase()}</option>)}
					</select>
				</div>

				<div className="ao-list">
					{filteredOrders.length === 0 ? (
						<div style={{ textAlign: "center", padding: "60px 40px", color: "var(--mist)" }}>
							<div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
							<div style={{ fontSize: 15, fontWeight: 500 }}>No orders found</div>
						</div>
					) : (
						filteredOrders.map((order) => {
							const isExpanded = !!expandedOrders[order._id];
							const pStatus = normalizePaymentStatus(order.paymentStatus);
							const oStatus = normalizeOrderStatus(order.status);

							const payBadgeClass =
								pStatus === "paid" ? "ao-badge-paid"
								: pStatus === "partial_paid" ? "ao-badge-partial"
								: pStatus === "failed" ? "ao-badge-failed"
								: "ao-badge-pending";

							const statusBadgeClass =
								oStatus === "shipped" ? "ao-status-shipped"
								: oStatus === "delivered" ? "ao-status-delivered"
								: oStatus === "cancelled" ? "ao-status-cancelled"
								: "ao-status-placed";

							const hasDiscount = (order.discountAmount ?? 0) > 0 || (order.autoDiscountAmount ?? 0) > 0;
							const hasRewardPoints = (order.rewardPointsRedeemed ?? 0) > 0;

							return (
								<div className="ao-card" key={order._id}>
									{/* ── HEADER ROW ── */}
									<div className="ao-header" onClick={() => toggleExpand(order._id)}>
										{/* Order ID + date */}
										<div className="ao-col">
											<span className="ao-label">Order ID</span>
											<span className="ao-val" style={{ fontFamily: "monospace", fontSize: 12 }}>{formatShortId(order._id)}</span>
											<span className="ao-val-sub">{formatDateTime(order.createdAt)}</span>
										</div>

										{/* Customer */}
										<div className="ao-col">
											<span className="ao-label">Customer</span>
											<span className="ao-val">{order.user?.name || "—"}</span>
											<span className="ao-val-sub">{order.user?.email || "—"}</span>
										</div>

										{/* Amount */}
										<div className="ao-col">
											<span className="ao-label">Total</span>
											<span className="ao-val">₹{Math.round(order.totalAmount || 0).toLocaleString("en-IN")}</span>
											{order.paymentMode === "PARTIAL_COD" && (
												<span className="ao-val-sub" style={{ color: "#e65100" }}>Bal: ₹{Math.round(order.balanceAmount || 0).toLocaleString("en-IN")}</span>
											)}
										</div>

										{/* Payment */}
										<div className="ao-col ao-col-payment">
											<span className="ao-label">Payment</span>
											<span style={{ fontSize: 11, color: "var(--mist)", marginBottom: 2 }}>
												{order.paymentMode?.replace(/_/g, " ") || "—"}
											</span>
											<span className={`ao-badge ${payBadgeClass}`}>
												{pStatus.replace(/_/g, " ")}
											</span>
										</div>

										{/* Status + change */}
										<div className="ao-col ao-col-status" onClick={(e) => e.stopPropagation()}>
											<span className="ao-label">Status</span>
											<span className={`ao-status-badge ${statusBadgeClass}`} style={{ marginBottom: 4, width: "fit-content" }}>{oStatus}</span>
											<select
												style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid #ccc", fontSize: 11, outline: "none", cursor: "pointer", fontWeight: 600, width: "100%", maxWidth: 130 }}
												value={oStatus}
												onChange={(e) => onStatusChange(order._id, e.target.value as NonNullable<AdminOrder["status"]>)}
											>
												{orderStatuses.map((s) => <option key={s} value={s}>{s?.toUpperCase()}</option>)}
											</select>
										</div>

										<button className={`ao-expand-btn ${isExpanded ? "expanded" : ""}`} aria-label="Expand Order">
											<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
												<polyline points="6 9 12 15 18 9"></polyline>
											</svg>
										</button>
									</div>

									{/* ── EXPANDED BODY ── */}
									{isExpanded && (
										<div className="ao-body">
											{/* ── LEFT COLUMN: Order details + shipping ── */}
											<div className="ao-sidebar">
												<h4 className="ao-section-title">Order Details</h4>

												<div className="ao-detail-card">
													{/* Tags row */}
													<div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
														<span className={`ao-tag ao-tag-${order.paymentMode === "COD" ? "amber" : order.paymentMode === "PARTIAL_COD" ? "amber" : "blue"}`}>
															{order.paymentMode?.replace(/_/g, " ") || "—"}
														</span>
														{order.isGift && <span className="ao-tag ao-tag-gift">🎁 Gift</span>}
														{hasDiscount && <span className="ao-tag ao-tag-discount">🏷️ Discount</span>}
														{hasRewardPoints && <span className="ao-tag ao-tag-green">⭐ Rewards</span>}
														{order.deliveryType && <span className="ao-tag ao-tag-blue">{order.deliveryType}</span>}
													</div>

													{/* Shipping Address */}
													<div className="ao-detail-row">
														<span className="ao-detail-label">Address</span>
														<span className="ao-detail-val">
															{[
																order.address?.name ? `${order.address.name} -` : "",
																order.address?.addressLine1,
																order.address?.addressLine2,
																order.address?.landmark ? `(near ${order.address.landmark})` : "",
																order.address?.fullAddress,
																order.address?.city,
																order.address?.state,
																order.address?.pincode,
															].filter(Boolean).join(", ") || "—"}
														</span>
													</div>

													{order.address?.phone && (
														<div className="ao-detail-row">
															<span className="ao-detail-label">Phone</span>
															<span className="ao-detail-val">{order.address.phone}</span>
														</div>
													)}

													{order.address?.alternativePhone && (
														<div className="ao-detail-row">
															<span className="ao-detail-label">Alt Phone</span>
															<span className="ao-detail-val">{order.address.alternativePhone}</span>
														</div>
													)}

													{/* Gift Message */}
													{order.isGift && (
														<div className="ao-detail-row" style={{ marginTop: 8 }}>
															<span className="ao-detail-label">Gift Msg</span>
															<span className="ao-detail-val" style={{ fontStyle: "italic", color: "#880e4f" }}>
																{order.giftMessage ? `"${order.giftMessage}"` : "(no message)"}
															</span>
														</div>
													)}

													{/* COD collection notice */}
													{order.paymentMode === "PARTIAL_COD" && (order.balanceAmount ?? 0) > 0 && (
														<div style={{ marginTop: 10, padding: "8px 10px", background: "#fff3cd", borderRadius: 8, fontSize: 12.5, color: "#856404", fontWeight: 600 }}>
															💰 Collect ₹{Math.round(order.balanceAmount || 0).toLocaleString("en-IN")} on delivery
														</div>
													)}

													{/* Payment IDs */}
													{order.phonePeOrderId && (
														<div className="ao-detail-row" style={{ marginTop: 8 }}>
															<span className="ao-detail-label">PPe Order</span>
															<span className="ao-detail-val" style={{ fontFamily: "monospace", fontSize: 11 }}>{order.phonePeOrderId}</span>
														</div>
													)}
													{order.phonePeTransactionId && (
														<div className="ao-detail-row">
															<span className="ao-detail-label">PPe Txn</span>
															<span className="ao-detail-val" style={{ fontFamily: "monospace", fontSize: 11 }}>{order.phonePeTransactionId}</span>
														</div>
													)}
												</div>

												{/* Financials */}
												<h4 className="ao-section-title">Financials</h4>
												<div className="ao-financials" style={{ marginBottom: 12 }}>
													<div className="ao-fin-row">
														<span className="ao-fin-label">Subtotal</span>
														<span className="ao-fin-val">₹{Math.round((order.totalAmount || 0) + (order.discountAmount || 0) + (order.autoDiscountAmount || 0)).toLocaleString("en-IN")}</span>
													</div>
													{(order.discountAmount ?? 0) > 0 && (
														<div className="ao-fin-row">
															<span className="ao-fin-label">
																Discount{order.discountCode ? ` (${order.discountCode})` : ""}
															</span>
															<span className="ao-fin-val red">−₹{Math.round(order.discountAmount || 0).toLocaleString("en-IN")}</span>
														</div>
													)}
													{(order.autoDiscountAmount ?? 0) > 0 && (
														<div className="ao-fin-row">
															<span className="ao-fin-label">Auto Discount</span>
															<span className="ao-fin-val red">−₹{Math.round(order.autoDiscountAmount || 0).toLocaleString("en-IN")}</span>
														</div>
													)}
													{(order.rewardPointsRedeemed ?? 0) > 0 && (
														<div className="ao-fin-row">
															<span className="ao-fin-label">Reward Pts</span>
															<span className="ao-fin-val red">−{order.rewardPointsRedeemed} pts</span>
														</div>
													)}
													<div className="ao-fin-row total">
														<span>Total</span>
														<span style={{ color: "var(--olive-900)" }}>₹{Math.round(order.totalAmount || 0).toLocaleString("en-IN")}</span>
													</div>
													{(order.advanceAmount ?? 0) > 0 && (
														<div className="ao-fin-row">
															<span className="ao-fin-label">Advance Paid</span>
															<span className="ao-fin-val green">₹{Math.round(order.advanceAmount || 0).toLocaleString("en-IN")}</span>
														</div>
													)}
													{(order.paidAmount ?? 0) > 0 && (
														<div className="ao-fin-row">
															<span className="ao-fin-label">Paid Amount</span>
															<span className="ao-fin-val green">₹{Math.round(order.paidAmount || 0).toLocaleString("en-IN")}</span>
														</div>
													)}
													{(order.balanceAmount ?? 0) > 0 && (
														<div className="ao-fin-row">
															<span className="ao-fin-label">Balance Due</span>
															<span className="ao-fin-val red">₹{Math.round(order.balanceAmount || 0).toLocaleString("en-IN")}</span>
														</div>
													)}
												</div>

												{/* Danger zone */}
												<button className="admin-btn admin-btn-danger" style={{ width: "100%", padding: "8px" }} onClick={() => void onDelete(order._id)}>
													Delete Order
												</button>

												{/* ── Shipping Panel ── */}
												<div className="ao-ship-card" style={{ marginTop: 16 }}>
													<div className="ao-ship-title">🚚 Shipping</div>

													{!order.shipping?.awbNumber ? (
														<>
															<select
																id={`ao-wh-${order._id}`}
																className="ao-ship-select"
																value={selectedWarehouse[order._id] || ""}
																onChange={(e) => setSelectedWarehouse((p) => ({ ...p, [order._id]: e.target.value }))}
															>
																<option value="">Default Pickup ({process.env.NEXT_PUBLIC_ITL_PICKUP_ID || "ID 1293"})</option>
																{warehouses.map((wh) => {
																	const id = String(wh.warehouse_id ?? wh.id ?? "");
																	const name = (wh as any).company_name || wh.name;
																	return <option key={id} value={id}>{name} ({id})</option>;
																})}
															</select>

															<div className="ao-ship-override">
																{(["weightKg", "lengthCm", "widthCm", "heightCm"] as const).map((f) => (
																	<input
																		key={f}
																		type="number"
																		min="0"
																		placeholder={`${f.replace(/([A-Z])/g, " $1").trim()} (opt)`}
																		value={getOverride(order._id)[f]}
																		onChange={(e) => setOverride(order._id, f, e.target.value)}
																	/>
																))}
															</div>

															<button
																id={`ao-create-ship-${order._id}`}
																className="ao-ship-btn ao-ship-btn-green"
																disabled={!!shippingBusy[order._id]}
																onClick={() => void handleCreateShipment(order)}
															>
																{shippingBusy[order._id] ? "Creating…" : "Create Shipment"}
															</button>
														</>
													) : (
														<>
															<div className="ao-ship-row"><strong>AWB</strong><span>{order.shipping.awbNumber}</span></div>
															{order.shipping.logisticName && <div className="ao-ship-row"><strong>Courier</strong><span>{order.shipping.logisticName}</span></div>}
															{order.shipping.currentStatus && <div className="ao-ship-row"><strong>Status</strong><span>{order.shipping.currentStatus}</span></div>}
															{order.shipping.expectedDeliveryDate && <div className="ao-ship-row"><strong>EDD</strong><span>{order.shipping.expectedDeliveryDate}</span></div>}
															{order.shipping.trackingUrl && (
																<div className="ao-ship-row">
																	<strong>Track</strong>
																	<a href={order.shipping.trackingUrl} target="_blank" rel="noreferrer" className="ao-ship-awb-link">
																		{order.shipping.trackingUrl}
																	</a>
																</div>
															)}

															<div className="ao-ship-btn-row">
																<button id={`ao-track-${order._id}`} className="ao-ship-btn ao-ship-btn-blue" disabled={!!shippingBusy[order._id]} onClick={() => void handleTrack(order)}>
																	{shippingBusy[order._id] ? "…" : "🔄 Track"}
																</button>
																<button id={`ao-label-${order._id}`} className="ao-ship-btn ao-ship-btn-orange" disabled={!!shippingBusy[order._id]} onClick={() => void handlePrintLabel(order)}>
																	🖨 Print Label
																</button>
																{!order.shipping.cancelStatus && (
																	<button id={`ao-cancel-ship-${order._id}`} className="ao-ship-btn ao-ship-btn-red" disabled={!!shippingBusy[order._id]} onClick={() => void handleCancel(order)}>
																		✕ Cancel Shipment
																	</button>
																)}
															</div>
														</>
													)}

													{shippingError[order._id] && (
														<div className="ao-ship-err">{shippingError[order._id]}</div>
													)}
												</div>
											</div>

											{/* ── RIGHT COLUMN: Items ── */}
											<div className="ao-main">
												<h4 className="ao-section-title">Items ({order.items?.length ?? 0})</h4>
												<div style={{ background: "white", borderRadius: 10, border: "1px solid #eaeaea", overflowX: "auto" }}>
													<table className="ao-items-table">
														<thead>
															<tr>
																<th style={{ width: 56 }}>Image</th>
																<th>Product</th>
																<th style={{ width: 50, textAlign: "center" }}>Qty</th>
																<th style={{ width: 100, textAlign: "right" }}>Price</th>
															</tr>
														</thead>
														<tbody>
															{(!order.items || order.items.length === 0) ? (
																<tr><td colSpan={4} style={{ textAlign: "center", padding: 24, color: "var(--mist)" }}>No items</td></tr>
															) : (
																order.items.map((item, idx) => {
																	const imgUrl = getItemImage(item);
																	const itemName = getItemName(item);

																	return (
																		<tr key={item._id || idx}>
																			<td>
																				{imgUrl
																					? <img src={imgUrl} alt="" className="ao-item-img" />
																					: <div className="ao-item-img-placeholder">🛍</div>
																				}
																			</td>
																			<td>
																				<div className="ao-item-name">{itemName}</div>
																				{item.category && <div className="ao-item-category">{item.category}</div>}

																				{/* Custom note */}
																				{item.customNote && (
																					<div style={{ fontSize: 11.5, color: "#5d4037", background: "#fef9e7", borderRadius: 6, padding: "4px 8px", marginTop: 4, fontStyle: "italic" }}>
																						📝 {item.customNote}
																					</div>
																				)}

																				{/* Selected Charms */}
																				{!item.selectionGroups?.length && item.selectedCharms && item.selectedCharms.length > 0 && (
																					<div className="ao-nested">
																						<div className="ao-nested-title">
																							Charms — {item.selectedCharms.length} pcs
																							{/* Band info */}
																							{(item as any).band?.name && (
																								<span style={{ marginLeft: 8, fontSize: 10, fontWeight: 600, color: 'var(--olive-600)', background: 'rgba(74,92,34,.08)', padding: '2px 8px', borderRadius: 12 }}>
																									🪡 Band: {(item as any).band.name}
																								</span>
																							)}
																							{/* Pack add-on from selectionGroups metadata */}
																							{(item as any).selectionGroups?.[0]?.metadata?.packAddOn > 0 && (
																								<span style={{ marginLeft: 8, fontSize: 10, color: 'var(--mist)', fontStyle: 'italic' }}>
																									+₹{(item as any).selectionGroups[0].metadata.packAddOn} add-on
																								</span>
																							)}
																						</div>
																						{item.selectedCharms.map((c: any, i) => (
																							<div key={i} className="ao-nested-item">
																								<span style={{ fontSize: 11, fontWeight: 700, color: 'var(--mist)' }}>#{i + 1}</span>
																								<span className="ao-nested-content">
																									<span className="ao-nested-name">{typeof c === "string" ? c : c.name || "Charm"}</span>
																									{c.price > 0 && <span className="ao-nested-price"> · ₹{c.price}</span>}
																								</span>
																							</div>
																						))}
																					</div>
																				)}

																				{/* Box customisation message */}
																				{item.customData && (item.customData.comboPresetMessage || item.customData.comboPersonalMessage) && (
																					<div className="ao-nested" style={{ borderLeftColor: "#c9a84c", background: "rgba(201,168,76,0.07)" }}>
																						<div className="ao-nested-title" style={{ color: "#c9a84c" }}>Box Customisation</div>
																						{item.customData.comboPresetMessage && <div style={{ fontSize: 12 }}>Card: <em>{String(item.customData.comboPresetMessage)}</em></div>}
																						{item.customData.comboPersonalMessage && <div style={{ fontSize: 12 }}>Message: "{String(item.customData.comboPersonalMessage)}"</div>}
																					</div>
																				)}

																				{/* Selection Groups */}
																				{item.selectionGroups && item.selectionGroups.length > 0 && item.selectionGroups.map((group, gIdx) => (
																					<div key={gIdx} className="ao-nested">
																						<div className="ao-nested-title">{group.label || group.category || `Group ${gIdx + 1}`}</div>
																						{(group.items || []).map((sgItem: any, sgIdx: number) => {
																							const selections = formatSelections(sgItem.customData);
																							return (
																								<div key={sgIdx} className="ao-nested-item" style={{ alignItems: "flex-start" }}>
																									{sgItem.image
																										? <img src={sgItem.image} alt="" className="ao-nested-img" />
																										: <div style={{ width: 28, height: 28, borderRadius: 5, background: "#e8ecde", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>📦</div>
																									}
																									<div className="ao-nested-content">
																										<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
																											<span className="ao-nested-name">{sgItem.name || "Item"}</span>
																											{sgItem.price > 0 && <span className="ao-nested-price">₹{sgItem.price}</span>}
																										</div>
																										{selections.length > 0 && (
																											<div className="ao-nested-selections">
																												{selections.map((sel, si) => (
																													<span key={si} className="ao-selection-chip">{sel}</span>
																												))}
																											</div>
																										)}
																										{sgItem.customData?.isCustomised && selections.length === 0 && (
																											<span className="ao-selection-chip" style={{ marginTop: 3 }}>Customised</span>
																										)}
																									</div>
																								</div>
																							);
																						})}
																					</div>
																				))}
																			</td>
																			<td style={{ textAlign: "center", fontWeight: 600 }}>{item.quantity ?? 1}</td>
																			<td style={{ textAlign: "right", fontWeight: 700, color: "var(--olive-900)" }}>₹{Math.round(item.price || 0).toLocaleString("en-IN")}</td>
																		</tr>
																	);
																})
															)}
														</tbody>
													</table>
												</div>
											</div>
										</div>
									)}
								</div>
							);
						})
					)}
				</div>
			</div>
		</section>
	);
}