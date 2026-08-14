/**
 * "StampGrade" in display 700, with a 2px ember stamp-tick sitting above the
 * S — the mark is a stamp coming down on the word.
 */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`relative inline-block font-display font-bold tracking-[-0.02em] text-text ${className}`}
    >
      <span aria-hidden="true" className="stamp-tick" />
      StampGrade
    </span>
  );
}
