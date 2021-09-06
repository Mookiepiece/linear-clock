import React, { useState, useEffect, useMemo, useCallback } from 'react';
import shims from '../../utils/shims';
import FocusRail from '../FocusRail/FocusRail';
import MainRail from '../MainRail';
import { ClockContext, ClockFnContext } from './exports';
import './styles.scss';

const ours = (
  h: string | number = 0,
  m: string | number = 0,
  s: string | number = 0,
  ms: string | number = 0
) => {
  const t = new Date();
  t.setHours(+h, +m, +s, +ms);
  return t.getTime();
};

const Clock = () => {
  const [dayStart, setDayStart] = useState(() => {
    const today0800 = new Date();
    today0800.setHours(8, 0, 0, 0);
    return today0800.getTime();
  });
  const [dayEnd, setDayEnd] = useState(() => {
    const today2230 = new Date();
    today2230.setHours(22, 30, 0, 0);
    return today2230.getTime();
  });

  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    const i = setInterval(() => setTime(() => new Date()), 1000);
    return () => clearInterval(i);
  }, []);
  const now = time.getTime();

  const d2230_0800 = dayEnd - dayStart;

  const point2time = useCallback(
    (v: number) => {
      return (v / 100) * d2230_0800 + dayStart;
    },
    [d2230_0800, dayStart]
  );

  const time2point = useCallback(
    (t: number) => {
      return shims.clamp(shims.round2(((t - dayStart) / d2230_0800) * 100));
    },
    [dayStart, d2230_0800]
  );

  const nowPercentage = time2point(now);

  const clockFnContextValue = useMemo(
    () => ({
      point2time,
      time2point,
    }),
    [point2time, time2point]
  );

  return (
    <div className="clock">
      <ClockContext.Provider
        value={{
          dayStart,
          dayEnd,
          now,
          nowPercentage,
        }}
      >
        <ClockFnContext.Provider value={clockFnContextValue}>
          <MainRail />

          <div
            style={{
              paddingTop: 16,
            }}
          >
            <input type="time" onChange={e => setDayStart(ours(...e.target.value.split(':')))} />
            <input type="time" onChange={e => setDayEnd(ours(...e.target.value.split(':')))} />
          </div>
          <FocusRail />
        </ClockFnContext.Provider>
      </ClockContext.Provider>
    </div>
  );
};

export default Clock;
