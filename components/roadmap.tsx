import { Pill, type PillTone } from "./pill";
import { Reveal } from "./reveal";

type Row = { code: string; line: string; tone: PillTone };

const ROWS: Row[] = [
  {
    code: "DETERMINISTIC_ENGINE",
    line: "The fifteen checks above, running today",
    tone: "live",
  },

  { code: "CORE_WEB_VITALS", line: "Real LCP, INP, CLS from Google field data", tone: "soon" },
  { code: "PERF_AUDIT", line: "Page weight, compression, caching, render-blockers", tone: "soon" },
  { code: "A11Y_SCAN", line: "Contrast, ARIA validity, keyboard traps", tone: "soon" },
  {
    code: "SCHEDULED_RESCANS",
    line: "Weekly re-checks with email/Slack alerts (Pro)",
    tone: "soon",
  },
  { code: "SCORE_HISTORY", line: "Your score over time, exportable (Pro)", tone: "soon" },
  {
    code: "EMBED_BADGE",
    line: "A live “StampGrade 92 — verified” badge for your footer; every embed links back",
    tone: "soon",
  },

  {
    code: "SITE_CRAWLER",
    line: "Broken links, redirect chains, duplicates site-wide (Agency)",
    tone: "horizon",
  },
  { code: "WHITE_LABEL_PDF", line: "Client-ready reports, your logo (Agency)", tone: "horizon" },
  {
    code: "GEO_REPORT",
    line: "How ChatGPT, Claude and Perplexity see your site",
    tone: "horizon",
  },
  { code: "MOBILE_UX", line: "Tap targets and responsive breakage", tone: "horizon" },
  { code: "API_ACCESS", line: "Grade any URL programmatically (Agency)", tone: "horizon" },
  {
    code: "COMPETITOR_COMPARE",
    line: "Your card next to theirs. Settle it publicly.",
    tone: "horizon",
  },
];

export function Roadmap() {
  return (
    <section id="roadmap" className="section border-t border-line">
      <div className="shell">
        <Reveal>
          <p className="t-eyebrow">Roadmap</p>
          <h2 data-split="" className="t-section mt-4 max-w-2xl">
            The engine is young. It&rsquo;s about to grow teeth.
          </h2>
          <p className="t-body mt-4 max-w-xl">
            Everything below ships in the order you vote for it. Pro and Agency subscribers
            get each one the day it lands.
          </p>
        </Reveal>

        <Reveal>
          <ul className="mt-10 list-none border-t border-line p-0">
            {ROWS.map((row) => (
              <li
                key={row.code}
                className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-line px-1 py-4 transition-colors duration-200 hover:bg-surface sm:flex-nowrap"
              >
                <p className="t-mono m-0 w-full shrink-0 font-medium text-text sm:w-[15rem]">
                  {row.code}
                </p>
                <p className="t-body m-0 flex-1 text-[0.9375rem]">{row.line}</p>
                <Pill tone={row.tone} />
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal>
          <p className="t-mono mt-6 text-text-faint">Voting opens to Pro members at launch.</p>
        </Reveal>
      </div>
    </section>
  );
}
