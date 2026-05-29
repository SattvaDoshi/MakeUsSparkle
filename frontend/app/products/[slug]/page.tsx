// app/products/[slug]/page.tsx
import type { Metadata } from "next";
import ProductDetailPage from "@/components/product/ProductDetailPage";
import { fetchProductById } from "@/lib/catalogApi";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProductById(slug);

  if (!product) {
    return {
      title: "Product | MakeUsSparkle",
    };
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
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;
  return <ProductDetailPage slug={slug} />;
}
