import Link from "next/link";

import { CircuitLine } from "./atmosphere";
import { Wordmark } from "./wordmark";

const NAV = [
  { href: "#what-we-check", label: "What we check" },
  { href: "#wall", label: "Wall of grades" },
  { href: "#process", label: "Process" },
  { href: "#roadmap", label: "Roadmap" },
];

const PLANS = [
  { href: "#pricing", label: "Free" },
  { href: "#pricing", label: "Pro" },
  { href: "#pricing", label: "Agency" },
  { href: "#faq", label: "FAQ" },
];

/** One strip of the marquee. Rendered twice so the loop has no seam. */
function MarqueeStrip() {
  return (
    <span className="marquee-copy flex shrink-0 items-center">
      {["Brag", "Confess", "Grade"].map((word) => (
        <span key={word} className="marquee-word flex shrink-0 items-center">
          {word}
          <span className="mx-[0.18em] opacity-40">·</span>
        </span>
      ))}
    </span>
  );
}

export function Footer() {
  return (
    <footer className="relative border-t border-line pt-24">
      {/* Oversized stroke text. Decorative, so it is hidden from assistive
          tech and holds still under reduced motion. */}
      <div className="marquee overflow-hidden py-4" aria-hidden="true">
        <div className="marquee-track">
          <MarqueeStrip />
          <MarqueeStrip />
        </div>
      </div>

      <div className="shell">
        <CircuitLine className="mb-20 mt-16 opacity-60" />

        <div className="grid gap-14 lg:grid-cols-[1.4fr_1fr_1fr_auto]">
          <div>
            <Wordmark className="text-2xl" />
            <p className="t-standfirst mt-5 max-w-xs text-[1rem]">
              Fifteen deterministic checks, one number, and a card you can post. Free
              forever.
            </p>
          </div>

          <nav aria-label="Sections">
            <span className="meta-label">The site</span>
            <ul className="m-0 list-none space-y-1 p-0">
              {NAV.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="pressable inline-flex h-11 items-center text-[0.9375rem] text-text-dim no-underline hover:text-text"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Plans">
            <span className="meta-label">Plans</span>
            <ul className="m-0 list-none space-y-1 p-0">
              {PLANS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="pressable inline-flex h-11 items-center text-[0.9375rem] text-text-dim no-underline hover:text-text"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <span className="meta-label">Start</span>
            <a
              href="#scan"
              data-magnetic=""
              className="pressable inline-flex h-12 items-center justify-center rounded-chip bg-ember px-6 text-[0.9375rem] font-semibold text-canvas no-underline"
            >
              Grade my site
            </a>
            <a
              href="#top"
              className="pressable t-mono-label mt-6 flex h-11 items-center gap-2 text-text-faint no-underline hover:text-text"
            >
              ↑ Back to top
            </a>
          </div>
        </div>

        <div className="mt-20 flex flex-col gap-3 border-t border-line py-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="t-mono m-0 text-text-faint">
            <span aria-hidden="true">⌁</span> STAMPGRADE · BUILT FOR THE SHARE LOOP · © 2026
          </p>
          <div className="flex items-center gap-5">
            {/* CC BY is a condition of use — this link is not optional. */}
            <Link
              href="/credits"
              className="pressable t-mono inline-flex h-11 items-center text-text-faint no-underline hover:text-text"
            >
              Credits
            </Link>
            <p className="t-mono m-0 text-text-faint">Deterministic. Every time.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
