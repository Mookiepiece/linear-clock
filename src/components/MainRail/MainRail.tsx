import { useFloatingTransform } from '@/hooks/useFloatingTransform';
import { useEventCallback, usePointer, useSlider } from '@/hooks/useSlider';
import { Text } from '@/primitives';
import { Box } from '@mookiepiece/strawberry-farm';
import React, { useContext, useRef } from 'react';
import $ from '@/utils/$';
import { ClockContext } from '../Clock/exports';
import Rail from '../Rail/Rail';
import './styles.scss';
import { time } from '@/utils/time';

const MainRail: React.FC = () => {
  const {
    percentage2Timestamp,
    timestamp2Percentage,
    focusPeriod: [focusStart, focusEnd],
    setFocusPeriod,
  } = useContext(ClockContext);

  const setStartMark = ({ mouse: { x } }: { mouse: { x: number; y: number } }) => {
    if (!railRef.current) throw new Error();

    const { left, width } = railRef.current.getBoundingClientRect();
    const cursorPercentage = $.clamp($.round2(((x - left) / width) * 100));
    const cursorTime = percentage2Timestamp(cursorPercentage);
    setFocusPeriod([cursorTime, null]);
  };

  const setEndMark = useEventCallback(({ mouse: { x } }: { mouse: { x: number; y: number } }) => {
    if (!railRef.current) throw new Error();

    const { left, width } = railRef.current.getBoundingClientRect();
    const cursorPercentage = $.clamp($.round2(((x - left) / width) * 100));
    const cursorTime = percentage2Timestamp(cursorPercentage);
    setFocusPeriod([focusStart, Math.max(cursorTime, cursorTime)]);
  });

  const railRef = useRef<HTMLDivElement>(null);

  const { handleStart: handleSetFocusPeriodStart } = useSlider({
    onStart: setStartMark,
    onChange: setEndMark,
    onEnd: setEndMark,
  });

  const { nowShifted, dayStart, dayEndShifted } = useContext(ClockContext);

  return (
    <div
      className="main-rail"
      onMouseDown={handleSetFocusPeriodStart}
      onTouchStart={handleSetFocusPeriodStart}
      ref={railRef}
    >
      <Rail now={nowShifted} startTime={dayStart} endTime={dayEndShifted} />

      <HandFloatingLabel railRef={railRef} />
      {focusStart === null || focusStart === focusEnd ? null : (
        <div className="startmark" style={{ left: `${timestamp2Percentage(focusStart)}%` }}></div>
      )}
      {focusEnd === null || focusStart === focusEnd ? null : (
        <div className="endmark" style={{ left: `${timestamp2Percentage(focusEnd)}%` }}></div>
      )}
    </div>
  );
};

const HandFloatingLabel: React.FC<{
  railRef: React.RefObject<HTMLElement>;
}> = ({ railRef }) => {
  const { percentage2Timestamp } = useContext(ClockContext);
  const { active: hovering, mouse } = usePointer(railRef);
  const { left = 0, width = 0 } = railRef.current?.getBoundingClientRect() ?? {};

  const _mousePercentage = !hovering ? null : $.clamp($.round2(((mouse.x - left) / width) * 100));
  const lastMousePercentageRef = useRef(0);
  const mousePercentage = (lastMousePercentageRef.current =
    _mousePercentage ?? lastMousePercentageRef.current);
  const restMousePercentage = $.round2(100 - mousePercentage);

  const labelElRef = useRef<HTMLDivElement | null>(null);

  useFloatingTransform(mouse, labelElRef, {
    active: hovering,
    placement: 'top',
    callback: ({ el, x }) => {
      el.style.transform = `translate(${x}px, -40px)`;
    },
  });

  return (
    <div className="hand__label" ref={labelElRef}>
      <Box horizontal align="center">
        <Text color="pink">
          {time.print(time.fromTimeStamp(percentage2Timestamp(mousePercentage)))}{' '}
        </Text>
        <Text color="pink" solid>
          {restMousePercentage}%
        </Text>
      </Box>
    </div>
  );
};

export default MainRail;
