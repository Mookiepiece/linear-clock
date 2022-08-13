import { Text } from '@/primitives';
import { hourMarksBetween } from '@/utils/hourMarksBetween';
import shims from '@/utils/shims';
import { Box } from '@mookiepiece/strawberry-farm';
import React, { useContext } from 'react';
import { ClockContext } from '../Clock/exports';
import './styles.scss';

export type RailProps = {
  startTime: number;
  endTime: number;
};

const Rail: React.FC<RailProps> = ({ startTime, endTime }) => {
  const { now } = useContext(ClockContext);

  const activePercentage = shims.round2(((now - startTime) / (endTime - startTime)) * 100);

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
          {shims.round2(100 - activePercentage)}%
        </Text>
        <Text level={2}>
          {' ' + shims.print(startTime)} - {shims.print(endTime)}
        </Text>
      </Box>
    </Box>
  );
};

export default Rail;
