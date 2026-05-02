import type { FormEvent } from "react";

import type { AdminReview } from "../../_lib/admin.types";

type EditingReview = { productId: string; reviewId: string; rating: string; comment: string } | null;

type AdminReviewsTabProps = {
	reviews: AdminReview[];
	editingReview: EditingReview;
	onChangeEditingReview: (next: EditingReview) => void;
	onSubmit: (event: FormEvent) => void;
	onEdit: (review: AdminReview) => void;
	onDelete: (productId: string, reviewId: string) => void;
};

export default function AdminReviewsTab({ reviews, editingReview, onChangeEditingReview, onSubmit, onEdit, onDelete }: AdminReviewsTabProps) {
	return (
		<section className="admin-content">
			<div className="admin-panel">
				<h2>Reviews</h2>
				{!!editingReview && (
					<form className="admin-form-grid" onSubmit={onSubmit}>
						<input type="number" min={1} max={5} value={editingReview.rating} onChange={(event) => onChangeEditingReview(editingReview ? ({ ...editingReview, rating: event.target.value }) : null)} required />
						<textarea value={editingReview.comment} onChange={(event) => onChangeEditingReview(editingReview ? ({ ...editingReview, comment: event.target.value }) : null)} required />
						<div className="admin-inline-actions">
							<button className="admin-btn" type="submit">Save Review</button>
							<button className="admin-btn admin-btn-muted" type="button" onClick={() => onChangeEditingReview(null)}>Cancel</button>
						</div>
					</form>
				)}

				<div className="admin-table-wrap">
					<table className="admin-table">
						<thead><tr><th>Product</th><th>User</th><th>Rating</th><th>Comment</th><th>Actions</th></tr></thead>
						<tbody>
							{reviews.map((entry) => (
								<tr key={entry.reviewId}>
									<td>{entry.productTitle}</td>
									<td>{entry.user?.name || entry.user?.email || "-"}</td>
									<td>{entry.rating || "-"}</td>
									<td>{entry.comment || "-"}</td>
									<td>
										<div className="admin-inline-actions">
											<button className="admin-btn" onClick={() => onEdit(entry)}>Edit</button>
											<button className="admin-btn admin-btn-danger" onClick={() => void onDelete(entry.productId, entry.reviewId)}>Delete</button>
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