import StyleProductPage from '@/components/product/StyleProductPage';
import { STYLE_THEMES } from '@/lib/styleThemes';

export function generateStaticParams() {
  return Object.keys(STYLE_THEMES).map(id => ({ styleId: id }));
}

export async function generateMetadata({ params }) {
  const { styleId } = await params;

  const theme = STYLE_THEMES[styleId];
  if (!theme) return { title: 'Style Not Found' };

  return {
    title: `${theme.name} · ${theme.sub} | Maison Jewellery`,
    description: theme.desc,
  };
}

export default async function StylePage({ params }) {
  const { styleId } = await params;

  const theme = STYLE_THEMES[styleId];

  if (!theme) {
    return (
      <div style={{ padding: '80px', textAlign: 'center', fontFamily: 'serif' }}>
        <h1>Style not found</h1>
      </div>
    );
  }

  return <StyleProductPage styleId={styleId} />;
}