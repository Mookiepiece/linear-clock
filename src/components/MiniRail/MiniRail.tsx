import { Text } from '@/primitives';
import $ from '@/utils/$';
import { Box } from '@mookiepiece/strawberry-farm';
import React from 'react';
import './styles.scss';

export type MiniRailProps = {
  now: number;
  startTime: number;
  endTime: number;
};

const Rail: React.FC<MiniRailProps> = ({ now, startTime, endTime }) => {
  const activePercentage = $.round2(((now - startTime) / (endTime - startTime)) * 100);

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
          {' ' + $.print(startTime)} - {$.print(endTime)}
        </Text>
      </Box>
    </Box>
  );
};

export default Rail;
