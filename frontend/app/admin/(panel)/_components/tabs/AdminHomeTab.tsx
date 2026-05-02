import type { DashboardStatsResponse } from "../../_lib/admin.types";

type AdminHomeTabProps = {
	stats: DashboardStatsResponse["stats"] | null;
	totalManagedItems: number;
};

export default function AdminHomeTab({ stats, totalManagedItems }: AdminHomeTabProps) {
	return (
		<section className="admin-content">
			{!!stats && (
				<section className="admin-stats-grid">
					<article className="admin-stat-card"><h3>Users</h3><p>{stats.users}</p></article>
					<article className="admin-stat-card"><h3>Orders</h3><p>{stats.orders}</p></article>
					<article className="admin-stat-card"><h3>Products</h3><p>{stats.products}</p></article>
					<article className="admin-stat-card"><h3>Revenue</h3><p>INR {Math.round(stats.revenue).toLocaleString()}</p></article>
					<article className="admin-stat-card"><h3>Visible Records</h3><p>{totalManagedItems}</p></article>
				</section>
			)}
		</section>
	);
}