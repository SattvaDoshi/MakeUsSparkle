import type { AdminCharmItem } from "../../_lib/admin.types";

type AdminCharmsTabProps = {
	charms: AdminCharmItem[];
	onEdit: (charm: AdminCharmItem) => void;
	onDelete: (id: string) => void;
};

export default function AdminCharmsTab({ charms, onEdit, onDelete }: AdminCharmsTabProps) {
	return (
		<section className="admin-content">
			<div className="admin-panel">
				<h2>Charms List</h2>
				<div className="admin-table-wrap">
					<table className="admin-table">
						<thead><tr><th>Name</th><th>Price</th><th>Category</th><th>Parent</th><th>Order</th><th>Active</th><th>Actions</th></tr></thead>
						<tbody>
							{charms.map((entry) => (
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
						</tbody>
					</table>
				</div>
			</div>
		</section>
	);
}