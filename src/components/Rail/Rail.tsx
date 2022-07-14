import shims from '@/utils/shims';
import React, { useContext } from 'react';
import { ClockContext } from '../Clock/exports';
import './styles.scss';
import { useOClockMarks } from './useOClockMarks';

export type RailProps = {
  startTime: number;
  endTime: number;
};

const Rail: React.FC<RailProps> = ({ startTime, endTime }) => {
  const oclockMarks = useOClockMarks(startTime, endTime);

  const { now } = useContext(ClockContext);

  const activePercentage = shims.round2(((now - startTime) / (endTime - startTime)) * 100);

  return (
    <div className="rail">
      <div className="rail__inner">
        <div className="rail__labels">
          {oclockMarks.map(({ hour, percentage }) => (
            <div
              key={hour}
              className="rail__label"
              style={{ left: `${percentage}%` }}
              data-hour={hour}
            ></div>
          ))}
        </div>
        <div
          className="rail__fill"
          style={
            {
              width: `${activePercentage}%`,
            } as React.CSSProperties
          }
        ></div>
        <div
          className="rail__fill2"
          style={
            {
              width: `${100 - activePercentage}%`,
            } as React.CSSProperties
          }
        ></div>
      </div>
      <div className="time-label">
        {shims.print(now, 'HMS')}{' '}
        <span className="color-primary-d">({shims.round2(100 - activePercentage)}%)</span>
      </div>
    </div>
  );
};

export default Rail;
