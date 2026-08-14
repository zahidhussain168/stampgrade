"use client";

import { useEffect, useState } from "react";

import { Wordmark } from "./wordmark";

const LINKS = [
  { href: "#what-we-check", label: "What we check" },
  { href: "#roadmap", label: "Roadmap" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-[100] w-full transition-colors duration-300 ${
        scrolled ? "glass border-b border-line" : "border-b border-transparent"
      }`}
    >
      <nav aria-label="Primary" className="shell flex h-16 items-center justify-between gap-4">
        <a
          href="#top"
          className="flex h-11 items-center rounded-chip pr-2 text-[1.0625rem] no-underline"
          aria-label="StampGrade — home"
        >
          <Wordmark />
        </a>

        <ul className="hidden list-none items-center gap-1 p-0 md:flex">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="inline-flex h-11 items-center rounded-chip px-3 text-sm text-text-dim no-underline transition-colors duration-200 hover:text-text"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <a
          href="#scan"
          className="inline-flex h-11 shrink-0 items-center rounded-full bg-text px-5 text-sm font-semibold text-canvas no-underline transition-opacity duration-200 hover:opacity-90 active:scale-[.97]"
        >
          Grade my site
        </a>
      </nav>
    </header>
  );
}
