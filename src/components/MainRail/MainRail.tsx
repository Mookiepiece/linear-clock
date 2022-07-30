import { useFloatingTransform } from '@/hooks/useFloatingTransform';
import { useEventCallback, usePointer, useSlider } from '@/hooks/useSlider';
import { Text } from '@/primitives';
import React, { useContext, useEffect, useRef, useState } from 'react';
import shims from '../../utils/shims';
import { ClockContext, ClockFnContext } from '../Clock/exports';
import Rail from '../Rail/Rail';
import { MainRailMitt } from './exports';
import './styles.scss';

const MainRail: React.FC = () => {
  const { point2time, time2point } = useContext(ClockFnContext);

  const [[focusStart, focusEnd], setFocusPeriod] = useState<[number | null, number | null]>([
    null,
    null,
  ]);

  const setStartMark = ({ mouse: { x } }: { mouse: { x: number; y: number } }) => {
    if (!railRef.current) throw new Error();

    const { left, width } = railRef.current.getBoundingClientRect();
    const cursorPercentage = shims.clamp(shims.round2(((x - left) / width) * 100));
    const cursorTime = point2time(cursorPercentage);
    setFocusPeriod([cursorTime, null]);
  };

  const setEndMark = useEventCallback(({ mouse: { x } }: { mouse: { x: number; y: number } }) => {
    if (!railRef.current) throw new Error();

    const { left, width } = railRef.current.getBoundingClientRect();
    const cursorPercentage = shims.clamp(shims.round2(((x - left) / width) * 100));
    const cursorTime = point2time(cursorPercentage);
    setFocusPeriod([focusStart, Math.max(cursorTime, cursorTime)]);
  });

  // FEAT: MouseMove
  const railRef = useRef<HTMLDivElement>(null);

  // const { left = 0, width = 0 } = railRef.current?.getBoundingClientRect() ?? {};

  const { handleStart: handleSetFocusPeriodStart } = useSlider({
    onStart: setStartMark,
    onChange: setEndMark,
    onEnd: setEndMark,
  });

  useEffect(() => {
    if (focusStart && focusEnd && focusStart < focusEnd) {
      MainRailMitt.emit('MARK', [focusStart, focusEnd]);
    } else {
      MainRailMitt.emit('UNMARK');
    }
  }, [focusStart, focusEnd]);

  const { dayStart, dayEnd } = useContext(ClockContext);

  return (
    <div
      className="main-rail"
      onMouseDown={handleSetFocusPeriodStart}
      onTouchStart={handleSetFocusPeriodStart}
      ref={railRef}
    >
      <Rail startTime={dayStart} endTime={dayEnd} />

      <HandFloatingLabel railRef={railRef} />
      {focusStart === null || focusStart === focusEnd ? null : (
        <div className="startmark" style={{ left: `${time2point(focusStart)}%` }}></div>
      )}
      {focusEnd === null || focusStart === focusEnd ? null : (
        <div className="endmark" style={{ left: `${time2point(focusEnd)}%` }}></div>
      )}
    </div>
  );
};

const HandFloatingLabel: React.FC<{
  railRef: React.RefObject<HTMLElement>;
}> = ({ railRef }) => {
  const { active: hovering, mouse } = usePointer(railRef);
  const { left = 0, width = 0 } = railRef.current?.getBoundingClientRect() ?? {};

  const _mousePercentage = !hovering
    ? null
    : shims.clamp(shims.round2(((mouse.x - left) / width) * 100));

  const lastMousePercentageRef = useRef(0);
  const mousePercentage = (lastMousePercentageRef.current =
    _mousePercentage ?? lastMousePercentageRef.current);
  const restMousePercentage = shims.round2(100 - mousePercentage);

  const labelElRef = useRef<HTMLDivElement | null>(null);
  const { point2time } = useContext(ClockFnContext);

  useFloatingTransform(mouse, labelElRef, {
    active: hovering,
    placement: 'top-start',
    callback: ({ el, x, y }) => {
      el.style.transform = `translate(${x}px, -100px)`;
    },
  });

  return (
    <>
      {/* <div
        className="hand"
        style={{
          opacity: hovering ? '1' : '0',
          transform: `translate(${mouse.x - left - 5}px)`,
          transition: 'opacity .1s',
        }}
      ></div> */}
      <div className="hand__label" ref={labelElRef}>
        <Text color="pink">
          {shims.print(point2time(mousePercentage))}{' '}
          <Text color="pink" solid>
            {restMousePercentage}%
          </Text>
        </Text>
      </div>
    </>
  );
};

export default MainRail;
