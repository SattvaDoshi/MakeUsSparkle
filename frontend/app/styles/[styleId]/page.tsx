import StyleProductPage from '@/components/product/StyleProductPage';
import { STYLE_THEMES } from '@/lib/styleThemes';

type StyleId = keyof typeof STYLE_THEMES;

function getTheme(styleId: string) {
  if (styleId in STYLE_THEMES) {
    return STYLE_THEMES[styleId as StyleId];
  }
  return null;
}

export function generateStaticParams() {
  return Object.keys(STYLE_THEMES).map(id => ({ styleId: id }));
}

export async function generateMetadata({ params }: { params: Promise<{ styleId: string }> }) {
  const { styleId } = await params;

  const theme = getTheme(styleId);
  if (!theme) return { title: 'Style Not Found' };

  return {
    title: `${theme.name} · ${theme.sub} | Maison Jewellery`,
    description: theme.desc,
  };
}

export default async function StylePage({ params }: { params: Promise<{ styleId: string }> }) {
  const { styleId } = await params;

  const theme = getTheme(styleId);

  if (!theme) {
    return (
      <div style={{ padding: '80px', textAlign: 'center', fontFamily: 'serif' }}>
        <h1>Style not found</h1>
      </div>
    );
  }

  return <StyleProductPage styleId={styleId} />;
}