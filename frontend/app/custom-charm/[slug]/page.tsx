import CharmKeyChainProductPage from '@/components/product/CharmKeyChainProductPage';

export default function Page({ params }) {
  return <CharmKeyChainProductPage slug={params.slug} />;
}