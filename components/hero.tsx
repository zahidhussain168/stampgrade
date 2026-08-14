"use client";

import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Share2, Check } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { CONSOLE_ORDER, GradeCard, type ScanPhase } from "./grade-card";
import {
  type ScanResult,
  demoScan,
  gradeColorVar,
  normaliseUrl,
} from "@/lib/scan-engine";

const DEMO_DOMAIN = "demo-startup.io";
const ROW_INTERVAL_MS = 180;
/** Beat between the last console row and the reveal. */
const SETTLE_MS = 260;

export function Hero({ weeklyCount }: { weeklyCount: number }) {
  const reduced = useReducedMotion();

  const [value, setValue] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [phase, setPhase] = useState<ScanPhase>("idle");
  const [consoleRows, setConsoleRows] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [shared, setShared] = useState(false);

  // Every run gets an id; anything from an older run is ignored rather than
  // cancelled, so a second scan can start before the first has finished.
  const runId = useRef(0);

  const runScan = useCallback(
    async (raw: string, { local = false }: { local?: boolean } = {}) => {
      const normalised = normaliseUrl(raw);
      if (!normalised) {
        setError("That does not look like a URL. Try example.com.");
        return;
      }

      const id = ++runId.current;
      setError(null);
      setShared(false);
      setPhase("scanning");
      setConsoleRows(reduced ? CONSOLE_ORDER.length : 0);

      const ticker: Promise<void> = reduced
        ? Promise.resolve()
        : new Promise((resolve) => {
            let row = 0;
            const timer = setInterval(() => {
              if (runId.current !== id) {
                clearInterval(timer);
                resolve();
                return;
              }
              row += 1;
              setConsoleRows(row);
              if (row >= CONSOLE_ORDER.length) {
                clearInterval(timer);
                setTimeout(resolve, SETTLE_MS);
              }
            }, ROW_INTERVAL_MS);
          });

      const scan: Promise<ScanResult> = local
        ? Promise.resolve(demoScan(normalised.domain))
        : (async () => {
            try {
              const response = await fetch("/api/scan", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ url: normalised.url }),
              });
              if (!response.ok) {
                const body = await response.json().catch(() => null);
                if (runId.current === id && body?.error) setError(body.error);
                throw new Error("scan failed");
              }
              return (await response.json()) as ScanResult;
            } catch {
              // The visitor still gets a real, deterministic card.
              return demoScan(
                normalised.domain,
                "Live scan unavailable. Showing an offline estimate.",
              );
            }
          })();

      // Resolve the console's PASS/FAIL tags the moment the data lands, even
      // if rows are still ticking in.
      void scan.then((value) => {
        if (runId.current === id) setResult(value);
      });

      await Promise.all([ticker, scan]);
      if (runId.current !== id) return;
      setPhase("revealed");
    },
    [reduced],
  );

  // Open on the output: the page grades a site before you ask it to.
  useEffect(() => {
    const timer = setTimeout(() => void runScan(DEMO_DOMAIN, { local: true }), 700);
    return () => clearTimeout(timer);
  }, [runScan]);

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    void runScan(value);
  };

  const onShare = async () => {
    if (!result) return;
    const text = `${result.domain} scored ${result.score}/100 on StampGrade — grade ${result.grade}.`;
    const url = "https://stampgrade.com";
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: "StampGrade", text, url });
        return;
      }
      await navigator.clipboard.writeText(`${text} ${url}`);
      setShared(true);
      setTimeout(() => setShared(false), 2400);
    } catch {
      // Visitor dismissed the share sheet, or the clipboard is unavailable.
    }
  };

  const grade = result?.grade ?? "C";
  const color = gradeColorVar(grade);
  const revealed = phase === "revealed" && result !== null;

  return (
    <section id="top" className="section pt-10 sm:pt-14">
      <div className="shell grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:gap-16">
        {/* ---------------------------------------------- copy */}
        {/* min-w-0: without it a grid item's automatic minimum size is its
            content, and the 420px card would push the whole page sideways. */}
        <div className="order-2 min-w-0 lg:order-1">
          <p className="t-eyebrow">15 deterministic checks · no signup</p>

          <h1 className="t-hero mt-4">Your website has a grade. Dare to see it?</h1>

          <p className="t-body mt-5 max-w-xl text-[1.0625rem]">
            Paste a URL. Six seconds later you get one brutal number out of 100, the exact
            fixes ranked by impact, and a share card you&rsquo;ll either brag about — or
            quietly hide.
          </p>

          {/* ------------------------------------------- input */}
          <form id="scan" onSubmit={onSubmit} className="mt-8 max-w-xl">
            <label htmlFor="url" className="sr-only">
              Website URL
            </label>

            <div className="scan-field flex flex-wrap items-center gap-2 rounded-card border border-line bg-surface p-2">
              <div className="flex min-w-0 flex-1 items-center">
                <span aria-hidden="true" className="t-mono shrink-0 pl-2 text-text-faint">
                  https://
                </span>
                <input
                  id="url"
                  name="url"
                  type="text"
                  inputMode="url"
                  autoComplete="url"
                  spellCheck={false}
                  placeholder="yoursite.com"
                  value={value}
                  onChange={(event) => setValue(event.target.value)}
                  aria-describedby="scan-help"
                  aria-invalid={error ? true : undefined}
                  className="t-mono h-12 min-w-0 flex-1 border-0 bg-transparent px-2 text-[0.9375rem] text-text placeholder:text-text-faint focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="pressable inline-flex h-12 w-full shrink-0 items-center justify-center gap-2 rounded-chip bg-ember px-5 text-[0.9375rem] font-semibold text-canvas sm:w-auto"
              >
                Run the scan
                <ArrowRight size={16} strokeWidth={1.5} aria-hidden="true" />
              </button>
            </div>
          </form>

          {error && (
            <p role="alert" className="t-mono mt-3 text-crimson">
              {error}
            </p>
          )}

          <p id="scan-help" className="t-mono mt-4 text-text-faint">
            Free forever · no email · {weeklyCount.toLocaleString("en-US")} sites graded this
            week
          </p>
        </div>

        {/* ---------------------------------------------- card */}
        <div className="order-1 min-w-0 lg:order-2">
          <div className="relative flex justify-center py-6">
            {/* Grade-coloured wash, crossfading between grades. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -z-10"
              style={{
                background: `radial-gradient(60% 55% at 50% 45%, color-mix(in srgb, ${color} 10%, transparent), transparent 70%)`,
                transition: "background 600ms ease",
              }}
            />

            {/* Huge outlined grade letter, barely there. */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 select-none font-display text-[20rem] font-extrabold leading-none"
              style={{
                WebkitTextStroke: `2px ${color}`,
                color: "transparent",
                opacity: 0.06,
                transition: "-webkit-text-stroke-color 600ms ease",
              }}
            >
              {grade}
            </span>

            <motion.div
              className="w-full max-w-[420px]"
              animate={reduced ? { y: 0 } : { y: [-4, 4, -4] }}
              transition={
                reduced
                  ? { duration: 0.2 }
                  : { duration: 6, repeat: Infinity, ease: "easeInOut" }
              }
            >
              <GradeCard result={result} phase={phase} consoleRows={consoleRows} tilt={-2} />
            </motion.div>
          </div>

          {/* Announces outcomes only — the console itself is decorative. */}
          <p aria-live="polite" className="sr-only">
            {phase === "scanning"
              ? `Scanning ${result?.domain ?? (value || DEMO_DOMAIN)}.`
              : revealed && result
                ? `${result.domain} scored ${result.score} out of 100. Grade ${result.grade}. ${result.passed} checks passed, ${result.failed} failed.`
                : ""}
          </p>

          {result?.note && revealed && (
            <p className="t-mono mt-1 text-center text-text-faint">{result.note}</p>
          )}

          {/* Actions arrive only once there is something to act on. */}
          <motion.div
            initial={false}
            animate={{ opacity: revealed ? 1 : 0, y: revealed ? 0 : 6 }}
            transition={{ duration: reduced ? 0.2 : 0.35, ease: "easeOut" }}
            className="mt-4 flex flex-wrap justify-center gap-2"
            aria-hidden={!revealed}
          >
            <button
              type="button"
              onClick={onShare}
              tabIndex={revealed ? 0 : -1}
              className="pressable inline-flex h-11 items-center gap-2 rounded-chip border border-line bg-surface px-4 text-sm text-text hover:border-line-bright"
            >
              {shared ? (
                <Check size={16} strokeWidth={1.5} aria-hidden="true" />
              ) : (
                <Share2 size={16} strokeWidth={1.5} aria-hidden="true" />
              )}
              {shared ? "Copied" : "Share this card"}
            </button>

            <a
              href="#pricing"
              tabIndex={revealed ? 0 : -1}
              className="pressable inline-flex h-11 items-center gap-2 rounded-chip border border-line bg-surface px-4 text-sm text-text no-underline hover:border-line-bright"
            >
              Get the fix-it report
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
