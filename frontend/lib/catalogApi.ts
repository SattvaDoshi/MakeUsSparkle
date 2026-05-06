import { apiRequest } from "@/lib/api";

export interface CatalogCategory {
  id: string;
  name: string;
  description?: string;
  image?: string;
  slug: string;
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
}

export interface CatalogColor {
  label: string;
  hex: string;
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
  originalPrice: number | null;
  rating: number;
  reviewCount: number;
  images: string[];
  mainImage?: string | null;
  category: string;
  categorySlug: string;
  subCategory: string;
  subCategorySlug: string;
  style: string;
  styleSlug: string;
  type: string;
  subtype?: string;
  gender: "male" | "female" | "unisex";
  stock: number;
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
    image?: string;
    imagePublicId?: string;
  }>;
  faqs?: Array<{ question: string; answer: string }>;
  tags: string[];
}

type BackendMaybeRef = string | { _id?: string; id?: string; name?: string } | null | undefined;

interface BackendCategory {
  _id: string;
  name?: string;
  description?: string;
  image?: string;
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
  rating?: number;
  images?: string[];
  mainImage?: string;
  colors?: Array<{ name?: string; hex?: string }>;
  sizes?: string[];
  variants?: Array<{
    color?: string;
    size?: string;
    stock?: number;
    image?: string;
    imagePublicId?: string;
  }>;
  category?: BackendMaybeRef;
  subCategory?: BackendMaybeRef;
  style?: BackendMaybeRef;
  gender?: "male" | "female" | "unisex";
  stock?: number;
  tags?: string[];
  faqs?: Array<{ question: string; answer: string }>;
  reviews?: BackendReview[];
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
  return {
    id: item._id,
    name,
    description: item.description,
    image: item.image,
    slug: toSlug(name),
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
          image: variant.image,
          imagePublicId: variant.imagePublicId,
        }))
        .filter((variant) => variant.color || variant.size || variant.image)
    : [];

  const colorsFromBackend = rawColors
    .map((color) => ({
      label: color.name || "Color",
      hex: color.hex || "#c9a84c",
    }))
    .filter((color, index, array) => array.findIndex((entry) => entry.label.toLowerCase() === color.label.toLowerCase()) === index);

  const colorsFromVariants = uniqueStrings(variants.map((variant) => variant.color)).map((label, index) => ({
    label,
    hex: colorsFromBackend[index]?.hex || "#c9a84c",
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
  const price = Number(item.price ?? 0);
  const discountedPrice = item.discountedPrice ? Number(item.discountedPrice) : null;
  const originalPrice = discountedPrice ? price : (price > 0 ? Math.round(price * 1.25) : null);
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
    originalPrice,
    rating,
    reviewCount,
    category: categoryName,
    categorySlug,
    subCategory: subCategoryName,
    subCategorySlug,
    style: styleName,
    styleSlug: style?.slug || "",
    type: subCategorySlug || categorySlug,
    subtype: subCategorySlug || undefined,
    gender: item.gender || "unisex",
    stock: Number(item.stock ?? 0),
    badge: pickBadge(rating),
    offer: discountedPrice ? "Limited Time Deal" : null,
    sku: `SKU-${item._id.slice(-6).toUpperCase()}`,
    href: `/products/${slug}`,
    colors: colors.length > 0 ? colors : [],
    sizes,
    variants,
    images: imagePool.length > 0 ? imagePool : [FALLBACK_IMAGE],
    mainImage: item.mainImage || null,
    faqs: Array.isArray(item.faqs) ? item.faqs : [],
    tags: Array.isArray(item.tags) ? item.tags : [],
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

export async function fetchCatalogProducts(): Promise<CatalogProduct[]> {
  const [categories, subCategories, styles, productsResponse] = await Promise.all([
    fetchCatalogCategories(),
    fetchCatalogSubCategories(),
    fetchCatalogStyles(),
    apiRequest<{ success: boolean; products?: BackendProduct[] }>("/products"),
  ]);

  const categoryMap = new Map(categories.map((item) => [item.id, item]));
  const subCategoryMap = new Map(subCategories.map((item) => [item.id, item]));
  const styleMap = new Map(styles.map((item) => [item.id, item]));

  return (productsResponse.products || []).map((item) =>
    normalizeProduct(item, categoryMap, subCategoryMap, styleMap)
  );
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
