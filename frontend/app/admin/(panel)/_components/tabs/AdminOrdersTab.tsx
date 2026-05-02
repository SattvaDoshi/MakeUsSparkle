import { Fragment } from "react";

import type { AdminOrder } from "../../_lib/admin.types";
import { formatAddress, formatDateTime, formatMoney, formatShortId, getOrderItemLabel, normalizeOrderStatus, normalizePaymentStatus } from "../../_lib/admin.helpers";

type AdminOrdersTabProps = {
	orders: AdminOrder[];
	onStatusChange: (orderId: string, status: NonNullable<AdminOrder["status"]>) => void;
	onDelete: (id: string) => void;
};

const orderStatuses: Array<AdminOrder["status"]> = ["placed", "shipped", "delivered", "cancelled"];

export default function AdminOrdersTab({ orders, onStatusChange, onDelete }: AdminOrdersTabProps) {
	return (
		<section className="admin-content">
			<div className="admin-panel">
				<h2>Orders</h2>
				<div className="admin-table-wrap">
					<table className="admin-table">
						<thead><tr><th>Order</th><th>Customer</th><th>Amount</th><th>Payment</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead>
						<tbody>
							{orders.map((entry) => (
								<Fragment key={entry._id}>
									<tr style={{ background: "#fdfdfd" }}>
										<td><strong>{formatShortId(entry._id)}</strong></td>
										<td>
											<div style={{ fontWeight: 500 }}>{entry.user?.name || "-"}</div>
											<div style={{ fontSize: 11, color: "var(--mist)" }}>{entry.user?.email || "-"}</div>
										</td>
										<td>
											<div style={{ fontWeight: 600 }}>{formatMoney(entry.totalAmount)}</div>
											{entry.paymentMode === "PARTIAL_COD" && (
												<div style={{ fontSize: 11, color: "var(--mist)" }}>
													Adv: {formatMoney(entry.advanceAmount)} | Bal: {formatMoney(entry.balanceAmount)}
												</div>
											)}
										</td>
										<td>
											<div style={{ fontWeight: 500 }}>{entry.paymentMode || "-"}</div>
											<div style={{ fontSize: 11, color: entry.paymentStatus === "paid" ? "green" : entry.paymentStatus === "partial_paid" ? "orange" : "red" }}>
												{normalizePaymentStatus(entry.paymentStatus)?.toUpperCase()}
											</div>
										</td>
										<td>
											<select value={normalizeOrderStatus(entry.status)} onChange={(event) => void onStatusChange(entry._id, event.target.value as NonNullable<AdminOrder["status"]>)}>
												{orderStatuses.map((status) => <option key={status} value={status || "placed"}>{status?.toUpperCase()}</option>)}
											</select>
										</td>
										<td>{formatDateTime(entry.createdAt)}</td>
										<td><button className="admin-btn admin-btn-danger" onClick={() => void onDelete(entry._id)}>Delete</button></td>
									</tr>
									<tr key={`${entry._id}-details`} style={{ borderBottom: "2px solid #eaeaea" }}>
										<td colSpan={7} style={{ whiteSpace: "normal", padding: "16px 24px", background: "#f9f9f9" }}>
											<div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 24 }}>
												<div>
													<h4 style={{ marginBottom: 8, fontSize: 13, textTransform: "uppercase", color: "var(--mist)" }}>Order Details</h4>
													<div style={{ display: "grid", gap: 6, fontSize: 13 }}>
														<div><strong>Shipping Address:</strong><br/>{formatAddress(entry.address)}</div>
														{!!entry.isGift && (
															<div><strong>Gift Order:</strong> Yes{entry.giftMessage ? ` — “${entry.giftMessage}”` : ""}</div>
														)}
														{entry.paymentMode === "PARTIAL_COD" && (
															<div style={{ background: "#fff3cd", padding: 8, borderRadius: 4, marginTop: 4, border: "1px solid #ffeeba" }}>
																<strong>COD Collection:</strong> Collect {formatMoney(entry.balanceAmount)} on delivery.
															</div>
														)}
													</div>
												</div>
												<div>
													<h4 style={{ marginBottom: 8, fontSize: 13, textTransform: "uppercase", color: "var(--mist)" }}>Items</h4>
													<div style={{ overflowX: "auto", background: "white", borderRadius: 8, border: "1px solid #eaeaea" }}>
														<table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
															<thead>
																<tr style={{ textAlign: "left", borderBottom: "1px solid #eaeaea", background: "#f5f5f5" }}>
																	<th style={{ padding: "8px 12px", width: 48 }}>Image</th>
																	<th style={{ padding: "8px 12px" }}>Item</th>
																	<th style={{ padding: "8px 12px", width: 60 }}>Qty</th>
																	<th style={{ padding: "8px 12px", width: 100 }}>Price</th>
																</tr>
															</thead>
															<tbody>
																{(entry.items || []).length === 0 ? (
																	<tr><td colSpan={4} style={{ padding: 12, textAlign: "center", color: "var(--mist)" }}>No items</td></tr>
																) : (
																	(entry.items || []).map((item) => (
																		<tr key={item._id || `${entry._id}-${String(item.price)}-${String(item.quantity)}`} style={{ borderBottom: "1px solid #f0f0f0" }}>
																			<td style={{ padding: "8px 12px" }}>
																				{item.product && typeof item.product === 'object' && 'images' in item.product && Array.isArray((item.product as any).images) && (item.product as any).images[0] ? (
																					<img src={(item.product as any).images[0]} alt="" style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 4 }} />
																				) : (
																					<div style={{ width: 40, height: 40, background: "#f4f4f4", borderRadius: 4 }} />
																				)}
																			</td>
																			<td style={{ padding: "8px 12px" }}>
																				<div style={{ fontWeight: 500 }}>{getOrderItemLabel(item)}</div>
																				{item.selectedCharms && item.selectedCharms.length > 0 && (
																					<div style={{ fontSize: 11, color: "var(--mist)", marginTop: 4 }}>
																						Charms: {item.selectedCharms.map((c: any) => typeof c === 'string' ? 'Charm' : c.name || 'Charm').join(", ")}
																					</div>
																				)}
																			</td>
																			<td style={{ padding: "8px 12px" }}>{item.quantity ?? 0}</td>
																			<td style={{ padding: "8px 12px", fontWeight: 500 }}>₹{Math.round(item.price || 0).toLocaleString()}</td>
																		</tr>
																	))
																)}
															</tbody>
														</table>
													</div>
											</div>
										</div>
									</td>
								</tr>
								</Fragment>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</section>
	);
}