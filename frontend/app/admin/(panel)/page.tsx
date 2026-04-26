"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/authContext";
import AdminProductModal from "./AdminProductModal";

type DashboardStatsResponse = {
	success: boolean;
	stats: {
		users: number;
		orders: number;
		products: number;
		revenue: number;
	};
};

type AdminUser = {
	_id: string;
	name: string;
	email: string;
	phone?: string;
	role: "user" | "admin";
	createdAt?: string;
};

type AdminProduct = {
	_id: string;
	title: string;
	description?: string;
	price?: number;
	stock?: number;
	gender?: "male" | "female" | "unisex";
	createdAt?: string;
};

type AdminOrder = {
	_id: string;
	totalAmount?: number;
	status?: "placed" | "shipped" | "delivered" | "cancelled";
	paymentStatus?: "pending" | "paid" | "failed";
	paymentMode?: string;
	user?: {
		name?: string;
		email?: string;
	};
	createdAt?: string;
};

type AdminCoupon = {
	_id: string;
	code: string;
	name: string;
	discountType: "percentage" | "fixed";
	discountValue: number;
	usageLimit?: number;
	expiryDate?: string;
	isActive?: boolean;
};

type AdminBanner = {
	_id: string;
	text?: string;
	link?: string;
	description?: string;
	tags?: string[];
	product?: {
		_id: string;
		title?: string;
	};
};

type AdminReview = {
	productId: string;
	productTitle: string;
	reviewId: string;
	rating?: number;
	comment?: string;
	user?: {
		name?: string;
		email?: string;
	};
};

type PagedResponse<T, K extends string> = {
	success: boolean;
	pagination: {
		page: number;
		limit: number;
		total: number;
	};
} & Record<K, T[]>;

type TabKey = "home" | "products" | "users" | "orders" | "payments" | "coupons" | "banners" | "reviews";

const tabs: Array<{ key: TabKey; label: string }> = [
	{ key: "home", label: "Home" },
	{ key: "products", label: "Products" },
	{ key: "users", label: "Users" },
	{ key: "orders", label: "Orders" },
	{ key: "payments", label: "Payments" },
	{ key: "coupons", label: "Coupons" },
	{ key: "banners", label: "Banners" },
	{ key: "reviews", label: "Reviews" },
];

const orderStatuses: Array<AdminOrder["status"]> = ["placed", "shipped", "delivered", "cancelled"];
const paymentStatuses: Array<AdminOrder["paymentStatus"]> = ["pending", "paid", "failed"];

type ProductFormState = {
	id: string;
	title: string;
	price: string;
	stock: string;
	gender: "male" | "female" | "unisex";
	description: string;
};

type UserFormState = {
	id: string;
	name: string;
	email: string;
	phone: string;
	role: "user" | "admin";
	password: string;
};

type CouponFormState = {
	id: string;
	code: string;
	name: string;
	discountType: "percentage" | "fixed";
	discountValue: string;
	usageLimit: string;
	expiryDate: string;
	isActive: boolean;
};

type BannerFormState = {
	id: string;
	text: string;
	link: string;
	description: string;
	tags: string;
	product: string;
};

type ModalKind = "product" | "user" | "coupon" | "banner" | null;

const defaultProductForm: ProductFormState = {
	id: "",
	title: "",
	price: "",
	stock: "",
	gender: "unisex",
	description: "",
};

const defaultUserForm: UserFormState = {
	id: "",
	name: "",
	email: "",
	phone: "",
	role: "user",
	password: "",
};

const defaultCouponForm: CouponFormState = {
	id: "",
	code: "",
	name: "",
	discountType: "percentage",
	discountValue: "",
	usageLimit: "1",
	expiryDate: "",
	isActive: true,
};

const defaultBannerForm: BannerFormState = {
	id: "",
	text: "",
	link: "",
	description: "",
	tags: "",
	product: "",
};

const createActionsByTab: Partial<Record<TabKey, string>> = {
	products: "Add Product",
	users: "Add User",
	coupons: "Add Coupon",
	banners: "Add Banner",
};

const normalizeGender = (value?: string | null): ProductFormState["gender"] => {
	if (value === "male" || value === "female" || value === "unisex") {
		return value;
	}

	return "unisex";
};

export default function AdminDashboardPage() {
	const router = useRouter();
	const { user, signOut } = useAuth();

	const [activeTab, setActiveTab] = useState<TabKey>("home");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [notice, setNotice] = useState<string | null>(null);

	const [stats, setStats] = useState<DashboardStatsResponse["stats"] | null>(null);
	const [users, setUsers] = useState<AdminUser[]>([]);
	const [products, setProducts] = useState<AdminProduct[]>([]);
	const [orders, setOrders] = useState<AdminOrder[]>([]);
	const [payments, setPayments] = useState<AdminOrder[]>([]);
	const [coupons, setCoupons] = useState<AdminCoupon[]>([]);
	const [banners, setBanners] = useState<AdminBanner[]>([]);
	const [reviews, setReviews] = useState<AdminReview[]>([]);

	const [productForm, setProductForm] = useState(defaultProductForm);
	const [userForm, setUserForm] = useState(defaultUserForm);
	const [couponForm, setCouponForm] = useState(defaultCouponForm);
	const [bannerForm, setBannerForm] = useState(defaultBannerForm);
	const [modalKind, setModalKind] = useState<ModalKind>(null);
	const [modalMode, setModalMode] = useState<"create" | "edit">("create");
	const [selectedProduct, setSelectedProduct] = useState<any>(null);

	const [editingReview, setEditingReview] = useState<{ productId: string; reviewId: string; rating: string; comment: string } | null>(null);

	const totalManagedItems = useMemo(
		() => users.length + products.length + orders.length + payments.length + coupons.length + banners.length + reviews.length,
		[users, products, orders, payments, coupons, banners, reviews]
	);

	const resetMessages = () => {
		setError(null);
		setNotice(null);
	};

	const runAction = async (action: () => Promise<void>, successMessage: string) => {
		try {
			resetMessages();
			await action();
			setNotice(successMessage);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Request failed");
		}
	};

	const loadHome = useCallback(async () => {
		const dashboard = await apiRequest<DashboardStatsResponse>("/admin/dashboard");
		setStats(dashboard.stats);
	}, []);

	const loadUsers = useCallback(async () => {
		const usersResult = await apiRequest<PagedResponse<AdminUser, "users">>("/admin/users?limit=50");
		setUsers(usersResult.users);
	}, []);

	const loadProducts = useCallback(async () => {
		const productsResult = await apiRequest<PagedResponse<AdminProduct, "products">>("/admin/products?limit=50");
		setProducts(productsResult.products);
	}, []);

	const loadOrders = useCallback(async () => {
		const ordersResult = await apiRequest<PagedResponse<AdminOrder, "orders">>("/admin/orders?limit=50");
		setOrders(ordersResult.orders);
	}, []);

	const loadPayments = useCallback(async () => {
		const paymentsResult = await apiRequest<PagedResponse<AdminOrder, "payments">>("/admin/payments?limit=50");
		setPayments(paymentsResult.payments);
	}, []);

	const loadCoupons = useCallback(async () => {
		const couponsResult = await apiRequest<PagedResponse<AdminCoupon, "coupons">>("/admin/coupons?limit=50");
		setCoupons(couponsResult.coupons);
	}, []);

	const loadBanners = useCallback(async () => {
		const bannersResult = await apiRequest<PagedResponse<AdminBanner, "banners">>("/admin/banners?limit=50");
		setBanners(bannersResult.banners);
	}, []);

	const loadReviews = useCallback(async () => {
		const reviewsResult = await apiRequest<PagedResponse<AdminReview, "reviews">>("/admin/reviews?limit=100");
		setReviews(reviewsResult.reviews);
	}, []);

	const loadActiveTab = useCallback(async (tab: TabKey) => {
		setLoading(true);
		setError(null);
		try {
			if (tab === "home") {
				await Promise.all([loadHome(), loadUsers(), loadProducts(), loadOrders(), loadPayments()]);
			}
			if (tab === "users") await loadUsers();
			if (tab === "products") await loadProducts();
			if (tab === "orders") await loadOrders();
			if (tab === "payments") await loadPayments();
			if (tab === "coupons") await loadCoupons();
			if (tab === "banners") await loadBanners();
			if (tab === "reviews") await loadReviews();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to load admin data");
		} finally {
			setLoading(false);
		}
	}, [loadBanners, loadCoupons, loadHome, loadOrders, loadPayments, loadProducts, loadReviews, loadUsers]);

	useEffect(() => {
		void loadActiveTab(activeTab);
	}, [activeTab, loadActiveTab]);

	useEffect(() => {
		setModalKind(null);
		setModalMode("create");
		setEditingReview(null);
	}, [activeTab]);

	const refresh = () => {
		void loadActiveTab(activeTab);
	};

	const openCreateModal = () => {
		if (activeTab === "products") {
			setProductForm(defaultProductForm);
			setSelectedProduct(null);
			setModalMode("create");
			setModalKind("product");
		}

		if (activeTab === "users") {
			setUserForm(defaultUserForm);
			setModalMode("create");
			setModalKind("user");
		}

		if (activeTab === "coupons") {
			setCouponForm(defaultCouponForm);
			setModalMode("create");
			setModalKind("coupon");
		}

		if (activeTab === "banners") {
			setBannerForm(defaultBannerForm);
			setModalMode("create");
			setModalKind("banner");
		}
	};

	const handleDeleteUser = async (id: string) => {
		if (!window.confirm("Delete this user?")) {
			return;
		}

		await runAction(async () => {
			await apiRequest(`/admin/users/${id}`, { method: "DELETE" });
			await loadUsers();
			await loadHome();
		}, "User deleted");
	};

	const handleDeleteProduct = async (id: string) => {
		if (!window.confirm("Delete this product?")) {
			return;
		}

		await runAction(async () => {
			await apiRequest(`/admin/products/${id}`, { method: "DELETE" });
			await loadProducts();
			await loadHome();
		}, "Product deleted");
	};

	const handleOrderStatus = async (orderId: string, status: string) => {
		await runAction(async () => {
			await apiRequest(`/admin/orders/${orderId}/status`, {
				method: "PUT",
				body: JSON.stringify({ status }),
			});
			await loadOrders();
		}, "Order status updated");
	};

	const handlePaymentStatus = async (orderId: string, paymentStatus: string) => {
		await runAction(async () => {
			await apiRequest(`/admin/payments/${orderId}/status`, {
				method: "PUT",
				body: JSON.stringify({ paymentStatus }),
			});
			await loadPayments();
		}, "Payment status updated");
	};

	const handleDeleteOrder = async (id: string) => {
		if (!window.confirm("Delete this order?")) {
			return;
		}

		await runAction(async () => {
			await apiRequest(`/admin/orders/${id}`, { method: "DELETE" });
			await loadOrders();
			await loadHome();
		}, "Order deleted");
	};

	const handleProductSubmit = async (event: FormEvent) => {
		event.preventDefault();
		const payload = {
			title: productForm.title,
			description: productForm.description,
			price: Number(productForm.price),
			stock: Number(productForm.stock),
			gender: productForm.gender,
		};

		await runAction(async () => {
			if (productForm.id) {
				await apiRequest(`/admin/products/${productForm.id}`, {
					method: "PUT",
					body: JSON.stringify(payload),
				});
			} else {
				await apiRequest("/admin/products", {
					method: "POST",
					body: JSON.stringify(payload),
				});
			}

			setModalKind(null);
			setModalMode("create");
			setProductForm(defaultProductForm);
			await loadProducts();
			await loadHome();
		}, productForm.id ? "Product updated" : "Product created");
	};

	const handleUserSubmit = async (event: FormEvent) => {
		event.preventDefault();

		await runAction(async () => {
			if (userForm.id) {
				await apiRequest(`/admin/users/${userForm.id}`, {
					method: "PUT",
					body: JSON.stringify({
						name: userForm.name,
						email: userForm.email,
						phone: userForm.phone,
						role: userForm.role,
					}),
				});
			} else {
				await apiRequest("/admin/users", {
					method: "POST",
					body: JSON.stringify({
						name: userForm.name,
						email: userForm.email,
						phone: userForm.phone,
						role: userForm.role,
						password: userForm.password,
					}),
				});
			}

			setModalKind(null);
			setModalMode("create");
			setUserForm(defaultUserForm);
			await loadUsers();
			await loadHome();
		}, userForm.id ? "User updated" : "User created");
	};

	const handleCouponSubmit = async (event: FormEvent) => {
		event.preventDefault();
		const payload = {
			code: couponForm.code,
			name: couponForm.name,
			discountType: couponForm.discountType,
			discountValue: Number(couponForm.discountValue),
			usageLimit: Number(couponForm.usageLimit),
			expiryDate: couponForm.expiryDate ? new Date(couponForm.expiryDate).toISOString() : undefined,
			isActive: couponForm.isActive,
		};

		await runAction(async () => {
			if (couponForm.id) {
				await apiRequest(`/admin/coupons/${couponForm.id}`, {
					method: "PUT",
					body: JSON.stringify(payload),
				});
			} else {
				await apiRequest("/admin/coupons", {
					method: "POST",
					body: JSON.stringify(payload),
				});
			}

			setModalKind(null);
			setModalMode("create");
			setCouponForm(defaultCouponForm);
			await loadCoupons();
		}, couponForm.id ? "Coupon updated" : "Coupon created");
	};

	const handleDeleteCoupon = async (id: string) => {
		if (!window.confirm("Delete this coupon?")) {
			return;
		}

		await runAction(async () => {
			await apiRequest(`/admin/coupons/${id}`, { method: "DELETE" });
			await loadCoupons();
		}, "Coupon deleted");
	};

	const handleBannerSubmit = async (event: FormEvent) => {
		event.preventDefault();
		const payload = {
			text: bannerForm.text,
			link: bannerForm.link,
			description: bannerForm.description,
			product: bannerForm.product || undefined,
			tags: bannerForm.tags.split(",").map((item) => item.trim()).filter(Boolean),
		};

		await runAction(async () => {
			if (bannerForm.id) {
				await apiRequest(`/admin/banners/${bannerForm.id}`, {
					method: "PUT",
					body: JSON.stringify(payload),
				});
			} else {
				await apiRequest("/admin/banners", {
					method: "POST",
					body: JSON.stringify(payload),
				});
			}

			setModalKind(null);
			setModalMode("create");
			setBannerForm(defaultBannerForm);
			await loadBanners();
		}, bannerForm.id ? "Banner updated" : "Banner created");
	};

	const handleDeleteBanner = async (id: string) => {
		if (!window.confirm("Delete this banner?")) {
			return;
		}

		await runAction(async () => {
			await apiRequest(`/admin/banners/${id}`, { method: "DELETE" });
			await loadBanners();
		}, "Banner deleted");
	};

	const handleDeleteReview = async (productId: string, reviewId: string) => {
		if (!window.confirm("Delete this review?")) {
			return;
		}

		await runAction(async () => {
			await apiRequest(`/admin/reviews/${productId}/${reviewId}`, { method: "DELETE" });
			await loadReviews();
		}, "Review deleted");
	};

	const handleUpdateReview = async (event: FormEvent) => {
		event.preventDefault();
		if (!editingReview) {
			return;
		}

		await runAction(async () => {
			await apiRequest(`/admin/reviews/${editingReview.productId}/${editingReview.reviewId}`, {
				method: "PUT",
				body: JSON.stringify({
					rating: Number(editingReview.rating),
					comment: editingReview.comment,
				}),
			});
			setEditingReview(null);
			await loadReviews();
		}, "Review updated");
	};

	const handleSignOut = () => {
		signOut();
		router.push("/admin/login");
	};

	const renderHome = () => (
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

	const renderProducts = () => (
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
											<button className="admin-btn" onClick={() => {
												setSelectedProduct({ id: entry._id, ...entry });
												setModalMode("edit");
												setModalKind("product");
											}}>Edit</button>
											<button className="admin-btn admin-btn-danger" onClick={() => handleDeleteProduct(entry._id)}>Delete</button>
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

	const renderUsers = () => (
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
											<button className="admin-btn" onClick={() => {
												setUserForm({ id: entry._id, name: entry.name || "", email: entry.email || "", phone: entry.phone || "", role: entry.role || "user", password: "" });
												setModalMode("edit");
												setModalKind("user");
											}}>Edit</button>
											<button className="admin-btn admin-btn-danger" onClick={() => handleDeleteUser(entry._id)}>Delete</button>
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

	const renderOrders = () => (
		<section className="admin-content">
			<div className="admin-panel">
				<h2>Orders</h2>
				<div className="admin-table-wrap">
					<table className="admin-table">
						<thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th><th>Actions</th></tr></thead>
						<tbody>
							{orders.map((entry) => (
								<tr key={entry._id}>
									<td>{entry._id.slice(-8).toUpperCase()}</td>
									<td>{entry.user?.name || entry.user?.email || "-"}</td>
									<td>INR {Math.round(entry.totalAmount || 0).toLocaleString()}</td>
									<td>
										<select value={entry.status || "placed"} onChange={(event) => void handleOrderStatus(entry._id, event.target.value)}>
											{orderStatuses.map((status) => <option key={status} value={status || "placed"}>{status}</option>)}
										</select>
									</td>
									<td><button className="admin-btn admin-btn-danger" onClick={() => void handleDeleteOrder(entry._id)}>Delete</button></td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</section>
	);

	const renderPayments = () => (
		<section className="admin-content">
			<div className="admin-panel">
				<h2>Payments</h2>
				<div className="admin-table-wrap">
					<table className="admin-table">
						<thead><tr><th>Order</th><th>Customer</th><th>Mode</th><th>Status</th><th>Amount</th></tr></thead>
						<tbody>
							{payments.map((entry) => (
								<tr key={entry._id}>
									<td>{entry._id.slice(-8).toUpperCase()}</td>
									<td>{entry.user?.name || entry.user?.email || "-"}</td>
									<td>{entry.paymentMode || "-"}</td>
									<td>
										<select value={entry.paymentStatus || "pending"} onChange={(event) => void handlePaymentStatus(entry._id, event.target.value)}>
											{paymentStatuses.map((status) => <option key={status} value={status || "pending"}>{status}</option>)}
										</select>
									</td>
									<td>INR {Math.round(entry.totalAmount || 0).toLocaleString()}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</section>
	);

	const renderCoupons = () => (
		<section className="admin-content">
			<div className="admin-panel">
				<h2>Coupons List</h2>
				<div className="admin-table-wrap">
					<table className="admin-table">
						<thead><tr><th>Code</th><th>Name</th><th>Type</th><th>Value</th><th>Actions</th></tr></thead>
						<tbody>
							{coupons.map((entry) => (
								<tr key={entry._id}>
									<td>{entry.code}</td>
									<td>{entry.name}</td>
									<td>{entry.discountType}</td>
									<td>{entry.discountValue}</td>
									<td>
										<div className="admin-inline-actions">
											<button className="admin-btn" onClick={() => {
												setCouponForm({
													id: entry._id,
													code: entry.code ?? "",
													name: entry.name ?? "",
													discountType: entry.discountType === "fixed" ? "fixed" : "percentage",
													discountValue: entry.discountValue != null ? String(entry.discountValue) : "",
													usageLimit: entry.usageLimit != null ? String(entry.usageLimit) : "1",
													expiryDate: entry.expiryDate ? String(entry.expiryDate).slice(0, 10) : "",
													isActive: Boolean(entry.isActive),
												});
												setModalMode("edit");
												setModalKind("coupon");
											}}>Edit</button>
											<button className="admin-btn admin-btn-danger" onClick={() => void handleDeleteCoupon(entry._id)}>Delete</button>
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

	const renderBanners = () => (
		<section className="admin-content">
			<div className="admin-panel">
				<h2>Banners List</h2>
				<div className="admin-table-wrap">
					<table className="admin-table">
						<thead><tr><th>Text</th><th>Link</th><th>Tags</th><th>Actions</th></tr></thead>
						<tbody>
							{banners.map((entry) => (
								<tr key={entry._id}>
									<td>{entry.text || "-"}</td>
									<td>{entry.link || "-"}</td>
									<td>{(entry.tags || []).join(", ")}</td>
									<td>
										<div className="admin-inline-actions">
											<button className="admin-btn" onClick={() => {
												setBannerForm({
													id: entry._id,
													text: entry.text ?? "",
													link: entry.link ?? "",
													description: entry.description ?? "",
													tags: (entry.tags || []).join(", "),
													product: entry.product?._id ?? "",
												});
												setModalMode("edit");
												setModalKind("banner");
											}}>Edit</button>
											<button className="admin-btn admin-btn-danger" onClick={() => void handleDeleteBanner(entry._id)}>Delete</button>
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

	const renderReviews = () => (
		<section className="admin-content">
			<div className="admin-panel">
				<h2>Reviews</h2>
				{!!editingReview && (
					<form className="admin-form-grid" onSubmit={handleUpdateReview}>
						<input type="number" min={1} max={5} value={editingReview.rating} onChange={(event) => setEditingReview((prev) => prev ? ({ ...prev, rating: event.target.value }) : null)} required />
						<textarea value={editingReview.comment} onChange={(event) => setEditingReview((prev) => prev ? ({ ...prev, comment: event.target.value }) : null)} required />
						<div className="admin-inline-actions">
							<button className="admin-btn" type="submit">Save Review</button>
							<button className="admin-btn admin-btn-muted" type="button" onClick={() => setEditingReview(null)}>Cancel</button>
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
											<button className="admin-btn" onClick={() => setEditingReview({ productId: entry.productId, reviewId: entry.reviewId, rating: String(entry.rating || 5), comment: entry.comment || "" })}>Edit</button>
											<button className="admin-btn admin-btn-danger" onClick={() => void handleDeleteReview(entry.productId, entry.reviewId)}>Delete</button>
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

	const renderTabContent = () => {
		if (activeTab === "home") return renderHome();
		if (activeTab === "products") return renderProducts();
		if (activeTab === "users") return renderUsers();
		if (activeTab === "orders") return renderOrders();
		if (activeTab === "payments") return renderPayments();
		if (activeTab === "coupons") return renderCoupons();
		if (activeTab === "banners") return renderBanners();
		return renderReviews();
	};

	const renderModal = () => {
		if (!modalKind) {
			return null;
		}

		const closeModal = () => {
			setModalKind(null);
			setModalMode("create");
		};

		if (modalKind === "product") {
			return (
				<AdminProductModal
					mode={modalMode}
					initialData={selectedProduct}
					onClose={closeModal}
					onSuccess={async (message) => {
						closeModal();
						await loadProducts();
						await loadHome();
						setNotice(message);
					}}
				/>
			);
		}

		if (modalKind === "user") {
			return (
				<div className="admin-modal-backdrop" onClick={closeModal}>
					<div className="admin-modal" onClick={(event) => event.stopPropagation()}>
						<div className="admin-modal-header">
							<h3>{modalMode === "edit" ? "Edit User" : "Add User"}</h3>
							<button className="admin-btn admin-btn-muted" type="button" onClick={closeModal}>Close</button>
						</div>
						<form className="admin-form-grid" onSubmit={handleUserSubmit}>
							<input placeholder="Name" value={userForm.name ?? ""} onChange={(event) => setUserForm((prev) => ({ ...prev, name: event.target.value }))} required />
							<input placeholder="Email" type="email" value={userForm.email ?? ""} onChange={(event) => setUserForm((prev) => ({ ...prev, email: event.target.value }))} required />
							<input placeholder="Password" type="password" value={userForm.password ?? ""} onChange={(event) => setUserForm((prev) => ({ ...prev, password: event.target.value }))} required={modalMode === "create"} />
							<input placeholder="Phone" value={userForm.phone ?? ""} onChange={(event) => setUserForm((prev) => ({ ...prev, phone: event.target.value }))} />
							<select value={userForm.role ?? "user"} onChange={(event) => setUserForm((prev) => ({ ...prev, role: event.target.value as "user" | "admin" }))}>
								<option value="user">User</option>
								<option value="admin">Admin</option>
							</select>
							<div className="admin-inline-actions">
								<button className="admin-btn" type="submit">{modalMode === "edit" ? "Update User" : "Create User"}</button>
							</div>
						</form>
					</div>
				</div>
			);
		}

		if (modalKind === "coupon") {
			return (
				<div className="admin-modal-backdrop" onClick={closeModal}>
					<div className="admin-modal" onClick={(event) => event.stopPropagation()}>
						<div className="admin-modal-header">
							<h3>{modalMode === "edit" ? "Edit Coupon" : "Add Coupon"}</h3>
							<button className="admin-btn admin-btn-muted" type="button" onClick={closeModal}>Close</button>
						</div>
						<form className="admin-form-grid" onSubmit={handleCouponSubmit}>
							<input placeholder="Code" value={couponForm.code ?? ""} onChange={(event) => setCouponForm((prev) => ({ ...prev, code: event.target.value }))} required />
							<input placeholder="Name" value={couponForm.name ?? ""} onChange={(event) => setCouponForm((prev) => ({ ...prev, name: event.target.value }))} required />
							<select value={couponForm.discountType ?? "percentage"} onChange={(event) => setCouponForm((prev) => ({ ...prev, discountType: event.target.value as "percentage" | "fixed" }))}>
								<option value="percentage">Percentage</option>
								<option value="fixed">Fixed</option>
							</select>
							<input placeholder="Discount Value" type="number" value={couponForm.discountValue ?? ""} onChange={(event) => setCouponForm((prev) => ({ ...prev, discountValue: event.target.value }))} required />
							<input placeholder="Usage Limit" type="number" value={couponForm.usageLimit ?? ""} onChange={(event) => setCouponForm((prev) => ({ ...prev, usageLimit: event.target.value }))} />
							<input placeholder="Expiry" type="date" value={couponForm.expiryDate ?? ""} onChange={(event) => setCouponForm((prev) => ({ ...prev, expiryDate: event.target.value }))} />
							<label className="admin-checkbox"><input type="checkbox" checked={couponForm.isActive} onChange={(event) => setCouponForm((prev) => ({ ...prev, isActive: event.target.checked }))} />Active</label>
							<div className="admin-inline-actions">
								<button className="admin-btn" type="submit">{modalMode === "edit" ? "Update Coupon" : "Create Coupon"}</button>
							</div>
						</form>
					</div>
				</div>
			);
		}

		return (
			<div className="admin-modal-backdrop" onClick={closeModal}>
				<div className="admin-modal" onClick={(event) => event.stopPropagation()}>
					<div className="admin-modal-header">
						<h3>{modalMode === "edit" ? "Edit Banner" : "Add Banner"}</h3>
						<button className="admin-btn admin-btn-muted" type="button" onClick={closeModal}>Close</button>
					</div>
					<form className="admin-form-grid" onSubmit={handleBannerSubmit}>
						<input placeholder="Banner Text" value={bannerForm.text ?? ""} onChange={(event) => setBannerForm((prev) => ({ ...prev, text: event.target.value }))} required />
						<input placeholder="Link" value={bannerForm.link ?? ""} onChange={(event) => setBannerForm((prev) => ({ ...prev, link: event.target.value }))} />
						<input placeholder="Product Id (optional)" value={bannerForm.product ?? ""} onChange={(event) => setBannerForm((prev) => ({ ...prev, product: event.target.value }))} />
						<input placeholder="Tags comma separated" value={bannerForm.tags ?? ""} onChange={(event) => setBannerForm((prev) => ({ ...prev, tags: event.target.value }))} />
						<textarea placeholder="Description" value={bannerForm.description ?? ""} onChange={(event) => setBannerForm((prev) => ({ ...prev, description: event.target.value }))} />
						<div className="admin-inline-actions">
							<button className="admin-btn" type="submit">{modalMode === "edit" ? "Update Banner" : "Create Banner"}</button>
						</div>
					</form>
				</div>
			</div>
		);
	};

	return (
		<main className="admin-page">
			<aside className="admin-sidebar">
				<div className="admin-brand">
					<p>MakeUsSparkle</p>
					<h1>Admin</h1>
				</div>
				<nav>
					{tabs.map((tab) => (
						<button key={tab.key} className={`admin-side-link ${activeTab === tab.key ? "active" : ""}`} onClick={() => setActiveTab(tab.key)}>
							{tab.label}
						</button>
					))}
				</nav>
			</aside>

			<section className="admin-main">
				<header className="admin-topbar">
					<div>
						<p className="admin-login-kicker">CONTROL CENTER</p>
						<h2>{tabs.find((entry) => entry.key === activeTab)?.label || "Dashboard"}</h2>
						<p>Signed in as {user?.email || "admin"}</p>
					</div>
					<div className="admin-topbar-actions">
						{createActionsByTab[activeTab] ? (
							<button className="admin-btn" onClick={openCreateModal}>{createActionsByTab[activeTab]}</button>
						) : null}
						<button className="admin-btn" onClick={refresh}>Refresh</button>
						<button className="admin-btn admin-btn-muted" onClick={handleSignOut}>Logout</button>
					</div>
				</header>

				{loading && <p className="admin-loading">Loading data...</p>}
				{error && <p className="admin-error">{error}</p>}
				{notice && <p className="admin-loading">{notice}</p>}

				{renderTabContent()}
				{renderModal()}
			</section>
		</main>
	);
}
