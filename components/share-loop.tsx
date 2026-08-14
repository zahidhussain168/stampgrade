import { craftResult } from "@/lib/scan-engine";

import { Reveal } from "./reveal";
import { StaticGradeCard } from "./static-grade-card";

// Illustrative cards, not scans of real businesses.
const BRAG = craftResult("northwind.studio", 94);
const CONFESS = craftResult("kettleworks.co", 38);

const STEPS = [
  { n: "01", title: "Paste your URL", line: "No account, no card, no email field waiting for you." },
  { n: "02", title: "Get graded in seconds", line: "Fifteen checks run and the card builds itself." },
  { n: "03", title: "Share the card", line: "Brag on X, or send it to the person who built the site." },
];

export function ShareLoop() {
  return (
    <section className="section border-t border-line">
      <div className="shell grid items-center gap-14 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <p className="t-eyebrow">The loop</p>
          <h2 className="t-section mt-4">Brag or confess. Either way, it spreads.</h2>

          <ul className="mt-8 list-none border-t border-line p-0">
            {STEPS.map((step) => (
              <li
                key={step.n}
                className="flex items-baseline gap-4 border-b border-line py-4"
              >
                <span className="t-mono shrink-0 text-text-faint">{step.n}</span>
                <div>
                  <p className="t-card-title text-[1.0625rem]">{step.title}</p>
                  <p className="t-body mt-1 text-[0.9375rem]">{step.line}</p>
                </div>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={60} className="min-w-0">
          <div className="flex min-w-0 flex-col items-center gap-6 sm:flex-row sm:items-start sm:justify-center">
            <StaticGradeCard result={BRAG} tilt={-1.5} className="max-w-[340px]" />
            <StaticGradeCard result={CONFESS} tilt={1.5} className="max-w-[340px] sm:mt-10" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
