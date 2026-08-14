/**
 * Word splitter for headline reveals.
 *
 * Wraps each word in a clipping span so the inner span can be lifted from
 * below. Written here rather than pulled from a plugin because it has one
 * requirement a generic splitter does not handle: the hero headline contains
 * inline tile elements, and those must survive intact and animate as their own
 * "word" instead of being flattened into text.
 *
 * Idempotent — a second call on the same element is a no-op.
 */

export interface SplitResult {
  words: HTMLElement[];
  /** Puts the original markup back. */
  restore: () => void;
}

export function splitWords(el: HTMLElement): SplitResult {
  if (el.dataset.splitDone === "1") {
    return {
      words: Array.from(el.querySelectorAll<HTMLElement>("[data-word]")),
      restore: () => {},
    };
  }

  const original = el.innerHTML;
  const words: HTMLElement[] = [];

  const wrap = (content: Node | string): HTMLElement => {
    const clip = document.createElement("span");
    // The clip box hides the word until it is lifted into place. The padding
    // and matching negative margin stop descenders being sheared off.
    clip.style.display = "inline-block";
    clip.style.overflow = "hidden";
    clip.style.verticalAlign = "bottom";
    clip.style.paddingBottom = "0.14em";
    clip.style.marginBottom = "-0.14em";

    const inner = document.createElement("span");
    inner.setAttribute("data-word", "");
    inner.style.display = "inline-block";
    inner.style.willChange = "transform";
    if (typeof content === "string") inner.textContent = content;
    else inner.appendChild(content);

    clip.appendChild(inner);
    words.push(inner);
    return clip;
  };

  const walk = (source: Node): Node[] => {
    const out: Node[] = [];

    source.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const parts = (node.textContent ?? "").split(/(\s+)/);
        for (const part of parts) {
          if (!part) continue;
          if (/^\s+$/.test(part)) out.push(document.createTextNode(" "));
          else out.push(wrap(part));
        }
        return;
      }

      if (node.nodeType !== Node.ELEMENT_NODE) return;
      const element = node as HTMLElement;

      // Structural line wrappers keep their role; recurse inside them.
      if (element.dataset.word === undefined && element.children.length > 0) {
        const clone = element.cloneNode(false) as HTMLElement;
        walk(element).forEach((child) => clone.appendChild(child));
        out.push(clone);
        return;
      }

      // A leaf element (a tile) becomes one word and animates with the rest.
      out.push(wrap(element.cloneNode(true)));
    });

    return out;
  };

  const replacement = walk(el);
  el.replaceChildren(...replacement);
  el.dataset.splitDone = "1";

  return {
    words,
    restore: () => {
      el.innerHTML = original;
      delete el.dataset.splitDone;
    },
  };
}
