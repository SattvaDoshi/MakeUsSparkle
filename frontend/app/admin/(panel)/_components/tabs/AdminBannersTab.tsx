import { useState } from "react";
import type { AdminBanner, MainBanner } from "../../_lib/admin.types";

type AdminBannersTabProps = {
	banners: AdminBanner[];
	mainBanners: MainBanner[];
	onEdit: (banner: AdminBanner) => void;
	onDelete: (id: string) => void;
	onCreateMainBanner: (payload: FormData) => Promise<void>;
	onUpdateMainBanner: (id: string, payload: FormData) => Promise<void>;
	onDeleteMainBanner: (id: string) => void;
};

export default function AdminBannersTab({
	banners,
	mainBanners,
	onEdit,
	onDelete,
	onCreateMainBanner,
	onUpdateMainBanner,
	onDeleteMainBanner,
}: AdminBannersTabProps) {
	const [mainLink, setMainLink] = useState("");
	const [mainIsActive, setMainIsActive] = useState(true);
	const [mainImageFile, setMainImageFile] = useState<File | null>(null);
	const [editingMainId, setEditingMainId] = useState<string | null>(null);

	const resetMainForm = () => {
		setMainLink("");
		setMainIsActive(true);
		setMainImageFile(null);
		setEditingMainId(null);
	};

	const handleMainSubmit = async () => {
		const formData = new FormData();
		formData.append("link", mainLink);
		formData.append("isActive", String(mainIsActive));
		if (mainImageFile) {
			formData.append("image", mainImageFile);
		}

		if (editingMainId) {
			await onUpdateMainBanner(editingMainId, formData);
		} else {
			if (!mainImageFile) {
				window.alert("Please select an image");
				return;
			}
			await onCreateMainBanner(formData);
		}

		resetMainForm();
	};

	const startEditMain = (banner: MainBanner) => {
		setEditingMainId(banner._id);
		setMainLink(banner.link || "");
		setMainIsActive(banner.isActive !== false);
		setMainImageFile(null);
	};

	const handleToggleMain = async (banner: MainBanner) => {
		const formData = new FormData();
		formData.append("link", banner.link || "");
		formData.append("isActive", String(!(banner.isActive !== false)));
		await onUpdateMainBanner(banner._id, formData);
	};

	return (
		<section className="admin-content">
			<div className="admin-panel">
				<h2>Main Banner</h2>
				<div className="admin-form-grid" style={{ marginBottom: "1rem" }}>
					<input
						type="file"
						accept="image/*"
						onChange={(event) => setMainImageFile(event.target.files?.[0] || null)}
					/>
					<input
						placeholder="Redirect Link"
						value={mainLink}
						onChange={(event) => setMainLink(event.target.value)}
					/>
					<label className="admin-checkbox">
						<input
							type="checkbox"
							checked={mainIsActive}
							onChange={(event) => setMainIsActive(event.target.checked)}
						/>
						Active
					</label>
					<div className="admin-inline-actions">
						<button className="admin-btn" type="button" onClick={() => void handleMainSubmit()}>
							{editingMainId ? "Update Main Banner" : "Add Main Banner"}
						</button>
						{editingMainId ? (
							<button className="admin-btn admin-btn-muted" type="button" onClick={resetMainForm}>
								Cancel
							</button>
						) : null}
					</div>
				</div>

				<div className="admin-table-wrap" style={{ marginBottom: "1.5rem" }}>
					<table className="admin-table">
						<thead><tr><th>Image</th><th>Link</th><th>Active</th><th>Actions</th></tr></thead>
						<tbody>
							{mainBanners.map((entry) => (
								<tr key={entry._id}>
									<td>{entry.image ? "Uploaded" : "-"}</td>
									<td>{entry.link || "-"}</td>
									<td>{entry.isActive === false ? "No" : "Yes"}</td>
									<td>
										<div className="admin-inline-actions">
											<button className="admin-btn" onClick={() => startEditMain(entry)}>Edit</button>
											<button className="admin-btn" onClick={() => void handleToggleMain(entry)}>
												{entry.isActive === false ? "Turn On" : "Turn Off"}
											</button>
											<button className="admin-btn admin-btn-danger" onClick={() => onDeleteMainBanner(entry._id)}>Delete</button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

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