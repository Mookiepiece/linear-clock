import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useToggle } from 'react-use';
import { Transition } from '@headlessui/react';
import clsx from 'clsx';
import { Box, Popper } from '@mookiepiece/strawberry-farm';
import { Portal, useEventCallback, useStorage } from '@mookiepiece/strawberry-farm/shared';

import { ApiOutlined, CheckOutlined, CloseOutlined, CompassOutlined } from '@ant-design/icons';
import './styles.scss';
import shims from '@/utils/shims';
import { useHover, usePointerX, useSlider } from '@/hooks/useSlider';
import { useFloatingTransform } from '@/hooks/useFloatingTransform';
import { Storages } from '@/storages';
import { useResizeObserver } from '@/hooks/useResizeObserver';

const radius2timestamp = (r: number) => {
  return (r / 360) * (1000 * 60 * 60 * 24) - 1000 * 60 * 60 * 8;
};

const timestamp2radius = (t: number) => {
  return ((t + 1000 * 60 * 60 * 8) / (1000 * 60 * 60 * 24)) * 360;
};

const oClockLabelNodes = [...Array(24).keys()].map(i => {
  const radius = ((i / 24) * 360 + 90) % 360;
  const pinia = (radius / 360) * 2 * Math.PI;
  return (
    <span
      key={i}
      style={{
        color: '#444',
        top: Math.sin(pinia) * 42 + 50 + '%',
        left: Math.cos(pinia) * 42 + 50 + '%',
        ...{
          '--label-offset-radius': radius + 'deg',
          '--label-offset-radius-r': -radius + 'deg',
          '--label-offset-top': -Math.sin(pinia),
          '--label-offset-left': -Math.cos(pinia),
        },
      }}
      data-label={i % 3 === 0 ? i : ''}
    ></span>
  );
});

const onChange = ([dayStart, dayEnd]: [number, number]) =>
  Storages.lc_local.set(s => ({
    ...s,
    dayEnd,
    dayStart,
  }));

const DaySettings: React.FC = () => {
  const [expanded, toggleExpanded] = useToggle(false);

  return (
    <div>
      <button onClick={() => toggleExpanded()}>
        <CompassOutlined />
      </button>
      <Portal>
        <Transition
          show={expanded}
          as={React.Fragment}
          enter="day-settings__popper--active"
          enterFrom="day-settings__popper--out"
          enterTo="day-settings__popper--in"
          leave="day-settings__popper--active"
          leaveFrom="day-settings__popper--in"
          leaveTo="day-settings__popper--out"
        >
          <DaySettingsPopper
            className="day-settings__popper"
            onChange={onChange}
            toggleExpanded={toggleExpanded}
          />
        </Transition>
      </Portal>
    </div>
  );
};

const DaySettingsPopper = React.forwardRef<
  HTMLDivElement,
  {
    className?: string;
    // Transition Primitive does not support
    // https://github.com/tailwindlabs/headlessui/blob/3e19aa5c97f98aaa4106db3f8a2c9f9fb1ce8386/packages/@headlessui-react/src/utils/render.ts#L188
    toggleExpanded(): void;
    onChange(value: [number, number]): void;
  }
>(({ className, toggleExpanded: onClose, onChange }, ref) => {
  const [popperEl, setPopperEl] = useState<HTMLDivElement | null>(null);
  // Resize Observer cannot detect position shifting, we'll update position after transition entered
  const handleTransitionEnd = (e: React.TransitionEvent) => {
    if (e.target === popperEl) {
      if (circleEl) setRect(circleEl.getBoundingClientRect());
    }
  };

  const [circleEl, setCircleEl] = useState<HTMLDivElement | null>(null);

  const [{ left, top, width }, setRect] = useState<{
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
  useResizeObserver(circleEl, () => {
    circleEl && setRect(circleEl.getBoundingClientRect());
  });

  const [{ snapping, dayEnd, dayStart }] = useStorage(Storages.lc_local);

  const radius2timestampMagneted = useCallback(
    (r: number) => {
      const raw = radius2timestamp(r);
      if (snapping === 0) return raw;

      const step = 1000 * 60 * snapping;
      const magneted = Math.round(raw / step) * step;
      return magneted;
    },
    [snapping]
  );
  const getMagnetedRadius = useCallback(
    (r: number) => {
      if (snapping === 0) return r;
      return timestamp2radius(radius2timestampMagneted(r));
    },
    [radius2timestampMagneted, snapping]
  );

  const relativeToCircle = useCallback(
    (mouse: { x: number; y: number }) => {
      const x = mouse.x - left;
      const y = mouse.y - top;
      return { x, y };
    },
    [top, left]
  );

  const [mouse, setMouse] = useState({
    x: 0,
    y: 0,
  });
  usePointerX(circleEl, setMouse);

  const [hovering, setHovering] = useState(false);
  useHover(circleEl, setHovering);

  const r = (width ?? 200) / 2;

  const mouseRadius = getMagnetedRadius(
    (270 -
      (Math.atan2(r - (relativeToCircle(mouse).y ?? 0), (relativeToCircle(mouse).x ?? 0) - r) *
        180) /
        Math.PI) %
      360
  );

  const [arcStartRadius, setArcStartRadius] = useState(() => timestamp2radius(dayStart));
  const [arcEndRadius, setArcEndRadius] = useState(() => timestamp2radius(dayEnd));

  const setArcStart = useCallback(
    (arcStart: { x: number; y: number }) => {
      setArcStartRadius(
        getMagnetedRadius(
          (270 - (Math.atan2(r - (arcStart?.y ?? 0), (arcStart?.x ?? 0) - r) * 180) / Math.PI) % 360
        )
      );
    },
    [getMagnetedRadius, r]
  );

  const setArcEnd = useCallback(
    (arcEnd: { x: number; y: number }) => {
      setArcEndRadius(
        getMagnetedRadius(
          (270 - (Math.atan2(r - (arcEnd?.y ?? 0), (arcEnd?.x ?? 0) - r) * 180) / Math.PI) % 360
        )
      );
    },
    [getMagnetedRadius, r]
  );

  const { active, handleStart } = useSlider({
    onStart({ mouse }) {
      setArcStart(relativeToCircle(mouse));
    },
    onEnd({ mouse }) {
      setArcEnd(relativeToCircle(mouse));
    },
  });

  const { active: startHandleDragActive, handleStart: handleStartHandleDragStart } = useSlider({
    onStart({ mouse }) {
      setArcStart(relativeToCircle(mouse));
    },
    onChange({ mouse }) {
      setArcStart(relativeToCircle(mouse));
    },
    onEnd({ mouse }) {
      setArcStart(relativeToCircle(mouse));
    },
  });

  const { active: endHandleDragActive, handleStart: handleEndHandleDragStart } = useSlider({
    onStart({ mouse }) {
      setArcEnd(relativeToCircle(mouse));
    },
    onChange({ mouse }) {
      setArcEnd(relativeToCircle(mouse));
    },
    onEnd({ mouse }) {
      setArcEnd(relativeToCircle(mouse));
    },
  });

  // the elX & elY we access in useSlider is snapshots the last frame which is stale.
  const visualArcEndRadius = active ? mouseRadius : arcEndRadius;

  const rotationBetween =
    visualArcEndRadius >= arcStartRadius
      ? visualArcEndRadius - arcStartRadius
      : visualArcEndRadius + 360 - arcStartRadius;

  return (
    <div
      ref={useEventCallback(el => {
        el && setPopperEl(el);
        el && ref && (typeof ref === 'function' ? ref(el) : (ref.current = el));
      })}
      className={clsx(className)}
      onTransitionEnd={handleTransitionEnd}
    >
      <div className="day-settings__control">
        <div className="day-settings__control__panel">{oClockLabelNodes}</div>
        <FloatingLabel
          mouse={mouse}
          visible={startHandleDragActive || endHandleDragActive || active || hovering}
          label={shims.print(radius2timestamp(mouseRadius))}
        />
        <div
          ref={setCircleEl}
          onTouchStart={handleStart}
          onMouseDown={handleStart}
          className="day-settings__control__svg-container"
          style={{
            mixBlendMode: 'color',
          }}
        >
          <svg width="100%" height="100%" version="1.1" xmlns="http://www.w3.org/2000/svg">
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#fd3' }} />
              <stop offset="100%" style={{ stopColor: '#39f' }} />
            </linearGradient>
            {(() => {
              /**
               * ```txt
               * ---------------------
               * Total Width
               *
               *             Transparent ring
               * ----------|----------
               * Colorful ring (Stroke)
               *
               * Middle of colorful ring
               * |----|----|
               *      |--------------|
               *            svg.r
               * |---------|
               * svg.stoke
               * ```
               */
              const transparentR = width / 2.2;
              const COLORFUL_R = width / 2 - transparentR;
              const R3 = transparentR + COLORFUL_R / 2;
              const R4 = COLORFUL_R;

              return (
                <>
                  <circle
                    id="bar"
                    r={R3}
                    cx="50%"
                    cy="50%"
                    fill="transparent"
                    strokeWidth={R4}
                    stroke={rotationBetween === 0 ? 'transparent' : 'url(#gradient)'}
                    strokeDasharray={R3 * 2 * Math.PI}
                    strokeDashoffset={(1 - rotationBetween / 360) * R3 * 2 * Math.PI}
                    style={{
                      transform: `rotate(${arcStartRadius + 90}deg)`,
                      transformOrigin: 'center',
                    }}
                  ></circle>
                </>
              );
            })()}
          </svg>
        </div>
        <div className="day-settings__control__panel-drop-shadow">
          <svg width="100%" height="100%" version="1.1" xmlns="http://www.w3.org/2000/svg">
            {(() => {
              const r = width / 4;
              const r2 = width / 2;

              return (
                <>
                  <circle
                    id="bar"
                    r={r}
                    cx="50%"
                    cy="50%"
                    fill="transparent"
                    strokeWidth={r2}
                    stroke={rotationBetween === 0 ? 'transparent' : '#0001'}
                    strokeDasharray={r * 2 * Math.PI}
                    strokeDashoffset={-(rotationBetween / 360) * r * 2 * Math.PI}
                    style={{
                      transition: rotationBetween === 0 ? undefined : '.3s stroke',
                      transform: `rotate(${arcStartRadius + 90}deg)`,
                      transformOrigin: 'center',
                    }}
                  ></circle>
                </>
              );
            })()}
          </svg>
        </div>
        <div
          className="day-settings__control__handle"
          style={{
            display: rotationBetween === 0 ? 'none' : undefined,
            transform: `translate(
                ${(Math.sin((-arcStartRadius / 360) * 2 * Math.PI) * width * 1.15) / 2}px,
                ${(Math.cos((-arcStartRadius / 360) * 2 * Math.PI) * width * 1.15) / 2}px
              )`,
          }}
          // chrome mouse down bug
          onDragStart={e => {
            e.preventDefault();
          }}
          onMouseDown={handleStartHandleDragStart}
          onTouchStart={handleStartHandleDragStart}
        ></div>
        <div
          className="day-settings__control__handle"
          style={{
            display: rotationBetween === 0 ? 'none' : undefined,
            transform: `translate(
                ${(Math.sin((-visualArcEndRadius / 360) * 2 * Math.PI) * width * 1.15) / 2}px,
                ${(Math.cos((-visualArcEndRadius / 360) * 2 * Math.PI) * width * 1.15) / 2}px
              )`,
          }}
          // chrome mouse down bug
          onDragStart={e => {
            e.preventDefault();
          }}
          onMouseDown={handleEndHandleDragStart}
          onTouchStart={handleEndHandleDragStart}
        ></div>
      </div>
      <div className="day-settings__footer">
        <SnappingControl />
        <Box gap={10} horizontal>
          <div>
            <button onClick={onClose}>
              <CloseOutlined />
            </button>
          </div>
          <Box align="center" justify="center">
            {shims.print(radius2timestamp(arcStartRadius))}
            {' ~ '}
            {shims.print(radius2timestamp(visualArcEndRadius))}
          </Box>
          <div>
            <button
              disabled={rotationBetween === 0}
              onClick={() => {
                onChange([radius2timestamp(arcStartRadius), radius2timestamp(visualArcEndRadius)]);
                onClose();
              }}
            >
              <CheckOutlined />
            </button>
          </div>
        </Box>
      </div>
    </div>
  );
});

const SnappingControl: React.FC = () => {
  const [{ snapping }, setConfig] = useStorage(Storages.lc_local);
  const setSnapping = useCallback(
    (snapping: number) => setConfig(s => ({ ...s, snapping })),
    [setConfig]
  );
  const [expanded, toggleExpanded] = useToggle(false);

  return (
    <Box>
      <Popper
        popupClassName="sf-popper--default"
        placement="top"
        popup={
          <div>
            <Box horizontal align="center">
              {[0, 5, 10, 15].map(s => (
                <button
                  key={s}
                  className={clsx({ active: snapping === s })}
                  onClick={() => {
                    setSnapping(s);
                    toggleExpanded();
                  }}
                >
                  {s}
                </button>
              ))}
            </Box>
          </div>
        }
        visible={expanded}
        onClose={toggleExpanded}
      >
        <button onClick={toggleExpanded}>
          <ApiOutlined />
          <span style={{ position: 'absolute', right: 5, bottom: 5, fontSize: 12 }}>
            {snapping || ''}
          </span>
        </button>
      </Popper>
    </Box>
  );
};

const FloatingLabel: React.FC<{
  visible: boolean;
  mouse: { x: number; y: number };
  label: string;
}> = ({ mouse, visible, label }) => {
  const labelElRef = useRef<HTMLDivElement | null>(null);

  useFloatingTransform(mouse, labelElRef, {
    active: visible,
    placement: 'top',
  });

  return (
    <div className="day-settings__control__label" ref={labelElRef}>
      <div className="day-settings__control__label__content">{label}</div>
    </div>
  );
};

export default DaySettings;
