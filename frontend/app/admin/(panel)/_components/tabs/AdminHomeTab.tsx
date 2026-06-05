import type { DashboardStatsResponse, SalesAnalyticsItem, ProductAnalyticsItem, OrderAnalyticsItem } from "../../_lib/admin.types";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

type AdminHomeTabProps = {
	stats: DashboardStatsResponse["stats"] | null;
	totalManagedItems: number;
	salesAnalytics: SalesAnalyticsItem[];
	productAnalytics: ProductAnalyticsItem[];
	orderAnalytics: OrderAnalyticsItem[];
};

const COLORS = ['#4a5c22', '#8da848', '#283513', '#cbe584', '#6b8235'];

export default function AdminHomeTab({ stats, totalManagedItems, salesAnalytics, productAnalytics, orderAnalytics }: AdminHomeTabProps) {
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

			<section className="admin-charts-grid">
				<article className="admin-chart-card">
					<h3>Revenue Over Time</h3>
					<div className="admin-chart-container">
						<ResponsiveContainer width="100%" height={300}>
							<LineChart data={salesAnalytics} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
								<CartesianGrid strokeDasharray="3 3" opacity={0.3} />
								<XAxis dataKey="_id" tick={{ fontSize: 12 }} />
								<YAxis tick={{ fontSize: 12 }} />
								<Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
								<Legend />
								<Line type="monotone" dataKey="totalSales" name="Revenue (INR)" stroke="#4a5c22" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
							</LineChart>
						</ResponsiveContainer>
					</div>
				</article>

				<article className="admin-chart-card">
					<h3>Top Selling Products</h3>
					<div className="admin-chart-container">
						<ResponsiveContainer width="100%" height={300}>
							<BarChart data={productAnalytics.slice(0, 5)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
								<CartesianGrid strokeDasharray="3 3" opacity={0.3} />
								<XAxis dataKey="name" tick={{ fontSize: 11 }} tickFormatter={(val) => val.length > 15 ? val.substring(0, 15) + '...' : val} />
								<YAxis tick={{ fontSize: 12 }} />
								<Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
								<Legend />
								<Bar dataKey="ordersCount" name="Units Sold" fill="#8da848" radius={[4, 4, 0, 0]} />
							</BarChart>
						</ResponsiveContainer>
					</div>
				</article>

				<article className="admin-chart-card admin-chart-full">
					<h3>Order Status Breakdown</h3>
					<div className="admin-chart-container">
						<ResponsiveContainer width="100%" height={300}>
							<PieChart>
								<Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
								<Legend />
								<Pie
									data={orderAnalytics}
									cx="50%"
									cy="50%"
									labelLine={false}
									outerRadius={100}
									fill="#8884d8"
									dataKey="count"
									nameKey="_id"
									label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
								>
									{orderAnalytics.map((entry, index) => (
										<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
									))}
								</Pie>
							</PieChart>
						</ResponsiveContainer>
					</div>
				</article>
			</section>
		</section>
	);
}