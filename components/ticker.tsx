import { gradeColorVar, gradeOf, hashScore } from "@/lib/scan-engine";

/**
 * Invented sample domains, deliberately not real companies — the scores are
 * illustrative and it would be dishonest to hang them on somebody's business.
 * Scores come from the same hash the engine uses, so the strip is internally
 * consistent with everything else on the page.
 */
const DOMAINS = [
  "northwind.studio",
  "paleblue.dev",
  "kettleworks.co",
  "hexlaw.io",
  "grovehouse.co.uk",
  "tinroof.app",
  "marlowe.design",
  "quietharbor.io",
  "fernbank.co",
  "slateandpine.com",
  "brightfold.dev",
  "oxbowlabs.io",
  "cadenceclinic.com",
  "wolfram-tea.shop",
];

const ITEMS = DOMAINS.map((domain) => {
  const score = hashScore(domain);
  const grade = gradeOf(score);
  return { domain, score, grade, color: gradeColorVar(grade) };
});

function Strip() {
  return (
    <div className="ticker-copy flex shrink-0">
      {ITEMS.map((item) => (
        <span key={item.domain} className="t-mono flex shrink-0 items-center gap-2 px-5">
          <span className="text-text-faint">{item.domain}</span>
          <span className="font-medium tabular-nums" style={{ color: item.color }}>
            {item.score}
          </span>
          <span className="text-text-faint">·</span>
          <span className="font-medium" style={{ color: item.color }}>
            {item.grade}
          </span>
        </span>
      ))}
    </div>
  );
}

export function Ticker() {
  return (
    <div className="ticker overflow-hidden border-y border-line py-3" aria-hidden="true">
      <div className="ticker-track">
        <Strip />
        <Strip />
      </div>
    </div>
  );
}
