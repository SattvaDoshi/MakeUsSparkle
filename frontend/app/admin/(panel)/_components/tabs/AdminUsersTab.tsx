import { useState, useMemo } from "react";
import type { AdminUser } from "../../_lib/admin.types";

type AdminUsersTabProps = {
	users: AdminUser[];
	onEdit: (user: AdminUser) => void;
	onDelete: (id: string) => void;
};

export default function AdminUsersTab({ users, onEdit, onDelete }: AdminUsersTabProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [roleFilter, setRoleFilter] = useState("all");

	const filteredUsers = useMemo(() => {
		return users.filter(u => {
			const q = searchQuery.toLowerCase();
			const matchesSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
			const matchesRole = roleFilter === "all" || u.role === roleFilter;
			return matchesSearch && matchesRole;
		});
	}, [users, searchQuery, roleFilter]);

	return (
		<section className="admin-content">
			<div className="admin-panel">
				<h2>Users List</h2>
				
				<div className="admin-controls">
					<input 
						type="text" 
						className="admin-search" 
						placeholder="Search by name or email..." 
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
					<select className="admin-filter" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
						<option value="all">All Roles</option>
						<option value="admin">Admin</option>
						<option value="user">User</option>
					</select>
				</div>

				<div className="admin-table-wrap">
					<table className="admin-table">
						<thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Actions</th></tr></thead>
						<tbody>
							{filteredUsers.map((entry) => (
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
							{filteredUsers.length === 0 && (
								<tr>
									<td colSpan={4} style={{ textAlign: "center", padding: "20px" }}>No users found.</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>
		</section>
	);
}