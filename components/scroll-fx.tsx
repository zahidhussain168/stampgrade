"use client";

import { useEffect } from "react";

import { enhancedMotionEnabled } from "@/lib/motion-prefs";

/**
 * The one place GSAP is used. Everything else opts in with a data attribute,
 * which keeps the animation budget auditable and stops eight components each
 * importing their own copy of ScrollTrigger.
 *
 *   data-split      headline whose words lift into place
 *   data-reveal     block that fades up (data-reveal-stagger for children)
 *   data-clip       gallery image revealed with a clip-path wipe
 *   data-parallax   glow | card | image — scrubbed transform drift
 *   data-counter    number that counts to its value on enter
 *
 * Every initial state is written here with gsap.set after load, never in CSS,
 * so the pre-hydration and no-JS paints show the finished page.
 *
 * Under reduced motion this module does exactly one thing: fills the counters
 * with their final values. Nothing moves.
 */
export function ScrollFX() {
  useEffect(() => {
    let ctx: { revert: () => void } | null = null;
    let cancelled = false;

    const fillCountersInstantly = () => {
      document.querySelectorAll<HTMLElement>("[data-counter]").forEach((el) => {
        const target = Number(el.dataset.counter ?? "0");
        el.textContent = target.toLocaleString("en-US");
      });
    };

    if (!enhancedMotionEnabled()) {
      fillCountersInstantly();
      return;
    }

    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled) return;

      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        const EASE = "power3.out";

        /* ------------------------------------------- headlines */
        // The words are already wrapped in the server markup, so there is
        // nothing to restructure here — only a transform to set.
        document.querySelectorAll<HTMLElement>("[data-split]").forEach((el) => {
          const words = Array.from(el.querySelectorAll<HTMLElement>("[data-word]"));
          if (!words.length) return;

          gsap.set(words, { yPercent: 110 });
          gsap.to(words, {
            yPercent: 0,
            duration: 0.9,
            ease: EASE,
            stagger: 0.06,
            scrollTrigger: { trigger: el, start: "top 70%", once: true },
          });
        });

        /* --------------------------------------------- reveals */
        document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
          const staggered = el.hasAttribute("data-reveal-stagger");
          const targets = staggered
            ? Array.from(el.children).filter((c): c is HTMLElement => c instanceof HTMLElement)
            : [el];
          if (!targets.length) return;

          gsap.set(targets, { opacity: 0, y: 32 });
          gsap.to(targets, {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: EASE,
            stagger: staggered ? 0.08 : 0,
            scrollTrigger: { trigger: el, start: "top 82%", once: true },
          });
        });

        /* ------------------------------------ gallery clip wipe */
        document.querySelectorAll<HTMLElement>("[data-clip]").forEach((el) => {
          // The wipe is applied to the media frame only — clipping the whole
          // entry would take the meta columns with it.
          const media = el.querySelector<HTMLElement>("[data-clip-media]");
          const inner = media?.firstElementChild as HTMLElement | null;
          const meta = el.querySelectorAll<HTMLElement>("[data-clip-meta]");
          if (!media) return;

          gsap.set(media, { clipPath: "inset(100% 0% 0% 0%)" });
          if (inner) gsap.set(inner, { scale: 1.06 });
          if (meta.length) gsap.set(meta, { opacity: 0, y: 18 });

          const tl = gsap.timeline({
            scrollTrigger: { trigger: el, start: "top 80%", once: true },
          });
          tl.to(media, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.9, ease: EASE });
          if (inner) tl.to(inner, { scale: 1, duration: 1.1, ease: EASE }, 0);
          if (meta.length) {
            tl.to(meta, { opacity: 1, y: 0, duration: 0.55, ease: EASE, stagger: 0.05 }, 0.08);
          }
        });

        /* -------------------------------------------- parallax */
        const DRIFT: Record<string, number> = { glow: 10, image: 6, plate: 8 };

        document.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => {
          const kind = el.dataset.parallax ?? "glow";
          const section = el.closest("section") ?? el.parentElement ?? el;

          if (kind === "card") {
            gsap.fromTo(
              el,
              { y: -14 },
              {
                y: 14,
                ease: "none",
                scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: 0.6 },
              },
            );
            return;
          }

          const percent = DRIFT[kind] ?? 8;
          gsap.fromTo(
            el,
            { yPercent: -percent },
            {
              yPercent: percent,
              ease: "none",
              scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: 0.6 },
            },
          );
        });

        /* ----------------------------------------- pinned steps */
        // Desktop only. Below 1024px the section simply stacks and scrolls —
        // pinning on a short viewport traps the reader rather than guiding
        // them. matchMedia cleans the pin up itself on resize.
        ScrollTrigger.matchMedia({
          "(min-width: 1024px)": () => {
            document.querySelectorAll<HTMLElement>("[data-pin]").forEach((section) => {
              const inner = section.querySelector<HTMLElement>("[data-pin-inner]");
              const steps = section.querySelectorAll<HTMLElement>("[data-step]");
              if (!inner || !steps.length) return;

              const indices = section.querySelectorAll<HTMLElement>("[data-step-index]");
              gsap.set(steps, { opacity: 0.35 });
              gsap.set(steps[0], { opacity: 1 });
              if (indices[0]) gsap.set(indices[0], { color: "var(--ember)" });

              ScrollTrigger.create({
                trigger: section,
                start: "top top",
                // 0.8 of a viewport: still ~240px of scroll per step, which
                // is a clear beat, but it reserves 360px less spacer than the
                // old 120% and stops the section reading as a dead band.
                end: "+=80%",
                pin: inner,
                pinSpacing: true,
                anticipatePin: 1,
                onUpdate: (self) => {
                  const active = Math.min(
                    steps.length - 1,
                    Math.floor(self.progress * steps.length),
                  );
                  steps.forEach((step, i) => {
                    gsap.to(step, { opacity: i === active ? 1 : 0.35, duration: 0.3 });
                    const index = indices[i];
                    if (index) {
                      gsap.to(index, {
                        color: i === active ? "var(--ember)" : "var(--text-faint)",
                        duration: 0.3,
                      });
                    }
                  });
                },
              });
            });
          },
        });

        /* -------------------------------------------- counters */
        document.querySelectorAll<HTMLElement>("[data-counter]").forEach((el) => {
          const target = Number(el.dataset.counter ?? "0");
          const box = { value: 0 };

          // immediateRender:false is load-bearing. Zeroing the element up
          // front means any trigger that never fires leaves a permanent 0 on
          // screen; this way the server-rendered number stands until the
          // count actually starts.
          gsap.fromTo(
            box,
            { value: 0 },
            {
              value: target,
              duration: 1.2,
              ease: "power2.out",
              immediateRender: false,
              scrollTrigger: { trigger: el, start: "top 90%", once: true },
              onUpdate: () => {
                el.textContent = Math.round(box.value).toLocaleString("en-US");
              },
            },
          );
        });

        ScrollTrigger.refresh();
      });
    })();

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);

  return null;
}
