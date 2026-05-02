import type { AdminOrder } from "../../_lib/admin.types";
import { formatMoney, formatShortId, normalizePaymentStatus } from "../../_lib/admin.helpers";

type AdminPaymentsTabProps = {
	payments: AdminOrder[];
	onStatusChange: (orderId: string, status: NonNullable<AdminOrder["paymentStatus"]>) => void;
};

const paymentStatuses: Array<AdminOrder["paymentStatus"]> = ["pending", "paid", "partial_paid", "failed"];

export default function AdminPaymentsTab({ payments, onStatusChange }: AdminPaymentsTabProps) {
	return (
		<section className="admin-content">
			<div className="admin-panel">
				<h2>Payments</h2>
				<div className="admin-table-wrap">
					<table className="admin-table">
						<thead><tr><th>Order</th><th>Customer</th><th>Mode</th><th>Status</th><th>Amount</th></tr></thead>
						<tbody>
							{payments.map((entry) => (
								<tr key={entry._id}>
									<td>{formatShortId(entry._id)}</td>
									<td>{entry.user?.name || entry.user?.email || "-"}</td>
									<td>{entry.paymentMode || "-"}</td>
									<td>
										<select value={normalizePaymentStatus(entry.paymentStatus)} onChange={(event) => void onStatusChange(entry._id, event.target.value as NonNullable<AdminOrder["paymentStatus"]>)}>
											{paymentStatuses.map((status) => <option key={status} value={status || "pending"}>{status}</option>)}
										</select>
									</td>
									<td>{formatMoney(entry.totalAmount)}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</section>
	);
}