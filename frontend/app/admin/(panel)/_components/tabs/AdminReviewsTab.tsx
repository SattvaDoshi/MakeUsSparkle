import React, { useState, useMemo, useEffect, type FormEvent } from "react";
import { apiRequest } from "@/lib/api";

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
	const [searchQuery, setSearchQuery] = useState("");

	// Rewards settings
	const [pointsPerReview, setPointsPerReview] = useState<number | null>(null);
	const [editingPoints, setEditingPoints] = useState(false);
	const [draftPoints, setDraftPoints] = useState("");
	const [savingPoints, setSavingPoints] = useState(false);
	const [pointsError, setPointsError] = useState("");
	const [pointsSuccess, setPointsSuccess] = useState(false);

	useEffect(() => {
		apiRequest<{ success: boolean; pointsPerReview: number }>("/admin/rewards-settings")
			.then((data) => {
				setPointsPerReview(data.pointsPerReview);
				setDraftPoints(String(data.pointsPerReview));
			})
			.catch(() => {
				setPointsPerReview(50);
				setDraftPoints("50");
			});
	}, []);

	const handleSavePoints = async () => {
		const parsed = Number(draftPoints);
		if (isNaN(parsed) || parsed < 0) {
			setPointsError("Please enter a valid non-negative number.");
			return;
		}
		setSavingPoints(true);
		setPointsError("");
		setPointsSuccess(false);
		try {
			const result = await apiRequest<{ success: boolean; pointsPerReview: number }>("/admin/rewards-settings", {
				method: "PUT",
				body: JSON.stringify({ pointsPerReview: parsed }),
			});
			setPointsPerReview(result.pointsPerReview);
			setDraftPoints(String(result.pointsPerReview));
			setEditingPoints(false);
			setPointsSuccess(true);
			setTimeout(() => setPointsSuccess(false), 3000);
		} catch {
			setPointsError("Failed to save. Please try again.");
		} finally {
			setSavingPoints(false);
		}
	};

	const filteredReviews = useMemo(() => {
		return reviews.filter(r => {
			if (!searchQuery) return true;
			const q = searchQuery.toLowerCase();
			return (
				(r.productTitle || "").toLowerCase().includes(q) ||
				(r.user?.name || "").toLowerCase().includes(q) ||
				(r.user?.email || "").toLowerCase().includes(q)
			);
		});
	}, [reviews, searchQuery]);

	return (
		<section className="admin-content">
			<div className="admin-panel">
				<h2>Reviews</h2>

				{/* ── Rewards Settings Banner ── */}
				<div style={{
					background: "linear-gradient(135deg, #253d18 0%, #3b6228 100%)",
					borderRadius: 12,
					padding: "16px 20px",
					marginBottom: 20,
					display: "flex",
					alignItems: "center",
					gap: 16,
					flexWrap: "wrap",
				}}>
					<div style={{ flex: 1, minWidth: 200 }}>
						<p style={{ fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", color: "rgba(255,255,255,.55)", marginBottom: 4 }}>
							✦ Sparkle Points per Review
						</p>
						{editingPoints ? (
							<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
								<input
									type="number"
									min={0}
									value={draftPoints}
									onChange={(e) => setDraftPoints(e.target.value)}
									style={{
										width: 90,
										padding: "6px 10px",
										borderRadius: 8,
										border: "1px solid rgba(255,255,255,.3)",
										background: "rgba(255,255,255,.12)",
										color: "#fff",
										fontSize: 18,
										fontWeight: 700,
									}}
								/>
								<span style={{ color: "rgba(255,255,255,.5)", fontSize: 13 }}>pts per review</span>
							</div>
						) : (
							<p style={{ fontSize: 26, fontWeight: 800, color: "#fff", margin: 0 }}>
								{pointsPerReview ?? "—"}
								<span style={{ fontSize: 13, fontWeight: 400, color: "rgba(255,255,255,.6)", marginLeft: 6 }}>pts per review</span>
							</p>
						)}
						{pointsError && <p style={{ color: "#fca5a5", fontSize: 11, marginTop: 4 }}>{pointsError}</p>}
						{pointsSuccess && <p style={{ color: "#86efac", fontSize: 11, marginTop: 4 }}>✓ Saved successfully!</p>}
					</div>
					<div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
						{editingPoints ? (
							<>
								<button
									className="admin-btn"
									onClick={handleSavePoints}
									disabled={savingPoints}
									style={{ background: "#c8992e", border: "none", color: "#fff" }}
								>
									{savingPoints ? "Saving…" : "Save"}
								</button>
								<button
									className="admin-btn admin-btn-muted"
									onClick={() => {
										setEditingPoints(false);
										setDraftPoints(String(pointsPerReview ?? 50));
										setPointsError("");
									}}
								>
									Cancel
								</button>
							</>
						) : (
							<button
								className="admin-btn"
								onClick={() => setEditingPoints(true)}
								style={{ background: "rgba(255,255,255,.15)", border: "1px solid rgba(255,255,255,.25)", color: "#fff" }}
							>
								✎ Edit
							</button>
						)}
					</div>
				</div>

				<div className="admin-controls">
					<input
						type="text"
						className="admin-search"
						placeholder="Search reviews by product or user..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</div>

				{!!editingReview && (
					<form className="admin-form-grid" onSubmit={onSubmit} style={{ marginBottom: "1.5rem" }}>
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
						<thead><tr><th>Product</th><th>User</th><th>Rating</th><th>Verified Purchase</th><th>Comment</th><th>Actions</th></tr></thead>
						<tbody>
							{filteredReviews.map((entry) => (
								<tr key={entry.reviewId}>
									<td>{entry.productTitle}</td>
									<td>{entry.user?.name || entry.user?.email || "-"}</td>
									<td>{entry.rating || "-"}</td>
									<td>{entry.isVerifiedPurchase ? "✓ Yes" : "No"}</td>
									<td>{entry.comment || "-"}</td>
									<td>
										<div className="admin-inline-actions">
											<button className="admin-btn" onClick={() => onEdit(entry)}>Edit</button>
											<button className="admin-btn admin-btn-danger" onClick={() => void onDelete(entry.productId, entry.reviewId)}>Delete</button>
										</div>
									</td>
								</tr>
							))}
							{filteredReviews.length === 0 && (
								<tr>
									<td colSpan={6} style={{ textAlign: "center", padding: "20px" }}>No reviews found.</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>
		</section>
	);
}