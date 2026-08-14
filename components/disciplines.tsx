"use client";

import { SplitText } from "./split-text";
import { useCallback, useEffect, useRef, useState } from "react";

import { GlowPlate } from "./atmosphere";
import { Reveal } from "./reveal";
import { DISCIPLINES, type Discipline } from "@/lib/disciplines";
import { CHECKS } from "@/lib/scan-engine";
import { pointerEffectsEnabled } from "@/lib/motion-prefs";

/** The little card that trails the cursor: this discipline's checks, listed. */
function Preview({ discipline, docked }: { discipline: Discipline; docked?: boolean }) {
  return (
    <div
      className={`elevated w-[266px] p-4 ${docked ? "" : "pointer-events-none"}`}
      aria-hidden={docked ? undefined : true}
    >
      <p className="t-mono m-0 text-text-faint">
        {discipline.checks.length} {discipline.checks.length === 1 ? "check" : "checks"}
      </p>
      <ul className="mt-3 list-none space-y-1.5 p-0">
        {discipline.checks.map((check) => (
          <li key={check.id} className="t-mono flex items-center gap-2 text-text-dim">
            <span
              aria-hidden="true"
              className="h-1 w-1 shrink-0 rounded-full"
              style={{ background: "var(--ember)" }}
            />
            {check.id}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Disciplines() {
  const [hovered, setHovered] = useState<number | null>(null);
  const [focused, setFocused] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);

  const floater = useRef<HTMLDivElement>(null);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const frame = useRef(0);
  const enabled = useRef(false);

  useEffect(() => {
    enabled.current = pointerEffectsEnabled();
  }, []);

  // The preview eases toward the pointer instead of snapping to it. Kept on a
  // ref-driven rAF loop so following the cursor never triggers a React render.
  useEffect(() => {
    if (hovered === null) return;

    const tick = () => {
      current.current.x += (target.current.x - current.current.x) * 0.15;
      current.current.y += (target.current.y - current.current.y) * 0.15;
      if (floater.current) {
        floater.current.style.transform = `translate3d(${current.current.x}px, ${current.current.y}px, 0)`;
      }
      frame.current = requestAnimationFrame(tick);
    };

    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [hovered]);

  const onMove = useCallback((event: React.MouseEvent<HTMLLIElement>, index: number) => {
    if (!enabled.current) return;
    const box = event.currentTarget.getBoundingClientRect();
    // Clamped to the row so the preview never wanders off its own entry.
    const x = Math.min(Math.max(event.clientX - box.left, 12), box.width - 278);
    const y = Math.min(Math.max(event.clientY - box.top - 40, 8), Math.max(box.height - 40, 8));
    target.current = { x, y };
    if (hovered !== index) {
      current.current = { x, y };
      setHovered(index);
    }
  }, [hovered]);

  return (
    <section id="what-we-check" className="section">
      <GlowPlate tone="cool" placement="top-left" size={46} opacity={0.09} />
      <GlowPlate tone="warm" placement="bottom-right" size={38} opacity={0.07} />

      <div className="shell">
        <Reveal>
          <p className="t-eyebrow">The engine</p>
          <h2 data-split="" className="t-section mt-6 max-w-3xl">
            <SplitText text="Four disciplines. Fifteen facts." />
          </h2>
          <p className="t-standfirst mt-6 max-w-xl">
            Every check is deterministic. Your page either passes or it does not. Run it
            twice, get the same score twice.
          </p>
        </Reveal>

        <ul className="mt-16 list-none border-t border-line p-0">
          {DISCIPLINES.map((discipline, index) => {
            const active = hovered === index || focused === index;

            return (
              <li
                key={discipline.id}
                className="relative border-b border-line"
                onMouseMove={(event) => onMove(event, index)}
                onMouseLeave={() => setHovered(null)}
              >
                <div
                  className={`grid grid-cols-[auto_1fr] items-baseline gap-x-5 gap-y-2 py-7 transition-[padding,background-color] duration-300 md:grid-cols-[5rem_minmax(0,18rem)_1fr_auto] md:items-center ${
                    active ? "bg-surface/60 md:pl-4" : ""
                  }`}
                >
                  <span
                    className="t-mono text-[0.875rem] transition-colors duration-300"
                    style={{ color: active ? "var(--ember)" : "var(--text-faint)" }}
                  >
                    ({discipline.index})
                  </span>

                  <h3 className="font-display text-[clamp(1.5rem,3vw,2.25rem)] font-semibold leading-none tracking-[-0.02em] text-text">
                    {discipline.name}
                  </h3>

                  <p className="t-body col-span-2 m-0 text-[0.9375rem] md:col-span-1">
                    {discipline.promise}
                  </p>

                  <span className="t-mono col-span-2 text-text-faint md:col-span-1 md:justify-self-end">
                    {String(discipline.checks.length).padStart(2, "0")} checks
                  </span>
                </div>

                {/* Cursor-following preview. */}
                {hovered === index && (
                  <div
                    ref={floater}
                    className="pointer-events-none absolute left-0 top-0 z-20 hidden md:block"
                  >
                    <Preview discipline={discipline} />
                  </div>
                )}

                {/* Keyboard equivalent for the hover preview. Out of the way
                    for pointer users, first thing a keyboard reaches on the
                    row, and it docks the panel rather than chasing a cursor
                    that isn't there. */}
                <button
                  type="button"
                  className="t-mono sr-only left-0 top-2 z-30 items-center rounded-chip border border-line bg-surface-2 px-3 text-text-dim focus:not-sr-only focus:absolute focus:inline-flex focus:h-11"
                  aria-expanded={focused === index}
                  onClick={() => setFocused(focused === index ? null : index)}
                  onFocus={() => setFocused(index)}
                >
                  {focused === index ? "Hide" : "Show"} the {discipline.checks.length} checks
                </button>

                {focused === index && (
                  <div className="pb-7 md:max-w-sm">
                    <Preview discipline={discipline} docked />
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        {/* Honesty panel: every check, spelled out, always reachable. */}
        <Reveal className="mt-12">
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            aria-expanded={showAll}
            className="t-mono-label inline-flex h-11 items-center gap-2 rounded-chip border border-line bg-surface px-4 text-text-dim hover:border-line-bright"
          >
            {showAll ? "Hide" : "All fifteen, in plain English"}
          </button>

          {showAll && (
            <ul className="mt-8 grid list-none gap-px overflow-hidden rounded-card border border-line bg-line p-0 sm:grid-cols-2 lg:grid-cols-3">
              {CHECKS.map((check) => (
                <li key={check.id} className="bg-canvas p-5">
                  <p className="t-mono m-0 font-medium text-text">{check.id}</p>
                  <p className="t-body mt-1.5 text-[0.9375rem]">{check.label}</p>
                </li>
              ))}
            </ul>
          )}
        </Reveal>
      </div>
    </section>
  );
}
