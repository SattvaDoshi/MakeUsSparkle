// app/categories/women/jewellery/[type]/page.tsx
//
// This is the ONLY route file you need for necklace / earrings / bracelets.
// URL examples:
//   /categories/women/jewellery/necklace
//   /categories/women/jewellery/earrings
//   /categories/women/jewellery/bracelets
//
// The circle filters and product grid all live inside SubcategoryPage —
// no child routes ([subtype]) are needed anymore.

import SubcategoryPage from '@/components/ui/SubCategorySection'; // ← adjust path if needed

// app/subcategory/[type]/page.tsx
//
// Handles ALL six jewellery type slugs:
//   /subcategory/necklace
//   /subcategory/earrings
//   /subcategory/bracelets
//   /subcategory/rings          ← NEW
//   /subcategory/waist-chains   ← NEW
//   /subcategory/couple-sets    ← NEW
//
// Any unrecognised slug falls back to 'necklace' inside SubcategoryPage.

// import SubcategoryPage from '@/components/SubcategoryPage';   // ← adjust path if needed

interface Props {
  params: Promise<{ type: string }>;
}

// Route params arrive as a Promise in this Next.js version; reading them directly gave `undefined`,
// so every URL here fell back to "Necklace".
export default async function Page({ params }: Props) {
  const { type } = await params;
  return <SubcategoryPage type={type} />;
}

// Pre-render all six known types at build time
export function generateStaticParams() {
  return [
    { type: 'necklace'     },
    { type: 'earrings'     },
    { type: 'bracelets'    },
    { type: 'rings'        },
    { type: 'waist-chains' },
    { type: 'couple-sets'  },
  ];
}