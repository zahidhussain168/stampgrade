import { Plus } from "lucide-react";

import { GlowPlate } from "./atmosphere";
import { DisciplineRows } from "./discipline-rows";
import { Reveal } from "./reveal";
import { SplitText } from "./split-text";
import { CHECKS } from "@/lib/scan-engine";

/**
 * Server component. The section was one large client island, which put its
 * whole subtree — heading, copy and the fifteen-check list — into the
 * hydration bundle for the sake of a hover effect. Now only two small islands
 * ship: the rows that respond to a pointer, and the panel's open/closed flag.
 */
export function Disciplines() {
  return (
    <section id="what-we-check" className="section">
      <GlowPlate tone="cool" placement="top-left" size={46} opacity={0.09} />
      <GlowPlate tone="warm" placement="bottom-right" size={38} opacity={0.07} />

      <div className="shell">
        <Reveal>
          <p className="t-eyebrow">The engine</p>
          <h2 data-split="" className="t-section mt-6 max-w-3xl">
            <SplitText text="Four disciplines. Fifteen facts." />
          </h2>
          <p className="t-standfirst mt-6 max-w-xl">
            Every check is deterministic. Your page either passes or it does not. Run it
            twice, get the same score twice.
          </p>
        </Reveal>

        <DisciplineRows />

        {/* Native details: no island, no hydration, and the full list is in
            the server HTML for crawlers and for anyone without JavaScript. */}
        <details className="group mt-12">
          <summary className="t-mono-label inline-flex h-11 cursor-pointer list-none items-center gap-2 rounded-chip border border-line bg-surface px-4 text-text-dim hover:border-line-bright [&::-webkit-details-marker]:hidden">
            All fifteen, in plain English
            <Plus
              size={14}
              strokeWidth={1.5}
              aria-hidden="true"
              className="transition-transform duration-300 group-open:rotate-45"
            />
          </summary>

          <ul className="mt-8 grid list-none gap-px overflow-hidden rounded-card border border-line bg-line p-0 sm:grid-cols-2 lg:grid-cols-3">
            {CHECKS.map((check) => (
              <li key={check.id} className="bg-canvas p-5">
                <p className="t-mono m-0 font-medium text-text">{check.id}</p>
                <p className="t-body mt-1.5 text-[0.9375rem]">{check.label}</p>
              </li>
            ))}
          </ul>
        </details>
      </div>
    </section>
  );
}
