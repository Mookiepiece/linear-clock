import React from 'react';

export const ClockContext = React.createContext<{
  dayStart: number;
  dayEnd: number;
  /**
   * Promised to be greater than `dayStart`
   */
  dayEndShifted: number;
  now: number;
  /**
   * Promised to be greater than `dayStart`
   */
  nowShifted: number;
}>({
  dayStart: 0,
  dayEnd: 0,
  dayEndShifted: 0,
  now: 0,
  nowShifted: 0,
});
