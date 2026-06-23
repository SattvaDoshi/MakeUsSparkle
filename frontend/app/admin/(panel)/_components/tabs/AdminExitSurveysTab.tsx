import React from "react";
import type { AdminExitSurvey } from "../../_lib/admin.types";

type Props = {
	surveys: AdminExitSurvey[];
};

export default function AdminExitSurveysTab({ surveys }: Props) {
	return (
		<section className="admin-content">
			<div className="admin-panel">
				<h2>Exit Surveys</h2>
				<p style={{ marginBottom: "1.5rem", color: "var(--olive-muted)", fontSize: "0.9rem" }}>
					{surveys.length} total responses
				</p>

				<div className="admin-table-wrap">
					<table className="admin-table">
						<thead>
							<tr>
								<th>Date</th>
								<th>Reason</th>
								<th>Additional Comments</th>
							</tr>
						</thead>
						<tbody>
							{surveys.length === 0 ? (
								<tr>
									<td colSpan={3} style={{ textAlign: "center", padding: "2rem", color: "var(--olive-muted)" }}>
										No exit surveys recorded yet.
									</td>
								</tr>
							) : (
								surveys.map((survey) => (
									<tr key={survey._id}>
										<td>{survey.createdAt ? new Date(survey.createdAt).toLocaleDateString() : "-"}</td>
										<td style={{ fontWeight: 600 }}>{survey.reason}</td>
										<td>{survey.otherText || <span style={{ color: "var(--olive-muted)", fontStyle: "italic" }}>None</span>}</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>
		</section>
	);
}
