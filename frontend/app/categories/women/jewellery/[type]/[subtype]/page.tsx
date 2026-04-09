import ProductPage from '@/components/product/ProductPage';

export default async function Page({
  params,
}: {
  params: Promise<{ type: string; subtype: string }>;
}) {
  const { type, subtype } = await params;

  return <ProductPage type={type} subtype={subtype} />;
}