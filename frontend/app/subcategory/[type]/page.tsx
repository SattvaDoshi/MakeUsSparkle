// app/subcategory/[type]/page.tsx
import SubcategoryPage from '@/components/ui/SubCategorySection';

interface Props {
  params: Promise<{ type: string }>;
}

export default async function SubcategoryRoute({ params }: Props) {
  const { type } = await params;
  return <SubcategoryPage type={type} />;
}

export function generateStaticParams() {
  return [
    { type: 'necklace' },
    { type: 'necklaces' },
    { type: 'earrings' },
    { type: 'bracelets' },
    { type: 'hand-chain' },
    { type: 'jhumkha' },
    { type: 'rings' },
    { type: 'waist-chains' },
    { type: 'couple-sets' },
    { type: 'men-chains' },
    { type: 'men-bracelets' },
    { type: 'men-rings' },
    { type: 'men-earrings' },
    { type: 'men-pendants' },
        { type: 'keychains' },        // ← add this
    { type: 'charm-jewellery' },
    { type: 'custom-charm-jewellery' },
  ];
}