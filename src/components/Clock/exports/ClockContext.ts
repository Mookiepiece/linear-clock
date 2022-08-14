import React from 'react';
import { noop } from '@mookiepiece/strawberry-farm/shared';

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

  percentage2Timestamp(v: number): number;
  timestamp2Percentage(v: number): number;

  focusPeriod: [number | null, number | null];
  setFocusPeriod: React.Dispatch<React.SetStateAction<[number | null, number | null]>>;
}>({
  dayStart: 0,
  dayEnd: 0,
  dayEndShifted: 0,
  now: 0,
  nowShifted: 0,

  percentage2Timestamp: () => 0,
  timestamp2Percentage: () => 0,

  focusPeriod: [null, null],
  setFocusPeriod: noop,
});
