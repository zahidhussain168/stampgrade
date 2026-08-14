"use client";

import { useEffect, useRef, useState } from "react";

import { prefersReducedMotion } from "@/lib/motion-prefs";
import { Wordmark } from "./wordmark";

const SEEN_KEY = "sg:preloaded";
/** If hydration happened this fast the page was already warm. Don't perform. */
const WARM_CACHE_MS = 300;

/**
 * A counter, then the overlay splits into two plates and lifts.
 *
 * Rendered by JavaScript only and never on the server, so a no-JS visitor and
 * the pre-hydration paint both get the finished page with nothing on top of
 * it. That also keeps it out of the LCP path: the real content has already
 * painted by the time this mounts, which is the point — the preloader is a
 * flourish, never a way to hide a slow page.
 *
 * Shows once per session, and not at all for reduced motion or a warm cache.
 */
export function Preloader() {
  const [active, setActive] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const count = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    try {
      if (sessionStorage.getItem(SEEN_KEY)) return;
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      // Private mode with storage disabled: skip rather than replay forever.
      return;
    }
    if (performance.now() < WARM_CACHE_MS) return;
    setActive(true);
  }, []);

  useEffect(() => {
    if (!active) return;
    let killed = false;

    (async () => {
      const { gsap } = await import("gsap");
      if (killed || !root.current) return;

      const ticker = { value: 0 };
      const plates = root.current.querySelectorAll("[data-plate]");
      const centre = root.current.querySelector("[data-centre]");

      const tl = gsap.timeline({
        defaults: { ease: "power2.inOut" },
        onComplete: () => setActive(false),
      });

      tl.to(ticker, {
        value: 100,
        duration: 0.8,
        ease: "power2.out",
        onUpdate: () => {
          if (count.current) {
            count.current.textContent = String(Math.round(ticker.value)).padStart(3, "0");
          }
        },
      })
        .to(centre, { opacity: 0, duration: 0.2 }, ">-0.05")
        // Two plates, opposite directions: the overlay opens rather than fades.
        .to(plates[0], { yPercent: -100, duration: 0.4 }, "<")
        .to(plates[1], { yPercent: 100, duration: 0.4 }, "<");
    })();

    return () => {
      killed = true;
    };
  }, [active]);

  if (!active) return null;

  return (
    <div
      ref={root}
      data-preloader=""
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[200]"
    >
      <div data-plate className="absolute inset-x-0 top-0 h-1/2 bg-canvas" />
      <div data-plate className="absolute inset-x-0 bottom-0 h-1/2 bg-canvas" />

      <div
        data-centre
        className="absolute inset-0 grid place-items-center"
      >
        <div className="flex flex-col items-center gap-4">
          <Wordmark className="text-2xl" />
          <span ref={count} className="t-mono tabular-nums text-text-faint">
            000
          </span>
        </div>
      </div>
    </div>
  );
}
