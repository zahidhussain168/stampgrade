"use client";

import { useEffect, useRef, useState } from "react";

import { pointerEffectsEnabled } from "@/lib/motion-prefs";

/**
 * Custom cursor and magnetic buttons.
 *
 * The native cursor is never hidden — this draws on top of it with
 * pointer-events: none, so hit targets, text selection and the I-beam over the
 * URL field all behave exactly as they did. Off entirely for coarse pointers
 * and for reduced motion.
 *
 * Opt in per element with data-cursor="view" | "scan" and data-magnetic.
 */
export function PointerFx() {
  const [enabled, setEnabled] = useState(false);
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    setEnabled(pointerEffectsEnabled());
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const pointer = { x: innerWidth / 2, y: innerHeight / 2 };
    const trail = { ...pointer };
    let frame = 0;
    let scale = 1;
    let targetScale = 1;

    const magnets = new Map<HTMLElement, { x: number; y: number }>();

    const onMove = (event: PointerEvent) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;

      const target = event.target as HTMLElement | null;
      const zone = target?.closest?.("[data-cursor]") as HTMLElement | null;
      const kind = zone?.dataset.cursor ?? "";

      targetScale = kind ? 2.5 : 1;
      if (label.current) label.current.textContent = kind ? kind.toUpperCase() : "";

      // Magnetic pull: the button leans toward the cursor, never more than 6px.
      document.querySelectorAll<HTMLElement>("[data-magnetic]").forEach((el) => {
        const box = el.getBoundingClientRect();
        const cx = box.left + box.width / 2;
        const cy = box.top + box.height / 2;
        const dx = event.clientX - cx;
        const dy = event.clientY - cy;
        const near = Math.abs(dx) < box.width * 0.9 && Math.abs(dy) < box.height * 2.2;
        magnets.set(el, near ? { x: (dx / box.width) * 12, y: (dy / box.height) * 8 } : { x: 0, y: 0 });
      });
    };

    const clamp = (n: number) => Math.max(-6, Math.min(6, n));

    const tick = () => {
      trail.x += (pointer.x - trail.x) * 0.18;
      trail.y += (pointer.y - trail.y) * 0.18;
      scale += (targetScale - scale) * 0.18;

      if (dot.current) {
        dot.current.style.transform = `translate3d(${pointer.x - 3}px, ${pointer.y - 3}px, 0)`;
      }
      if (ring.current) {
        ring.current.style.transform = `translate3d(${trail.x - 14}px, ${trail.y - 14}px, 0) scale(${scale})`;
      }

      magnets.forEach((offset, el) => {
        const current = el.style.transform.match(/translate3d\(([-\d.]+)px, ([-\d.]+)px/);
        const cx = current ? Number(current[1]) : 0;
        const cy = current ? Number(current[2]) : 0;
        const nx = cx + (clamp(offset.x) - cx) * 0.16;
        const ny = cy + (clamp(offset.y) - cy) * 0.16;
        el.style.transform = `translate3d(${nx}px, ${ny}px, 0)`;
      });

      frame = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    frame = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
      magnets.forEach((_, el) => {
        el.style.transform = "";
      });
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[150]">
      <div
        ref={dot}
        className="absolute left-0 top-0 h-1.5 w-1.5 rounded-full"
        style={{ background: "var(--ember)" }}
      />
      <div
        ref={ring}
        className="absolute left-0 top-0 grid h-7 w-7 place-items-center rounded-full border"
        style={{ borderColor: "var(--line-bright)", willChange: "transform" }}
      >
        <span
          ref={label}
          className="t-mono-label text-[0.4rem] text-text"
          style={{ transform: "scale(0.5)" }}
        />
      </div>
    </div>
  );
}
