import React, { useState } from 'react';
import { useUnmount } from 'react-use';
// https://reactjs.org/docs/hooks-faq.html#how-to-read-an-often-changing-value-from-usecallback
// https://zh-hans.reactjs.org/docs/hooks-faq.html#how-to-read-an-often-changing-value-from-usecallback
// useEventCallback issue: https://github.com/facebook/react/issues/14099
// React Hooks(二): useCallback 之痛 - 杨健 https://zhuanlan.zhihu.com/p/98554943

// Copy from
// https://github.com/formium/formik/blob/34a11422bf1619236bc9fdb1b7c4f0d285638702/packages/formik/src/Formik.tsx#L1182-L1205
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' &&
  typeof window.document !== 'undefined' &&
  typeof window.document.createElement !== 'undefined'
    ? React.useLayoutEffect
    : React.useEffect;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useEventCallback<T extends (...args: any[]) => any>(fn: T): T {
  const ref = React.useRef(fn);

  // we copy a ref to the callback scoped to the current state/props on each render
  useIsomorphicLayoutEffect(() => {
    ref.current = fn;
  });

  return React.useCallback((...args: unknown[]) => ref.current.apply(void 0, args), []) as T;
}

export type Direction = {
  offsetSize: 'offsetHeight' | 'offsetWidth';
  scrollValue: 'scrollTop' | 'scrollLeft';
  scrollSize: 'scrollHeight' | 'scrollWidth';
  size: 'height' | 'width';
  axis: 'X' | 'Y';
  mouseEventClientValue: 'clientY' | 'clientX';
  clientRectStart: 'top' | 'left';
};
// https://github.com/element-plus/element-plus/blob/a57727bfa41943bc4bf81a2bc31d6895362b5077/packages/scrollbar/src/util.ts#L1
export const AXIS_MAP = {
  vertical: {
    offsetSize: 'offsetHeight',
    scrollValue: 'scrollTop',
    scrollSize: 'scrollHeight',
    size: 'height',
    axis: 'Y',
    mouseEventClientValue: 'clientY',
    clientRectStart: 'top',
  } as Direction,
  horizontal: {
    offsetSize: 'offsetWidth',
    scrollValue: 'scrollLeft',
    scrollSize: 'scrollWidth',
    size: 'width',
    axis: 'X',
    mouseEventClientValue: 'clientX',
    clientRectStart: 'left',
  } as Direction,
};
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useSlider = ({
  onChange,
  trackMouseEvents = true,
  trackTouchEvents = true,
}: {
  // direction: Direction;
  onChange: (prop: {
    mouse: {
      x: number;
      y: number;
    };
  }) => void;
  trackMouseEvents?: boolean;
  trackTouchEvents?: boolean;
}) => {
  const [active, setActive] = useState(false);

  const handleDrag = useEventCallback(
    (e: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent) => {
      const mouse = position(e);
      onChange?.({ mouse });
    }
  );

  const handleEnd = useEventCallback(() => {
    setActive(false);
    document.removeEventListener('mousemove', handleDrag);
    document.removeEventListener('mouseup', handleEnd);
    document.removeEventListener('touchmove', handleDrag);
    document.removeEventListener('touchend', handleEnd);
    document.removeEventListener('touchcancel', handleEnd);
  });
  const handleStart = useEventCallback((e: React.MouseEvent | React.TouchEvent) => {
    // middle click and right click won't trigger drag
    if (e.ctrlKey || ('button' in e && [1, 2].includes(e.button))) {
      return;
    }

    setActive(true);
    handleDrag(e.nativeEvent);
    if (trackMouseEvents) {
      document.addEventListener('mousemove', handleDrag);
      document.addEventListener('mouseup', handleEnd);
    }
    if (trackTouchEvents) {
      document.addEventListener('touchmove', handleDrag);
      document.addEventListener('touchend', handleEnd);
      document.addEventListener('touchcancel', handleEnd);
    }
  });

  useUnmount(handleEnd); // component could unexpectly unmount during dragging.

  return {
    active,
    handleStart,
    handleDrag,
    handleEnd,
  };
};

const position = (
  e: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent
): {
  x: number;
  y: number;
} => {
  return 'touches' in e
    ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
    : { x: e.clientX, y: e.clientY };
};
