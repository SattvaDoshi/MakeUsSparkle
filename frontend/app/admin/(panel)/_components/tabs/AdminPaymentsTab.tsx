import { useState, useMemo } from "react";
import type { AdminOrder } from "../../_lib/admin.types";
import { formatMoney, formatShortId, normalizePaymentStatus } from "../../_lib/admin.helpers";

type AdminPaymentsTabProps = {
	payments: AdminOrder[];
	onStatusChange: (orderId: string, status: NonNullable<AdminOrder["paymentStatus"]>) => void;
};

const paymentStatuses: Array<AdminOrder["paymentStatus"]> = ["pending", "paid", "partial_paid", "failed"];

export default function AdminPaymentsTab({ payments, onStatusChange }: AdminPaymentsTabProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");

	const filteredPayments = useMemo(() => {
		return payments.filter(p => {
			const q = searchQuery.toLowerCase();
			const matchesSearch = !q || formatShortId(p._id).toLowerCase().includes(q) || (p.user?.name || "").toLowerCase().includes(q) || (p.user?.email || "").toLowerCase().includes(q);
			const matchesStatus = statusFilter === "all" || normalizePaymentStatus(p.paymentStatus) === statusFilter;
			return matchesSearch && matchesStatus;
		});
	}, [payments, searchQuery, statusFilter]);

	return (
		<section className="admin-content">
			<div className="admin-panel">
				<h2>Payments</h2>
				
				<div className="admin-controls">
					<input 
						type="text" 
						className="admin-search" 
						placeholder="Search by order ID, customer name or email..." 
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
					<select className="admin-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
						<option value="all">All Statuses</option>
						<option value="pending">Pending</option>
						<option value="paid">Paid</option>
						<option value="partial_paid">Partial Paid</option>
						<option value="failed">Failed</option>
					</select>
				</div>

				<div className="admin-table-wrap">
					<table className="admin-table">
						<thead><tr><th>Order</th><th>Customer</th><th>Mode</th><th>Status</th><th>Amount</th></tr></thead>
						<tbody>
							{filteredPayments.map((entry) => (
								<tr key={entry._id}>
									<td>{formatShortId(entry._id)}</td>
									<td>{entry.user?.name || entry.user?.email || "-"}</td>
									<td>{entry.paymentMode || "-"}</td>
									<td>
										<select className="admin-filter" style={{ minWidth: 120 }} value={normalizePaymentStatus(entry.paymentStatus)} onChange={(event) => void onStatusChange(entry._id, event.target.value as NonNullable<AdminOrder["paymentStatus"]>)}>
											{paymentStatuses.map((status) => <option key={status} value={status || "pending"}>{status}</option>)}
										</select>
									</td>
									<td>{formatMoney(entry.totalAmount)}</td>
								</tr>
							))}
							{filteredPayments.length === 0 && (
								<tr>
									<td colSpan={5} style={{ textAlign: "center", padding: "20px" }}>No payments found.</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>
		</section>
	);
}