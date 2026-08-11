import { apiRequest } from "@/lib/api";

export interface CatalogCategory {
  id: string;
  name: string;
  description?: string;
  image?: string;
  slug: string;
  genderSlug?: string;
}

export interface CatalogSubCategory {
  id: string;
  name: string;
  image?: string;
  categoryId?: string;
  slug: string;
}

export interface CatalogStyle {
  id: string;
  name: string;
  image?: string;
  slug: string;
  // gender can be a string slug/id or an object returned from the backend
  gender?: string | BackendGender;
}

export interface CatalogGender {
  id: string;
  name: string;
  slug: string;
  image?: string;
  isActive: boolean;
}

export interface CatalogColor {
  label: string;
  hex: string;
  image?: string;
}

export interface CatalogProduct {
  id: number;
  sourceId: string;
  name: string;
  description: string;
  about?: string;
  price: number;
  discountedPrice?: number | null;
  discountTag?: string | null;
  allowCustomization?: boolean;
  maxCustomImages?: number;
  customImageLabels?: string[];
  maxQuantity?: number;
  volumeDiscounts?: { quantity: number; discountPercentage: number }[];
  originalPrice: number | null;
  rating: number;
  reviewCount: number;
  images: string[];
  mainImage?: string | null;
  category: string;
  categoryId?: string;
  categorySlug: string;
  subCategory: string;
  subCategoryId?: string;
  subCategorySlug: string;
  style: string;
  styleId?: string;
  styleSlug: string;
  type: string;
  subtype?: string;
  gender: "men" | "women" | "kids" | "unisex";
  stock: number;
  numberOfProducts: number;
  badge: string | null;
  offer: string | null;
  sku: string;
  href: string;
  colors: CatalogColor[];
  sizes: string[];
  variants: Array<{
    color: string;
    size: string;
    stock: number;
    price?: number;
    salePrice?: number;
    image?: string;
    imagePublicId?: string;
    bandName?: string;
    bandExistingImage?: string;
  }>;
  faqs?: Array<{ question: string; answer: string }>;
  tags: string[];
  seoTags: string[];
  quantityVariants?: { label: string; quantity: number; price: number }[];
  charmPieceOptions?: number[];
  charmPiecePricing?: { count: number; price: number }[];
  totalCharms?: number;
  perCharmPrice?: number;
  /** Per-product size chart image URL (Cloudinary). Null = use default static fallback. */
  sizeChartImage?: string | null;
  /** Steps to measure for the size chart */
  sizeChartSteps?: string;
  /** Per-product gift box upsell configuration. */
  giftBox?: {
    enabled: boolean;
    heading: string;
    description: string;
    price: number;
    image: string | null;
  } | null;
  partialCOD?: {
    enabled: boolean;
    percentage: number;
  };
  paymentMode?: 'cod_allowed' | 'prepaid_only' | 'partial_cod';
}

type BackendMaybeRef = string | { _id?: string; id?: string; name?: string } | null | undefined;

interface BackendCategory {
  _id: string;
  name?: string;
  description?: string;
  image?: string;
  gender?: BackendGender | BackendMaybeRef;
}

interface BackendSubCategory {
  _id: string;
  name?: string;
  image?: string;
  category?: BackendMaybeRef;
}

interface BackendStyle {
  _id: string;
  name?: string;
  image?: string;
  gender?: BackendMaybeRef;
}

interface BackendGender {
  _id: string;
  name?: string;
  slug?: string;
  image?: string;
  isActive?: boolean;
}

interface BackendReview {
  rating?: number;
}

interface BackendProduct {
  _id: string;
  title?: string;
  description?: string;
  about?: string;
  price?: number;
  discountedPrice?: number;
  discountTag?: string;
  productLabel?: string;
  allowCustomization?: boolean;
  maxCustomImages?: number;
  customImageLabels?: string[];
  rating?: number;
  images?: string[];
  mainImage?: string;
  colors?: Array<{ name?: string; hex?: string; image?: string; imagePublicId?: string }>;
  sizes?: string[];
  variants?: Array<{
    color?: string;
    size?: string;
    stock?: number;
    price?: number;
    salePrice?: number;
    image?: string;
    imagePublicId?: string;
  }>;
  category?: BackendMaybeRef;
  subCategory?: BackendMaybeRef;
  style?: BackendMaybeRef;
  gender?: "men" | "women" | "kids" | "unisex";
  stock?: number;
  numberOfProducts?: number;
  tags?: string[];
  seoTags?: string[];
  quantityVariants?: Array<{ label: string; quantity: number; price: number }>;
  faqs?: Array<{ question: string; answer: string }>;
  reviews?: BackendReview[];
  charmPieceOptions?: number[];
  totalCharms?: number;
  perCharmPrice?: number;
  sizeChartImage?: string | null;
  sizeChartSteps?: string;
  giftBox?: {
    enabled?: boolean;
    heading?: string;
    description?: string;
    price?: number;
    image?: string | null;
    imagePublicId?: string | null;
  } | null;
  partialCOD?: {
    enabled?: boolean;
    percentage?: number;
  };
}

interface BackendHomeSection {
  _id?: string;
  key: string;
  eyebrow?: string;
  title?: string;
  products?: BackendProduct[];
  isActive?: boolean;
}

export interface CatalogHomeSection {
  key: string;
  eyebrow: string;
  title: string;
  products: CatalogProduct[];
  isActive: boolean;
}

const FALLBACK_IMAGE = "/images/hero.png";

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function toNumericId(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) || 1;
}

function getRefId(ref: BackendMaybeRef): string | undefined {
  if (!ref) return undefined;
  if (typeof ref === "string") return ref;
  return ref._id || ref.id;
}

function pickBadge(rating: number): string | null {
  if (rating >= 4.8) return "Best Seller";
  if (rating >= 4.5) return "Trending";
  return null;
}

function uniqueStrings(values: Array<string | undefined | null>): string[] {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value && value.trim()))));
}

function toCategory(item: BackendCategory): CatalogCategory {
  const name = item.name || "Category";
  const rawGender = item.gender;
  const genderSlug =
    typeof rawGender === "string"
      ? rawGender
      : rawGender && typeof rawGender === "object"
        ? (rawGender as BackendGender).slug || ((rawGender as BackendGender).name ? toSlug((rawGender as BackendGender).name || "") : undefined)
        : undefined;
  return {
    id: item._id,
    name,
    description: item.description,
    image: item.image,
    slug: toSlug(name),
    genderSlug,
  };
}

function toSubCategory(item: BackendSubCategory): CatalogSubCategory {
  const name = item.name || "Subcategory";
  return {
    id: item._id,
    name,
    image: item.image,
    categoryId: getRefId(item.category),
    slug: toSlug(name),
  };
}

function toStyle(item: BackendStyle): CatalogStyle {
  const name = item.name || "Style";
  return {
    id: item._id,
    name,
    image: item.image,
    slug: toSlug(name),
    gender: (item.gender as any) ?? undefined,
  };
}

function toGender(item: BackendGender): CatalogGender {
  const name = item.name || "Gender";
  return {
    id: item._id,
    name,
    slug: item.slug || toSlug(name),
    image: item.image,
    isActive: item.isActive !== false,
  };
}

function normalizeProduct(
  item: BackendProduct,
  categoryMap: Map<string, CatalogCategory>,
  subCategoryMap: Map<string, CatalogSubCategory>,
  styleMap: Map<string, CatalogStyle>
): CatalogProduct {
  const categoryId = getRefId(item.category);
  const subCategoryId = getRefId(item.subCategory);
  const styleId = getRefId(item.style);

  const category = categoryId ? categoryMap.get(categoryId) : undefined;
  const subCategory = subCategoryId ? subCategoryMap.get(subCategoryId) : undefined;
  const style = styleId ? styleMap.get(styleId) : undefined;

  const name = item.title || "Untitled Product";
  const categoryName = category?.name || "Jewellery";
  const subCategoryName = subCategory?.name || "";
  const styleName = style?.name || "";
  const rawColors = Array.isArray(item.colors) ? item.colors : [];
  const variants = Array.isArray(item.variants)
    ? item.variants
        .map((variant) => ({
          color: variant.color || "",
          size: variant.size || "",
          stock: Number(variant.stock ?? 0),
          price: variant.price !== undefined && variant.price !== null ? Number(variant.price) : undefined,
          salePrice: variant.salePrice !== undefined && variant.salePrice !== null ? Number(variant.salePrice) : undefined,
          image: variant.image,
          imagePublicId: variant.imagePublicId,
          bandName: variant.bandName,
          bandExistingImage: variant.bandImage,
        }))
        .filter((variant) => variant.color || variant.size || variant.image || variant.bandName)
    : [];

  const colorsFromBackend = rawColors
    .map((color) => ({
      label: color.name || "Color",
      hex: color.hex || "#c9a84c",
      image: color.image,
    }))
    .filter((color, index, array) => array.findIndex((entry) => entry.label.toLowerCase() === color.label.toLowerCase()) === index);

  const colorsFromVariants = uniqueStrings(variants.map((variant) => variant.color)).map((label, index) => ({
    label,
    hex: colorsFromBackend[index]?.hex || "#c9a84c",
    image: colorsFromBackend[index]?.image,
  }));

  const colors = colorsFromBackend.length > 0 ? colorsFromBackend : colorsFromVariants;
  const sizes = uniqueStrings([
    ...(Array.isArray(item.sizes) ? item.sizes : []),
    ...variants.map((variant) => variant.size),
  ]);

  const imagePool = uniqueStrings([
    ...(Array.isArray(item.images) ? item.images : []),
    item.mainImage,
    ...variants.map((variant) => variant.image),
  ]);

  const rating = Number(item.rating ?? 0);
  const reviewCount = Array.isArray(item.reviews) ? item.reviews.length : 0;
  const dbPrice = Number(item.price ?? 0);
  const discountedPrice = item.discountedPrice ? Number(item.discountedPrice) : null;
  const originalPrice = discountedPrice ? dbPrice : null;
  const price = discountedPrice || dbPrice;
  // Use _id as slug so the detail page can call GET /products/:id directly
  const slug = item._id;

  const subCategorySlug = subCategory?.slug || "";
  const categorySlug = category?.slug || toSlug(categoryName);

  return {
    id: toNumericId(item._id),
    sourceId: item._id,
    name,
    description: item.description || "",
    about: item.about || "",
    price,
    discountedPrice,
    discountTag: item.discountTag || null,
    allowCustomization: item.allowCustomization === true,
    maxCustomImages: item.maxCustomImages,
    customImageLabels: Array.isArray(item.customImageLabels) ? item.customImageLabels : [],
    originalPrice,
    rating,
    reviewCount,
    category: categoryName,
    categoryId,
    categorySlug,
    subCategory: subCategoryName,
    subCategoryId,
    subCategorySlug,
    style: styleName,
    styleId,
    styleSlug: style?.slug || "",
    type: subCategorySlug || categorySlug,
    subtype: subCategorySlug || undefined,
    gender: item.gender || "unisex",
    stock: Number(item.stock ?? 0),
    numberOfProducts: Number(item.numberOfProducts ?? 1),
    quantityVariants: Array.isArray(item.quantityVariants) ? item.quantityVariants : undefined,
    partialCOD: item.partialCOD ? {
      enabled: Boolean(item.partialCOD.enabled),
      percentage: Number(item.partialCOD.percentage || 0),
    } : undefined,
    paymentMode: (item as any).paymentMode || 'cod_allowed',
    badge: item.productLabel || pickBadge(rating),
    offer: item.discountTag || null,
    sku: `SKU-${item._id.slice(-6).toUpperCase()}`,
    href: `/products/${slug}`,
    colors: colors.length > 0 ? colors : [],
    sizes,
    variants,
    images: imagePool.length > 0 ? imagePool : [FALLBACK_IMAGE],
    mainImage: item.mainImage || null,
    faqs: Array.isArray(item.faqs) ? item.faqs : [],
    tags: Array.isArray(item.tags) ? item.tags : [],
    seoTags: Array.isArray(item.seoTags) ? item.seoTags : [],
    charmPieceOptions: Array.isArray(item.charmPieceOptions) ? item.charmPieceOptions : [],
    charmPiecePricing: Array.isArray(item.charmPiecePricing) ? item.charmPiecePricing : [],
    totalCharms: Number(item.totalCharms ?? 0),
    perCharmPrice: Number(item.perCharmPrice ?? 0),
    sizeChartImage: item.sizeChartImage || null,
    sizeChartSteps: item.sizeChartSteps || "",
    giftBox: item.giftBox
      ? {
          enabled:     item.giftBox.enabled !== false,
          heading:     item.giftBox.heading     || "Premium Gift Box",
          description: item.giftBox.description || "Rigid magnetic-close box \u00b7 satin ribbon \u00b7 message card",
          price:       Number(item.giftBox.price ?? 99),
          image:       item.giftBox.image || null,
        }
      : null,
  };
}

export function slugifyCatalog(value: string): string {
  return toSlug(value);
}

export async function fetchCatalogCategories(): Promise<CatalogCategory[]> {
  const data = await apiRequest<{ success: boolean; categories?: BackendCategory[] }>("/categories");
  return (data.categories || []).map(toCategory);
}

export async function fetchCatalogSubCategories(categoryId?: string): Promise<CatalogSubCategory[]> {
  const query = categoryId ? `?categoryId=${encodeURIComponent(categoryId)}` : "";
  const data = await apiRequest<{ success: boolean; subcategories?: BackendSubCategory[] }>(`/subcategories${query}`);
  return (data.subcategories || []).map(toSubCategory);
}

export async function fetchCatalogStyles(): Promise<CatalogStyle[]> {
  const data = await apiRequest<{ success: boolean; styles?: BackendStyle[] }>("/styles");
  return (data.styles || []).map(toStyle);
}

export async function fetchCatalogGenders(): Promise<CatalogGender[]> {
  const data = await apiRequest<{ success: boolean; genders?: BackendGender[] }>("/genders");
  const allowed = new Set(["men", "women", "kids"]);
  return (data.genders || [])
    .map(toGender)
    .map((g) => {
      const raw = (g.slug || "").toLowerCase();
      let slug = raw;
      if (raw === "male" || raw === "man" || raw === "m") slug = "men";
      if (raw === "female" || raw === "woman" || raw === "f" || raw === "female") slug = "women";
      if (raw === "kid" || raw === "child") slug = "kids";
      return { ...g, slug, isActive: g.isActive !== false };
    })
    .filter((gender) => allowed.has(gender.slug) && gender.isActive);
}

export async function fetchCatalogProducts(filters: { subCategorySlug?: string } = {}): Promise<CatalogProduct[]> {
  const [categories, subCategories, styles] = await Promise.all([
    fetchCatalogCategories(),
    fetchCatalogSubCategories(),
    fetchCatalogStyles(),
  ]);

  const params = new URLSearchParams();
  if (filters.subCategorySlug) {
    const targetSlug = toSlug(filters.subCategorySlug);
    const matchedSubCategory = subCategories.find(
      (subCategory) => subCategory.slug === targetSlug || toSlug(subCategory.name) === targetSlug,
    );
    if (matchedSubCategory?.id) {
      params.set("subCategory", matchedSubCategory.id);
    }
  }

  const productsResponse = await apiRequest<{ success: boolean; products?: BackendProduct[] }>(
    `/products${params.toString() ? `?${params.toString()}` : ""}`
  );

  const categoryMap = new Map(categories.map((item) => [item.id, item]));
  const subCategoryMap = new Map(subCategories.map((item) => [item.id, item]));
  const styleMap = new Map(styles.map((item) => [item.id, item]));

  return (productsResponse.products || []).map((item) =>
    normalizeProduct(item, categoryMap, subCategoryMap, styleMap)
  );
}

export async function fetchNewArrivalsSection(): Promise<CatalogHomeSection | null> {
  const [categories, subCategories, styles, sectionResponse] = await Promise.all([
    fetchCatalogCategories(),
    fetchCatalogSubCategories(),
    fetchCatalogStyles(),
    apiRequest<{ success: boolean; section?: BackendHomeSection }>("/home-sections/new-arrivals"),
  ]);

  const section = sectionResponse.section;
  if (!section || section.isActive === false) return null;

  const categoryMap = new Map(categories.map((item) => [item.id, item]));
  const subCategoryMap = new Map(subCategories.map((item) => [item.id, item]));
  const styleMap = new Map(styles.map((item) => [item.id, item]));

  return {
    key: section.key,
    eyebrow: section.eyebrow || "",
    title: section.title || "New Arrivals",
    products: (section.products || []).map((item) =>
      normalizeProduct(item, categoryMap, subCategoryMap, styleMap)
    ),
    isActive: true,
  };
}

/**
 * Fetch a single product by its MongoDB _id.
 * Also fetches categories/subcategories/styles in parallel to resolve references.
 */
export async function fetchProductById(productId: string): Promise<CatalogProduct | null> {
  try {
    const [categories, subCategories, styles, productResponse] = await Promise.all([
      fetchCatalogCategories(),
      fetchCatalogSubCategories(),
      fetchCatalogStyles(),
      apiRequest<{ success: boolean; product?: BackendProduct }>(`/products/${productId}`),
    ]);

    if (!productResponse.product) return null;

    const categoryMap = new Map(categories.map((item) => [item.id, item]));
    const subCategoryMap = new Map(subCategories.map((item) => [item.id, item]));
    const styleMap = new Map(styles.map((item) => [item.id, item]));

    return normalizeProduct(productResponse.product, categoryMap, subCategoryMap, styleMap);
  } catch {
    return null;
  }
}

/* ─── Charm Items ─── */

export interface CharmItemData {
  id: string;
  name: string;
  price: number;
  image: string;
  emoji: string;
  charmCategory: string;
  parentCategory: string;
  customisable: boolean;
  hasPhotoUpload: boolean;
  sortOrder: number;
}

interface BackendCharmItem {
  _id: string;
  name: string;
  price: number;
  image?: string;
  emoji?: string;
  charmCategory?: string;
  parentCategory?: string;
  customisable?: boolean;
  hasPhotoUpload?: boolean;
  sortOrder?: number;
}

function toCharmItem(item: BackendCharmItem): CharmItemData {
  return {
    id: item._id,
    name: item.name || "Charm",
    price: item.price || 0,
    image: item.image || FALLBACK_IMAGE,
    emoji: item.emoji || "",
    charmCategory: item.charmCategory || "designs",
    parentCategory: item.parentCategory || "custom-charm-jewellery",
    customisable: item.customisable || false,
    hasPhotoUpload: item.hasPhotoUpload || false,
    sortOrder: item.sortOrder || 0,
  };
}

export async function fetchCharmItems(parentCategory?: string): Promise<CharmItemData[]> {
  const query = parentCategory ? `?parentCategory=${encodeURIComponent(parentCategory)}` : "";
  const data = await apiRequest<{ success: boolean; charmItems?: BackendCharmItem[] }>(`/charm-items${query}`);
  return (data.charmItems || []).map(toCharmItem);
}

// ─── Coupons ───────────────────────────────────────────────────────────────
export interface CouponValidationResult {
  success: boolean;
  valid?: boolean;
  message?: string;
  coupon?: any;
}

export interface CouponApplyResult {
  success: boolean;
  discountAmount?: number;
  finalTotal?: number;
  coupon?: any;
}

export async function fetchPublicOffers(): Promise<{ success: boolean; offers?: any[] }> {
  return apiRequest(`/coupons/offers` as any);
}

export async function validateCoupon(code: string, payload: { cartTotal: number; items?: any[]; productIds?: string[] } ) : Promise<CouponValidationResult> {
  return apiRequest(`/coupons/validate`, {
    method: "POST",
    body: JSON.stringify({ code, ...payload }),
  });
}

export async function applyCouponToCart(code: string, payload: { cartTotal: number; items?: any[]; productIds?: string[] } ) : Promise<CouponApplyResult> {
  return apiRequest(`/coupons/apply`, {
    method: "POST",
    body: JSON.stringify({ code, ...payload }),
  });
}

// ─── Orders ────────────────────────────────────────────────────────────────

export interface OrderItemPayload {
  /** MongoDB _id of the product, or its sourceId / frontend id */
  id?: string;
  sourceId?: string;
  name: string;
  price: number;
  quantity: number;
  category?: string;
  color?: string;
  size?: string;
  sku?: string;
  customNote?: string;
  customImages?: string[];
  /** Full selectionGroups array produced by CharmKeyChainProductPage / CharmProductDetailPage */
  selectionGroups?: Array<{
    type?: string;
    category?: string;
    label?: string;
    selectionKey?: string;
    itemRefModel?: string;
    items: Array<{
      id?: string;
      sourceId?: string;
      name?: string;
      quantity?: number;
      price?: number;
      image?: string;
      images?: string[];
      emoji?: string;
      customText?: string;
    }>;
    metadata?: Record<string, unknown>;
  }>;
  /** Legacy flat array — the backend will synthesise a selectionGroup from this */
  selectedCharms?: Array<string | {
    id?: string;
    name?: string;
    price?: number;
    image?: string;
    emoji?: string;
    quantity?: number;
    images?: string[];
    customText?: string;
  }>;
}

export interface OrderPayload {
  items: OrderItemPayload[];
  totalAmount: number;
  advanceAmount?: number;
  balanceAmount?: number;
  paidAmount?: number;
  paymentMode?: "COD" | "ONLINE" | "PARTIAL_COD";
  shippingAddress: {
    name?: string;
    addressLine1?: string;
    addressLine2?: string;
    fullAddress?: string;
    landmark?: string;
    city: string;
    state: string;
    pincode: string;
    phone?: string;
    alternativePhone?: string;
  };
  billingAddress?: {
    name?: string;
    addressLine1?: string;
    addressLine2?: string;
    fullAddress?: string;
    landmark?: string;
    city: string;
    state: string;
    pincode: string;
    phone?: string;
    alternativePhone?: string;
  };
  isGift?: boolean;
  giftMessage?: string;
  couponCode?: string;
  deliveryCharge?: number;
}

export interface OrderResult {
  success: boolean;
  order?: {
    _id: string;
    status: string;
    totalAmount: number;
    paymentMode: string;
    paymentStatus: string;
    createdAt: string;
  };
  message?: string;
}

/**
 * Submit an order to the backend.
 *
 * Passes the full cart payload — including `selectionGroups` for charm /
 * keychain products — through to `POST /orders/create`.
 *
 * @param payload   The complete order payload (items, address, totals, etc.)
 * @param token     JWT access token from the auth context.
 */
export async function createOrder(
  payload: OrderPayload,
  token: string
): Promise<OrderResult> {
  return apiRequest<OrderResult>("/orders/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

// ─── Reviews ─────────────────────────────────────────────────────────────────

export interface ReviewData {
  _id: string;
  user?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  rating: number;
  body: string;
  isVerifiedPurchase: boolean;
  images?: string[];
  createdAt: string;
}

export async function fetchProductReviews(productId: string): Promise<ReviewData[]> {
  try {
    const data = await apiRequest<{ success: boolean; reviews?: ReviewData[] }>(`/reviews/product/${productId}`);
    return data.reviews || [];
  } catch (error) {
    console.error("Failed to fetch reviews:", error);
    return [];
  }
}

export async function submitProductReview(
  payload: { productId: string; rating: number; body: string; images?: File[] },
  token: string
): Promise<{ success: boolean; message?: string; review?: ReviewData }> {
  try {
    const formData = new FormData();
    formData.append("productId", payload.productId);
    formData.append("rating", String(payload.rating));
    formData.append("body", payload.body);
    
    if (payload.images && payload.images.length > 0) {
      payload.images.forEach((file) => {
        formData.append("images", file);
      });
    }

    return await apiRequest<{ success: boolean; message?: string; review?: ReviewData }>("/reviews", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData as any,
    });
  } catch (error: any) {
    return { success: false, message: error?.message || "Failed to submit review" };
  }
}

// ─── Offer Details ────────────────────────────────────────────────────────────

import type { ApiOfferDetail, OfferDetail } from '@/lib/offerTypes';
import { normalizeOfferDetail } from '@/lib/offerTypes';

/**
 * Fetch a single offer / promotion by its MongoDB _id.
 * Hits GET /offers/:id
 */
export async function fetchOfferById(offerId: string): Promise<OfferDetail | null> {
  try {
    const data = await apiRequest<{ success: boolean; offer?: ApiOfferDetail }>(`/offers/${offerId}`);
    if (!data.offer) return null;
    return normalizeOfferDetail(data.offer);
  } catch {
    return null;
  }
}

/**
 * Fetch multiple products by an array of MongoDB _ids.
 * Falls back to fanning out individual fetchProductById calls in parallel.
 * Deduplicates results by sourceId.
 */
export async function fetchProductsByIds(ids: string[]): Promise<CatalogProduct[]> {
  if (!ids.length) return [];
  const [categories, subCategories, styles] = await Promise.all([
    fetchCatalogCategories(),
    fetchCatalogSubCategories(),
    fetchCatalogStyles(),
  ]);
  const catMap = new Map(categories.map((c) => [c.id, c]));
  const subMap = new Map(subCategories.map((s) => [s.id, s]));
  const styleMap = new Map(styles.map((st) => [st.id, st]));

  const results = await Promise.allSettled(
    ids.map((id) =>
      apiRequest<{ success: boolean; product?: BackendProduct }>(`/products/${id}`)
        .then((res) => (res.product ? normalizeProduct(res.product, catMap, subMap, styleMap) : null))
        .catch(() => null)
    )
  );

  const seen = new Set<string>();
  const products: CatalogProduct[] = [];
  for (const r of results) {
    if (r.status === 'fulfilled' && r.value) {
      if (!seen.has(r.value.sourceId)) {
        seen.add(r.value.sourceId);
        products.push(r.value);
      }
    }
  }
  return products;
}

/**
 * Fetch all products belonging to a given category ID.
 * Hits GET /products?category=:id
 */
export async function fetchProductsByCategoryId(categoryId: string): Promise<CatalogProduct[]> {
  try {
    const [categories, subCategories, styles, productsResponse] = await Promise.all([
      fetchCatalogCategories(),
      fetchCatalogSubCategories(),
      fetchCatalogStyles(),
      apiRequest<{ success: boolean; products?: BackendProduct[] }>(`/products?category=${encodeURIComponent(categoryId)}`),
    ]);

    const catMap = new Map(categories.map((c) => [c.id, c]));
    const subMap = new Map(subCategories.map((s) => [s.id, s]));
    const styleMap = new Map(styles.map((st) => [st.id, st]));

    return (productsResponse.products || []).map((p) =>
      normalizeProduct(p, catMap, subMap, styleMap)
    );
  } catch {
    return [];
  }
}
