export type PillTone = "live" | "soon" | "horizon";

const LABEL: Record<PillTone, string> = {
  live: "LIVE",
  soon: "COMING SOON",
  horizon: "ON THE HORIZON",
};

/**
 * One pill, one style, used identically in the roadmap and in pricing.
 * If a feature is not shipped it says so in both places — that consistency is
 * the point, so this component is the single source for all three states.
 */
const TONE: Record<PillTone, string> = {
  live: "border-mint text-mint",
  soon: "border-ember bg-ember-soft text-ember",
  horizon: "border-line text-text-faint",
};

export function Pill({ tone, className = "" }: { tone: PillTone; className?: string }) {
  return (
    <span
      className={`t-mono-label inline-flex shrink-0 items-center whitespace-nowrap rounded-full border px-2.5 py-1 leading-none ${TONE[tone]} ${className}`}
    >
      {LABEL[tone]}
    </span>
  );
}
