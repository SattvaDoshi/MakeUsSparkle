import { useState, useMemo } from "react";
import type { AdminProduct } from "../../_lib/admin.types";

type AdminProductsTabProps = {
	products: AdminProduct[];
	onEdit: (product: AdminProduct) => void;
	onDelete: (id: string) => void;
};

export default function AdminProductsTab({ products, onEdit, onDelete }: AdminProductsTabProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [genderFilter, setGenderFilter] = useState("all");

	const filteredProducts = useMemo(() => {
		return products.filter(p => {
			const matchesSearch = !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase());
			const matchesGender = genderFilter === "all" || p.gender === genderFilter;
			return matchesSearch && matchesGender;
		});
	}, [products, searchQuery, genderFilter]);

	return (
		<section className="admin-content">
			<div className="admin-panel">
				<h2>Products List</h2>
				
				<div className="admin-controls">
					<input 
						type="text" 
						className="admin-search" 
						placeholder="Search by product title..." 
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
					<select className="admin-filter" value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)}>
						<option value="all">All Genders</option>
						<option value="men">Men</option>
						<option value="women">Women</option>
						<option value="kids">Kids</option>
						<option value="unisex">Unisex</option>
					</select>
				</div>

				<div className="admin-table-wrap">
					<table className="admin-table">
						<thead><tr><th>Title</th><th>Price</th><th>Stock</th><th>Gender</th><th>Actions</th></tr></thead>
						<tbody>
							{filteredProducts.map((entry) => (
								<tr key={entry._id}>
									<td>{entry.title || "-"}</td>
									<td>INR {Math.round(entry.price || 0).toLocaleString()}</td>
									<td>{entry.stock ?? "-"}</td>
									<td>{entry.gender || "-"}</td>
									<td>
										<div className="admin-inline-actions">
											<button className="admin-btn" onClick={() => onEdit(entry)}>Edit</button>
											<button className="admin-btn admin-btn-danger" onClick={() => onDelete(entry._id)}>Delete</button>
										</div>
									</td>
								</tr>
							))}
							{filteredProducts.length === 0 && (
								<tr>
									<td colSpan={5} style={{ textAlign: "center", padding: "20px" }}>No products found.</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>
		</section>
	);
}