import type { AdminBanner } from "../../_lib/admin.types";

type AdminBannersTabProps = {
	banners: AdminBanner[];
	onEdit: (banner: AdminBanner) => void;
	onDelete: (id: string) => void;
};

export default function AdminBannersTab({ banners, onEdit, onDelete }: AdminBannersTabProps) {
	return (
		<section className="admin-content">
			<div className="admin-panel">
				<h2>Banners List</h2>
				<div className="admin-table-wrap">
					<table className="admin-table">
						<thead><tr><th>Title</th><th>Tag</th><th>Active</th><th>Order</th><th>Link</th><th>Actions</th></tr></thead>
						<tbody>
							{banners.map((entry) => (
								<tr key={entry._id}>
									<td>{entry.title || entry.text || "-"}</td>
									<td>{entry.tag || "-"}</td>
									<td>{entry.isActive === false ? "No" : "Yes"}</td>
									<td>{entry.sortOrder ?? 0}</td>
									<td>{entry.link || "-"}</td>
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