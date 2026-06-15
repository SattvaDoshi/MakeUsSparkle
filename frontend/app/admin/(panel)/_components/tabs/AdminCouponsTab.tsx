import { useState, useMemo } from "react";
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
	const [offerSearch, setOfferSearch] = useState("");
	const [offerTypeFilter, setOfferTypeFilter] = useState("all");

	const [couponSearch, setCouponSearch] = useState("");
	const [couponTypeFilter, setCouponTypeFilter] = useState("all");

	const filteredOffers = useMemo(() => {
		return offers.filter(o => {
			const q = offerSearch.toLowerCase();
			const matchesSearch = !q || o.title.toLowerCase().includes(q);
			const matchesType = offerTypeFilter === "all" || o.offerType === offerTypeFilter;
			return matchesSearch && matchesType;
		});
	}, [offers, offerSearch, offerTypeFilter]);

	const filteredCoupons = useMemo(() => {
		return coupons.filter(c => {
			const q = couponSearch.toLowerCase();
			const matchesSearch = !q || c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q);
			const matchesType = couponTypeFilter === "all" || c.discountType === couponTypeFilter;
			return matchesSearch && matchesType;
		});
	}, [coupons, couponSearch, couponTypeFilter]);

	return (
		<section className="admin-content">
			<div className="admin-panel">
				<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
					<h2>Offers</h2>
					<button className="admin-btn" onClick={onAddOffer}>Add Offer</button>
				</div>
				<div className="admin-controls">
					<input 
						type="text" 
						className="admin-search" 
						placeholder="Search offers by title..." 
						value={offerSearch}
						onChange={(e) => setOfferSearch(e.target.value)}
					/>
					<select className="admin-filter" value={offerTypeFilter} onChange={(e) => setOfferTypeFilter(e.target.value)}>
						<option value="all">All Types</option>
						<option value="bogo">BOGO</option>
						<option value="percentage">Percentage</option>
						<option value="fixed">Fixed</option>
						<option value="buy_x_for_y">Buy X for Y</option>
						<option value="free_shipping">Free Shipping</option>
					</select>
				</div>
				<div className="admin-table-wrap">
					<table className="admin-table">
						<thead><tr><th>Title</th><th>Type</th><th>Value</th><th>Usage</th><th>Expiry</th><th>Active</th><th>Actions</th></tr></thead>
						<tbody>
							{filteredOffers.map((entry) => (
								<tr key={entry._id}>
									<td>{entry.title}</td>
									<td>{entry.offerType === "bogo" ? `Buy ${entry.buyQuantity} Get ${entry.getQuantity}` : entry.offerType === "buy_x_for_y" ? `Buy ${entry.buyQuantity} for ${entry.discountValue}` : entry.offerType === "free_shipping" ? "Free Shipping" : entry.offerType}</td>
									<td>{entry.offerType === "bogo" || entry.offerType === "free_shipping" || entry.offerType === "buy_x_for_y" ? "-" : entry.discountValue}</td>
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
							{filteredOffers.length === 0 && (
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
				<div className="admin-controls">
					<input 
						type="text" 
						className="admin-search" 
						placeholder="Search coupons by code or name..." 
						value={couponSearch}
						onChange={(e) => setCouponSearch(e.target.value)}
					/>
					<select className="admin-filter" value={couponTypeFilter} onChange={(e) => setCouponTypeFilter(e.target.value)}>
						<option value="all">All Types</option>
						<option value="percentage">Percentage</option>
						<option value="fixed">Fixed</option>
						<option value="free_shipping">Free Shipping</option>
					</select>
				</div>
				<div className="admin-table-wrap">
					<table className="admin-table">
						<thead><tr><th>Code</th><th>Name</th><th>Type</th><th>Value</th><th>Min Order</th><th>Used/Limit</th><th>Expiry</th><th>Active</th><th>Actions</th></tr></thead>
						<tbody>
							{filteredCoupons.map((entry) => (
								<tr key={entry._id}>
									<td>{entry.code}</td>
									<td>{entry.name}</td>
									<td>{entry.discountType === "free_shipping" ? "Free Shipping" : entry.discountType}</td>
									<td>{entry.discountType === "free_shipping" ? "-" : entry.discountValue}</td>
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
							{filteredCoupons.length === 0 && (
								<tr><td colSpan={9} style={{ textAlign: "center" }}>No coupons found.</td></tr>
							)}
						</tbody>
					</table>
				</div>
			</div>
		</section>
	);
}