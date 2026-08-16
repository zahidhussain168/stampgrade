import type { Metadata } from "next";
import Link from "next/link";

import { GlowPlate } from "@/components/atmosphere";

export const metadata: Metadata = {
  title: "Credits — StampGrade",
  description: "Photography and type credits for stampgrade.com.",
  alternates: { canonical: "https://stampgrade.com/credits" },
  robots: { index: false, follow: true },
};

/**
 * The attribution surface. CC BY is a condition of use, not a courtesy, so
 * this ships in the same change as the first CC BY photograph and is linked
 * from every page's footer.
 *
 * CC0 and public-domain items require no attribution; they are listed anyway
 * because a credits page that only names some of its sources is not much of
 * a credits page.
 */
const PHOTOS = [
  {
    title: "Incense smoke against a black sky",
    author: "Vanessa Pike-Russell",
    licence: "CC BY 2.0",
    href: "https://creativecommons.org/licenses/by/2.0/",
    source: "flickr via Openverse",
    used: "The confession card, Wall of Grades",
  },
  {
    title: "Keyed",
    author: "Derek Gavey",
    licence: "CC BY 2.0",
    href: "https://creativecommons.org/licenses/by/2.0/",
    source: "flickr via Openverse",
    used: "The Four Disciplines",
  },
  {
    title: "Light Trail",
    author: "giulian.frisoni",
    licence: "CC BY 2.0",
    href: "https://creativecommons.org/licenses/by/2.0/",
    source: "flickr via Openverse",
    used: "Process, step 02",
  },
  {
    title: "Crumpled black paper texture background",
    author: "Teddy",
    licence: "CC0",
    href: "https://creativecommons.org/publicdomain/zero/1.0/",
    source: "rawpixel via Openverse",
    used: "The page surface",
  },
  {
    title: "Crumpled black paper texture",
    author: "Teddy",
    licence: "CC0",
    href: "https://creativecommons.org/publicdomain/zero/1.0/",
    source: "rawpixel via Openverse",
    used: "Final call to action",
  },
  {
    title: "City Lights Illuminate the Nile",
    author: "NASA Earth Observatory",
    licence: "Public domain",
    href: "https://www.nasa.gov/multimedia/guidelines/index.html",
    source: "NASA",
    used: "Stats band",
  },
];

export default function CreditsPage() {
  return (
    <section className="section">
      <GlowPlate tone="cool" placement="top-right" size={42} opacity={0.08} />

      <div className="shell max-w-3xl">
        <p className="t-eyebrow">Credits</p>
        <h1 className="t-section mt-6">Whose work this is built on.</h1>
        <p className="t-standfirst mt-6">
          Every photograph on this site is licensed. All of them are cropped and
          colour-graded to sit on the canvas, which the licences count as indicating
          changes. Type is Clash Display and General Sans from Indian Type Foundry, and
          JetBrains Mono.
        </p>

        <ul className="mt-14 list-none border-t border-line p-0">
          {PHOTOS.map((photo) => (
            <li key={photo.title} className="border-b border-line py-6">
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                <p className="m-0 text-[1.0625rem] text-text">
                  {photo.title}
                  <span className="text-text-dim"> — {photo.author}</span>
                </p>
                <a
                  href={photo.href}
                  rel="license noopener noreferrer"
                  target="_blank"
                  className="t-mono-label pressable inline-flex h-11 items-center text-text-faint no-underline hover:text-text"
                >
                  {photo.licence}
                </a>
              </div>
              <p className="t-mono mt-2 m-0 text-text-faint">
                {photo.source} · cropped and colour-graded · {photo.used}
              </p>
            </li>
          ))}
        </ul>

        <Link
          href="/"
          className="pressable t-mono-label mt-14 inline-flex h-11 items-center gap-2 text-text-dim no-underline hover:text-text"
        >
          ← Back to the grader
        </Link>
      </div>
    </section>
  );
}
