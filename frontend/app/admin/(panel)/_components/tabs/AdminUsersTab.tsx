import type { AdminUser } from "../../_lib/admin.types";

type AdminUsersTabProps = {
	users: AdminUser[];
	onEdit: (user: AdminUser) => void;
	onDelete: (id: string) => void;
};

export default function AdminUsersTab({ users, onEdit, onDelete }: AdminUsersTabProps) {
	return (
		<section className="admin-content">
			<div className="admin-panel">
				<h2>Users List</h2>
				<div className="admin-table-wrap">
					<table className="admin-table">
						<thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Actions</th></tr></thead>
						<tbody>
							{users.map((entry) => (
								<tr key={entry._id}>
									<td>{entry.name}</td>
									<td>{entry.email}</td>
									<td>{entry.role}</td>
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