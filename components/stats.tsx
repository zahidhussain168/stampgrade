import { GlowPlate } from "./atmosphere";
import { Plate } from "./plate";

/**
 * Product constants, not traffic numbers.
 *
 * The genre this borrows from fills this band with invented "12,000 happy
 * clients" figures. Every value here is a fact about how the engine works, so
 * it can be checked by running a scan rather than taken on trust.
 */
const STATS = [
  { value: 15, suffix: "", label: "Checks per scan", note: "Every scan, every time" },
  { value: 6, suffix: "s", label: "Median scan", note: "From paste to card" },
  { value: 0, suffix: "", label: "Signups required", note: "There is no account" },
  { value: 100, suffix: "", label: "The number everyone wants", note: "Nobody has hit it yet" },
];

export function Stats() {
  return (
    <section className="stats-band section relative border-t border-line">
      <GlowPlate tone="warm" placement="top-left" size={42} opacity={0.08} />

      {/* City lights on black: the web at night, graded. Cropped off the
          NASA frame's map labels. It settles from 1.08 to 1.0 as the section
          enters, once, then drifts a whisper while the counters run. */}
      <Plate
        src="nile-band"
        width={720}
        height={290}
        parallax="plate"
        className="plate-nile inset-0 h-full w-full"
        opacity={0.5}
        filter="saturate(0.25) brightness(0.52) contrast(1.12)"
        wash="linear-gradient(100deg, var(--aurora), transparent 55%, var(--ember))"
        washOpacity={0.3}
        washBlend="soft-light"
        settle
        mask="radial-gradient(120% 130% at 50% 50%, #000 25%, rgba(0,0,0,0.55) 55%, transparent 88%)"
      />

      {/* Darkened strip so the counters never sit on the bright river. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-1/2 h-[62%] -translate-y-1/2"
        style={{
          background:
            "linear-gradient(to bottom, transparent, rgba(8,9,12,0.82) 22%, rgba(8,9,12,0.86) 78%, transparent)",
        }}
      />

      <div className="shell">
        <ul
          data-reveal=""
          data-reveal-stagger=""
          className="grid list-none gap-px overflow-hidden rounded-card border border-line bg-line p-0 sm:grid-cols-2 lg:grid-cols-4"
        >
          {STATS.map((stat) => (
            <li key={stat.label} className="bg-canvas p-8">
              <p className="m-0 font-display text-[clamp(2.6rem,5vw,4rem)] font-bold leading-none tracking-[-0.03em] text-text">
                {/* Filled by ScrollFX: counts up on enter, or set instantly
                    when the visitor asked for reduced motion. */}
                <span data-counter={stat.value}>{stat.value}</span>
                {stat.suffix}
              </p>
              <p className="t-mono-label mt-5 text-text-dim">{stat.label}</p>
              <p className="t-mono mt-2 text-text-faint">{stat.note}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
