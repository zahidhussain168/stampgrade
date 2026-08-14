/**
 * The three tiles that sit inline inside the hero headline. Each is drawn
 * here as SVG at 1x and scaled with the type, so they read as part of the
 * sentence rather than as decoration parked next to it.
 *
 * They float via GSAP (data-tile), and hold still under reduced motion.
 */

const TILE =
  "inline-grid place-items-center align-middle shrink-0 rounded-[18px] border border-line-bright " +
  "shadow-[0_1px_0_var(--line-bright)_inset,0_10px_30px_-8px_rgba(0,0,0,.65)] " +
  "h-[0.72em] w-[0.72em] min-h-[56px] min-w-[56px] max-h-[88px] max-w-[88px]";

/** The stamp: a grade A struck at the same -6° as the real thing. */
export function TileStamp() {
  return (
    <span
      aria-hidden="true"
      data-tile="stamp"
      className={`${TILE} bg-surface-2`}
      style={{ marginInline: "0.12em" }}
    >
      <span
        className="grid h-[62%] w-[62%] -rotate-6 place-items-center rounded-[10px] border-2"
        style={{ borderColor: "var(--mint)", color: "var(--mint)" }}
      >
        <span className="font-display text-[clamp(1rem,2.2vw,1.9rem)] font-bold leading-none">
          A
        </span>
      </span>
    </span>
  );
}

/** The scan beam: an ember sweep across three stacked check rows. */
export function TileBeam() {
  return (
    <span
      aria-hidden="true"
      data-tile="beam"
      className={`${TILE} overflow-hidden bg-surface`}
      style={{ marginInline: "0.12em" }}
    >
      <svg viewBox="0 0 64 64" className="h-full w-full" focusable="false">
        <rect x="12" y="18" width="30" height="3" rx="1.5" fill="var(--line-strong)" />
        <rect x="12" y="30" width="40" height="3" rx="1.5" fill="var(--line-strong)" />
        <rect x="12" y="42" width="22" height="3" rx="1.5" fill="var(--line-strong)" />
        <rect
          x="0"
          y="26"
          width="64"
          height="11"
          fill="url(#beamGrad)"
          data-tile-beam=""
        />
        <defs>
          <linearGradient id="beamGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--ember)" stopOpacity="0" />
            <stop offset="50%" stopColor="var(--ember)" stopOpacity="0.85" />
            <stop offset="100%" stopColor="var(--ember)" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </span>
  );
}

/** The readout: a score in mono, the way the card shows it. */
export function TileScore() {
  return (
    <span
      aria-hidden="true"
      data-tile="score"
      className={`${TILE} bg-surface-2`}
      style={{ marginInline: "0.12em" }}
    >
      <span className="flex flex-col items-center leading-none">
        <span
          className="font-mono text-[clamp(0.75rem,1.5vw,1.2rem)] font-bold"
          style={{ color: "var(--mint)" }}
        >
          98
        </span>
        <span className="mt-[0.15em] font-mono text-[clamp(0.4rem,0.7vw,0.55rem)] text-text-faint">
          /100
        </span>
      </span>
    </span>
  );
}
