import React, { useCallback, useRef, useState } from 'react';
import { useMouse, useToggle } from 'react-use';
import clsx from 'clsx';
import './styles.scss';
import shims from '@/utils/shims';
import { usePointer, useSlider } from '@/hooks/useSlider';
import { Portal } from '@/utils/Portal';
import { Transition } from '@headlessui/react';
import { useFloatingTransform } from '@/hooks/useFloatingTransform';

const radius2timestamp = (r: number) => {
  return (r / 360) * (1000 * 60 * 60 * 24) - 1000 * 60 * 60 * 8;
};

const timestamp2radius = (t: number) => {
  return ((t + 1000 * 60 * 60 * 8) / (1000 * 60 * 60 * 24)) * 360;
  // return (t / 360) * (1000 * 60 * 60 * 24) ;
};

const oClockLabelNodes = [...Array(24).keys()].map(i => {
  const radius = ((i / 24) * 360 + 90) % 360;
  const pinia = (radius / 360) * 2 * Math.PI;
  return (
    <span
      key={i}
      style={{
        color: '#111',
        top: Math.sin(pinia) * 46 + 50 + '%',
        left: Math.cos(pinia) * 46 + 50 + '%',
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

const DaySettings: React.FC<{
  initialValue: [number, number];
  onChange(value: [number, number]): void;
  // eslint-disable-next-line react/display-name
}> = React.memo(({ initialValue, onChange }) => {
  const [expanded, toggleExpanded] = useToggle(false);

  return (
    <div>
      <button onClick={toggleExpanded}>⚙️</button>
      <Portal>
        <Transition
          appear
          unmount
          as={React.Fragment}
          show={expanded}
          enter="day-settings__backdrop--active"
          enterFrom="day-settings__popper--out"
          enterTo="day-settings__popper--in"
          leave="day-settings__backdrop--active"
          leaveFrom="day-settings__popper--in"
          leaveTo="day-settings__popper--out"
        >
          <DaySettingsPopper
            initialValue={initialValue}
            onChange={onChange}
            toggleExpanded={toggleExpanded}
          />
        </Transition>
      </Portal>
    </div>
  );
});

const DaySettingsPopper = React.forwardRef<
  HTMLDivElement,
  {
    className?: string;
    // Transition Primitive does not support
    // https://github.com/tailwindlabs/headlessui/blob/3e19aa5c97f98aaa4106db3f8a2c9f9fb1ce8386/packages/@headlessui-react/src/utils/render.ts#L188
    toggleExpanded(): void;
    initialValue: [number, number];
    onChange(value: [number, number]): void;
  }
>(({ initialValue, className, toggleExpanded: onClose, onChange }, popperRef) => {
  const controlRef = useRef<HTMLDivElement | null>(null);
  const circleRef = useRef<HTMLDivElement | null>(null);
  const { top = 0, left = 0, width = 0 } = circleRef.current?.getBoundingClientRect() ?? {};

  const relativeToCircle = useCallback(
    (mouse: { x: number; y: number }) => {
      const x = mouse.x - left;
      const y = mouse.y - top;
      return { x, y };
    },
    [left, top]
  );

  const { elX, elY } = useMouse(circleRef);

  const mouse = { x: elX + left, y: elY + top };
  const { active: hovering } = usePointer(circleRef);

  const r = (width ?? 200) / 2;

  const mouseRadius =
    (270 -
      (Math.atan2(r - (relativeToCircle(mouse).y ?? 0), (relativeToCircle(mouse).x ?? 0) - r) *
        180) /
        Math.PI) %
    360;

  const [arcStartRadius, setArcStartRadius] = useState(() => timestamp2radius(initialValue[0]));
  const [arcEndRadius, setArcEndRadius] = useState(() => timestamp2radius(initialValue[1]));

  const setArcStart = useCallback(
    (arcStart: { x: number; y: number }) => {
      setArcStartRadius(
        (270 - (Math.atan2(r - (arcStart?.y ?? 0), (arcStart?.x ?? 0) - r) * 180) / Math.PI) % 360
      );
    },
    [r]
  );

  const setArcEnd = useCallback(
    (arcEnd: { x: number; y: number }) => {
      setArcEndRadius(
        (270 - (Math.atan2(r - (arcEnd?.y ?? 0), (arcEnd?.x ?? 0) - r) * 180) / Math.PI) % 360
      );
    },
    [r]
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
    <div ref={popperRef} className={clsx('day-settings__popper', className)}>
      <div className="day-settings__control" ref={controlRef}>
        <div className="day-settings__control__panel">{oClockLabelNodes}</div>
        <FloatingLabel
          mouse={mouse}
          mouseRadius={mouseRadius}
          visible={startHandleDragActive || endHandleDragActive || active || hovering}
        />
        <div
          ref={circleRef}
          onTouchStart={handleStart}
          onMouseDown={handleStart}
          className="day-settings__control__svg-container"
          style={{
            mixBlendMode: 'color',
          }}
        >
          <svg width="100%" height="100%" version="1.1" xmlns="http://www.w3.org/2000/svg">
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop
                offset="0%"
                style={{
                  color: '#fd3',

                  stopColor: 'currentColor',
                }}
              />
              <stop offset="100%" style={{ color: '#39f', stopColor: 'currentColor' }} />
            </linearGradient>
            {(() => {
              const r3 = width / 2.04;
              const r4 = width / 50;
              return (
                <>
                  <circle
                    id="bar"
                    r={r3}
                    cx="50%"
                    cy="50%"
                    fill="transparent"
                    strokeWidth={r4}
                    stroke={rotationBetween === 0 ? 'transparent' : 'url(#gradient)'}
                    strokeDasharray={r3 * 2 * Math.PI}
                    strokeDashoffset={(1 - rotationBetween / 360) * r3 * 2 * Math.PI}
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
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop
                offset="0%"
                style={{
                  color: '#fd3',

                  stopColor: 'currentColor',
                }}
              />
              <stop offset="100%" style={{ color: '#39f', stopColor: 'currentColor' }} />
            </linearGradient>
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
          className="day-settings__control__handle day-settings__control__start-handle"
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
          className="day-settings__control__handle day-settings__control__end-handle"
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
        <div>
          <button onClick={onClose}>⬅️</button>
        </div>
        <div>
          {'⏱️ '}
          {shims.print(radius2timestamp(arcStartRadius))}
          {'->'}
          {shims.print(radius2timestamp(visualArcEndRadius))}
        </div>
        <div>
          <button
            disabled={rotationBetween === 0}
            onClick={() => {
              onChange([radius2timestamp(arcStartRadius), radius2timestamp(visualArcEndRadius)]);
              onClose();
            }}
          >
            🆗
          </button>
        </div>
      </div>
    </div>
  );
});

const FloatingLabel: React.FC<{
  visible: boolean;
  mouse: { x: number; y: number };
  mouseRadius: number;
}> = ({ mouse, visible, mouseRadius }) => {
  const labelElRef = useRef<HTMLDivElement | null>(null);

  useFloatingTransform(mouse, labelElRef, {
    active: visible,
  });

  return (
    <div className="day-settings__control__label" ref={labelElRef}>
      {shims.print(radius2timestamp(mouseRadius))}
    </div>
  );
};

export default DaySettings;
