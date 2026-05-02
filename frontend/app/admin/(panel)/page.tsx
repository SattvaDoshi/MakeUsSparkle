"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState, Fragment } from "react";
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
	advanceAmount?: number;
	balanceAmount?: number;
	paidAmount?: number;
	status?: "placed" | "shipped" | "delivered" | "cancelled" | "confirmed";
	paymentStatus?: "pending" | "paid" | "failed" | "completed" | "partial_paid";
	paymentMode?: string;
	user?: {
		_id?: string;
		name?: string;
		email?: string;
	};
	address?: {
		fullAddress?: string;
		city?: string;
		state?: string;
		pincode?: string;
	};
	items?: Array<{
		_id?: string;
		product?: { _id: string; title?: string } | string;
		quantity?: number;
		price?: number;
		customNote?: string;
		customImages?: string[];
		selectedCharms?: Array<{ _id: string; name?: string } | string>;
	}>;
	isGift?: boolean;
	giftMessage?: string;
	createdAt?: string;
	updatedAt?: string;
};

type AdminCoupon = {
	_id: string;
	code: string;
	name: string;
	description?: string;
	discountType: "percentage" | "fixed";
	discountValue: number;
	maxDiscount?: number;
	minOrderValue?: number;
	usageLimit?: number;
	usedCount?: number;
	startsAt?: string;
	expiryDate?: string;
	isActive?: boolean;
	offerCategory?: "jewellery" | "combo" | "gift" | "all";
	image?: string;
	isFeatured?: boolean;
	applicableCategories?: Array<{ _id: string; name?: string } | string>;
	applicableSubCategories?: Array<{ _id: string; name?: string } | string>;
	applicableStyles?: Array<{ _id: string; name?: string } | string>;
	applicableProducts?: Array<{ _id: string; title?: string } | string>;
	applicableProductTypes?: string[];
};

type AdminBanner = {
	_id: string;
	text?: string;
	title?: string;
	subtitle?: string;
	tag?: string;
	cta?: string;
	link?: string;
	description?: string;
	tags?: string[];
	image?: string;
	imageAlt?: string;
	isActive?: boolean;
	sortOrder?: number;
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

type AdminCharmItem = {
	_id: string;
	name: string;
	price: number;
	image?: string;
	emoji?: string;
	charmCategory: string;
	parentCategory: string;
	customisable?: boolean;
	hasPhotoUpload?: boolean;
	sortOrder?: number;
	active?: boolean;
};

type PagedResponse<T, K extends string> = {
	success: boolean;
	pagination: {
		page: number;
		limit: number;
		total: number;
	};
} & Record<K, T[]>;

type TabKey = "home" | "products" | "users" | "orders" | "payments" | "coupons" | "banners" | "reviews" | "charms";

const tabs: Array<{ key: TabKey; label: string }> = [
	{ key: "home", label: "Home" },
	{ key: "products", label: "Products" },
	{ key: "users", label: "Users" },
	{ key: "orders", label: "Orders" },
	{ key: "payments", label: "Payments" },
	{ key: "coupons", label: "Coupons" },
	{ key: "banners", label: "Banners" },
	{ key: "reviews", label: "Reviews" },
	{ key: "charms", label: "Charms" },
];

const orderStatuses: Array<AdminOrder["status"]> = ["placed", "shipped", "delivered", "cancelled"];
const paymentStatuses: Array<AdminOrder["paymentStatus"]> = ["pending", "paid", "partial_paid", "failed"];

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
	description: string;
	discountType: "percentage" | "fixed";
	discountValue: string;
	maxDiscount: string;
	minOrderValue: string;
	usageLimit: string;
	startsAt: string;
	expiryDate: string;
	isActive: boolean;
	offerCategory: "jewellery" | "combo" | "gift" | "all";
	image: string;
	isFeatured: boolean;
	applicableCategories: string;
	applicableSubCategories: string;
	applicableStyles: string;
	applicableProducts: string;
	applicableProductTypes: string;
};

type BannerFormState = {
	id: string;
	text: string;
	title: string;
	subtitle: string;
	tag: string;
	cta: string;
	link: string;
	description: string;
	tags: string;
	product: string;
	image: string;
	imageAlt: string;
	isActive: boolean;
	sortOrder: string;
};

type CharmFormState = {
	id: string;
	name: string;
	price: string;
	emoji: string;
	charmCategory: string;
	parentCategory: string;
	customisable: boolean;
	hasPhotoUpload: boolean;
	sortOrder: string;
	active: boolean;
	imageFile: File | null;
	imageUrl: string;
};

type ModalKind = "product" | "user" | "coupon" | "banner" | "charm" | null;

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
	description: "",
	discountType: "percentage",
	discountValue: "",
	maxDiscount: "",
	minOrderValue: "0",
	usageLimit: "1",
	startsAt: "",
	expiryDate: "",
	isActive: true,
	offerCategory: "all",
	image: "",
	isFeatured: false,
	applicableCategories: "",
	applicableSubCategories: "",
	applicableStyles: "",
	applicableProducts: "",
	applicableProductTypes: "",
};

const defaultBannerForm: BannerFormState = {
	id: "",
	text: "",
	title: "",
	subtitle: "",
	tag: "",
	cta: "Shop Now",
	link: "",
	description: "",
	tags: "",
	product: "",
	image: "",
	imageAlt: "",
	isActive: true,
	sortOrder: "0",
};

const defaultCharmForm: CharmFormState = {
	id: "",
	name: "",
	price: "",
	emoji: "",
	charmCategory: "designs",
	parentCategory: "custom-charm-jewellery",
	customisable: false,
	hasPhotoUpload: false,
	sortOrder: "0",
	active: true,
	imageFile: null,
	imageUrl: "",
};

const createActionsByTab: Partial<Record<TabKey, string>> = {
	products: "Add Product",
	users: "Add User",
	coupons: "Add Coupon",
	banners: "Add Banner",
	charms: "Add Charm",
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
	const [charms, setCharms] = useState<AdminCharmItem[]>([]);

	const [productForm, setProductForm] = useState(defaultProductForm);
	const [userForm, setUserForm] = useState(defaultUserForm);
	const [couponForm, setCouponForm] = useState(defaultCouponForm);
	const [bannerForm, setBannerForm] = useState(defaultBannerForm);
	const [charmForm, setCharmForm] = useState(defaultCharmForm);
	const [modalKind, setModalKind] = useState<ModalKind>(null);
	const [modalMode, setModalMode] = useState<"create" | "edit">("create");
	const [selectedProduct, setSelectedProduct] = useState<any>(null);

	const [editingReview, setEditingReview] = useState<{ productId: string; reviewId: string; rating: string; comment: string } | null>(null);

	const totalManagedItems = useMemo(
		() => users.length + products.length + orders.length + payments.length + coupons.length + banners.length + reviews.length + charms.length,
		[users, products, orders, payments, coupons, banners, reviews, charms]
	);

	const resetMessages = () => {
		setError(null);
		setNotice(null);
	};

	const formatShortId = (value: string) => value.slice(-8).toUpperCase();
	const formatMoney = (amount?: number) => `INR ${Math.round(amount || 0).toLocaleString()}`;
	const formatDateTime = (value?: string) => {
		if (!value) return "-";
		const date = new Date(value);
		if (Number.isNaN(date.getTime())) return "-";
		return date.toLocaleString();
	};
	const formatAddress = (address?: AdminOrder["address"]) => {
		if (!address) return "-";
		const parts = [address.fullAddress, address.city, address.state, address.pincode].filter(Boolean);
		return parts.length ? parts.join(", ") : "-";
	};
	const normalizeOrderStatus = (value?: AdminOrder["status"]) => {
		if (value === "confirmed") return "placed";
		return value || "placed";
	};
	const normalizePaymentStatus = (value?: AdminOrder["paymentStatus"]) => {
		if (value === "completed") return "paid";
		return value || "pending";
	};
	const getOrderItemLabel = (item: NonNullable<AdminOrder["items"]>[number]) => {
		const product = item.product;
		if (product && typeof product !== "string" && product.title) {
			return product.title;
		}
		if (typeof product === "string" && product.length >= 6) {
			return `Product ${formatShortId(product)}`;
		}
		const charmCount = item.selectedCharms?.length || 0;
		if (charmCount > 0) {
			return `Custom Charm Jewellery (${charmCount} charm${charmCount === 1 ? "" : "s"})`;
		}
		if (item.customNote) {
			return "Custom Item";
		}
		return "Custom Item";
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

	const loadCharms = useCallback(async () => {
		const charmsResult = await apiRequest<{ success: boolean; charmItems: AdminCharmItem[] }>("/admin/charm-items");
		setCharms(charmsResult.charmItems || []);
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
			if (tab === "charms") await loadCharms();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to load admin data");
		} finally {
			setLoading(false);
		}
	}, [loadBanners, loadCoupons, loadHome, loadOrders, loadPayments, loadProducts, loadReviews, loadUsers, loadCharms]);

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

		if (activeTab === "charms") {
			setCharmForm(defaultCharmForm);
			setModalMode("create");
			setModalKind("charm");
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
		const parseCsv = (value: string) => value.split(",").map((item) => item.trim()).filter(Boolean);
		const payload = {
			code: couponForm.code,
			name: couponForm.name,
			description: couponForm.description,
			discountType: couponForm.discountType,
			discountValue: Number(couponForm.discountValue),
			maxDiscount: couponForm.maxDiscount ? Number(couponForm.maxDiscount) : undefined,
			minOrderValue: Number(couponForm.minOrderValue || 0),
			usageLimit: Number(couponForm.usageLimit),
			startsAt: couponForm.startsAt ? new Date(couponForm.startsAt).toISOString() : undefined,
			expiryDate: couponForm.expiryDate ? new Date(couponForm.expiryDate).toISOString() : undefined,
			isActive: couponForm.isActive,
			offerCategory: couponForm.offerCategory,
			image: couponForm.image,
			isFeatured: couponForm.isFeatured,
			applicableCategories: parseCsv(couponForm.applicableCategories),
			applicableSubCategories: parseCsv(couponForm.applicableSubCategories),
			applicableStyles: parseCsv(couponForm.applicableStyles),
			applicableProducts: parseCsv(couponForm.applicableProducts),
			applicableProductTypes: parseCsv(couponForm.applicableProductTypes),
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
			title: bannerForm.title,
			subtitle: bannerForm.subtitle,
			tag: bannerForm.tag,
			cta: bannerForm.cta,
			link: bannerForm.link,
			description: bannerForm.description,
			product: bannerForm.product || undefined,
			tags: bannerForm.tags.split(",").map((item) => item.trim()).filter(Boolean),
			image: bannerForm.image,
			imageAlt: bannerForm.imageAlt,
			isActive: bannerForm.isActive,
			sortOrder: Number(bannerForm.sortOrder || 0),
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

	const handleDeleteCharm = async (id: string) => {
		if (!window.confirm("Delete this charm?")) {
			return;
		}

		await runAction(async () => {
			await apiRequest(`/admin/charm-items/${id}`, { method: "DELETE" });
			await loadCharms();
		}, "Charm deleted");
	};

	const handleCharmSubmit = async (event: FormEvent) => {
		event.preventDefault();
		const formData = new FormData();
		formData.append("name", charmForm.name);
		formData.append("price", String(charmForm.price));
		formData.append("emoji", charmForm.emoji);
		formData.append("charmCategory", charmForm.charmCategory);
		formData.append("parentCategory", charmForm.parentCategory);
		formData.append("customisable", String(charmForm.customisable));
		formData.append("hasPhotoUpload", String(charmForm.hasPhotoUpload));
		formData.append("sortOrder", String(charmForm.sortOrder || 0));
		formData.append("active", String(charmForm.active));

		if (charmForm.imageFile) {
			formData.append("images", charmForm.imageFile); // Multer expects 'images' for single upload as well based on our upload middleware
		}

		await runAction(async () => {
			if (charmForm.id) {
				await apiRequest(`/admin/charm-items/${charmForm.id}`, {
					method: "PUT",
					body: formData, // FormData removes Content-Type automatically in apiRequest
				});
			} else {
				await apiRequest("/admin/charm-items", {
					method: "POST",
					body: formData,
				});
			}

			setModalKind(null);
			setModalMode("create");
			setCharmForm(defaultCharmForm);
			await loadCharms();
		}, charmForm.id ? "Charm updated" : "Charm created");
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
						<thead><tr><th>Order</th><th>Customer</th><th>Amount</th><th>Payment</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead>
						<tbody>
							{orders.map((entry) => (
									<Fragment key={entry._id}>
										<tr style={{ background: "#fdfdfd" }}>
											<td><strong>{formatShortId(entry._id)}</strong></td>
											<td>
												<div style={{ fontWeight: 500 }}>{entry.user?.name || "-"}</div>
												<div style={{ fontSize: 11, color: "var(--mist)" }}>{entry.user?.email || "-"}</div>
											</td>
											<td>
												<div style={{ fontWeight: 600 }}>{formatMoney(entry.totalAmount)}</div>
												{entry.paymentMode === "PARTIAL_COD" && (
													<div style={{ fontSize: 11, color: "var(--mist)" }}>
														Adv: {formatMoney(entry.advanceAmount)} | Bal: {formatMoney(entry.balanceAmount)}
													</div>
												)}
											</td>
											<td>
												<div style={{ fontWeight: 500 }}>{entry.paymentMode || "-"}</div>
												<div style={{ fontSize: 11, color: entry.paymentStatus === "paid" ? "green" : entry.paymentStatus === "partial_paid" ? "orange" : "red" }}>
													{normalizePaymentStatus(entry.paymentStatus)?.toUpperCase()}
												</div>
											</td>
											<td>
												<select value={normalizeOrderStatus(entry.status)} onChange={(event) => void handleOrderStatus(entry._id, event.target.value)}>
													{orderStatuses.map((status) => <option key={status} value={status || "placed"}>{status?.toUpperCase()}</option>)}
												</select>
											</td>
											<td>{formatDateTime(entry.createdAt)}</td>
											<td><button className="admin-btn admin-btn-danger" onClick={() => void handleDeleteOrder(entry._id)}>Delete</button></td>
										</tr>
										<tr key={`${entry._id}-details`} style={{ borderBottom: "2px solid #eaeaea" }}>
											<td colSpan={7} style={{ whiteSpace: "normal", padding: "16px 24px", background: "#f9f9f9" }}>
												<div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 24 }}>
													<div>
														<h4 style={{ marginBottom: 8, fontSize: 13, textTransform: "uppercase", color: "var(--mist)" }}>Order Details</h4>
														<div style={{ display: "grid", gap: 6, fontSize: 13 }}>
															<div><strong>Shipping Address:</strong><br/>{formatAddress(entry.address)}</div>
															{!!entry.isGift && (
																<div><strong>Gift Order:</strong> Yes{entry.giftMessage ? ` — “${entry.giftMessage}”` : ""}</div>
															)}
															{entry.paymentMode === "PARTIAL_COD" && (
																<div style={{ background: "#fff3cd", padding: 8, borderRadius: 4, marginTop: 4, border: "1px solid #ffeeba" }}>
																	<strong>COD Collection:</strong> Collect {formatMoney(entry.balanceAmount)} on delivery.
																</div>
															)}
														</div>
													</div>
													<div>
														<h4 style={{ marginBottom: 8, fontSize: 13, textTransform: "uppercase", color: "var(--mist)" }}>Items</h4>
														<div style={{ overflowX: "auto", background: "white", borderRadius: 8, border: "1px solid #eaeaea" }}>
															<table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
																<thead>
																	<tr style={{ textAlign: "left", borderBottom: "1px solid #eaeaea", background: "#f5f5f5" }}>
																		<th style={{ padding: "8px 12px", width: 48 }}>Image</th>
																		<th style={{ padding: "8px 12px" }}>Item</th>
																		<th style={{ padding: "8px 12px", width: 60 }}>Qty</th>
																		<th style={{ padding: "8px 12px", width: 100 }}>Price</th>
																	</tr>
																</thead>
																<tbody>
																	{(entry.items || []).length === 0 ? (
																		<tr><td colSpan={4} style={{ padding: 12, textAlign: "center", color: "var(--mist)" }}>No items</td></tr>
																	) : (
																		(entry.items || []).map((item) => (
																			<tr key={item._id || `${entry._id}-${String(item.price)}-${String(item.quantity)}`} style={{ borderBottom: "1px solid #f0f0f0" }}>
																				<td style={{ padding: "8px 12px" }}>
																					{item.product && typeof item.product === 'object' && 'images' in item.product && Array.isArray((item.product as any).images) && (item.product as any).images[0] ? (
																						// eslint-disable-next-line @next/next/no-img-element
																						<img src={(item.product as any).images[0]} alt="" style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 4 }} />
																					) : (
																						<div style={{ width: 40, height: 40, background: "#f4f4f4", borderRadius: 4 }} />
																					)}
																				</td>
																				<td style={{ padding: "8px 12px" }}>
																					<div style={{ fontWeight: 500 }}>{getOrderItemLabel(item)}</div>
																					{item.selectedCharms && item.selectedCharms.length > 0 && (
																						<div style={{ fontSize: 11, color: "var(--mist)", marginTop: 4 }}>
																							Charms: {item.selectedCharms.map((c: any) => typeof c === 'string' ? 'Charm' : c.name || 'Charm').join(", ")}
																						</div>
																					)}
																				</td>
																				<td style={{ padding: "8px 12px" }}>{item.quantity ?? 0}</td>
																				<td style={{ padding: "8px 12px", fontWeight: 500 }}>₹{Math.round(item.price || 0).toLocaleString()}</td>
																			</tr>
																		))
																	)}
																</tbody>
															</table>
														</div>
													</div>
												</div>
											</td>
										</tr>
									</Fragment>
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
									<td>{formatShortId(entry._id)}</td>
									<td>{entry.user?.name || entry.user?.email || "-"}</td>
									<td>{entry.paymentMode || "-"}</td>
									<td>
										<select value={normalizePaymentStatus(entry.paymentStatus)} onChange={(event) => void handlePaymentStatus(entry._id, event.target.value)}>
											{paymentStatuses.map((status) => <option key={status} value={status || "pending"}>{status}</option>)}
										</select>
									</td>
									<td>{formatMoney(entry.totalAmount)}</td>
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
						<thead><tr><th>Code</th><th>Name</th><th>Type</th><th>Value</th><th>Min Order</th><th>Used/Limit</th><th>Expiry</th><th>Active</th><th>Actions</th></tr></thead>
						<tbody>
							{coupons.map((entry) => (
								<tr key={entry._id}>
									<td>{entry.code}</td>
									<td>{entry.name}</td>
									<td>{entry.discountType}</td>
									<td>{entry.discountValue}</td>
									<td>{entry.minOrderValue ?? 0}</td>
									<td>{entry.usedCount ?? 0}/{entry.usageLimit ?? 0}</td>
									<td>{entry.expiryDate ? String(entry.expiryDate).slice(0, 10) : "-"}</td>
									<td>{entry.isActive ? "Yes" : "No"}</td>
									<td>
										<div className="admin-inline-actions">
											<button className="admin-btn" onClick={() => {
												const mapIds = (values?: Array<{ _id: string } | string>) => (values || []).map((item) => typeof item === "string" ? item : item._id).join(", ");
												setCouponForm({
													id: entry._id,
													code: entry.code ?? "",
													name: entry.name ?? "",
													description: entry.description ?? "",
													discountType: entry.discountType === "fixed" ? "fixed" : "percentage",
													discountValue: entry.discountValue != null ? String(entry.discountValue) : "",
													maxDiscount: entry.maxDiscount != null ? String(entry.maxDiscount) : "",
													minOrderValue: entry.minOrderValue != null ? String(entry.minOrderValue) : "0",
													usageLimit: entry.usageLimit != null ? String(entry.usageLimit) : "1",
													startsAt: entry.startsAt ? String(entry.startsAt).slice(0, 10) : "",
													expiryDate: entry.expiryDate ? String(entry.expiryDate).slice(0, 10) : "",
													isActive: Boolean(entry.isActive),
													offerCategory: entry.offerCategory || "all",
													image: entry.image || "",
													isFeatured: Boolean(entry.isFeatured),
													applicableCategories: mapIds(entry.applicableCategories),
													applicableSubCategories: mapIds(entry.applicableSubCategories),
													applicableStyles: mapIds(entry.applicableStyles),
													applicableProducts: mapIds(entry.applicableProducts),
													applicableProductTypes: (entry.applicableProductTypes || []).join(", "),
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
											<button className="admin-btn" onClick={() => {
												setBannerForm({
													id: entry._id,
													text: entry.text ?? "",
													title: entry.title ?? entry.text ?? "",
													subtitle: entry.subtitle ?? entry.description ?? "",
													tag: entry.tag ?? "",
													cta: entry.cta ?? "Shop Now",
													link: entry.link ?? "",
													description: entry.description ?? "",
													tags: (entry.tags || []).join(", "),
													product: entry.product?._id ?? "",
													image: entry.image ?? "",
													imageAlt: entry.imageAlt ?? "",
													isActive: entry.isActive !== false,
													sortOrder: String(entry.sortOrder ?? 0),
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

	const renderCharms = () => (
		<section className="admin-content">
			<div className="admin-panel">
				<h2>Charms List</h2>
				<div className="admin-table-wrap">
					<table className="admin-table">
						<thead><tr><th>Name</th><th>Price</th><th>Category</th><th>Parent</th><th>Order</th><th>Active</th><th>Actions</th></tr></thead>
						<tbody>
							{charms.map((entry) => (
								<tr key={entry._id}>
									<td>{entry.emoji} {entry.name}</td>
									<td>INR {entry.price}</td>
									<td>{entry.charmCategory}</td>
									<td>{entry.parentCategory}</td>
									<td>{entry.sortOrder}</td>
									<td>{entry.active === false ? "No" : "Yes"}</td>
									<td>
										<div className="admin-inline-actions">
											<button className="admin-btn" onClick={() => {
												setCharmForm({
													id: entry._id,
													name: entry.name || "",
													price: String(entry.price || 0),
													emoji: entry.emoji || "",
													charmCategory: entry.charmCategory || "designs",
													parentCategory: entry.parentCategory || "custom-charm-jewellery",
													customisable: Boolean(entry.customisable),
													hasPhotoUpload: Boolean(entry.hasPhotoUpload),
													sortOrder: String(entry.sortOrder || 0),
													active: entry.active !== false,
													imageFile: null,
													imageUrl: entry.image || "",
												});
												setModalMode("edit");
												setModalKind("charm");
											}}>Edit</button>
											<button className="admin-btn admin-btn-danger" onClick={() => void handleDeleteCharm(entry._id)}>Delete</button>
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
		if (activeTab === "charms") return renderCharms();
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
							<textarea placeholder="Description" value={couponForm.description ?? ""} onChange={(event) => setCouponForm((prev) => ({ ...prev, description: event.target.value }))} />
							<select value={couponForm.discountType ?? "percentage"} onChange={(event) => setCouponForm((prev) => ({ ...prev, discountType: event.target.value as "percentage" | "fixed" }))}>
								<option value="percentage">Percentage</option>
								<option value="fixed">Fixed</option>
							</select>
							<input placeholder="Discount Value" type="number" value={couponForm.discountValue ?? ""} onChange={(event) => setCouponForm((prev) => ({ ...prev, discountValue: event.target.value }))} required />
							<input placeholder="Max Discount (for %)" type="number" value={couponForm.maxDiscount ?? ""} onChange={(event) => setCouponForm((prev) => ({ ...prev, maxDiscount: event.target.value }))} />
							<input placeholder="Min Order Value" type="number" value={couponForm.minOrderValue ?? "0"} onChange={(event) => setCouponForm((prev) => ({ ...prev, minOrderValue: event.target.value }))} />
							<input placeholder="Usage Limit" type="number" value={couponForm.usageLimit ?? ""} onChange={(event) => setCouponForm((prev) => ({ ...prev, usageLimit: event.target.value }))} />
							<input placeholder="Starts At" type="date" value={couponForm.startsAt ?? ""} onChange={(event) => setCouponForm((prev) => ({ ...prev, startsAt: event.target.value }))} />
							<input placeholder="Expiry" type="date" value={couponForm.expiryDate ?? ""} onChange={(event) => setCouponForm((prev) => ({ ...prev, expiryDate: event.target.value }))} />
							<select value={couponForm.offerCategory} onChange={(event) => setCouponForm((prev) => ({ ...prev, offerCategory: event.target.value as "jewellery" | "combo" | "gift" | "all" }))}>
								<option value="all">Sitewide</option>
								<option value="jewellery">Jewellery</option>
								<option value="combo">Combos</option>
								<option value="gift">Gift</option>
							</select>
							<input placeholder="Offer Image URL" value={couponForm.image ?? ""} onChange={(event) => setCouponForm((prev) => ({ ...prev, image: event.target.value }))} />
							<input placeholder="Category IDs (comma separated)" value={couponForm.applicableCategories ?? ""} onChange={(event) => setCouponForm((prev) => ({ ...prev, applicableCategories: event.target.value }))} />
							<input placeholder="Subcategory IDs (comma separated)" value={couponForm.applicableSubCategories ?? ""} onChange={(event) => setCouponForm((prev) => ({ ...prev, applicableSubCategories: event.target.value }))} />
							<input placeholder="Style IDs (comma separated)" value={couponForm.applicableStyles ?? ""} onChange={(event) => setCouponForm((prev) => ({ ...prev, applicableStyles: event.target.value }))} />
							<input placeholder="Product IDs (comma separated)" value={couponForm.applicableProducts ?? ""} onChange={(event) => setCouponForm((prev) => ({ ...prev, applicableProducts: event.target.value }))} />
							<input placeholder="Types: male,female,unisex" value={couponForm.applicableProductTypes ?? ""} onChange={(event) => setCouponForm((prev) => ({ ...prev, applicableProductTypes: event.target.value }))} />
							<label className="admin-checkbox"><input type="checkbox" checked={couponForm.isActive} onChange={(event) => setCouponForm((prev) => ({ ...prev, isActive: event.target.checked }))} />Active</label>
							<label className="admin-checkbox"><input type="checkbox" checked={couponForm.isFeatured} onChange={(event) => setCouponForm((prev) => ({ ...prev, isFeatured: event.target.checked }))} />Featured (show New badge)</label>
							<div className="admin-inline-actions">
								<button className="admin-btn" type="submit">{modalMode === "edit" ? "Update Coupon" : "Create Coupon"}</button>
							</div>
						</form>
					</div>
				</div>
			);
		}

		if (modalKind === "charm") {
			return (
				<div className="admin-modal-backdrop" onClick={closeModal}>
					<div className="admin-modal" onClick={(event) => event.stopPropagation()}>
						<div className="admin-modal-header">
							<h3>{modalMode === "edit" ? "Edit Charm" : "Add Charm"}</h3>
							<button className="admin-btn admin-btn-muted" type="button" onClick={closeModal}>Close</button>
						</div>
						<form className="admin-form-grid" onSubmit={handleCharmSubmit}>
							<input placeholder="Name" value={charmForm.name} onChange={(event) => setCharmForm((prev) => ({ ...prev, name: event.target.value }))} required />
							<input placeholder="Price" type="number" value={charmForm.price} onChange={(event) => setCharmForm((prev) => ({ ...prev, price: event.target.value }))} required />
							<input placeholder="Emoji (e.g. ⭐)" value={charmForm.emoji} onChange={(event) => setCharmForm((prev) => ({ ...prev, emoji: event.target.value }))} />
							<select value={charmForm.charmCategory} onChange={(event) => setCharmForm((prev) => ({ ...prev, charmCategory: event.target.value }))}>
								<option value="initials">Initials</option>
								<option value="symbols">Symbols</option>
								<option value="birthstones">Birthstones</option>
								<option value="custom">Custom</option>
								<option value="designs">Designs</option>
								<option value="characters">Characters</option>
							</select>
							<select value={charmForm.parentCategory} onChange={(event) => setCharmForm((prev) => ({ ...prev, parentCategory: event.target.value }))}>
								<option value="custom-charm-jewellery">Custom Charm Jewellery</option>
								<option value="keychains">Keychains</option>
							</select>
							<input placeholder="Sort Order" type="number" value={charmForm.sortOrder} onChange={(event) => setCharmForm((prev) => ({ ...prev, sortOrder: event.target.value }))} />
							<input type="file" accept="image/*" onChange={(event) => {
								const file = event.target.files?.[0] || null;
								setCharmForm((prev) => ({ ...prev, imageFile: file }));
							}} />
							{charmForm.imageUrl && !charmForm.imageFile && <img src={charmForm.imageUrl} alt="Charm Preview" style={{ width: 60, height: 60, objectFit: "contain", borderRadius: 8 }} />}
							<label className="admin-checkbox"><input type="checkbox" checked={charmForm.customisable} onChange={(event) => setCharmForm((prev) => ({ ...prev, customisable: event.target.checked }))} />Customisable Text?</label>
							<label className="admin-checkbox"><input type="checkbox" checked={charmForm.hasPhotoUpload} onChange={(event) => setCharmForm((prev) => ({ ...prev, hasPhotoUpload: event.target.checked }))} />Has Photo Upload?</label>
							<label className="admin-checkbox"><input type="checkbox" checked={charmForm.active} onChange={(event) => setCharmForm((prev) => ({ ...prev, active: event.target.checked }))} />Active</label>
							<div className="admin-inline-actions">
								<button className="admin-btn" type="submit">{modalMode === "edit" ? "Update Charm" : "Create Charm"}</button>
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
						<input placeholder="Title" value={bannerForm.title ?? ""} onChange={(event) => setBannerForm((prev) => ({ ...prev, title: event.target.value }))} required />
						<input placeholder="Subtitle" value={bannerForm.subtitle ?? ""} onChange={(event) => setBannerForm((prev) => ({ ...prev, subtitle: event.target.value }))} />
						<input placeholder="Tag (e.g. New Launch)" value={bannerForm.tag ?? ""} onChange={(event) => setBannerForm((prev) => ({ ...prev, tag: event.target.value }))} />
						<input placeholder="CTA Text" value={bannerForm.cta ?? ""} onChange={(event) => setBannerForm((prev) => ({ ...prev, cta: event.target.value }))} />
						<input placeholder="Banner Text" value={bannerForm.text ?? ""} onChange={(event) => setBannerForm((prev) => ({ ...prev, text: event.target.value }))} required />
						<input placeholder="Link" value={bannerForm.link ?? ""} onChange={(event) => setBannerForm((prev) => ({ ...prev, link: event.target.value }))} />
						<input placeholder="Image URL" value={bannerForm.image ?? ""} onChange={(event) => setBannerForm((prev) => ({ ...prev, image: event.target.value }))} />
						<input placeholder="Image Alt" value={bannerForm.imageAlt ?? ""} onChange={(event) => setBannerForm((prev) => ({ ...prev, imageAlt: event.target.value }))} />
						<input placeholder="Sort Order" type="number" value={bannerForm.sortOrder ?? "0"} onChange={(event) => setBannerForm((prev) => ({ ...prev, sortOrder: event.target.value }))} />
						<input placeholder="Product Id (optional)" value={bannerForm.product ?? ""} onChange={(event) => setBannerForm((prev) => ({ ...prev, product: event.target.value }))} />
						<input placeholder="Tags comma separated" value={bannerForm.tags ?? ""} onChange={(event) => setBannerForm((prev) => ({ ...prev, tags: event.target.value }))} />
						<textarea placeholder="Description" value={bannerForm.description ?? ""} onChange={(event) => setBannerForm((prev) => ({ ...prev, description: event.target.value }))} />
						<label className="admin-checkbox"><input type="checkbox" checked={bannerForm.isActive} onChange={(event) => setBannerForm((prev) => ({ ...prev, isActive: event.target.checked }))} />Active</label>
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
