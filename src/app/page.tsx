import { AudienceSection } from "@/components/landing/audience-section";
import { CtaSection } from "@/components/landing/cta-section";
import { HeroSection } from "@/components/landing/hero-section";
import { PainPointsSection } from "@/components/landing/pain-points-section";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { TrustComplianceSection } from "@/components/landing/trust-section";
import { ValuePropSection } from "@/components/landing/value-prop-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col font-sans">
      <SiteHeader />
      <main className="flex-1">
        <HeroSection />
        <PainPointsSection />
        <ValuePropSection />
        <AudienceSection />
        <TestimonialsSection />

        <TrustComplianceSection />
        <CtaSection />

      </main>
      <SiteFooter />
    </div>

  );
}
