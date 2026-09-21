import HeroVideo from '@/components/home/HeroVideo';
import BannerSection from '@/components/home/BannerSection';
import CategorySection from '@/components/home/CategorySection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
// import TrustBadges from '@/components/home/TrustBadges';
import Footer from '@/components/home/Footer';
import Style from '@/components/home/StyleSection';
import BottomNav from '@/components/ui/BottomNav';
import PromoSection from '@/components/home/PromoSection';
import TopNav from '@/components/ui/UpperNav';
import SingleBanner from '@/components/home/SingleBanner'
import Arrivals from '@/components/home/NewArrivals';
import NewArrivals from '@/components/home/NewArrivals';
import OpenSection from '@/components/home/OpenSection';
export default function HomePage() {
  return (
    <main>
      <TopNav/>
      <HeroVideo />
      <OpenSection />
      <PromoSection/>
      <SingleBanner/>
      <BannerSection />
    <Style/>
    <NewArrivals/>
      {/* <CategorySection /> */}
      {/* <TrustBadges /> */}
      <TestimonialsSection />
      <Footer />
      <BottomNav/>
      
    </main>
  );
}