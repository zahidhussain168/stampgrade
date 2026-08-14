import { Pill } from "./pill";
import { Reveal } from "./reveal";

type Feature = { text: string; soon?: boolean };

type Plan = {
  name: string;
  price: string;
  period: string;
  features: Feature[];
  cta: string;
  href: string;
  featured?: boolean;
};

const PLANS: Plan[] = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    features: [
      { text: "Unlimited scans" },
      { text: "Score, grade & share card" },
      { text: "Top 3 issues revealed" },
      { text: "StampGrade watermark on cards" },
    ],
    cta: "Grade my site",
    href: "#scan",
  },
  {
    name: "Pro",
    price: "$12",
    period: "/mo",
    features: [
      { text: "Everything in Free" },
      { text: "Full fix-it report, ranked by impact" },
      { text: "Weekly re-scans + alerts", soon: true },
      { text: "Score history & PDF export", soon: true },
    ],
    cta: "Start with a free scan",
    href: "#scan",
    featured: true,
  },
  {
    name: "Agency",
    price: "$29",
    period: "/mo",
    features: [
      { text: "Everything in Pro" },
      { text: "10 sites" },
      { text: "White-label: your logo, your colors", soon: true },
      { text: "Client-ready reports", soon: true },
      { text: "Watermark removed" },
    ],
    cta: "Grade my site",
    href: "#scan",
  },
];

/**
 * Renders a feature line with its status pill bound to the final word, so the
 * pill can wrap with the sentence but can never end up stranded alone on a
 * line where it reads as belonging to nothing.
 */
function FeatureLabel({ text, soon }: { text: string; soon?: boolean }) {
  if (!soon) return <>{text}</>;

  const words = text.split(" ");
  const lastWord = words.pop() ?? "";

  return (
    <>
      {words.length > 0 && `${words.join(" ")} `}
      <span className="whitespace-nowrap">
        {lastWord} <Pill tone="soon" className="align-middle" />
      </span>
    </>
  );
}

export function Pricing() {
  return (
    <section id="pricing" className="section border-t border-line">
      <div className="shell">
        <Reveal>
          <p className="t-eyebrow">Pricing</p>
          <h2 data-split="" className="t-section mt-4 max-w-2xl">
            The grade is free. The fix is where we earn it.
          </h2>
        </Reveal>

        <Reveal>
          <ul className="mt-10 grid list-none gap-4 p-0 lg:grid-cols-3">
            {PLANS.map((plan) => (
              <li
                key={plan.name}
                className={`relative flex flex-col rounded-card border bg-surface p-6 ${
                  plan.featured ? "border-ember" : "border-line"
                }`}
              >
                {plan.featured && (
                  <span className="t-mono-label absolute -top-2.5 left-6 rounded-full border border-ember bg-canvas px-2.5 py-1 leading-none text-ember">
                    Popular
                  </span>
                )}

                <h3 className="t-card-title text-xl">{plan.name}</h3>

                <p className="mt-3 flex items-baseline gap-1">
                  <span className="font-display text-4xl font-extrabold tracking-[-0.03em]">
                    {plan.price}
                  </span>
                  <span className="t-mono text-text-faint">{plan.period}</span>
                </p>

                <ul className="mt-6 flex-1 list-none space-y-3 p-0">
                  {plan.features.map((feature) => (
                    <li
                      key={feature.text}
                      className="text-[0.9375rem] leading-relaxed text-text-dim"
                    >
                      <FeatureLabel text={feature.text} soon={feature.soon} />
                    </li>
                  ))}
                </ul>

                <a
                  href={plan.href}
                  className={`pressable mt-7 inline-flex h-12 items-center justify-center rounded-chip px-5 text-[0.9375rem] font-semibold no-underline ${
                    plan.featured
                      ? "bg-ember text-canvas"
                      : "border border-line bg-surface-2 text-text hover:border-line-bright"
                  }`}
                >
                  {plan.cta}
                </a>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
