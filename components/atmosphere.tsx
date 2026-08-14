/**
 * Atmosphere primitives. Everything here is drawn in code — gradients and a
 * hand-written SVG path. No image files, nothing fetched, nothing adapted.
 */

/**
 * A section's light source. Each section picks a different `placement` so no
 * two are lit from the same angle; that asymmetry is what stops a long dark
 * page reading as one flat sheet.
 */
export type GlowPlacement =
  | "top-left"
  | "top-right"
  | "mid-left"
  | "mid-right"
  | "bottom-left"
  | "bottom-right";

const COORDS: Record<GlowPlacement, { top: string; left: string }> = {
  "top-left": { top: "-14%", left: "-10%" },
  "top-right": { top: "-18%", left: "62%" },
  "mid-left": { top: "26%", left: "-18%" },
  "mid-right": { top: "18%", left: "68%" },
  "bottom-left": { top: "58%", left: "-12%" },
  "bottom-right": { top: "54%", left: "64%" },
};

export function GlowPlate({
  tone = "warm",
  placement = "top-right",
  size = 48,
  opacity = 0.1,
  className = "",
}: {
  tone?: "warm" | "cool";
  placement?: GlowPlacement;
  /** Diameter as a percentage of the section width. */
  size?: number;
  opacity?: number;
  className?: string;
}) {
  const { top, left } = COORDS[placement];

  return (
    <div
      aria-hidden="true"
      data-parallax="glow"
      className={`glow-plate ${tone === "warm" ? "glow-warm" : "glow-cool"} ${className}`}
    >
      <span
        style={{
          top,
          left,
          width: `${size}%`,
          aspectRatio: "1",
          opacity,
        }}
      />
    </div>
  );
}

/**
 * A section divider: one hairline that steps down, with a node dot on the
 * bend. Drawn as a single path so it scales to any width.
 */
export function CircuitLine({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1200 24"
      preserveAspectRatio="none"
      className={`block h-6 w-full ${className}`}
      focusable="false"
    >
      <path
        d="M0 6 H430 L454 18 H746 L770 6 H1200"
        fill="none"
        stroke="var(--line-strong)"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
      />
      <circle cx="454" cy="18" r="2.5" fill="var(--ember)" />
      <circle cx="746" cy="18" r="2.5" fill="var(--aurora)" />
    </svg>
  );
}
