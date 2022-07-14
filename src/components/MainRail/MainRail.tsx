import { useEventCallback, useSlider } from '@/hooks/useSlider';
import React, { useContext, useEffect, useRef, useState } from 'react';
import shims from '../../utils/shims';
import { ClockContext, ClockFnContext } from '../Clock/exports';
import Rail from '../Rail/Rail';
import { MainRailMitt } from './exports';
import './styles.scss';

const MainRail: React.FC = () => {
  const { point2time, time2point } = useContext(ClockFnContext);

  const [mousePercentage, setMousePercentage] = useState<number | null>(null);

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
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!railRef.current) throw new Error();

    const { left, width } = railRef.current.getBoundingClientRect();
    const { clientX } = e;
    const mousePercentage = shims.clamp(shims.round2(((clientX - left) / width) * 100));
    setMousePercentage(mousePercentage);
  };
  const handleMouseLeave = () => {
    setMousePercentage(null);
  };

  const { handleStart: handleSetFocusPeriodStart } = useSlider({
    onStart: setStartMark,
    onChange: setEndMark,
    onEnd: setEndMark,
  });

  const restMousePercentage = mousePercentage === null ? null : shims.round2(100 - mousePercentage);

  useEffect(() => {
    if (focusStart && focusEnd && focusStart < focusEnd) {
      MainRailMitt.emit('MARK', [focusStart, focusEnd]);
    } else {
      MainRailMitt.emit('UNMARK', undefined);
    }
  }, [focusStart, focusEnd]);

  const { dayStart, dayEnd } = useContext(ClockContext);

  return (
    <div
      className="main-rail"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleSetFocusPeriodStart}
      onTouchStart={handleSetFocusPeriodStart}
      ref={railRef}
    >
      <Rail startTime={dayStart} endTime={dayEnd} />
      {mousePercentage === null ? null : (
        <div
          className="dial"
          style={{
            left: `${mousePercentage}%`,
            ...{
              '--label-offset': mousePercentage > 80 ? '-200px' : '4px',
            },
          }}
        >
          <div className="dial__label">
            {shims.print(point2time(mousePercentage))}{' '}
            <span className="color-primary-d">({restMousePercentage}%)</span>
          </div>
        </div>
      )}
      {focusStart === null || focusStart === focusEnd ? null : (
        <div className="startmark" style={{ left: `${time2point(focusStart)}%` }}></div>
      )}
      {focusEnd === null || focusStart === focusEnd ? null : (
        <div className="endmark" style={{ left: `${time2point(focusEnd)}%` }}></div>
      )}
    </div>
  );
};

export default MainRail;
