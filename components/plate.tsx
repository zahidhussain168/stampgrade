/**
 * A photographic plate.
 *
 * Photos are never pictures on this site — they are surfaces the canvas sits
 * on. Every one goes through the same treatment, and it lives here rather
 * than at each call site so a plate cannot ship raw by accident:
 *
 *   - graded into the canvas with a CSS filter (desaturated, blacks pulled
 *     down, contrast trimmed) so it never reads as a stock photograph
 *   - washed with the section's glow colour through a blend mode, so the
 *     shadows carry ember or aurora rather than whatever the camera saw
 *   - masked with a gradient on every edge that meets the page, so no plate
 *     ever shows a rectangular border
 *
 * Grading is CSS, not baked into the files, so all of it stays tunable and
 * the originals keep their provenance.
 *
 * Decorative by definition: aria-hidden, and never the LCP candidate
 * (fetchPriority low, lazy unless a caller insists).
 */
export function Plate({
  src,
  width,
  height,
  alt = "",
  className = "",
  imgClassName = "",
  /** CSS filter applied to the photograph itself. */
  filter = "saturate(0.45) brightness(0.5) contrast(1.05)",
  /** Gradient mask so the plate dissolves instead of ending. */
  mask,
  /** Colour washed over the plate through `washBlend`. */
  wash,
  washOpacity = 0.35,
  washBlend = "soft-light",
  blur = 0,
  opacity = 1,
  eager = false,
  style,
}: {
  src: string;
  width: number;
  height: number;
  alt?: string;
  className?: string;
  imgClassName?: string;
  filter?: string;
  mask?: string;
  wash?: string;
  washOpacity?: number;
  washBlend?: "soft-light" | "multiply" | "overlay" | "color";
  blur?: number;
  opacity?: number;
  eager?: boolean;
  style?: React.CSSProperties;
}) {
  const maskStyle = mask
    ? { maskImage: mask, WebkitMaskImage: mask }
    : undefined;

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute overflow-hidden ${className}`}
      style={{ opacity, ...maskStyle, ...style }}
    >
      <picture>
        <source srcSet={`/photos/opt/${src}.avif`} type="image/avif" />
        <source srcSet={`/photos/opt/${src}.webp`} type="image/webp" />
        <img
          src={`/photos/opt/${src}.webp`}
          alt={alt}
          width={width}
          height={height}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          fetchPriority="low"
          className={`h-full w-full object-cover ${imgClassName}`}
          style={{ filter: blur ? `${filter} blur(${blur}px)` : filter }}
        />
      </picture>

      {wash && (
        <div
          className="absolute inset-0"
          style={{
            background: wash,
            opacity: washOpacity,
            mixBlendMode: washBlend,
          }}
        />
      )}
    </div>
  );
}
