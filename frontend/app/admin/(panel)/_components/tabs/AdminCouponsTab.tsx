import type { AdminCoupon, AdminOffer } from "../../_lib/admin.types";

type AdminCouponsTabProps = {
	coupons: AdminCoupon[];
	offers: AdminOffer[];
	onEditCoupon: (coupon: AdminCoupon) => void;
	onDeleteCoupon: (id: string) => void;
	onEditOffer: (offer: AdminOffer) => void;
	onDeleteOffer: (id: string) => void;
	onAddCoupon: () => void;
	onAddOffer: () => void;
};

export default function AdminCouponsTab({
	coupons,
	offers,
	onEditCoupon,
	onDeleteCoupon,
	onEditOffer,
	onDeleteOffer,
	onAddCoupon,
	onAddOffer,
}: AdminCouponsTabProps) {
	return (
		<section className="admin-content">
			<div className="admin-panel">
				<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
					<h2>Offers</h2>
					<button className="admin-btn" onClick={onAddOffer}>Add Offer</button>
				</div>
				<div className="admin-table-wrap">
					<table className="admin-table">
						<thead><tr><th>Title</th><th>Type</th><th>Value</th><th>Usage</th><th>Expiry</th><th>Active</th><th>Actions</th></tr></thead>
						<tbody>
							{offers.map((entry) => (
								<tr key={entry._id}>
									<td>{entry.title}</td>
									<td>{entry.offerType === "bogo" ? `Buy ${entry.buyQuantity} Get ${entry.getQuantity}` : entry.offerType}</td>
									<td>{entry.offerType === "bogo" ? "-" : entry.discountValue}</td>
									<td>{entry.usedCount ?? 0}/{entry.usageLimit === 0 ? "∞" : entry.usageLimit}</td>
									<td>{entry.expiryDate ? String(entry.expiryDate).slice(0, 10) : "-"}</td>
									<td>{entry.isActive ? "Yes" : "No"}</td>
									<td>
										<div className="admin-inline-actions">
											<button className="admin-btn" onClick={() => onEditOffer(entry)}>Edit</button>
											<button className="admin-btn admin-btn-danger" onClick={() => onDeleteOffer(entry._id)}>Delete</button>
										</div>
									</td>
								</tr>
							))}
							{offers.length === 0 && (
								<tr><td colSpan={7} style={{ textAlign: "center" }}>No offers found.</td></tr>
							)}
						</tbody>
					</table>
				</div>
			</div>

			<div className="admin-panel" style={{ marginTop: "2rem" }}>
				<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
					<h2>Coupons List</h2>
					<button className="admin-btn" onClick={onAddCoupon}>Add Coupon</button>
				</div>
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
									<td>{entry.usedCount ?? 0}/{entry.usageLimit === 0 ? "∞" : entry.usageLimit}</td>
									<td>{entry.expiryDate ? String(entry.expiryDate).slice(0, 10) : "-"}</td>
									<td>{entry.isActive ? "Yes" : "No"}</td>
									<td>
										<div className="admin-inline-actions">
											<button className="admin-btn" onClick={() => onEditCoupon(entry)}>Edit</button>
											<button className="admin-btn admin-btn-danger" onClick={() => onDeleteCoupon(entry._id)}>Delete</button>
										</div>
									</td>
								</tr>
							))}
							{coupons.length === 0 && (
								<tr><td colSpan={9} style={{ textAlign: "center" }}>No coupons found.</td></tr>
							)}
						</tbody>
					</table>
				</div>
			</div>
		</section>
	);
}