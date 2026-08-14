import { Plus } from "lucide-react";

import { Reveal } from "./reveal";

const ITEMS = [
  {
    q: "Is the free scan really free?",
    a: "Yes, and it stays free. The grade is our marketing — every card carries a small watermark and that is how people find us. You pay when you want the fix-it report, the monitoring, or the white-label build. Not to see your number.",
  },
  {
    q: "What exactly do you check?",
    a: "The fifteen checks listed above: HTTPS and certificate health, security headers, title and meta description, heading structure, canonical, robots.txt, sitemap, Open Graph and Twitter tags, favicon, viewport, image alt text, and AI-crawler readiness. No AI opinions, no vibes — each one either passes or it does not.",
  },
  {
    q: "Will my score change every time?",
    a: "No. The engine is deterministic: the same page produces the same score every run. Your number moves when your site moves, and never because we felt differently about it today.",
  },
  {
    q: "Can I remove the watermark?",
    a: "On Agency, yes — you replace it with your own logo for client-facing reports. On Free and Pro it stays. The watermark is the reason the free grade can exist at all.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="section border-t border-line">
      <div className="shell max-w-3xl">
        <Reveal>
          <p className="t-eyebrow">FAQ</p>
          <h2 className="t-section mt-4">Reasonable questions.</h2>
        </Reveal>

        <Reveal delay={60}>
          <div className="mt-10 border-t border-line">
            {ITEMS.map((item) => (
              <details key={item.q} className="group border-b border-line">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-[1.0625rem] font-medium text-text transition-colors duration-200 hover:text-text [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <Plus
                    size={18}
                    strokeWidth={1.5}
                    aria-hidden="true"
                    className="shrink-0 text-text-faint transition-transform duration-300 group-open:rotate-45"
                  />
                </summary>
                <p className="t-body pb-5 pr-8 text-[0.9375rem]">{item.a}</p>
              </details>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
