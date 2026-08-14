"use client";

import { useEffect, useRef, useState } from "react";

/** Ceiling for the reveal stagger. Paired with the 450ms transition in CSS. */
const MAX_STAGGER_MS = 150;

/**
 * The only scroll behaviour on the page: one 12px fade-up, once, per section.
 * Deliberately not a library and deliberately not applied to anything smaller
 * than a section — scroll-animating every element is the house style we are
 * defining ourselves against.
 */
export function Reveal({
  children,
  className = "",
  delay = 0,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "li";
}) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  // Hard ceiling on the stagger. Section reveals are meant to be felt, not
  // waited on; anything past this reads as the page being slow.
  const staggerMs = Math.min(Math.max(delay, 0), MAX_STAGGER_MS);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Anything already on screen (or a browser without IO) shows immediately —
    // content must never depend on an observer firing.
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as React.Ref<HTMLDivElement & HTMLLIElement>}
      className={`reveal ${shown ? "is-shown" : ""} ${className}`}
      style={staggerMs ? { transitionDelay: `${staggerMs}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
