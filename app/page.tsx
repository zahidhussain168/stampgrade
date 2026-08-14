import { ChecksSection } from "@/components/checks-section";
import { Faq } from "@/components/faq";
import { FinalCta } from "@/components/final-cta";
import { Hero } from "@/components/hero";
import { Pricing } from "@/components/pricing";
import { Roadmap } from "@/components/roadmap";
import { ShareLoop } from "@/components/share-loop";
import { Ticker } from "@/components/ticker";
import { weeklyScanCount } from "@/lib/scan-log";

const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "StampGrade",
  url: "https://stampgrade.com",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Any",
  description:
    "A free website scorecard. Fifteen deterministic checks produce one score out of 100, a stamped grade letter and a shareable card.",
  offers: [
    { "@type": "Offer", name: "Free", price: "0", priceCurrency: "USD" },
    { "@type": "Offer", name: "Pro", price: "12", priceCurrency: "USD" },
    { "@type": "Offer", name: "Agency", price: "29", priceCurrency: "USD" },
  ],
};

export default async function Page() {
  const weeklyCount = await weeklyScanCount();

  return (
    <>
      <script
        type="application/ld+json"
        // Static, author-controlled object — no user input reaches this.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }}
      />
      <Hero weeklyCount={weeklyCount} />
      <Ticker />
      <ChecksSection />
      <Roadmap />
      <ShareLoop />
      <Pricing />
      <Faq />
      <FinalCta />
    </>
  );
}
