import { useState, useMemo } from "react";
import type { AdminCharmItem } from "../../_lib/admin.types";

type AdminCharmsTabProps = {
	charms: AdminCharmItem[];
	onEdit: (charm: AdminCharmItem) => void;
	onDelete: (id: string) => void;
};

export default function AdminCharmsTab({ charms, onEdit, onDelete }: AdminCharmsTabProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [categoryFilter, setCategoryFilter] = useState("all");

	const uniqueCategories = useMemo(() => Array.from(new Set(charms.map(c => c.charmCategory))).filter(Boolean), [charms]);

	const filteredCharms = useMemo(() => {
		return charms.filter(c => {
			const q = searchQuery.toLowerCase();
			const matchesSearch = !q || c.name.toLowerCase().includes(q) || (c.parentCategory || "").toLowerCase().includes(q);
			const matchesCat = categoryFilter === "all" || c.charmCategory === categoryFilter;
			return matchesSearch && matchesCat;
		});
	}, [charms, searchQuery, categoryFilter]);

	return (
		<section className="admin-content">
			<div className="admin-panel">
				<h2>Charms List</h2>
				
				<div className="admin-controls">
					<input 
						type="text" 
						className="admin-search" 
						placeholder="Search by charm name or parent category..." 
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
					<select className="admin-filter" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
						<option value="all">All Categories</option>
						{uniqueCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
					</select>
				</div>

				<div className="admin-table-wrap">
					<table className="admin-table">
						<thead><tr><th>Name</th><th>Price</th><th>Category</th><th>Parent</th><th>Order</th><th>Active</th><th>Actions</th></tr></thead>
						<tbody>
							{filteredCharms.map((entry) => (
								<tr key={entry._id}>
									<td>{entry.emoji} {entry.name}</td>
									<td>INR {entry.price}</td>
									<td>{entry.charmCategory}</td>
									<td>{entry.parentCategory}</td>
									<td>{entry.sortOrder}</td>
									<td>{entry.active === false ? "No" : "Yes"}</td>
									<td>
										<div className="admin-inline-actions">
											<button className="admin-btn" onClick={() => onEdit(entry)}>Edit</button>
											<button className="admin-btn admin-btn-danger" onClick={() => onDelete(entry._id)}>Delete</button>
										</div>
									</td>
								</tr>
							))}
							{filteredCharms.length === 0 && (
								<tr>
									<td colSpan={7} style={{ textAlign: "center", padding: "20px" }}>No charms found.</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>
		</section>
	);
}