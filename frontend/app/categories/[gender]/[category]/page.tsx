import ProductPage from '@/components/product/ProductPage';
import CuratedCombosProductPage from '@/components/product/CuratedCombosProductPage';
import CharmKeyChainProductPage from '@/components/product/CharmKeyChainProductPage';

const CHARM_CATEGORIES = new Set(['custom-charm-jewellery', 'keychains']);

export default async function Page({ params }: { params: Promise<{ category: string; gender: string }> }) {
  const { category, gender } = await params;

  if (category === 'curated-combos') {
    return <CuratedCombosProductPage />;
  }

  if (CHARM_CATEGORIES.has(category)) {
    return <CharmKeyChainProductPage parentCategory={category} />;
  }

  return <ProductPage type={category} gender={gender} />;
}