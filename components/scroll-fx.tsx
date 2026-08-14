"use client";

import { useEffect } from "react";

import { enhancedMotionEnabled } from "@/lib/motion-prefs";
import { splitWords } from "@/lib/split-text";

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
        document.querySelectorAll<HTMLElement>("[data-split]").forEach((el) => {
          const { words } = splitWords(el);
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
          const media = el.querySelector<HTMLElement>("[data-clip-media]") ?? el;
          const meta = el.querySelectorAll<HTMLElement>("[data-clip-meta]");

          gsap.set(el, { clipPath: "inset(100% 0% 0% 0%)" });
          gsap.set(media, { scale: 1.06 });
          if (meta.length) gsap.set(meta, { opacity: 0, y: 18 });

          const tl = gsap.timeline({
            scrollTrigger: { trigger: el, start: "top 80%", once: true },
          });
          tl.to(el, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.9, ease: EASE })
            .to(media, { scale: 1, duration: 1.1, ease: EASE }, 0)
            .to(meta, { opacity: 1, y: 0, duration: 0.55, ease: EASE, stagger: 0.05 }, 0.08);
        });

        /* -------------------------------------------- parallax */
        const DRIFT: Record<string, number> = { glow: 10, image: 6 };

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

        /* -------------------------------------------- counters */
        document.querySelectorAll<HTMLElement>("[data-counter]").forEach((el) => {
          const target = Number(el.dataset.counter ?? "0");
          const box = { value: 0 };
          el.textContent = "0";

          gsap.to(box, {
            value: target,
            duration: 1.2,
            ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
            onUpdate: () => {
              el.textContent = Math.round(box.value).toLocaleString("en-US");
            },
          });
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
