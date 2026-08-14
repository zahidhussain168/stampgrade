import { X } from "lucide-react";

import { type ScanResult, topIssues } from "@/lib/scan-engine";

/**
 * The chip row under the grade rail.
 *
 * A failure has to read as a failure without relying on colour: every failing
 * chip carries a ✗ and the word "Failed" for screen readers, on top of the
 * crimson text and hairline. The trailing neutral chip gives the failures a
 * denominator — three red chips mean nothing without knowing what passed.
 *
 * Shared by the animated card and the static example cards so the two can
 * never drift apart.
 */
export function IssueChips({ result, limit = 3 }: { result: ScanResult; limit?: number }) {
  const failures = topIssues(result, limit);

  return (
    <ul className="mt-5 flex list-none flex-wrap gap-2 p-0">
      {failures.map((issue) => (
        <li
          key={issue.id}
          className="t-mono inline-flex items-center gap-1.5 rounded-chip border border-crimson-line bg-crimson-soft px-2.5 py-1 text-crimson"
        >
          <span className="sr-only">Failed: </span>
          {/* Lucide rather than a ✗ character: the symbol has no glyph in
              JetBrains Mono and fell back inconsistently across platforms. */}
          <X size={13} strokeWidth={2} aria-hidden="true" className="shrink-0" />
          {issue.id}
        </li>
      ))}

      <li className="t-mono inline-flex items-center rounded-chip border border-line bg-surface-2 px-2.5 py-1 text-text-dim">
        <span aria-hidden="true">PASS × {result.passed}</span>
        <span className="sr-only">{result.passed} checks passed</span>
      </li>
    </ul>
  );
}

/**
 * Flags a card whose numbers came from the offline engine rather than a real
 * fetch, so an estimate is never mistaken for a measurement.
 */
export function OfflinePill() {
  return (
    <span className="t-mono-label inline-flex shrink-0 items-center whitespace-nowrap rounded-full border border-amber-line bg-amber-soft px-2 py-0.5 leading-none text-amber">
      Offline estimate
    </span>
  );
}
