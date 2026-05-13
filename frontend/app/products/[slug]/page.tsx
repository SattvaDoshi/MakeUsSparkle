// app/products/[slug]/page.tsx
import ProductDetailPage from "@/components/product/ProductDetailPage";

export default async function Page({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;
  return <ProductDetailPage slug={slug} />;
}