import Navbar from "./components/Navbar";
import HeroSection from "./components/landing/HeroSection";
import FeaturedCategories from "./components/landing/FeaturedCategories";
import WhyUs from "./components/landing/WhyUs";
import SocialProof from "./components/landing/SocialProof";
import CTASection from "./components/landing/CTASection";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <FeaturedCategories />
        <WhyUs />
        <SocialProof />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
