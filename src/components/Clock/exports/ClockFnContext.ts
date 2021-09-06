import React from 'react';

export const ClockFnContext = React.createContext<{
  point2time(v: number): number;
  time2point(v: number): number;
}>(null as any);
