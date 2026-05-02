import type { AdminCoupon } from "../../_lib/admin.types";

type AdminCouponsTabProps = {
	coupons: AdminCoupon[];
	onEdit: (coupon: AdminCoupon) => void;
	onDelete: (id: string) => void;
};

export default function AdminCouponsTab({ coupons, onEdit, onDelete }: AdminCouponsTabProps) {
	return (
		<section className="admin-content">
			<div className="admin-panel">
				<h2>Coupons List</h2>
				<div className="admin-table-wrap">
					<table className="admin-table">
						<thead><tr><th>Code</th><th>Name</th><th>Type</th><th>Value</th><th>Min Order</th><th>Used/Limit</th><th>Expiry</th><th>Active</th><th>Actions</th></tr></thead>
						<tbody>
							{coupons.map((entry) => (
								<tr key={entry._id}>
									<td>{entry.code}</td>
									<td>{entry.name}</td>
									<td>{entry.discountType}</td>
									<td>{entry.discountValue}</td>
									<td>{entry.minOrderValue ?? 0}</td>
									<td>{entry.usedCount ?? 0}/{entry.usageLimit ?? 0}</td>
									<td>{entry.expiryDate ? String(entry.expiryDate).slice(0, 10) : "-"}</td>
									<td>{entry.isActive ? "Yes" : "No"}</td>
									<td>
										<div className="admin-inline-actions">
											<button className="admin-btn" onClick={() => onEdit(entry)}>Edit</button>
											<button className="admin-btn admin-btn-danger" onClick={() => onDelete(entry._id)}>Delete</button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</section>
	);
}