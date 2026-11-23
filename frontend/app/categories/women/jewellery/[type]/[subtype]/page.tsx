// app/categories/women/jewellery/[type]/[subtype]/page.tsx
//
// PURPOSE: Redirect old bookmarked/shared URLs like
//   /categories/women/jewellery/necklace/dainty
// to the new combined page:
//   /categories/women/jewellery/necklace
//
// The circle filter for the subtype is driven by client state,
// so we just drop users on the parent page and let them pick.
//
// If you'd rather hard-delete this folder, that's fine too — the
// old subtype URLs will just 404, which is acceptable if you never
// shared them publicly.

import { redirect } from 'next/navigation';

interface Props {
  params: Promise<{ type: string; subtype: string }>;
}

export default async function OldSubtypePage({ params }: Props) {
  const { type } = await params;
  // Redirect immediately to the parent type page
  redirect(`/categories/women/jewellery/${type}`);
}