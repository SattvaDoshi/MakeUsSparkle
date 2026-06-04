import StyleProductPage from '@/components/product/StyleProductPage';

export async function generateMetadata({ params }: { params: Promise<{ styleId: string }> }) {
  const { styleId } = await params;
  
  const formattedName = styleId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return {
    title: formattedName + ' | Maison Jewellery',
    description: 'Shop our exclusive ' + formattedName + ' collection.',
  };
}

export default async function StylePage({ params }: { params: Promise<{ styleId: string }> }) {
  const { styleId } = await params;

  return <StyleProductPage styleId={styleId} />;
}
