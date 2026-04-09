import ProductPage from '@/components/product/ProductPage';

export default async function Page({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;

  return <ProductPage type={type} />;
}