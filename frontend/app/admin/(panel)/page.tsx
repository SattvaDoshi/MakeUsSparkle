"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/authContext";
import AdminProductModal from "./AdminProductModal";
import type { SalesAnalyticsItem, ProductAnalyticsItem, OrderAnalyticsItem } from "./_lib/admin.types";
import AdminHomeTab from "./_components/tabs/AdminHomeTab";
import AdminProductsTab from "./_components/tabs/AdminProductsTab";
import AdminUsersTab from "./_components/tabs/AdminUsersTab";
import AdminOrdersTab from "./_components/tabs/AdminOrdersTab";
import AdminPaymentsTab from "./_components/tabs/AdminPaymentsTab";
import AdminCouponsTab from "./_components/tabs/AdminCouponsTab";
import AdminBannersTab from "./_components/tabs/AdminBannersTab";
import AdminReviewsTab from "./_components/tabs/AdminReviewsTab";
import AdminCharmsTab from "./_components/tabs/AdminCharmsTab";
import AdminCategoriesTab from "./_components/tabs/AdminCategoriesTab";
import AdminNewArrivalsTab from "./_components/tabs/AdminNewArrivalsTab";
import AdminCombosTab from "./_components/tabs/AdminCombosTab";

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
	gender?: "men" | "women" | "kids" | "unisex";
	mainImage?: string;
	images?: string[];
	seoTags?: string[];
	createdAt?: string;
};

type AdminHomeSection = {
	_id?: string;
	key: string;
	eyebrow?: string;
	title?: string;
	products?: Array<{ _id: string; title?: string } | string>;
	isActive?: boolean;
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

type AdminOffer = {
	_id: string;
	title: string;
	description?: string;
	offerType: "bogo" | "percentage" | "fixed";
	discountValue: number;
	buyQuantity: number;
	getQuantity: number;
	startsAt?: string;
	expiryDate?: string;
	isActive: boolean;
	usageLimit: number;
	usedCount: number;
	image?: string;
	applicableCategories?: Array<{ _id: string; name?: string } | string>;
	applicableProducts?: Array<{ _id: string; title?: string } | string>;
};

type AdminBanner = {
	_id: string;
	bannerType?: "promo" | "main";
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

type MainBanner = {
	_id: string;
	bannerType?: "main";
	image?: string;
	link?: string;
	isActive?: boolean;
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

type AdminCategory = {
	_id: string;
	name?: string;
	description?: string;
	image?: string;
	gender?: { _id?: string; name?: string } | string;
};

type AdminSubCategory = {
	_id: string;
	name?: string;
	category?: { _id?: string; name?: string; gender?: { _id?: string; name?: string } | string } | string;
	image?: string;
};

type AdminStyle = {
	_id: string;
	name?: string;
	image?: string;
	gender?: { _id?: string; name?: string } | string;
};

type AdminGender = {
	_id: string;
	name?: string;
	slug?: string;
	image?: string;
	isActive?: boolean;
};

export type AdminCombo = {
	_id: string;
	name: string;
	description?: string;
	type: "curated" | "custom";
	status: "active" | "inactive";
	displayOrder: number;
	image?: string;
	price?: number;
	originalPrice?: number;
	products?: any[];
	itemsCount?: number;
	tagline?: string;
	badge?: string;
	tint?: string;
};

type PagedResponse<T, K extends string> = {
	success: boolean;
	pagination: {
		page: number;
		limit: number;
		total: number;
	};
} & Record<K, T[]>;

type TabKey = "home" | "products" | "categories" | "newArrivals" | "users" | "orders" | "payments" | "coupons" | "banners" | "reviews" | "charms" | "combos";
const tabs: Array<{ key: TabKey; label: string }> = [
	{ key: "home", label: "Home" },
	{ key: "products", label: "Products" },
	{ key: "categories", label: "Categories" },
	{ key: "newArrivals", label: "New Arrivals" },
	{ key: "combos", label: "Combos" },
	{ key: "users", label: "Users" },
	{ key: "orders", label: "Orders" },
	{ key: "payments", label: "Payments" },
	{ key: "coupons", label: "Offers & Coupons" },
	{ key: "banners", label: "Banners" },
	{ key: "reviews", label: "Reviews" },
];

// order/payment status lists moved to dedicated tab components

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
	isFeatured: boolean;
	applicableCategories: string;
	applicableSubCategories: string;
	applicableStyles: string;
	applicableProducts: string;
	applicableProductTypes: string;
	imageFile: File | null;
	imageUrl: string;
};

type OfferFormState = {
	id: string;
	title: string;
	description: string;
	offerType: "bogo" | "percentage" | "fixed";
	discountValue: string;
	buyQuantity: string;
	getQuantity: string;
	startsAt: string;
	expiryDate: string;
	isActive: boolean;
	usageLimit: string;
	applicableCategories: string;
	applicableProducts: string;
	imageFile: File | null;
	imageUrl: string;
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

type ModalKind = "product" | "user" | "coupon" | "offer" | "banner" | "charm" | null;

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
	isFeatured: false,
	applicableCategories: "",
	applicableSubCategories: "",
	applicableStyles: "",
	applicableProducts: "",
	applicableProductTypes: "",
	imageFile: null,
	imageUrl: "",
};

const defaultOfferForm: OfferFormState = {
	id: "",
	title: "",
	description: "",
	offerType: "percentage",
	discountValue: "0",
	buyQuantity: "1",
	getQuantity: "1",
	startsAt: "",
	expiryDate: "",
	isActive: true,
	usageLimit: "0",
	applicableCategories: "",
	applicableProducts: "",
	imageFile: null,
	imageUrl: "",
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

const defaultNewArrivalsForm = {
	eyebrow: "Fresh off the shelf",
	title: "New Arrivals",
	products: [] as string[],
	isActive: true,
};

const createActionsByTab: Partial<Record<TabKey, string>> = {
	products: "Add Product",
	users: "Add User",
	coupons: "Add Coupon or Offer",
	banners: "Add Banner",
	charms: "Add Charm",
};

export default function AdminDashboardPage() {
	const router = useRouter();
	const { user, signOut } = useAuth();

	const [activeTab, setActiveTab] = useState<TabKey>("home");
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [notice, setNotice] = useState<string | null>(null);

	const [stats, setStats] = useState<DashboardStatsResponse["stats"] | null>(null);
	const [salesAnalytics, setSalesAnalytics] = useState<SalesAnalyticsItem[]>([]);
	const [productAnalytics, setProductAnalytics] = useState<ProductAnalyticsItem[]>([]);
	const [orderAnalytics, setOrderAnalytics] = useState<OrderAnalyticsItem[]>([]);
	const [users, setUsers] = useState<AdminUser[]>([]);
	const [products, setProducts] = useState<AdminProduct[]>([]);
	const [orders, setOrders] = useState<AdminOrder[]>([]);
	const [payments, setPayments] = useState<AdminOrder[]>([]);
	const [offers, setOffers] = useState<AdminOffer[]>([]);
	const [coupons, setCoupons] = useState<AdminCoupon[]>([]);
	const [banners, setBanners] = useState<AdminBanner[]>([]);
	const [mainBanners, setMainBanners] = useState<MainBanner[]>([]);
	const [reviews, setReviews] = useState<AdminReview[]>([]);
	const [charms, setCharms] = useState<AdminCharmItem[]>([]);
	const [newArrivalsForm, setNewArrivalsForm] = useState(defaultNewArrivalsForm);

	const [categories, setCategories] = useState<AdminCategory[]>([]);
	const [subcategories, setSubCategories] = useState<AdminSubCategory[]>([]);
	const [styles, setStyles] = useState<AdminStyle[]>([]);
	const [genders, setGenders] = useState<AdminGender[]>([]);
	const [combos, setCombos] = useState<AdminCombo[]>([]);

	const [userForm, setUserForm] = useState(defaultUserForm);
	const [offerForm, setOfferForm] = useState(defaultOfferForm);
	const [couponForm, setCouponForm] = useState(defaultCouponForm);
	const [bannerForm, setBannerForm] = useState(defaultBannerForm);
	const [bannerImageFile, setBannerImageFile] = useState<File | null>(null);
	const [charmForm, setCharmForm] = useState(defaultCharmForm);
	const [modalKind, setModalKind] = useState<ModalKind>(null);
	const [modalMode, setModalMode] = useState<"create" | "edit">("create");
	const [selectedProduct, setSelectedProduct] = useState<AdminProduct | null>(null);

	const [editingReview, setEditingReview] = useState<{ productId: string; reviewId: string; rating: string; comment: string } | null>(null);

	const totalManagedItems = useMemo(
		() => users.length + products.length + orders.length + payments.length + offers.length + coupons.length + banners.length + reviews.length + charms.length + combos.length,
		[users, products, orders, payments, offers, coupons, banners, reviews, charms, combos]
	);

	const resetMessages = () => {
		setError(null);
		setNotice(null);
	};

	// Formatting and label helpers are provided by ./_lib/admin.helpers and imported above.

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

		try {
			const [sales, products, orders] = await Promise.all([
				apiRequest<{ success: boolean; analytics: SalesAnalyticsItem[] }>("/admin/analytics/sales"),
				apiRequest<{ success: boolean; analytics: ProductAnalyticsItem[] }>("/admin/analytics/products"),
				apiRequest<{ success: boolean; analytics: OrderAnalyticsItem[] }>("/admin/analytics/orders")
			]);
			setSalesAnalytics(sales.analytics || []);
			setProductAnalytics(products.analytics || []);
			setOrderAnalytics(orders.analytics || []);
		} catch (error) {
			console.error("Error loading analytics:", error);
		}
	}, []);

	const loadUsers = useCallback(async () => {
		const usersResult = await apiRequest<PagedResponse<AdminUser, "users">>("/admin/users?limit=50");
		setUsers(usersResult.users);
	}, []);

	const loadProducts = useCallback(async () => {
		const productsResult = await apiRequest<PagedResponse<AdminProduct, "products">>("/admin/products?limit=500");
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

	const loadOffers = useCallback(async () => {
		const offersResult = await apiRequest<{ success: boolean; offers: AdminOffer[] }>("/admin/offers");
		setOffers(offersResult.offers);
	}, []);

	const loadBanners = useCallback(async () => {
		const bannersResult = await apiRequest<PagedResponse<AdminBanner, "banners">>("/admin/banners?limit=50");
		setBanners(bannersResult.banners);
	}, []);

	const loadMainBanners = useCallback(async () => {
		const result = await apiRequest<{ success: boolean; banners: MainBanner[] }>("/admin/banners/main");
		setMainBanners(result.banners || []);
	}, []);

	const loadReviews = useCallback(async () => {
		const reviewsResult = await apiRequest<PagedResponse<AdminReview, "reviews">>("/admin/reviews?limit=100");
		setReviews(reviewsResult.reviews);
	}, []);

	const loadCharms = useCallback(async () => {
		const charmsResult = await apiRequest<{ success: boolean; charmItems: AdminCharmItem[] }>("/admin/charm-items");
		setCharms(charmsResult.charmItems || []);
	}, []);

	const loadCategories = useCallback(async () => {
		const result = await apiRequest<{ success: boolean; categories: AdminCategory[] }>("/categories");
		setCategories(result.categories || []);
	}, []);

	const loadSubCategories = useCallback(async () => {
		const result = await apiRequest<{ success: boolean; subcategories: AdminSubCategory[] }>("/subcategories");
		setSubCategories(result.subcategories || []);
	}, []);

	const loadStyles = useCallback(async () => {
		const result = await apiRequest<{ success: boolean; styles: AdminStyle[] }>("/styles");
		setStyles(result.styles || []);
	}, []);

	const loadGenders = useCallback(async () => {
		const result = await apiRequest<{ success: boolean; genders: AdminGender[] }>("/genders");
		setGenders(result.genders || []);
	}, []);

	const loadCombos = useCallback(async () => {
		const result = await apiRequest<{ success: boolean; combos: AdminCombo[] }>("/combos");
		setCombos(result.combos || []);
	}, []);

	const loadNewArrivals = useCallback(async () => {
		const result = await apiRequest<{ success: boolean; section?: AdminHomeSection }>("/admin/home-sections/new-arrivals");
		const section = result.section;
		setNewArrivalsForm({
			eyebrow: section?.eyebrow || "Fresh off the shelf",
			title: section?.title || "New Arrivals",
			products: (section?.products || []).map((item) => typeof item === "string" ? item : item._id).filter(Boolean),
			isActive: section?.isActive !== false,
		});
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
			if (tab === "coupons") {
				await loadCoupons();
				await loadOffers();
			}
			if (tab === "banners") await Promise.all([loadBanners(), loadMainBanners()]);
			if (tab === "reviews") await loadReviews();
			if (tab === "charms") await loadCharms();
			if (tab === "categories") await Promise.all([loadCategories(), loadSubCategories(), loadStyles(), loadGenders()]);
			if (tab === "newArrivals") await Promise.all([loadProducts(), loadNewArrivals()]);
			if (tab === "combos") await Promise.all([loadCombos(), loadProducts(), loadCategories(), loadStyles()]);
		} catch (error) {
			console.error("Error loading tab data:", error);
		} finally {
			setLoading(false);
		}
	}, [loadBanners, loadMainBanners, loadCoupons, loadOffers, loadHome, loadOrders, loadPayments, loadProducts, loadReviews, loadUsers, loadCharms, loadCategories, loadSubCategories, loadStyles, loadGenders, loadNewArrivals, loadCombos]);

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
			setBannerImageFile(null);
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
		const formData = new FormData();
		formData.append("code", couponForm.code);
		formData.append("name", couponForm.name);
		formData.append("description", couponForm.description);
		formData.append("discountType", couponForm.discountType);
		formData.append("discountValue", couponForm.discountValue);
		if (couponForm.maxDiscount) formData.append("maxDiscount", couponForm.maxDiscount);
		formData.append("minOrderValue", couponForm.minOrderValue || "0");
		formData.append("usageLimit", couponForm.usageLimit);
		if (couponForm.startsAt) formData.append("startsAt", new Date(couponForm.startsAt).toISOString());
		if (couponForm.expiryDate) formData.append("expiryDate", new Date(couponForm.expiryDate).toISOString());
		formData.append("isActive", String(couponForm.isActive));
		formData.append("offerCategory", couponForm.offerCategory);
		formData.append("isFeatured", String(couponForm.isFeatured));
		
		if (couponForm.applicableCategories) formData.append("applicableCategories", couponForm.applicableCategories);
		if (couponForm.applicableSubCategories) formData.append("applicableSubCategories", couponForm.applicableSubCategories);
		if (couponForm.applicableStyles) formData.append("applicableStyles", couponForm.applicableStyles);
		if (couponForm.applicableProducts) formData.append("applicableProducts", couponForm.applicableProducts);
		if (couponForm.applicableProductTypes) formData.append("applicableProductTypes", couponForm.applicableProductTypes);

		if (couponForm.imageFile) {
			formData.append("image", couponForm.imageFile);
		}

		await runAction(async () => {
			if (couponForm.id) {
				await apiRequest(`/admin/coupons/${couponForm.id}`, {
					method: "PUT",
					body: formData,
				});
			} else {
				await apiRequest("/admin/coupons", {
					method: "POST",
					body: formData,
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

	const handleOfferSubmit = async (event: FormEvent) => {
		event.preventDefault();
		const formData = new FormData();
		formData.append("title", offerForm.title);
		formData.append("description", offerForm.description);
		formData.append("offerType", offerForm.offerType);
		formData.append("discountValue", offerForm.discountValue);
		formData.append("buyQuantity", offerForm.buyQuantity);
		formData.append("getQuantity", offerForm.getQuantity);
		formData.append("usageLimit", offerForm.usageLimit);
		if (offerForm.startsAt) formData.append("startsAt", new Date(offerForm.startsAt).toISOString());
		if (offerForm.expiryDate) formData.append("expiryDate", new Date(offerForm.expiryDate).toISOString());
		formData.append("isActive", String(offerForm.isActive));

		if (offerForm.applicableCategories) formData.append("applicableCategories", offerForm.applicableCategories);
		if (offerForm.applicableProducts) formData.append("applicableProducts", offerForm.applicableProducts);

		if (offerForm.imageFile) {
			formData.append("image", offerForm.imageFile);
		}

		await runAction(async () => {
			if (offerForm.id) {
				await apiRequest(`/admin/offers/${offerForm.id}`, {
					method: "PUT",
					body: formData,
				});
			} else {
				await apiRequest("/admin/offers", {
					method: "POST",
					body: formData,
				});
			}

			setModalKind(null);
			setModalMode("create");
			setOfferForm(defaultOfferForm);
			await loadOffers();
		}, offerForm.id ? "Offer updated" : "Offer created");
	};

	const handleDeleteOffer = async (id: string) => {
		if (!window.confirm("Delete this offer?")) {
			return;
		}

		await runAction(async () => {
			await apiRequest(`/admin/offers/${id}`, { method: "DELETE" });
			await loadOffers();
		}, "Offer deleted");
	};

	// Categories CRUD — all handlers accept FormData (supports image file upload)
	const handleCreateCategory = async (formData: FormData) => {
		await runAction(async () => {
			await apiRequest("/admin/categories", { method: "POST", body: formData });
			await loadCategories();
		}, "Category created");
	};

	const handleEditCategory = async (id: string, formData: FormData) => {
		await runAction(async () => {
			await apiRequest(`/admin/categories/${id}`, { method: "PUT", body: formData });
			await loadCategories();
		}, "Category updated");
	};

	const handleDeleteCategory = async (id: string) => {
		await runAction(async () => {
			await apiRequest(`/admin/categories/${id}`, { method: "DELETE" });
			await loadCategories();
		}, "Category deleted");
	};

	// Subcategories CRUD
	const handleCreateSubCategory = async (formData: FormData) => {
		await runAction(async () => {
			await apiRequest("/admin/subcategories", { method: "POST", body: formData });
			await loadSubCategories();
		}, "Subcategory created");
	};

	const handleEditSubCategory = async (id: string, formData: FormData) => {
		await runAction(async () => {
			await apiRequest(`/admin/subcategories/${id}`, { method: "PUT", body: formData });
			await loadSubCategories();
		}, "Subcategory updated");
	};

	const handleDeleteSubCategory = async (id: string) => {
		await runAction(async () => {
			await apiRequest(`/admin/subcategories/${id}`, { method: "DELETE" });
			await loadSubCategories();
		}, "Subcategory deleted");
	};

	// Styles CRUD
	const handleCreateStyle = async (formData: FormData) => {
		await runAction(async () => {
			await apiRequest("/admin/styles", { method: "POST", body: formData });
			await loadStyles();
		}, "Style created");
	};

	const handleEditStyle = async (id: string, formData: FormData) => {
		await runAction(async () => {
			await apiRequest(`/admin/styles/${id}`, { method: "PUT", body: formData });
			await loadStyles();
		}, "Style updated");
	};

	const handleDeleteStyle = async (id: string) => {
		await runAction(async () => {
			await apiRequest(`/admin/styles/${id}`, { method: "DELETE" });
			await loadStyles();
		}, "Style deleted");
	};

	// Combos CRUD
	const handleCreateCuratedCombo = async (formData: FormData) => {
		await runAction(async () => {
			await apiRequest("/admin/combos", { method: "POST", body: formData });
			await loadCombos();
		}, "Curated combo created");
	};

	const handleEditCombo = async (id: string, formData: FormData) => {
		await runAction(async () => {
			await apiRequest(`/admin/combos/${id}`, { method: "PUT", body: formData });
			await loadCombos();
		}, "Combo updated");
	};

	const handleCreateCustomCombo = async (formData: FormData) => {
		await runAction(async () => {
			await apiRequest("/admin/combos/custom", { method: "POST", body: formData });
			await loadCombos();
		}, "Custom combo created");
	};

	const handleDeleteCombo = async (id: string) => {
		await runAction(async () => {
			await apiRequest(`/admin/combos/${id}`, { method: "DELETE" });
			await loadCombos();
		}, "Combo deleted");
	};

	// Genders CRUD
	const handleCreateGender = async (formData: FormData) => {
		await runAction(async () => {
			await apiRequest("/admin/genders", { method: "POST", body: formData });
			await loadGenders();
		}, "Gender created");
	};

	const handleEditGender = async (id: string, formData: FormData) => {
		await runAction(async () => {
			await apiRequest(`/admin/genders/${id}`, { method: "PUT", body: formData });
			await loadGenders();
		}, "Gender updated");
	};

	const handleDeleteGender = async (id: string) => {
		await runAction(async () => {
			await apiRequest(`/admin/genders/${id}`, { method: "DELETE" });
			await loadGenders();
		}, "Gender deleted");
	};


	const handleBannerSubmit = async (event: FormEvent) => {
		event.preventDefault();
		const formData = new FormData();
		formData.append("text", bannerForm.text);
		formData.append("title", bannerForm.title);
		formData.append("subtitle", bannerForm.subtitle);
		formData.append("tag", bannerForm.tag);
		formData.append("cta", bannerForm.cta);
		formData.append("link", bannerForm.link);
		formData.append("description", bannerForm.description);
		if (bannerForm.product) {
			formData.append("product", bannerForm.product);
		}
		formData.append(
			"tags",
			JSON.stringify(bannerForm.tags.split(",").map((item) => item.trim()).filter(Boolean))
		);
		formData.append("imageAlt", bannerForm.imageAlt);
		formData.append("isActive", String(bannerForm.isActive));
		formData.append("sortOrder", String(Number(bannerForm.sortOrder || 0)));

		if (bannerImageFile) {
			formData.append("image", bannerImageFile);
		}

		await runAction(async () => {
			if (bannerForm.id) {
				await apiRequest(`/admin/banners/${bannerForm.id}`, {
					method: "PUT",
					body: formData,
				});
			} else {
				await apiRequest("/admin/banners", {
					method: "POST",
					body: formData,
				});
			}

			setModalKind(null);
			setModalMode("create");
			setBannerForm(defaultBannerForm);
			setBannerImageFile(null);
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

	const handleCreateMainBanner = async (payload: FormData) => {
		await runAction(async () => {
			await apiRequest("/admin/banners/main", {
				method: "POST",
				body: payload,
			});
			await loadMainBanners();
		}, "Main banner created");
	};

	const handleUpdateMainBanner = async (id: string, payload: FormData) => {
		await runAction(async () => {
			await apiRequest(`/admin/banners/main/${id}`, {
				method: "PUT",
				body: payload,
			});
			await loadMainBanners();
		}, "Main banner updated");
	};

	const handleDeleteMainBanner = async (id: string) => {
		if (!window.confirm("Delete this main banner?")) {
			return;
		}

		await runAction(async () => {
			await apiRequest(`/admin/banners/main/${id}`, { method: "DELETE" });
			await loadMainBanners();
		}, "Main banner deleted");
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

	const handleNewArrivalsSubmit = async (event: FormEvent) => {
		event.preventDefault();

		await runAction(async () => {
			await apiRequest("/admin/home-sections/new-arrivals", {
				method: "PUT",
				body: JSON.stringify(newArrivalsForm),
			});
			await loadNewArrivals();
		}, "New arrivals updated");
	};

	const handleSignOut = () => {
		signOut();
		router.push("/admin/login");
	};

	const renderTabContent = () => {
		if (activeTab === "home") return <AdminHomeTab 
			stats={stats} 
			totalManagedItems={totalManagedItems} 
			salesAnalytics={salesAnalytics} 
			productAnalytics={productAnalytics} 
			orderAnalytics={orderAnalytics} 
		/>;
		if (activeTab === "products") return <AdminProductsTab products={products} onEdit={(entry) => {
			setSelectedProduct(entry);
			setModalMode("edit");
			setModalKind("product");
		}} onDelete={handleDeleteProduct} />;
		if (activeTab === "users") return <AdminUsersTab users={users} onEdit={(entry) => {
			setUserForm({ id: entry._id, name: entry.name || "", email: entry.email || "", phone: entry.phone || "", role: entry.role || "user", password: "" });
			setModalMode("edit");
			setModalKind("user");
		}} onDelete={handleDeleteUser} />;
		if (activeTab === "orders") return <AdminOrdersTab orders={orders} onStatusChange={handleOrderStatus} onDelete={handleDeleteOrder} />;
		if (activeTab === "payments") return <AdminPaymentsTab payments={payments} onStatusChange={handlePaymentStatus} />;
		if (activeTab === "coupons") return <AdminCouponsTab 
			coupons={coupons}
			offers={offers}
			onEditCoupon={(entry) => {
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
					isFeatured: Boolean(entry.isFeatured),
					applicableCategories: mapIds(entry.applicableCategories),
					applicableSubCategories: mapIds(entry.applicableSubCategories),
					applicableStyles: mapIds(entry.applicableStyles),
					applicableProducts: mapIds(entry.applicableProducts),
					applicableProductTypes: (entry.applicableProductTypes || []).join(", "),
					imageFile: null,
					imageUrl: entry.image || "",
				});
				setModalMode("edit");
				setModalKind("coupon");
			}} 
			onDeleteCoupon={handleDeleteCoupon}
			onEditOffer={(entry) => {
				const mapIds = (values?: Array<{ _id: string } | string>) => (values || []).map((item) => typeof item === "string" ? item : item._id).join(", ");
				setOfferForm({
					id: entry._id,
					title: entry.title,
					description: entry.description || "",
					offerType: entry.offerType,
					discountValue: String(entry.discountValue),
					buyQuantity: String(entry.buyQuantity),
					getQuantity: String(entry.getQuantity),
					startsAt: entry.startsAt ? String(entry.startsAt).slice(0, 10) : "",
					expiryDate: entry.expiryDate ? String(entry.expiryDate).slice(0, 10) : "",
					isActive: entry.isActive,
					usageLimit: String(entry.usageLimit),
					applicableCategories: mapIds(entry.applicableCategories),
					applicableProducts: mapIds(entry.applicableProducts),
					imageFile: null,
					imageUrl: entry.image || "",
				});
				setModalMode("edit");
				setModalKind("offer");
			}}
			onDeleteOffer={handleDeleteOffer}
			onAddCoupon={() => { setModalMode("create"); setModalKind("coupon"); setCouponForm(defaultCouponForm); }}
			onAddOffer={() => { setModalMode("create"); setModalKind("offer"); setOfferForm(defaultOfferForm); }}
		/>;
		if (activeTab === "banners") return <AdminBannersTab banners={banners} mainBanners={mainBanners} onEdit={(entry) => {
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
			setBannerImageFile(null);
			setModalMode("edit");
			setModalKind("banner");
		}} onDelete={handleDeleteBanner} onCreateMainBanner={handleCreateMainBanner} onUpdateMainBanner={handleUpdateMainBanner} onDeleteMainBanner={handleDeleteMainBanner} />;
		if (activeTab === "charms") return <AdminCharmsTab charms={charms} onEdit={(entry) => {
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
		}} onDelete={handleDeleteCharm} />;
	if (activeTab === "newArrivals") return <AdminNewArrivalsTab
		form={newArrivalsForm}
		products={products}
		onChange={setNewArrivalsForm}
		onSubmit={handleNewArrivalsSubmit}
	/>;
	if (activeTab === "categories") return <AdminCategoriesTab
		categories={categories}
		subcategories={subcategories}
		styles={styles}
		genders={genders}
		onCreateCategory={handleCreateCategory}
		onEditCategory={handleEditCategory}
		onDeleteCategory={handleDeleteCategory}
		onCreateSubCategory={handleCreateSubCategory}
		onEditSubCategory={handleEditSubCategory}
		onDeleteSubCategory={handleDeleteSubCategory}
		onCreateStyle={handleCreateStyle}
		onEditStyle={handleEditStyle}
		onDeleteStyle={handleDeleteStyle}
		onCreateGender={handleCreateGender}
		onEditGender={handleEditGender}
		onDeleteGender={handleDeleteGender}
	/>;
	if (activeTab === "combos") return <AdminCombosTab
		combos={combos}
		products={products}
		categories={categories}
		styles={styles}
		onCreateCuratedCombo={handleCreateCuratedCombo}
		onCreateCustomCombo={handleCreateCustomCombo}
		onEditCombo={handleEditCombo}
		onDeleteCombo={handleDeleteCombo}
	/>;
		return <AdminReviewsTab reviews={reviews} editingReview={editingReview} onChangeEditingReview={setEditingReview} onSubmit={handleUpdateReview} onEdit={(entry) => setEditingReview({ productId: entry.productId, reviewId: entry.reviewId, rating: String(entry.rating || 5), comment: entry.comment || "" })} onDelete={handleDeleteReview} />;
	};

	const handleCsvToggle = (id: string, currentCsv: string) => {
		const list = currentCsv.split(",").map((s) => s.trim()).filter(Boolean);
		if (list.includes(id)) {
			return list.filter((i) => i !== id).join(", ");
		}
		return [...list, id].join(", ");
	};

	const renderModal = () => {
		if (!modalKind) {
			return null;
		}

		const closeModal = () => {
			setModalKind(null);
			setModalMode("create");
			setBannerImageFile(null);
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
							<div className="admin-form-group">
								<label>Coupon Code</label>
								<input placeholder="E.g. SAVE20" value={couponForm.code ?? ""} onChange={(event) => setCouponForm((prev) => ({ ...prev, code: event.target.value.toUpperCase() }))} required />
							</div>
							
							<div className="admin-form-group">
								<label>Name</label>
								<input placeholder="Summer Sale" value={couponForm.name ?? ""} onChange={(event) => setCouponForm((prev) => ({ ...prev, name: event.target.value }))} required />
							</div>

							<div className="admin-form-group">
								<label>Description</label>
								<textarea placeholder="Describe this coupon..." value={couponForm.description ?? ""} onChange={(event) => setCouponForm((prev) => ({ ...prev, description: event.target.value }))} />
							</div>

							<div className="admin-form-group">
								<label>Discount Type</label>
								<select value={couponForm.discountType ?? "percentage"} onChange={(event) => setCouponForm((prev) => ({ ...prev, discountType: event.target.value as "percentage" | "fixed" }))}>
									<option value="percentage">Percentage Off (%)</option>
									<option value="fixed">Fixed Amount Off (₹)</option>
								</select>
							</div>

							<div className="admin-form-group">
								<label>Discount Value</label>
								<input type="number" min="0" step="any" value={couponForm.discountValue ?? ""} onChange={(event) => setCouponForm((prev) => ({ ...prev, discountValue: event.target.value }))} required />
							</div>

							<div className="admin-form-group">
								<label>Max Discount Amount (₹)</label>
								<input type="number" min="0" value={couponForm.maxDiscount ?? ""} onChange={(event) => setCouponForm((prev) => ({ ...prev, maxDiscount: event.target.value }))} />
							</div>

							<div className="admin-form-group">
								<label>Min Order Value (₹)</label>
								<input type="number" min="0" value={couponForm.minOrderValue ?? "0"} onChange={(event) => setCouponForm((prev) => ({ ...prev, minOrderValue: event.target.value }))} />
							</div>

							<div className="admin-form-group">
								<label>Usage Limit (0 for unlimited)</label>
								<input type="number" min="0" value={couponForm.usageLimit ?? ""} onChange={(event) => setCouponForm((prev) => ({ ...prev, usageLimit: event.target.value }))} />
							</div>

							<div className="admin-form-group">
								<label>Starts At</label>
								<input type="date" value={couponForm.startsAt ?? ""} onChange={(event) => setCouponForm((prev) => ({ ...prev, startsAt: event.target.value }))} />
							</div>

							<div className="admin-form-group">
								<label>Expiry Date</label>
								<input type="date" value={couponForm.expiryDate ?? ""} onChange={(event) => setCouponForm((prev) => ({ ...prev, expiryDate: event.target.value }))} />
							</div>

							<div className="admin-form-group">
								<label>Offer Category (Visual Tag)</label>
								<select value={couponForm.offerCategory} onChange={(event) => setCouponForm((prev) => ({ ...prev, offerCategory: event.target.value as "jewellery" | "combo" | "gift" | "all" }))}>
									<option value="all">Sitewide</option>
									<option value="jewellery">Jewellery</option>
									<option value="combo">Combos</option>
									<option value="gift">Gift</option>
								</select>
							</div>

							<div className="admin-form-group">
								<label>Coupon Banner Image</label>
								<input type="file" accept="image/*" onChange={(e) => setCouponForm((prev) => ({ ...prev, imageFile: e.target.files?.[0] || null }))} />
								{couponForm.imageUrl && !couponForm.imageFile && (
									<Image src={couponForm.imageUrl} alt="Preview" width={80} height={80} style={{ objectFit: 'cover', borderRadius: '4px', marginTop: '0.5rem' }} />
								)}
							</div>

							<div className="admin-form-group" style={{ gridColumn: "1 / -1" }}>
								<label>Applicable Categories</label>
								<div className="admin-checkbox-list">
									{categories.map((cat) => (
										<label key={cat._id} className="admin-checkbox" style={{ margin: 0 }}>
											<input 
												type="checkbox" 
												checked={couponForm.applicableCategories.includes(cat._id)} 
												onChange={() => setCouponForm(prev => ({ ...prev, applicableCategories: handleCsvToggle(cat._id, prev.applicableCategories) }))} 
											/>
											{cat.name}
										</label>
									))}
									{categories.length === 0 && <span style={{ fontSize: '0.85rem', color: '#666' }}>No categories found</span>}
								</div>
							</div>

							<div className="admin-form-group" style={{ gridColumn: "1 / -1" }}>
								<label>Applicable Products</label>
								<div className="admin-checkbox-list">
									{products.map((prod) => (
										<label key={prod._id} className="admin-checkbox" style={{ margin: 0 }}>
											<input 
												type="checkbox" 
												checked={couponForm.applicableProducts.includes(prod._id)} 
												onChange={() => setCouponForm(prev => ({ ...prev, applicableProducts: handleCsvToggle(prod._id, prev.applicableProducts) }))} 
											/>
											{prod.title}
										</label>
									))}
									{products.length === 0 && <span style={{ fontSize: '0.85rem', color: '#666' }}>No products found</span>}
								</div>
							</div>

							<div className="admin-form-group" style={{ gridColumn: "1 / -1" }}>
								<label className="admin-checkbox">
									<input type="checkbox" checked={couponForm.isActive} onChange={(event) => setCouponForm((prev) => ({ ...prev, isActive: event.target.checked }))} />
									<strong>Coupon is Active</strong>
								</label>
								<label className="admin-checkbox">
									<input type="checkbox" checked={couponForm.isFeatured} onChange={(event) => setCouponForm((prev) => ({ ...prev, isFeatured: event.target.checked }))} />
									<strong>Featured (show New badge)</strong>
								</label>
							</div>

							<div className="admin-inline-actions" style={{ gridColumn: "1 / -1", marginTop: "1rem" }}>
								<button className="admin-btn" type="submit">{modalMode === "edit" ? "Update Coupon" : "Create Coupon"}</button>
							</div>
						</form>
					</div>
				</div>
			);
		}

		if (modalKind === "offer") {
			return (
				<div className="admin-modal-backdrop" onClick={closeModal}>
					<div className="admin-modal" onClick={(event) => event.stopPropagation()}>
						<div className="admin-modal-header">
							<h3>{modalMode === "edit" ? "Edit Offer" : "Add Offer"}</h3>
							<button className="admin-btn admin-btn-muted" type="button" onClick={closeModal}>Close</button>
						</div>
						<form className="admin-form-grid" onSubmit={handleOfferSubmit}>
							<div className="admin-form-group">
								<label>Offer Title</label>
								<input placeholder="E.g. Summer Sale" value={offerForm.title ?? ""} onChange={(event) => setOfferForm((prev) => ({ ...prev, title: event.target.value }))} required />
							</div>
							
							<div className="admin-form-group">
								<label>Description</label>
								<textarea placeholder="Describe this offer..." value={offerForm.description ?? ""} onChange={(event) => setOfferForm((prev) => ({ ...prev, description: event.target.value }))} />
							</div>

							<div className="admin-form-group">
								<label>Offer Type</label>
								<select value={offerForm.offerType ?? "percentage"} onChange={(event) => setOfferForm((prev) => ({ ...prev, offerType: event.target.value as "bogo" | "percentage" | "fixed" }))}>
									<option value="percentage">Percentage Off (%)</option>
									<option value="fixed">Fixed Amount Off (₹)</option>
									<option value="bogo">Buy X Get Y Free</option>
								</select>
							</div>

							{offerForm.offerType === "bogo" ? (
								<>
									<div className="admin-form-group">
										<label>Buy Quantity</label>
										<input type="number" min="1" value={offerForm.buyQuantity} onChange={(event) => setOfferForm((prev) => ({ ...prev, buyQuantity: event.target.value }))} required />
									</div>
									<div className="admin-form-group">
										<label>Get Quantity Free</label>
										<input type="number" min="1" value={offerForm.getQuantity} onChange={(event) => setOfferForm((prev) => ({ ...prev, getQuantity: event.target.value }))} required />
									</div>
								</>
							) : (
								<div className="admin-form-group">
									<label>Discount Value</label>
									<input type="number" min="0" step="any" value={offerForm.discountValue} onChange={(event) => setOfferForm((prev) => ({ ...prev, discountValue: event.target.value }))} required />
								</div>
							)}
							
							<div className="admin-form-group">
								<label>Usage Limit (0 for unlimited)</label>
								<input type="number" min="0" value={offerForm.usageLimit} onChange={(event) => setOfferForm((prev) => ({ ...prev, usageLimit: event.target.value }))} />
							</div>

							<div className="admin-form-group">
								<label>Starts At</label>
								<input type="date" value={offerForm.startsAt ?? ""} onChange={(event) => setOfferForm((prev) => ({ ...prev, startsAt: event.target.value }))} />
							</div>

							<div className="admin-form-group">
								<label>Expiry Date</label>
								<input type="date" value={offerForm.expiryDate ?? ""} onChange={(event) => setOfferForm((prev) => ({ ...prev, expiryDate: event.target.value }))} />
							</div>
							
							<div className="admin-form-group">
								<label>Offer Image</label>
								<input type="file" accept="image/*" onChange={(e) => setOfferForm((prev) => ({ ...prev, imageFile: e.target.files?.[0] || null }))} />
								{offerForm.imageUrl && !offerForm.imageFile && (
									<Image src={offerForm.imageUrl} alt="Offer Preview" width={80} height={80} style={{ objectFit: 'cover', borderRadius: '4px', marginTop: '0.5rem' }} />
								)}
							</div>

							<div className="admin-form-group" style={{ gridColumn: "1 / -1" }}>
								<label>Applicable Categories</label>
								<div className="admin-checkbox-list">
									{categories.map((cat) => (
										<label key={cat._id} className="admin-checkbox" style={{ margin: 0 }}>
											<input 
												type="checkbox" 
												checked={offerForm.applicableCategories.includes(cat._id)} 
												onChange={() => setOfferForm(prev => ({ ...prev, applicableCategories: handleCsvToggle(cat._id, prev.applicableCategories) }))} 
											/>
											{cat.name}
										</label>
									))}
									{categories.length === 0 && <span style={{ fontSize: '0.85rem', color: '#666' }}>No categories found</span>}
								</div>
							</div>

							<div className="admin-form-group" style={{ gridColumn: "1 / -1" }}>
								<label>Applicable Products</label>
								<div className="admin-checkbox-list">
									{products.map((prod) => (
										<label key={prod._id} className="admin-checkbox" style={{ margin: 0 }}>
											<input 
												type="checkbox" 
												checked={offerForm.applicableProducts.includes(prod._id)} 
												onChange={() => setOfferForm(prev => ({ ...prev, applicableProducts: handleCsvToggle(prod._id, prev.applicableProducts) }))} 
											/>
											{prod.title}
										</label>
									))}
									{products.length === 0 && <span style={{ fontSize: '0.85rem', color: '#666' }}>No products found</span>}
								</div>
							</div>

							<div className="admin-form-group" style={{ gridColumn: "1 / -1" }}>
								<label className="admin-checkbox">
									<input type="checkbox" checked={offerForm.isActive} onChange={(event) => setOfferForm((prev) => ({ ...prev, isActive: event.target.checked }))} />
									<strong>Offer is Active</strong>
								</label>
							</div>

							<div className="admin-inline-actions" style={{ gridColumn: "1 / -1", marginTop: "1rem" }}>
								<button className="admin-btn" type="submit">{modalMode === "edit" ? "Update Offer" : "Create Offer"}</button>
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
							{charmForm.imageUrl && !charmForm.imageFile && (
								<Image
									src={charmForm.imageUrl}
									alt="Charm Preview"
									width={60}
									height={60}
									style={{ objectFit: "contain", borderRadius: 8 }}
								/>
							)}
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
						<input type="file" accept="image/*" onChange={(event) => {
							const file = event.target.files?.[0] || null;
							setBannerImageFile(file);
						}} />
						<input placeholder="Image Alt" value={bannerForm.imageAlt ?? ""} onChange={(event) => setBannerForm((prev) => ({ ...prev, imageAlt: event.target.value }))} />
						<input placeholder="Sort Order" type="number" value={bannerForm.sortOrder ?? "0"} onChange={(event) => setBannerForm((prev) => ({ ...prev, sortOrder: event.target.value }))} />
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
			<div className={`admin-sidebar-backdrop ${isSidebarOpen ? "sidebar-open" : ""}`} onClick={() => setIsSidebarOpen(false)} />
			<aside className={`admin-sidebar ${isSidebarOpen ? "sidebar-open" : ""}`}>
				<div className="admin-brand">
					<p>MakeUsSparkle</p>
					<h1>Admin</h1>
				</div>
				<nav>
					{tabs.map((tab) => (
						<button 
							key={tab.key} 
							className={`admin-side-link ${activeTab === tab.key ? "active" : ""}`} 
							onClick={() => {
								setActiveTab(tab.key);
								setIsSidebarOpen(false);
							}}
						>
							{tab.label}
						</button>
					))}
				</nav>
			</aside>

			<section className="admin-main">
				<header className="admin-topbar">
					<div>
						<div className="admin-mobile-header" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}>
							<button 
								className="admin-btn admin-sidebar-toggle" 
								onClick={() => setIsSidebarOpen(true)}
								aria-label="Toggle Sidebar"
							>
								☰
							</button>
							<p className="admin-login-kicker" style={{ marginBottom: 0 }}>CONTROL CENTER</p>
						</div>
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
