import React, { useContext, useEffect, useRef, useState } from 'react';
import shims from '../../utils/shims';
import { ClockContext, ClockFnContext } from '../Clock/exports';
import Rail from '../Rail/Rail';
import { MainRailMitt } from './exports';
import './styles.scss';

const MainRail: React.FC = () => {
  const { point2time, time2point } = useContext(ClockFnContext);
  const { now } = useContext(ClockContext);

  const [mousePercentage, setMousePercentage] = useState<number | null>(null);
  const [startMark, setStartMark] = useState<number | null>(null);
  const [endMark, setEndMark] = useState<number | null>(null);

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

  // FEAT: MouseClick
  const handleClick = (e: React.MouseEvent) => {
    if (!railRef.current) throw new Error();

    const { left, width } = railRef.current.getBoundingClientRect();
    const { clientX } = e;

    const cursorPercentage = shims.clamp(shims.round2(((clientX - left) / width) * 100));

    const cursorTime = point2time(cursorPercentage);

    if ([startMark, endMark].includes(cursorTime)) {
      setStartMark(null);
      setEndMark(null);
      return;
    }
    if (now > cursorTime) {
      setStartMark(cursorTime);
    } else {
      setEndMark(cursorTime);
    }
  };

  const restMousePercentage = mousePercentage === null ? null : shims.round2(100 - mousePercentage);

  useEffect(() => {
    if (startMark && endMark) {
      MainRailMitt.emit('MARK', [startMark, endMark]);
    } else {
      MainRailMitt.emit('UNMARK', undefined);
    }
  }, [startMark, endMark]);

  const { dayStart, dayEnd } = useContext(ClockContext);

  return (
    <div
      className="main-rail"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
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
      {startMark === null ? null : (
        <div
          className="startmark"
          style={{
            left: `${time2point(startMark)}%`,
          }}
        ></div>
      )}
      {endMark === null ? null : (
        <div
          className="endmark"
          style={{
            left: `${time2point(endMark)}%`,
          }}
        ></div>
      )}
    </div>
  );
};

export default MainRail;
