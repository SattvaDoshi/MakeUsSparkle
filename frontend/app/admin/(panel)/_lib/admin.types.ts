export type AdminExitSurvey = {
	_id: string;
	reason: string;
	otherText?: string;
	createdAt: string;
};

export type DashboardStatsResponse = {
	success: boolean;
	stats: {
		users: number;
		orders: number;
		products: number;
		revenue: number;
	};
};

export type SalesAnalyticsItem = {
	_id: string;
	totalSales: number;
	totalOrders: number;
};

export type ProductAnalyticsItem = {
	_id: string;
	name: string;
	price: number;
	ordersCount: number;
};

export type OrderAnalyticsItem = {
	_id: string;
	count: number;
	total: number;
};

export type AdminUser = {
	_id: string;
	name: string;
	email: string;
	phone?: string;
	role: "user" | "admin";
	createdAt?: string;
};

export type AdminProduct = {
	_id: string;
	title: string;
	description?: string;
	about?: string;
	category?: { _id: string; name?: string; title?: string } | string;
	subCategory?: { _id: string; name?: string; title?: string } | string;
	style?: { _id: string; name?: string; title?: string } | string;
	price?: number;
	discountedPrice?: number;
	discountTag?: string;
	allowCustomization?: boolean;
	stock?: number;
	gender?: "men" | "women" | "kids" | "unisex";
	mainImage?: string;
	images?: string[];
	tags?: string[];
	seoTags?: string[];
	colors?: Array<{ name: string; hex: string }>;
	sizes?: string[];
	variants?: Array<{
		color: string;
		size: string;
		stock: number;
		image?: string;
		imagePublicId?: string;
	}>;
	createdAt?: string;
	updatedAt?: string;
	totalCharms?: number;
	charmPieceOptions?: number[];
	displayOrder?: number;
};

// ─── iThink Logistics shipping types ───────────────────────────────────────
export type ShippingInfo = {
	awbNumber?: string | null;
	logisticName?: string | null;
	trackingUrl?: string | null;
	currentStatus?: string | null;
	currentStatusCode?: string | null;
	expectedDeliveryDate?: string | null;
	pickupAddressId?: string | null;
	lastSyncedAt?: string | null;
	cancelStatus?: string | null;
};

export type Warehouse = {
	id?: string | number;
	warehouse_id?: string | number;
	name?: string;
	phone?: string;
	address?: string;
	city?: string;
	state?: string;
	pincode?: string;
	[key: string]: unknown;
};

export type AdminOrder = {
	_id: string;
	totalAmount?: number;
	advanceAmount?: number;
	balanceAmount?: number;
	paidAmount?: number;
	status?: "placed" | "shipped" | "delivered" | "cancelled" | "confirmed";
	paymentStatus?: "pending" | "paid" | "failed" | "completed" | "partial_paid";
	paymentMode?: string;
	phonePeOrderId?: string;
	phonePeTransactionId?: string;
	discountAmount?: number;
	discountCode?: string;
	autoDiscountAmount?: number;
	rewardPointsRedeemed?: number;
	deliveryType?: string;
	user?: {
		_id?: string;
		name?: string;
		email?: string;
	};
	address?: {
		name?: string;
		addressLine1?: string;
		addressLine2?: string;
		landmark?: string;
		fullAddress?: string;
		city?: string;
		state?: string;
		pincode?: string;
		phone?: string;
		alternativePhone?: string;
	};
	shippingAddress?: { name?: string; addressLine1?: string; addressLine2?: string; landmark?: string; fullAddress?: string; city?: string; state?: string; pincode?: string; phone?: string; alternativePhone?: string };
	billingAddress?: { name?: string; addressLine1?: string; addressLine2?: string; landmark?: string; fullAddress?: string; city?: string; state?: string; pincode?: string; phone?: string; alternativePhone?: string };
	items?: Array<{
		_id?: string;
		name?: string;
		category?: string;
		product?: { _id: string; title?: string; images?: string[] } | string | null;
		sourceId?: string;
		quantity?: number;
		price?: number;
		customNote?: string;
		customImages?: string[];
		selectedCharms?: Array<{ _id: string; name?: string; emoji?: string } | string>;
		selectionGroups?: Array<{
			_id?: string;
			type?: string;
			category?: string;
			label?: string;
			itemRefModel?: string;
			items?: Array<{
				_id?: string;
				item?: any;
				name?: string;
				quantity?: number;
				price?: number;
				image?: string;
				images?: string[];
				customData?: {
					selections?: Record<string, string>;
					color?: string;
					colorHex?: string;
					size?: string;
					isCustomised?: boolean;
					[key: string]: any;
				};
			}>;
		}>;
		customData?: Record<string, any>;
	}>;
	isGift?: boolean;
	giftMessage?: string;
	createdAt?: string;
	updatedAt?: string;
	// iThink Logistics shipping sub-document
	shipping?: ShippingInfo;
};

export type AdminCoupon = {
	_id: string;
	code: string;
	name: string;
	description?: string;
	discountType: "percentage" | "fixed" | "free_shipping";
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

export type AdminOffer = {
	_id: string;
	title: string;
	description?: string;
	offerType: "bogo" | "percentage" | "fixed" | "buy_x_for_y" | "free_shipping";
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

export type AdminBanner = {
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
	textSide?: "left" | "right";
	product?: {
		_id: string;
		title?: string;
	};
};

export type MainBanner = {
	_id: string;
	bannerType?: "main";
	image?: string;
	link?: string;
	isActive?: boolean;
};

export type AdminReview = {
	productId: string;
	productTitle: string;
	reviewId: string;
	rating?: number;
	comment?: string;
	isVerifiedPurchase?: boolean;
	user?: {
		name?: string;
		email?: string;
	};
};

export type AdminCharmItem = {
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

export type PagedResponse<T, K extends string> = {
	success: boolean;
	pagination: {
		page: number;
		limit: number;
		total: number;
	};
} & Record<K, T[]>;

export type TabKey = "home" | "products" | "users" | "orders" | "payments" | "coupons" | "banners" | "reviews" | "charms" | "shipping";

export type ProductFormState = {
	id: string;
	title: string;
	price: string;
	stock: string;
	gender: "men" | "women" | "kids" | "unisex";
	description: string;
};

export type UserFormState = {
	id: string;
	name: string;
	email: string;
	phone: string;
	role: "user" | "admin";
	password: string;
};

export type CouponFormState = {
	id: string;
	code: string;
	name: string;
	description: string;
	discountType: "percentage" | "fixed" | "free_shipping";
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
	imageFile: File | null;
	imageUrl: string;
};

export type BannerFormState = {
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
	textSide: "left" | "right";
};

export type CharmFormState = {
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

export type OfferFormState = {
	id: string;
	title: string;
	description: string;
	offerType: "bogo" | "percentage" | "fixed" | "buy_x_for_y" | "free_shipping";
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

export const defaultProductForm: ProductFormState = {
	id: "",
	title: "",
	price: "",
	stock: "",
	gender: "unisex",
	description: "",
};

export const defaultUserForm: UserFormState = {
	id: "",
	name: "",
	email: "",
	phone: "",
	role: "user",
	password: "",
};

export const defaultCouponForm: CouponFormState = {
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
	imageFile: null,
	imageUrl: "",
};

export const defaultBannerForm: BannerFormState = {
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
	textSide: "right",
};

export const defaultCharmForm: CharmFormState = {
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

export const defaultOfferForm: OfferFormState = {
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

export const tabs: Array<{ key: TabKey; label: string }> = [
	{ key: "home", label: "Home" },
	{ key: "products", label: "Products" },
	{ key: "users", label: "Users" },
	{ key: "orders", label: "Orders" },
	{ key: "payments", label: "Payments" },
	{ key: "coupons", label: "Offers & Coupons" },
	{ key: "banners", label: "Banners" },
	{ key: "reviews", label: "Reviews" },
	{ key: "charms", label: "Charms" },
];

export const createActionsByTab: Partial<Record<TabKey, string>> = {
	products: "Add Product",
	users: "Add User",
	coupons: "Add Coupon",
	banners: "Add Banner",
	charms: "Add Charm",
};
