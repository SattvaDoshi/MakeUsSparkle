import ProductDetailPage from '@/components/product/ProductDetailPage';

export default async function ProductPage({ params }) {
  const { slug } = await params;

  return <ProductDetailPage slug={slug} />;
}