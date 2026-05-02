import type { AdminProduct } from "../../_lib/admin.types";

type AdminProductsTabProps = {
	products: AdminProduct[];
	onEdit: (product: AdminProduct) => void;
	onDelete: (id: string) => void;
};

export default function AdminProductsTab({ products, onEdit, onDelete }: AdminProductsTabProps) {
	return (
		<section className="admin-content">
			<div className="admin-panel">
				<h2>Products List</h2>
				<div className="admin-table-wrap">
					<table className="admin-table">
						<thead><tr><th>Title</th><th>Price</th><th>Stock</th><th>Gender</th><th>Actions</th></tr></thead>
						<tbody>
							{products.map((entry) => (
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
						</tbody>
					</table>
				</div>
			</div>
		</section>
	);
}