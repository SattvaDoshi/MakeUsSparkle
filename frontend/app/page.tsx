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

export default function HomePage() {
  return (
    <main>
      <TopNav/>
      <HeroVideo />
      <BannerSection />
      <BottomNav/>
      <CategorySection />
      {/* <TrustBadges /> */}
      <PromoSection/>
      <Style/>
      <TestimonialsSection />
      <Footer />
      <BottomNav/>
      
    </main>
  );
}