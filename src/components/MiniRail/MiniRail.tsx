import { Text } from '@/primitives';
import $ from '@/utils/$';
import { time } from '@/utils/time';
import { Box } from '@mookiepiece/strawberry-farm';
import React from 'react';
import './styles.scss';

export type MiniRailProps = {
  now: number;
  startTime: number;
  endTime: number;
};

const Rail: React.FC<MiniRailProps> = ({ now, startTime, endTime }) => {
  const activePercentage = $.clamp($.round2(((now - startTime) / (endTime - startTime)) * 100));

  return (
    <Box gap={5}>
      <div>
        <div
          className="minirail__fill"
          style={
            {
              '--a': `${activePercentage}%`,
            } as React.CSSProperties
          }
        ></div>
      </div>
      <Box horizontal align="center">
        <Text solid level={2}>
          {$.round2(100 - activePercentage)}%
        </Text>
        <Text level={2}>
          {` ${time.print(time.fromTimeStamp(startTime))} - ${time.print(
            time.fromTimeStamp(endTime)
          )}`}
        </Text>
      </Box>
    </Box>
  );
};

export default Rail;
