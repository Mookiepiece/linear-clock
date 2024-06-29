import { on } from './on';

const trapped: (HTMLElement | SVGElement)[] = [];

/**
 * Focus Trap
 *
 * This only detects the focus event inside the document.
 * that means, the user is able to focus other buttons (e.g. bookmark) inside the browser's chrome.
 *
 * when a new trap is set, current trap will temperary disabled and will recover when that pop.
 */
export const trap = (el: HTMLElement | SVGElement) => {
  trapped.push(el);
  const backTo = document.activeElement;
  focusIn(el);
  const off = _trap(el);

  return () => {
    const isTop = el === trapped[trapped.length - 1];

    trapped.splice(trapped.indexOf(el), 1);
    off();

    if (isTop) (backTo as any)?.focus?.();
  };
};

const _trap = (el: HTMLElement | SVGElement) =>
  on(document).focusin(({ target: thief }) => {
    // Only trap the top most element
    const isTop = el === trapped[trapped.length - 1];
    if (!isTop) return;

    if (thief && thief instanceof Element) {
      const i = el.compareDocumentPosition(thief);
      const direction =
        i === Node.DOCUMENT_POSITION_FOLLOWING
          ? 1
          : i === Node.DOCUMENT_POSITION_PRECEDING
            ? -1
            : 0;

      if (direction) {
        focusIn(el, direction === -1);
      }
    }
  });

const focusIn = (el: HTMLElement | SVGElement, reversed = false) => {
  // focusable elements modified based on: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/dialog/
  // those are "maybe focusable" (e.g. <a> without herf attribute cannot be focusd), we have to try them out.
  const children = [
    ...el.querySelectorAll<HTMLElement | SVGElement>(
      ':is(a,input,button,select,textarea,[tabindex]:not([tabindex="-1"])):not(:disabled)',
    ),
  ];

  if (reversed) {
    children.reverse();
  }

  let ok = false;
  for (const i of children) {
    i.focus();
    if (i === document.activeElement) {
      ok = true;
      break;
    }
  }

  // the worst case is focus the element itself when no focusable elemnts inside it
  // e.g. info dialog overlay
  if (!ok) {
    el.focus();
  }
};
