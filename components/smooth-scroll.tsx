"use client";

import { useEffect } from "react";

import { smoothScrollEnabled } from "@/lib/motion-prefs";

/**
 * Lenis smooth scrolling, wired to GSAP's ticker so scroll-driven animation
 * and the scroll position never disagree by a frame.
 *
 * Off entirely for reduced motion and for touch, where the native scroll
 * physics already feel better than anything we would impose. Anchor links are
 * routed through Lenis so they ease instead of jumping.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (!smoothScrollEnabled()) return;

    let lenis: import("lenis").default | null = null;
    let cancelled = false;
    let onTick: ((time: number) => void) | null = null;
    let onAnchorClick: ((event: MouseEvent) => void) | null = null;
    let gsapRef: typeof import("gsap").gsap | null = null;

    (async () => {
      const [{ default: Lenis }, { gsap }, { ScrollTrigger }] = await Promise.all([
        import("lenis"),
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled) return;

      gsap.registerPlugin(ScrollTrigger);
      gsapRef = gsap;

      lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, touchMultiplier: 1.4 });
      lenis.on("scroll", ScrollTrigger.update);

      // One clock for both, so ScrollTrigger reads the position Lenis just set.
      onTick = (time: number) => lenis?.raf(time * 1000);
      gsap.ticker.add(onTick);
      gsap.ticker.lagSmoothing(0);

      onAnchorClick = (event: MouseEvent) => {
        const anchor = (event.target as HTMLElement | null)?.closest?.(
          'a[href^="#"]',
        ) as HTMLAnchorElement | null;
        if (!anchor) return;

        const id = anchor.getAttribute("href");
        if (!id || id === "#") return;

        const target = document.querySelector(id);
        if (!target) return;

        event.preventDefault();
        lenis?.scrollTo(target as HTMLElement, { offset: -88, duration: 1.1 });
        // Keep the URL honest so the link is still shareable and back works.
        window.history.pushState(null, "", id);
      };

      document.addEventListener("click", onAnchorClick);
    })();

    return () => {
      cancelled = true;
      if (onAnchorClick) document.removeEventListener("click", onAnchorClick);
      if (onTick && gsapRef) gsapRef.ticker.remove(onTick);
      lenis?.destroy();
    };
  }, []);

  return null;
}
