import { Plus } from "lucide-react";

import { GlowPlate } from "./atmosphere";
import { Plate } from "./plate";
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

      {/* Typewriter keys behind the rows. The letters on the keys rhyme with
          the grade letters the engine hands out, so a few are left legible on
          the right; everything else dissolves toward the copy. */}
      <Plate
        src="typewriter-keyed"
        width={1023}
        height={685}
        parallax="plate"
        className="plate-typewriter inset-y-0 right-0 hidden w-[52%] lg:block"
        // Held at 0.38/0.22: at 0.5/0.26 the per-row check counts, which sit
        // in the faint tier directly over the brightest keys, measured 4.19:1.
        opacity={0.34}
        filter="saturate(0.3) brightness(0.22) contrast(1.04) sepia(0.2)"
        wash="radial-gradient(60% 70% at 72% 40%, var(--ember), transparent 70%)"
        washOpacity={0.22}
        washBlend="soft-light"
        // Dissolves across most of its own width toward the copy, and off the
        // bottom before the section ends, so it never presents an edge.
        mask="linear-gradient(to right, transparent 0%, rgba(0,0,0,0.35) 42%, #000 78%), linear-gradient(to bottom, transparent 0%, #000 22%, #000 58%, transparent 88%)"
        style={{ maskComposite: "intersect", WebkitMaskComposite: "source-in" }}
      />

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
