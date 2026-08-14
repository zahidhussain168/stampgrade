"use client";

import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";

import {
  type CheckId,
  type ScanResult,
  gradeColorVar,
  topIssues,
} from "@/lib/scan-engine";

export type ScanPhase = "idle" | "scanning" | "revealed";

/** How long the score numeral takes to climb to its final value. */
const COUNT_MS = 1200;

/** The eight checks the console narrates before it summarises the rest. */
export const CONSOLE_ORDER: CheckId[] = [
  "HTTPS",
  "SSL_EXPIRY",
  "SECURITY_HEADERS",
  "TITLE_TAG",
  "META_DESCRIPTION",
  "HEADINGS",
  "CANONICAL",
  "OG_TAGS",
];

/* ------------------------------------------------------------------ */

function Console({ revealed, result }: { revealed: number; result: ScanResult | null }) {
  return (
    <div className="flex min-h-[260px] flex-col justify-start gap-1.5" aria-hidden="true">
      {CONSOLE_ORDER.slice(0, revealed).map((id) => {
        const check = result?.checks.find((c) => c.id === id);
        return (
          <m.div
            key={id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="t-mono flex items-baseline justify-between gap-3 tabular-nums"
          >
            <span className="truncate text-text-faint">{id}</span>
            {check ? (
              <span
                className="shrink-0 font-medium"
                style={{ color: check.status === "pass" ? "var(--mint)" : "var(--crimson)" }}
              >
                {check.status === "pass" ? "PASS" : "FAIL"}
              </span>
            ) : (
              <span className="shrink-0 text-text-faint">····</span>
            )}
          </m.div>
        );
      })}

      {revealed >= CONSOLE_ORDER.length && (
        <m.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.18 }}
          className="t-mono m-0 pt-1 text-text-faint"
        >
          … 7 more checks
        </m.p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function ScoreNumeral({
  score,
  color,
  animated,
}: {
  score: number;
  color: string;
  animated: boolean;
}) {
  const node = useRef<HTMLSpanElement>(null);
  // Mirrors what is painted, so an interrupted count eases on from the number
  // already on screen instead of snapping back to zero.
  const current = useRef(0);

  useEffect(() => {
    const target = node.current;
    if (!target) return;

    if (!animated) {
      current.current = score;
      target.textContent = String(score);
      return;
    }

    const from = current.current;
    const delta = score - from;
    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const t = Math.min((now - start) / COUNT_MS, 1);
      // easeOutQuint — decisive at the start, settles gently on the number.
      const eased = 1 - Math.pow(1 - t, 5);
      current.current = from + delta * eased;
      target.textContent = String(Math.round(current.current));
      if (t < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [score, animated]);

  return (
    <span
      ref={node}
      className="font-display text-[clamp(4rem,13vw,5.5rem)] font-extrabold leading-none tracking-[-0.04em] tabular-nums"
      style={{ color }}
    >
      0
    </span>
  );
}

/* ------------------------------------------------------------------ */

export function GradeCard({
  result,
  phase,
  consoleRows = 0,
  animated = true,
  tilt = 0,
  className = "",
}: {
  result: ScanResult | null;
  phase: ScanPhase;
  consoleRows?: number;
  animated?: boolean;
  tilt?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const motionOn = animated && !reduced;

  const grade = result?.grade ?? "C";
  const color = gradeColorVar(grade);
  const issues = result ? topIssues(result, 3) : [];
  const showConsole = phase === "scanning";

  return (
    <m.article
      className={`elevated relative w-full max-w-[420px] overflow-hidden p-6 sm:p-7 ${className}`}
      style={{ rotate: `${tilt}deg` }}
      aria-label={
        result
          ? `Grade card for ${result.domain}: ${result.score} out of 100, grade ${result.grade}`
          : "Grade card"
      }
    >
      {/* Domain */}
      <p className="t-mono m-0 truncate text-text-dim">{result?.domain ?? "—"}</p>

      <AnimatePresence mode="wait" initial={false}>
        {showConsole ? (
          <m.div
            key="console"
            initial={{ opacity: 0, rotateX: motionOn ? -6 : 0 }}
            animate={{ opacity: 1, rotateX: 0 }}
            exit={{ opacity: 0, rotateX: motionOn ? 6 : 0 }}
            transition={{ duration: motionOn ? 0.28 : 0.15, ease: "easeOut" }}
            className="mt-5"
          >
            <Console revealed={consoleRows} result={result} />
          </m.div>
        ) : (
          <m.div
            key="face"
            initial={{ opacity: 0, rotateX: motionOn ? 6 : 0 }}
            animate={{ opacity: 1, rotateX: 0 }}
            exit={{ opacity: 0, rotateX: motionOn ? -6 : 0 }}
            transition={{ duration: motionOn ? 0.28 : 0.15, ease: "easeOut" }}
            className="mt-4"
          >
            <div className="flex min-h-[260px] flex-col">
              {/* Score + stamp */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col">
                  {result ? (
                    <ScoreNumeral score={result.score} color={color} animated={motionOn} />
                  ) : (
                    <span
                      className="font-display text-[clamp(4rem,13vw,5.5rem)] font-extrabold leading-none tracking-[-0.04em] text-text-faint"
                      aria-hidden="true"
                    >
                      —
                    </span>
                  )}
                  <span className="t-mono mt-1 text-text-faint">OUT OF 100</span>
                </div>

                {result && (
                  <m.div
                    key={`${result.domain}-${result.grade}`}
                    initial={
                      motionOn
                        ? { scale: 2.2, rotate: 0, opacity: 0 }
                        : { scale: 1, rotate: -6, opacity: 1 }
                    }
                    animate={{ scale: 1, rotate: -6, opacity: 1 }}
                    // The one bouncy spring on the page. The name is
                    // StampGrade; this is the moment that has to land.
                    transition={
                      motionOn
                        ? { type: "spring", bounce: 0.2, duration: 0.55 }
                        : { duration: 0.2 }
                    }
                    className="grid h-[76px] w-[76px] shrink-0 place-items-center rounded-2xl border-2"
                    style={{ borderColor: color, color }}
                  >
                    <span className="font-display text-[2.5rem] font-extrabold leading-none tracking-[-0.02em]">
                      {result.grade}
                    </span>
                  </m.div>
                )}
              </div>

              {/* Grade rail */}
              <div className="mt-5 h-0.5 w-full overflow-hidden rounded-full bg-line">
                <m.div
                  className="h-full w-full origin-left rounded-full"
                  style={{ background: color }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: result ? result.score / 100 : 0 }}
                  transition={
                    motionOn
                      ? { type: "spring", bounce: 0, duration: 0.4, delay: 0.05 }
                      : { duration: 0.2 }
                  }
                />
              </div>

              {/* Issue chips */}
              <ul className="mt-5 flex list-none flex-wrap gap-2 p-0">
                {issues.length > 0 ? (
                  issues.map((issue) => (
                    <li
                      key={issue.id}
                      className="t-mono rounded-chip border border-line bg-surface-2 px-2.5 py-1 text-text-dim"
                    >
                      {issue.id}
                    </li>
                  ))
                ) : result ? (
                  <li className="t-mono rounded-chip border border-line bg-surface-2 px-2.5 py-1 text-text-dim">
                    NO ISSUES FOUND
                  </li>
                ) : null}
              </ul>

              <div className="flex-1" />

              {/* Watermark */}
              {/* Never truncated: this line is the whole distribution loop,
                  and it stays at 12px so the faint tier remains legible. */}
              <p className="t-mono m-0 mt-6 text-xs leading-relaxed text-text-faint">
                <span aria-hidden="true">⌁</span> graded by StampGrade — get yours free ·
                stampgrade.com
              </p>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </m.article>
  );
}
