import HeroVideo from '@/components/home/HeroVideo';
import BannerSection from '@/components/home/BannerSection';
import CategorySection from '@/components/home/CategorySection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
// import TrustBadges from '@/components/home/TrustBadges';
import Style from '@/components/home/StyleSection';
import PromoSection from '@/components/home/PromoSection';
import SingleBanner from '@/components/home/SingleBanner'
import Arrivals from '@/components/home/NewArrivals';
import NewArrivals from '@/components/home/NewArrivals';
import OpenSection from '@/components/home/OpenSection';
import WatchAndBuy from '@/components/home/WatchAndBuy';
import FounderMessage from '@/components/home/FounderMessage';
import FaqSection from '@/components/home/FaqSection';
import { getApiUrl } from '@/lib/api';

export const revalidate = 300;

/** Hero content, fetched on the server so the hero image URL is in the first HTML and the
 *  browser can start downloading it immediately (before: it waited for JS + an API call). */
async function getHeroContent() {
  try {
    const res = await fetch(getApiUrl('/home-content'), { next: { revalidate: 300 }, signal: AbortSignal.timeout(4000) });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.homeContent?.heroContent ?? null;
  } catch {
    return null; // client falls back to fetching it itself
  }
}

export default async function HomePage() {
  const initialHero = await getHeroContent();
  return (
    <main className="home-main">
      <HeroVideo initialHero={initialHero} />
      <OpenSection />
      <PromoSection/>
      <SingleBanner/>
      <BannerSection />
    <Style/>
    <NewArrivals/>
    <WatchAndBuy/>
      <FounderMessage />
      {/* <CategorySection /> */}
      {/* <TrustBadges /> */}
      <TestimonialsSection />
      <FaqSection />
      
    </main>
  );
}