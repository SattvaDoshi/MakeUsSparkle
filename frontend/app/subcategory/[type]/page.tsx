import SubcategoryPage from '@/components/ui/SubCategorySection';

export default async function Page({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;

  return <SubcategoryPage type={type} />;
}