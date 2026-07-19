import { useState, useMemo, useEffect, useCallback } from "react";
import type { AdminOrder, Warehouse } from "../../_lib/admin.types";
import { formatAddress, formatDateTime, formatMoney, formatShortId, getOrderItemLabel, normalizeOrderStatus, normalizePaymentStatus } from "../../_lib/admin.helpers";
import { listWarehouses, createShipment, trackShipment, cancelShipment, printLabel as fetchLabel } from "@/lib/shippingApi";

type AdminOrdersTabProps = {
	orders: AdminOrder[];
	onStatusChange: (orderId: string, status: NonNullable<AdminOrder["status"]>) => void;
	onDelete: (id: string) => void;
	onShippingUpdate?: (orderId: string, shipping: AdminOrder["shipping"]) => void;
};

const orderStatuses: Array<AdminOrder["status"]> = ["placed", "shipped", "delivered", "cancelled"];
const paymentStatuses = ["all", "pending", "paid", "partial_paid", "failed", "completed"];

export default function AdminOrdersTab({ orders, onStatusChange, onDelete, onShippingUpdate }: AdminOrdersTabProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [paymentFilter, setPaymentFilter] = useState("all");
	const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});

	// Warehouses — loaded once for the pickup dropdown
	const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
	const [warehousesLoaded, setWarehousesLoaded] = useState(false);

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
		} catch { /* silently ignore — user will see empty dropdown */ }
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
		// Load warehouses lazily on first expand
		void loadWarehouses();
		setExpandedOrders(prev => ({ ...prev, [id]: !prev[id] }));
	};

	const filteredOrders = useMemo(() => {
		return orders.filter(order => {
			const q = searchQuery.toLowerCase();
			const matchesSearch = !q 
				|| order._id?.toLowerCase().includes(q) 
				|| order.user?.name?.toLowerCase().includes(q) 
				|| order.user?.email?.toLowerCase().includes(q);

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
					background: white; border: 1px solid rgba(61,74,34,0.08); border-radius: 12px;
					margin-bottom: 16px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.02);
				}
				.ao-header {
					display: grid; grid-template-columns: 1fr 2fr 1fr 1fr 1fr auto; gap: 16px;
					padding: 16px 20px; align-items: center; cursor: pointer;
					background: #fdfdfd; transition: background 0.2s;
				}
				.ao-header:hover { background: #f9fbf4; }
				
				.ao-col { display: flex; flex-direction: column; gap: 4px; }
				.ao-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: var(--mist); font-weight: 600; }
				.ao-val { font-size: 14px; color: var(--ink); font-weight: 500; }
				.ao-val-sub { font-size: 12px; color: var(--mist); }

				.ao-badge {
					display: inline-flex; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; text-transform: uppercase;
				}
				.ao-badge-paid { background: #e8f5e9; color: #2e7d32; }
				.ao-badge-pending { background: #fff3cd; color: #856404; }
				.ao-badge-failed { background: #ffebee; color: #c62828; }

				.ao-expand-btn {
					background: none; border: none; cursor: pointer; padding: 8px;
					color: var(--mist); display: flex; align-items: center; justify-content: center;
				}
				.ao-expand-btn svg { width: 20px; height: 20px; transition: transform 0.2s; }
				.ao-expand-btn.expanded svg { transform: rotate(180deg); }

				.ao-body {
					border-top: 1px solid rgba(61,74,34,0.08); padding: 20px; background: #fafafa;
					display: grid; grid-template-columns: 300px 1fr; gap: 32px;
				}
				
				.ao-section-title { font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--olive-600); font-weight: 600; margin-bottom: 12px; }
				
				.ao-detail-card {
					background: white; border: 1px solid #eaeaea; border-radius: 8px; padding: 16px; margin-bottom: 16px;
				}

				.ao-items-table { width: 100%; border-collapse: collapse; font-size: 13px; }
				.ao-items-table th { text-align: left; padding: 10px 12px; color: var(--mist); font-size: 11px; text-transform: uppercase; border-bottom: 1px solid #eaeaea; }
				.ao-items-table td { padding: 12px; border-bottom: 1px solid #f5f5f5; vertical-align: top; }
				.ao-items-table tr:last-child td { border-bottom: none; }

				.ao-item-nested {
					margin-top: 8px; padding-left: 12px; border-left: 2px solid #e0e0e0;
					display: flex; flex-direction: column; gap: 8px;
				}
				.ao-nested-group-title { font-size: 10px; color: var(--mist); text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em; }
				.ao-nested-item { display: flex; align-items: center; gap: 10px; font-size: 12px; }
				.ao-nested-img { width: 24px; height: 24px; object-fit: cover; border-radius: 4px; background: #eee; }
				
				@media (max-width: 1024px) {
					.ao-header { grid-template-columns: 1fr 1.5fr 1fr auto; }
					.ao-col-created, .ao-col-payment { display: none; }
					.ao-body { grid-template-columns: 1fr; gap: 20px; }
				}

				/* ── Shipping Panel ─────────────────────────────────── */
				.ao-ship-card { background: #f0f7ef; border: 1px solid #c8e6c9; border-radius: 8px; padding: 14px; margin-top: 12px; }
				.ao-ship-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #2e7d32; margin-bottom: 10px; }
				.ao-ship-row { display: flex; gap: 6px; font-size: 12px; margin-bottom: 5px; }
				.ao-ship-row strong { min-width: 80px; color: var(--ink); }
				.ao-ship-row span { color: var(--mist); }
				.ao-ship-btn-row { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
				.ao-ship-btn {
					padding: 7px 12px; border-radius: 6px; border: none; font-size: 12px; font-weight: 700;
					cursor: pointer; transition: opacity 0.15s, transform 0.1s;
				}
				.ao-ship-btn:active { transform: scale(0.97); }
				.ao-ship-btn:disabled { opacity: 0.5; cursor: not-allowed; }
				.ao-ship-btn-green  { background: #2e7d32; color: white; }
				.ao-ship-btn-blue   { background: #1565c0; color: white; }
				.ao-ship-btn-orange { background: #e65100; color: white; }
				.ao-ship-btn-red    { background: #c62828; color: white; }
				.ao-ship-select { width: 100%; padding: 7px 10px; border: 1px solid #c8e6c9; border-radius: 6px; font-size: 13px; background: white; margin-bottom: 6px; }
				.ao-ship-override { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin: 8px 0; }
				.ao-ship-override input { padding: 6px 8px; border: 1px solid #c8e6c9; border-radius: 6px; font-size: 12px; width: 100%; box-sizing: border-box; }
				.ao-ship-err { color: #c62828; font-size: 12px; margin-top: 6px; }
				.ao-ship-awb-link { color: #1565c0; font-size: 12px; text-decoration: underline; word-break: break-all; }
			`}</style>

			<div className="admin-panel">
				<h2>Orders</h2>
				
				<div className="admin-controls">
					<input 
						type="text" 
						className="admin-search" 
						placeholder="Search by Order ID, Customer Name, or Email..." 
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
					
					<select className="admin-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
						<option value="all">All Statuses</option>
						{orderStatuses.map(s => <option key={s} value={s}>{s?.toUpperCase()}</option>)}
					</select>

					<select className="admin-filter" value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}>
						{paymentStatuses.map(s => <option key={s} value={s}>{s === "all" ? "All Payments" : s.replace('_', ' ').toUpperCase()}</option>)}
					</select>
				</div>

				<div className="ao-list">
					{filteredOrders.length === 0 ? (
						<div style={{ textAlign: 'center', padding: '40px', color: 'var(--mist)' }}>No orders found.</div>
					) : (
						filteredOrders.map((order) => {
							const isExpanded = !!expandedOrders[order._id];
							const pStatus = normalizePaymentStatus(order.paymentStatus);
							const badgeClass = pStatus === "paid" ? "ao-badge-paid" 
											: pStatus === "failed" ? "ao-badge-failed" 
											: "ao-badge-pending";

							return (
								<div className="ao-card" key={order._id}>
									<div className="ao-header" onClick={() => toggleExpand(order._id)}>
										<div className="ao-col">
											<span className="ao-label">Order ID</span>
											<span className="ao-val">{formatShortId(order._id)}</span>
										</div>
										<div className="ao-col">
											<span className="ao-label">Customer</span>
											<span className="ao-val">{order.user?.name || "-"}</span>
											<span className="ao-val-sub">{order.user?.email || "-"}</span>
										</div>
										<div className="ao-col">
											<span className="ao-label">Amount</span>
											<span className="ao-val">{formatMoney(order.totalAmount)}</span>
											{order.paymentMode === "PARTIAL_COD" && (
												<span className="ao-val-sub" style={{ color: "#d84315" }}>Bal: {formatMoney(order.balanceAmount)}</span>
											)}
										</div>
										<div className="ao-col ao-col-payment">
											<span className="ao-label">Payment</span>
											<span className="ao-val-sub">{order.paymentMode || "-"}</span>
											<span className={`ao-badge ${badgeClass}`}>{pStatus?.replace('_', ' ')}</span>
										</div>
										<div className="ao-col ao-col-created">
											<span className="ao-label">Created</span>
											<span className="ao-val-sub">{formatDateTime(order.createdAt)}</span>
										</div>
										<div className="ao-col" style={{ alignItems: "flex-end" }} onClick={(e) => e.stopPropagation()}>
											<select 
												style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #ccc", fontSize: 12, outline: "none", cursor: "pointer", fontWeight: 600 }}
												value={normalizeOrderStatus(order.status)} 
												onChange={(e) => onStatusChange(order._id, e.target.value as NonNullable<AdminOrder["status"]>)}
											>
												{orderStatuses.map((status) => <option key={status} value={status}>{status?.toUpperCase()}</option>)}
											</select>
										</div>
										<button className={`ao-expand-btn ${isExpanded ? 'expanded' : ''}`} aria-label="Expand Order">
											<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
												<polyline points="6 9 12 15 18 9"></polyline>
											</svg>
										</button>
									</div>

									{isExpanded && (
										<div className="ao-body">
											<div className="ao-sidebar">
												<h4 className="ao-section-title">Order Details</h4>
												<div className="ao-detail-card">
													<div style={{ marginBottom: 12 }}>
														<div className="ao-label" style={{ marginBottom: 4 }}>Shipping Address</div>
														<div style={{ fontSize: 13, lineHeight: 1.4 }}>{formatAddress(order.address)}</div>
													</div>
													
													{order.isGift && (
														<div style={{ marginBottom: 12 }}>
															<div className="ao-label" style={{ marginBottom: 4 }}>Gift Details</div>
															<div style={{ fontSize: 13, background: "#f2f4e8", padding: 8, borderRadius: 6 }}>
																🎁 Marked as Gift
																{order.giftMessage && <div style={{ marginTop: 4, fontStyle: "italic", color: "var(--olive-600)" }}>"{order.giftMessage}"</div>}
															</div>
														</div>
													)}

													{order.paymentMode === "PARTIAL_COD" && (
														<div style={{ marginBottom: 12 }}>
															<div className="ao-label" style={{ marginBottom: 4 }}>COD Collection</div>
															<div style={{ fontSize: 13, background: "#fff3cd", color: "#856404", padding: 8, borderRadius: 6, fontWeight: 500 }}>
																Collect {formatMoney(order.balanceAmount)} on delivery.
															</div>
														</div>
													)}
													
													<div style={{ marginTop: 16 }}>
														<button className="admin-btn admin-btn-danger" style={{ width: "100%", padding: "8px" }} onClick={() => void onDelete(order._id)}>Delete Order</button>
													</div>
												</div>

												{/* ── Shipping Panel ── */}
												<div className="ao-ship-card">
													<div className="ao-ship-title">🚚 Shipping</div>

													{!order.shipping?.awbNumber ? (
														// No shipment yet — show create form
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
														// AWB exists — show info + actions
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
																<button
																	id={`ao-track-${order._id}`}
																	className="ao-ship-btn ao-ship-btn-blue"
																	disabled={!!shippingBusy[order._id]}
																	onClick={() => void handleTrack(order)}
																>
																	{shippingBusy[order._id] ? "…" : "🔄 Track"}
																</button>
																<button
																	id={`ao-label-${order._id}`}
																	className="ao-ship-btn ao-ship-btn-orange"
																	disabled={!!shippingBusy[order._id]}
																	onClick={() => void handlePrintLabel(order)}
																>
																	🖨 Print Label
																</button>
																{!order.shipping.cancelStatus && (
																	<button
																		id={`ao-cancel-ship-${order._id}`}
																		className="ao-ship-btn ao-ship-btn-red"
																		disabled={!!shippingBusy[order._id]}
																		onClick={() => void handleCancel(order)}
																	>
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

											<div className="ao-main">
												<h4 className="ao-section-title">Items</h4>
												<div style={{ background: "white", borderRadius: 8, border: "1px solid #eaeaea", overflowX: "auto" }}>
													<table className="ao-items-table">
														<thead>
															<tr>
																<th style={{ width: 60 }}>Image</th>
																<th>Product</th>
																<th style={{ width: 60, textAlign: 'center' }}>Qty</th>
																<th style={{ width: 100, textAlign: 'right' }}>Price</th>
															</tr>
														</thead>
														<tbody>
															{(!order.items || order.items.length === 0) ? (
																<tr><td colSpan={4} style={{ textAlign: "center", padding: 20 }}>No items</td></tr>
															) : (
																order.items.map((item, idx) => {
																	let imgUrl = "";
																	if (item.product && typeof item.product === 'object' && 'images' in item.product && Array.isArray((item.product as any).images)) {
																		imgUrl = (item.product as any).images[0] || "";
																	}

																	return (
																		<tr key={item._id || idx}>
																			<td>
																				{imgUrl ? (
																					<img src={imgUrl} alt="" style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 6 }} />
																				) : (
																					<div style={{ width: 44, height: 44, background: "#f4f4f4", borderRadius: 6 }} />
																				)}
																			</td>
																			<td>
																				<div style={{ fontWeight: 600, color: "var(--olive-900)" }}>{getOrderItemLabel(item)}</div>
																				
																				{/* Nested Items: Charms */}
																				{!item.selectionGroups?.length && item.selectedCharms && item.selectedCharms.length > 0 && (
																					<div className="ao-item-nested">
																						<div className="ao-nested-group-title">Selected Pieces ({item.selectedCharms.length})</div>
																						<div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
																							{item.selectedCharms.map((c: any, i) => (
																								<div key={i} className="ao-nested-item">
																									<span style={{ fontSize: 14 }}>{c.emoji || "◈"}</span>
																									<span>{typeof c === 'string' ? c : c.name || "Charm"}</span>
																								</div>
																							))}
																						</div>
																					</div>
																				)}

																				{/* Nested Items: Combo / Selection Groups */}
																				{item.selectionGroups && item.selectionGroups.length > 0 && (
																					<div className="ao-item-nested">
																						{item.selectionGroups.map((group: any, gIdx: number) => (
																							<div key={gIdx} style={{ marginBottom: 12 }}>
																								<div className="ao-nested-group-title" style={{ marginBottom: 6 }}>{group.label || group.category}</div>
																								<div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
																									{(group.items || []).map((sgItem: any, sgIdx: number) => (
																										<div key={sgIdx} className="ao-nested-item">
																											{sgItem.image && <img src={sgItem.image} alt="" className="ao-nested-img" />}
																											<div style={{ flex: 1 }}>{sgItem.name}</div>
																											<div style={{ fontWeight: 600, color: "var(--olive-600)" }}>₹{sgItem.price}</div>
																										</div>
																									))}
																								</div>
																							</div>
																						))}
																					</div>
																				)}

																			</td>
																			<td style={{ textAlign: 'center', fontWeight: 500 }}>{item.quantity ?? 1}</td>
																			<td style={{ textAlign: 'right', fontWeight: 600 }}>₹{Math.round(item.price || 0).toLocaleString()}</td>
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