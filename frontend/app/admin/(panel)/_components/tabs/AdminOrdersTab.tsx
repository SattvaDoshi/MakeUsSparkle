import { useState, useMemo } from "react";
import type { AdminOrder } from "../../_lib/admin.types";
import { formatAddress, formatDateTime, formatMoney, formatShortId, getOrderItemLabel, normalizeOrderStatus, normalizePaymentStatus } from "../../_lib/admin.helpers";

type AdminOrdersTabProps = {
	orders: AdminOrder[];
	onStatusChange: (orderId: string, status: NonNullable<AdminOrder["status"]>) => void;
	onDelete: (id: string) => void;
};

const orderStatuses: Array<AdminOrder["status"]> = ["placed", "shipped", "delivered", "cancelled"];
const paymentStatuses = ["all", "pending", "paid", "partial_paid", "failed", "completed"];

export default function AdminOrdersTab({ orders, onStatusChange, onDelete }: AdminOrdersTabProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [paymentFilter, setPaymentFilter] = useState("all");
	const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});

	const toggleExpand = (id: string) => {
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
				.ao-controls {
					display: flex; gap: 16px; margin-bottom: 24px; align-items: center; flex-wrap: wrap;
				}
				.ao-search {
					flex: 1; min-width: 200px;
					padding: 10px 14px; border: 1px solid #d9cdb8; border-radius: 8px;
					font-family: 'Jost', sans-serif; font-size: 14px; outline: none;
				}
				.ao-search:focus { border-color: #7a8e3c; }
				.ao-filter {
					padding: 10px 14px; border: 1px solid #d9cdb8; border-radius: 8px;
					font-family: 'Jost', sans-serif; font-size: 13px; outline: none;
					background: white; cursor: pointer;
				}
				
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
			`}</style>

			<div className="admin-panel">
				<h2>Orders</h2>
				
				<div className="ao-controls">
					<input 
						type="text" 
						className="ao-search" 
						placeholder="Search by Order ID, Customer Name, or Email..." 
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
					
					<select className="ao-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
						<option value="all">All Statuses</option>
						{orderStatuses.map(s => <option key={s} value={s}>{s?.toUpperCase()}</option>)}
					</select>

					<select className="ao-filter" value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}>
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