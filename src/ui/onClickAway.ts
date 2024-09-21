import { on } from './on';

/**
 * Using pointerdown, otherwise click other interactive elements will lost their focus but focus on the popper reference.
 */
export const onClickAway = (
  ref: HTMLElement | SVGElement | (HTMLElement | SVGElement)[],
  cb: () => void,
) => {
  const elements = Array.isArray(ref) ? ref : [ref];

  return on(document).pointerdown(e => {
    if (!elements.some(el => el.contains(e.target as Node))) cb();
  });
};
