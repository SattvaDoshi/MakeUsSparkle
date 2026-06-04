// app/products/[slug]/page.tsx
import type { Metadata } from "next";
import { fetchProductById } from "@/lib/catalogApi";
import ProductDetailPage from "@/components/product/ProductDetailPage";
import CharmProductDetailPage from "@/components/product/CharmProductDetailPage";
import CharmKeyChainProductPage from "@/components/product/CharmKeyChainProductPage";

// Categories that use the charm-selector detail page (single product + pick add-on charms)
const CHARM_DETAIL_CATEGORIES = new Set([
  "custom charms",
  "custom charm",
  "custom-charms",
  "charm",
  "charms",
]);

// Categories that use the keychain builder page (full catalog multi-item picker)
const KEYCHAIN_CATALOG_CATEGORIES = new Set([
  "keychains",
  "keychain",
  "key chain",
  "key chains",
]);

function detectPageType(categoryName: string, categorySlug: string) {
  const nameLower = (categoryName || "").toLowerCase().trim();
  const slugLower = (categorySlug || "").toLowerCase().trim();
  if (CHARM_DETAIL_CATEGORIES.has(nameLower) || CHARM_DETAIL_CATEGORIES.has(slugLower)) {
    return "charm";
  }
  if (KEYCHAIN_CATALOG_CATEGORIES.has(nameLower) || KEYCHAIN_CATALOG_CATEGORIES.has(slugLower)) {
    return "keychain";
  }
  return "standard";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProductById(slug);

  if (!product) {
    return { title: "Product | MakeUsSparkle" };
  }

  const title = `${product.name} | MakeUsSparkle`;
  const description = product.description || product.about || "Shop jewellery and gifts from MakeUsSparkle.";
  const keywords = product.seoTags.length > 0 ? product.seoTags : product.tags;
  const image = product.mainImage || product.images[0];

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      images: image ? [{ url: image }] : undefined,
      type: "website",
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Fetch server-side so we can dispatch to the right component.
  // Each component also fetches client-side — this lookup is only
  // used for routing and adds negligible overhead.
  const product = await fetchProductById(slug).catch(() => null);
  const pageType = product
    ? detectPageType(product.category, product.categorySlug)
    : "standard";

  if (pageType === "charm") {
    return <CharmProductDetailPage slug={slug} />;
  }

  if (pageType === "keychain") {
    return <CharmKeyChainProductPage parentCategory="keychains" />;
  }

  return <ProductDetailPage slug={slug} />;
}
