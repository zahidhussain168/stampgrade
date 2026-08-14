import { Reveal } from "./reveal";

export function FinalCta() {
  return (
    <section className="section border-t border-line">
      <Reveal className="shell flex flex-col items-center text-center">
        <h2 className="t-section max-w-xl">You&rsquo;re about three clicks from knowing.</h2>
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
