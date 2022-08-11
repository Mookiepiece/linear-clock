import React, { useEffect } from 'react';
import { computePosition, flip, shift, Placement } from '@floating-ui/dom';
import { useEventCallback } from './useSlider';

export const useFloatingTransform = <T extends HTMLDivElement | null>(
  position: { x: number; y: number },
  elRef: React.RefObject<T>,
  {
    active = true,
    placement = 'right-start',
    callback = ({ el, x, y }) => {
      el.style.transform = `translate(${x}px,${y}px)`;
    },
  }: {
    active?: boolean;
    placement?: Placement;
    callback?(payload: { el: NonNullable<T>; x: number; y: number }): void;
  } = {}
): void => {
  const _callback = useEventCallback(callback);
  useEffect(() => {
    const el = elRef.current;
    if (el) {
      if (!active) {
        el.style.opacity = `0`;
        return;
      }
      computePosition(
        {
          getBoundingClientRect() {
            return {
              width: 0,
              height: 0,
              x: position.x,
              y: position.y,
              top: position.y,
              left: position.x,
              right: position.x,
              bottom: position.y,
            };
          },
        },
        el,
        {
          middleware: [flip(), shift()],
          placement,
        }
      ).then(({ x, y }) => {
        el.style.opacity = '1';
        _callback({ el: el as any, x, y });
      });
    }
  }, [position.x, position.y, active, elRef, _callback, placement]);
};
