import React from 'react';
import { Box } from '@mookiepiece/strawberry-farm';
import { Text } from '@/primitives';
import { hourMarksBetween } from '@/utils/hourMarksBetween';
import $ from '@/utils/$';
import './styles.scss';
import { time } from '@/utils/time';

export type RailProps = {
  now: number;
  startTime: number;
  endTime: number;
};

const Rail: React.FC<RailProps> = ({ now, startTime, endTime }) => {
  const hourMarks = hourMarksBetween(startTime, endTime);

  const activePercentage = $.clamp($.round2(((now - startTime) / (endTime - startTime)) * 100));

  return (
    <div className="rail">
      <div className="rail__inner">
        <div className="rail__hour-labels">
          {hourMarks.map(({ hour, percentage }) => (
            <div
              key={hour}
              className="rail__hour-label"
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
      <Box className="my-30" horizontal align="center">
        <Text>{time.print(time.fromTimeStamp(now), 'HMS')} </Text>
        <Text solid>{$.round2(100 - activePercentage)}%</Text>
      </Box>
    </div>
  );
};

export default Rail;
