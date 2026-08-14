const LINKS = [
  { href: "#what-we-check", label: "What we check" },
  { href: "#roadmap", label: "Roadmap" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="shell flex flex-col items-start justify-between gap-6 py-10 sm:flex-row sm:items-center">
        <p className="t-mono m-0 text-text-faint">
          <span aria-hidden="true">⌁</span> STAMPGRADE · BUILT FOR THE SHARE LOOP · © 2026
        </p>
        <ul className="m-0 flex list-none flex-wrap items-center gap-x-2 gap-y-1 p-0">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="pressable inline-flex h-11 items-center rounded-chip px-3 text-sm text-text-dim no-underline hover:text-text"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
