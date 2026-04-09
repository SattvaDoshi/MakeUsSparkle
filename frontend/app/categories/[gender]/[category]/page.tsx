import ProductPage from '@/components/product/ProductPage';
import CuratedCombosProductPage from '@/components/product/CuratedCombosProductPage';

export default async function Page({ params }) {
  const { category } = await params;

  if (category === 'curated-combos') {
    return <CuratedCombosProductPage />;
  }

  return <ProductPage type={category} />;
}