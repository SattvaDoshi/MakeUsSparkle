import type { Metadata } from 'next';
import UpperNav from '@/components/ui/UpperNav';
import OfferDetailsPage from '@/components/offers/OfferDetailsPage';
import { fetchOfferById } from '@/lib/catalogApi';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ offerId: string }>;
}): Promise<Metadata> {
  const { offerId } = await params;
  const offer = await fetchOfferById(offerId).catch(() => null);

  if (!offer) {
    return {
      title: 'Offer Details | MakeUsSparkle',
      description: 'Explore exclusive offers and deals on jewellery and gifts at MakeUsSparkle.',
    };
  }

  return {
    title: `${offer.title} | MakeUsSparkle`,
    description: offer.description || 'Explore this exclusive offer and shop eligible products at MakeUsSparkle.',
    openGraph: {
      title: `${offer.title} | MakeUsSparkle`,
      description: offer.description,
      images: offer.image ? [{ url: offer.image }] : undefined,
      type: 'website',
    },
  };
}

export default async function OfferDetailRoute({
  params,
}: {
  params: Promise<{ offerId: string }>;
}) {
  const { offerId } = await params;

  return (
    <>
      <UpperNav />
      <OfferDetailsPage offerId={offerId} />
    </>
  );
}
