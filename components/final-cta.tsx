import { SplitText } from "./split-text";
import { Plate } from "./plate";
import { Reveal } from "./reveal";

export function FinalCta() {
  return (
    <section className="section relative overflow-hidden border-t border-line">
      {/* Crumpled paper across the whole band, masked hollow in the middle so
          the call to action floats on clean canvas rather than on texture. */}
      <Plate
        src="texture-paper-band"
        width={1024}
        height={341}
        parallax="plate"
        className="plate-cta inset-0 h-full w-full"
        opacity={0.12}
        filter="saturate(0.2) brightness(0.9) contrast(1.1)"
        washBlend="overlay"
        imgClassName="mix-blend-overlay"
        mask="radial-gradient(closest-side at 50% 50%, transparent 22%, rgba(0,0,0,0.6) 58%, #000 92%)"
      />

      <Reveal className="shell flex flex-col items-center text-center">
        <h2 data-split="" className="t-section max-w-xl">
          <SplitText text="You’re about three clicks from knowing." />
        </h2>
        <p className="t-body mt-4 max-w-md">
          Six seconds. Fifteen checks. One number you can&rsquo;t unsee.
        </p>
        <a
          href="#scan"
          className="pressable mt-8 inline-flex h-12 items-center justify-center rounded-chip bg-ember px-6 text-[0.9375rem] font-semibold text-canvas no-underline"
        >
          Run my free scan
        </a>
      </Reveal>
    </section>
  );
}
