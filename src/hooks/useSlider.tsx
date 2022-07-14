import { computePosition, flip } from '@floating-ui/dom';
import React, { useCallback, useEffect, useRef, useState } from 'react';
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
const AXIS_MAP = {
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

export const useFloat = <T extends HTMLElement = HTMLElement>(
  mouse: {
    x: number;
    y: number;
  },
  ref: React.RefObject<T>
): {
  x: number;
  y: number;
} => {
  const [position, setPosition] = useState<{
    x: number;
    y: number;
  }>({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    if (ref.current) {
      computePosition(
        {
          getBoundingClientRect() {
            return {
              width: 0,
              height: 0,
              x: mouse.x,
              y: mouse.y,
              top: mouse.y,
              left: mouse.x,
              right: mouse.x,
              bottom: mouse.y,
            };
          },
        },
        ref.current,
        {
          middleware: [flip()],
          placement: 'right-start',
        }
      ).then(setPosition);
    }
  }, [mouse.x, mouse.y, ref, setPosition]);

  return position;
};

/**
 * WARNING: Element cannot be conditional
 */
export function usePointer<T extends HTMLElement = HTMLElement>(
  ref: React.RefObject<T>
): {
  active: boolean;
  mouse: {
    x: number;
    y: number;
  };
} {
  // const [value, setValue] = useState(false);
  const [value, setValue] = useState<{
    active: boolean;
    mouse: {
      x: number;
      y: number;
    };
  }>({
    active: false,
    mouse: {
      x: 0,
      y: 0,
    },
  });

  const getPosition = useSafeGetPosition();

  const handlePointerMove = useCallback(
    (e: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent) => {
      const el = ref.current;
      if (el) {
        setValue({ active: true, mouse: getPosition(e) });
      }
    },
    [getPosition, ref]
  );

  const handlePointerOut = useCallback(
    (e?: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent) => {
      const el = ref.current;
      if (el) {
        setValue({
          active: false,
          mouse: getPosition(e),
        });
        el.removeEventListener('mousemove', handlePointerMove);
        el.removeEventListener('mouseout', handlePointerOut);
        document.body.removeEventListener('touchmove', handlePointerMove);
        document.body.removeEventListener('touchcancel', handlePointerOut);
        document.body.removeEventListener('touchend', handlePointerOut);
      }
    },
    [getPosition, handlePointerMove, ref]
  );

  const handleMouseOver = useCallback(
    (e: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent) => {
      const el = ref.current;
      if (el) {
        setValue({ active: true, mouse: getPosition(e) });

        el.addEventListener('mousemove', handlePointerMove);
        el.addEventListener('mouseout', handlePointerOut);
        document.body.addEventListener('touchmove', handlePointerMove);
        document.body.addEventListener('touchend', handlePointerOut);
        document.body.addEventListener('touchcancel', handlePointerOut);
      }
    },
    [getPosition, handlePointerMove, handlePointerOut, ref]
  );

  useEffect(() => {
    const el = ref.current;
    if (el) {
      el.addEventListener('mouseover', handleMouseOver);
      el.addEventListener('touchstart', handleMouseOver);
      return () => {
        el.removeEventListener('mouseover', handleMouseOver);
        el.removeEventListener('touchstart', handleMouseOver);
      };
    }
  }, [getPosition, handleMouseOver, handlePointerOut, ref]);

  useUnmount(() => {
    if (value.active) {
      handlePointerOut();
    }
  });

  return value;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useSlider = ({
  onChange,
  onEnd,
  onStart,
  trackMouseEvents = true,
  trackTouchEvents = true,
}: {
  onChange?: (prop: {
    mouse: {
      x: number;
      y: number;
    };
  }) => void;
  onStart?: (prop: {
    mouse: {
      x: number;
      y: number;
    };
  }) => void;
  onEnd?: (prop: {
    mouse: {
      x: number;
      y: number;
    };
  }) => void;
  trackMouseEvents?: boolean;
  trackTouchEvents?: boolean;
}) => {
  const [active, setActive] = useState(false);

  const lastEventData = useRef<MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent>();

  const handleDrag = useEventCallback(
    (e: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent) => {
      const mouse = getPosition(e);

      onChange?.({ mouse });
      lastEventData.current = e;
    }
  );

  const handleEnd = useEventCallback(
    (e?: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent) => {
      setActive(false);
      if (e && canGetPosition(e)) {
        const mouse = getPosition(e);
        onEnd?.({ mouse });
      } else {
        if (!lastEventData.current) {
          throw new Error('[Linear Clock] cannot get input position form event');
        }
        const mouse = getPosition(lastEventData.current);
        onEnd?.({ mouse });
      }

      document.removeEventListener('mousemove', handleDrag);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleDrag);
      document.removeEventListener('touchend', handleEnd);
      document.removeEventListener('touchcancel', handleEnd);
    }
  );
  const handleStart = useEventCallback((e: React.MouseEvent | React.TouchEvent) => {
    // Middle click and right click won't trigger drag
    if (e.ctrlKey || ('button' in e && [1, 2].includes(e.button))) {
      return;
    }

    const mouse = getPosition(e);
    lastEventData.current = e;
    onStart?.({ mouse });

    setActive(true);
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

  useUnmount(() => {
    // component could unexpectly unmount during dragging.
    if (active) {
      handleEnd();
    }
  });

  return {
    active,
    handleStart,
    handleDrag,
    handleEnd,
  };
};

const canGetPosition = (
  e: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent
): boolean => {
  return 'touches' in e ? !!e.touches.length : true;
};

const getPosition = (
  e: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent
): {
  x: number;
  y: number;
} => {
  return 'touches' in e
    ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
    : { x: e.clientX, y: e.clientY };
};

const useSafeGetPosition = () => {
  const lastEventData = useRef<MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent>();

  return useCallback((e?: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent) => {
    if (e && canGetPosition(e)) return getPosition((lastEventData.current = e));

    if (lastEventData.current) {
      return getPosition(lastEventData.current);
    }

    throw new Error('getPosition() should be called at least once to enable event cache');
  }, []);
};
