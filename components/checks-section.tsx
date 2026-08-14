import { CHECKS } from "@/lib/scan-engine";

import { Reveal } from "./reveal";

export function ChecksSection() {
  return (
    <section id="what-we-check" className="section">
      <div className="shell">
        <Reveal>
          <p className="t-eyebrow">The engine</p>
          <h2 className="t-section mt-4 max-w-2xl">
            No AI guesswork. Fifteen facts about your site.
          </h2>
          <p className="t-body mt-4 max-w-xl">
            Every check is deterministic — your page either passes or fails. Run it twice,
            get the same score twice.
          </p>
        </Reveal>

        {/* 1px hairline grid: the gap is the border. */}
        <Reveal delay={60}>
          <ul className="mt-10 grid list-none gap-px overflow-hidden rounded-card border border-line bg-line p-0 sm:grid-cols-2 lg:grid-cols-3">
            {CHECKS.map((check) => (
              <li
                key={check.id}
                className="bg-canvas p-5 transition-colors duration-200 hover:bg-surface"
              >
                <p className="t-mono m-0 font-medium text-text">{check.id}</p>
                <p className="t-body mt-1.5 text-[0.9375rem]">{check.label}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
