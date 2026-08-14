import { ChecksSection } from "@/components/checks-section";
import { Faq } from "@/components/faq";
import { FinalCta } from "@/components/final-cta";
import { Hero } from "@/components/hero";
import { Pricing } from "@/components/pricing";
import { Roadmap } from "@/components/roadmap";
import { ShareLoop } from "@/components/share-loop";
import { Ticker } from "@/components/ticker";
import { DEMO_DOMAIN, demoScan } from "@/lib/scan-engine";

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

export default function Page() {
  // Rendered into the card's markup, so the first paint (and any visitor
  // without JavaScript) gets a real graded example rather than a skeleton.
  const demoResult = demoScan(DEMO_DOMAIN);

  return (
    <>
      <script
        type="application/ld+json"
        // Static, author-controlled object — no user input reaches this.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }}
      />
      <Hero initialResult={demoResult} />
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
