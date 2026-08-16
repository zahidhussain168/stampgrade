"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { DISCIPLINES, type Discipline } from "@/lib/disciplines";
import { pointerEffectsEnabled } from "@/lib/motion-prefs";

/**
 * The interactive half of the disciplines section, and the only part of it
 * that ships to the browser. Everything around these rows — heading, copy,
 * and the full fifteen-check panel — is server-rendered.
 */

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

export function DisciplineRows() {
  const [hovered, setHovered] = useState<number | null>(null);
  const [focused, setFocused] = useState<number | null>(null);

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

  const onMove = useCallback(
    (event: React.MouseEvent<HTMLLIElement>, index: number) => {
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
    },
    [hovered],
  );

  return (
    <ul className="mt-14 list-none border-t border-line p-0">
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

              {/* text-dim, not text-faint: this sits over the brightest part
                  of the typewriter plate, and it is a real number rather than
                  metadata. The faint tier could not hold 4.5:1 there once the
                  plate lifts on hover. */}
              <span className="t-mono col-span-2 text-text-dim md:col-span-1 md:justify-self-end">
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

            {/* Keyboard equivalent for the hover preview. Out of the way for
                pointer users, first thing a keyboard reaches on the row, and
                it docks the panel rather than chasing a cursor that isn't
                there. */}
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
  );
}
