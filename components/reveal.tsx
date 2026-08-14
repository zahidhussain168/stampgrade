/**
 * Marks a block for the scroll-reveal handled in ScrollFX.
 *
 * Deliberately renders no styles of its own. The hidden starting state is
 * written by gsap.set after load, so the server paint, the pre-hydration paint
 * and any no-JS visitor all get the finished page with nothing to undo.
 *
 * `stagger` cascades the element's direct children instead of moving the
 * block as one piece.
 */
export function Reveal({
  children,
  className = "",
  stagger = false,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: boolean;
  as?: "div" | "section" | "ul" | "li";
}) {
  return (
    <Tag data-reveal="" {...(stagger ? { "data-reveal-stagger": "" } : {})} className={className}>
      {children}
    </Tag>
  );
}
