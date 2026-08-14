import { GlowPlate } from "./atmosphere";

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
    <section className="section border-t border-line">
      <GlowPlate tone="warm" placement="top-left" size={42} opacity={0.08} />

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
