import { Suspense } from 'react';
import CuratedCombosProductPage from '@/components/product/CuratedCombosProductPage';

export default async function CombosPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const params = await searchParams;
  const gender = params?.gender || 'women';
  return (
    <Suspense fallback={null}>
      <CuratedCombosProductPage gender={gender} />
    </Suspense>
  );
}
