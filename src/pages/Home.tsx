import { PageLayout } from '../components/layout/PageLayout';
import { HeroSection } from '../components/sections/HeroSection';
import { TrustSection } from '../components/sections/TrustSection';
import { GrowthScoreSection } from '../components/sections/GrowthScoreSection';
import { AIRecommendationsSection } from '../components/sections/AIRecommendationsSection';
import { HowItWorksSection } from '../components/sections/HowItWorksSection';
import { FeaturesSection } from '../components/sections/FeaturesSection';
import { ProductPreviewSection } from '../components/sections/ProductPreviewSection';
import { PricingSection } from '../components/sections/PricingSection';
import { FAQSection } from '../components/sections/FAQSection';
import { CTASection } from '../components/sections/CTASection';

export function Home() {
  return (
    <PageLayout>
      <HeroSection />
      <TrustSection />
      <GrowthScoreSection />
      <AIRecommendationsSection />
      <HowItWorksSection />
      <FeaturesSection />
      <ProductPreviewSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
    </PageLayout>
  );
}
