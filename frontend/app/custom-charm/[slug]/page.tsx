// import CharmKeyChainProductPage from '@/components/product/CharmKeyChainProductPage';

// export default function Page({ params }: { params: { slug: string } }) {
//   return <CharmKeyChainProductPage />;
// }

import CharmProductDetailPage from '@/components/product/CharmProductDetailPage';

export default async function Page({ 
  params, 
}: { 
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  
  return (
    <CharmProductDetailPage slug={slug} />
  );
}