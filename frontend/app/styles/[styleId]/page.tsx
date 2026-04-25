import StyleProductPage from '@/components/product/StyleProductPage';
import { STYLE_THEMES } from '@/lib/styleThemes';

type StyleId = keyof typeof STYLE_THEMES;

function getTheme(styleId: string) {
  if (styleId in STYLE_THEMES) {
    return STYLE_THEMES[styleId as StyleId];
  }
  return STYLE_THEMES['soft-girl'];
}

export function generateStaticParams() {
  return Object.keys(STYLE_THEMES).map(id => ({ styleId: id }));
}

export async function generateMetadata({ params }: { params: Promise<{ styleId: string }> }) {
  const { styleId } = await params;

  const theme = getTheme(styleId);

  return {
    title: `${theme.name} · ${theme.sub} | Maison Jewellery`,
    description: theme.desc,
  };
}

export default async function StylePage({ params }: { params: Promise<{ styleId: string }> }) {
  const { styleId } = await params;

  return <StyleProductPage styleId={styleId} />;
}