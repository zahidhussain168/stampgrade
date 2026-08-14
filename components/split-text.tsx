import { Fragment } from "react";

/**
 * Renders a headline pre-split into clipped words.
 *
 * The wrapping happens here, on the server, rather than in the browser after
 * hydration. Splitting at runtime restructured the headline and reflowed
 * everything under it — worth 0.12 of CLS on the hero alone. Because the
 * markup is identical before and after JavaScript, GSAP only ever sets a
 * transform, which costs nothing in layout.
 *
 * With no JavaScript the words simply sit where they are, fully visible.
 */
export function SplitText({ text }: { text: string }) {
  const words = text.split(" ");

  return (
    <>
      {words.map((word, i) => (
        // The space is a sibling of the clip box, never a child of it: inside
        // an overflow:hidden inline-block it collapses and the words run
        // together.
        <Fragment key={`${word}-${i}`}>
          <span className="split-clip">
            <span className="split-word" data-word="">
              {word}
            </span>
          </span>
          {i < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </>
  );
}

/** Wraps an inline element (a headline tile) as one animatable word. */
export function SplitSlot({ children }: { children: React.ReactNode }) {
  return (
    <span className="split-clip">
      <span className="split-word" data-word="">
        {children}
      </span>
    </span>
  );
}
