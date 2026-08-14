/**
 * One place that decides whether enhanced motion runs at all.
 *
 * Every animated module asks here first. Keeping the decision in one file is
 * what stops "disabled under reduced motion" from being true in eight places
 * and quietly false in a ninth.
 */

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Coarse pointer, no hover: phones and tablets. */
export function isTouchDevice(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(hover: none), (pointer: coarse)").matches;
}

/**
 * True when scroll-driven enhancement should run. Reduced motion is the only
 * hard veto; touch keeps scroll animations but loses smooth scrolling and the
 * cursor, which are the two things that feel worse on a phone.
 */
export function enhancedMotionEnabled(): boolean {
  return !prefersReducedMotion();
}

export function smoothScrollEnabled(): boolean {
  return !prefersReducedMotion() && !isTouchDevice();
}

export function pointerEffectsEnabled(): boolean {
  return !prefersReducedMotion() && !isTouchDevice();
}
