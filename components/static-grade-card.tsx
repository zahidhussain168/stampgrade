import { IssueChips } from "./issue-chips";
import { type ScanResult, gradeColorVar } from "@/lib/scan-engine";

/**
 * The card face with no motion and no client JavaScript — used for the
 * illustrative example cards, which never animate. Keeping these off the
 * animated card means the share-loop section ships no JS at all.
 */
export function StaticGradeCard({
  result,
  tilt = 0,
  className = "",
}: {
  result: ScanResult;
  tilt?: number;
  className?: string;
}) {
  const color = gradeColorVar(result.grade);

  return (
    <article
      className={`elevated straighten relative w-full max-w-[420px] overflow-hidden p-6 sm:p-7 ${className}`}
      style={{ rotate: `${tilt}deg` }}
      aria-label={`Example card for ${result.domain}: ${result.score} out of 100, grade ${result.grade}`}
    >
      <p className="t-mono m-0 truncate text-text-dim">{result.domain}</p>

      <div className="mt-4 flex flex-col">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col">
            <span
              className="font-display text-[clamp(3.5rem,11vw,4.5rem)] font-extrabold leading-none tracking-[-0.04em] tabular-nums"
              style={{ color }}
            >
              {result.score}
            </span>
            <span className="t-mono mt-1 text-text-faint">OUT OF 100</span>
          </div>

          <div
            className="grid h-[68px] w-[68px] shrink-0 -rotate-6 place-items-center rounded-2xl border-2"
            style={{ borderColor: color, color }}
          >
            <span className="font-display text-[2.25rem] font-extrabold leading-none tracking-[-0.02em]">
              {result.grade}
            </span>
          </div>
        </div>

        <div className="mt-5 h-0.5 w-full overflow-hidden rounded-full bg-line-strong">
          <div
            className="h-full rounded-full"
            style={{ background: color, width: `${result.score}%` }}
          />
        </div>

        <IssueChips result={result} />

        <p className="t-mono m-0 mt-6 text-xs leading-relaxed text-text-faint">
          <span aria-hidden="true">⌁</span> graded by StampGrade — get yours free ·
          stampgrade.com
        </p>
      </div>
    </article>
  );
}
