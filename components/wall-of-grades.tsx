import Image, { type StaticImageData } from "next/image";

import beforeAfter from "@/public/gallery/before-after.png";
import brag from "@/public/gallery/brag.png";
import confess from "@/public/gallery/confess.png";
import whiteLabel from "@/public/gallery/white-label.png";

import { CircuitLine, GlowPlate } from "./atmosphere";
import { Reveal } from "./reveal";

interface Entry {
  id: string;
  image: StaticImageData;
  index: string;
  title: string;
  alt: string;
  card: string;
  shows: string;
  checks: string;
}

const ENTRIES: Entry[] = [
  {
    id: "brag",
    image: brag,
    index: "01",
    title: "The brag",
    alt: "A StampGrade card for northwind.studio scoring 96 out of 100, grade A.",
    card: "96 out of 100. Grade A.",
    shows: "One failing check on an otherwise clean site. This is the card people post within the hour.",
    checks: "Fourteen passed. Only the image alt text let it down.",
  },
  {
    id: "confess",
    image: confess,
    index: "02",
    title: "The confession",
    alt: "A StampGrade card for kettleworks.co scoring 38 out of 100, grade F.",
    card: "38 out of 100. Grade F.",
    shows: "A 38 posted in public. It happens more than you think, and it travels further than the As.",
    checks: "No security headers, no Open Graph tags, no sitemap.",
  },
  {
    id: "before-after",
    image: beforeAfter,
    index: "03",
    title: "The fix",
    alt: "Two StampGrade cards side by side for grovehouse.co.uk: 41 out of 100 before, 92 after.",
    card: "41, then 92. Same site.",
    shows: "Nothing was rebuilt. A title, a description and a set of tags were written down properly.",
    checks: "Eight fixes, one afternoon, fifty-one points.",
  },
  {
    id: "white-label",
    image: whiteLabel,
    index: "04",
    title: "The agency build",
    alt: "A white-label StampGrade card carrying an agency logo instead of the StampGrade watermark.",
    card: "88 out of 100, under someone else's mark.",
    shows: "The same engine with our name taken off it. What an agency hands a client on headed paper.",
    checks: "Fifteen checks, one watermark removed.",
  },
];

export function WallOfGrades() {
  return (
    <section id="wall" className="section border-t border-line">
      <GlowPlate tone="warm" placement="mid-right" size={50} opacity={0.09} />
      <GlowPlate tone="cool" placement="top-left" size={40} opacity={0.07} />

      <div className="shell">
        <Reveal>
          <p className="t-eyebrow">The wall</p>
          <h2 data-split="" className="t-section mt-6 max-w-3xl">
            Four cards. Four different afternoons.
          </h2>
          <p className="t-standfirst mt-6 max-w-xl">
            Every image here is a real card the engine produces. Nothing has been retouched
            to look better than it scored.
          </p>
        </Reveal>

        <div className="mt-20 space-y-24 lg:space-y-32">
          {ENTRIES.map((entry) => (
            <article key={entry.id} data-clip="" className="grid gap-8 lg:grid-cols-12 lg:gap-12">
              <div className="lg:col-span-8">
                <div
                  data-clip-media=""
                  className="overflow-hidden rounded-card border border-line bg-surface"
                >
                  {/* Static import gives Next the intrinsic size, so it can
                      serve AVIF/WebP and reserve the box before it loads. */}
                  <Image
                    src={entry.image}
                    alt={entry.alt}
                    sizes="(min-width: 1024px) 66vw, 100vw"
                    placeholder="blur"
                    loading="lazy"
                    className="h-auto w-full"
                  />
                </div>
              </div>

              <div className="lg:col-span-4">
                <div data-clip-meta="" className="flex items-baseline gap-3">
                  <span className="t-mono text-text-faint">({entry.index})</span>
                  <h3 className="font-display text-[clamp(1.4rem,2.4vw,1.9rem)] font-semibold leading-none tracking-[-0.02em]">
                    {entry.title}
                  </h3>
                </div>

                <div className="mt-8 space-y-7">
                  <div data-clip-meta="">
                    <span className="meta-label">The card</span>
                    <p className="t-body m-0 text-[0.9375rem]">{entry.card}</p>
                  </div>
                  <div data-clip-meta="">
                    <span className="meta-label">What it shows</span>
                    <p className="t-body m-0 text-[0.9375rem]">{entry.shows}</p>
                  </div>
                  <div data-clip-meta="">
                    <span className="meta-label">Checks behind it</span>
                    <p className="t-body m-0 text-[0.9375rem]">{entry.checks}</p>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        <CircuitLine className="mt-24 opacity-70" />
      </div>
    </section>
  );
}
