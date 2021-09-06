import React from 'react';

export const ClockContext = React.createContext<{
  dayStart: number;
  dayEnd: number;
  now: number;
  nowPercentage: number;
}>({
  dayStart: 0,
  dayEnd: 0,
  now: 0,
  nowPercentage: 0,
});
