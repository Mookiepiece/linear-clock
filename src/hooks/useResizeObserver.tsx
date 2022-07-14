/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import React, { useEffect, useState } from 'react';

export const useResizeObserver = <T extends HTMLElement | SVGElement>(
  elRef: React.RefObject<T>
) => {
  const [state, setState] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
    right: number;
    bottom: number;
  }>({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
    right: 0,
    bottom: 0,
  });

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      const { top, left, width, height, right, bottom } = el.getBoundingClientRect();
      console.log(top, left, width);
      setState({ top, left, width, height, right, bottom });
    });

    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, []);

  return { ...state };
};
