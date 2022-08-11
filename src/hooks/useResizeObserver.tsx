/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { useEventCallback } from '@mookiepiece/strawberry-farm/shared';
import { useEffect } from 'react';

export const useResizeObserver = <T extends HTMLElement | SVGElement>(
  el: T | null,
  callback: ResizeObserverCallback
) => {
  const _callback = useEventCallback(callback);
  useEffect(() => {
    if (!el) return;
    const observer = new ResizeObserver(_callback);

    observer.observe(el);
    return () => observer.disconnect();
  }, [el, _callback]);
};
