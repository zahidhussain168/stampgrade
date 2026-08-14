import { SplitText } from "./split-text";
import { GlowPlate } from "./atmosphere";
import { Reveal } from "./reveal";

const STEPS = [
  {
    index: "01",
    name: "Paste",
    duration: "~0 SEC",
    line: "A URL in a box. No account, no email, no card, nothing to dismiss first.",
  },
  {
    index: "02",
    name: "Scan",
    duration: "~6 SEC",
    line: "Fifteen checks run against the live page. The same fifteen, in the same order, every time.",
  },
  {
    index: "03",
    name: "Share",
    duration: "FOREVER",
    line: "The card does the talking. Post it, or send it to whoever built the site.",
  },
];

/**
 * Pinned while the three steps advance. The pin is set up in ScrollFX and only
 * above 1024px — on a phone this stacks and scrolls like any other section,
 * because pinning on a short viewport fights the user rather than guiding them.
 */
export function Process() {
  return (
    <section id="process" data-pin="" className="section border-t border-line">
      <GlowPlate tone="cool" placement="mid-right" size={44} opacity={0.08} />

      <div data-pin-inner="" className="shell">
        <Reveal>
          <p className="t-eyebrow">The process</p>
          <h2 data-split="" className="t-section mt-6 max-w-3xl">
            <SplitText text="Paste. Scan. Share." />
          </h2>
        </Reveal>

        <ol className="mt-16 list-none space-y-px p-0">
          {STEPS.map((step, i) => (
            <li
              key={step.index}
              data-step={i}
              className="grid grid-cols-[auto_1fr] items-baseline gap-x-6 gap-y-3 border-t border-line py-8 last:border-b md:grid-cols-[6rem_14rem_1fr_auto] md:items-center"
            >
              <span data-step-index className="t-mono text-text-faint">
                ({step.index})
              </span>

              <h3 className="font-display text-[clamp(1.8rem,4vw,3rem)] font-semibold leading-none tracking-[-0.02em]">
                {step.name}
              </h3>

              <p className="t-body col-span-2 m-0 max-w-lg text-[0.9375rem] md:col-span-1">
                {step.line}
              </p>

              <span className="t-mono col-span-2 text-text-faint md:col-span-1 md:justify-self-end">
                {step.duration}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
